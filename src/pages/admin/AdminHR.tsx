import React, { useState } from "react";
import { Users, DollarSign, Calendar, Plus, X, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCrossPortal, Expense } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";
import { useStaffAccounts, StaffAccount } from "@/context/StaffAccountStore";

/* ── Payroll supplement (salary data stored separately from accounts) ─── */
interface PayrollEntry {
  accountId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bankAccount: string;
  bankName: string;
  lastPayDate: string;
}

interface LeaveRequest {
  id: string; staffEmail: string; staffName: string; leaveType: string;
  startDate: string; endDate: string; days: number; reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface ShiftEntry {
  id: string; accountId: string; staffName: string; role: string;
  date: string; shiftStart: string; shiftEnd: string;
  type: "Morning" | "Afternoon" | "Night" | "On-Call";
  status: "Scheduled" | "Completed" | "Absent" | "Leave";
}

const PAYROLL_KEY = "health_erp_hr_payroll_v1";
const LEAVE_KEY   = "health_erp_hr_leave_v2";
const SHIFT_KEY   = "health_erp_hr_shifts_v2";

function loadOrDefault<T>(key: string, initial: T[]): T[] {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
}
function persist<T>(key: string, data: T[]) { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} }

const SHIFT_CFG: Record<ShiftEntry["type"], string> = {
  Morning: "bg-amber-100 text-amber-700",
  Afternoon: "bg-blue-100 text-blue-700",
  Night: "bg-purple-100 text-purple-700",
  "On-Call": "bg-red-100 text-red-700",
};
const SHIFT_STATUS_CFG: Record<ShiftEntry["status"], string> = {
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Absent: "bg-red-50 text-red-700 border-red-200",
  Leave: "bg-amber-50 text-amber-700 border-amber-200",
};

const ROLE_LABELS: Record<string, string> = {
  doctor: "Doctor", nurse: "Nurse", lab: "Lab Tech", pharmacy: "Pharmacist",
  accountant: "Accountant", receptionist: "Receptionist", radiology: "Radiologist",
};

