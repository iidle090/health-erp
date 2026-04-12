import React, { useState } from "react";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  { id: 1, name: "Starter", price: 299, period: "mo", clinics: 1, users: 20, storage: "10GB", portals: ["Admin", "Doctor", "Nurse"], support: "Email", color: "border-border", badge: "" },
  { id: 2, name: "Professional", price: 699, period: "mo", clinics: 3, users: 80, storage: "50GB", portals: ["Admin", "Doctor", "Nurse", "Lab", "Pharmacy"], support: "Priority Email + Phone", color: "border-[#8B1A2F]", badge: "Most Popular" },
  { id: 3, name: "Enterprise", price: 1499, period: "mo", clinics: 10, users: 300, storage: "500GB", portals: ["Admin", "Doctor", "Nurse", "Lab", "Pharmacy", "Accountant", "Super Admin"], support: "24/7 Dedicated", color: "border-[#ebc325]", badge: "Full Access" },
];

const activeSubscriptions = [
  { clinic: "City General Hospital", plan: "Enterprise", renewal: "2025-05-01", status: "Active", amount: 1499 },
  { clinic: "Metro Health Center", plan: "Professional", renewal: "2025-05-10", status: "Active", amount: 699 },
  { clinic: "Sunrise Medical Clinic", plan: "Professional", renewal: "2025-05-22", status: "Active", amount: 699 },
  { clinic: "Valley Family Practice", plan: "Starter", renewal: "2025-04-30", status: "Trial", amount: 0 },
  { clinic: "Harbor Wellness Center", plan: "Starter", renewal: "—", status: "Suspended", amount: 0 },
];

export function SuperBillingPlans() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage subscription plans and clinic billing</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div key={p.id} className={`rounded-2xl border-2 ${p.color} bg-card p-6 relative shadow-sm`}>
            {p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#8B1A2F] text-white text-xs font-semibold flex items-center gap-1">
                <Crown className="h-3 w-3" />{p.badge}
              </span>
            )}
            <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-foreground">${p.price}</span>
              <span className="text-muted-foreground text-sm">/{p.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {[`Up to ${p.clinics} clinic${p.clinics > 1 ? "s" : ""}`, `${p.users} users`, `${p.storage} storage`, `${p.portals.join(", ")} portals`, `${p.support} support`].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-[#8B1A2F] flex-shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Button variant={p.badge === "Most Popular" ? "default" : "outline"} className="w-full">Edit Plan</Button>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Active Subscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Clinic","Plan","Renewal Date","Monthly Amount","Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {activeSubscriptions.map((s) => (
                <tr key={s.clinic} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{s.clinic}</td>
                  <td className="px-5 py-3"><span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{s.plan}</span></td>
                  <td className="px-5 py-3 text-muted-foreground font-mono">{s.renewal}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{s.amount > 0 ? `$${s.amount}` : "—"}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.status === "Active" ? "bg-amber-100 text-amber-700" : s.status === "Trial" ? "bg-[#fdf2f4] text-[#8B1A2F]" : "bg-gray-100 text-gray-500"}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
