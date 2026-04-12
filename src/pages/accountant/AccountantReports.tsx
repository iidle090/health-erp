import React, { useState } from "react";
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Stethoscope, Pill, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";

const PAYMENT_KEY = "health_erp_payments_v2";
interface PaymentRecord { id: string; invoiceId: string; patientName: string; amount: number; method: string; date: string; }
function loadPayments(): PaymentRecord[] {
  try { const s = localStorage.getItem(PAYMENT_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

function fmt(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AccountantReports() {
  const { invoices, tickets, prescriptions, expenses } = useCrossPortal();
  const savedPayments = loadPayments();
  const [tab, setTab] = useState<"income" | "expenses" | "pl">("pl");

  const consultationTotal = tickets.filter((t) => t.paid).reduce((a, t) => a + (t.consultationFee || 0), 0);
  const pharmacyTotal = prescriptions.filter((p) => p.status === "Dispensed").reduce((a, p) => a + p.totalAmount, 0);
  const invoicePaidTotal = invoices.reduce((a, i) => a + i.paidAmount, 0);
  const totalInvoiced = invoices.reduce((a, i) => a + i.totalAmount, 0);
  const totalOutstanding = totalInvoiced - invoicePaidTotal;
  const totalRevenue = consultationTotal + pharmacyTotal + invoicePaidTotal;
  const collectionRate = totalInvoiced > 0 ? (invoicePaidTotal / totalInvoiced) * 100 : 0;

  const totalExpenses = expenses.filter(e => e.status === "Paid").reduce((a, e) => a + e.amount, 0);
  const netPL = totalRevenue - totalExpenses;

  const paidTickets = tickets.filter((t) => t.paid);
  const dispensedRx = prescriptions.filter((p) => p.status === "Dispensed");

  const methodMap: Record<string, number> = {};
  paidTickets.forEach((t) => { const m = t.paymentMethod || "Cash"; methodMap[m] = (methodMap[m] || 0) + (t.consultationFee || 0); });
  savedPayments.forEach((p) => { methodMap[p.method] = (methodMap[p.method] || 0) + p.amount; });
  const methodEntries = Object.entries(methodMap).sort((a, b) => b[1] - a[1]);
  const methodMax = Math.max(...methodEntries.map((e) => e[1]), 1);

  const incomeSources = [
    { source: "Consultation Fees", amount: consultationTotal, icon: Stethoscope, color: "bg-[#8B1A2F]", note: `${paidTickets.length} paid visits` },
    { source: "Pharmacy Sales", amount: pharmacyTotal, icon: Pill, color: "bg-amber-500", note: `${dispensedRx.length} dispensed Rx` },
    { source: "Invoice Payments", amount: invoicePaidTotal, icon: Receipt, color: "bg-orange-400", note: `${invoices.filter((i) => i.status === "Paid").length} paid invoices` },
  ];
  const incomeMax = Math.max(...incomeSources.map((s) => s.amount), 1);

  const expCatMap = expenses.filter(e => e.status === "Paid").reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const expEntries = Object.entries(expCatMap).sort((a,b) => b[1]-a[1]);
  const expMax = Math.max(...expEntries.map(([,v]) => v), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Income, expenses, and P&L — all amounts in USD ($)</p>
        </div>
        <Button variant="outline" className="gap-1.5 text-xs h-9"><Download className="h-3.5 w-3.5" />Export PDF</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: fmt(totalRevenue), sub: "All income sources", icon: TrendingUp, color: "text-green-700", bg: "bg-green-50" },
          { label: "Total Expenses", value: fmt(totalExpenses), sub: "Paid expenses", icon: TrendingDown, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Net P&L", value: fmt(Math.abs(netPL)), sub: netPL >= 0 ? "Profit" : "Loss", icon: BarChart3, color: netPL >= 0 ? "text-green-700" : "text-red-600", bg: netPL >= 0 ? "bg-green-50" : "bg-red-50" },
          { label: "Collection Rate", value: `${collectionRate.toFixed(1)}%`, sub: "Invoices only", icon: DollarSign, color: "text-amber-700", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className={`text-xs mt-1 ${s.label === "Net P&L" ? (netPL >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium") : "text-muted-foreground"}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-border">
        {([["pl","Profit & Loss"],["income","Income"],["expenses","Expenses"]] as [typeof tab, string][]).map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</button>
        ))}
      </div>

      {tab === "pl" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Profit & Loss Statement</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm font-semibold text-foreground">INCOME</span>
              </div>
              {incomeSources.map(s => (
                <div key={s.source} className="flex justify-between py-1.5 px-2">
                  <span className="text-sm text-muted-foreground">{s.source}</span>
                  <span className="text-sm font-medium text-green-700">{fmt(s.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 px-2 border-t border-border/50 font-semibold">
                <span className="text-sm text-foreground">Total Income</span>
                <span className="text-sm text-green-700">{fmt(totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-2 mt-2 border-b border-border/50">
                <span className="text-sm font-semibold text-foreground">EXPENSES</span>
              </div>
              {expEntries.length === 0 ? (
                <div className="py-3 px-2 text-sm text-muted-foreground">No expenses recorded.</div>
              ) : expEntries.map(([cat, amount]) => (
                <div key={cat} className="flex justify-between py-1.5 px-2">
                  <span className="text-sm text-muted-foreground">{cat}</span>
                  <span className="text-sm font-medium text-[#8B1A2F]">{fmt(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 px-2 border-t border-border/50 font-semibold">
                <span className="text-sm text-foreground">Total Expenses</span>
                <span className="text-sm text-[#8B1A2F]">{fmt(totalExpenses)}</span>
              </div>
              <div className={`flex justify-between py-3 px-3 mt-2 rounded-lg font-bold ${netPL >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <span className={`text-base ${netPL >= 0 ? "text-green-700" : "text-red-700"}`}>{netPL >= 0 ? "NET PROFIT" : "NET LOSS"}</span>
                <span className={`text-base ${netPL >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(Math.abs(netPL))}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Cash Flow Overview</h2>
            <div className="space-y-3">
              {[
                { label: "Cash Inflow (Income)", amount: totalRevenue, color: "bg-green-500", textColor: "text-green-700" },
                { label: "Cash Outflow (Expenses)", amount: totalExpenses, color: "bg-red-400", textColor: "text-red-700" },
                { label: "Outstanding (Uncollected)", amount: totalOutstanding, color: "bg-amber-400", textColor: "text-amber-700" },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{row.label}</span>
                    <span className={`font-bold ${row.textColor}`}>{fmt(row.amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.min((row.amount / Math.max(totalRevenue + totalExpenses, 1)) * 100 * 1.5, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "income" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Revenue by Source</h2>
            {totalRevenue === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No revenue recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomeSources.map((s) => (
                  <div key={s.source} className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <p className="text-sm font-medium text-foreground">{s.source}</p>
                      <p className="text-xs text-muted-foreground">{s.note}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-6 rounded-lg bg-muted overflow-hidden">
                          <div className={`h-full rounded-lg ${s.color} transition-all`} style={{ width: `${Math.max((s.amount / incomeMax) * 100, s.amount > 0 ? 3 : 0)}%` }} />
                        </div>
                        <span className="text-sm font-bold text-foreground w-28 text-right">{fmt(s.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border/50 flex justify-between text-sm font-semibold text-foreground">
                  <span>Total Revenue</span><span className="text-green-700">{fmt(totalRevenue)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card shadow-sm p-5">
              <h2 className="font-semibold text-foreground mb-4">Payment Methods</h2>
              {methodEntries.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center"><Receipt className="h-10 w-10 text-muted-foreground/20 mb-3" /><p className="text-sm text-muted-foreground">No payments recorded.</p></div>
              ) : (
                <div className="space-y-3">
                  {methodEntries.map(([method, amount]) => (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">{method}</span>
                        <span className="font-bold text-foreground">{fmt(amount)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-[#ebc325]" style={{ width: `${(amount / methodMax) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm p-5">
              <h2 className="font-semibold text-foreground mb-4">Invoice Status</h2>
              {invoices.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center"><BarChart3 className="h-10 w-10 text-muted-foreground/20 mb-3" /><p className="text-sm text-muted-foreground">No invoices yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {[{ status:"Paid",color:"bg-[#8B1A2F]",tc:"text-[#8B1A2F]"},{ status:"Unpaid",color:"bg-amber-500",tc:"text-amber-700"},{ status:"Partial",color:"bg-orange-400",tc:"text-orange-700"},{ status:"Insurance",color:"bg-blue-400",tc:"text-blue-600"}].map((s) => {
                    const count = invoices.filter((i) => i.status === s.status).length;
                    const pct = invoices.length > 0 ? (count / invoices.length) * 100 : 0;
                    return (
                      <div key={s.status} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-medium ${s.tc}`}>{s.status}</span>
                          <span className="font-bold text-foreground">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "expenses" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Expenses by Category</h2>
            {expEntries.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <TrendingDown className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expEntries.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <p className="text-sm font-medium text-foreground">{cat}</p>
                      <p className="text-xs text-muted-foreground">{expenses.filter(e=>e.category===cat && e.status==="Paid").length} entries</p>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-6 rounded-lg bg-muted overflow-hidden">
                        <div className="h-full rounded-lg bg-[#8B1A2F] transition-all" style={{ width: `${Math.max((amount/expMax)*100, amount>0?3:0)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-[#8B1A2F] w-28 text-right">{fmt(amount)}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border/50 flex justify-between text-sm font-semibold text-foreground">
                  <span>Total Expenses</span><span className="text-[#8B1A2F]">{fmt(totalExpenses)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <h2 className="font-semibold text-foreground mb-4">Visit &amp; Dispensing Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Patient Visits", value: tickets.length, sub: "All visits registered" },
                { label: "Consultation Fees Collected", value: paidTickets.length, sub: `${fmt(consultationTotal)} total` },
                { label: "Prescriptions Dispensed", value: dispensedRx.length, sub: `${fmt(pharmacyTotal)} total` },
                { label: "Expense Records", value: expenses.length, sub: `${fmt(totalExpenses)} total paid` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/20 border border-border/50 p-4">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs font-medium text-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
