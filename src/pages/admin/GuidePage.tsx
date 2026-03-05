import { PageHeader } from '@/components/ui/page-components';
import { BookOpen, Users, Calendar, BedDouble, FlaskConical, Pill, CreditCard, Package, Shield, Activity } from 'lucide-react';

const sections = [
  { icon: <Users className="h-5 w-5" />, title: 'Patient Management', desc: 'Register new patients, book appointments, manage admissions (ADT). Navigate to Patients > Patient List to register, then use Appointments to schedule visits.' },
  { icon: <Calendar className="h-5 w-5" />, title: 'Appointments', desc: 'Book appointments from Patients > Appointments. Click "Book Appointment", select the patient, doctor, department, and date/time. Check patients in on the day of their visit.' },
  { icon: <BedDouble className="h-5 w-5" />, title: 'Admissions (ADT)', desc: 'Admit, transfer, or discharge inpatients from Patients > Admissions. Ward and bed assignment happens during admission.' },
  { icon: <FlaskConical className="h-5 w-5" />, title: 'Laboratory', desc: 'Lab technicians manage test orders from Lab > Lab Orders. Accept orders, collect samples, enter results, and mark as completed. Results automatically appear in the patient EMR.' },
  { icon: <Pill className="h-5 w-5" />, title: 'Pharmacy', desc: 'Pharmacists view pending prescriptions in Pharmacy > Prescriptions. Click Dispense to fulfill a prescription. Monitor drug stock levels in Pharmacy > Drug Stock.' },
  { icon: <CreditCard className="h-5 w-5" />, title: 'Billing', desc: 'Billing staff create and manage invoices from Billing > Invoices. Record payments, manage insurance claims. Voiding an invoice requires a reason and is logged in the audit trail.' },
  { icon: <Package className="h-5 w-5" />, title: 'Inventory', desc: 'Manage hospital stock in Inventory > Items. Items below minimum stock are highlighted in red. Create purchase orders for procurement and track supplier information.' },
  { icon: <Shield className="h-5 w-5" />, title: 'RBAC & Security', desc: 'Each staff member has a role that determines their module access. Roles: Admin, Reception, Doctor, Nurse, Lab Tech, Pharmacist, Billing, Inventory Manager. Manage staff from Admin > Staff.' },
  { icon: <Activity className="h-5 w-5" />, title: 'Audit Log', desc: 'All critical actions (create, edit, delete, void, dispense) are logged with user info, timestamps, and before/after values. Access from Admin > Audit Log (Admin only).' },
];

export default function GuidePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader title="How to Use HIMS" subtitle="Administrator guide for the Hospital Internal Management System" />
      <div className="card-elevated p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="h-10 w-10 rounded-lg bg-info-bg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-info" />
          </div>
          <div>
            <h2 className="font-semibold">Getting Started</h2>
            <p className="text-sm text-muted-foreground">HIMS centralizes all hospital workflows. Staff sign in with their assigned role — the sidebar will only show modules they have access to.</p>
          </div>
        </div>
        <div className="space-y-5">
          {sections.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">{s.icon}</div>
              <div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border bg-info-bg/40 rounded-lg p-4">
          <p className="text-sm font-medium text-info">💡 Pro tip</p>
          <p className="text-sm text-muted-foreground mt-1">Use the global search in the top bar to quickly find any patient by name, MRN, or phone number from anywhere in the system.</p>
        </div>
      </div>
    </div>
  );
}
