import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { EmptyState as ES } from '@/components/ui/page-components';
import { FlaskConical } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

export default function LabResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('lab_orders')
      .select('*, patients(first_name,last_name,mrn)')
      .not('result_value', 'is', null)
      .order('reported_at', { ascending: false }).limit(100)
      .then(({ data }) => { setResults(data ?? []); setLoading(false); });
  }, []);

  const filtered = results.filter(r =>
    `${r.patients?.first_name} ${r.patients?.last_name} ${r.test_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Lab Results" subtitle="Published test results" />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, test…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Patient','Test','Result','Unit','Normal Range','Status','Reported'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={7} /> : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={<FlaskConical className="h-8 w-8" />} title="No results available" /></td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{r.patients?.first_name} {r.patients?.last_name}</td>
                  <td className="px-4 py-3">{r.test_name}</td>
                  <td className={`px-4 py-3 font-semibold ${r.is_abnormal ? 'text-danger' : 'text-success'}`}>{r.result_value}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.result_unit ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.normal_range ?? '—'}</td>
                  <td className="px-4 py-3">{r.is_abnormal ? <span className="status-cancelled px-2 py-0.5 rounded-full text-xs font-medium">Abnormal</span> : <span className="status-completed px-2 py-0.5 rounded-full text-xs font-medium">Normal</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.reported_at ? new Date(r.reported_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
