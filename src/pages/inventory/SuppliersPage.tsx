import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { Package, Plus } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('suppliers').select('*').order('name').then(({ data }) => { setSuppliers(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Suppliers" subtitle="Manage vendor contacts"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>Add Supplier</HimsButton>} />
      <div className="card-elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Name','Contact','Phone','Email','Address','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={6} /> : suppliers.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={<Package className="h-8 w-8" />} title="No suppliers" /></td></tr>
              ) : suppliers.map(s => (
                <tr key={s.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.contact_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.address ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'status-completed' : 'status-cancelled'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
