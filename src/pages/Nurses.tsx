import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useStaffAccounts, StaffAccount, generateTempPassword } from "@/context/StaffAccountStore";
import { KeyRound, RefreshCw, Eye, EyeOff, Copy } from "lucide-react";

const AVAIL_COLORS = {
  Available: "bg-green-100 text-green-700",
  Unavailable: "bg-gray-100 text-gray-600",
  "On Leave": "bg-amber-100 text-amber-700",
};
const SHIFT_COLORS = {
  Morning: "bg-yellow-100 text-yellow-700",
  Afternoon: "bg-blue-100 text-blue-700",
  Night: "bg-purple-100 text-purple-700",
};

function NurseFormModal({
  onClose, onSave, initial,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  initial?: StaffAccount;
}) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [availability, setAvailability] = useState<StaffAccount["availability"]>(initial?.availability ?? "Available");
  const [shift, setShift] = useState<StaffAccount["shift"]>(initial?.shift ?? "Morning");
  const [tempPw, setTempPw] = useState(generateTempPassword());
  const [showPw, setShowPw] = useState(true);
  const [createLogin, setCreateLogin] = useState(true);
  const { toast } = useToast();

  const isEdit = !!initial;
  const inp = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || (!isEdit && !email.trim())) {
      toast({ title: "Name and email are required", variant: "destructive" }); return;
    }
    onSave({ displayName, email, department, phone, availability, shift, tempPw, createLogin });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-[#8B1A2F]" />
            {isEdit ? "Edit Nurse" : "Add Nurse"}
          </h2>
          <button onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-600 transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold">Full Name *</label>
              <input className={inp} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nurse Jane Adams" required />
            </div>
            {!isEdit && (
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold">Email (Login) *</label>
                <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nurse@clinic.com" required />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold">Department</label>
              <input className={inp} value={department} onChange={e => setDepartment(e.target.value)} placeholder="General Ward" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Phone</label>
              <input className={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Shift</label>
              <select className={inp} value={shift} onChange={e => setShift(e.target.value as StaffAccount["shift"])}>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Availability</label>
              <select className={inp} value={availability} onChange={e => setAvailability(e.target.value as StaffAccount["availability"])}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {!isEdit && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={createLogin} onChange={e => setCreateLogin(e.target.checked)} className="rounded" />
                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
                  <KeyRound className="h-4 w-4 text-amber-600" />Create portal login account
                </span>
              </label>
              {createLogin && (
                <>
                  <p className="text-xs text-amber-700">Share this temporary password — the nurse must change it on first login.</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type={showPw ? "text" : "password"} value={tempPw}
                        onChange={e => setTempPw(e.target.value)}
                        className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none pr-10" />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => setTempPw(generateTempPassword())}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => navigator.clipboard.writeText(tempPw)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">
              {isEdit ? "Save Changes" : "Add Nurse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Nurses() {
  const { user } = useAuth();
  const { accounts, create, remove, update } = useStaffAccounts();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const { toast } = useToast();

  const myEmail = user?.email ?? "";

  const nurses = accounts.filter(
    a => a.role === "nurse" && a.createdBy.toLowerCase() === myEmail.toLowerCase()
  );

  const filtered = nurses.filter(n =>
    !search ||
    n.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (n.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: any) => {
    if (editing) {
      update(editing.id, {
        displayName: data.displayName,
        department: data.department,
        phone: data.phone,
        availability: data.availability,
        shift: data.shift,
      });
      setEditing(null);
      toast({ title: "Nurse updated" });
    } else {
      const existing = accounts.find(a => a.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        toast({ title: "Email already registered", variant: "destructive" }); return;
      }
      create({
        role: "nurse",
        displayName: data.displayName,
        email: data.email,
        tempPassword: data.createLogin ? data.tempPw : `TmpNrs${Date.now()}`,
        createdBy: myEmail,
        department: data.department,
        phone: data.phone,
        availability: data.availability,
        shift: data.shift,
      });
      setShowForm(false);
      toast({ title: "Nurse added", description: data.createLogin ? `Temp password: ${data.tempPw}` : undefined });
    }
  };

  const handleDelete = (acc: StaffAccount) => {
    if (!confirm(`Remove ${acc.displayName} from the nurses list? This will also remove their login access.`)) return;
    remove(acc.id);
    toast({ title: "Nurse removed" });
  };

  return (
    <div className="space-y-6">
      {(showForm || editing) && (
        <NurseFormModal
          initial={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nurses</h1>
          <p className="text-muted-foreground mt-1">
            Manage nurse staff for your clinic — {nurses.length} registered.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white">
          <Plus className="h-4 w-4 mr-2" />Add Nurse
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, department…" value={search} onChange={e => setSearch(e.target.value)} className="h-9" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {["Nurse", "Department", "Shift", "Availability", "Contact", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <HeartPulse className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No nurses yet. Add your first nurse above.</p>
                </td>
              </tr>
            ) : filtered.map(n => (
              <tr key={n.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold flex-shrink-0">
                      {n.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{n.displayName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{n.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{n.department || <span className="text-muted-foreground italic">—</span>}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${SHIFT_COLORS[n.shift ?? "Morning"]}`}>
                    {n.shift ?? "Morning"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${AVAIL_COLORS[n.availability ?? "Available"]}`}>
                    {n.availability ?? "Available"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{n.phone || "—"}</td>
                <td className="px-4 py-3">
                  {n.mustChangePassword ? (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Temp Password</span>
                  ) : (
                    <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Active</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setEditing(n)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline"
                      className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(n)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
