import { NextResponse } from "next/server";
import { calculateQuotes } from "@/lib/pricing-engine";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const quoteSchema = z.object({
  pickupPin: z.string().length(6, "Pickup pincode must be exactly 6 digits"),
  destPin: z.string().length(6, "Destination pincode must be exactly 6 digits"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
  packageType: z.string(),
  transport: z.enum(["DOMESTIC", "INTERNATIONAL"]),
  weight: z.number().positive("Weight must be positive"),
  length: z.number().nonnegative(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  packing: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Parse weight and dimensions to numbers just in case they are sent as strings
    const parsedData = {
      ...body,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      length: body.length ? parseFloat(body.length) : 0,
      width: body.width ? parseFloat(body.width) : 0,
      height: body.height ? parseFloat(body.height) : 0,
      packing: !!body.packing,
    };

    const validation = quoteSchema.safeParse(parsedData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await calculateQuotes(validation.data);

    if (!result.isServiceable || !result.quotes || result.quotes.length === 0) {
      return NextResponse.json({
        success: false,
        message: result.message || "Route is not serviceable by any partner.",
      });
    }

    // Save quote to DB so admin can see who calculated it
    try {
      await prisma.quote.create({
        data: {
          phone: validation.data.phoneNumber,
          pickupPincode: validation.data.pickupPin,
          destPincode: validation.data.destPin,
          packageType: validation.data.packageType,
          transport: validation.data.transport,
          weight: validation.data.weight,
          length: validation.data.length,
          width: validation.data.width,
          height: validation.data.height,
          packing: validation.data.packing,
          pricingDetails: JSON.stringify(result.quotes),
        },
      });
    } catch (dbErr) {
      console.error("Failed to save quote to DB:", dbErr);
      return NextResponse.json(
        { success: false, error: "Failed to record quotation. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quotes: result.quotes,
    });
  } catch (error: any) {
    console.error("Quote API Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

