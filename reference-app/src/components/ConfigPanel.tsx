import React, { useState } from 'react';
import { Bot, ChevronDown, X, Settings2 } from 'lucide-react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: {
    title: string;
    subtitle: string;
  };
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  isOpen, 
  onClose,
  nodeData 
}) => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');
  const [promptText, setPromptText] = useState(`{
  "topic": "AI automation and workflow design",
  "tone": "friendly, smart, minimal",
  "language": "English",
  "hashtags": ["#AI", "#automation", "#workflow"],
  "post_length": "short",
  "task": "Generate an engaging Threads post based on the topic using the tone and hashtags."
}`);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed right-0 top-16 bottom-0 w-[400px] bg-dark-100/98 border-l border-white/5 z-40 overflow-y-auto scrollbar-thin animate-slide-left"
      style={{
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{nodeData?.title || 'AI Agent'}</h2>
              <p className="text-sm text-white/50">{nodeData?.subtitle || 'Tools Agent'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'parameters' 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }
            `}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'settings' 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Settings2 className="w-4 h-4 inline mr-1" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {activeTab === 'parameters' ? (
          <>
            {/* Source for Prompt */}
            <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                Source for Prompt (User Message)
              </label>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-dark-200 border border-white/5 hover:border-green/30 transition-colors cursor-pointer">
                <span className="text-sm text-white/80">Connected Chat Trigger Node</span>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Prompt Textarea with syntax highlighting */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                Prompt (User Message)
              </label>
              <div className="relative rounded-xl bg-dark-200 border border-white/5 overflow-hidden">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full h-64 px-4 py-3 text-sm font-mono text-white/80 resize-none focus:outline-none focus:border-green/50 transition-colors bg-transparent"
                  spellCheck={false}
                  style={{ lineHeight: '1.6' }}
                />
              </div>
              {/* Syntax highlighting overlay */}
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-green">// JSON format</span>
              </div>
            </div>

            {/* Max Iterations */}
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                Max Iterations
              </label>
              <div className="flex items-center px-4 py-3 rounded-xl bg-dark-200 border border-white/5">
                <span className="text-sm text-white/80">10</span>
              </div>
            </div>

            {/* AI Creativity */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                AI Creativity
              </label>
              <div className="px-4 py-3 rounded-xl bg-dark-200 border border-white/5">
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full slider-green"
                />
                <div className="flex justify-between mt-2 text-xs text-white/40">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-dark-200 flex items-center justify-center mx-auto mb-4">
              <Settings2 className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/40 text-sm">Settings configuration coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};
