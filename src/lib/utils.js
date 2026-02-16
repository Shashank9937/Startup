import { addDays, differenceInCalendarDays, endOfMonth, format, startOfWeek } from 'date-fns';

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function pct(value, decimals = 1) {
  return `${num(value).toFixed(decimals)}%`;
}

export function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num(value));
}

export function dateISO(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
}

export function monthISO(value = new Date()) {
  return new Date(value).toISOString().slice(0, 7);
}

export function weekStartISO(value = new Date()) {
  return dateISO(startOfWeek(value, { weekStartsOn: 1 }));
}

export function nowISO() {
  return new Date().toISOString();
}

export function calculateDayInJourney(startDate) {
  if (!startDate) return 1;
  return clamp(differenceInCalendarDays(new Date(), new Date(startDate)) + 1, 1, 365);
}

export function calculateMonthInJourney(startDate) {
  const day = calculateDayInJourney(startDate);
  return clamp(Math.ceil(day / 30.42), 1, 12);
}

export function runwayTone(value) {
  if (num(value) < 6) return 'danger';
  if (num(value) <= 12) return 'warning';
  return 'success';
}

export function reorder(list, fromIndex, toIndex) {
  const copy = [...list];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

export function autoWeeklyReviewTemplate(state, weekStart) {
  const latest = [...state.metrics.snapshots].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const goalsDone = state.dashboard.weeklyGoals.filter((item) => item.done).length;
  const learnings = state.knowledge.dailyJournal
    .filter((entry) => entry.date >= weekStart)
    .slice(0, 5)
    .map((entry) => `- ${entry.insight}`)
    .join('\n');

  return {
    id: uid('review'),
    weekStart,
    createdAt: nowISO(),
    summary: `Week of ${weekStart}\n\nMRR: ${money(latest?.mrr || 0)}\nGrowth: ${pct(latest?.momGrowth || 0)}\nConversations: ${latest?.conversations || 0}`,
    goalsProgress: `${goalsDone}/${state.dashboard.weeklyGoals.length} weekly goals completed`,
    learnings: learnings || '- No learning highlights captured yet',
    decisions: state.decisions.items.filter((item) => item.date >= weekStart).map((item) => item.statement).join(', ') || 'None logged',
    nextPriorities: state.dashboard.priorities.map((p) => `- ${p.text}`).join('\n')
  };
}

export function monthlyReportTemplate(state, month) {
  const monthSnapshots = state.metrics.snapshots.filter((s) => s.date.startsWith(month));
  const first = monthSnapshots.at(0);
  const last = monthSnapshots.at(-1);
  const currentMonth = calculateMonthInJourney(state.profile?.startDate);

  return {
    id: uid('report'),
    month,
    createdAt: nowISO(),
    headline: `Month ${currentMonth}: ${state.roadmap.months[currentMonth - 1]?.title || 'Execution'}`,
    metrics: {
      mrrStart: first?.mrr || 0,
      mrrEnd: last?.mrr || 0,
      customers: last?.customers || 0,
      growth: last?.momGrowth || 0
    },
    notes: 'Auto-generated synthesis. Add screenshots, wins, and key failures.'
  };
}

export function next30DaysMilestones() {
  return [
    { id: uid('milestone'), title: 'Ship onboarding improvements', date: dateISO(addDays(new Date(), 5)), status: 'in_progress' },
    { id: uid('milestone'), title: 'Complete 10 investor research notes', date: dateISO(addDays(new Date(), 11)), status: 'not_started' },
    { id: uid('milestone'), title: 'Publish monthly investor update', date: dateISO(endOfMonth(new Date())), status: 'not_started' }
  ];
}

export function formatFriendlyDate(value, pattern = 'MMM d, yyyy') {
  try {
    return format(new Date(value), pattern);
  } catch {
    return value || '—';
  }
}
