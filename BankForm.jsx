import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Trash2, Loader } from 'lucide-react';

const emptyProduct = { name: '', type: 'personal_loan', minAmount: '', maxAmount: '', interestRate: '', processingFee: '', commissionRate: 1 };

export default function BankForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', shortName: '', contactPerson: '', contactEmail: '', contactPhone: '', address: '' });
  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      api.get(`/banks/${id}`).then(({ data }) => {
        const b = data.data;
        setForm({ name: b.name, shortName: b.shortName, contactPerson: b.contactPerson || '', contactEmail: b.contactEmail || '', contactPhone: b.contactPhone || '', address: b.address || '' });
        if (b.loanProducts?.length) setProducts(b.loanProducts);
      });
    }
  }, [id]);

  const addProduct = () => setProducts(p => [...p, { ...emptyProduct }]);
  const removeProduct = (i) => setProducts(p => p.filter((_, idx) => idx !== i));
  const updateProduct = (i, field, val) => setProducts(p => p.map((pr, idx) => idx === i ? { ...pr, [field]: val } : pr));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, loanProducts: products };
      if (isEdit) await api.put(`/banks/${id}`, payload);
      else await api.post('/banks', payload);
      toast.success(`Bank ${isEdit ? 'updated' : 'created'}`);
      navigate('/banks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/banks')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-1">
            <ArrowLeft size={14} /> Back to Banks
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Bank' : 'Add New Bank'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Bank Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Bank Name', key: 'name', required: true },
              { label: 'Short Name', key: 'shortName', required: true },
              { label: 'Contact Person', key: 'contactPerson' },
              { label: 'Contact Email', key: 'contactEmail', type: 'email' },
              { label: 'Contact Phone', key: 'contactPhone', type: 'tel' },
            ].map(({ label, key, type = 'text', required }) => (
              <div key={key}>
                <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
                <input type={type} className="input-field" value={form[key]} required={required}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <input type="text" className="input-field" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Loan Products */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Loan Products</h3>
            <button type="button" onClick={addProduct} className="btn-secondary py-1.5 text-sm">
              <Plus size={14} /> Add Product
            </button>
          </div>
          <div className="space-y-4">
            {products.map((product, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative">
                <button type="button" onClick={() => removeProduct(i)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="label text-xs">Product Name</label>
                    <input className="input-field text-sm" value={product.name}
                      onChange={e => updateProduct(i, 'name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">Type</label>
                    <select className="input-field text-sm" value={product.type}
                      onChange={e => updateProduct(i, 'type', e.target.value)}>
                      {['home_loan', 'personal_loan', 'business_loan', 'car_loan', 'education_loan', 'lap'].map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Min Amount (₹)</label>
                    <input type="number" className="input-field text-sm" value={product.minAmount}
                      onChange={e => updateProduct(i, 'minAmount', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">Max Amount (₹)</label>
                    <input type="number" className="input-field text-sm" value={product.maxAmount}
                      onChange={e => updateProduct(i, 'maxAmount', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">Interest Rate (%)</label>
                    <input type="number" step="0.1" className="input-field text-sm" value={product.interestRate}
                      onChange={e => updateProduct(i, 'interestRate', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-xs">Processing Fee (%)</label>
                    <input type="number" step="0.1" className="input-field text-sm" value={product.processingFee}
                      onChange={e => updateProduct(i, 'processingFee', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-xs">Commission Rate (%)</label>
                    <input type="number" step="0.1" className="input-field text-sm" value={product.commissionRate}
                      onChange={e => updateProduct(i, 'commissionRate', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/banks')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Bank'}
          </button>
        </div>
      </form>
    </div>
  );
}
