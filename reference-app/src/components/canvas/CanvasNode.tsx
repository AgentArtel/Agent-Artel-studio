import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, Bot, MessageSquare, Database, Globe, Code2, Webhook, Sparkles } from 'lucide-react';
import type { NodeData } from '@/types';

interface CanvasNodeProps {
  data: NodeData;
  isSelected?: boolean;
  isRunning?: boolean;
  executionStatus?: 'waiting' | 'running' | 'success' | 'error' | 'skipped';
  onClick?: () => void;
  onDragStart?: (e: React.MouseEvent, nodeId: string) => void;
  onPortClick?: (portId: string, type: 'input' | 'output') => void;
  className?: string;
}

const nodeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'ai-agent': Bot,
  'trigger': MessageSquare,
  'memory': Database,
  'http-tool': Globe,
  'code-tool': Code2,
  'webhook': Webhook,
  'openai-chat': Sparkles,
  'anthropic-chat': Sparkles,
};

const nodeColors: Record<string, string> = {
  'ai-agent': 'text-green',
  'trigger': 'text-blue-400',
  'memory': 'text-purple-400',
  'http-tool': 'text-cyan-400',
  'code-tool': 'text-yellow-400',
  'webhook': 'text-orange-400',
  'openai-chat': 'text-green',
  'anthropic-chat': 'text-green',
};

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  data,
  isSelected = false,
  isRunning = false,
  executionStatus = 'waiting',
  onClick,
  onDragStart,
  onPortClick,
  className = '',
}) => {
  const [, setIsDragging] = useState(false);
  
  const Icon = nodeIcons[data.type] || Bot;
  const iconColor = nodeColors[data.type] || 'text-white';
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    onDragStart?.(e, data.id);
  }, [data.id, onDragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Determine border style based on state
  const getBorderStyle = () => {
    if (executionStatus === 'error') return 'border-danger shadow-[0_0_0_1px_rgba(229,77,77,0.4),0_0_12px_rgba(229,77,77,0.15)]';
    if (isSelected) return 'border-green shadow-glow';
    if (isRunning) return 'border-green animate-pulse-glow';
    return 'border-white/10 hover:border-green/30 hover:shadow-glow';
  };

  return (
    <div
      className={cn(
        'absolute w-[200px] rounded-xl bg-dark-100/95 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none',
        'transition-all duration-fast ease-out-quart',
        getBorderStyle(),
        data.isDeactivated && 'opacity-60',
        className
      )}
      style={{
        left: data.position.x,
        top: data.position.y,
        animation: 'node-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
    >
      {/* Execution status overlay */}
      {executionStatus !== 'waiting' && (
        <div className={cn(
          'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10',
          executionStatus === 'running' && 'bg-green/20 animate-pulse',
          executionStatus === 'success' && 'bg-green',
          executionStatus === 'error' && 'bg-danger',
          executionStatus === 'skipped' && 'bg-white/20',
        )}>
          {executionStatus === 'success' && <Check className="w-4 h-4 text-dark" />}
          {executionStatus === 'error' && <span className="text-white text-xs">×</span>}
          {executionStatus === 'running' && <div className="w-3 h-3 rounded-full bg-green" />}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-2">
        <div className={cn('w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center flex-shrink-0', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{data.title}</h3>
          <p className="text-xs text-white/50 truncate">{data.subtitle || data.type}</p>
        </div>
        {data.isConfigured && executionStatus === 'waiting' && (
          <div className="w-5 h-5 rounded-full bg-green/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-green" />
          </div>
        )}
      </div>

      {/* Deactivated label */}
      {data.isDeactivated && (
        <div className="px-4 pb-2">
          <span className="text-[10px] text-white/40">(Deactivated)</span>
        </div>
      )}

      {/* Input port (top) */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 group">
        <div 
          className="w-4 h-4 rounded-full bg-dark-100 border-2 border-white/30 cursor-crosshair hover:border-green hover:scale-125 hover:shadow-glow transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onPortClick?.('input', 'input');
          }}
        />
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Input
        </span>
      </div>

      {/* Output port (bottom) */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 group">
        <div 
          className="w-4 h-4 rounded-full bg-dark-100 border-2 border-green cursor-crosshair hover:scale-125 hover:shadow-glow transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onPortClick?.('output', 'output');
          }}
        />
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Output
        </span>
      </div>

      {/* Side ports for specific node types */}
      {data.type === 'ai-agent' && (
        <>
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 group">
            <div 
              className="w-3 h-3 rounded-full bg-dark-100 border-2 border-white/20 cursor-crosshair hover:border-green hover:scale-125 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onPortClick?.('tool', 'output');
              }}
            />
            <span className="absolute top-1/2 -right-10 -translate-y-1/2 text-[9px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Tool
            </span>
          </div>
          <div className="absolute top-1/3 -left-2 -translate-y-1/2 group">
            <div 
              className="w-3 h-3 rounded-full bg-dark-100 border-2 border-white/20 cursor-crosshair hover:border-green hover:scale-125 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onPortClick?.('memory', 'input');
              }}
            />
            <span className="absolute top-1/2 -left-12 -translate-y-1/2 text-[9px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Memory
            </span>
          </div>
        </>
      )}
    </div>
  );
};
