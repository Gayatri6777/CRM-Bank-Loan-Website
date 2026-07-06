import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatDateTime } from '../utils/helpers';
import { Shield, Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const MODULE_COLORS = {
  loans: 'bg-blue-100 text-blue-700',
  documents: 'bg-emerald-100 text-emerald-700',
  customers: 'bg-violet-100 text-violet-700',
  auth: 'bg-amber-100 text-amber-700',
  default: 'bg-slate-100 text-slate-700'
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ module: '', action: '' });

  useEffect(() => {
    setLoading(true);
    api.get('/audit', { params: { ...filters, page, limit: 30 } })
      .then(({ data }) => {
        setLogs(data.data || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  const totalPages = Math.ceil(total / 30);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">{total} total events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <select className="input-field w-44" value={filters.module} onChange={e => setFilters(p => ({ ...p, module: e.target.value }))}>
            <option value="">All Modules</option>
            {['loans', 'documents', 'customers', 'banks', 'auth', 'commissions'].map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search by action..."
              value={filters.action} onChange={e => setFilters(p => ({ ...p, action: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['User', 'Action', 'Module', 'Entity', 'IP Address', 'Time'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                <Shield size={36} className="mx-auto mb-2 opacity-40" />
                <p>No audit logs found</p>
              </td></tr>
            ) : logs.map(log => (
              <tr key={log._id} className="hover:bg-slate-50">
                <td className="table-cell">
                  <div className="font-medium text-sm">{log.user?.name || 'System'}</div>
                  <div className="text-xs text-slate-400 capitalize">{log.user?.role?.replace('_', ' ')}</div>
                </td>
                <td className="table-cell">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{log.action}</span>
                </td>
                <td className="table-cell">
                  <span className={`badge text-xs ${MODULE_COLORS[log.module] || MODULE_COLORS.default}`}>
                    {log.module}
                  </span>
                </td>
                <td className="table-cell text-xs font-mono text-slate-500">{log.entityId || '-'}</td>
                <td className="table-cell text-xs text-slate-400">{log.ipAddress || '-'}</td>
                <td className="table-cell text-xs text-slate-400">{formatDateTime(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
