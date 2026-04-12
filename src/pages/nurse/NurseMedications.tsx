import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Pill } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const routeColors: Record<string, string> = {
  IV: "bg-[#fdf2f4] text-[#8B1A2F]",
  Oral: "bg-amber-100 text-amber-700",
  Inhaled: "bg-orange-100 text-orange-700",
  PRN: "bg-gray-100 text-gray-600",
};

const statusConfig = {
  Pending:   { cls: "bg-amber-100 text-amber-700",    icon: <Clock className="h-3 w-3" /> },
  Dispensed: { cls: "bg-green-100 text-green-700",    icon: <CheckCircle className="h-3 w-3" /> },
};

export function NurseMedications() {
  const { prescriptions } = useCrossPortal();
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Pending", "Dispensed"];

  // Strict clinic isolation
  const clinicPrescriptions = prescriptions.filter((rx) =>
    user?.role === "superadmin" || (rx.clinicId === user?.clinicId)
  );
  const displayed = clinicPrescriptions.filter((rx) => filter === "All" || rx.status === filter);
  const counts = {
    All: clinicPrescriptions.length,
    Pending: clinicPrescriptions.filter((rx) => rx.status === "Pending").length,
    Dispensed: clinicPrescriptions.filter((rx) => rx.status === "Dispensed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Medication Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Prescriptions ordered by doctors for current patients</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["Pending", "Dispensed", "All"] as const).map((s) => (
          <div key={s} onClick={() => setFilter(filter === s ? "All" : s)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${filter === s ? "border-[#8B1A2F] bg-[#fdf2f4] shadow-sm" : "border-border bg-card"}`}>
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex gap-2 p-4 border-b border-border/50">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Pill className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No prescriptions yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Prescriptions will appear here after a doctor orders medications for a patient during consultation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  {["Patient", "Rx ID", "Medications", "Prescribed By", "Date", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayed.map((rx) => {
                  const sc = statusConfig[rx.status as keyof typeof statusConfig];
                  return (
                    <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{rx.patientName}</p>
                        <p className="text-xs font-mono text-[#8B1A2F]">{rx.patientId}</p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-[#8B1A2F] font-bold">{rx.id}</td>
                      <td className="px-5 py-3">
                        {rx.items.map((item, i) => (
                          <div key={i} className="text-xs text-foreground">
                            <span className="font-medium">{item.medication}</span>
                            <span className="text-muted-foreground"> {item.dosage} — {item.frequency}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{rx.prescribedBy}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{rx.date}</td>
                      <td className="px-5 py-3">
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${sc?.cls ?? "bg-gray-100 text-gray-700"}`}>
                          {sc?.icon}{rx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
