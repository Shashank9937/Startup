import React, { useMemo, useState } from 'react';
import { Copy, WandSparkles } from 'lucide-react';
import { Card, EmptyState, Metric } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO } from '../lib/utils';

function toLines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function fromLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function runAgent(agent, input) {
  const capabilities = (agent.capabilities || []).map((item) => `- ${item}`).join('\n');
  const deliverables = (agent.deliverables || []).map((item) => `- ${item}`).join('\n');

  return `${agent.name}\n\nInput: ${input || 'No input provided.'}\n\nCore capabilities:\n${capabilities || '- No capabilities listed'}\n\nGenerated Output:\n${agent.outputTemplate}\n\nExpected deliverables:\n${deliverables || '- No deliverables listed'}\n\nRecommended next actions:\n1) Validate assumptions with real customer signal\n2) Define KPI and success threshold\n3) Assign owner and deadline`;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

export default function AIAgentsPage() {
  const { state, mutate } = useAppStore();
  const [selectedAgentId, setSelectedAgentId] = useState(state.ai.agents[0]?.id || '');
  const [agentInput, setAgentInput] = useState('');
  const [promptSearch, setPromptSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [editingAgent, setEditingAgent] = useState(false);

  const selectedAgent = state.ai.agents.find((agent) => agent.id === selectedAgentId) || state.ai.agents[0];

  const allPrompts = useMemo(
    () => [...state.ai.customPrompts, ...state.ai.prompts],
    [state.ai.customPrompts, state.ai.prompts]
  );

  const prompts = useMemo(() => {
    return allPrompts.filter((prompt) => {
      const matchesSearch = `${prompt.title} ${prompt.useCase}`.toLowerCase().includes(promptSearch.toLowerCase());
      const matchesCategory = category === 'all' || prompt.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [allPrompts, promptSearch, category]);

  const categories = useMemo(() => ['all', ...new Set(allPrompts.map((p) => p.category))], [allPrompts]);

  const totalSaved = state.ai.hoursSavedLogs.reduce((sum, row) => sum + (Number(row.withoutAi) - Number(row.withAi)), 0);
  const avgQuality = state.ai.hoursSavedLogs.length
    ? state.ai.hoursSavedLogs.reduce((sum, row) => sum + Number(row.quality || 0), 0) / state.ai.hoursSavedLogs.length
    : 0;
  const roi = totalSaved * Number(state.profile.hourlyRate || 0);

  return (
    <div className="space-y-4">
      <Card title="AI Agent Hub" subtitle="Operational copilots for interviews, growth, fundraising, strategy, and hiring">
        <div className="grid gap-3 md:grid-cols-3">
          {state.ai.agents.map((agent) => (
            <button
              key={agent.id}
              className={`rounded-xl border p-3 text-left ${selectedAgentId === agent.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}
              onClick={() => {
                setSelectedAgentId(agent.id);
                setEditingAgent(false);
              }}
            >
              <p className="font-medium">{agent.icon} {agent.name}</p>
              <p className="text-xs text-slate-500 mt-1">{agent.description}</p>
              <p className="text-xs text-slate-500 mt-2">
                {agent.requiredInputs?.length || 0} inputs • {agent.capabilities?.length || 0} capabilities • {agent.deliverables?.length || 0} deliverables
              </p>
            </button>
          ))}
        </div>

        {selectedAgent ? (
          <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm">Necessary Agent Details: {selectedAgent.name}</h4>
              <button className="btn-secondary" onClick={() => setEditingAgent((prev) => !prev)}>
                {editingAgent ? 'Done Editing' : 'Edit Agent'}
              </button>
            </div>

            {editingAgent ? (
              <div className="space-y-2">
                <label className="text-xs">Description
                  <textarea
                    className="textarea mt-1"
                    value={selectedAgent.description || ''}
                    onChange={(e) => mutate((draft) => {
                      const target = draft.ai.agents.find((item) => item.id === selectedAgent.id);
                      if (target) target.description = e.target.value;
                    })}
                  />
                </label>
                <div className="grid gap-2 md:grid-cols-3">
                  <label className="text-xs">Required Inputs
                    <textarea
                      className="textarea mt-1 min-h-32"
                      value={toLines(selectedAgent.requiredInputs)}
                      onChange={(e) => mutate((draft) => {
                        const target = draft.ai.agents.find((item) => item.id === selectedAgent.id);
                        if (target) target.requiredInputs = fromLines(e.target.value);
                      })}
                    />
                  </label>
                  <label className="text-xs">Capabilities
                    <textarea
                      className="textarea mt-1 min-h-32"
                      value={toLines(selectedAgent.capabilities)}
                      onChange={(e) => mutate((draft) => {
                        const target = draft.ai.agents.find((item) => item.id === selectedAgent.id);
                        if (target) target.capabilities = fromLines(e.target.value);
                      })}
                    />
                  </label>
                  <label className="text-xs">Deliverables
                    <textarea
                      className="textarea mt-1 min-h-32"
                      value={toLines(selectedAgent.deliverables)}
                      onChange={(e) => mutate((draft) => {
                        const target = draft.ai.agents.find((item) => item.id === selectedAgent.id);
                        if (target) target.deliverables = fromLines(e.target.value);
                      })}
                    />
                  </label>
                </div>
                <label className="text-xs">Output Template
                  <textarea
                    className="textarea mt-1"
                    value={selectedAgent.outputTemplate || ''}
                    onChange={(e) => mutate((draft) => {
                      const target = draft.ai.agents.find((item) => item.id === selectedAgent.id);
                      if (target) target.outputTemplate = e.target.value;
                    })}
                  />
                </label>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Required inputs</p>
                  <ul className="mt-1 text-sm list-disc ml-4 space-y-1">
                    {(selectedAgent.requiredInputs || []).map((item) => <li key={`${selectedAgent.id}_in_${item}`}>{item}</li>)}
                  </ul>
                </section>
                <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Capabilities</p>
                  <ul className="mt-1 text-sm list-disc ml-4 space-y-1">
                    {(selectedAgent.capabilities || []).map((item) => <li key={`${selectedAgent.id}_cap_${item}`}>{item}</li>)}
                  </ul>
                </section>
                <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Deliverables</p>
                  <ul className="mt-1 text-sm list-disc ml-4 space-y-1">
                    {(selectedAgent.deliverables || []).map((item) => <li key={`${selectedAgent.id}_del_${item}`}>{item}</li>)}
                  </ul>
                </section>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <label className="label">Agent Input</label>
          <textarea className="textarea min-h-24" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} placeholder="Paste transcript, objective, or context" />
          <div className="mt-2 flex gap-2">
            <button className="btn-primary disabled:opacity-50" disabled={!selectedAgent} onClick={() => mutate((draft) => {
              if (!selectedAgent) return;
              const output = runAgent(selectedAgent, agentInput);
              draft.ai.agentRuns.unshift({
                id: `agent_run_${Date.now()}`,
                agentId: selectedAgent.id,
                createdAt: new Date().toISOString(),
                input: agentInput,
                output
              });
            })}><WandSparkles size={14} className="inline mr-1" />Run Agent</button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {state.ai.agentRuns.slice(0, 5).map((run) => (
            <article key={run.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs text-slate-500">{run.createdAt} • {state.ai.agents.find((a) => a.id === run.agentId)?.name}</p>
              <pre className="text-sm whitespace-pre-wrap mt-1">{run.output}</pre>
            </article>
          ))}
          {state.ai.agentRuns.length === 0 ? <EmptyState message="No agent runs yet" /> : null}
        </div>
      </Card>

      <Card title="AI Prompts Library" subtitle="100+ prompts with search, categories, and custom additions">
        <div className="grid gap-2 md:grid-cols-3 mb-3">
          <input className="input" placeholder="Search prompts" value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} />
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => mutate((draft) => {
            draft.ai.customPrompts.unshift({
              id: `custom_prompt_${Date.now()}`,
              category: 'Custom',
              title: 'New Custom Prompt',
              useCase: '',
              template: 'Write your reusable prompt...',
              exampleOutput: '',
              tips: ''
            });
          })}>+ Custom Prompt</button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {prompts.slice(0, 40).map((prompt) => (
            <div key={prompt.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2">
              <p className="text-xs text-primary-600">{prompt.category}</p>
              <p className="font-medium text-sm">{prompt.title}</p>
              <p className="text-xs text-slate-500 mt-1">{prompt.useCase}</p>
              <textarea className="textarea mt-2" value={prompt.template} onChange={(e) => mutate((draft) => {
                const target = draft.ai.prompts.find((x) => x.id === prompt.id);
                if (target) target.template = e.target.value;
                const customTarget = draft.ai.customPrompts.find((x) => x.id === prompt.id);
                if (customTarget) customTarget.template = e.target.value;
              })} />
              <div className="mt-1 flex justify-end">
                <button className="btn-secondary" onClick={() => copy(prompt.template)}><Copy size={14} className="inline mr-1" />Copy</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="AI Hours Saved Tracker" subtitle="Measure leverage and workflow ROI">
        <button className="btn-primary mb-2" onClick={() => mutate((draft) => {
          draft.ai.hoursSavedLogs.unshift({ id: `ai_log_${Date.now()}`, date: dateISO(), task: '', withoutAi: 1, withAi: 0.5, quality: 4 });
        })}>+ Log AI Task</button>

        <div className="space-y-2">
          {state.ai.hoursSavedLogs.map((row) => (
            <div key={row.id} className="grid gap-2 grid-cols-12 items-center">
              <input className="input col-span-2" type="date" value={row.date} onChange={(e) => mutate((draft) => { const t = draft.ai.hoursSavedLogs.find((x) => x.id === row.id); if (t) t.date = e.target.value; })} />
              <input className="input col-span-4" placeholder="Task" value={row.task} onChange={(e) => mutate((draft) => { const t = draft.ai.hoursSavedLogs.find((x) => x.id === row.id); if (t) t.task = e.target.value; })} />
              <input className="input col-span-2" type="number" value={row.withoutAi} onChange={(e) => mutate((draft) => { const t = draft.ai.hoursSavedLogs.find((x) => x.id === row.id); if (t) t.withoutAi = Number(e.target.value); })} />
              <input className="input col-span-2" type="number" value={row.withAi} onChange={(e) => mutate((draft) => { const t = draft.ai.hoursSavedLogs.find((x) => x.id === row.id); if (t) t.withAi = Number(e.target.value); })} />
              <input className="input col-span-1" type="number" min="1" max="5" value={row.quality} onChange={(e) => mutate((draft) => { const t = draft.ai.hoursSavedLogs.find((x) => x.id === row.id); if (t) t.quality = Number(e.target.value); })} />
              <button className="btn-danger col-span-1" onClick={() => mutate((draft) => {
                draft.ai.hoursSavedLogs = draft.ai.hoursSavedLogs.filter((x) => x.id !== row.id);
              })}>X</button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          <Metric label="Total AI hours saved" value={`${totalSaved.toFixed(1)}h`} />
          <Metric label="Average quality" value={`${avgQuality.toFixed(1)}/5`} />
          <Metric label="Estimated ROI" value={`$${roi.toLocaleString()}`} />
        </div>
      </Card>
    </div>
  );
}
