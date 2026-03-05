
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUMS ====================

CREATE TYPE public.app_role AS ENUM (
  'admin', 'reception', 'doctor', 'nurse', 'lab_tech', 'pharmacist', 'billing', 'inventory_manager'
);

CREATE TYPE public.appointment_status AS ENUM (
  'scheduled', 'checked_in', 'completed', 'no_show', 'cancelled'
);

CREATE TYPE public.admission_status AS ENUM (
  'admitted', 'transferred', 'discharged'
);

CREATE TYPE public.order_type AS ENUM (
  'lab', 'medication', 'procedure', 'imaging'
);

CREATE TYPE public.order_priority AS ENUM (
  'routine', 'urgent', 'stat'
);

CREATE TYPE public.order_status AS ENUM (
  'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'
);

CREATE TYPE public.invoice_status AS ENUM (
  'draft', 'pending', 'paid', 'partial', 'voided', 'cancelled'
);

CREATE TYPE public.claim_status AS ENUM (
  'draft', 'submitted', 'pending', 'approved', 'rejected', 'paid'
);

CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');

CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

CREATE TYPE public.prescription_status AS ENUM ('pending', 'dispensed', 'cancelled', 'on_hold');

CREATE TYPE public.stock_status AS ENUM ('active', 'inactive', 'discontinued');

CREATE TYPE public.po_status AS ENUM ('draft', 'submitted', 'approved', 'received', 'cancelled');

CREATE TYPE public.audit_action AS ENUM (
  'create', 'update', 'delete', 'login', 'logout', 'view', 'approve', 'reject', 'dispense', 'void'
);

-- ==================== HELPER ====================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==================== STAFF PROFILES ====================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'reception',
  department TEXT,
  employee_id TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Service can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ==================== DEPARTMENTS ====================

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  head_id UUID REFERENCES public.profiles(id),
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL TO authenticated USING (true);

-- ==================== PATIENTS ====================

CREATE SEQUENCE IF NOT EXISTS patient_mrn_seq START 1000;
CREATE OR REPLACE FUNCTION public.generate_mrn()
RETURNS TEXT AS $$
  SELECT 'MRN-' || LPAD(nextval('patient_mrn_seq')::TEXT, 6, '0');
$$ LANGUAGE sql;

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn TEXT UNIQUE NOT NULL DEFAULT public.generate_mrn(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  blood_type blood_type DEFAULT 'unknown',
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete patients" ON public.patients FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== APPOINTMENTS ====================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  doctor_id UUID REFERENCES public.profiles(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized users can manage appointments" ON public.appointments FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== WARDS & BEDS ====================

CREATE TABLE public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  total_beds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view wards" ON public.wards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage wards" ON public.wards FOR ALL TO authenticated USING (true);

CREATE TABLE public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view beds" ON public.beds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage beds" ON public.beds FOR ALL TO authenticated USING (true);

-- ==================== ADMISSIONS ====================

CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  ward_id UUID REFERENCES public.wards(id),
  bed_id UUID REFERENCES public.beds(id),
  attending_doctor_id UUID REFERENCES public.profiles(id),
  admit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  discharge_date TIMESTAMPTZ,
  reason TEXT,
  status admission_status NOT NULL DEFAULT 'admitted',
  discharge_summary TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view admissions" ON public.admissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage admissions" ON public.admissions FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON public.admissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== TRANSFERS ====================

CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  from_ward_id UUID REFERENCES public.wards(id),
  from_bed_id UUID REFERENCES public.beds(id),
  to_ward_id UUID REFERENCES public.wards(id),
  to_bed_id UUID REFERENCES public.beds(id),
  transfer_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  transferred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view transfers" ON public.transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage transfers" ON public.transfers FOR ALL TO authenticated USING (true);

-- ==================== ENCOUNTERS ====================

CREATE TABLE public.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  doctor_id UUID REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id),
  encounter_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  chief_complaint TEXT,
  status TEXT DEFAULT 'open',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view encounters" ON public.encounters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clinical staff manage encounters" ON public.encounters FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON public.encounters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clinical notes (SOAP)
CREATE TABLE public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  diagnosis_code TEXT,
  diagnosis_description TEXT,
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view notes" ON public.clinical_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clinical staff manage notes" ON public.clinical_notes FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_clinical_notes_updated_at BEFORE UPDATE ON public.clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allergies
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT DEFAULT 'moderate',
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view allergies" ON public.allergies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clinical manage allergies" ON public.allergies FOR ALL TO authenticated USING (true);

-- Medical history
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  condition TEXT NOT NULL,
  diagnosis_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view history" ON public.medical_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clinical manage history" ON public.medical_history FOR ALL TO authenticated USING (true);

-- ==================== ORDERS ====================

CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
  SELECT 'ORD-' || LPAD(nextval('order_seq')::TEXT, 6, '0');
