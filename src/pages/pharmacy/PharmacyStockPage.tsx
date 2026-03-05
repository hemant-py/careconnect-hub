import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { Pill } from 'lucide-react';

export default function PharmacyStockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('pharmacy_stock').select('*, drugs(name,generic_name,category,form,strength)')
      .order('updated_at', { ascending: false }).then(({ data }) => { setStock(data ?? []); setLoading(false); });
  }, []);

  const filtered = stock.filter(s =>
    `${s.drugs?.name} ${s.drugs?.generic_name ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Pharmacy Stock" subtitle="Drug inventory levels" />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search drug name…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Drug','Generic Name','Category','Form','Strength','Current Stock','Min Stock','Expiry','Alert'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={9} /> : filtered.length === 0 ? (
                <tr><td colSpan={9}><EmptyState icon={<Pill className="h-8 w-8" />} title="No stock data" /></td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{s.drugs?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.drugs?.generic_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.drugs?.category ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.drugs?.form ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.drugs?.strength ?? '—'}</td>
                  <td className={`px-4 py-3 font-semibold ${s.current_stock <= s.minimum_stock ? 'text-danger' : 'text-success'}`}>{s.current_stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.minimum_stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.expiry_date ?? '—'}</td>
                  <td className="px-4 py-3">{s.current_stock <= s.minimum_stock && <span className="status-cancelled px-2 py-0.5 rounded-full text-xs font-medium">Low Stock</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
