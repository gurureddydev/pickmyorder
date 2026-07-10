import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
    } = body;

    if (!pickupName || !pickupAddress || !destName || !destAddress || !courierPartnerId || !totalAmount) {
      return NextResponse.json({ success: false, error: "Missing required booking details" }, { status: 400 });
    }

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
        totalAmount: parseFloat(totalAmount),
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
