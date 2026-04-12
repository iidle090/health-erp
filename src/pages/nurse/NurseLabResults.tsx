import React, { useState } from "react";
import { FlaskConical } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const statusConfig: Record<string, string> = {
  Normal: "bg-amber-100 text-amber-700",
  Abnormal: "bg-orange-100 text-orange-700",
  Critical: "bg-[#fdf2f4] text-[#8B1A2F]",
};

export function NurseLabResults() {
  const { labOrders } = useCrossPortal();
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");

  // Strict clinic isolation then completed filter
  const clinicOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );
  const completedOrders = clinicOrders.filter((o) => o.status === "Completed" && o.results && o.results.length > 0);

  // Flatten all individual test results for display
  const allResults = completedOrders.flatMap((o) =>
    (o.results ?? []).map((r) => ({
      ...r,
      patientName: o.patientName,
      patientId: o.patientId,
      orderId: o.id,
      orderDate: o.completedDate ?? o.orderDate,
    }))
  );

  const displayed = allResults.filter((r) => filter === "All" || r.flag === filter);
  const counts = {
    Normal: allResults.filter((r) => r.flag === "Normal").length,
    Abnormal: allResults.filter((r) => r.flag === "Abnormal").length,
    Critical: allResults.filter((r) => r.flag === "Critical").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lab Results</h1>
        <p className="text-sm text-muted-foreground mt-1">Completed laboratory results for your patients</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["Normal", "Abnormal", "Critical"] as const).map((s) => (
          <div key={s} onClick={() => setFilter(filter === s ? "All" : s)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${filter === s ? "border-[#8B1A2F] shadow-sm" : "border-border"} ${s === "Normal" ? "bg-amber-50" : s === "Abnormal" ? "bg-orange-50" : "bg-[#fdf2f4]"}`}>
            <p className={`text-xs font-medium ${s === "Normal" ? "text-amber-700" : s === "Abnormal" ? "text-orange-700" : "text-[#8B1A2F]"}`}>{s}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <FlaskConical className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No lab results yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Lab results will appear here once the doctor orders tests during consultation and the laboratory enters results.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 p-4 border-b border-border/50">
              {["All", "Normal", "Abnormal", "Critical"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {["Patient", "Test", "Value", "Unit", "Reference Range", "Date", "Result"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {displayed.map((r, i) => (
                    <tr key={i} className={`hover:bg-muted/30 transition-colors ${r.flag === "Critical" ? "bg-[#fdf2f4]/40" : ""}`}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{r.patientName}</p>
                        <p className="text-xs font-mono text-[#8B1A2F]">{r.patientId}</p>
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">{r.test}</td>
                      <td className="px-5 py-3 font-mono text-sm text-foreground">{r.value}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{r.unit || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{r.range || "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{r.orderDate}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[r.flag] ?? "bg-gray-100 text-gray-700"}`}>{r.flag}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
