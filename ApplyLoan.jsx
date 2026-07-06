import { useState, useReducer } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp, User, DollarSign, FileText, Home, CheckCircle,
  ChevronRight, ChevronLeft, Loader, ArrowLeft, Phone, Mail,
  AlertCircle, MapPin
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LOAN_TYPES = [
  { value: 'home_loan',      label: 'Home Loan',           icon: '🏠', desc: 'Purchase or construct your dream home' },
  { value: 'personal_loan',  label: 'Personal Loan',       icon: '💼', desc: 'For any personal financial need' },
  { value: 'business_loan',  label: 'Business Loan',       icon: '🏢', desc: 'Grow or start your business' },
  { value: 'car_loan',       label: 'Car Loan',            icon: '🚗', desc: 'Buy your new or used vehicle' },
  { value: 'education_loan', label: 'Education Loan',      icon: '🎓', desc: 'Fund your education journey' },
  { value: 'lap',            label: 'Loan Against Property', icon: '🏦', desc: 'Use your property as collateral' },
];

const EMPLOYMENT_TYPES = [
  { value: 'salaried',      label: 'Salaried' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'business',      label: 'Business Owner' },
  { value: 'other',         label: 'Other' },
];

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Financial',     icon: DollarSign },
  { id: 3, label: 'Loan Details',  icon: FileText },
  { id: 4, label: 'Review',        icon: CheckCircle },
];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', mobile: '',
  dateOfBirth: '', gender: '', panNumber: '', aadharNumber: '',
  street: '', city: '', state: '', pincode: '',
  employmentType: '', monthlyIncome: '', existingEmi: '',
  creditScore: '', hasItr: false, itrAmount: '',
  loanType: '', appliedAmount: '', tenure: '', purpose: '',
  hasOwnProperty: false, propertyType: '', propertyValue: '',
  propertyAddress: '', ownerName: '',
  remarks: ''
};

// Single reducer batches form + errors into one state update = one render = no focus loss
function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined }
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return { form: INITIAL_FORM, errors: {} };
    default:
      return state;
  }
}

// ── Defined OUTSIDE component so it's never recreated on re-render ──────────
function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

