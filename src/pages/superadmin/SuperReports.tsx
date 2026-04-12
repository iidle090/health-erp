import React from "react";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const monthlyRevenue = [
  { month: "Nov", value: 62000 }, { month: "Dec", value: 71000 }, { month: "Jan", value: 68000 },
  { month: "Feb", value: 74000 }, { month: "Mar", value: 79000 }, { month: "Apr", value: 96800 },
];
const maxRev = Math.max(...monthlyRevenue.map((m) => m.value));

export function SuperReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide analytics and performance metrics</p>
        </div>
        <Button variant="outline">Export PDF</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Platform Revenue (MTD)", value: "$96,800", icon: DollarSign, change: "+22% vs last month", color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Active Users", value: "108", icon: Users, change: "+5 this week", color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Lab Tests Processed", value: "1,240", icon: BarChart3, change: "This month", color: "text-orange-700", bg: "bg-orange-50" },
          { label: "Prescriptions Filled", value: "842", icon: TrendingUp, change: "This month", color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4">Monthly Revenue Trend</h2>
        <div className="flex items-end gap-4 h-40">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-foreground">${(m.value / 1000).toFixed(0)}k</span>
              <div className="w-full rounded-t-lg bg-[#8B1A2F]" style={{ height: `${(m.value / maxRev) * 100}px` }} />
              <span className="text-xs text-muted-foreground">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Portal Usage Breakdown</h2>
          <div className="space-y-3">
            {[
              { portal: "Doctor Portal", sessions: 1248, pct: 35 }, { portal: "Nurse Portal", sessions: 986, pct: 28 },
              { portal: "Lab Portal", sessions: 642, pct: 18 }, { portal: "Pharmacy Portal", sessions: 412, pct: 12 },
              { portal: "Admin Portal", sessions: 198, pct: 6 }, { portal: "Accountant Portal", sessions: 36, pct: 1 },
            ].map((p) => (
              <div key={p.portal} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{p.portal}</span><span className="font-medium">{p.sessions}</span></div>
                <div className="h-1.5 w-full rounded-full bg-muted"><div className="h-full rounded-full bg-[#8B1A2F]" style={{ width: `${p.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Revenue by Clinic</h2>
          <div className="space-y-3">
            {[
              { name: "City General Hospital", rev: 42800, pct: 44 }, { name: "Metro Health Center", rev: 31200, pct: 32 },
              { name: "Sunrise Medical Clinic", rev: 18600, pct: 19 }, { name: "Valley Family Practice", rev: 4200, pct: 5 },
            ].map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{c.name}</span><span className="font-medium">${c.rev.toLocaleString()}</span></div>
                <div className="h-1.5 w-full rounded-full bg-muted"><div className="h-full rounded-full bg-amber-400" style={{ width: `${c.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
