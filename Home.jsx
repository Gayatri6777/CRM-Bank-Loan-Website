import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, ArrowRight, CheckCircle, Users, FileText, Building2,
  Shield, BarChart3, Clock, Star, Phone, Mail, MapPin, ChevronRight
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Customer Management', desc: 'Manage complete customer profiles with KYC, financial details and credit scores in one place.', color: 'bg-blue-500' },
  { icon: Building2, title: 'Bank & Product Catalog', desc: 'Configure multiple banks with loan products, interest rates, and commission structures.', color: 'bg-violet-500' },
  { icon: FileText, title: 'Loan File Tracking', desc: 'Track every loan file from draft to disbursement with a validated 8-stage status flow.', color: 'bg-emerald-500' },
  { icon: Shield, title: 'Document Verification', desc: 'Upload, manage and verify all customer documents with role-based access control.', color: 'bg-amber-500' },
  { icon: TrendingUp, title: 'Auto Commission', desc: 'Commissions are automatically generated when a loan is disbursed — no manual calculations.', color: 'bg-pink-500' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Real-time dashboards and custom reports for loan performance, bank productivity and earnings.', color: 'bg-cyan-500' },
];

const stats = [
  { value: '500+', label: 'DSAs Onboarded' },
  { value: '₹200Cr+', label: 'Loans Managed' },
  { value: '15,000+', label: 'Files Processed' },
  { value: '99.9%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Rajesh Mehta', role: 'DSA Owner, Mumbai', text: 'This CRM transformed how we manage loan files. Commission tracking alone saves us 10+ hours a week.', rating: 5 },
  { name: 'Priya Nair', role: 'Marketing Executive, Pune', text: 'The status flow is brilliant. I always know exactly where each file is and what to do next.', rating: 5 },
  { name: 'Sunil Agarwal', role: 'Admin, Nashik DSA', text: 'Setup took under an hour and the team was processing files same day. Highly recommended!', rating: 5 },
];

