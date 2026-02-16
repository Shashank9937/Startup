import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, EmptyState, Metric, Progress } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO, monthISO, money, num, pct } from '../lib/utils';

function statusColor(status) {
  if (status === 'complete') return 'success';
  if (status === 'in_progress') return 'warning';
  return 'default';
}

export default function FundraisingPage() {
  const { state, mutate, generateMonthlyReport } = useAppStore();
  const fundraising = state.fundraising;

  const progress = fundraising.target > 0 ? (num(fundraising.raised) / num(fundraising.target)) * 100 : 0;

  const revenueData = state.financialModel.projections.revenue.map((value, idx) => ({
    month: `M${idx + 1}`,
    revenue: value,
    cogs: state.financialModel.projections.cogs[idx],
    sm: state.financialModel.projections.sm[idx],
    rd: state.financialModel.projections.rd[idx],
    ga: state.financialModel.projections.ga[idx]
  }));

  return (
    <div className="space-y-4">
      <Card title="Fundraising Dashboard" subtitle="Track raise progress, investor pipeline, and runway impact">
        <div className="grid-cards">
          <Metric label="Target amount" value={money(fundraising.target)} />
          <Metric label="Raised" value={money(fundraising.raised)} />
          <Metric label="Progress" value={pct(progress)} tone={progress >= 50 ? 'success' : 'warning'} />
          <Metric label="Runway before/after" value={`${fundraising.runwayBefore}m → ${fundraising.runwayAfter}m`} />
          <Metric label="Pipeline meetings" value={fundraising.pipeline.length} />
          <Metric label="Term sheets" value={fundraising.termSheets.length} />
        </div>
        <div className="mt-2"><Progress value={progress} /></div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Data Room Checklist">
          <div className="space-y-2">
            {fundraising.dataRoom.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <span>{item.label}</span>
                <select className="select w-auto" value={item.status} onChange={(e) => mutate((draft) => {
                  const target = draft.fundraising.dataRoom.find((x) => x.id === item.id);
                  if (target) target.status = e.target.value;
                })}>
                  <option value="not_started">not started</option>
                  <option value="in_progress">in progress</option>
                  <option value="complete">complete</option>
                </select>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Pitch Deck Tracker">
          <div className="grid grid-cols-2 gap-2">
            <input className="input" value={fundraising.pitchDeck.version} onChange={(e) => mutate((d) => { d.fundraising.pitchDeck.version = e.target.value; })} placeholder="Version" />
            <input className="input" type="date" value={fundraising.pitchDeck.lastUpdated} onChange={(e) => mutate((d) => { d.fundraising.pitchDeck.lastUpdated = e.target.value; })} />
            <input className="input" type="number" value={fundraising.pitchDeck.practiceCount} onChange={(e) => mutate((d) => { d.fundraising.pitchDeck.practiceCount = Number(e.target.value); })} />
          </div>
          <div className="mt-2 space-y-2">
            {fundraising.pitchDeck.slides.map((slide) => (
              <div key={slide.id} className="flex items-center justify-between text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                <span>{slide.name}</span>
                <select className="select w-auto" value={slide.status} onChange={(e) => mutate((d) => {
                  const target = d.fundraising.pitchDeck.slides.find((x) => x.id === slide.id);
                  if (target) target.status = e.target.value;
                })}>
                  <option value="not_started">not_started</option>
                  <option value="in_progress">in_progress</option>
                  <option value="complete">complete</option>
                </select>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Investor Pipeline" subtitle="From research to term sheet">
        <button className="btn-primary mb-2" onClick={() => mutate((draft) => {
          draft.fundraising.pipeline.unshift({
            id: `pipeline_${Date.now()}`,
            firm: '',
            partner: '',
            stage: 'research',
            date: dateISO(),
            concern: '',
            likelihood: 'cold',
            notes: ''
          });
        })}>+ Add Investor</button>

        <div className="space-y-2">
          {fundraising.pipeline.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 grid grid-cols-12 gap-2">
              <input className="input col-span-2" placeholder="Firm" value={item.firm} onChange={(e) => mutate((d) => { const t = d.fundraising.pipeline.find((x) => x.id === item.id); if (t) t.firm = e.target.value; })} />
              <input className="input col-span-2" placeholder="Partner" value={item.partner} onChange={(e) => mutate((d) => { const t = d.fundraising.pipeline.find((x) => x.id === item.id); if (t) t.partner = e.target.value; })} />
              <select className="select col-span-2" value={item.stage} onChange={(e) => mutate((d) => { const t = d.fundraising.pipeline.find((x) => x.id === item.id); if (t) t.stage = e.target.value; })}>
                <option>research</option><option>intro</option><option>meeting</option><option>due diligence</option><option>term sheet</option>
              </select>
              <input className="input col-span-2" type="date" value={item.date} onChange={(e) => mutate((d) => { const t = d.fundraising.pipeline.find((x) => x.id === item.id); if (t) t.date = e.target.value; })} />
              <select className="select col-span-2" value={item.likelihood} onChange={(e) => mutate((d) => { const t = d.fundraising.pipeline.find((x) => x.id === item.id); if (t) t.likelihood = e.target.value; })}>
                <option>hot</option><option>warm</option><option>cold</option>
              </select>
              <button className="btn-danger col-span-2" onClick={() => mutate((d) => {
                d.fundraising.pipeline = d.fundraising.pipeline.filter((x) => x.id !== item.id);
              })}>Delete</button>
              <textarea className="textarea col-span-12" placeholder="Concerns, questions asked, next steps" value={`${item.concern || ''}\n${item.notes || ''}`} onChange={(e) => mutate((d) => {
                const t = d.fundraising.pipeline.find((x) => x.id === item.id);
                if (t) {
                  const [concern, ...rest] = e.target.value.split('\n');
                  t.concern = concern;
                  t.notes = rest.join('\n');
                }
              })} />
            </div>
          ))}
          {fundraising.pipeline.length === 0 ? <EmptyState message="No investors in pipeline" /> : null}
        </div>
      </Card>

      <Card title="Term Sheet Comparison" subtitle="Side-by-side key terms and negotiation points">
        <button className="btn-primary mb-2" onClick={() => mutate((draft) => {
          draft.fundraising.termSheets.unshift({
            id: `term_${Date.now()}`,
            lead: '',
            valuation: 0,
            checkSize: 0,
            ownership: 0,
            liquidationPreference: '1x non-participating',
            boardSeats: 1,
            redFlags: '',
            negotiationPoints: ''
          });
        })}>+ Add Term Sheet</button>

        <div className="grid gap-2 md:grid-cols-2">
          {fundraising.termSheets.map((sheet) => (
            <div key={sheet.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <input className="input" placeholder="Lead investor" value={sheet.lead} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.lead = e.target.value; })} />
              <input className="input" type="number" placeholder="Valuation" value={sheet.valuation} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.valuation = Number(e.target.value); })} />
              <input className="input" type="number" placeholder="Check size" value={sheet.checkSize} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.checkSize = Number(e.target.value); })} />
              <input className="input" type="number" placeholder="Ownership %" value={sheet.ownership} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.ownership = Number(e.target.value); })} />
              <input className="input" value={sheet.liquidationPreference} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.liquidationPreference = e.target.value; })} />
              <textarea className="textarea" placeholder="Red flags" value={sheet.redFlags} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.redFlags = e.target.value; })} />
              <textarea className="textarea" placeholder="Negotiation points" value={sheet.negotiationPoints} onChange={(e) => mutate((d) => { const t = d.fundraising.termSheets.find((x) => x.id === sheet.id); if (t) t.negotiationPoints = e.target.value; })} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Financial Model Builder" subtitle="3-year projection scaffolding and break-even view">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#93c5fd" />
                <Area type="monotone" dataKey="sm" stroke="#f59e0b" fill="#fde68a" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-2">Rule of 40 proxy: {(num(state.metrics.snapshots.at(-1)?.momGrowth) + num(state.metrics.snapshots.at(-1)?.grossMargin) - 40).toFixed(1)} points above threshold.</p>
        </Card>

        <Card title="Budget Tracker" subtitle="Actual vs budget and variance">
          <div className="space-y-2">
            {state.financialModel.budget.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-2">
                <input className="input col-span-4" value={row.category} onChange={(e) => mutate((d) => { const t = d.financialModel.budget.find((x) => x.id === row.id); if (t) t.category = e.target.value; })} />
                <input className="input col-span-2" value={row.month} onChange={(e) => mutate((d) => { const t = d.financialModel.budget.find((x) => x.id === row.id); if (t) t.month = e.target.value; })} />
                <input className="input col-span-2" type="number" value={row.budgeted} onChange={(e) => mutate((d) => { const t = d.financialModel.budget.find((x) => x.id === row.id); if (t) t.budgeted = Number(e.target.value); })} />
                <input className="input col-span-2" type="number" value={row.actual} onChange={(e) => mutate((d) => { const t = d.financialModel.budget.find((x) => x.id === row.id); if (t) t.actual = Number(e.target.value); })} />
                <div className="col-span-2 text-xs self-center">Var {(row.actual - row.budgeted).toFixed(0)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Reports & Investor Updates" subtitle="Generate weekly, monthly, and investor-facing summaries">
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => mutate((draft) => {
            draft.reports.investorUpdates.unshift({
              id: `investor_update_${Date.now()}`,
              date: dateISO(),
              body: `Investor Update (${monthISO()})\n\nMetrics:\n- MRR: ${money(state.metrics.snapshots.at(-1)?.mrr || 0)}\n- Growth: ${pct(state.metrics.snapshots.at(-1)?.momGrowth || 0)}\n\nProduct updates:\n- ...\nTeam updates:\n- ...\nFundraising:\n- Pipeline: ${state.fundraising.pipeline.length} active investors\n\nAsks:\n- 2 intros to B2B infra operators` 
            });
          })}>Generate Investor Update</button>
          <button className="btn-secondary" onClick={generateMonthlyReport}>Generate Monthly Report</button>
        </div>

        <div className="mt-3 space-y-2">
          {state.reports.investorUpdates.map((update) => (
            <textarea key={update.id} className="textarea min-h-28" value={update.body} onChange={(e) => mutate((draft) => {
              const target = draft.reports.investorUpdates.find((x) => x.id === update.id);
              if (target) target.body = e.target.value;
            })} />
          ))}
          {state.reports.investorUpdates.length === 0 ? <EmptyState message="No investor updates yet." /> : null}
        </div>
      </Card>
    </div>
  );
}
