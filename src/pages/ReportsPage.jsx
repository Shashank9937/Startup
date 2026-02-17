import React, { useMemo, useState } from 'react';
import { Copy, FileText, Printer } from 'lucide-react';
import { Card, EmptyState, Metric, Progress } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { calculateMonthInJourney, dateISO, money, pct } from '../lib/utils';

const ONE_PAGERS = [
  { id: 'company', label: 'Company Snapshot' },
  { id: 'metrics', label: 'Metrics Dashboard' },
  { id: 'roadmap', label: 'Roadmap Status' },
  { id: 'models', label: 'Mental Models Quick Reference' },
  { id: 'decision', label: 'Decision Framework' },
  { id: 'weekly', label: 'Weekly Plan' }
];

function copyText(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

export default function ReportsPage() {
  const { state, mutate, generateWeeklyReview, generateMonthlyReport } = useAppStore();
  const [selectedOnePager, setSelectedOnePager] = useState('company');

  const latest = [...state.metrics.snapshots].sort((a, b) => a.date.localeCompare(b.date)).at(-1) || {};
  const month = calculateMonthInJourney(state.profile.startDate);

  const checklistProgress = useMemo(() => {
    const total = state.reports.launchChecklist.length;
    const done = state.reports.launchChecklist.filter((item) => item.done).length;
    return { total, done, pct: total ? (done / total) * 100 : 0 };
  }, [state.reports.launchChecklist]);

  const sharePayload = useMemo(() => {
    const summary = {
      company: state.profile.companyName,
      founder: state.profile.founderName,
      month,
      metrics: {
        mrr: latest.mrr || 0,
        customers: latest.customers || 0,
        growth: latest.momGrowth || 0,
        runway: latest.runway || 0
      },
      updatedAt: new Date().toISOString()
    };

    try {
      return `${window.location.origin}${window.location.pathname}#readonly=${btoa(JSON.stringify(summary))}`;
    } catch {
      return '';
    }
  }, [state.profile.companyName, state.profile.founderName, month, latest, state]);

  return (
    <div className="space-y-4">
      <Card title="Reports & Exports" subtitle="Weekly, monthly, investor updates, one-pagers, and launch readiness">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <button className="btn-primary" onClick={generateWeeklyReview}>Generate Weekly Report</button>
          <button className="btn-secondary" onClick={generateMonthlyReport}>Generate Monthly Report</button>
          <button className="btn-secondary" onClick={() => window.print()}><Printer size={14} className="inline mr-1" />Print Current View</button>
          <button className="btn-secondary" onClick={() => copyText(sharePayload)}><Copy size={14} className="inline mr-1" />Copy Read-only Link</button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Launch Checklist" subtitle={`${checklistProgress.done}/${checklistProgress.total} complete`} className="lg:col-span-2">
          <Progress value={checklistProgress.pct} />
          <div className="mt-3 space-y-1">
            {state.reports.launchChecklist.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 p-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) => mutate((draft) => {
                    const target = draft.reports.launchChecklist.find((x) => x.id === item.id);
                    if (target) target.done = e.target.checked;
                  })}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card title="Export Snapshot" subtitle="Stakeholder-ready summary">
          <Metric label="Company" value={state.profile.companyName} />
          <Metric label="Current month" value={`Month ${month}`} />
          <Metric label="MRR" value={money(latest.mrr || 0)} />
          <Metric label="Growth" value={pct(latest.momGrowth || 0)} />
          <p className="text-xs text-slate-500 mt-2 break-all">{sharePayload || 'Unable to generate link'}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Weekly Reports Archive">
          {state.reports.weekly.length === 0 ? <EmptyState message="No weekly reports yet." /> : null}
          <div className="space-y-2">
            {state.reports.weekly.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <p className="text-xs text-slate-500">Week {item.weekStart}</p>
                <p className="text-sm whitespace-pre-wrap">{item.summary}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Monthly Reports Archive">
          {state.reports.monthly.length === 0 ? <EmptyState message="No monthly reports yet." /> : null}
          <div className="space-y-2">
            {state.reports.monthly.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <p className="text-xs text-slate-500">{item.month}</p>
                <p className="text-sm font-medium">{item.headline}</p>
                <p className="text-xs text-slate-500">MRR {money(item.metrics?.mrrStart || 0)} → {money(item.metrics?.mrrEnd || 0)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Print-Friendly One-Pagers" subtitle="Single-page summaries for investors, advisors, and team">
        <div className="flex flex-wrap gap-2 mb-3">
          {ONE_PAGERS.map((item) => (
            <button
              key={item.id}
              className={`btn-secondary ${selectedOnePager === item.id ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => setSelectedOnePager(item.id)}
            >
              <FileText size={14} className="inline mr-1" />{item.label}
            </button>
          ))}
        </div>

        {selectedOnePager === 'company' ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">
            <p><strong>Company:</strong> {state.profile.companyName}</p>
            <p><strong>Founder:</strong> {state.profile.founderName}</p>
            <p><strong>Stage:</strong> {state.profile.stage}</p>
            <p><strong>Date:</strong> {dateISO()}</p>
          </div>
        ) : null}

        {selectedOnePager === 'metrics' ? (
          <div className="grid-cards">
            <Metric label="MRR" value={money(latest.mrr || 0)} />
            <Metric label="Customers" value={latest.customers || 0} />
            <Metric label="Growth" value={pct(latest.momGrowth || 0)} />
            <Metric label="Runway" value={`${latest.runway || 0} months`} />
          </div>
        ) : null}

        {selectedOnePager === 'roadmap' ? (
          <div className="space-y-2">
            {state.roadmap.months.slice(0, 12).map((m) => (
              <div key={m.id} className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 p-2 flex justify-between">
                <span>Month {m.month}: {m.title}</span><span>{m.status}</span>
              </div>
            ))}
          </div>
        ) : null}

        {selectedOnePager === 'models' ? (
          <div className="text-sm rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            Top mastered: {state.knowledge.mentalModels.filter((m) => Number(m.mastery) >= 7).slice(0, 12).map((m) => m.name).join(', ') || 'None yet'}
          </div>
        ) : null}

        {selectedOnePager === 'decision' ? (
          <div className="space-y-2">
            {state.decisions.items.slice(0, 6).map((d) => (
              <div key={d.id} className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <p className="font-medium">{d.statement}</p>
                <p className="text-xs text-slate-500">{d.date} • {d.reversibility}</p>
              </div>
            ))}
          </div>
        ) : null}

        {selectedOnePager === 'weekly' ? (
          <div className="space-y-2">
            {state.dashboard.weeklyGoals.map((g) => (
              <div key={g.id} className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                {g.done ? '✓' : '○'} {g.text}
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
