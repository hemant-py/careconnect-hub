import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Calendar, Plus, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NewAppointmentModal from './NewAppointmentModal';
import { exportToCsv } from '@/lib/csv';

export default function AppointmentsPage() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments')
      .select('*, patients(first_name, last_name, mrn), profiles(full_name), departments(name)')
      .order('scheduled_at', { ascending: false }).limit(200);
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

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await updateStatus(cancelTarget.id, 'cancelled');
    setCancelTarget(null);
  };

  const handleExport = () => {
    exportToCsv('appointments', filtered.map(a => ({
      Patient: `${a.patients?.first_name} ${a.patients?.last_name}`,
      MRN: a.patients?.mrn,
      Doctor: a.profiles?.full_name ?? '',
      Department: a.departments?.name ?? '',
      'Scheduled At': new Date(a.scheduled_at).toLocaleString(),
      Status: a.status,
      Reason: a.reason ?? '',
    })));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Appointments"
        subtitle="Schedule & manage patient appointments"
        actions={
          <>
            <HimsButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handleExport}>Export CSV</HimsButton>
            <HimsButton icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>Book Appointment</HimsButton>
          </>
        }
      />
      <div className="card-elevated p-4">
        <TableToolbar
          search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, doctor…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['scheduled','checked_in','completed','no_show','cancelled'].map(s => (
                <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
              ))}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                {['Patient','MRN','Doctor','Department','Date & Time','Reason','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={<Calendar className="h-8 w-8" />} title="No appointments" action={<HimsButton size="sm" onClick={() => setShowModal(true)}>Book Appointment</HimsButton>} />
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{a.patients?.first_name} {a.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{a.patients?.mrn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.departments?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{a.reason ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {a.status === 'scheduled' && (
                        <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(a.id, 'checked_in')}>Check In</HimsButton>
                      )}
                      {a.status === 'checked_in' && (
                        <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(a.id, 'completed')}>Complete</HimsButton>
                      )}
                      {a.status === 'scheduled' && (
                        <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(a.id, 'no_show')}>No Show</HimsButton>
                      )}
                      {['scheduled','checked_in'].includes(a.status) && (
                        <HimsButton variant="danger" size="sm" onClick={() => setCancelTarget(a)}>Cancel</HimsButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        )}
      </div>

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} onSaved={fetchAppointments} />}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Appointment"
          message={`Cancel appointment for ${cancelTarget.patients?.first_name} ${cancelTarget.patients?.last_name} scheduled on ${new Date(cancelTarget.scheduled_at).toLocaleString()}?`}
          confirmLabel="Cancel Appointment"
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