export default function ApplyLoan() {
  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null);

  const [state, dispatch] = useReducer(reducer, { form: INITIAL_FORM, errors: {} });
  const { form, errors } = state;

  // set() is stable: always dispatches SET_FIELD, one re-render only
  const set = (field, value) => dispatch({ type: 'SET_FIELD', field, value });

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.firstName.trim())                            e.firstName    = 'First name is required';
      if (!form.lastName.trim())                             e.lastName     = 'Last name is required';
      if (!/^\d{10}$/.test(form.mobile))                    e.mobile       = 'Enter a valid 10-digit mobile number';
      if (form.email && !/\S+@\S+\.\S+/.test(form.email))  e.email        = 'Enter a valid email address';
      if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(form.panNumber))
                                                             e.panNumber    = 'Invalid PAN (e.g. ABCDE1234F)';
      if (form.aadharNumber && !/^\d{12}$/.test(form.aadharNumber))
                                                             e.aadharNumber = 'Aadhaar must be 12 digits';
      if (form.pincode && !/^\d{6}$/.test(form.pincode))    e.pincode      = 'Pincode must be 6 digits';
    }
    if (s === 2) {
      if (!form.employmentType)                              e.employmentType = 'Select employment type';
      if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0)
                                                             e.monthlyIncome  = 'Enter your monthly income';
      if (form.creditScore && (Number(form.creditScore) < 300 || Number(form.creditScore) > 900))
                                                             e.creditScore    = 'CIBIL score must be 300–900';
    }
    if (s === 3) {
      if (!form.loanType)                                    e.loanType      = 'Select a loan type';
      if (!form.appliedAmount || Number(form.appliedAmount) <= 0)
                                                             e.appliedAmount = 'Enter the loan amount';
      if (!form.tenure || Number(form.tenure) <= 0)         e.tenure        = 'Enter loan tenure in months';
    }
    dispatch({ type: 'SET_ERRORS', errors: e });
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => Math.min(4, s + 1)); };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validate(3)) { setStep(3); return; }
    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email || undefined, mobile: form.mobile,
        dateOfBirth: form.dateOfBirth || undefined, gender: form.gender || undefined,
        panNumber: form.panNumber?.toUpperCase() || undefined,
        aadharNumber: form.aadharNumber || undefined,
        address: {
          street: form.street || undefined, city: form.city || undefined,
          state: form.state || undefined, pincode: form.pincode || undefined
        },
        employmentType: form.employmentType,
        monthlyIncome: Number(form.monthlyIncome),
        existingEmi: form.existingEmi ? Number(form.existingEmi) : undefined,
        creditScore: form.creditScore ? Number(form.creditScore) : undefined,
        hasItr: form.hasItr,
        itrAmount: form.itrAmount ? Number(form.itrAmount) : undefined,
        loanType: form.loanType,
        appliedAmount: Number(form.appliedAmount),
        tenure: Number(form.tenure),
        purpose: form.purpose || undefined,
        hasOwnProperty: form.hasOwnProperty,
        propertyType: form.propertyType || undefined,
        propertyValue: form.propertyValue ? Number(form.propertyValue) : undefined,
        propertyAddress: form.propertyAddress || undefined,
        ownerName: form.ownerName || undefined,
        remarks: form.remarks || undefined
      };
      const { data } = await axios.post(`${API_BASE}/apply`, payload);
      setSubmitted(data.data);
    } catch (err) {
      dispatch({ type: 'SET_ERRORS', errors: { submit: err.response?.data?.message || 'Submission failed. Please try again.' } });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Thank you, <span className="font-semibold text-slate-800">{submitted.customerName}</span>!
            Our team will review your application and contact you shortly.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
            {[
              ['Application ID', submitted.applicationId, 'font-bold text-blue-700 font-mono'],
              ['Customer ID',    submitted.customerId,    'font-semibold text-slate-800'],
              ['Loan Type',      submitted.loanType?.replace('_', ' '), 'font-semibold text-slate-800 capitalize'],
              ['Amount Applied', formatCurrency(submitted.appliedAmount), 'font-bold text-slate-900'],
              ['Assigned Bank',  submitted.bank,          'font-semibold text-slate-800'],
            ].map(([k, v, cls]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className={cls}>{v}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
                {submitted.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Save your Application ID <span className="font-mono font-bold text-slate-600">{submitted.applicationId}</span> for future reference.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-secondary text-sm">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <button
              onClick={() => { setSubmitted(null); dispatch({ type: 'RESET' }); setStep(1); }}
              className="btn-primary text-sm"
            >
              Apply Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">DSA<span className="text-blue-400">CRM</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-sm text-white/70">
              <Phone size={14} />
              <span>+91 98765 43210</span>
              <span className="mx-1">|</span>
              <Mail size={14} />
              <span>apply@dsacrm.in</span>
            </div>
            {/* ── Back to Home button ── */}
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg transition-all">
              <ArrowLeft size={14} /> Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Apply for a Loan Online
          </h1>
          <p className="text-blue-200 text-base">
            Quick, simple and 100% online — get a response within 24 hours
          </p>
        </div>

        {/* Step Progress */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isCompleted = step > s.id;
              const isCurrent   = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => isCompleted && setStep(s.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                        ${isCurrent   ? 'bg-blue-500 text-white ring-4 ring-blue-400/30 cursor-default'
                        : isCompleted ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400'
                        : 'bg-white/20 text-white/50 cursor-default'}`}
                    >
                      {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block
                      ${isCurrent ? 'text-blue-300' : isCompleted ? 'text-emerald-400' : 'text-white/40'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded
                      ${step > s.id ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">

          {/* ── STEP 1: Personal Info ───────────────────────────────────── */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Personal Information
              </h2>
              <p className="text-slate-500 text-sm mb-6">Tell us about yourself</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstName} required>
                  <input
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    className="input-field" placeholder="e.g. Rahul"
                  />
                </Field>
                <Field label="Last Name" error={errors.lastName} required>
                  <input
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    className="input-field" placeholder="e.g. Sharma"
                  />
                </Field>
                <Field label="Mobile Number" error={errors.mobile} required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+91</span>
                    <input
                      value={form.mobile}
                      onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="input-field pl-10" placeholder="10-digit mobile" maxLength={10}
                    />
                  </div>
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="input-field" placeholder="you@example.com"
                  />
                </Field>
                <Field label="Date of Birth">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => set('dateOfBirth', e.target.value)}
                    className="input-field"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Field>
                <Field label="Gender">
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="PAN Number" error={errors.panNumber}>
                  <input
                    value={form.panNumber}
                    onChange={e => set('panNumber', e.target.value.toUpperCase())}
                    className="input-field font-mono tracking-widest"
                    placeholder="ABCDE1234F" maxLength={10}
                  />
                </Field>
                <Field label="Aadhaar Number" error={errors.aadharNumber}>
                  <input
                    value={form.aadharNumber}
                    onChange={e => set('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="input-field font-mono"
                    placeholder="12-digit Aadhaar" maxLength={12}
                  />
                </Field>
              </div>

              {/* Address */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" /> Address Details
                  <span className="text-slate-400 font-normal text-sm">(optional)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Street / Area" className="md:col-span-2">
                    <input
                      value={form.street}
                      onChange={e => set('street', e.target.value)}
                      className="input-field" placeholder="Building, street, area"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      className="input-field" placeholder="City"
                    />
                  </Field>
                  <Field label="State">
                    <select value={form.state} onChange={e => set('state', e.target.value)} className="input-field">
                      <option value="">Select state...</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Pincode" error={errors.pincode}>
                    <input
                      value={form.pincode}
                      onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field" placeholder="6-digit pincode" maxLength={6}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Financial Details ──────────────────────────────── */}
          {step === 2 && (
            <div className="fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600" /> Financial Details
              </h2>
              <p className="text-slate-500 text-sm mb-6">Help us assess your eligibility</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Employment Type" error={errors.employmentType} required>
                  <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>

                <Field label="Monthly Income (₹)" error={errors.monthlyIncome} required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input
                      type="text" inputMode="numeric"
                      value={form.monthlyIncome}
                      onChange={e => set('monthlyIncome', e.target.value)}
                      className="input-field pl-7" placeholder="e.g. 50000"
                    />
                  </div>
                </Field>

                <Field label="Existing EMI Outflow (₹)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input
                      type="text" inputMode="numeric"
                      value={form.existingEmi}
                      onChange={e => set('existingEmi', e.target.value)}
                      className="input-field pl-7" placeholder="Current EMIs per month"
                    />
                  </div>
                </Field>

                <Field label="CIBIL / Credit Score" error={errors.creditScore}>
                  <input
                    type="text" inputMode="numeric"
                    value={form.creditScore}
                    onChange={e => set('creditScore', e.target.value)}
                    className="input-field" placeholder="300 – 900 (optional)"
                  />
                  {form.creditScore && Number(form.creditScore) >= 300 && (
                    <div className={`mt-1.5 text-xs font-medium px-2 py-1 rounded-lg inline-block
                      ${Number(form.creditScore) >= 750 ? 'bg-emerald-50 text-emerald-700'
                      : Number(form.creditScore) >= 650 ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'}`}>
                      {Number(form.creditScore) >= 750 ? '✅ Excellent — highly eligible'
                       : Number(form.creditScore) >= 650 ? '⚠️ Good — most banks eligible'
                       : '❌ Low — fewer bank options'}
                    </div>
                  )}
                </Field>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ITR Filed?</label>
                  <div className="flex gap-3 mt-2">
                    {[true, false].map(v => (
                      <label key={String(v)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                          ${form.hasItr === v
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input type="radio" checked={form.hasItr === v} onChange={() => set('hasItr', v)} className="hidden" />
                        {v ? '✅ Yes' : '❌ No'}
                      </label>
                    ))}
                  </div>
                </div>

                {form.hasItr && (
                  <Field label="Annual ITR Amount (₹)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input
                        type="text" inputMode="numeric"
                        value={form.itrAmount}
                        onChange={e => set('itrAmount', e.target.value)}
                        className="input-field pl-7" placeholder="Annual declared income"
                      />
                    </div>
                  </Field>
                )}
              </div>

              {form.monthlyIncome && Number(form.monthlyIncome) > 0 && (
                <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-blue-800 mb-1">📊 Quick Eligibility Estimate</p>
                  <p className="text-sm text-blue-700">
                    Based on your income of <strong>{formatCurrency(Number(form.monthlyIncome))}/month</strong>,
                    you may be eligible for a loan up to{' '}
                    <strong>{formatCurrency(Number(form.monthlyIncome) * 60)}</strong>.
                    Final eligibility depends on credit score, existing obligations and bank policies.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Loan Details ──────────────────────────────────── */}
          {step === 3 && (
            <div className="fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" /> Loan Details
              </h2>
              <p className="text-slate-500 text-sm mb-6">Tell us what you're looking for</p>

              {/* Loan Type Cards */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loan Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LOAN_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('loanType', t.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all
                        ${form.loanType === t.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className={`text-sm font-semibold ${form.loanType === t.value ? 'text-blue-700' : 'text-slate-800'}`}>
                        {t.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">{t.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.loanType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.loanType}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Loan Amount Required (₹)" error={errors.appliedAmount} required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input
                      type="text" inputMode="numeric"
                      value={form.appliedAmount}
                      onChange={e => set('appliedAmount', e.target.value)}
                      className="input-field pl-7" placeholder="e.g. 2500000"
                    />
                  </div>
                  {form.appliedAmount && Number(form.appliedAmount) > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{formatCurrency(Number(form.appliedAmount))}</p>
                  )}
                </Field>

                <Field label="Preferred Tenure (months)" error={errors.tenure} required>
                  <input
                    type="text" inputMode="numeric"
                    value={form.tenure}
                    onChange={e => set('tenure', e.target.value)}
                    className="input-field" placeholder="e.g. 240 for 20 years"
                  />
                  {form.tenure && Number(form.tenure) > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {Number(form.tenure) >= 12
                        ? `${Math.floor(Number(form.tenure) / 12)} yr${Math.floor(Number(form.tenure) / 12) > 1 ? 's' : ''}${Number(form.tenure) % 12 ? ` ${Number(form.tenure) % 12} mo` : ''}`
                        : `${form.tenure} months`}
                    </p>
                  )}
                </Field>

                <Field label="Purpose of Loan" className="md:col-span-2">
                  <input
                    value={form.purpose}
                    onChange={e => set('purpose', e.target.value)}
                    className="input-field" placeholder="Brief description of why you need the loan..."
                  />
                </Field>
              </div>

              {/* Property — home loan / LAP only */}
              {(form.loanType === 'home_loan' || form.loanType === 'lap') && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Home size={16} className="text-blue-500" /> Property Details
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Do you own property?</label>
                    <div className="flex gap-3">
                      {[true, false].map(v => (
                        <label key={String(v)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                            ${form.hasOwnProperty === v
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <input type="radio" checked={form.hasOwnProperty === v} onChange={() => set('hasOwnProperty', v)} className="hidden" />
                          {v ? '✅ Yes' : '❌ No'}
                        </label>
                      ))}
                    </div>
                  </div>
                  {form.hasOwnProperty && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Property Type">
                        <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)} className="input-field">
                          <option value="">Select...</option>
                          {['flat','house','plot','commercial','agriculture'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Property Market Value (₹)">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                          <input
                            type="text" inputMode="numeric"
                            value={form.propertyValue}
                            onChange={e => set('propertyValue', e.target.value)}
                            className="input-field pl-7" placeholder="Approximate value"
                          />
                        </div>
                      </Field>
                      <Field label="Owner Name">
                        <input
                          value={form.ownerName}
                          onChange={e => set('ownerName', e.target.value)}
                          className="input-field" placeholder="Name on property documents"
                        />
                      </Field>
                      <Field label="Property Address" className="md:col-span-2">
                        <textarea
                          value={form.propertyAddress}
                          onChange={e => set('propertyAddress', e.target.value)}
                          className="input-field resize-none" rows={2} placeholder="Full property address..."
                        />
                      </Field>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Field label="Additional Remarks">
                  <textarea
                    value={form.remarks}
                    onChange={e => set('remarks', e.target.value)}
                    className="input-field resize-none" rows={2}
                    placeholder="Any additional information you'd like to share..."
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Submit ──────────────────────────────── */}
          {step === 4 && (
            <div className="fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-600" /> Review Your Application
              </h2>
              <p className="text-slate-500 text-sm mb-6">Please verify your details before submitting</p>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2"><User size={15} className="text-blue-500" />Personal</h4>
                    <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {[
                      ['Name',  `${form.firstName} ${form.lastName}`],
                      ['Mobile', `+91 ${form.mobile}`],
                      ['Email',  form.email || '—'],
                      ['PAN',    form.panNumber || '—'],
                      ['DOB',    form.dateOfBirth || '—'],
                      ['City',   form.city || '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-slate-400 text-xs">{k}</div>
                        <div className="font-medium text-slate-800">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2"><DollarSign size={15} className="text-blue-500" />Financial</h4>
                    <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {[
                      ['Employment',    form.employmentType?.replace('_', ' ') || '—'],
                      ['Monthly Income', form.monthlyIncome ? formatCurrency(Number(form.monthlyIncome)) : '—'],
                      ['Existing EMI',  form.existingEmi ? formatCurrency(Number(form.existingEmi)) : '—'],
                      ['CIBIL Score',   form.creditScore || '—'],
                      ['ITR Filed',     form.hasItr ? 'Yes' : 'No'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-slate-400 text-xs">{k}</div>
                        <div className="font-medium text-slate-800 capitalize">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2"><FileText size={15} className="text-blue-500" />Loan Details</h4>
                    <button onClick={() => setStep(3)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {[
                      ['Type',    LOAN_TYPES.find(t => t.value === form.loanType)?.label || '—'],
                      ['Amount',  form.appliedAmount ? formatCurrency(Number(form.appliedAmount)) : '—'],
                      ['Tenure',  form.tenure ? `${form.tenure} months` : '—'],
                      ['Purpose', form.purpose || '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-blue-400 text-xs">{k}</div>
                        <div className="font-semibold text-blue-900">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-sm text-amber-800">
                  <p className="font-semibold mb-1">📋 Consent & Declaration</p>
                  <p>
                    By submitting this application, I confirm that all information provided is accurate and complete.
                    I authorize DSA CRM to verify my details with credit bureaus and partner banks, and to contact me
                    regarding my loan application.
                  </p>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    {errors.submit}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button onClick={prev} disabled={step === 1} className="btn-secondary disabled:opacity-40">
                <ChevronLeft size={16} /> Previous
              </button>
              {/* Back to Home — visible on all steps */}
              <Link to="/" className="btn-secondary text-slate-500">
                <ArrowLeft size={16} /> Home
              </Link>
            </div>
            <span className="text-sm text-slate-400 hidden sm:block">Step {step} of {STEPS.length}</span>
            {step < 4 ? (
              <button onClick={next} className="btn-primary">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 px-8">
                {submitting
                  ? <><Loader size={16} className="animate-spin" /> Submitting...</>
                  : <><CheckCircle size={16} /> Submit Application</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6 pb-8">
          Your data is encrypted and secured. We never share your information without consent.
        </p>
      </div>
    </div>
  );
}
