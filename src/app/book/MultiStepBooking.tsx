"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronRight, Package, MapPin, Truck, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import BookingSuccess from "./BookingSuccess";

interface QuoteDetails {
  courierId: string;
  courierName: string;
  courierCode: string;
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

interface FormState {
  pickupPin: string;
  destPin: string;
  packageType: string;
  transport: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  packing: boolean;
}

export default function MultiStepBooking() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [baseForm, setBaseForm] = useState<FormState | null>(null);
  const [step, setStep] = useState(1);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRazorpayMock, setShowRazorpayMock] = useState(false);

  // Step 1: Sender & Receiver Details
  const [sender, setSender] = useState({ name: "", company: "", phone: "", whatsapp: "", email: "", address: "", landmark: "", city: "", state: "", pin: "", instructions: "", date: "", timeSlot: "" });
  const [receiver, setReceiver] = useState({ name: "", phone: "", whatsapp: "", email: "", address: "", landmark: "", city: "", state: "", pin: "", instructions: "" });
  
  // Step 2: Package Info
  const [pkg, setPkg] = useState({ category: "Parcel", description: "", count: "1", weight: "", length: "", width: "", height: "", declaredValue: "", insurance: false, packing: false });

  // Step 3: Additional Services
  const [services, setServices] = useState({ pickupBy: "Sender", express: false, sameDay: false, sms: true, whatsapp: true, signature: false, fragile: false });

  useEffect(() => {
    setIsClient(true);
    const storedForm = sessionStorage.getItem("bookingFormState");
    const storedQuote = sessionStorage.getItem("selectedQuote");
    
    if (storedForm && storedQuote) {
      try {
        const parsedForm = JSON.parse(storedForm);
        const parsedQuote = JSON.parse(storedQuote);
        setBaseForm(parsedForm);
        setQuote(parsedQuote);
        
        // Auto-fill pincodes and dims from base form
        setSender(prev => ({ ...prev, pin: parsedForm.pickupPin || "" }));
        setReceiver(prev => ({ ...prev, pin: parsedForm.destPin || "" }));
        setPkg(prev => ({ 
          ...prev, 
          weight: parsedForm.weight || "",
          length: parsedForm.length || "",
          width: parsedForm.width || "",
          height: parsedForm.height || "",
          packing: parsedForm.packing || false,
          category: parsedForm.packageType ? (parsedForm.packageType.charAt(0).toUpperCase() + parsedForm.packageType.slice(1)) : "Parcel"
        }));
      } catch(e) {
        console.error("Failed to parse session storage", e);
      }
    }
  }, []);

  const formatCurrency = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const handleNext = () => {
    setError("");
    // Add real validation here based on steps
    if (step === 1) {
      if (!sender.name || !sender.phone || !sender.address || !sender.pin) {
        setError("Please fill out all required Sender details.");
        return;
      }
      if (!receiver.name || !receiver.phone || !receiver.address || !receiver.pin) {
        setError("Please fill out all required Receiver details.");
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1);
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const submitOrder = async (method: string, status: string) => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        pickupName: sender.name,
        pickupPhone: sender.phone,
        pickupAddress: sender.address,
        pickupCity: sender.city || "Unknown",
        pickupState: sender.state || "Unknown",
        pickupPin: sender.pin || baseForm?.pickupPin,
        destName: receiver.name,
        destPhone: receiver.phone,
        destAddress: receiver.address,
        destCity: receiver.city || "Unknown",
        destState: receiver.state || "Unknown",
        destPin: receiver.pin || baseForm?.destPin,
        totalAmount: quote!.total + (pkg.packing ? 50 : 0) + (pkg.insurance ? 150 : 0),
        courierPartnerId: quote!.courierId,
        paymentMethod: method,
        paymentStatus: status
      };

      console.log("Submitting order with payload:", payload);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setCompletedOrder(data.order);
        setStep(5);
        setShowPaymentModal(false);
        setShowRazorpayMock(false);
      } else {
        setError(data.error || "Failed to create order");
      }
    } catch (e) {
      setError("An error occurred during order creation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = () => submitOrder("CASH_ON_PICKUP", "PENDING");

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError("");

    const res = await loadRazorpay();
    if (!res) {
      setError("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      const totalAmount = quote!.total + (pkg.packing ? 50 : 0) + (pkg.insurance ? 150 : 0);
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError("Could not create Razorpay order.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TBqwUfDyJEA8EI",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "PickMyOrder",
        description: "Shipment Booking",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          submitOrder("RAZORPAY_ONLINE", "PAID");
        },
        prefill: {
          name: sender.name,
          contact: sender.phone,
        },
        theme: {
          color: "#FF7A00",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        setError("Payment failed. Please try again.");
      });
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setError("Error initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div></div>;

  if (!quote || !baseForm) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 max-w-lg mx-auto mt-10">
        <Package className="w-16 h-16 text-[#FF7A00] mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Quote Found</h2>
        <p className="text-gray-500 mb-8">Please start by getting a quote from our homepage.</p>
        <button onClick={() => router.push("/")} className="bg-[#111827] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#FF7A00] transition-colors">
          Get a Quote
        </button>
      </div>
    );
  }

  if (step === 5 && completedOrder) {
    return <BookingSuccess quote={quote} order={completedOrder} />;
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Panel: Sticky Summary */}
      <div className="lg:col-span-4 order-last lg:order-first sticky top-24">
        <div className="bg-[#111827] rounded-3xl p-6 shadow-2xl text-white">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h3 className="font-bold text-lg">Shipment Summary</h3>
            <button onClick={() => router.push("/")} className="text-[#FF7A00] text-xs font-bold hover:text-white transition-colors">
              Change Quote
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="font-semibold">{sender.pin || baseForm.pickupPin} {sender.city ? `, ${sender.city}` : ''}</p>
              </div>
            </div>
            <div className="ml-2.5 w-0.5 h-4 bg-gray-700"></div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#FF7A00] mt-0.5" />
              <div>
                <p className="text-xs text-[#FF7A00]">Destination</p>
                <p className="font-semibold">{receiver.pin || baseForm.destPin} {receiver.city ? `, ${receiver.city}` : ''}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3 text-sm border border-white/5">
            <div className="flex justify-between">
              <span className="text-gray-400">Package Type</span>
              <span className="font-medium">{pkg.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transport</span>
              <span className="font-medium capitalize">{baseForm.transport.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Weight</span>
              <span className="font-medium">{pkg.weight || baseForm.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Courier Partner</span>
              <span className="font-bold text-[#FF7A00]">{quote.courierName}</span>
            </div>
            <div className="flex justify-between items-center bg-[#FF7A00]/10 px-3 py-2 rounded-lg mt-2">
              <span className="text-[#FF7A00] text-xs font-bold">ETA</span>
              <span className="font-bold text-[#FF7A00]">{quote.etaDays} Days</span>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-white/10 pt-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Courier Charges</span>
              <span>{formatCurrency(quote.freight)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Packing Charges</span>
              <span>{formatCurrency(pkg.packing ? 50 : 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Insurance</span>
              <span>{formatCurrency(pkg.insurance ? 150 : 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">GST (18%)</span>
              <span>{formatCurrency(quote.tax)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-white/10 pt-4">
            <span className="font-bold text-lg">Total Payable</span>
            <span className="font-black text-2xl text-[#FF7A00]">
              {formatCurrency(quote.total + (pkg.packing ? 50 : 0) + (pkg.insurance ? 150 : 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Form Steps */}
      <div className="lg:col-span-8">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-2 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#FF7A00] rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {[
            { n: 1, label: "Addresses" },
            { n: 2, label: "Package Info" },
            { n: 3, label: "Services" },
            { n: 4, label: "Payment" }
          ].map(s => (
            <div key={s.n} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s.n ? 'bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/40' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.n ? <CheckCircle2 className="w-5 h-5" /> : s.n}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${step >= s.n ? 'text-[#111827]' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 min-h-[500px]">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
              <Info className="w-5 h-5" /> {error}
            </div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Sender Details</h2>
                <p className="text-gray-500 text-sm">Pickup location: <span className="font-semibold text-gray-900">{sender.pin || baseForm.pickupPin}</span></p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-8">
                <Input label="Full Name *" value={sender.name} onChange={(e: any) => setSender({...sender, name: e})} placeholder="e.g. John Doe" />
                <Input label="Mobile Number *" value={sender.phone} onChange={(e: any) => setSender({...sender, phone: e})} placeholder="10-digit number" />
                <div className="sm:col-span-2">
                  <Input label="Complete Address *" value={sender.address} onChange={(e: any) => setSender({...sender, address: e})} placeholder="House/Flat No, Building, Street" />
                </div>
                <Input label="City" value={sender.city} onChange={(e: any) => setSender({...sender, city: e})} placeholder="City" />
                <Input label="State" value={sender.state} onChange={(e: any) => setSender({...sender, state: e})} placeholder="State" />
              </div>

              <div className="mb-6 flex items-center justify-between border-t border-gray-100 pt-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Receiver Details</h2>
                  <p className="text-gray-500 text-sm">Destination location: <span className="font-semibold text-[#FF7A00]">{receiver.pin || baseForm.destPin}</span></p>
                </div>
                <button 
                  onClick={() => setReceiver({...sender, pin: receiver.pin})}
                  className="text-xs font-bold text-[#FF7A00] bg-[#FF7A00]/10 px-3 py-1.5 rounded-lg hover:bg-[#FF7A00]/20 transition-colors"
                >
                  Same as Sender
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Receiver Name *" value={receiver.name} onChange={(e: any) => setReceiver({...receiver, name: e})} placeholder="e.g. Jane Smith" />
                <Input label="Mobile Number *" value={receiver.phone} onChange={(e: any) => setReceiver({...receiver, phone: e})} placeholder="10-digit number" />
                <div className="sm:col-span-2">
                  <Input label="Complete Address *" value={receiver.address} onChange={(e: any) => setReceiver({...receiver, address: e})} placeholder="House/Flat No, Building, Street" />
                </div>
                <Input label="City" value={receiver.city} onChange={(e: any) => setReceiver({...receiver, city: e})} placeholder="City" />
                <Input label="State" value={receiver.state} onChange={(e: any) => setReceiver({...receiver, state: e})} placeholder="State" />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Package Information</h2>
                <p className="text-gray-500 text-sm">Tell us about what you are shipping.</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Package Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Document", "Parcel", "Fragile", "Electronics", "Medical", "Others"].map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => setPkg({...pkg, category: cat})}
                      className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${pkg.category === cat ? 'border-[#FF7A00] bg-[#FF7A00]/5 text-[#FF7A00] font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-medium'}`}
                    >
                      <span className="text-sm">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-8">
                <div className="sm:col-span-2">
                  <Input label="Package Description" value={pkg.description} onChange={(e: any) => setPkg({...pkg, description: e})} placeholder="e.g. Books, Clothes, Documents..." />
                </div>
                <Input label="Number of Packages" value={pkg.count} onChange={(e: any) => setPkg({...pkg, count: e})} placeholder="1" type="number" />
                <Input label="Declared Value (₹)" value={pkg.declaredValue} onChange={(e: any) => setPkg({...pkg, declaredValue: e})} placeholder="5000" type="number" />
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${pkg.packing ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-gray-300 group-hover:border-[#FF7A00]'}`}>
                    {pkg.packing && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Add Professional Packing (+₹50)</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Our executive will bring quality packing materials to safely pack your items during pickup.</span>
                  </div>
                  <input type="checkbox" checked={pkg.packing} onChange={(e: any) => setPkg({...pkg, packing: e.target.checked})} className="hidden" />
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${pkg.insurance ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-gray-300 group-hover:border-[#FF7A00]'}`}>
                    {pkg.insurance && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Shipment Insurance (+₹150)</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Protect your shipment against loss or damage up to the declared value.</span>
                  </div>
                  <input type="checkbox" checked={pkg.insurance} onChange={(e: any) => setPkg({...pkg, insurance: e.target.checked})} className="hidden" />
                </label>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Additional Services</h2>
                <p className="text-gray-500 text-sm">Customize your booking preferences.</p>
              </div>



              <div className="bg-[#111827] text-white rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">WhatsApp Integration</h3>
                  <p className="text-gray-400 text-sm mb-5">Get real-time tracking updates, pickup OTPs, and delivery proofs directly on WhatsApp.</p>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${services.whatsapp ? 'bg-[#25D366]' : 'bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${services.whatsapp ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-semibold text-sm">Receive booking updates on WhatsApp</span>
                    <input type="checkbox" checked={services.whatsapp} onChange={(e: any) => setServices({...services, whatsapp: e.target.checked})} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <ToggleCard title="Express Delivery" desc="Prioritize shipment processing" checked={services.express} onChange={(c: any) => setServices({...services, express: c})} />
                <ToggleCard title="Same Day Pickup" desc="Schedule pickup today (if before 2PM)" checked={services.sameDay} onChange={(c: any) => setServices({...services, sameDay: c})} />
                <ToggleCard title="SMS Notifications" desc="Standard text message updates" checked={services.sms} onChange={(c: any) => setServices({...services, sms: c})} />
                <ToggleCard title="Signature Required" desc="Ensure hand-to-hand delivery" checked={services.signature} onChange={(c: any) => setServices({...services, signature: c})} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-[#FF7A00]/10 text-[#FF7A00] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Review & Pay</h2>
                <p className="text-gray-500 text-sm">Please verify your shipment details before proceeding to payment.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 space-y-4 text-sm text-gray-600">
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-bold text-gray-800">Sender</span>
                  <span className="text-right">{sender.name}<br/>{sender.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-bold text-gray-800">Receiver</span>
                  <span className="text-right">{receiver.name}<br/>{receiver.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="font-bold text-gray-800">Package Details</span>
                  <span className="text-right">{pkg.count} {pkg.category} ({pkg.weight || baseForm.weight} kg)</span>
                </div>
                {services.whatsapp && (
                  <div className="flex justify-between text-[#25D366] font-semibold">
                    <span>Updates enabled on WhatsApp</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-[#FF7A00]/5 text-[#FF7A00] px-4 py-3 rounded-xl text-sm font-medium">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>Clicking "Proceed to Payment" will redirect you to our secure payment gateway. Your booking will be confirmed immediately after payment.</p>
              </div>
            </motion.div>
          )}

        </div>

        {/* Action Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-[#111827] text-white hover:bg-[#FF7A00] transition-colors shadow-lg"
              >
                Continue to {step === 1 ? 'Package' : step === 2 ? 'Services' : 'Payment'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-[#FF7A00] text-white hover:bg-[#e86d00] transition-colors shadow-[0_4px_16px_rgba(255,122,0,0.35)] min-w-[200px]"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Proceed to Payment'}
              </button>
            )}
          </div>
        )}
      </div>
      {/* Payment Modals */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => { setShowPaymentModal(false); setShowRazorpayMock(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors">×</button>
              
              {!showRazorpayMock ? (
                <>
                  <div className="w-16 h-16 bg-[#FF7A00]/10 text-[#FF7A00] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Select Payment Method</h3>
                  <p className="text-center text-gray-500 text-sm mb-8">Choose how you'd like to pay for your shipment.</p>
                  
                  <div className="space-y-4">
                    <button onClick={handleCashPayment} disabled={loading} className="w-full border-2 border-gray-200 hover:border-[#FF7A00] rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-[#FF7A00]/5 text-left group cursor-pointer">
                      <div className="w-12 h-12 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center text-xl">💵</div>
                      <div>
                        <h4 className="font-bold text-gray-900">Cash on Pickup</h4>
                        <p className="text-xs text-gray-500">Cash or Pay</p>
                      </div>
                    </button>
                    
                    <button onClick={handleRazorpayPayment} disabled={loading} className="w-full border-2 border-gray-200 hover:border-[#FF7A00] rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-[#FF7A00]/5 text-left group cursor-pointer">
                      <div className="w-12 h-12 bg-gray-100 group-hover:bg-white rounded-xl flex items-center justify-center text-xl">💳</div>
                      <div>
                        <h4 className="font-bold text-gray-900">Online / QR Code</h4>
                        <p className="text-xs text-gray-500">Razorpay Secure Checkout</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Razorpay Test Mode</h3>
                  <p className="text-gray-500 text-sm mb-6">Scan the mock QR code or click simulate to proceed.</p>
                  
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl mx-auto mb-8 flex items-center justify-center text-gray-400 font-bold">
                    [ MOCK QR CODE ]
                  </div>
                  
                  <button onClick={handleRazorpayPayment} disabled={loading} className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF7A00] transition-colors cursor-pointer">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Simulate Successful Payment"}
                  </button>
                  <button onClick={() => setShowRazorpayMock(false)} className="mt-4 text-sm text-gray-500 hover:underline cursor-pointer">Go Back</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
// Helper Components
function Input({ label, value, onChange, placeholder, type = "text", maxLength }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-gray-900 bg-gray-50/50 hover:bg-white"
      />
    </div>
  );
}

function ToggleCard({ title, desc, checked, onChange }: any) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 ${checked ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-gray-300'}`}>
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </div>
      <div>
        <span className={`block text-sm font-bold ${checked ? 'text-[#FF7A00]' : 'text-gray-900'}`}>{title}</span>
        <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>
      </div>
    </div>
  );
}
