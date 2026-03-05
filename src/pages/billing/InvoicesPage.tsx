import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreditCard, Plus } from 'lucide-react';
import { logAudit } from '@/lib/audit';

export default function InvoicesPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchInvoices(); }, []);
  const fetchInvoices = async () => {
    setLoading(true);
    const { data } = await supabase.from('invoices')
      .select('*, patients(first_name,last_name,mrn)').order('created_at', { ascending: false }).limit(100);
    setInvoices(data ?? []); setLoading(false);
  };

  const filtered = invoices.filter(i => {
    const ms = `${i.invoice_number} ${i.patients?.first_name} ${i.patients?.last_name} ${i.patients?.mrn}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || i.status === statusFilter;
    return ms && mf;
  });

  const voidInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to void this invoice? This cannot be undone.')) return;
    const reason = prompt('Enter void reason:');
    if (!reason) return;
    await supabase.from('invoices').update({ status: 'voided', void_reason: reason } as any).eq('id', id);
    await logAudit({ action: 'void', module: 'billing', entityType: 'invoice', entityId: id, description: `Invoice voided: ${reason}`, userRole: profile?.role });
    fetchInvoices();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Invoices" subtitle="Manage patient billing invoices"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Invoice</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search invoice #, patient…"
          filters={<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="form-input text-sm h-10"><option value="">All</option>{['draft','pending','paid','partial','voided','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}</select>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Invoice #','Patient','Total','Paid','Balance','Status','Due Date','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<CreditCard className="h-8 w-8" />} title="No invoices" /></td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{i.invoice_number}</td>
                  <td className="px-4 py-3 font-medium">{i.patients?.first_name} {i.patients?.last_name}</td>
                  <td className="px-4 py-3 font-semibold">${Number(i.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-success">${Number(i.amount_paid).toFixed(2)}</td>
                  <td className={`px-4 py-3 font-semibold ${i.balance_due > 0 ? 'text-danger' : 'text-muted-foreground'}`}>${Number(i.balance_due).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{i.due_date ?? '—'}</td>
                  <td className="px-4 py-3 flex gap-1">
                    {!['voided','paid','cancelled'].includes(i.status) && <HimsButton variant="ghost" size="sm">Record Payment</HimsButton>}
                    {!['voided','cancelled'].includes(i.status) && <HimsButton variant="danger" size="sm" onClick={() => voidInvoice(i.id)}>Void</HimsButton>}
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
