"use client";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { Truck, Globe, Plane, Zap, Package, Building2, ShoppingCart, RefreshCw, Home, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const ALL_SERVICES = [
  { img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop", icon: Truck, title: "Domestic Courier", desc: "Fast, reliable door-to-door delivery across 18,000+ pin codes in India." },
  { img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop", icon: Globe, title: "International Courier", desc: "Express delivery across 220+ countries with custom clearance assistance." },
  { img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop", icon: Plane, title: "Air Cargo", desc: "High-priority cargo operations for commercial freight and urgent shipments." },
  { img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop", icon: Truck, title: "Surface Cargo", desc: "Economical shipping for bulk and heavy consignments via ground network." },
  { img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop", icon: Zap, title: "Express Delivery", desc: "SLA-backed same-day/next-day shipping within major metro corridors." },
  { img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop", icon: Package, title: "Bulk Shipping", desc: "Custom logistics plans and special rates for heavy shipments and bulk freight." },
  { img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop", icon: Building2, title: "Corporate Shipping", desc: "Dedicated business client portals with credit facilities and automated booking." },
  { img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop", icon: ShoppingCart, title: "Ecommerce Shipping", desc: "API integrations, Cash on Delivery (COD) services, and automatic status updates." },
  { img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop", icon: RefreshCw, title: "Reverse Logistics", desc: "Hassle-free return options with verification checks for ecommerce stores." },
  { img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop", icon: Home, title: "Door Pickup", desc: "Convenient doorstep pickup scheduled online through our quotation engine." },
];

export default function ServicesPage() {
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/media")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const serviceImages = data.media.filter((m: any) => m.section === "SERVICES" && m.type === "IMAGE");
          setMedia(serviceImages);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-3">
              Services Portfolio
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#111827] tracking-tight mb-4">
              Premium Logistics Solutions
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Explore our wide range of domestic and international shipping options built with state-of-the-art tracking and support.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {ALL_SERVICES.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#FF7A00]/25 transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="w-full h-40 bg-gray-100 relative">
                    <img 
                      src={media.length > 0 ? media[idx % media.length].url : s.img} 
                      alt={s.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#FF7A00]" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#111827] mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{s.desc}</p>
                    <Link
                      href="/login?book=true"
                      className="text-xs font-bold text-[#FF7A00] hover:text-[#e86d00] flex items-center gap-1.5 transition-colors self-start"
                    >
                      Book Instantly <span className="text-sm">→</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
