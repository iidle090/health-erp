import React from "react";
import { Pill, AlertTriangle, Clock, CheckCircle, Package } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";

export function PharmacyDashboard() {
  const { prescriptions, inventory } = useCrossPortal();
  const { user } = useAuth();
  const { getNotifications } = useNotifications();
  const notifications = getNotifications("pharmacy");

  // Clinic isolation: pharmacy only sees prescriptions from their own clinic
  const clinicPrescriptions = prescriptions.filter((p) =>
    user?.role === "superadmin" || (p.clinicId === user?.clinicId)
  );

  const pending = clinicPrescriptions.filter((p) => p.status === "Pending");
  const lowStock = inventory.filter((m) => m.stock <= m.reorderLevel);
  const expiringSoon = inventory.filter((m) => {
    const exp = new Date(m.expiry);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    return diff <= 3;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pharmacy Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Wednesday, April 8, 2025</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Prescriptions Pending", value: pending.length, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Dispensed Today", value: clinicPrescriptions.filter((p) => p.status === "Dispensed").length, icon: CheckCircle, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Low Stock Alerts", value: lowStock.length, icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50" },
          { label: "Expiring (3 mo)", value: expiringSoon.length, icon: Package, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription queue */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Prescription Queue</h2>
            <Link href="/pharmacy/prescriptions"><span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all</span></Link>
          </div>
          <div className="divide-y divide-border/40">
            {pending.slice(0, 4).map((rx) => (
              <div key={rx.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-[#8B1A2F] font-bold">{rx.id}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{rx.patientName}</p>
                    <p className="text-xs text-muted-foreground">{rx.items.map((i) => `${i.medication} ${i.dosage}`).join(", ")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">By {rx.prescribedBy} · {rx.date}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">{rx.status}</span>
                </div>
              </div>
            ))}
            {pending.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No pending prescriptions</div>}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Low Stock Alerts</h2>
            <Link href="/pharmacy/inventory"><span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">Manage</span></Link>
          </div>
          <div className="divide-y divide-border/40">
            {lowStock.slice(0, 5).map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${m.stock === 0 ? "bg-red-500" : m.stock <= m.reorderLevel / 2 ? "bg-[#8B1A2F]" : "bg-amber-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#8B1A2F]">{m.stock} {m.unit}</p>
                  <p className="text-xs text-muted-foreground">Min: {m.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Incoming Notifications</h2>
        </div>
        <div className="divide-y divide-border/40">
          {notifications.slice(0, 4).map((n) => (
            <div key={n.id} className={`px-5 py-3 flex items-start gap-3 ${!n.read ? "bg-amber-50/30" : ""}`}>
              <Pill className="h-4 w-4 text-[#8B1A2F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{n.timestamp}</p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-[#8B1A2F] flex-shrink-0 mt-1.5 ml-auto" />}
            </div>
          ))}
          {notifications.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No notifications</div>}
        </div>
      </div>
    </div>
  );
}
