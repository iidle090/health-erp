import React, { useState } from "react";
import { FileSearch, CheckCircle, Edit, X, Send, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";

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

const FINDING_TEMPLATES: Record<ImagingOrder["modality"], string[]> = {
  "X-Ray": [
    "No acute cardiopulmonary process. Lungs are clear bilaterally. Cardiac silhouette is within normal limits. No pleural effusion or pneumothorax.",
    "No acute fracture or dislocation identified. Osseous structures appear intact. Soft tissues unremarkable.",
    "Mild degenerative changes noted. No acute abnormality.",
  ],
  "CT Scan": [
    "No acute intracranial abnormality. No hemorrhage, mass, or mass effect. Ventricles and sulci are appropriate for age.",
    "No evidence of pulmonary embolism. No pneumonia, pleural effusion, or pneumothorax. Mediastinum unremarkable.",
    "No acute intra-abdominal pathology. Liver, gallbladder, pancreas, spleen, and kidneys appear normal.",
  ],
  "MRI": [
    "No acute intracranial pathology. No restricted diffusion to suggest acute infarct. No enhancing lesions.",
    "Mild disc desiccation at L4-L5 and L5-S1. No significant neural foraminal narrowing. No cord signal abnormality.",
    "Findings compatible with mild tendinopathy. No full-thickness tear. Joint effusion is mild.",
  ],
  "Ultrasound": [
    "Normal liver echogenicity. No hepatic lesion. Gallbladder is normal without stones or wall thickening. Common bile duct is not dilated.",
    "No intra-abdominal free fluid. Kidneys are normal in size and echogenicity. No hydronephrosis.",
    "No evidence of DVT. Normal compressibility and flow seen throughout the evaluated venous segments.",
  ],
  "Mammography": ["No suspicious mass, architectural distortion, or calcifications. BI-RADS 1 — Negative."],
  "Fluoroscopy": ["Normal esophageal motility. No filling defect or mucosal irregularity. Gastroesophageal junction is competent."],
  "Nuclear Medicine": ["Normal distribution of radiotracer. No focal area of abnormal increased or decreased uptake to suggest active disease."],
  "PET Scan": ["No hypermetabolic foci identified suspicious for malignancy. No pathologically enlarged lymph nodes. FDG activity within normal physiological range."],
  "DEXA Scan": ["Bone mineral density within normal limits (T-score > -1.0). No evidence of osteopenia or osteoporosis."],
  "Echocardiogram": ["Normal left ventricular size and systolic function. Estimated ejection fraction 55–65%. No regional wall motion abnormality. Valves appear structurally normal. No pericardial effusion."],
};

function ResultEntryPanel({ order, onClose }: { order: ImagingOrder; onClose: () => void }) {
  const { updateImagingOrder } = useCrossPortal();
  const { sendNotification } = useNotifications();
  const [findings, setFindings] = useState(order.findings ?? "");
  const [impression, setImpression] = useState(order.impression ?? "");
  const [radiologist, setRadiologist] = useState("Dr. Kim — Radiologist");
  const [saved, setSaved] = useState(false);

  const templates = FINDING_TEMPLATES[order.modality] ?? [];

  const handleSave = (markComplete = false) => {
    const update: Partial<ImagingOrder> = { findings, impression };
    if (markComplete) {
      update.status = "Completed";
      update.completedDate = new Date().toISOString().split("T")[0];
      sendNotification({
        from: "radiology",
        to: "doctor",
        type: "general",
        title: `Radiology Report Ready — ${order.patientId}`,
        message: `${order.modality} ${order.bodyPart} report for ${order.patientName} is finalized by ${radiologist}. Impression: ${impression.slice(0, 80) || "See findings."}`,
        data: { patientId: order.patientId, orderId: order.id },
      });
    }
    updateImagingOrder(order.id, update);
    setSaved(true);
    setTimeout(() => { setSaved(false); if (markComplete) onClose(); }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between p-5 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[#0f2d4a]">{order.id}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[order.modality]}`}>{order.modality}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{order.patientName}</h3>
          <p className="text-xs text-muted-foreground">{order.bodyPart}{order.laterality !== "N/A" ? ` (${order.laterality})` : ""}{order.contrast ? " — with contrast" : ""} · {order.patientId}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Clinical indication */}
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-700 mb-1">Clinical Indication (from referring doctor)</p>
          <p className="text-sm text-foreground">{order.clinicalIndication}</p>
        </div>

        {/* Radiologist */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Reporting Radiologist</Label>
          <select value={radiologist} onChange={(e) => setRadiologist(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm">
            {["Dr. Kim — Radiologist", "Dr. Pham — Neuroradiology", "Dr. Hassan — Musculoskeletal", "Dr. Singh — Interventional Radiology", "Dr. Okonkwo — Nuclear Medicine"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Findings */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-sm font-semibold">Findings *</Label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground mr-1">Templates:</span>
              {templates.slice(0, 2).map((t, i) => (
                <button key={i} onClick={() => setFindings(t)}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#0f2d4a] text-[#0f2d4a] hover:bg-[#0f2d4a] hover:text-white transition-colors">
                  T{i + 1}
                </button>
              ))}
            </div>
          </div>
          <textarea value={findings} onChange={(e) => setFindings(e.target.value)}
            placeholder="Describe the imaging findings in detail. Include relevant normal and abnormal observations..."
            rows={6} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/30" />
        </div>

        {/* Impression */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Impression / Conclusion *</Label>
          <textarea value={impression} onChange={(e) => setImpression(e.target.value)}
            placeholder="Provide a concise clinical impression and differential diagnosis..."
            rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/30" />
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700 font-medium">Saved successfully</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 px-5 py-4 border-t border-border/50">
        <Button variant="outline" className="flex-1 gap-1.5" onClick={() => handleSave(false)} disabled={!findings}>
          <Edit className="h-3.5 w-3.5" />Save Draft
        </Button>
        <Button className="flex-1 gap-1.5 bg-[#0f2d4a] hover:bg-[#0a1f36] text-white" onClick={() => handleSave(true)} disabled={!findings || !impression}>
          <Send className="h-3.5 w-3.5" />Finalize & Notify
        </Button>
      </div>
    </div>
  );
}

export function RadiologyResults() {
  const { imagingOrders } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const [selected, setSelected] = useState<ImagingOrder | null>(null);

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const pendingResults = clinicOrders.filter((o) => (o.status === "In Progress" || o.status === "Scheduled" || o.status === "Ordered") && !o.findings);
  const completedResults = clinicOrders.filter((o) => o.status === "Completed" && o.findings);

  const list = (tab === "pending" ? pendingResults : completedResults).filter((o) => {
    const s = search.toLowerCase();
    return o.patientName.toLowerCase().includes(s) || o.id.toLowerCase().includes(s) || o.patientId.toLowerCase().includes(s);
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className={`flex flex-col ${selected ? "w-[420px] flex-shrink-0" : "flex-1"} transition-all`}>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Results Entry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pendingResults.length} awaiting report · {completedResults.length} finalized</p>
        </div>

        <div className="flex border-b border-border mb-4">
          {([
            { key: "pending", label: `Awaiting Report (${pendingResults.length})` },
            { key: "completed", label: `Finalized (${completedResults.length})` },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-[#0f2d4a] text-[#0f2d4a]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <FileSearch className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-base font-semibold text-muted-foreground">
                {tab === "pending" ? "No orders awaiting report" : "No finalized reports"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {tab === "pending" ? "All imaging studies have been reported." : "Finalized reports will appear here after radiologists submit findings."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {list.map((o) => (
                <div key={o.id}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${selected?.id === o.id ? "bg-muted/40 border-l-2 border-[#0f2d4a]" : ""}`}
                  onClick={() => setSelected(o)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-[#0f2d4a]">{o.id}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MODALITY_COLOR[o.modality]}`}>{o.modality}</span>
                      {o.priority !== "Routine" && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${o.priority === "STAT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{o.priority}</span>}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{o.patientName}</p>
                    <p className="text-xs text-muted-foreground">{o.bodyPart}{o.laterality !== "N/A" ? ` (${o.laterality})` : ""}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{o.orderedBy} · {o.orderDate}</p>
                    {tab === "completed" && o.impression && (
                      <p className="text-xs text-green-700 mt-1 line-clamp-1">Impression: {o.impression}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {tab === "pending" ? (
                      <Button size="sm" className="h-7 text-xs bg-[#0f2d4a] hover:bg-[#0a1f36] text-white gap-1">
                        <Edit className="h-3 w-3" />Report
                      </Button>
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <ResultEntryPanel order={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}
