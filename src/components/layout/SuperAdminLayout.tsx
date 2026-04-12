import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Building2, Users, BarChart3, CreditCard, Settings, ScrollText, LogOut, ShieldCheck } from "lucide-react";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";

const nav = [
  { name: "Super Dashboard", href: "/superadmin",         icon: LayoutDashboard },
  { name: "Manage Admins",   href: "/superadmin/admins",  icon: ShieldCheck },
  { name: "Clinics",         href: "/superadmin/clinics", icon: Building2 },
  { name: "Global Users",    href: "/superadmin/users",   icon: Users },
  { name: "Global Reports",  href: "/superadmin/reports", icon: BarChart3 },
  { name: "Billing Plans",   href: "/superadmin/billing", icon: CreditCard },
  { name: "System Settings", href: "/superadmin/settings",icon: Settings },
  { name: "Audit Logs",      href: "/superadmin/audit",   icon: ScrollText },
];

const portals = [
  { name: "Admin",      href: "/admin-dashboard",  color: "bg-[#fdf2f4] text-[#8B1A2F]" },
  { name: "Doctor",     href: "/doctor-dashboard", color: "bg-amber-100 text-amber-700" },
  { name: "Nurse",      href: "/nurse-dashboard",  color: "bg-orange-100 text-orange-700" },
  { name: "Lab",        href: "/lab",              color: "bg-blue-100 text-blue-700" },
  { name: "Pharmacy",   href: "/pharmacy",         color: "bg-green-100 text-green-700" },
  { name: "Accountant", href: "/accountant",       color: "bg-purple-100 text-purple-700" },
];

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-border bg-[#1a0a10]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-4">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[10px] text-white/50 font-medium">Super Admin</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = location === item.href || (item.href !== "/superadmin" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${active ? "bg-[#ebc325] text-[#1a0a10]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        {/* Portal quick-switch */}
        <div className="border-t border-white/10 px-3 py-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Portal Access</p>
          <div className="grid grid-cols-3 gap-1">
            {portals.map((p) => (
              <Link key={p.name} href={p.href}>
                <span className={`flex items-center justify-center rounded-md px-1 py-1.5 text-[10px] font-semibold cursor-pointer transition-opacity hover:opacity-80 ${p.color}`}>{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 px-3 py-3">
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /><span>Logout</span>
          </button>
        </div>
      </aside>
      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-background">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ebc325] text-[#1a0a10]">Super Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell role="superadmin" />
            <ProfileDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div key={location} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
