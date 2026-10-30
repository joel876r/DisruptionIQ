import React, { useState, useEffect } from 'react';
import { 
  PackageSearch, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  RefreshCw, 
  Info, 
  X,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Gavel,
  Fingerprint,
  Zap,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';
import { DeadlineAuctionModal } from '../components/DeadlineAuctionModal';

export function OrdersAtRiskPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reevaluatingId, setReevaluatingId] = useState(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load orders at risk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReevaluate = async (orderId) => {
    try {
      setReevaluatingId(orderId);
      const updated = await api.reevaluateOrderRisk(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert(`Re-evaluation failed: ${err.message}`);
    } finally {
      setReevaluatingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30">
              Deterministic Multi-Factor Scoring
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Customer Impact Queue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Downstream Orders at Risk
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Prioritized strictly by mathematical risk equations: deadline urgency, product life-safety criticality, customer SLA tier, and local usable stock shortfall $(Physical - Reserved - Damaged - Expired)$.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAuctionModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono transition flex items-center space-x-2 shadow-lg shadow-lime/20"
          >
            <Gavel className="w-4 h-4" />
            <span>Launch Deadline Auction</span>
          </button>

          <button
            onClick={loadOrders}
            className="px-4 py-2.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 text-slate-200 border border-white/[0.08] text-xs font-bold font-mono transition flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Scoring</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Disruption Fingerprint & Auction Spotlight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deadline Auction Callout */}
        <div className="lg:col-span-2 rounded-4xl p-6 sm:p-7 bg-gradient-to-br from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-lime/30 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider font-mono text-lime flex items-center space-x-2">
                <Gavel className="w-4 h-4" />
                <span>Standout Feature 1: The Deadline Auction</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-lime/10 text-lime font-mono font-bold">
                Deterministic Allocation
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Which Orders Deserve the Last Available Stock?</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              When a delayed cold-chain shipment leaves only 100 units available for 250 units of demand across <strong>Hospital ICU</strong>, <strong>Regional Medical Clinics</strong>, and <strong>Automotive Powertrain lines</strong>, the Deadline Auction compares mathematical trade-offs to protect critical life-safety and maximum contractual value.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              Scarcity Gap: <strong className="text-rose-400">150 Units Short</strong> in Frankfurt
            </div>
            <button
              onClick={() => setShowAuctionModal(true)}
              className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-lime hover:text-obsidian-950 text-white text-xs font-bold font-mono transition border border-white/[0.1] flex items-center space-x-1"
            >
              <span>Simulate Allocation Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Standout Feature: Disruption Fingerprint Card */}
        <div className="rounded-4xl p-6 sm:p-7 bg-obsidian-900 border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider font-mono text-purple-400 flex items-center space-x-1.5">
                <Fingerprint className="w-4 h-4" />
                <span>Disruption Fingerprint</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono font-bold">
                Pattern Recognition
              </span>
            </div>
            <h4 className="text-base font-extrabold text-white">Antwerp Reefer Inspection Pattern</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              4th recurring delay this quarter with carrier TransEuro Logistics at Port of Antwerp. Average hold time is 42.4h with an 88% resolution probability within 48h.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">Carrier Reliability:</span>
            <span className="text-amber-400 font-bold">71% (High Volatility)</span>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="card-dark overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PackageSearch className="w-5 h-5 text-lime" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Live Order Commitments Ledger
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {orders.length} Monitored Customer Contracts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-obsidian-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-white/[0.06] font-mono">
              <tr>
                <th className="py-4 px-6">Order / Customer</th>
                <th className="py-4 px-6">Promised Delivery</th>
                <th className="py-4 px-6">Tier</th>
                <th className="py-4 px-6">Total Value</th>
                <th className="py-4 px-6">Risk Ranking</th>
                <th className="py-4 px-6">Fulfillment Status</th>
                <th className="py-4 px-6 text-right">Mathematical Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400 font-mono">
                    Evaluating deterministic order commitments...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500 font-mono">
                    No orders at risk. All commitments currently satisfied.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const promised = new Date(ord.promised_delivery_date);
                  const hoursUntil = Math.round((promised - new Date()) / (1000 * 3600));

                  return (
                    <tr key={ord.id} className="hover:bg-obsidian-850/60 transition group">
                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-white text-sm">{ord.order_number}</div>
                        <div className="text-slate-300 text-xs font-medium truncate max-w-[240px] mt-0.5">{ord.customer_name}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">
                          {promised.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className={`text-xs font-mono mt-0.5 ${hoursUntil < 24 ? 'text-rose-400 font-bold' : hoursUntil < 48 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {hoursUntil <= 0 ? 'OVERDUE' : `In ${hoursUntil} hours`}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                          ord.customer_tier === 'VIP'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-obsidian-800 text-slate-300'
                        }`}>
                          {ord.customer_tier}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-black text-white text-sm">
                        ₹{ord.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6">
                        <RiskBadge score={ord.risk_score} />
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={ord.status} />
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3.5 py-1.5 rounded-full bg-obsidian-800 hover:bg-lime hover:text-obsidian-950 text-slate-200 font-bold text-xs transition border border-white/[0.08] font-mono"
                        >
                          Factors
                        </button>
                        <button
                          onClick={() => handleReevaluate(ord.id)}
                          disabled={reevaluatingId === ord.id}
                          className="p-2 rounded-full bg-obsidian-800/80 hover:bg-obsidian-750 text-slate-400 hover:text-white border border-white/[0.08] text-xs transition"
                          title="Recompute deterministic score"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${reevaluatingId === ord.id ? 'animate-spin text-lime' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Factor Breakdown Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-4xl bg-obsidian-900 border border-white/[0.12] shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-3 py-1 rounded-full bg-lime/15 text-lime border border-lime/30 font-bold">
                    {selectedOrder.order_number}
                  </span>
                  <RiskBadge score={selectedOrder.risk_score} />
                </div>
                <h3 className="text-xl font-extrabold text-white mt-2">{selectedOrder.customer_name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Destination: {selectedOrder.destination_city}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-full bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-obsidian-950 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Deterministic Score</span>
                  <div className="text-3xl font-black text-white font-mono mt-1">
                    {selectedOrder.risk_score}<span className="text-xs text-slate-500 font-sans"> / 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Contract Value</span>
                  <div className="text-2xl font-black text-lime font-mono mt-1">
                    ₹{selectedOrder.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-lime" />
                  <span>Explainable Mathematical Risk Weights</span>
                </h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedOrder.risk_reasons && selectedOrder.risk_reasons.length > 0 ? (
                    selectedOrder.risk_reasons.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.04] text-xs text-slate-200 leading-relaxed flex items-start space-x-2.5 font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-lime mt-1.5 shrink-0 shadow-sm shadow-lime/50"></span>
                        <span>{factor}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 font-mono">
                      No critical risk flags triggered for this order.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-2xl bg-obsidian-800 hover:bg-obsidian-750 text-white text-xs font-bold font-mono transition"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Auction Modal */}
      <DeadlineAuctionModal
        isOpen={showAuctionModal}
        onClose={() => setShowAuctionModal(false)}
      />
    </div>
  );
}
