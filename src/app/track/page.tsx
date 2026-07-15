"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { Search, MapPin, Calendar, Clock, CheckCircle2, Circle } from "lucide-react";
import { motion } from "motion/react";

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface OrderDetails {
  orderNumber: string;
  awbNumber: string;
  status: string;
  courierName: string;
  pickupPin: string;
  pickupCity: string;
  destPin: string;
  destCity: string;
  createdAt: string;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const awbParam = searchParams.get("awb");
  const [query, setQuery] = useState(awbParam || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shipment, setShipment] = useState<OrderDetails | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  const fetchTracking = async (searchQuery: string) => {
    if (!searchQuery) return;
    setLoading(true);
    setError("");
    setShipment(null);
    setEvents([]);

    try {
      const response = await fetch("/api/tracking/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const res = await response.json();
      if (!res.success) {
        setError(res.error || "No shipment details found. Check your search input.");
      } else {
        setShipment(res.order);
        setEvents(res.events);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to tracking services. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (awbParam) {
      fetchTracking(awbParam);
    }
  }, [awbParam]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(query);
  };

  const stepsList = [
    { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStatusIndex = (status: string) => {
    return stepsList.findIndex((s) => s.key === status);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-28 pb-20 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-3">
              Shipment Status
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-4">
              Track Your Shipment
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Search using AWB Number, Order ID, or Mobile number registered during pickup.
            </p>
            <p className="text-xs text-[#FF7A00]/70 mt-2">
              Demo: Try searching <strong className="text-[#FF7A00]">AWB12345678</strong> or <strong className="text-[#FF7A00]">PMO12345678</strong>
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleTrack} className="mb-10">
            <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
              <Search className="absolute left-5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter AWB, Order ID, or Mobile Number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 focus:outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 bg-gray-950 text-white font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-[#FF7A00] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl mt-3">{error}</p>
            )}
          </form>

          {/* Result timeline */}
          {shipment && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8"
            >
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-gray-100 mb-8 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">AWB Number</span>
                  <span className="font-extrabold text-gray-900">{shipment.awbNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Order ID</span>
                  <span className="font-bold text-gray-700">{shipment.orderNumber}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Shipping Class</span>
                  <span className="font-bold text-gray-700">
                    {shipment.courierName === "Blue Dart" || shipment.courierName === "DTDC" ? "Express Delivery" : "Standard Delivery"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Route</span>
                  <span className="font-bold text-gray-700">{shipment.pickupCity || shipment.pickupPin} → {shipment.destCity || shipment.destPin}</span>
                </div>
              </div>

              {/* Graphical status track */}
              <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Milestone Progress</h3>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
                  {stepsList.map((step, idx) => {
                    const currentStatusIdx = getStatusIndex(shipment.status);
                    const isCompleted = idx <= currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;

                    return (
                      <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isCurrent
                              ? "bg-[#FF7A00] text-white shadow-lg ring-4 ring-orange-50"
                              : isCompleted
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            isCurrent ? "text-[#FF7A00]" : isCompleted ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Event List */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-5">Shipment Travel History</h3>
                {events.length > 0 ? (
                  <div className="space-y-6 relative pl-6 border-l-2 border-gray-100 ml-3">
                    {events.map((ev) => (
                      <div key={ev.id} className="relative">
                        {/* Bullet point indicator */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#FF7A00] border-4 border-white shadow-sm" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold text-gray-800 capitalize bg-gray-100 px-2 py-0.5 rounded">
                              {ev.status.replace(/_/g, " ").toLowerCase()}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ev.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-900">{ev.location}</p>
                          <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No movement events registered yet. Check back soon.</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 text-center">Loading tracking details...</div>}>
      <TrackContent />
    </Suspense>
  );
}
