import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { DollarSign, Loader, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export default function Commissions() {
  const { user, hasRole } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/commissions', { params: { status: filter, page, limit: 15 } });
      setCommissions(data.data || []);
      setSummary(data.summary || {});
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCommissions(); }, [filter, page]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/commissions/${id}`, { status });
      toast.success(`Commission marked as ${status}`);
      fetchCommissions();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Commissions</h1>
          <p className="page-subtitle">{total} total records</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Commission', value: formatCurrency(summary.totalCommission) },
          { label: 'Marketing Share', value: formatCurrency(summary.totalMarketing) },
          { label: 'Bank Exec Share', value: formatCurrency(summary.totalBank) },
          { label: 'DSA Share', value: formatCurrency(summary.totalDsa) },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
              <DollarSign size={18} className="text-white" />
            </div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card mb-4">
        <select className="input-field w-48" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Loan ID', 'Customer', 'Bank', 'Disbursed', 'Rate', 'Commission', 'Marketing', 'Bank Exec', 'Status', 'Date', hasRole('admin') ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="py-16 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : commissions.length === 0 ? (
                <tr><td colSpan={11} className="py-16 text-center text-slate-400">
                  <DollarSign size={36} className="mx-auto mb-2 opacity-40" />
                  <p>No commissions yet. They are auto-generated on Disbursement.</p>
                </td></tr>
              ) : commissions.map(c => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="table-cell font-mono text-xs text-blue-600 font-semibold">{c.loan?.loanId}</td>
                  <td className="table-cell text-sm">{c.customer?.firstName} {c.customer?.lastName}</td>
                  <td className="table-cell text-sm">{c.bank?.shortName || c.bank?.name}</td>
                  <td className="table-cell font-medium">{formatCurrency(c.disbursedAmount)}</td>
                  <td className="table-cell">{c.commissionRate}%</td>
                  <td className="table-cell font-bold text-emerald-700">{formatCurrency(c.commissionAmount)}</td>
                  <td className="table-cell text-sm">{formatCurrency(c.marketingExecShare)}</td>
                  <td className="table-cell text-sm">{formatCurrency(c.bankExecShare)}</td>
                  <td className="table-cell">
                    <span className={`badge ${c.status === 'paid' ? 'bg-green-100 text-green-700' : c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                  {hasRole('admin') && (
                    <td className="table-cell">
                      {c.status === 'pending' && (
                        <button onClick={() => updateStatus(c._id, 'approved')} disabled={updating === c._id}
                          className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">
                          {updating === c._id ? <Loader size={11} className="animate-spin" /> : 'Approve'}
                        </button>
                      )}
                      {c.status === 'approved' && (
                        <button onClick={() => updateStatus(c._id, 'paid')} disabled={updating === c._id}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-1">
                          <CheckCircle size={11} /> Mark Paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-2"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-1 px-2"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
