import { useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { PatientStoreProvider } from "@/context/PatientStore";
import { NotificationProvider } from "@/context/NotificationStore";
import { CrossPortalProvider } from "@/context/CrossPortalStore";
import { SuperAdminProvider } from "@/context/SuperAdminStore";

import { AppLayout } from "@/components/layout/AppLayout";
import { DoctorLayout } from "@/components/layout/DoctorLayout";
import { NurseLayout } from "@/components/layout/NurseLayout";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { LabLayout } from "@/components/layout/LabLayout";
import { PharmacyLayout } from "@/components/layout/PharmacyLayout";
import { AccountantLayout } from "@/components/layout/AccountantLayout";
import { ReceptionistLayout } from "@/components/layout/ReceptionistLayout";
import { RadiologyLayout } from "@/components/layout/RadiologyLayout";

import { RoleSelection } from "@/pages/RoleSelection";

// Admin pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { Patients } from "@/pages/Patients";
import { Doctors } from "@/pages/Doctors";
import { Nurses } from "@/pages/Nurses";
import { Billing } from "@/pages/Billing";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { AdminStaffAccounts } from "@/pages/admin/AdminStaffAccounts";

// Doctor pages
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";
import { DoctorPatients } from "@/pages/doctor/DoctorPatients";
import { DoctorAppointments } from "@/pages/doctor/DoctorAppointments";
import { DoctorEMR } from "@/pages/doctor/DoctorEMR";
import { DoctorPrescriptions } from "@/pages/doctor/DoctorPrescriptions";
import { DoctorLabResults } from "@/pages/doctor/DoctorLabResults";
import { DoctorMessages } from "@/pages/doctor/DoctorMessages";
import { DoctorTelemedicine } from "@/pages/doctor/DoctorTelemedicine";
import { DoctorImaging } from "@/pages/doctor/DoctorImaging";
import { DoctorSurgeries } from "@/pages/doctor/DoctorSurgeries";
import { DoctorCriticalCare } from "@/pages/doctor/DoctorCriticalCare";

// Nurse pages
import { NurseDashboard } from "@/pages/nurse/NurseDashboard";
import { NursePatients } from "@/pages/nurse/NursePatients";
import { NurseSchedule } from "@/pages/nurse/NurseSchedule";
import { NurseMedications } from "@/pages/nurse/NurseMedications";
import { NurseLabResults } from "@/pages/nurse/NurseLabResults";
import { NurseTasks } from "@/pages/nurse/NurseTasks";
import { NurseClinicalNotes } from "@/pages/nurse/NurseClinicalNotes";
import { NurseBedWard } from "@/pages/nurse/NurseBedWard";
import { NurseQueue } from "@/pages/nurse/NurseQueue";
import { NurseCriticalCare } from "@/pages/nurse/NurseCriticalCare";

// Super Admin pages
import { SuperDashboard } from "@/pages/superadmin/SuperDashboard";
import { SuperClinics } from "@/pages/superadmin/SuperClinics";
import { SuperUsers } from "@/pages/superadmin/SuperUsers";
import { SuperReports } from "@/pages/superadmin/SuperReports";
import { SuperBillingPlans } from "@/pages/superadmin/SuperBillingPlans";
import { SuperSettings } from "@/pages/superadmin/SuperSettings";
import { SuperAuditLogs } from "@/pages/superadmin/SuperAuditLogs";
import { SuperAdminAccounts } from "@/pages/superadmin/SuperAdminAccounts";
import { SuperClinicDetail } from "@/pages/superadmin/SuperClinicDetail";

// Admin new pages
import { AdminTheatre } from "@/pages/admin/AdminTheatre";
import { AdminEmergency } from "@/pages/admin/AdminEmergency";
import { AdminHR } from "@/pages/admin/AdminHR";
import { AdminInventory } from "@/pages/admin/AdminInventory";
import { AdminTraining } from "@/pages/admin/AdminTraining";

// Lab pages
import { LabDashboard } from "@/pages/lab/LabDashboard";
import { LabTestOrders } from "@/pages/lab/LabTestOrders";
import { LabSamples } from "@/pages/lab/LabSamples";
import { LabResultsEntry } from "@/pages/lab/LabResultsEntry";
import { LabReports } from "@/pages/lab/LabReports";
import { LabInventory } from "@/pages/lab/LabInventory";

// Pharmacy pages
import { PharmacyDashboard } from "@/pages/pharmacy/PharmacyDashboard";
import { PharmacyPrescriptions } from "@/pages/pharmacy/PharmacyPrescriptions";
import { PharmacyDispense } from "@/pages/pharmacy/PharmacyDispense";
import { PharmacyInventory } from "@/pages/pharmacy/PharmacyInventory";
import { PharmacyExpiryAlerts } from "@/pages/pharmacy/PharmacyExpiryAlerts";
import { PharmacySuppliers } from "@/pages/pharmacy/PharmacySuppliers";

// Accountant pages
import { AccountantDashboard } from "@/pages/accountant/AccountantDashboard";
import { AccountantInvoices } from "@/pages/accountant/AccountantInvoices";
import { AccountantPayments } from "@/pages/accountant/AccountantPayments";
import { AccountantInsurance } from "@/pages/accountant/AccountantInsurance";
import { AccountantReports } from "@/pages/accountant/AccountantReports";
import { AccountantExpenses } from "@/pages/accountant/AccountantExpenses";
import { AccountantPurchaseApprovals } from "@/pages/accountant/AccountantPurchaseApprovals";

// Radiology pages
import { RadiologyDashboard } from "@/pages/radiology/RadiologyDashboard";
import { RadiologyOrders } from "@/pages/radiology/RadiologyOrders";
import { RadiologySchedule } from "@/pages/radiology/RadiologySchedule";
import { RadiologyResults } from "@/pages/radiology/RadiologyResults";
import { RadiologyPACS } from "@/pages/radiology/RadiologyPACS";
import { RadiologyEquipment } from "@/pages/radiology/RadiologyEquipment";
import { RadiologyReports } from "@/pages/radiology/RadiologyReports";

// Receptionist pages
import { ReceptionistDashboard } from "@/pages/receptionist/ReceptionistDashboard";
import { ReceptionistPatientReg } from "@/pages/receptionist/ReceptionistPatientReg";
import { ReceptionistBilling } from "@/pages/receptionist/ReceptionistBilling";
import { ReceptionistQueue } from "@/pages/receptionist/ReceptionistQueue";
import { ReceptionistReceipts } from "@/pages/receptionist/ReceptionistReceipts";
import { ReceptionistEmergency } from "@/pages/receptionist/ReceptionistEmergency";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AdminSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/admin-dashboard" || location === "/admin-dashboard/") return <AdminDashboard />;
    if (location === "/admin-dashboard/patients") return <Patients />;
    if (location === "/admin-dashboard/doctors") return <Doctors />;
    if (location === "/admin-dashboard/nurses") return <Nurses />;
    if (location === "/admin-dashboard/theatre") return <AdminTheatre />;
    if (location === "/admin-dashboard/emergency") return <AdminEmergency />;
    if (location === "/admin-dashboard/hr") return <AdminHR />;
    if (location === "/admin-dashboard/inventory") return <AdminInventory />;
    if (location === "/admin-dashboard/training") return <AdminTraining />;
    if (location === "/admin-dashboard/staff-accounts") return <AdminStaffAccounts />;
    if (location === "/admin-dashboard/billing") return <Billing />;
    if (location === "/admin-dashboard/reports") return <Reports />;
    if (location === "/admin-dashboard/settings") return <Settings />;
    return <NotFound />;
  })();
  return <AppLayout>{page}</AppLayout>;
}

function DoctorSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/doctor-dashboard" || location === "/doctor-dashboard/") return <DoctorDashboard />;
    if (location === "/doctor-dashboard/patients") return <DoctorPatients />;
    if (location === "/doctor-dashboard/appointments") return <DoctorAppointments />;
    if (location === "/doctor-dashboard/emr") return <DoctorEMR />;
    if (location === "/doctor-dashboard/prescriptions") return <DoctorPrescriptions />;
    if (location === "/doctor-dashboard/lab-results") return <DoctorLabResults />;
    if (location === "/doctor-dashboard/imaging") return <DoctorImaging />;
    if (location === "/doctor-dashboard/surgeries") return <DoctorSurgeries />;
    if (location === "/doctor-dashboard/critical-care") return <DoctorCriticalCare />;
    if (location === "/doctor-dashboard/messages") return <DoctorMessages />;
    if (location === "/doctor-dashboard/telemedicine") return <DoctorTelemedicine />;
    return <NotFound />;
  })();
  return <DoctorLayout>{page}</DoctorLayout>;
}

function NurseSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/nurse-dashboard" || location === "/nurse-dashboard/") return <NurseDashboard />;
    if (location === "/nurse-dashboard/queue") return <NurseQueue />;
    if (location === "/nurse-dashboard/patients") return <NursePatients />;
    if (location === "/nurse-dashboard/critical-care") return <NurseCriticalCare />;
    if (location === "/nurse-dashboard/schedule") return <NurseSchedule />;
    if (location === "/nurse-dashboard/medications") return <NurseMedications />;
    if (location === "/nurse-dashboard/lab-results") return <NurseLabResults />;
    if (location === "/nurse-dashboard/tasks") return <NurseTasks />;
    if (location === "/nurse-dashboard/notes") return <NurseClinicalNotes />;
    if (location === "/nurse-dashboard/bed-ward") return <NurseBedWard />;
    return <NotFound />;
  })();
  return <NurseLayout>{page}</NurseLayout>;
}

function SuperAdminSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/superadmin" || location === "/superadmin/") return <SuperDashboard />;
    if (location === "/superadmin/clinics") return <SuperClinics />;
    if (location === "/superadmin/users") return <SuperUsers />;
    if (location === "/superadmin/reports") return <SuperReports />;
    if (location === "/superadmin/billing") return <SuperBillingPlans />;
    if (location === "/superadmin/settings") return <SuperSettings />;
    if (location === "/superadmin/admins") return <SuperAdminAccounts />;
    if (location === "/superadmin/audit") return <SuperAuditLogs />;
    if (location.startsWith("/superadmin/clinic/")) {
      const clinicId = location.split("/superadmin/clinic/")[1];
      return <SuperClinicDetail clinicId={clinicId} />;
    }
    return <NotFound />;
  })();
  return <SuperAdminLayout>{page}</SuperAdminLayout>;
}

function LabSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/lab" || location === "/lab/") return <LabDashboard />;
    if (location === "/lab/orders") return <LabTestOrders />;
    if (location === "/lab/samples") return <LabSamples />;
    if (location === "/lab/results") return <LabResultsEntry />;
    if (location === "/lab/inventory") return <LabInventory />;
    if (location === "/lab/reports") return <LabReports />;
    return <NotFound />;
  })();
  return <LabLayout>{page}</LabLayout>;
}

function PharmacySection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/pharmacy" || location === "/pharmacy/") return <PharmacyDashboard />;
    if (location === "/pharmacy/prescriptions") return <PharmacyPrescriptions />;
    if (location === "/pharmacy/dispense") return <PharmacyDispense />;
    if (location === "/pharmacy/inventory") return <PharmacyInventory />;
    if (location === "/pharmacy/expiry") return <PharmacyExpiryAlerts />;
    if (location === "/pharmacy/suppliers") return <PharmacySuppliers />;
    return <NotFound />;
  })();
  return <PharmacyLayout>{page}</PharmacyLayout>;
}

function AccountantSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/accountant" || location === "/accountant/") return <AccountantDashboard />;
    if (location === "/accountant/invoices") return <AccountantInvoices />;
    if (location === "/accountant/payments") return <AccountantPayments />;
    if (location === "/accountant/expenses") return <AccountantExpenses />;
    if (location === "/accountant/purchase-approvals") return <AccountantPurchaseApprovals />;
    if (location === "/accountant/insurance") return <AccountantInsurance />;
    if (location === "/accountant/reports") return <AccountantReports />;
    return <NotFound />;
  })();
  return <AccountantLayout>{page}</AccountantLayout>;
}

function RadiologySection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/radiology" || location === "/radiology/") return <RadiologyDashboard />;
    if (location === "/radiology/orders") return <RadiologyOrders />;
    if (location === "/radiology/schedule") return <RadiologySchedule />;
    if (location === "/radiology/results") return <RadiologyResults />;
    if (location === "/radiology/pacs") return <RadiologyPACS />;
    if (location === "/radiology/equipment") return <RadiologyEquipment />;
    if (location === "/radiology/reports") return <RadiologyReports />;
    return <NotFound />;
  })();
  return <RadiologyLayout>{page}</RadiologyLayout>;
}

function ReceptionistSection() {
  const [location] = useLocation();
  const page = (() => {
    if (location === "/receptionist" || location === "/receptionist/") return <ReceptionistDashboard />;
    if (location === "/receptionist/register") return <ReceptionistPatientReg />;
    if (location === "/receptionist/billing") return <ReceptionistBilling />;
    if (location === "/receptionist/queue") return <ReceptionistQueue />;
    if (location === "/receptionist/emergency") return <ReceptionistEmergency />;
    if (location === "/receptionist/receipts") return <ReceptionistReceipts />;
    return <NotFound />;
  })();
  return <ReceptionistLayout>{page}</ReceptionistLayout>;
}

function Router() {
  const [location] = useLocation();
  if (location === "/" || location.startsWith("/login")) return <RoleSelection />;
  if (location.startsWith("/admin-dashboard")) return <AdminSection />;
  if (location.startsWith("/doctor-dashboard")) return <DoctorSection />;
  if (location.startsWith("/nurse-dashboard")) return <NurseSection />;
  if (location.startsWith("/superadmin")) return <SuperAdminSection />;
  if (location.startsWith("/lab")) return <LabSection />;
  if (location.startsWith("/pharmacy")) return <PharmacySection />;
  if (location.startsWith("/accountant")) return <AccountantSection />;
  if (location.startsWith("/receptionist")) return <ReceptionistSection />;
  if (location.startsWith("/radiology")) return <RadiologySection />;
  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <PatientStoreProvider>
              <NotificationProvider>
                <CrossPortalProvider>
                  <SuperAdminProvider>
                    <Router />
                  </SuperAdminProvider>
                </CrossPortalProvider>
              </NotificationProvider>
            </PatientStoreProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
