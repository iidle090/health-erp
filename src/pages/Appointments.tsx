import React, { useState } from "react";
import { useListAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { Appointment, CreateAppointmentBody } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const appointmentSchema = z.object({
  patientName: z.string().min(2, "Patient Name is required"),
  doctorName: z.string().min(2, "Doctor Name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  status: z.enum(["Pending", "Completed", "Cancelled"]),
  type: z.string().optional(),
  notes: z.string().optional(),
});

export function Appointments() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const { data: appointments, isLoading } = useListAppointments({ status: filterStatus || undefined });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: "",
      doctorName: "",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      status: "Pending",
      type: "Checkup",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof appointmentSchema>) => {
    if (editingAppointment) {
      updateAppointment.mutate(
        { id: editingAppointment.id, data: values as CreateAppointmentBody },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
            toast({ title: "Appointment updated successfully" });
            setEditingAppointment(null);
            form.reset();
          },
        }
      );
    } else {
      createAppointment.mutate(
        { data: values as CreateAppointmentBody },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
            toast({ title: "Appointment created successfully" });
            setIsAddOpen(false);
            form.reset();
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointment.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
            toast({ title: "Appointment deleted" });
          },
        }
      );
    }
  };

  const updateStatus = (appointment: Appointment, newStatus: "Pending" | "Completed" | "Cancelled") => {
    updateAppointment.mutate(
      { 
        id: appointment.id, 
        data: {
          patientName: appointment.patientName,
          doctorName: appointment.doctorName,
          date: appointment.date,
          status: newStatus,
          time: appointment.time,
          type: appointment.type,
          notes: appointment.notes
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          toast({ title: `Appointment marked as ${newStatus}` });
        },
      }
    );
  };

  const openEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    form.reset({
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time || "",
      status: appointment.status,
      type: appointment.type || "",
      notes: appointment.notes || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage patient visits.</p>
        </div>
        <Dialog open={isAddOpen || !!editingAppointment} onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingAppointment(null);
            form.reset();
          } else {
            setIsAddOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="doctorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Name</FormLabel>
                        <FormControl><Input placeholder="Dr. Smith" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl><Input placeholder="Consultation" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl><Input placeholder="Any additional details..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createAppointment.isPending || updateAppointment.isPending}>
                    {editingAppointment ? 'Save Changes' : 'Schedule Appointment'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Loading appointments...</TableCell>
                  </TableRow>
                ) : appointments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No appointments found.</TableCell>
                  </TableRow>
                ) : (
                  appointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.patientName}</TableCell>
                      <TableCell>Dr. {appointment.doctorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          <span className="text-muted-foreground text-xs">{appointment.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.type || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={appointment.status === 'Completed' ? 'default' : appointment.status === 'Cancelled' ? 'destructive' : 'outline'}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStatus(appointment, "Completed")} disabled={appointment.status === "Completed"}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(appointment, "Cancelled")} disabled={appointment.status === "Cancelled"}>
                              <XCircle className="h-4 w-4 mr-2" /> Cancel Appointment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(appointment)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(appointment.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
