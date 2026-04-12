import React from "react";
import { FlaskConical, Clock, CheckCircle, AlertTriangle, TestTubes } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";

export function LabDashboard() {
  const { labOrders } = useCrossPortal();
  const { user } = useAuth();
  const { getNotifications } = useNotifications();
  const notifications = getNotifications("lab");

  // Clinic isolation: lab only sees orders from their own clinic
  const clinicOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const pending = clinicOrders.filter((o) => o.status === "Pending");
  const inProgress = clinicOrders.filter((o) => o.status === "In Progress");
  const completed = clinicOrders.filter((o) => o.status === "Completed");
  const stat = clinicOrders.filter((o) => o.priority === "STAT" && o.status !== "Completed");

  const priorityBg: Record<string, string> = { STAT: "bg-[#fdf2f4] text-[#8B1A2F] border-[#f0d0d6]", Urgent: "bg-amber-50 text-amber-700 border-amber-200", Routine: "bg-muted text-muted-foreground border-border" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lab Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Wednesday, April 8, 2025 — Day Shift</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Orders", value: pending.length, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "In Progress", value: inProgress.length, icon: TestTubes, color: "text-orange-700", bg: "bg-orange-50" },
          { label: "Completed Today", value: completed.length, icon: CheckCircle, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "STAT Orders", value: stat.length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
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
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Pending Test Orders</h2>
            <Link href="/lab/orders"><span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all</span></Link>
          </div>
          <div className="divide-y divide-border/40">
            {clinicOrders.filter((o) => o.status !== "Completed").slice(0, 4).map((o) => (
              <div key={o.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8B1A2F] font-semibold">{o.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityBg[o.priority]}`}>{o.priority}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-0.5">{o.patientName}</p>
                  <p className="text-xs text-muted-foreground">{o.tests.join(", ")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ordered by {o.orderedBy}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === "In Progress" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{o.status}</span>
                  <p className="text-xs text-muted-foreground mt-1">{o.orderDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications from doctors */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Notifications from Doctors</h2>
          </div>
          <div className="divide-y divide-border/40">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`px-5 py-3 ${!n.read ? "bg-amber-50/30" : ""}`}>
                <div className="flex items-start gap-2">
                  <FlaskConical className="h-4 w-4 text-[#8B1A2F] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{n.timestamp}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-[#8B1A2F] flex-shrink-0 mt-1" />}
                </div>
              </div>
            ))}
            {notifications.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No notifications</div>}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4">Test Type Breakdown Today</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { type: "Hematology (CBC)", count: 8, color: "bg-[#8B1A2F]" },
            { type: "Chemistry (BMP/CMP)", count: 6, color: "bg-amber-500" },
            { type: "Endocrinology", count: 4, color: "bg-orange-400" },
            { type: "Microbiology", count: 2, color: "bg-[#8B1A2F]/60" },
          ].map((t) => (
            <div key={t.type} className="rounded-lg border border-border p-3 text-center">
              <div className={`h-1.5 w-full rounded-full ${t.color} mb-3`} />
              <p className="text-xl font-bold text-foreground">{t.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
