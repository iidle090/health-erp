import React, { useState } from "react";
import { FlaskConical, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

const flagConfig: Record<string, { badge: string; row: string }> = {
  Normal:   { badge: "bg-amber-100 text-amber-700",    row: "" },
  Abnormal: { badge: "bg-orange-100 text-orange-700",  row: "bg-orange-50/30" },
  Critical: { badge: "bg-[#fdf2f4] text-[#8B1A2F]",   row: "bg-[#fdf2f4]/40" },
};

const priorityBadge: Record<string, string> = {
  STAT:    "bg-red-100 text-red-700",
  Urgent:  "bg-[#fdf2f4] text-[#8B1A2F]",
  Routine: "bg-amber-100 text-amber-700",
};

export function DoctorLabResults() {
  const { labOrders } = useCrossPortal();
  const { getNotifications, markRead } = useNotifications();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"All" | "Completed" | "Pending" | "In Progress">("All");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const labNotifications = getNotifications("doctor").filter((n) => n.type === "lab_result");

  // Strict clinic isolation
  const clinicLabOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );
  const filteredOrders = clinicLabOrders.filter((o) => filter === "All" || o.status === filter);

  const completedOrders = clinicLabOrders.filter((o) => o.status === "Completed" && o.results && o.results.length > 0);
  const pendingOrders = clinicLabOrders.filter((o) => o.status === "Pending" || o.status === "In Progress");

  const allResults = completedOrders.flatMap((o) =>
    (o.results ?? []).map((r) => ({ ...r, orderId: o.id, patientName: o.patientName, patientId: o.patientId, orderDate: o.orderDate, completedDate: o.completedDate, priority: o.priority }))
  );

  const criticalCount = allResults.filter((r) => r.flag === "Critical").length;
  const abnormalCount = allResults.filter((r) => r.flag === "Abnormal").length;
  const normalCount = allResults.filter((r) => r.flag === "Normal").length;

  const toggleExpand = (id: string) => setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lab Results</h1>
        <p className="text-sm text-muted-foreground mt-1">Laboratory results from all orders sent to your patients</p>
      </div>

      {/* Unread notifications */}
      {labNotifications.filter((n) => !n.read).length > 0 && (
        <div className="rounded-xl border border-[#f0d0d6] bg-[#fdf2f4] p-4 space-y-2">
          <p className="text-sm font-semibold text-[#8B1A2F] mb-2">New lab results available</p>
          {labNotifications.filter((n) => !n.read).map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-3 bg-white rounded-lg px-3 py-2.5 border border-[#f0d0d6]">
              <div className="flex items-start gap-2">
                <FlaskConical className="h-4 w-4 text-[#8B1A2F] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
              <button onClick={() => markRead(n.id)} className="text-xs text-[#8B1A2F] hover:underline flex-shrink-0 mt-0.5">Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical Results", count: criticalCount, cls: "bg-[#fdf2f4] text-[#8B1A2F] border-[#f0d0d6]" },
          { label: "Abnormal Results", count: abnormalCount, cls: "bg-orange-50 text-orange-700 border-orange-200" },
          { label: "Normal Results", count: normalCount, cls: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "Awaiting Results", count: pendingOrders.length, cls: "bg-blue-50 text-blue-700 border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.cls}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium opacity-80 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["All", "Completed", "In Progress", "Pending"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No lab orders found.</div>
        )}

        {filteredOrders.map((order) => {
          const isOpen = expanded.has(order.id);
          const hasCritical = order.results?.some((r) => r.flag === "Critical");
          const hasAbnormal = order.results?.some((r) => r.flag === "Abnormal");

          return (
            <div key={order.id} className={`rounded-xl border bg-card shadow-sm overflow-hidden ${hasCritical ? "border-[#f0d0d6]" : hasAbnormal ? "border-orange-200" : "border-border"}`}>
              {/* Order header */}
              <div
                className={`flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors ${hasCritical ? "bg-[#fdf2f4]/50" : ""}`}
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 mt-0.5 ${order.status === "Completed" ? "bg-[#fdf2f4]" : "bg-muted"}`}>
                    <FlaskConical className={`h-4 w-4 ${order.status === "Completed" ? "text-[#8B1A2F]" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-[#8B1A2F] font-bold">{order.id}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadge[order.priority]}`}>{order.priority}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.status === "Completed" ? "bg-amber-100 text-amber-700"
                        : order.status === "In Progress" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>{order.status}</span>
                      {hasCritical && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8B1A2F] text-white">⚠ Critical</span>}
                    </div>
                    <p className="font-semibold text-foreground mt-1">{order.patientName} <span className="font-mono text-xs text-muted-foreground">· {order.patientId}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.tests.join(", ")}</p>
                    <p className="text-xs text-muted-foreground">Ordered: {order.orderDate}{order.completedDate ? ` · Completed: ${order.completedDate}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {order.status === "Pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                  {order.status === "Completed" && (
                    isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Results detail */}
              {isOpen && order.status === "Completed" && order.results && (
                <div className="border-t border-border/50">
                  {/* Sample info */}
                  {order.sampleId && (
                    <div className="px-5 py-2.5 bg-muted/20 text-xs text-muted-foreground flex gap-4 flex-wrap">
                      <span>Sample: <strong>{order.sampleId}</strong></span>
                      <span>Type: <strong>{order.sampleType}</strong></span>
                      {order.collectedAt && <span>Collected: <strong>{order.collectedAt}</strong></span>}
                    </div>
                  )}

                  {/* Results table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/10">
                        <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Test</th>
                        <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</th>
                        <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                        <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference Range</th>
                        <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {order.results.map((r, i) => {
                        const cfg = flagConfig[r.flag] ?? flagConfig.Normal;
                        return (
                          <tr key={i} className={`${cfg.row} hover:bg-muted/20`}>
                            <td className="px-5 py-2.5 font-medium text-foreground">{r.test}</td>
                            <td className="px-5 py-2.5 font-mono font-bold text-foreground">{r.value} {r.unit}</td>
                            <td className="px-5 py-2.5 text-muted-foreground text-xs">{r.unit}</td>
                            <td className="px-5 py-2.5 text-muted-foreground text-xs font-mono">{r.range}</td>
                            <td className="px-5 py-2.5">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.badge}`}>{r.flag}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Notes */}
                  {order.notes && (
                    <div className="px-5 py-3 border-t border-border/50 bg-muted/10">
                      <p className="text-xs text-muted-foreground"><span className="font-medium">Clinical Notes:</span> {order.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pending/In Progress state */}
              {isOpen && order.status !== "Completed" && (
                <div className="border-t border-border/50 px-5 py-4 bg-muted/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {order.status === "In Progress"
                        ? "Sample collected — results being processed by the laboratory."
                        : "Order sent to lab — awaiting sample collection."}
                    </span>
                  </div>
                  {order.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{order.notes}"</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
