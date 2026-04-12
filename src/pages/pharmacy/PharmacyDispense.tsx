import React, { useState } from "react";
import { PackageCheck, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal, PharmacyPrescription } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

export function PharmacyDispense() {
  const { prescriptions, updatePrescription, updateInventory, inventory } = useCrossPortal();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"search" | "confirm" | "done">("search");
  const [selected, setSelected] = useState<PharmacyPrescription | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  // Clinic isolation: only show prescriptions from this clinic
  const clinicPrescriptions = prescriptions.filter((p) =>
    user?.role === "superadmin" || (p.clinicId === user?.clinicId)
  );

  const pending = clinicPrescriptions.filter((p) => p.status === "Pending" && (
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase())
  ));

  const handleSelect = (rx: PharmacyPrescription) => {
    setSelected(rx);
    setChecked(Object.fromEntries(rx.items.map((_, i) => [i, false])));
    setStep("confirm");
  };

  const allChecked = selected ? selected.items.every((_, i) => checked[i]) : false;

  const handleConfirm = () => {
    if (!selected) return;
    updatePrescription(selected.id, { status: "Dispensed" });
    selected.items.forEach((item) => {
      const inv = inventory.find((m) => m.name.toLowerCase().startsWith(item.medication.toLowerCase()));
      if (inv) updateInventory(inv.id, { stock: Math.max(0, inv.stock - item.qty) });
    });
    sendNotification({ from: "pharmacy", to: "accountant", type: "invoice", title: `Dispensed — ${selected.patientName}`, message: `${selected.id}: ${selected.items.map((i) => `${i.medication} ${i.dosage}`).join(", ")}. Total: $${selected.totalAmount.toFixed(2)}.`, data: { rxId: selected.id, amount: selected.totalAmount } });
    setStep("done");
  };

  if (step === "done" && selected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-20 w-20 rounded-full bg-[#fdf2f4] flex items-center justify-center">
          <Check className="h-10 w-10 text-[#8B1A2F]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Dispensed Successfully</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">{selected.id} for {selected.patientName} has been dispensed. Accountant has been notified for billing.</p>
        <p className="text-lg font-bold text-foreground">Total: ${selected.totalAmount.toFixed(2)}</p>
        <Button onClick={() => { setStep("search"); setSelected(null); setSearch(""); }}>Dispense Another</Button>
      </div>
    );
  }

  if (step === "confirm" && selected) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Confirm Dispensing</h1>
          <p className="text-sm text-muted-foreground mt-1">Verify each medication before dispensing to patient</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="mb-4 pb-4 border-b border-border/50">
            <p className="font-mono text-sm text-[#8B1A2F] font-bold">{selected.id}</p>
            <p className="font-semibold text-foreground mt-0.5">{selected.patientName} · {selected.patientId}</p>
            <p className="text-xs text-muted-foreground">Prescribed by {selected.prescribedBy} · {selected.date}</p>
            {selected.insurance && <p className="text-xs text-muted-foreground">Insurance: {selected.insurance}</p>}
          </div>
          <div className="space-y-3">
            {selected.items.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${checked[i] ? "border-[#8B1A2F] bg-[#fdf2f4]" : "border-border bg-white hover:border-border/80"}`}
                onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}>
                <div className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 ${checked[i] ? "bg-[#8B1A2F]" : "border-2 border-border"}`}>
                  {checked[i] && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.medication} {item.dosage}</p>
                  <p className="text-xs text-muted-foreground">{item.frequency} · {item.route} · Qty: {item.qty}</p>
                </div>
                <p className="text-sm font-bold text-foreground flex-shrink-0">${(item.qty * item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total Amount</span>
            <span className="text-lg font-bold text-foreground">${selected.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setStep("search")}>Back</Button>
          <Button disabled={!allChecked} onClick={handleConfirm} className="gap-2">
            <PackageCheck className="h-4 w-4" />Confirm & Dispense
          </Button>
        </div>
        {!allChecked && <p className="text-xs text-muted-foreground text-center">Check all medications to confirm dispensing</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dispense Medications</h1>
        <p className="text-sm text-muted-foreground mt-1">Search for pending prescriptions to dispense</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient name, ID, or prescription ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="space-y-3">
          {pending.map((rx) => (
            <div key={rx.id} className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => handleSelect(rx)}>
              <div>
                <div className="flex items-center gap-2 mb-1"><span className="font-mono text-sm text-[#8B1A2F] font-bold">{rx.id}</span><span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span></div>
                <p className="font-medium text-foreground">{rx.patientName}</p>
                <p className="text-xs text-muted-foreground">{rx.items.map((i) => `${i.medication} ${i.dosage}`).join(" · ")}</p>
              </div>
              <Button size="sm" className="flex-shrink-0"><PackageCheck className="h-4 w-4 mr-1.5" />Dispense</Button>
            </div>
          ))}
          {pending.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {search ? "No pending prescriptions match your search." : "No pending prescriptions to dispense."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
