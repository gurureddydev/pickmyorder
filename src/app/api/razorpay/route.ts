import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json(); 

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_TBqwUfDyJEA8EI",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "Z8NH2ByDDF1zpwy0zDupV8nG",
    });

    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
