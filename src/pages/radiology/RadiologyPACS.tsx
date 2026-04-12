import React, { useState } from "react";
import { Monitor, ZoomIn, ZoomOut, RotateCw, Sun, Contrast, Maximize2, Download, ChevronLeft, ChevronRight, Layers, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

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

const SCAN_PATTERNS: Record<string, string> = {
  "X-Ray":       "radial-gradient(ellipse 80% 60% at 50% 30%, #e8e8e8 0%, #d0d0d0 30%, #b0b0b0 60%, #888 80%, #444 100%)",
  "CT Scan":     "radial-gradient(circle at 50% 50%, #ccc 0%, #aaa 20%, #666 50%, #333 70%, #111 100%)",
  "MRI":         "radial-gradient(ellipse at 45% 40%, #ddd 0%, #bbb 25%, #888 55%, #444 75%, #222 100%)",
  "Ultrasound":  "radial-gradient(ellipse 60% 80% at 50% 60%, #777 0%, #555 30%, #333 60%, #111 80%, #000 100%)",
  "Mammography": "radial-gradient(ellipse 70% 90% at 50% 80%, #ddd 0%, #bbb 40%, #888 70%, #444 90%)",
  "Fluoroscopy": "linear-gradient(180deg, #eee 0%, #ccc 30%, #999 60%, #555 100%)",
  "Nuclear Medicine": "radial-gradient(circle at 50% 50%, #ff8800 0%, #cc4400 20%, #882200 50%, #330000 80%, #000 100%)",
  "PET Scan":    "radial-gradient(circle at 50% 50%, #ff6666 0%, #cc2222 30%, #882200 60%, #330000 85%, #000 100%)",
  "DEXA Scan":   "radial-gradient(ellipse at 50% 60%, #fff 0%, #e0e0e0 20%, #c0c0c0 50%, #808080 80%, #404040 100%)",
  "Echocardiogram": "radial-gradient(ellipse 75% 60% at 50% 45%, #888 0%, #666 25%, #444 50%, #222 75%, #000 90%)",
};

const WINDOW_PRESETS = ["Soft Tissue", "Bone", "Lung", "Brain", "Liver", "Mediastinum", "Abdomen"];

export function RadiologyPACS() {
  const { imagingOrders } = useCrossPortal();
  const { user } = useAuth();

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );
  const completedOrders = clinicOrders.filter((o) => o.status === "Completed" || o.status === "In Progress" || o.status === "Scheduled");
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(completedOrders[0] ?? null);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [windowPreset, setWindowPreset] = useState("Soft Tissue");
  const [showOverlays, setShowOverlays] = useState(true);
  const [currentSlice, setCurrentSlice] = useState(1);
  const totalSlices = selectedOrder?.modality === "CT Scan" ? 256 : selectedOrder?.modality === "MRI" ? 128 : 1;

  const imageFilter = `brightness(${brightness / 50}) contrast(${contrast / 50})`;
  const imageTransform = `scale(${zoom / 100}) rotate(${rotation}deg)`;
  const scanBg = selectedOrder ? SCAN_PATTERNS[selectedOrder.modality] ?? SCAN_PATTERNS["X-Ray"] : SCAN_PATTERNS["X-Ray"];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">PACS Image Viewer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Picture Archiving and Communication System — {completedOrders.length} study{completedOrders.length !== 1 ? "ies" : ""} available</p>
      </div>

      {completedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center px-6">
          <Monitor className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">No imaging studies available</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">Studies will appear here once imaging orders have been scheduled or completed. Doctors can submit imaging requests from the patient panel.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
          {/* Study list */}
          <div className="w-64 flex-shrink-0 flex flex-col rounded-xl border border-border bg-[#111827] shadow-sm overflow-hidden">
            <div className="px-3 py-3 border-b border-white/10">
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Study List</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {completedOrders.map((o) => (
                <div key={o.id}
                  className={`px-3 py-3 cursor-pointer border-b border-white/10 transition-colors ${selectedOrder?.id === o.id ? "bg-white/15" : "hover:bg-white/8"}`}
                  onClick={() => { setSelectedOrder(o); setCurrentSlice(1); setZoom(100); setRotation(0); }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${MODALITY_COLOR[o.modality]}`}>{o.modality}</span>
                    {o.priority !== "Routine" && <span className={`text-[9px] font-bold ${o.priority === "STAT" ? "text-red-400" : "text-amber-400"}`}>{o.priority}</span>}
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{o.patientName}</p>
                  <p className="text-[10px] text-white/50">{o.bodyPart}</p>
                  <p className="text-[10px] text-white/40">{o.orderDate}</p>
                  <p className="font-mono text-[9px] text-white/30 mt-0.5">{o.id}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main viewer */}
          <div className="flex-1 flex flex-col rounded-xl border border-border bg-[#0a0a0a] shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-[#111827] flex-wrap">
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom((z) => Math.max(25, z - 10))} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
                <span className="text-xs text-white/60 w-12 text-center">{zoom}%</span>
                <button onClick={() => setZoom((z) => Math.min(300, z + 10))} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              </div>
              <div className="w-px h-5 bg-white/20" />
              <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Rotate 90°"><RotateCw className="h-4 w-4" /></button>
              <div className="w-px h-5 bg-white/20" />
              <div className="flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-white/40" />
                <input type="range" min="10" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-20 h-1 accent-white cursor-pointer" title="Brightness" />
              </div>
              <div className="flex items-center gap-1">
                <Contrast className="h-3.5 w-3.5 text-white/40" />
                <input type="range" min="10" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-20 h-1 accent-white cursor-pointer" title="Contrast" />
              </div>
              <div className="w-px h-5 bg-white/20" />
              <select value={windowPreset} onChange={(e) => setWindowPreset(e.target.value)} className="h-7 rounded bg-white/10 border border-white/20 text-white text-xs px-2">
                {WINDOW_PRESETS.map((p) => <option key={p} className="bg-[#111827]">{p}</option>)}
              </select>
              <div className="w-px h-5 bg-white/20" />
              <button onClick={() => setShowOverlays(!showOverlays)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${showOverlays ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/10"}`}>
                <Layers className="h-3.5 w-3.5" />Overlays
              </button>
              <button onClick={() => { setZoom(100); setRotation(0); setBrightness(50); setContrast(50); }} className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Settings className="h-3.5 w-3.5" />Reset
              </button>
            </div>

            {/* Image area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
              {selectedOrder ? (
                <>
                  {/* Simulated scan image */}
                  <div className="relative flex items-center justify-center"
                    style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <div
                      style={{
                        width: "380px",
                        height: "380px",
                        background: scanBg,
                        filter: imageFilter,
                        transform: imageTransform,
                        transition: "transform 0.15s ease, filter 0.1s ease",
                        borderRadius: selectedOrder.modality === "X-Ray" ? "50% / 40%" : "8px",
                        boxShadow: "0 0 60px rgba(255,255,255,0.05)",
                      }}
                    />
                    {/* Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-16 h-16">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-green-400/30" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-400/30" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-green-400/50" />
                      </div>
                    </div>
                  </div>

                  {/* Overlays */}
                  {showOverlays && (
                    <>
                      <div className="absolute top-3 left-3 text-[10px] font-mono text-green-400/70 leading-loose pointer-events-none">
                        <p>{selectedOrder.patientName}</p>
                        <p>{selectedOrder.patientId}</p>
                        <p>{selectedOrder.orderDate}</p>
                        <p>{selectedOrder.modality}</p>
                        <p>{selectedOrder.bodyPart}</p>
                        {selectedOrder.laterality !== "N/A" && <p>{selectedOrder.laterality}</p>}
                        {selectedOrder.contrast && <p className="text-yellow-400/70">+ CONTRAST</p>}
                      </div>
                      <div className="absolute top-3 right-3 text-[10px] font-mono text-green-400/70 leading-loose pointer-events-none text-right">
                        <p>{selectedOrder.id}</p>
                        <p>WW/WL: {windowPreset}</p>
                        <p>Zoom: {zoom}%</p>
                        <p>Rot: {rotation}°</p>
                        <p>Brightness: {brightness}</p>
                        <p>Contrast: {contrast}</p>
                        {totalSlices > 1 && <p className="text-cyan-400/70">Slice: {currentSlice}/{totalSlices}</p>}
                      </div>
                      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-green-400/50 pointer-events-none">
                        <p>Shaniid Radiology PACS — Simulated View</p>
                        <p>Series: 1 · Instance: {currentSlice}</p>
                      </div>
                      {selectedOrder.priority !== "Routine" && (
                        <div className="absolute bottom-3 right-3 pointer-events-none">
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedOrder.priority === "STAT" ? "bg-red-600/80 text-white" : "bg-amber-500/80 text-white"}`}>{selectedOrder.priority}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Slice navigation (CT/MRI) */}
                  {totalSlices > 1 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                      <button onClick={() => setCurrentSlice((s) => Math.min(totalSlices, s + 1))} className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronLeft className="h-4 w-4 rotate-90" /></button>
                      <div className="flex flex-col items-center">
                        <input type="range" min={1} max={totalSlices} value={currentSlice} onChange={(e) => setCurrentSlice(Number(e.target.value))}
                          className="h-40 accent-green-400 cursor-pointer" style={{ writingMode: "vertical-lr", direction: "rtl" }} />
                        <span className="text-[9px] text-white/50 mt-1">{currentSlice}</span>
                      </div>
                      <button onClick={() => setCurrentSlice((s) => Math.max(1, s - 1))} className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"><ChevronRight className="h-4 w-4 rotate-90" /></button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <Monitor className="h-16 w-16 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">Select a study to view</p>
                </div>
              )}
            </div>

            {/* Footer toolbar */}
            {selectedOrder && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-[#111827]">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-white/60">
                    {selectedOrder.modality} · {selectedOrder.bodyPart} · {selectedOrder.status}
                  </span>
                  {selectedOrder.findings && <span className="text-xs text-green-400 font-medium">✓ Report available</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <Maximize2 className="h-3.5 w-3.5" />Fullscreen
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <Download className="h-3.5 w-3.5" />Export
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Report panel (if results available) */}
          {selectedOrder?.findings && (
            <div className="w-56 flex-shrink-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-bold text-foreground">Radiology Report</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{selectedOrder.id}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Findings</p>
                  <p className="text-xs text-foreground leading-relaxed">{selectedOrder.findings}</p>
                </div>
                {selectedOrder.impression && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Impression</p>
                    <p className="text-xs text-foreground leading-relaxed">{selectedOrder.impression}</p>
                  </div>
                )}
                <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                  <p className="text-[10px] font-bold text-green-700">Report Status</p>
                  <p className="text-xs text-green-700 font-medium">Finalized</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
