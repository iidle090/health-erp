import React, { useState } from "react";
import { UserPlus, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";
import { useStaffAccounts } from "@/context/StaffAccountStore";

export function ReceptionistPatientReg() {
  const { tickets, addTicket } = useCrossPortal();
  const { user } = useAuth();
  const { accounts } = useStaffAccounts();

  // Pull real doctors from this clinic only — direct clinicId match
  const myClinicDoctors = accounts.filter((a) => {
    if (a.role !== "doctor") return false;
    if (user?.role === "superadmin") return true;
    return a.clinicId === user?.clinicId; // null === null is true: unassigned staff see each other
  });

  const defaultDoctor = myClinicDoctors[0]?.displayName ?? "Unassigned";

  const emptyForm = {
    fullName: "", dob: "", gender: "Female" as const, phone: "", address: "",
    emergencyContact: "", emergencyPhone: "",
    visitType: "Consultation" as "Consultation" | "Follow-up" | "Emergency",
    assignedDoctor: defaultDoctor,
    insuranceProvider: "", notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState<{ patientId: string; visitId: string; ticketNo: string } | null>(null);

  const set = (k: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const getAge = (dob: string) => {
    if (!dob) return undefined;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = tickets.length + 1;
    const patientId = `PT-${10000 + num + Math.floor(Math.random() * 100)}`;
    const visitId = `VIS-${Date.now().toString().slice(-6)}`;
    const ticketNo = `T-${Date.now().toString().slice(-5)}`;

    addTicket({
      ticketNo,
      patientId,
      patientName: form.fullName,
      visitType: form.visitType,
      assignedDoctor: form.assignedDoctor,
      status: "Waiting",
      consultationFee: form.visitType === "Emergency" ? 200 : form.visitType === "Follow-up" ? 80 : 150,
      paid: false,
      createdAt: new Date().toLocaleString("en-US"),
      age: getAge(form.dob),
      gender: form.gender,
      phone: form.phone,
      notes: form.notes || undefined,
      clinicId: user?.clinicId, // stamp the clinic — this is the key isolation fix
    });

    setResult({ patientId, visitId, ticketNo });
  };

  const copyText = (text: string) => navigator.clipboard.writeText(text).catch(() => {});

  if (result) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border border-[#f0d0d6] bg-[#fdf2f4] p-8 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white mx-auto shadow-sm">
            <CheckCircle className="h-8 w-8 text-[#8B1A2F]" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Patient Registered</h2>
          <p className="text-sm text-muted-foreground">{form.fullName} has been registered and a ticket has been issued.</p>
          <div className="space-y-3 text-left bg-white rounded-xl border border-[#f0d0d6] p-4">
            {[
              { label: "Patient ID", value: result.patientId },
              { label: "Visit ID", value: result.visitId },
              { label: "Ticket Number", value: result.ticketNo, highlight: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`font-mono font-bold ${item.highlight ? "text-[#8B1A2F] text-lg" : "text-foreground text-sm"}`}>{item.value}</p>
                </div>
                <button onClick={() => copyText(item.value)} className="p-1.5 rounded hover:bg-[#fdf2f4] text-muted-foreground hover:text-[#8B1A2F]">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground bg-white rounded-lg border border-[#f0d0d6] px-3 py-2">
            Please proceed to <strong>Billing</strong> to collect the consultation fee before proceeding to the nurse.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>Register Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patient Registration</h1>
        <p className="text-sm text-muted-foreground mt-1">Register a new patient and generate their ticket number</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <UserPlus className="h-4 w-4 text-[#8B1A2F]" />
          <h2 className="font-semibold text-foreground">Patient Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5"><Label>Full Name *</Label><Input required value={form.fullName} onChange={set("fullName")} placeholder="First and last name" /></div>
          <div className="space-y-1.5"><Label>Date of Birth *</Label><Input required type="date" value={form.dob} onChange={set("dob")} /></div>
          <div className="space-y-1.5"><Label>Gender</Label>
            <select value={form.gender} onChange={set("gender")} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {["Female","Male","Other"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1.5"><Label>Phone Number *</Label><Input required value={form.phone} onChange={set("phone")} placeholder="+1-555-0000" /></div>
          <div className="space-y-1.5"><Label>Insurance Provider</Label><Input value={form.insuranceProvider} onChange={set("insuranceProvider")} placeholder="e.g. BlueCross (optional)" /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={set("address")} placeholder="Street, City, State" /></div>
        </div>

        <div className="flex items-center gap-2 pt-2 pb-2 border-b border-border/50">
          <h2 className="font-semibold text-foreground text-sm">Emergency Contact</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Contact Name</Label><Input value={form.emergencyContact} onChange={set("emergencyContact")} placeholder="Emergency contact name" /></div>
          <div className="space-y-1.5"><Label>Contact Phone</Label><Input value={form.emergencyPhone} onChange={set("emergencyPhone")} placeholder="+1-555-0000" /></div>
        </div>

        <div className="flex items-center gap-2 pt-2 pb-2 border-b border-border/50">
          <h2 className="font-semibold text-foreground text-sm">Visit Details</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Visit Type *</Label>
            <select value={form.visitType} onChange={set("visitType")} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {["Consultation","Follow-up","Emergency"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Assign to Doctor</Label>
            {myClinicDoctors.length > 0 ? (
              <select value={form.assignedDoctor} onChange={set("assignedDoctor")} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {myClinicDoctors.map((d) => <option key={d.id} value={d.displayName}>{d.displayName}{d.specialty ? ` — ${d.specialty}` : ""}</option>)}
              </select>
            ) : (
              <div className="h-10 flex items-center px-3 text-sm text-muted-foreground rounded-md border border-input bg-muted/30">
                No doctors registered yet
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5"><Label>Notes</Label>
          <textarea value={form.notes} onChange={set("notes")} placeholder="Any additional notes..." rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
          <strong>Fees:</strong> Consultation $150 · Follow-up $80 · Emergency $200 — Payment collected at billing after registration.
        </div>

        <Button type="submit" className="w-full gap-2 h-11"><UserPlus className="h-4 w-4" />Register Patient &amp; Generate Ticket</Button>
      </form>
    </div>
  );
}
