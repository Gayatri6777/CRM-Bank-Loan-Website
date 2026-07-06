import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatCurrency, STATUS_LABELS, LOAN_TYPE_LABELS } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Filter, Loader, BarChart3, Building2, Award } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('loan');
  const [filters, setFilters] = useState({ from: '', to: '', bankId: '', loanType: '', status: '' });
  const [banks, setBanks] = useState([]);
  const [loanData, setLoanData] = useState(null);
  const [commissionData, setCommissionData] = useState(null);
  const [bankPerformance, setBankPerformance] = useState([]);
  const [userPerformance, setUserPerformance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/banks').then(({ data }) => setBanks(data.data || []));
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      const [loan, commission, bank, user] = await Promise.all([
        api.get(`/reports/loan-summary?${params}`),
        api.get(`/reports/commission-report?${params}`),
        api.get(`/reports/bank-performance?${params}`),
        api.get('/reports/user-performance').catch(() => ({ data: { data: [] } }))
      ]);
      setLoanData(loan.data);
      setCommissionData(commission.data);
      setBankPerformance(bank.data.data || []);
      setUserPerformance(user.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const exportCSV = (data, filename) => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analyze loan files, commissions, and performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700">Filters</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input-field" value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input-field" value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))} />
          </div>
          <div>
            <label className="label">Bank</label>
            <select className="input-field" value={filters.bankId} onChange={e => setFilters(p => ({ ...p, bankId: e.target.value }))}>
              <option value="">All Banks</option>
              {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Loan Type</label>
            <select className="input-field" value={filters.loanType} onChange={e => setFilters(p => ({ ...p, loanType: e.target.value }))}>
              <option value="">All Types</option>
              {Object.entries(LOAN_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {['in_process','login','query','active','sanction','disbursement','rejected'].map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={fetchReports} disabled={loading} className="btn-primary">
            {loading ? <Loader size={15} className="animate-spin" /> : <BarChart3 size={15} />}
            Generate Report
          </button>
          <button onClick={() => { setFilters({ from:'',to:'',bankId:'',loanType:'',status:'' }); }} className="btn-secondary">
            Clear
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {[['loan','Loan Summary'],['commission','Commission'],['banks','Bank Performance'],['users','User Performance']].map(([k,v]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === k ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {v}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12"><Loader className="animate-spin text-blue-600" size={32} /></div>
      )}

      {/* Loan Summary */}
      {!loading && activeTab === 'loan' && loanData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Files', value: loanData.data?.summary?.total || 0 },
              { label: 'Total Applied', value: formatCurrency(loanData.data?.summary?.totalAmount) },
              { label: 'Disbursed Files', value: loanData.data?.summary?.disbursed || 0 },
              { label: 'Total Disbursed', value: formatCurrency(loanData.data?.summary?.disbursedAmount) },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card text-center">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Status */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">By Status</h3>
                <button onClick={() => exportCSV(loanData.data?.byStatus, 'loans-by-status')} className="btn-secondary py-1 px-2 text-xs">
                  <Download size={12} /> Export
                </button>
              </div>
              {(loanData.data?.byStatus || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={loanData.data.byStatus.map(d => ({ name: STATUS_LABELS[d._id] || d._id, count: d.count, amount: Math.round(d.totalAmount/100000) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Files">
                      {(loanData.data.byStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="text-center py-10 text-slate-400 text-sm">No data</div>}
            </div>

            {/* By Loan Type */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">By Loan Type</h3>
                <button onClick={() => exportCSV(loanData.data?.byLoanType, 'loans-by-type')} className="btn-secondary py-1 px-2 text-xs">
                  <Download size={12} /> Export
                </button>
              </div>
              {(loanData.data?.byLoanType || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={loanData.data.byLoanType.map(d => ({ name: LOAN_TYPE_LABELS[d._id] || d._id, count: d.count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Files">
                      {(loanData.data.byLoanType || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="text-center py-10 text-slate-400 text-sm">No data</div>}
            </div>
          </div>
        </div>
      )}

      {/* Commission Report */}
      {!loading && activeTab === 'commission' && commissionData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Total Commissions', value: commissionData.totals?.count || 0 },
              { label: 'Total Commission', value: formatCurrency(commissionData.totals?.total) },
              { label: 'Marketing Share', value: formatCurrency(commissionData.totals?.marketingShare) },
              { label: 'Bank Exec Share', value: formatCurrency(commissionData.totals?.bankShare) },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card text-center">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Commission Records</h3>
              <button onClick={() => exportCSV(commissionData.data?.map(c => ({
                LoanID: c.loan?.loanId, Customer: `${c.customer?.firstName} ${c.customer?.lastName}`,
                Bank: c.bank?.name, DisbursedAmount: c.disbursedAmount, CommissionRate: c.commissionRate,
                CommissionAmount: c.commissionAmount, Status: c.status
              })), 'commission-report')} className="btn-secondary py-1 px-3 text-xs">
                <Download size={12} /> Export CSV
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>{['Loan', 'Customer', 'Bank', 'Disbursed', 'Rate', 'Commission', 'Marketing', 'Status'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {(commissionData.data || []).length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">No commission records found</td></tr>
                ) : (commissionData.data || []).map(c => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="table-cell font-mono text-xs text-blue-600">{c.loan?.loanId}</td>
                    <td className="table-cell">{c.customer?.firstName} {c.customer?.lastName}</td>
                    <td className="table-cell text-sm">{c.bank?.name}</td>
                    <td className="table-cell font-medium">{formatCurrency(c.disbursedAmount)}</td>
                    <td className="table-cell">{c.commissionRate}%</td>
                    <td className="table-cell font-bold text-emerald-700">{formatCurrency(c.commissionAmount)}</td>
                    <td className="table-cell">{formatCurrency(c.marketingExecShare)}</td>
                    <td className="table-cell">
                      <span className={`badge ${c.status === 'paid' ? 'bg-green-100 text-green-700' : c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bank Performance */}
      {!loading && activeTab === 'banks' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Building2 size={18} /> Bank Performance</h3>
            <button onClick={() => exportCSV(bankPerformance, 'bank-performance')} className="btn-secondary py-1 px-3 text-xs">
              <Download size={12} /> Export CSV
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>{['Bank', 'Total Files', 'Disbursed', 'Rejected', 'Total Applied', 'Total Disbursed', 'Conversion %'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {bankPerformance.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">No data yet</td></tr>
              ) : bankPerformance.map(b => (
                <tr key={b._id} className="hover:bg-slate-50">
                  <td className="table-cell font-semibold">{b.bankName}</td>
                  <td className="table-cell">{b.totalFiles}</td>
                  <td className="table-cell font-bold text-green-700">{b.disbursed}</td>
                  <td className="table-cell text-red-600">{b.rejected}</td>
                  <td className="table-cell">{formatCurrency(b.totalApplied)}</td>
                  <td className="table-cell font-semibold">{formatCurrency(b.totalDisbursed)}</td>
                  <td className="table-cell">
                    <span className={`font-bold ${b.totalFiles > 0 && (b.disbursed/b.totalFiles*100) >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                      {b.totalFiles > 0 ? Math.round(b.disbursed/b.totalFiles*100) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Performance */}
      {!loading && activeTab === 'users' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Award size={18} /> User Performance</h3>
            <button onClick={() => exportCSV(userPerformance, 'user-performance')} className="btn-secondary py-1 px-3 text-xs">
              <Download size={12} /> Export CSV
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>{['#','User','Role','Total Files','Disbursed','Total Applied','Disbursed Amount'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {userPerformance.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">No data (admin access required)</td></tr>
              ) : userPerformance.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="table-cell font-bold text-slate-400">#{i+1}</td>
                  <td className="table-cell font-semibold">{u.userName || 'Unassigned'}</td>
                  <td className="table-cell text-xs capitalize">{u.userRole?.replace('_', ' ')}</td>
                  <td className="table-cell">{u.totalFiles}</td>
                  <td className="table-cell font-bold text-green-700">{u.disbursed}</td>
                  <td className="table-cell">{formatCurrency(u.totalAmount)}</td>
                  <td className="table-cell font-semibold">{formatCurrency(u.disbursedAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
