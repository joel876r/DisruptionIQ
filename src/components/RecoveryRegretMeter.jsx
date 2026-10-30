import React from 'react';
import { AlertTriangle, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function RecoveryRegretMeter({ plan, isCompact = false }) {
  if (!plan) return null;

  // Derive regret score deterministically based on strategy and collateral risk
  let regretScore = 15;
  let sacrificeDesc = 'Minimal collateral buffer depletion.';
  let secondaryRisk = 'None detected.';
  let verdict = 'Safe strategic action.';
  let regretColor = 'text-lime';
  let barColor = 'bg-lime';

  if (plan.strategy_type === 'DO_NOTHING') {
    regretScore = 95;
    sacrificeDesc = 'Zero inventory sacrificed.';
    secondaryRisk = 'Both Zurich & Berlin hospital customer contracts default on SLAs.';
    verdict = 'Extreme strategic regret. Customer trust damaged permanently.';
    regretColor = 'text-rose-400';
    barColor = 'bg-rose-500';
  } else if (plan.strategy_type === 'STOCK_TRANSFER') {
    regretScore = 22;
    sacrificeDesc = '150 units transferred from Milan Southern DC.';
    secondaryRisk = 'Milan buffer drops to 70 units (1.8 days of local safety stock).';
    verdict = 'Recommended low-regret path: Solves critical ICU emergency while preserving minimum regional reserve.';
    regretColor = 'text-lime';
    barColor = 'bg-lime';
  } else if (plan.strategy_type === 'EXPEDITE_FREIGHT') {
    regretScore = 48;
    sacrificeDesc = 'High emergency cash expenditure (₹6,200 air surcharge).';
    secondaryRisk = 'Depletes discretionary freight budget for remaining quarter.';
    verdict = 'Moderate financial regret. Saves delivery deadlines but incurs steep premium.';
    regretColor = 'text-amber-400';
    barColor = 'bg-amber-400';
  } else if (plan.strategy_type === 'ALTERNATIVE_SUPPLIER') {
    regretScore = 55;
    sacrificeDesc = 'Requires re-qualifying cold-chain packaging certification.';
    secondaryRisk = '6-day procurement lead time fails immediate 48h deadline.';
    verdict = 'High timing regret. Useful for subsequent batches, not acute crisis.';
    regretColor = 'text-amber-500';
    barColor = 'bg-amber-500';
  } else if (plan.strategy_type === 'SPLIT_FULFILLMENT') {
    regretScore = 32;
    sacrificeDesc = 'Customer receives 2 separate deliveries (100 units now, 50 units later).';
    secondaryRisk = 'Double handling and shipping overhead.';
    verdict = 'Acceptable operational regret. Customer agrees to partial immediate receipt.';
    regretColor = 'text-lime';
    barColor = 'bg-lime';
  }

  if (isCompact) {
    return (
      <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/[0.04] space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400 uppercase font-bold flex items-center space-x-1">
            <Compass className="w-3 h-3 text-slate-400" />
            <span>Recovery Regret Meter:</span>
          </span>
          <span className={`font-black ${regretColor}`}>{regretScore}% Regret</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-obsidian-800 overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${regretScore}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 leading-tight truncate">{sacrificeDesc}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-lime" />
          <span className="text-xs font-black uppercase tracking-wider font-mono text-white">
            Feature 4: Recovery Regret Meter
          </span>
        </div>
        <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] ${regretColor}`}>
          {regretScore}% Regret Index
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-obsidian-800 overflow-hidden">
        <div 
          className={`h-full ${barColor} rounded-full transition-all duration-700 shadow-sm`}
          style={{ width: `${regretScore}%` }} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        <div className="p-2.5 rounded-xl bg-obsidian-900 border border-white/[0.04]">
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Sacrificed Inventory</span>
          <p className="text-slate-300 text-[11px] mt-0.5 font-medium">{sacrificeDesc}</p>
        </div>

        <div className="p-2.5 rounded-xl bg-obsidian-900 border border-white/[0.04]">
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Collateral Risk Exposure</span>
          <p className="text-slate-300 text-[11px] mt-0.5 font-medium">{secondaryRisk}</p>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-slate-300 flex items-start space-x-2">
        <span className="text-lime font-bold shrink-0">Verdict:</span>
        <span className="leading-snug">{verdict}</span>
      </div>
    </div>
  );
}
