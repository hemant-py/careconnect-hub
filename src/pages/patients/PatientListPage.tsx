import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Plus, Eye } from 'lucide-react';
import { Patient } from '@/types';

export default function PatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(100);
    setPatients(data ?? []);
    setLoading(false);
  };

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.mrn} ${p.phone ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Patients" subtitle={`${patients.length} total registered`}
        actions={<HimsButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/patients/new')}>New Patient</HimsButton>} />
      <div className="card-elevated">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search name, MRN, phone…" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                {['MRN','Name','DOB','Gender','Phone','Insurance','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<Users className="h-8 w-8" />} title="No patients found" description="Register a new patient to get started." action={<HimsButton size="sm" onClick={() => navigate('/patients/new')}>New Patient</HimsButton>} /></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{p.mrn}</td>
                  <td className="px-4 py-3 font-medium">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.date_of_birth}</td>
                  <td className="px-4 py-3 capitalize">{p.gender}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.insurance_provider ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3">
                    <HimsButton variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/patients/${p.id}`)}>View</HimsButton>
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
