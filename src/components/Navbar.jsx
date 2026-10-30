import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  LogOut, 
  ChevronDown,
  Sparkles,
  Search,
  SlidersHorizontal,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

const DEMO_USERS = [
  { label: 'Alex Chen (Analyst)', email: 'analyst@apex.com', company: 'APEX', role: 'Operations Analyst' },
  { label: 'Sarah Jenkins (Manager)', email: 'manager@apex.com', company: 'APEX', role: 'Supply Chain Manager' },
  { label: 'Marco Rossi (Warehouse)', email: 'warehouse@apex.com', company: 'APEX', role: 'Warehouse Operator' },
  { label: 'Elena Rostova (Procurement)', email: 'procurement@apex.com', company: 'APEX', role: 'Procurement Approver' },
  { label: 'David Vance (Admin)', email: 'admin@apex.com', company: 'APEX', role: 'Administrator' },
  { label: 'Liam Murphy (Horizon)', email: 'analyst@horizon.com', company: 'HORIZON', role: 'Operations Analyst (Tenant 2)' },
];

export function Navbar({ currentUser, currentCompany, onUserChange, onOpenNotifications, unreadCount }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSwitch = async (email) => {
    try {
      const res = await api.switchDemo(email);
      onUserChange(res.user, res.company);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    }
  };

  const handleLogout = () => {
    api.logout();
    window.location.reload();
  };

  return (
    <header className="h-20 bg-obsidian-950 border-b border-white/[0.06] sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between">
      {/* Brand Identity directly mirroring Image 2 */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-lime text-obsidian-950 flex items-center justify-center font-black text-sm">
            <Compass className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            disruption<span className="text-lime">.iq</span>
          </span>
        </div>

        {/* Active Company Tenant Pill */}
        <div className="hidden lg:flex items-center space-x-2 ml-4 px-3 py-1.5 rounded-full bg-obsidian-850 border border-white/[0.08] text-xs">
          <Building2 className="w-3.5 h-3.5 text-lime" />
          <span className="text-slate-400">Tenant:</span>
          <span className="font-semibold text-white">{currentCompany?.name || 'Apex Global Logistics'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-obsidian-750 text-lime font-bold">
            {currentCompany?.code || 'APEX'}
          </span>
        </div>
      </div>

      {/* Center Search / Telemetry Quick Bar */}
      <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full bg-obsidian-850 border border-white/[0.07] text-xs text-slate-400 w-80">
        <Search className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-slate-400 text-xs">Search disruptions, tracking, SKUs...</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-obsidian-750 text-slate-400">⌘K</span>
      </div>

      {/* Right Controls: Role Switcher, Notifications, User */}
      <div className="flex items-center space-x-3">
        {/* Judge 1-Click Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] text-xs transition"
          >
            <span className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_#dcf836]"></span>
            <span className="hidden sm:inline text-slate-400">Role:</span>
            <span className="font-bold text-white max-w-[130px] truncate">
              {currentUser?.role || 'Analyst'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-obsidian-900 border border-white/10 shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-white/[0.08] text-[10px] font-bold text-lime uppercase tracking-wider flex items-center justify-between">
                <span>Judge Role Switcher</span>
                <span className="text-slate-500 font-mono">1-Click</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {DEMO_USERS.map((u) => {
                  const isCurrent = currentUser?.email === u.email;
                  return (
                    <button
                      key={u.email}
                      onClick={() => handleSwitch(u.email)}
                      className={`w-full text-left px-4 py-2.5 text-xs flex flex-col hover:bg-obsidian-800 transition ${
                        isCurrent ? 'bg-lime/10 text-lime border-l-2 border-lime' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{u.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-obsidian-800 text-lime">
                          {u.company}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">{u.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] text-slate-300 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[10px] font-black text-obsidian-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Capsule Profile */}
        <div className="flex items-center space-x-2 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-lime to-emerald-400 p-[2px]">
            <div className="w-full h-full rounded-full bg-obsidian-900 flex items-center justify-center font-bold text-xs text-lime">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-obsidian-850 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
