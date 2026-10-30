import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertOctagon, 
  PackageSearch, 
  Network, 
  GitFork, 
  CheckSquare, 
  History, 
  Radio, 
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, badge: 'Live' },
  { path: '/disruptions', label: 'Disruptions', icon: AlertOctagon, badge: 'Active' },
  { path: '/orders', label: 'Orders at Risk', icon: PackageSearch },
  { path: '/impact-map', label: 'Impact Graph', icon: Network },
  { path: '/recovery', label: 'Recovery Arena', icon: GitFork, badge: 'Firewall' },
  { path: '/inventory', label: 'Stock Database', icon: Boxes, badge: 'DB' },
  { path: '/converter', label: 'Excel Converter', icon: FileSpreadsheet },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare },
  { path: '/outcomes', label: 'Outcomes Intel', icon: History },
  { path: '/field-reports', label: 'Field Incident', icon: Radio },
  { path: '/settings', label: 'Settings & Audit', icon: Settings },
];

export function Sidebar({ userRole }) {
  return (
    <aside className="w-64 bg-obsidian-950 border-r border-white/[0.06] flex flex-col justify-between py-6 px-4 select-none shrink-0">
      <div className="space-y-6">
        <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Navigation
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition duration-150 ${
                    isActive
                      ? 'bg-white text-obsidian-950 shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-obsidian-850'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-obsidian-950' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-obsidian-950 text-lime'
                          : 'bg-obsidian-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Capsule Mode Pill from Image 2 */}
      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/[0.06]">
          <div className="flex items-center space-x-2 text-white font-bold text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-lime" />
            <span>RBAC Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Role: <span className="text-lime font-semibold">{userRole}</span>
          </p>
        </div>

        {/* Theme pill aesthetic directly from Image 2 */}
        <div className="flex items-center justify-between p-1 rounded-full bg-obsidian-900 border border-white/[0.06] text-xs">
          <div className="flex items-center space-x-1 px-3 py-1 text-slate-500 text-[11px]">
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-obsidian-750 text-white font-semibold text-[11px] shadow-sm">
            <Moon className="w-3.5 h-3.5 text-lime" />
            <span>Dark</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
