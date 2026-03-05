import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { ArrowLeft } from 'lucide-react';
import { GenderType } from '@/types';
import { logAudit } from '@/lib/audit';

const GENDERS: GenderType[] = ['male', 'female', 'other'];

export default function NewPatientPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: 'male' as GenderType,
    blood_type: 'unknown', phone: '', email: '', address: '', city: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    insurance_provider: '', insurance_policy_number: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.date_of_birth) { setError('First name, last name and DOB are required.'); return; }
    setSaving(true); setError('');
    const { data, error: err } = await supabase.from('patients').insert({
      ...form, created_by: profile?.id ?? null, is_active: true,
    } as any).select().single();
    if (err) { setError(err.message); setSaving(false); return; }
    await logAudit({ action: 'create', module: 'patients', entityType: 'patient', entityId: data?.id, description: `Created patient ${form.first_name} ${form.last_name}`, userRole: profile?.role });
    navigate('/patients');
  };

  const fields: { label: string; key: string; type?: string; required?: boolean; options?: string[] }[] = [
    { label: 'First Name', key: 'first_name', required: true },
    { label: 'Last Name', key: 'last_name', required: true },
    { label: 'Date of Birth', key: 'date_of_birth', type: 'date', required: true },
    { label: 'Gender', key: 'gender', options: GENDERS },
    { label: 'Blood Type', key: 'blood_type', options: ['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'] },
    { label: 'Phone', key: 'phone', type: 'tel' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Address', key: 'address' },
    { label: 'City', key: 'city' },
    { label: 'Emergency Contact Name', key: 'emergency_contact_name' },
    { label: 'Emergency Contact Phone', key: 'emergency_contact_phone', type: 'tel' },
    { label: 'Emergency Contact Relation', key: 'emergency_contact_relation' },
    { label: 'Insurance Provider', key: 'insurance_provider' },
    { label: 'Insurance Policy #', key: 'insurance_policy_number' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <PageHeader title="Register New Patient" actions={
        <HimsButton variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/patients')}>Back</HimsButton>
      } />
      <div className="card-elevated">
        {error && <div className="mx-6 mt-5 px-3 py-2.5 bg-danger-bg border border-danger/30 rounded-lg text-sm text-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {f.label}{f.required && <span className="text-danger ml-0.5">*</span>}
                </label>
                {f.options ? (
                  <select value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} className="form-input w-full bg-card capitalize">
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type ?? 'text'} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} className="form-input w-full" />
                )}
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 bg-card border-t border-border">
            <HimsButton variant="secondary" type="button" onClick={() => navigate('/patients')}>Cancel</HimsButton>
            <HimsButton type="submit" loading={saving}>Save Patient</HimsButton>
          </div>
        </form>
      </div>
    </div>
  );
}
