import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Loader, ChevronRight, ChevronLeft, User, DollarSign, FileText, Home, Upload, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { LOAN_TYPES, EMPLOYMENT_TYPES, INDIAN_STATES, formatCurrency } from '../utils/helpers';

const STEPS = [
  { id: 1, label: 'Customer', icon: User },
  { id: 2, label: 'Financial', icon: DollarSign },
  { id: 3, label: 'Loan', icon: FileText },
  { id: 4, label: 'Property', icon: Home },
  { id: 5, label: 'Review', icon: CheckCircle }
];

export default function LoanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isEdit = !!id;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [users, setUsers] = useState([]);
  const [eligibleBanks, setEligibleBanks] = useState([]);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    customer: '',
    // Step 2
    employmentType: '', monthlyIncome: '', otherIncome: '', existingEmi: '',
    hasItr: false, itrAmount: '', creditScore: '',
    // Step 3
    loanType: '', bank: '', appliedAmount: '', tenure: '', purpose: '', priority: 'medium',
    assignedMarketingExec: '', assignedBankExecutive: '',
    // Step 4
    hasOwnProperty: false,
    propertyType: '', propertyValue: '', propertyAddress: '', ownerName: '',
    // General
    remarks: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/customers?limit=500'),
      api.get('/banks'),
      api.get('/users?isActive=true').catch(() => ({ data: { data: [] } }))
    ]).then(([c, b, u]) => {
      setCustomers(c.data.data || []);
      setBanks(b.data.data || []);
      setUsers(u.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/loans/${id}`).then(({ data }) => {
        const l = data.data;
        setForm({
          customer: l.customer?._id || '',
          employmentType: l.employmentType || '',
          monthlyIncome: l.monthlyIncome || '',
          otherIncome: l.otherIncome || '',
          existingEmi: l.existingEmi || '',
          hasItr: l.hasItr || false,
          itrAmount: l.itrAmount || '',
          creditScore: l.creditScore || '',
          loanType: l.loanType || '',
          bank: l.bank?._id || '',
          appliedAmount: l.appliedAmount || '',
          tenure: l.tenure || '',
          purpose: l.purpose || '',
          priority: l.priority || 'medium',
          assignedMarketingExec: l.assignedMarketingExec?._id || '',
          assignedBankExecutive: l.assignedBankExecutive?._id || '',
          hasOwnProperty: l.propertyDetails?.hasOwnProperty || false,
          propertyType: l.propertyDetails?.propertyType || '',
          propertyValue: l.propertyDetails?.propertyValue || '',
          propertyAddress: l.propertyDetails?.propertyAddress || '',
          ownerName: l.propertyDetails?.ownerName || '',
          remarks: l.remarks || ''
        });
      });
    }
  }, [id]);

  // Check bank eligibility when step 3 criteria changes
  useEffect(() => {
    if (form.loanType && form.appliedAmount && step >= 3) {
      checkEligibility();
    }
  }, [form.loanType, form.appliedAmount, form.creditScore, form.monthlyIncome, form.hasItr, form.hasOwnProperty, form.employmentType]);

  const checkEligibility = async () => {
    if (!form.loanType || !form.appliedAmount) return;
    setCheckingEligibility(true);
    try {
      const params = new URLSearchParams({
        loanType: form.loanType,
        amount: form.appliedAmount,
        ...(form.creditScore && { creditScore: form.creditScore }),
        ...(form.monthlyIncome && { monthlyIncome: form.monthlyIncome }),
        hasItr: form.hasItr ? 'true' : 'false',
        hasOwnProperty: form.hasOwnProperty ? 'true' : 'false',
        ...(form.employmentType && { employmentType: form.employmentType })
      });
      const { data } = await api.get(`/loans/eligibility/check?${params}`);
      setEligibleBanks(data.data?.eligible || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = (stepNum) => {
    const e = {};
    if (stepNum === 1) {
      if (!form.customer) e.customer = 'Please select a customer';
    }
    if (stepNum === 2) {
      if (!form.employmentType) e.employmentType = 'Employment type is required';
      if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0) e.monthlyIncome = 'Monthly income is required';
      if (!form.creditScore || Number(form.creditScore) < 300 || Number(form.creditScore) > 900) e.creditScore = 'Credit score must be between 300-900';
    }
    if (stepNum === 3) {
      if (!form.loanType) e.loanType = 'Loan type is required';
      if (!form.bank) e.bank = 'Bank is required';
      if (!form.appliedAmount || Number(form.appliedAmount) <= 0) e.appliedAmount = 'Applied amount is required';
      if (!form.tenure || Number(form.tenure) <= 0) e.tenure = 'Tenure is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validate(step)) setStep(s => Math.min(5, s + 1));
  };

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        customer: form.customer,
        employmentType: form.employmentType,
        monthlyIncome: Number(form.monthlyIncome) || undefined,
        otherIncome: Number(form.otherIncome) || undefined,
        existingEmi: Number(form.existingEmi) || undefined,
        hasItr: form.hasItr,
        itrAmount: Number(form.itrAmount) || undefined,
        creditScore: Number(form.creditScore) || undefined,
        loanType: form.loanType,
        bank: form.bank,
        appliedAmount: Number(form.appliedAmount),
        tenure: Number(form.tenure) || undefined,
        purpose: form.purpose,
        priority: form.priority,
        assignedMarketingExec: form.assignedMarketingExec || undefined,
        assignedBankExecutive: form.assignedBankExecutive || undefined,
        propertyDetails: form.loanType === 'home_loan' || form.loanType === 'lap' ? {
          hasOwnProperty: form.hasOwnProperty,
          propertyType: form.propertyType || undefined,
          propertyValue: Number(form.propertyValue) || undefined,
          propertyAddress: form.propertyAddress || undefined,
          ownerName: form.ownerName || undefined
        } : undefined,
        remarks: form.remarks
      };

      if (isEdit) await api.put(`/loans/${id}`, payload);
      else await api.post('/loans', payload);
      toast.success(`Loan file ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/loans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save loan');
    } finally { setSaving(false); }
  };

  const selectedCustomer = customers.find(c => c._id === form.customer);
  const selectedBank = banks.find(b => b._id === form.bank);
  const selectedProduct = selectedBank?.loanProducts?.find(p => p.type === form.loanType);

  const Field = ({ label, error, required, children }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/loans')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-1">
            <ArrowLeft size={14} /> Back to Loans
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Loan File' : 'New Loan Application'}</h1>
        </div>
      </div>

      {/* Step Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div onClick={() => isCompleted && setStep(s.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                      ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 cursor-default' :
                        isCompleted ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600' :
                        'bg-slate-200 text-slate-400 cursor-default'}`}>
                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 mt-[-10px] rounded ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-600" /> Select Customer
          </h2>
          <Field label="Customer" error={errors.customer} required>
            <select value={form.customer} onChange={e => set('customer', e.target.value)} className="input-field">
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.firstName} {c.lastName} | {c.mobile} | {c.customerId}
                </option>
              ))}
            </select>
          </Field>

          {selectedCustomer && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3">Customer Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  ['Name', `${selectedCustomer.firstName} ${selectedCustomer.lastName}`],
                  ['Mobile', selectedCustomer.mobile],
                  ['PAN', selectedCustomer.panNumber || '-'],
                  ['Employment', selectedCustomer.employmentType?.replace('_', ' ') || '-'],
                  ['Monthly Income', selectedCustomer.monthlyIncome ? formatCurrency(selectedCustomer.monthlyIncome) : '-'],
                  ['Credit Score', selectedCustomer.creditScore || '-'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-blue-600 text-xs">{k}</span>
                    <div className="font-medium text-blue-900">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Financial Details */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" /> Financial Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Employment Type" error={errors.employmentType} required>
              <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} className="input-field">
                <option value="">Select...</option>
                {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Monthly Income (₹)" error={errors.monthlyIncome} required>
              <input type="number" value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)}
                className="input-field" placeholder="e.g. 50000" />
            </Field>
            <Field label="Other Income (₹)">
              <input type="number" value={form.otherIncome} onChange={e => set('otherIncome', e.target.value)}
                className="input-field" placeholder="Rental, dividend, etc." />
            </Field>
            <Field label="Existing EMI (₹)">
              <input type="number" value={form.existingEmi} onChange={e => set('existingEmi', e.target.value)}
                className="input-field" placeholder="Current EMI outflow" />
            </Field>
            <Field label="Credit / CIBIL Score" error={errors.creditScore} required>
              <input type="number" value={form.creditScore} onChange={e => set('creditScore', e.target.value)}
                className="input-field" placeholder="300 - 900" min="300" max="900" />
              {form.creditScore && (
                <div className="mt-1">
                  <div className={`text-xs font-medium ${Number(form.creditScore) >= 750 ? 'text-green-600' : Number(form.creditScore) >= 650 ? 'text-amber-600' : 'text-red-600'}`}>
                    {Number(form.creditScore) >= 750 ? '✅ Excellent' : Number(form.creditScore) >= 650 ? '⚠️ Good' : '❌ Poor - may affect eligibility'}
                  </div>
                </div>
              )}
            </Field>
            <div>
              <label className="label">ITR Filed?</label>
              <div className="flex items-center gap-4 mt-2">
                {[true, false].map(v => (
                  <label key={String(v)} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.hasItr === v} onChange={() => set('hasItr', v)}
                      className="accent-blue-600" />
                    <span className="text-sm">{v ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.hasItr && (
              <Field label="ITR Amount (₹)">
                <input type="number" value={form.itrAmount} onChange={e => set('itrAmount', e.target.value)}
                  className="input-field" placeholder="Annual ITR amount" />
              </Field>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Loan Details + Bank Eligibility */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" /> Loan Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Loan Type" error={errors.loanType} required>
                <select value={form.loanType} onChange={e => { set('loanType', e.target.value); set('bank', ''); }} className="input-field">
                  <option value="">Select loan type...</option>
                  {LOAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Applied Amount (₹)" error={errors.appliedAmount} required>
                <input type="number" value={form.appliedAmount} onChange={e => set('appliedAmount', e.target.value)}
                  className="input-field" placeholder="Enter amount" />
                {selectedProduct && (
                  <p className="text-xs text-slate-400 mt-1">
                    Range: {formatCurrency(selectedProduct.minAmount)} – {formatCurrency(selectedProduct.maxAmount)}
                  </p>
                )}
              </Field>
              <Field label="Tenure (months)" error={errors.tenure} required>
                <input type="number" value={form.tenure} onChange={e => set('tenure', e.target.value)}
                  className="input-field" placeholder="e.g. 240" />
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input-field">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Purpose">
                  <input type="text" value={form.purpose} onChange={e => set('purpose', e.target.value)}
                    className="input-field" placeholder="Brief loan purpose..." />
                </Field>
              </div>
            </div>
          </div>

          {/* Bank Eligibility */}
          {form.loanType && form.appliedAmount && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" /> Eligible Banks
                  {checkingEligibility && <Loader size={14} className="animate-spin text-blue-600" />}
                </h2>
                <span className="text-sm text-slate-500">{eligibleBanks.length} banks eligible</span>
              </div>
              <Field label="Select Bank" error={errors.bank} required>
                <select value={form.bank} onChange={e => set('bank', e.target.value)} className="input-field mb-3">
                  <option value="">-- Select Bank --</option>
                  {eligibleBanks.map(e => (
                    <option key={e.bank._id} value={e.bank._id}>
                      {e.bank.name} | Rate: {e.product?.interestRate}% | Commission: {e.product?.commissionRate}%
                    </option>
                  ))}
                  {/* Also show all banks as fallback */}
                  {eligibleBanks.length === 0 && banks.filter(b => b.loanProducts?.some(p => p.type === form.loanType)).map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </Field>

              {eligibleBanks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eligibleBanks.map(e => (
                    <div key={e.bank._id}
                      onClick={() => set('bank', e.bank._id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${form.bank === e.bank._id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{e.bank.name}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Eligible ✓</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                        <div><span className="font-medium text-slate-700">{e.product?.interestRate}%</span><div>Rate</div></div>
                        <div><span className="font-medium text-slate-700">{e.product?.commissionRate}%</span><div>Commission</div></div>
                        <div><span className="font-medium text-slate-700">{e.product?.maxTenure || '-'}</span><div>Max Tenure</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assignment (admin/manager only) */}
          {hasRole('admin', 'data_operator') && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">Assign Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Marketing Executive">
                  <select value={form.assignedMarketingExec} onChange={e => set('assignedMarketingExec', e.target.value)} className="input-field">
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'marketing_executive').map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Bank Executive">
                  <select value={form.assignedBankExecutive} onChange={e => set('assignedBankExecutive', e.target.value)} className="input-field">
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'bank_executive').map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Property Details */}
      {step === 4 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Home size={20} className="text-blue-600" /> Property Details
            <span className="text-sm text-slate-400 font-normal">(Optional)</span>
          </h2>
          <div className="mb-4">
            <label className="label">Do you own property?</label>
            <div className="flex gap-4 mt-1">
              {[true, false].map(v => (
                <label key={String(v)} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.hasOwnProperty === v} onChange={() => set('hasOwnProperty', v)} className="accent-blue-600" />
                  <span className="text-sm">{v ? 'Yes' : 'No'}</span>
                </label>
              ))}
            </div>
          </div>

          {form.hasOwnProperty && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Property Type">
                <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {['flat', 'house', 'plot', 'commercial', 'agriculture'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Property Value (₹)">
                <input type="number" value={form.propertyValue} onChange={e => set('propertyValue', e.target.value)}
                  className="input-field" placeholder="Market value" />
              </Field>
              <Field label="Owner Name">
                <input type="text" value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
                  className="input-field" placeholder="Property owner name" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Property Address">
                  <textarea value={form.propertyAddress} onChange={e => set('propertyAddress', e.target.value)}
                    className="input-field resize-none" rows={2} placeholder="Full property address..." />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Field label="Internal Remarks">
              <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)}
                className="input-field resize-none" rows={3} placeholder="Any additional notes..." />
            </Field>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" /> Review Application
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Customer</h4>
                <div className="space-y-1 text-sm">
                  {selectedCustomer ? (
                    <>
                      <div className="font-medium text-slate-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                      <div className="text-slate-500">{selectedCustomer.mobile} | {selectedCustomer.customerId}</div>
                    </>
                  ) : <span className="text-red-500">Not selected</span>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Financial</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-slate-500">Employment:</span> <span className="font-medium">{form.employmentType?.replace('_', ' ') || '-'}</span></div>
                  <div><span className="text-slate-500">Income:</span> <span className="font-medium">{form.monthlyIncome ? formatCurrency(Number(form.monthlyIncome)) : '-'}/mo</span></div>
                  <div><span className="text-slate-500">CIBIL:</span> <span className={`font-bold ${Number(form.creditScore) >= 750 ? 'text-green-600' : Number(form.creditScore) >= 650 ? 'text-amber-600' : 'text-red-600'}`}>{form.creditScore || '-'}</span></div>
                  <div><span className="text-slate-500">ITR Filed:</span> <span className="font-medium">{form.hasItr ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Loan</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-slate-500">Type:</span> <span className="font-medium">{form.loanType?.replace('_', ' ') || '-'}</span></div>
                  <div><span className="text-slate-500">Amount:</span> <span className="font-bold text-blue-700">{form.appliedAmount ? formatCurrency(Number(form.appliedAmount)) : '-'}</span></div>
                  <div><span className="text-slate-500">Tenure:</span> <span className="font-medium">{form.tenure ? `${form.tenure} months` : '-'}</span></div>
                  <div><span className="text-slate-500">Bank:</span> <span className="font-medium">{selectedBank?.name || '-'}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Bank Product</h4>
                {selectedProduct ? (
                  <div className="space-y-1 text-sm">
                    <div><span className="text-slate-500">Rate:</span> <span className="font-medium">{selectedProduct.interestRate}% p.a.</span></div>
                    <div><span className="text-slate-500">Processing Fee:</span> <span className="font-medium">{selectedProduct.processingFee}%</span></div>
                    <div><span className="text-slate-500">Commission:</span> <span className="font-medium text-emerald-700">{selectedProduct.commissionRate}%</span></div>
                    <div><span className="text-slate-500">Est. Commission:</span> <span className="font-bold text-emerald-700">
                      {form.appliedAmount ? formatCurrency(Number(form.appliedAmount) * selectedProduct.commissionRate / 100) : '-'}
                    </span></div>
                  </div>
                ) : <span className="text-slate-400 text-sm">No product selected</span>}
              </div>
            </div>

            {form.propertyType && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Property</h4>
                <div className="text-sm">
                  <span className="text-slate-500">Type:</span> <span className="font-medium capitalize">{form.propertyType}</span>
                  {form.propertyValue && <> | <span className="text-slate-500">Value:</span> <span className="font-medium">{formatCurrency(Number(form.propertyValue))}</span></>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} disabled={step === 1}
          className="btn-secondary disabled:opacity-40">
          <ChevronLeft size={16} /> Previous
        </button>
        <div className="flex gap-3">
          <button onClick={() => navigate('/loans')} className="btn-secondary">Cancel</button>
          {step < 5 ? (
            <button onClick={nextStep} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : (isEdit ? 'Update Loan' : 'Create Loan File')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
