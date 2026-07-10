"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  DollarSign,
  MapPin,
  LogOut,
  Save,
  Upload,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Image as ImageIcon,
  Film,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";

// Tab types
type Tab = "dashboard" | "orders" | "couriers" | "pricing" | "pincodes" | "messages" | "media";

export default function AdminPanel() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [courierPerformance, setCourierPerformance] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [bulkPincodesJson, setBulkPincodesJson] = useState("");
  const [contactMessages, setContactMessages] = useState<any[]>([]);

  // Media states
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("IMAGE");
  const [uploadSection, setUploadSection] = useState("HERO");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Selected entities for editing
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderUpdate, setOrderUpdate] = useState({
    status: "",
    location: "",
    description: "",
  });

  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const [ruleUpdate, setRuleUpdate] = useState({
    basePrice: "",
    pricePerKg: "",
    additionalKgPrice: "",
    fuelSurchargePercent: "",
  });

  // Fetch admin dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setCourierPerformance(data.courierPerformance);
        setRevenueData(data.revenueData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all other datasets
  const fetchTabItems = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        await fetchDashboardStats();
      } else if (activeTab === "orders") {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } else if (activeTab === "couriers") {
        const res = await fetch("/api/admin/couriers");
        const data = await res.json();
        if (data.success) setCouriers(data.couriers);
      } else if (activeTab === "pricing") {
        const res = await fetch("/api/admin/pricing-rules");
        const data = await res.json();
        if (data.success) setPricingRules(data.rules);
      } else if (activeTab === "pincodes") {
        const res = await fetch("/api/admin/pincodes?limit=100");
        const data = await res.json();
        if (data.success) setPincodes(data.pincodes);
      } else if (activeTab === "messages") {
        const res = await fetch("/api/admin/messages");
        const data = await res.json();
        if (data.success) setContactMessages(data.messages);
      } else if (activeTab === "media") {
        const res = await fetch("/api/admin/media");
        const data = await res.json();
        if (data.success) setMediaList(data.media);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin dashboard components.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabItems();
  }, [activeTab]);

  // Handle courier toggle/priority update
  const handleCourierUpdate = async (id: string, updates: any) => {
    try {
      const res = await fetch("/api/admin/couriers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Courier configuration updated successfully.");
        fetchTabItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle order status tracking updates
  const handleOrderUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: orderUpdate.status,
          location: orderUpdate.location,
          description: orderUpdate.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Order status tracking updated successfully.");
        setSelectedOrder(null);
        fetchTabItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle pricing rule updates
  const handlePricingUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;

    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRule.id,
          ...ruleUpdate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Pricing rule metrics adjusted.");
        setSelectedRule(null);
        fetchTabItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle pincode details toggle
  const handlePincodeToggle = async (id: string, updates: any) => {
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTabItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle bulk pincode import
  const handleBulkPincodeImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPincodesJson) return;

    try {
      const parsed = JSON.parse(bulkPincodesJson);
      const res = await fetch("/api/admin/pincodes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincodes: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || "Bulk pincodes imported successfully.");
        setBulkPincodesJson("");
        fetchTabItems();
      } else {
        setError(data.error || "Failed to process bulk pincode list.");
      }
    } catch (err) {
      setError("Invalid JSON format. Please pass a valid JSON array.");
    }
  };

  // Handle message status update
  const handleMessageStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Message marked as ${status.toLowerCase().replace("_", " ")}.`);
        setContactMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return setError("Please select a file.");
    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("type", uploadType);
    formData.append("section", uploadSection);
    formData.append("title", uploadTitle);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Media uploaded successfully!");
        setMediaList([data.media, ...mediaList]);
        setUploadFile(null);
        setUploadTitle("");
        (document.getElementById("media-upload-form") as HTMLFormElement)?.reset();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleMediaDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMediaList(mediaList.filter((m) => m.id !== id));
        setMessage("Media deleted.");
      } else {
        setError(data.error || "Delete failed");
      }
    } catch (err) {
      setError("An error occurred during deletion.");
    }
  };

  const tabs: Array<{ key: Tab; label: string; icon: any }> = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "orders", label: "Orders Ledger", icon: ShoppingBag },
    { key: "couriers", label: "Courier Partners", icon: Truck },
    { key: "pricing", label: "Pricing Engine", icon: DollarSign },
    { key: "pincodes", label: "Pincodes Registry", icon: MapPin },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "media", label: "Media Library", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Sidebar Panel */}
      <aside className="w-64 bg-[#111827] text-white flex flex-col justify-between shrink-0 border-r border-gray-800">
        <div>
          <div className="p-6 border-b border-gray-800 flex items-center gap-2">
            <img src="/logo-icon.png" alt="Logo" className="h-8 object-contain" />
            <span className="font-extrabold text-sm tracking-widest text-[#FF7A00] uppercase">Admin Hub</span>
          </div>

          <nav className="p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setError("");
                    setMessage("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-[#FF7A00] text-white shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-800 space-y-4">
          <div className="text-xs text-white/40">Logged in as {session?.user?.name || "Admin"}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-500/20 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer font-bold text-xs"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-10 max-w-7xl overflow-y-auto">
        {/* Alerts banner */}
        {message && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="hover:underline">Dismiss</button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</span>
            <button onClick={() => setError("")} className="hover:underline">Dismiss</button>
          </div>
        )}

        {/* Dynamic tab components */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-gray-900">Dashboard Metrics Overview</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Booked Revenue", val: `₹${Math.round(stats.totalRevenue).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
                { title: "Total Shipments Scheduled", val: stats.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
                { title: "Pending Pickups", val: stats.pendingOrders, icon: RefreshCw, color: "text-orange-600 bg-orange-50" },
                { title: "Delivered Shipments", val: stats.deliveredOrders, icon: Truck, color: "text-purple-600 bg-purple-50" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
                      <span className="text-xl font-black text-gray-900 block mt-1">{card.val}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Courier Performance & Mock Analytics */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Courier Distribution Performance</h3>
                <div className="space-y-4">
                  {courierPerformance.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>{c.name}</span>
                      <div className="flex items-center gap-2 w-2/3">
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#FF7A00] h-full"
                            style={{ width: `${stats.totalOrders ? (c.ordersCount / stats.totalOrders) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="shrink-0">{c.ordersCount} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Revenue Growth Stream</h3>
                  <p className="text-xs text-gray-400">Comparing total booked invoices generated by all courier routes.</p>
                </div>
                <div className="flex items-end gap-3 pt-6 h-40">
                  {revenueData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="bg-[#FF7A00]/80 hover:bg-[#FF7A00] w-full rounded-t-lg transition-all"
                        style={{ height: `${stats.totalRevenue ? (d.revenue / stats.totalRevenue) * 100 : 0}%` }}
                      />
                      <span className="text-[10px] text-gray-400 font-bold">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-gray-900">System Orders Registry</h1>
              <button onClick={fetchTabItems} className="bg-gray-100 p-2 rounded-xl text-gray-500 hover:text-gray-900 cursor-pointer">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </button>
            </div>

            {selectedOrder ? (
              <form onSubmit={handleOrderUpdateSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-lg space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Update Tracking: {selectedOrder.orderNumber}</h3>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Select Status</label>
                  <select
                    value={orderUpdate.status}
                    onChange={(e) => setOrderUpdate({ ...orderUpdate, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none text-gray-900"
                  >
                    <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Hub Location</label>
                  <input
                    type="text"
                    placeholder="E.g. Wilson Garden Hub, Bengaluru"
                    value={orderUpdate.location}
                    onChange={(e) => setOrderUpdate({ ...orderUpdate, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Timeline Description</label>
                  <input
                    type="text"
                    placeholder="Brief updates on parcel location..."
                    value={orderUpdate.description}
                    onChange={(e) => setOrderUpdate({ ...orderUpdate, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none text-gray-900"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setSelectedOrder(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                  <button type="submit" className="bg-[#FF7A00] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            ) : null}

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">AWB</th>
                    <th className="pb-3">Sender</th>
                    <th className="pb-3">Courier</th>
                    <th className="pb-3">Receiver</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-4 font-bold text-gray-900">{o.orderNumber}</td>
                      <td className="py-4 text-gray-500 font-semibold">{o.awbNumber || "N/A"}</td>
                      <td className="py-4 text-gray-700">
                        <div className="font-semibold text-xs">{o.pickupName}</div>
                        <div className="text-[10px] text-gray-500">{o.pickupPhone}</div>
                        <div className="text-[10px] text-gray-400 max-w-[120px] truncate" title={`${o.pickupAddress}, ${o.pickupPin}`}>{o.pickupAddress}, {o.pickupPin}</div>
                      </td>
                      <td className="py-4 text-gray-700">{o.courierPartner?.name}</td>
                      <td className="py-4 text-gray-700">
                        <div className="font-semibold text-xs">{o.destName}</div>
                        <div className="text-[10px] text-gray-500">{o.destPhone}</div>
                        <div className="text-[10px] text-gray-400 max-w-[120px] truncate" title={`${o.destAddress}, ${o.destPin}`}>{o.destAddress}, {o.destPin}</div>
                      </td>
                      <td className="py-4 font-bold text-gray-900">₹{Math.round(o.totalAmount)}</td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded capitalize bg-orange-50 text-orange-700">
                          {o.status.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setOrderUpdate({ status: o.status, location: "", description: "" });
                          }}
                          className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          Edit Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Courier configs */}
        {activeTab === "couriers" && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-gray-900">Courier Partner Configurations</h1>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">API Integration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {couriers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-4 font-bold text-gray-900">{c.name}</td>
                      <td className="py-4 text-gray-500 font-semibold">{c.code}</td>
                      <td className="py-4">
                        <input
                          type="number"
                          value={c.priority}
                          onChange={(e) => handleCourierUpdate(c.id, { priority: e.target.value })}
                          className="w-16 border border-gray-200 rounded p-1 text-center font-bold text-xs"
                        />
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleCourierUpdate(c.id, { isActive: !c.isActive })}
                          className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer ${
                            c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          }`}
                        >
                          {c.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-4 text-xs text-gray-400">Mock Mode (Plug-in ready)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Pricing rules */}
        {activeTab === "pricing" && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-gray-900">Dynamic Pricing Rules Engine</h1>

            {selectedRule ? (
              <form onSubmit={handlePricingUpdateSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-lg space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">
                  Edit Pricing: {selectedRule.courierPartner.name} - {selectedRule.zone.name}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Base Price (0.5kg)</label>
                    <input
                      type="number"
                      value={ruleUpdate.basePrice}
                      onChange={(e) => setRuleUpdate({ ...ruleUpdate, basePrice: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none text-gray-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Additional KG Price</label>
                    <input
                      type="number"
                      value={ruleUpdate.additionalKgPrice}
                      onChange={(e) => setRuleUpdate({ ...ruleUpdate, additionalKgPrice: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none text-gray-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fuel Surcharge (%)</label>
                    <input
                      type="number"
                      value={ruleUpdate.fuelSurchargePercent}
                      onChange={(e) => setRuleUpdate({ ...ruleUpdate, fuelSurchargePercent: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none text-gray-900 font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setSelectedRule(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                  <button type="submit" className="bg-[#FF7A00] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Save className="w-3.5 h-3.5" /> Adjust Pricing
                  </button>
                </div>
              </form>
            ) : null}

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Courier</th>
                    <th className="pb-3">Zone Route</th>
                    <th className="pb-3">Service Type</th>
                    <th className="pb-3">Base Price</th>
                    <th className="pb-3">Add'l KG Price</th>
                    <th className="pb-3">Fuel Surcharge</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pricingRules.slice(0, 50).map((r) => (
                    <tr key={r.id}>
                      <td className="py-4 font-bold text-gray-900">{r.courierPartner.name}</td>
                      <td className="py-4 text-gray-700">{r.zone.name}</td>
                      <td className="py-4 text-gray-500 capitalize">{r.serviceType.name}</td>
                      <td className="py-4 font-bold text-gray-800">₹{r.basePrice}</td>
                      <td className="py-4 font-bold text-gray-800">₹{r.additionalKgPrice}</td>
                      <td className="py-4 text-gray-500">{r.fuelSurchargePercent}%</td>
                      <td className="py-4">
                        <button
                          onClick={() => {
                            setSelectedRule(r);
                            setRuleUpdate({
                              basePrice: String(r.basePrice),
                              pricePerKg: String(r.pricePerKg),
                              additionalKgPrice: String(r.additionalKgPrice),
                              fuelSurchargePercent: String(r.fuelSurchargePercent),
                            });
                          }}
                          className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Pincode configurations */}
        {activeTab === "pincodes" && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-gray-900">Pincode registry & Serviceability</h1>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Import Pincodes */}
              <form onSubmit={handleBulkPincodeImport} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Bulk Pincode Import</h3>
                <p className="text-xs text-gray-400">Upload Pincodes JSON array specifying zoneName and serviceability details.</p>
                <textarea
                  rows={4}
                  placeholder='[{"pincode":"560002", "zoneName":"Zone A", "isServiceable":true, "isRemoteArea":false, "estimatedDeliveryDays":2}]'
                  value={bulkPincodesJson}
                  onChange={(e) => setBulkPincodesJson(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-gray-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#FF7A00] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Import Pincodes List
                </button>
              </form>

              {/* Pincodes Table */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Active Registry</h3>
                <div className="overflow-x-auto flex-1 max-h-[300px]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="pb-3">Pincode</th>
                        <th className="pb-3">Zone</th>
                        <th className="pb-3">Serviceable</th>
                        <th className="pb-3">Remote</th>
                        <th className="pb-3">Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pincodes.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 font-bold text-gray-900">{p.pincode}</td>
                          <td className="py-2.5 text-gray-500">{p.zoneName}</td>
                          <td className="py-2.5">
                            <button
                              onClick={() => handlePincodeToggle(p.id, { isServiceable: !p.isServiceable })}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                p.isServiceable ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                              }`}
                            >
                              {p.isServiceable ? "Yes" : "No"}
                            </button>
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => handlePincodeToggle(p.id, { isRemoteArea: !p.isRemoteArea })}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                p.isRemoteArea ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {p.isRemoteArea ? "Remote" : "Standard"}
                            </button>
                          </td>
                          <td className="py-2.5 font-semibold text-gray-700">{p.estimatedDeliveryDays} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Contact Messages Inbox */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-gray-900">Contact Messages Inbox</h1>
              <span className="text-xs font-bold text-white bg-[#FF7A00] px-3 py-1.5 rounded-full">
                {contactMessages.filter((m) => m.status === "OPEN").length} Unread
              </span>
            </div>

            {contactMessages.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-300 mt-1">Contact form submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((msg) => {
                  const isOpen = msg.status === "OPEN";
                  const isResolved = msg.status === "RESOLVED";
                  // Extract sender name & email from the subject pattern
                  const senderMatch = msg.subject.match(/From: (.+?) <(.+?)>/);
                  const senderName = senderMatch ? senderMatch[1] : "Unknown";
                  const senderEmail = senderMatch ? senderMatch[2] : "";
                  const cleanSubject = msg.subject.replace(/\[Contact Form\]\s*/, "").replace(/\s*— From:.+/, "").trim();

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-3 ${
                        isOpen ? "border-[#FF7A00]/30 ring-1 ring-[#FF7A00]/10" : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-sm">{senderName}</span>
                            {senderEmail && (
                              <span className="text-xs text-gray-400">&lt;{senderEmail}&gt;</span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isOpen
                                  ? "bg-orange-50 text-orange-600"
                                  : isResolved
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {msg.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">{cleanSubject || "General Inquiry"}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-50">
                        {isOpen && (
                          <button
                            onClick={() => handleMessageStatusUpdate(msg.id, "IN_PROGRESS")}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" /> Mark In Progress
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            onClick={() => handleMessageStatusUpdate(msg.id, "RESOLVED")}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                          </button>
                        )}
                        {isResolved && (
                          <button
                            onClick={() => handleMessageStatusUpdate(msg.id, "OPEN")}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reopen
                          </button>
                        )}
                        <a
                          href={`mailto:${senderEmail}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#FF7A00] bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          Reply via Email
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Media Management */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900">Media Library</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#FF7A00]" /> Upload New Media
              </h2>
              <form id="media-upload-form" onSubmit={handleMediaUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">File</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Hero Background"
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO_REEL">Video Reel</option>
                    <option value="BANNER">Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
                  <select
                    value={uploadSection}
                    onChange={(e) => setUploadSection(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  >
                    <option value="HERO">Hero</option>
                    <option value="TRUST_BAND">Trust Band</option>
                    <option value="SERVICES">Services</option>
                    <option value="REEL">Reels Section</option>
                  </select>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-[#FF7A00] hover:bg-[#e86d00] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Upload Media"}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map((media) => (
                <div key={media.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group">
                  <div className="h-40 bg-gray-100 relative">
                    {media.type === "VIDEO_REEL" ? (
                      <video src={media.url} className="w-full h-full object-cover" muted loop />
                    ) : (
                      <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleMediaDelete(media.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-gray-900 truncate">{media.title || "Untitled"}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {media.type}
                      </span>
                      <span className="text-[10px] font-bold bg-[#FF7A00]/10 text-[#FF7A00] px-2 py-0.5 rounded">
                        {media.section}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {mediaList.length === 0 && (
              <div className="text-center p-10 bg-white rounded-2xl border border-gray-100">
                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No media uploaded yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
