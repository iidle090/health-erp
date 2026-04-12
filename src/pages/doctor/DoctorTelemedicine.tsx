import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, PhoneOff, Link2, Copy, Check, Clock, Calendar, AlertCircle,
  Plus, CircleDot, CheckCircle2, X, UserCheck, UserPlus, Pill,
  Send, Trash2, ChevronDown, ChevronUp, FileText, Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCrossPortal, PharmacyPrescription } from "@/context/CrossPortalStore";
import { usePatientStore, SharedPatient } from "@/context/PatientStore";

interface TeleSession {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientId: string;
  patientContact: string;
  reason: string;
  scheduledAt: string;
  duration: number;
  status: "Scheduled" | "Active" | "Completed" | "Missed";
  roomId: string;
  notes?: string;
  rxSent?: boolean;
  registered?: boolean;
}

interface RxItem {
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
  qty: number;
  price: number;
}

const INITIAL_SESSIONS: TeleSession[] = [];

const COMMON_MEDS = [
  "Amoxicillin 500mg", "Paracetamol 500mg", "Ibuprofen 400mg", "Metformin 500mg",
  "Lisinopril 10mg", "Atorvastatin 20mg", "Omeprazole 20mg", "Cetirizine 10mg",
  "Azithromycin 500mg", "Prednisolone 5mg", "Metronidazole 400mg", "Ciprofloxacin 500mg",
];
const ROUTES = ["Oral", "IV", "IM", "Topical", "Inhalation", "Sublingual"];
const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "As needed", "Every 8 hours", "Every 12 hours", "Weekly"];

function formatScheduled(iso: string) {
  return new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  return `in ${Math.floor(mins / 60)}h ${mins % 60}m`;
}
const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2);

