import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Package, Plus } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('purchase_orders').select('*, suppliers(name)')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setPos(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Purchase Orders" subtitle="Manage procurement"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New PO</HimsButton>} />
      <div className="card-elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['PO #','Supplier','Order Date','Expected','Total','Status',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={7} /> : pos.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={<Package className="h-8 w-8" />} title="No purchase orders" /></td></tr>
              ) : pos.map(p => (
                <tr key={p.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{p.po_number}</td>
                  <td className="px-4 py-3 font-medium">{p.suppliers?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.order_date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.expected_delivery ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">${Number(p.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3"><HimsButton variant="ghost" size="sm">View</HimsButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
