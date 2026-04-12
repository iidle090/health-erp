import React, { useState } from "react";
import { TestTubes, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const sampleTypeBg: Record<string, string> = {
  "Blood — EDTA": "bg-[#fdf2f4] text-[#8B1A2F]",
  "Blood — Serum": "bg-amber-100 text-amber-700",
  "Blood — Heparin": "bg-orange-100 text-orange-700",
  "Breath — Spirometry": "bg-blue-100 text-blue-700",
  "Urine": "bg-amber-50 text-amber-800",
};

const trackingSteps = ["Ordered", "Sample Collected", "In Processing", "Analysis", "Completed"];

export function LabSamples() {
  const { labOrders } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const samplesWithId = clinicOrders.filter((o) => o.sampleId);
  const pending = clinicOrders.filter((o) => !o.sampleId && o.status !== "Cancelled");

  const getStep = (status: string) => {
    if (status === "Completed") return 4;
    if (status === "In Progress") return 2;
    return 1;
  };

  const filtered = [...samplesWithId, ...pending.map((o) => ({ ...o, sampleId: undefined }))].filter((o) =>
    o.patientName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || (o.sampleId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sample Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">{samplesWithId.length} samples collected · {pending.length} awaiting collection</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Samples", value: clinicOrders.length, color: "text-foreground" },
          { label: "Collected", value: samplesWithId.length, color: "text-amber-700" },
          { label: "Awaiting Collection", value: pending.length, color: "text-[#8B1A2F]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by patient, sample ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map((o) => {
            const step = getStep(o.status);
            return (
              <div key={o.id} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TestTubes className="h-4 w-4 text-[#8B1A2F]" />
                      <span className="font-mono text-sm font-bold text-[#8B1A2F]">{o.sampleId ?? "—"}</span>
                      {o.sampleType && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sampleTypeBg[o.sampleType] ?? "bg-gray-100 text-gray-700"}`}>{o.sampleType}</span>}
                    </div>
                    <p className="font-medium text-foreground">{o.patientName} <span className="text-sm text-muted-foreground font-normal">· {o.patientId}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Order: {o.id} · Tests: {o.tests.join(", ")}</p>
                    {o.collectedAt && <p className="text-xs text-muted-foreground">Collected: {o.collectedAt}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${o.priority === "STAT" ? "bg-[#fdf2f4] text-[#8B1A2F]" : o.priority === "Urgent" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>{o.priority}</span>
                </div>
                {/* Tracking steps */}
                <div className="flex items-center gap-0">
                  {trackingSteps.map((s, i) => (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${i <= step ? "bg-[#8B1A2F] border-[#8B1A2F]" : "bg-white border-border"}`}>
                          {i <= step && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[60px] text-center leading-tight">{s}</p>
                      </div>
                      {i < trackingSteps.length - 1 && <div className={`flex-1 h-0.5 mb-4 ${i < step ? "bg-[#8B1A2F]" : "bg-border"}`} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
