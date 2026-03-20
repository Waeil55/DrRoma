/**
 * MARIAM PRO  Root App Shell
 * ~80 lines. No business logic, no prop drilling.
 * Wraps providers  error boundary  main app content.
 *
 * NOTE: The actual running app is still in /src/App.jsx (the monolith).
 * This shell is the target architecture for when migration is complete.
 * Currently not wired into main.jsx to avoid breaking the live app.
 */
import React, { Suspense, lazy } from 'react';
import AppProviders from './AppProviders.jsx';
import AppErrorBoundary from './AppErrorBoundary.jsx';

// Lazy-loaded views (code splitting)
const FlashcardsView = lazy(() => import('../components/flashcards/FlashcardsView.jsx'));
const ExamsView = lazy(() => import('../components/exams/ExamsView.jsx'));
const CasesView = lazy(() => import('../components/cases/CasesView.jsx'));
const ChatPanel = lazy(() => import('../components/chat/ChatPanel.jsx'));
const TasksView = lazy(() => import('../components/tasks/TasksView.jsx'));
const VoiceTutorModal = lazy(() => import('../components/voice/VoiceTutorModal.jsx'));
const StudyPodcastPanel = lazy(() => import('../components/voice/StudyPodcastPanel.jsx'));
const SettingsView = lazy(() => import('../components/settings/SettingsView.jsx'));
const DashboardView = lazy(() => import('../components/dashboard/DashboardView.jsx'));

// Skeleton loader for Suspense fallbacks
function SkeletonLoader() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="space-y-3 w-full max-w-md">
        <div className="skeleton skeleton-rect h-8 w-3/4" />
        <div className="skeleton skeleton-line w-full" />
        <div className="skeleton skeleton-line w-5/6" />
        <div className="skeleton skeleton-line w-2/3" />
      </div>
    </div>
  );
}

// View router (maps view key  lazy component)
const VIEW_MAP = {
  flashcards: FlashcardsView,
  exams: ExamsView,
  cases: CasesView,
  chat: ChatPanel,
  tasks: TasksView,
  settings: SettingsView,
  dashboard: DashboardView,
};

function AppContent() {
  // In the future, this will use useAppStore for routing.
  // For now, this is a structural placeholder.
  return (
    <div className="flex flex-col h-dvh" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Suspense fallback={<SkeletonLoader />}>
        {/* Main content area  will be wired to the active view */}
        <div className="flex-1 min-h-0 flex flex-col">
          <SkeletonLoader />
        </div>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </AppErrorBoundary>
  );
}
