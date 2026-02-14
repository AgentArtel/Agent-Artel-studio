import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { WorkflowCard } from '@/components/workflow/WorkflowCard';
import { SearchBar } from '@/components/workflow/SearchBar';
import { WorkflowFilters } from '@/components/workflow/WorkflowFilters';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List, Trash2, Play } from 'lucide-react';
import { StatusBadge } from '@/components/ui-custom/StatusBadge';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const initialWorkflows = [
  { id: '1', name: 'AI Content Generator', description: 'Generates blog posts from keywords using OpenAI', status: 'active' as const, lastRun: '2m ago', executionCount: 142, nodes: 5 },
  { id: '2', name: 'Customer Support Bot', description: 'Auto-replies to common questions with AI', status: 'active' as const, lastRun: '15m ago', executionCount: 89, nodes: 8 },
  { id: '3', name: 'Email Automation', description: 'Sends weekly newsletters to subscribers', status: 'inactive' as const, executionCount: 56, nodes: 4 },
  { id: '4', name: 'Data Sync', description: 'Syncs data between platforms every hour', status: 'error' as const, lastRun: '2h ago', executionCount: 234, nodes: 12 },
  { id: '5', name: 'Slack Notifications', description: 'Sends alerts for important events', status: 'active' as const, lastRun: '1h ago', executionCount: 567, nodes: 3 },
  { id: '6', name: 'Lead Scoring', description: 'Scores leads based on behavior', status: 'active' as const, lastRun: '30m ago', executionCount: 123, nodes: 7 },
];

interface WorkflowListProps {
  onNavigate: (page: string) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onNavigate }) => {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastRun' | 'created'>('lastRun');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedWorkflows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedWorkflows.length === 0) return;
    setWorkflows(prev => prev.filter(w => !selectedWorkflows.includes(w.id)));
    setSelectedWorkflows([]);
    toast.success(`Deleted ${selectedWorkflows.length} workflow(s)`);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedWorkflows = useMemo(() => {
    if (sortBy === 'name') return [...filteredWorkflows].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'lastRun') return [...filteredWorkflows].sort((a, b) => (b.executionCount ?? 0) - (a.executionCount ?? 0));
    return filteredWorkflows;
  }, [filteredWorkflows, sortBy]);

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Workflows</h1>
          <p className="text-white/50 mt-1">Manage and monitor your automation workflows</p>
        </div>
        <Button className="bg-green text-dark hover:bg-green-light" onClick={() => onNavigate('editor')}>
          <Plus className="w-4 h-4 mr-2" /> Create Workflow
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} className="max-w-md" />
          <WorkflowFilters statusFilter={statusFilter} onStatusChange={setStatusFilter} sortBy={sortBy} onSortChange={setSortBy} />
        </div>
        <div className="flex items-center gap-2">
          {selectedWorkflows.length > 0 && (
            <Button variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedWorkflows.length})
            </Button>
          )}
          <div className="flex items-center gap-1 p-1 bg-dark-100 rounded-lg border border-white/5">
            <button onClick={() => setViewMode('grid')} className={cn("w-8 h-8 rounded-md flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn("w-8 h-8 rounded-md flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {sortedWorkflows.length > 0 ? (
        viewMode === 'list' ? (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 bg-dark-100/50 border-b border-white/5 text-xs text-white/50 font-medium">
              <span className="w-8" />
              <span>Name</span>
              <span>Description</span>
              <span>Nodes</span>
              <span>Last run</span>
              <span className="w-10" />
            </div>
            {sortedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onNavigate('editor')}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selectedWorkflows.includes(workflow.id)} onCheckedChange={() => toggleSelection(workflow.id)} className="border-white/30 data-[state=checked]:bg-green data-[state=checked]:border-green" />
                </div>
                <StatusBadge status={workflow.status} pulse={workflow.status === 'active'} />
                <span className="font-medium text-white truncate italic">{workflow.name}</span>
                <span className="text-white/60 truncate italic">{workflow.description ?? '—'}</span>
                <span className="text-white/60 italic">{workflow.nodes ?? 0}</span>
                <span className="text-white/60 italic">{workflow.lastRun ?? 'Never'}</span>
                <button
                  className="w-8 h-8 rounded-lg bg-green/15 flex items-center justify-center text-green hover:bg-green/25 transition-colors"
                  onClick={(e) => { e.stopPropagation(); toast.success(`Workflow "${workflow.name}" started`); }}
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                {...workflow}
                selected={selectedWorkflows.includes(workflow.id)}
                onToggleSelect={() => toggleSelection(workflow.id)}
                onRun={() => toast.success(`Workflow "${workflow.name}" started`)}
                onEdit={() => onNavigate('editor')}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState title="No workflows found" description={searchQuery ? "Try adjusting your search or filters" : "Get started by creating your first workflow"} actionLabel="Create Workflow" onAction={() => onNavigate('editor')} />
      )}
    </div>
  );
};
