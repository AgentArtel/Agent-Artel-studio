import React from 'react';
import { 
  ZoomOut, 
  ZoomIn, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Share2, 
  Settings,
  Sparkles,
  ChevronLeft,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  workflowName?: string;
  isActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onUndo,
  onRedo,
  onShare,
  onSave,
  workflowName = 'AI Agent Workflow',
  isActive = true,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 glass border-b border-white/5">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left - Back & Logo */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/10" />
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green to-green-dark flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-dark" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-white">{workflowName}</h1>
              <p className="text-xs text-white/40">Last edited 2m ago</p>
            </div>
          </div>
        </div>

        {/* Center - Zoom Controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-dark-100 rounded-lg p-1 border border-white/5">
            <button 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
              onClick={onZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
              onClick={onReset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
              onClick={onZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <div className="flex items-center bg-dark-100 rounded-lg p-1 border border-white/5">
            <button 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
              onClick={onUndo}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
              onClick={onRedo}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2
            ${isActive 
              ? 'bg-green/15 text-green border border-green/30' 
              : 'bg-white/5 text-white/50 border border-white/10'
            }
          `}>
            <span className={`
              w-2 h-2 rounded-full 
              ${isActive ? 'bg-green animate-pulse' : 'bg-white/30'}
            `} />
            {isActive ? 'Active' : 'Inactive'}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <Button 
            variant="ghost" 
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/5 hidden sm:flex"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button 
            size="sm"
            className="bg-green text-dark hover:bg-green-light font-medium"
            onClick={onSave}
          >
            <Play className="w-4 h-4 mr-2" />
            Save
          </Button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green/30 to-green-dark/30 border border-green/30 flex items-center justify-center overflow-hidden ml-1">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
