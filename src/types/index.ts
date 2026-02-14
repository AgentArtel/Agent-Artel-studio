export type NodeType =
  | 'trigger'
  | 'ai-agent'
  | 'openai-chat'
  | 'anthropic-chat'
  | 'memory'
  | 'http-tool'
  | 'code-tool'
  | 'custom-tool'
  | 'webhook'
  | 'schedule'
  | 'if'
  | 'merge';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeConfig {
  credential?: string;
  model?: string;
  prompt?: string;
  maxIterations?: number;
  creativity?: number;
  language?: string;
  lines?: number;
  url?: string;
  webhookUrl?: string;
  method?: string;
  [key: string]: unknown;
}

export interface NodeData {
  id: string;
  type: NodeType;
  position: NodePosition;
  title: string;
  subtitle?: string;
  config?: NodeConfig;
  isConfigured?: boolean;
  isActive?: boolean;
  isDeactivated?: boolean;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
  label?: string;
  animated?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: NodeData[];
  connections: Connection[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  executionCount?: number;
  lastExecutionStatus?: 'success' | 'error' | 'running';
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeResults: Record<string, {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: string;
    completedAt?: string;
    output?: unknown;
    error?: string;
  }>;
}

export interface Credential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  lastUsed?: string;
}

export interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}
