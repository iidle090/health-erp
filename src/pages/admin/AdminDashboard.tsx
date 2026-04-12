import React, { useMemo } from "react";
import { Users, Calendar, Activity, Stethoscope, FlaskConical, Pill, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStaffAccounts } from "@/context/StaffAccountStore";
import { usePatientStore } from "@/context/PatientStore";
import { useCrossPortal } from "@/context/CrossPortalStore";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { accounts } = useStaffAccounts();
  const { getClinicPatients } = usePatientStore();
  const { tickets, prescriptions, invoices } = useCrossPortal();

  const myAccounts = useMemo(() =>
    accounts.filter(a =>
      user?.role === "superadmin" || (a.clinicId === user?.clinicId)
    ), [accounts, user]);

  const myPatients = useMemo(() =>
    getClinicPatients(user?.clinicId), [getClinicPatients, user?.clinicId]);

  const myTickets = useMemo(() =>
    tickets.filter(t =>
      user?.role === "superadmin" || (t.clinicId === user?.clinicId)
    ), [tickets, user]);

  const myInvoices = useMemo(() =>
    invoices.filter(i =>
      user?.role === "superadmin" || (i.clinicId === user?.clinicId)
    ), [invoices, user]);

  const doctorCount      = myAccounts.filter(a => a.role === "doctor").length;
  const nurseCount       = myAccounts.filter(a => a.role === "nurse").length;
  const labCount         = myAccounts.filter(a => a.role === "lab").length;
  const pharmacyCount    = myAccounts.filter(a => a.role === "pharmacy").length;
  const totalStaff       = myAccounts.filter(a => a.role !== "admin" && a.role !== "superadmin").length;

  const activePatients   = myPatients.length;
  const pendingTickets   = myTickets.filter(t => t.status === "Waiting" || t.status === "In Progress").length;
  const completedTickets = myTickets.filter(t => t.status === "Completed").length;

  const totalRevenue     = myInvoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.paidAmount, 0);
  const unpaidInvoices   = myInvoices.filter(i => i.status === "Unpaid" || i.status === "Partial").length;

  const recentPatients = [...myPatients].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}. Here's what's happening today.
        </p>
        {!user?.clinicId && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            No clinic assigned — contact Super Admin to link this account to a clinic.
          </div>
        )}
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Patients"
          value={activePatients}
          sub="Registered in this clinic"
          icon={Users}
          color="text-[#8B1A2F]"
          bg="bg-[#fdf2f4]"
        />
        <StatCard
          label="Total Doctors"
          value={doctorCount}
          sub={`${nurseCount} nurses on staff`}
          icon={Stethoscope}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <StatCard
          label="Appointments"
          value={pendingTickets + completedTickets}
          sub={`${pendingTickets} pending · ${completedTickets} completed`}
          icon={Calendar}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub={`${unpaidInvoices} unpaid invoice${unpaidInvoices !== 1 ? "s" : ""}`}
          icon={Activity}
          color="text-green-700"
          bg="bg-green-50"
        />
      </div>

      {/* Staff Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Stethoscope className="h-4 w-4 text-amber-700" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Doctors</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{doctorCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Users className="h-4 w-4 text-orange-700" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nurses</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{nurseCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FlaskConical className="h-4 w-4 text-blue-700" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Lab</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{labCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <Pill className="h-4 w-4 text-green-700" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Pharmacy</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{pharmacyCount}</p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Patients</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest patients admitted to this clinic</p>
          </div>
          <div className="divide-y divide-border">
            {recentPatients.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No patients registered yet. Add patients via the Patients page.
              </div>
            ) : (
              recentPatients.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.id} · {p.age} yrs · {p.gender}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    p.status === "Active" ? "bg-green-100 text-green-700" :
                    p.status === "Critical" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{p.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Staff Summary */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Staff Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{totalStaff} active staff members</p>
          </div>
          <div className="divide-y divide-border">
            {[
              { role: "doctor", label: "Doctors", count: doctorCount, color: "bg-amber-100 text-amber-700" },
              { role: "nurse", label: "Nurses", count: nurseCount, color: "bg-orange-100 text-orange-700" },
              { role: "lab", label: "Lab", count: labCount, color: "bg-blue-100 text-blue-700" },
              { role: "pharmacy", label: "Pharmacy", count: pharmacyCount, color: "bg-green-100 text-green-700" },
              { role: "accountant", label: "Accountants", count: myAccounts.filter(a => a.role === "accountant").length, color: "bg-purple-100 text-purple-700" },
              { role: "receptionist", label: "Receptionists", count: myAccounts.filter(a => a.role === "receptionist").length, color: "bg-teal-100 text-teal-700" },
              { role: "radiology", label: "Radiology", count: myAccounts.filter(a => a.role === "radiology").length, color: "bg-sky-100 text-sky-700" },
            ].filter(r => r.count > 0).map(r => (
              <div key={r.role} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{r.label}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.color}`}>
                  {r.count}
                </span>
              </div>
            ))}
            {totalStaff === 0 && (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No staff registered yet. Go to Staff Accounts to add your team.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
