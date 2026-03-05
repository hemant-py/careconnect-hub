import { AppRole } from '@/types';

export interface RoutePermission {
  path: string;
  allowedRoles: AppRole[];
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin / IT',
  reception: 'Reception',
  doctor: 'Doctor',
  nurse: 'Nurse',
  lab_tech: 'Lab Technician',
  pharmacist: 'Pharmacist',
  billing: 'Billing / Finance',
  inventory_manager: 'Inventory Manager',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  reception: 'bg-blue-100 text-blue-700',
  doctor: 'bg-teal-100 text-teal-700',
  nurse: 'bg-pink-100 text-pink-700',
  lab_tech: 'bg-orange-100 text-orange-700',
  pharmacist: 'bg-green-100 text-green-700',
  billing: 'bg-yellow-100 text-yellow-700',
  inventory_manager: 'bg-indigo-100 text-indigo-700',
};

export const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'reception', 'doctor', 'nurse', 'lab_tech', 'pharmacist', 'billing', 'inventory_manager'] as AppRole[],
  },
  {
    key: 'patients',
    label: 'Patients',
    path: '/patients',
    icon: 'Users',
    roles: ['admin', 'reception', 'doctor', 'nurse', 'billing'] as AppRole[],
    children: [
      { key: 'patients-list', label: 'Patient List', path: '/patients' },
      { key: 'appointments', label: 'Appointments', path: '/appointments' },
      { key: 'admissions', label: 'Admissions / ADT', path: '/admissions' },
    ],
  },
  {
    key: 'emr',
    label: 'EMR',
    path: '/emr',
    icon: 'FileText',
    roles: ['admin', 'doctor', 'nurse'] as AppRole[],
    children: [
      { key: 'encounters', label: 'Encounters', path: '/emr/encounters' },
      { key: 'clinical-notes', label: 'Clinical Notes', path: '/emr/notes' },
    ],
  },
  {
    key: 'clinical',
    label: 'Clinical',
    path: '/clinical',
    icon: 'Stethoscope',
    roles: ['admin', 'doctor', 'nurse'] as AppRole[],
    children: [
      { key: 'orders', label: 'Orders', path: '/clinical/orders' },
      { key: 'nursing-tasks', label: 'Nursing Tasks', path: '/clinical/nursing-tasks' },
    ],
  },
  {
    key: 'lab',
    label: 'Laboratory',
    path: '/lab',
    icon: 'FlaskConical',
    roles: ['admin', 'lab_tech', 'doctor', 'nurse'] as AppRole[],
    children: [
      { key: 'lab-orders', label: 'Lab Orders', path: '/lab/orders' },
      { key: 'lab-results', label: 'Results', path: '/lab/results' },
    ],
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    path: '/pharmacy',
    icon: 'Pill',
    roles: ['admin', 'pharmacist', 'doctor'] as AppRole[],
    children: [
      { key: 'prescriptions', label: 'Prescriptions', path: '/pharmacy/prescriptions' },
      { key: 'drug-stock', label: 'Drug Stock', path: '/pharmacy/stock' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    roles: ['admin', 'inventory_manager'] as AppRole[],
    children: [
      { key: 'stock-items', label: 'Stock Items', path: '/inventory/items' },
      { key: 'purchase-orders', label: 'Purchase Orders', path: '/inventory/purchase-orders' },
      { key: 'suppliers', label: 'Suppliers', path: '/inventory/suppliers' },
    ],
  },
  {
    key: 'billing',
    label: 'Billing',
    path: '/billing',
    icon: 'CreditCard',
    roles: ['admin', 'billing', 'reception'] as AppRole[],
    children: [
      { key: 'invoices', label: 'Invoices', path: '/billing/invoices' },
      { key: 'payments', label: 'Payments', path: '/billing/payments' },
      { key: 'claims', label: 'Insurance Claims', path: '/billing/claims' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'Settings',
    roles: ['admin'] as AppRole[],
    children: [
      { key: 'staff', label: 'Staff Management', path: '/admin/staff' },
      { key: 'departments', label: 'Departments', path: '/admin/departments' },
      { key: 'audit-log', label: 'Audit Log', path: '/admin/audit-log' },
      { key: 'how-to-use', label: 'How to Use', path: '/admin/guide' },
    ],
  },
];
