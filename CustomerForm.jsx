import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Loader } from 'lucide-react';

const initialForm = {
  firstName: '', lastName: '', email: '', mobile: '', alternateMobile: '',
  dateOfBirth: '', gender: '', pan: '', aadhaar: '',
  'address.line1': '', 'address.line2': '', 'address.city': '', 'address.state': '', 'address.pincode': '',
  employmentType: '', monthlyIncome: '', company: '', creditScore: ''
};

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/customers/${id}`).then(({ data }) => {
        const c = data.data;
        setForm({
          firstName: c.firstName || '', lastName: c.lastName || '',
          email: c.email || '', mobile: c.mobile || '', alternateMobile: c.alternateMobile || '',
          dateOfBirth: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
          gender: c.gender || '', pan: c.pan || '', aadhaar: c.aadhaar || '',
          'address.line1': c.address?.line1 || '', 'address.line2': c.address?.line2 || '',
          'address.city': c.address?.city || '', 'address.state': c.address?.state || '',
          'address.pincode': c.address?.pincode || '',
          employmentType: c.employmentType || '', monthlyIncome: c.monthlyIncome || '',
          company: c.company || '', creditScore: c.creditScore || ''
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(form.mobile)) return toast.error('Mobile must be 10 digits');
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        mobile: form.mobile, alternateMobile: form.alternateMobile,
        dateOfBirth: form.dateOfBirth, gender: form.gender, pan: form.pan, aadhaar: form.aadhaar,
        address: {
          line1: form['address.line1'], line2: form['address.line2'],
          city: form['address.city'], state: form['address.state'], pincode: form['address.pincode']
        },
        employmentType: form.employmentType, monthlyIncome: Number(form.monthlyIncome),
        company: form.company, creditScore: Number(form.creditScore)
      };
      if (isEdit) await api.put(`/customers/${id}`, payload);
      else await api.post('/customers', payload);
      toast.success(`Customer ${isEdit ? 'updated' : 'created'} successfully`);
      navigate('/customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  const Section = ({ title, children }) => (
    <div className="card mb-6">
      <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );

  const Field = ({ label, name, type = 'text', options, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {options ? (
        <select name={name} value={form[name]} onChange={handleChange} className="input-field">
          <option value="">Select...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange}
          className="input-field" required={required} />
      )}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/customers')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-1">
            <ArrowLeft size={14} /> Back to Customers
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Section title="Personal Information">
          <Field label="First Name" name="firstName" required />
          <Field label="Last Name" name="lastName" required />
          <Field label="Mobile" name="mobile" type="tel" required />
          <Field label="Alternate Mobile" name="alternateMobile" type="tel" />
          <Field label="Email" name="email" type="email" />
          <Field label="Date of Birth" name="dateOfBirth" type="date" />
          <Field label="Gender" name="gender" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
          <Field label="PAN Number" name="pan" />
          <Field label="Aadhaar Number" name="aadhaar" />
        </Section>

        <Section title="Address">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="label">Address Line 1</label>
            <input name="address.line1" value={form['address.line1']} onChange={handleChange} className="input-field" />
          </div>
          <Field label="Address Line 2" name="address.line2" />
          <Field label="City" name="address.city" />
          <Field label="State" name="address.state" />
          <Field label="Pincode" name="address.pincode" />
        </Section>

        <Section title="Financial Information">
          <Field label="Employment Type" name="employmentType" options={[
            { value: 'salaried', label: 'Salaried' }, { value: 'self_employed', label: 'Self Employed' },
            { value: 'business', label: 'Business' }, { value: 'unemployed', label: 'Unemployed' }
          ]} />
          <Field label="Monthly Income (₹)" name="monthlyIncome" type="number" />
          <Field label="Company/Business Name" name="company" />
          <Field label="Credit Score (300–900)" name="creditScore" type="number" />
        </Section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/customers')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
