import React from "react";
import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarDays, FileText, Pill, FlaskConical, MessageSquare, Video, Scissors, ScanLine, Activity } from "lucide-react";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/doctor-dashboard/patients", icon: Users },
  { name: "Appointments", href: "/doctor-dashboard/appointments", icon: CalendarDays },
  { name: "EMR", href: "/doctor-dashboard/emr", icon: FileText },
  { name: "Prescriptions", href: "/doctor-dashboard/prescriptions", icon: Pill },
  { name: "Lab Results", href: "/doctor-dashboard/lab-results", icon: FlaskConical },
  { name: "Imaging", href: "/doctor-dashboard/imaging", icon: ScanLine },
  { name: "Surgeries", href: "/doctor-dashboard/surgeries", icon: Scissors },
  { name: "Critical Care", href: "/doctor-dashboard/critical-care", icon: Activity },
  { name: "Messages", href: "/doctor-dashboard/messages", icon: MessageSquare },
  { name: "Telemedicine", href: "/doctor-dashboard/telemedicine", icon: Video },
];

export function DoctorSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border bg-sidebar h-full">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Doctor Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  location === item.href ||
                  (item.href !== "/doctor-dashboard" && location.startsWith(item.href));
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