const loanTypes = [
  { name: 'Home Loan', rate: '8.5%', icon: '🏠' },
  { name: 'Personal Loan', rate: '12%', icon: '💼' },
  { name: 'Business Loan', rate: '14%', icon: '🏢' },
  { name: 'Car Loan', rate: '9.5%', icon: '🚗' },
  { name: 'Education Loan', rate: '10.5%', icon: '🎓' },
  { name: 'LAP', rate: '11%', icon: '🏦' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg">DSA</span>
                <span className="font-bold text-blue-600 text-lg">CRM</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">About</Link>
              <Link to="/services" className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">Services</Link>
              <Link to="/contact" className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
              <Link to="/apply" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">Apply for Loan</Link>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-sm py-2">
                  Dashboard <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 font-medium px-3 py-2">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm py-2">
                    Get Started <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Trusted by 500+ DSAs across India
              </div>
              <h1 className="text-5xl font-extrabold leading-tight mb-6">
                Manage Every Loan File
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Smarter & Faster</span>
              </h1>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                The complete CRM built exclusively for DSAs. Track customers, manage banks, process loan files, verify documents and auto-calculate commissions — all in one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/50">
                  Start Free Today <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all">
                  Sign In to Account
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-sm text-slate-400">
                {['No credit card required', 'Setup in minutes', 'Free support'].map(t => (
                  <div key={t} className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" />{t}</div>
                ))}
              </div>
            </div>
            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-400 text-xs ml-2">Dashboard Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Active Files', value: '248', color: 'text-blue-400' },
                    { label: 'Disbursed', value: '₹4.2Cr', color: 'text-emerald-400' },
                    { label: 'This Month', value: '32', color: 'text-violet-400' },
                    { label: 'Commission', value: '₹1.8L', color: 'text-amber-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className={`text-xl font-bold ${color}`}>{value}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { file: 'LF2024000142', name: 'Suresh Mehta', status: 'Sanctioned', color: 'bg-emerald-500/20 text-emerald-300' },
                    { file: 'LF2024000141', name: 'Kavita Joshi', status: 'Under Review', color: 'bg-amber-500/20 text-amber-300' },
                    { file: 'LF2024000140', name: 'Arun Desai', status: 'Disbursed', color: 'bg-blue-500/20 text-blue-300' },
                  ].map(row => (
                    <div key={row.file} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                      <span className="text-slate-300 text-xs font-mono">{row.file}</span>
                      <span className="text-slate-300 text-xs">{row.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold">{value}</div>
                <div className="text-blue-200 mt-1 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need to Run Your DSA</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">From the first customer enquiry to commission payout — every step managed in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all group">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Supports All Loan Types</h2>
            <p className="text-slate-500">Configure any product from any bank with custom rates and commissions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loanTypes.map(({ name, rate, icon }) => (
              <Link key={name} to="/apply" className="text-center p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md hover:scale-105 transition-all cursor-pointer group">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-semibold text-slate-900 text-sm">{name}</div>
                <div className="text-blue-600 font-bold text-xs mt-1">from {rate}</div>
                <div className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Apply Now →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Apply CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/30">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Apply Online in Minutes
          </div>
          <h2 className="text-4xl font-extrabold mb-4">
            Need a Loan? Apply Now.
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Fill out our simple online form — no branch visit required. Our team will contact you within 24 hours with the best loan options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/30 text-lg">
              Apply for a Loan <ArrowRight size={20} />
            </Link>
            <a href="tel:+919876543210" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 transition-all text-lg">
              📞 Call Us Now
            </a>
          </div>
          <div className="flex flex-wrap gap-6 mt-8 justify-center text-sm text-blue-100">
            {['100% Online Process', 'No Hidden Charges', 'Quick Approval', 'Secure & Confidential'].map(t => (
              <div key={t} className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-300" />{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Get a loan file from lead to disbursement in 6 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Add Customer', desc: 'Register customer with KYC details' },
              { step: '02', title: 'Create File', desc: 'Select bank, product & loan amount' },
              { step: '03', title: 'Upload Docs', desc: 'Upload all required documents' },
              { step: '04', title: 'Bank Review', desc: 'Bank executive reviews application' },
              { step: '05', title: 'Sanction', desc: 'Loan gets sanctioned by bank' },
              { step: '06', title: 'Disbursement', desc: 'Commission auto-generated!' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">{step}</div>
                {i < 5 && <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-0.5 bg-blue-800" />}
                <div className="font-semibold text-white mb-1">{title}</div>
                <div className="text-slate-400 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by DSAs Across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: rating }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{name}</div>
                  <div className="text-slate-400 text-xs">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your DSA Operations?</h2>
          <p className="text-blue-100 text-lg mb-8">Join hundreds of DSAs already using our platform. Setup in minutes, see results instantly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/30 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><TrendingUp size={16} /></div>
                <span className="font-bold text-lg">DSA CRM</span>
              </div>
              <p className="text-slate-400 text-sm">The complete loan management platform for Direct Selling Agents.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-slate-200">Product</h4>
              {['Features', 'Pricing', 'Security', 'Updates'].map(l => <Link key={l} to="#" className="block text-slate-400 hover:text-white text-sm py-1">{l}</Link>)}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-slate-200">Company</h4>
              {['About Us', 'Blog', 'Careers', 'Press'].map(l => <Link key={l} to="/about" className="block text-slate-400 hover:text-white text-sm py-1">{l}</Link>)}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-slate-200">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2"><Mail size={13} /> support@dsacrm.com</div>
                <div className="flex items-center gap-2"><Phone size={13} /> +91 98765 43210</div>
                <div className="flex items-center gap-2"><MapPin size={13} /> Mumbai, Maharashtra</div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-sm">
            © 2024 DSA CRM. All rights reserved. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
