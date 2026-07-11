import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { z } from "zod";

const orderSchema = z.object({
  pickupName: z.string().min(2, "Pickup name required"),
  pickupPhone: z.string().min(10, "Valid phone required"),
  pickupAddress: z.string().min(5, "Pickup address required"),
  pickupCity: z.string().min(2, "Pickup city required"),
  pickupState: z.string().min(2, "Pickup state required"),
  pickupPin: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  destName: z.string().min(2, "Destination name required"),
  destPhone: z.string().min(10, "Valid phone required"),
  destAddress: z.string().min(5, "Destination address required"),
  destCity: z.string().min(2, "Destination city required"),
  destState: z.string().min(2, "Destination state required"),
  destPin: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  totalAmount: z.coerce.number().min(0, "Invalid amount"),
  courierPartnerId: z.string().min(1, "Courier partner required"),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session?.user?.id ?? undefined },
      include: { courierPartner: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET Orders API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    // Allow guest checkout, no auth check here

    const body = await request.json();
    console.log("POST /api/orders received body:", body);

    // Basic existence check
    if (!body || typeof body !== "object") {
      console.error("Invalid request body");
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      console.log("Zod validation failed:", parsed.error.format());
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    console.log("Validation passed. Data:", parsed.data);

    const {
      pickupName,
      pickupPhone,
      pickupAddress,
      pickupCity,
      pickupState,
      pickupPin,
      destName,
      destPhone,
      destAddress,
      destCity,
      destState,
      destPin,
      totalAmount,
      courierPartnerId,
      paymentMethod = "PREPAID",
      paymentStatus = "PAID",
    } = parsed.data;

    // Verify courierPartnerId exists
    const partner = await prisma.courierPartner.findUnique({
      where: { id: courierPartnerId },
    });
    if (!partner) {
      return NextResponse.json({ success: false, error: "Invalid courierPartnerId" }, { status: 400 });
    }

    // 1. Create a dummy Quote record for DB integrity
    const quoteData: any = {
      pickupPincode: pickupPin,
      destPincode: destPin,
      packageType: "parcel",
      transport: "DOMESTIC",
      weight: 1.0,
      length: 10,
      width: 10,
      height: 10,
      packing: false,
      pricingDetails: JSON.stringify({ total: totalAmount }),
    };
    if (session?.user?.id) {
      quoteData.userId = session.user.id;
    }
    const quote = await prisma.quote.create({ data: quoteData });

    // 2. Generate unique order details
    const count = await prisma.order.count();
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const orderNumber = `PMO-${10000 + count + 1}-${uniqueSuffix}`;
    const awbNumber = `AWB${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const orderData: any = {
      orderNumber,
      quote: { connect: { id: quote.id } },
      courierPartnerId,
      awbNumber,
      status: "PICKUP_SCHEDULED",
      pickupName,
      pickupPhone,
      pickupAddress,
      pickupCity,
      pickupState,
      pickupPin,
      destName,
      destPhone,
      destAddress,
      destCity,
      destState,
      destPin,
      totalAmount,
      paymentMethod,
      paymentStatus,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    };
    if (session?.user?.id) {
      orderData.userId = session.user.id;
    }
    const order = await prisma.order.create({ data: orderData });

    // 3. Create initial tracking event within a transaction to ensure atomicity
    await prisma.$transaction([
      prisma.trackingEvent.create({
        data: {
          orderId: order.id,
          status: "PICKUP_SCHEDULED",
          location: pickupCity,
          description: "Pickup scheduled. Executive details will be shared via SMS shortly.",
        },
      }),
    ]);


    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("POST Orders API Error:", error);
    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint violation
        return NextResponse.json({ success: false, error: "Duplicate order identifier" }, { status: 409 });
      }
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
