import React, { useState } from "react";
import { Package, AlertTriangle, Search, Plus, X, ShoppingCart, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCrossPortal, PurchaseRequest, ExpenseCategory } from "@/context/CrossPortalStore";

type Category = "Pharmacy" | "Laboratory" | "Supplies" | "Equipment";

interface InventoryItem {
  id: string; name: string; category: Category; unit: string;
  currentStock: number; minStock: number; unitCost: number;
  supplier: string; expiryDate?: string; location: string; lastUpdated: string;
}

const ITEMS: InventoryItem[] = [
  { id: "INV-001", name: "Paracetamol 500mg (Strip)", category: "Pharmacy", unit: "Strips", currentStock: 1250, minStock: 300, unitCost: 0.80, supplier: "Phyto-Riker (GIHOC)", expiryDate: "2027-06-30", location: "Pharmacy Store A", lastUpdated: "2026-04-01" },
  { id: "INV-002", name: "Amoxicillin 500mg (Caps)", category: "Pharmacy", unit: "Caps", currentStock: 85, minStock: 200, unitCost: 0.40, supplier: "Ernest Chemists", expiryDate: "2026-08-31", location: "Pharmacy Store A", lastUpdated: "2026-03-28" },
  { id: "INV-003", name: "IV Normal Saline 500ml", category: "Pharmacy", unit: "Bags", currentStock: 320, minStock: 100, unitCost: 4.50, supplier: "Jospong Group", expiryDate: "2027-03-31", location: "Ward Store B", lastUpdated: "2026-04-02" },
  { id: "INV-004", name: "CBC Reagent Pack", category: "Laboratory", unit: "Tests", currentStock: 450, minStock: 100, unitCost: 0.85, supplier: "Sysmex Ltd", expiryDate: "2026-09-30", location: "Lab Cold Storage", lastUpdated: "2026-03-15" },
  { id: "INV-005", name: "Malaria RDT Kits", category: "Laboratory", unit: "Kits", currentStock: 8, minStock: 30, unitCost: 1.80, supplier: "SD Biosensor", expiryDate: "2025-11-30", location: "Lab Shelf 1", lastUpdated: "2026-01-10" },
  { id: "INV-006", name: "Surgical Gloves (Box)", category: "Supplies", unit: "Boxes", currentStock: 45, minStock: 50, unitCost: 12.00, supplier: "Ansell Healthcare", location: "Central Store", lastUpdated: "2026-03-20" },
  { id: "INV-007", name: "N95 Respirators", category: "Supplies", unit: "Pieces", currentStock: 120, minStock: 100, unitCost: 3.50, supplier: "3M Ghana", location: "Central Store", lastUpdated: "2026-04-05" },
  { id: "INV-008", name: "Syringe 5ml (Box/100)", category: "Supplies", unit: "Boxes", currentStock: 60, minStock: 30, unitCost: 8.00, supplier: "BD Medical", location: "Ward Store A", lastUpdated: "2026-04-01" },
  { id: "INV-009", name: "Patient Monitor", category: "Equipment", unit: "Units", currentStock: 12, minStock: 8, unitCost: 4500.00, supplier: "Philips Healthcare", location: "Equipment Room", lastUpdated: "2026-02-01" },
  { id: "INV-010", name: "Pulse Oximeter", category: "Equipment", unit: "Units", currentStock: 3, minStock: 5, unitCost: 180.00, supplier: "Nonin Medical", location: "Equipment Room", lastUpdated: "2026-04-03" },
];

const CAT_COLOR: Record<Category, string> = {
  Pharmacy: "bg-blue-100 text-blue-700",
  Laboratory: "bg-purple-100 text-purple-700",
  Supplies: "bg-green-100 text-green-700",
  Equipment: "bg-orange-100 text-orange-700",
};

const PR_CAT_MAP: Record<Category, ExpenseCategory> = {
  Pharmacy: "Medicine Purchase",
  Laboratory: "Lab Equipment",
  Supplies: "Medical Supplies",
  Equipment: "Assets & Machinery",
};

