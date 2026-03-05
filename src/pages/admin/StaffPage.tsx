import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { RoleBadge } from '@/components/ui/role-badge';
import { Users, Plus } from 'lucide-react';
import { AppRole } from '@/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('profiles').select('*').order('full_name')
      .then(({ data }) => { setStaff(data ?? []); setLoading(false); });
  }, []);

  const filtered = staff.filter(s =>
    `${s.full_name} ${s.email ?? ''} ${s.department ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Staff Management" subtitle={`${staff.length} staff members`}
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>Add Staff</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search name, email…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Name','Employee ID','Role','Department','Phone','Status',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={7} /> : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={<Users className="h-8 w-8" />} title="No staff found" /></td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-info-bg flex items-center justify-center text-xs font-bold text-info">{s.full_name?.[0]?.toUpperCase() ?? '?'}</div><span className="font-medium">{s.full_name || '—'}</span></div></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.employee_id ?? '—'}</td>
                  <td className="px-4 py-3"><RoleBadge role={s.role as AppRole} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.department ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'status-completed' : 'status-cancelled'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3"><HimsButton variant="ghost" size="sm">Edit</HimsButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
