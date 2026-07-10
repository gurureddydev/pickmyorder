import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { z } from "zod";

const mediaSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO_REEL", "BANNER"]),
  section: z.string().min(2, "Section is required"),
  title: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, media });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
    }

    const type = formData.get("type");
    const section = formData.get("section");
    const title = formData.get("title");

    const parsed = mediaSchema.safeParse({ type, section, title: title || undefined });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const typedType = parsed.data.type;
    const typedSection = parsed.data.section;
    const typedTitle = parsed.data.title || "";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const newMedia = await prisma.media.create({
      data: {
        url: fileUrl,
        type: typedType,
        section: typedSection,
        title: typedTitle,
      }
    });

    return NextResponse.json({ success: true, media: newMedia });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    try {
      const filename = media.url.split("/").pop();
      if (filename) {
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        await unlink(filePath);
      }
    } catch (e) {
      console.warn("File not found on disk, continuing to delete record.");
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