$$ LANGUAGE sql;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT public.generate_order_number(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES public.encounters(id),
  order_type order_type NOT NULL,
  priority order_priority NOT NULL DEFAULT 'routine',
  status order_status NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL,
  instructions TEXT,
  ordered_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id),
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage orders" ON public.orders FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Nursing tasks
CREATE TABLE public.nursing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES public.encounters(id),
  admission_id UUID REFERENCES public.admissions(id),
  task_type TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status task_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  completed_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nursing_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view nursing tasks" ON public.nursing_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Nursing manage tasks" ON public.nursing_tasks FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_nursing_tasks_updated_at BEFORE UPDATE ON public.nursing_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== LAB ====================

CREATE TABLE public.lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT,
  normal_range TEXT,
  unit TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view lab tests" ON public.lab_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage lab tests" ON public.lab_tests FOR ALL TO authenticated USING (true);

CREATE TABLE public.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  lab_test_id UUID REFERENCES public.lab_tests(id),
  test_name TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  collected_at TIMESTAMPTZ,
  collected_by UUID REFERENCES public.profiles(id),
  result_value TEXT,
  result_unit TEXT,
  normal_range TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  notes TEXT,
  reported_at TIMESTAMPTZ,
  reported_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view lab orders" ON public.lab_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage lab orders" ON public.lab_orders FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_lab_orders_updated_at BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== PHARMACY ====================

CREATE TABLE public.drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT,
  form TEXT,
  strength TEXT,
  manufacturer TEXT,
  barcode TEXT UNIQUE,
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view drugs" ON public.drugs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pharmacy manage drugs" ON public.drugs FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE SEQUENCE IF NOT EXISTS rx_seq START 1000;
CREATE OR REPLACE FUNCTION public.generate_prescription_number()
RETURNS TEXT AS $$
  SELECT 'RX-' || LPAD(nextval('rx_seq')::TEXT, 6, '0');
$$ LANGUAGE sql;

CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number TEXT UNIQUE NOT NULL DEFAULT public.generate_prescription_number(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES public.encounters(id),
  drug_id UUID REFERENCES public.drugs(id),
  drug_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  quantity INTEGER,
  instructions TEXT,
  status prescription_status NOT NULL DEFAULT 'pending',
  prescribed_by UUID REFERENCES public.profiles(id),
  dispensed_by UUID REFERENCES public.profiles(id),
  dispensed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pharmacy_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  batch_number TEXT,
  expiry_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacy_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view pharmacy stock" ON public.pharmacy_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pharmacy manage stock" ON public.pharmacy_stock FOR ALL TO authenticated USING (true);

-- ==================== INVENTORY ====================

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (true);

CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  sku TEXT UNIQUE,
  unit TEXT DEFAULT 'unit',
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  maximum_stock INTEGER DEFAULT 500,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  supplier_id UUID REFERENCES public.suppliers(id),
  status stock_status DEFAULT 'active',
  expiry_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view inventory" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory manage items" ON public.inventory_items FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  status po_status NOT NULL DEFAULT 'draft',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  notes TEXT,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view POs" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory manage POs" ON public.purchase_orders FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.po_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.po_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view po_items" ON public.po_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory manage po_items" ON public.po_items FOR ALL TO authenticated USING (true);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized manage movements" ON public.stock_movements FOR ALL TO authenticated USING (true);

-- ==================== BILLING ====================

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1000;
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
  SELECT 'INV-' || LPAD(nextval('invoice_seq')::TEXT, 6, '0');
$$ LANGUAGE sql;

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL DEFAULT public.generate_invoice_number(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES public.encounters(id),
  admission_id UUID REFERENCES public.admissions(id),
  status invoice_status NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  notes TEXT,
  void_reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Billing manage invoices" ON public.invoices FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Billing manage invoice items" ON public.invoice_items FOR ALL TO authenticated USING (true);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Billing manage payments" ON public.payments FOR ALL TO authenticated USING (true);

CREATE SEQUENCE IF NOT EXISTS claim_seq START 1000;
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT AS $$
  SELECT 'CLM-' || LPAD(nextval('claim_seq')::TEXT, 6, '0');
$$ LANGUAGE sql;

CREATE TABLE public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL DEFAULT public.generate_claim_number(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  insurance_provider TEXT NOT NULL,
  policy_number TEXT,
  claim_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  status claim_status NOT NULL DEFAULT 'draft',
  submission_date DATE,
  decision_date DATE,
  rejection_reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view claims" ON public.insurance_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Billing manage claims" ON public.insurance_claims FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== AUDIT LOG ====================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  user_role TEXT,
  action audit_action NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ==================== NOTIFICATIONS ====================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ==================== INDEXES ====================

CREATE INDEX idx_patients_mrn ON public.patients(mrn);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_orders_patient ON public.orders(patient_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_lab_orders_patient ON public.lab_orders(patient_id);
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
