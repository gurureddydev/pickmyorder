import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import MultiStepBooking from "./MultiStepBooking";

export const metadata = {
  title: "Book Shipment | PickMyOrder",
  description: "Book your courier shipment with real-time quotes, tracking, and premium logistics support.",
};

export default function BookShipmentPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <MultiStepBooking />
        </div>
      </div>
      <Footer />
    </main>
  );
}
