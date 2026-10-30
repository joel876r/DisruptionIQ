import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Boxes, 
  Truck, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Plane,
  ChevronRight,
  Sparkles,
  Zap,
  Phone,
  MessageSquare,
  Navigation,
  Gavel,
  Compass,
  Star,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';
import { DeadlineAuctionModal } from '../components/DeadlineAuctionModal';

export function DashboardPage({ currentUser }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [showAuctionModal, setShowAuctionModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sum, dis] = await Promise.all([
          api.getDashboardSummary(),
          api.getDisruptions(),
        ]);
        setSummary(sum);
        setDisruptions(dis);
      } catch (err) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header & Asymmetric Stat Cards (Matching Image 2 & 3) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30">
              Active Tenant: {currentUser?.company_code || 'APX'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Logistics Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Alex'}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            All your orders, transit disruptions, and coordinated recovery simulations in one central command deck.
          </p>
        </div>

        {/* Asymmetric Floating Stat Cards (Inspired by Image 2 top-right cards) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 shrink-0">
          {/* White Card: Orders at Risk / Financial Exposure in INR */}
          <div 
            onClick={() => navigate('/orders')}
            className="flex-1 sm:w-60 h-24 rounded-3xl bg-white text-obsidian-950 p-4 flex flex-col justify-between cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider font-mono">
                Exposure at Risk
              </span>
              <div className="w-7 h-7 rounded-full bg-obsidian-950 text-white flex items-center justify-center group-hover:rotate-45 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono tracking-tight">
                ₹{(summary?.financial_exposure || 45600).toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] font-bold text-rose-600 font-mono">
                {summary?.orders_at_risk_count || 4} Critical
              </span>
            </div>
          </div>

          {/* Solid Electric Lime Card: Protected Revenue in INR */}
          <div 
            onClick={() => navigate('/recovery')}
            className="flex-1 sm:w-60 h-24 rounded-3xl bg-lime text-obsidian-950 p-4 flex flex-col justify-between cursor-pointer hover:shadow-[0_0_35px_rgba(220,248,54,0.4)] transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-obsidian-950 uppercase tracking-wider font-mono">
                Protected Value
              </span>
              <div className="w-7 h-7 rounded-full bg-obsidian-950 text-lime flex items-center justify-center group-hover:rotate-45 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono tracking-tight">
                ₹3,56,200
              </span>
              <span className="text-[11px] font-black text-obsidian-900 font-mono">
                +94% SLA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Deliveries Donut Gauge, Weekly Disruption Flux, Fleet/Drone Mode, Capacity Buffer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Deliveries Semicircle Donut Gauge (Matching Image 2) */}
        <div className="card-dark p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Delivery SLAs</span>
            <div className="w-6 h-6 rounded-full bg-obsidian-850 flex items-center justify-center text-slate-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Semicircle Gauge Visual */}
          <div className="my-4 flex items-center justify-center relative">
            <svg viewBox="0 0 100 55" className="w-40 h-24">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1f2029"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 75 22"
                fill="none"
                stroke="#dcf836"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-1 px-3 py-1 rounded-full bg-lime text-obsidian-950 font-black text-xs font-mono shadow-md">
              342 Units
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-3 border-t border-white/[0.04] font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-lime"></span>
              <span>On Time: 88%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Delayed: 2</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>In Transit: 4</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Rerouted: 1</span>
            </div>
          </div>
        </div>

        {/* Weekly Shipments Bar Chart (Matching Image 2) */}
        <div className="card-dark p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Weekly Disruption Flux</span>
            <span className="px-2.5 py-0.5 rounded-full bg-lime text-obsidian-950 text-[10px] font-black font-mono">
              112 Week 4
            </span>
          </div>

          {/* Bar Chart Visual with Electric Lime */}
          <div className="h-28 flex items-end justify-between px-2 gap-3 my-3">
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-lime/30 rounded-t-xl" style={{ height: '45%' }}></div>
              <span className="text-[10px] font-mono text-slate-500">W1 (54)</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-lime/60 rounded-t-xl" style={{ height: '65%' }}></div>
              <span className="text-[10px] font-mono text-slate-500">W2 (73)</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-lime/80 rounded-t-xl" style={{ height: '78%' }}></div>
              <span className="text-[10px] font-mono text-slate-500">W3 (89)</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-lime rounded-t-xl shadow-[0_0_18px_rgba(220,248,54,0.4)]" style={{ height: '100%' }}></div>
              <span className="text-[10px] font-mono text-lime font-bold">W4 (112)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <span>Automated Recovery</span>
            <span className="text-lime font-bold font-mono">+18% Efficiency</span>
          </div>
        </div>

        {/* Transit Fleet & Falcon Drone Card (Matching Image 2) */}
        <div className="card-dark p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Express Fleet</span>
            <span className="px-2.5 py-0.5 rounded-full bg-lime text-obsidian-950 text-[10px] font-black font-mono">
              28 Units
            </span>
          </div>

          {/* Transport mode vehicle card */}
          <div className="p-3.5 my-3 rounded-2xl bg-obsidian-900 border border-white/[0.06] flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/[0.08] shrink-0 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=150&q=80" 
                alt="Falcon X2 Express Drone" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Falcon X2 Express</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Air Cargo & Chilled Sprinters</div>
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-800 text-slate-300 font-semibold">
                10 in active route
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <span>Cold-Chain SLA</span>
            <span className="text-emerald-400 font-mono font-bold">100% Compliant</span>
          </div>
        </div>

        {/* Network Buffer Capacity Card (Inspired by Image 1) */}
        <div className="card-dark p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Network Buffer</span>
            <div className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse"></div>
          </div>

          <div className="space-y-2.5 my-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
              <span className="text-slate-400 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-lime" />
                <span>Active Sprinters</span>
              </span>
              <span className="font-mono font-bold text-white">31,081</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
              <span className="text-slate-400 flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Usable Warehouse Buffer</span>
              </span>
              <span className="font-mono font-bold text-white">215,076</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <span>Firewall Reservations</span>
            <span className="text-lime font-mono font-bold">{summary?.active_reservations_count || 1} Active</span>
          </div>
        </div>
      </div>

      {/* Row 3: STANDOUT TRUKON DELIVERY VEHICLE & COURIER CARD (Matching Image 3 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Courier / Order Focus Card (Matching Image 2) */}
        <div className="lg:col-span-2 card-dark p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-lime/20 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 shadow-2xl relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-3xl overflow-hidden border-2 border-lime p-0.5 shrink-0 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" 
                alt="Amanda Chen - Courier" 
                className="w-full h-full object-cover rounded-2xl" 
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-400">COURIER DISPATCH:</span>
                <span className="text-sm font-extrabold text-lime font-mono">Amanda Chen</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  #ORD-2026-901 CRITICAL
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                Zurich University Hospital Center • <span className="text-slate-400">Cold-Chain Insulin Glargine 100U (SLA ₹4,15,000/day)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end shrink-0">
            <button 
              onClick={() => navigate('/impact-map?disruptionId=1')}
              className="px-4 py-2.5 rounded-2xl bg-obsidian-800 hover:bg-obsidian-750 text-white text-xs font-bold border border-white/[0.1] transition font-mono"
            >
              View Route
            </button>

            <button 
              onClick={() => navigate('/recovery?disruptionId=1')}
              className="px-5 py-2.5 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_20px_rgba(220,248,54,0.3)] transition font-mono"
            >
              Confirm Recovery Plan
            </button>
          </div>
        </div>

        {/* Right: Trukon Red Freight Truck Delivery Vehicle Card (Matching Image 3) */}
        <div className="card-dark p-6 border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Trukon Heavy Freight
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                WA-12345-AB
              </span>
            </div>

            {/* Authentic Red Semi-Truck Photo Render from Image 3 */}
            <div className="relative h-28 rounded-2xl overflow-hidden mb-3 border border-white/[0.08] shadow-inner">
              <img 
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80" 
                alt="Trukon Red Freight Semi-Truck" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-80" />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow">
                12.5m Chilled Reefer • Active
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5 border-b border-white/[0.04] text-slate-400">
                <span>Fuel Economy:</span>
                <span className="text-white font-mono font-bold">8 km / liter (Diesel)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/[0.04] text-slate-400">
                <span>Service Due:</span>
                <span className="text-lime font-mono font-bold">Nov 7, 2026</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-400">
                <span>Cargo Volume:</span>
                <span className="text-white font-mono font-bold">76,456 in³ (Active 2°C)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-white/[0.06] flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">Driver Edwards:</span>
            <span className="text-amber-400 font-mono font-bold flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.5 Rating</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Shipments / Disruptions Table (Matching Image 2's Filter Tab Table) */}
      <div className="card-dark p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-white tracking-tight">Active Transit Disruptions</h2>
            <span className="text-xs px-3 py-1 rounded-full bg-obsidian-850 text-lime font-mono font-bold border border-lime/20">
              {disruptions.length} Monitored
            </span>
          </div>

          {/* Filter Pill Tabs from Image 2 */}
          <div className="flex items-center space-x-1.5 p-1 rounded-full bg-obsidian-900 border border-white/[0.08] text-xs">
            {['All', 'Pending', 'In Transit', 'Approved', 'Completed'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition font-mono ${
                    isActive
                      ? 'bg-lime text-obsidian-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-white/[0.06] pb-3 font-mono">
              <tr>
                <th className="py-3.5 px-4">Disruption / Code</th>
                <th className="py-3.5 px-4">Carrier / Tracking</th>
                <th className="py-3.5 px-4">Route / Destination</th>
                <th className="py-3.5 px-4">Delay Incurred</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {disruptions.map((d) => (
                <tr key={d.id} className="hover:bg-obsidian-850/60 transition group">
                  <td className="py-4 px-4">
                    <div className="font-extrabold text-white text-sm">{d.title}</div>
                    <div className="text-xs font-mono text-lime mt-0.5">{d.code}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-mono font-bold text-slate-200 text-xs">{d.shipment_tracking || 'TRK-UNKNOWN'}</div>
                    <div className="text-[11px] text-slate-400">{d.source_type}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-semibold">To: {d.warehouse_code || 'Central Hub'}</div>
                    <div className="text-[11px] text-slate-500">Dedicated Corridor</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-black text-rose-400 text-sm">
                    +{d.estimated_delay_hours}h
                  </td>

                  <td className="py-4 px-4">
                    <RiskBadge level={d.severity} />
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={d.status} />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => navigate(`/recovery?disruptionId=${d.id}`)}
                      className="px-4 py-2 rounded-full bg-obsidian-800 hover:bg-lime hover:text-obsidian-950 text-slate-200 font-bold text-xs transition border border-white/[0.08] font-mono flex items-center space-x-1"
                    >
                      <span>Resolve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deadline Auction Modal */}
      <DeadlineAuctionModal
        isOpen={showAuctionModal}
        onClose={() => setShowAuctionModal(false)}
      />
    </div>
  );
}
