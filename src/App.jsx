import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layout from './components/Layout';
import { Toast } from './components/ui';
import { useAppStore } from './context/AppContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExecutionPage = lazy(() => import('./pages/ExecutionPage'));
const MetricsPage = lazy(() => import('./pages/MetricsPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const DecisionPage = lazy(() => import('./pages/DecisionPage'));
const AIAgentsPage = lazy(() => import('./pages/AIAgentsPage'));
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const FundraisingPage = lazy(() => import('./pages/FundraisingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function RouteWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function LoadingFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-500">
      Loading module...
    </div>
  );
}

function AppRoutes({ onToast }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RouteWrapper><DashboardPage /></RouteWrapper>} />
          <Route path="/execution" element={<RouteWrapper><ExecutionPage /></RouteWrapper>} />
          <Route path="/metrics" element={<RouteWrapper><MetricsPage /></RouteWrapper>} />
          <Route path="/knowledge" element={<RouteWrapper><KnowledgePage /></RouteWrapper>} />
          <Route path="/learning" element={<RouteWrapper><LearningPage /></RouteWrapper>} />
          <Route path="/decisions" element={<RouteWrapper><DecisionPage /></RouteWrapper>} />
          <Route path="/ai" element={<RouteWrapper><AIAgentsPage /></RouteWrapper>} />
          <Route path="/network" element={<RouteWrapper><NetworkPage /></RouteWrapper>} />
          <Route path="/fundraising" element={<RouteWrapper><FundraisingPage /></RouteWrapper>} />
          <Route path="/settings" element={<RouteWrapper><SettingsPage onToast={onToast} /></RouteWrapper>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  const { state, mutate, exportJson, importJson, pullFromServer, pushToServer } = useAppStore();
  const [toast, setToast] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMeta, setSyncMeta] = useState('No sync yet');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const roadmapProgress = useMemo(() => {
    const months = state.roadmap.months;
    const values = months.map((month) => {
      const total = month.weeks.flatMap((w) => w.tasks).length + month.exitCriteria.length + month.activities.length;
      const done = month.weeks.flatMap((w) => w.tasks).filter((t) => t.done).length
        + month.exitCriteria.filter((x) => x.done).length
        + month.activities.filter((x) => x.done).length;
      return total ? (done / total) * 100 : 0;
    });
    return `${Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length))}%`;
  }, [state.roadmap.months]);

  const badges = { roadmapProgress };

  useKeyboardShortcuts(state.settings.keyboardShortcutsEnabled, {
    'mod+1': () => navigate('/'),
    'mod+2': () => navigate('/execution'),
    'mod+3': () => navigate('/metrics'),
    'mod+4': () => navigate('/knowledge'),
    'mod+5': () => navigate('/learning'),
    'mod+6': () => navigate('/decisions'),
    'mod+7': () => navigate('/ai'),
    'mod+8': () => navigate('/network'),
    'mod+9': () => navigate('/fundraising'),
    'mod+0': () => navigate('/settings')
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout
        badges={badges}
        darkMode={state.settings.darkMode}
        onToggleTheme={() => mutate((draft) => { draft.settings.darkMode = !draft.settings.darkMode; })}
        syncBusy={syncBusy}
        syncMeta={syncMeta}
        onPrint={() => window.print()}
        onExport={() => {
          exportJson();
          setToast('Exported data to JSON.');
        }}
        onImport={async (file) => {
          try {
            await importJson(file);
            setToast('Imported data from JSON.');
          } catch {
            setToast('Import failed. Invalid file format.');
          }
        }}
        onPull={async () => {
          setSyncBusy(true);
          try {
            const payload = await pullFromServer();
            setSyncMeta(`Pulled ${payload?.updatedAt || 'no timestamp'}`);
            setToast('Pulled cloud backup.');
          } catch {
            setToast('Pull failed.');
          } finally {
            setSyncBusy(false);
          }
        }}
        onPush={async () => {
          setSyncBusy(true);
          try {
            const payload = await pushToServer();
            setSyncMeta(`Pushed ${payload?.updatedAt || 'no timestamp'}`);
            setToast('Pushed cloud backup.');
          } catch {
            setToast('Push failed.');
          } finally {
            setSyncBusy(false);
          }
        }}
      >
        <AppRoutes onToast={setToast} />
      </Layout>
      <Toast toast={toast} />
    </DndProvider>
  );
}
