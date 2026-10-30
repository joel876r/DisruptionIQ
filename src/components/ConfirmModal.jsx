import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', confirmStyle = 'primary', onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-obsidian-900 border border-white/[0.1] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              confirmStyle === 'danger' 
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800' 
                : 'bg-lime text-obsidian-950 shadow-[0_0_15px_rgba(220,248,54,0.3)]'
            }`}>
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-extrabold text-white">{title}</h3>
          </div>
          <button 
            onClick={onCancel} 
            className="w-8 h-8 rounded-full bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3.5 text-xs text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end space-x-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:bg-obsidian-800 border border-white/[0.08] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-full text-xs font-black shadow transition flex items-center space-x-1.5 ${
              confirmStyle === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50'
                : 'bg-lime hover:bg-lime-400 text-obsidian-950 shadow-[0_0_15px_rgba(220,248,54,0.3)] disabled:opacity-50'
            }`}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></span>}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
