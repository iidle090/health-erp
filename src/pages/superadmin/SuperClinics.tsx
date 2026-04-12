import React, { useState } from "react";
import {
  Plus, Edit2, Eye, Search, FlaskConical, Pill, Package,
  ToggleLeft, ToggleRight, ShieldCheck, UserCheck, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useSuperAdmin, Clinic } from "@/context/SuperAdminStore";
import { useStaffAccounts } from "@/context/StaffAccountStore";

const statusCls: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Trial: "bg-amber-100 text-amber-700",
  Suspended: "bg-gray-100 text-gray-500",
};
const statusDot: Record<string, string> = {
  Active: "bg-green-500", Trial: "bg-amber-400", Suspended: "bg-gray-400",
};

const emptyForm = {
  name: "", address: "", phone: "", email: "", admin: "",
  status: "Active" as Clinic["status"],
  labEnabled: false, pharmacyEnabled: false, inventoryEnabled: false,
};

export function SuperClinics() {
  const { clinics, addClinic, updateClinic } = useSuperAdmin();
  const { accounts: staffAccounts } = useStaffAccounts();

  // Compute real doctor/nurse counts from StaffAccountStore:
  // admins assigned to a clinic → doctors/nurses created by those admins
  const getStaffCount = (clinicId: string, role: "doctor" | "nurse") => {
    const adminEmails = staffAccounts
      .filter(a => a.role === "admin" && a.clinicId === clinicId)
      .map(a => a.email.toLowerCase());
    return staffAccounts.filter(
      a => a.role === role && adminEmails.includes(a.createdBy.toLowerCase())
    ).length;
  };
  const getDoctorCount = (clinicId: string) => getStaffCount(clinicId, "doctor");
  const getNurseCount  = (clinicId: string) => getStaffCount(clinicId, "nurse");
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Get real admin accounts assigned to a clinic via clinicId FK
  const getAssignedAdmins = (clinicId: string) =>
    staffAccounts.filter(
      (a) => a.role === "admin" && a.clinicId === clinicId
    );

  const filtered = clinics.filter((c) => {
    const ms =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || c.status === statusFilter;
    return ms && mf;
  });

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModalOpen(true); };
  const openEdit = (c: Clinic) => {
    setForm({
      name: c.name, address: c.address, phone: c.phone, email: c.email,
      admin: c.admin, status: c.status,
      labEnabled: c.labEnabled, pharmacyEnabled: c.pharmacyEnabled,
      inventoryEnabled: c.inventoryEnabled,
    });
    setEditing(c);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateClinic(editing.id, form);
    } else {
      const id = `CLN-${String(clinics.length + 1).padStart(3, "0")}`;
      addClinic({ id, ...form, created: new Date().toISOString().split("T")[0] });
    }
    setModalOpen(false);
  };

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k: "labEnabled" | "pharmacyEnabled" | "inventoryEnabled") =>
    setForm((f) => ({ ...f, [k]: !f[k] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clinics.length} registered · {clinics.filter((c) => c.status === "Active").length} active
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />Add Clinic
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clinics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Trial", "Suspended"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f
                  ? "bg-[#8B1A2F] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Clinics table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Clinic", "Assigned Admin(s)", "Contact", "Status", "Doctors", "Nurses", "Modules", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((c) => {
                const assignedAdmins = getAssignedAdmins(c.id);
                return (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    {/* Clinic info */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{c.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.address.split(",").slice(1).join(",").trim()}
                      </p>
                    </td>

                    {/* Assigned admin accounts (real, from StaffAccountStore) */}
                    <td className="px-5 py-3">
                      {assignedAdmins.length > 0 ? (
                        <div className="space-y-1">
                          {assignedAdmins.map((adm) => (
                            <div
                              key={adm.id}
                              className="flex items-center gap-1.5"
                            >
                              <div className="h-5 w-5 rounded-full bg-[#1a0a10] flex items-center justify-center text-[8px] font-bold text-[#ebc325] flex-shrink-0">
                                {adm.displayName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground leading-tight">
                                  {adm.displayName}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {adm.email}
                                </p>
                              </div>
                              {adm.mustChangePassword ? (
                                <span className="ml-1 text-[9px] font-medium rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5">
                                  Pending
                                </span>
                              ) : (
                                <ShieldCheck className="h-3 w-3 text-green-600 ml-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      <p>{c.phone}</p>
                      <p className="truncate max-w-[140px]">{c.email}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusCls[c.status]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[c.status]}`} />
                        {c.status}
                      </span>
                    </td>

                    <td className="px-5 py-3 font-semibold text-foreground">
                      {getDoctorCount(c.id)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-foreground">
                      {getNurseCount(c.id)}
                    </td>

                    {/* Modules */}
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.labEnabled && (
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            <FlaskConical className="h-2.5 w-2.5" />Lab
                          </span>
                        )}
                        {c.pharmacyEnabled && (
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <Pill className="h-2.5 w-2.5" />Pharmacy
                          </span>
                        )}
                        {c.inventoryEnabled && (
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <Package className="h-2.5 w-2.5" />Inventory
                          </span>
                        )}
                        {!c.labEnabled && !c.pharmacyEnabled && !c.inventoryEnabled && (
                          <span className="text-[10px] text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(c)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => navigate(`/superadmin/clinic/${c.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No clinics match your search.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Clinic" : "Add New Clinic"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Clinic Name *</Label>
              <Input required value={form.name} onChange={set("name")} placeholder="e.g. City General Hospital" />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={set("address")} placeholder="Full street address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={set("phone")} placeholder="+1-000-555-0000" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="clinic@example.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={set("status")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option>Active</option>
                <option>Trial</option>
                <option>Suspended</option>
              </select>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
              <p className="text-xs text-blue-700 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                Admin accounts are assigned to this clinic from the{" "}
                <strong>Manage Admins</strong> page. Admin names are not entered here.
              </p>
            </div>

            {/* Modules */}
            <div>
              <Label className="block mb-2">Enabled Modules</Label>
              <div className="space-y-2">
                {(
                  [
                    { key: "labEnabled" as const, label: "Lab Module", icon: FlaskConical, color: "text-blue-700" },
                    { key: "pharmacyEnabled" as const, label: "Pharmacy Module", icon: Pill, color: "text-green-700" },
                    { key: "inventoryEnabled" as const, label: "Inventory Module", icon: Package, color: "text-amber-700" },
                  ] as const
                ).map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`flex items-center justify-between w-full rounded-lg border-2 px-4 py-3 transition-all ${
                      form[key]
                        ? "border-[#8B1A2F] bg-[#fdf2f4]"
                        : "border-border bg-muted/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${form[key] ? color : "text-muted-foreground"}`} />
                      <span
                        className={`text-sm font-medium ${
                          form[key] ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {form[key] ? (
                      <ToggleRight className="h-5 w-5 text-[#8B1A2F]" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save Changes" : "Create Clinic"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
