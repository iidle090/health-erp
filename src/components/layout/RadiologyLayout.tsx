import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ClipboardList, CalendarDays, FileSearch, Monitor, BarChart3, Cpu, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import { useCrossPortal } from "@/context/CrossPortalStore";

const nav = [
  { name: "Dashboard",  href: "/radiology",           icon: LayoutDashboard },
  { name: "Orders",     href: "/radiology/orders",     icon: ClipboardList },
  { name: "Schedule",   href: "/radiology/schedule",   icon: CalendarDays },
  { name: "Results",    href: "/radiology/results",    icon: FileSearch },
  { name: "PACS",       href: "/radiology/pacs",       icon: Monitor },
  { name: "Equipment",  href: "/radiology/equipment",  icon: Cpu },
  { name: "Reports",    href: "/radiology/reports",    icon: BarChart3 },
];

export function RadiologyLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { imagingOrders } = useCrossPortal();
  const pendingCount = imagingOrders.filter((o) => o.status === "Ordered").length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-border bg-[#0f2d4a]">
        <div className="flex items-center gap-2 border-b border-white/15 px-3 py-4">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[10px] text-white/60 font-medium">Radiology</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = location === item.href || (item.href !== "/radiology" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${active ? "bg-white text-[#0f2d4a]" : "text-white/75 hover:bg-white/15 hover:text-white"}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.name === "Orders" && pendingCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-[#0f2d4a] text-white" : "bg-white text-[#0f2d4a]"}`}>{pendingCount}</span>
                  )}
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
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">Radiology Portal</span>
          <div className="flex items-center gap-3">
            <NotificationBell role="radiology" />
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
