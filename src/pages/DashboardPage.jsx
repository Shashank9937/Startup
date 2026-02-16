import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import GoalDnDList from '../components/GoalDnDList';
import { Card, Metric, Modal, Progress } from '../components/ui';
import {
  calculateDayInJourney,
  calculateMonthInJourney,
  dateISO,
  money,
  num,
  pct,
  reorder,
  runwayTone
} from '../lib/utils';
import { useAppStore } from '../context/AppContext';

function toneToMetric(tone) {
  if (tone === 'danger') return 'danger';
  if (tone === 'warning') return 'warning';
  return 'success';
}

function computeDailyStreak(dates) {
  if (!dates?.length) return 0;
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = dateISO(cursor);
    if (!set.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function DashboardPage() {
  const { state, mutate, generateWeeklyReview } = useAppStore();
  const navigate = useNavigate();
  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [metricDraft, setMetricDraft] = useState({
    date: dateISO(),
    mrr: 0,
    arr: 0,
    customers: 0,
    wau: 0,
    retention: 0,
    momGrowth: 0,
    runway: 0,
    conversations: 0,
    burnRate: 0,
    churn: 0,
    nrr: 0,
    cac: 0,
    ltv: 0,
    payback: 0,
    grossMargin: 0,
    magicNumber: 0,
    northStar: 0,
    newCustomers: 0
  });

  const sortedSnapshots = useMemo(
    () => [...state.metrics.snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [state.metrics.snapshots]
  );
  const latest = sortedSnapshots.at(-1) || {};

  const journeyDay = calculateDayInJourney(state.profile.startDate);
  const currentMonth = calculateMonthInJourney(state.profile.startDate);

  const goalsCompleted = state.dashboard.weeklyGoals.filter((goal) => goal.done).length;
  const milestones = [...state.dashboard.deadlines].sort((a, b) => a.date.localeCompare(b.date));

  const quickStats = {
    booksRead: state.learning.books.filter((book) => book.status === 'Complete').length,
    modelsMastered: state.knowledge.mentalModels.filter((m) => Number(m.mastery) >= 7).length,
    aiHoursSaved: state.ai.hoursSavedLogs.reduce((sum, log) => sum + (Number(log.withoutAi) - Number(log.withAi)), 0),
    decisionsLogged: state.decisions.items.length
  };

  const journalStreak = useMemo(
    () => computeDailyStreak(state.knowledge.dailyJournal.map((entry) => entry.date)),
    [state.knowledge.dailyJournal]
  );

  const convoStreak = useMemo(() => {
    let streak = 0;
    for (let i = sortedSnapshots.length - 1; i >= 0; i -= 1) {
      if (num(sortedSnapshots[i].conversations) >= 25) streak += 1;
      else break;
    }
    return streak;
  }, [sortedSnapshots]);

  const smartSuggestions = useMemo(() => {
    const items = [];

    if (num(latest.conversations) < 25) {
      items.push({
        id: 'cust-convos',
        tone: 'warning',
        text: 'Customer conversations below 25/week. Schedule 5 calls/day until this target is met.'
      });
    }

    if (num(latest.runway) < 6) {
      items.push({
        id: 'runway-risk',
        tone: 'danger',
        text: 'Runway below 6 months. Cut non-core burn and accelerate revenue collection immediately.'
      });
    }

    if (currentMonth <= 2 && state.knowledge.interviews.length < 25) {
      items.push({
        id: 'validation',
        tone: 'warning',
        text: `Month ${currentMonth} requires deep validation. Complete at least ${25 - state.knowledge.interviews.length} additional interviews.`
      });
    }

    if (goalsCompleted < 2) {
      items.push({
        id: 'weekly-focus',
        tone: 'warning',
        text: 'Weekly goals are slipping. Reduce WIP and lock next 48 hours to top one outcome.'
      });
    }

    if (!items.length) {
      items.push({
        id: 'on-track',
        tone: 'success',
        text: 'Execution looks on track. Keep compounding and push one decisive growth experiment this week.'
      });
    }

    return items.slice(0, 3);
  }, [latest, currentMonth, state.knowledge.interviews.length, goalsCompleted]);

  const achievements = useMemo(() => {
    const wins = [];

    if (num(latest.conversations) >= 25) wins.push('Voice of Customer: 25+ calls in a week');
    if (quickStats.booksRead >= 10) wins.push('Learning Engine: 10+ books completed');
    if (quickStats.modelsMastered >= 15) wins.push('Model Thinker: 15+ models mastered');
    if (quickStats.aiHoursSaved >= 50) wins.push('AI Leverage: 50+ hours saved');
    if (quickStats.decisionsLogged >= 25) wins.push('Decision Cadence: 25+ decisions logged');
    if (num(latest.momGrowth) >= 20) wins.push('Traction Sprint: 20%+ MoM growth');

    return wins;
  }, [latest, quickStats]);

  const openMetricModal = () => {
    const base = latest || {};
    setMetricDraft({
      date: dateISO(),
      mrr: num(base.mrr),
      arr: num(base.arr),
      customers: num(base.customers),
      wau: num(base.wau),
      retention: num(base.retention),
      momGrowth: num(base.momGrowth),
      runway: num(base.runway),
      conversations: num(base.conversations),
      burnRate: num(base.burnRate),
      churn: num(base.churn),
      nrr: num(base.nrr),
      cac: num(base.cac),
      ltv: num(base.ltv),
      payback: num(base.payback),
      grossMargin: num(base.grossMargin),
      magicNumber: num(base.magicNumber),
      northStar: num(base.northStar),
      newCustomers: num(base.newCustomers)
    });
    setMetricModalOpen(true);
  };

  const saveMetricDraft = () => {
    mutate((draft) => {
      const existing = draft.metrics.snapshots.find((snapshot) => snapshot.date === metricDraft.date);
      const payload = {
        ...metricDraft,
        arr: num(metricDraft.arr) || num(metricDraft.mrr) * 12,
        id: existing?.id || `snapshot_${Date.now()}`
      };

      if (existing) Object.assign(existing, payload);
      else draft.metrics.snapshots.push(payload);
    });
    setMetricModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card title={`Day ${journeyDay} of 365`} subtitle={`${format(new Date(), 'EEEE, MMMM d, yyyy')} • Month ${currentMonth} of 12`}>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Journey progress</span>
            <span>{Math.round((journeyDay / 365) * 100)}%</span>
          </div>
          <Progress value={(journeyDay / 365) * 100} />
        </div>
      </Card>

      <Card title="Hero Metrics" subtitle="Traction, efficiency, and execution health">
        <div className="grid-cards">
          <Metric label="MRR / ARR" value={`${money(latest.mrr)} / ${money(latest.arr)}`} helper={`${pct(latest.momGrowth)} MoM growth`} />
          <Metric label="Customers" value={latest.customers || 0} helper={`+${latest.newCustomers || 0} this month`} />
          <Metric label="WAU / Retention" value={`${latest.wau || 0} / ${pct(latest.retention || 0)}`} helper="Weekly active users" />
          <Metric label="Runway" value={`${latest.runway || 0} months`} helper={`Burn ${money(latest.burnRate || 0)}/mo`} tone={toneToMetric(runwayTone(latest.runway))} />
          <Metric label="Customer Conversations" value={latest.conversations || 0} helper="Target: 25+ / week" tone={(latest.conversations || 0) >= 25 ? 'success' : 'warning'} />
          <Metric label="Burn Rate" value={money(latest.burnRate || 0)} helper="Monthly net burn" tone="warning" />
        </div>

        <div className="h-24 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200 dark:border-slate-700">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedSnapshots.slice(-12)}>
              <Line type="monotone" dataKey="mrr" stroke="#2563eb" strokeWidth={2.2} dot={false} />
              <Tooltip formatter={(value) => money(value)} labelFormatter={(label) => label} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Weekly Top 3 Goals" subtitle={`${goalsCompleted}/${state.dashboard.weeklyGoals.length} completed`} className="lg:col-span-2">
          <GoalDnDList
            goals={state.dashboard.weeklyGoals}
            onReorder={(from, to) => mutate((draft) => {
              draft.dashboard.weeklyGoals = reorder(draft.dashboard.weeklyGoals, from, to);
            })}
            onToggle={(id, done) => mutate((draft) => {
              const goal = draft.dashboard.weeklyGoals.find((item) => item.id === id);
              if (goal) goal.done = done;
            })}
            onChange={(id, text) => mutate((draft) => {
              const goal = draft.dashboard.weeklyGoals.find((item) => item.id === id);
              if (goal) goal.text = text;
            })}
            onRemove={(id) => mutate((draft) => {
              draft.dashboard.weeklyGoals = draft.dashboard.weeklyGoals.filter((item) => item.id !== id);
            })}
            onAdd={() => mutate((draft) => {
              if (draft.dashboard.weeklyGoals.length < 3) {
                draft.dashboard.weeklyGoals.push({ id: `goal_${Date.now()}`, text: 'New weekly goal', done: false });
              }
            })}
          />
        </Card>

        <Card title="Today’s Priorities" subtitle="Max 3 focused outcomes">
          <div className="space-y-2">
            {state.dashboard.priorities.map((priority) => (
              <div key={priority.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={priority.done}
                  onChange={(e) => mutate((draft) => {
                    const target = draft.dashboard.priorities.find((p) => p.id === priority.id);
                    if (target) target.done = e.target.checked;
                  })}
                />
                <input
                  value={priority.text}
                  onChange={(e) => mutate((draft) => {
                    const target = draft.dashboard.priorities.find((p) => p.id === priority.id);
                    if (target) target.text = e.target.value;
                  })}
                  className="input"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Smart Suggestions" subtitle="AI-powered next best actions based on phase + metrics" className="lg:col-span-2">
          <div className="space-y-2">
            {smartSuggestions.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-2 text-sm ${
                  item.tone === 'danger'
                    ? 'border-rose-300 bg-rose-50 dark:border-rose-700/50 dark:bg-rose-900/20'
                    : item.tone === 'warning'
                      ? 'border-amber-300 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-900/20'
                      : 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/50 dark:bg-emerald-900/20'
                }`}
              >
                {item.text}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Momentum" subtitle="Streaks and achievement cues">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Journal streak</span><strong>{journalStreak} days</strong></div>
            <div className="flex justify-between"><span>Convo target streak</span><strong>{convoStreak} weeks</strong></div>
            <div className="flex justify-between"><span>Goal completion</span><strong>{Math.round((goalsCompleted / Math.max(1, state.dashboard.weeklyGoals.length)) * 100)}%</strong></div>
          </div>
          <div className="mt-3 space-y-1">
            {achievements.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No badges unlocked yet. Keep compounding.</p>
            ) : (
              achievements.slice(0, 3).map((win) => (
                <div key={win} className="text-xs rounded-full px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {win}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card title="Weekly Operating Rhythm" subtitle="Monday planning to Friday review discipline">
        <div className="grid gap-2 md:grid-cols-2">
          {state.dashboard.operatingRhythm.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm">{item.day}: {item.focus}</p>
                <label className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) => mutate((draft) => {
                      const target = draft.dashboard.operatingRhythm.find((row) => row.id === item.id);
                      if (target) target.done = e.target.checked;
                    })}
                  /> Done
                </label>
              </div>
              <input
                className="input"
                value={item.target}
                onChange={(e) => mutate((draft) => {
                  const target = draft.dashboard.operatingRhythm.find((row) => row.id === item.id);
                  if (target) target.target = e.target.value;
                })}
                placeholder="Target for the day"
              />
              <textarea
                className="textarea"
                value={item.log}
                onChange={(e) => mutate((draft) => {
                  const target = draft.dashboard.operatingRhythm.find((row) => row.id === item.id);
                  if (target) target.log = e.target.value;
                })}
                placeholder="Log outcomes, calls, ship notes"
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button className="btn-secondary" onClick={generateWeeklyReview}>Generate Weekly Review Summary</button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Upcoming Deadlines & Milestones" className="lg:col-span-2">
          <div className="space-y-2">
            {milestones.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Due {format(new Date(item.date), 'MMM d, yyyy')}</p>
                </div>
                <select
                  className="select w-auto"
                  value={item.status}
                  onChange={(e) => mutate((draft) => {
                    const target = draft.dashboard.deadlines.find((d) => d.id === item.id);
                    if (target) target.status = e.target.value;
                  })}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Stats" subtitle="Compounding indicators">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Books read</span><strong>{quickStats.booksRead}</strong></div>
            <div className="flex justify-between"><span>Mental models mastered</span><strong>{quickStats.modelsMastered}</strong></div>
            <div className="flex justify-between"><span>AI hours saved</span><strong>{quickStats.aiHoursSaved.toFixed(1)}h</strong></div>
            <div className="flex justify-between"><span>Decisions logged</span><strong>{quickStats.decisionsLogged}</strong></div>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button className="btn-secondary" onClick={openMetricModal}>Log Metric</button>
          <button className="btn-secondary" onClick={() => navigate('/execution')}>Add Task</button>
          <button className="btn-secondary" onClick={() => navigate('/learning')}>Record Learning</button>
          <button className="btn-secondary" onClick={() => navigate('/decisions')}>Make Decision</button>
        </div>
      </Card>

      <Modal open={metricModalOpen} title="Log Metric Snapshot" onClose={() => setMetricModalOpen(false)}>
        <div className="grid gap-2 sm:grid-cols-3">
          <label>
            <span className="label">Date</span>
            <input className="input" type="date" value={metricDraft.date} onChange={(e) => setMetricDraft((prev) => ({ ...prev, date: e.target.value }))} />
          </label>
          <label>
            <span className="label">MRR</span>
            <input className="input" type="number" value={metricDraft.mrr} onChange={(e) => setMetricDraft((prev) => ({ ...prev, mrr: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">Customers</span>
            <input className="input" type="number" value={metricDraft.customers} onChange={(e) => setMetricDraft((prev) => ({ ...prev, customers: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">WAU</span>
            <input className="input" type="number" value={metricDraft.wau} onChange={(e) => setMetricDraft((prev) => ({ ...prev, wau: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">MoM Growth %</span>
            <input className="input" type="number" value={metricDraft.momGrowth} onChange={(e) => setMetricDraft((prev) => ({ ...prev, momGrowth: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">Runway (months)</span>
            <input className="input" type="number" value={metricDraft.runway} onChange={(e) => setMetricDraft((prev) => ({ ...prev, runway: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">Conversations</span>
            <input className="input" type="number" value={metricDraft.conversations} onChange={(e) => setMetricDraft((prev) => ({ ...prev, conversations: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">Burn Rate</span>
            <input className="input" type="number" value={metricDraft.burnRate} onChange={(e) => setMetricDraft((prev) => ({ ...prev, burnRate: num(e.target.value) }))} />
          </label>
          <label>
            <span className="label">New Customers</span>
            <input className="input" type="number" value={metricDraft.newCustomers} onChange={(e) => setMetricDraft((prev) => ({ ...prev, newCustomers: num(e.target.value) }))} />
          </label>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button className="btn-secondary" onClick={() => setMetricModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={saveMetricDraft}>Save Snapshot</button>
        </div>
      </Modal>
    </div>
  );
}
