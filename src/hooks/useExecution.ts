/**
 * ============================================================================
 * USE EXECUTION HOOK
 * ============================================================================
 *
 * PURPOSE:
 * Manages workflow execution state with real Gemini edge function calls.
 * Dispatches to generate-image, gemini-chat, gemini-embed, gemini-vision
 * based on node type. Falls back to simulated execution for unsupported types.
 *
 * @author Open Agent Artel Team
 * @version 5.0.0 (Real Execution Engine)
 * ============================================================================
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { NodeData, Connection } from '@/types';
import { generateImage } from '@/lib/generateImage';
import { geminiChat, geminiEmbed, geminiVision } from '@/lib/geminiServices';

export type NodeExecutionStatus = 'waiting' | 'running' | 'success' | 'error' | 'skipped';
export type ExecutionState = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export interface ExecutionLog {
  id: string;
  timestamp: number;
  nodeId: string;
  nodeName: string;
  status: NodeExecutionStatus;
  message?: string;
  duration?: number;
}

export interface ExecutionResult {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: ExecutionState;
  nodeStatuses: Record<string, NodeExecutionStatus>;
  logs: ExecutionLog[];
  error?: string;
}

export type NodeStatusMap = Record<string, NodeExecutionStatus>;

export interface UseExecutionOptions {
  nodes: NodeData[];
  connections: Connection[];
  onExecutionStart?: () => void;
  onExecutionComplete?: (result: ExecutionResult) => void;
  onExecutionError?: (error: string) => void;
  onNodeStatusChange?: (nodeId: string, status: NodeExecutionStatus) => void;
}

export interface UseExecutionReturn {
  executionState: ExecutionState;
  nodeStatuses: NodeStatusMap;
  progress: number;
  logs: ExecutionLog[];
  currentExecutionId: string | null;
  startTime: number | null;
  isExecuting: boolean;
  canExecute: boolean;
  executionHistory: ExecutionResult[];
  nodeResults: Record<string, any>;
  startExecution: () => void;
  stopExecution: () => void;
  pauseExecution: () => void;
  resumeExecution: () => void;
  resetExecution: () => void;
  getNodeStatus: (nodeId: string) => NodeExecutionStatus;
  setNodeStatus: (nodeId: string, status: NodeExecutionStatus) => void;
  clearHistory: () => void;
}

function generateExecutionId(): string {
  return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function buildExecutionOrder(nodes: NodeData[], connections: Connection[]): string[] {
  const nodeIds = nodes.map((n) => n.id);
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  nodeIds.forEach((id) => {
    inDegree[id] = 0;
    adjacency[id] = [];
  });

  connections.forEach((conn) => {
    if (adjacency[conn.from]) {
      adjacency[conn.from].push(conn.to);
      inDegree[conn.to]++;
    }
  });

  const queue: string[] = [];
  const result: string[] = [];

  nodeIds.forEach((id) => {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    adjacency[current].forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result;
}

/**
 * Resolve template strings like {{nodeId.text}} from upstream node results.
 */
function resolveTemplates(value: string, nodeResults: Record<string, any>): string {
  if (!value || typeof value !== 'string') return value;
  return value.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, nodeId, field) => {
    return nodeResults[nodeId]?.[field] ?? match;
  });
}

/**
 * Execute a single node by dispatching to the appropriate edge function.
 */
