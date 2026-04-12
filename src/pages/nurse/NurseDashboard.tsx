import React from "react";
import { Clock, Stethoscope, CheckCircle2, Users, Ticket, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { Link } from "wouter";

const statusColor: Record<string, string> = {
  Waiting: "bg-amber-100 text-amber-700",
  Called: "bg-blue-100 text-blue-700",
  "In Triage": "bg-orange-100 text-orange-700",
  "Vitals Done": "bg-purple-100 text-purple-700",
};

export function NurseDashboard() {
  const { user } = useAuth();
  const { tickets } = useCrossPortal();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Clinic isolation: nurse sees all tickets from their clinic
  const nurseTickets = tickets.filter((t) =>
    ["Waiting", "Called", "In Triage", "Vitals Done"].includes(t.status) &&
    (user?.role === "superadmin" || (t.clinicId === user?.clinicId))
  );
  const waiting = nurseTickets.filter((t) => ["Waiting", "Called"].includes(t.status));
  const inTriage = nurseTickets.filter((t) => t.status === "In Triage");
  const vitalsDone = nurseTickets.filter((t) => t.status === "Vitals Done");
  const emergencies = nurseTickets.filter((t) => t.visitType === "Emergency");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good morning, {user?.name ?? "Nurse"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Emergency alert */}
      {emergencies.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{emergencies.length} emergency patient{emergencies.length > 1 ? "s" : ""} in queue</p>
            <p className="text-xs text-red-700 mt-0.5">{emergencies.map((t) => t.patientName).join(", ")}</p>
          </div>
          <Link href="/nurse-dashboard/queue">
            <span className="ml-auto text-xs font-medium text-red-700 hover:underline cursor-pointer flex-shrink-0">Go to queue →</span>
          </Link>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Waiting / Called", value: waiting.length, icon: Clock, color: "text-amber-700", bg: "bg-amber-50", sub: "Needs to be called" },
          { label: "In Triage", value: inTriage.length, icon: Stethoscope, color: "text-orange-700", bg: "bg-orange-50", sub: "Vitals in progress" },
          { label: "Vitals Done", value: vitalsDone.length, icon: CheckCircle2, color: "text-purple-700", bg: "bg-purple-50", sub: "Ready for doctor" },
          { label: "Total in Queue", value: nurseTickets.length, icon: Users, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]", sub: "Active patients" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current queue */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Current Queue</h2>
            <Link href="/nurse-dashboard/queue">
              <span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">Manage →</span>
            </Link>
          </div>
          {nurseTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <Ticket className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Queue is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Patients will appear here after the receptionist registers and collects payment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {nurseTickets.slice(0, 7).map((t) => (
                <div key={t.ticketNo} className={`flex items-center justify-between px-5 py-3 ${t.visitType === "Emergency" ? "bg-red-50/30" : ""}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      {t.visitType === "Emergency" && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                      <span className="font-mono text-xs font-bold text-[#8B1A2F]">{t.ticketNo}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{t.patientName}</p>
                    <p className="text-xs text-muted-foreground">Age {t.age ?? "—"} · {t.visitType}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[t.status]}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/nurse-dashboard/queue", icon: Ticket, label: "Triage Queue", color: "bg-[#fdf2f4] text-[#8B1A2F] hover:bg-[#f0d0d6]" },
              { href: "/nurse-dashboard/medications", icon: CheckCircle2, label: "Medications", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
              { href: "/nurse-dashboard/tasks", icon: CheckCircle2, label: "Tasks", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
              { href: "/nurse-dashboard/notes", icon: CheckCircle2, label: "Clinical Notes", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent ${a.color} transition-all cursor-pointer`}>
                <a.icon className="h-6 w-6" />
                <span className="text-xs font-medium text-center">{a.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Nurse workflow</p>
            <p>Receptionist registers patient → you call &amp; triage → enter vitals → send to doctor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
