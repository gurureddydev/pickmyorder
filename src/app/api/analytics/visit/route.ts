import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const visitsSetting = await prisma.siteSetting.findUnique({
      where: { key: "TOTAL_VISITS" }
    });

    if (visitsSetting) {
      await prisma.siteSetting.update({
        where: { key: "TOTAL_VISITS" },
        data: { value: String(parseInt(visitsSetting.value, 10) + 1) }
      });
    } else {
      await prisma.siteSetting.create({
        data: {
          key: "TOTAL_VISITS",
          value: "1"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit Tracking Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
