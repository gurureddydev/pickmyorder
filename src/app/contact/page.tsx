"use client";
import { useState } from "react";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-3">
              Reach Out
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#111827] tracking-tight mb-4">
              Contact Support
            </h1>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Have questions about pricing, bulk cargo booking, or account integrations? Write to us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-stretch mb-16">
            {/* Contact details */}
            <div className="bg-[#111827] rounded-3xl p-8 text-white flex flex-col justify-between border border-gray-800 shadow-xl">
              <div>
                <h2 className="text-xl font-bold mb-6 text-[#FF7A00]">Corporate Head Office</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 mt-0.5 text-[#FF7A00] shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Bengaluru Office</h4>
                      <p className="text-white/60 text-xs leading-relaxed mt-1">
                        Shop No 003, Basement Floor, AA Arcade, 12th Cross, Wilson Garden, Bengaluru – 560027
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 mt-0.5 text-[#FF7A00] shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Support Hotline</h4>
                      <p className="text-white/60 text-xs mt-1">9491720603</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 mt-0.5 text-[#FF7A00] shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Electronic Mail</h4>
                      <p className="text-white/60 text-xs mt-1">support@pickmyorder.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 mt-0.5 text-[#FF7A00] shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Business Operations Hours</h4>
                      <p className="text-white/60 text-xs mt-1">Mon – Sat: 9:00 am – 7:00 pm</p>
                      <p className="text-white/60 text-xs mt-0.5">Sunday: 10:00 am – 4:00 pm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 mt-8">
                <p className="text-xs text-white/45">
                  GST Registration: 29XXXXX1234X1ZX
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center h-full py-10"
                >
                  <CheckCircle2 className="w-16 h-16 text-[#FF7A00] mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Message Transmitted</h3>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Our support coordinators will review your ticket and reply within 12 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-xs font-bold text-[#FF7A00] hover:underline"
                  >
                    Send another query
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Inquire Now</h2>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Account Setup, Bulk quote, etc."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Message Detail</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Type details..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF7A00] hover:bg-[#e86d00] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,122,0,0.25)] disabled:opacity-60 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {loading ? "Sending..." : (
                      <>
                        Transmit Query <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
