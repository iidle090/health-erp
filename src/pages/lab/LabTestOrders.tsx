import React, { useState } from "react";
import { Search, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal, LabOrder } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

const priorityBadge: Record<string, string> = { STAT: "bg-[#fdf2f4] text-[#8B1A2F]", Urgent: "bg-amber-100 text-amber-700", Routine: "bg-gray-100 text-gray-700" };
const statusBadge: Record<string, string> = { Pending: "bg-amber-100 text-amber-700", "In Progress": "bg-orange-100 text-orange-700", Completed: "bg-[#fdf2f4] text-[#8B1A2F]", Cancelled: "bg-gray-100 text-gray-500" };

export function LabTestOrders() {
  const { labOrders, updateLabOrder } = useCrossPortal();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<LabOrder | null>(null);

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const filtered = clinicOrders.filter((o) => {
    const ms = o.patientName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || o.tests.join("").toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || o.status === filter || o.priority === filter;
    return ms && mf;
  });

  const handleAccept = (o: LabOrder) => {
    updateLabOrder(o.id, { status: "In Progress", sampleId: `SMP-${Date.now().toString().slice(-4)}`, sampleType: "Blood — EDTA", collectedAt: new Date().toLocaleString() });
  };

  const handleComplete = (o: LabOrder) => {
    updateLabOrder(o.id, { status: "Completed", completedDate: new Date().toISOString().split("T")[0] });
    sendNotification({ from: "lab", to: "doctor", type: "lab_result", title: `Lab Results Ready — ${o.patientName}`, message: `${o.tests.join(", ")} results for ${o.patientName} (${o.patientId}) are complete. Please review.`, data: { orderId: o.id } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Test Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{clinicOrders.filter((o) => o.status !== "Completed").length} active orders · {clinicOrders.filter((o) => o.priority === "STAT").length} STAT</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by patient, order ID, or test..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All","Pending","In Progress","Completed","STAT","Urgent","Routine"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {filtered.map((o) => (
            <div key={o.id} className={`p-5 hover:bg-muted/20 transition-colors ${o.priority === "STAT" ? "border-l-4 border-l-[#8B1A2F]" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-sm text-[#8B1A2F] font-bold">{o.id}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${priorityBadge[o.priority]}`}>{o.priority}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadge[o.status]}`}>{o.status}</span>
                  </div>
                  <p className="font-semibold text-foreground">{o.patientName} <span className="text-muted-foreground font-normal text-sm">· {o.patientId}</span></p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.tests.map((t) => <span key={t} className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground">{t}</span>)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{o.orderedBy} · {o.orderDate}</p>
                  {o.notes && <p className="text-xs text-muted-foreground mt-1 italic">Note: {o.notes}</p>}
                  {o.sampleId && <p className="text-xs text-muted-foreground mt-1">Sample: {o.sampleId} · {o.sampleType} · Collected {o.collectedAt}</p>}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {o.status === "Pending" && <Button size="sm" className="text-xs" onClick={() => handleAccept(o)}><FlaskConical className="h-3.5 w-3.5 mr-1.5" />Accept & Collect</Button>}
                  {o.status === "In Progress" && <Button size="sm" className="text-xs" onClick={() => handleComplete(o)}>Mark Complete</Button>}
                  {o.status === "Completed" && <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelected(o)}>View Results</Button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No orders match your search.</div>}
        </div>
      </div>

      {/* Results modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-[#fdf2f4] px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">Results — {selected.id}</h3>
              <p className="text-sm text-muted-foreground">{selected.patientName} · {selected.patientId}</p>
            </div>
            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              {selected.results?.map((r, i) => (
                <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div><p className="text-sm font-medium">{r.test}</p><p className="text-xs text-muted-foreground">Range: {r.range}</p></div>
                  <div className="text-right"><p className="font-bold text-foreground">{r.value} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span></p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.flag === "Normal" ? "bg-amber-100 text-amber-700" : r.flag === "Abnormal" ? "bg-orange-100 text-orange-700" : "bg-[#fdf2f4] text-[#8B1A2F]"}`}>{r.flag}</span>
                  </div>
                </div>
              ))}
              {(!selected.results || selected.results.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No results recorded yet.</p>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
