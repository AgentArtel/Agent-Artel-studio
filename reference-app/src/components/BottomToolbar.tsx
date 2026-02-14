import React from 'react';
import { MessageSquare, Plus, Trash2, LayoutGrid, Play } from 'lucide-react';

interface BottomToolbarProps {
  onTest?: () => void;
  onHideChat?: () => void;
  onAddNode?: () => void;
  onDelete?: () => void;
  onToggleGrid?: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onTest,
  onHideChat,
  onAddNode,
  onDelete,
  onToggleGrid,
}) => {
  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      style={{
        bottom: '240px', // Above logs panel
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-dark-100/95 border border-white/5 shadow-dark-lg backdrop-blur-sm">
        {/* Test Button */}
        <button 
          onClick={onTest}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Test
        </button>
        
        {/* Hide Chat Button */}
        <button 
          onClick={onHideChat}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Hide chat
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Timestamp */}
        <div className="px-3 py-1.5 rounded-xl bg-green/15 border border-green/30">
          <span className="text-sm text-green font-mono font-medium">11:44</span>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Grid Toggle */}
        <button 
          onClick={onToggleGrid}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Add Node */}
        <button 
          onClick={onAddNode}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Delete */}
        <button 
          onClick={onDelete}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-danger hover:bg-danger/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
