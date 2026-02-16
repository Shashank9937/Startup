import React, { useMemo, useState } from 'react';
import { Card, EmptyState, Metric } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO, nowISO } from '../lib/utils';

function preMortem(text) {
  const risks = [
    'Assumptions are based on too little data',
    'Execution bandwidth is underestimated',
    'Customer adoption friction is higher than expected',
    'Hidden dependencies block delivery',
    'Decision quality drops due to urgency bias'
  ];

  return {
    id: `premortem_${Date.now()}`,
    date: nowISO(),
    decisionDraft: text,
    failures: risks,
    mitigations: [
      'Define leading indicators and early warning thresholds',
      'Add a reversal checkpoint in 2-4 weeks',
      'Assign explicit owner and cadence'
    ]
  };
}

export default function DecisionPage() {
  const { state, mutate } = useAppStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [draft, setDraft] = useState({
    statement: '',
    date: dateISO(),
    context: '',
    options: '',
    criteria: '',
    chosen: '',
    reasoning: '',
    expectedOutcomes: '',
    mentalModels: '',
    reversibility: 'Two-way',
    monitoringPlan: '',
    reviewDate: dateISO(),
    reversalCriteria: '',
    tags: ''
  });

  const filtered = useMemo(() => {
    return state.decisions.items.filter((item) => {
      const hay = `${item.statement} ${item.reasoning} ${item.tags?.join(' ')}`.toLowerCase();
      const matchesSearch = !search || hay.includes(search.toLowerCase());
      const matchesCategory = category === 'all' || (item.tags || []).includes(category);
      return matchesSearch && matchesCategory;
    });
  }, [state.decisions.items, search, category]);

  const modelUsage = useMemo(() => {
    const map = {};
    state.decisions.items.forEach((decision) => {
      (decision.mentalModels || []).forEach((model) => {
        map[model] = (map[model] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [state.decisions.items]);

  const avgDecisionSpeed = 2.4;

  return (
    <div className="space-y-4">
      <Card title="Decision Entry" subtitle="Document reversible and irreversible bets with explicit monitoring">
        <div className="grid gap-2 md:grid-cols-2">
          <input className="input" placeholder="Decision statement" value={draft.statement} onChange={(e) => setDraft((p) => ({ ...p, statement: e.target.value }))} />
          <input className="input" type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} />
          <textarea className="textarea" placeholder="Context" value={draft.context} onChange={(e) => setDraft((p) => ({ ...p, context: e.target.value }))} />
          <textarea className="textarea" placeholder="Options considered (one per line)" value={draft.options} onChange={(e) => setDraft((p) => ({ ...p, options: e.target.value }))} />
          <textarea className="textarea" placeholder="Decision criteria" value={draft.criteria} onChange={(e) => setDraft((p) => ({ ...p, criteria: e.target.value }))} />
          <textarea className="textarea" placeholder="Chosen option" value={draft.chosen} onChange={(e) => setDraft((p) => ({ ...p, chosen: e.target.value }))} />
          <textarea className="textarea" placeholder="Reasoning" value={draft.reasoning} onChange={(e) => setDraft((p) => ({ ...p, reasoning: e.target.value }))} />
          <textarea className="textarea" placeholder="Expected outcomes (base/best/worst)" value={draft.expectedOutcomes} onChange={(e) => setDraft((p) => ({ ...p, expectedOutcomes: e.target.value }))} />
          <input className="input" placeholder="Mental models used (comma separated)" value={draft.mentalModels} onChange={(e) => setDraft((p) => ({ ...p, mentalModels: e.target.value }))} />
          <select className="select" value={draft.reversibility} onChange={(e) => setDraft((p) => ({ ...p, reversibility: e.target.value }))}>
            <option>Two-way</option>
            <option>One-way</option>
          </select>
          <textarea className="textarea" placeholder="Monitoring plan" value={draft.monitoringPlan} onChange={(e) => setDraft((p) => ({ ...p, monitoringPlan: e.target.value }))} />
          <input className="input" type="date" value={draft.reviewDate} onChange={(e) => setDraft((p) => ({ ...p, reviewDate: e.target.value }))} />
          <textarea className="textarea" placeholder="Reversal criteria" value={draft.reversalCriteria} onChange={(e) => setDraft((p) => ({ ...p, reversalCriteria: e.target.value }))} />
          <input className="input" placeholder="Tags/categories (comma separated)" value={draft.tags} onChange={(e) => setDraft((p) => ({ ...p, tags: e.target.value }))} />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button className="btn-primary" onClick={() => {
            if (!draft.statement.trim()) return;
            mutate((s) => {
              s.decisions.items.unshift({
                id: `decision_${Date.now()}`,
                date: draft.date,
                statement: draft.statement,
                context: draft.context,
                options: draft.options.split('\n').filter(Boolean),
                criteria: draft.criteria,
                chosen: draft.chosen,
                reasoning: draft.reasoning,
                expectedOutcomes: draft.expectedOutcomes,
                mentalModels: draft.mentalModels.split(',').map((x) => x.trim()).filter(Boolean),
                reversibility: draft.reversibility,
                monitoringPlan: draft.monitoringPlan,
                reviewDate: draft.reviewDate,
                reversalCriteria: draft.reversalCriteria,
                tags: draft.tags.split(',').map((x) => x.trim()).filter(Boolean),
                qualityScore: 0,
                reviewStatus: 'pending'
              });
            });
            setDraft((p) => ({ ...p, statement: '', context: '', options: '', criteria: '', chosen: '', reasoning: '', expectedOutcomes: '', mentalModels: '', monitoringPlan: '', reversalCriteria: '', tags: '' }));
          }}>Save Decision</button>
          <button className="btn-secondary" onClick={() => mutate((s) => {
            s.decisions.premortems.unshift(preMortem(draft.statement || 'Untitled decision'));
          })}>Run Pre-Mortem</button>
        </div>
      </Card>

      <Card title="Decision Dashboard" subtitle="Timeline, search, filters, and quality analytics">
        <div className="grid gap-2 md:grid-cols-3 mb-3">
          <input className="input" placeholder="Search decisions" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="input" placeholder="Filter by tag" value={category === 'all' ? '' : category} onChange={(e) => setCategory(e.target.value || 'all')} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Total decisions" value={state.decisions.items.length} />
            <Metric label="Avg decision speed" value={`${avgDecisionSpeed} days`} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <Metric label="Most-used model" value={modelUsage[0]?.[0] || 'N/A'} helper={`${modelUsage[0]?.[1] || 0} uses`} />
          <Metric label="Pending reviews" value={state.decisions.items.filter((d) => d.reviewStatus !== 'done').length} />
          <Metric label="Two-way decisions" value={state.decisions.items.filter((d) => d.reversibility === 'Two-way').length} />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? <EmptyState message="No decisions found" /> : null}
          {filtered.map((decision) => (
            <article key={decision.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <p className="font-semibold">{decision.statement}</p>
                  <p className="text-xs text-slate-500">{decision.date} • {decision.reversibility}</p>
                </div>
                <button className="text-rose-500 text-xs" onClick={() => mutate((s) => {
                  s.decisions.items = s.decisions.items.filter((x) => x.id !== decision.id);
                })}>Delete</button>
              </div>
              <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{decision.reasoning}</p>
              <p className="text-xs mt-1 text-slate-500">Review date: {decision.reviewDate} • Reversal: {decision.reversalCriteria}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(decision.mentalModels || []).map((model) => <span key={`${decision.id}_${model}`} className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">{model}</span>)}
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card title="Pre-Mortem Queue" subtitle="Potential failures and mitigations before committing irreversible bets">
        {state.decisions.premortems.length === 0 ? <EmptyState message="No pre-mortems generated" /> : null}
        <div className="space-y-2">
          {state.decisions.premortems.map((item) => (
            <div key={item.id} className="rounded-xl border border-amber-200 dark:border-amber-700/40 p-3 bg-amber-50/70 dark:bg-amber-950/20">
              <p className="font-medium text-sm">{item.decisionDraft}</p>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {item.failures.map((f) => <li key={`${item.id}_${f}`}>{f}</li>)}
              </ul>
              <p className="text-xs text-slate-500 mt-2">Mitigations: {item.mitigations.join(' • ')}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
