import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Play, 
  ShieldCheck, 
  AlertOctagon 
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';
import { ConfirmModal } from '../components/ConfirmModal';

export function ApprovalsPage({ currentUser }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Action decision modal
  const [activeDecision, setActiveDecision] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Execution simulation modal
  const [executionModal, setExecutionModal] = useState({ isOpen: false, planId: null, planTitle: '' });
  const [isExecuting, setIsExecuting] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getRecoveryPlans();
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Failed to load recovery plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDecisionSubmit = async () => {
    if (!activeDecision) return;
    try {
      setIsSubmitting(true);
      setError('');
      await api.decidePlanApproval(activeDecision.planId, activeDecision.decisionType, decisionNotes);
      setSuccessMsg(`Plan '${activeDecision.planTitle}' marked as ${activeDecision.decisionType}.`);
      setActiveDecision(null);
      setDecisionNotes('');
      await loadPlans();
    } catch (err) {
      setError(err.message || 'Approval decision rejected');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateExecution = async () => {
    if (!executionModal.planId) return;
    try {
      setIsExecuting(true);
      setError('');
      await api.simulatePlanExecution(executionModal.planId, 'Executed via manager simulation console');
      setSuccessMsg(`Plan '${executionModal.planTitle}' execution simulated successfully. Usable stock updated and outcome recorded.`);
      setExecutionModal({ isOpen: false, planId: null, planTitle: '' });
      await loadPlans();
    } catch (err) {
      setError(err.message || 'Execution simulation aborted by Recovery Firewall');
    } finally {
      setIsExecuting(false);
    }
  };

  const canApprove = ['Supply Chain Manager', 'Procurement Approver', 'Administrator'].includes(currentUser?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Authorization & Simulated Execution</h1>
        <p className="text-xs text-slate-400 mt-1">
          Enforces strict Separation of Duties and role checks prior to simulated inventory and transit execution.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-lime/15 border border-lime/30 text-lime text-xs flex items-center space-x-2 font-bold">
          <CheckCircle className="w-4 h-4 shrink-0 text-lime" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Separation of Duties Compliance Notice */}
      <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/[0.08] flex items-start space-x-3 text-xs text-slate-300">
        <div className="w-8 h-8 rounded-full bg-lime text-obsidian-950 flex items-center justify-center shrink-0 font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-white text-sm">Separation of Duties Guarantee (Backend Enforced):</span>
          <p className="text-slate-400 mt-0.5 leading-relaxed text-xs">
            A user cannot approve a recovery plan they personally authored. Approval requests must be reviewed by an authorized Supply Chain Manager or Procurement Approver. Buttons are disabled and verified with HTTP 400 guards on the server.
          </p>
        </div>
      </div>

      {/* Plans Awaiting Review List */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-lime" />
          <span>Review Queue</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Loading approval queue...
          </div>
        ) : plans.length === 0 ? (
          <div className="card-dark p-12 text-center text-slate-500 text-xs">
            No recovery plans currently awaiting review.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((p) => {
              const isAuthor = currentUser?.id === p.created_by_id;
              const isAwaiting = p.status === 'AWAITING_APPROVAL';
              const isApproved = p.status === 'APPROVED';
              const isCompleted = p.status === 'COMPLETED';

              return (
                <div
                  key={p.id}
                  className="card-dark p-6 hover:border-lime/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-lime text-obsidian-950">
                        {p.strategy_type}
                      </span>
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-500 font-mono">Plan #{p.id}</span>
                    </div>

                    <h3 className="font-extrabold text-white text-base">{p.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5 text-lime" />
                        <span>Author: <strong className="text-white">{p.creator_name || 'System Analyst'}</strong></span>
                      </span>

                      <span className="flex items-center space-x-1 font-mono">
                        <DollarSign className="w-3.5 h-3.5 text-lime" />
                        <span>Cost: <strong className="text-white">₹{p.estimated_cost.toLocaleString()}</strong></span>
                      </span>

                      <span className="flex items-center space-x-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Duration: <strong className="text-white">{p.estimated_time_hours}h</strong></span>
                      </span>

                      <span>
                        Orders Protected: <strong className="text-lime font-bold font-mono">{p.orders_protected_count}</strong>
                      </span>
                    </div>

                    {isAuthor && isAwaiting && (
                      <div className="text-[11px] text-amber-400 font-bold flex items-center space-x-1.5 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>You authored this plan. Separation of duties prohibits self-approval.</span>
                      </div>
                    )}
                  </div>

                  {/* Actions depending on state & role */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {isAwaiting && (
                      <>
                        <button
                          onClick={() => setActiveDecision({ planId: p.id, planTitle: p.title, decisionType: 'REJECTED' })}
                          disabled={isAuthor || !canApprove}
                          className="px-4 py-2 rounded-full bg-obsidian-850 hover:bg-obsidian-800 text-rose-400 border border-white/[0.08] text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setActiveDecision({ planId: p.id, planTitle: p.title, decisionType: 'APPROVED' })}
                          disabled={isAuthor || !canApprove}
                          className="px-5 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_15px_rgba(220,248,54,0.3)] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve Plan</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => setExecutionModal({ isOpen: true, planId: p.id, planTitle: p.title })}
                        className="px-5 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_20px_rgba(220,248,54,0.35)] transition flex items-center space-x-1.5 animate-pulse"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Simulate Execution</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="px-4 py-1.5 rounded-full bg-obsidian-850 text-lime text-xs font-bold flex items-center space-x-1.5 border border-lime/30">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Execution Complete</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {activeDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-obsidian-900 border border-white/[0.1] shadow-2xl p-6">
            <h3 className="text-lg font-black text-white mb-1">
              Confirm Decision: {activeDecision.decisionType}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Plan: <span className="text-white font-bold">{activeDecision.planTitle}</span>
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Authorization Notes / Reason (Required)
              </label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
                required
                placeholder="Document approval justification or rejection rationale for the immutable audit trail..."
                className="w-full px-4 py-2.5 rounded-xl bg-obsidian-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
              />
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setActiveDecision(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:bg-obsidian-800 border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                onClick={handleDecisionSubmit}
                disabled={isSubmitting || !decisionNotes.trim()}
                className={`px-5 py-2 rounded-full text-xs font-black text-obsidian-950 shadow transition disabled:opacity-50 ${
                  activeDecision.decisionType === 'APPROVED' ? 'bg-lime hover:bg-lime-400' : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                {isSubmitting ? 'Recording...' : `Confirm ${activeDecision.decisionType}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Confirmation Modal */}
      <ConfirmModal
        isOpen={executionModal.isOpen}
        title="Simulate Recovery Execution"
        message={`Simulating execution for '${executionModal.planTitle}' will re-validate usable stock via Recovery Firewall, commit the shared reservation ledger, update persistent simulated inventory, and log the recovery outcome. No real carrier bookings or financial payments will be triggered.`}
        confirmText="Execute Simulated Recovery"
        isLoading={isExecuting}
        onConfirm={handleSimulateExecution}
        onCancel={() => setExecutionModal({ isOpen: false, planId: null, planTitle: '' })}
      />
    </div>
  );
}
