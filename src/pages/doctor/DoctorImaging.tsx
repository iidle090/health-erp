import React, { useState } from "react";
import {
  ScanLine, Plus, X, Clock, CheckCircle2, AlertCircle, FileText,
  Search, ChevronRight, Eye, Monitor, ZoomIn, ZoomOut, RotateCw,
  Sun, Contrast, Maximize2, ChevronLeft, Layers, Settings,
  Activity, ArrowLeft, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePatientStore } from "@/context/PatientStore";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

/* ─── shared constants ──────────────────────────────────────────────────── */
const MODALITY_ICONS: Record<ImagingOrder["modality"], string> = {
  "X-Ray": "🩻", "CT Scan": "🔬", "MRI": "🧲", "Ultrasound": "📡",
  "Mammography": "🔵", "Fluoroscopy": "🔆", "Nuclear Medicine": "☢️",
  "PET Scan": "🔴", "DEXA Scan": "🦴", "Echocardiogram": "❤️",
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
const STATUS_CFG: Record<ImagingOrder["status"], { cls: string; dot: string; label: string }> = {
  Ordered:       { cls: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-500",                label: "Ordered" },
  Scheduled:     { cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500",               label: "Scheduled" },
  "In Progress": { cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500 animate-pulse", label: "In Progress" },
  Completed:     { cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500",           label: "Report Ready" },
  Cancelled:     { cls: "bg-gray-100 text-gray-500 border-gray-200",   dot: "bg-gray-400",                label: "Cancelled" },
};
const PRIORITY_CFG: Record<ImagingOrder["priority"], string> = {
  Routine: "bg-blue-50 text-blue-700",
  Urgent:  "bg-amber-50 text-amber-700",
  STAT:    "bg-red-50 text-red-700 font-bold",
};
const SCAN_PATTERNS: Record<string, string> = {
  "X-Ray":           "radial-gradient(ellipse 80% 60% at 50% 30%, #e8e8e8 0%, #d0d0d0 30%, #b0b0b0 60%, #888 80%, #444 100%)",
  "CT Scan":         "radial-gradient(circle at 50% 50%, #ccc 0%, #aaa 20%, #666 50%, #333 70%, #111 100%)",
  "MRI":             "radial-gradient(ellipse at 45% 40%, #ddd 0%, #bbb 25%, #888 55%, #444 75%, #222 100%)",
  "Ultrasound":      "radial-gradient(ellipse 60% 80% at 50% 60%, #777 0%, #555 30%, #333 60%, #111 80%, #000 100%)",
  "Mammography":     "radial-gradient(ellipse 70% 90% at 50% 80%, #ddd 0%, #bbb 40%, #888 70%, #444 90%)",
  "Fluoroscopy":     "linear-gradient(180deg, #eee 0%, #ccc 30%, #999 60%, #555 100%)",
  "Nuclear Medicine":"radial-gradient(circle at 50% 50%, #ff8800 0%, #cc4400 20%, #882200 50%, #330000 80%, #000 100%)",
  "PET Scan":        "radial-gradient(circle at 50% 50%, #ff6666 0%, #cc2222 30%, #882200 60%, #330000 85%, #000 100%)",
  "DEXA Scan":       "radial-gradient(ellipse at 50% 60%, #fff 0%, #e0e0e0 20%, #c0c0c0 50%, #808080 80%, #404040 100%)",
  "Echocardiogram":  "radial-gradient(ellipse 75% 60% at 50% 45%, #888 0%, #666 25%, #444 50%, #222 75%, #000 90%)",
};
const WINDOW_PRESETS = ["Soft Tissue","Bone","Lung","Brain","Liver","Mediastinum","Abdomen"];

const MODALITIES: ImagingOrder["modality"][] = [
  "X-Ray","CT Scan","MRI","Ultrasound","Mammography",
  "Fluoroscopy","Nuclear Medicine","PET Scan","DEXA Scan","Echocardiogram",
];
const BODY_PARTS_BY_MODALITY: Record<ImagingOrder["modality"], string[]> = {
  "X-Ray":            ["Chest PA","Chest AP","Abdomen","Pelvis","Skull","Cervical Spine","Thoracic Spine","Lumbar Spine","Right Hand","Left Hand","Right Foot","Left Foot","Right Knee","Left Knee","Right Hip","Left Hip","Right Shoulder","Left Shoulder","Right Wrist","Left Wrist"],
  "CT Scan":          ["Head/Brain","Chest","Abdomen & Pelvis","Chest/Abdomen/Pelvis","Cervical Spine","Thoracic Spine","Lumbar Spine","Neck","Sinuses","Temporal Bones","Angiography (Head/Neck)","Pulmonary Angiography","Coronary Angiography"],
  "MRI":              ["Brain","Spine (Cervical)","Spine (Lumbar)","Knee (Right)","Knee (Left)","Shoulder (Right)","Shoulder (Left)","Hip (Right)","Hip (Left)","Pelvis","Abdomen","Breast (Right)","Breast (Left)","Cardiac"],
  "Ultrasound":       ["Abdomen","Pelvis","Obstetric","Thyroid","Breast (Right)","Breast (Left)","Scrotal","Renal","Pelvic (Transvaginal)","Lower Extremity Veins","Upper Extremity Veins","Carotid"],
  "Mammography":      ["Bilateral Screening","Bilateral Diagnostic","Right Diagnostic","Left Diagnostic","Right Stereotactic Biopsy","Left Stereotactic Biopsy"],
  "Fluoroscopy":      ["Upper GI Series","Lower GI (Barium Enema)","Esophagram","Small Bowel Follow-Through","Voiding Cystourethrogram","Hysterosalpingography"],
  "Nuclear Medicine": ["Bone Scan","Thyroid Scan","Renal Scan","Hepatobiliary (HIDA)","Lung V/Q Scan","Sentinel Node Mapping","Cardiac Stress (Sestamibi)"],
  "PET Scan":         ["Whole Body F-FDG","Brain F-FDG","Cardiac Viability","Oncology Staging","Recurrence Evaluation"],
  "DEXA Scan":        ["Lumbar Spine & Hip","Whole Body Composition","Forearm"],
  "Echocardiogram":   ["Transthoracic (TTE)","Transesophageal (TEE)","Stress Echo","Contrast Echo","Pediatric Echo"],
};

type FilterTab = "All" | "Awaiting" | "Results Ready" | "Cancelled";
type PageView  = "list" | "pacs";

/* ─── Order Modal ───────────────────────────────────────────────────────── */
function OrderModal({ patients, onClose }: { patients: { id: string; name: string }[]; onClose: () => void }) {
  const { addImagingOrder, imagingOrders } = useCrossPortal();
  const { sendNotification } = useNotifications();
  const { toast } = useToast();
  const { user } = useAuth();
  const [modality, setModality] = useState<ImagingOrder["modality"]>("X-Ray");
  const [bodyPart, setBodyPart]   = useState(BODY_PARTS_BY_MODALITY["X-Ray"][0]);
  const [laterality, setLaterality] = useState<ImagingOrder["laterality"]>("N/A");
  const [priority, setPriority]   = useState<ImagingOrder["priority"]>("Routine");
  const [contrast, setContrast]   = useState(false);
  const [indication, setIndication] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");

  const inp = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30";

  const handleModalityChange = (m: ImagingOrder["modality"]) => {
    setModality(m); setBodyPart(BODY_PARTS_BY_MODALITY[m][0]); setLaterality("N/A");
  };
  const selectPatient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = patients.find(p => p.id === e.target.value);
    if (p) { setPatientId(p.id); setPatientName(p.name); }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fName = patientName || "Unknown Patient";
    const fId   = patientId  || `PT-WALK-${Date.now().toString().slice(-4)}`;
    const orderId = `IMG-${String(imagingOrders.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
    const order: ImagingOrder = { id: orderId, patientId: fId, patientName: fName,
      orderedBy: user?.name ?? "Doctor", modality, bodyPart, laterality, priority,
      clinicalIndication: indication, contrast, status: "Ordered",
      orderDate: new Date().toISOString().split("T")[0],
      clinicId: user?.clinicId };
    addImagingOrder(order);
    sendNotification({ from: "doctor", to: "radiology", type: "general",
      title: `${priority === "STAT" ? "🔴 STAT " : priority === "Urgent" ? "🟠 Urgent " : ""}Imaging Request — ${fId}`,
      message: `${modality} of ${bodyPart}${laterality !== "N/A" ? ` (${laterality})` : ""}${contrast ? " with contrast" : ""} for ${fName}. Indication: ${indication}`,
      data: { patientId: fId, orderId } });
    toast({ title: "Imaging ordered!", description: `${modality} — ${bodyPart} for ${fName}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2"><ScanLine className="h-5 w-5 text-[#8B1A2F]" />Order Imaging Study</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block">Patient</label>
            <select className={inp} onChange={selectPatient}>
              <option value="">— Select patient —</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
            {!patientId && (
              <input className={`${inp} mt-2`} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Or type patient name manually…" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Modality *</label>
              <select className={inp} value={modality} onChange={e => handleModalityChange(e.target.value as ImagingOrder["modality"])}>
                {MODALITIES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Priority *</label>
              <select className={inp} value={priority} onChange={e => setPriority(e.target.value as ImagingOrder["priority"])}>
                <option>Routine</option><option>Urgent</option><option>STAT</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Body Part / Region *</label>
              <select className={inp} value={bodyPart} onChange={e => setBodyPart(e.target.value)}>
                {BODY_PARTS_BY_MODALITY[modality].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Laterality</label>
              <select className={inp} value={laterality} onChange={e => setLaterality(e.target.value as ImagingOrder["laterality"])}>
                <option>N/A</option><option>Left</option><option>Right</option><option>Bilateral</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={contrast} onChange={e => setContrast(e.target.checked)} className="rounded" />
            <span className="text-sm font-medium">Requires contrast</span>
          </label>
          <div>
            <label className="text-xs font-semibold mb-1 block">Clinical Indication *</label>
            <textarea className={inp} value={indication} onChange={e => setIndication(e.target.value)} rows={3} placeholder="Reason for ordering this imaging study…" required />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Submit Order</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Report Modal (list view detail) ──────────────────────────────────── */
function ReportModal({ order, onClose, onOpenPACS }: { order: ImagingOrder; onClose: () => void; onOpenPACS: () => void }) {
  const { updateImagingOrder } = useCrossPortal();
  const { toast } = useToast();
  const handleAcknowledge = () => {
    updateImagingOrder(order.id, { notes: (order.notes ?? "") + " [Reviewed by Dr. Sarah Johnson on " + new Date().toLocaleDateString() + "]" });
    toast({ title: "Report acknowledged" });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#8B1A2F]">{order.id}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[order.modality]}`}>{order.modality}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CFG[order.priority]}`}>{order.priority}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{order.patientName}</h2>
            <p className="text-sm text-muted-foreground">{order.bodyPart}{order.laterality !== "N/A" ? ` (${order.laterality})` : ""}{order.contrast ? " — with contrast" : ""} · {order.patientId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted mt-1"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Ordered</p>
              <p className="font-semibold">{order.orderDate}</p>
            </div>
            {order.scheduledDate && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs text-amber-600 font-medium mb-0.5">Scheduled</p>
                <p className="font-semibold">{order.scheduledDate}</p>
              </div>
            )}
            {order.completedDate && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                <p className="text-xs text-green-600 font-medium mb-0.5">Reported</p>
                <p className="font-semibold">{order.completedDate}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Clinical Indication</p>
            <p className="text-sm text-foreground">{order.clinicalIndication}</p>
          </div>

          {order.findings ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-700" />
                <p className="text-sm font-bold text-purple-700">Radiology Report</p>
                <span className="ml-auto flex items-center gap-1 text-xs text-green-700 font-medium bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />Finalized
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1.5">Findings</p>
                <p className="text-sm text-foreground leading-relaxed bg-white/80 rounded-lg p-3 border border-purple-100">{order.findings}</p>
              </div>
              {order.impression && (
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1.5">Impression / Conclusion</p>
                  <p className="text-sm text-foreground leading-relaxed bg-white/80 rounded-lg p-3 border border-purple-100 font-medium">{order.impression}</p>
                </div>
              )}
              {(order.notes ?? "").includes("Reviewed by") && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {order.notes?.match(/Reviewed by[^]*/)?.[0]}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/20 p-8 flex flex-col items-center text-center">
              <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Report not yet available</p>
              <p className="text-xs text-muted-foreground mt-1">Status: <span className="font-medium">{order.status}</span></p>
            </div>
          )}

          {order.notes && !order.notes.includes("Reviewed by") && (
            <div className="rounded-lg bg-muted/30 border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Technician Notes</p>
              <p className="text-xs text-foreground">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
          <Button variant="outline" onClick={onOpenPACS} className="flex-1 gap-2 border-[#8B1A2F]/30 text-[#8B1A2F] hover:bg-[#8B1A2F]/5">
            <Monitor className="h-4 w-4" />Open in PACS Viewer
          </Button>
          {order.findings && !(order.notes ?? "").includes("Reviewed by") && (
            <Button onClick={handleAcknowledge} className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
              <CheckCircle2 className="h-4 w-4" />Acknowledge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PACS Viewer ───────────────────────────────────────────────────────── */
function PACSViewer({ initialOrder, allOrders, onBack }: {
  initialOrder: ImagingOrder | null;
  allOrders: ImagingOrder[];
  onBack: () => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(initialOrder ?? allOrders[0] ?? null);
  const [brightness, setBrightness]   = useState(50);
  const [contrast, setContrast]       = useState(50);
  const [zoom, setZoom]               = useState(100);
  const [rotation, setRotation]       = useState(0);
  const [windowPreset, setWindowPreset] = useState("Soft Tissue");
  const [showOverlays, setShowOverlays] = useState(true);
  const [showReport, setShowReport]   = useState(true);
  const [currentSlice, setCurrentSlice] = useState(1);

  const totalSlices = selectedOrder?.modality === "CT Scan" ? 256
    : selectedOrder?.modality === "MRI" ? 128
    : selectedOrder?.modality === "PET Scan" ? 64 : 1;

  const scanBg = selectedOrder
    ? (SCAN_PATTERNS[selectedOrder.modality] ?? SCAN_PATTERNS["X-Ray"])
    : SCAN_PATTERNS["X-Ray"];
  const imageFilter    = `brightness(${brightness / 50}) contrast(${contrast / 50})`;
  const imageTransform = `scale(${zoom / 100}) rotate(${rotation}deg)`;

  const selectStudy = (o: ImagingOrder) => {
    setSelectedOrder(o); setCurrentSlice(1); setZoom(100); setRotation(0);
    setBrightness(50); setContrast(50);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -mt-1">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0f172a] border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mr-2">
          <ArrowLeft className="h-4 w-4" />Back to Orders
        </button>
        <div className="w-px h-5 bg-white/20" />
        <Monitor className="h-4 w-4 text-[#8B1A2F]" />
        <span className="text-sm font-bold text-white">PACS Image Viewer</span>
        {selectedOrder && (
          <>
            <span className="text-white/30">·</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[selectedOrder.modality]}`}>{selectedOrder.modality}</span>
            <span className="text-xs text-white/60">{selectedOrder.patientName} — {selectedOrder.bodyPart}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {selectedOrder?.findings && (
            <button
              onClick={() => setShowReport(r => !r)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${showReport ? "bg-purple-600/30 text-purple-300 border border-purple-500/30" : "text-white/40 hover:text-white hover:bg-white/10"}`}>
              <FileText className="h-3.5 w-3.5" />Report
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Study list sidebar */}
        <div className="w-52 flex-shrink-0 bg-[#111827] border-r border-white/10 flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-white/10">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Studies ({allOrders.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {allOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <ScanLine className="h-8 w-8 text-white/10 mb-2" />
                <p className="text-xs text-white/30">No imaging orders yet</p>
              </div>
            ) : (
              allOrders.map((o) => (
                <div key={o.id}
                  className={`px-3 py-3 cursor-pointer border-b border-white/8 transition-colors ${selectedOrder?.id === o.id ? "bg-white/15 border-l-2 border-l-[#8B1A2F]" : "hover:bg-white/8"}`}
                  onClick={() => selectStudy(o)}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{MODALITY_ICONS[o.modality]}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${MODALITY_COLOR[o.modality]}`}>{o.modality}</span>
                    {o.priority !== "Routine" && (
                      <span className={`text-[9px] font-bold ${o.priority === "STAT" ? "text-red-400" : "text-amber-400"}`}>{o.priority}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{o.patientName}</p>
                  <p className="text-[10px] text-white/50 truncate">{o.bodyPart}{o.laterality !== "N/A" ? ` (${o.laterality})` : ""}</p>
                  <p className="text-[10px] text-white/35">{o.orderDate}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[8px] font-medium px-1 py-0.5 rounded ${
                      o.status === "Completed" ? "bg-purple-900/60 text-purple-300" :
                      o.status === "In Progress" ? "bg-green-900/60 text-green-300" :
                      "bg-white/10 text-white/40"
                    }`}>{o.status}</span>
                    {o.findings && <span className="text-[8px] text-green-400">✓ Report</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main viewer area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-[#111827] flex-wrap">
            <div className="flex items-center gap-1 bg-white/8 rounded-lg px-1">
              <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="p-1.5 text-white/60 hover:text-white transition-colors" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <span className="text-xs text-white/60 w-11 text-center font-mono">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(400, z + 10))} className="p-1.5 text-white/60 hover:text-white transition-colors" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
            </div>
            <div className="w-px h-5 bg-white/15" />
            <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Rotate 90°"><RotateCw className="h-4 w-4" /></button>
            <button onClick={() => setRotation(r => (r - 90 + 360) % 360)} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Rotate -90°" style={{ transform: "scaleX(-1)" }}><RotateCw className="h-4 w-4" /></button>
            <div className="w-px h-5 bg-white/15" />
            <div className="flex items-center gap-2 bg-white/8 rounded-lg px-2 py-1">
              <Sun className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
              <input type="range" min="10" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                className="w-20 h-1 accent-yellow-400 cursor-pointer" title="Brightness" />
              <span className="text-[10px] text-white/30 w-6">{brightness}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/8 rounded-lg px-2 py-1">
              <Contrast className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
              <input type="range" min="10" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))}
                className="w-20 h-1 accent-cyan-400 cursor-pointer" title="Contrast" />
              <span className="text-[10px] text-white/30 w-6">{contrast}</span>
            </div>
            <div className="w-px h-5 bg-white/15" />
            <select value={windowPreset} onChange={e => setWindowPreset(e.target.value)}
              className="h-7 rounded-lg bg-white/10 border border-white/20 text-white text-xs px-2 focus:outline-none">
              {WINDOW_PRESETS.map(p => <option key={p} className="bg-[#111827]">{p}</option>)}
            </select>
            <div className="w-px h-5 bg-white/15" />
            <button onClick={() => setShowOverlays(s => !s)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${showOverlays ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/10"}`}>
              <Layers className="h-3.5 w-3.5" />Overlays
            </button>
            <button
              onClick={() => { setZoom(100); setRotation(0); setBrightness(50); setContrast(50); }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-auto">
              <Settings className="h-3.5 w-3.5" />Reset
            </button>
          </div>

          {/* Image canvas */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {selectedOrder ? (
              <>
                {/* Scan image */}
                <div className="relative flex items-center justify-center w-full h-full">
                  <div style={{
                    width: "420px", height: "420px",
                    background: scanBg,
                    filter: imageFilter,
                    transform: imageTransform,
                    transition: "transform 0.15s ease, filter 0.1s ease",
                    borderRadius: selectedOrder.modality === "X-Ray" ? "50% / 40%" : "8px",
                    boxShadow: "0 0 80px rgba(255,255,255,0.04)",
                  }} />
                  {/* Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-20 h-20">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-green-400/25" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-400/25" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border border-green-400/40" />
                    </div>
                  </div>
                </div>

                {/* Overlays */}
                {showOverlays && (
                  <>
                    <div className="absolute top-3 left-3 text-[10px] font-mono text-green-400/70 leading-relaxed pointer-events-none select-none">
                      <p className="font-bold">{selectedOrder.patientName}</p>
                      <p>{selectedOrder.patientId}</p>
                      <p>{selectedOrder.orderDate}</p>
                      <p>{selectedOrder.modality}</p>
                      <p>{selectedOrder.bodyPart}{selectedOrder.laterality !== "N/A" ? ` (${selectedOrder.laterality})` : ""}</p>
                      {selectedOrder.contrast && <p className="text-yellow-400/80 font-bold">+ CONTRAST</p>}
                    </div>
                    <div className="absolute top-3 right-3 text-[10px] font-mono text-green-400/70 leading-relaxed pointer-events-none select-none text-right">
                      <p className="text-white/40">{selectedOrder.id}</p>
                      <p>WW/WL: {windowPreset}</p>
                      <p>Zoom: {zoom}%</p>
                      <p>Rot: {rotation}°</p>
                      <p>Bright: {brightness} · Contr: {contrast}</p>
                      {totalSlices > 1 && <p className="text-cyan-400/80">Slice: {currentSlice}/{totalSlices}</p>}
                    </div>
                    <div className="absolute bottom-3 left-3 text-[9px] font-mono text-green-400/40 pointer-events-none select-none">
                      <p>Shaniid Health ERP — PACS Viewer (Simulated)</p>
                      <p>Series: 1 · Instance: {currentSlice} · {selectedOrder.priority} priority</p>
                    </div>
                    {selectedOrder.priority !== "Routine" && (
                      <div className="absolute bottom-3 right-3 pointer-events-none">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedOrder.priority === "STAT" ? "bg-red-600/80 text-white" : "bg-amber-500/80 text-white"}`}>
                          {selectedOrder.priority}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Slice navigation (CT / MRI / PET) */}
                {totalSlices > 1 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <button onClick={() => setCurrentSlice(s => Math.min(totalSlices, s + 1))} className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronLeft className="h-4 w-4 rotate-90" /></button>
                    <div className="flex flex-col items-center gap-1">
                      <input type="range" min={1} max={totalSlices} value={currentSlice}
                        onChange={e => setCurrentSlice(Number(e.target.value))}
                        className="h-36 accent-green-400 cursor-pointer"
                        style={{ writingMode: "vertical-lr", direction: "rtl" }} />
                      <span className="text-[9px] text-white/40 font-mono">{currentSlice}</span>
                    </div>
                    <button onClick={() => setCurrentSlice(s => Math.max(1, s - 1))} className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronLeft className="h-4 w-4 -rotate-90" /></button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Monitor className="h-20 w-20 text-white/8 mb-4" />
                <p className="text-sm text-white/25 font-medium">Select a study from the left panel</p>
                <p className="text-xs text-white/15 mt-1">All imaging orders are listed in the study list</p>
              </div>
            )}
          </div>

          {/* Footer status bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-[#111827]">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-green-400" />
              {selectedOrder ? (
                <span className="text-xs text-white/50">
                  {selectedOrder.modality} · {selectedOrder.bodyPart} · <span className={selectedOrder.status === "Completed" ? "text-purple-400" : "text-white/50"}>{selectedOrder.status}</span>
                  {selectedOrder.findings && <span className="text-green-400 ml-2 font-medium">✓ Report available</span>}
                </span>
              ) : (
                <span className="text-xs text-white/30">No study selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <Maximize2 className="h-3.5 w-3.5" />Fullscreen
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <Download className="h-3.5 w-3.5" />Export
              </button>
            </div>
          </div>
        </div>

        {/* Report side panel */}
        {selectedOrder?.findings && showReport && (
          <div className="w-60 flex-shrink-0 bg-card border-l border-border flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-bold text-foreground">Radiology Report</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{selectedOrder.id} · {selectedOrder.completedDate ?? selectedOrder.orderDate}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1.5">Findings</p>
                <p className="text-xs text-foreground leading-relaxed">{selectedOrder.findings}</p>
              </div>
              {selectedOrder.impression && (
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">Impression</p>
                  <p className="text-xs text-foreground leading-relaxed font-medium">{selectedOrder.impression}</p>
                </div>
              )}
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Clinical Indication</p>
                <p className="text-xs text-muted-foreground">{selectedOrder.clinicalIndication}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2.5">
                <p className="text-[10px] font-bold text-green-700">Report Status</p>
                <p className="text-xs text-green-700 font-semibold mt-0.5">Finalized</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export function DoctorImaging() {
  const { imagingOrders } = useCrossPortal();
  const { patients } = usePatientStore();
  const [view, setView]           = useState<PageView>("list");
  const [pacsTarget, setPacsTarget] = useState<ImagingOrder | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("All");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<ImagingOrder | null>(null);

  const awaiting    = imagingOrders.filter(o => ["Ordered","Scheduled","In Progress"].includes(o.status));
  const withResults = imagingOrders.filter(o => o.status === "Completed" && o.findings);
  const newResults  = withResults.filter(o => !(o.notes ?? "").includes("Reviewed by"));
  const cancelled   = imagingOrders.filter(o => o.status === "Cancelled");

  const filtered = imagingOrders
    .filter(o => {
      if (filterTab === "Awaiting")       return ["Ordered","Scheduled","In Progress"].includes(o.status);
      if (filterTab === "Results Ready")  return o.status === "Completed";
      if (filterTab === "Cancelled")      return o.status === "Cancelled";
      return true;
    })
    .filter(o => {
      const s = search.toLowerCase();
      return !s || o.patientName.toLowerCase().includes(s) || o.id.toLowerCase().includes(s) || o.patientId.toLowerCase().includes(s) || o.modality.toLowerCase().includes(s);
    });

  const openPACS = (order?: ImagingOrder) => {
    setPacsTarget(order ?? null);
    setSelected(null);
    setView("pacs");
  };

  /* PACS view */
  if (view === "pacs") {
    return (
      <PACSViewer
        initialOrder={pacsTarget}
        allOrders={imagingOrders}
        onBack={() => setView("list")}
      />
    );
  }

  /* List view */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-[#8B1A2F]" />Radiology & Imaging
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Order imaging studies and view radiologist reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openPACS()} className="gap-2 border-border text-foreground">
            <Monitor className="h-4 w-4" />PACS Viewer
          </Button>
          <Button onClick={() => setShowNew(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2">
            <Plus className="h-4 w-4" />Order Imaging
          </Button>
        </div>
      </div>

      {/* New result alert */}
      {newResults.length > 0 && (
        <div className="rounded-xl border border-purple-300 bg-purple-50 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-800">
              {newResults.length} new radiology report{newResults.length > 1 ? "s" : ""} ready for review
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              {newResults.map(o => `${o.modality} — ${o.patientName}`).join(" · ")}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFilterTab("Results Ready")}
            className="border-purple-300 text-purple-700 hover:bg-purple-100 text-xs shrink-0">
            View Reports
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Orders",   value: imagingOrders.length, cls: "text-foreground",  sub: "All time" },
          { label: "Awaiting Result",value: awaiting.length,     cls: "text-amber-600",   sub: awaiting.filter(o => o.status === "In Progress").length + " in progress" },
          { label: "Reports Ready",  value: withResults.length,  cls: "text-purple-600",  sub: newResults.length > 0 ? `${newResults.length} unread` : "All reviewed" },
          { label: "Cancelled",      value: cancelled.length,    cls: "text-gray-400",    sub: "" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">{s.label}</p>
            {s.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {(["All","Awaiting","Results Ready","Cancelled"] as FilterTab[]).map(f => (
            <button key={f} onClick={() => setFilterTab(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors relative
                ${filterTab === f ? "bg-[#8B1A2F] text-white border-[#8B1A2F]" : "border-border text-muted-foreground hover:border-[#8B1A2F]/40"}`}>
              {f}
              {f === "Results Ready" && newResults.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">{newResults.length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, ID, modality…" className="pl-9 h-8 text-sm" />
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <ScanLine className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">No imaging orders found</p>
            <p className="text-xs mt-1 opacity-70">
              {filterTab !== "All" ? `No orders in "${filterTab}"` : "Use the Order Imaging button to get started"}
            </p>
          </div>
        )}

        {filtered.map(order => {
          const cfg       = STATUS_CFG[order.status];
          const hasReport = !!order.findings;
          const isUnread  = hasReport && !(order.notes ?? "").includes("Reviewed by");

          return (
            <div key={order.id}
              className={`rounded-xl border bg-card overflow-hidden transition-all hover:shadow-sm
                ${isUnread ? "border-purple-300 shadow-sm ring-1 ring-purple-100" : "border-border"}`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${hasReport ? "bg-purple-50" : "bg-[#fdf2f4]"}`}>
                      {MODALITY_ICONS[order.modality]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#8B1A2F]">{order.id}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[order.modality]}`}>{order.modality}</span>
                      </div>
                      <p className="font-semibold text-foreground mt-0.5">
                        {order.bodyPart}{order.laterality !== "N/A" ? ` (${order.laterality})` : ""}{order.contrast ? " — contrast" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.patientName} · {order.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CFG[order.priority]}`}>{order.priority}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                    {isUnread && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Indication:</span> {order.clinicalIndication}
                </p>

                {hasReport && (
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-purple-600" />
                      <p className="text-xs font-bold text-purple-700">Radiology Report Available</p>
                    </div>
                    {order.impression && (
                      <p className="text-xs text-purple-800 line-clamp-2">
                        <span className="font-semibold">Impression: </span>{order.impression}
                      </p>
                    )}
                    {order.findings && !order.impression && (
                      <p className="text-xs text-purple-800 line-clamp-2">
                        <span className="font-semibold">Findings: </span>{order.findings}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />Ordered {order.orderDate}
                    {order.completedDate && <> · Reported {order.completedDate}</>}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPACS(order)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 rounded-lg px-2.5 py-1 transition-colors">
                      <Monitor className="h-3.5 w-3.5" />PACS
                    </button>
                    <button
                      onClick={() => setSelected(order)}
                      className="flex items-center gap-1 text-xs text-[#8B1A2F] font-medium hover:underline">
                      {hasReport ? <><Eye className="h-3.5 w-3.5" />View Report</> : <><ChevronRight className="h-3.5 w-3.5" />Details</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showNew && (
        <OrderModal patients={patients.map(p => ({ id: p.id, name: p.name }))} onClose={() => setShowNew(false)} />
      )}
      {selected && (
        <ReportModal
          order={selected}
          onClose={() => setSelected(null)}
          onOpenPACS={() => openPACS(selected)}
        />
      )}
    </div>
  );
}
