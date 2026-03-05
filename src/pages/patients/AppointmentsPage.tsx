import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NewAppointmentModal from './NewAppointmentModal';

export default function AppointmentsPage() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments')
      .select('*, patients(first_name, last_name, mrn), profiles(full_name), departments(name)')
      .order('scheduled_at', { ascending: false }).limit(100);
    setAppointments(data ?? []);
    setLoading(false);
  };

  const filtered = appointments.filter(a => {
    const matchSearch = `${a.patients?.first_name} ${a.patients?.last_name} ${a.patients?.mrn} ${a.profiles?.full_name ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status } as any).eq('id', id);
    fetchAppointments();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Appointments" subtitle="Schedule & manage patient appointments"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>Book Appointment</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar
          search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, doctor…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['scheduled','checked_in','completed','no_show','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Patient','MRN','Doctor','Department','Date & Time','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={7} /> : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={<Calendar className="h-8 w-8" />} title="No appointments" action={<HimsButton size="sm" onClick={() => setShowModal(true)}>Book Appointment</HimsButton>} /></td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{a.patients?.first_name} {a.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{a.patients?.mrn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.departments?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 flex gap-1">
                    {a.status === 'scheduled' && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(a.id, 'checked_in')}>Check In</HimsButton>}
                    {a.status === 'checked_in' && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(a.id, 'completed')}>Complete</HimsButton>}
                    {['scheduled','checked_in'].includes(a.status) && <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</HimsButton>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} onSaved={fetchAppointments} />}
    </div>
  );
}
