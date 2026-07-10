"use client";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const WORK_STEPS = [
  {
    n: "01",
    title: "Calculate & Compare",
    desc: "Input your pickup pincode, destination pincode, package weight, and dimensions into our quote calculator. We match and retrieve real-time rates from multiple leading courier partners instantly.",
  },
  {
    n: "02",
    title: "Schedule the Doorstep Pickup",
    desc: "Select the carrier that matches your budget and timeline. Fill in the pickup and delivery addresses. Pay securely via card or UPI, or choose Cash on Pickup.",
  },
  {
    n: "03",
    title: "Professional Packing & Labeling",
    desc: "If professional packing is checked, our executive arrives at your doorstep with custom boxes, bubble wrap, and adhesive. We print and apply the shipment barcode labels on site.",
  },
  {
    n: "04",
    title: "Real-Time GPS Tracking Updates",
    desc: "Monitor your package through every scan milestone: Pickup Scheduled → Picked Up → In Transit → Out for Delivery → Delivered. Get instant updates on SMS and WhatsApp.",
  },
  {
    n: "05",
    title: "SLA-Backed Secure Delivery",
    desc: "The cargo is delivered on time according to the selected priority SLA. We obtain digital signatures and OTP verification for complete Proof of Delivery (POD).",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-3">
              Logistics Workflow
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#111827] tracking-tight mb-4">
              How PickMyOrder Works
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              From online comparison to secure delivery at the doorstep — here is a look at our seamless end-to-end shipping process.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-12 mb-16 relative">
            {/* Center connector line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block" />

            {WORK_STEPS.map((s, idx) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col md:flex-row gap-6 relative z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-[#FF7A00] font-black text-xl shadow-lg shrink-0 border border-gray-800">
                  {s.n}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
                  <h3 className="text-lg font-bold text-[#111827] mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="bg-[#111827] rounded-3xl p-8 text-center text-white border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-black mb-3">Ready to dispatch your shipment?</h2>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Get an instant quote, select the best carrier, and schedule a pickup at your doorstep in under 2 minutes.
            </p>
            <Link
              href="/login?book=true"
              className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#e86d00] text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              Start Shipping Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
