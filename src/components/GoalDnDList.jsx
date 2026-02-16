import React, { useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const TYPE = 'goal-card';

function GoalRow({ item, index, move, onToggle, onChange, onRemove, limitReached }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: TYPE,
    hover(dragged) {
      if (!ref.current) return;
      if (dragged.index === index) return;
      move(dragged.index, index);
      dragged.index = index;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 ${isDragging ? 'opacity-50' : ''}`}
      role="listitem"
    >
      <span className="cursor-grab text-slate-400" aria-hidden>⋮⋮</span>
      <input type="checkbox" checked={item.done} onChange={(e) => onToggle(item.id, e.target.checked)} aria-label="toggle goal completion" />
      <input
        className="flex-1 rounded-md bg-transparent border border-slate-200 dark:border-slate-700 px-2 py-1"
        value={item.text}
        onChange={(e) => onChange(item.id, e.target.value)}
        placeholder="Goal description"
      />
      <button className="text-xs text-rose-500" onClick={() => onRemove(item.id)}>Delete</button>
      <span className="text-xs text-slate-500">{index + 1}</span>
    </div>
  );
}

export default function GoalDnDList({ goals, onReorder, onToggle, onChange, onRemove, onAdd }) {
  const canAdd = useMemo(() => goals.length < 3, [goals.length]);

  return (
    <div className="space-y-2" role="list" aria-label="Weekly top goals">
      {goals.map((goal, index) => (
        <GoalRow
          key={goal.id}
          item={goal}
          index={index}
          move={onReorder}
          onToggle={onToggle}
          onChange={onChange}
          onRemove={onRemove}
          limitReached={!canAdd}
        />
      ))}
      <button
        disabled={!canAdd}
        className="w-full rounded-lg px-3 py-2 text-sm border border-dashed border-slate-300 dark:border-slate-700 disabled:opacity-50"
        onClick={onAdd}
      >
        + Add Goal (max 3)
      </button>
    </div>
  );
}
