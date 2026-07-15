"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Truck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormState {
  pickupPin: string;
  destPin: string;
  packageType: string;
  transport: "DOMESTIC" | "INTERNATIONAL";
  weight: string;
  length: string;
  width: string;
  height: string;
  packing: boolean;
}

interface QuoteResult {
  courierId: string;
  courierName: string;
  courierCode: string;
  logo: string | null;
  freight: number;
  fuelSurcharge: number;
  handlingCharge: number;
  remoteAreaCharge: number;
  packingCharge: number;
  tax: number;
  total: number;
  billedWeight: number;
  volWeight: number;
  etaDays: number;
}

export default function BookingForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    pickupPin: "",
    destPin: "",
    packageType: "parcel",
    transport: "DOMESTIC",
    weight: "",
    length: "",
    width: "",
    height: "",
    packing: false,
  });
  const [quotes, setQuotes] = useState<QuoteResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const patch = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setQuotes(null);
    setError("");
  };

  const handleQuote = async () => {
    if (!form.pickupPin || !form.destPin || !form.weight) {
      setError("Please enter Pickup Pincode, Destination Pincode, and Weight.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const res = await response.json();
      if (!res.success) {
        setError(res.message || "Failed to calculate quotes.");
      } else {
        setQuotes(res.quotes);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to calculation service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dimFields: Array<{ key: keyof FormState; label: string }> = [
    { key: "length", label: "L cm" },
    { key: "width",  label: "W cm" },
    { key: "height", label: "H cm" },
  ];

  const formatCurrency = (n: number) =>
    `₹${Math.round(n).toLocaleString("en-IN")}`;

  const getProcessedQuotes = () => {
    if (!quotes || quotes.length === 0) return [];
    
    const sorted = [...quotes].sort((a, b) => a.total - b.total);
    const standardOptions = sorted.filter(q => q.courierCode !== "BLUEDART" && q.courierCode !== "DTDC");
    const expressOptions = sorted.filter(q => q.courierCode === "BLUEDART" || q.courierCode === "DTDC");
    
    const result = [];
    
    if (standardOptions.length > 0) {
      result.push({
        ...standardOptions[0],
        displayName: "Standard Shipping",
        displayType: "STANDARD"
      });
    }
    
    if (expressOptions.length > 0) {
      result.push({
        ...expressOptions[0],
        displayName: "Express Shipping",
        displayType: "EXPRESS"
      });
    }
    
    if (result.length === 0 && sorted.length > 0) {
      result.push({
        ...sorted[0],
        displayName: "Standard Shipping",
        displayType: "STANDARD"
      });
      if (sorted.length > 1) {
        result.push({
          ...sorted[sorted.length - 1],
          displayName: "Express Shipping",
          displayType: "EXPRESS"
        });
      }
    }
    
    return result.sort((a, b) => (a.displayType === "STANDARD" ? -1 : 1));
  };

  return (
    <div id="calculator" className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[440px]">
      <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-[0.12em] mb-1">
        Dynamic Quote Engine
      </p>
      <h3 className="text-[18px] font-bold text-[#111827] mb-5">
        Compare Real-Time Rates
      </h3>

      {/* Pincodes */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {(["pickupPin", "destPin"] as const).map((key, i) => (
          <div key={key}>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              {i === 0 ? "Pickup Pincode" : "Destination Pincode"}
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder={i === 0 ? "560027" : "400001"}
              value={form[key]}
              onChange={(e) => patch({ [key]: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-[#111827]"
            />
          </div>
        ))}
      </div>

      {/* Toggle pair */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Package Type</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden h-9">
            {["document", "parcel"].map((t) => (
              <button
                key={t}
                onClick={() => patch({ packageType: t })}
                className={`flex-1 text-xs font-semibold transition-colors capitalize ${
                  form.packageType === t
                    ? "bg-[#FF7A00] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Transport</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden h-9">
            {(["DOMESTIC", "INTERNATIONAL"] as const).map((t) => (
              <button
                key={t}
                onClick={() => patch({ transport: t })}
                className={`flex-1 text-xs font-semibold transition-colors ${
                  form.transport === t
                    ? "bg-[#FF7A00] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                {t === "DOMESTIC" ? "Domestic" : "Intl"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weight + Dims */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Wt (kg)</label>
          <input
            type="number"
            min="0.1"
            placeholder="0.5"
            value={form.weight}
            onChange={(e) => patch({ weight: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-[#111827]"
          />
        </div>
        {dimFields.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">{label}</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form[key] as string}
              onChange={(e) => patch({ [key]: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-[#111827]"
            />
          </div>
        ))}
      </div>

      {/* Packing */}
      <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.packing}
          onChange={(e) => patch({ packing: e.target.checked })}
          className="w-4 h-4 accent-[#FF7A00]"
        />
        <span className="text-sm text-gray-600">
          Professional packing required{" "}
          <span className="text-gray-400">(+₹50-₹120 Box/Envelope)</span>
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
      )}

      <button
        onClick={handleQuote}
        disabled={loading}
        className="w-full bg-[#FF7A00] hover:bg-[#e86d00] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,122,0,0.35)] cursor-pointer"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Compare Quotes <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {quotes && quotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-3 max-h-[300px] overflow-y-auto pr-1"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Available Rates (Billed: {quotes[0].billedWeight.toFixed(2)} kg)
          </p>
          {getProcessedQuotes().map((q) => {
            const isExpress = q.displayType === "EXPRESS";
            const Icon = isExpress ? Zap : Truck;
            return (
              <div
                key={q.courierId}
                className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3.5 flex items-center justify-between hover:border-[#FF7A00]/30 transition-colors animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm">{q.displayName}</h4>
                    <p className="text-[11px] text-gray-400">ETA: {q.etaDays} days • Insured & Secure</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#FF7A00] font-extrabold text-base block">
                    {formatCurrency(q.total)}
                  </span>
                  <button
                    onClick={() => {
                      sessionStorage.setItem("bookingFormState", JSON.stringify(form));
                      sessionStorage.setItem("selectedQuote", JSON.stringify(q));
                      router.push(`/book`);
                    }}
                    className="text-[11px] bg-gray-950 text-white font-bold px-3 py-1 rounded hover:bg-[#FF7A00] transition-colors mt-0.5 cursor-pointer"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {quotes && quotes.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2.5 rounded-lg mt-3">
          No courier partners currently service this zone combination.
        </p>
      )}
    </div>
  );
}
