import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const trackingSchema = z.object({
  query: z.string().min(5, "Search query must be at least 5 characters").max(40, "Search query too long").regex(/^[A-Za-z0-9-]+$/, "Invalid characters in tracking query")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = trackingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { query } = parsed.data;
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