function fmt(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

export function AdminHR() {
  const { toast } = useToast();
  const { addExpense } = useCrossPortal();
  const { user } = useAuth();
  const { accounts } = useStaffAccounts();

  const myEmail = user?.email ?? "";

  // All staff created by this admin (excludes admin/superadmin roles)
  const myStaff: StaffAccount[] = accounts.filter(
    a => !["admin", "superadmin"].includes(a.role) &&
    a.createdBy.toLowerCase() === myEmail.toLowerCase()
  );

  // Payroll data keyed by accountId
  const [payrollMap, setPayrollMap] = useState<Record<string, PayrollEntry>>(
    () => {
      const arr: PayrollEntry[] = loadOrDefault(PAYROLL_KEY, []);
      return Object.fromEntries(arr.map(p => [p.accountId, p]));
    }
  );
  const [leaveReqs, setLeaveReqs] = useState<LeaveRequest[]>(() => loadOrDefault(LEAVE_KEY, []));
  const [shifts, setShifts] = useState<ShiftEntry[]>(() => loadOrDefault(SHIFT_KEY, []));
  const [tab, setTab] = useState<"staff" | "payroll" | "leave" | "shifts">("staff");
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    accountId: myStaff[0]?.id ?? "",
    date: new Date().toISOString().split("T")[0],
    shiftStart: "08:00", shiftEnd: "16:00",
    type: "Morning" as ShiftEntry["type"],
  });
  const [editingPayroll, setEditingPayroll] = useState<string | null>(null);
  const [payrollForm, setPayrollForm] = useState({ baseSalary: 0, allowances: 0, deductions: 0, bankAccount: "", bankName: "" });

  const inp = "w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none";

  const pending = leaveReqs.filter(l => l.status === "Pending").length;

  const getPayroll = (id: string): PayrollEntry => payrollMap[id] ?? {
    accountId: id, baseSalary: 0, allowances: 0, deductions: 0,
    bankAccount: "—", bankName: "—", lastPayDate: "—",
  };

  const totalPayroll = myStaff.reduce((sum, s) => {
    const p = getPayroll(s.id);
    return sum + p.baseSalary + p.allowances - p.deductions;
  }, 0);

  const updateLeave = (id: string, status: "Approved" | "Rejected") => {
    const updated = leaveReqs.map(l => l.id === id ? { ...l, status } : l);
    setLeaveReqs(updated); persist(LEAVE_KEY, updated);
    toast({ title: `Leave ${status.toLowerCase()}` });
  };

  const processPayroll = () => {
    if (myStaff.length === 0) { toast({ title: "No staff to process payroll for", variant: "destructive" }); return; }
    const exp: Expense = {
      id: `EXP-PAY-${Date.now().toString().slice(-6)}`,
      clinicId: "clinic-001",
      date: new Date().toISOString().split("T")[0],
      category: "Staff Salaries",
      description: `Monthly Payroll — ${new Date().toLocaleString("default", { month: "long", year: "numeric" })} (${myStaff.length} staff)`,
      amount: totalPayroll,
      currency: "USD",
      paidBy: "Admin (Payroll Run)",
      paymentMethod: "Bank Transfer",
      status: "Paid",
      createdAt: new Date().toISOString(),
    };
    // Update last pay date in payroll map
    const now = new Date().toISOString().split("T")[0];
    const updated = { ...payrollMap };
    myStaff.forEach(s => { if (updated[s.id]) updated[s.id].lastPayDate = now; });
    setPayrollMap(updated);
    persist(PAYROLL_KEY, Object.values(updated));
    addExpense(exp);
    toast({ title: "Payroll processed!", description: `${fmt(totalPayroll)} recorded in Finance system` });
  };

  const savePayrollEntry = () => {
    if (!editingPayroll) return;
    const now = new Date().toISOString().split("T")[0];
    const entry: PayrollEntry = {
      accountId: editingPayroll,
      baseSalary: Number(payrollForm.baseSalary),
      allowances: Number(payrollForm.allowances),
      deductions: Number(payrollForm.deductions),
      bankAccount: payrollForm.bankAccount || "—",
      bankName: payrollForm.bankName || "—",
      lastPayDate: payrollMap[editingPayroll]?.lastPayDate ?? "—",
    };
    const updated = { ...payrollMap, [editingPayroll]: entry };
    setPayrollMap(updated);
    persist(PAYROLL_KEY, Object.values(updated));
    setEditingPayroll(null);
    toast({ title: "Payroll details saved" });
  };

  const openPayrollEdit = (id: string) => {
    const p = getPayroll(id);
    setPayrollForm({ baseSalary: p.baseSalary, allowances: p.allowances, deductions: p.deductions, bankAccount: p.bankAccount === "—" ? "" : p.bankAccount, bankName: p.bankName === "—" ? "" : p.bankName });
    setEditingPayroll(id);
  };

  const addShift = (ev: React.FormEvent) => {
    ev.preventDefault();
    const member = myStaff.find(s => s.id === shiftForm.accountId);
    if (!member) return;
    const newShift: ShiftEntry = {
      id: `SH-${Date.now().toString().slice(-5)}`,
      accountId: member.id, staffName: member.displayName,
      role: ROLE_LABELS[member.role] ?? member.role,
      date: shiftForm.date, shiftStart: shiftForm.shiftStart, shiftEnd: shiftForm.shiftEnd,
      type: shiftForm.type, status: "Scheduled",
    };
    const updated = [newShift, ...shifts];
    setShifts(updated); persist(SHIFT_KEY, updated);
    setShowShiftForm(false);
    toast({ title: "Shift scheduled", description: `${member.displayName} — ${shiftForm.type} on ${shiftForm.date}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-[#8B1A2F]" />HR & Payroll</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Staff records, salary management, and leave tracking</p>
        </div>
        {tab === "payroll" && (
          <Button onClick={processPayroll} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
            <DollarSign className="h-4 w-4" />Process Payroll
          </Button>
        )}
        {tab === "shifts" && myStaff.length > 0 && (
          <Button onClick={() => setShowShiftForm(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
            <Plus className="h-4 w-4" />Schedule Shift
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: myStaff.length, cls: "text-foreground" },
          { label: "Active Accounts", value: myStaff.filter(s => !s.mustChangePassword).length, cls: "text-green-600" },
          { label: "Leave Requests", value: pending, cls: pending > 0 ? "text-red-600" : "text-foreground" },
          { label: "Monthly Payroll", value: fmt(totalPayroll), cls: "text-[#8B1A2F]" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-border">
        {(["staff", "payroll", "leave", "shifts"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "shifts" ? "Shifts" : t}
            {t === "leave" && pending > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{pending}</span>}
          </button>
        ))}
      </div>

      {/* STAFF TAB */}
      {tab === "staff" && (
        myStaff.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/10 py-14 text-center">
            <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No staff yet. Add staff from the Staff Accounts page.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{["Staff", "Role", "Department", "Started", "Status"].map(h =>
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                )}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myStaff.map(s => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-[#8B1A2F]/10 flex items-center justify-center text-[#8B1A2F] text-xs font-bold flex-shrink-0">
                          {s.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{s.displayName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{ROLE_LABELS[s.role] ?? s.role}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.department || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.createdAt}</td>
                    <td className="px-4 py-3">
                      {s.mustChangePassword ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">Temp Password</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* PAYROLL TAB */}
      {tab === "payroll" && (
        <div className="space-y-4">
          {myStaff.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/10 py-14 text-center">
              <DollarSign className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No staff to manage payroll for. Add staff from Staff Accounts first.</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                Click the edit icon to set salary details for each staff member. Then click "Process Payroll" to record it.
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>{["Staff", "Role", "Base Salary", "Allowances", "Deductions", "Net Pay", "Bank", ""].map(h =>
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    )}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myStaff.map(s => {
                      const p = getPayroll(s.id);
                      const net = p.baseSalary + p.allowances - p.deductions;
                      return (
                        <tr key={s.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3"><p className="font-medium">{s.displayName}</p></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{ROLE_LABELS[s.role] ?? s.role}</td>
                          <td className="px-4 py-3 font-mono">{fmt(p.baseSalary)}</td>
                          <td className="px-4 py-3 font-mono text-green-600">+{fmt(p.allowances)}</td>
                          <td className="px-4 py-3 font-mono text-red-500">-{fmt(p.deductions)}</td>
                          <td className="px-4 py-3 font-mono font-bold">{fmt(net)}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{p.bankAccount} · {p.bankName}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openPayrollEdit(s.id)}>Edit</Button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted/30 font-semibold">
                      <td className="px-4 py-3 text-sm" colSpan={5}>Total Payroll</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#8B1A2F]">{fmt(totalPayroll)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* LEAVE TAB */}
      {tab === "leave" && (
        <div className="space-y-3">
          {leaveReqs.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/10 py-14 text-center">
              <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No leave requests yet.</p>
            </div>
          ) : leaveReqs.map(l => (
            <div key={l.id} className={`rounded-xl border p-4 ${l.status === "Pending" ? "border-amber-200 bg-amber-50/30" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{l.staffName}</p>
                  <p className="text-xs text-muted-foreground">{l.leaveType} · {l.days} days · {l.startDate} → {l.endDate}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${l.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : l.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{l.status}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{l.reason}</p>
              {l.status === "Pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateLeave(l.id, "Approved")} className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 gap-1">
                    <CheckCircle2 className="h-3 w-3" />Approve
                  </Button>
                  <Button size="sm" onClick={() => updateLeave(l.id, "Rejected")} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7">Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SHIFTS TAB */}
      {tab === "shifts" && (
        <div className="space-y-4">
          {shifts.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/10 py-14 text-center">
              <Calendar className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No shifts yet. Schedule shifts for your staff above.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>{["Staff", "Role", "Date", "Start", "End", "Type", "Status"].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  )}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shifts.map(sh => (
                    <tr key={sh.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{sh.staffName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{sh.role}</td>
                      <td className="px-4 py-3 text-sm">{sh.date}</td>
                      <td className="px-4 py-3 font-mono text-sm">{sh.shiftStart}</td>
                      <td className="px-4 py-3 font-mono text-sm">{sh.shiftEnd}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SHIFT_CFG[sh.type]}`}>{sh.type}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SHIFT_STATUS_CFG[sh.status]}`}>{sh.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PAYROLL EDIT MODAL */}
      {editingPayroll && (() => {
        const staff = myStaff.find(s => s.id === editingPayroll);
        if (!staff) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingPayroll(null)}>
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base">Payroll — {staff.displayName}</h2>
                <button onClick={() => setEditingPayroll(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Base Salary ($)", key: "baseSalary" },
                  { label: "Allowances ($)", key: "allowances" },
                  { label: "Deductions ($)", key: "deductions" },
                  { label: "Bank Account", key: "bankAccount" },
                  { label: "Bank Name", key: "bankName" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-medium">{label}</label>
                    <input
                      className={`w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none`}
                      type={["baseSalary", "allowances", "deductions"].includes(key) ? "number" : "text"}
                      value={(payrollForm as any)[key]}
                      onChange={e => setPayrollForm(p => ({ ...p, [key]: e.target.value }))}
                      min={0}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setEditingPayroll(null)}>Cancel</Button>
                <Button className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white" onClick={savePayrollEntry}>Save</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SHIFT FORM MODAL */}
      {showShiftForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowShiftForm(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="h-5 w-5 text-[#8B1A2F]" />Schedule Shift</h2>
              <button onClick={() => setShowShiftForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={addShift} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Staff Member</label>
                <select className={inp} value={shiftForm.accountId} onChange={e => setShiftForm(p => ({ ...p, accountId: e.target.value }))}>
                  {myStaff.map(s => <option key={s.id} value={s.id}>{s.displayName} ({ROLE_LABELS[s.role] ?? s.role})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Date</label>
                <input type="date" className={inp} value={shiftForm.date} onChange={e => setShiftForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Start Time</label>
                  <input type="time" className={inp} value={shiftForm.shiftStart} onChange={e => setShiftForm(p => ({ ...p, shiftStart: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium">End Time</label>
                  <input type="time" className={inp} value={shiftForm.shiftEnd} onChange={e => setShiftForm(p => ({ ...p, shiftEnd: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Shift Type</label>
                <select className={inp} value={shiftForm.type} onChange={e => setShiftForm(p => ({ ...p, type: e.target.value as ShiftEntry["type"] }))}>
                  {["Morning", "Afternoon", "Night", "On-Call"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowShiftForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
