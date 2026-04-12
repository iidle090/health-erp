import React, { useState } from "react";
import { FlaskConical, AlertTriangle, Plus, Search, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LabReagent {
  id: string; name: string; category: string; unit: string;
  currentStock: number; minStock: number; maxStock: number;
  expiryDate: string; supplier: string; lotNumber: string; location: string;
  unitCost: number; lastRestocked: string;
}

const LAB_INV_KEY = "health_erp_lab_inventory_v1";
function load(): LabReagent[] { try { const s = localStorage.getItem(LAB_INV_KEY); return s ? JSON.parse(s) : INITIAL; } catch { return INITIAL; } }
function save(d: LabReagent[]) { try { localStorage.setItem(LAB_INV_KEY, JSON.stringify(d)); } catch {} }

const INITIAL: LabReagent[] = [
  { id: "LR-001", name: "Complete Blood Count Reagent", category: "Hematology", unit: "Tests", currentStock: 450, minStock: 100, maxStock: 600, expiryDate: "2026-09-30", supplier: "Sysmex Ltd", lotNumber: "SY2024-1A", location: "Cold Storage A", unitCost: 0.85, lastRestocked: "2026-03-15" },
  { id: "LR-002", name: "HbA1c Reagent Kit", category: "Chemistry", unit: "Tests", currentStock: 45, minStock: 50, maxStock: 200, expiryDate: "2026-06-30", supplier: "Bio-Rad", lotNumber: "BR-HB-2024", location: "Cold Storage B", unitCost: 3.20, lastRestocked: "2026-02-20" },
  { id: "LR-003", name: "Liver Function Test Panel", category: "Chemistry", unit: "Tests", currentStock: 120, minStock: 80, maxStock: 300, expiryDate: "2026-12-31", supplier: "Roche Diagnostics", lotNumber: "RC-LFT-01", location: "Room Temp Shelf 2", unitCost: 1.50, lastRestocked: "2026-04-01" },
  { id: "LR-004", name: "Malaria RDT Kits", category: "Microbiology", unit: "Kits", currentStock: 8, minStock: 30, maxStock: 150, expiryDate: "2025-11-30", supplier: "SD Biosensor", lotNumber: "SD-MAL-23", location: "Ambient Shelf 1", unitCost: 1.80, lastRestocked: "2026-01-10" },
  { id: "LR-005", name: "Urine Dipstick Strips", category: "Urinalysis", unit: "Strips", currentStock: 200, minStock: 100, maxStock: 500, expiryDate: "2026-08-31", supplier: "Siemens Healthineers", lotNumber: "SI-UD-24B", location: "Ambient Shelf 3", unitCost: 0.40, lastRestocked: "2026-03-01" },
  { id: "LR-006", name: "Troponin I Rapid Test", category: "Cardiac", unit: "Tests", currentStock: 12, minStock: 20, maxStock: 80, expiryDate: "2026-04-30", supplier: "Abbott Diagnostics", lotNumber: "AB-TPN-24", location: "Cold Storage A", unitCost: 8.50, lastRestocked: "2026-02-14" },
  { id: "LR-007", name: "Blood Culture Bottles (Aerobic)", category: "Microbiology", unit: "Bottles", currentStock: 60, minStock: 40, maxStock: 120, expiryDate: "2026-10-31", supplier: "BD Diagnostics", lotNumber: "BD-BC-24A", location: "Incubator Shelf", unitCost: 2.20, lastRestocked: "2026-03-20" },
  { id: "LR-008", name: "Gram Stain Kit", category: "Microbiology", unit: "Tests", currentStock: 180, minStock: 50, maxStock: 300, expiryDate: "2027-01-31", supplier: "Sigma-Aldrich", lotNumber: "SA-GS-24", location: "Room Temp Shelf 1", unitCost: 0.60, lastRestocked: "2026-04-05" },
];

const CAT_COLORS: Record<string, string> = {
  Hematology: "bg-red-100 text-red-700", Chemistry: "bg-blue-100 text-blue-700",
  Microbiology: "bg-green-100 text-green-700", Urinalysis: "bg-yellow-100 text-yellow-700",
  Cardiac: "bg-purple-100 text-purple-700", Immunology: "bg-pink-100 text-pink-700",
};

function stockStatus(r: LabReagent) {
  if (r.currentStock <= 0) return "Out";
  if (r.currentStock < r.minStock) return "Low";
  if (new Date(r.expiryDate) < new Date(Date.now() + 30 * 24 * 3600000)) return "Expiring";
  return "OK";
}

export function LabInventory() {
  const { toast } = useToast();
  const [reagents, setReagents] = useState<LabReagent[]>(load);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(0);

  const save_ = (d: LabReagent[]) => { save(d); setReagents(d); };
  const categories = ["All", ...Array.from(new Set(reagents.map(r => r.category)))];

  const displayed = reagents.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || r.category === catFilter;
    const st = stockStatus(r);
    const matchStatus = statusFilter === "All" || st === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const lowStock = reagents.filter(r => stockStatus(r) === "Low" || stockStatus(r) === "Out").length;
  const expiring = reagents.filter(r => stockStatus(r) === "Expiring").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-[#8B1A2F]" />Lab Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reagents, kits, supplies — stock & expiry management</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2"><Plus className="h-4 w-4" />Add Reagent</Button>
      </div>

      {/* Alerts */}
      {(lowStock > 0 || expiring > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {lowStock > 0 && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3"><AlertTriangle className="h-4 w-4 text-red-600" /><p className="text-sm font-medium text-red-700">{lowStock} item{lowStock > 1 ? "s" : ""} below minimum stock</p></div>}
          {expiring > 0 && <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"><AlertTriangle className="h-4 w-4 text-amber-600" /><p className="text-sm font-medium text-amber-700">{expiring} item{expiring > 1 ? "s" : ""} expiring within 30 days</p></div>}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: reagents.length, cls: "text-foreground" },
          { label: "Low Stock", value: reagents.filter(r => stockStatus(r) === "Low").length, cls: "text-amber-600" },
          { label: "Out of Stock", value: reagents.filter(r => stockStatus(r) === "Out").length, cls: "text-red-600" },
          { label: "Expiring Soon", value: expiring, cls: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reagents…" className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none">
          {["All","OK","Low","Out","Expiring"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>{["Reagent","Category","Stock","Expiry","Supplier","Status","Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayed.map(r => {
              const st = stockStatus(r);
              const stCls = { OK: "bg-green-50 text-green-700", Low: "bg-amber-50 text-amber-700", Out: "bg-red-50 text-red-700", Expiring: "bg-orange-50 text-orange-700" }[st] ?? "";
              const stockPct = Math.min((r.currentStock / r.maxStock) * 100, 100);
              return (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">Lot: {r.lotNumber} · {r.location}</p>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[r.category] ?? "bg-gray-100 text-gray-600"}`}>{r.category}</span></td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.currentStock} <span className="text-muted-foreground font-normal">{r.unit}</span></p>
                    <div className="mt-1 h-1.5 bg-muted rounded-full w-24 overflow-hidden">
                      <div className={`h-full rounded-full ${st === "Out" ? "bg-red-500" : st === "Low" ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${stockPct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Min: {r.minStock}</p>
                  </td>
                  <td className="px-4 py-3"><p className="text-sm">{r.expiryDate}</p><p className="text-xs text-muted-foreground">{r.supplier}</p></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.supplier}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${stCls}`}>{st}</span></td>
                  <td className="px-4 py-3">
                    {restockId === r.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} className="w-16 rounded border border-border px-2 py-1 text-xs" placeholder="Qty" />
                        <Button size="sm" onClick={() => { const u = reagents.map(x => x.id === r.id ? { ...x, currentStock: x.currentStock + restockQty, lastRestocked: new Date().toISOString().split("T")[0] } : x); save_(u); setRestockId(null); toast({ title: "Restocked!" }); }} className="bg-green-600 hover:bg-green-700 text-white text-xs h-7">OK</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRestockId(null)} className="h-7 text-xs">✕</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setRestockId(r.id); setRestockQty(r.minStock); }} className="text-xs h-7">Restock</Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayed.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No reagents found</div>}
      </div>
    </div>
  );
}
