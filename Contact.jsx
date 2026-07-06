import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', mobile: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    { icon: Phone, title: 'Phone', value: '+91 98765 43210', sub: 'Mon–Sat, 9 AM – 6 PM', color: 'bg-blue-100 text-blue-600' },
    { icon: Mail, title: 'Email', value: 'support@dsacrm.com', sub: 'We reply within 4 hours', color: 'bg-violet-100 text-violet-600' },
    { icon: MapPin, title: 'Office', value: 'Bandra Kurla Complex', sub: 'Mumbai, Maharashtra 400051', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Clock, title: 'Business Hours', value: 'Mon – Saturday', sub: '9:00 AM – 6:00 PM IST', color: 'bg-amber-100 text-amber-600' },
  ];

  const faqs = [
    { q: 'How long does onboarding take?', a: 'Most DSAs are fully setup and processing files within 2 hours. We provide a guided onboarding session.' },
    { q: 'Can I import my existing data?', a: 'Yes! We support CSV import for customers and loan files. Our team helps with migration at no extra cost.' },
    { q: 'Is there a free trial?', a: 'Yes, 14 days full access to Professional features. No credit card required.' },
    { q: 'Do you support multiple branches?', a: 'Absolutely. You can manage multiple branches under one account with separate reporting.' },
  ];

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
              <Link key={to} to={to} className={`text-sm font-medium transition-colors ${to === '/contact' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>{label}</Link>
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
          <h1 className="text-5xl font-extrabold mb-4">Get in <span className="text-blue-400">Touch</span></h1>
          <p className="text-slate-300 text-lg">We're here to help. Whether you have a question, need a demo, or want to discuss enterprise pricing — reach out!</p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {contactInfo.map(({ icon: Icon, title, value, sub, color }) => (
              <div key={title} className="text-center p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="font-semibold text-slate-900 mb-1">{title}</div>
                <div className="text-slate-700 text-sm font-medium">{value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Form + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-500 mb-6">We'll get back to you within one business day.</p>

              {submitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                  <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                  <div>
                    <div className="font-semibold text-emerald-800">Message sent!</div>
                    <div className="text-emerald-600 text-sm">We'll respond within 4 hours.</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input-field" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="label">Mobile</label>
                    <input type="tel" className="input-field" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10-digit number" />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input type="email" className="input-field" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="label">Subject *</label>
                  <select className="input-field" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                    <option value="">Select a topic...</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Enquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="enterprise">Enterprise / Custom</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea className="input-field resize-none" rows={5} required value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-3 text-base">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-500 mb-6">Quick answers to common questions.</p>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-3">
                      <MessageCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">{q}</div>
                        <div className="text-slate-500 text-sm">{a}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                <div className="font-semibold text-blue-900 mb-1">Still have questions?</div>
                <p className="text-blue-700 text-sm mb-3">Our team is available Mon–Sat, 9 AM – 6 PM via phone or live chat.</p>
                <a href="tel:+919876543210" className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Phone size={14} /> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        © 2024 DSA CRM. &nbsp;
        <Link to="/" className="hover:text-white">Home</Link> · <Link to="/about" className="hover:text-white">About</Link> · <Link to="/services" className="hover:text-white">Services</Link> · <Link to="/contact" className="hover:text-white">Contact</Link>
      </footer>
    </div>
  );
}
