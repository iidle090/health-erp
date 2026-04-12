import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, UserPlus, CreditCard, Ticket, Receipt, LogOut, Menu, X, Bell, Siren } from "lucide-react";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationStore";

const navItems = [
  { href: "/receptionist", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receptionist/register", label: "Patient Registration", icon: UserPlus },
  { href: "/receptionist/billing", label: "Billing & Payments", icon: CreditCard },
  { href: "/receptionist/queue", label: "Queue / Tickets", icon: Ticket },
  { href: "/receptionist/emergency", label: "Emergency", icon: Siren },
  { href: "/receptionist/receipts", label: "Receipts", icon: Receipt },
];

export function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { getUnreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = getUnreadCount("receptionist");

  const initials = user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? "RC";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 flex-shrink-0 flex flex-col bg-[#8B1A2F] transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[10px] text-white/50 font-medium">Reception</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href || (item.href !== "/receptionist" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-white text-[#8B1A2F]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <item.icon className="h-4 w-4 flex-shrink-0" />{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <LogOut className="h-4 w-4" />Logout
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#fdf2f4] text-[#8B1A2F]">Reception</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unread > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#8B1A2F]" />}
            </button>
            <ProfileDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
