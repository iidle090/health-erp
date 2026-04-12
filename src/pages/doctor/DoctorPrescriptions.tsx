import React, { useState } from "react";
import { Plus, Pill, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrossPortal, PharmacyPrescription } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

const ROUTES = ["Oral", "IV", "IM", "Subcutaneous", "Inhaled", "Topical", "Sublingual", "PRN"];
const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every 6 hours", "Every 8 hours", "Every 12 hours", "Weekly", "As needed (PRN)", "At bedtime"];

interface RxItem { medication: string; dosage: string; qty: number; route: string; frequency: string; price: number; }

const emptyItem = (): RxItem => ({ medication: "", dosage: "", qty: 30, route: "Oral", frequency: "Once daily", price: 0 });

export function DoctorPrescriptions() {
  const { prescriptions, addPrescription, tickets } = useCrossPortal();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const [selectedTicketNo, setSelectedTicketNo] = useState("");
  const [insurance, setInsurance] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<RxItem[]>([emptyItem()]);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("All");

  // Clinic isolation: only show tickets from this clinic
  const myPatients = tickets.filter((t) =>
    ["Waiting Doctor", "In Consultation", "Completed"].includes(t.status) &&
    (user?.role === "superadmin" || (t.clinicId === user?.clinicId))
  );

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof RxItem, value: string | number) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const reset = () => { setSelectedTicketNo(""); setInsurance(""); setNotes(""); setItems([emptyItem()]); setSubmitted(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = myPatients.find((t) => t.ticketNo === selectedTicketNo);
    if (!ticket) return;
    const validItems = items.filter((it) => it.medication.trim() && it.dosage.trim());
    if (validItems.length === 0) return;
    const total = validItems.reduce((s, it) => s + it.price * it.qty, 0);
    const rx: PharmacyPrescription = {
      id: `RX-${String(prescriptions.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`,
      patientId: ticket.patientId,
      patientName: ticket.patientName,
      prescribedBy: user?.name ?? "Doctor",
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      items: validItems,
      totalAmount: total,
      insurance: insurance || undefined,
      notes: notes || undefined,
      clinicId: ticket.clinicId, // inherit clinic from ticket
    };
    addPrescription(rx);
    sendNotification({
      from: "doctor", to: "pharmacy", type: "prescription",
      title: `New Prescription — ${ticket.patientId}`,
      message: `${user?.name ?? "Doctor"} prescribed ${validItems.map((i) => i.medication).join(", ")} for ${ticket.patientName}.`,
      data: { patientId: ticket.patientId, rxId: rx.id },
    });
    setSubmitted(true);
  };

  // Strict clinic isolation: superadmin sees all, others see only their clinic's prescriptions
  const displayed = prescriptions.filter((rx) =>
    (filter === "All" || rx.status === filter) &&
    (user?.role === "superadmin" || (rx.clinicId === user?.clinicId))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {prescriptions.filter((p) => p.status === "Pending").length} pending · {prescriptions.filter((p) => p.status === "Dispensed").length} dispensed
          </p>
        </div>
        <Button onClick={() => { reset(); setOpen(true); }} className="gap-2" disabled={myPatients.length === 0}>
          <Plus className="h-4 w-4" />New Prescription
        </Button>
      </div>

      {myPatients.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          No patients in your queue yet. Prescriptions can be written once patients arrive from nurse triage.
        </div>
      )}

      <div className="flex gap-2">
        {["All", "Pending", "Dispensed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Pill className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No prescriptions yet</p>
            <p className="text-sm text-muted-foreground mt-2">Write prescriptions for your patients using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  {["Rx ID", "Patient", "Medications", "Date", "Total", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayed.map((rx) => (
                  <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#8B1A2F]">{rx.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{rx.patientName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{rx.patientId}</p>
                    </td>
                    <td className="px-5 py-3">
                      {rx.items.map((it, i) => (
                        <p key={i} className="text-xs"><span className="font-medium">{it.medication}</span> <span className="text-muted-foreground">{it.dosage} · {it.frequency}</span></p>
                      ))}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{rx.date}</td>
                    <td className="px-5 py-3 text-xs font-medium">${rx.totalAmount.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rx.status === "Dispensed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{rx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Prescription</DialogTitle></DialogHeader>
          {submitted ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf2f4]">
                <CheckCircle className="h-7 w-7 text-[#8B1A2F]" />
              </div>
              <p className="font-semibold">Prescription sent to pharmacy!</p>
              <p className="text-sm text-muted-foreground">The pharmacy has been notified and will dispense the medication.</p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                <Button onClick={reset}>Write Another</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Patient *</Label>
                <select value={selectedTicketNo} onChange={(e) => setSelectedTicketNo(e.target.value)} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">— Select patient from your queue —</option>
                  {myPatients.map((t) => (
                    <option key={t.ticketNo} value={t.ticketNo}>{t.patientName} ({t.patientId}) · {t.ticketNo}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Medications *</Label>
                  <button type="button" onClick={addItem} className="text-xs text-[#8B1A2F] hover:underline">+ Add another</button>
                </div>
                <div className="space-y-3">
                  {items.map((it, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs mb-1 block">Medication *</Label>
                          <Input value={it.medication} onChange={(e) => updateItem(i, "medication", e.target.value)} placeholder="e.g. Metformin" required className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Dosage *</Label>
                          <Input value={it.dosage} onChange={(e) => updateItem(i, "dosage", e.target.value)} placeholder="e.g. 1000mg" required className="h-8 text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs mb-1 block">Route</Label>
                          <select value={it.route} onChange={(e) => updateItem(i, "route", e.target.value)} className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                            {ROUTES.map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Frequency</Label>
                          <select value={it.frequency} onChange={(e) => updateItem(i, "frequency", e.target.value)} className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                            {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Qty</Label>
                          <Input type="number" min={1} value={it.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} className="h-8 text-xs" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">Insurance (optional)</Label>
                  <Input value={insurance} onChange={(e) => setInsurance(e.target.value)} placeholder="e.g. BlueCross" className="h-9" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Notes (optional)</Label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Special instructions for pharmacy..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Send to Pharmacy</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
