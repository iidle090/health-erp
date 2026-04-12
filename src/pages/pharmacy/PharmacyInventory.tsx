import React, { useState } from "react";
import { Search, Plus, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrossPortal, MedicineItem } from "@/context/CrossPortalStore";

const categoryColors: Record<string, string> = {
  "Cardiovascular": "bg-[#fdf2f4] text-[#8B1A2F]", "Antidiabetic": "bg-amber-100 text-amber-700",
  "Statin": "bg-orange-100 text-orange-700", "Diuretic": "bg-blue-100 text-blue-700",
  "Beta Blocker": "bg-[#fdf2f4] text-[#8B1A2F]", "Antiplatelet": "bg-amber-50 text-amber-800",
  "DMARD": "bg-red-100 text-red-700", "Antidepressant": "bg-purple-100 text-purple-700",
  "Antimigraine": "bg-orange-100 text-orange-700", "Anticonvulsant": "bg-blue-100 text-blue-700",
  "Bronchodilator": "bg-green-100 text-green-700", "Inhaled Corticosteroid": "bg-amber-100 text-amber-700",
  "Vitamin": "bg-green-100 text-green-700",
};

export function PharmacyInventory() {
  const { inventory, updateInventory, addInventoryItem } = useCrossPortal();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MedicineItem | null>(null);
  const [form, setForm] = useState({ name: "", category: "", stock: "", unit: "tabs", reorderLevel: "", expiry: "", price: "", supplier: "", barcode: "" });

  const filtered = inventory.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()) || m.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditItem(null); setForm({ name: "", category: "", stock: "", unit: "tabs", reorderLevel: "", expiry: "", price: "", supplier: "", barcode: "" }); setModalOpen(true); };
  const openEdit = (m: MedicineItem) => {
    setEditItem(m);
    setForm({ name: m.name, category: m.category, stock: String(m.stock), unit: m.unit, reorderLevel: String(m.reorderLevel), expiry: m.expiry, price: String(m.price), supplier: m.supplier, barcode: m.barcode });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateInventory(editItem.id, { name: form.name, category: form.category, stock: Number(form.stock), unit: form.unit, reorderLevel: Number(form.reorderLevel), expiry: form.expiry, price: Number(form.price), supplier: form.supplier, barcode: form.barcode });
    } else {
      addInventoryItem({ id: Date.now(), name: form.name, category: form.category, stock: Number(form.stock), unit: form.unit, reorderLevel: Number(form.reorderLevel), expiry: form.expiry, price: Number(form.price), supplier: form.supplier, barcode: form.barcode });
    }
    setModalOpen(false);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">{inventory.length} medicines · {inventory.filter((m) => m.stock <= m.reorderLevel).length} low stock</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />Add Stock</Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search medicines, category, supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Medicine","Category","Stock","Reorder Level","Expiry","Price","Supplier","Status","Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((m) => {
                const isLow = m.stock <= m.reorderLevel;
                const isOut = m.stock === 0;
                return (
                  <tr key={m.id} className={`hover:bg-muted/20 transition-colors ${isOut ? "bg-red-50/20" : isLow ? "bg-amber-50/20" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.barcode}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[m.category] ?? "bg-gray-100 text-gray-700"}`}>{m.category}</span></td>
                    <td className="px-4 py-3 font-bold text-foreground">{m.stock} <span className="font-normal text-muted-foreground text-xs">{m.unit}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{m.reorderLevel} {m.unit}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.expiry}</td>
                    <td className="px-4 py-3 text-foreground">${m.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{m.supplier}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOut ? "bg-red-100 text-red-700" : isLow ? "bg-amber-100 text-amber-700" : "bg-[#fdf2f4] text-[#8B1A2F]"}`}>
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(m)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No medicines found.</div>}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Edit Inventory Item" : "Add New Stock"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5"><Label>Medicine Name *</Label><Input required value={form.name} onChange={set("name")} placeholder="e.g. Metformin 1000mg" /></div>
              <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={set("category")} placeholder="e.g. Antidiabetic" /></div>
              <div className="space-y-1.5"><Label>Barcode</Label><Input value={form.barcode} onChange={set("barcode")} placeholder="MFM1000" /></div>
              <div className="space-y-1.5"><Label>Stock Quantity</Label><Input type="number" value={form.stock} onChange={set("stock")} placeholder="100" /></div>
              <div className="space-y-1.5"><Label>Unit</Label>
                <select value={form.unit} onChange={set("unit")} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {["tabs","caps","vials","inhalers","mL","g","sachets"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={set("reorderLevel")} placeholder="20" /></div>
              <div className="space-y-1.5"><Label>Unit Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={set("price")} placeholder="0.50" /></div>
              <div className="space-y-1.5"><Label>Expiry Date</Label><Input type="date" value={form.expiry} onChange={set("expiry")} /></div>
              <div className="space-y-1.5"><Label>Supplier</Label><Input value={form.supplier} onChange={set("supplier")} placeholder="Supplier name" /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editItem ? "Save Changes" : "Add to Inventory"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
