import React from "react";
import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarClock, Pill, FlaskConical, ClipboardList, FileText, BedDouble, Ticket, Activity } from "lucide-react";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Dashboard", href: "/nurse-dashboard", icon: LayoutDashboard },
  { name: "Queue / Triage", href: "/nurse-dashboard/queue", icon: Ticket },
  { name: "Patients", href: "/nurse-dashboard/patients", icon: Users },
  { name: "Critical Care", href: "/nurse-dashboard/critical-care", icon: Activity },
  { name: "Schedule Nursing", href: "/nurse-dashboard/schedule", icon: CalendarClock },
  { name: "Medications", href: "/nurse-dashboard/medications", icon: Pill },
  { name: "Lab Results", href: "/nurse-dashboard/lab-results", icon: FlaskConical },
  { name: "Tasks", href: "/nurse-dashboard/tasks", icon: ClipboardList },
  { name: "Clinical Notes", href: "/nurse-dashboard/notes", icon: FileText },
  { name: "Bed & Ward", href: "/nurse-dashboard/bed-ward", icon: BedDouble },
];

export function NurseSidebar() {
  const [location] = useLocation();
  return (
    <Sidebar className="border-r border-border bg-sidebar h-full">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Nurse Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/nurse-dashboard" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
