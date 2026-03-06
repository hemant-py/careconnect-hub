import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pill } from 'lucide-react';
import { logAudit } from '@/lib/audit';

export default function PrescriptionsPage() {
  const { profile } = useAuth();
  const [rxs, setRxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dispenseTarget, setDispenseTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  useEffect(() => { fetchRx(); }, []);

  const fetchRx = async () => {
    setLoading(true);
    const { data } = await supabase.from('prescriptions')
      .select('*, patients(first_name,last_name,mrn), profiles!prescriptions_prescribed_by_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(100);
    setRxs(data ?? []);
    setLoading(false);
  };

  const filtered = rxs.filter(r => {
    const ms = `${r.patients?.first_name} ${r.patients?.last_name} ${r.drug_name} ${r.prescription_number}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || r.status === statusFilter;
    return ms && mf;
  });

  const confirmDispense = async () => {
    if (!dispenseTarget) return;
    await supabase.from('prescriptions').update({
      status: 'dispensed',
      dispensed_by: profile?.id,
      dispensed_at: new Date().toISOString(),
    } as any).eq('id', dispenseTarget.id);
    await logAudit({ action: 'dispense', module: 'pharmacy', entityType: 'prescription', entityId: dispenseTarget.id, description: `Prescription dispensed: ${dispenseTarget.drug_name}`, userRole: profile?.role });
    setDispenseTarget(null);
    fetchRx();
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await supabase.from('prescriptions').update({ status: 'cancelled' } as any).eq('id', cancelTarget.id);
    await logAudit({ action: 'delete', module: 'pharmacy', entityType: 'prescription', entityId: cancelTarget.id, description: `Prescription cancelled: ${cancelTarget.drug_name}`, userRole: profile?.role });
    setCancelTarget(null);
    fetchRx();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Prescriptions" subtitle="Manage and dispense prescriptions" />
      <div className="card-elevated p-4">
        <TableToolbar
          search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, drug, Rx#…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['pending','dispensed','cancelled','on_hold'].map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>{['Rx #','Patient','Drug','Dosage','Frequency','Duration','Prescribed By','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={9} /> : filtered.length === 0 ? (
                <tr><td colSpan={9}><EmptyState icon={<Pill className="h-8 w-8" />} title="No prescriptions" /></td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{r.prescription_number}</td>
                  <td className="px-4 py-3 font-medium">{r.patients?.first_name} {r.patients?.last_name}</td>
                  <td className="px-4 py-3 font-medium">{r.drug_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.dosage}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.frequency}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.duration ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <>
                          <HimsButton variant="ghost" size="sm" onClick={() => setDispenseTarget(r)}>Dispense</HimsButton>
                          <HimsButton variant="danger" size="sm" onClick={() => setCancelTarget(r)}>Cancel</HimsButton>
                        </>
                      )}
                      {r.status === 'dispensed' && (
                        <span className="text-xs text-muted-foreground">
                          {r.dispensed_at ? new Date(r.dispensed_at).toLocaleDateString() : ''}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {rxs.length} prescriptions
          </div>
        )}
      </div>

      {dispenseTarget && (
        <ConfirmDialog
          title="Dispense Prescription"
          message={`Confirm dispensing ${dispenseTarget.drug_name} (${dispenseTarget.dosage}) for ${dispenseTarget.patients?.first_name} ${dispenseTarget.patients?.last_name}?`}
          confirmLabel="Dispense"
          variant="primary"
          onConfirm={confirmDispense}
          onCancel={() => setDispenseTarget(null)}
        />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Prescription"
          message={`Cancel prescription for ${cancelTarget.drug_name}? This cannot be undone.`}
          confirmLabel="Cancel Prescription"
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
