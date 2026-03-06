import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowLeft, User, Calendar, BedDouble, CreditCard, Activity } from 'lucide-react';
import { Patient } from '@/types';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (id) {
      supabase.from('patients').select('*').eq('id', id).single()
        .then(({ data }) => { setPatient(data); setLoading(false); });
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (tab === 'appointments') fetchTab('appointments');
    else if (tab === 'admissions') fetchTab('admissions');
    else if (tab === 'billing') fetchTab('billing');
    else if (tab === 'clinical') fetchTab('clinical');
  }, [tab, id]);

  const fetchTab = async (t: string) => {
    setTabLoading(true);
    if (t === 'appointments') {
      const { data } = await supabase.from('appointments')
        .select('*, departments(name)')
        .eq('patient_id', id!)
        .order('scheduled_at', { ascending: false })
        .limit(20);
      setAppointments(data ?? []);
    } else if (t === 'admissions') {
      const { data } = await supabase.from('admissions')
        .select('*, wards(name), beds(bed_number)')
        .eq('patient_id', id!)
        .order('admit_date', { ascending: false });
      setAdmissions(data ?? []);
    } else if (t === 'billing') {
      const { data } = await supabase.from('invoices')
        .select('*')
        .eq('patient_id', id!)
        .order('created_at', { ascending: false });
      setInvoices(data ?? []);
    } else if (t === 'clinical') {
      const { data } = await supabase.from('allergies')
        .select('*')
        .eq('patient_id', id!)
        .order('created_at', { ascending: false });
      setAllergies(data ?? []);
    }
    setTabLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!patient) return (
    <div className="text-center py-16 text-muted-foreground">Patient not found.</div>
  );

  const tabs = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'admissions', label: 'Admissions', icon: BedDouble },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'clinical', label: 'Allergies', icon: Activity },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={`${patient.first_name} ${patient.last_name}`}
        subtitle={patient.mrn}
        actions={
          <>
            <HimsButton variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/patients')}>Back</HimsButton>
            <HimsButton onClick={() => navigate(`/patients/new?edit=${id}`)}>Edit Patient</HimsButton>
          </>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors border-b-2 -mb-px whitespace-nowrap
                ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-3.5 w-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elevated p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-info-bg flex items-center justify-center">
                <User className="h-6 w-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">{patient.first_name} {patient.last_name}</h3>
                <p className="text-sm text-muted-foreground">{patient.mrn}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Date of Birth', patient.date_of_birth],
                ['Gender', patient.gender],
                ['Blood Type', patient.blood_type],
                ['Phone', patient.phone ?? '—'],
                ['Email', patient.email ?? '—'],
                ['Address', patient.address ?? '—'],
                ['City', patient.city ?? '—'],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium capitalize">{String(val)}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={patient.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-semibold">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Name', patient.emergency_contact_name ?? '—'],
                ['Phone', patient.emergency_contact_phone ?? '—'],
                ['Relation', patient.emergency_contact_relation ?? '—'],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{String(val)}</p>
                </div>
              ))}
            </div>
            <h3 className="font-semibold pt-2">Insurance</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Provider', patient.insurance_provider ?? '—'],
                ['Policy #', patient.insurance_policy_number ?? '—'],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{String(val)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointments tab */}
      {tab === 'appointments' && (
        <div className="card-elevated">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Appointments</h3>
            <HimsButton size="sm" onClick={() => navigate('/appointments')}>Book Appointment</HimsButton>
          </div>
          {tabLoading ? (
            <div className="flex items-center justify-center h-32"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No appointments found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Department','Date & Time','Reason','Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} className="border-b border-border table-row-hover">
                    <td className="px-4 py-3 text-muted-foreground">{a.departments?.name ?? '—'}</td>
                    <td className="px-4 py-3">{new Date(a.scheduled_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{a.reason ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Admissions tab */}
      {tab === 'admissions' && (
        <div className="card-elevated">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Admissions / ADT History</h3>
          </div>
          {tabLoading ? (
            <div className="flex items-center justify-center h-32"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No admissions on record.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Ward','Bed','Admit Date','Discharge Date','Reason','Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
              </thead>
              <tbody>
                {admissions.map(a => (
                  <tr key={a.id} className="border-b border-border table-row-hover">
                    <td className="px-4 py-3 text-muted-foreground">{a.wards?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.beds?.bed_number ?? '—'}</td>
                    <td className="px-4 py-3">{new Date(a.admit_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.discharge_date ? new Date(a.discharge_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{a.reason ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Billing tab */}
      {tab === 'billing' && (
        <div className="card-elevated">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Billing Summary</h3>
            <HimsButton size="sm" variant="secondary" onClick={() => navigate('/billing/invoices')}>View All Invoices</HimsButton>
          </div>
          {tabLoading ? (
            <div className="flex items-center justify-center h-32"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No invoices found.</div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-muted/30">
                {[
                  { label: 'Total Billed', value: `$${invoices.reduce((s,i) => s + Number(i.total), 0).toFixed(2)}` },
                  { label: 'Total Paid', value: `$${invoices.reduce((s,i) => s + Number(i.amount_paid), 0).toFixed(2)}` },
                  { label: 'Balance Due', value: `$${invoices.reduce((s,i) => s + Number(i.balance_due), 0).toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-base font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>{['Invoice #','Total','Paid','Balance','Status','Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {invoices.map(i => (
                    <tr key={i.id} className="border-b border-border table-row-hover">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{i.invoice_number}</td>
                      <td className="px-4 py-3 font-semibold">${Number(i.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-success">${Number(i.amount_paid).toFixed(2)}</td>
                      <td className={`px-4 py-3 font-semibold ${Number(i.balance_due) > 0 ? 'text-danger' : 'text-muted-foreground'}`}>${Number(i.balance_due).toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Clinical / Allergies tab */}
      {tab === 'clinical' && (
        <div className="card-elevated">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Allergies</h3>
          </div>
          {tabLoading ? (
            <div className="flex items-center justify-center h-32"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : allergies.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No allergies recorded.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Allergen','Severity','Reaction','Recorded'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
              </thead>
              <tbody>
                {allergies.map(a => (
                  <tr key={a.id} className="border-b border-border table-row-hover">
                    <td className="px-4 py-3 font-medium">{a.allergen}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.severity ?? 'moderate'} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.reaction ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
