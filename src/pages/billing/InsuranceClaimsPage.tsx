import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Plus } from 'lucide-react';

export default function InsuranceClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('insurance_claims').select('*, patients(first_name,last_name,mrn), invoices(invoice_number)')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setClaims(data ?? []); setLoading(false); });
  }, []);

  const filtered = claims.filter(c =>
    `${c.claim_number} ${c.patients?.first_name} ${c.insurance_provider}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Insurance Claims" subtitle="Track and manage claims"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Claim</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search claim #, patient, insurer…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Claim #','Patient','Insurer','Invoice','Claim Amt','Approved Amt','Status','Submitted',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={9} /> : filtered.length === 0 ? (
                <tr><td colSpan={9}><EmptyState icon={<FileText className="h-8 w-8" />} title="No claims" /></td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{c.claim_number}</td>
                  <td className="px-4 py-3 font-medium">{c.patients?.first_name} {c.patients?.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.insurance_provider}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.invoices?.invoice_number}</td>
                  <td className="px-4 py-3">${Number(c.claim_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-success">{c.approved_amount ? `$${Number(c.approved_amount).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.submission_date ?? '—'}</td>
                  <td className="px-4 py-3">{c.status === 'draft' && <HimsButton variant="ghost" size="sm">Submit</HimsButton>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
