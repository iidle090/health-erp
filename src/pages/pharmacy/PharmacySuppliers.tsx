import React, { useState } from "react";
import { Plus, Phone, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrossPortal } from "@/context/CrossPortalStore";

const supplierList = [
  { id: 1, name: "MedPharma Inc.", contact: "John Harris", phone: "+1-800-555-0011", email: "orders@medpharma.com", address: "123 Pharma Blvd, NJ 07001", categories: ["Antidiabetic","Diuretic","Vitamin"], status: "Active", leadDays: 3, lastOrder: "2025-04-05" },
  { id: 2, name: "CardioMed", contact: "Sarah Park", phone: "+1-800-555-0022", email: "supply@cardiomed.com", address: "456 Heart Ave, TX 75001", categories: ["Cardiovascular","Beta Blocker"], status: "Active", leadDays: 5, lastOrder: "2025-04-01" },
  { id: 3, name: "GenericPharm", contact: "Tom Baker", phone: "+1-800-555-0033", email: "info@genericpharm.com", address: "789 Generic Rd, CA 90001", categories: ["Antiplatelet"], status: "Active", leadDays: 2, lastOrder: "2025-03-28" },
  { id: 4, name: "RespiCare", contact: "Amy Liu", phone: "+1-800-555-0044", email: "orders@respicare.com", address: "321 Lung St, WA 98001", categories: ["Bronchodilator","Inhaled Corticosteroid"], status: "Active", leadDays: 7, lastOrder: "2025-04-03" },
  { id: 5, name: "NeuroPharma", contact: "David Kim", phone: "+1-800-555-0055", email: "supply@neuropharm.com", address: "654 Brain Blvd, NY 10001", categories: ["Antimigraine","Anticonvulsant"], status: "Active", leadDays: 4, lastOrder: "2025-03-25" },
  { id: 6, name: "RheumaCare", contact: "Lisa Chen", phone: "+1-800-555-0066", email: "orders@rheuma.com", address: "987 Joint Ave, IL 60601", categories: ["DMARD"], status: "Inactive", leadDays: 10, lastOrder: "2025-02-15" },
];

const emptyForm = { name: "", contact: "", phone: "", email: "", address: "", leadDays: "", categories: "" };

export function PharmacySuppliers() {
  const { inventory } = useCrossPortal();
  const [suppliers, setSuppliers] = useState(supplierList);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuppliers((prev) => [...prev, { id: Date.now(), name: form.name, contact: form.contact, phone: form.phone, email: form.email, address: form.address, categories: form.categories.split(",").map((c) => c.trim()), status: "Active", leadDays: Number(form.leadDays), lastOrder: "—" }]);
    setModalOpen(false);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">{suppliers.filter((s) => s.status === "Active").length} active suppliers</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Supplier</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((s) => {
          const itemsSupplied = inventory.filter((m) => m.supplier === s.name).length;
          return (
            <div key={s.id} className={`rounded-xl border bg-card shadow-sm p-5 ${s.status === "Inactive" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.contact}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</span>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" />{s.phone}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" />{s.email}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Package className="h-3.5 w-3.5" />{itemsSupplied} medicines · Lead: {s.leadDays} days</div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {s.categories.map((c) => <span key={c} className="text-[10px] bg-[#fdf2f4] text-[#8B1A2F] px-2 py-0.5 rounded-full font-medium">{c}</span>)}
              </div>
              <p className="text-xs text-muted-foreground">Last order: {s.lastOrder}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">Place Order</Button>
            </div>
          );
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Company Name *</Label><Input required value={form.name} onChange={set("name")} placeholder="Supplier company name" /></div>
            <div className="space-y-1.5"><Label>Contact Person</Label><Input value={form.contact} onChange={set("contact")} placeholder="Contact name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} placeholder="+1-800-555-0000" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} placeholder="orders@supplier.com" /></div>
            </div>
            <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={set("address")} placeholder="Full address" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Lead Time (days)</Label><Input type="number" value={form.leadDays} onChange={set("leadDays")} placeholder="5" /></div>
              <div className="space-y-1.5"><Label>Categories (comma-separated)</Label><Input value={form.categories} onChange={set("categories")} placeholder="Cardiovascular, Statin" /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Supplier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
