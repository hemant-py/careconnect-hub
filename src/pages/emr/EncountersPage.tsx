import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileText, Plus, X, Save, Lock } from 'lucide-react';
import { logAudit } from '@/lib/audit';

/* ─── New Encounter Modal ─── */
interface NewEncounterModalProps { onClose: () => void; onSaved: () => void; }
function NewEncounterModal({ onClose, onSaved }: NewEncounterModalProps) {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('patients').select('id,first_name,last_name,mrn').eq('is_active', true).order('first_name').limit(100),
      supabase.from('departments').select('id,name').eq('is_active', true),
    ]).then(([p, d]) => { setPatients(p.data ?? []); setDepartments(d.data ?? []); });
  }, []);

  const handleSave = async () => {
    if (!patientId) return;
    setLoading(true);
    const { data: enc } = await supabase.from('encounters').insert({
      patient_id: patientId,
      department_id: departmentId || null,
      doctor_id: profile?.id,
      chief_complaint: chiefComplaint || null,
      created_by: profile?.id,
      status: 'open',
    } as any).select().single();
    if (enc) {
      await logAudit({ action: 'create', module: 'emr', entityType: 'encounter', entityId: enc.id, description: `New encounter created: ${chiefComplaint}`, userRole: profile?.role });
    }
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">New Encounter</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Patient <span className="text-danger">*</span></label>
            <select className="form-input w-full mt-1" value={patientId} onChange={e => setPatientId(e.target.value)}>
              <option value="">Select patient…</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mrn})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Department</label>
            <select className="form-input w-full mt-1" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">Select department…</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Chief Complaint</label>
            <textarea className="form-input w-full mt-1 min-h-[80px] text-sm" value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="Patient's chief complaint or reason for visit…" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <HimsButton variant="secondary" onClick={onClose}>Cancel</HimsButton>
          <HimsButton loading={loading} onClick={handleSave} disabled={!patientId}>Create Encounter</HimsButton>
        </div>
      </div>
    </div>
  );
}

