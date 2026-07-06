import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, CheckCircle, Users, FileText, Building2, Shield, BarChart3, DollarSign, Headphones, RefreshCw, Lock } from 'lucide-react';

const plans = [
  {
    name: 'Starter', price: '₹999', period: '/month', color: 'border-slate-200',
    desc: 'Perfect for solo DSAs or small teams just getting started.',
    features: ['Up to 5 users', '100 loan files/month', '3 bank configurations', 'Basic reports', 'Email support'],
    cta: 'Start Free Trial', highlight: false
  },
  {
    name: 'Professional', price: '₹2,499', period: '/month', color: 'border-blue-600',
    desc: 'The most popular plan for growing DSA firms.',
    features: ['Up to 20 users', 'Unlimited loan files', 'Unlimited banks', 'Advanced reports & charts', 'Priority support', 'Commission tracking', 'Document verification', 'Audit logs'],
    cta: 'Get Started', highlight: true
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', color: 'border-slate-200',
    desc: 'For large DSA networks with custom requirements.',
    features: ['Unlimited users', 'White-label option', 'Custom integrations', 'Dedicated account manager', '24/7 phone support', 'API access', 'Custom reports', 'SLA guarantee'],
    cta: 'Contact Sales', highlight: false
  },
];

const services = [
  { icon: Users, title: 'Customer & KYC Management', desc: 'Centralised customer profiles with PAN, Aadhaar, employment details, credit score tracking and full contact history.', color: 'bg-blue-500' },
  { icon: Building2, title: 'Multi-Bank Integration', desc: 'Configure unlimited banks with their own loan products, eligibility criteria, interest rates and commission structures.', color: 'bg-violet-500' },
  { icon: FileText, title: 'Loan File Lifecycle', desc: 'Manage every loan from Draft to Disbursement with stage-validated status transitions and a full change history.', color: 'bg-emerald-500' },
  { icon: Shield, title: 'Document Management', desc: 'Upload, categorise and verify all loan documents. Track pending vs verified docs per file. Reject with remarks.', color: 'bg-amber-500' },
  { icon: DollarSign, title: 'Commission Automation', desc: 'Commission records are auto-created on disbursement with configurable rates, GST deduction and payment tracking.', color: 'bg-pink-500' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Real-time dashboards, monthly trend charts, bank performance tables, and custom date-range reports.', color: 'bg-cyan-500' },
  { icon: Headphones, title: 'Role-Based Access', desc: 'Admin, Data Operator, Marketing Executive and Bank Executive roles — each with precise permissions.', color: 'bg-orange-500' },
  { icon: Lock, title: 'Enterprise Security', desc: 'JWT authentication, bcrypt password hashing, audit logging of all actions, and HTTPS encryption.', color: 'bg-slate-600' },
  { icon: RefreshCw, title: 'Audit Trail', desc: 'Every create, update and delete is logged with user, timestamp, IP address and action details for compliance.', color: 'bg-teal-500' },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><TrendingUp size={18} className="text-white" /></div>
            <span className="font-bold text-slate-900 text-lg">DSA<span className="text-blue-600">CRM</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} className={`text-sm font-medium transition-colors ${to === '/services' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>{label}</Link>
            ))}
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 font-medium px-3 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2">Get Started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4">Our <span className="text-blue-400">Services</span></h1>
          <p className="text-slate-300 text-lg">Everything your DSA needs to scale from 10 files a month to 1,000.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Complete Feature Set</h2>
            <p className="text-slate-500">All the tools built into one subscription — no add-ons, no surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-slate-500">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(({ name, price, period, color, desc, features, cta, highlight }) => (
              <div key={name} className={`bg-white rounded-2xl border-2 ${color} p-7 relative ${highlight ? 'shadow-xl scale-105' : 'shadow-sm'}`}>
                {highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">Most Popular</div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{price}</span>
                    <span className="text-slate-400 mb-1">{period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to={name === 'Enterprise' ? '/contact' : '/register'}
                  className={`block text-center font-semibold py-3 rounded-xl transition-colors ${highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Start Your 14-Day Free Trial</h2>
        <p className="text-blue-100 mb-8">No credit card required. Full access to all Professional features.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        © 2024 DSA CRM. &nbsp;
        <Link to="/" className="hover:text-white">Home</Link> · <Link to="/about" className="hover:text-white">About</Link> · <Link to="/services" className="hover:text-white">Services</Link> · <Link to="/contact" className="hover:text-white">Contact</Link>
      </footer>
    </div>
  );
}
