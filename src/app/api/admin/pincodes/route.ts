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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const pincodes = await prisma.pincodeZone.findMany({
      orderBy: { pincode: "asc" },
      skip,
      take: limit,
    });

    const total = await prisma.pincodeZone.count();

    return NextResponse.json({
      success: true,
      pincodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Pincodes GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, isServiceable, isRemoteArea, estimatedDeliveryDays } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const updated = await prisma.pincodeZone.update({
      where: { id },
      data: {
        isServiceable: isServiceable !== undefined ? !!isServiceable : undefined,
        isRemoteArea: isRemoteArea !== undefined ? !!isRemoteArea : undefined,
        estimatedDeliveryDays: estimatedDeliveryDays !== undefined ? parseInt(estimatedDeliveryDays) : undefined,
      },
    });

    return NextResponse.json({ success: true, pincode: updated });
  } catch (error) {
    console.error("Admin Pincodes PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
