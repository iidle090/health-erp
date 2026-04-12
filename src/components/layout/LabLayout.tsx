import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ClipboardList, TestTubes, FileInput, FileBarChart2, LogOut, Package } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";

const nav = [
  { name: "Dashboard", href: "/lab", icon: LayoutDashboard },
  { name: "Test Orders", href: "/lab/orders", icon: ClipboardList },
  { name: "Samples", href: "/lab/samples", icon: TestTubes },
  { name: "Results Entry", href: "/lab/results", icon: FileInput },
  { name: "Inventory", href: "/lab/inventory", icon: Package },
  { name: "Reports", href: "/lab/reports", icon: FileBarChart2 },
];

export function LabLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-border bg-[#8B1A2F]">
        <div className="flex items-center gap-2 border-b border-white/15 px-3 py-4">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[10px] text-white/60 font-medium">Laboratory</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = location === item.href || (item.href !== "/lab" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${active ? "bg-white text-[#8B1A2F]" : "text-white/75 hover:bg-white/15 hover:text-white"}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />{item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/15 px-2 py-3">
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/15 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /><span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-background">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Laboratory Portal</span>
          <div className="flex items-center gap-3">
            <NotificationBell role="lab" />
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
