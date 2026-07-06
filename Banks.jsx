import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Building2, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function Banks() {
  const { hasRole } = useAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/banks').then(({ data }) => setBanks(data.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this bank?')) return;
    try {
      await api.delete(`/banks/${id}`);
      toast.success('Bank deactivated');
      setBanks(bs => bs.filter(b => b._id !== id));
    } catch { toast.error('Failed'); }
  };

  const LOAN_TYPE_COLORS = {
    home_loan: 'bg-blue-100 text-blue-700', personal_loan: 'bg-violet-100 text-violet-700',
    business_loan: 'bg-amber-100 text-amber-700', car_loan: 'bg-emerald-100 text-emerald-700',
    education_loan: 'bg-pink-100 text-pink-700', lap: 'bg-orange-100 text-orange-700'
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Banks & Products</h1>
          <p className="page-subtitle">{banks.length} banks configured</p>
        </div>
        {hasRole('admin') && (
          <Link to="/banks/new" className="btn-primary"><Plus size={16} /> Add Bank</Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="space-y-4">
          {banks.map(bank => (
            <div key={bank._id} className="card p-0 overflow-hidden">
              {/* Bank Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                    <Building2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{bank.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{bank.bankId}</span>
                      <span>{bank.contactPerson}</span>
                      <span>{bank.contactPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-emerald-100 text-emerald-700">{bank.loanProducts?.length || 0} Products</span>
                  {hasRole('admin') && (
                    <>
                      <Link to={`/banks/${bank._id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                        <Edit size={13} /> Edit
                      </Link>
                      <button onClick={() => handleDelete(bank._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setExpanded(expanded === bank._id ? null : bank._id)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                    {expanded === bank._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Loan Products */}
              {expanded === bank._id && (
                <div className="px-6 py-4 bg-slate-50">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Loan Products</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(bank.loanProducts || []).map(product => (
                      <div key={product._id} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`badge ${LOAN_TYPE_COLORS[product.type] || 'bg-slate-100 text-slate-600'}`}>
                            {product.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold">{product.commissionRate}%</span>
                        </div>
                        <h5 className="font-medium text-slate-900 text-sm">{product.name}</h5>
                        <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                          <div>Range: {formatCurrency(product.minAmount)} – {formatCurrency(product.maxAmount)}</div>
                          <div>Rate: {product.interestRate}% p.a. | Processing: {product.processingFee}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
