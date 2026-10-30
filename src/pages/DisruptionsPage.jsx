import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertOctagon, 
  Clock, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Radio, 
  Send, 
  CheckCircle2, 
  Filter,
  Sparkles,
  GitFork,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';

export function DisruptionsPage() {
  const navigate = useNavigate();
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Webhook Simulator state
  const [carrierSimLoading, setCarrierSimLoading] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  const loadDisruptions = async () => {
    try {
      setLoading(true);
      const data = await api.getDisruptions(statusFilter);
      setDisruptions(data);
    } catch (err) {
      setError(err.message || 'Failed to load disruptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisruptions();
  }, [statusFilter]);

  const handleSimulateWebhook = async (tracking, delayHours, reason) => {
    try {
      setCarrierSimLoading(true);
      setSimMessage('');
      const payload = {
        tracking_number: tracking,
        carrier: 'Simulated Carrier Dispatch',
        event_code: 'DELAYED',
        delay_hours: delayHours,
        reason: reason,
        location: 'Transshipment Hub Frankfurt',
      };
      const res = await api.triggerCarrierWebhook(payload);
      setSimMessage(`Carrier event processed: ${res.status} (${res.tracking_number}, +${delayHours}h delay).`);
      await loadDisruptions();
    } catch (err) {
      setSimMessage(`Webhook failed: ${err.message}`);
    } finally {
      setCarrierSimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Transit Disruptions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time carrier delay feeds, customs holds, and port bottlenecks across network corridors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-obsidian-900 px-3.5 py-1.5 rounded-full border border-white/[0.08] text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-lime" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-obsidian-900">All Statuses</option>
              <option value="DETECTED" className="bg-obsidian-900">Detected</option>
              <option value="INVESTIGATING" className="bg-obsidian-900">Investigating</option>
              <option value="RECOVERY_PROPOSED" className="bg-obsidian-900">Recovery Proposed</option>
              <option value="RECOVERING" className="bg-obsidian-900">Recovering</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Simulator Capsule Bar for Hackathon Judges (Image 1/2 style) */}
      <div className="p-4 rounded-3xl bg-obsidian-900 border border-lime/30 shadow-[0_0_25px_rgba(220,248,54,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-xs font-black text-lime">
            <Radio className="w-4 h-4 animate-pulse text-lime" />
            <span>Interactive Carrier Webhook Injector (Hackathon Tool)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulate instant carrier delays with HMAC verification and idempotency checks.
          </p>
          {simMessage && (
            <p className="text-xs text-lime font-bold mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{simMessage}</span>
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSimulateWebhook('TRK-APX-8801', 54.0, 'Port customs physical inspection & chilled sensor test')}
            disabled={carrierSimLoading}
            className="px-4 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black transition shadow-[0_0_15px_rgba(220,248,54,0.3)] flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+54h Port Delay</span>
          </button>
          <button
            onClick={() => handleSimulateWebhook('TRK-APX-9204', 72.0, 'Air Cargo strike & flight cancellation detour')}
            disabled={carrierSimLoading}
            className="px-4 py-2 rounded-full bg-obsidian-800 hover:bg-obsidian-750 text-white border border-white/[0.08] text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>+72h Air Strike</span>
          </button>
        </div>
      </div>

      {/* Disruptions Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Scanning active network corridors...
          </div>
        ) : disruptions.length === 0 ? (
          <div className="card-dark p-12 text-center text-slate-400 text-xs">
            <AlertOctagon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No disruptions found matching criteria.
          </div>
        ) : (
          disruptions.map((d) => (
            <div
              key={d.id}
              className="card-dark p-6 hover:border-lime/40 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-obsidian-800 text-lime font-bold border border-lime/30">
                    {d.code}
                  </span>
                  <h3 className="font-extrabold text-white text-base">{d.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <RiskBadge level={d.severity} />
                  <StatusBadge status={d.status} />
                </div>
              </div>

              {/* Details and Context */}
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                {d.details}
              </p>

              {/* Supply Chain Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Inbound Delay</span>
                  <div className="text-sm font-black text-rose-400 mt-0.5 flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>+{d.estimated_delay_hours} Hours</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Tracked Shipment</span>
                  <div className="text-xs font-mono font-bold text-white mt-0.5 truncate">
                    {d.shipment_tracking || 'Unassigned'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Target Hub</span>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">
                    {d.warehouse_code || 'Central Hub'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Recovery Arena Options</span>
                  <div className="text-sm font-black text-lime mt-0.5 font-mono">
                    {d.recovery_plans_count} Options Available
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => navigate(`/impact-map?disruptionId=${d.id}`)}
                  className="px-4 py-2 rounded-full bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 text-xs font-bold border border-white/[0.08] transition flex items-center space-x-1.5"
                >
                  <span>Trace Impact Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate(`/recovery?disruptionId=${d.id}`)}
                  className="px-5 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_15px_rgba(220,248,54,0.3)] transition flex items-center space-x-1.5"
                >
                  <GitFork className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Open Recovery Arena</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
