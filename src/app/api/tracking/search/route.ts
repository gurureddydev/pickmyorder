import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;
    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }
    const searchQuery = query.trim().toUpperCase();
    const searchQueryRaw = query.trim();

    // Try finding by AWB (case-insensitive)
    let order = await prisma.order.findFirst({
      where: { awbNumber: { equals: searchQuery } },
      include: {
        courierPartner: true,
        trackingEvents: { orderBy: { timestamp: "asc" } },
      },
    });

    // Also try original case
    if (!order) {
      order = await prisma.order.findFirst({
        where: { awbNumber: searchQueryRaw },
        include: {
          courierPartner: true,
          trackingEvents: { orderBy: { timestamp: "asc" } },
        },
      });
    }

    // Try finding by Order Number
    if (!order) {
      order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: searchQueryRaw.length === 36 ? searchQueryRaw : undefined },
            { orderNumber: searchQueryRaw },
            { orderNumber: searchQuery },
          ],
        },
        include: {
          courierPartner: true,
          trackingEvents: { orderBy: { timestamp: "asc" } },
        },
      });
    }

    // Try finding by Mobile Number (pickup or destination phone)
    if (!order) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ pickupPhone: searchQueryRaw }, { destPhone: searchQueryRaw }],
        },
        include: {
          courierPartner: true,
          trackingEvents: { orderBy: { timestamp: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "No shipment found. Please check your AWB number, Order ID, or mobile number and try again." },
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
        pickupCity: (order as any).pickupCity,
        destPin: order.destPin,
        destCity: (order as any).destCity,
        createdAt: order.createdAt,
      },
      events: order.trackingEvents,
    });
  } catch (error) {
    console.error("Search Tracking API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
