import React, { useState } from "react";
import {
  Users, Plus, X, Eye, EyeOff, KeyRound, RefreshCw, Trash2,
  ShieldCheck, Clock, CheckCircle2, Search, Copy, AlertCircle, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useStaffAccounts, generateTempPassword, StaffRole, StaffAccount } from "@/context/StaffAccountStore";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABELS: Record<StaffRole, string> = {
  superadmin: "Super Admin", admin: "Admin", doctor: "Doctor",
  nurse: "Nurse", lab: "Laboratory", pharmacy: "Pharmacy",
  accountant: "Accountant", receptionist: "Receptionist", radiology: "Radiology",
};
const ROLE_COLORS: Record<StaffRole, string> = {
  superadmin: "bg-[#1a0a10] text-[#ebc325]", admin: "bg-[#fdf2f4] text-[#8B1A2F]",
  doctor: "bg-amber-100 text-amber-700", nurse: "bg-orange-100 text-orange-700",
  lab: "bg-blue-100 text-blue-700", pharmacy: "bg-green-100 text-green-700",
  accountant: "bg-purple-100 text-purple-700", receptionist: "bg-teal-100 text-teal-700",
  radiology: "bg-sky-100 text-sky-700",
};
// Admin can ONLY create staff roles — never Admin or SuperAdmin (those are Super Admin's privilege)
const ROLES: StaffRole[] = ["doctor","nurse","receptionist","lab","pharmacy","accountant","radiology"];

function AddAccountModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [role, setRole]             = useState<StaffRole>("doctor");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]           = useState("");
  const [specialty, setSpecialty]   = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone]           = useState("");
  const [tempPw, setTempPw]         = useState(generateTempPassword());
  const [showPw, setShowPw]         = useState(true);
  const { toast } = useToast();

  const inp = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ role, displayName, email, tempPassword: tempPw, specialty, department, phone });
    onClose();
  };
  const copy = () => { navigator.clipboard.writeText(tempPw); toast({ title: "Copied to clipboard" }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#8B1A2F]" />Add Staff Account
          </h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Role *</label>
              <select className={inp} value={role} onChange={e => setRole(e.target.value as StaffRole)}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Full Name *</label>
              <input className={inp} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Dr. Jane Smith" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Email Address (Login) *</label>
            <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane.smith@hospital.com" required />
          </div>

          {(role === "doctor") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Specialty</label>
                <input className={inp} value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Cardiology" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Department</label>
                <input className={inp} value={department} onChange={e => setDepartment(e.target.value)} placeholder="Cardiology Unit" />
              </div>
            </div>
          )}
          {role !== "doctor" && (
            <div>
              <label className="text-xs font-semibold mb-1 block">Department</label>
              <input className={inp} value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. General Ward" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold mb-1 block">Phone</label>
            <input className={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555-0000" />
          </div>

          {/* Temporary password */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-bold text-amber-800">Temporary Password</p>
            </div>
            <p className="text-xs text-amber-700 mb-3">This password will be given to the staff member. They will be required to change it on first login.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  className={`${inp} font-mono pr-10`}
                  type={showPw ? "text" : "password"}
                  value={tempPw}
                  onChange={e => setTempPw(e.target.value)}
                  required />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setTempPw(generateTempPassword())} className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0">
                <RefreshCw className="h-3.5 w-3.5 mr-1" />New
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={copy} className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Create Account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ account, onClose, onReset }: { account: StaffAccount; onClose: () => void; onReset: (email: string, pw: string) => void }) {
  const [newPw, setNewPw] = useState(generateTempPassword());
  const [showPw, setShowPw] = useState(true);
  const { toast } = useToast();
  const inp = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30";
  const copy = () => { navigator.clipboard.writeText(newPw); toast({ title: "Copied!" }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><KeyRound className="h-5 w-5 text-amber-600" />Reset Password</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Reset the password for <span className="font-semibold text-foreground">{account.displayName}</span> ({account.email}).
          They will be required to create a new password on their next login.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">New Temporary Password</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input className={`${inp} font-mono pr-10`} type={showPw ? "text" : "password"}
                value={newPw} onChange={e => setNewPw(e.target.value)} />
              <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setNewPw(generateTempPassword())} className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={copy} className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => { onReset(account.email, newPw); onClose(); }} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminStaffAccounts() {
  const { accounts, create, reset, remove } = useStaffAccounts();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "All">("All");
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffAccount | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Only show staff that THIS admin created — strict per-clinic isolation
  const myEmail = user?.email ?? "";
  const myStaff = accounts.filter(a =>
    a.role !== "admin" && a.role !== "superadmin" &&
    a.createdBy.toLowerCase() === myEmail.toLowerCase()
  );

  const filtered = myStaff.filter(a => {
    const s = search.toLowerCase();
    const matchSearch = !s || a.displayName.toLowerCase().includes(s) || a.email.toLowerCase().includes(s);
    const matchRole = roleFilter === "All" || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  const needsChange = myStaff.filter(a => a.mustChangePassword).length;

  const handleCreate = (data: any) => {
    // Stamp admin's clinicId directly onto the staff account — critical for clinic isolation
    create({ ...data, createdBy: myEmail, clinicId: user?.clinicId });
    toast({ title: "Account created", description: `Temporary password sent to ${data.email}` });
  };
  const handleReset = (email: string, pw: string) => {
    reset(email, pw, myEmail);
    toast({ title: "Password reset", description: "Staff member must change password on next login." });
  };
  const handleDelete = (acc: StaffAccount) => {
    if (["acc-superadmin","acc-admin"].includes(acc.id)) {
      toast({ title: "Cannot delete system accounts", variant: "destructive" }); return;
    }
    if (!confirm(`Delete account for ${acc.displayName}? This cannot be undone.`)) return;
    remove(acc.id);
    toast({ title: "Account deleted" });
  };
  const toggleShowPw = (id: string) => setShowPasswords(p => ({ ...p, [id]: !p[id] }));
  const copyPw = (pw: string) => { navigator.clipboard.writeText(pw); toast({ title: "Password copied" }); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[#8B1A2F]" />Staff Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage login credentials and temporary passwords for all staff roles</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
          <Plus className="h-4 w-4" />Add Account
        </Button>
      </div>

      {/* Critical warning: admin must be assigned to a clinic by Super Admin */}
      {!user?.clinicId && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">This admin account is not assigned to any clinic</p>
            <p className="text-xs text-red-700 mt-0.5">
              Staff you create here will not be tied to a clinic, which means they will not be able to see any patients.
              Ask the Super Admin to assign this admin account to a clinic via the Clinic Management page.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Staff", value: myStaff.length, icon: Users, cls: "text-foreground", iconCls: "text-[#8B1A2F] bg-[#fdf2f4]" },
          { label: "Active Accounts", value: myStaff.filter(a => !a.mustChangePassword).length, icon: CheckCircle2, cls: "text-green-600", iconCls: "text-green-600 bg-green-50" },
          { label: "Pending Password Change", value: needsChange, icon: AlertCircle, cls: "text-amber-600", iconCls: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconCls}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {needsChange > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {needsChange} staff member{needsChange > 1 ? "s have" : " has"} not yet changed their temporary password. Share their credentials so they can log in and set a new password.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" className="pl-9 h-8 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...ROLES] as (StaffRole | "All")[]).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${roleFilter === r ? "bg-[#8B1A2F] text-white border-[#8B1A2F]" : "border-border text-muted-foreground hover:border-[#8B1A2F]/40"}`}>
              {r === "All" ? "All Roles" : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Login Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">No accounts found</td></tr>
              ) : (
                filtered.map(acc => (
                  <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ROLE_COLORS[acc.role]}`}>
                          {acc.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{acc.displayName}</p>
                          {acc.specialty && <p className="text-xs text-muted-foreground">{acc.specialty}</p>}
                          {acc.department && !acc.specialty && <p className="text-xs text-muted-foreground">{acc.department}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[acc.role]}`}>{ROLE_LABELS[acc.role]}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-mono text-xs text-foreground">{acc.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {acc.mustChangePassword && acc.tempPasswordLabel ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {showPasswords[acc.id] ? acc.tempPasswordLabel : "••••••••"}
                          </span>
                          <button onClick={() => toggleShowPw(acc.id)} className="text-amber-600 hover:text-amber-800 p-0.5">
                            {showPasswords[acc.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                          <button onClick={() => copyPw(acc.tempPasswordLabel!)} className="text-amber-600 hover:text-amber-800 p-0.5">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Set by user</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {acc.mustChangePassword ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" />Temp Password
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3 w-3" />Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-muted-foreground">{acc.createdAt}</p>
                      {acc.lastLoginAt && <p className="text-[10px] text-muted-foreground">Last login: {new Date(acc.lastLoginAt).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setResetTarget(acc)}
                          className="h-7 text-xs gap-1 border-amber-200 text-amber-700 hover:bg-amber-50">
                          <KeyRound className="h-3 w-3" />Reset PW
                        </Button>
                        {!["acc-superadmin","acc-admin"].includes(acc.id) && (
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(acc)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hierarchy notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">Account Hierarchy</p>
          <p className="text-xs text-amber-700">
            <strong>Super Admin</strong> is the app owner — only they can create clinics and Admin accounts. &nbsp;
            <strong>You (Admin)</strong> can create staff for your clinic: Doctors, Nurses, Lab, Pharmacy, Accountant, Receptionist, and Radiology. &nbsp;
            Staff set their own passwords on first login.
          </p>
        </div>
      </div>

      {/* Instructions card */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-[#8B1A2F] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">How it works</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>You create a staff account with a temporary password</li>
              <li>Share the email and temporary password with the staff member</li>
              <li>Staff member goes to their portal login page and enters the credentials</li>
              <li>They are prompted to create their own secure password on first login</li>
              <li>They log in with their new password from that point forward</li>
              <li>If a staff member forgets their password, use "Reset PW" to issue a new temporary one</li>
            </ol>
          </div>
        </div>
      </div>

      {showAdd && <AddAccountModal onClose={() => setShowAdd(false)} onCreate={handleCreate} />}
      {resetTarget && <ResetPasswordModal account={resetTarget} onClose={() => setResetTarget(null)} onReset={handleReset} />}
    </div>
  );
}
