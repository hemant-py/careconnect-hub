import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Plus, Eye, Download } from 'lucide-react';
import { Patient } from '@/types';
import { exportToCsv } from '@/lib/csv';

export default function PatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(200);
    setPatients(data ?? []);
    setLoading(false);
  };

  const filtered = patients.filter(p => {
    const ms = `${p.first_name} ${p.last_name} ${p.mrn} ${p.phone ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || (statusFilter === 'active' ? p.is_active : !p.is_active);
    return ms && mf;
  });

  const handleExport = () => {
    exportToCsv('patients', filtered.map(p => ({
      MRN: p.mrn,
      'First Name': p.first_name,
      'Last Name': p.last_name,
      DOB: p.date_of_birth,
      Gender: p.gender,
      Phone: p.phone ?? '',
      Email: p.email ?? '',
      City: p.city ?? '',
      'Insurance Provider': p.insurance_provider ?? '',
      'Policy #': p.insurance_policy_number ?? '',
      Status: p.is_active ? 'Active' : 'Inactive',
    })));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} total registered`}
        actions={
          <>
            <HimsButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handleExport}>Export CSV</HimsButton>
            <HimsButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/patients/new')}>New Patient</HimsButton>
          </>
        }
      />
      <div className="card-elevated">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, MRN, phone…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                {['MRN', 'Name', 'DOB', 'Gender', 'Phone', 'Insurance', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<Users className="h-8 w-8" />}
                      title="No patients found"
                      description="Register a new patient to get started."
                      action={<HimsButton size="sm" onClick={() => navigate('/patients/new')}>New Patient</HimsButton>}
                    />
                  </td>
                </tr>
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
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {patients.length} patients
          </div>
        )}
      </div>
    </div>
  );
}
