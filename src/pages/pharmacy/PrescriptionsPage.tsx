import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Pill } from 'lucide-react';
import { logAudit } from '@/lib/audit';

export default function PrescriptionsPage() {
  const { profile } = useAuth();
  const [rxs, setRxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchRx(); }, []);
  const fetchRx = async () => {
    setLoading(true);
    const { data } = await supabase.from('prescriptions')
      .select('*, patients(first_name,last_name,mrn), profiles!prescriptions_prescribed_by_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(100);
    setRxs(data ?? []); setLoading(false);
  };

  const filtered = rxs.filter(r => {
    const ms = `${r.patients?.first_name} ${r.patients?.last_name} ${r.drug_name} ${r.prescription_number}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || r.status === statusFilter;
    return ms && mf;
  });

  const dispense = async (id: string) => {
    await supabase.from('prescriptions').update({ status: 'dispensed', dispensed_by: profile?.id, dispensed_at: new Date().toISOString() } as any).eq('id', id);
    await logAudit({ action: 'dispense', module: 'pharmacy', entityType: 'prescription', entityId: id, description: 'Prescription dispensed', userRole: profile?.role });
    fetchRx();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Prescriptions" subtitle="Manage and dispense prescriptions" />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, drug, Rx#…"
          filters={<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="form-input text-sm h-10"><option value="">All</option>{['pending','dispensed','cancelled','on_hold'].map(s=><option key={s} value={s}>{s}</option>)}</select>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Rx #','Patient','Drug','Dosage','Frequency','Prescribed By','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<Pill className="h-8 w-8" />} title="No prescriptions" /></td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{r.prescription_number}</td>
                  <td className="px-4 py-3 font-medium">{r.patients?.first_name} {r.patients?.last_name}</td>
                  <td className="px-4 py-3">{r.drug_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.dosage}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.frequency}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">{r.status === 'pending' && <HimsButton variant="ghost" size="sm" onClick={() => dispense(r.id)}>Dispense</HimsButton>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
