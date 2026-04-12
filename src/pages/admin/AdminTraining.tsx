import React, { useState } from "react";
import { GraduationCap, BookOpen, Clock, Users, CheckCircle2, Play, Plus, X, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string; title: string; category: string; description: string;
  instructor: string; duration: string; targetRoles: string[];
  enrolled: number; completed: number; mandatory: boolean;
  status: "Active" | "Draft" | "Archived"; dueDate?: string;
  modules: string[];
}

interface Enrollment {
  staffName: string; staffId: string; courseId: string; courseName: string;
  progress: number; completedDate?: string; status: "In Progress" | "Completed" | "Overdue";
}

const COURSES: Course[] = [
  { id: "TR-001", title: "Infection Prevention & Control", category: "Compliance", description: "Standard precautions, hand hygiene, PPE use, and waste management in healthcare settings.", instructor: "Dr. Mensah", duration: "4h", targetRoles: ["Nurse","Doctor","Lab","Pharmacy","Receptionist"], enrolled: 28, completed: 22, mandatory: true, status: "Active", dueDate: "2026-04-30", modules: ["Hand Hygiene", "PPE & Donning", "Waste Segregation", "Outbreak Response"] },
  { id: "TR-002", title: "Basic Life Support (BLS)", category: "Clinical", description: "CPR, AED use, and emergency response for all clinical staff.", instructor: "Dr. Smith", duration: "6h", targetRoles: ["Nurse","Doctor"], enrolled: 15, completed: 10, mandatory: true, status: "Active", dueDate: "2026-05-15", modules: ["Adult CPR", "Pediatric CPR", "AED Operation", "Choking"] },
  { id: "TR-003", title: "Electronic Health Records (EHR) Training", category: "IT / System", description: "Using the Health ERP system for patient records, prescriptions, and reporting.", instructor: "IT Dept", duration: "3h", targetRoles: ["Doctor","Nurse","Receptionist","Admin"], enrolled: 35, completed: 30, mandatory: true, status: "Active", dueDate: "2026-04-15", modules: ["Patient Registration", "EMR Entry", "Prescriptions", "Reports"] },
  { id: "TR-004", title: "Medication Safety & Administration", category: "Clinical", description: "Safe medication practices, the '5 Rights', and error prevention.", instructor: "Head Pharmacist", duration: "3h", targetRoles: ["Nurse","Pharmacy"], enrolled: 12, completed: 12, mandatory: true, status: "Active", modules: ["5 Rights of Med Admin", "High-Risk Medications", "Error Reporting"] },
  { id: "TR-005", title: "Mental Health First Aid", category: "Wellbeing", description: "Recognising and responding to common mental health challenges in the workplace.", instructor: "Dr. Asante", duration: "5h", targetRoles: ["All"], enrolled: 8, completed: 2, mandatory: false, status: "Active", modules: ["Depression & Anxiety", "Burnout Signs", "Crisis Response", "Referral Pathways"] },
  { id: "TR-006", title: "Laboratory Biosafety Level 2", category: "Safety", description: "Safe handling of BSL-2 pathogens, spill management, and lab safety procedures.", instructor: "Lab Director", duration: "4h", targetRoles: ["Lab"], enrolled: 6, completed: 6, mandatory: true, status: "Archived", modules: ["Pathogen Handling", "Spill Response", "Waste Disposal"] },
];

const ENROLLMENTS: Enrollment[] = [
  { staffName: "Nurse Abena Ofori", staffId: "ST-002", courseId: "TR-001", courseName: "Infection Prevention & Control", progress: 75, status: "In Progress" },
  { staffName: "Nurse Abena Ofori", staffId: "ST-002", courseId: "TR-002", courseName: "Basic Life Support (BLS)", progress: 100, completedDate: "2026-03-20", status: "Completed" },
  { staffName: "Dr. Kwame Smith", staffId: "ST-001", courseId: "TR-001", courseName: "Infection Prevention & Control", progress: 100, completedDate: "2026-04-01", status: "Completed" },
  { staffName: "Kofi Asante", staffId: "ST-004", courseId: "TR-003", courseName: "Electronic Health Records", progress: 40, status: "Overdue" },
  { staffName: "Grace Boateng", staffId: "ST-005", courseId: "TR-004", courseName: "Medication Safety & Administration", progress: 100, completedDate: "2026-03-10", status: "Completed" },
];

const CAT_COLOR: Record<string, string> = {
  Compliance: "bg-red-100 text-red-700", Clinical: "bg-blue-100 text-blue-700",
  "IT / System": "bg-purple-100 text-purple-700", Wellbeing: "bg-green-100 text-green-700",
  Safety: "bg-amber-100 text-amber-700",
};

export function AdminTraining() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"courses" | "enrollments">("courses");
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(COURSES.map(c => c.category)))];
  const displayed = filter === "All" ? COURSES : COURSES.filter(c => c.category === filter);
  const completionRate = Math.round((COURSES.reduce((s,c) => s + c.completed, 0) / Math.max(COURSES.reduce((s,c) => s + c.enrolled, 0), 1)) * 100);
  const overdue = ENROLLMENTS.filter(e => e.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6 text-[#8B1A2F]" />Staff Training & eLearning</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage courses, track completions, and ensure compliance</p>
        </div>
        <Button onClick={() => toast({ title: "Create course flow coming soon" })} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2"><Plus className="h-4 w-4" />New Course</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Courses", value: COURSES.filter(c => c.status === "Active").length, cls: "text-foreground" },
          { label: "Total Enrolled", value: COURSES.reduce((s,c) => s + c.enrolled, 0), cls: "text-blue-600" },
          { label: "Completion Rate", value: `${completionRate}%`, cls: completionRate >= 80 ? "text-green-600" : "text-amber-600" },
          { label: "Overdue", value: overdue, cls: overdue > 0 ? "text-red-600" : "text-foreground" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["courses","enrollments"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "courses" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === c ? "bg-[#8B1A2F] text-white border-[#8B1A2F]" : "border-border text-muted-foreground hover:border-[#8B1A2F]/40"}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(course => {
              const completionPct = Math.round((course.completed / Math.max(course.enrolled, 1)) * 100);
              return (
                <div key={course.id} className={`rounded-xl border p-5 ${course.status === "Archived" ? "opacity-60 border-border" : "border-border bg-card hover:shadow-sm transition-all"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLOR[course.category] ?? "bg-gray-100 text-gray-600"}`}>{course.category}</span>
                        {course.mandatory && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">MANDATORY</span>}
                      </div>
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{course.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled} enrolled</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.instructor}</span>
                    {course.dueDate && <span className="text-amber-600 font-medium">Due {course.dueDate}</span>}
                  </div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{course.completed}/{course.enrolled} completed</span>
                    <span className={completionPct === 100 ? "text-green-600 font-medium" : "text-muted-foreground"}>{completionPct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${completionPct === 100 ? "bg-green-500" : completionPct > 50 ? "bg-[#8B1A2F]" : "bg-amber-400"}`} style={{ width: `${completionPct}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {course.modules.map(m => <span key={m} className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">{m}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "enrollments" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{["Staff","Course","Progress","Status","Completed"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ENROLLMENTS.map((e, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-4 py-3"><p className="font-medium">{e.staffName}</p><p className="text-xs text-muted-foreground">{e.staffId}</p></td>
                  <td className="px-4 py-3 text-sm">{e.courseName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${e.progress === 100 ? "bg-green-500" : e.status === "Overdue" ? "bg-red-400" : "bg-[#8B1A2F]"}`} style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${e.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" : e.status === "Overdue" ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.completedDate ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
