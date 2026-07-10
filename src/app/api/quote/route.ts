import { NextResponse } from "next/server";
import { calculateQuotes } from "@/lib/pricing-engine";
import { z } from "zod";

const quoteSchema = z.object({
  pickupPin: z.string().length(6, "Pickup pincode must be exactly 6 digits"),
  destPin: z.string().length(6, "Destination pincode must be exactly 6 digits"),
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

    if (!result.isServiceable) {
      return NextResponse.json({
        success: false,
        message: result.message || "Route is not serviceable by any partner.",
      });
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
