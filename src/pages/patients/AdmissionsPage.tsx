import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BedDouble, Plus, X } from 'lucide-react';
import { logAudit } from '@/lib/audit';

/* ─── Admit Patient Modal ─── */
interface AdmitModalProps { onClose: () => void; onSaved: () => void; }
function AdmitModal({ onClose, onSaved }: AdmitModalProps) {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');
  const [wardId, setWardId] = useState('');
  const [bedId, setBedId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('patients').select('id,first_name,last_name,mrn').eq('is_active', true).order('first_name').limit(100),
      supabase.from('wards').select('id,name').eq('is_active', true),
    ]).then(([p, w]) => { setPatients(p.data ?? []); setWards(w.data ?? []); });
  }, []);

  useEffect(() => {
    if (wardId) {
      supabase.from('beds').select('id,bed_number').eq('ward_id', wardId).eq('is_occupied', false)
        .then(({ data }) => setBeds(data ?? []));
    } else {
      setBeds([]);
    }
  }, [wardId]);

  const handleSave = async () => {
    if (!patientId || !reason.trim()) return;
    setLoading(true);
    const { data: adm } = await supabase.from('admissions').insert({
      patient_id: patientId,
      ward_id: wardId || null,
      bed_id: bedId || null,
      attending_doctor_id: profile?.id,
      reason,
      created_by: profile?.id,
      status: 'admitted',
    } as any).select().single();
    if (adm && bedId) {
      await supabase.from('beds').update({ is_occupied: true } as any).eq('id', bedId);
    }
    if (adm) {
      await logAudit({ action: 'create', module: 'admissions', entityType: 'admission', entityId: adm.id, description: `Patient admitted: ${reason}`, userRole: profile?.role });
    }
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Admit Patient</h3>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Ward</label>
              <select className="form-input w-full mt-1" value={wardId} onChange={e => { setWardId(e.target.value); setBedId(''); }}>
                <option value="">Select ward…</option>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Bed</label>
              <select className="form-input w-full mt-1" value={bedId} onChange={e => setBedId(e.target.value)} disabled={!wardId}>
                <option value="">Select bed…</option>
                {beds.map(b => <option key={b.id} value={b.id}>{b.bed_number}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Reason for Admission <span className="text-danger">*</span></label>
            <textarea className="form-input w-full mt-1 min-h-[80px] text-sm" value={reason} onChange={e => setReason(e.target.value)} placeholder="Admitting diagnosis or reason…" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <HimsButton variant="secondary" onClick={onClose}>Cancel</HimsButton>
          <HimsButton loading={loading} onClick={handleSave} disabled={!patientId || !reason.trim()}>Admit Patient</HimsButton>
        </div>
      </div>
    </div>
  );
}

/* ─── Discharge Modal ─── */
interface DischargeModalProps { admission: any; onClose: () => void; onSaved: () => void; }
function DischargeModal({ admission, onClose, onSaved }: DischargeModalProps) {
  const { profile } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDischarge = async () => {
    if (!summary.trim()) return;
    setLoading(true);
    await supabase.from('admissions').update({
      status: 'discharged',
      discharge_date: new Date().toISOString(),
      discharge_summary: summary,
    } as any).eq('id', admission.id);
    if (admission.bed_id) {
      await supabase.from('beds').update({ is_occupied: false } as any).eq('id', admission.bed_id);
    }
    await logAudit({ action: 'update', module: 'admissions', entityType: 'admission', entityId: admission.id, description: `Patient discharged`, userRole: profile?.role });
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Discharge Patient</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 text-sm">
          <p className="font-medium">{admission.patients?.first_name} {admission.patients?.last_name}</p>
          <p className="text-muted-foreground">{admission.wards?.name} · Admitted {new Date(admission.admit_date).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Discharge Summary <span className="text-danger">*</span></label>
          <textarea className="form-input w-full mt-1 min-h-[120px] text-sm" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Discharge diagnosis, treatment summary, follow-up instructions…" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <HimsButton variant="secondary" onClick={onClose}>Cancel</HimsButton>
          <HimsButton loading={loading} onClick={handleDischarge} disabled={!summary.trim()}>Discharge Patient</HimsButton>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('admitted');
  const [showAdmit, setShowAdmit] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const { profile } = useAuth();

  useEffect(() => { fetchAdmissions(); }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    const { data } = await supabase.from('admissions')
      .select('*, patients(first_name,last_name,mrn), wards(name), beds(bed_number), profiles!admissions_attending_doctor_id_fkey(full_name)')
      .order('admit_date', { ascending: false }).limit(100);
    setAdmissions(data ?? []);
    setLoading(false);
  };

  const filtered = admissions.filter(a => {
    const ms = `${a.patients?.first_name} ${a.patients?.last_name} ${a.patients?.mrn}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || a.status === statusFilter;
    return ms && mf;
  });

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await supabase.from('admissions').update({ status: 'cancelled' } as any).eq('id', cancelTarget.id);
    if (cancelTarget.bed_id) await supabase.from('beds').update({ is_occupied: false } as any).eq('id', cancelTarget.bed_id);
    await logAudit({ action: 'delete', module: 'admissions', entityType: 'admission', entityId: cancelTarget.id, description: 'Admission cancelled', userRole: profile?.role });
    setCancelTarget(null);
    fetchAdmissions();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Admissions / ADT" subtitle="Admit, Transfer & Discharge"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />} onClick={() => setShowAdmit(true)}>Admit Patient</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar
          search={search} onSearchChange={setSearch} searchPlaceholder="Search patient…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['admitted','discharged','transferred','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>{['Patient','MRN','Ward','Bed','Doctor','Admit Date','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<BedDouble className="h-8 w-8" />} title="No admissions" action={<HimsButton size="sm" onClick={() => setShowAdmit(true)}>Admit Patient</HimsButton>} /></td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{a.patients?.first_name} {a.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{a.patients?.mrn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.wards?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.beds?.bed_number ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(a.admit_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 flex gap-1 flex-wrap">
                    {a.status === 'admitted' && (
                      <>
                        <HimsButton variant="ghost" size="sm" onClick={() => setDischargeTarget(a)}>Discharge</HimsButton>
                        <HimsButton variant="danger" size="sm" onClick={() => setCancelTarget(a)}>Cancel</HimsButton>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdmit && <AdmitModal onClose={() => setShowAdmit(false)} onSaved={fetchAdmissions} />}
      {dischargeTarget && <DischargeModal admission={dischargeTarget} onClose={() => setDischargeTarget(null)} onSaved={fetchAdmissions} />}
      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Admission"
          message={`Cancel admission for ${cancelTarget.patients?.first_name} ${cancelTarget.patients?.last_name}? The bed will be freed.`}
          confirmLabel="Cancel Admission"
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
