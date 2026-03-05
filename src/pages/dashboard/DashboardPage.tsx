import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, KpiCard, EmptyState } from '@/components/ui/page-components';
import { StatusBadge } from '@/components/ui/status-badge';
import { HimsButton } from '@/components/ui/hims-button';
import { Users, Calendar, BedDouble, TrendingUp, FlaskConical, Pill, CreditCard, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppRole } from '@/types';

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  currentInpatients: number;
  dischargesToday: number;
  pendingLabOrders: number;
  pendingPrescriptions: number;
  pendingInvoices: number;
  lowStockItems: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0, appointmentsToday: 0, currentInpatients: 0,
    dischargesToday: 0, pendingLabOrders: 0, pendingPrescriptions: 0,
    pendingInvoices: 0, lowStockItems: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [patientsRes, apptRes, admissionsRes, dischargesRes, labRes, rxRes, invRes, stockRes] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('appointments').select('id', { count: 'exact', head: true })
        .gte('scheduled_at', today.toISOString()).lt('scheduled_at', tomorrow.toISOString()),
      supabase.from('admissions').select('id', { count: 'exact', head: true }).eq('status', 'admitted'),
      supabase.from('admissions').select('id', { count: 'exact', head: true })
        .eq('status', 'discharged').gte('discharge_date', today.toISOString()),
      supabase.from('lab_orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('invoices').select('id', { count: 'exact', head: true }).in('status', ['pending', 'partial']),
      supabase.from('inventory_items').select('id', { count: 'exact', head: true })
        .filter('current_stock', 'lte', 'minimum_stock'),
    ]);

    setStats({
      totalPatients: patientsRes.count ?? 0,
      appointmentsToday: apptRes.count ?? 0,
      currentInpatients: admissionsRes.count ?? 0,
      dischargesToday: dischargesRes.count ?? 0,
      pendingLabOrders: labRes.count ?? 0,
      pendingPrescriptions: rxRes.count ?? 0,
      pendingInvoices: invRes.count ?? 0,
      lowStockItems: stockRes.count ?? 0,
    });

    const [apptListRes, admListRes] = await Promise.all([
      supabase.from('appointments')
        .select('id, scheduled_at, status, reason, patients(first_name, last_name, mrn), profiles(full_name)')
        .gte('scheduled_at', today.toISOString())
        .lt('scheduled_at', tomorrow.toISOString())
        .order('scheduled_at')
        .limit(6),
      supabase.from('admissions')
        .select('id, admit_date, status, reason, patients(first_name, last_name, mrn), wards(name)')
        .eq('status', 'admitted')
        .order('admit_date', { ascending: false })
        .limit(5),
    ]);
    setRecentAppointments(apptListRes.data ?? []);
    setRecentAdmissions(admListRes.data ?? []);
    setLoading(false);
  };

  const role = profile?.role as AppRole | undefined;

  const kpiCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: <Users className="h-5 w-5" />, color: 'primary' as const, path: '/patients', roles: ['admin','reception','doctor','nurse','billing'] as AppRole[] },
    { title: "Today's Appointments", value: stats.appointmentsToday, icon: <Calendar className="h-5 w-5" />, color: 'info' as const, path: '/appointments', roles: ['admin','reception','doctor','nurse'] as AppRole[] },
    { title: 'Current Inpatients', value: stats.currentInpatients, icon: <BedDouble className="h-5 w-5" />, color: 'warning' as const, path: '/admissions', roles: ['admin','reception','doctor','nurse'] as AppRole[] },
    { title: 'Discharges Today', value: stats.dischargesToday, icon: <TrendingUp className="h-5 w-5" />, color: 'success' as const, path: '/admissions', roles: ['admin','reception','doctor','nurse'] as AppRole[] },
    { title: 'Pending Lab Orders', value: stats.pendingLabOrders, icon: <FlaskConical className="h-5 w-5" />, color: 'warning' as const, path: '/lab/orders', roles: ['admin','lab_tech','doctor'] as AppRole[] },
    { title: 'Pending Prescriptions', value: stats.pendingPrescriptions, icon: <Pill className="h-5 w-5" />, color: 'info' as const, path: '/pharmacy/prescriptions', roles: ['admin','pharmacist','doctor'] as AppRole[] },
    { title: 'Outstanding Invoices', value: stats.pendingInvoices, icon: <CreditCard className="h-5 w-5" />, color: 'danger' as const, path: '/billing/invoices', roles: ['admin','billing','reception'] as AppRole[] },
    { title: 'Low Stock Alerts', value: stats.lowStockItems, icon: <Package className="h-5 w-5" />, color: 'danger' as const, path: '/inventory/items', roles: ['admin','inventory_manager'] as AppRole[] },
  ].filter(c => !role || c.roles.includes(role));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${profile?.full_name?.split(' ')[0] ?? 'there'}`}
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <button key={card.title} onClick={() => navigate(card.path)} className="text-left">
            <KpiCard title={card.title} value={card.value} icon={card.icon} color={card.color} loading={loading} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        {role && ['admin','reception','doctor','nurse'].includes(role) && (
          <div className="card-elevated">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Today's Appointments
              </h3>
              <HimsButton variant="ghost" size="sm" onClick={() => navigate('/appointments')}>View All</HimsButton>
            </div>
            {recentAppointments.length === 0 ? (
              <EmptyState icon={<Calendar className="h-8 w-8" />} title="No appointments today" />
            ) : (
              <div className="divide-y divide-border">
                {recentAppointments.map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-full bg-info-bg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {appt.patients?.first_name} {appt.patients?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.patients?.mrn} · {new Date(appt.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                    <HimsButton variant="ghost" size="sm" onClick={() => navigate(`/appointments`)}>
                      Check In
                    </HimsButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Admissions */}
        {role && ['admin','reception','doctor','nurse'].includes(role) && (
          <div className="card-elevated">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-warning" /> Current Inpatients
              </h3>
              <HimsButton variant="ghost" size="sm" onClick={() => navigate('/admissions')}>View All</HimsButton>
            </div>
            {recentAdmissions.length === 0 ? (
              <EmptyState icon={<BedDouble className="h-8 w-8" />} title="No current inpatients" />
            ) : (
              <div className="divide-y divide-border">
                {recentAdmissions.map((adm: any) => (
                  <div key={adm.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-full bg-warning-bg flex items-center justify-center flex-shrink-0">
                      <BedDouble className="h-4 w-4 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {adm.patients?.first_name} {adm.patients?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {adm.patients?.mrn} · {adm.wards?.name ?? 'No ward'}
                      </p>
                    </div>
                    <StatusBadge status={adm.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
