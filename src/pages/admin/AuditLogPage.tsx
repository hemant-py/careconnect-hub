import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { StatusBadge } from '@/components/ui/status-badge';
import { Activity } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setLogs(data ?? []); setLoading(false); });
  }, []);

  const filtered = logs.filter(l => {
    const ms = `${l.user_name ?? ''} ${l.description} ${l.module}`.toLowerCase().includes(search.toLowerCase());
    const mf = !moduleFilter || l.module === moduleFilter;
    return ms && mf;
  });

  const modules = [...new Set(logs.map(l => l.module))];

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Audit Log" subtitle="Track all critical system actions" />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search user, description…"
          filters={<select value={moduleFilter} onChange={e=>setModuleFilter(e.target.value)} className="form-input text-sm h-10"><option value="">All Modules</option>{modules.map(m=><option key={m} value={m}>{m}</option>)}</select>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Time','User','Role','Module','Action','Description'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={6} /> : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={<Activity className="h-8 w-8" />} title="No audit entries" /></td></tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{l.user_name ?? 'System'}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{l.user_role ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{l.module}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.action} /></td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{l.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
