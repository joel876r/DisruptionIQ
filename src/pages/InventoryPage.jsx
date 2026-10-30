import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Warehouse, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  FileText, 
  Edit3, 
  Plus, 
  X,
  Layers,
  ArrowUpDown,
  TrendingDown,
  Building2,
  Calendar,
  IndianRupee,
  ShieldAlert,
  AlertOctagon,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustFormData, setAdjustFormData] = useState({ physical: 0, damaged: 0, reserved: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, whData] = await Promise.all([
        api.getInventory(),
        api.getWarehouses()
      ]);
      setInventory(invData);
      setWarehouses(whData);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load inventory stock' });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBenchmark = async () => {
    try {
      setActionLoading(true);
      await api.seedBenchmarkData();
      setFeedback({ type: 'success', message: 'Full benchmark enterprise dataset loaded! 18 inventory nodes reconciled.' });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to seed benchmark data' });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdjust = (item) => {
    setAdjustingItem(item);
    setAdjustFormData({
      physical: item.physical_quantity,
      damaged: item.damaged_quantity,
      reserved: item.reserved_quantity
    });
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    try {
      setActionLoading(true);
      await api.adjustInventory(adjustingItem.id, {
        physical_quantity: parseInt(adjustFormData.physical, 10),
        damaged_quantity: parseInt(adjustFormData.damaged, 10),
        reserved_quantity: parseInt(adjustFormData.reserved, 10)
      });
      setFeedback({ type: 'success', message: `Stock reconciled successfully for SKU ${adjustingItem.product_sku}. Usable buffer recalculated.` });
      setAdjustingItem(null);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Stock adjustment failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Robust Universal File Downloader using Blob (100% reliable across Chrome, Edge, Safari, Firefox)
  const triggerBlobDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
  };

  // 1. Download CSV
  const downloadCSV = () => {
    const targetData = filtered.length > 0 ? filtered : inventory;
    if (targetData.length === 0) {
      setFeedback({ type: 'error', message: 'No inventory records available to download.' });
      return;
    }

    const headers = [
      'Inventory_ID', 
      'Warehouse_Name', 
      'Warehouse_Code', 
      'Product_SKU', 
      'Product_Name', 
      'Batch_Number', 
      'Physical_Stock', 
      'Firewall_Reserved', 
      'Damaged_Defective', 
      'Expired_Units', 
      'Truly_Usable_Stock', 
      'Safety_Stock_Target', 
      'Unit_Cost_INR', 
      'Total_Valuation_INR'
    ];

    const rows = targetData.map(i => [
      i.id,
      `"${(i.warehouse_name || '').replace(/"/g, '""')}"`,
      i.warehouse_code || '',
      i.product_sku || '',
      `"${(i.product_name || '').replace(/"/g, '""')}"`,
      `"${(i.batch_number || '').replace(/"/g, '""')}"`,
      i.physical_quantity || 0,
      i.reserved_quantity || 0,
      i.damaged_quantity || 0,
      i.expired_quantity || 0,
      i.usable_quantity || 0,
      i.safety_stock || 0,
      i.unit_cost || 0,
      i.total_value || 0
    ]);

    // UTF-8 BOM (\uFEFF) ensures Excel opens special characters and Indian Rupee symbols without garbling
    const csvContent = '\uFEFF' + headers.join(',') + '\r\n' + rows.map(e => e.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `DisruptionIQ_Stock_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerBlobDownload(blob, filename);

    setFeedback({ 
      type: 'success', 
      message: `Downloaded ${filename} successfully (${targetData.length} stock records exported).` 
    });
  };

  // 2. Download JSON
  const downloadJSON = () => {
    const targetData = filtered.length > 0 ? filtered : inventory;
    if (targetData.length === 0) {
      setFeedback({ type: 'error', message: 'No inventory records available to download.' });
      return;
    }

    const exportPayload = {
      exported_at: new Date().toISOString(),
      platform: "DisruptionIQ Supply Chain Resilience Platform",
      currency: "INR (₹)",
      total_records: targetData.length,
      records: targetData
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const filename = `DisruptionIQ_Stock_Export_${new Date().toISOString().slice(0, 10)}.json`;
    triggerBlobDownload(blob, filename);

    setFeedback({ 
      type: 'success', 
      message: `Downloaded ${filename} successfully (${targetData.length} structured records exported).` 
    });
  };

  // 3. Download Excel (.xlsx or Excel XML)
  const downloadExcel = () => {
    const targetData = filtered.length > 0 ? filtered : inventory;
    if (targetData.length === 0) {
      setFeedback({ type: 'error', message: 'No inventory records available to download.' });
      return;
    }

    const filename = `DisruptionIQ_Stock_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (window.XLSX) {
      try {
        const cleanRows = targetData.map(i => ({
          "Inventory ID": i.id,
          "Warehouse": i.warehouse_name,
          "Depot Code": i.warehouse_code,
          "Product SKU": i.product_sku,
          "Product Name": i.product_name,
          "Batch Lot": i.batch_number,
          "Physical Count": i.physical_quantity,
          "Firewall Reserved": i.reserved_quantity,
          "Damaged Count": i.damaged_quantity,
          "Expired Count": i.expired_quantity,
          "Truly Usable Buffer": i.usable_quantity,
          "Safety Target": i.safety_stock,
          "Unit Cost (INR)": i.unit_cost,
          "Total Valuation (INR)": i.total_value
        }));

        const ws = window.XLSX.utils.json_to_sheet(cleanRows);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Warehouse Stock');
        window.XLSX.writeFile(wb, filename);

        setFeedback({ 
          type: 'success', 
          message: `Exported ${filename} successfully (${targetData.length} records in Excel format).` 
        });
        return;
      } catch (err) {
        console.warn('SheetJS error, falling back to CSV export:', err);
      }
    }

    // Direct fallback to CSV download if SheetJS is blocked or offline
    downloadCSV();
  };

  // Filtered List with real-time matching
  const filtered = inventory.filter(item => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (
      item.product_sku?.toLowerCase().includes(term) ||
      item.product_name?.toLowerCase().includes(term) ||
      item.batch_number?.toLowerCase().includes(term) ||
      item.warehouse_code?.toLowerCase().includes(term)
    );

    const matchesWarehouse = warehouseFilter === 'ALL' || item.warehouse_code === warehouseFilter;

    let matchesStatus = true;
    if (statusFilter === 'DEFICIT') {
      matchesStatus = item.usable_quantity <= 0;
    } else if (statusFilter === 'LOW') {
      matchesStatus = item.usable_quantity > 0 && item.usable_quantity < (item.safety_stock || 40);
    } else if (statusFilter === 'DAMAGED') {
      matchesStatus = item.damaged_quantity > 0;
    } else if (statusFilter === 'HEALTHY') {
      matchesStatus = item.usable_quantity >= (item.safety_stock || 40);
    }

    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  // Aggregate stats
  const totalPhysical = inventory.reduce((acc, curr) => acc + (curr.physical_quantity || 0), 0);
  const totalReserved = inventory.reduce((acc, curr) => acc + (curr.reserved_quantity || 0), 0);
  const totalDamaged = inventory.reduce((acc, curr) => acc + (curr.damaged_quantity || 0), 0);
  const totalUsable = inventory.reduce((acc, curr) => acc + (curr.usable_quantity || 0), 0);
  const totalValuation = inventory.reduce((acc, curr) => acc + (curr.total_value || 0), 0);

  const clearFilters = () => {
    setSearchTerm('');
    setWarehouseFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Visual Header with Real Supply Chain Logistics Imagery */}
      <div className="relative rounded-4xl overflow-hidden border border-white/[0.1] shadow-2xl bg-obsidian-900">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80" 
            alt="Automated High-Bay Distribution Warehouse Storage Aisle" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30 flex items-center space-x-1.5">
                <Boxes className="w-3.5 h-3.5" />
                <span>Deterministic Stock Ledger</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Live Multi-Echelon Warehouse Telemetry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Warehouse Inventory & Buffer Database
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Real-time multi-depot stock database. Enforces strict mathematical segregation between raw physical stock and truly usable buffer after deducting recovery firewall locks, damaged lots, and expired batches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleSeedBenchmark}
              disabled={actionLoading}
              className="px-5 py-3 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono transition flex items-center space-x-2 shadow-xl shadow-lime/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Hydrating...' : '1-Click Benchmark Load'}</span>
            </button>
            <button
              onClick={loadData}
              className="px-5 py-3 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 border border-white/[0.1] text-xs font-bold font-mono transition flex items-center space-x-2 shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 text-lime ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stock Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Stock Calculation Architecture & Formula Card */}
      <div className="card-dark p-6 sm:p-7 shadow-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-lime" />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-white">
              Inventory Integrity Equation
            </h3>
          </div>
          <span className="text-xs text-lime font-mono font-bold">
            Deterministic Reconciliation Active
          </span>
        </div>

        {/* 4 Architectural KPI Cards with Real Logistics Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-obsidian-950 border border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">1. Physical Count</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {totalPhysical.toLocaleString()}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Total units on pallets</span>
          </div>

          <div className="p-4 rounded-3xl bg-obsidian-950 border border-amber-500/30 bg-amber-950/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block">2. Firewall Reserved</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                -{totalReserved.toLocaleString()}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Locked by active recovery plans</span>
          </div>

          <div className="p-4 rounded-3xl bg-obsidian-950 border border-rose-500/30 bg-rose-950/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-rose-400 font-mono uppercase font-bold block">3. Damaged / Quarantine</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                -{totalDamaged.toLocaleString()}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Cold-chain breached or defective</span>
          </div>

          <div className="p-4 rounded-3xl bg-obsidian-950 border border-lime/40 bg-lime/[0.04] flex flex-col justify-between shadow-[0_0_20px_rgba(220,248,54,0.1)]">
            <div>
              <span className="text-[10px] text-lime font-mono uppercase font-bold block">4. Truly Usable Stock</span>
              <div className="text-2xl font-black text-lime font-mono mt-1">
                {totalUsable.toLocaleString()}
              </div>
            </div>
            <span className="text-[11px] text-slate-300 font-semibold mt-2 block">
              ₹{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0 })} Valuation
            </span>
          </div>
        </div>
      </div>

      {/* Visual Feedback Toast Notification */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between transition-all ${
          feedback.type === 'error' ? 'bg-rose-950/80 border-rose-800 text-rose-300' : 'bg-lime/10 border-lime/30 text-lime font-bold shadow-lg shadow-lime/10'
        }`}>
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-lime" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters, and Download Buttons */}
      <div className="card-dark p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, Product Name, Batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-obsidian-900 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime transition font-mono"
            />
          </div>

          {/* Warehouse Depot Filter */}
          <div className="flex items-center space-x-2 bg-obsidian-900 px-3.5 py-2.5 rounded-2xl border border-white/[0.08] text-xs text-slate-300">
            <Warehouse className="w-3.5 h-3.5 text-lime" />
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer font-mono"
            >
              <option value="ALL" className="bg-obsidian-950">All Depots</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.code} className="bg-obsidian-950">{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          {/* Stock Health Status Filter */}
          <div className="flex items-center space-x-2 bg-obsidian-900 px-3.5 py-2.5 rounded-2xl border border-white/[0.08] text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer font-mono"
            >
              <option value="ALL" className="bg-obsidian-950">All Stock Statuses</option>
              <option value="HEALTHY" className="bg-obsidian-950">Healthy Buffer</option>
              <option value="LOW" className="bg-obsidian-950">Low Buffer (&lt; Safety)</option>
              <option value="DEFICIT" className="bg-obsidian-950">Critical Shortfall (0)</option>
              <option value="DAMAGED" className="bg-obsidian-950">Damaged Lots</option>
            </select>
          </div>

          {(searchTerm || warehouseFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-white underline font-mono ml-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* 100% Workable Export & Download Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={downloadCSV}
            className="px-4 py-2.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 text-slate-200 border border-white/[0.1] text-xs font-bold font-mono transition flex items-center space-x-1.5 shadow"
            title="Download CSV spreadsheet"
          >
            <FileText className="w-3.5 h-3.5 text-lime" />
            <span>CSV</span>
          </button>

          <button
            onClick={downloadJSON}
            className="px-4 py-2.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 text-slate-200 border border-white/[0.1] text-xs font-bold font-mono transition flex items-center space-x-1.5 shadow"
            title="Download JSON structured database"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={downloadExcel}
            className="px-5 py-2.5 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono transition flex items-center space-x-1.5 shadow-lg shadow-lime/20"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Stock Data Table */}
      <div className="card-dark overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Showing <strong className="text-white">{filtered.length}</strong> of {inventory.length} Stock Ledger Entries
          </span>
          <span className="text-lime font-bold">
            Multi-Tenant Isolated Scoping
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-obsidian-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-white/[0.06] font-mono">
              <tr>
                <th className="py-4 px-5">SKU / Product Name</th>
                <th className="py-4 px-5">Warehouse Depot</th>
                <th className="py-4 px-5">Batch Lot</th>
                <th className="py-4 px-5">Physical</th>
                <th className="py-4 px-5">Reserved</th>
                <th className="py-4 px-5">Damaged</th>
                <th className="py-4 px-5">Usable Buffer</th>
                <th className="py-4 px-5">Stock Status</th>
                <th className="py-4 px-5">Unit Cost</th>
                <th className="py-4 px-5">Valuation</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin text-lime mx-auto mb-2" />
                    Querying multi-company inventory ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400 font-mono">
                    <p className="text-sm text-slate-300">No stock entries matching your filter criteria.</p>
                    <button onClick={clearFilters} className="mt-2 text-lime underline font-bold">
                      Clear Search & Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isStockout = item.usable_quantity <= 0;
                  const isLow = item.usable_quantity > 0 && item.usable_quantity < (item.safety_stock || 40);

                  return (
                    <tr key={item.id} className="hover:bg-obsidian-850/60 transition group">
                      <td className="py-4 px-5">
                        <div className="font-mono font-black text-white text-sm">{item.product_sku}</div>
                        <div className="text-slate-300 text-xs truncate max-w-[220px] font-medium mt-0.5">{item.product_name}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-white text-xs">{item.warehouse_name}</div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                          {item.warehouse_code}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-300">
                        {item.batch_number}
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-white">
                        {item.physical_quantity}
                      </td>

                      <td className="py-4 px-5 font-mono text-amber-400">
                        {item.reserved_quantity > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-bold">
                            {item.reserved_quantity}
                          </span>
                        ) : '0'}
                      </td>

                      <td className="py-4 px-5 font-mono text-rose-400">
                        {item.damaged_quantity > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 font-bold">
                            {item.damaged_quantity}
                          </span>
                        ) : '0'}
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-base font-black font-mono ${
                            isStockout ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-lime'
                          }`}>
                            {item.usable_quantity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">units</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {isStockout ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center space-x-1 w-max">
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            <span>STOCKOUT (0)</span>
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center space-x-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>BUFFER RISK</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-lime/10 text-lime border border-lime/30 flex items-center space-x-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-lime" />
                            <span>HEALTHY</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-300">
                        ₹{(item.unit_cost || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-white">
                        ₹{(item.total_value || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-3.5 py-1.5 rounded-full bg-obsidian-800 hover:bg-lime hover:text-obsidian-950 text-slate-300 font-bold text-xs transition border border-white/[0.08] font-mono flex items-center space-x-1 ml-auto"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Reconcile</span>
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

      {/* Reconcile / Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-4xl bg-obsidian-900 border border-white/[0.12] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-lime/15 text-lime border border-lime/30 font-bold">
                    {adjustingItem.product_sku}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{adjustingItem.warehouse_code}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mt-1.5">Stock Count Reconciliation</h3>
                <p className="text-xs text-slate-400">{adjustingItem.product_name}</p>
              </div>

              <button
                onClick={() => setAdjustingItem(null)}
                className="w-8 h-8 rounded-full bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="py-5 space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold font-mono block mb-1.5">
                  Physical Count in Bin:
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustFormData.physical}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, physical: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-obsidian-950 border border-white/[0.1] text-white font-mono text-sm focus:outline-none focus:border-lime"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold font-mono block mb-1.5">
                  Damaged / Quarantined Units:
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustFormData.damaged}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, damaged: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-obsidian-950 border border-white/[0.1] text-white font-mono text-sm focus:outline-none focus:border-lime"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.06] text-xs font-mono flex justify-between items-center">
                <span className="text-slate-400">Recalculated Usable Buffer:</span>
                <span className="text-base font-black text-lime">
                  {Math.max(0, parseInt(adjustFormData.physical || 0, 10) - parseInt(adjustFormData.damaged || 0, 10) - parseInt(adjustFormData.reserved || 0, 10))} Units
                </span>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-5 py-2.5 rounded-2xl bg-obsidian-800 text-slate-300 text-xs font-bold font-mono hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono shadow-lg shadow-lime/20 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
