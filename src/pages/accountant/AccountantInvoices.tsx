import React, { useState } from "react";
import { Plus, Search, Eye, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrossPortal, Invoice } from "@/context/CrossPortalStore";

const statusBadge: Record<string, string> = {
  Paid: "bg-amber-100 text-amber-700", Unpaid: "bg-[#fdf2f4] text-[#8B1A2F]",
  Partial: "bg-orange-100 text-orange-700", Insurance: "bg-blue-100 text-blue-700",
};

export function AccountantInvoices() {
  const { invoices, addInvoice, updateInvoice } = useCrossPortal();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ patientName: "", patientId: "", dueDate: "", insurance: "", description: "", qty: "1", unitPrice: "" });

  const filtered = invoices.filter((inv) => {
    const ms = inv.patientName.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || inv.status === filter;
    return ms && mf;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(form.qty) * Number(form.unitPrice);
    const newInv: Invoice = {
      id: `INV-${Date.now().toString().slice(-5)}`, patientId: form.patientId, patientName: form.patientName,
      date: new Date().toISOString().split("T")[0], dueDate: form.dueDate,
      items: [{ description: form.description, qty: Number(form.qty), unitPrice: Number(form.unitPrice), total }],
      totalAmount: total, paidAmount: 0, status: "Unpaid",
      insurance: form.insurance || undefined,
    };
    addInvoice(newInv);
    setCreateOpen(false);
    setForm({ patientName: "", patientId: "", dueDate: "", insurance: "", description: "", qty: "1", unitPrice: "" });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">{invoices.length} total · ${invoices.reduce((a, i) => a + i.totalAmount, 0).toLocaleString()} outstanding</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Create Invoice</Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["All","Paid","Unpaid","Partial","Insurance"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Invoice","Patient","Date","Due Date","Total","Paid","Status","Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#8B1A2F] font-bold">{inv.id}</td>
                  <td className="px-5 py-3"><p className="font-medium text-foreground">{inv.patientName}</p>{inv.insurance && <p className="text-xs text-blue-600">{inv.insurance}</p>}</td>
                  <td className="px-5 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{inv.dueDate}</td>
                  <td className="px-5 py-3 font-bold text-foreground">${inv.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">${inv.paidAmount.toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[inv.status]}`}>{inv.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(inv)}><Eye className="h-3.5 w-3.5" /></Button>
                      {inv.status !== "Paid" && <Button size="sm" className="h-7 text-xs px-2" onClick={() => updateInvoice(inv.id, { status: "Paid", paidAmount: inv.totalAmount })}>Mark Paid</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No invoices found.</div>}
        </div>
      </div>

      {/* View invoice modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="flex items-start justify-between bg-[#fdf2f4] px-6 py-4 border-b border-border">
              <div><h3 className="font-bold text-foreground">{selected.id}</h3><p className="text-sm text-muted-foreground">{selected.patientName} · Due {selected.dueDate}</p></div>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[#f0d0d6]"><X className="h-5 w-5 text-[#8B1A2F]" /></button>
            </div>
            <div className="p-5 space-y-3">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3 text-sm">
                  <div><p className="font-medium">{item.description}</p><p className="text-xs text-muted-foreground">Qty {item.qty} × ${item.unitPrice.toFixed(2)}</p></div>
                  <p className="font-bold">${item.total.toFixed(2)}</p>
                </div>
              ))}
              <div className="rounded-lg bg-muted/30 p-3 flex justify-between text-sm font-semibold">
                <span>Total</span><span>${selected.totalAmount.toLocaleString()}</span>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span><span className="font-semibold">${selected.paidAmount.toLocaleString()}</span>
              </div>
              <div className="rounded-lg bg-[#fdf2f4] p-3 flex justify-between text-sm">
                <span className="text-[#8B1A2F] font-medium">Balance Due</span>
                <span className="font-bold text-[#8B1A2F]">${(selected.totalAmount - selected.paidAmount).toLocaleString()}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              {selected.status !== "Paid" && <Button onClick={() => { updateInvoice(selected.id, { status: "Paid", paidAmount: selected.totalAmount }); setSelected(null); }}>Mark as Paid</Button>}
            </div>
          </div>
        </div>
      )}

      {/* Create invoice modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Patient Name *</Label><Input required value={form.patientName} onChange={set("patientName")} /></div>
              <div className="space-y-1.5"><Label>Patient ID</Label><Input value={form.patientId} onChange={set("patientId")} placeholder="PT-XXXXX" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description *</Label><Input required value={form.description} onChange={set("description")} placeholder="e.g. Consultation, Lab Tests" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" min={1} value={form.qty} onChange={set("qty")} /></div>
              <div className="space-y-1.5"><Label>Unit Price ($) *</Label><Input required type="number" step="0.01" value={form.unitPrice} onChange={set("unitPrice")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={set("dueDate")} /></div>
              <div className="space-y-1.5"><Label>Insurance (optional)</Label><Input value={form.insurance} onChange={set("insurance")} placeholder="BlueCross" /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
