import React from "react";
import { ClipboardList, Clock, Activity, CheckCircle, AlertTriangle, TrendingUp, Zap, CalendarDays } from "lucide-react";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";

const MODALITY_COLOR: Record<ImagingOrder["modality"], string> = {
  "X-Ray": "bg-sky-100 text-sky-700",
  "CT Scan": "bg-purple-100 text-purple-700",
  "MRI": "bg-indigo-100 text-indigo-700",
  "Ultrasound": "bg-teal-100 text-teal-700",
  "Mammography": "bg-pink-100 text-pink-700",
  "Fluoroscopy": "bg-orange-100 text-orange-700",
  "Nuclear Medicine": "bg-yellow-100 text-yellow-700",
  "PET Scan": "bg-red-100 text-red-700",
  "DEXA Scan": "bg-lime-100 text-lime-700",
  "Echocardiogram": "bg-rose-100 text-rose-700",
};

const STATUS_COLOR: Record<ImagingOrder["status"], string> = {
  Ordered: "bg-amber-50 text-amber-700",
  Scheduled: "bg-blue-50 text-blue-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

const PRIORITY_COLOR = { STAT: "bg-red-100 text-red-700", Urgent: "bg-amber-100 text-amber-700", Routine: "bg-gray-100 text-gray-600" };

const MODALITIES: ImagingOrder["modality"][] = ["X-Ray", "CT Scan", "MRI", "Ultrasound", "Mammography", "Fluoroscopy", "Nuclear Medicine", "PET Scan", "DEXA Scan", "Echocardiogram"];

export function RadiologyDashboard() {
  const { imagingOrders } = useCrossPortal();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  // Clinic isolation: radiology only sees orders from their own clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const todayOrders = clinicOrders.filter((o) => o.orderDate === today);
  const pending   = clinicOrders.filter((o) => o.status === "Ordered");
  const scheduled = clinicOrders.filter((o) => o.status === "Scheduled");
  const inProg    = clinicOrders.filter((o) => o.status === "In Progress");
  const completed = clinicOrders.filter((o) => o.status === "Completed");
  const stat      = clinicOrders.filter((o) => o.priority === "STAT");

  const modCounts = MODALITIES.map((m) => ({
    modality: m,
    total: clinicOrders.filter((o) => o.modality === m).length,
    pending: clinicOrders.filter((o) => o.modality === m && o.status === "Ordered").length,
    completed: clinicOrders.filter((o) => o.modality === m && o.status === "Completed").length,
  })).filter((m) => m.total > 0).sort((a, b) => b.total - a.total);

  const recentOrders = [...clinicOrders].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);

  const stats = [
    { label: "Total Orders", value: clinicOrders.length, icon: ClipboardList, color: "bg-sky-50 text-sky-700", iconBg: "bg-sky-100" },
    { label: "Pending Review", value: pending.length, icon: Clock, color: "bg-amber-50 text-amber-700", iconBg: "bg-amber-100", href: "/radiology/orders" },
    { label: "In Progress", value: inProg.length, icon: Activity, color: "bg-purple-50 text-purple-700", iconBg: "bg-purple-100" },
    { label: "Completed", value: completed.length, icon: CheckCircle, color: "bg-green-50 text-green-700", iconBg: "bg-green-100" },
    { label: "Scheduled", value: scheduled.length, icon: CalendarDays, color: "bg-blue-50 text-blue-700", iconBg: "bg-blue-100", href: "/radiology/schedule" },
    { label: "STAT Orders", value: stat.length, icon: Zap, color: "bg-red-50 text-red-700", iconBg: "bg-red-100", href: "/radiology/orders" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Radiology Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today} · {todayOrders.length} order{todayOrders.length !== 1 ? "s" : ""} received today</p>
      </div>

      {/* STAT alert */}
      {stat.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">{stat.length} STAT order{stat.length > 1 ? "s" : ""} require immediate attention</p>
            <p className="text-xs text-red-600 mt-0.5">{stat.filter((o) => o.status === "Ordered").length} still pending — review now</p>
          </div>
          <Link href="/radiology/orders">
            <span className="text-xs font-semibold text-red-700 underline cursor-pointer">View Orders →</span>
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href ?? "#"}>
            <div className={`rounded-xl border border-border bg-card p-4 shadow-sm ${s.href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}>
                  <s.icon className={`h-4 w-4 ${s.color.split(" ")[1]}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modality breakdown */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#0f2d4a]" />
            <h2 className="text-sm font-bold text-foreground">Modality Utilization</h2>
          </div>
          {modCounts.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">No imaging orders yet</p>
              <p className="text-xs text-muted-foreground mt-1">Orders will appear here once doctors submit imaging requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modCounts.map((m) => {
                const pct = clinicOrders.length ? Math.round((m.total / clinicOrders.length) * 100) : 0;
                return (
                  <div key={m.modality}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[m.modality]}`}>{m.modality}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{m.pending} pending</span>
                        <span className="font-semibold text-foreground">{m.total} total</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-[#0f2d4a]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0f2d4a]" />
              <h2 className="text-sm font-bold text-foreground">Recent Orders</h2>
            </div>
            <Link href="/radiology/orders">
              <span className="text-xs text-[#0f2d4a] font-medium hover:underline cursor-pointer">View all →</span>
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[10px] font-bold text-[#0f2d4a]">{o.id}</span>
                      {o.priority !== "Routine" && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{o.patientName}</p>
                    <p className="text-[10px] text-muted-foreground">{o.modality} · {o.bodyPart}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status distribution */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h2 className="text-sm font-bold text-foreground mb-4">Order Status Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {([
            { label: "Ordered", count: pending.length, cls: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "Scheduled", count: scheduled.length, cls: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "In Progress", count: inProg.length, cls: "bg-purple-50 border-purple-200 text-purple-700" },
            { label: "Completed", count: completed.length, cls: "bg-green-50 border-green-200 text-green-700" },
            { label: "Cancelled", count: clinicOrders.filter((o) => o.status === "Cancelled").length, cls: "bg-gray-50 border-gray-200 text-gray-600" },
          ]).map((s) => (
            <div key={s.label} className={`rounded-lg border p-3 text-center ${s.cls}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
