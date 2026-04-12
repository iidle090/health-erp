import React from "react";
import { Users, FlaskConical, ClipboardList, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { Link } from "wouter";

const statusColor: Record<string, string> = {
  "Waiting Doctor": "bg-amber-100 text-amber-700",
  "In Consultation": "bg-[#fdf2f4] text-[#8B1A2F]",
  Completed: "bg-green-100 text-green-700",
};

export function DoctorDashboard() {
  const { user } = useAuth();
  const { tickets, labOrders } = useCrossPortal();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Clinic isolation: only show tickets from this doctor's clinic
  const clinicTickets = tickets.filter((t) =>
    user?.role === "superadmin" || (t.clinicId === user?.clinicId)
  );

  const myPatients = clinicTickets.filter((t) => ["Waiting Doctor", "In Consultation", "Completed"].includes(t.status));
  const waiting = clinicTickets.filter((t) => t.status === "Waiting Doctor");
  const inConsultation = clinicTickets.filter((t) => t.status === "In Consultation");
  const completed = clinicTickets.filter((t) => t.status === "Completed");
  const pendingLabs = labOrders.filter((o) => o.status === "Pending" || o.status === "In Progress");
  const completedLabs = labOrders.filter((o) => o.status === "Completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good morning, {user?.name ?? "Doctor"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Waiting for You", value: waiting.length, icon: Clock, color: "text-amber-700", bg: "bg-amber-50", sub: "Vitals done — ready" },
          { label: "In Consultation", value: inConsultation.length, icon: Users, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]", sub: "Currently with you" },
          { label: "Pending Lab Results", value: pendingLabs.length, icon: FlaskConical, color: "text-blue-700", bg: "bg-blue-50", sub: `${completedLabs.length} completed` },
          { label: "Completed Today", value: completed.length, icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50", sub: "Consultations done" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient queue */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Patient Queue</h2>
            <Link href="/doctor-dashboard/patients">
              <span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all →</span>
            </Link>
          </div>
          {myPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No patients yet</p>
              <p className="text-xs text-muted-foreground mt-1">Patients will appear here after the nurse completes triage and sends them to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {myPatients.slice(0, 6).map((t) => (
                <div key={t.ticketNo} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#8B1A2F]">{t.ticketNo}</span>
                      <span className="text-xs text-muted-foreground">{t.patientId}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{t.patientName}</p>
                    <p className="text-xs text-muted-foreground">{t.visitType} · Age {t.age ?? "—"}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[t.status]}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending lab results */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Lab Orders</h2>
            <Link href="/doctor-dashboard/lab-results">
              <span className="text-xs text-[#8B1A2F] hover:underline cursor-pointer">View all →</span>
            </Link>
          </div>
          {labOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <FlaskConical className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No lab orders yet</p>
              <p className="text-xs text-muted-foreground mt-1">Lab orders you place for patients will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {labOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#8B1A2F]">{o.id}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${o.priority === "STAT" ? "bg-red-100 text-red-700" : o.priority === "Urgent" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{o.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{o.patientName}</p>
                    <p className="text-xs text-muted-foreground">{o.tests.slice(0, 2).join(", ")}{o.tests.length > 2 ? ` +${o.tests.length - 2}` : ""}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${o.status === "Completed" ? "bg-green-100 text-green-700" : o.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert if patients waiting */}
      {waiting.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{waiting.length} patient{waiting.length > 1 ? "s" : ""} waiting for consultation</p>
            <p className="text-xs text-amber-700 mt-0.5">{waiting.map((t) => t.patientName).join(", ")} — vitals completed by nurse</p>
          </div>
          <Link href="/doctor-dashboard/patients">
            <span className="ml-auto text-xs font-medium text-amber-700 hover:underline cursor-pointer flex-shrink-0">See patients →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
