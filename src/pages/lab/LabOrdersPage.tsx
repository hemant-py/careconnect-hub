import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { FlaskConical, Plus } from 'lucide-react';

export default function LabOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('lab_orders')
      .select('*, patients(first_name,last_name,mrn), profiles!lab_orders_reported_by_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, []);

  const filtered = orders.filter(o =>
    `${o.patients?.first_name} ${o.patients?.last_name} ${o.patients?.mrn} ${o.test_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('lab_orders').update({ status } as any).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Lab Orders" subtitle="Manage and process lab test orders"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Lab Order</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, test…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Patient','MRN','Test','Status','Collected','Result','Abnormal','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<FlaskConical className="h-8 w-8" />} title="No lab orders" /></td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{o.patients?.first_name} {o.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{o.patients?.mrn}</td>
                  <td className="px-4 py-3">{o.test_name}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.collected_at ? new Date(o.collected_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{o.result_value ? `${o.result_value} ${o.result_unit ?? ''}` : '—'}</td>
                  <td className="px-4 py-3">{o.is_abnormal ? <span className="text-danger font-semibold text-xs">Abnormal</span> : <span className="text-muted-foreground text-xs">Normal</span>}</td>
                  <td className="px-4 py-3 flex gap-1">
                    {o.status === 'pending' && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(o.id,'accepted')}>Accept</HimsButton>}
                    {o.status === 'accepted' && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(o.id,'completed')}>Enter Result</HimsButton>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
