import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, Plus } from 'lucide-react';

export default function NursingTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('nursing_tasks')
      .select('*, patients(first_name,last_name,mrn), profiles!nursing_tasks_assigned_to_fkey(full_name)')
      .order('due_at', { ascending: true }).limit(100)
      .then(({ data }) => { setTasks(data ?? []); setLoading(false); });
  }, []);

  const filtered = tasks.filter(t =>
    `${t.patients?.first_name} ${t.patients?.last_name} ${t.task_type} ${t.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const complete = async (id: string) => {
    await supabase.from('nursing_tasks').update({ status: 'completed', completed_at: new Date().toISOString() } as any).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Nursing Tasks" subtitle="Vitals, medication administration, wound care"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Task</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, task type…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Patient','Task Type','Description','Assigned To','Due','Status',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={7} /> : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={<ClipboardList className="h-8 w-8" />} title="No nursing tasks" /></td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{t.patients?.first_name} {t.patients?.last_name}</td>
                  <td className="px-4 py-3 capitalize">{t.task_type}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{t.description ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.due_at ? new Date(t.due_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">{t.status !== 'completed' && <HimsButton variant="ghost" size="sm" onClick={() => complete(t.id)}>Complete</HimsButton>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
