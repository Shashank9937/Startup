import React from 'react';
import { Card, Metric, Progress } from '../components/ui';
import { useAppStore } from '../context/AppContext';
import { dateISO, weekStartISO } from '../lib/utils';

function SkillsTable({ title, data, onUpdate }) {
  return (
    <Card title={title}>
      <div className="space-y-2">
        {data.map((skill) => (
          <div key={skill.id} className="grid grid-cols-12 gap-2 items-center">
            <input className="input col-span-4" value={skill.name} onChange={(e) => onUpdate(skill.id, 'name', e.target.value)} />
            <input className="input col-span-2" type="number" min="1" max="10" value={skill.proficiency} onChange={(e) => onUpdate(skill.id, 'proficiency', Number(e.target.value))} />
            <input className="input col-span-3" type="number" value={skill.practiceHours} onChange={(e) => onUpdate(skill.id, 'practiceHours', Number(e.target.value))} />
            <input className="input col-span-2" type="number" value={skill.projects} onChange={(e) => onUpdate(skill.id, 'projects', Number(e.target.value))} />
            <span className="text-xs text-slate-500 col-span-1">{skill.proficiency}/10</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function LearningPage() {
  const { state, mutate } = useAppStore();

  const booksRead = state.learning.books.filter((book) => book.status === 'Complete').length;
  const booksProgress = Math.min(100, Math.round((booksRead / Math.max(1, state.learning.booksGoal)) * 100));
  const learningHoursTotal = state.learning.learningHoursLogs.reduce((sum, item) => sum + Number(item.hours || 0), 0);

  return (
    <div className="space-y-4">
      <Card title="Learning Dashboard" subtitle="From input to applied expertise">
        <div className="grid-cards">
          <Metric label="Learning hours" value={`${learningHoursTotal}h`} helper="weekly/monthly/yearly logs" />
          <Metric label="Books read" value={`${booksRead}/${state.learning.booksGoal}`} helper="Goal: 100+" />
          <Metric label="Courses completed" value={state.learning.courses.filter((c) => c.completed).length} />
          <Metric label="Mental models mastered" value={state.knowledge.mentalModels.filter((m) => m.mastery >= 7).length} helper="out of 50" />
          <Metric label="Domain expertise" value={`${state.learning.domainExpertise}/10`} />
          <Metric label="Learning streak" value={`${state.learning.learningHoursLogs.length} weeks`} />
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1"><span>Books progress</span><span>{booksProgress}%</span></div>
          <Progress value={booksProgress} />
        </div>
      </Card>

      <Card title="Books Library" subtitle="3-pass learning system with implementation">
        <button className="btn-primary mb-3" onClick={() => mutate((draft) => {
          draft.learning.books.unshift({
            id: `book_${Date.now()}`,
            title: '',
            author: '',
            category: 'General',
            status: 'To Read',
            startDate: dateISO(),
            finishDate: '',
            timeInvested: 0,
            pass1: false,
            pass2: false,
            pass3: false,
            takeaways: [],
            actionItems: [],
            rating: 0,
            modelsLearned: []
          });
        })}>+ Add Book</button>

        <div className="space-y-2">
          {state.learning.books.map((book) => (
            <div key={book.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <div className="grid gap-2 md:grid-cols-4">
                <input className="input" placeholder="Title" value={book.title} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.title = e.target.value; })} />
                <input className="input" placeholder="Author" value={book.author} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.author = e.target.value; })} />
                <input className="input" placeholder="Category" value={book.category} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.category = e.target.value; })} />
                <select className="select" value={book.status} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.status = e.target.value; })}>
                  <option>To Read</option><option>Reading</option><option>Complete</option>
                </select>
              </div>

              <div className="grid gap-2 md:grid-cols-5 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={book.pass1} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.pass1 = e.target.checked; })} />Pass 1</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={book.pass2} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.pass2 = e.target.checked; })} />Pass 2</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={book.pass3} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.pass3 = e.target.checked; })} />Pass 3</label>
                <input className="input" type="number" value={book.rating} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.rating = Number(e.target.value); })} placeholder="Rating" />
                <input className="input" type="number" value={book.timeInvested} onChange={(e) => mutate((d) => { const t = d.learning.books.find((b) => b.id === book.id); if (t) t.timeInvested = Number(e.target.value); })} placeholder="Hours" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Learning Path Tracker">
          <div className="space-y-3">
            {state.learning.path.map((step) => (
              <div key={step.id}>
                <div className="flex justify-between text-sm mb-1"><span>{step.label}</span><span>{step.progress}%</span></div>
                <Progress value={step.progress} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Domain Expertise Tracker">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Current week in plan</span><strong>Week {state.learning.domainTracker.week}/24</strong></div>
            <div className="flex justify-between"><span>Practice projects</span><strong>{state.learning.domainTracker.practiceProjects}</strong></div>
            <div className="flex justify-between"><span>Expert connections</span><strong>{state.learning.domainTracker.expertConnections}</strong></div>
            <div className="flex justify-between"><span>Content published</span><strong>{state.learning.domainTracker.contentPublished}</strong></div>
            <textarea className="textarea" value={state.learning.domainTracker.tasks.join('\n')} onChange={(e) => mutate((draft) => {
              draft.learning.domainTracker.tasks = e.target.value.split('\n').filter(Boolean);
            })} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        <SkillsTable
          title="Technical Skills"
          data={state.learning.skills.technical}
          onUpdate={(id, key, value) => mutate((draft) => {
            const target = draft.learning.skills.technical.find((skill) => skill.id === id);
            if (target) target[key] = value;
          })}
        />
        <SkillsTable
          title="Business Skills"
          data={state.learning.skills.business}
          onUpdate={(id, key, value) => mutate((draft) => {
            const target = draft.learning.skills.business.find((skill) => skill.id === id);
            if (target) target[key] = value;
          })}
        />
        <SkillsTable
          title="Leadership Skills"
          data={state.learning.skills.leadership}
          onUpdate={(id, key, value) => mutate((draft) => {
            const target = draft.learning.skills.leadership.find((skill) => skill.id === id);
            if (target) target[key] = value;
          })}
        />
      </div>

      <Card title="Learning Hours Log">
        <button className="btn-secondary mb-2" onClick={() => mutate((draft) => {
          draft.learning.learningHoursLogs.unshift({ id: `hours_${Date.now()}`, weekStart: weekStartISO(), hours: 0 });
        })}>+ Add Weekly Log</button>
        <div className="space-y-2">
          {state.learning.learningHoursLogs.map((item) => (
            <div key={item.id} className="grid grid-cols-6 gap-2">
              <input className="input col-span-3" type="date" value={item.weekStart} onChange={(e) => mutate((draft) => { const target = draft.learning.learningHoursLogs.find((x) => x.id === item.id); if (target) target.weekStart = e.target.value; })} />
              <input className="input col-span-2" type="number" value={item.hours} onChange={(e) => mutate((draft) => { const target = draft.learning.learningHoursLogs.find((x) => x.id === item.id); if (target) target.hours = Number(e.target.value); })} />
              <button className="btn-danger col-span-1" onClick={() => mutate((draft) => { draft.learning.learningHoursLogs = draft.learning.learningHoursLogs.filter((x) => x.id !== item.id); })}>X</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
