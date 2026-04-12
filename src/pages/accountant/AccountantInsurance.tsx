import React, { useState } from "react";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";

const claims = [
  { id: "CLM-BC-2025-001", invoice: "INV-001", patient: "Michael Chen", insurer: "BlueCross", amount: 315.00, submitted: "2025-04-08", status: "Pending", claimRef: "BC-789456" },
  { id: "CLM-MC-2025-002", invoice: "INV-002", patient: "David Martinez", insurer: "Medicare", amount: 1568.50, submitted: "2025-04-08", status: "Pending", claimRef: "MC-123987" },
  { id: "CLM-AE-2025-003", invoice: "INV-004", patient: "Amanda Foster", insurer: "Aetna", amount: 728.00, submitted: "2025-04-06", status: "Approved", claimRef: "AE-654321" },
  { id: "CLM-BC-2025-004", invoice: "INV-006", patient: "James Kim", insurer: "BlueCross", amount: 420.00, submitted: "2025-04-03", status: "Rejected", claimRef: "BC-321654", reason: "Pre-authorization required" },
];

const statusBadge: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-[#fdf2f4] text-[#8B1A2F]",
  Rejected: "bg-red-100 text-red-700",
  "Partially Paid": "bg-orange-100 text-orange-700",
};

export function AccountantInsurance() {
  const [claimList, setClaimList] = useState(claims);
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = claimList.filter((c) => {
    if (tab === "all") return true;
    return c.status.toLowerCase() === tab;
  });

  const totalPending = claimList.filter((c) => c.status === "Pending").reduce((a, c) => a + c.amount, 0);
  const totalApproved = claimList.filter((c) => c.status === "Approved").reduce((a, c) => a + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance Claims</h1>
          <p className="text-sm text-muted-foreground mt-1">{claimList.length} total claims</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />New Claim</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Claims", value: claimList.filter((c) => c.status === "Pending").length, amount: totalPending, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Approved Claims", value: claimList.filter((c) => c.status === "Approved").length, amount: totalApproved, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Rejected Claims", value: claimList.filter((c) => c.status === "Rejected").length, amount: claimList.filter((c) => c.status === "Rejected").reduce((a, c) => a + c.amount, 0), color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} mb-3`}>
              <Shield className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm font-medium text-foreground">${s.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex border-b border-border/50">
          {(["all","pending","approved","rejected"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map((c) => (
            <div key={c.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#8B1A2F] font-bold">{c.id}</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="font-semibold text-foreground">{c.patient}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Insurer: {c.insurer} · Invoice: {c.invoice} · Submitted: {c.submitted}</p>
                  <p className="text-xs text-muted-foreground font-mono">Claim Ref: {c.claimRef}</p>
                  {"reason" in c && c.reason && <p className="text-xs text-red-600 mt-1">Rejection reason: {c.reason}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-foreground">${c.amount.toLocaleString()}</p>
                  {c.status === "Pending" && (
                    <div className="flex gap-1.5 mt-2 justify-end">
                      <Button size="sm" className="text-xs h-7" onClick={() => setClaimList((prev) => prev.map((cl) => cl.id === c.id ? { ...cl, status: "Approved" } : cl))}>Approve</Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setClaimList((prev) => prev.map((cl) => cl.id === c.id ? { ...cl, status: "Rejected" } : cl))}>Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No claims in this category.</div>}
        </div>
      </div>
    </div>
  );
}
