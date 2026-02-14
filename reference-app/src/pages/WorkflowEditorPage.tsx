import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { CanvasNode } from '@/components/canvas/CanvasNode';
import { ConnectionLine } from '@/components/canvas/ConnectionLine';
import { NodeSearchPalette } from '@/components/canvas/NodeSearchPalette';
import { ConfigPanel } from '@/components/ConfigPanel';
import { BottomToolbar } from '@/components/BottomToolbar';
import { Header } from '@/components/Header';
import type { NodeData, Connection, NodeType } from '@/types';

// Initial demo workflow
const initialNodes: NodeData[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 100, y: 150 },
    title: 'Chat Trigger',
    subtitle: 'When chat message received',
    isConfigured: true,
  },
  {
    id: 'ai-agent-1',
    type: 'ai-agent',
    position: { x: 450, y: 150 },
    title: 'AI Agent',
    subtitle: 'Tools Agent',
    isConfigured: true,
  },
  {
    id: 'openai-1',
    type: 'openai-chat',
    position: { x: 300, y: 400 },
    title: 'OpenAI Chat',
    subtitle: 'gpt-4o-mini',
    config: {
      credential: 'Open AI account 4',
      model: 'gpt-4o-mini',
    },
    isConfigured: true,
  },
  {
    id: 'memory-1',
    type: 'memory',
    position: { x: 600, y: 400 },
    title: 'Postgres Memory',
    subtitle: 'Chat memory storage',
    isDeactivated: true,
  },
];

const initialConnections: Connection[] = [
  { id: 'conn-1', from: 'trigger-1', to: 'ai-agent-1', fromPort: 'output', toPort: 'input', label: '1 item' },
  { id: 'conn-2', from: 'ai-agent-1', to: 'openai-1', fromPort: 'output', toPort: 'input', label: 'Chat model' },
  { id: 'conn-3', from: 'ai-agent-1', to: 'memory-1', fromPort: 'tool', toPort: 'input', label: 'Memory' },
];

export const WorkflowEditorPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isNodePaletteOpen, setIsNodePaletteOpen] = useState(false);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const draggedNodeRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Handle node selection
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
    setIsConfigPanelOpen(true);
  }, []);

  // Handle node drag start
  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    draggedNodeRef.current = nodeId;
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      dragOffsetRef.current = {
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y,
      };
    }
  }, [nodes]);

  // Add new node
  const handleAddNode = useCallback((nodeType: NodeType) => {
    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position: { x: 300, y: 200 },
      title: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
      subtitle: 'New node',
      isConfigured: false,
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (selectedNodeId) {
      setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
      setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
      setSelectedNodeId(null);
      setIsConfigPanelOpen(false);
    }
  }, [selectedNodeId]);

  // Run workflow
  const handleRunWorkflow = useCallback(() => {
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 3000);
  }, []);

  // Get connection positions
  const getConnectionPositions = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) {
      return { fromPos: { x: 0, y: 0 }, toPos: { x: 0, y: 0 } };
    }

    // Node dimensions
    const nodeWidth = 200;
    const nodeHeight = 100;

    return {
      fromPos: {
        x: fromNode.position.x + nodeWidth / 2,
        y: fromNode.position.y + nodeHeight,
      },
      toPos: {
        x: toNode.position.x + nodeWidth / 2,
        y: toNode.position.y,
      },
    };
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="h-screen flex flex-col bg-dark">
      {/* Header */}
      <Header 
        workflowName="AI Agent Workflow"
        isActive={true}
        onSave={() => console.log('Save')}
      />

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas */}
        <Canvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
          onNodeMove={(id, pos) => {
            setNodes(prev => prev.map(n => n.id === id ? { ...n, position: pos } : n));
          }}
          onConnectionStart={() => {}}
          onConnectionEnd={() => {}}
        >
          {/* Render connections */}
          {connections.map(connection => {
            const { fromPos, toPos } = getConnectionPositions(connection);
            return (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                fromPos={fromPos}
                toPos={toPos}
                isSelected={selectedConnectionId === connection.id}
                isAnimating={isExecuting}
                label={connection.label}
                onClick={() => {
                  setSelectedConnectionId(connection.id);
                  setSelectedNodeId(null);
                }}
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map(node => (
            <CanvasNode
              key={node.id}
              data={node}
              isSelected={selectedNodeId === node.id}
              isRunning={isExecuting}
              onClick={() => handleNodeClick(node.id)}
              onDragStart={handleNodeDragStart}
            />
          ))}
        </Canvas>

        {/* Config Panel */}
        {isConfigPanelOpen && selectedNode && (
          <ConfigPanel
            isOpen={isConfigPanelOpen}
            onClose={() => {
              setIsConfigPanelOpen(false);
              setSelectedNodeId(null);
            }}
            nodeData={{
              title: selectedNode.title,
              subtitle: selectedNode.subtitle || '',
            }}
          />
        )}

        {/* Bottom Toolbar */}
        <BottomToolbar
          onTest={handleRunWorkflow}
          onHideChat={() => setIsChatOpen(!isChatOpen)}
          onAddNode={() => setIsNodePaletteOpen(true)}
          onDelete={handleDeleteNode}
        />

        {/* Node Search Palette */}
        <NodeSearchPalette
          isOpen={isNodePaletteOpen}
          onClose={() => setIsNodePaletteOpen(false)}
          onSelectNode={handleAddNode}
        />
      </div>
    </div>
  );
};
