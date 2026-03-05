import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// App pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import PatientListPage from "./pages/patients/PatientListPage";
import PatientDetailPage from "./pages/patients/PatientDetailPage";
import NewPatientPage from "./pages/patients/NewPatientPage";
import AppointmentsPage from "./pages/patients/AppointmentsPage";
import AdmissionsPage from "./pages/patients/AdmissionsPage";
import LabOrdersPage from "./pages/lab/LabOrdersPage";
import LabResultsPage from "./pages/lab/LabResultsPage";
import PrescriptionsPage from "./pages/pharmacy/PrescriptionsPage";
import PharmacyStockPage from "./pages/pharmacy/PharmacyStockPage";
import InvoicesPage from "./pages/billing/InvoicesPage";
import PaymentsPage from "./pages/billing/PaymentsPage";
import InsuranceClaimsPage from "./pages/billing/InsuranceClaimsPage";
import InventoryItemsPage from "./pages/inventory/InventoryItemsPage";
import PurchaseOrdersPage from "./pages/inventory/PurchaseOrdersPage";
import SuppliersPage from "./pages/inventory/SuppliersPage";
import StaffPage from "./pages/admin/StaffPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import GuidePage from "./pages/admin/GuidePage";
import OrdersPage from "./pages/clinical/OrdersPage";
import NursingTasksPage from "./pages/clinical/NursingTasksPage";
import EncountersPage from "./pages/emr/EncountersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading HIMS…</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Patients */}
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/new" element={<NewPatientPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              {/* EMR */}
              <Route path="/emr/encounters" element={<EncountersPage />} />
              <Route path="/emr/notes" element={<EncountersPage />} />
              {/* Clinical */}
              <Route path="/clinical/orders" element={<OrdersPage />} />
              <Route path="/clinical/nursing-tasks" element={<NursingTasksPage />} />
              {/* Lab */}
              <Route path="/lab/orders" element={<LabOrdersPage />} />
              <Route path="/lab/results" element={<LabResultsPage />} />
              {/* Pharmacy */}
              <Route path="/pharmacy/prescriptions" element={<PrescriptionsPage />} />
              <Route path="/pharmacy/stock" element={<PharmacyStockPage />} />
              {/* Inventory */}
              <Route path="/inventory/items" element={<InventoryItemsPage />} />
              <Route path="/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/inventory/suppliers" element={<SuppliersPage />} />
              {/* Billing */}
              <Route path="/billing/invoices" element={<InvoicesPage />} />
              <Route path="/billing/payments" element={<PaymentsPage />} />
              <Route path="/billing/claims" element={<InsuranceClaimsPage />} />
              {/* Admin */}
              <Route path="/admin/staff" element={<StaffPage />} />
              <Route path="/admin/audit-log" element={<AuditLogPage />} />
              <Route path="/admin/guide" element={<GuidePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
