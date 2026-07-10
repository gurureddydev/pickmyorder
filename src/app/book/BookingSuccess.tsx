import { motion } from "motion/react";
import { CheckCircle2, Download, Package, MapPin, Share2, MessageCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function BookingSuccess({ quote, order }: { quote: any, order: any }) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#FF7A00", "#111827", "#ffffff"]
    });
  }, []);

  const bookingId = order?.orderNumber || "PMO" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const trackingNo = order?.awbNumber || quote.courierCode.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 10000000000).toString();

  const handleDownload = (type: string) => {
    const text = type === "invoice" ? `Invoice for ${bookingId}\nAmount: ${order?.totalAmount}\nAWB: ${trackingNo}` : `Shipping Label\nBooking: ${bookingId}\nAWB: ${trackingNo}\nDestination: ${order?.destPin}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookingId}_${type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center"
    >
      <div className="w-24 h-24 bg-[#FF7A00]/10 text-[#FF7A00] rounded-full flex items-center justify-center mx-auto mb-6 relative">
        <CheckCircle2 className="w-12 h-12" />
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-[#111827] rounded-full border-4 border-white flex items-center justify-center"
        >
          <Package className="w-3.5 h-3.5 text-white" />
        </motion.div>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Successful!</h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">Your shipment has been booked and scheduled for pickup. You will receive tracking details via WhatsApp and SMS shortly.</p>

      <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-8 text-left grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Booking ID</p>
          <p className="text-xl font-black text-gray-900">{bookingId}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
          <p className="text-xl font-black text-[#FF7A00]">{trackingNo}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Delivery</p>
          <p className="text-base font-semibold text-gray-900">{quote.etaDays} Days</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Courier Partner</p>
          <div className="flex items-center gap-2">
            <span className="bg-white px-2 py-1 rounded text-xs font-bold text-[#FF7A00] border">{quote.courierCode.substring(0, 4)}</span>
            <span className="text-base font-semibold text-gray-900">{quote.courierName}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <button onClick={() => handleDownload('invoice')} className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
          <Download className="w-5 h-5" /> Download Invoice
        </button>
        <button onClick={() => handleDownload('label')} className="flex items-center justify-center gap-2 border-2 border-[#111827] bg-[#111827] text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
          <Download className="w-5 h-5" /> Download Label
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-gray-100">
        <Link href={`/track?awb=${trackingNo}`} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#FF7A00] transition-colors cursor-pointer">
          <MapPin className="w-4 h-4" /> Track Shipment
        </Link>
        <button 
          onClick={() => window.open(`https://wa.me/?text=Track my PickMyOrder shipment: ${window.location.origin}/track?awb=${trackingNo}`, '_blank')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#25D366] transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" /> Send on WhatsApp
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/track?awb=${trackingNo}`);
            alert('Tracking link copied to clipboard!');
          }}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#111827] transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Share Tracking Link
        </button>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-[#FF7A00] font-bold text-sm hover:underline">
          Book Another Shipment
        </Link>
      </div>
    </motion.div>
  );
}
