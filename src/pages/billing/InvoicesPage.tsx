import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, TableToolbar, EmptyState, LoadingRows } from '@/components/ui/page-components';
import { HimsButton } from '@/components/ui/hims-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CreditCard, Plus, Download } from 'lucide-react';
import { logAudit } from '@/lib/audit';
import { exportToCsv } from '@/lib/csv';

interface RecordPaymentModalProps {
  invoice: any;
  onClose: () => void;
  onSaved: () => void;
}

function RecordPaymentModal({ invoice, onClose, onSaved }: RecordPaymentModalProps) {
  const { profile } = useAuth();
  const [amount, setAmount] = useState(String(invoice.balance_due));
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const pay = parseFloat(amount);
    if (!pay || pay <= 0) return;
    setLoading(true);
    await supabase.from('payments').insert({
      invoice_id: invoice.id,
      patient_id: invoice.patient_id,
      amount: pay,
      payment_method: method,
      reference_number: reference || null,
      recorded_by: profile?.id,
    } as any);
    const newPaid = Number(invoice.amount_paid) + pay;
    const newBalance = Number(invoice.total) - newPaid;
    const newStatus = newBalance <= 0 ? 'paid' : 'partial';
    await supabase.from('invoices').update({ amount_paid: newPaid, balance_due: Math.max(0, newBalance), status: newStatus } as any).eq('id', invoice.id);
    await logAudit({ action: 'update', module: 'billing', entityType: 'invoice', entityId: invoice.id, description: `Payment recorded: $${pay} via ${method}`, userRole: profile?.role });
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <h3 className="font-semibold text-lg">Record Payment</h3>
        <p className="text-sm text-muted-foreground">Invoice: <span className="font-mono text-primary">{invoice.invoice_number}</span> · Balance: <strong className="text-danger">${Number(invoice.balance_due).toFixed(2)}</strong></p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Amount ($)</label>
            <input className="form-input w-full mt-1" type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" max={invoice.balance_due} step="0.01" />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select className="form-input w-full mt-1" value={method} onChange={e => setMethod(e.target.value)}>
              {['cash', 'card', 'upi', 'insurance', 'bank_transfer', 'cheque'].map(m => <option key={m} value={m} className="capitalize">{m.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Reference # (optional)</label>
            <input className="form-input w-full mt-1" value={reference} onChange={e => setReference(e.target.value)} placeholder="Transaction/receipt number" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <HimsButton variant="secondary" onClick={onClose}>Cancel</HimsButton>
          <HimsButton loading={loading} onClick={handleSave}>Save Payment</HimsButton>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [voidTarget, setVoidTarget] = useState<any>(null);
  const [voidReason, setVoidReason] = useState('');
  const [payTarget, setPayTarget] = useState<any>(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data } = await supabase.from('invoices')
      .select('*, patients(first_name,last_name,mrn)').order('created_at', { ascending: false }).limit(100);
    setInvoices(data ?? []); setLoading(false);
  };

  const filtered = invoices.filter(i => {
    const ms = `${i.invoice_number} ${i.patients?.first_name} ${i.patients?.last_name} ${i.patients?.mrn}`.toLowerCase().includes(search.toLowerCase());
    const mf = !statusFilter || i.status === statusFilter;
    return ms && mf;
  });

  const confirmVoid = async () => {
    if (!voidTarget || !voidReason.trim()) return;
    await supabase.from('invoices').update({ status: 'voided', void_reason: voidReason } as any).eq('id', voidTarget.id);
    await logAudit({ action: 'void', module: 'billing', entityType: 'invoice', entityId: voidTarget.id, description: `Invoice voided: ${voidReason}`, userRole: profile?.role });
    setVoidTarget(null);
    setVoidReason('');
    fetchInvoices();
  };

  const handleExport = () => {
    exportToCsv('invoices', filtered.map(i => ({
      'Invoice #': i.invoice_number,
      Patient: `${i.patients?.first_name} ${i.patients?.last_name}`,
      MRN: i.patients?.mrn,
      Total: i.total,
      Paid: i.amount_paid,
      Balance: i.balance_due,
      Status: i.status,
      'Due Date': i.due_date ?? '',
    })));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Invoices" subtitle="Manage patient billing invoices"
        actions={
          <>
            <HimsButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handleExport}>Export CSV</HimsButton>
            <HimsButton icon={<Plus className="h-4 w-4" />}>New Invoice</HimsButton>
          </>
        }
      />
      <div className="card-elevated p-4">
        <TableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search invoice #, patient…"
          filters={
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-sm h-10">
              <option value="">All Statuses</option>
              {['draft','pending','paid','partial','voided','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>{['Invoice #','Patient','Total','Paid','Balance','Status','Due Date','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={8} /> : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={<CreditCard className="h-8 w-8" />} title="No invoices found" /></td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="border-b border-border table-row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{i.invoice_number}</td>
                  <td className="px-4 py-3 font-medium">{i.patients?.first_name} {i.patients?.last_name}</td>
                  <td className="px-4 py-3 font-semibold">${Number(i.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-success font-medium">${Number(i.amount_paid).toFixed(2)}</td>
                  <td className={`px-4 py-3 font-semibold ${Number(i.balance_due) > 0 ? 'text-danger' : 'text-muted-foreground'}`}>${Number(i.balance_due).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{i.due_date ?? '—'}</td>
                  <td className="px-4 py-3 flex gap-1 flex-wrap">
                    {!['voided','paid','cancelled'].includes(i.status) && (
                      <HimsButton variant="ghost" size="sm" onClick={() => setPayTarget(i)}>Record Payment</HimsButton>
                    )}
                    {!['voided','cancelled'].includes(i.status) && (
                      <HimsButton variant="danger" size="sm" onClick={() => { setVoidTarget(i); setVoidReason(''); }}>Void</HimsButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void confirmation dialog */}
      {voidTarget && (
        <ConfirmDialog
          title="Void Invoice"
          message={`Are you sure you want to void invoice ${voidTarget.invoice_number}? This action cannot be undone.`}
          confirmLabel="Void Invoice"
          onConfirm={confirmVoid}
          onCancel={() => { setVoidTarget(null); setVoidReason(''); }}
        >
          <div>
            <label className="text-sm font-medium">Reason for voiding <span className="text-danger">*</span></label>
            <textarea
              className="form-input w-full mt-1 min-h-[80px] text-sm"
              value={voidReason}
              onChange={e => setVoidReason(e.target.value)}
              placeholder="Enter reason…"
            />
          </div>
        </ConfirmDialog>
      )}

      {/* Payment modal */}
      {payTarget && <RecordPaymentModal invoice={payTarget} onClose={() => setPayTarget(null)} onSaved={fetchInvoices} />}
    </div>
  );
}