const STATUS_CFG = {
  Scheduled: { cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Active:    { cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500 animate-pulse" },
  Completed: { cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  Missed:    { cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
};

export function DoctorTelemedicine() {
  const { toast } = useToast();
  const { addPrescription, prescriptions } = useCrossPortal();
  const { addPatient, patients } = usePatientStore();

  const [sessions, setSessions] = useState<TeleSession[]>(INITIAL_SESSIONS);
  const [activeSession, setActiveSession] = useState<TeleSession | null>(null);
  const [callLoading, setCallLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [showNew, setShowNew] = useState(false);

  const [rxItems, setRxItems] = useState<RxItem[]>([{ medication: "", dosage: "", frequency: "Once daily", route: "Oral", qty: 14, price: 0 }]);
  const [consultNotes, setConsultNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [rxSending, setRxSending] = useState(false);
  const [rxCollapsed, setRxCollapsed] = useState(false);

  const upcoming = sessions.filter(s => s.status === "Scheduled" || s.status === "Active");
  const past = sessions.filter(s => s.status === "Completed" || s.status === "Missed");

  const isPatientRegistered = (session: TeleSession) =>
    session.registered || patients.some(p => p.id === session.patientId);

  const patientJoinUrl = (roomId: string) => `https://meet.jit.si/${roomId}`;

  const startCall = async (session: TeleSession) => {
    setCallLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const updated = { ...session, status: "Active" as const };
    setSessions(prev => prev.map(s => s.id === session.id ? updated : s));
    setActiveSession(updated);
    setRxItems([{ medication: "", dosage: "", frequency: "Once daily", route: "Oral", qty: 14, price: 0 }]);
    setConsultNotes("");
    setDiagnosis("");
    setCallLoading(false);
  };

  const endCall = () => {
    if (!activeSession) return;
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, status: "Completed" as const, notes: consultNotes || s.notes } : s));
    setActiveSession(null);
    toast({ title: "Call ended", description: "Session marked as completed." });
  };

  const registerPatient = (session: TeleSession) => {
    if (isPatientRegistered(session)) return;
    const today = new Date().toISOString().split("T")[0];
    const newPatient: SharedPatient = {
      id: session.patientId,
      name: session.patientName,
      age: session.patientAge,
      gender: session.patientGender,
      dob: `${new Date().getFullYear() - session.patientAge}-01-01`,
      bloodType: "Unknown",
      condition: session.reason,
      lastVisit: today,
      status: "Stable",
      contact: session.patientContact,
      bedNumber: "-",
      roomNumber: "Telemedicine",
      admissionStatus: "Observation",
      isolationStatus: "None",
      allergies: [],
      vitals: { bp: "-", heartRate: "-", temperature: "-", oxygen: "-", respiratoryRate: "-", weight: "-", height: "-", bmi: "-", recordedAt: today, vitalStatus: "normal" },
      prescriptions: [],
      labResults: [],
      tasks: [],
      notes: `Registered via telemedicine. Chief complaint: ${session.reason}`,
      registeredBy: "system",
    };
    addPatient(newPatient);
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, registered: true } : s));
    if (activeSession?.id === session.id) setActiveSession(prev => prev ? { ...prev, registered: true } : prev);
    toast({ title: "Patient registered!", description: `${session.patientName} added to your patient list.` });
  };

  const addRxRow = () => setRxItems(prev => [...prev, { medication: "", dosage: "", frequency: "Once daily", route: "Oral", qty: 14, price: 0 }]);
  const removeRxRow = (i: number) => setRxItems(prev => prev.filter((_, idx) => idx !== i));
  const updateRxRow = (i: number, field: keyof RxItem, value: string | number) =>
    setRxItems(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const sendPrescription = async () => {
    if (!activeSession) return;
    const validItems = rxItems.filter(r => r.medication.trim());
    if (!validItems.length) { toast({ title: "Add at least one medication", description: "", variant: "destructive" }); return; }
    setRxSending(true);
    await new Promise(r => setTimeout(r, 800));
    const rx: PharmacyPrescription = {
      id: `RX-TM-${String(prescriptions.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`,
      patientId: activeSession.patientId,
      patientName: activeSession.patientName,
      prescribedBy: "Dr. Smith (Telemedicine)",
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      items: validItems.map(r => ({ medication: r.medication, dosage: r.dosage, qty: r.qty, route: r.route, frequency: r.frequency, price: r.price })),
      totalAmount: validItems.reduce((sum, r) => sum + r.price * r.qty, 0),
      notes: [diagnosis ? `Diagnosis: ${diagnosis}` : "", consultNotes ? `Notes: ${consultNotes}` : ""].filter(Boolean).join(" | ") || "Telemedicine consultation",
    };
    addPrescription(rx);
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, rxSent: true } : s));
    if (activeSession) setActiveSession(prev => prev ? { ...prev, rxSent: true } : prev);
    setRxSending(false);
    toast({ title: "Prescription sent to pharmacy!", description: `${validItems.length} medication(s) queued for ${activeSession.patientName}.` });
  };

  const copyLink = async (roomId: string) => {
    await navigator.clipboard.writeText(patientJoinUrl(roomId));
    setCopied(roomId);
    toast({ title: "Link copied!", description: "Share this with the patient to join the call." });
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-5 w-5 text-[#8B1A2F]" /> Telemedicine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Video consultations · register patients · send online prescriptions</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
          <Plus className="h-4 w-4" /> Schedule Call
        </Button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Session list — always visible, narrows when call active */}
        <div className={`flex flex-col border-r border-border overflow-hidden shrink-0 transition-all duration-300 ${activeSession ? "w-72" : "flex-1"}`}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 px-3 py-3 bg-muted/30 border-b border-border">
            {[
              { label: "Today", value: upcoming.length, cls: "text-blue-600" },
              { label: "Done", value: past.filter(p => p.status === "Completed").length, cls: "text-green-600" },
              { label: "Missed", value: past.filter(p => p.status === "Missed").length, cls: "text-red-500" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border shrink-0">
            {(["upcoming", "past"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {(tab === "upcoming" ? upcoming : past).map(session => {
              const cfg = STATUS_CFG[session.status];
              const until = timeUntil(session.scheduledAt);
              const isActive = activeSession?.id === session.id;
              const registered = isPatientRegistered(session);

              return (
                <div key={session.id}
                  className={`rounded-xl border p-3 transition-all ${isActive ? "border-green-400 bg-green-50" : "border-border bg-card hover:shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fdf2f4] text-[#8B1A2F] font-semibold text-xs shrink-0">
                        {initials(session.patientName)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground leading-tight">{session.patientName}</p>
                        <p className="text-[10px] text-muted-foreground">{session.patientAge}y · {session.patientGender}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {session.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground mb-1 truncate">{session.reason}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                    <span>{formatScheduled(session.scheduledAt)}</span>
                    {until && <span className="text-blue-600 font-medium">{until}</span>}
                  </div>

                  {/* Registration & Rx badges */}
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {registered && (
                      <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                        <UserCheck className="h-2.5 w-2.5" /> Registered
                      </span>
                    )}
                    {session.rxSent && (
                      <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                        <Pill className="h-2.5 w-2.5" /> Rx Sent
                      </span>
                    )}
                  </div>

                  {session.notes && <p className="text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-2 py-1 mb-2">{session.notes}</p>}

                  {(session.status === "Scheduled" || session.status === "Active") && (
                    <div className="flex gap-1.5">
                      {session.status === "Scheduled" && !isActive && (
                        <Button size="sm" onClick={() => startCall(session)} disabled={callLoading}
                          className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-[10px] gap-1 h-7">
                          <Video className="h-3 w-3" />{callLoading ? "…" : "Start"}
                        </Button>
                      )}
                      {isActive && (
                        <Button size="sm" onClick={endCall}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] gap-1 h-7">
                          <PhoneOff className="h-3 w-3" />End
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copyLink(session.roomId)} className="gap-1 h-7 text-[10px] px-2">
                        {copied === session.roomId ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        Link
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {(tab === "upcoming" ? upcoming : past).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Video className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No {tab} sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Active call area */}
        <AnimatePresence>
          {activeSession && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 overflow-hidden">

              {/* Video panel */}
              <div className="flex flex-col flex-1 bg-gray-950 overflow-hidden">
                {/* Call bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> LIVE
                    </span>
                    <span className="text-white text-sm font-medium">{activeSession.patientName}</span>
                    <span className="text-gray-400 text-xs">· {activeSession.reason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => copyLink(activeSession.roomId)}
                      className="text-gray-300 hover:text-white hover:bg-gray-700 h-7 text-xs gap-1.5">
                      {copied === activeSession.roomId ? <><Check className="h-3.5 w-3.5 text-green-400" /><span className="text-green-400">Copied</span></> : <><Link2 className="h-3.5 w-3.5" />Patient Link</>}
                    </Button>
                    <Button size="sm" onClick={endCall}
                      className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs gap-1.5 px-3">
                      <PhoneOff className="h-3.5 w-3.5" />End Call
                    </Button>
                  </div>
                </div>

                {/* Jitsi */}
                <div className="flex-1 relative">
                  <iframe
                    key={activeSession.roomId}
                    src={`https://meet.jit.si/${activeSession.roomId}#userInfo.displayName="Dr. Smith"`}
                    allow="camera; microphone; fullscreen; display-capture; picture-in-picture"
                    className="w-full h-full border-0"
                    title="Telemedicine Video Call"
                  />
                </div>

                {/* Patient link bar */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-t border-gray-800 shrink-0">
                  <span className="text-gray-400 text-xs shrink-0">Patient joins at:</span>
                  <code className="flex-1 text-xs text-blue-300 truncate font-mono">{patientJoinUrl(activeSession.roomId)}</code>
                  <button onClick={() => copyLink(activeSession.roomId)} className="text-gray-400 hover:text-white shrink-0">
                    {copied === activeSession.roomId ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Right consultation panel */}
              <div className="w-80 flex flex-col border-l border-border bg-card overflow-y-auto shrink-0">

                {/* Patient Registration */}
                <div className="p-4 border-b border-border">
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-[#8B1A2F]" /> Patient Registration
                  </p>
                  {isPatientRegistered(activeSession) ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700">Registered as your patient</p>
                        <p className="text-[10px] text-green-600">{activeSession.patientId}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-3 text-center">
                      <UserPlus className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground mb-2">This patient is not in your patient list yet.</p>
                      <Button size="sm" onClick={() => registerPatient(activeSession)}
                        className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-xs gap-1.5 h-7 w-full">
                        <UserPlus className="h-3 w-3" /> Register as My Patient
                      </Button>
                    </div>
                  )}
                </div>

                {/* Consultation Notes */}
                <div className="p-4 border-b border-border">
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-[#8B1A2F]" /> Consultation
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium">Diagnosis / ICD Code</label>
                      <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                        placeholder="e.g. Essential hypertension, I10"
                        className="mt-0.5 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/40" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium">Clinical Notes</label>
                      <textarea value={consultNotes} onChange={e => setConsultNotes(e.target.value)}
                        rows={3} placeholder="Patient complaints, findings, plan…"
                        className="mt-0.5 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/40 resize-none" />
                    </div>
                  </div>
                </div>

                {/* Online Prescription */}
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-[#8B1A2F]" /> Online Prescription
                    </p>
                    <button onClick={() => setRxCollapsed(!rxCollapsed)} className="text-muted-foreground hover:text-foreground">
                      {rxCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {activeSession.rxSent && (
                    <div className="flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 mb-2">
                      <Send className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <p className="text-[10px] text-purple-700 font-medium">Prescription sent to pharmacy</p>
                    </div>
                  )}

                  {!rxCollapsed && (
                    <div className="space-y-2.5">
                      {rxItems.map((item, i) => (
                        <div key={i} className="rounded-lg border border-border p-2.5 space-y-2 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground">Medication {i + 1}</span>
                            {rxItems.length > 1 && (
                              <button onClick={() => removeRxRow(i)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          {/* Medication name */}
                          <div>
                            <label className="text-[10px] text-muted-foreground">Drug &amp; Strength</label>
                            <input
                              list={`meds-${i}`}
                              value={item.medication}
                              onChange={e => updateRxRow(i, "medication", e.target.value)}
                              placeholder="e.g. Amoxicillin 500mg"
                              className="mt-0.5 w-full rounded border border-border px-2 py-1 text-[11px] bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/40"
                            />
                            <datalist id={`meds-${i}`}>{COMMON_MEDS.map(m => <option key={m} value={m} />)}</datalist>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[10px] text-muted-foreground">Dosage</label>
                              <input value={item.dosage} onChange={e => updateRxRow(i, "dosage", e.target.value)}
                                placeholder="e.g. 500mg"
                                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-[11px] bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/40" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Qty</label>
                              <input type="number" value={item.qty} min={1} onChange={e => updateRxRow(i, "qty", Number(e.target.value))}
                                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-[11px] bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/40" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[10px] text-muted-foreground">Frequency</label>
                              <select value={item.frequency} onChange={e => updateRxRow(i, "frequency", e.target.value)}
                                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-[11px] bg-background focus:outline-none">
                                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Route</label>
                              <select value={item.route} onChange={e => updateRxRow(i, "route", e.target.value)}
                                className="mt-0.5 w-full rounded border border-border px-2 py-1 text-[11px] bg-background focus:outline-none">
                                {ROUTES.map(r => <option key={r}>{r}</option>)}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-muted-foreground">Unit Price (GH₵)</label>
                            <input type="number" value={item.price} min={0} step={0.01} onChange={e => updateRxRow(i, "price", Number(e.target.value))}
                              className="mt-0.5 w-full rounded border border-border px-2 py-1 text-[11px] bg-background focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]/40" />
                          </div>
                        </div>
                      ))}

                      <button onClick={addRxRow}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-[#8B1A2F]/40 transition-colors">
                        <Plus className="h-3 w-3" /> Add medication
                      </button>

                      {/* Total */}
                      <div className="flex items-center justify-between px-1 text-xs">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-foreground">
                          GH₵ {rxItems.reduce((s, r) => s + r.price * r.qty, 0).toFixed(2)}
                        </span>
                      </div>

                      <Button onClick={sendPrescription} disabled={rxSending}
                        className="w-full bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-xs gap-2 h-8">
                        <Send className="h-3.5 w-3.5" />
                        {rxSending ? "Sending…" : "Send to Pharmacy"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no active call */}
        {!activeSession && (
          <div className="hidden" />
        )}
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Schedule Telemedicine Call</h2>
                <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ScheduleForm
                onSubmit={data => {
                  const roomId = `shaniid-erp-${data.patientName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
                  const newSession: TeleSession = {
                    id: `TM-${String(sessions.length + 1).padStart(3, "0")}`,
                    patientName: data.patientName, patientAge: Number(data.patientAge),
                    patientGender: data.patientGender, patientId: `PT-TM-${String(sessions.length + 10).padStart(3, "0")}`,
                    patientContact: data.patientContact, reason: data.reason,
                    scheduledAt: data.scheduledAt, duration: Number(data.duration),
                    status: "Scheduled", roomId,
                  };
                  setSessions(prev => [newSession, ...prev]);
                  setShowNew(false);
                  toast({ title: "Call scheduled!", description: `Session with ${data.patientName} added.` });
                }}
                onCancel={() => setShowNew(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScheduleForm({ onSubmit, onCancel }: {
  onSubmit: (d: { patientName: string; patientAge: string; patientGender: string; patientContact: string; reason: string; scheduledAt: string; duration: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ patientName: "", patientAge: "", patientGender: "Male", patientContact: "", reason: "", scheduledAt: "", duration: "20" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const labelCls = "block text-xs font-medium text-foreground mb-1";
  const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30";
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Patient Name</label><input className={inputCls} placeholder="Full name" value={form.patientName} onChange={set("patientName")} required /></div>
        <div><label className={labelCls}>Age</label><input type="number" className={inputCls} placeholder="Age" value={form.patientAge} onChange={set("patientAge")} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Gender</label>
          <select className={inputCls} value={form.patientGender} onChange={set("patientGender")}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div><label className={labelCls}>Contact / Phone</label><input className={inputCls} placeholder="+233-…" value={form.patientContact} onChange={set("patientContact")} /></div>
      </div>
      <div><label className={labelCls}>Reason for Consultation</label><input className={inputCls} placeholder="e.g. Hypertension follow-up" value={form.reason} onChange={set("reason")} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Date &amp; Time</label><input type="datetime-local" className={inputCls} value={form.scheduledAt} onChange={set("scheduledAt")} required /></div>
        <div><label className={labelCls}>Duration</label>
          <select className={inputCls} value={form.duration} onChange={set("duration")}>
            {["10","15","20","30","45","60"].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Schedule</Button>
      </div>
    </form>
  );
}
