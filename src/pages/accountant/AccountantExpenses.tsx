import React, { useState } from "react";
import { TrendingDown, Plus, Search, X, Filter, ShoppingCart, Wrench, Zap, Users, Package, FlaskConical, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCrossPortal, Expense, ExpenseCategory } from "@/context/CrossPortalStore";

const CATEGORIES: ExpenseCategory[] = [
  "Medicine Purchase", "Lab Equipment", "Medical Supplies",
  "Assets & Machinery", "Staff Salaries", "Utilities", "Maintenance", "Other",
];

const CAT_CFG: Record<ExpenseCategory, { icon: React.ElementType; color: string; bg: string }> = {
  "Medicine Purchase": { icon: Package, color: "text-blue-700", bg: "bg-blue-50" },
  "Lab Equipment": { icon: FlaskConical, color: "text-purple-700", bg: "bg-purple-50" },
  "Medical Supplies": { icon: ShoppingCart, color: "text-green-700", bg: "bg-green-50" },
  "Assets & Machinery": { icon: Laptop, color: "text-orange-700", bg: "bg-orange-50" },
  "Staff Salaries": { icon: Users, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
  "Utilities": { icon: Zap, color: "text-amber-700", bg: "bg-amber-50" },
  "Maintenance": { icon: Wrench, color: "text-gray-700", bg: "bg-gray-100" },
  "Other": { icon: TrendingDown, color: "text-slate-700", bg: "bg-slate-50" },
};

const STATUS_CFG: Record<Expense["status"], string> = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const PAYMENT_METHODS: Expense["paymentMethod"][] = ["Cash", "Bank Transfer", "Cheque", "Card"];

function fmt(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const BLANK_FORM = {
  date: new Date().toISOString().split("T")[0],
  category: "Medicine Purchase" as ExpenseCategory,
  description: "",
  amount: "",
  supplier: "",
  paidBy: "",
  paymentMethod: "Cash" as Expense["paymentMethod"],
  status: "Paid" as Expense["status"],
  notes: "",
};

export function AccountantExpenses() {
  const { toast } = useToast();
  const { expenses, addExpense, updateExpense } = useCrossPortal();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const inp = "w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/30";

  const filtered = expenses.filter(e => {
    const ms = e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.supplier ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "All" || e.category === catFilter;
    const mst = statusFilter === "All" || e.status === statusFilter;
    return ms && mc && mst;
  });

  const totalPaid = expenses.filter(e => e.status === "Paid").reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === "Pending").reduce((s, e) => s + e.amount, 0);
  const thisMonth = expenses.filter(e => e.status === "Paid" && e.date.startsWith(new Date().toISOString().slice(0,7))).reduce((s, e) => s + e.amount, 0);

  const catTotals = CATEGORIES.map(c => ({
    cat: c,
    amount: expenses.filter(e => e.category === c && e.status === "Paid").reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.amount > 0).sort((a,b) => b.amount - a.amount);
  const maxCat = Math.max(...catTotals.map(c => c.amount), 1);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.description || isNaN(amt) || amt <= 0 || !form.paidBy) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const expense: Expense = {
      id: `EXP-${Date.now().toString().slice(-6)}`,
      clinicId: "clinic-001",
      date: form.date,
      category: form.category,
      description: form.description,
      amount: amt,
      currency: "USD",
      supplier: form.supplier || undefined,
      paidBy: form.paidBy,
      paymentMethod: form.paymentMethod,
      status: form.status,
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
    };
    addExpense(expense);
    setForm(BLANK_FORM);
    setShowForm(false);
    toast({ title: "Expense recorded", description: `${expense.category} — ${fmt(amt)}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-[#8B1A2F]" />Expense Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Record and track all hospital expenditures in USD</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
          <Plus className="h-4 w-4" />Record Expense
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Expenses (All)", value: fmt(totalPaid), sub: "Paid expenses", color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]", icon: TrendingDown },
          { label: "This Month", value: fmt(thisMonth), sub: new Date().toLocaleString("default",{month:"long",year:"numeric"}), color: "text-amber-700", bg: "bg-amber-50", icon: Filter },
          { label: "Pending Payment", value: fmt(totalPending), sub: `${expenses.filter(e=>e.status==="Pending").length} records`, color: "text-orange-700", bg: "bg-orange-50", icon: ShoppingCart },
          { label: "Expense Records", value: expenses.length, sub: "All time", color: "text-blue-700", bg: "bg-blue-50", icon: Package },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold text-foreground`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {catTotals.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Expenses by Category</h2>
          <div className="space-y-3">
            {catTotals.map(({ cat, amount }) => {
              const cfg = CAT_CFG[cat];
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{cat}</span>
                      <span className={`text-sm font-bold ${cfg.color}`}>{fmt(amount)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bg.replace("bg-","bg-").replace("-50","-400")}`}
                        style={{ width: `${(amount / maxCat) * 100}%`, background: undefined }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none">
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none">
          {["All","Paid","Pending","Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>{["Date","Category","Description","Supplier","Amount","Method","Paid By","Status",""].map(h =>
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
            )}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(e => {
              const cfg = CAT_CFG[e.category];
              return (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{e.category}</span>
                  </td>
                  <td className="px-4 py-3"><p className="font-medium">{e.description}</p><p className="text-xs text-muted-foreground">{e.id}</p></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.supplier || "—"}</td>
                  <td className="px-4 py-3 font-bold text-[#8B1A2F]">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.paidBy}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CFG[e.status]}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "Pending" && (
                      <button onClick={() => { updateExpense(e.id, { status: "Paid" }); toast({ title: "Expense marked as paid" }); }}
                        className="text-xs text-green-700 hover:underline font-medium">Mark Paid</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <TrendingDown className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No expenses found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Record Expense" to add the first entry.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2"><TrendingDown className="h-5 w-5 text-[#8B1A2F]" />Record Expense</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Date <span className="text-red-500">*</span></label>
                  <input type="date" className={inp} value={form.date} onChange={e => setForm(p=>({...p, date: e.target.value}))} required /></div>
                <div><label className="text-xs font-medium">Category <span className="text-red-500">*</span></label>
                  <select className={inp} value={form.category} onChange={e => setForm(p=>({...p, category: e.target.value as ExpenseCategory}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-medium">Description <span className="text-red-500">*</span></label>
                <input className={inp} value={form.description} onChange={e => setForm(p=>({...p, description: e.target.value}))} placeholder="e.g. Monthly medicine restock" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Amount (USD) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" className={inp} value={form.amount} onChange={e => setForm(p=>({...p, amount: e.target.value}))} placeholder="0.00" required /></div>
                <div><label className="text-xs font-medium">Supplier / Vendor</label>
                  <input className={inp} value={form.supplier} onChange={e => setForm(p=>({...p, supplier: e.target.value}))} placeholder="Supplier name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Paid By <span className="text-red-500">*</span></label>
                  <input className={inp} value={form.paidBy} onChange={e => setForm(p=>({...p, paidBy: e.target.value}))} placeholder="Accountant name" required /></div>
                <div><label className="text-xs font-medium">Payment Method</label>
                  <select className={inp} value={form.paymentMethod} onChange={e => setForm(p=>({...p, paymentMethod: e.target.value as Expense["paymentMethod"]}))}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Status</label>
                  <select className={inp} value={form.status} onChange={e => setForm(p=>({...p, status: e.target.value as Expense["status"]}))}>
                    {["Paid","Pending","Cancelled"].map(s => <option key={s}>{s}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium">Notes</label>
                  <input className={inp} value={form.notes} onChange={e => setForm(p=>({...p, notes: e.target.value}))} placeholder="Optional notes" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
