import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Upload, 
  RotateCcw, 
  History, 
  CheckCircle, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import { ConfirmModal } from '../components/ConfirmModal';

export function SettingsPage({ currentUser, currentCompany }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // CSV Import State
  const [importEntity, setImportEntity] = useState('suppliers');
  const [csvFile, setCsvFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  // Reset Demo Modal State
  const [resetModal, setResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setImportLoading(true);
    setImportResult(null);
    setImportError('');
    try {
      const res = await api.importCsv(importEntity, csvFile);
      setImportResult(res);
      setCsvFile(null);
      await loadLogs();
    } catch (err) {
      setImportError(err.message || 'CSV Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setResetLoading(true);
      setResetMsg('');
      await api.resetDemoData();
      setResetMsg('Synthetic demonstration database reset and re-seeded successfully.');
      setResetModal(false);
      await loadLogs();
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings & Audit Governance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Tenant identity, Role-Based Access Control matrix, CSV data onboarding, and immutable audit logs.
        </p>
      </div>

      {resetMsg && (
        <div className="p-3.5 rounded-2xl bg-lime/10 border border-lime/30 text-lime text-xs flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetMsg}</span>
        </div>
      )}

      {/* Grid: Tenant Info & CSV Bulk Import */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company & User Card */}
        <div className="card-dark p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-lime" />
            <span>Tenant & Identity</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Active Tenant</span>
              <div className="font-extrabold text-white text-sm mt-0.5">{currentCompany?.name}</div>
              <div className="text-[11px] font-mono text-lime mt-0.5">Tenant Code: {currentCompany?.code}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-obsidian-900 border border-white/[0.04]">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Authenticated User</span>
              <div className="font-extrabold text-white text-sm mt-0.5">{currentUser?.full_name}</div>
              <div className="text-[11px] text-slate-400">{currentUser?.email}</div>
              <div className="text-[11px] font-bold text-lime mt-1 font-mono">Role: {currentUser?.role}</div>
            </div>
          </div>

          {/* Demo Reset Tool */}
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="text-[11px] text-slate-400 mb-2">
              Judges evaluation reset tool. Restores original synthetic benchmark disruption scenarios.
            </div>
            <button
              onClick={() => setResetModal(true)}
              disabled={!isAdmin}
              className="w-full py-2.5 px-4 rounded-full bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 hover:text-white border border-white/[0.08] text-xs font-bold transition flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Re-seed Demo Data</span>
            </button>
            {!isAdmin && (
              <span className="block text-[10px] text-slate-500 text-center mt-1">
                (Requires Administrator role)
              </span>
            )}
          </div>
        </div>

        {/* CSV Bulk Import */}
        <div className="card-dark p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-lime" />
              <span>CSV Data Import Engine with Quarantine Validation</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload CSV files for suppliers, products, or shipments. The backend validates required columns, references, and quantities, rejecting invalid rows with clear quarantine reports.
          </p>

          <form onSubmit={handleCsvUpload} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Entity Type</label>
                <select
                  value={importEntity}
                  onChange={(e) => setImportEntity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-lime"
                >
                  <option value="suppliers">Suppliers CSV</option>
                  <option value="products">Products & Medical SKUs CSV</option>
                  <option value="shipments">Shipments & Carriers CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">CSV File</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-slate-300 text-xs focus:outline-none file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:bg-lime file:text-obsidian-950 file:font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={importLoading || !csvFile}
              className="px-5 py-2 rounded-full bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black shadow-[0_0_15px_rgba(220,248,54,0.3)] transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {importLoading && <span className="w-3.5 h-3.5 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></span>}
              <span>Run Validation & Import</span>
            </button>
          </form>

          {importError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importResult && (
            <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center space-x-2 font-bold text-white">
                <CheckCircle className="w-4 h-4 text-lime" />
                <span>Import Batch Report</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div>Imported Successfully: <strong className="text-lime">{importResult.imported_count}</strong></div>
                <div>Quarantined Errors: <strong className="text-rose-400">{importResult.error_count}</strong></div>
              </div>

              {importResult.quarantine_errors?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-bold text-rose-400 uppercase">Quarantined Row Explanations:</span>
                  <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                    {importResult.quarantine_errors.map((err, idx) => (
                      <div key={idx} className="text-[11px] text-slate-400">
                        Row #{err.row}: <span className="text-rose-300">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="card-dark overflow-hidden border border-white/[0.06]">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-lime" />
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Immutable Security Audit Trail</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Strict Tenant Ownership</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-obsidian-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Details Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
              {loadingLogs ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans text-xs">
                    Loading immutable audit trail...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans text-xs">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-obsidian-850/60 transition">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-sans">
                      {log.actor_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-lime text-obsidian-950 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.target_type} {log.target_id && `(#${log.target_id})`}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[280px] truncate text-[10px]">
                      {log.details_json || '{}'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={resetModal}
        title="Reset Demo Dataset"
        message="This will re-initialize and seed the SQLite database with the standard benchmark disruption scenarios for Apex and Horizon. All temporary simulated actions and approvals will be cleared."
        confirmText="Confirm Reset"
        confirmStyle="danger"
        isLoading={resetLoading}
        onConfirm={handleResetDemo}
        onCancel={() => setResetModal(false)}
      />
    </div>
  );
}
