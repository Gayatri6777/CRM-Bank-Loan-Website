import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS, LOAN_TYPE_LABELS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { FileText, Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Loader, AlertTriangle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/recent-loans')])
      .then(([s, r]) => {
        setStats(s.data.data);
        setRecentLoans(r.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  const statusPieData = (stats?.loansByStatus || []).map(s => ({
    name: STATUS_LABELS[s._id] || s._id,
    value: s.count
  }));

  const monthlyChartData = (stats?.monthlyData || []).map(d => ({
    month: MONTH_NAMES[(d._id.month - 1)],
    loans: d.count,
    amount: Math.round(d.amount / 100000),
    disbursed: Math.round((d.disbursed || 0) / 100000)
  }));

  // Role-based stat cards
  const adminCards = [
    { label: 'Total Loan Files', value: stats?.totalLoans || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-emerald-500' },
    { label: 'Pending / Active', value: stats?.pendingLoans || 0, icon: Clock, color: 'bg-amber-500' },
    { label: 'In Query', value: stats?.inQueryLoans || 0, icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Sanctioned', value: stats?.sanctionedLoans || 0, icon: Award, color: 'bg-violet-500' },
    { label: 'Disbursed', value: stats?.disbursedLoans || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Total Disbursed', value: formatCurrency(stats?.totalDisbursed), icon: TrendingUp, color: 'bg-indigo-500' },
    { label: 'Total Commission', value: formatCurrency(stats?.totalCommission), icon: DollarSign, color: 'bg-pink-500' },
  ];

  const execCards = [
    { label: 'My Loan Files', value: stats?.totalLoans || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending / Active', value: stats?.pendingLoans || 0, icon: Clock, color: 'bg-amber-500' },
    { label: 'In Query', value: stats?.inQueryLoans || 0, icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Disbursed', value: stats?.disbursedLoans || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Total Disbursed', value: formatCurrency(stats?.totalDisbursed), icon: TrendingUp, color: 'bg-violet-500' },
    { label: 'Total Commission', value: formatCurrency(stats?.totalCommission), icon: DollarSign, color: 'bg-pink-500' },
  ];

  const statCards = user?.role === 'admin' ? adminCards : execCards;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong>! Here's your overview.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Query Alert */}
      {stats?.inQueryLoans > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
          <div>
            <div className="font-semibold text-orange-800">{stats.inQueryLoans} loan file{stats.inQueryLoans > 1 ? 's' : ''} in Query</div>
            <div className="text-sm text-orange-600">These files need attention — documents may be required or queries need to be resolved.</div>
          </div>
          <Link to="/loans?status=query" className="ml-auto btn-secondary text-sm py-1.5 text-orange-700 border-orange-300">View Files →</Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Loan Trends (Last 6 Months)</h3>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="loans" name="Total Files" stroke="#3b82f6" fill="url(#colorLoans)" strokeWidth={2} />
                <Area type="monotone" dataKey="disbursed" name="Disbursed (L)" stroke="#10b981" fill="url(#colorDisbursed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet. Create loan files to see trends.</div>
          )}
        </div>

        {/* Status Pie */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Files by Status</h3>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* User Performance (Admin only) */}
      {user?.role === 'admin' && (stats?.userPerformance || []).length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Performer — Marketing Executives</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                {['Name', 'Disbursed Files', 'Total Disbursed Amount'].map(h => <th key={h} className="table-header">{h}</th>)}
              </tr></thead>
              <tbody>
                {stats.userPerformance.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="table-cell font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                        {u.userName || 'Unassigned'}
                      </div>
                    </td>
                    <td className="table-cell font-bold text-emerald-700">{u.disbursed}</td>
                    <td className="table-cell font-semibold">{formatCurrency(u.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Loans */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Recent Loan Files</h3>
          <Link to="/loans" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['Loan ID', 'Customer', 'Bank', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {recentLoans.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">No loan files yet. <Link to="/loans/new" className="text-blue-600">Create one →</Link></td></tr>
              ) : recentLoans.map(loan => (
                <tr key={loan._id} className="hover:bg-slate-50">
                  <td className="table-cell">
                    <Link to={`/loans/${loan._id}`} className="font-mono text-blue-600 font-semibold text-xs hover:underline">{loan.loanId}</Link>
                  </td>
                  <td className="table-cell">{loan.customer?.firstName} {loan.customer?.lastName}</td>
                  <td className="table-cell">{loan.bank?.name}</td>
                  <td className="table-cell font-medium">{formatCurrency(loan.appliedAmount)}</td>
                  <td className="table-cell">
                    <span className={`badge ${STATUS_COLORS[loan.status]}`}>{STATUS_LABELS[loan.status]}</span>
                  </td>
                  <td className="table-cell text-slate-500">{formatDate(loan.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
