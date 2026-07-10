import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const messageUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"])
});

// GET: Admin fetches all contact messages (support tickets)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, messages: tickets });
  } catch (error) {
    console.error("Admin Messages GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Admin updates message status (mark as resolved/in-progress)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = messageUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { id, status } = parsed.data;

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("Admin Messages PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
