import React, { useMemo, useState } from 'react';
import { Card, EmptyState, Metric } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO } from '../lib/utils';

const CONTACT_TYPES = [
  { key: 'customers', label: 'Customers (ICP)' },
  { key: 'investors', label: 'Investors' },
  { key: 'advisors', label: 'Advisors & Mentors' },
  { key: 'partners', label: 'Partners' },
  { key: 'team', label: 'Team & Candidates' }
];

function createContact(type) {
  const common = {
    id: `${type}_${Date.now()}`,
    name: '',
    company: '',
    role: '',
    email: '',
    stage: 'prospect',
    value: 0,
    lastContact: dateISO(),
    nextFollowUp: dateISO(),
    notes: '',
    history: []
  };
  return common;
}

export default function NetworkPage() {
  const { state, mutate } = useAppStore();
  const [activeType, setActiveType] = useState('customers');

  const items = state.network[activeType] || [];

  const overdue = useMemo(() => {
    const today = dateISO();
    return CONTACT_TYPES.flatMap((type) => (state.network[type.key] || []).map((contact) => ({ ...contact, type: type.label })))
      .filter((contact) => contact.nextFollowUp && contact.nextFollowUp < today);
  }, [state.network]);

  return (
    <div className="space-y-4">
      <Card title="Network & Contacts" subtitle="Relationship systems for customers, investors, mentors, partners, and team">
        <div className="flex flex-wrap gap-2 mb-3">
          {CONTACT_TYPES.map((type) => (
            <button key={type.key} className={`btn-secondary ${activeType === type.key ? 'ring-2 ring-primary-500' : ''}`} onClick={() => setActiveType(type.key)}>
              {type.label}
            </button>
          ))}
        </div>

        <button className="btn-primary mb-3" onClick={() => mutate((draft) => {
          draft.network[activeType].unshift(createContact(activeType));
        })}>+ Add {CONTACT_TYPES.find((t) => t.key === activeType)?.label}</button>

        <div className="space-y-2">
          {items.length === 0 ? <EmptyState message="No contacts in this category yet." /> : null}
          {items.map((contact) => (
            <div key={contact.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-3">
                <input className="input" placeholder="Name" value={contact.name || ''} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) target.name = e.target.value;
                })} />
                <input className="input" placeholder="Company/Firm" value={contact.company || contact.firm || ''} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) { target.company = e.target.value; target.firm = e.target.value; }
                })} />
                <input className="input" placeholder="Role/Partner" value={contact.role || contact.partner || ''} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) { target.role = e.target.value; target.partner = e.target.value; }
                })} />
                <input className="input" placeholder="Email" value={contact.email || ''} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) target.email = e.target.value;
                })} />
                <select className="select" value={contact.stage || contact.status || 'prospect'} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) { target.stage = e.target.value; target.status = e.target.value; }
                })}>
                  <option value="prospect">prospect</option>
                  <option value="customer">customer</option>
                  <option value="warm">warm</option>
                  <option value="pitched">pitched</option>
                  <option value="passed">passed</option>
                  <option value="term_sheet">term sheet</option>
                </select>
                <input className="input" type="number" placeholder="Value (MRR/contract)" value={contact.value || 0} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) target.value = Number(e.target.value);
                })} />
                <input className="input" type="date" value={contact.lastContact || dateISO()} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) target.lastContact = e.target.value;
                })} />
                <input className="input" type="date" value={contact.nextFollowUp || dateISO()} onChange={(e) => mutate((draft) => {
                  const target = draft.network[activeType].find((x) => x.id === contact.id);
                  if (target) target.nextFollowUp = e.target.value;
                })} />
                <button className="btn-danger" onClick={() => mutate((draft) => {
                  draft.network[activeType] = draft.network[activeType].filter((x) => x.id !== contact.id);
                })}>Delete</button>
              </div>
              <textarea className="textarea" placeholder="Notes and communication history" value={contact.notes || ''} onChange={(e) => mutate((draft) => {
                const target = draft.network[activeType].find((x) => x.id === contact.id);
                if (target) target.notes = e.target.value;
              })} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Warm Intro Tracker" subtitle="50 target VC paths">
          <button className="btn-primary mb-2" onClick={() => mutate((draft) => {
            draft.network.warmIntros.unshift({ id: `intro_${Date.now()}`, firm: '', targetPartner: '', introPath: '', status: 'requested', followUp: dateISO() });
          })}>+ Add Intro</button>
          <div className="space-y-2">
            {state.network.warmIntros.map((intro) => (
              <div key={intro.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 grid grid-cols-12 gap-2">
                <input className="input col-span-3" placeholder="Firm" value={intro.firm} onChange={(e) => mutate((d) => { const t = d.network.warmIntros.find((x) => x.id === intro.id); if (t) t.firm = e.target.value; })} />
                <input className="input col-span-3" placeholder="Partner" value={intro.targetPartner} onChange={(e) => mutate((d) => { const t = d.network.warmIntros.find((x) => x.id === intro.id); if (t) t.targetPartner = e.target.value; })} />
                <input className="input col-span-3" placeholder="Intro path" value={intro.introPath} onChange={(e) => mutate((d) => { const t = d.network.warmIntros.find((x) => x.id === intro.id); if (t) t.introPath = e.target.value; })} />
                <select className="select col-span-2" value={intro.status} onChange={(e) => mutate((d) => { const t = d.network.warmIntros.find((x) => x.id === intro.id); if (t) t.status = e.target.value; })}>
                  <option>requested</option><option>made</option><option>meeting scheduled</option>
                </select>
                <button className="btn-danger col-span-1" onClick={() => mutate((d) => { d.network.warmIntros = d.network.warmIntros.filter((x) => x.id !== intro.id); })}>X</button>
              </div>
            ))}
            {state.network.warmIntros.length === 0 ? <EmptyState message="No warm intro paths tracked yet." /> : null}
          </div>
        </Card>

        <Card title="Relationship Health" subtitle="Overdue follow-ups and risk flags">
          <Metric label="Overdue follow-ups" value={overdue.length} tone={overdue.length ? 'danger' : 'success'} />
          <div className="space-y-2 mt-2">
            {overdue.slice(0, 8).map((item) => (
              <div key={`${item.type}_${item.id}`} className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/40 p-2 text-sm">
                {item.name || item.partner || 'Unnamed'} • {item.type}
                <div className="text-xs text-rose-600 dark:text-rose-300">Follow-up due {item.nextFollowUp}</div>
              </div>
            ))}
            {overdue.length === 0 ? <EmptyState message="No overdue relationships." /> : null}
          </div>
        </Card>

        <Card title="Network Snapshot" subtitle="Relationship inventory and value">
          <Metric label="Customers tracked" value={state.network.customers.length} />
          <Metric label="Investors tracked" value={state.network.investors.length} />
          <Metric label="Advisors" value={state.network.advisors.length} />
          <Metric label="Pipeline value" value={`$${state.network.customers.reduce((sum, c) => sum + Number(c.value || 0), 0).toLocaleString()}`} />
        </Card>
      </div>
    </div>
  );
}
