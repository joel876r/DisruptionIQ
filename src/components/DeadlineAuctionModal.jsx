import React, { useState } from 'react';
import { 
  Gavel, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  Sliders,
  X
} from 'lucide-react';

export function DeadlineAuctionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [scarceQuantity, setScarceQuantity] = useState(150);
  const [allocationPolicy, setAllocationPolicy] = useState('CRITICALITY_PENALTY');

  // Competing customer orders vying for scarce inventory (e.g. 150 units available vs 250 units total demand)
  const competingOrders = [
    {
      id: 'ORD-2026-901',
      customer: 'University Hospital Zurich',
      segment: 'Pediatric ICU / Hospital',
      tier: 'VIP',
      unitsNeeded: 150,
      deadlineHours: 18,
      dailyPenalty: 415000, // ₹4,15,000/day
      criticality: 'CRITICAL'
    },
    {
      id: 'ORD-2026-902',
      customer: 'Charité Purchasing Berlin',
      segment: 'Regional Medical Clinic',
      tier: 'TIER_1',
      unitsNeeded: 100,
      deadlineHours: 36,
      dailyPenalty: 125000, // ₹1,25,000/day
      criticality: 'HIGH'
    },
    {
      id: 'ORD-2026-903',
      customer: 'Bavaria Auto Systems Munich',
      segment: 'Automotive Powertrain OEM',
      tier: 'VIP',
      unitsNeeded: 80,
      deadlineHours: 28,
      dailyPenalty: 850000, // ₹8,50,000/shift
      criticality: 'HIGH'
    }
  ];

  // Deterministic Allocation Engine based on Policy
  let remaining = scarceQuantity;
  let sorted = [...competingOrders];

  if (allocationPolicy === 'CRITICALITY_PENALTY') {
    // Sort by daily penalty / criticality
    sorted.sort((a, b) => b.dailyPenalty - a.dailyPenalty);
  } else if (allocationPolicy === 'EARLIEST_DEADLINE') {
    // Sort by deadline urgency
    sorted.sort((a, b) => a.deadlineHours - b.deadlineHours);
  } else if (allocationPolicy === 'FAIR_SHARE') {
    // Handled proportionally
  }

  const results = sorted.map((order) => {
    let allocated = 0;
    let fulfilled = false;
    let rationale = '';

    if (allocationPolicy === 'FAIR_SHARE') {
      const totalDemand = 330;
      const share = Math.min(order.unitsNeeded, Math.floor((order.unitsNeeded / totalDemand) * scarceQuantity));
      allocated = share;
      fulfilled = allocated >= order.unitsNeeded;
      rationale = `Proportional quota: ${((order.unitsNeeded / totalDemand) * 100).toFixed(0)}% of pooled buffer.`;
    } else {
      if (remaining >= order.unitsNeeded) {
        allocated = order.unitsNeeded;
        remaining -= order.unitsNeeded;
        fulfilled = true;
        rationale = `100% Demand satisfied. Ranked priority #${sorted.indexOf(order) + 1} based on ${allocationPolicy === 'CRITICALITY_PENALTY' ? 'penalty severity' : 'urgency'}.`;
      } else if (remaining > 0) {
        allocated = remaining;
        remaining = 0;
        fulfilled = false;
        rationale = `Partial allocation (${allocated}/${order.unitsNeeded} units). Buffer exhausted before full quantity.`;
      } else {
        allocated = 0;
        fulfilled = false;
        rationale = `Depleted. Zero units allocated. Must defer to secondary air freight or delayed sea shipment.`;
      }
    }

    return {
      ...order,
      allocated,
      fulfilled,
      deficit: order.unitsNeeded - allocated,
      rationale
    };
  });

  const totalPenaltiesSaved = results
    .filter(r => r.allocated > 0)
    .reduce((sum, r) => sum + (r.allocated / r.unitsNeeded) * r.dailyPenalty, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-4xl bg-obsidian-900 border border-white/[0.12] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30 flex items-center space-x-1.5">
                  <Gavel className="w-3.5 h-3.5" />
                  <span>The Deadline Auction Engine</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Constrained Scarcity Optimizer</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-2">Which Orders Deserve the Last Available Stock?</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                When upstream delays create severe stock deficits, DisruptionIQ simulates mathematically provable allocation models rather than arbitrary first-come-first-serve.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-obsidian-800 hover:bg-obsidian-750 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Auction Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-white/[0.08]">
            <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] font-mono">
                  Available Scarce Buffer:
                </span>
                <span className="text-lime font-black text-sm font-mono">{scarceQuantity} Units</span>
              </div>
              <input
                type="range"
                min="50"
                max="330"
                step="10"
                value={scarceQuantity}
                onChange={(e) => setScarceQuantity(parseInt(e.target.value, 10))}
                className="w-full accent-lime cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Severe (50 Units)</span>
                <span>Demand (330 Units)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.06] space-y-1.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] font-mono block">
                Allocation Strategy Policy:
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => setAllocationPolicy('CRITICALITY_PENALTY')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold transition font-mono ${
                    allocationPolicy === 'CRITICALITY_PENALTY'
                      ? 'bg-lime text-obsidian-950 shadow-md'
                      : 'bg-obsidian-850 text-slate-400 hover:text-white'
                  }`}
                >
                  Life-Safety & SLA
                </button>
                <button
                  onClick={() => setAllocationPolicy('EARLIEST_DEADLINE')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold transition font-mono ${
                    allocationPolicy === 'EARLIEST_DEADLINE'
                      ? 'bg-lime text-obsidian-950 shadow-md'
                      : 'bg-obsidian-850 text-slate-400 hover:text-white'
                  }`}
                >
                  Earliest Due
                </button>
                <button
                  onClick={() => setAllocationPolicy('FAIR_SHARE')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold transition font-mono ${
                    allocationPolicy === 'FAIR_SHARE'
                      ? 'bg-lime text-obsidian-950 shadow-md'
                      : 'bg-obsidian-850 text-slate-400 hover:text-white'
                  }`}
                >
                  Fair Quota
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="py-4 space-y-3 overflow-y-auto max-h-[320px] pr-1">
          {results.map((ord) => (
            <div
              key={ord.id}
              className={`p-4 rounded-2xl border transition ${
                ord.fulfilled
                  ? 'bg-obsidian-950/80 border-lime/30'
                  : ord.allocated > 0
                  ? 'bg-obsidian-950/80 border-amber-500/30'
                  : 'bg-obsidian-950/80 border-rose-500/30 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-white text-xs">{ord.id}</span>
                    <span className="font-bold text-white text-xs">{ord.customer}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono">
                      {ord.segment}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Needed: <strong className="text-white">{ord.unitsNeeded} units</strong> • Due in: <strong className="text-white">{ord.deadlineHours}h</strong> • Daily SLA Penalty: <strong className="text-rose-400">₹{ord.dailyPenalty.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Allocated Stock</span>
                    <span className={`text-base font-black font-mono ${
                      ord.fulfilled ? 'text-lime' : ord.allocated > 0 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {ord.allocated} / {ord.unitsNeeded} Units
                    </span>
                  </div>
                  {ord.fulfilled ? (
                    <span className="px-2.5 py-1 rounded-full bg-lime/10 text-lime text-[11px] font-black font-mono border border-lime/30">
                      SAVED
                    </span>
                  ) : ord.allocated > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-black font-mono border border-amber-500/30">
                      PARTIAL
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[11px] font-black font-mono border border-rose-500/30">
                      LOST OUT
                    </span>
                  )}
                </div>
              </div>

              {/* Explainable Rationale */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.04] text-[11px] text-slate-300 flex items-center space-x-1.5 font-medium">
                <span className="text-lime font-bold">Auction Logic:</span>
                <span>{ord.rationale}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 font-mono block">Estimated Penalty Saved:</span>
            <span className="text-xl font-black text-lime font-mono">
              ₹{totalPenaltiesSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 font-black text-xs font-mono transition shadow-lg shadow-lime/20"
            >
              Apply Allocation to Recovery Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
