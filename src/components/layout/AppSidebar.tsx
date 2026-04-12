import React from "react";
import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Syringe, Receipt, BarChart3, Settings, Scissors, Siren, Package, Users2, GraduationCap, KeyRound } from "lucide-react";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Dashboard",      href: "/admin-dashboard",                icon: LayoutDashboard },
  { name: "Patients",       href: "/admin-dashboard/patients",       icon: Users },
  { name: "Doctors",        href: "/admin-dashboard/doctors",        icon: Users },
  { name: "Nurses",         href: "/admin-dashboard/nurses",         icon: Syringe },
  { name: "Theatre / OT",   href: "/admin-dashboard/theatre",        icon: Scissors },
  { name: "Emergency",      href: "/admin-dashboard/emergency",      icon: Siren },
  { name: "HR & Payroll",   href: "/admin-dashboard/hr",             icon: Users2 },
  { name: "Inventory",      href: "/admin-dashboard/inventory",      icon: Package },
  { name: "Training",       href: "/admin-dashboard/training",       icon: GraduationCap },
  { name: "Staff Accounts", href: "/admin-dashboard/staff-accounts", icon: KeyRound },
  { name: "Billing",        href: "/admin-dashboard/billing",        icon: Receipt },
  { name: "Reports",        href: "/admin-dashboard/reports",        icon: BarChart3 },
  { name: "Settings",       href: "/admin-dashboard/settings",       icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border bg-sidebar h-full">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
            <img src={logo} alt="Shaniid Health ERP" className="h-16 w-auto object-contain" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Admin Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/admin-dashboard" && location.startsWith(item.href));
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
