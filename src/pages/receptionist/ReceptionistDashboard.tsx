import React from "react";
import { Ticket, UserPlus, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const statusColor: Record<string, string> = {
  Waiting: "bg-amber-100 text-amber-700",
  Called: "bg-blue-100 text-blue-700",
  "In Triage": "bg-orange-100 text-orange-700",
  "Vitals Done": "bg-purple-100 text-purple-700",
  "Waiting Doctor": "bg-[#fdf2f4] text-[#8B1A2F]",
  "In Consultation": "bg-[#fdf2f4] text-[#8B1A2F]",
  Completed: "bg-green-100 text-green-700",
};

export function ReceptionistDashboard() {
  const { tickets } = useCrossPortal();
  const { user } = useAuth();

  // Clinic isolation: only show tickets from this clinic
  const today = tickets.filter((t) =>
    user?.role === "superadmin" || (t.clinicId === user?.clinicId)
  );
  const waiting = today.filter((t) => t.status === "Waiting").length;
  const inProgress = today.filter((t) => ["Called", "In Triage", "Vitals Done", "Waiting Doctor", "In Consultation"].includes(t.status)).length;
  const completed = today.filter((t) => t.status === "Completed").length;
  const unpaid = today.filter((t) => !t.paid).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reception Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Front desk overview — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Waiting", count: waiting, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "In Progress", count: inProgress, icon: Ticket, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]" },
          { label: "Completed Today", count: completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Unpaid", count: unpaid, icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-3xl font-bold text-foreground">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/receptionist/register", icon: UserPlus, label: "Register Patient", color: "bg-[#fdf2f4] text-[#8B1A2F] hover:bg-[#f0d0d6]" },
              { href: "/receptionist/billing", icon: CreditCard, label: "Collect Payment", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
              { href: "/receptionist/queue", icon: Ticket, label: "Manage Queue", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
              { href: "/receptionist/receipts", icon: CheckCircle, label: "View Receipts", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            ].map((a) => (
              <Link key={a.href} href={a.href}>
                <a className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent ${a.color} transition-all cursor-pointer`}>
                  <a.icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">{a.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's ticket list */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Today's Queue</h2>
            <Link href="/receptionist/queue"><span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all</span></Link>
          </div>
          <div className="divide-y divide-border/40">
            {today.slice(0, 6).map((t) => (
              <div key={t.ticketNo} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#8B1A2F]">{t.ticketNo}</span>
                    {!t.paid && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Unpaid</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{t.patientName}</p>
                  <p className="text-xs text-muted-foreground">{t.visitType} · {t.assignedDoctor}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[t.status]}`}>{t.status}</span>
              </div>
            ))}
            {today.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No tickets today.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
