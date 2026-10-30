import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Network, 
  Building2, 
  Truck, 
  Warehouse, 
  Boxes, 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Info,
  Layers,
  ChevronRight,
  MapPin,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/RiskBadge';
import { SupplyChainLeafletMap } from '../components/SupplyChainLeafletMap';

export function SupplyChainMapPage() {
  const [searchParams] = useSearchParams();
  const [disruptions, setDisruptions] = useState([]);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('confirmed');
  const [viewMode, setViewMode] = useState('both'); // 'both', 'map', 'graph'

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const list = await api.getDisruptions();
        setDisruptions(list);

        const paramId = searchParams.get('disruptionId');
        const initialId = paramId ? parseInt(paramId, 10) : (list[0]?.id || null);
        setSelectedDisruptionId(initialId);

        if (initialId) {
          const impact = await api.getImpact(initialId);
          setImpactData(impact);
        }
      } catch (err) {
        console.error('Impact map init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  const handleSelectDisruption = async (id) => {
    setSelectedDisruptionId(id);
    try {
      setLoading(true);
      const impact = await api.getImpact(id);
      setImpactData(impact);
    } catch (err) {
      console.error('Failed to load disruption impact:', err);
    } finally {
      setLoading(false);
    }
  };

  const nodes = impactData?.chain_nodes;
  const currentDisruption = disruptions.find(d => d.id === selectedDisruptionId);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30 flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>Feature 2: Butterfly Effect Engine</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Multi-Echelon Cartography</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Supply Chain Ripple & Transit Map
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Trace how an isolated supplier or port delay cascades through transit legs, destination hubs, and local inventory shortfalls directly into endangered customer contracts.
          </p>
        </div>

        {/* Disruption Dropdown Pill */}
        <div className="flex items-center space-x-3 bg-obsidian-900 px-5 py-3 rounded-2xl border border-white/[0.1] text-xs text-slate-300 shadow-xl">
          <span className="text-slate-400 font-mono uppercase text-[11px] font-bold">Disruption Incident:</span>
          <select
            value={selectedDisruptionId || ''}
            onChange={(e) => handleSelectDisruption(parseInt(e.target.value, 10))}
            className="bg-transparent text-lime font-bold focus:outline-none cursor-pointer text-sm font-mono"
          >
            {disruptions.map((d) => (
              <option key={d.id} value={d.id} className="bg-obsidian-950 text-slate-200">
                {d.code} - {d.title} (+{d.estimated_delay_hours}h)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Butterfly Effect Ripple Explainer Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-obsidian-900 via-rose-950/20 to-obsidian-900 border border-rose-500/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider font-mono text-rose-400">
                  Cascading Impact Chain Detected
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                  High Downstream Vulnerability
                </span>
              </div>
              <p className="text-sm text-white font-medium mt-1">
                A <strong className="text-rose-400">48-hour customs hold at Antwerp</strong> on cold-chain reefer TRK-APX-8801 depletes Frankfurt's safety stock to <strong>0 units</strong> in 18 hours, putting <strong>University Hospital Zurich</strong> and <strong>Charité Berlin</strong> at immediate breach of guaranteed SLAs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">Unmitigated Exposure</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                ₹{(impactData?.financial_exposure || 45600).toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REAL FUNCTIONAL OPENSTREETMAP LEAFLET INTEGRATION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-lime" />
            <h2 className="text-lg font-extrabold text-white">Geographic Supply Route Telemetry</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Pan & Zoom on European Transit Corridors • Click markers for depot data
          </span>
        </div>

        <SupplyChainLeafletMap 
          showRecoveryRoute={true} 
          activeDisruption={currentDisruption}
        />
      </div>

      {/* Visual Topological Node Flow (Image 3 inspired sleek dark modules) */}
      <div className="card-dark p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 font-mono">
            <Network className="w-4 h-4 text-lime" />
            <span>Topological Impact Propagation Graph (5-Stage Echelon Trace)</span>
          </h3>
          <span className="text-xs text-lime font-mono font-bold">Deterministic Dependency Graph</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono">
            Tracing relational supply chain dependencies...
          </div>
        ) : !impactData ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No disruption selected.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Node 1: Supplier */}
            <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/[0.08] flex flex-col justify-between hover:border-cyan-500/40 transition">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">1. Upstream Supplier</span>
                  <Building2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="font-extrabold text-white text-sm">{nodes?.supplier?.name}</div>
                <div className="text-xs text-slate-400 mt-1">{nodes?.supplier?.location}</div>
              </div>
              <div className="mt-5 pt-3 border-t border-white/[0.06] text-xs text-slate-400 font-mono">
                Reliability: <span className="text-lime font-bold">{(nodes?.supplier?.reliability * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Node 2: Shipment */}
            <div className="p-5 rounded-3xl bg-obsidian-900 border border-rose-500/40 bg-rose-950/15 flex flex-col justify-between hover:border-rose-500 transition">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-[11px] font-bold uppercase text-rose-400 font-mono">2. Disrupted Transit</span>
                  <Truck className="w-5 h-5 text-rose-400" />
                </div>
                <div className="font-mono font-extrabold text-white text-sm">{nodes?.shipment?.tracking_number}</div>
                <div className="text-xs text-slate-300 mt-1">{nodes?.shipment?.carrier}</div>
              </div>
              <div className="mt-5 pt-3 border-t border-rose-500/20 text-xs text-rose-400 font-bold flex items-center space-x-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Delayed +{nodes?.shipment?.delay_hours}h</span>
              </div>
            </div>

            {/* Node 3: Warehouse */}
            <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">3. Destination Hub</span>
                  <Warehouse className="w-5 h-5 text-slate-300" />
                </div>
                <div className="font-extrabold text-white text-sm">{nodes?.warehouse?.name}</div>
                <div className="text-xs text-slate-400 mt-1">{nodes?.warehouse?.location}</div>
              </div>
              <div className="mt-5 pt-3 border-t border-white/[0.06] text-xs text-slate-400 font-mono">
                Code: <span className="text-white font-bold">{nodes?.warehouse?.code}</span>
              </div>
            </div>

            {/* Node 4: Usable Inventory */}
            <div className="p-5 rounded-3xl bg-obsidian-900 border border-amber-500/40 bg-amber-950/15 flex flex-col justify-between hover:border-amber-500 transition">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-[11px] font-bold uppercase text-amber-400 font-mono">4. Usable Stock</span>
                  <Boxes className="w-5 h-5 text-amber-400" />
                </div>
                <div className="font-mono font-bold text-white text-sm">{nodes?.inventory?.product_sku}</div>
                <div className="text-xs text-slate-300 mt-1 truncate">{nodes?.inventory?.product_name}</div>
              </div>
              <div className="mt-5 pt-3 border-t border-amber-500/20 text-xs space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Physical: {nodes?.inventory?.physical_quantity}</span>
                  <span>Reserved: {nodes?.inventory?.reserved_quantity}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-rose-400 font-mono">
                  <span>Truly Usable:</span>
                  <span>{nodes?.inventory?.usable_quantity} Units (Deficit!)</span>
                </div>
              </div>
            </div>

            {/* Node 5: Customer Orders */}
            <div className="p-5 rounded-3xl bg-obsidian-900 border border-lime/40 bg-lime/[0.04] flex flex-col justify-between hover:border-lime transition">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-[11px] font-bold uppercase text-lime font-mono">5. Orders Impacted</span>
                  <ShoppingBag className="w-5 h-5 text-lime" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {impactData?.confirmed_affected_orders?.length || 0} Orders
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium font-mono">
                  Contract Exposure:
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-lime/20 text-lg font-black text-lime font-mono">
                ₹{(impactData?.financial_exposure || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmed vs Potential Impacts Tabs */}
      <div className="card-dark p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition font-mono ${
                activeTab === 'confirmed'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white bg-obsidian-900 border border-white/[0.06]'
              }`}
            >
              Confirmed Contract Impacts ({impactData?.confirmed_affected_orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('potential')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition font-mono ${
                activeTab === 'potential'
                  ? 'bg-lime text-obsidian-950 shadow-lg shadow-lime/20'
                  : 'text-slate-400 hover:text-white bg-obsidian-900 border border-white/[0.06]'
              }`}
            >
              Downstream Buffer Strain ({impactData?.potential_affected_orders?.length || 0})
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing impacted customer accounts for {currentDisruption?.code || 'APX-2026-001'}
          </span>
        </div>

        <div className="mt-6 divide-y divide-white/[0.06]">
          {activeTab === 'confirmed' ? (
            impactData?.confirmed_affected_orders?.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-mono">
                No confirmed order deficits for this disruption.
              </div>
            ) : (
              impactData?.confirmed_affected_orders?.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-black text-white text-sm">{ord.order_number}</span>
                      <span className="font-extrabold text-slate-200 text-sm">{ord.customer_name}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono font-bold border border-purple-500/30">
                        {ord.customer_tier}
                      </span>
                    </div>
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{ord.reason}</p>
                  </div>

                  <div className="flex items-center space-x-6 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Order Value</span>
                      <div className="font-mono font-black text-white text-sm">
                        ₹{ord.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <RiskBadge score={ord.risk_score} />
                  </div>
                </div>
              ))
            )
          ) : (
            impactData?.potential_affected_orders?.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-mono">
                No secondary downstream orders impacted.
              </div>
            ) : (
              impactData?.potential_affected_orders?.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-black text-white text-sm">{ord.order_number}</span>
                      <span className="font-extrabold text-slate-200 text-sm">{ord.customer_name}</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1.5">{ord.reason}</p>
                  </div>
                  <div className="font-mono font-black text-white text-sm">
                    ₹{ord.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
