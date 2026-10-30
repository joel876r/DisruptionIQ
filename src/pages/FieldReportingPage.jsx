import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Send, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Database 
} from 'lucide-react';
import { api } from '../services/api';
import { 
  offlineDb, 
  saveLocalFieldReport, 
  getLocalFieldReports, 
  markReportSynced, 
  markReportFailed 
} from '../services/offlineDb';
import { StatusBadge } from '../components/RiskBadge';

export function FieldReportingPage({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Form state
  const [reportType, setReportType] = useState('DAMAGED_GOODS');
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadLocalData();
    loadServerLookups();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadServerLookups = async () => {
    try {
      const [whList, prodList] = await Promise.all([
        api.getWarehouses(),
        api.getProducts(),
      ]);
      setWarehouses(whList);
      setProducts(prodList);
      if (whList.length > 0) setWarehouseId(whList[0].id.toString());
      if (prodList.length > 0) setProductId(prodList[0].id.toString());
    } catch (err) {
      console.warn('Could not load online lookups (offline mode):', err);
    }
  };

  const loadLocalData = async () => {
    const local = await getLocalFieldReports();
    setReports(local);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const reportPayload = {
        report_type: reportType,
        warehouse_id: warehouseId ? parseInt(warehouseId, 10) : null,
        product_id: productId ? parseInt(productId, 10) : null,
        quantity: parseInt(quantity, 10) || 0,
        severity: severity,
        description: description.trim(),
      };

      const savedLocal = await saveLocalFieldReport(reportPayload);
      setDescription('');
      await loadLocalData();

      if (navigator.onLine) {
        await syncSingleReport(savedLocal);
      } else {
        setSyncMessage('Report saved offline in IndexedDB. Will sync when connectivity returns.');
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const syncSingleReport = async (localReport) => {
    try {
      const res = await api.submitFieldIncident({
        client_event_id: localReport.client_event_id,
        report_type: localReport.report_type,
        description: localReport.description,
        warehouse_id: localReport.warehouse_id,
        product_id: localReport.product_id,
        quantity: localReport.quantity,
        severity: localReport.severity,
      });
      await markReportSynced(localReport.id, res);
      await loadLocalData();
    } catch (err) {
      await markReportFailed(localReport.id, err.message);
      await loadLocalData();
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const local = await getLocalFieldReports();
      const pending = local.filter((r) => r.sync_status === 'PENDING_SYNC' || r.sync_status === 'FAILED');

      let syncedCount = 0;
      for (const rep of pending) {
        await syncSingleReport(rep);
        syncedCount++;
      }

      setSyncMessage(`Synced ${syncedCount} offline incident report(s) successfully with central servers.`);
      await loadLocalData();
    } catch (err) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Connectivity Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Offline Field Reporting</h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-lime text-obsidian-950 font-black">
              Dexie.js IndexedDB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Warehouse floor operators can record stock damage, delivery discrepancies, or shortages even when offline.
          </p>
        </div>

        {/* Connectivity Status Pill */}
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-2 ${
            isOnline
              ? 'bg-lime/10 border-lime/30 text-lime'
              : 'bg-amber-950/70 border-amber-800 text-amber-300'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-lime" />
                <span>ONLINE: Central Sync Active</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>OFFLINE: Local Queue Active</span>
              </>
            )}
          </div>

          <button
            onClick={handleSyncAll}
            disabled={syncing || !isOnline}
            className="px-5 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_15px_rgba(220,248,54,0.3)] transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Queue</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-lime/10 border border-lime/30 text-lime text-xs flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-lime" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Grid: Reporting Form & Local Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Form */}
        <div className="card-dark p-6 lg:col-span-1 space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
            <Radio className="w-4 h-4 text-lime" />
            <span>Submit Floor Report</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Incident Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
              >
                <option value="DAMAGED_GOODS">Damaged Goods in Staging</option>
                <option value="STOCK_SHORTAGE">Physical Stock Shortage</option>
                <option value="CARRIER_DELAY">Unscheduled Carrier Delay</option>
                <option value="URGENT_REQUEST">Urgent Expedite Request</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Warehouse</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Affected SKU</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.sku}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Operational Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                placeholder="Explain what happened (e.g., pallet tip during forklift offloading damaged 10 insulin vials)..."
                className="w-full px-3.5 py-2 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="w-full py-2.5 px-4 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_15px_rgba(220,248,54,0.3)] transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Report</span>
            </button>
          </form>
        </div>

        {/* Local IndexedDB Queue & Reports Stream */}
        <div className="card-dark p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-lime" />
                <span>IndexedDB Queue & Audit Stream</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preserved locally on device. Automatically synchronized with backend via idempotent tokens.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No local field reports stored. Submit a report using the floor console.
              </div>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id || r.client_event_id}
                  className="p-4 rounded-2xl bg-obsidian-900 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white">{r.report_type.replace('_', ' ')}</span>
                      <StatusBadge status={r.sync_status} />
                      <span className="text-[10px] text-slate-500 font-mono">{r.severity}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{r.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Event Token: {r.client_event_id}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <span className="font-mono font-black text-lime text-sm">
                      {r.quantity} Units
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
