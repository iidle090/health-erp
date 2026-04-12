import React, { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSuperAdmin, ClinicUser } from "@/context/SuperAdminStore";
import { useLocation } from "wouter";

const roleCls: Record<string, string> = {
  Doctor: "bg-amber-100 text-amber-700", Nurse: "bg-orange-100 text-orange-700",
  Admin: "bg-[#fdf2f4] text-[#8B1A2F]", Lab: "bg-blue-100 text-blue-700",
  Pharmacy: "bg-green-100 text-green-700", Accountant: "bg-purple-100 text-purple-700",
  Receptionist: "bg-gray-100 text-gray-700",
};
const statusCls: Record<string, string> = { Active: "bg-green-100 text-green-700", Inactive: "bg-gray-100 text-gray-500" };

const ROLES = ["Doctor", "Nurse", "Admin", "Lab", "Pharmacy", "Accountant", "Receptionist"] as const;

export function SuperUsers() {
  const { users, clinics, addUser, updateUser, removeUser } = useSuperAdmin();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [clinicFilter, setClinicFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<ClinicUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Doctor" as ClinicUser["role"], clinicId: clinics[0]?.id ?? "", status: "Active" as ClinicUser["status"] });

  const filtered = users.filter((u) => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === "All" || u.role === roleFilter;
    const mc = clinicFilter === "All" || u.clinicId === clinicFilter;
    return ms && mr && mc;
  });

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", role: "Doctor", clinicId: clinics[0]?.id ?? "", status: "Active" });
    setAddOpen(true);
  };

  const openEdit = (u: ClinicUser) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, clinicId: u.clinicId, status: u.status });
    setAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      updateUser(editUser.id, { name: form.name, email: form.email, role: form.role, clinicId: form.clinicId, status: form.status });
    } else {
      addUser({ id: `U-${Date.now()}`, ...form, lastLogin: "—" });
    }
    setAddOpen(false);
    setEditUser(null);
  };

  const getClinicName = (clinicId: string) => clinics.find((c) => c.id === clinicId)?.name ?? clinicId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} users across {clinics.length} clinics</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />Create User</Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={clinicFilter} onChange={(e) => setClinicFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="All">All Clinics</option>
            {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2 flex-wrap">
            {["All", ...ROLES].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Name", "Email", "Role", "Clinic", "Status", "Last Login", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleCls[u.role] ?? "bg-gray-100 text-gray-700"}`}>{u.role}</span></td>
                  <td className="px-5 py-3">
                    <button onClick={() => navigate(`/superadmin/clinic/${u.clinicId}`)} className="text-xs text-[#8B1A2F] hover:underline">
                      {getClinicName(u.clinicId)}
                    </button>
                  </td>
                  <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCls[u.status]}`}>{u.status}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{u.lastLogin}</td>
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
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No users found.</div>}
        </div>
      </div>

      {/* Add/Edit modal */}
      <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) setEditUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editUser ? "Edit User" : "Create Clinic User"}</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleSave}>
            <div className="space-y-1.5"><Label>Full Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@hospital.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Role</Label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Assign to Clinic</Label>
              <select value={form.clinicId} onChange={(e) => setForm((f) => ({ ...f, clinicId: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">{editUser ? "Save Changes" : "Create User"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
