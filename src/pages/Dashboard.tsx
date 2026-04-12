import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useGetDashboardSummary, 
  useGetRecentPatients, 
  useGetRecentAppointments,
  useGetRevenueChart,
  useGetAppointmentsChart
} from "@workspace/api-client-react";
import { Users, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recentPatients, isLoading: isLoadingPatients } = useGetRecentPatients();
  const { data: recentAppointments, isLoading: isLoadingAppointments } = useGetRecentAppointments();
  const { data: revenueData, isLoading: isLoadingRevenue } = useGetRevenueChart();
  const { data: appointmentsData, isLoading: isLoadingAppointmentsChart } = useGetAppointmentsChart();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingSummary ? "-" : summary?.totalPatients}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingSummary ? "-" : summary?.totalDoctors}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingSummary ? "-" : summary?.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.pendingAppointments} pending, {summary?.completedAppointments} completed
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "-" : `$${summary?.totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.unpaidInvoices} unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="shadow-sm col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {!isLoadingRevenue && revenueData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Chart */}
        <Card className="shadow-sm col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Appointments Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {!isLoadingAppointmentsChart && appointmentsData && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--chart-2))", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Patients */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Patients</CardTitle>
            <CardDescription>Latest patients admitted to the facility.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients?.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{patient.name}</span>
                    <span className="text-xs text-muted-foreground">{patient.contact}</span>
                  </div>
                  <Badge variant={patient.status === 'Active' ? 'default' : patient.status === 'Critical' ? 'destructive' : 'secondary'}>
                    {patient.status}
                  </Badge>
                </div>
              ))}
              {recentPatients?.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No recent patients.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            <CardDescription>Scheduled appointments for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments?.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{apt.patientName}</span>
                    <span className="text-xs text-muted-foreground">Dr. {apt.doctorName} • {apt.time}</span>
                  </div>
                  <Badge variant={apt.status === 'Pending' ? 'outline' : apt.status === 'Completed' ? 'default' : 'secondary'}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
              {recentAppointments?.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No upcoming appointments.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
