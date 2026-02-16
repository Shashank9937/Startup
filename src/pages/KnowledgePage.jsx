import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, EmptyState, Progress } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO, nowISO, weekStartISO } from '../lib/utils';

const TABS = [
  { id: 'journal', label: 'Daily Journal' },
  { id: 'review', label: 'Weekly Review' },
  { id: 'models', label: 'Mental Models' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'ideas', label: 'Idea Inbox' },
  { id: 'diet', label: 'Information Diet' }
];

function tabButton(tab, active, setActive) {
  return (
    <button
      key={tab.id}
      className={`px-3 py-1.5 rounded-lg text-sm ${active === tab.id ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
      onClick={() => setActive(tab.id)}
    >
      {tab.label}
    </button>
  );
}

export default function KnowledgePage() {
  const { state, mutate, generateWeeklyReview } = useAppStore();
  const [active, setActive] = useState('journal');
  const [modelSearch, setModelSearch] = useState('');

  const groupedModels = useMemo(() => {
    const filtered = state.knowledge.mentalModels.filter((model) =>
      `${model.name} ${model.tier} ${model.definition}`.toLowerCase().includes(modelSearch.toLowerCase())
    );

    return filtered.reduce((acc, model) => {
      if (!acc[model.tier]) acc[model.tier] = [];
      acc[model.tier].push(model);
      return acc;
    }, {});
  }, [state.knowledge.mentalModels, modelSearch]);

  const exportJournalMarkdown = () => {
    const lines = state.knowledge.dailyJournal.map((entry) => [
      `## ${entry.date}`,
      `- Worked: ${entry.worked || ''}`,
      `- Didn't work: ${entry.didntWork || ''}`,
      `- Insight: ${entry.insight || ''}`,
      ''
    ].join('\n'));

    const blob = new Blob([`# Daily Journal\n\n${lines.join('\n')}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `founderos-journal-${dateISO()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card title="Knowledge Base & Second Brain" subtitle="Capture, synthesize, and operationalize founder knowledge">
        <div className="flex flex-wrap gap-2">{TABS.map((tab) => tabButton(tab, active, setActive))}</div>
      </Card>

      {active === 'journal' ? (
        <Card
          title="Daily Journal"
          subtitle="What worked, what failed, what to do tomorrow"
          action={<button className="btn-secondary" onClick={exportJournalMarkdown}>Export Markdown</button>}
        >
          <button className="btn-primary mb-3" onClick={() => mutate((draft) => {
            draft.knowledge.dailyJournal.unshift({
              id: `journal_${Date.now()}`,
              date: dateISO(),
              worked: '',
              didntWork: '',
              insight: '',
              tomorrowPriorities: ['', '', '']
            });
          })}>+ New Journal Entry</button>

          <div className="space-y-3">
            {state.knowledge.dailyJournal.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input className="input w-auto" type="date" value={entry.date} onChange={(e) => mutate((draft) => {
                    const target = draft.knowledge.dailyJournal.find((j) => j.id === entry.id);
                    if (target) target.date = e.target.value;
                  })} />
                  <button className="text-xs text-rose-500" onClick={() => mutate((draft) => {
                    draft.knowledge.dailyJournal = draft.knowledge.dailyJournal.filter((j) => j.id !== entry.id);
                  })}>Delete</button>
                </div>
                <textarea className="textarea" placeholder="What worked today?" value={entry.worked} onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.dailyJournal.find((j) => j.id === entry.id);
                  if (target) target.worked = e.target.value;
                })} />
                <textarea className="textarea" placeholder="What didn't work?" value={entry.didntWork} onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.dailyJournal.find((j) => j.id === entry.id);
                  if (target) target.didntWork = e.target.value;
                })} />
                <textarea className="textarea" placeholder="Key learning / insight" value={entry.insight} onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.dailyJournal.find((j) => j.id === entry.id);
                  if (target) target.insight = e.target.value;
                })} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {active === 'review' ? (
        <Card
          title="Weekly Review"
          subtitle="Automated synthesis every Friday; editable archive"
          action={<button className="btn-primary" onClick={generateWeeklyReview}>Generate This Week</button>}
        >
          <div className="space-y-3">
            {state.knowledge.weeklyReviews.length === 0 ? <EmptyState message="No weekly reviews yet. Click Generate This Week." /> : null}
            {state.knowledge.weeklyReviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <input className="input w-auto" type="date" value={review.weekStart} onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.weeklyReviews.find((r) => r.id === review.id);
                  if (target) target.weekStart = weekStartISO(new Date(e.target.value));
                })} />
                <textarea className="textarea min-h-20" value={review.summary} onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.weeklyReviews.find((r) => r.id === review.id);
                  if (target) target.summary = e.target.value;
                })} />
                <textarea className="textarea" value={review.goalsProgress || ''} placeholder="Progress on weekly goals" onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.weeklyReviews.find((r) => r.id === review.id);
                  if (target) target.goalsProgress = e.target.value;
                })} />
                <textarea className="textarea" value={review.learnings || ''} placeholder="Key learnings" onChange={(e) => mutate((draft) => {
                  const target = draft.knowledge.weeklyReviews.find((r) => r.id === review.id);
                  if (target) target.learnings = e.target.value;
                })} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {active === 'models' ? (
        <Card title="Mental Models Library" subtitle="50 models by tier with mastery, notes, and usage counter">
          <div className="mb-3 flex items-center gap-2">
            <Search size={16} className="text-slate-500" />
            <input className="input" placeholder="Search models" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} />
          </div>

          <div className="space-y-4">
            {Object.entries(groupedModels).map(([tier, models]) => (
              <section key={tier}>
                <h4 className="font-semibold mb-2">{tier}</h4>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {models.map((model) => (
                    <div key={model.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2">
                      <p className="font-medium text-sm">{model.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{model.definition}</p>
                      <div className="mt-2 space-y-2">
                        <label className="label">Mastery ({model.mastery}/10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={model.mastery}
                          onChange={(e) => mutate((draft) => {
                            const target = draft.knowledge.mentalModels.find((m) => m.id === model.id);
                            if (target) target.mastery = Number(e.target.value);
                          })}
                          className="w-full"
                        />
                        <label className="label">Usage Count</label>
                        <input
                          className="input"
                          type="number"
                          value={model.usageCount}
                          onChange={(e) => mutate((draft) => {
                            const target = draft.knowledge.mentalModels.find((m) => m.id === model.id);
                            if (target) target.usageCount = Number(e.target.value);
                          })}
                        />
                        <textarea
                          className="textarea"
                          placeholder="Personal example notes"
                          value={model.personalNotes}
                          onChange={(e) => mutate((draft) => {
                            const target = draft.knowledge.mentalModels.find((m) => m.id === model.id);
                            if (target) target.personalNotes = e.target.value;
                          })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>
      ) : null}

      {active === 'playbooks' ? (
        <Card title="Playbooks" subtitle="Sales, Growth, Product, Fundraising, Hiring">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(state.knowledge.playbooks).map(([key, value]) => (
              <div key={key}>
                <label className="label">{key} playbook</label>
                <textarea className="textarea min-h-36" value={value} onChange={(e) => mutate((draft) => {
                  draft.knowledge.playbooks[key] = e.target.value;
                })} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {active === 'interviews' ? (
        <Card title="Customer Interview Notes" subtitle="Capture signals, patterns, and follow-up actions">
          <button className="btn-primary mb-3" onClick={() => mutate((draft) => {
            draft.knowledge.interviews.unshift({
              id: `interview_${Date.now()}`,
              date: dateISO(),
              customer: '',
              problemIntensity: 5,
              willingnessToPay: 'maybe',
              keyQuotes: '',
              painPoints: '',
              currentSolutions: '',
              featureRequests: '',
              followUp: ''
            });
          })}>+ New Interview</button>
          <button className="btn-secondary mb-3 ml-2" onClick={() => mutate((draft) => {
            const intensity = draft.knowledge.interviews.reduce((sum, i) => sum + Number(i.problemIntensity || 0), 0) / Math.max(1, draft.knowledge.interviews.length);
            draft.knowledge.ideaInbox.unshift({
              id: `idea_${Date.now()}`,
              text: `AI Analysis: Avg pain intensity ${intensity.toFixed(1)}. Top pattern: ${draft.knowledge.interviews[0]?.painPoints || 'N/A'}`,
              tags: ['ai-analysis', 'interview-patterns'],
              createdAt: nowISO(),
              processed: false
            });
          })}>AI: Analyze all interviews</button>

          <div className="space-y-2">
            {state.knowledge.interviews.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <div className="grid gap-2 sm:grid-cols-4">
                  <input className="input" type="date" value={interview.date} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.date = e.target.value; })} />
                  <input className="input" placeholder="Customer/company" value={interview.customer} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.customer = e.target.value; })} />
                  <input className="input" type="number" min="1" max="10" value={interview.problemIntensity} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.problemIntensity = Number(e.target.value); })} />
                  <select className="select" value={interview.willingnessToPay} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.willingnessToPay = e.target.value; })}>
                    <option value="yes">yes</option><option value="maybe">maybe</option><option value="no">no</option>
                  </select>
                </div>
                <textarea className="textarea" placeholder="Key quotes" value={interview.keyQuotes} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.keyQuotes = e.target.value; })} />
                <textarea className="textarea" placeholder="Pain points" value={interview.painPoints} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.painPoints = e.target.value; })} />
                <textarea className="textarea" placeholder="Current solutions" value={interview.currentSolutions} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.currentSolutions = e.target.value; })} />
                <textarea className="textarea" placeholder="Feature requests" value={interview.featureRequests} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.featureRequests = e.target.value; })} />
                <textarea className="textarea" placeholder="Follow-up actions" value={interview.followUp} onChange={(e) => mutate((d) => { const t = d.knowledge.interviews.find((i) => i.id === interview.id); if (t) t.followUp = e.target.value; })} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {active === 'ideas' ? (
        <Card title="Idea Inbox" subtitle="Capture now, process later">
          <div className="flex gap-2 mb-2">
            <input id="new_idea_text" className="input" placeholder="Capture idea quickly" />
            <button className="btn-primary" onClick={() => {
              const input = document.getElementById('new_idea_text');
              if (!input?.value.trim()) return;
              mutate((draft) => {
                draft.knowledge.ideaInbox.unshift({
                  id: `idea_${Date.now()}`,
                  text: input.value.trim(),
                  tags: ['captured'],
                  createdAt: nowISO(),
                  processed: false
                });
              });
              input.value = '';
            }}>Add</button>
          </div>
          <div className="space-y-2">
            {state.knowledge.ideaInbox.map((idea) => (
              <div key={idea.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm">{idea.text}</p>
                  <p className="text-xs text-slate-500">{(idea.tags || []).join(', ')}</p>
                </div>
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={idea.processed} onChange={(e) => mutate((d) => {
                    const target = d.knowledge.ideaInbox.find((i) => i.id === idea.id);
                    if (target) target.processed = e.target.checked;
                  })} /> Processed
                </label>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {active === 'diet' ? (
        <Card title="Information Diet" subtitle="Protect attention and upgrade signal quality">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <h4 className="font-semibold mb-2">Weekly Consumption Tracker</h4>
              {state.knowledge.infoDiet.consumption.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label">Tier 1 hours</label><input className="input" type="number" value={item.tier1Hours} onChange={(e) => mutate((d) => { d.knowledge.infoDiet.consumption[0].tier1Hours = Number(e.target.value); })} /></div>
                    <div><label className="label">Tier 2 items</label><input className="input" type="number" value={item.tier2Items} onChange={(e) => mutate((d) => { d.knowledge.infoDiet.consumption[0].tier2Items = Number(e.target.value); })} /></div>
                    <div><label className="label">Tier 3 items</label><input className="input" type="number" value={item.tier3Items} onChange={(e) => mutate((d) => { d.knowledge.infoDiet.consumption[0].tier3Items = Number(e.target.value); })} /></div>
                    <div><label className="label">Tier 4 violations</label><input className="input" type="number" value={item.tier4Violations} onChange={(e) => mutate((d) => { d.knowledge.infoDiet.consumption[0].tier4Violations = Number(e.target.value); })} /></div>
                  </div>
                </div>
              ))}
            </section>
            <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <h4 className="font-semibold mb-2">Curated Sources & Quarantine</h4>
              <div className="space-y-1 text-sm">
                {state.knowledge.infoDiet.sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between">
                    <span>{source.name} ({source.type})</span>
                    <span>Quality {source.quality}/10</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm">
                <p>News Fast Streak: <strong>{state.knowledge.infoDiet.newsFastStreak} days</strong></p>
                <p>Social Posting Limit: <strong>{state.knowledge.infoDiet.socialMinutesLimit} mins/day</strong></p>
              </div>
            </section>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