const STATUS_CFG: Record<PurchaseRequest["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

function stockStatus(i: InventoryItem) {
  if (i.currentStock <= 0) return "Out";
  if (i.currentStock < i.minStock) return "Low";
  if (i.expiryDate && new Date(i.expiryDate) < new Date(Date.now() + 30*24*3600000)) return "Expiring";
  return "OK";
}

const BLANK_PR = { itemName: "", category: "Pharmacy" as Category, quantity: "", unit: "", estimatedCost: "", supplier: "", notes: "" };

export function AdminInventory() {
  const { toast } = useToast();
  const { purchaseRequests, addPurchaseRequest } = useCrossPortal();
  const [tab, setTab] = useState<"inventory"|"requests">("inventory");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"All" | Category>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [pr, setPr] = useState(BLANK_PR);
  const inp = "w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none";

  const displayed = ITEMS.filter(i => {
    const ms = i.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "All" || i.category === catFilter;
    const st = stockStatus(i);
    const mst = statusFilter === "All" || st === statusFilter;
    return ms && mc && mst;
  });

  const lowCount = ITEMS.filter(i => ["Low","Out"].includes(stockStatus(i))).length;
  const expCount = ITEMS.filter(i => stockStatus(i) === "Expiring").length;
  const totalValue = ITEMS.reduce((s, i) => s + i.currentStock * i.unitCost, 0);
  const pendingPR = purchaseRequests.filter(r => r.status === "Pending").length;

  const handlePRSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const qty = parseInt(pr.quantity);
    const cost = parseFloat(pr.estimatedCost);
    if (!pr.itemName || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0 || !pr.unit) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }
    const req: PurchaseRequest = {
      id: `PR-${Date.now().toString().slice(-6)}`,
      clinicId: "clinic-001",
      itemName: pr.itemName,
      category: PR_CAT_MAP[pr.category],
      quantity: qty,
      unit: pr.unit,
      estimatedCost: cost,
      currency: "USD",
      supplier: pr.supplier || undefined,
      requestedBy: "Admin",
      requestedAt: new Date().toISOString(),
      status: "Pending",
      notes: pr.notes || undefined,
    };
    addPurchaseRequest(req);
    setPr(BLANK_PR);
    setShowForm(false);
    toast({ title: "Purchase request submitted", description: `${req.itemName} — $${cost.toFixed(2)} sent to Accountant for approval` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-[#8B1A2F]" />Global Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pharmacy, lab reagents, supplies and equipment — unified view</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setTab("requests"); setShowForm(true); }} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
            <ShoppingCart className="h-4 w-4" />New Purchase Request
          </Button>
          <Button onClick={() => toast({ title: "Export inventory report" })} variant="outline" className="gap-2">Export</Button>
        </div>
      </div>

      {(lowCount > 0 || expCount > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {lowCount > 0 && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3"><AlertTriangle className="h-4 w-4 text-red-600 shrink-0" /><p className="text-sm font-medium text-red-700">{lowCount} item{lowCount > 1 ? "s" : ""} below minimum stock</p></div>}
          {expCount > 0 && <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" /><p className="text-sm font-medium text-amber-700">{expCount} item{expCount > 1 ? "s" : ""} expiring within 30 days</p></div>}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: ITEMS.length, cls: "text-foreground" },
          { label: "Low / Out of Stock", value: lowCount, cls: "text-red-600" },
          { label: "Expiring Soon", value: expCount, cls: "text-amber-600" },
          { label: "Purchase Requests", value: pendingPR > 0 ? `${pendingPR} pending` : purchaseRequests.length, cls: pendingPR > 0 ? "text-amber-600" : "text-foreground" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-border">
        <button onClick={() => setTab("inventory")} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab==="inventory" ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Inventory</button>
        <button onClick={() => setTab("requests")} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab==="requests" ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Purchase Requests
          {pendingPR > 0 && <span className="bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{pendingPR}</span>}
        </button>
      </div>

      {tab === "inventory" && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {(["Pharmacy","Laboratory","Supplies","Equipment"] as Category[]).map(cat => {
              const items = ITEMS.filter(i => i.category === cat);
              const val = items.reduce((s,i) => s + i.currentStock*i.unitCost, 0);
              const low = items.filter(i => ["Low","Out"].includes(stockStatus(i))).length;
              return (
                <button key={cat} onClick={() => setCatFilter(cat === catFilter ? "All" : cat)} className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${catFilter === cat ? "border-[#8B1A2F] bg-[#fdf2f4]" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLOR[cat]}`}>{cat}</span>
                    {low > 0 && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                  </div>
                  <p className="text-xl font-bold text-foreground">{items.length}</p>
                  <p className="text-xs text-muted-foreground">${Math.round(val).toLocaleString()} est. value</p>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory…" className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none">
              {["All","OK","Low","Out","Expiring"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{["Item","Category","Stock","Min","Unit Cost (USD)","Supplier","Location","Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayed.map(i => {
                  const st = stockStatus(i);
                  const stCls = { OK: "bg-green-50 text-green-700", Low: "bg-amber-50 text-amber-700", Out: "bg-red-50 text-red-700", Expiring: "bg-orange-50 text-orange-700" }[st] ?? "";
                  return (
                    <tr key={i.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3"><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{i.id}</p></td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLOR[i.category]}`}>{i.category}</span></td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{i.currentStock} <span className="text-muted-foreground font-normal text-xs">{i.unit}</span></p>
                        <div className="mt-1 h-1.5 bg-muted rounded-full w-20 overflow-hidden">
                          <div className={`h-full rounded-full ${st === "Out" ? "bg-red-500" : st === "Low" ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${Math.min((i.currentStock / Math.max(i.minStock*3,1))*100,100)}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{i.minStock}</td>
                      <td className="px-4 py-3 font-mono text-sm">${i.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{i.supplier}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{i.location}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${stCls}`}>{st}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {displayed.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No items found</div>}
          </div>
        </>
      )}

      {tab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{purchaseRequests.length} total requests · {pendingPR} awaiting accountant approval</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />New Request
            </Button>
          </div>

          {purchaseRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No purchase requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create a request — the Accountant will approve and record the expense.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>{["Request ID","Item","Category","Qty","Est. Cost (USD)","Supplier","Requested By","Date","Status"].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  )}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchaseRequests.map(r => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-[#8B1A2F]">{r.id}</td>
                      <td className="px-4 py-3 font-medium">{r.itemName}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.category}</span></td>
                      <td className="px-4 py-3">{r.quantity} {r.unit}</td>
                      <td className="px-4 py-3 font-bold text-[#8B1A2F]">${r.estimatedCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.supplier || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.requestedBy}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.requestedAt.split("T")[0]}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CFG[r.status]}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-[#8B1A2F]" />New Purchase Request</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              This request will be sent to the Accountant for payment approval. The expense will be recorded automatically upon approval.
            </p>
            <form onSubmit={handlePRSubmit} className="space-y-3">
              <div><label className="text-xs font-medium">Item Name <span className="text-red-500">*</span></label>
                <input className={inp} value={pr.itemName} onChange={e => setPr(p=>({...p, itemName: e.target.value}))} placeholder="e.g. Surgical Gloves (Box)" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Category</label>
                  <select className={inp} value={pr.category} onChange={e => setPr(p=>({...p, category: e.target.value as Category}))}>
                    {(["Pharmacy","Laboratory","Supplies","Equipment"] as Category[]).map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium">Unit <span className="text-red-500">*</span></label>
                  <input className={inp} value={pr.unit} onChange={e => setPr(p=>({...p, unit: e.target.value}))} placeholder="e.g. Boxes, Units" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Quantity <span className="text-red-500">*</span></label>
                  <input type="number" min="1" className={inp} value={pr.quantity} onChange={e => setPr(p=>({...p, quantity: e.target.value}))} required /></div>
                <div><label className="text-xs font-medium">Est. Cost (USD) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" className={inp} value={pr.estimatedCost} onChange={e => setPr(p=>({...p, estimatedCost: e.target.value}))} placeholder="0.00" required /></div>
              </div>
              <div><label className="text-xs font-medium">Preferred Supplier</label>
                <input className={inp} value={pr.supplier} onChange={e => setPr(p=>({...p, supplier: e.target.value}))} placeholder="Supplier name (optional)" /></div>
              <div><label className="text-xs font-medium">Notes</label>
                <input className={inp} value={pr.notes} onChange={e => setPr(p=>({...p, notes: e.target.value}))} placeholder="Additional notes" /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
