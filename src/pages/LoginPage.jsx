import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Star, 
  Truck, 
  Plane, 
  Train, 
  Boxes, 
  MapPin, 
  Calendar, 
  Weight, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_DEMOS = [
  {
    company: 'Apex Global Logistics (Tenant 1)',
    code: 'APEX',
    users: [
      { name: 'Alex Chen', role: 'Operations Analyst', email: 'analyst@apex.com', desc: 'Inspects disruptions, drafts recovery plans' },
      { name: 'Sarah Jenkins', role: 'Supply Chain Manager', email: 'manager@apex.com', desc: 'Approves stock transfers, triggers simulations' },
      { name: 'Marco Rossi', role: 'Warehouse Operator', email: 'warehouse@apex.com', desc: 'Floor reporting & stock damage reconciliations' },
      { name: 'Elena Rostova', role: 'Procurement Approver', email: 'procurement@apex.com', desc: 'Authorizes alternative supplier contracts' },
      { name: 'David Vance', role: 'Administrator', email: 'admin@apex.com', desc: 'Full tenant governance & demo reset' },
    ],
  },
  {
    company: 'Horizon Freight Corp (Tenant 2 — Isolated)',
    code: 'HORIZON',
    users: [
      { name: 'Liam Murphy', role: 'Operations Analyst', email: 'analyst@horizon.com', desc: 'Tenant isolation: 0 access to Apex records' },
    ],
  },
];

export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('analyst@apex.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user, data.company);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const data = await api.login(demoEmail, 'password123');
      onLoginSuccess(data.user, data.company);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col justify-between selection:bg-lime selection:text-obsidian-950">
      {/* Top Navbar from Image 1 */}
      <header className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-lime text-obsidian-950 flex items-center justify-center font-black">
            <Compass className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">
            disruption<span className="text-lime">.iq</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-400">
          <span className="hover:text-white cursor-pointer transition">Pricing</span>
          <span className="hover:text-white cursor-pointer transition">Services</span>
          <span className="hover:text-white cursor-pointer transition">Tools</span>
          <span className="hover:text-white cursor-pointer transition">Company</span>
        </nav>

        <button 
          onClick={() => handleQuickSelect('analyst@apex.com')}
          className="px-5 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black transition shadow-[0_0_20px_rgba(220,248,54,0.3)]"
        >
          Join Demo
        </button>
      </header>

      {/* Main Split Hero Layout (Matching Image 1 & 2) */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero (Directly inspired by Image 1) */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Minimize costs.<br />
            <span className="text-lime">Recover shipments.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Simplifying global logistics with automated disruption detection, deterministic deadline auctions, and recovery firewall protection.
          </p>

          {/* Rating Pill from Image 1 */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-slate-300 font-medium">
              <strong className="text-white font-bold">4.95</strong> based on 146,824 recovery plans
            </span>
          </div>

          {/* Interactive Route Pill Bar from Image 1 */}
          <div className="p-3 rounded-3xl bg-obsidian-900 border border-white/[0.08] shadow-2xl space-y-3 max-w-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-obsidian-850 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-lime" />
                <span className="text-slate-300 font-mono">Basel</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-obsidian-850 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-300 font-mono">Zurich</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-obsidian-850 flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-300 font-mono">Oct 30, 2026</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-obsidian-850 flex items-center space-x-2">
                <Weight className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-mono">500 Units</span>
              </div>
            </div>

            {/* Transport mode counts from Image 1 */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/[0.04] text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5 font-mono">
                <Truck className="w-3.5 h-3.5 text-lime" />
                <span>31,081</span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono">
                <Boxes className="w-3.5 h-3.5 text-blue-400" />
                <span>215,076</span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono">
                <Train className="w-3.5 h-3.5 text-amber-400" />
                <span>5,053</span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono">
                <Plane className="w-3.5 h-3.5 text-emerald-400" />
                <span>1,875</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card & 1-Click Demo Launcher */}
        <div className="lg:col-span-5">
          <div className="card-dark p-7 shadow-2xl border border-white/[0.08] space-y-5">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Console Login</h2>
              <p className="text-xs text-slate-400 mt-0.5">Multi-tenant B2B access with role-based governance.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Company Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime transition font-mono"
                  placeholder="analyst@apex.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_20px_rgba(220,248,54,0.3)] transition flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading && <span className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></span>}
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* 1-Click Judge Role Quick Launcher */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-lime uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>1-Click Hackathon Evaluator</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">pwd: password123</span>
              </div>

              <div className="space-y-2">
                {QUICK_DEMOS.map((tenant) => (
                  <div key={tenant.code} className="p-2.5 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-lime" />
                        <span>{tenant.company}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {tenant.users.map((u) => (
                        <button
                          key={u.email}
                          type="button"
                          onClick={() => handleQuickSelect(u.email)}
                          className="text-left p-2 rounded-xl bg-obsidian-850 hover:bg-lime hover:text-obsidian-950 text-xs transition group border border-white/[0.04]"
                        >
                          <div className="font-bold text-white group-hover:text-obsidian-950 text-[11px] truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-lime group-hover:text-obsidian-900 font-medium truncate">
                            {u.role}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Corridor Strip from Image 1 */}
      <footer className="border-t border-white/[0.06] py-4 px-8 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
          <span>Shanghai (CN) → London (UK)</span>
          <span>Rotterdam (NL) → Frankfurt (DE)</span>
          <span>Basel (CH) → Zurich (CH)</span>
        </div>
        <p className="text-[11px]">
          DisruptionIQ Supply Chain SaaS • Multi-Tenant Isolated
        </p>
      </footer>
    </div>
  );
}
