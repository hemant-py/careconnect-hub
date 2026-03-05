import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Plus } from 'lucide-react';

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('encounters')
      .select('*, patients(first_name,last_name,mrn), profiles!encounters_doctor_id_fkey(full_name), departments(name)')
      .order('encounter_date', { ascending: false }).limit(100)
      .then(({ data }) => { setEncounters(data ?? []); setLoading(false); });
  }, []);

  const filtered = encounters.filter(e =>
    `${e.patients?.first_name} ${e.patients?.last_name} ${e.patients?.mrn} ${e.chief_complaint ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Encounters" subtitle="Patient visits and encounters"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Encounter</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, complaint…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Patient','MRN','Doctor','Department','Chief Complaint','Date','Status',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<FileText className="h-8 w-8" />} title="No encounters" /></td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{e.patients?.first_name} {e.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{e.patients?.mrn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.departments?.name ?? '—'}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{e.chief_complaint ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(e.encounter_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3"><HimsButton variant="ghost" size="sm">View Notes</HimsButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
