import React, { useMemo, useState } from 'react';
import { Card, Progress, StatusBadge } from '../components/ui';
import { useAppStore } from '../context/AppContext';

function calculateMonthProgress(month) {
  const weekTasks = month.weeks.flatMap((week) => week.tasks);
  const total = weekTasks.length + month.exitCriteria.length + month.activities.length;
  const done = weekTasks.filter((task) => task.done).length
    + month.exitCriteria.filter((item) => item.done).length
    + month.activities.filter((item) => item.done).length;
  return total ? Math.round((done / total) * 100) : 0;
}

function Timeline({ months }) {
  return (
    <div className="space-y-2">
      {months.map((month) => (
        <div key={`timeline_${month.id}`} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Month {month.month} • {month.title}</span>
            <span>{month.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className={`h-full ${month.progress < 40 ? 'bg-rose-500' : month.progress < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${month.progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Critical path: {month.milestones.filter((m) => m.critical).map((m) => m.title).join(' • ') || 'No critical milestones'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExecutionPage() {
  const { state, mutate } = useAppStore();
  const [expandedMonth, setExpandedMonth] = useState(1);

  const months = useMemo(() =>
    state.roadmap.months.map((month) => ({ ...month, progress: calculateMonthProgress(month) })),
    [state.roadmap.months]
  );

  return (
    <div className="space-y-4">
      <Card title="Execution Roadmap (12-Month System)" subtitle="Track week-by-week outputs, exit gates, and dependencies">
        <Timeline months={months} />
      </Card>

      {months.map((month) => (
        <Card
          key={month.id}
          title={`Month ${month.month}: ${month.title}`}
          subtitle={`${month.progress}% complete`}
          action={<StatusBadge value={month.status} />}
        >
          <div className="space-y-3">
            <Progress value={month.progress} />
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => setExpandedMonth((prev) => (prev === month.month ? -1 : month.month))}>
                {expandedMonth === month.month ? 'Collapse' : 'Expand'}
              </button>
              <select
                className="select w-auto"
                value={month.status}
                onChange={(event) => mutate((draft) => {
                  const target = draft.roadmap.months.find((item) => item.id === month.id);
                  if (target) target.status = event.target.value;
                })}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Complete</option>
                <option>Blocked</option>
              </select>
              {month.aiActions.map((action) => (
                <button key={action} className="btn-secondary text-xs" title="Opens AI workflows page for execution support">
                  AI: {action}
                </button>
              ))}
            </div>

            {expandedMonth === month.month ? (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                    <h4 className="font-semibold text-sm">Week-by-week breakdown</h4>
                    {month.weeks.map((week) => (
                      <details key={week.id} className="rounded-md border border-slate-200 dark:border-slate-700 p-2">
                        <summary className="cursor-pointer text-sm font-medium">{week.title}</summary>
                        <div className="mt-2 space-y-1">
                          {week.tasks.map((task) => (
                            <label key={task.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={(e) => mutate((draft) => {
                                  const targetMonth = draft.roadmap.months.find((item) => item.id === month.id);
                                  const targetWeek = targetMonth?.weeks.find((w) => w.id === week.id);
                                  const targetTask = targetWeek?.tasks.find((t) => t.id === task.id);
                                  if (targetTask) targetTask.done = e.target.checked;
                                })}
                              />
                              <span>{task.text}</span>
                            </label>
                          ))}
                        </div>
                      </details>
                    ))}
                  </section>

                  <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                    <h4 className="font-semibold text-sm">Exit criteria</h4>
                    {month.exitCriteria.map((criterion) => (
                      <label key={criterion.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={criterion.done}
                          onChange={(e) => mutate((draft) => {
                            const targetMonth = draft.roadmap.months.find((item) => item.id === month.id);
                            const target = targetMonth?.exitCriteria.find((c) => c.id === criterion.id);
                            if (target) target.done = e.target.checked;
                          })}
                        />
                        <span>{criterion.text}</span>
                      </label>
                    ))}

                    <h4 className="font-semibold text-sm mt-3">Key activities</h4>
                    {month.activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activity.done}
                          onChange={(e) => mutate((draft) => {
                            const targetMonth = draft.roadmap.months.find((item) => item.id === month.id);
                            const target = targetMonth?.activities.find((a) => a.id === activity.id);
                            if (target) target.done = e.target.checked;
                          })}
                        />
                        <input
                          className="input"
                          value={activity.text}
                          onChange={(e) => mutate((draft) => {
                            const targetMonth = draft.roadmap.months.find((item) => item.id === month.id);
                            const target = targetMonth?.activities.find((a) => a.id === activity.id);
                            if (target) target.text = e.target.value;
                          })}
                        />
                        <input
                          type="date"
                          className="input w-auto"
                          value={activity.dueDate}
                          onChange={(e) => mutate((draft) => {
                            const targetMonth = draft.roadmap.months.find((item) => item.id === month.id);
                            const target = targetMonth?.activities.find((a) => a.id === activity.id);
                            if (target) target.dueDate = e.target.value;
                          })}
                        />
                      </div>
                    ))}
                  </section>
                </div>

                <section className="rounded-xl border border-rose-200 dark:border-rose-800/50 p-3 bg-rose-50/60 dark:bg-rose-950/25">
                  <h4 className="font-semibold text-sm text-rose-700 dark:text-rose-300">Kill criteria warnings</h4>
                  {month.killCriteria.map((kill) => (
                    <label key={kill.id} className="flex items-center gap-2 text-sm mt-1">
                      <input
                        type="checkbox"
                        checked={kill.triggered}
                        onChange={(e) => mutate((draft) => {
                          const targetMonth = draft.roadmap.months.find((item) => item.id === month.id);
                          const target = targetMonth?.killCriteria.find((k) => k.id === kill.id);
                          if (target) target.triggered = e.target.checked;
                        })}
                      />
                      {kill.text}
                    </label>
                  ))}
                </section>

                <section>
                  <label className="label">Notes & Pivot Considerations</label>
                  <textarea
                    className="textarea min-h-24"
                    value={month.notes}
                    onChange={(e) => mutate((draft) => {
                      const target = draft.roadmap.months.find((item) => item.id === month.id);
                      if (target) target.notes = e.target.value;
                    })}
                  />
                </section>
              </div>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}
