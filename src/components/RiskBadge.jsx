import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function RiskBadge({ level, score }) {
  const normalized = (level || '').toUpperCase();

  if (normalized === 'CRITICAL' || score >= 80) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>CRITICAL</span>
        {score !== undefined && <span className="font-mono text-[10px] text-rose-400">({score})</span>}
      </span>
    );
  }

  if (normalized === 'HIGH' || (score >= 60 && score < 80)) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>HIGH</span>
        {score !== undefined && <span className="font-mono text-[10px] text-amber-400">({score})</span>}
      </span>
    );
  }

  if (normalized === 'MEDIUM' || (score >= 35 && score < 60)) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-obsidian-800 text-slate-300 border border-white/[0.08]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>MEDIUM</span>
        {score !== undefined && <span className="font-mono text-[10px] text-slate-400">({score})</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-lime/10 text-lime border border-lime/30">
      <span className="w-1.5 h-1.5 rounded-full bg-lime"></span>
      <span>LOW / SAFE</span>
      {score !== undefined && <span className="font-mono text-[10px]">({score})</span>}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();

  if (['APPROVED', 'COMPLETED', 'RESOLVED', 'SYNCED'].includes(s)) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-lime text-obsidian-950 shadow-[0_0_12px_rgba(220,248,54,0.3)]">
        <span>{status}</span>
      </span>
    );
  }

  if (['AWAITING_APPROVAL', 'INVESTIGATING', 'RECOVERING', 'PENDING_SYNC'].includes(s)) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span>{status}</span>
      </span>
    );
  }

  if (['AT_RISK', 'CRITICAL', 'FAILED', 'REJECTED', 'STALE'].includes(s)) {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium bg-obsidian-800 text-slate-300 border border-white/[0.08]">
      <span>{status}</span>
    </span>
  );
}
