import React, { useState } from "react";
import { CalendarDays, Clock, User, Scan, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal, ImagingOrder } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const MODALITY_COLOR: Record<ImagingOrder["modality"], string> = {
  "X-Ray": "border-l-sky-400 bg-sky-50",
  "CT Scan": "border-l-purple-400 bg-purple-50",
  "MRI": "border-l-indigo-400 bg-indigo-50",
  "Ultrasound": "border-l-teal-400 bg-teal-50",
  "Mammography": "border-l-pink-400 bg-pink-50",
  "Fluoroscopy": "border-l-orange-400 bg-orange-50",
  "Nuclear Medicine": "border-l-yellow-400 bg-yellow-50",
  "PET Scan": "border-l-red-400 bg-red-50",
  "DEXA Scan": "border-l-lime-400 bg-lime-50",
  "Echocardiogram": "border-l-rose-400 bg-rose-50",
};

const PRIORITY_COLOR = { STAT: "text-red-700 font-bold", Urgent: "text-amber-700 font-semibold", Routine: "text-gray-600" };

const TIME_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function dateStr(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function formatDay(d: Date) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }

interface ScheduleSlot { orderId: string; time: string; }

export function RadiologySchedule() {
  const { imagingOrders, updateImagingOrder } = useCrossPortal();
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d;
  });
  const [slots, setSlots] = useState<Record<string, ScheduleSlot[]>>({});
  const [scheduling, setScheduling] = useState<{ order: ImagingOrder; day: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);

  // Clinic isolation: only show orders from this clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const orderedOrders = clinicOrders.filter((o) => o.status === "Ordered");
  const scheduledOrders = clinicOrders.filter((o) => o.status === "Scheduled" || o.status === "In Progress");

  const getSlots = (day: string): ScheduleSlot[] => slots[day] ?? [];

  const scheduleOrder = () => {
    if (!scheduling) return;
    const { order, day } = scheduling;
    setSlots((prev) => {
      const daySlots = [...(prev[day] ?? []), { orderId: order.id, time: selectedTime }];
      daySlots.sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [day]: daySlots };
    });
    updateImagingOrder(order.id, { status: "Scheduled", scheduledDate: day });
    setScheduling(null);
  };

  const getOrderById = (id: string) => clinicOrders.find((o) => o.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Radiology Schedule</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{orderedOrders.length} order{orderedOrders.length !== 1 ? "s" : ""} awaiting scheduling</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <button onClick={() => setWeekStart((w) => addDays(w, -7))} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />Previous week
        </button>
        <span className="text-sm font-semibold text-foreground">{formatDay(weekStart)} — {formatDay(weekDays[6])}</span>
        <button onClick={() => setWeekStart((w) => addDays(w, 7))} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Next week<ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending queue */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-foreground">Pending Scheduling ({orderedOrders.length})</h2>
          </div>
          {orderedOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
              <p className="text-sm text-muted-foreground">All orders are scheduled</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {orderedOrders.sort((a, b) => {
                const p = { STAT: 0, Urgent: 1, Routine: 2 };
                return p[a.priority] - p[b.priority];
              }).map((o) => (
                <div key={o.id} className={`rounded-lg border-l-4 p-3 ${MODALITY_COLOR[o.modality]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] font-bold text-[#0f2d4a]">{o.id}</span>
                        <span className={`text-[10px] ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{o.patientName}</p>
                      <p className="text-xs text-muted-foreground">{o.modality} · {o.bodyPart}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">By {o.orderedBy} · {o.orderDate}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {weekDays.map((day) => {
                      const ds = dateStr(day);
                      return (
                        <button key={ds} onClick={() => { setScheduling({ order: o, day: ds }); setSelectedTime(TIME_SLOTS[0]); }}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#0f2d4a] text-[#0f2d4a] hover:bg-[#0f2d4a] hover:text-white transition-colors">
                          {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly calendar */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day) => {
              const ds = dateStr(day);
              const isToday = ds === dateStr(new Date());
              return (
                <div key={ds} className={`p-3 text-center border-r last:border-r-0 border-border ${isToday ? "bg-[#0f2d4a]/5" : ""}`}>
                  <p className="text-[10px] text-muted-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                  <p className={`text-sm font-bold mt-0.5 ${isToday ? "text-[#0f2d4a]" : "text-foreground"}`}>{day.getDate()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{getSlots(ds).length} appt</p>
                </div>
              );
            })}
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-7 border-b border-border/40 last:border-0 min-h-[52px]">
                {weekDays.map((day) => {
                  const ds = dateStr(day);
                  const slot = getSlots(ds).find((s) => s.time === time);
                  const order = slot ? getOrderById(slot.orderId) : null;
                  const isToday = ds === dateStr(new Date());
                  return (
                    <div key={ds} className={`border-r last:border-r-0 border-border/40 px-1.5 py-1.5 ${isToday ? "bg-[#0f2d4a]/3" : ""}`}>
                      {time.endsWith(":00") && !order && (
                        <span className="text-[9px] text-muted-foreground/50">{time}</span>
                      )}
                      {order && (
                        <div className={`rounded p-1 border-l-2 ${MODALITY_COLOR[order.modality]} text-[10px]`}>
                          <p className="font-bold text-[#0f2d4a] leading-tight">{time}</p>
                          <p className="font-medium leading-tight truncate">{order.patientName.split(" ")[0]}</p>
                          <p className="text-muted-foreground leading-tight truncate">{order.modality}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled today */}
      {scheduledOrders.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scan className="h-4 w-4 text-[#0f2d4a]" />
            <h2 className="text-sm font-bold text-foreground">All Scheduled Orders ({scheduledOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scheduledOrders.map((o) => (
              <div key={o.id} className={`rounded-lg border-l-4 p-3 ${MODALITY_COLOR[o.modality]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#0f2d4a]">{o.id}</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{o.patientName}</p>
                    <p className="text-xs text-muted-foreground">{o.modality} · {o.bodyPart}</p>
                    {o.scheduledDate && <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled: {o.scheduledDate}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${o.priority === "STAT" ? "bg-red-100 text-red-700" : o.priority === "Urgent" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{o.priority}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${o.status === "In Progress" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule modal */}
      {scheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-1">Schedule Study</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {scheduling.order.modality} · {scheduling.order.bodyPart} · <span className={`font-semibold ${PRIORITY_COLOR[scheduling.order.priority]}`}>{scheduling.order.priority}</span>
            </p>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/30">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">{scheduling.order.patientName}</p>
                <p className="text-xs text-muted-foreground">{scheduling.order.patientId}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-foreground mb-2">Day: <span className="text-[#0f2d4a]">{new Date(scheduling.day + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span></p>
              <p className="text-xs font-semibold text-foreground mb-2">Time slot:</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {TIME_SLOTS.map((t) => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selectedTime === t ? "bg-[#0f2d4a] border-[#0f2d4a] text-white" : "bg-white border-border text-muted-foreground hover:border-[#0f2d4a]"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setScheduling(null)}>Cancel</Button>
              <Button className="flex-1 bg-[#0f2d4a] hover:bg-[#0a1f36] text-white" onClick={scheduleOrder}>
                <CalendarDays className="h-4 w-4 mr-2" />Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
