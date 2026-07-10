import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const pricingRuleSchema = z.object({
  id: z.string().min(1, "Pricing Rule ID is required"),
  basePrice: z.union([z.number(), z.string()]).optional().transform(v => v !== undefined ? Number(v) : undefined),
  pricePerKg: z.union([z.number(), z.string()]).optional().transform(v => v !== undefined ? Number(v) : undefined),
  additionalKgPrice: z.union([z.number(), z.string()]).optional().transform(v => v !== undefined ? Number(v) : undefined),
  fuelSurchargePercent: z.union([z.number(), z.string()]).optional().transform(v => v !== undefined ? Number(v) : undefined),
  isActive: z.boolean().optional(),
});

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
    const parsed = pricingRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { id, basePrice, pricePerKg, additionalKgPrice, fuelSurchargePercent, isActive } = parsed.data;

    const updated = await prisma.pricingRule.update({
      where: { id },
      data: {
        basePrice: basePrice !== undefined ? basePrice : undefined,
        pricePerKg: pricePerKg !== undefined ? pricePerKg : undefined,
        additionalKgPrice: additionalKgPrice !== undefined ? additionalKgPrice : undefined,
        fuelSurchargePercent: fuelSurchargePercent !== undefined ? fuelSurchargePercent : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (error) {
    console.error("Admin Pricing Rules PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
