import React, { useState } from "react";
import {
  Crown, Plus, Eye, EyeOff, KeyRound, RefreshCw, Trash2,
  CheckCircle2, Clock, Search, Copy, ShieldCheck, Mail, AlertCircle, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useStaffAccounts, generateTempPassword, StaffAccount } from "@/context/StaffAccountStore";
import { useSuperAdmin, Clinic } from "@/context/SuperAdminStore";

const ADMIN_ROLE = "admin" as const;

function AddAccountModal({
  onClose,
  onCreate,
  clinics,
}: {
  onClose: () => void;
  onCreate: (data: any) => void;
  clinics: Clinic[];
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [tempPw, setTempPw] = useState(generateTempPassword());
  const [showPw, setShowPw] = useState(true);
  const { toast } = useToast();

  const inp =
    "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !clinicId || !tempPw.trim()) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    onCreate({
      role: ADMIN_ROLE,
      displayName: displayName.trim(),
      email: email.trim(),
      clinicId,
      tempPassword: tempPw,
      department,
      phone,
      createdBy: "super@hospital.com",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#1a0a10] p-1.5">
              <ShieldCheck className="h-4 w-4 text-[#ebc325]" />
            </div>
            <h2 className="font-semibold text-base">Create Admin Account</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full h-8 w-8 bg-gray-100 border border-gray-300 text-gray-700 hover:bg-red-100 hover:border-red-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            This Admin account will be created by Super Admin. The Admin must change their
            password on first login before accessing the portal.
          </p>

          <div className="space-y-4">
            {/* Clinic selector — required */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Assign to Clinic *
              </label>
              {clinics.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  No clinics exist yet. Create a clinic first from the Clinics page.
                </div>
              ) : (
                <select
                  className={inp}
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  required
                >
                  <option value="">— Select a clinic —</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-muted-foreground">
                This Admin will manage only the staff of the selected clinic.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground">Admin Full Name *</label>
                <input
                  className={inp}
                  placeholder="e.g. Jane Smith"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground">Admin Email (Login) *</label>
                <input
                  className={inp}
                  type="email"
                  placeholder="admin@yourclinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Department</label>
                <input
                  className={inp}
                  placeholder="e.g. Administration"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Phone</label>
                <input
                  className={inp}
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Temp password section */}
          <div className="rounded-xl border border-[#ebc325]/40 bg-[#1a0a10]/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-[#1a0a10] flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />Temporary Password
            </p>
            <p className="text-xs text-[#1a0a10]/60">
              Share this with the Admin. They must change it on first login.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={tempPw}
                  onChange={(e) => setTempPw(e.target.value)}
                  className="w-full rounded-lg border border-[#ebc325]/40 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#ebc325]/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a0a10]/50"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTempPw(generateTempPassword())}
                className="border-[#ebc325]/40 text-[#1a0a10] hover:bg-[#ebc325]/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(tempPw)}
                className="border-[#ebc325]/40 text-[#1a0a10] hover:bg-[#ebc325]/10"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={clinics.length === 0}
              className="bg-[#1a0a10] text-[#ebc325] hover:bg-[#2d1020]"
            >
              <Plus className="h-4 w-4 mr-1" />Create Admin Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({
  account,
  onClose,
  onReset,
}: {
  account: StaffAccount;
  onClose: () => void;
  onReset: (email: string, pw: string) => void;
}) {
  const [tempPw, setTempPw] = useState(generateTempPassword());
  const [showPw, setShowPw] = useState(true);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-base">Reset Admin Password</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full h-8 w-8 bg-gray-100 border border-gray-300 text-gray-700 hover:bg-red-100 hover:border-red-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Reset password for <strong>{account.displayName}</strong> ({account.email}). They will
            be required to change it on next login.
          </p>
          <div className="rounded-xl border border-[#ebc325]/40 bg-[#1a0a10]/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-[#1a0a10]">New Temporary Password</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={tempPw}
                  onChange={(e) => setTempPw(e.target.value)}
                  className="w-full rounded-lg border border-[#ebc325]/40 bg-white px-3 py-2 text-sm font-mono focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a0a10]/50"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTempPw(generateTempPassword())}
                className="border-[#ebc325]/40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(tempPw)}
                className="border-[#ebc325]/40"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              className="bg-[#1a0a10] text-[#ebc325] hover:bg-[#2d1020]"
              onClick={() => onReset(account.email, tempPw)}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminAccounts() {
  const { accounts, create, reset, remove, refresh } = useStaffAccounts();
  const { clinics } = useSuperAdmin();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffAccount | null>(null);
  const [revealedPw, setRevealedPw] = useState<string | null>(null);
  const { toast } = useToast();

  const adminAccounts = accounts.filter(
    (a) => a.role === "admin" && a.id !== "acc-superadmin"
  );
  const filtered = adminAccounts.filter(
    (a) =>
      !search ||
      a.displayName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  // Helper: look up clinic name by clinicId
  const clinicName = (clinicId?: string) => {
    if (!clinicId) return null;
    return clinics.find((c) => c.id === clinicId)?.name ?? null;
  };

  const handleCreate = (data: any) => {
    create({ ...data, createdBy: "super@hospital.com" });
    setShowAdd(false);
    const clinic = clinics.find((c) => c.id === data.clinicId);
    toast({
      title: "Admin account created",
      description: `${data.displayName} assigned to ${clinic?.name ?? data.clinicId}.`,
    });
  };

  const handleReset = (email: string, pw: string) => {
    reset(email, pw, "super@hospital.com");
    setResetTarget(null);
    toast({ title: "Password reset", description: `New temp password issued for ${email}` });
  };

  const handleDelete = (acc: StaffAccount) => {
    if (!confirm(`Delete admin account for ${acc.displayName}? This cannot be undone.`)) return;
    remove(acc.id);
    refresh();
    toast({ title: "Account deleted" });
  };

  return (
    <div className="space-y-6">
      {showAdd && (
        <AddAccountModal
          onClose={() => setShowAdd(false)}
          onCreate={handleCreate}
          clinics={clinics}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          account={resetTarget}
          onClose={() => setResetTarget(null)}
          onReset={handleReset}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Admin Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each Admin is assigned to one clinic and manages only that clinic's staff
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-[#1a0a10] text-[#ebc325] hover:bg-[#2d1020]"
        >
          <Plus className="h-4 w-4 mr-2" />Create Admin Account
        </Button>
      </div>

      {/* Hierarchy info card */}
      <div className="rounded-xl border border-[#ebc325]/40 bg-gradient-to-r from-[#1a0a10]/5 to-transparent p-5">
        <div className="flex items-start gap-3">
          <Crown className="h-5 w-5 text-[#ebc325] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm text-[#1a0a10]">Account Hierarchy</p>
            <p className="text-xs text-[#1a0a10]/70 mt-1">
              <strong>Super Admin</strong> creates clinics and assigns Admin accounts to them →{" "}
              <strong>Admin</strong> creates staff for their clinic only (Doctors, Nurses, Lab, etc.) →{" "}
              <strong>Staff</strong> set their own passwords on first login.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder="Search admins…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground self-center">
          {filtered.length} admin{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Assigned Clinic
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Temp Password
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                    No admin accounts yet. Create one to get started.
                  </td>
                </tr>
              )}
              {filtered.map((acc) => {
                const cname = clinicName(acc.clinicId);
                return (
                  <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                    {/* Admin name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#1a0a10] flex items-center justify-center text-[#ebc325] text-xs font-bold flex-shrink-0">
                          {acc.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground leading-tight">
                            {acc.displayName}
                          </p>
                          {acc.department && (
                            <p className="text-xs text-muted-foreground">{acc.department}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Clinic */}
                    <td className="px-4 py-3">
                      {cname ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 text-xs font-medium">
                          <Building2 className="h-3 w-3" />
                          {cname}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 text-xs font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs font-mono">{acc.email}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {acc.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-xs font-medium">
                          <Clock className="h-3 w-3" />Must change password
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />Active
                        </span>
                      )}
                    </td>

                    {/* Temp password */}
                    <td className="px-4 py-3">
                      {acc.tempPasswordLabel ? (
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">
                            {revealedPw === acc.id ? acc.tempPasswordLabel : "••••••••"}
                          </code>
                          <button
                            onClick={() =>
                              setRevealedPw(revealedPw === acc.id ? null : acc.id)
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {revealedPw === acc.id ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {revealedPw === acc.id && (
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(acc.tempPasswordLabel!)
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Changed</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">{acc.createdAt}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResetTarget(acc)}
                          className="h-7 text-xs px-2.5"
                        >
                          <KeyRound className="h-3 w-3 mr-1" />Reset
                        </Button>
                        {!["acc-admin"].includes(acc.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(acc)}
                            className="h-7 text-xs px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
