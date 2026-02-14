import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, Bot, MessageSquare, Database, Globe, Code2, 
  Webhook, Clock, GitBranch, Filter, Check, AlertCircle 
} from 'lucide-react';
import { NodeCard } from '@/components/nodes';
import { StatusBadge } from '@/components/ui-custom/StatusBadge';
import { ProgressBar } from '@/components/ui-custom/ProgressBar';
import { Chip } from '@/components/ui-custom/Chip';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormToggle } from '@/components/forms/FormToggle';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { CodeEditor } from '@/components/CodeEditor';
import { TestTriggerButton } from '@/components/TestTriggerButton';

const nodeTypes = [
  { type: 'ai-agent', label: 'AI Agent', icon: Bot, color: 'green' },
  { type: 'trigger', label: 'Chat Trigger', icon: MessageSquare, color: 'blue' },
  { type: 'memory', label: 'Postgres Memory', icon: Database, color: 'purple' },
  { type: 'http-tool', label: 'HTTP Request', icon: Globe, color: 'cyan' },
  { type: 'code-tool', label: 'Code', icon: Code2, color: 'yellow' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'orange' },
  { type: 'schedule', label: 'Schedule', icon: Clock, color: 'pink' },
  { type: 'if', label: 'If Condition', icon: GitBranch, color: 'red' },
  { type: 'merge', label: 'Merge', icon: Filter, color: 'indigo' },
] as const;

const sampleCode = `// Example workflow configuration
const workflow = {
  name: "AI Customer Support",
  trigger: "chat_message",
  nodes: [
    {
      type: "ai-agent",
      model: "gpt-4o-mini",
      prompt: "You are a helpful customer support agent..."
    }
  ]
};

module.exports = workflow;`;

export const ShowcasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'forms' | 'feedback' | 'code'>('nodes');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');
  const [toggleValue, setToggleValue] = useState(true);
  const [textareaValue, setTextareaValue] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => setIsTesting(false), 3000);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Component Showcase</h1>
                <p className="text-sm text-white/50">Open Agent Artel Design System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['nodes', 'forms', 'feedback', 'code'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                    activeTab === tab
                      ? 'bg-green/20 text-green'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Nodes Tab */}
        {activeTab === 'nodes' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Node Types</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nodeTypes.map((node) => (
                  <NodeCard
                    key={node.type}
                    type={node.type}
                    title={node.label}
                    subtitle={`${node.type} node`}
                    icon={node.icon}
                    isConfigured={node.type === 'ai-agent'}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Status Badges</h2>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="running">Running</StatusBadge>
                <StatusBadge status="success">Success</StatusBadge>
                <StatusBadge status="error">Error</StatusBadge>
                <StatusBadge status="inactive">Idle</StatusBadge>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Progress Bars</h2>
              <div className="space-y-4 max-w-md">
                <ProgressBar value={25} size="sm" showLabel />
                <ProgressBar value={50} size="md" showLabel />
                <ProgressBar value={75} size="lg" variant="success" showLabel />
                <ProgressBar value={100} variant="success" showLabel />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Chips</h2>
              <div className="flex flex-wrap gap-2">
                <Chip>Default</Chip>
                <Chip variant="green">Success</Chip>
                <Chip variant="yellow">Warning</Chip>
                <Chip variant="red">Error</Chip>
                <Chip variant="blue">Info</Chip>
                <Chip removable onRemove={() => {}}>Removable</Chip>
              </div>
            </section>
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className="max-w-xl space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Form Inputs</h2>
              <div className="space-y-4">
                <FormInput
                  label="Text Input"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="Enter text..."
                />
                <FormInput
                  label="Password"
                  value=""
                  onChange={() => {}}
                  type="password"
                  placeholder="Enter password..."
                />
                <FormInput
                  label="With Error"
                  value="invalid"
                  onChange={() => {}}
                  error="This field is required"
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Select</h2>
              <FormSelect
                label="Select Option"
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: 'option1', label: 'Option 1', description: 'First option' },
                  { value: 'option2', label: 'Option 2', description: 'Second option' },
                  { value: 'option3', label: 'Option 3', description: 'Third option' },
                ]}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Toggle</h2>
              <FormToggle
                label="Enable Feature"
                checked={toggleValue}
                onChange={setToggleValue}
                helperText="This will enable the feature for all workflows"
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Textarea</h2>
              <FormTextarea
                label="Description"
                value={textareaValue}
                onChange={setTextareaValue}
                placeholder="Enter description..."
                rows={4}
              />
            </section>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Test Trigger Button</h2>
              <div className="flex flex-wrap gap-4">
                <TestTriggerButton onClick={handleTest} isRunning={isTesting} variant="default" />
                <TestTriggerButton onClick={handleTest} isRunning={isTesting} variant="compact" />
                <TestTriggerButton onClick={handleTest} isRunning={isTesting} variant="icon" />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Alerts</h2>
              <div className="space-y-3 max-w-lg">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green/10 border border-green/20">
                  <Check className="w-5 h-5 text-green" />
                  <span className="text-sm text-green">Operation completed successfully</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20">
                  <AlertCircle className="w-5 h-5 text-danger" />
                  <span className="text-sm text-danger">Something went wrong</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Code Editor</h2>
              <CodeEditor
                value={sampleCode}
                onChange={() => {}}
                language="javascript"
                label="Workflow Configuration"
                height="300px"
                onRun={() => console.log('Run code')}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4">JSON Editor</h2>
              <CodeEditor
                value={JSON.stringify({ name: "test", value: 123 }, null, 2)}
                onChange={() => {}}
                language="json"
                label="JSON Data"
                height="200px"
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
