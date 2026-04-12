import React, { useState } from "react";
import { ShoppingCart, CheckCircle2, X, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCrossPortal, PurchaseRequest, Expense } from "@/context/CrossPortalStore";

const STATUS_CFG: Record<PurchaseRequest["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

function fmt(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AccountantPurchaseApprovals() {
  const { toast } = useToast();
  const { purchaseRequests, updatePurchaseRequest, addExpense } = useCrossPortal();
  const [filter, setFilter] = useState("All");

  const displayed = filter === "All" ? purchaseRequests : purchaseRequests.filter(r => r.status === filter);
  const pendingCount = purchaseRequests.filter(r => r.status === "Pending").length;
  const totalPending = purchaseRequests.filter(r => r.status === "Pending").reduce((s, r) => s + r.estimatedCost, 0);
  const totalPaid = purchaseRequests.filter(r => r.status === "Paid").reduce((s, r) => s + r.estimatedCost, 0);

  const handleApproveAndPay = (req: PurchaseRequest) => {
    const expense: Expense = {
      id: `EXP-PR-${Date.now().toString().slice(-6)}`,
      clinicId: req.clinicId,
      date: new Date().toISOString().split("T")[0],
      category: req.category,
      description: `Purchase: ${req.itemName} (×${req.quantity} ${req.unit})`,
      amount: req.estimatedCost,
      currency: "USD",
      supplier: req.supplier,
      paidBy: "Accountant",
      paymentMethod: "Bank Transfer",
      status: "Paid",
      notes: req.notes,
      linkedPurchaseRequestId: req.id,
      createdAt: new Date().toISOString(),
    };
    addExpense(expense);
    updatePurchaseRequest(req.id, {
      status: "Paid",
      approvedBy: "Accountant",
      approvedAt: new Date().toISOString(),
    });
    toast({
      title: "Purchase approved & paid",
      description: `${req.itemName} — ${fmt(req.estimatedCost)} recorded as expense`,
    });
  };

  const handleReject = (req: PurchaseRequest) => {
    updatePurchaseRequest(req.id, { status: "Rejected" });
    toast({ title: "Purchase request rejected" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-[#8B1A2F]" />Purchase Approvals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve purchase requests from Admin. Approvals are automatically recorded as expenses.</p>
      </div>

      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm font-bold text-amber-700">{pendingCount} purchase request{pendingCount > 1 ? "s" : ""} awaiting your approval — {fmt(totalPending)} total</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Approval", value: pendingCount, sub: fmt(totalPending), color: "text-amber-600" },
          { label: "Total Paid", value: purchaseRequests.filter(r=>r.status==="Paid").length, sub: fmt(totalPaid), color: "text-green-700" },
          { label: "Total Requests", value: purchaseRequests.length, sub: "All time", color: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <p className="text-xs font-medium text-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All","Pending","Approved","Paid","Rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter===f ? "bg-[#8B1A2F] text-white border-[#8B1A2F]" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No purchase requests {filter !== "All" ? `with status "${filter}"` : "yet"}</p>
          <p className="text-xs text-muted-foreground mt-1">Admin creates requests from the Inventory module.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(req => (
            <div key={req.id} className={`rounded-xl border bg-card p-4 ${req.status === "Pending" ? "border-amber-200" : "border-border"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#8B1A2F] font-bold">{req.id}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CFG[req.status]}`}>{req.status}</span>
                  </div>
                  <p className="font-semibold text-foreground">{req.itemName}</p>
                  <p className="text-xs text-muted-foreground">{req.quantity} {req.unit} · {req.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#8B1A2F]">{fmt(req.estimatedCost)}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div><span className="text-muted-foreground">Supplier: </span><span className="font-medium">{req.supplier || "Not specified"}</span></div>
                <div><span className="text-muted-foreground">Requested by: </span><span className="font-medium">{req.requestedBy}</span></div>
                <div><span className="text-muted-foreground">Date: </span><span className="font-medium">{req.requestedAt.split("T")[0]}</span></div>
              </div>

              {req.notes && <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-3">{req.notes}</p>}

              {req.status === "Paid" && req.approvedAt && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />Approved & paid by {req.approvedBy} on {req.approvedAt.split("T")[0]} — expense recorded automatically
                </p>
              )}

              {req.status === "Pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApproveAndPay(req)} className="bg-green-600 hover:bg-green-700 text-white gap-1 h-8 text-xs">
                    <DollarSign className="h-3.5 w-3.5" />Approve & Pay
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(req)} className="text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs">
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
