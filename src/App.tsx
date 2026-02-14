import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from '@/components/ui-custom/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { WorkflowList } from '@/pages/WorkflowList';
import { ExecutionHistory } from '@/pages/ExecutionHistory';
import { Credentials } from '@/pages/Credentials';
import { Settings } from '@/pages/Settings';
import { AgentLibrary } from '@/pages/AgentLibrary';
import { WorkflowEditorPage } from '@/pages/WorkflowEditorPage';
import { ShowcasePage } from '@/pages/ShowcasePage';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

type Page = 'dashboard' | 'workflows' | 'executions' | 'credentials' | 'templates' | 'settings' | 'editor' | 'showcase';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'workflows': return <WorkflowList />;
      case 'executions': return <ExecutionHistory />;
      case 'credentials': return <Credentials />;
      case 'templates': return <AgentLibrary />;
      case 'settings': return <Settings />;
      case 'editor': return <WorkflowEditorPage />;
      case 'showcase': return <ShowcasePage />;
      default: return <Dashboard />;
    }
  };

  // Editor page has different layout (no sidebar)
  if (currentPage === 'editor') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-dark text-white font-urbanist">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="fixed top-4 left-4 z-50 px-3 py-1.5 bg-dark-100 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white hover:border-green/30 transition-all"
            >
              ← Back to Dashboard
            </button>
            {renderPage()}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-dark text-white font-urbanist">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeItem={currentPage}
            onItemClick={(id) => setCurrentPage(id as Page)}
          />
          <main className={cn(
            "transition-all duration-moderate ease-out-expo",
            sidebarCollapsed ? 'ml-16' : 'ml-60'
          )}>
            {renderPage()}
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
