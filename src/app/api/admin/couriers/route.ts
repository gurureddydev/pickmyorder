import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const couriers = await prisma.courierPartner.findMany({
      orderBy: { priority: "asc" },
    });

    return NextResponse.json({ success: true, couriers });
  } catch (error) {
    console.error("Admin Couriers GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, isActive, priority, apiKey, apiSecret } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Courier Partner ID is required" }, { status: 400 });
    }

    const updated = await prisma.courierPartner.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        priority: priority !== undefined ? parseInt(priority) : undefined,
        apiKey: apiKey !== undefined ? apiKey : undefined,
        apiSecret: apiSecret !== undefined ? apiSecret : undefined,
      },
    });

    return NextResponse.json({ success: true, courier: updated });
  } catch (error) {
    console.error("Admin Couriers PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