/* ─── SOAP Note Modal ─── */
interface SoapNoteModalProps { encounter: any; onClose: () => void; onSaved: () => void; }
function SoapNoteModal({ encounter, onClose, onSaved }: SoapNoteModalProps) {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [tab, setTab] = useState<'list'|'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmSign, setConfirmSign] = useState(false);

  useEffect(() => {
    supabase.from('clinical_notes').select('*').eq('encounter_id', encounter.id).order('created_at', { ascending: false })
      .then(({ data }) => { setNotes(data ?? []); setLoading(false); });
  }, [encounter.id]);

  const startNew = () => {
    setEditing({ id: null, subjective: '', objective: '', assessment: '', plan: '', diagnosis_code: '', diagnosis_description: '' });
    setTab('edit');
  };

  const handleSave = async (sign = false) => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      encounter_id: encounter.id,
      patient_id: encounter.patient_id,
      subjective: editing.subjective || null,
      objective: editing.objective || null,
      assessment: editing.assessment || null,
      plan: editing.plan || null,
      diagnosis_code: editing.diagnosis_code || null,
      diagnosis_description: editing.diagnosis_description || null,
      created_by: profile?.id,
      ...(sign ? { is_signed: true, signed_by: profile?.id, signed_at: new Date().toISOString() } : {}),
    };
    if (editing.id) {
      await supabase.from('clinical_notes').update(payload as any).eq('id', editing.id);
    } else {
      const { data } = await supabase.from('clinical_notes').insert(payload as any).select().single();
      if (data) setEditing((prev: any) => ({ ...prev, id: data.id }));
    }
    await logAudit({ action: sign ? 'update' : 'create', module: 'emr', entityType: 'clinical_note', description: sign ? 'Clinical note signed' : 'Clinical note saved', userRole: profile?.role });
    const { data: fresh } = await supabase.from('clinical_notes').select('*').eq('encounter_id', encounter.id).order('created_at', { ascending: false });
    setNotes(fresh ?? []);
    setSaving(false);
    if (sign) { setConfirmSign(false); setTab('list'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="font-semibold">SOAP Notes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {encounter.patients?.first_name} {encounter.patients?.last_name} · {new Date(encounter.encounter_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {tab === 'list' && <HimsButton size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={startNew}>Add Note</HimsButton>}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-1"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {tab === 'list' ? (
            loading ? (
              <div className="flex items-center justify-center h-32"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notes yet.</p>
                <HimsButton size="sm" className="mt-3" onClick={startNew}>Write First Note</HimsButton>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(n => (
                  <div key={n.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {n.is_signed
                          ? <span className="flex items-center gap-1 text-xs text-success bg-success-bg px-2 py-0.5 rounded-full font-medium"><Lock className="h-3 w-3" />Signed</span>
                          : <span className="text-xs text-warning bg-warning-bg px-2 py-0.5 rounded-full font-medium">Draft</span>
                        }
                        <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      {!n.is_signed && (
                        <HimsButton variant="ghost" size="sm" onClick={() => { setEditing(n); setTab('edit'); }}>Edit</HimsButton>
                      )}
                    </div>
                    {n.diagnosis_code && (
                      <p className="text-xs font-medium text-primary">Dx: {n.diagnosis_code} — {n.diagnosis_description}</p>
                    )}
                    {[['S – Subjective', n.subjective], ['O – Objective', n.objective], ['A – Assessment', n.assessment], ['P – Plan', n.plan]].map(([label, val]) => val && (
                      <div key={String(label)}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                        <p className="text-sm mt-0.5 whitespace-pre-wrap">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          ) : (
            editing && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Diagnosis Code (ICD)</label>
                    <input className="form-input w-full mt-1" value={editing.diagnosis_code} onChange={e => setEditing((p: any) => ({ ...p, diagnosis_code: e.target.value }))} placeholder="e.g. I10, E11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Diagnosis Description</label>
                    <input className="form-input w-full mt-1" value={editing.diagnosis_description} onChange={e => setEditing((p: any) => ({ ...p, diagnosis_description: e.target.value }))} placeholder="e.g. Essential Hypertension" />
                  </div>
                </div>
                {[
                  { key: 'subjective', label: 'S – Subjective', placeholder: "Patient's chief complaint, history of present illness, symptoms…" },
                  { key: 'objective', label: 'O – Objective', placeholder: 'Vital signs, physical examination findings, lab results…' },
                  { key: 'assessment', label: 'A – Assessment', placeholder: 'Diagnosis, differential diagnosis…' },
                  { key: 'plan', label: 'P – Plan', placeholder: 'Treatment plan, medications, follow-up instructions…' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold">{label}</label>
                    <textarea
                      className="form-input w-full mt-1 min-h-[80px] text-sm"
                      value={editing[key]}
                      onChange={e => setEditing((p: any) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {tab === 'edit' && (
          <div className="flex items-center justify-between p-4 border-t border-border flex-shrink-0 bg-muted/30">
            <HimsButton variant="secondary" onClick={() => setTab('list')}>Back to List</HimsButton>
            <div className="flex gap-2">
              <HimsButton variant="secondary" icon={<Save className="h-4 w-4" />} loading={saving} onClick={() => handleSave(false)}>Save Draft</HimsButton>
              <HimsButton icon={<Lock className="h-4 w-4" />} onClick={() => setConfirmSign(true)}>Sign & Lock</HimsButton>
            </div>
          </div>
        )}
      </div>

      {confirmSign && (
        <ConfirmDialog
          title="Sign Clinical Note"
          message="Once signed, this note cannot be edited. Are you sure you want to sign and lock this note?"
          confirmLabel="Sign & Lock"
          variant="primary"
          onConfirm={() => handleSave(true)}
          onCancel={() => setConfirmSign(false)}
        />
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function EncountersPage() {
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [soapTarget, setSoapTarget] = useState<any>(null);

  useEffect(() => { fetchEncounters(); }, []);

  const fetchEncounters = async () => {
    setLoading(true);
    const { data } = await supabase.from('encounters')
      .select('*, patients(first_name,last_name,mrn), profiles!encounters_doctor_id_fkey(full_name), departments(name)')
      .order('encounter_date', { ascending: false }).limit(100);
    setEncounters(data ?? []);
    setLoading(false);
  };

  const filtered = encounters.filter(e => {
    const ms = `${e.patients?.first_name} ${e.patients?.last_name} ${e.patients?.mrn} ${e.chief_complaint ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || e.status === statusFilter;
    return ms && mf;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Encounters" subtitle="Patient visits and clinical encounters"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />} onClick={() => setShowNewModal(true)}>New Encounter</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar
          search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, complaint…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['open','closed','pending'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>{['Patient','MRN','Doctor','Department','Chief Complaint','Date','Status',''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<FileText className="h-8 w-8" />} title="No encounters found" action={<HimsButton size="sm" onClick={() => setShowNewModal(true)}>New Encounter</HimsButton>} /></td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{e.patients?.first_name} {e.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{e.patients?.mrn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.departments?.name ?? '—'}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{e.chief_complaint ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(e.encounter_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <HimsButton variant="ghost" size="sm" icon={<FileText className="h-3.5 w-3.5" />} onClick={() => setSoapTarget(e)}>SOAP Notes</HimsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && <NewEncounterModal onClose={() => setShowNewModal(false)} onSaved={fetchEncounters} />}
      {soapTarget && <SoapNoteModal encounter={soapTarget} onClose={() => setSoapTarget(null)} onSaved={fetchEncounters} />}
    </div>
  );
}
