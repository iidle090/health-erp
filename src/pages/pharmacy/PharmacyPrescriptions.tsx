import React, { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal, PharmacyPrescription } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

const statusBadge: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Dispensed: "bg-[#fdf2f4] text-[#8B1A2F]",
  Partial: "bg-orange-100 text-orange-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

export function PharmacyPrescriptions() {
  const { prescriptions, updatePrescription } = useCrossPortal();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<PharmacyPrescription | null>(null);

  // Clinic isolation: only show prescriptions from this clinic
  const clinicPrescriptions = prescriptions.filter((p) =>
    user?.role === "superadmin" || (p.clinicId === user?.clinicId)
  );

  const filtered = clinicPrescriptions.filter((p) => {
    const ms = p.patientName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.prescribedBy.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || p.status === filter;
    return ms && mf;
  });

  const handleDispense = (rx: PharmacyPrescription) => {
    updatePrescription(rx.id, { status: "Dispensed" });
    sendNotification({ from: "pharmacy", to: "accountant", type: "invoice", title: `Prescription Dispensed — ${rx.patientName}`, message: `${rx.id} dispensed to ${rx.patientName}. Total: $${rx.totalAmount.toFixed(2)}. Invoice pending.`, data: { rxId: rx.id, amount: rx.totalAmount } });
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prescriptions Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">{clinicPrescriptions.filter((p) => p.status === "Pending").length} pending · {clinicPrescriptions.filter((p) => p.status === "Dispensed").length} dispensed</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search prescriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["All","Pending","Dispensed","Partial","Cancelled"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {filtered.map((rx) => (
            <div key={rx.id} className="p-5 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-[#8B1A2F] font-bold">{rx.id}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadge[rx.status]}`}>{rx.status}</span>
                    {rx.insurance && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{rx.insurance}</span>}
                  </div>
                  <p className="font-semibold text-foreground">{rx.patientName} <span className="text-muted-foreground font-normal text-sm">· {rx.patientId}</span></p>
                  <div className="mt-2 space-y-1">
                    {rx.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8B1A2F] flex-shrink-0" />
                        {item.medication} {item.dosage} · Qty {item.qty} · {item.frequency} · {item.route}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">By {rx.prescribedBy} · {rx.date} · Total: <strong>${rx.totalAmount.toFixed(2)}</strong></p>
                  {rx.notes && <p className="text-xs text-muted-foreground italic mt-1">Note: {rx.notes}</p>}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelected(rx)}><FileText className="h-3.5 w-3.5 mr-1.5" />Details</Button>
                  {rx.status === "Pending" && <Button size="sm" className="text-xs" onClick={() => handleDispense(rx)}>Dispense</Button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No prescriptions found.</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-[#fdf2f4] px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">{selected.id}</h3>
              <p className="text-sm text-muted-foreground">{selected.patientName} · {selected.prescribedBy}</p>
            </div>
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {selected.items.map((item, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{item.medication} {item.dosage}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.frequency} · {item.route} · Qty {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">${(item.qty * item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2 text-sm font-semibold">
                <span>Total Amount</span><span>${selected.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              {selected.status === "Pending" && <Button onClick={() => handleDispense(selected)}>Confirm Dispense</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
