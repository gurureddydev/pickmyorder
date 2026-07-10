import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const pincodeSchema = z.object({
  id: z.string().min(1, "ID is required"),
  isServiceable: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional(),
  isRemoteArea: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional(),
  estimatedDeliveryDays: z.coerce.number().min(1).optional()
});

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

    const body = await request.json();
    const parsed = pincodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { id, isServiceable, isRemoteArea, estimatedDeliveryDays } = parsed.data;

    const updated = await prisma.pincodeZone.update({
      where: { id },
      data: {
        isServiceable: isServiceable !== undefined ? !!isServiceable : undefined,
        isRemoteArea: isRemoteArea !== undefined ? !!isRemoteArea : undefined,
        estimatedDeliveryDays: estimatedDeliveryDays !== undefined ? estimatedDeliveryDays : undefined,
      },
    });

    return NextResponse.json({ success: true, pincode: updated });
  } catch (error) {
    console.error("Admin Pincodes PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
