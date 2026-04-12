import React, { useState } from "react";
import { Building2, Users, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Activity, Search, ChevronDown, FlaskConical, Pill, Package, Eye, Plus, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationStore";
import { useSuperAdmin } from "@/context/SuperAdminStore";
import { useStaffAccounts } from "@/context/StaffAccountStore";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useLocation } from "wouter";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  Active: { label: "Active", cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
  Trial: { label: "Trial", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  Suspended: { label: "Suspended", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

const MODULE_FILTERS = ["All", "Lab Enabled", "Pharmacy Enabled", "Inventory Enabled"];
const SORT_OPTIONS = ["Name (A–Z)", "Doctors (High→Low)", "Status"];

export function SuperDashboard() {
  const { clinics, getDoctorCount, getNurseCount } = useSuperAdmin();
  const { accounts } = useStaffAccounts();
  const { getUnreadCount } = useNotifications();
  const { tickets, prescriptions, invoices, expenses } = useCrossPortal();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Name (A–Z)");
  const alerts = getUnreadCount("superadmin");

  const totalIncome =
    tickets.filter(t => t.paid).reduce((a, t) => a + (t.consultationFee || 0), 0) +
    prescriptions.filter(p => p.status === "Dispensed").reduce((a, p) => a + p.totalAmount, 0) +
    invoices.reduce((a, i) => a + i.paidAmount, 0);
  const totalExpenses = expenses.filter(e => e.status === "Paid").reduce((a, e) => a + e.amount, 0);
  const netPL = totalIncome - totalExpenses;

  // Count all staff (excluding superadmin) — reads from StaffAccountStore which admins populate
  const totalUsers = accounts.filter(a => a.role !== "superadmin").length;
  const activeClinics = clinics.filter((c) => c.status === "Active").length;

  let displayed = clinics.filter((c) => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const mm =
      moduleFilter === "All" ? true :
      moduleFilter === "Lab Enabled" ? c.labEnabled :
      moduleFilter === "Pharmacy Enabled" ? c.pharmacyEnabled :
      moduleFilter === "Inventory Enabled" ? c.inventoryEnabled : true;
    return ms && mm;
  });

  displayed = [...displayed].sort((a, b) => {
    if (sortBy === "Name (A–Z)") return a.name.localeCompare(b.name);
    if (sortBy === "Doctors (High→Low)") return getDoctorCount(b.id) - getDoctorCount(a.id);
    if (sortBy === "Status") return a.status.localeCompare(b.status);
    return 0;
  });

  const growthData = [
    { month: "Nov", clinics: 3, users: 78 }, { month: "Dec", clinics: 3, users: 85 },
    { month: "Jan", clinics: 4, users: 91 }, { month: "Feb", clinics: 4, users: 97 },
    { month: "Mar", clinics: 5, users: 103 }, { month: "Apr", clinics: clinics.length, users: totalUsers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">SaaS platform overview — {clinics.length} clinics registered</p>
        </div>
        <Button onClick={() => navigate("/superadmin/clinics")} className="gap-2">
          <Plus className="h-4 w-4" />Add Clinic
        </Button>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clinics", value: clinics.length, sub: `${activeClinics} active`, icon: Building2, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Global Users", value: totalUsers, sub: "Across all portals", icon: Users, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Active Modules", value: clinics.filter((c) => c.labEnabled || c.pharmacyEnabled).length, sub: "Clinics w/ modules", icon: Activity, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "System Alerts", value: alerts, sub: "Requires attention", icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clinics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {MODULE_FILTERS.map((f) => (
            <button key={f} onClick={() => setModuleFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${moduleFilter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium">
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Clinic cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayed.map((clinic) => {
          const doctors = getDoctorCount(clinic.id);
          const nurses = getNurseCount(clinic.id);
          const cfg = statusConfig[clinic.status];
          return (
            <div key={clinic.id}
              className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:border-[#8B1A2F]/30 overflow-hidden group flex flex-col">
              {/* Card header */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>{clinic.status}</span>
                    </div>
                    <h3 className="font-bold text-foreground text-base mt-1 truncate">{clinic.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{clinic.id}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{clinic.address.split(",").slice(1).join(",").trim()}</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-5 py-3 border-t border-b border-border/40 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#fdf2f4] flex items-center justify-center flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-[#8B1A2F]" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">{doctors}</p>
                    <p className="text-[10px] text-muted-foreground">Doctor{doctors !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">{nurses}</p>
                    <p className="text-[10px] text-muted-foreground">Nurse{nurses !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>

              {/* Modules row */}
              <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mr-1">Modules:</span>
                {[
                  { label: "Lab", icon: FlaskConical, enabled: clinic.labEnabled },
                  { label: "Pharmacy", icon: Pill, enabled: clinic.pharmacyEnabled },
                  { label: "Inventory", icon: Package, enabled: clinic.inventoryEnabled },
                ].map(({ label, icon: Icon, enabled }) => (
                  <span key={label} className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    <Icon className="h-2.5 w-2.5" />{label}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto px-5 pb-4 pt-2">
                <Button
                  size="sm" className="w-full gap-2 group-hover:bg-[#8B1A2F]"
                  onClick={() => navigate(`/superadmin/clinic/${clinic.id}`)}>
                  <Eye className="h-3.5 w-3.5" />View Details
                </Button>
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No clinics found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Global Finance Overview */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-[#8B1A2F]" />
          <h2 className="font-semibold text-foreground">Global Finance Overview</h2>
          <span className="text-xs text-muted-foreground ml-2">All clinics · USD</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Total Income", value: `$${totalIncome.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, icon: TrendingUp, color: "text-green-700", bg: "bg-green-50" },
            { label: "Total Expenses", value: `$${totalExpenses.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, icon: TrendingDown, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
            { label: netPL >= 0 ? "Net Profit" : "Net Loss", value: `$${Math.abs(netPL).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, icon: DollarSign, color: netPL >= 0 ? "text-green-700" : "text-red-600", bg: netPL >= 0 ? "bg-green-50" : "bg-red-50" },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-lg font-bold ${s.color}`}>{s.value}</p></div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Income vs Expenses</p>
          <div className="h-3 rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${totalIncome + totalExpenses > 0 ? (totalIncome / (totalIncome + totalExpenses)) * 100 : 50}%` }} />
            <div className="h-full bg-[#8B1A2F] transition-all" style={{ width: `${totalIncome + totalExpenses > 0 ? (totalExpenses / (totalIncome + totalExpenses)) * 100 : 50}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Income</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#8B1A2F]" />Expenses</span>
          </div>
        </div>
      </div>

      {/* Platform growth chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#8B1A2F]" />
            <h2 className="font-semibold text-foreground">Platform Growth</h2>
          </div>
          <div className="flex items-end gap-3 h-32">
            {growthData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "100px" }}>
                  <div className="flex-1 w-full" />
                  <div className="w-full rounded-t-sm bg-[#8B1A2F]/20" style={{ height: `${(d.users / 110) * 100}%` }} />
                  <div className="w-full rounded-t-sm bg-[#8B1A2F]" style={{ height: `${(d.clinics / 6) * 30}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded bg-[#8B1A2F]" />Clinics</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded bg-[#8B1A2F]/20" />Users</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[#8B1A2F]" />
            <h2 className="font-semibold text-foreground">Module Adoption</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: "Clinic (Core)", count: clinics.length, total: clinics.length, color: "bg-[#8B1A2F]" },
              { name: "Lab Module", count: clinics.filter((c) => c.labEnabled).length, total: clinics.length, color: "bg-amber-500" },
              { name: "Pharmacy Module", count: clinics.filter((c) => c.pharmacyEnabled).length, total: clinics.length, color: "bg-orange-400" },
              { name: "Inventory Module", count: clinics.filter((c) => c.inventoryEnabled).length, total: clinics.length, color: "bg-[#8B1A2F]/60" },
            ].map((m) => (
              <div key={m.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.name}</span>
                  <span className="font-medium text-foreground">{m.count}/{m.total}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.total > 0 ? (m.count / m.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
