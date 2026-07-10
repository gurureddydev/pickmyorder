"use client";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Package, Truck, Globe, Zap, Shield,
  Star, ChevronDown, Search, ArrowRight, Phone, MapPin,
  Building2, ShoppingCart, RefreshCw, Home,
  Plane, BarChart3, Headphones,
  CheckCircle2, Clock, Users, Award, Play, ArrowUpRight,
} from "lucide-react";
import Navbar from "./components/landing/Navbar";
import BookingForm from "./components/landing/BookingForm";
import Footer from "./components/landing/Footer";
import Link from "next/link";

// ─── Media Context ───────────────────────────────────────────────────────────
export const MediaContext = createContext<any[]>([]);

export function useMedia() {
  return useContext(MediaContext);
}

// ─── Images ──────────────────────────────────────────────────────────────────
// Realistic logistics & delivery images from Unsplash (freely licensed)
const IMAGES = {
  heroDelivery: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_hero_1783662982136.png",
  warehouse: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_warehouse_1783663018647.png",
  deliveryVan: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_van_1783663038707.png",
  packaging: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_packaging_1783663277778.png",
  handshake: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_packaging_1783663277778.png",
  sortingHub: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_warehouse_1783663018647.png",
  happyCustomer: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_packaging_1783663277778.png",
  cityAerial: "/api/image?file=/Users/guruprasad/.gemini/antigravity-ide/brain/33744343-a814-4de8-a237-7ab70168ae57/logistics_hero_1783662982136.png",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Truck,        title: "Domestic Courier",     desc: "Fast, reliable delivery across India" },
  { icon: Globe,        title: "International Courier", desc: "Door-to-door shipping worldwide" },
  { icon: Plane,        title: "Air Cargo",            desc: "Priority air freight for urgent shipments" },
  { icon: Truck,        title: "Surface Cargo",        desc: "Cost-effective ground transportation" },
  { icon: Zap,          title: "Express Delivery",     desc: "Same-day and next-day delivery options" },
  { icon: Package,      title: "Bulk Shipping",        desc: "Volume discounts for large consignments" },
  { icon: Building2,    title: "Corporate Shipping",   desc: "Dedicated accounts for businesses" },
  { icon: ShoppingCart,  title: "Ecommerce Shipping",  desc: "Integrated solutions for online sellers" },
  { icon: RefreshCw,    title: "Reverse Logistics",    desc: "Seamless returns management" },
  { icon: Home,         title: "Door Pickup",          desc: "Schedule a pickup from your doorstep" },
  { icon: MapPin,       title: "Door Delivery",        desc: "Direct delivery to the recipient" },
];

const STEPS = [
  { n: "01", title: "Book Online",     desc: "Enter pickup & delivery details, choose your service", img: IMAGES.heroDelivery },
  { n: "02", title: "Schedule Pickup", desc: "Our executive arrives at your doorstep on time",       img: IMAGES.packaging },
  { n: "03", title: "Secure Payment",  desc: "Pay online, on pickup, or via corporate credit",      img: IMAGES.handshake },
  { n: "04", title: "Live Tracking",   desc: "Monitor your shipment at every checkpoint",           img: IMAGES.sortingHub },
  { n: "05", title: "Delivered",       desc: "Safe delivery with digital proof of delivery",        img: IMAGES.happyCustomer },
];

const CITIES = [
  "Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Coimbatore",
  "Kochi", "Bhopal", "Indore", "Nagpur", "Surat", "Visakhapatnam",
  "Vadodara", "Nashik", "Mysuru", "Mangaluru", "Thiruvananthapuram",
  "Patna", "Ranchi", "Bhubaneswar", "Guwahati", "Dehradun", "Amritsar",
  "Jalandhar", "Ludhiana", "Agra", "Varanasi", "Rajkot", "Madurai",
];

const WHY_US = [
  { icon: Zap,        title: "Same-Day Delivery",   desc: "Express options for urgent shipments within city limits" },
  { icon: MapPin,     title: "Real-Time Tracking",  desc: "GPS-powered live updates at every milestone" },
  { icon: Shield,     title: "Insured Shipments",   desc: "Full coverage options for valuable parcels" },
  { icon: Home,       title: "Doorstep Pickup",     desc: "We come to you — no branch visit required" },
  { icon: BarChart3,  title: "Transparent Pricing", desc: "No hidden fees. What you see is what you pay" },
  { icon: Headphones, title: "24/7 Support",        desc: "Dedicated team available round-the-clock" },
];

