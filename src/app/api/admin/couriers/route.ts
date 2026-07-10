import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const courierSchema = z.object({
  id: z.string().min(1, "Courier Partner ID is required"),
  isActive: z.boolean().optional(),
  priority: z.coerce.number().int().min(1).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
});

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

    const body = await request.json();
    const parsed = courierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { id, isActive, priority, apiKey, apiSecret } = parsed.data;

    const updated = await prisma.courierPartner.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        priority: priority !== undefined ? priority : undefined,
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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const createSchema = z.object({
      name: z.string().min(2, "Name required"),
      code: z.string().min(2, "Code required"),
      priority: z.coerce.number().int().min(1).optional().default(1),
      trackingUrl: z.string().optional(),
    });
    
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const newCourier = await prisma.courierPartner.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        priority: parsed.data.priority,
        trackingUrl: parsed.data.trackingUrl,
      },
    });

    return NextResponse.json({ success: true, courier: newCourier });
  } catch (error) {
    console.error("Admin Couriers POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Courier ID required" }, { status: 400 });
    }

    await prisma.courierPartner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Couriers DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
