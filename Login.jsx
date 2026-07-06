import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { TrendingUp, Eye, EyeOff, Loader, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <span className="text-xl font-bold">DSA CRM</span>
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold mb-4">Your loan pipeline, always in control.</h2>
          <p className="text-blue-200 mb-8">Track every file from lead to disbursement — with your team, from anywhere.</p>
          <ul className="space-y-3">
            {['Real-time loan status tracking', 'Auto commission on disbursement', 'Role-based team access', 'Complete document management'].map(p => (
              <li key={p} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-slate-400 text-xs">© 2024 DSA CRM. All rights reserved.</div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-6">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><TrendingUp size={18} className="text-white" /></div>
            <span className="font-bold text-slate-900 text-xl">DSA<span className="text-blue-600">CRM</span></span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h1>
          <p className="text-slate-500 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input-field" placeholder="you@company.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Enter your password" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one free</Link>
          </p>

          {/* Demo Login */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-wide">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '👑 Admin', email: 'admin@dsacrm.com', pw: 'Admin@123', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
                { label: '📋 Data Operator', email: 'rahul@dsacrm.com', pw: 'Pass@123', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
                { label: '📢 Marketing', email: 'priya@dsacrm.com', pw: 'Pass@123', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200' },
                { label: '🏦 Bank Exec', email: 'amit@dsacrm.com', pw: 'Pass@123', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
              ].map(({ label, email, pw, color }) => (
                <button key={label} type="button" onClick={() => quickFill(email, pw)}
                  className={`text-xs py-2 px-3 rounded-lg border font-medium transition-colors text-left ${color}`}>
                  <div>{label}</div>
                  <div className="text-xs opacity-60 truncate">{email}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Click a role to auto-fill, then press Sign In</p>
          </div>
        </div>
      </div>
    </div>
  );
}
