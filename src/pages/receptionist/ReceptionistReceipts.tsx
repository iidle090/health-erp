import React, { useState } from "react";
import { Receipt, Search, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

export function ReceptionistReceipts() {
  const { tickets } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // Clinic isolation: only show receipts for this clinic's tickets
  const paidTickets = tickets.filter((t) =>
    t.paid && t.receiptNo &&
    (user?.role === "superadmin" || (t.clinicId === user?.clinicId))
  );

  const filtered = paidTickets.filter((t) =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    (t.receiptNo ?? "").toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = paidTickets.reduce((acc, t) => {
    const fee = t.visitType === "Emergency" ? 200 : t.visitType === "Follow-up" ? 80 : 150;
    return acc + fee + 25;
  }, 0);

  const methodCounts = paidTickets.reduce<Record<string, number>>((acc, t) => {
    const m = t.paymentMethod ?? "Cash";
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Receipts</h1>
        <p className="text-sm text-muted-foreground mt-1">{paidTickets.length} receipts issued today · Total collected: <strong>${totalCollected.toLocaleString()}</strong></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(methodCounts).map(([method, count]) => (
          <div key={method} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground mt-1">{method}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search receipts, patient, or receipt number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Receipt No.","Ticket","Patient","Visit Type","Consultation Fee","Reg. Fee","Total","Method","Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((t) => {
                const fee = t.visitType === "Emergency" ? 200 : t.visitType === "Follow-up" ? 80 : 150;
                const total = fee + 25;
                return (
                  <tr key={t.ticketNo} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#8B1A2F]">{t.receiptNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.ticketNo}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{t.patientName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.visitType}</td>
                    <td className="px-4 py-3">${fee.toFixed(2)}</td>
                    <td className="px-4 py-3">$25.00</td>
                    <td className="px-4 py-3 font-bold">${total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{t.paymentMethod ?? "Cash"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><Printer className="h-3 w-3" />Print</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Receipt className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No receipts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
