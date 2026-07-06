import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Save, Loader } from 'lucide-react';
import { ROLE_LABELS } from '../utils/helpers';

export default function Profile() {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <User size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900">Profile Information</h3>
          </div>
          <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-xl">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{user?.name}</div>
              <div className="text-blue-600 font-medium">{ROLE_LABELS[user?.role]}</div>
              <div className="text-sm text-slate-500">{user?.email}</div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ['Email', user?.email],
              ['Mobile', user?.mobile || 'Not set'],
              ['Role', ROLE_LABELS[user?.role]],
              ['Account Status', 'Active'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900">Change Password</h3>
          </div>
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input-field" required value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input-field" required value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input-field" required value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
