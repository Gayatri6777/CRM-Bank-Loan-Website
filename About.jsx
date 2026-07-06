import { Link } from 'react-router-dom';
import { TrendingUp, Target, Heart, Zap, ArrowRight, Users, Building2, Award } from 'lucide-react';

const team = [
  { name: 'Vikram Sharma', role: 'Founder & CEO', bio: '15 years in fintech, former HDFC Bank regional head.', initials: 'VS', color: 'bg-blue-600' },
  { name: 'Neha Gupta', role: 'CTO', bio: 'Built scalable platforms for 3 major Indian banks.', initials: 'NG', color: 'bg-violet-600' },
  { name: 'Ravi Joshi', role: 'Head of Product', bio: 'DSA himself for 8 years before joining us.', initials: 'RJ', color: 'bg-emerald-600' },
  { name: 'Anita Patel', role: 'Head of Customer Success', bio: 'Helps DSAs get the most from the platform.', initials: 'AP', color: 'bg-pink-600' },
];

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'We exist to make every DSA more efficient, profitable and organized.', color: 'bg-blue-100 text-blue-600' },
  { icon: Heart, title: 'DSA-First', desc: 'Every feature is built based on real feedback from active DSAs.', color: 'bg-red-100 text-red-600' },
  { icon: Zap, title: 'Speed & Simplicity', desc: 'No bloated features. Just fast, intuitive tools that save time.', color: 'bg-amber-100 text-amber-600' },
  { icon: Award, title: 'Excellence', desc: 'We hold ourselves to the highest standard in reliability and support.', color: 'bg-emerald-100 text-emerald-600' },
];

export default function About() {
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
              <Link key={to} to={to} className={`text-sm font-medium transition-colors ${to === '/about' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>{label}</Link>
            ))}
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 font-medium px-3 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2">Get Started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-6">Built for DSAs, <span className="text-blue-400">by People Who Get It</span></h1>
          <p className="text-slate-300 text-lg leading-relaxed">We started DSA CRM after watching loan agents struggle with spreadsheets, missed follow-ups and manual commission calculations. We built the software we wish existed.</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>In 2020, our founder Vikram was helping his cousin manage a small DSA operation in Pune. He watched him juggle three WhatsApp groups, two spreadsheets, and a notebook just to track 50 active loan files.</p>
                <p>After a client's disbursement was delayed because a document was missed, Vikram decided enough was enough. He partnered with Neha (a banking tech architect) and Ravi (an ex-DSA himself) to build what became DSA CRM.</p>
                <p>Today we serve 500+ DSA firms across Maharashtra, Gujarat, Karnataka and beyond — managing over ₹200 crore in loan files every month.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Team Members', value: '28', color: 'bg-blue-50 text-blue-600' },
                { icon: Building2, label: 'Cities Covered', value: '42', color: 'bg-violet-50 text-violet-600' },
                { icon: TrendingUp, label: 'Loans Managed', value: '15K+', color: 'bg-emerald-50 text-emerald-600' },
                { icon: Award, label: 'Years Experience', value: '4+', color: 'bg-amber-50 text-amber-600' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`${color} rounded-2xl p-6 text-center`}>
                  <Icon size={28} className="mx-auto mb-3" />
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-sm font-medium mt-1 opacity-80">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Core Values</h2>
            <p className="text-slate-500">What drives every decision we make</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Meet the Team</h2>
            <p className="text-slate-500">Passionate people building for DSAs every day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, bio, initials, color }) => (
              <div key={name} className="text-center p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}>{initials}</div>
                <div className="font-semibold text-slate-900">{name}</div>
                <div className="text-blue-600 text-sm font-medium mb-2">{role}</div>
                <p className="text-slate-500 text-xs">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Join the DSA CRM Family</h2>
        <p className="text-blue-100 mb-8">Start your free account and see why 500+ DSAs trust us with their business.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors">
          Get Started Free <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        © 2024 DSA CRM. All rights reserved. &nbsp;
        <Link to="/" className="hover:text-white">Home</Link> · <Link to="/about" className="hover:text-white">About</Link> · <Link to="/contact" className="hover:text-white">Contact</Link>
      </footer>
    </div>
  );
}
