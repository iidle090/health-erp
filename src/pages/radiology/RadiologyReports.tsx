import React, { useState } from "react";
import { BarChart3, TrendingUp, Clock, CheckCircle, Users, Zap, Calendar, FileText } from "lucide-react";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

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

const MODALITY_BAR_COLOR: Record<ImagingOrder["modality"], string> = {
  "X-Ray": "bg-sky-400",
  "CT Scan": "bg-purple-400",
  "MRI": "bg-indigo-400",
  "Ultrasound": "bg-teal-400",
  "Mammography": "bg-pink-400",
  "Fluoroscopy": "bg-orange-400",
  "Nuclear Medicine": "bg-yellow-400",
  "PET Scan": "bg-red-400",
  "DEXA Scan": "bg-lime-400",
  "Echocardiogram": "bg-rose-400",
};

const MODALITIES: ImagingOrder["modality"][] = ["X-Ray", "CT Scan", "MRI", "Ultrasound", "Mammography", "Fluoroscopy", "Nuclear Medicine", "PET Scan", "DEXA Scan", "Echocardiogram"];

type ReportTab = "overview" | "modality" | "referrals" | "tat";

export function RadiologyReports() {
  const { imagingOrders } = useCrossPortal();
  const { user } = useAuth();
  const [tab, setTab] = useState<ReportTab>("overview");

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const total = clinicOrders.length;
  const completed = clinicOrders.filter((o) => o.status === "Completed").length;
  const pending = clinicOrders.filter((o) => o.status === "Ordered").length;
  const scheduled = clinicOrders.filter((o) => o.status === "Scheduled").length;
  const inProg = clinicOrders.filter((o) => o.status === "In Progress").length;
  const cancelled = clinicOrders.filter((o) => o.status === "Cancelled").length;
  const stat = clinicOrders.filter((o) => o.priority === "STAT").length;
  const urgent = clinicOrders.filter((o) => o.priority === "Urgent").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const reportedCount = clinicOrders.filter((o) => o.findings).length;
  const contrastStudies = clinicOrders.filter((o) => o.contrast).length;

  const modalityStats = MODALITIES.map((m) => ({
    modality: m,
    total: clinicOrders.filter((o) => o.modality === m).length,
    completed: clinicOrders.filter((o) => o.modality === m && o.status === "Completed").length,
    pending: clinicOrders.filter((o) => o.modality === m && o.status === "Ordered").length,
    stat: clinicOrders.filter((o) => o.modality === m && o.priority === "STAT").length,
    contrast: clinicOrders.filter((o) => o.modality === m && o.contrast).length,
  })).filter((m) => m.total > 0).sort((a, b) => b.total - a.total);

  const maxModality = modalityStats.length > 0 ? modalityStats[0].total : 1;

  const referralDoctors = Array.from(new Set(clinicOrders.map((o) => o.orderedBy)));
  const referralStats = referralDoctors.map((doc) => ({
    doctor: doc,
    total: clinicOrders.filter((o) => o.orderedBy === doc).length,
    stat: clinicOrders.filter((o) => o.orderedBy === doc && o.priority === "STAT").length,
    completed: clinicOrders.filter((o) => o.orderedBy === doc && o.status === "Completed").length,
    modalities: Array.from(new Set(clinicOrders.filter((o) => o.orderedBy === doc).map((o) => o.modality))).slice(0, 3),
  })).sort((a, b) => b.total - a.total);

  const maxReferral = referralStats.length > 0 ? referralStats[0].total : 1;

  const priorityStats = [
    { label: "STAT", count: stat, pct: total > 0 ? Math.round((stat / total) * 100) : 0, cls: "bg-red-400" },
    { label: "Urgent", count: urgent, pct: total > 0 ? Math.round((urgent / total) * 100) : 0, cls: "bg-amber-400" },
    { label: "Routine", count: total - stat - urgent, pct: total > 0 ? Math.round(((total - stat - urgent) / total) * 100) : 0, cls: "bg-gray-400" },
  ];

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "modality", label: "By Modality" },
    { key: "referrals", label: "Referral Analysis" },
    { key: "tat", label: "Turnaround Time" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Radiology Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Analytics and performance metrics for the imaging department</p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-[#0f2d4a] text-[#0f2d4a]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Orders", value: total, icon: FileText, cls: "text-[#0f2d4a]", iconBg: "bg-blue-50" },
              { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle, cls: "text-green-700", iconBg: "bg-green-50" },
              { label: "Reports Filed", value: reportedCount, icon: BarChart3, cls: "text-indigo-700", iconBg: "bg-indigo-50" },
              { label: "STAT Cases", value: stat, icon: Zap, cls: "text-red-700", iconBg: "bg-red-50" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.iconBg}`}>
                    <k.icon className={`h-4 w-4 ${k.cls}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${k.cls}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Status breakdown + Priority distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card shadow-sm p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: "Ordered (Pending)", count: pending, cls: "bg-amber-400", total },
                  { label: "Scheduled", count: scheduled, cls: "bg-blue-400", total },
                  { label: "In Progress", count: inProg, cls: "bg-purple-400", total },
                  { label: "Completed", count: completed, cls: "bg-green-400", total },
                  { label: "Cancelled", count: cancelled, cls: "bg-gray-300", total },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.count} ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className={`h-2 rounded-full ${s.cls}`} style={{ width: `${total > 0 ? (s.count / total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Priority Distribution</h2>
              <div className="space-y-4">
                {priorityStats.map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{p.label}</span>
                      <span className="text-sm font-bold text-foreground">{p.count} <span className="text-xs text-muted-foreground">({p.pct}%)</span></span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted">
                      <div className={`h-3 rounded-full ${p.cls}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{contrastStudies}</p>
                  <p className="text-xs text-muted-foreground">Contrast Studies</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{Array.from(new Set(clinicOrders.map((o) => o.patientId))).length}</p>
                  <p className="text-xs text-muted-foreground">Unique Patients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "modality" && (
        <div className="space-y-4">
          {modalityStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No data yet</p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                <h2 className="text-sm font-bold text-foreground mb-5">Orders by Modality</h2>
                <div className="space-y-3">
                  {modalityStats.map((m) => (
                    <div key={m.modality}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[m.modality]}`}>{m.modality}</span>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="text-green-700">{m.completed} done</span>
                          <span className="text-amber-700">{m.pending} pending</span>
                          {m.stat > 0 && <span className="text-red-700">{m.stat} STAT</span>}
                          <span className="font-bold text-foreground">{m.total} total</span>
                        </div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted">
                        <div className={`h-3 rounded-full ${MODALITY_BAR_COLOR[m.modality]}`} style={{ width: `${(m.total / maxModality) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modality table */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-foreground">Modality</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Total</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Completed</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Pending</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">STAT</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Contrast</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Completion %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {modalityStats.map((m) => (
                        <tr key={m.modality} className="hover:bg-muted/20">
                          <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[m.modality]}`}>{m.modality}</span></td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{m.total}</td>
                          <td className="px-4 py-3 text-right text-green-700 font-medium">{m.completed}</td>
                          <td className="px-4 py-3 text-right text-amber-700 font-medium">{m.pending}</td>
                          <td className="px-4 py-3 text-right text-red-700 font-medium">{m.stat}</td>
                          <td className="px-4 py-3 text-right text-indigo-700 font-medium">{m.contrast}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted">
                                <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${m.total > 0 ? (m.completed / m.total) * 100 : 0}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/20">
                      <tr>
                        <td className="px-4 py-3 text-xs font-bold text-foreground">TOTAL</td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">{total}</td>
                        <td className="px-4 py-3 text-right text-green-700 font-bold">{completed}</td>
                        <td className="px-4 py-3 text-right text-amber-700 font-bold">{pending}</td>
                        <td className="px-4 py-3 text-right text-red-700 font-bold">{stat}</td>
                        <td className="px-4 py-3 text-right text-indigo-700 font-bold">{contrastStudies}</td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">{completionRate}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "referrals" && (
        <div className="space-y-4">
          {referralStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No referral data yet</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                <h2 className="text-sm font-bold text-foreground mb-5">Referrals by Doctor</h2>
                <div className="space-y-3">
                  {referralStats.map((r) => (
                    <div key={r.doctor}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f2d4a] text-white text-[10px] font-bold">
                            {r.doctor.split(" ").slice(-1)[0].charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{r.doctor}</p>
                            <div className="flex gap-1 mt-0.5">
                              {r.modalities.map((m) => <span key={m} className={`text-[9px] px-1 py-0.5 rounded ${MODALITY_COLOR[m]}`}>{m}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {r.stat > 0 && <span className="text-red-700 font-medium">{r.stat} STAT</span>}
                          <span className="text-green-700">{r.completed} done</span>
                          <span className="font-bold text-foreground">{r.total}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted ml-9">
                        <div className="h-2 rounded-full bg-[#0f2d4a]" style={{ width: `${(r.total / maxReferral) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-foreground">Doctor</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Total Orders</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">Completed</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">STAT</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-foreground">% of All Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {referralStats.map((r) => (
                        <tr key={r.doctor} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium text-foreground">{r.doctor}</td>
                          <td className="px-4 py-3 text-right font-semibold">{r.total}</td>
                          <td className="px-4 py-3 text-right text-green-700">{r.completed}</td>
                          <td className="px-4 py-3 text-right text-red-700">{r.stat}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{total > 0 ? Math.round((r.total / total) * 100) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "tat" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-[#0f2d4a]" />
              <h2 className="text-sm font-bold text-foreground">Turnaround Time (TAT) Analysis</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {[
                { label: "Target TAT — STAT", value: "< 30 min", sub: "Order to report", cls: "bg-red-50 border-red-200", badge: "text-red-700" },
                { label: "Target TAT — Urgent", value: "< 4 hrs", sub: "Order to report", cls: "bg-amber-50 border-amber-200", badge: "text-amber-700" },
                { label: "Target TAT — Routine", value: "< 24 hrs", sub: "Order to report", cls: "bg-green-50 border-green-200", badge: "text-green-700" },
              ].map((t) => (
                <div key={t.label} className={`rounded-xl border p-4 ${t.cls}`}>
                  <p className="text-xs text-muted-foreground mb-1">{t.label}</p>
                  <p className={`text-2xl font-bold ${t.badge}`}>{t.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">Department Performance</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Reports Filed", value: reportedCount, icon: FileText },
                  { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle },
                  { label: "Active Studies", value: inProg + scheduled, icon: Activity },
                  { label: "Pending Queue", value: pending, icon: Calendar },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">Note on TAT Data</p>
            <p className="text-xs text-amber-700">Full turnaround time tracking requires DICOM system timestamps. This dashboard shows ERP-side order metrics. Integrate with your PACS/RIS for complete TAT analytics including scan acquisition and image processing times.</p>
          </div>
        </div>
      )}
    </div>
  );
}
