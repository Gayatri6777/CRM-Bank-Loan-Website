import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, User, Phone, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { search, page, limit: 15 } });
      setCustomers(data.data);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [search, page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{total} total customers</p>
        </div>
        <Link to="/customers/new" className="btn-primary">
          <Plus size={16} /> Add Customer
        </Link>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" className="input-field pl-9" placeholder="Search by name, mobile or ID..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Customer ID', 'Name', 'Mobile', 'Email', 'Employment', 'Income', 'Credit Score', 'Added', 'Actions'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-slate-400">
                  <User size={40} className="mx-auto mb-2 opacity-40" />
                  <p>No customers found</p>
                </td></tr>
              ) : customers.map(c => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-600 font-medium">{c.customerId}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-slate-400">{c.pan}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><div className="flex items-center gap-1 text-slate-600"><Phone size={12} />{c.mobile}</div></td>
                  <td className="table-cell text-slate-500 text-xs">{c.email || '-'}</td>
                  <td className="table-cell">
                    <span className="capitalize text-xs bg-slate-100 px-2 py-0.5 rounded-full">{c.employmentType?.replace('_', ' ') || '-'}</span>
                  </td>
                  <td className="table-cell font-medium">
                    {c.monthlyIncome ? `₹${(c.monthlyIncome/1000).toFixed(0)}K` : '-'}
                  </td>
                  <td className="table-cell">
                    {c.creditScore ? (
                      <span className={`font-bold text-sm ${c.creditScore >= 750 ? 'text-green-600' : c.creditScore >= 650 ? 'text-amber-600' : 'text-red-600'}`}>
                        {c.creditScore}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="table-cell text-slate-400 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Link to={`/customers/${c._id}/edit`} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary py-1 px-2 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary py-1 px-2 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
