import React, { useState } from "react";
import { Search, Filter, ClipboardList, ChevronDown, AlertTriangle, X, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
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

const STATUS_OPTIONS: ImagingOrder["status"][] = ["Ordered", "Scheduled", "In Progress", "Completed", "Cancelled"];
const STATUS_COLOR: Record<ImagingOrder["status"], string> = {
  Ordered: "bg-amber-50 text-amber-700 border-amber-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};
const PRIORITY_COLOR = { STAT: "bg-red-100 text-red-700", Urgent: "bg-amber-100 text-amber-700", Routine: "bg-gray-100 text-gray-600" };

const MODALITIES: ImagingOrder["modality"][] = ["X-Ray", "CT Scan", "MRI", "Ultrasound", "Mammography", "Fluoroscopy", "Nuclear Medicine", "PET Scan", "DEXA Scan", "Echocardiogram"];

function OrderDetail({ order, onClose }: { order: ImagingOrder; onClose: () => void }) {
  const { updateImagingOrder } = useCrossPortal();
  const { sendNotification } = useNotifications();
  const [scheduledDate, setScheduledDate] = useState(order.scheduledDate ?? "");
  const [technicianNotes, setTechnicianNotes] = useState(order.notes ?? "");

  const nextStatus = (current: ImagingOrder["status"]): ImagingOrder["status"] | null => {
    const flow: ImagingOrder["status"][] = ["Ordered", "Scheduled", "In Progress", "Completed"];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const advance = () => {
    const next = nextStatus(order.status);
    if (!next) return;
    const update: Partial<ImagingOrder> = { status: next };
    if (next === "Scheduled" && scheduledDate) update.scheduledDate = scheduledDate;
    if (next === "Completed") update.completedDate = new Date().toISOString().split("T")[0];
    if (technicianNotes) update.notes = technicianNotes;
    updateImagingOrder(order.id, update);
    if (next === "Completed") {
      sendNotification({
        from: "radiology",
        to: "doctor",
        type: "general",
        title: `Imaging Completed — ${order.patientId}`,
        message: `${order.modality} ${order.bodyPart} for ${order.patientName} is now complete. Results are ready for review.`,
        data: { patientId: order.patientId, orderId: order.id },
      });
    }
    onClose();
  };

  const cancel = () => {
    updateImagingOrder(order.id, { status: "Cancelled" });
    onClose();
  };

  const next = nextStatus(order.status);
  const ACTION_LABELS: Record<string, string> = { Scheduled: "Mark Scheduled", "In Progress": "Start Exam", Completed: "Mark Complete" };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between p-5 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[#0f2d4a]">{order.id}</span>
            {order.priority !== "Routine" && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[order.priority]}`}>{order.priority}</span>}
          </div>
          <h3 className="text-lg font-bold text-foreground">{order.patientName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{order.patientId} · Ordered by {order.orderedBy}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLOR[order.status]}`}>{order.status}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Study details */}
        <div className="rounded-xl bg-muted/30 p-4 space-y-3">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Study Details</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Modality", value: <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MODALITY_COLOR[order.modality]}`}>{order.modality}</span> },
              { label: "Body Region", value: order.bodyPart },
              { label: "Laterality", value: order.laterality },
              { label: "Contrast", value: order.contrast ? "Yes — IV/Gadolinium" : "No" },
              { label: "Priority", value: order.priority },
              { label: "Order Date", value: order.orderDate },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                <div className="text-sm font-medium text-foreground mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical indication */}
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-700 mb-1">Clinical Indication</p>
          <p className="text-sm text-foreground">{order.clinicalIndication}</p>
        </div>

        {/* Existing notes */}
        {order.notes && order.status !== "Ordered" && (
          <div className="rounded-xl bg-muted/30 p-3">
            <p className="text-xs font-bold text-foreground mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}

        {/* Findings (if completed) */}
        {order.findings && (
          <div className="rounded-xl bg-green-50 border border-green-100 p-3">
            <p className="text-xs font-bold text-green-700 mb-1">Findings</p>
            <p className="text-sm text-foreground">{order.findings}</p>
            {order.impression && <>
              <p className="text-xs font-bold text-green-700 mt-2 mb-1">Impression</p>
              <p className="text-sm text-foreground">{order.impression}</p>
            </>}
          </div>
        )}

        {/* Scheduling date (if moving to Scheduled) */}
        {order.status === "Ordered" && (
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Schedule Date (optional)</label>
            <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm" />
          </div>
        )}

        {/* Technician notes */}
        {order.status !== "Completed" && order.status !== "Cancelled" && (
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Technician Notes</label>
            <textarea value={technicianNotes} onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Patient preparation, equipment used, positioning notes..."
              rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/30" />
          </div>
        )}
      </div>

      {/* Actions */}
      {order.status !== "Completed" && order.status !== "Cancelled" && (
        <div className="flex gap-3 px-5 py-4 border-t border-border/50">
          <Button variant="outline" className="flex-1 text-sm h-9 text-red-600 border-red-200 hover:bg-red-50" onClick={cancel}>Cancel Order</Button>
          {next && (
            <Button className="flex-1 text-sm h-9 bg-[#0f2d4a] hover:bg-[#0a1f36] text-white" onClick={advance}>
              {ACTION_LABELS[next] ?? `→ ${next}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function RadiologyOrders() {
  const { imagingOrders } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ImagingOrder["status"] | "All">("All");
  const [modalityFilter, setModalityFilter] = useState<ImagingOrder["modality"] | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "STAT" | "Urgent" | "Routine">("All");
  const [selected, setSelected] = useState<ImagingOrder | null>(null);

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const filtered = clinicOrders.filter((o) => {
    const ms = o.patientName.toLowerCase().includes(search.toLowerCase()) || o.patientId.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || o.status === statusFilter;
    const mm = modalityFilter === "All" || o.modality === modalityFilter;
    const mp = priorityFilter === "All" || o.priority === priorityFilter;
    return ms && mst && mm && mp;
  }).sort((a, b) => {
    const pri = { STAT: 0, Urgent: 1, Routine: 2 };
    return pri[a.priority] - pri[b.priority];
  });

  const statCount = clinicOrders.filter((o) => o.priority === "STAT" && o.status !== "Completed" && o.status !== "Cancelled").length;

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className={`flex flex-col ${selected ? "w-[440px] flex-shrink-0" : "flex-1"} transition-all`}>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Imaging Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clinicOrders.length} total · {clinicOrders.filter((o) => o.status === "Ordered").length} pending</p>
        </div>

        {statCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 mb-3">
            <Zap className="h-4 w-4 text-red-600" />
            <p className="text-sm font-bold text-red-700">{statCount} active STAT order{statCount > 1 ? "s" : ""}</p>
            <button onClick={() => setPriorityFilter("STAT")} className="ml-auto text-xs font-semibold text-red-700 underline">Filter STAT</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patient, ID, order..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 rounded-lg border border-input bg-background px-2 text-xs">
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={modalityFilter} onChange={(e) => setModalityFilter(e.target.value as any)}
              className="h-9 rounded-lg border border-input bg-background px-2 text-xs">
              <option value="All">All Modalities</option>
              {MODALITIES.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="h-9 rounded-lg border border-input bg-background px-2 text-xs">
              <option value="All">All Priority</option>
              <option value="STAT">STAT</option>
              <option value="Urgent">Urgent</option>
              <option value="Routine">Routine</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <ClipboardList className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-base font-semibold text-muted-foreground">{clinicOrders.length === 0 ? "No imaging orders yet" : "No orders match filters"}</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {clinicOrders.length === 0
                  ? "Orders will appear here when doctors submit imaging requests from the patient panel."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((o) => (
                <div key={o.id}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${selected?.id === o.id ? "bg-muted/40 border-l-2 border-[#0f2d4a]" : ""} ${o.priority === "STAT" ? "bg-red-50/30" : ""}`}
                  onClick={() => setSelected(o)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-[#0f2d4a]">{o.id}</span>
                      {o.priority !== "Routine" && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>}
                      {o.contrast && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">+contrast</span>}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{o.patientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MODALITY_COLOR[o.modality]}`}>{o.modality}</span>
                      <span className="text-xs text-muted-foreground">{o.bodyPart}{o.laterality !== "N/A" ? ` (${o.laterality})` : ""}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{o.orderedBy} · {o.orderDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[o.status]}`}>{o.status}</span>
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
          <OrderDetail order={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}
