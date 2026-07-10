import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const orders = await prisma.order.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        courierPartner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Admin Orders GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, awbNumber, location, description } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        awbNumber: awbNumber || undefined,
      },
    });

    // Create a tracking event if status was updated
    if (status) {
      await prisma.trackingEvent.create({
        data: {
          orderId: id,
          status,
          location: location || "HUB",
          description: description || `Shipment status updated to ${status.replace(/_/g, " ")}`,
        },
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin Orders PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
