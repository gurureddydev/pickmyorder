import { NextResponse } from "next/server";
import fs from "fs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");
  
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }
  
  try {
    const buffer = fs.readFileSync(file);
    // Determine content type
    let contentType = "image/png";
    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (file.endsWith(".webp")) contentType = "image/webp";
    
    return new NextResponse(buffer, {
      headers: { 
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (err) {
    console.error("Error serving local image:", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
