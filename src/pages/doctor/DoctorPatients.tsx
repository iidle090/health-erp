import React, { useState } from "react";
import { Search, X, FlaskConical, CheckCircle, User, Stethoscope, Pill, ChevronRight, Activity, AlertCircle, Scan, ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCrossPortal, VisitTicket, LabOrder, ImagingOrder } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

const statusBadge: Record<string, string> = {
  "Waiting Doctor":  "bg-amber-100 text-amber-700",
  "In Consultation": "bg-[#fdf2f4] text-[#8B1A2F]",
  Completed:         "bg-green-100 text-green-700",
};

const visitTypeBadge: Record<string, string> = {
  Consultation: "bg-amber-50 text-amber-700",
  "Follow-up":  "bg-blue-50 text-blue-700",
  Emergency:    "bg-red-100 text-red-700",
};

const LAB_TEST_CATALOG = [
  { group: "Haematology", tests: ["CBC", "ESR", "Blood Smear", "Reticulocyte Count", "PT/INR", "aPTT"] },
  { group: "Chemistry — Metabolic", tests: ["BMP", "CMP", "BUN", "Creatinine", "Electrolytes", "Uric Acid", "eGFR"] },
  { group: "Chemistry — Cardiac", tests: ["Troponin I", "BNP", "NT-proBNP", "CK-MB", "LDH"] },
  { group: "Endocrinology", tests: ["HbA1c", "Fasting Blood Glucose", "Random Glucose", "TSH", "Free T4", "Free T3", "Insulin Level", "Cortisol"] },
  { group: "Lipid Panel", tests: ["Lipid Panel", "Total Cholesterol", "LDL", "HDL", "Triglycerides"] },
  { group: "Liver Function", tests: ["LFT", "ALT", "AST", "ALP", "GGT", "Total Bilirubin", "Albumin"] },
  { group: "Inflammatory / Infection", tests: ["CRP", "Procalcitonin", "Rheumatoid Factor", "ANA", "Blood Culture", "Urine Culture"] },
  { group: "Renal / Urine", tests: ["Urinalysis", "Urine Culture", "24h Urine Protein", "Microalbumin", "Urine Creatinine"] },
  { group: "Respiratory", tests: ["ABG", "Spirometry FEV1/FVC", "Peak Flow"] },
  { group: "Other", tests: ["Vitamin D", "Vitamin B12", "Folate", "Ferritin", "Iron Panel", "PSA", "Beta HCG", "Hepatitis Panel"] },
];

// ── Imaging catalog ────────────────────────────────────────────────────────────
const MODALITIES: ImagingOrder["modality"][] = [
  "X-Ray", "CT Scan", "MRI", "Ultrasound", "Mammography",
  "Fluoroscopy", "Nuclear Medicine", "PET Scan", "DEXA Scan", "Echocardiogram",
];

const BODY_PARTS_BY_MODALITY: Record<ImagingOrder["modality"], string[]> = {
  "X-Ray":            ["Chest (PA)", "Chest (AP)", "Abdomen", "Skull / Sinuses", "Cervical Spine", "Thoracic Spine", "Lumbar Spine", "Pelvis", "Left Shoulder", "Right Shoulder", "Left Knee", "Right Knee", "Left Ankle", "Right Ankle", "Left Wrist", "Right Wrist", "Left Hand", "Right Hand", "Left Foot", "Right Foot"],
  "CT Scan":          ["Brain (Head)", "Chest / Thorax", "Abdomen & Pelvis", "Neck", "Cervical Spine", "Thoracic Spine", "Lumbar Spine", "Coronary CTA", "Pulmonary Angiography (CTPA)", "Renal / Urinary Tract", "Sinuses", "Extremity"],
  "MRI":              ["Brain", "Spine — Cervical", "Spine — Thoracic", "Spine — Lumbar", "Left Knee", "Right Knee", "Left Shoulder", "Right Shoulder", "Left Hip", "Right Hip", "Abdomen / Liver", "Pelvis", "Cardiac MRI", "MRA Brain", "MRA Neck", "Breast (bilateral)", "Prostate"],
  "Ultrasound":       ["Abdomen (Full)", "Pelvis (Pelvic)", "Obstetric (OB)", "Renal & Bladder", "Thyroid", "Breast (Left)", "Breast (Right)", "Scrotal", "Carotid Doppler", "Lower Limb Doppler", "Upper Limb Doppler", "Liver / Gallbladder", "Echocardiogram (bedside)"],
  "Mammography":      ["Left Breast", "Right Breast", "Bilateral Breasts", "Left Breast — Spot Compression", "Right Breast — Spot Compression"],
  "Fluoroscopy":      ["Upper GI / Barium Swallow", "Lower GI / Barium Enema", "Small Bowel Follow-Through", "Hysterosalpingography (HSG)", "Cystography", "Myelography"],
  "Nuclear Medicine": ["Bone Scan (Whole Body)", "Thyroid Scan (Tc-99m)", "Ventilation-Perfusion (V/Q) Scan", "Renal Scan (MAG3 / DTPA)", "Hepatobiliary Scan (HIDA)", "Cardiac Stress Test (Nuclear)"],
  "PET Scan":         ["PET-CT Brain", "PET-CT Whole Body", "PET-CT Chest / Abdomen / Pelvis", "PET-CT Neck"],
  "DEXA Scan":        ["Lumbar Spine (L1–L4)", "Hip (Femoral Neck)", "Full Body Composition", "Forearm"],
  "Echocardiogram":   ["Transthoracic Echo (TTE)", "Transesophageal Echo (TEE)", "Stress Echo (Dobutamine)", "Bubble (Contrast) Echo"],
};

