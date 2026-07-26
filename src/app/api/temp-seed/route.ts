import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN"
      }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin already exists",
        email: existingAdmin.email,
        role: existingAdmin.role
      });
    }

    // 2. Create Default Admin User
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@pickmyorder.com",
        passwordHash: adminPasswordHash,
        phone: "9491720603",
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin created successfully during temp-seed",
      email: admin.email,
      role: admin.role
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || String(error)
    }, { status: 500 });
  }
}