const TESTIMONIALS = [
  {
    name: "Priya Menon",
    role: "Operations Head",
    company: "TextileHub India",
    rating: 5,
    text: "PickMyOrder handles all our B2B shipments across 18 cities. The tracking system is accurate and the pickup team is always on time. Exactly what a growing business needs.",
    avatar: "PM",
  },
  {
    name: "Arjun Shetty",
    role: "Founder",
    company: "BeyondCraft Store",
    rating: 5,
    text: "We switched from a major carrier six months ago and haven't looked back. Customer service is outstanding, rates are genuinely competitive, and the dashboard is clean.",
    avatar: "AS",
  },
  {
    name: "Neha Kapoor",
    role: "eCommerce Manager",
    company: "StyleOra",
    rating: 5,
    text: "Our return logistics went from a constant headache to a smooth process. PickMyOrder's reverse logistics integration is exactly what we needed to scale.",
    avatar: "NK",
  },
];

const FAQS = [
  { q: "How is the shipping cost calculated?", a: "Shipping is based on the higher of actual weight or volumetric weight (L×W×H÷5000 for domestic, ÷4000 for international), destination zone, and service type. Use the instant quote calculator on this page for an exact estimate." },
  { q: "Which areas do you cover for pickup and delivery?", a: "We cover 35+ major cities for direct pickup and delivery, with network reach extending to 18,000+ pincodes across India through our logistics partners." },
  { q: "How long does delivery take?", a: "Express: Same-day or next-day within the city. Domestic standard: 2–5 business days. Air freight: 1–2 business days. International: 5–14 business days depending on the destination country." },
  { q: "Is professional packaging available?", a: "Yes. Add packing during booking for ₹100 and our executive will bring appropriate materials at the time of pickup." },
  { q: "Can I track my shipment in real time?", a: "Every booking gets a unique tracking ID. Track on our website, or receive automated SMS/email updates at each checkpoint." },
  { q: "What payment methods are accepted?", a: "UPI, cards, net banking via Razorpay, cash on pickup, and corporate credit lines. EMI options are available for bulk accounts." },
  { q: "What happens if my shipment is lost or damaged?", a: "File a complaint through your dashboard within 7 days of the expected delivery date. Insured shipments are settled within 15 business days. Our team contacts you within 24 hours of filing." },
];

