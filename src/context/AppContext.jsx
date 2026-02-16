import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { ensureStateShape, createDefaultState } from '../lib/schema';
import {
  autoWeeklyReviewTemplate,
  calculateMonthInJourney,
  monthISO,
  monthlyReportTemplate,
  nowISO,
  weekStartISO
} from '../lib/utils';

const STORAGE_KEY = 'founder_os_ultimate_v2';

const AppContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return ensureStateShape(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

function updatePath(target, path, value) {
  const keys = path.split('.');
  const clone = structuredClone(target);
  let cursor = clone;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (cursor[key] == null || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
  return clone;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return ensureStateShape(action.payload);
    case 'UPDATE_PATH':
      return updatePath(state, action.path, action.value);
    case 'PATCH':
      return ensureStateShape({ ...state, ...action.patch });
    case 'MUTATE': {
      const draft = structuredClone(state);
      action.mutator(draft);
      return ensureStateShape(draft);
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(state.settings.darkMode));
    document.documentElement.dataset.scheme = state.settings.colorScheme || 'blue';
  }, [state.settings.darkMode, state.settings.colorScheme]);

  useEffect(() => {
    const computedMonth = calculateMonthInJourney(state.profile.startDate);
    if (state.currentMonth !== computedMonth) {
      dispatch({ type: 'UPDATE_PATH', path: 'currentMonth', value: computedMonth });
    }
  }, [state.profile.startDate, state.currentMonth]);

  const setState = useCallback((payload) => dispatch({ type: 'SET_STATE', payload }), []);
  const updatePathValue = useCallback((path, value) => dispatch({ type: 'UPDATE_PATH', path, value }), []);
  const patch = useCallback((partial) => dispatch({ type: 'PATCH', patch: partial }), []);
  const mutate = useCallback((mutator) => dispatch({ type: 'MUTATE', mutator }), []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `founder-os-ultimate-${monthISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJson = useCallback(async (file) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    setState(parsed);
  }, [setState]);

  const resetState = useCallback(() => {
    setState(createDefaultState());
  }, [setState]);

  const pullFromServer = useCallback(async () => {
    const response = await fetch('/api/founder-os');
    if (!response.ok) throw new Error('pull failed');
    const payload = await response.json();
    if (payload?.data) setState(payload.data);
    return payload;
  }, [setState]);

  const pushToServer = useCallback(async () => {
    const response = await fetch('/api/founder-os', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: state })
    });
    if (!response.ok) throw new Error('push failed');
    return response.json();
  }, [state]);

  const generateWeeklyReview = useCallback(() => {
    mutate((draft) => {
      const week = weekStartISO();
      const review = autoWeeklyReviewTemplate(draft, week);
      draft.knowledge.weeklyReviews.unshift(review);
      draft.reports.weekly.unshift({
        id: `weekly_${week}`,
        generatedAt: nowISO(),
        ...review
      });
    });
  }, [mutate]);

  const generateMonthlyReport = useCallback(() => {
    mutate((draft) => {
      const month = monthISO();
      const report = monthlyReportTemplate(draft, month);
      draft.reports.monthly.unshift(report);
    });
  }, [mutate]);

  const value = useMemo(() => ({
    state,
    setState,
    updatePathValue,
    patch,
    mutate,
    exportJson,
    importJson,
    resetState,
    pullFromServer,
    pushToServer,
    generateWeeklyReview,
    generateMonthlyReport
  }), [
    state,
    setState,
    updatePathValue,
    patch,
    mutate,
    exportJson,
    importJson,
    resetState,
    pullFromServer,
    pushToServer,
    generateWeeklyReview,
    generateMonthlyReport
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used inside AppProvider');
  return context;
}
