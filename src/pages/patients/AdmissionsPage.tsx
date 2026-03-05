import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { BedDouble, Plus } from 'lucide-react';

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('admissions')
      .select('*, patients(first_name,last_name,mrn), wards(name), beds(bed_number), profiles!admissions_attending_doctor_id_fkey(full_name)')
      .order('admit_date', { ascending: false }).limit(100)
      .then(({ data }) => { setAdmissions(data ?? []); setLoading(false); });
  }, []);

  const filtered = admissions.filter(a =>
    `${a.patients?.first_name} ${a.patients?.last_name} ${a.patients?.mrn}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Admissions / ADT" subtitle="Admit, Transfer & Discharge"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>Admit Patient</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search patient…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Patient','MRN','Ward','Bed','Doctor','Admit Date','Status',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<BedDouble className="h-8 w-8" />} title="No admissions" /></td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{a.patients?.first_name} {a.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{a.patients?.mrn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.wards?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.beds?.bed_number ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(a.admit_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 flex gap-1">
                    {a.status === 'admitted' && <HimsButton variant="ghost" size="sm">Transfer</HimsButton>}
                    {a.status === 'admitted' && <HimsButton variant="ghost" size="sm">Discharge</HimsButton>}
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
