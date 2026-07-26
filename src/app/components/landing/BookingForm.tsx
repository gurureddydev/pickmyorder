"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Truck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormState {
  pickupPin: string;
  destPin: string;
  phoneNumber: string;
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
    phoneNumber: "",
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
    if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
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
        const availableQuotes = res.quotes;
        if (availableQuotes && availableQuotes.length > 0) {
          const sorted = [...availableQuotes].sort((a: QuoteResult, b: QuoteResult) => a.total - b.total);
          const selectedQuote = sorted[0];
          sessionStorage.setItem("bookingFormState", JSON.stringify(form));
          sessionStorage.setItem("selectedQuote", JSON.stringify(selectedQuote));
          router.push(`/book`);
        } else {
          setError("No courier partners currently service this zone combination.");
        }
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

      {/* Mobile Number */}
      <div className="mb-3">
        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Mobile Number</label>
        <input
          type="tel"
          maxLength={10}
          placeholder="Enter 10-digit mobile number"
          value={form.phoneNumber}
          onChange={(e) => patch({ phoneNumber: e.target.value.replace(/\D/g, "") })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-[#111827]"
        />
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

    </div>
  );
}
