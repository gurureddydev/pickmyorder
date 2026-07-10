"use client";
import { MapPin, Phone, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0d1520] pt-16 pb-8 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo-icon.png"
                alt="PickMyOrder Logo"
                className="h-8 object-contain flex-shrink-0"
              />
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              Premium courier and logistics services across India and worldwide.
            </p>
            <div className="text-white/45 text-sm space-y-2.5">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-[#FF7A00] flex-shrink-0" />
                <span>
                  Shop No 003, Basement Floor, AA Arcade, 12th Cross, Wilson Garden,
                  Bengaluru – 560027
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF7A00] flex-shrink-0" />
                9491720603
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-3 text-white/45 text-sm">
              {[
                { name: "Book Shipment", href: "/login?book=true" },
                { name: "Track Order", href: "/track" },
                { name: "Price Calculator", href: "/#calculator" },
                { name: "Become a Partner", href: "/contact" },
              ].map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="hover:text-[#FF7A00] transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-widest">
              Services
            </h4>
            <ul className="space-y-3 text-white/45 text-sm">
              {[
                "Domestic Courier",
                "International Courier",
                "Air Cargo",
                "Express Delivery",
                "Reverse Logistics",
              ].map((l) => (
                <li key={l}>
                  <Link href="/services" className="hover:text-[#FF7A00] transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Hours */}
          <div>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-3 text-white/45 text-sm mb-8">
              {[
                { name: "About Us", href: "/how-it-works" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms & Conditions", href: "/terms" },
                { name: "Refund Policy", href: "/refund" },
                { name: "Contact Us", href: "/contact" },
              ].map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="hover:text-[#FF7A00] transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-widest">
              Working Hours
            </h4>
            <p className="text-white/40 text-xs">Mon – Sat: 9:00 am – 7:00 pm</p>
            <p className="text-white/40 text-xs mt-1">Sunday: 10:00 am – 4:00 pm</p>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-xs">
            © 2025 PickMyOrder. All rights reserved. GST: 29XXXXX1234X1ZX
          </p>
          <div className="flex items-center gap-4">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-white/35 hover:text-[#FF7A00] transition-colors"
                aria-label="Social link"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
