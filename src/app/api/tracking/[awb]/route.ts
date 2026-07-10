import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { awb } = await params;
    if (!awb) {
      return NextResponse.json(
        { success: false, error: "AWB number is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { awbNumber: awb },
      include: {
        courierPartner: true,
        trackingEvents: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Shipment not found with AWB: " + awb },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        awbNumber: order.awbNumber,
        status: order.status,
        courierName: order.courierPartner.name,
        pickupPin: order.pickupPin,
        destPin: order.destPin,
        createdAt: order.createdAt,
      },
      events: order.trackingEvents,
    });
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
