import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatDate, ROLE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Shield, Loader, X, Save, Eye, EyeOff } from 'lucide-react';

const ROLES = ['admin', 'data_operator', 'marketing_executive', 'bank_executive'];
const ROLE_COLORS = { admin: 'bg-red-100 text-red-700', data_operator: 'bg-blue-100 text-blue-700', marketing_executive: 'bg-violet-100 text-violet-700', bank_executive: 'bg-orange-100 text-orange-700' };

const emptyForm = { name: '', email: '', password: '', role: 'data_operator', mobile: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const fetchUsers = () => {
    api.get('/users').then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchUsers, []);

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, mobile: u.mobile || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.mobile && !/^[0-9]{10}$/.test(form.mobile)) return toast.error('Mobile must be 10 digits');
    setSaving(true);
    try {
      if (editUser) {
        const payload = { ...form }; if (!payload.password) delete payload.password;
        await api.put(`/users/${editUser._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', form);
        toast.success('User created');
      }
      setModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deactivated'); fetchUsers(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} total users</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add User</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              {['Name', 'Email', 'Mobile', 'Role', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-slate-500">{u.email}</td>
                  <td className="table-cell">{u.mobile || '-'}</td>
                  <td className="table-cell"><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td className="table-cell">
                    <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-slate-400">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold">{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">{editUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input-field pr-10"
                    required={!editUser} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Mobile</label>
                <input type="tel" className="input-field" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10 digit number" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
