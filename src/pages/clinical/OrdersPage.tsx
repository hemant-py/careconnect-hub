import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Stethoscope, Plus } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('orders')
      .select('*, patients(first_name,last_name,mrn), profiles!orders_ordered_by_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, []);

  const filtered = orders.filter(o =>
    `${o.order_number} ${o.patients?.first_name} ${o.patients?.last_name} ${o.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status } as any).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Clinical Orders" subtitle="Lab, medication & procedure orders"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Order</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search order, patient…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Order #','Patient','Type','Description','Priority','Ordered By','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<Stethoscope className="h-8 w-8" />} title="No orders" /></td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{o.order_number}</td>
                  <td className="px-4 py-3 font-medium">{o.patients?.first_name} {o.patients?.last_name}</td>
                  <td className="px-4 py-3 capitalize"><StatusBadge status={o.order_type} /></td>
                  <td className="px-4 py-3 max-w-xs truncate">{o.description}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.priority} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 flex gap-1">
                    {o.status === 'pending' && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(o.id,'accepted')}>Accept</HimsButton>}
                    {o.status === 'accepted' && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(o.id,'completed')}>Complete</HimsButton>}
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
