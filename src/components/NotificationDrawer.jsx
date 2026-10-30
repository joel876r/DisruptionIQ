import React from 'react';
import { X, Bell, Check, ExternalLink, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotificationDrawer({ isOpen, onClose, notifications = [], onMarkRead }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm sm:max-w-md h-full bg-obsidian-950 border-l border-white/[0.08] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-20 px-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-lime text-obsidian-950 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-white text-sm">Notifications & Alerts</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-lime text-obsidian-950">
              {notifications.length}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-obsidian-900 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-lime" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border text-xs transition ${
                  n.is_read
                    ? 'bg-obsidian-900/60 border-white/[0.04] text-slate-400'
                    : 'bg-obsidian-900 border-lime/30 text-slate-200 shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 font-bold">
                    {n.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : n.severity === 'WARNING' ? (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-lime shrink-0" />
                    )}
                    <span className="text-white">{n.title}</span>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="text-[10px] text-lime hover:underline flex items-center space-x-0.5 font-bold"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Read</span>
                    </button>
                  )}
                </div>

                <p className="mt-2 text-slate-300 leading-relaxed text-[11px]">{n.message}</p>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/[0.04] font-mono">
                  <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.link && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate(n.link);
                      }}
                      className="text-lime hover:underline flex items-center space-x-1 font-sans font-bold"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
