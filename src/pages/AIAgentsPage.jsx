import React, { useMemo, useState } from 'react';
import { Copy, WandSparkles } from 'lucide-react';
import { Card, EmptyState, Metric } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO } from '../lib/utils';

function runAgent(agent, input) {
  return `${agent.name}\n\nInput: ${input || 'No input provided.'}\n\nGenerated Output:\n${agent.outputTemplate}\n\nRecommended next actions:\n1) Validate assumptions with real customer signal\n2) Define KPI and success threshold\n3) Assign owner and deadline`;
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

  const selectedAgent = state.ai.agents.find((agent) => agent.id === selectedAgentId) || state.ai.agents[0];

  const prompts = useMemo(() => {
    return state.ai.prompts.filter((prompt) => {
      const matchesSearch = `${prompt.title} ${prompt.useCase}`.toLowerCase().includes(promptSearch.toLowerCase());
      const matchesCategory = category === 'all' || prompt.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [state.ai.prompts, promptSearch, category]);

  const categories = useMemo(() => ['all', ...new Set(state.ai.prompts.map((p) => p.category))], [state.ai.prompts]);

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
              onClick={() => setSelectedAgentId(agent.id)}
            >
              <p className="font-medium">{agent.icon} {agent.name}</p>
              <p className="text-xs text-slate-500 mt-1">{agent.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <label className="label">Agent Input</label>
          <textarea className="textarea min-h-24" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} placeholder="Paste transcript, objective, or context" />
          <div className="mt-2 flex gap-2">
            <button className="btn-primary" onClick={() => mutate((draft) => {
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
