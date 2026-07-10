"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        // Always redirect to admin panel
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center px-5 sm:px-8" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-[420px] shadow-2xl flex flex-col justify-between border border-gray-100"
      >
        <div>
          <div className="flex justify-center mb-6">
            <img src="/logo-icon.png" alt="PickMyOrder Logo" className="h-10 object-contain" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 text-center tracking-tight">Welcome Back</h2>
          <p className="text-xs text-gray-400 text-center mt-1.5 mb-6">
            Sign in to access the PickMyOrder Admin Dashboard to manage shipments and platform settings.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Corporate Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@pickmyorder.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] text-gray-900 placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF7A00] text-gray-900 placeholder-gray-300"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2.5 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF7A00] hover:bg-[#e86d00] text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_16px_rgba(255,122,0,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-sm"
            >
              {loading ? "Authenticating..." : (
                <>
                  Access Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col gap-4 text-center">
          <p className="text-xs text-gray-400">
            Secure access restricted to authorized administrators only.
          </p>
          <div className="flex justify-center items-center gap-1.5 text-[10px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-[#FF7A00]" />
            SLA backed secure system
          </div>
        </div>
      </motion.div>
    </div>
  );
}
