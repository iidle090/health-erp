import React, { useState } from "react";
import { useListPatients, useCreatePatient, useUpdatePatient, useDeletePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { Patient, PatientStatus, CreatePatientBody } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const patientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(0, "Invalid age"),
  contact: z.string().min(5, "Contact is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive", "Critical"]),
  bloodType: z.string().optional(),
  dateAdmitted: z.string().optional(),
  address: z.string().optional(),
});

export function Patients() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = useListPatients({ search });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: 0,
      contact: "",
      email: "",
      status: "Active",
      bloodType: "",
      dateAdmitted: new Date().toISOString().split('T')[0],
      address: "",
    },
  });

  const onSubmit = (values: z.infer<typeof patientSchema>) => {
    if (editingPatient) {
      updatePatient.mutate(
        { id: editingPatient.id, data: values as CreatePatientBody },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
            toast({ title: "Patient updated successfully" });
            setEditingPatient(null);
            form.reset();
          },
        }
      );
    } else {
      createPatient.mutate(
        { data: values as CreatePatientBody },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
            toast({ title: "Patient created successfully" });
            setIsAddOpen(false);
            form.reset();
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      deletePatient.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
            toast({ title: "Patient deleted" });
          },
        }
      );
    }
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    form.reset({
      name: patient.name,
      age: patient.age,
      contact: patient.contact,
      email: patient.email || "",
      status: patient.status,
      bloodType: patient.bloodType || "",
      dateAdmitted: patient.dateAdmitted || new Date().toISOString().split('T')[0],
      address: patient.address || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage patient records and information.</p>
        </div>
        <Dialog open={isAddOpen || !!editingPatient} onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingPatient(null);
            form.reset();
          } else {
            setIsAddOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Patient</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+1 555-0000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <FormControl><Input placeholder="O+" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPatient.isPending || updatePatient.isPending}>
                    {editingPatient ? 'Save Changes' : 'Create Patient'}
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
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Admitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Loading patients...</TableCell>
                  </TableRow>
                ) : patients?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No patients found.</TableCell>
                  </TableRow>
                ) : (
                  patients?.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        <div>{patient.name}</div>
                        <div className="text-xs text-muted-foreground">{patient.age} yrs • {patient.email}</div>
                      </TableCell>
                      <TableCell>{patient.contact}</TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'Active' ? 'default' : patient.status === 'Critical' ? 'destructive' : 'secondary'}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.bloodType || '-'}</TableCell>
                      <TableCell>{patient.dateAdmitted ? new Date(patient.dateAdmitted).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(patient)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(patient.id)}>
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
