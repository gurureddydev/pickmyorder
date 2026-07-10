import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
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
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

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
    } = parsed.data;

    // 1. Create a dummy Quote record for DB integrity
    const quote = await prisma.quote.create({
      data: {
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
        userId: session.user.id,
      },
    });

    // 2. Generate unique order details
    const count = await prisma.order.count();
    const orderNumber = `PMO-${10000 + count + 1}`;
    const awbNumber = `AWB${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        quoteId: quote.id,
        userId: session.user.id!,
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
        paymentStatus: "PAID", // Default to paid for simplify test checkout
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      },
    });

    // 3. Create initial tracking event
    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status: "PICKUP_SCHEDULED",
        location: pickupCity,
        description: "Pickup scheduled. Executive details will be shared via SMS shortly.",
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("POST Orders API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
