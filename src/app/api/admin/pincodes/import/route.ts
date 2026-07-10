import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { pincodes } = await request.json(); // Expected: array of { pincode, zoneName, isServiceable, isRemoteArea, estimatedDeliveryDays }
    if (!pincodes || !Array.isArray(pincodes)) {
      return NextResponse.json({ success: false, error: "Pincode list array is required" }, { status: 400 });
    }

    let successCount = 0;
    for (const item of pincodes) {
      if (!item.pincode || !item.zoneName) continue;
      
      await prisma.pincodeZone.upsert({
        where: { pincode: String(item.pincode) },
        update: {
          zoneName: item.zoneName,
          isServiceable: item.isServiceable !== undefined ? !!item.isServiceable : undefined,
          isRemoteArea: item.isRemoteArea !== undefined ? !!item.isRemoteArea : undefined,
          estimatedDeliveryDays: item.estimatedDeliveryDays !== undefined ? parseInt(item.estimatedDeliveryDays) : undefined,
        },
        create: {
          pincode: String(item.pincode),
          zoneName: item.zoneName,
          isServiceable: item.isServiceable !== undefined ? !!item.isServiceable : true,
          isRemoteArea: item.isRemoteArea !== undefined ? !!item.isRemoteArea : false,
          estimatedDeliveryDays: item.estimatedDeliveryDays !== undefined ? parseInt(item.estimatedDeliveryDays) : 3,
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
