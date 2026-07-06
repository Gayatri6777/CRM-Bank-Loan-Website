import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { TrendingUp, Eye, EyeOff, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    mobile: '', role: 'data_operator'
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords don't match");
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.mobile && !/^[0-9]{10}$/.test(form.mobile)) return toast.error('Mobile must be exactly 10 digits');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
        mobile: form.mobile, role: form.role
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account created! Welcome to DSA CRM 🎉');
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const perks = [
    'Manage unlimited customers & loan files',
    'Auto-commission on disbursement',
    'Real-time dashboard & reports',
    'Role-based access for your team',
    '14 days free — no credit card needed',
  ];

  const ROLE_OPTIONS = [
    { value: 'data_operator', label: 'Data Operator' },
    { value: 'marketing_executive', label: 'Marketing Executive' },
    { value: 'bank_executive', label: 'Bank Executive' },
  ];

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
          <h2 className="text-4xl font-extrabold mb-4">Start managing loans the smarter way.</h2>
          <p className="text-blue-200 mb-8 text-lg">Join 500+ DSAs who've made the switch to organized, automated loan management.</p>
          <ul className="space-y-3">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
          <p className="text-slate-200 italic text-sm mb-3">"We used to track 80+ files on Excel. Now everything is in one place and commissions are calculated automatically."</p>
          <div className="text-white font-semibold text-sm">Ramesh Agarwal</div>
          <div className="text-blue-300 text-xs">DSA Owner, Pune</div>
        </div>
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

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 mb-6">Free 14-day trial. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input name="name" className="input-field" required placeholder="Rajesh Kumar"
                value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input type="email" name="email" className="input-field" required placeholder="rajesh@dsa.com"
                value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <input type="tel" name="mobile" className="input-field" placeholder="10-digit number"
                value={form.mobile} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Your Role</label>
              <select name="role" className="input-field" value={form.role} onChange={handleChange}>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">Admin accounts are set up by your organization owner.</p>
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" className="input-field pr-10"
                  required placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input type="password" name="confirmPassword" className="input-field" required
                placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <><Loader size={16} className="animate-spin" /> Creating account...</> : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            By creating an account you agree to our{' '}
            <Link to="#" className="underline">Terms of Service</Link> and{' '}
            <Link to="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
