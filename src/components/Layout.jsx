import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Brain,
  BookOpen,
  Bot,
  ChartColumn,
  FileText,
  Gauge,
  Home,
  Network,
  Settings,
  Target,
  TrendingUp,
  Menu,
  X,
  Bell,
  Upload,
  Download,
  CloudUpload,
  CloudDownload,
  Printer
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/execution', label: 'Execution Roadmap', icon: Target, badgeKey: 'roadmapProgress' },
  { path: '/metrics', label: 'Metrics & Analytics', icon: ChartColumn },
  { path: '/knowledge', label: 'Knowledge Base', icon: Brain },
  { path: '/learning', label: 'Learning Tracker', icon: BookOpen },
  { path: '/decisions', label: 'Decision Log', icon: Gauge },
  { path: '/ai', label: 'AI Agents & Workflows', icon: Bot },
  { path: '/network', label: 'Network & Contacts', icon: Network },
  { path: '/fundraising', label: 'Fundraising Tracker', icon: TrendingUp },
  { path: '/reports', label: 'Reports & One-Pagers', icon: FileText },
  { path: '/settings', label: 'Settings & Export', icon: Settings }
];

function NavItem({ item, badge, onSelect }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onSelect}
      className={({ isActive }) => `flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition ${
        isActive
          ? 'bg-primary-600 text-white shadow'
          : 'bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        <span className="text-sm font-medium">{item.label}</span>
      </span>
      {badge ? <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">{badge}</span> : null}
    </NavLink>
  );
}

export default function Layout({
  children,
  badges,
  onToggleTheme,
  darkMode,
  syncBusy,
  syncMeta,
  onExport,
  onImport,
  onPull,
  onPush,
  onPrint
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const inputRef = React.useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 p-4 border-r border-slate-200 dark:border-slate-800 flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600">FounderOS Ultimate</p>
            <h1 className="font-heading text-2xl font-semibold mt-1">Zero → Series A</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Comprehensive operating system</p>
          </div>
          <nav className="space-y-2 overflow-y-auto pr-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.path} item={item} badge={item.badgeKey ? badges[item.badgeKey] : null} />
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button className="lg:hidden p-2 rounded-lg bg-slate-200 dark:bg-slate-800" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Execution Command Center</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{syncBusy ? 'Syncing data...' : `Last sync: ${syncMeta}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">{darkMode ? '☀️' : '🌙'}</button>
                <button className="icon-btn" onClick={onPrint} aria-label="Print"><Printer size={16} /></button>
                <button className="icon-btn" onClick={onExport} aria-label="Export"><Download size={16} /></button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onImport(file);
                    event.target.value = '';
                  }}
                />
                <button className="icon-btn" onClick={() => inputRef.current?.click()} aria-label="Import"><Upload size={16} /></button>
                <button className="icon-btn" onClick={onPull} aria-label="Pull from cloud"><CloudDownload size={16} /></button>
                <button className="icon-btn" onClick={onPush} aria-label="Push to cloud"><CloudUpload size={16} /></button>
                <button className="icon-btn" aria-label="Notifications"><Bell size={16} /></button>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 py-5">{children}</main>

          <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 z-30">
            <div className="grid grid-cols-5 gap-1 p-2">
              {NAV_ITEMS.slice(0, 5).map((item) => (
                <NavLink
                  key={`mobile_${item.path}`}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `flex flex-col items-center py-1 text-[10px] ${isActive ? 'text-primary-600' : 'text-slate-500'}`}
                >
                  <item.icon size={14} />
                  <span>{item.label.split(' ')[0]}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 p-4 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">FounderOS</h2>
              <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800" onClick={() => setMobileOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={`drawer_${item.path}`}
                  item={item}
                  badge={item.badgeKey ? badges[item.badgeKey] : null}
                  onSelect={() => setMobileOpen(false)}
                />
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
