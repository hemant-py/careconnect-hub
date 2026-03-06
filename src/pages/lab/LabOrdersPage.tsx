import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FlaskConical, Plus } from 'lucide-react';
import { logAudit } from '@/lib/audit';

interface EnterResultModalProps {
  order: any;
  onClose: () => void;
  onSaved: () => void;
}

function EnterResultModal({ order, onClose, onSaved }: EnterResultModalProps) {
  const { profile } = useAuth();
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(order.result_unit ?? '');
  const [normalRange, setNormalRange] = useState(order.normal_range ?? '');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!value.trim()) return;
    setLoading(true);
    await supabase.from('lab_orders').update({
      result_value: value,
      result_unit: unit,
      normal_range: normalRange,
      is_abnormal: isAbnormal,
      notes: notes || null,
      status: 'completed',
      reported_at: new Date().toISOString(),
      reported_by: profile?.id,
    } as any).eq('id', order.id);
    await logAudit({ action: 'update', module: 'lab', entityType: 'lab_order', entityId: order.id, description: `Lab result entered: ${order.test_name} = ${value} ${unit}`, userRole: profile?.role });
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4">
        <h3 className="font-semibold text-lg">Enter Lab Result</h3>
        <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
          <p className="font-medium">{order.test_name}</p>
          <p className="text-muted-foreground">Patient: {order.patients?.first_name} {order.patients?.last_name} · {order.patients?.mrn}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-medium">Result Value <span className="text-danger">*</span></label>
            <input className="form-input w-full mt-1" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 7.2, Positive, See report" />
          </div>
          <div>
            <label className="text-sm font-medium">Unit</label>
            <input className="form-input w-full mt-1" value={unit} onChange={e => setUnit(e.target.value)} placeholder="mg/dL, %…" />
          </div>
          <div>
            <label className="text-sm font-medium">Normal Range</label>
            <input className="form-input w-full mt-1" value={normalRange} onChange={e => setNormalRange(e.target.value)} placeholder="e.g. 70-100" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea className="form-input w-full mt-1 min-h-[60px] text-sm" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes or comments…" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="abnormal" checked={isAbnormal} onChange={e => setIsAbnormal(e.target.checked)} className="h-4 w-4 rounded border-border text-danger" />
            <label htmlFor="abnormal" className="text-sm font-medium text-danger">Mark as Abnormal</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <HimsButton variant="secondary" onClick={onClose}>Cancel</HimsButton>
          <HimsButton loading={loading} onClick={handleSave}>Submit Result</HimsButton>
        </div>
      </div>
    </div>
  );
}

export default function LabOrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resultTarget, setResultTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('lab_orders')
      .select('*, patients(first_name,last_name,mrn), profiles!lab_orders_reported_by_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(100);
    setOrders(data ?? []); setLoading(false);
  };

  const filtered = orders.filter(o => {
    const ms = `${o.patients?.first_name} ${o.patients?.last_name} ${o.patients?.mrn} ${o.test_name}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || o.status === statusFilter;
    return ms && mf;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('lab_orders').update({ status } as any).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await supabase.from('lab_orders').update({ status: 'cancelled' } as any).eq('id', cancelTarget.id);
    await logAudit({ action: 'reject', module: 'lab', entityType: 'lab_order', entityId: cancelTarget.id, description: `Lab order cancelled: ${cancelTarget.test_name}`, userRole: profile?.role });
    setCancelTarget(null);
    fetchOrders();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Lab Orders" subtitle="Manage and process lab test orders"
        actions={<HimsButton icon={<Plus className="h-4 w-4" />}>New Lab Order</HimsButton>} />
      <div className="card-elevated p-4">
        <TableToolbar
          search={search} onSearchChange={setSearch} searchPlaceholder="Search patient, test…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['pending','accepted','in_progress','completed','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>{['Patient','MRN','Test','Status','Collected','Result','Abnormal','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<FlaskConical className="h-8 w-8" />} title="No lab orders" /></td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-medium">{o.patients?.first_name} {o.patients?.last_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{o.patients?.mrn}</td>
                  <td className="px-4 py-3 font-medium">{o.test_name}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.collected_at ? new Date(o.collected_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    {o.result_value
                      ? <span className="font-medium">{o.result_value} {o.result_unit}</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {o.is_abnormal
                      ? <span className="text-danger font-semibold text-xs bg-danger-bg px-2 py-0.5 rounded-full">⚠ Abnormal</span>
                      : <span className="text-muted-foreground text-xs">Normal</span>
                    }
                  </td>
                  <td className="px-4 py-3 flex gap-1 flex-wrap">
                    {o.status === 'pending' && (
                      <HimsButton variant="ghost" size="sm" onClick={() => updateStatus(o.id, 'accepted')}>Accept</HimsButton>
                    )}
                    {['accepted','in_progress'].includes(o.status) && (
                      <HimsButton variant="primary" size="sm" onClick={() => setResultTarget(o)}>Enter Result</HimsButton>
                    )}
                    {['pending','accepted'].includes(o.status) && (
                      <HimsButton variant="danger" size="sm" onClick={() => setCancelTarget(o)}>Cancel</HimsButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {resultTarget && (
        <EnterResultModal order={resultTarget} onClose={() => setResultTarget(null)} onSaved={fetchOrders} />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Lab Order"
          message={`Cancel "${cancelTarget.test_name}" for ${cancelTarget.patients?.first_name} ${cancelTarget.patients?.last_name}?`}
          confirmLabel="Cancel Order"
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