async function executeNodeByType(
  node: NodeData,
  nodeResults: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = (node.config ?? {}) as Record<string, any>;

  switch (node.type) {
    // --- Pass-through nodes (entry points) ---
    case 'trigger':
    case 'webhook':
    case 'schedule':
      return { success: true, data: { type: node.type, triggered: true } };

    // --- Image Generation ---
    case 'image-gen': {
      const prompt = resolveTemplates(config.prompt ?? 'A cute robot', nodeResults);
      const result = await generateImage({
        prompt,
        style: config.style,
        agentId: config.agentId,
      });
      if (result.success) {
        return { success: true, data: { imageDataUrl: result.imageDataUrl } };
      }
      return { success: false, error: result.error || result.message || 'Image generation failed' };
    }

    // --- Gemini Chat ---
    case 'gemini-chat': {
      const systemPrompt = resolveTemplates(config.systemPrompt ?? '', nodeResults);
      const userMessage = resolveTemplates(config.prompt ?? config.userMessage ?? 'Hello', nodeResults);
      const result = await geminiChat({
        messages: [{ role: 'user', content: userMessage }],
        model: config.model,
        temperature: config.temperature ? Number(config.temperature) : undefined,
        maxTokens: config.maxTokens ? Number(config.maxTokens) : undefined,
        systemPrompt: systemPrompt || undefined,
      });
      if (result.success) {
        return { success: true, data: { text: result.text, usage: result.usage } };
      }
      return { success: false, error: result.error || result.message || 'Chat completion failed' };
    }

    // --- Gemini Embed ---
    case 'gemini-embed': {
      const text = resolveTemplates(config.text ?? config.inputText ?? 'Hello world', nodeResults);
      const result = await geminiEmbed({
        text,
        model: config.model,
      });
      if (result.success) {
        return { success: true, data: { embeddings: result.embeddings, dimensions: result.embeddings?.[0]?.length } };
      }
      return { success: false, error: result.error || result.message || 'Embedding failed' };
    }

    // --- Gemini Vision ---
    case 'gemini-vision': {
      const prompt = resolveTemplates(config.prompt ?? 'Describe this image', nodeResults);
      const imageUrl = resolveTemplates(config.imageUrl ?? '', nodeResults);
      if (!imageUrl) {
        return { success: false, error: 'No imageUrl provided for vision node' };
      }
      const result = await geminiVision({
        prompt,
        imageUrl,
        model: config.model,
      });
      if (result.success) {
        return { success: true, data: { text: result.text } };
      }
      return { success: false, error: result.error || result.message || 'Vision analysis failed' };
    }

    // --- Simulated nodes (no backend yet) ---
    default: {
      console.log(`[Execution] Simulating node "${node.title}" (type: ${node.type}) — no real backend`);
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
      return { success: true, data: { simulated: true, type: node.type } };
    }
  }
}