const MODALITY_COLOR: Record<ImagingOrder["modality"], string> = {
  "X-Ray": "bg-sky-100 text-sky-700",
  "CT Scan": "bg-purple-100 text-purple-700",
  "MRI": "bg-indigo-100 text-indigo-700",
  "Ultrasound": "bg-teal-100 text-teal-700",
  "Mammography": "bg-pink-100 text-pink-700",
  "Fluoroscopy": "bg-orange-100 text-orange-700",
  "Nuclear Medicine": "bg-yellow-100 text-yellow-700",
  "PET Scan": "bg-red-100 text-red-700",
  "DEXA Scan": "bg-lime-100 text-lime-700",
  "Echocardiogram": "bg-rose-100 text-rose-700",
};

const IMAGING_STATUS_COLOR: Record<ImagingOrder["status"], string> = {
  Ordered: "bg-amber-50 text-amber-700",
  Scheduled: "bg-blue-50 text-blue-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

function OrderImagingForm({ ticket, onCancel }: { ticket: VisitTicket; onCancel: () => void }) {
  const { addImagingOrder, imagingOrders } = useCrossPortal();
  const { sendNotification } = useNotifications();
  const { user } = useAuth();

  const [modality, setModality] = useState<ImagingOrder["modality"]>("X-Ray");
  const [bodyPart, setBodyPart] = useState(BODY_PARTS_BY_MODALITY["X-Ray"][0]);
  const [laterality, setLaterality] = useState<ImagingOrder["laterality"]>("N/A");
  const [priority, setPriority] = useState<"STAT" | "Urgent" | "Routine">("Routine");
  const [contrast, setContrast] = useState(false);
  const [indication, setIndication] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleModalityChange = (m: ImagingOrder["modality"]) => {
    setModality(m);
    setBodyPart(BODY_PARTS_BY_MODALITY[m][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indication.trim()) { setError("Clinical indication is required."); return; }
    setError("");
    const orderId = `IMG-${String(imagingOrders.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
    const order: ImagingOrder = {
      id: orderId,
      patientId: ticket.patientId,
      patientName: ticket.patientName,
      orderedBy: user?.name ?? "Doctor",
      modality,
      bodyPart,
      laterality,
      priority,
      clinicalIndication: indication,
      contrast,
      status: "Ordered",
      orderDate: new Date().toISOString().split("T")[0],
      notes: notes || undefined,
      clinicId: ticket.clinicId, // inherit clinic from ticket
    };
    addImagingOrder(order);
    sendNotification({
      from: "doctor",
      to: "radiology",
      type: "general",
      title: `${priority === "STAT" ? "🔴 STAT " : priority === "Urgent" ? "🟠 Urgent " : ""}Imaging Request — ${ticket.patientId}`,
      message: `Dr. Patel requested ${modality} — ${bodyPart}${laterality !== "N/A" ? ` (${laterality})` : ""}${contrast ? " with contrast" : ""} for ${ticket.patientName}. Indication: ${indication.slice(0, 60)}`,
      data: { patientId: ticket.patientId, orderId },
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf2f4]">
          <Scan className="h-8 w-8 text-[#8B1A2F]" />
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground text-base">Imaging request sent!</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mr-1 ${MODALITY_COLOR[modality]}`}>{modality}</span>
            {bodyPart}{laterality !== "N/A" ? ` (${laterality})` : ""}{contrast ? " with contrast" : ""} — {priority} priority
          </p>
          <p className="text-xs text-muted-foreground mt-2">The Radiology department has been notified.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>Close</Button>
          <Button onClick={() => { setSent(false); setIndication(""); setNotes(""); }}>Order Another</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Priority */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Priority *</Label>
        <div className="flex gap-2">
          {(["Routine", "Urgent", "STAT"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPriority(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${priority === p ? p === "STAT" ? "bg-red-600 border-red-600 text-white" : p === "Urgent" ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-amber-500 border-amber-500 text-white" : "bg-white border-border text-muted-foreground hover:border-[#8B1A2F]"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Modality */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Imaging Modality *</Label>
        <div className="flex flex-wrap gap-1.5">
          {MODALITIES.map((m) => (
            <button key={m} type="button" onClick={() => handleModalityChange(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${modality === m ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-white border-border text-muted-foreground hover:border-[#8B1A2F]"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Body part + laterality */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Body Region / Study *</Label>
          <select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm">
            {BODY_PARTS_BY_MODALITY[modality].map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Laterality</Label>
          <select value={laterality} onChange={(e) => setLaterality(e.target.value as ImagingOrder["laterality"])}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm">
            {(["N/A", "Left", "Right", "Bilateral"] as const).map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Contrast */}
      {["CT Scan", "MRI"].includes(modality) && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <input type="checkbox" id="contrast" checked={contrast} onChange={(e) => setContrast(e.target.checked)}
            className="h-4 w-4 rounded accent-[#8B1A2F]" />
          <label htmlFor="contrast" className="text-sm font-medium text-foreground cursor-pointer">
            With IV Contrast / Gadolinium
          </label>
          {contrast && <span className="ml-auto text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Check renal function / allergies</span>}
        </div>
      )}

      {/* Clinical indication */}
      <div>
        <Label className="text-sm font-semibold mb-1.5 block">Clinical Indication *</Label>
        <textarea value={indication} onChange={(e) => { setIndication(e.target.value); if (error) setError(""); }}
          placeholder="e.g. Right knee pain following fall. Evaluate for fracture or ligament injury."
          rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* Additional notes */}
      <div>
        <Label className="text-sm font-semibold mb-1.5 block">Additional Notes</Label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Patient allergies, implants, previous imaging findings, special positioning requirements..."
          rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
      </div>

      {/* Summary preview */}
      {indication && (
        <div className="rounded-lg bg-muted/30 border border-border/50 p-3 text-xs text-muted-foreground space-y-0.5">
          <p className="font-semibold text-foreground text-xs mb-1">Order Summary</p>
          <p><span className="text-foreground font-medium">Study:</span> {modality} — {bodyPart}{laterality !== "N/A" ? ` (${laterality})` : ""}{contrast ? " with contrast" : ""}</p>
          <p><span className="text-foreground font-medium">Patient:</span> {ticket.patientName} · {ticket.patientId}</p>
          <p><span className="text-foreground font-medium">Priority:</span> {priority}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 gap-2 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">
          <Scan className="h-4 w-4" />Send to Radiology
        </Button>
      </div>
    </form>
  );
}

function OrderLabForm({ ticket, onSuccess, onCancel }: { ticket: VisitTicket; onSuccess: () => void; onCancel: () => void }) {
  const { addLabOrder, labOrders } = useCrossPortal();
  const { sendNotification } = useNotifications();
  const { user } = useAuth();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState<"STAT" | "Urgent" | "Routine">("Routine");
  const [notes, setNotes] = useState("");
  const [sampleType, setSampleType] = useState("Blood — Serum");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const toggleTest = (t: string) => setSelectedTests((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) { setError("Select at least one test."); return; }
    setError("");
    const orderId = `LO-${String(labOrders.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split("T")[0];
    const order: LabOrder = {
      id: orderId, patientId: ticket.patientId, patientName: ticket.patientName,
      orderedBy: user?.name ?? "Doctor", tests: selectedTests, priority,
      status: "Pending", orderDate: today,
      notes: notes || `Ordered during consultation on ${today}.`, sampleType,
      clinicId: ticket.clinicId, // inherit clinic from ticket
    };
    addLabOrder(order);
    sendNotification({
      from: "doctor", to: "lab", type: "lab_order",
      title: `${priority === "STAT" ? "🔴 STAT " : priority === "Urgent" ? "🟠 Urgent " : ""}Lab Order — ${ticket.patientId}`,
      message: `Dr. Patel ordered ${selectedTests.slice(0, 3).join(", ")}${selectedTests.length > 3 ? ` +${selectedTests.length - 3} more` : ""} for ${ticket.patientName}. Priority: ${priority}`,
      data: { patientId: ticket.patientId, orderId },
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-10 gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf2f4]">
          <CheckCircle className="h-7 w-7 text-[#8B1A2F]" />
        </div>
        <p className="font-semibold text-foreground">Lab order sent!</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {selectedTests.join(", ")} — {priority} priority. The lab has been notified.
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onCancel}>Close</Button>
          <Button onClick={() => { setSent(false); setSelectedTests([]); setNotes(""); }}>Order Another</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Priority *</Label>
        <div className="flex gap-2">
          {(["Routine", "Urgent", "STAT"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPriority(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${priority === p ? p === "STAT" ? "bg-red-600 border-red-600 text-white" : p === "Urgent" ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-amber-500 border-amber-500 text-white" : "bg-white border-border text-muted-foreground hover:border-[#8B1A2F]"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold">Select Tests * <span className="text-xs font-normal text-muted-foreground">({selectedTests.length} selected)</span></Label>
          {selectedTests.length > 0 && <button type="button" onClick={() => setSelectedTests([])} className="text-xs text-[#8B1A2F] hover:underline">Clear all</button>}
        </div>
        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
          {LAB_TEST_CATALOG.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{group.group}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.tests.map((t) => {
                  const sel = selectedTests.includes(t);
                  return (
                    <button key={t} type="button" onClick={() => toggleTest(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${sel ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-white border-border text-muted-foreground hover:border-[#8B1A2F]"}`}>
                      {sel && "✓ "}{t}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <div>
        <Label className="text-sm font-semibold mb-1.5 block">Sample Type</Label>
        <select value={sampleType} onChange={(e) => setSampleType(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm">
          {["Blood — Serum", "Blood — EDTA", "Blood — Citrate", "Urine — Midstream", "Urine — 24h", "Throat Swab", "Wound Swab", "Stool", "CSF", "Breath — Spirometry"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-sm font-semibold mb-1.5 block">Clinical Notes</Label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for ordering, patient symptoms, context..." rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 gap-2"><FlaskConical className="h-4 w-4" />Send to Lab</Button>
      </div>
    </form>
  );
}

type DetailTab = "profile" | "vitals" | "lab" | "imaging" | "prescriptions";

function PatientDetail({ ticket, onClose, initialTab = "profile" }: { ticket: VisitTicket; onClose: () => void; initialTab?: DetailTab }) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const { prescriptions, labOrders, imagingOrders, updateTicket } = useCrossPortal();
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === ticket.patientId);
  const patientLabOrders = labOrders.filter((o) => o.patientId === ticket.patientId);
  const patientImagingOrders = imagingOrders.filter((o) => o.patientId === ticket.patientId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[#8B1A2F]">{ticket.ticketNo}</span>
            <span className="font-mono text-xs text-muted-foreground">{ticket.patientId}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visitTypeBadge[ticket.visitType]}`}>{ticket.visitType}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{ticket.patientName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Age {ticket.age ?? "—"} · {ticket.gender ?? "—"} · {ticket.phone ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[ticket.status]}`}>{ticket.status}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Status actions */}
      <div className="flex gap-2 px-5 py-3 border-b border-border/50 bg-muted/20">
        {ticket.status === "Waiting Doctor" && (
          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => updateTicket(ticket.ticketNo, { status: "In Consultation" })}>
            <Stethoscope className="h-3 w-3" />Start Consultation
          </Button>
        )}
        {ticket.status === "In Consultation" && (
          <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={() => updateTicket(ticket.ticketNo, { status: "Completed" })}>
            <CheckCircle className="h-3 w-3" />Mark Completed
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 overflow-x-auto">
        {([
          { id: "profile", label: "Profile", icon: User },
          { id: "vitals", label: "Vitals", icon: Activity },
          { id: "lab", label: "Order Lab", icon: FlaskConical },
          { id: "imaging", label: `Imaging${patientImagingOrders.length > 0 ? ` (${patientImagingOrders.length})` : ""}`, icon: Scan },
          { id: "prescriptions", label: `Rx (${patientPrescriptions.length})`, icon: Pill },
        ] as { id: DetailTab; label: string; icon: React.ElementType }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Patient ID", value: ticket.patientId },
                { label: "Ticket No.", value: ticket.ticketNo },
                { label: "Age", value: ticket.age ? `${ticket.age} years` : "—" },
                { label: "Gender", value: ticket.gender ?? "—" },
                { label: "Phone", value: ticket.phone ?? "—" },
                { label: "Visit Type", value: ticket.visitType },
                { label: "Doctor", value: ticket.assignedDoctor },
                { label: "Registered", value: ticket.createdAt },
              ].map((f) => (
                <div key={f.label} className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {ticket.notes && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs font-medium text-amber-700 mb-1">Visit Notes</p>
                <p className="text-sm text-foreground">{ticket.notes}</p>
              </div>
            )}
            {patientLabOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Lab Orders ({patientLabOrders.length})</p>
                <div className="space-y-1.5">
                  {patientLabOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <div>
                        <span className="font-mono text-xs text-[#8B1A2F] font-bold">{o.id}</span>
                        <span className="text-xs text-muted-foreground ml-2">{o.tests.slice(0, 2).join(", ")}{o.tests.length > 2 ? `...` : ""}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "Completed" ? "bg-green-100 text-green-700" : o.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {patientImagingOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Imaging Orders ({patientImagingOrders.length})</p>
                <div className="space-y-1.5">
                  {patientImagingOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <div>
                        <span className="font-mono text-xs text-[#8B1A2F] font-bold">{o.id}</span>
                        <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${MODALITY_COLOR[o.modality]}`}>{o.modality}</span>
                        <span className="text-xs text-muted-foreground ml-1">{o.bodyPart}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IMAGING_STATUS_COLOR[o.status]}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "vitals" && (
          <div>
            {ticket.vitals ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-[#8B1A2F]" />
                  <span className="text-sm font-semibold text-foreground">Vitals recorded by nurse</span>
                  <span className="text-xs text-muted-foreground ml-auto">{ticket.vitals.recordedAt}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Temperature", value: ticket.vitals.temperature ? `${ticket.vitals.temperature} °C` : "—" },
                    { label: "Blood Pressure", value: ticket.vitals.bpSystolic && ticket.vitals.bpDiastolic ? `${ticket.vitals.bpSystolic}/${ticket.vitals.bpDiastolic} mmHg` : "—" },
                    { label: "Pulse", value: ticket.vitals.pulse ? `${ticket.vitals.pulse} bpm` : "—" },
                    { label: "Respiration", value: ticket.vitals.respiration ? `${ticket.vitals.respiration} /min` : "—" },
                    { label: "Weight", value: ticket.vitals.weight ? `${ticket.vitals.weight} kg` : "—" },
                    { label: "Height", value: ticket.vitals.height ? `${ticket.vitals.height} cm` : "—" },
                    { label: "O₂ Saturation", value: ticket.vitals.o2Saturation ? `${ticket.vitals.o2Saturation}%` : "—" },
                    { label: "Recorded By", value: ticket.vitals.recordedBy },
                  ].map((f) => (
                    <div key={f.label} className="rounded-lg bg-muted/30 p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                {ticket.vitals.notes && (
                  <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                    <p className="text-xs font-medium text-orange-700 mb-1">Nurse Notes</p>
                    <p className="text-sm text-foreground">{ticket.vitals.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No vitals recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Vitals will appear here after the nurse completes triage.</p>
              </div>
            )}
          </div>
        )}

        {tab === "lab" && (
          <OrderLabForm ticket={ticket} onSuccess={() => {}} onCancel={() => setTab("profile")} />
        )}

        {tab === "imaging" && (
          <div className="space-y-5">
            {/* Past imaging orders */}
            {patientImagingOrders.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Previous Imaging Orders ({patientImagingOrders.length})</p>
                <div className="space-y-2 mb-5">
                  {patientImagingOrders.map((o) => (
                    <div key={o.id} className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#8B1A2F]">{o.id}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[o.modality]}`}>{o.modality}</span>
                          {o.priority !== "Routine" && <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${o.priority === "STAT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{o.priority}</span>}
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${IMAGING_STATUS_COLOR[o.status]}`}>{o.status}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{o.bodyPart}{o.laterality !== "N/A" ? ` (${o.laterality})` : ""}{o.contrast ? " — with contrast" : ""}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Indication: {o.clinicalIndication}</p>
                      <p className="text-xs text-muted-foreground">Ordered: {o.orderDate} · By: {o.orderedBy}</p>
                      {o.findings && (
                        <div className="mt-2 rounded-md bg-green-50 border border-green-100 p-2">
                          <p className="text-xs font-medium text-green-700">Findings: {o.findings}</p>
                          {o.impression && <p className="text-xs text-green-700 mt-0.5">Impression: {o.impression}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">New Imaging Request</p>
                </div>
              </div>
            )}
            <OrderImagingForm ticket={ticket} onCancel={() => setTab("profile")} />
          </div>
        )}

        {tab === "prescriptions" && (
          <div>
            {patientPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Pill className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No prescriptions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Use the Prescriptions page to write a new prescription for this patient.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientPrescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#8B1A2F]">{rx.id}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rx.status === "Dispensed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{rx.status}</span>
                    </div>
                    {rx.items.map((item, i) => (
                      <p key={i} className="text-xs text-foreground">{item.medication} {item.dosage} — {item.frequency}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DoctorPatients() {
  const { tickets } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<VisitTicket | null>(null);
  const [selectedInitialTab, setSelectedInitialTab] = useState<DetailTab>("profile");
  const [orderLabTicket, setOrderLabTicket] = useState<VisitTicket | null>(null);

  const openPatient = (t: VisitTicket, tab: DetailTab = "profile") => {
    setSelected(t);
    setSelectedInitialTab(tab);
    setOrderLabTicket(null);
  };

  // Clinic isolation: doctor sees only their clinic's patients
  const doctorTickets = tickets.filter((t) =>
    ["Waiting Doctor", "In Consultation", "Completed"].includes(t.status) &&
    (user?.role === "superadmin" || (t.clinicId === user?.clinicId))
  );

  const filtered = doctorTickets.filter((t) => {
    const ms = t.patientName.toLowerCase().includes(search.toLowerCase()) || t.patientId.toLowerCase().includes(search.toLowerCase()) || t.ticketNo.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || t.status === filter;
    return ms && mf;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left — patient list */}
      <div className={`flex flex-col ${selected || orderLabTicket ? "w-[420px] flex-shrink-0" : "flex-1"} transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Patients</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{doctorTickets.length} patient{doctorTickets.length !== 1 ? "s" : ""} · sent from nurse triage</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, ID, ticket..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {["All", "Waiting Doctor", "In Consultation", "Completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <User className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-base font-semibold text-muted-foreground">No patients yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Patients arrive here after the receptionist registers them, collects payment, and the nurse completes vitals and sends them to you.
              </p>
              <div className="mt-5 text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3 text-left w-full max-w-xs">
                <p className="font-medium text-foreground mb-1">Flow:</p>
                <p>1. Receptionist registers patient</p>
                <p>2. Receptionist collects payment</p>
                <p>3. Nurse calls &amp; records vitals</p>
                <p>4. ✓ Patient appears here</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((t) => (
                <div key={t.ticketNo}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${selected?.ticketNo === t.ticketNo ? "bg-muted/40 border-l-2 border-[#8B1A2F]" : ""} ${t.visitType === "Emergency" ? "bg-red-50/20" : ""}`}
                  onClick={() => openPatient(t)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf2f4] text-[#8B1A2F] font-bold text-sm flex-shrink-0">
                    {t.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">{t.patientName}</p>
                      {t.visitType === "Emergency" && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.patientId} · Age {t.age ?? "—"} · {t.gender ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{t.visitType} · {t.ticketNo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[t.status]}`}>{t.status}</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1" onClick={(e) => { e.stopPropagation(); setOrderLabTicket(t); setSelected(null); }}>
                        <FlaskConical className="h-3 w-3" />Lab
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1 border-sky-200 text-sky-700 hover:bg-sky-50" onClick={(e) => { e.stopPropagation(); openPatient(t, "imaging"); }}>
                        <Scan className="h-3 w-3" />Imaging
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — patient detail panel */}
      {selected && (
        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <PatientDetail ticket={selected} initialTab={selectedInitialTab} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* Right — quick order lab panel */}
      {orderLabTicket && (
        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[#8B1A2F]" />
                <h3 className="font-semibold text-foreground">Order Lab Test</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{orderLabTicket.patientName} · {orderLabTicket.patientId}</p>
            </div>
            <button onClick={() => setOrderLabTicket(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <OrderLabForm ticket={orderLabTicket} onSuccess={() => setOrderLabTicket(null)} onCancel={() => setOrderLabTicket(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
