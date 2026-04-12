import React from "react";
import { DollarSign, FileText, AlertCircle, TrendingUp, TrendingDown, Shield, Receipt, FlaskConical, Pill, Stethoscope, BarChart3 } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { Link } from "wouter";

const PAYMENT_KEY = "health_erp_payments_v2";
interface PaymentRecord {
  id: string; invoiceId: string; patientName: string;
  amount: number; method: string; date: string; ref: string; status: string;
}
function loadPayments(): PaymentRecord[] {
  try { const s = localStorage.getItem(PAYMENT_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

function fmt(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AccountantDashboard() {
  const { invoices, tickets, prescriptions, expenses } = useCrossPortal();
  const { getNotifications } = useNotifications();
  const notifications = getNotifications("accountant");
  const savedPayments = loadPayments();

  const consultationFeeTotal = tickets.filter((t) => t.paid).reduce((a, t) => a + (t.consultationFee || 0), 0);
  const pharmacyTotal = prescriptions.filter((p) => p.status === "Dispensed").reduce((a, p) => a + p.totalAmount, 0);
  const invoiceTotal = invoices.reduce((a, i) => a + i.paidAmount, 0);
  const totalIncome = consultationFeeTotal + pharmacyTotal + invoiceTotal;

  const totalExpenses = expenses.filter(e => e.status === "Paid").reduce((a, e) => a + e.amount, 0);
  const netPL = totalIncome - totalExpenses;
  const outstanding = invoices.reduce((a, i) => a + (i.totalAmount - i.paidAmount), 0);
  const unpaidCount = invoices.filter((i) => i.status === "Unpaid").length;
  const insuranceCount = invoices.filter((i) => i.status === "Insurance").length;

  const incomeSourceTotal = totalIncome || 1;
  const sources = [
    { label: "Consultation Fees", amount: consultationFeeTotal, pct: (consultationFeeTotal / incomeSourceTotal) * 100, icon: Stethoscope, color: "bg-[#8B1A2F]", textColor: "text-[#8B1A2F]", lightBg: "bg-[#fdf2f4]" },
    { label: "Pharmacy Sales", amount: pharmacyTotal, pct: (pharmacyTotal / incomeSourceTotal) * 100, icon: Pill, color: "bg-amber-500", textColor: "text-amber-700", lightBg: "bg-amber-50" },
    { label: "Invoice Payments", amount: invoiceTotal, pct: (invoiceTotal / incomeSourceTotal) * 100, icon: Receipt, color: "bg-orange-400", textColor: "text-orange-700", lightBg: "bg-orange-50" },
  ];

  type TxnEntry = { id: string; label: string; patient: string; amount: number; date: string; type: "consultation" | "pharmacy" | "invoice"; method?: string };
  const consultationTxns: TxnEntry[] = tickets.filter((t) => t.paid).map((t) => ({ id: t.receiptNo || t.ticketNo, label: "Consultation Fee", patient: t.patientName, amount: t.consultationFee || 0, date: t.createdAt, type: "consultation" as const, method: t.paymentMethod || "Cash" }));
  const pharmacyTxns: TxnEntry[] = prescriptions.filter((p) => p.status === "Dispensed").map((p) => ({ id: p.id, label: "Pharmacy Dispensed", patient: p.patientName, amount: p.totalAmount, date: p.date, type: "pharmacy" as const }));
  const invoiceTxns: TxnEntry[] = savedPayments.map((p) => ({ id: p.id, label: "Invoice Payment", patient: p.patientName, amount: p.amount, date: p.date, type: "invoice" as const, method: p.method }));
  const allTxns = [...consultationTxns, ...pharmacyTxns, ...invoiceTxns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const txnTypeCfg: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    consultation: { icon: Stethoscope, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
    pharmacy: { icon: Pill, color: "text-amber-700", bg: "bg-amber-50" },
    invoice: { icon: Receipt, color: "text-orange-700", bg: "bg-orange-50" },
  };

  const statusBadge: Record<string, string> = {
    Paid: "bg-amber-100 text-amber-700", Unpaid: "bg-[#fdf2f4] text-[#8B1A2F]",
    Partial: "bg-orange-100 text-orange-700", Insurance: "bg-blue-100 text-blue-700",
  };

  const expCatTotals = expenses
    .filter(e => e.status === "Paid")
    .reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
  const topExpCats = Object.entries(expCatTotals).sort((a,b) => b[1]-a[1]).slice(0,4);
  const maxExpCat = Math.max(...topExpCats.map(([,v]) => v), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Income, expenses, and profit & loss — all amounts in USD ($)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Income", value: fmt(totalIncome), sub: "All income sources", icon: TrendingUp, color: "text-green-700", bg: "bg-green-50" },
          { label: "Total Expenses", value: fmt(totalExpenses), sub: "Paid expenses", icon: TrendingDown, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Net Profit / Loss", value: fmt(Math.abs(netPL)), sub: netPL >= 0 ? "Profit" : "Loss", icon: BarChart3, color: netPL >= 0 ? "text-green-700" : "text-red-600", bg: netPL >= 0 ? "bg-green-50" : "bg-red-50" },
          { label: "Outstanding", value: fmt(outstanding), sub: `${unpaidCount} unpaid invoices`, icon: FileText, color: "text-amber-700", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className={`text-xs mt-1 font-medium ${s.label === "Net Profit / Loss" ? (netPL >= 0 ? "text-green-600" : "text-red-500") : "text-muted-foreground"}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" />Income by Source</h2>
          {totalIncome === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No income recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.lightBg}`}>
                    <s.icon className={`h-4 w-4 ${s.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                      <span className={`text-sm font-bold ${s.textColor}`}>{fmt(s.amount)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.max(s.pct, s.amount > 0 ? 3 : 0)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between">
                <span className="text-sm font-semibold text-foreground">Total Income</span>
                <span className="text-sm font-bold text-green-700">{fmt(totalIncome)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><TrendingDown className="h-4 w-4 text-[#8B1A2F]" />Expenses by Category</h2>
            <Link href="/accountant/expenses"><span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all</span></Link>
          </div>
          {topExpCats.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <TrendingDown className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Record expenses in the Expenses section.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topExpCats.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{cat}</span>
                    <span className="font-bold text-[#8B1A2F]">{fmt(amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[#8B1A2F]" style={{ width: `${(amount/maxExpCat)*100}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-border/50 flex justify-between text-sm font-semibold">
                <span className="text-foreground">Total Expenses</span>
                <span className="text-[#8B1A2F]">{fmt(totalExpenses)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#8B1A2F]" />Profit & Loss Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-xs font-medium text-green-700 mb-1">Total Income</p>
            <p className="text-xl font-bold text-green-700">{fmt(totalIncome)}</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-xs font-medium text-red-700 mb-1">Total Expenses</p>
            <p className="text-xl font-bold text-red-700">{fmt(totalExpenses)}</p>
          </div>
          <div className={`rounded-lg border p-4 text-center ${netPL >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <p className={`text-xs font-medium mb-1 ${netPL >= 0 ? "text-green-700" : "text-red-700"}`}>{netPL >= 0 ? "Net Profit" : "Net Loss"}</p>
            <p className={`text-xl font-bold ${netPL >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(Math.abs(netPL))}</p>
          </div>
        </div>
        {(totalIncome > 0 || totalExpenses > 0) && (
          <div className="mt-4">
            <div className="flex text-xs text-muted-foreground justify-between mb-1">
              <span>Income vs Expenses</span>
              <span>{totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}% expense ratio</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden flex">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${totalIncome > 0 ? Math.min(((totalIncome - Math.max(totalExpenses-totalIncome,0)) / (totalIncome + totalExpenses)) * 100, 100) : 0}%` }} />
              <div className="h-full bg-red-400 transition-all" style={{ width: `${totalIncome > 0 ? Math.min((totalExpenses / (totalIncome + totalExpenses)) * 100, 100) : 100}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Income</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Expenses</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Recent Transactions</h2>
            <span className="text-xs text-muted-foreground">{allTxns.length} total</span>
          </div>
          <div className="divide-y divide-border/40 overflow-y-auto max-h-[300px]">
            {allTxns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Receipt className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
              </div>
            ) : allTxns.map((txn) => {
              const cfg = txnTypeCfg[txn.type];
              const Icon = cfg.icon;
              return (
                <div key={`${txn.type}-${txn.id}`} className="px-5 py-3 flex items-start gap-3 hover:bg-muted/20">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-muted-foreground">{txn.id}</span>
                      {txn.method && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{txn.method}</span>}
                    </div>
                    <p className="text-sm font-medium text-foreground">{txn.patient}</p>
                    <p className="text-xs text-muted-foreground">{txn.label} · {txn.date.split("T")[0]}</p>
                  </div>
                  <p className="font-bold text-green-700 flex-shrink-0">{fmt(txn.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Recent Invoices</h2>
            <Link href="/accountant/invoices"><span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all</span></Link>
          </div>
          <div className="divide-y divide-border/40 overflow-y-auto max-h-[300px]">
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
              </div>
            ) : invoices.slice(0, 8).map((inv) => (
              <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8B1A2F] font-bold">{inv.id}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[inv.status]}`}>{inv.status}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-0.5">{inv.patientName}</p>
                  <p className="text-xs text-muted-foreground">Due {inv.dueDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground">{fmt(inv.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">Paid: {fmt(inv.paidAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Billing Notifications</h2>
          </div>
          <div className="divide-y divide-border/40">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className={`px-5 py-3 flex items-start gap-3 ${!n.read ? "bg-amber-50/30" : ""}`}>
                <DollarSign className="h-4 w-4 text-[#8B1A2F] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{n.timestamp}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-[#8B1A2F] flex-shrink-0 mt-1.5 ml-auto" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
