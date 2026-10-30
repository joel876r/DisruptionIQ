import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  GitFork, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Send, 
  Eye, 
  AlertOctagon,
  Boxes,
  Gavel,
  Compass,
  Layers,
  ChevronRight,
  Brain,
  Target,
  IndianRupee,
  Zap,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { RecoveryRegretMeter } from '../components/RecoveryRegretMeter';
import { DeadlineAuctionModal } from '../components/DeadlineAuctionModal';

export function RecoveryPlanningPage({ currentUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [disruptions, setDisruptions] = useState([]);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [aiBriefing, setAiBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Flagship Objective Selector: 'BALANCED', 'MIN_COST', 'MAX_ORDERS', 'FASTEST_TIME'
  const [objective, setObjective] = useState('BALANCED');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, planId: null, title: '' });
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // Evidence Ledger Modal state
  const [inspectingEvidence, setInspectingEvidence] = useState(null);

  // Deadline Auction Modal state
  const [showAuctionModal, setShowAuctionModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await api.getDisruptions();
        setDisruptions(list);

        const paramId = searchParams.get('disruptionId');
        const initialId = paramId ? parseInt(paramId, 10) : (list[0]?.id || null);
        setSelectedDisruptionId(initialId);

        if (initialId) {
          await loadPlansAndBriefing(initialId);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize Recovery Arena');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const loadPlansAndBriefing = async (disruptionId) => {
    try {
      setBriefingLoading(true);
      const [plansData, briefingData] = await Promise.all([
        api.getRecoveryOptions(disruptionId),
        api.getAiBriefing(disruptionId),
      ]);
      setPlans(plansData);
      setAiBriefing(briefingData);
    } catch (err) {
      console.error('Error fetching plans/briefing:', err);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleDisruptionChange = async (id) => {
    setSelectedDisruptionId(id);
    await loadPlansAndBriefing(id);
  };

  const handleRequestApproval = async () => {
    if (!confirmModal.planId) return;
    try {
      setSubmittingPlan(true);
      setError('');
      await api.requestPlanApproval(confirmModal.planId);
      setSuccessMsg(`Plan '${confirmModal.title}' successfully submitted for authorization.`);
      setConfirmModal({ isOpen: false, planId: null, title: '' });
      await loadPlansAndBriefing(selectedDisruptionId);
    } catch (err) {
      setError(err.message || 'Failed to submit plan for approval');
    } finally {
      setSubmittingPlan(false);
    }
  };

  // Determine which plan is recommended dynamically based on the chosen objective
  const getRecommendedPlanId = () => {
    const feasiblePlans = plans.filter(p => p.is_feasible && p.strategy_type !== 'DO_NOTHING');
    if (feasiblePlans.length === 0) return null;

    if (objective === 'MIN_COST') {
      return [...feasiblePlans].sort((a, b) => a.estimated_cost - b.estimated_cost)[0]?.id;
    } else if (objective === 'MAX_ORDERS') {
      return [...feasiblePlans].sort((a, b) => b.orders_protected_count - a.orders_protected_count || a.estimated_cost - b.estimated_cost)[0]?.id;
    } else if (objective === 'FASTEST_TIME') {
      return [...feasiblePlans].sort((a, b) => a.estimated_time_hours - b.estimated_time_hours)[0]?.id;
    }
    // BALANCED: lowest cost per order protected, low risk
    return [...feasiblePlans].sort((a, b) => (a.estimated_cost / (a.orders_protected_count || 1)) - (b.estimated_cost / (b.orders_protected_count || 1)))[0]?.id;
  };

  const recommendedId = getRecommendedPlanId();
  const doNothingPlan = plans.find(p => p.strategy_type === 'DO_NOTHING');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30 flex items-center space-x-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>Feature 1: Recovery Arena</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Simulate Before You Decide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Recovery Arena & Multi-Objective Simulator
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Simulate 5 strategic recovery trajectories before committing funds. Compare costs in ₹, deadline salvage, usable stock movements, and collateral downstream regret.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAuctionModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 text-lime border border-lime/30 text-xs font-black font-mono transition flex items-center space-x-2 shadow-lg"
          >
            <Gavel className="w-4 h-4" />
            <span>Launch Deadline Auction</span>
          </button>

          {/* Disruption Dropdown Pill */}
          <div className="flex items-center space-x-2.5 bg-obsidian-900 px-4 py-2.5 rounded-2xl border border-white/[0.1] text-xs text-slate-300 shadow-xl">
            <span className="text-slate-400 font-mono uppercase text-[11px] font-bold">Target Disruption:</span>
            <select
              value={selectedDisruptionId || ''}
              onChange={(e) => handleDisruptionChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-lime font-bold focus:outline-none cursor-pointer font-mono"
            >
              {disruptions.map((d) => (
                <option key={d.id} value={d.id} className="bg-obsidian-950 text-slate-200">
                  {d.code} - {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-lime/10 border border-lime/30 text-lime text-xs flex items-center space-x-2 font-bold font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-lime" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Flagship Objective Selector Bar */}
      <div className="card-dark p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider font-mono text-slate-400 block">
              Manager Decision Policy / Target Objective:
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              Select your optimization target to re-rank feasible recovery options
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setObjective('BALANCED')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black font-mono transition flex items-center justify-center space-x-1.5 ${
                objective === 'BALANCED'
                  ? 'bg-lime text-obsidian-950 shadow-lg shadow-lime/20'
                  : 'bg-obsidian-900 text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Balanced</span>
            </button>
            <button
              onClick={() => setObjective('MIN_COST')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black font-mono transition flex items-center justify-center space-x-1.5 ${
                objective === 'MIN_COST'
                  ? 'bg-lime text-obsidian-950 shadow-lg shadow-lime/20'
                  : 'bg-obsidian-900 text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Minimize Cost</span>
            </button>
            <button
              onClick={() => setObjective('MAX_ORDERS')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black font-mono transition flex items-center justify-center space-x-1.5 ${
                objective === 'MAX_ORDERS'
                  ? 'bg-lime text-obsidian-950 shadow-lg shadow-lime/20'
                  : 'bg-obsidian-900 text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protect Orders</span>
            </button>
            <button
              onClick={() => setObjective('FASTEST_TIME')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black font-mono transition flex items-center justify-center space-x-1.5 ${
                objective === 'FASTEST_TIME'
                  ? 'bg-lime text-obsidian-950 shadow-lg shadow-lime/20'
                  : 'bg-obsidian-900 text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fastest Delivery</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Operational Briefing & Uncomfortable Truth Banner */}
      <div className="p-6 sm:p-8 rounded-4xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-white/[0.1] shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-lime text-obsidian-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                AI Logistics Co-Pilot & Uncomfortable Truth Synthesis
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                aiBriefing?.is_ai_generated
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                  : 'bg-obsidian-800 text-slate-400'
              }`}>
                {aiBriefing?.is_ai_generated ? 'Google GenAI Grounded' : 'Deterministic Grounded Engine'}
              </span>
            </div>
          </div>

          <button
            onClick={() => loadPlansAndBriefing(selectedDisruptionId)}
            className="text-xs text-lime hover:underline font-bold font-mono"
          >
            Refresh Telemetry
          </button>
        </div>

        {briefingLoading ? (
          <div className="py-6 text-xs text-slate-400 font-mono">Synthesizing deterministic engine analysis...</div>
        ) : (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed font-medium text-slate-200 text-sm">
              {aiBriefing?.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/[0.06] text-xs">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                <span className="text-slate-500 font-bold uppercase text-[10px] font-mono block">Identified Chokepoint:</span>
                <p className="text-rose-400 mt-1 font-semibold">{aiBriefing?.key_bottleneck}</p>
              </div>

              <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                <span className="text-slate-500 font-bold uppercase text-[10px] font-mono block">Optimal Feasible Plan:</span>
                <p className="text-lime mt-1 font-black">{aiBriefing?.recommended_action}</p>
              </div>

              {/* UNCOMFORTABLE TRUTH ENGINE FEATURE */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40">
                <span className="text-amber-400 font-bold uppercase text-[10px] font-mono flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Uncomfortable Truth:</span>
                </span>
                <p className="text-amber-200 mt-1 text-[11px] leading-snug">
                  {aiBriefing?.uncomfortable_truth || "Physical warehouse buffers cannot fulfill 100% of demand without expedited secondary transfers."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recovery Arena: Comparison Grid */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <GitFork className="w-5 h-5 text-lime" />
              <span>Recovery Arena: Strategic Options Matrix</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates Cost in ₹, Delivery Time, Protected Orders, Recovery Firewall Feasibility & Regret Index
            </p>
          </div>
          <span className="text-xs font-mono text-lime font-bold">
            Target Objective: {objective.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isDoNothing = p.strategy_type === 'DO_NOTHING';
            const isRecommended = p.id === recommendedId;

            return (
              <div
                key={p.id}
                className={`rounded-4xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative ${
                  isRecommended
                    ? 'bg-obsidian-900 border-lime shadow-[0_0_35px_rgba(220,248,54,0.15)] ring-1 ring-lime/50'
                    : !p.is_feasible
                    ? 'bg-obsidian-900 border-rose-900/60 opacity-80'
                    : isDoNothing
                    ? 'bg-obsidian-900 border-white/[0.08]'
                    : 'bg-obsidian-900 border-white/[0.08] hover:border-lime/40 shadow-xl'
                }`}
              >
                <div>
                  {/* Top Strategy Badge and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-black uppercase ${
                        isDoNothing ? 'bg-obsidian-800 text-slate-400' : 'bg-lime text-obsidian-950'
                      }`}>
                        {p.strategy_type}
                      </span>
                      {isRecommended && (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-obsidian-950 flex items-center space-x-1 shadow-md">
                          <Star className="w-3 h-3 fill-obsidian-950" />
                          <span>RECOMMENDED</span>
                        </span>
                      )}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <h3 className="font-extrabold text-white text-lg leading-snug mt-1">{p.title}</h3>

                  {/* Recovery Firewall Feasibility Tag */}
                  <div className="mt-2">
                    {p.is_feasible ? (
                      <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-lime font-mono">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Firewall: Usable Stock Validated</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-400 font-mono">
                        <AlertOctagon className="w-4 h-4" />
                        <span>Firewall Blocked: Buffer Depleted</span>
                      </span>
                    )}
                  </div>

                  {/* Metrics Comparison Matrix in INR (₹) */}
                  <div className="grid grid-cols-2 gap-2.5 my-5 pt-4 border-t border-white/[0.06] text-xs">
                    <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Est. Cost</span>
                      <div className="font-mono font-black text-white mt-0.5 text-base">
                        ₹{p.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Transit / Lead Time</span>
                      <div className="font-mono font-black text-slate-200 mt-0.5 flex items-center space-x-1 text-base">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.estimated_time_hours}h</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Orders Protected</span>
                      <div className={`font-mono font-black mt-0.5 text-base ${p.orders_protected_count > 0 ? 'text-lime' : 'text-rose-400'}`}>
                        {p.orders_protected_count} Order(s)
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Residual Risk</span>
                      <div className="mt-1">
                        <RiskBadge score={p.residual_risk_score} />
                      </div>
                    </div>
                  </div>

                  {/* FEATURE 4: RECOVERY REGRET METER WIDGET */}
                  <div className="mb-4">
                    <RecoveryRegretMeter plan={p} isCompact={true} />
                  </div>

                  {/* Uncomfortable Truth Notice */}
                  {p.uncomfortable_truth && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 leading-relaxed space-y-1 mb-4">
                      <div className="font-black uppercase tracking-wider text-[10px] text-amber-400 flex items-center space-x-1 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Uncomfortable Truth</span>
                      </div>
                      <p className="text-[11px]">{p.uncomfortable_truth}</p>
                    </div>
                  )}

                  {!p.is_feasible && p.infeasibility_reasons && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900 text-xs text-rose-300 leading-relaxed mb-4">
                      <span className="font-bold">Firewall Infeasibility: </span>
                      {p.infeasibility_reasons}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setInspectingEvidence(p)}
                    className="text-xs text-slate-400 hover:text-lime flex items-center space-x-1 transition font-bold font-mono"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Evidence Ledger</span>
                  </button>

                  {p.status === 'DRAFT' && p.is_feasible && (
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, planId: p.id, title: p.title })}
                      className="px-5 py-2.5 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono shadow-[0_0_20px_rgba(220,248,54,0.3)] transition flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Request Approval</span>
                    </button>
                  )}

                  {p.status === 'AWAITING_APPROVAL' && (
                    <span className="text-xs text-amber-300 font-bold px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-mono">
                      In Review Queue
                    </span>
                  )}

                  {p.status === 'APPROVED' && (
                    <button
                      onClick={() => navigate('/approvals')}
                      className="px-5 py-2.5 rounded-2xl bg-lime text-obsidian-950 text-xs font-black font-mono shadow-[0_0_20px_rgba(220,248,54,0.3)] transition flex items-center space-x-1.5"
                    >
                      <span>Simulate Execution →</span>
                    </button>
                  )}

                  {p.status === 'COMPLETED' && (
                    <span className="text-xs text-lime font-bold flex items-center space-x-1 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-lime" />
                      <span>Executed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Ledger Modal */}
      {inspectingEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-4xl bg-obsidian-900 border border-white/[0.12] shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-bold text-lime uppercase tracking-wider font-mono">
                  {inspectingEvidence.strategy_type}
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">{inspectingEvidence.title}</h3>
                <p className="text-xs text-slate-400">Deterministic calculation trace, data provenance, and assumptions.</p>
              </div>
              <button 
                onClick={() => setInspectingEvidence(null)} 
                className="w-9 h-9 rounded-full bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Estimated Cost</span>
                  <div className="font-mono font-black text-white mt-1 text-sm">₹{inspectingEvidence.estimated_cost.toLocaleString()}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Transit Time</span>
                  <div className="font-mono font-black text-white mt-1 text-sm">{inspectingEvidence.estimated_time_hours}h</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Orders Protected</span>
                  <div className="font-mono font-black text-lime mt-1 text-sm">{inspectingEvidence.orders_protected_count}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Created By</span>
                  <div className="text-xs font-bold text-slate-300 mt-1">{inspectingEvidence.creator_name || 'Operations Analyst'}</div>
                </div>
              </div>

              {/* Full Detailed Regret Meter inside Evidence Ledger */}
              <RecoveryRegretMeter plan={inspectingEvidence} isCompact={false} />

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono mb-2">Underlying Evidence JSON Ledger</h4>
                <pre className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.04] text-[11px] font-mono text-lime overflow-x-auto leading-relaxed">
                  {JSON.stringify(inspectingEvidence.evidence_data || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setInspectingEvidence(null)}
                className="px-6 py-2.5 rounded-2xl bg-obsidian-800 hover:bg-obsidian-750 text-white text-xs font-bold font-mono"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Submit Recovery Plan for Authorization"
        message={`Are you sure you want to submit '${confirmModal.title}' to the manager approval queue? Once submitted, the plan will undergo separation-of-duties review and lock shared reservation resources.`}
        confirmText="Submit for Review"
        isLoading={submittingPlan}
        onConfirm={handleRequestApproval}
        onCancel={() => setConfirmModal({ isOpen: false, planId: null, title: '' })}
      />

      {/* Deadline Auction Interactive Modal */}
      <DeadlineAuctionModal
        isOpen={showAuctionModal}
        onClose={() => setShowAuctionModal(false)}
      />
    </div>
  );
}
