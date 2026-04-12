import React, { useState } from "react";
import { Save, Send, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrossPortal, LabOrder } from "@/context/CrossPortalStore";
import { useNotifications } from "@/context/NotificationStore";
import { useAuth } from "@/context/AuthContext";

type ResultRow = { test: string; value: string; unit: string; range: string; flag: "Normal" | "Abnormal" | "Critical" };

export function LabResultsEntry() {
  const { labOrders, updateLabOrder } = useCrossPortal();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = labOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const inProgress = clinicOrders.filter((o) => o.status === "In Progress");
  const [selectedOrderId, setSelectedOrderId] = useState(inProgress[0]?.id ?? "");
  const [rows, setRows] = useState<ResultRow[]>([{ test: "", value: "", unit: "", range: "", flag: "Normal" }]);
  const [submitted, setSubmitted] = useState(false);

  const selectedOrder = clinicOrders.find((o) => o.id === selectedOrderId);

  const addRow = () => setRows((r) => [...r, { test: "", value: "", unit: "", range: "", flag: "Normal" }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, k: keyof ResultRow, v: string) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const validRows = rows.filter((r) => r.test && r.value);
    updateLabOrder(selectedOrderId, { status: "Completed", completedDate: new Date().toISOString().split("T")[0], results: validRows as LabOrder["results"] });
    sendNotification({ from: "lab", to: "doctor", type: "lab_result", title: `Lab Results Ready — ${selectedOrder.patientName}`, message: `${selectedOrder.tests.join(", ")} for ${selectedOrder.patientName} (${selectedOrder.patientId}) are complete. ${validRows.filter((r) => r.flag !== "Normal").length} abnormal value(s).`, data: { orderId: selectedOrderId } });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-full bg-[#fdf2f4] flex items-center justify-center">
          <Send className="h-8 w-8 text-[#8B1A2F]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Results Submitted</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">Lab results have been recorded and the doctor has been notified via the cross-portal notification system.</p>
        <Button onClick={() => { setSubmitted(false); setRows([{ test: "", value: "", unit: "", range: "", flag: "Normal" }]); }}>Enter More Results</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Results Entry</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter test results — doctor will be notified automatically</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order selection */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Select Test Order</h2>
          <div className="space-y-1.5 max-w-md">
            <Label>Order ID (In Progress)</Label>
            <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {inProgress.map((o) => <option key={o.id} value={o.id}>{o.id} — {o.patientName} ({o.tests.join(", ")})</option>)}
              {inProgress.length === 0 && <option disabled>No orders in progress</option>}
            </select>
          </div>
          {selectedOrder && (
            <div className="mt-4 rounded-lg bg-muted/30 p-4 text-sm space-y-1">
              <p><span className="text-muted-foreground">Patient:</span> <strong>{selectedOrder.patientName}</strong> ({selectedOrder.patientId})</p>
              <p><span className="text-muted-foreground">Tests:</span> {selectedOrder.tests.join(", ")}</p>
              <p><span className="text-muted-foreground">Ordered by:</span> {selectedOrder.orderedBy}</p>
              {selectedOrder.sampleId && <p><span className="text-muted-foreground">Sample:</span> {selectedOrder.sampleId} · {selectedOrder.sampleType}</p>}
              <p><span className="text-muted-foreground">Notes:</span> {selectedOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Results table */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Enter Results</h2>
            <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Row</Button>
          </div>
          <div className="space-y-3">
            <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/50">
              <span className="col-span-3">Test Name</span>
              <span className="col-span-2">Result Value</span>
              <span className="col-span-2">Unit</span>
              <span className="col-span-3">Reference Range</span>
              <span className="col-span-1">Flag</span>
              <span className="col-span-1"></span>
            </div>
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center">
                <Input className="col-span-3" placeholder="e.g. Hemoglobin" value={row.test} onChange={(e) => updateRow(i, "test", e.target.value)} />
                <Input className="col-span-2" placeholder="14.2" value={row.value} onChange={(e) => updateRow(i, "value", e.target.value)} />
                <Input className="col-span-2" placeholder="g/dL" value={row.unit} onChange={(e) => updateRow(i, "unit", e.target.value)} />
                <Input className="col-span-3" placeholder="12–16" value={row.range} onChange={(e) => updateRow(i, "range", e.target.value)} />
                <select className="col-span-1 h-10 rounded-md border border-input bg-background px-2 text-xs" value={row.flag} onChange={(e) => updateRow(i, "flag", e.target.value as ResultRow["flag"])}>
                  <option value="Normal">Normal</option>
                  <option value="Abnormal">Abnormal</option>
                  <option value="Critical">Critical</option>
                </select>
                <button type="button" onClick={() => removeRow(i)} className="col-span-1 flex items-center justify-center h-10 w-full rounded-md hover:bg-muted/40 text-muted-foreground hover:text-[#8B1A2F] transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => setRows([{ test: "", value: "", unit: "", range: "", flag: "Normal" }])}>Clear</Button>
          <Button type="submit" disabled={!selectedOrderId || inProgress.length === 0} className="gap-2">
            <Send className="h-4 w-4" />Submit & Notify Doctor
          </Button>
        </div>
      </form>
    </div>
  );
}
