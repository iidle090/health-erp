import React, { useState } from "react";
import { ArrowLeft, Building2, Users, FlaskConical, Pill, Package, Plus, Edit2, Trash2, Toggle, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useSuperAdmin, ClinicUser } from "@/context/SuperAdminStore";

const ROLES = ["Doctor", "Nurse", "Admin", "Lab", "Pharmacy", "Accountant", "Receptionist"] as const;

const roleCls: Record<string, string> = {
  Doctor: "bg-amber-100 text-amber-700", Nurse: "bg-orange-100 text-orange-700",
  Admin: "bg-[#fdf2f4] text-[#8B1A2F]", Lab: "bg-blue-100 text-blue-700",
  Pharmacy: "bg-green-100 text-green-700", Accountant: "bg-purple-100 text-purple-700",
  Receptionist: "bg-gray-100 text-gray-700",
};

const statusCls: Record<string, string> = { Active: "bg-green-100 text-green-700", Inactive: "bg-gray-100 text-gray-500" };

const TABS = ["Overview", "Doctors", "Nurses", "Lab", "Pharmacy", "Inventory"] as const;

export function SuperClinicDetail({ clinicId }: { clinicId: string }) {
  const { clinics, users, updateClinic, addUser, updateUser, removeUser, getUsersForClinic } = useSuperAdmin();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<ClinicUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Doctor" as ClinicUser["role"], status: "Active" as ClinicUser["status"] });

  const clinic = clinics.find((c) => c.id === clinicId);
  if (!clinic) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <p className="text-lg font-semibold text-foreground">Clinic not found</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/superadmin")}>Go Back</Button>
      </div>
    );
  }

  const clinicUsers = getUsersForClinic(clinicId);
  const doctors = clinicUsers.filter((u) => u.role === "Doctor");
  const nurses = clinicUsers.filter((u) => u.role === "Nurse");
  const labUsers = clinicUsers.filter((u) => u.role === "Lab");
  const pharmaUsers = clinicUsers.filter((u) => u.role === "Pharmacy");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      updateUser(editUser.id, { name: form.name, email: form.email, role: form.role, status: form.status });
    } else {
      addUser({
        id: `U-${Date.now()}`, clinicId,
        name: form.name, email: form.email, role: form.role, status: form.status,
        lastLogin: "—",
      });
    }
    setAddUserOpen(false);
    setEditUser(null);
    setForm({ name: "", email: "", role: "Doctor", status: "Active" });
  };

  const openEdit = (u: ClinicUser) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setAddUserOpen(true);
  };

  const tabUsers = tab === "Doctors" ? doctors : tab === "Nurses" ? nurses : tab === "Lab" ? labUsers : tab === "Pharmacy" ? pharmaUsers : [];

  const statusConfig: Record<string, { cls: string; dot: string }> = {
    Active: { cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
    Trial: { cls: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
    Suspended: { cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  };

  const ModuleToggle = ({ enabled, label, onToggle }: { enabled: boolean; label: string; onToggle: () => void }) => (
    <button onClick={onToggle}
      className={`flex items-center justify-between rounded-xl border-2 p-4 w-full transition-all ${enabled ? "border-[#8B1A2F] bg-[#fdf2f4]" : "border-border bg-muted/20"}`}>
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${enabled ? "bg-[#8B1A2F]" : "bg-muted"}`}>
          {label === "Lab" && <FlaskConical className={`h-4 w-4 ${enabled ? "text-white" : "text-muted-foreground"}`} />}
          {label === "Pharmacy" && <Pill className={`h-4 w-4 ${enabled ? "text-white" : "text-muted-foreground"}`} />}
          {label === "Inventory" && <Package className={`h-4 w-4 ${enabled ? "text-white" : "text-muted-foreground"}`} />}
        </div>
        <div className="text-left">
          <p className={`font-semibold text-sm ${enabled ? "text-[#8B1A2F]" : "text-muted-foreground"}`}>{label} Module</p>
          <p className="text-xs text-muted-foreground">{enabled ? "Enabled" : "Disabled"}</p>
        </div>
      </div>
      {enabled
        ? <ToggleRight className="h-6 w-6 text-[#8B1A2F]" />
        : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate("/superadmin")} className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{clinic.name}</h1>
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[clinic.status].cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[clinic.status].dot}`} />{clinic.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{clinic.address} · {clinic.phone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Admin: {clinic.admin} · ID: {clinic.id} · Since {clinic.created}</p>
        </div>
        <div className="flex gap-2">
          <select value={clinic.status} onChange={(e) => updateClinic(clinic.id, { status: e.target.value as any })}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
            <option>Active</option><option>Trial</option><option>Suspended</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Doctors", value: doctors.length, icon: Users, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Nurses", value: nurses.length, icon: Users, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Total Staff", value: clinicUsers.length, icon: Users, color: "text-orange-700", bg: "bg-orange-50" },
          { label: "Active Modules", value: [clinic.labEnabled, clinic.pharmacyEnabled, clinic.inventoryEnabled].filter(Boolean).length, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "Overview" && (
        <div className="space-y-6">
          {/* Module status */}
          <div>
            <h2 className="font-semibold text-foreground mb-3">Module Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ModuleToggle label="Lab" enabled={clinic.labEnabled} onToggle={() => updateClinic(clinic.id, { labEnabled: !clinic.labEnabled })} />
              <ModuleToggle label="Pharmacy" enabled={clinic.pharmacyEnabled} onToggle={() => updateClinic(clinic.id, { pharmacyEnabled: !clinic.pharmacyEnabled })} />
              <ModuleToggle label="Inventory" enabled={clinic.inventoryEnabled} onToggle={() => updateClinic(clinic.id, { inventoryEnabled: !clinic.inventoryEnabled })} />
            </div>
          </div>

          {/* Clinic info */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-foreground">Clinic Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{clinic.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Clinic ID</p><p className="font-mono font-medium">{clinic.id}</p></div>
              <div><p className="text-muted-foreground text-xs">Address</p><p className="font-medium">{clinic.address}</p></div>
              <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{clinic.phone}</p></div>
              <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{clinic.email}</p></div>
              <div><p className="text-muted-foreground text-xs">Admin</p><p className="font-medium">{clinic.admin}</p></div>
              <div><p className="text-muted-foreground text-xs">Status</p><p className="font-medium">{clinic.status}</p></div>
              <div><p className="text-muted-foreground text-xs">Created</p><p className="font-medium">{clinic.created}</p></div>
            </div>
          </div>

          {/* Staff summary */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50"><h2 className="font-semibold text-foreground">Staff Summary</h2></div>
            <div className="divide-y divide-border/40">
              {Object.entries(
                clinicUsers.reduce<Record<string, number>>((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
              ).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleCls[role] ?? "bg-gray-100 text-gray-700"}`}>{role}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))}
              {clinicUsers.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No staff added yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Staff tabs (Doctors, Nurses, Lab, Pharmacy) */}
      {(tab === "Doctors" || tab === "Nurses" || tab === "Lab" || tab === "Pharmacy") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{tabUsers.length} {tab.toLowerCase()} staff member{tabUsers.length !== 1 ? "s" : ""}</p>
            <Button size="sm" onClick={() => { setEditUser(null); setForm({ name: "", email: "", role: tab === "Doctors" ? "Doctor" : tab === "Nurses" ? "Nurse" : tab === "Lab" ? "Lab" : "Pharmacy", status: "Active" }); setAddUserOpen(true); }} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />Add Staff
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {tabUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No {tab.toLowerCase()} added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Add Staff" to add {tab.toLowerCase()} to this clinic.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      {["Name", "Email", "Role", "Status", "Last Login", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {tabUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                        <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleCls[u.role]}`}>{u.role}</span></td>
                        <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCls[u.status]}`}>{u.status}</span></td>
                        <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{u.lastLogin}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(u)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" onClick={() => removeUser(u.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory tab */}
      {tab === "Inventory" && (
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 text-center">
          {clinic.inventoryEnabled ? (
            <div className="space-y-2">
              <Package className="h-10 w-10 text-[#8B1A2F] mx-auto" />
              <p className="font-semibold text-foreground">Inventory Module Active</p>
              <p className="text-sm text-muted-foreground">This clinic has access to inventory management via the Pharmacy portal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Package className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <p className="font-semibold text-muted-foreground">Inventory Module Disabled</p>
              <p className="text-sm text-muted-foreground">Enable the Inventory module from the Overview tab to grant this clinic inventory access.</p>
              <Button size="sm" onClick={() => { updateClinic(clinic.id, { inventoryEnabled: true }); setTab("Overview"); }}>Enable Inventory</Button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit user dialog */}
      <Dialog open={addUserOpen} onOpenChange={(v) => { setAddUserOpen(v); if (!v) setEditUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editUser ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label>Full Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@hospital.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setAddUserOpen(false); setEditUser(null); }}>Cancel</Button>
              <Button type="submit">{editUser ? "Save Changes" : "Add Staff"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
