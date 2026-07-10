import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const pincodeImportSchema = z.object({
  pincodes: z.array(
    z.object({
      pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
      zoneName: z.string().min(1, "Zone Name is required"),
      isServiceable: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional(),
      isRemoteArea: z.union([z.boolean(), z.string().transform(v => v === 'true')]).optional(),
      estimatedDeliveryDays: z.coerce.number().min(1).optional()
    })
  ).min(1, "Pincode list array is required")
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = pincodeImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { pincodes } = parsed.data;

    let successCount = 0;
    for (const item of pincodes) {
      if (!item.pincode || !item.zoneName) continue;
      
      await prisma.pincodeZone.upsert({
        where: { pincode: String(item.pincode) },
        update: {
          zoneName: item.zoneName,
          isServiceable: item.isServiceable !== undefined ? !!item.isServiceable : undefined,
          isRemoteArea: item.isRemoteArea !== undefined ? !!item.isRemoteArea : undefined,
          estimatedDeliveryDays: item.estimatedDeliveryDays !== undefined ? item.estimatedDeliveryDays : undefined,
        },
        create: {
          pincode: String(item.pincode),
          zoneName: item.zoneName,
          isServiceable: item.isServiceable !== undefined ? !!item.isServiceable : true,
          isRemoteArea: item.isRemoteArea !== undefined ? !!item.isRemoteArea : false,
          estimatedDeliveryDays: item.estimatedDeliveryDays !== undefined ? item.estimatedDeliveryDays : 3,
        },
      });
      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successCount} pincodes.`,
    });
  } catch (error) {
    console.error("Admin Pincodes Import Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
