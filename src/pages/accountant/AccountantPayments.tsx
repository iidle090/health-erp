import React, { useState } from "react";
import { CreditCard, Check, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrossPortal } from "@/context/CrossPortalStore";

const PAYMENT_KEY = "health_erp_payments_v2";

interface PaymentRecord {
  id: string; invoiceId: string; patientName: string;
  amount: number; method: string; date: string; ref: string; status: "Completed" | "Pending";
}

function loadPayments(): PaymentRecord[] {
  try { const s = localStorage.getItem(PAYMENT_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function savePayments(p: PaymentRecord[]) {
  try { localStorage.setItem(PAYMENT_KEY, JSON.stringify(p)); } catch {}
}

const methodColors: Record<string, string> = {
  Cash: "bg-green-100 text-green-700",
  Card: "bg-blue-100 text-blue-700",
  Insurance: "bg-purple-100 text-purple-700",
  "Bank Transfer": "bg-amber-100 text-amber-700",
  Other: "bg-gray-100 text-gray-700",
};

export function AccountantPayments() {
  const { invoices, updateInvoice } = useCrossPortal();
  const [payments, setPayments] = useState<PaymentRecord[]>(loadPayments);
  const [form, setForm] = useState({ invoiceId: "", amount: "", method: "Cash", ref: "" });
  const [submitted, setSubmitted] = useState(false);

  const unpaidInvoices = invoices.filter((inv) => inv.status !== "Paid");
  const selectedInv = invoices.find((i) => i.id === form.invoiceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv) return;
    const paid = Number(form.amount);
    const newPaid = selectedInv.paidAmount + paid;
    const newStatus = newPaid >= selectedInv.totalAmount ? "Paid" : "Partial";
    updateInvoice(form.invoiceId, { paidAmount: newPaid, status: newStatus });

    const record: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-5)}`,
      invoiceId: form.invoiceId,
      patientName: selectedInv.patientName,
      amount: paid,
      method: form.method,
      date: new Date().toISOString().split("T")[0],
      ref: form.ref || `TXN-${Math.floor(Math.random() * 90000 + 10000)}`,
      status: "Completed",
    };
    const updated = [record, ...payments];
    setPayments(updated);
    savePayments(updated);
    setSubmitted(true);
  };

  const reset = () => {
    setForm({ invoiceId: "", amount: "", method: "Cash", ref: "" });
    setSubmitted(false);
  };

  const totalCollected = payments.reduce((a, p) => a + p.amount, 0);
  const todayPayments = payments.filter((p) => p.date === new Date().toISOString().split("T")[0]);
  const todayTotal = todayPayments.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Record and track patient payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: `$${totalCollected.toLocaleString()}`, sub: "All time", color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Today's Payments", value: `$${todayTotal.toLocaleString()}`, sub: `${todayPayments.length} transactions`, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Pending Invoices", value: unpaidInvoices.length, sub: "Awaiting payment", color: "text-orange-700", bg: "bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment form */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-[#8B1A2F]" />
            <h2 className="font-semibold text-foreground">Record Payment</h2>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <div className="h-14 w-14 rounded-full bg-[#fdf2f4] flex items-center justify-center">
                <Check className="h-7 w-7 text-[#8B1A2F]" />
              </div>
              <p className="font-semibold text-foreground">Payment Recorded</p>
              <p className="text-sm text-muted-foreground">Invoice has been updated successfully.</p>
              <Button onClick={reset} size="sm">Record Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Invoice *</Label>
                <select value={form.invoiceId} onChange={(e) => setForm((f) => ({ ...f, invoiceId: e.target.value }))} required className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">— Select invoice —</option>
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.id} — {inv.patientName} (${(inv.totalAmount - inv.paidAmount).toFixed(2)} due)</option>
                  ))}
                </select>
              </div>

              {selectedInv && (
                <div className="rounded-lg bg-muted/30 p-3 text-xs space-y-1">
                  <p><span className="text-muted-foreground">Patient:</span> <strong>{selectedInv.patientName}</strong></p>
                  <p><span className="text-muted-foreground">Total:</span> <strong>${selectedInv.totalAmount.toFixed(2)}</strong> · Paid: ${selectedInv.paidAmount.toFixed(2)} · <span className="text-[#8B1A2F] font-medium">Due: ${(selectedInv.totalAmount - selectedInv.paidAmount).toFixed(2)}</span></p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Amount Paid ($) *</Label>
                  <Input required type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {["Cash", "Card", "Insurance", "Bank Transfer", "Other"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Reference / Transaction ID (optional)</Label>
                <Input value={form.ref} onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))} placeholder="e.g. TXN-12345 or check number" />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={!form.invoiceId || !form.amount}>
                <CreditCard className="h-4 w-4" />Record Payment
              </Button>
            </form>
          )}
        </div>

        {/* Payment history */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#8B1A2F]" />
            <h2 className="font-semibold text-foreground">Payment History</h2>
          </div>
          <div className="divide-y divide-border/40 overflow-y-auto max-h-[400px]">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Receipt className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No payments recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Payments you record will appear here.</p>
              </div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#8B1A2F] font-bold">{p.id}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${methodColors[p.method] ?? "bg-gray-100 text-gray-700"}`}>{p.method}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5">{p.patientName}</p>
                      <p className="text-xs text-muted-foreground">Inv: {p.invoiceId} · {p.date}</p>
                      {p.ref && <p className="text-[10px] text-muted-foreground font-mono">{p.ref}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground">${p.amount.toFixed(2)}</p>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{p.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
