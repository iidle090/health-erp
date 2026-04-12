import React from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

export function LabReports() {
  const { labOrders } = useCrossPortal();
  const { user } = useAuth();

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const completed = clinicOrders.filter((o) => o.status === "Completed" && o.results);

  const totalTests = clinicOrders.reduce((a, o) => a + o.tests.length, 0);
  const abnormal = completed.flatMap((o) => o.results ?? []).filter((r) => r.flag !== "Normal").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Printable lab results and summary reports</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export All</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: clinicOrders.length },
          { label: "Completed", value: completed.length },
          { label: "Total Tests Run", value: totalTests },
          { label: "Abnormal Results", value: abnormal },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Printable report cards */}
      <div className="space-y-4">
        {completed.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-start justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-[#8B1A2F] font-bold">{order.id}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Completed</span>
                </div>
                <p className="font-semibold text-foreground">{order.patientName} · {order.patientId}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ordered by {order.orderedBy} · Completed {order.completedDate}</p>
                {order.sampleId && <p className="text-xs text-muted-foreground">Sample {order.sampleId} · {order.sampleType}</p>}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0"><Printer className="h-3.5 w-3.5" />Print</Button>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Test</th>
                      <th className="text-left pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</th>
                      <th className="text-left pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                      <th className="text-left pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ref. Range</th>
                      <th className="text-left pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {order.results?.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2 font-medium text-foreground">{r.test}</td>
                        <td className="py-2 font-mono font-bold text-foreground">{r.value}</td>
                        <td className="py-2 text-muted-foreground">{r.unit}</td>
                        <td className="py-2 text-muted-foreground">{r.range}</td>
                        <td className="py-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.flag === "Normal" ? "bg-amber-100 text-amber-700" : r.flag === "Abnormal" ? "bg-orange-100 text-orange-700" : "bg-[#fdf2f4] text-[#8B1A2F]"}`}>{r.flag}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(order.results ?? []).some((r) => r.flag !== "Normal") && (
                <div className="mt-4 rounded-lg bg-[#fdf2f4] border border-[#f0d0d6] p-3">
                  <p className="text-xs font-semibold text-[#8B1A2F]">⚠ Abnormal values noted — physician review recommended</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {completed.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
            No completed lab reports yet. Results will appear here after tests are processed.
          </div>
        )}
      </div>
    </div>
  );
}
