import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const media = await prisma.media.findMany({ 
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, media });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch media" }, { status: 500 });
  }
}
