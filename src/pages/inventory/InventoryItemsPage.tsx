import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Package, Plus } from 'lucide-react';

export default function InventoryItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('inventory_items').select('*, suppliers(name)')
      .order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  const filtered = items.filter(i =>
    `${i.name} ${i.sku ?? ''} ${i.category ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Inventory Items" subtitle="Stock management"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>Add Item</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search item, SKU…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Name','SKU','Category','Unit','Stock','Min','Max','Cost','Supplier','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={10} /> : filtered.length === 0 ? (
                <tr><td colSpan={10}><EmptyState icon={<Package className="h-8 w-8" />} title="No items" action={<HimsButton size="sm">Add Item</HimsButton>} /></td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.category ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.unit}</td>
                  <td className={`px-4 py-3 font-semibold ${i.current_stock <= i.minimum_stock ? 'text-danger' : 'text-foreground'}`}>{i.current_stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.minimum_stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.maximum_stock}</td>
                  <td className="px-4 py-3">${Number(i.unit_cost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.suppliers?.name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
