import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowLeft, User } from 'lucide-react';
import { Patient } from '@/types';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (id) supabase.from('patients').select('*').eq('id', id).single().then(({ data }) => { setPatient(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!patient) return <div className="text-center py-16 text-muted-foreground">Patient not found.</div>;

  const tabs = ['overview', 'appointments', 'admissions', 'billing'];

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
      <div className="flex gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>
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
      {tab !== 'overview' && (
        <div className="card-elevated p-8 text-center text-muted-foreground">
          <p className="text-sm capitalize">{tab} details coming in a future iteration.</p>
        </div>
      )}
    </div>
  );
}