export function useExecution(options: UseExecutionOptions): UseExecutionReturn {
  const { nodes, connections, onExecutionStart, onExecutionComplete, onExecutionError, onNodeStatusChange } = options;

  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatusMap>({});
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [nodeResults, setNodeResults] = useState<Record<string, any>>({});

  const executionOrderRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const nodeResultsRef = useRef<Record<string, any>>({});

  const progress = useMemo(() => {
    if (executionState === 'idle') return 0;
    if (executionState === 'completed') return 100;

    const totalNodes = nodes.length;
    if (totalNodes === 0) return 0;

    const completedNodes = Object.values(nodeStatuses).filter(
      (s) => s === 'success' || s === 'error' || s === 'skipped'
    ).length;

    return Math.round((completedNodes / totalNodes) * 100);
  }, [executionState, nodeStatuses, nodes.length]);

  const addLog = useCallback((nodeId: string, nodeName: string, status: NodeExecutionStatus, message?: string, duration?: number) => {
    const log: ExecutionLog = {
      id: generateLogId(),
      timestamp: Date.now(),
      nodeId,
      nodeName,
      status,
      message,
      duration,
    };
    setLogs((prev) => [...prev, log]);
  }, []);

  const setNodeStatus = useCallback(
    (nodeId: string, status: NodeExecutionStatus) => {
      setNodeStatuses((prev) => ({ ...prev, [nodeId]: status }));
      onNodeStatusChange?.(nodeId, status);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        addLog(nodeId, node.title, status);
      }
    },
    [nodes, onNodeStatusChange, addLog]
  );

  const getNodeStatus = useCallback(
    (nodeId: string) => {
      return nodeStatuses[nodeId] || 'waiting';
    },
    [nodeStatuses]
  );

  const executeNextNode = useCallback(async () => {
    if (isPausedRef.current || isCancelledRef.current) return;

    const order = executionOrderRef.current;
    const index = currentIndexRef.current;

    if (index >= order.length) {
      const endTime = Date.now();
      const hasErrors = Object.values(nodeStatuses).some(s => s === 'error');
      const result: ExecutionResult = {
        id: currentExecutionId!,
        startTime: startTime!,
        endTime,
        duration: endTime - startTime!,
        status: hasErrors ? 'error' : 'completed',
        nodeStatuses: { ...nodeStatuses },
        logs: [...logs],
      };

      setExecutionState(hasErrors ? 'error' : 'completed');
      setExecutionHistory((prev) => [result, ...prev].slice(0, 50));
      onExecutionComplete?.(result);
      return;
    }

    const nodeId = order[index];
    const node = nodes.find((n) => n.id === nodeId);

    if (!node) {
      currentIndexRef.current++;
      executeNextNode();
      return;
    }

    if (node.isDeactivated) {
      setNodeStatus(nodeId, 'skipped');
      currentIndexRef.current++;
      executeNextNode();
      return;
    }

    // Check if upstream nodes failed — skip if so
    const upstreamIds = connections.filter(c => c.to === nodeId).map(c => c.from);
    const upstreamFailed = upstreamIds.some(id => nodeStatuses[id] === 'error');
    if (upstreamFailed) {
      setNodeStatus(nodeId, 'skipped');
      addLog(nodeId, node.title, 'skipped', 'Skipped: upstream node failed');
      currentIndexRef.current++;
      executeNextNode();
      return;
    }

    setNodeStatus(nodeId, 'running');
    const nodeStartTime = Date.now();

    try {
      const result = await executeNodeByType(node, nodeResultsRef.current);
      const duration = Date.now() - nodeStartTime;

      if (isCancelledRef.current) return;

      if (result.success) {
        nodeResultsRef.current[nodeId] = result.data;
        setNodeResults({ ...nodeResultsRef.current });
        setNodeStatus(nodeId, 'success');
        addLog(nodeId, node.title, 'success', undefined, duration);
      } else {
        nodeResultsRef.current[nodeId] = { error: result.error };
        setNodeResults({ ...nodeResultsRef.current });
        setNodeStatus(nodeId, 'error');
        addLog(nodeId, node.title, 'error', result.error, duration);
        onExecutionError?.(result.error || `Node "${node.title}" failed`);
      }
    } catch (err: any) {
      const duration = Date.now() - nodeStartTime;
      if (isCancelledRef.current) return;
      const errorMsg = err?.message || 'Unknown execution error';
      nodeResultsRef.current[nodeId] = { error: errorMsg };
      setNodeResults({ ...nodeResultsRef.current });
      setNodeStatus(nodeId, 'error');
      addLog(nodeId, node.title, 'error', errorMsg, duration);
      onExecutionError?.(errorMsg);
    }

    currentIndexRef.current++;
    if (!isPausedRef.current && !isCancelledRef.current) {
      executeNextNode();
    }
  }, [currentExecutionId, logs, nodeStatuses, nodes, connections, onExecutionComplete, onExecutionError, setNodeStatus, startTime, addLog]);

  const startExecution = useCallback(() => {
    if (executionState === 'running') return;

    const executionId = generateExecutionId();
    const now = Date.now();

    executionOrderRef.current = buildExecutionOrder(nodes, connections);
    currentIndexRef.current = 0;
    isPausedRef.current = false;
    isCancelledRef.current = false;
    nodeResultsRef.current = {};

    setCurrentExecutionId(executionId);
    setStartTime(now);
    setExecutionState('running');
    setNodeStatuses({});
    setNodeResults({});
    setLogs([]);

    nodes.forEach((node) => {
      if (!node.isDeactivated) {
        setNodeStatus(node.id, 'waiting');
      }
    });

    onExecutionStart?.();

    // Defer to next tick so state updates are flushed
    setTimeout(() => executeNextNode(), 0);
  }, [connections, executionState, executeNextNode, nodes, onExecutionStart, setNodeStatus]);

  const stopExecution = useCallback(() => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    setExecutionState('idle');
  }, []);

  const pauseExecution = useCallback(() => {
    if (executionState !== 'running') return;
    isPausedRef.current = true;
    setExecutionState('paused');
  }, [executionState]);

  const resumeExecution = useCallback(() => {
    if (executionState !== 'paused') return;
    isPausedRef.current = false;
    setExecutionState('running');
    executeNextNode();
  }, [executionState, executeNextNode]);

  const resetExecution = useCallback(() => {
    stopExecution();
    setExecutionState('idle');
    setNodeStatuses({});
    setNodeResults({});
    setLogs([]);
    setCurrentExecutionId(null);
    setStartTime(null);
  }, [stopExecution]);

  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
  }, []);

  return {
    executionState,
    nodeStatuses,
    progress,
    logs,
    currentExecutionId,
    startTime,
    isExecuting: executionState === 'running',
    canExecute: executionState === 'idle' || executionState === 'completed' || executionState === 'error',
    executionHistory,
    nodeResults,
    startExecution,
    stopExecution,
    pauseExecution,
    resumeExecution,
    resetExecution,
    getNodeStatus,
    setNodeStatus,
    clearHistory,
  };
}
