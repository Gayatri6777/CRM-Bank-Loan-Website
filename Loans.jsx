import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS, LOAN_TYPE_LABELS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Edit, FileText, Loader, ChevronLeft, ChevronRight, Filter, AlertTriangle } from 'lucide-react';

const LOAN_STATUSES = ['in_process', 'login', 'query', 'active', 'sanction', 'disbursement', 'rejected', 'cancelled'];
const PRIORITY_COLORS = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-slate-100 text-slate-600' };

export default function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loanType, setLoanType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/loans', { params: { search, status, loanType, page, limit: 15 } });
      setLoans(data.data || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load loans'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(); }, [search, status, loanType, page]);

  // Count query files for alert
  const queryCount = loans.filter(l => l.status === 'query').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Files</h1>
          <p className="page-subtitle">{total} total files</p>
        </div>
        <Link to="/loans/new" className="btn-primary"><Plus size={16} /> New Loan File</Link>
      </div>

      {/* Query Alert */}
      {queryCount > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-orange-500" />
          <span className="text-orange-700"><strong>{queryCount}</strong> file{queryCount > 1 ? 's' : ''} in Query — action needed</span>
          <button onClick={() => { setStatus('query'); setPage(1); }}
            className="ml-auto text-orange-700 underline text-xs">Filter by Query</button>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search by loan ID..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 flex-shrink-0" />
            <select className="input-field w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {LOAN_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <select className="input-field w-40" value={loanType} onChange={e => { setLoanType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {Object.entries(LOAN_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Loan ID', 'Customer', 'Bank', 'Type', 'Amount', 'Priority', 'Status', 'Assigned', 'Created', 'Actions'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="py-16 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={10} className="py-16 text-center text-slate-400">
                  <FileText size={40} className="mx-auto mb-2 opacity-40" />
                  <p>No loan files found</p>
                  <Link to="/loans/new" className="text-blue-600 text-sm mt-1 inline-block hover:underline">Create first loan →</Link>
                </td></tr>
              ) : loans.map(loan => (
                <tr key={loan._id} className={`hover:bg-slate-50 transition-colors ${loan.status === 'query' ? 'bg-orange-50/50' : ''}`}>
                  <td className="table-cell">
                    <Link to={`/loans/${loan._id}`} className="font-mono text-blue-600 font-semibold text-xs hover:underline">
                      {loan.loanId}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium text-slate-900 text-sm">{loan.customer?.firstName} {loan.customer?.lastName}</div>
                    <div className="text-xs text-slate-400">{loan.customer?.mobile}</div>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium text-slate-900 text-sm">{loan.bank?.shortName || loan.bank?.name}</div>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 capitalize">
                      {LOAN_TYPE_LABELS[loan.loanType] || loan.loanType}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-slate-900">{formatCurrency(loan.appliedAmount)}</td>
                  <td className="table-cell">
                    <span className={`badge text-xs ${PRIORITY_COLORS[loan.priority]}`}>{loan.priority}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {loan.status === 'query' && <AlertTriangle size={12} className="text-orange-500" />}
                      <span className={`badge ${STATUS_COLORS[loan.status]}`}>{STATUS_LABELS[loan.status]}</span>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-slate-600">{loan.assignedMarketingExec?.name || '-'}</td>
                  <td className="table-cell text-xs text-slate-400">{formatDate(loan.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <Link to={`/loans/${loan._id}`} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                        <Eye size={14} />
                      </Link>
                      <Link to={`/loans/${loan._id}/edit`} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                        <Edit size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {page} of {totalPages} ({total} total)</p>
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
