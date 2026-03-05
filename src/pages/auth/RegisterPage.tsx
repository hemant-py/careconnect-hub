import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HimsButton } from '@/components/ui/hims-button';
import { Activity } from 'lucide-react';
import { AppRole } from '@/types';
import { ROLE_LABELS } from '@/lib/rbac';

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'reception' as AppRole });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;
  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-elevated p-8 text-center max-w-sm">
        <div className="h-12 w-12 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-lg font-semibold mb-2">Account created!</h2>
        <p className="text-sm text-muted-foreground mb-4">Check your email to confirm your account, then sign in.</p>
        <Link to="/login"><HimsButton className="w-full">Go to Sign In</HimsButton></Link>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setSubmitting(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.role);
    if (error) setError(error.message);
    else setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">HIMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Create staff account</p>
        </div>

        <div className="card-elevated p-6">
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-danger-bg border border-danger/30 rounded-lg text-sm text-danger">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-danger">*</span></label>
              <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="form-input w-full" placeholder="Dr. Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email <span className="text-danger">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input w-full" placeholder="jane@hospital.org" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password <span className="text-danger">*</span></label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input w-full" placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role <span className="text-danger">*</span></label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AppRole }))} className="form-input w-full bg-card">
                {(Object.keys(ROLE_LABELS) as AppRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <HimsButton type="submit" className="w-full" loading={submitting}>Create Account</HimsButton>
          </form>
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
