"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Track", href: "/track" },
    { name: "Contact", href: "/contact" },
  ];

  const userRole = (session?.user as any)?.role;
  const dashboardHref = "/admin";

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d1520]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)] py-1"
          : "bg-[#111827] py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <Link href="/">
            <img
              src="/logo-icon.png"
              alt="PickMyOrder Logo"
              className="h-8 object-contain flex-shrink-0 cursor-pointer"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.name}
                href={l.href}
                className={`relative text-sm font-semibold transition-colors ${
                  isActive ? "text-[#FF7A00]" : "text-white/65 hover:text-white"
                }`}
              >
                {l.name}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-[#FF7A00] rounded-full shadow-[0_0_8px_rgba(255,122,0,0.6)]" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="text-white/65 hover:text-white text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-[#1f2937] hover:bg-[#374151] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white/65 hover:text-white text-sm font-medium transition-colors border border-white/20 px-4 py-2 rounded-lg hover:border-white/40"
              >
                Admin Login
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-1"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#111827] border-t border-white/10 px-5 py-4 flex flex-col gap-4 shadow-xl">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.name}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-semibold px-3 py-2 rounded-lg ${
                  isActive ? "text-[#FF7A00] bg-[#FF7A00]/10" : "text-white/75 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.name}
              </Link>
            );
          })}
          <div className="pt-3 flex flex-col gap-3 border-t border-white/10">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="text-white/65 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-[#1f2937] text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-white/65 text-sm font-medium border border-white/20 px-4 py-2.5 rounded-lg text-center"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
