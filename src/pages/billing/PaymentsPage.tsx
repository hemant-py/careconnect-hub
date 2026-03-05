import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('payments').select('*, invoices(invoice_number), patients(first_name,last_name)')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setPayments(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Payments" subtitle="Payment records" />
      <div className="card-elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Invoice #','Patient','Amount','Method','Reference','Date'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={6} /> : payments.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={<CreditCard className="h-8 w-8" />} title="No payments recorded" /></td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{p.invoices?.invoice_number}</td>
                  <td className="px-4 py-3 font-medium">{p.patients?.first_name} {p.patients?.last_name}</td>
                  <td className="px-4 py-3 font-semibold text-success">${Number(p.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize">{p.payment_method}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.reference_number ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
