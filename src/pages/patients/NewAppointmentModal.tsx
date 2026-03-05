import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HimsButton } from '@/components/ui/hims-button';
import { X } from 'lucide-react';
import { AppointmentStatus } from '@/types';

export default function NewAppointmentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', department_id: '', scheduled_at: '', reason: '', notes: '' });

  useEffect(() => {
    Promise.all([
      supabase.from('patients').select('id,first_name,last_name,mrn').eq('is_active', true).limit(200),
      supabase.from('profiles').select('id,full_name,role').eq('role', 'doctor'),
      supabase.from('departments').select('id,name').eq('is_active', true),
    ]).then(([p, d, dep]) => {
      setPatients(p.data ?? []);
      setDoctors(d.data ?? []);
      setDepartments(dep.data ?? []);
    });
  }, []);

  const handleSave = async () => {
    if (!form.patient_id || !form.scheduled_at) { setError('Patient and date/time are required.'); return; }
    setSaving(true); setError('');
    const { error: err } = await supabase.from('appointments').insert({
      patient_id: form.patient_id,
      doctor_id: form.doctor_id || null,
      department_id: form.department_id || null,
      scheduled_at: form.scheduled_at,
      reason: form.reason || null,
      notes: form.notes || null,
      status: 'scheduled' as AppointmentStatus,
      created_by: profile?.id ?? null,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    onSaved(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold">Book Appointment</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="px-3 py-2 bg-danger-bg text-danger text-sm rounded-lg">{error}</div>}
          {[
            { label: 'Patient *', key: 'patient_id', type: 'select', options: patients.map((p:any) => ({ value: p.id, label: `${p.first_name} ${p.last_name} (${p.mrn})` })) },
            { label: 'Doctor', key: 'doctor_id', type: 'select', options: doctors.map((d:any) => ({ value: d.id, label: d.full_name })) },
            { label: 'Department', key: 'department_id', type: 'select', options: departments.map((d:any) => ({ value: d.id, label: d.name })) },
            { label: 'Date & Time *', key: 'scheduled_at', type: 'datetime-local' },
            { label: 'Reason', key: 'reason', type: 'text' },
            { label: 'Notes', key: 'notes', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} className="form-input w-full bg-card">
                  <option value="">— Select —</option>
                  {f.options?.map((o:any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} className="form-input w-full" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
          <HimsButton variant="secondary" onClick={onClose}>Cancel</HimsButton>
          <HimsButton loading={saving} onClick={handleSave}>Book Appointment</HimsButton>
        </div>
      </div>
    </div>
  );
}
