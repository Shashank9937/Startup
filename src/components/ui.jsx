import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  showSectionActions = true,
  onEdit,
  onUpdate
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [updatedLabel, setUpdatedLabel] = React.useState('');

  const handleEdit = () => {
    const next = !isEditing;
    setIsEditing(next);
    if (onEdit) onEdit(next);
  };

  const handleUpdate = () => {
    setUpdatedLabel(`Updated ${new Date().toLocaleTimeString()}`);
    if (onUpdate) onUpdate();
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-4 shadow-card ${className}`}
    >
      {(title || action || subtitle) ? (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p> : null}
            {updatedLabel ? <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">{updatedLabel}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {action}
            {showSectionActions ? (
              <>
                <button
                  type="button"
                  className={`rounded-md border px-2 py-1 text-xs ${isEditing
                    ? 'border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  onClick={handleEdit}
                >
                  {isEditing ? 'Editing' : 'Edit'}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300"
                  onClick={handleUpdate}
                >
                  Update
                </button>
              </>
            ) : null}
          </div>
        </header>
      ) : null}
      {children}
    </motion.section>
  );
}

export function Metric({ label, value, helper, tone = 'default' }) {
  const toneClass = tone === 'success'
    ? 'text-emerald-600 dark:text-emerald-400'
    : tone === 'warning'
      ? 'text-amber-600 dark:text-amber-300'
      : tone === 'danger'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-slate-900 dark:text-slate-100';

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {helper ? <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helper}</p> : null}
    </div>
  );
}

export function Progress({ value }) {
  const numeric = Math.max(0, Math.min(100, Number(value) || 0));
  const barColor = numeric < 40 ? 'bg-rose-500' : numeric < 75 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div className={`h-full ${barColor}`} style={{ width: `${numeric}%` }} />
    </div>
  );
}

export function StatusBadge({ value }) {
  const classes = value === 'Complete'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    : value === 'In Progress'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      : value === 'Blocked'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>{value}</span>;
}

export function EmptyState({ message = 'No data yet.' }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {message}
    </div>
  );
}

export function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-4 py-2 shadow-lg"
        >
          {toast}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-heading font-semibold text-lg">{title}</h4>
          <button className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