const PARTNER_LOGOS = [
  { name: "Blue Dart", code: "BD" },
  { name: "Delhivery", code: "DL" },
  { name: "DTDC", code: "DT" },
  { name: "XpressBees", code: "XB" },
  { name: "Ecom Express", code: "EE" },
  { name: "India Post", code: "IP" },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [visible, target]);

  return (
    <div ref={ref}>
      <span>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const media = useMedia();
  const heroMedia = media.find((m) => m.section === "HERO" && m.type === "IMAGE");
  const heroImage = heroMedia ? heroMedia.url : IMAGES.cityAerial;

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#111827] pt-24 pb-0">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: imgY, scale: imgScale }}
      >
        <img
          src={heroImage}
          alt="Aerial view of Indian city skyline at dusk"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111827]/40 via-[#111827]/70 to-[#111827]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center pb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/8 text-white/75 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 border border-white/10"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Trusted by 12,000+ businesses across India
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6"
            >
              Ship Anything,{" "}
              <span className="relative">
                <span className="text-[#FF7A00]">Anywhere.</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute -bottom-1 left-0 h-[3px] bg-[#FF7A00]/40 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/55 text-lg leading-relaxed mb-9 max-w-lg"
            >
              India&apos;s most reliable courier management platform. Book pickups, track
              shipments, and manage returns — all from one dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-5 mb-12"
            >
              {["35+ Cities Covered", "18,000+ Pincodes", "Same-Day Pickup Available"].map((b) => (
                <div key={b} className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#FF7A00] flex-shrink-0" />
                  {b}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10"
            >
              {[
                { n: 240000, suffix: "+", label: "Shipments Delivered" },
                { n: 99, suffix: ".2%", label: "On-Time Delivery Rate" },
                { n: 4, suffix: ".8 ★", label: "Customer Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white mb-0.5">
                    <AnimatedCounter target={s.n} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-white/45 leading-tight">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <BookingForm />
          </motion.div>
        </div>
      </div>

      {/* Live operations banner */}
      <div className="relative z-10 bg-[#0d1520] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between overflow-x-auto gap-8">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] whitespace-nowrap flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Our Courier Partners
          </p>
          <div className="flex items-center gap-6">
            {PARTNER_LOGOS.map((p) => (
              <div
                key={p.code}
                className="bg-white/5 border border-white/8 rounded-lg px-4 py-2 flex items-center gap-2 whitespace-nowrap hover:bg-white/10 transition-colors"
              >
                <span className="text-[#FF7A00] font-black text-xs">{p.code}</span>
                <span className="text-white/50 text-xs font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Visual Band ────────────────────────────────────────────────────────

function TrustBand() {
  return (
    <section className="py-16 px-5 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={IMAGES.warehouse}
                    alt="PickMyOrder warehouse sorting hub with organized package management"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={IMAGES.deliveryVan}
                    alt="PickMyOrder branded delivery van on city streets"
                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={IMAGES.packaging}
                    alt="Professional package handling and secure packaging process"
                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={IMAGES.sortingHub}
                    alt="Automated sorting facility with conveyor belts and tracking systems"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Floating stat badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="absolute -bottom-4 -right-4 bg-[#FF7A00] text-white rounded-2xl px-5 py-4 shadow-xl"
            >
              <div className="text-2xl font-black">99.2%</div>
              <div className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">On-Time Rate</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-3">
              Why Trust PickMyOrder
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-6 leading-tight">
              Real Infrastructure.{" "}
              <span className="text-[#FF7A00]">Real Results.</span>
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
              We&apos;re not just a booking platform — we operate dedicated sorting hubs, branded delivery fleets,
              and regional partner networks across India. Every shipment is tracked, insured, and handled
              with the care your business deserves.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Users, n: "12,000+", label: "Active Businesses" },
                { icon: Package, n: "2.4 Lakh+", label: "Shipments Monthly" },
                { icon: Clock, n: "< 45 min", label: "Avg. Pickup Time" },
                { icon: Award, n: "35+", label: "Cities Covered" },
              ].map(({ icon: Icon, n, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <div className="font-black text-[#111827] text-lg">{n}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-[#111827] text-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-[#FF7A00] transition-colors shadow-lg"
            >
              See How It Works <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function ServicesSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="py-20 px-5 sm:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-3">
            What We Offer
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Complete Logistics Solutions
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-[15px]">
            From single documents to bulk freight, domestic to international — we handle it all.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative bg-white rounded-xl p-5 hover:shadow-lg border border-gray-100 hover:border-[#FF7A00]/30 transition-all cursor-pointer group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/5 to-[#FF7A00]/0"
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-orange-50 group-hover:bg-[#FF7A00] rounded-lg flex items-center justify-center mb-3 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-[#FF7A00] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-[#111827] text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-5 sm:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-3">
            Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Five Steps to Delivery
          </h2>
          <p className="text-gray-500 mt-3 max-w-md mx-auto text-[15px]">
            From booking to doorstep — simple, transparent, and on time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <div className="space-y-2">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                onClick={() => setActiveStep(i)}
                className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeStep === i
                    ? "bg-[#FF7A00]/5 border border-[#FF7A00]/20 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm transition-all duration-300 ${
                  activeStep === i
                    ? "bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/30"
                    : "bg-[#111827] text-[#FF7A00]"
                }`}>
                  {n}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-[15px] mb-1 transition-colors ${
                    activeStep === i ? "text-[#FF7A00]" : "text-[#111827]"
                  }`}>{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  {activeStep === i && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4 }}
                      className="h-0.5 bg-[#FF7A00]/30 rounded-full mt-3"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active step image */}
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeStep}
                src={STEPS[activeStep].img}
                alt={STEPS[activeStep].title}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div
                key={`text-${activeStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-[#FF7A00] font-black text-sm">Step {STEPS[activeStep].n}</span>
                <h3 className="text-white font-black text-2xl mt-1">{STEPS[activeStep].title}</h3>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Cities ───────────────────────────────────────────────────────────────────

function CitiesSection() {
  const [q, setQ] = useState("");
  const filtered = q
    ? CITIES.filter((c) => c.toLowerCase().includes(q.toLowerCase()))
    : CITIES;

  return (
    <section className="relative py-20 px-5 sm:px-8 bg-[#111827] overflow-hidden">
      {/* Background aerial image */}
      <div className="absolute inset-0 z-0">
        <img
          src={IMAGES.cityAerial}
          alt="Aerial city view"
          className="w-full h-full object-cover opacity-8"
        />
        <div className="absolute inset-0 bg-[#111827]/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-5">
          <div>
            <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-2">
              Coverage
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Cities We Serve
            </h2>
            <p className="text-white/45 mt-2 text-[15px]">
              {CITIES.length} cities and growing — with 18,000+ pincodes across India.
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search city..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all w-52"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {filtered.map((city, i) => (
            <motion.div
              key={city}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-[#FF7A00]/10 border border-white/8 hover:border-[#FF7A00]/30 rounded-lg px-3 py-2.5 cursor-pointer transition-all group"
            >
              <MapPin className="w-3 h-3 text-[#FF7A00] flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-white/70 group-hover:text-white truncate transition-colors">{city}</span>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-white/30 text-sm text-center py-10">
              No city found matching &ldquo;{q}&rdquo;
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Why Us ───────────────────────────────────────────────────────────────────

function WhyUsSection() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-3">
              Our Edge
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-6 leading-tight">
              Why Businesses <span className="text-[#FF7A00]">Choose Us</span>
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
              Built around reliability, transparency, and speed. We keep things simple
              so you can focus on what matters — growing your business.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {WHY_US.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-sm mb-0.5">{title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Image with overlayed card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={IMAGES.happyCustomer}
                alt="Happy business owner receiving a PickMyOrder delivery package"
                className="w-full h-[450px] object-cover"
              />
            </div>
            {/* Floating glassmorphism card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-gray-100 max-w-[240px]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {["PM", "AS", "NK"].map((a, i) => (
                    <div key={a} className="w-8 h-8 rounded-full bg-[#111827] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                      {a}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-500">+12K more</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FF7A00] text-[#FF7A00]" />
                ))}
                <span className="text-xs font-bold text-gray-700 ml-1">4.8</span>
              </div>
              <p className="text-[11px] text-gray-400">Average rating from 12,000+ business users</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Trusted by Growing Businesses
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, company, rating, text, avatar }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100 flex flex-col hover:shadow-lg hover:border-[#FF7A00]/20 transition-all"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FF7A00] text-[#FF7A00]" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#e86d00] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                  {avatar}
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">
                    {role}, {company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <AccordionPrimitive.Root type="single" collapsible className="flex flex-col gap-2.5">
          {FAQS.map(({ q, a }, i) => (
            <AccordionPrimitive.Item
              key={i}
              value={`item-${i}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <AccordionPrimitive.Trigger className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-[#111827] text-sm hover:bg-gray-50/80 transition-colors group gap-3">
                <span>{q}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform flex-shrink-0" />
              </AccordionPrimitive.Trigger>
              <AccordionPrimitive.Content className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                {a}
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  );
}

// ─── CTA Band ─────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="relative py-20 px-5 sm:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={IMAGES.heroDelivery}
          alt="Logistics operations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#FF7A00]/90" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight"
        >
          Ready to Ship Smarter?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/80 text-lg mb-9"
        >
          Join 12,000+ businesses that trust PickMyOrder for their logistics.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login?book=true"
            className="bg-white text-[#FF7A00] font-bold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-[15px] inline-flex items-center justify-center gap-2"
          >
            Book Your First Shipment <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors border border-white/25 text-[15px]"
          >
            Contact Sales
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Reels Section ─────────────────────────────────────────────────────────────

function ReelsSection() {
  const media = useMedia();
  const reels = media.filter(m => m.type === "VIDEO_REEL" && m.section === "REEL");

  if (reels.length === 0) return null; // Don't show if no reels

  return (
    <section className="py-20 px-5 sm:px-8 bg-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            See PickMyOrder in <span className="text-[#FF7A00]">Action</span>
          </h2>
          <div className="flex items-center gap-2 text-white/50 text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Play className="w-4 h-4 text-[#FF7A00]" /> Watch Reels
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {reels.map((reel) => (
            <div key={reel.id} className="min-w-[280px] h-[480px] bg-gray-900 rounded-3xl overflow-hidden relative snap-center group border border-white/10 shrink-0 shadow-2xl">
              <video
                src={reel.url}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white font-bold text-lg leading-tight mb-2">{reel.title}</h3>
                <div className="flex items-center gap-2">
                   <span className="bg-[#FF7A00] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Featured</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mediaList, setMediaList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/media")
      .then(res => res.json())
      .then(data => {
        if (data.success) setMediaList(data.media);
      });
  }, []);

  return (
    <MediaContext.Provider value={mediaList}>
      <div className="min-h-screen" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <Navbar />
        <HeroSection />
        <TrustBand />
        <ReelsSection />
        <ServicesSection />
        <HowItWorksSection />
        <CitiesSection />
        <WhyUsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </MediaContext.Provider>
  );
}
