import React, { useState } from "react";
import { CreditCard, CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

export function ReceptionistBilling() {
  const { tickets, updateTicket } = useCrossPortal();
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState("");
  const [method, setMethod] = useState<"Cash" | "Card" | "Mobile Money" | "Insurance">("Cash");
  const [insuranceRef, setInsuranceRef] = useState("");
  const [paid, setPaid] = useState<{ ticketNo: string; receipt: string; amount: number; patient: string } | null>(null);

  // Clinic isolation: only show tickets from this clinic
  const clinicTickets = tickets.filter((t) =>
    user?.role === "superadmin" || (t.clinicId === user?.clinicId)
  );
  const unpaidTickets = clinicTickets.filter((t) => !t.paid);

  const selected = clinicTickets.find((t) => t.ticketNo === selectedTicket);
  const fee = selected
    ? selected.visitType === "Emergency" ? 200
    : selected.visitType === "Follow-up" ? 80 : 150
    : 0;
  const regFee = selected ? 25 : 0;
  const total = fee + regFee;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const receiptNo = `RCP-${Date.now().toString().slice(-6)}`;
    updateTicket(selected.ticketNo, { paid: true, paymentMethod: method, receiptNo, status: "Waiting" });
    setPaid({ ticketNo: selected.ticketNo, receipt: receiptNo, amount: total, patient: selected.patientName });
    setSelectedTicket("");
  };

  if (paid) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="bg-[#8B1A2F] px-6 py-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 mx-auto mb-3">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Payment Received</h2>
            <p className="text-white/70 text-sm mt-1">Receipt #{paid.receipt}</p>
          </div>
          <div className="p-6 space-y-3">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{paid.patient}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ticket</span><span className="font-mono font-bold text-[#8B1A2F]">{paid.ticketNo}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span>{method}</span></div>
              <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-semibold">Total Paid</span><span className="font-bold text-lg">${paid.amount.toFixed(2)}</span></div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 text-center">
              Patient <strong>{paid.patient}</strong> can now proceed to the Nurse station.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2"><Printer className="h-4 w-4" />Print Receipt</Button>
              <Button className="flex-1" onClick={() => setPaid(null)}>Next Patient</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Collect consultation fees and generate receipts</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="h-4 w-4 text-[#8B1A2F]" />
          <h2 className="font-semibold text-foreground">Collect Payment</h2>
        </div>

        {unpaidTickets.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">All registered patients have paid. No pending payments.</div>
        ) : (
          <form onSubmit={handlePay} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Select Patient / Ticket *</Label>
              <select required value={selectedTicket} onChange={(e) => setSelectedTicket(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select unpaid ticket...</option>
                {unpaidTickets.map((t) => (
                  <option key={t.ticketNo} value={t.ticketNo}>{t.ticketNo} — {t.patientName} ({t.visitType})</option>
                ))}
              </select>
            </div>

            {selected && (
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{selected.patientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Visit Type</span><span>{selected.visitType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span>{selected.assignedDoctor}</span></div>
                <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">{selected.visitType} Fee</span><span>${fee.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Registration Fee</span><span>${regFee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold border-t border-border/50 pt-1.5 mt-1.5"><span>Total</span><span className="text-[#8B1A2F]">${total.toFixed(2)}</span></div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["Cash", "Card", "Mobile Money", "Insurance"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)} className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${method === m ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "border-border text-muted-foreground hover:border-[#8B1A2F]"}`}>{m}</button>
                ))}
              </div>
            </div>

            {method === "Insurance" && (
              <div className="space-y-1.5"><Label>Insurance Reference No.</Label><Input value={insuranceRef} onChange={(e) => setInsuranceRef(e.target.value)} placeholder="e.g. BC-2025-XXXX" /></div>
            )}

            <Button type="submit" className="w-full h-11 gap-2" disabled={!selectedTicket}>
              <CheckCircle className="h-4 w-4" />Confirm Payment — ${total.toFixed(2)}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
