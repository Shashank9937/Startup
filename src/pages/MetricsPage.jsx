import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { Card, Metric } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { money, num, pct } from '../lib/utils';

function calcUnitEconomics(inputs) {
  const cac = (num(inputs.marketingSpend) + num(inputs.salesCost)) / Math.max(1, num(inputs.newCustomers));
  const ltv = num(inputs.arpu) * num(inputs.avgLifetimeMonths) * (num(inputs.grossMarginPct) / 100);
  const ratio = cac > 0 ? ltv / cac : 0;
  const payback = num(inputs.arpu) > 0 ? cac / (num(inputs.arpu) * (num(inputs.grossMarginPct) / 100)) : 0;
  return { cac, ltv, ratio, payback };
}

export default function MetricsPage() {
  const { state, mutate } = useAppStore();
  const [chartMetric, setChartMetric] = useState('mrr');

  const snapshots = useMemo(() => [...state.metrics.snapshots].sort((a, b) => a.date.localeCompare(b.date)), [state.metrics.snapshots]);
  const latest = snapshots.at(-1) || {};
  const economics = calcUnitEconomics(state.metrics.unitEconomicsInputs);

  const burnTotal = state.metrics.expenses.reduce((sum, row) => sum + num(row.amount), 0);
  const runRate = num(latest.mrr) - burnTotal;

  return (
    <div className="space-y-4">
      <Card title="Growth Dashboard" subtitle="Primary and secondary metrics for execution quality">
        <div className="mb-3 flex gap-2">
          {['mrr', 'arr', 'wau', 'customers'].map((metric) => (
            <button key={metric} className={`btn-secondary ${chartMetric === metric ? 'ring-2 ring-primary-500' : ''}`} onClick={() => setChartMetric(metric)}>
              {metric.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={snapshots}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={chartMetric} stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="momGrowth" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-cards mt-3">
          <Metric label="New customers" value={latest.newCustomers || 0} />
          <Metric label="Churn rate" value={pct(latest.churn || 0)} tone={(latest.churn || 0) > 7 ? 'danger' : 'success'} />
          <Metric label="Net revenue retention" value={pct(latest.nrr || 0)} tone={(latest.nrr || 0) >= 100 ? 'success' : 'warning'} />
          <Metric label="CAC" value={money(latest.cac || economics.cac)} />
          <Metric label="LTV" value={money(latest.ltv || economics.ltv)} />
          <Metric label="LTV/CAC" value={Number(economics.ratio).toFixed(2)} tone={economics.ratio >= 3 ? 'success' : 'warning'} />
          <Metric label="Payback period" value={`${Number(economics.payback).toFixed(1)} months`} tone={economics.payback <= 12 ? 'success' : 'warning'} />
          <Metric label="Gross margin" value={pct(latest.grossMargin || state.metrics.unitEconomicsInputs.grossMarginPct)} />
          <Metric label="Magic number" value={(latest.magicNumber || 0).toFixed(2)} tone={(latest.magicNumber || 0) >= 1 ? 'success' : 'warning'} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Unit Economics Calculator" subtitle="What-if and benchmark modeling">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="label">ARPU</label>
              <input className="input" type="number" value={state.metrics.unitEconomicsInputs.arpu} onChange={(e) => mutate((d) => { d.metrics.unitEconomicsInputs.arpu = num(e.target.value); })} />
            </div>
            <div>
              <label className="label">Avg Customer Lifetime (months)</label>
              <input className="input" type="number" value={state.metrics.unitEconomicsInputs.avgLifetimeMonths} onChange={(e) => mutate((d) => { d.metrics.unitEconomicsInputs.avgLifetimeMonths = num(e.target.value); })} />
            </div>
            <div>
              <label className="label">Gross Margin %</label>
              <input className="input" type="number" value={state.metrics.unitEconomicsInputs.grossMarginPct} onChange={(e) => mutate((d) => { d.metrics.unitEconomicsInputs.grossMarginPct = num(e.target.value); })} />
            </div>
            <div>
              <label className="label">Marketing Spend</label>
              <input className="input" type="number" value={state.metrics.unitEconomicsInputs.marketingSpend} onChange={(e) => mutate((d) => { d.metrics.unitEconomicsInputs.marketingSpend = num(e.target.value); })} />
            </div>
            <div>
              <label className="label">Sales Cost</label>
              <input className="input" type="number" value={state.metrics.unitEconomicsInputs.salesCost} onChange={(e) => mutate((d) => { d.metrics.unitEconomicsInputs.salesCost = num(e.target.value); })} />
            </div>
            <div>
              <label className="label">New Customers</label>
              <input className="input" type="number" value={state.metrics.unitEconomicsInputs.newCustomers} onChange={(e) => mutate((d) => { d.metrics.unitEconomicsInputs.newCustomers = num(e.target.value); })} />
            </div>
          </div>

          <div className="grid-cards mt-3">
            <Metric label="Calculated LTV" value={money(economics.ltv)} />
            <Metric label="Calculated CAC" value={money(economics.cac)} />
            <Metric label="LTV/CAC" value={economics.ratio.toFixed(2)} tone={economics.ratio >= 3 ? 'success' : 'warning'} />
            <Metric label="Payback" value={`${economics.payback.toFixed(1)} months`} tone={economics.payback <= 12 ? 'success' : 'warning'} />
          </div>
        </Card>

        <Card title="Cohort Analysis" subtitle="Retention and revenue retention by cohort">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state.metrics.cohorts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="d1" fill="#2563eb" name="Day 1" />
                <Bar dataKey="d7" fill="#16a34a" name="Day 7" />
                <Bar dataKey="d30" fill="#f59e0b" name="Day 30" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-auto mt-2">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th>Month</th><th>Users</th><th>D1</th><th>D7</th><th>D30</th><th>Revenue Retention</th>
                </tr>
              </thead>
              <tbody>
                {state.metrics.cohorts.map((cohort) => (
                  <tr key={cohort.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td>{cohort.month}</td><td>{cohort.users}</td><td>{pct(cohort.d1, 0)}</td><td>{pct(cohort.d7, 0)}</td><td>{pct(cohort.d30, 0)}</td><td>{pct(cohort.revenueRetention, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Burn Rate & Runway" subtitle="Expense discipline and financial durability">
          <div className="space-y-2">
            {state.metrics.expenses.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                <input className="input col-span-5" value={row.category} onChange={(e) => mutate((d) => {
                  const target = d.metrics.expenses.find((x) => x.id === row.id);
                  if (target) target.category = e.target.value;
                })} />
                <input className="input col-span-3" value={row.month} onChange={(e) => mutate((d) => {
                  const target = d.metrics.expenses.find((x) => x.id === row.id);
                  if (target) target.month = e.target.value;
                })} />
                <input className="input col-span-3" type="number" value={row.amount} onChange={(e) => mutate((d) => {
                  const target = d.metrics.expenses.find((x) => x.id === row.id);
                  if (target) target.amount = num(e.target.value);
                })} />
                <button className="text-rose-500 text-xs col-span-1" onClick={() => mutate((d) => {
                  d.metrics.expenses = d.metrics.expenses.filter((x) => x.id !== row.id);
                })}>✕</button>
              </div>
            ))}
            <button className="btn-secondary" onClick={() => mutate((d) => {
              d.metrics.expenses.push({ id: `expense_${Date.now()}`, month: latest.date?.slice(0, 7) || '', category: 'New Expense', amount: 0 });
            })}>+ Add Expense Category</button>
          </div>

          <div className="grid-cards mt-3">
            <Metric label="Total burn" value={money(burnTotal)} tone="warning" />
            <Metric label="Net run-rate" value={money(runRate)} tone={runRate >= 0 ? 'success' : 'danger'} />
            <Metric label="Runway months" value={latest.runway || 0} tone={(latest.runway || 0) > 12 ? 'success' : 'warning'} />
          </div>
        </Card>

        <Card title="Traction Metrics" subtitle="Activation, retention and North Star velocity">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshots}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area dataKey="wau" stroke="#2563eb" fill="#93c5fd" />
                <Area dataKey="northStar" stroke="#16a34a" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid-cards mt-3">
            <Metric label="Activation rate" value={pct(latest.retention || 0)} />
            <Metric label="Day 1 / 7 / 30" value={`${state.metrics.cohorts.at(-1)?.d1 || 0}/${state.metrics.cohorts.at(-1)?.d7 || 0}/${state.metrics.cohorts.at(-1)?.d30 || 0}`} helper="Latest cohort" />
            <Metric label="WoW growth proxy" value={pct(((snapshots.at(-1)?.mrr || 0) - (snapshots.at(-2)?.mrr || 0)) / Math.max(1, snapshots.at(-2)?.mrr || 1) * 100)} />
            <Metric label="North Star" value={latest.northStar || 0} />
          </div>
        </Card>
      </div>

      <Card title="Productivity System" subtitle="Time audit, elimination, batching, delegation, and focus quality">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <h4 className="font-semibold text-sm mb-2">Time Audit & Allocation</h4>
            {state.productivity.timeAudit.map((audit) => (
              <div key={audit.id} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs">Strategic %<input className="input mt-1" type="number" value={audit.strategic} onChange={(e) => mutate((d) => { d.productivity.timeAudit[0].strategic = num(e.target.value); })} /></label>
                  <label className="text-xs">Execution %<input className="input mt-1" type="number" value={audit.execution} onChange={(e) => mutate((d) => { d.productivity.timeAudit[0].execution = num(e.target.value); })} /></label>
                  <label className="text-xs">Management %<input className="input mt-1" type="number" value={audit.management} onChange={(e) => mutate((d) => { d.productivity.timeAudit[0].management = num(e.target.value); })} /></label>
                  <label className="text-xs">Waste %<input className="input mt-1" type="number" value={audit.waste} onChange={(e) => mutate((d) => { d.productivity.timeAudit[0].waste = num(e.target.value); })} /></label>
                </div>
                <p className="text-xs text-slate-500">Target mix: Strategic 40%, Execution 30%, Management 20%, Waste {'<'}10%, Learning 10%</p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <h4 className="font-semibold text-sm mb-2">Elimination Tracker</h4>
            <button className="btn-secondary mb-2" onClick={() => mutate((d) => {
              d.productivity.elimination.unshift({ id: `elim_${Date.now()}`, item: 'New eliminated activity', savedHours: 1, date: latest.date || '' });
            })}>+ Add Eliminated Activity</button>
            <div className="space-y-1">
              {state.productivity.elimination.map((item) => (
                <div key={item.id} className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 text-sm flex justify-between gap-2">
                  <span>{item.item}</span>
                  <span>{item.savedHours}h/week</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <h4 className="font-semibold text-sm mb-2">Batching Schedule Adherence</h4>
            <div className="space-y-2">
              {state.productivity.batchingSchedule.map((row) => (
                <div key={row.day}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{row.day}: {row.focus}</span>
                    <span>{row.adherence}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-2 rounded-full ${row.adherence < 60 ? 'bg-rose-500' : row.adherence < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.adherence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <h4 className="font-semibold text-sm mb-2">Delegation & Focus Sessions</h4>
            <div className="space-y-1 mb-2">
              {state.productivity.delegation.map((item) => (
                <div key={item.id} className="text-sm rounded-md bg-slate-50 dark:bg-slate-800/60 p-2">
                  {item.task} → {item.delegatedTo} ({item.savedHours}h saved)
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {state.productivity.focusSessions.map((session) => (
                <div key={session.id} className="text-sm rounded-md bg-slate-50 dark:bg-slate-800/60 p-2">
                  {session.date}: {session.pomodoros} pomodoros, {session.deepWorkMins} mins deep work, {session.distractions} distractions
                </div>
              ))}
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
