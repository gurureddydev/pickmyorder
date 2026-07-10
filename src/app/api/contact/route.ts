import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API: Anyone can submit a contact/support message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Find or create a dummy public user record for this contact
    // We store in SupportTicket with the subject containing name+email since SupportTicket is user-linked
    // We'll use the admin user as the owner and store contact info in subject/message
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: adminUser.id,
        subject: `[Contact Form] ${subject || "General Inquiry"} — From: ${name} <${email}>`,
        message: message,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error("Contact Form API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
