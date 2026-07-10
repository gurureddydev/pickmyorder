import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rules = await prisma.pricingRule.findMany({
      include: {
        courierPartner: true,
        zone: true,
        serviceType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error("Admin Pricing Rules GET Error:", error);
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
    const { id, basePrice, pricePerKg, additionalKgPrice, fuelSurchargePercent, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Pricing Rule ID is required" }, { status: 400 });
    }

    const updated = await prisma.pricingRule.update({
      where: { id },
      data: {
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        pricePerKg: pricePerKg !== undefined ? parseFloat(pricePerKg) : undefined,
        additionalKgPrice: additionalKgPrice !== undefined ? parseFloat(additionalKgPrice) : undefined,
        fuelSurchargePercent: fuelSurchargePercent !== undefined ? parseFloat(fuelSurchargePercent) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (error) {
    console.error("Admin Pricing Rules PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
