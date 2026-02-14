import type { NodeType } from '@/types';

export type ConfigFieldType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'json'
  | 'code'
  | 'credentials'
  | 'resource'
  | 'color'
  | 'date'
  | 'datetime';

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: unknown) => string | undefined;
}

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface ConfigField {
  id: string;
  type: ConfigFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRules;
  options?: SelectOption[];
  dependsOn?: {
    field: string;
    value: unknown;
  };
}

export interface ConfigSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fields: ConfigField[];
}

export interface NodeConfigSchema {
  nodeType: NodeType;
  title: string;
  description?: string;
  icon?: string;
  sections: ConfigSection[];
}

// AI Agent Config Schema
const aiAgentConfigSchema: NodeConfigSchema = {
  nodeType: 'ai-agent',
  title: 'AI Agent',
  description: 'Configure the AI Agent node',
  sections: [
    {
      id: 'general',
      title: 'General Settings',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter agent name',
          defaultValue: 'AI Agent',
          required: true,
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Describe what this agent does',
        },
        {
          id: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          defaultValue: 'gpt-4o',
          options: [
            { label: 'GPT-4o', value: 'gpt-4o', description: 'Most capable model' },
            { label: 'GPT-4o Mini', value: 'gpt-4o-mini', description: 'Fast and affordable' },
            { label: 'GPT-4', value: 'gpt-4', description: 'Previous generation' },
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', description: 'Legacy model' },
            { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet', description: 'Anthropic latest' },
            { label: 'Claude 3 Opus', value: 'claude-3-opus', description: 'Anthropic powerful' },
          ],
        },
        {
          id: 'credentials',
          type: 'credentials',
          label: 'API Credentials',
          required: true,
        },
      ],
    },
    {
      id: 'behavior',
      title: 'Behavior Settings',
      collapsible: true,
      fields: [
        {
          id: 'systemPrompt',
          type: 'textarea',
          label: 'System Prompt',
          placeholder: 'Enter system instructions...',
          description: 'Instructions that define the agent behavior',
        },
        {
          id: 'temperature',
          type: 'number',
          label: 'Temperature',
          defaultValue: 0.7,
          validation: { min: 0, max: 2 },
          description: 'Controls randomness. Lower is more focused.',
        },
        {
          id: 'maxTokens',
          type: 'number',
          label: 'Max Tokens',
          defaultValue: 4096,
          validation: { min: 1, max: 8192 },
          description: 'Maximum response length',
        },
        {
          id: 'topP',
          type: 'number',
          label: 'Top P',
          defaultValue: 1,
          validation: { min: 0, max: 1 },
          description: 'Nucleus sampling parameter',
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced',
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        {
          id: 'timeout',
          type: 'number',
          label: 'Timeout (seconds)',
          defaultValue: 30,
          validation: { min: 1, max: 300 },
        },
        {
          id: 'retryCount',
          type: 'number',
          label: 'Retry Count',
          defaultValue: 0,
          validation: { min: 0, max: 5 },
        },
        {
          id: 'streamResponse',
          type: 'boolean',
          label: 'Stream Response',
          defaultValue: true,
          description: 'Stream the response as it is generated',
        },
      ],
    },
  ],
};

// Trigger Config Schema
const triggerConfigSchema: NodeConfigSchema = {
  nodeType: 'trigger',
  title: 'Chat Trigger',
  description: 'Configure the trigger node',
  sections: [
    {
      id: 'general',
      title: 'Trigger Settings',
      fields: [
        {
          id: 'triggerType',
          type: 'select',
          label: 'Trigger Type',
          defaultValue: 'chat',
          options: [
            { label: 'Chat Message', value: 'chat' },
            { label: 'Webhook', value: 'webhook' },
            { label: 'Schedule', value: 'schedule' },
            { label: 'Manual', value: 'manual' },
          ],
        },
        {
          id: 'webhookPath',
          type: 'text',
          label: 'Webhook Path',
          placeholder: '/api/webhook',
          dependsOn: { field: 'triggerType', value: 'webhook' },
        },
        {
          id: 'schedule',
          type: 'text',
          label: 'Cron Schedule',
          placeholder: '0 * * * *',
          dependsOn: { field: 'triggerType', value: 'schedule' },
        },
      ],
    },
  ],
};

// HTTP Tool Config Schema
const httpToolConfigSchema: NodeConfigSchema = {
  nodeType: 'http-tool',
  title: 'HTTP Request',
  description: 'Configure HTTP request settings',
  sections: [
    {
      id: 'request',
      title: 'Request Settings',
      fields: [
        {
          id: 'method',
          type: 'select',
          label: 'Method',
          defaultValue: 'GET',
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' },
          ],
        },
        {
          id: 'url',
          type: 'text',
          label: 'URL',
          placeholder: 'https://api.example.com/endpoint',
          required: true,
        },
        {
          id: 'headers',
          type: 'json',
          label: 'Headers',
          defaultValue: {},
          placeholder: '{"Content-Type": "application/json"}',
        },
        {
          id: 'body',
          type: 'json',
          label: 'Request Body',
          placeholder: '{}',
        },
        {
          id: 'timeout',
          type: 'number',
          label: 'Timeout (seconds)',
          defaultValue: 30,
          validation: { min: 1, max: 300 },
        },
      ],
    },
    {
      id: 'auth',
      title: 'Authentication',
      collapsible: true,
      fields: [
        {
          id: 'authType',
          type: 'select',
          label: 'Auth Type',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'API Key', value: 'apikey' },
            { label: 'Bearer Token', value: 'bearer' },
            { label: 'Basic Auth', value: 'basic' },
          ],
        },
        {
          id: 'credentials',
          type: 'credentials',
          label: 'Credentials',
          dependsOn: { field: 'authType', value: 'apikey' },
        },
      ],
    },
  ],
};

// Code Tool Config Schema
const codeToolConfigSchema: NodeConfigSchema = {
  nodeType: 'code-tool',
  title: 'Code',
  description: 'Configure code execution',
  sections: [
    {
      id: 'code',
      title: 'Code Settings',
      fields: [
        {
          id: 'language',
          type: 'select',
          label: 'Language',
          defaultValue: 'javascript',
          options: [
            { label: 'JavaScript', value: 'javascript' },
            { label: 'Python', value: 'python' },
            { label: 'TypeScript', value: 'typescript' },
          ],
        },
        {
          id: 'code',
          type: 'code',
          label: 'Code',
          placeholder: '// Write your code here',
          defaultValue: '// Enter code here\nreturn {};',
        },
        {
          id: 'timeout',
          type: 'number',
          label: 'Timeout (seconds)',
          defaultValue: 10,
          validation: { min: 1, max: 60 },
        },
      ],
    },
  ],
};

// Memory Config Schema
const memoryConfigSchema: NodeConfigSchema = {
  nodeType: 'memory',
  title: 'Memory',
  description: 'Configure memory storage',
  sections: [
    {
      id: 'storage',
      title: 'Storage Settings',
      fields: [
        {
          id: 'storageType',
          type: 'select',
          label: 'Storage Type',
          defaultValue: 'postgres',
          options: [
            { label: 'PostgreSQL', value: 'postgres' },
            { label: 'Redis', value: 'redis' },
            { label: 'MongoDB', value: 'mongodb' },
            { label: 'SQLite', value: 'sqlite' },
            { label: 'In-Memory', value: 'memory' },
          ],
        },
        {
          id: 'credentials',
          type: 'credentials',
          label: 'Database Credentials',
          dependsOn: { field: 'storageType', value: 'postgres' },
        },
        {
          id: 'sessionId',
          type: 'text',
          label: 'Session ID',
          placeholder: 'Auto-generated if empty',
        },
        {
          id: 'windowSize',
          type: 'number',
          label: 'Memory Window Size',
          defaultValue: 10,
          validation: { min: 1, max: 100 },
          description: 'Number of messages to keep in context',
        },
      ],
    },
  ],
};

// OpenAI Chat Config Schema
const openaiChatConfigSchema: NodeConfigSchema = {
  nodeType: 'openai-chat',
  title: 'OpenAI Chat Model',
  description: 'Configure OpenAI model settings',
  sections: [
    {
      id: 'model',
      title: 'Model Settings',
      fields: [
        {
          id: 'credentials',
          type: 'credentials',
          label: 'API Credentials',
          required: true,
        },
        {
          id: 'model',
          type: 'select',
          label: 'Model',
          defaultValue: 'gpt-4o-mini',
          options: [
            { label: 'GPT-4o', value: 'gpt-4o' },
            { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
            { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          ],
        },
      ],
    },
  ],
};

// Anthropic Chat Config Schema
const anthropicChatConfigSchema: NodeConfigSchema = {
  nodeType: 'anthropic-chat',
  title: 'Anthropic Chat Model',
  description: 'Configure Anthropic model settings',
  sections: [
    {
      id: 'model',
      title: 'Model Settings',
      fields: [
        {
          id: 'credentials',
          type: 'credentials',
          label: 'API Credentials',
          required: true,
        },
        {
          id: 'model',
          type: 'select',
          label: 'Model',
          defaultValue: 'claude-sonnet-4-5-20250929',
          options: [
            { label: 'Claude Sonnet 4.5', value: 'claude-sonnet-4-5-20250929' },
            { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
            { label: 'Claude 3 Opus', value: 'claude-3-opus' },
            { label: 'Claude 3 Haiku', value: 'claude-3-haiku' },
          ],
        },
      ],
    },
  ],
};

// Webhook Config Schema
const webhookConfigSchema: NodeConfigSchema = {
  nodeType: 'webhook',
  title: 'Webhook',
  description: 'Configure webhook settings',
  sections: [
    {
      id: 'webhook',
      title: 'Webhook Settings',
      fields: [
        {
          id: 'webhookUrl',
          type: 'text',
          label: 'Webhook URL',
          placeholder: 'Auto-generated',
          disabled: true,
        },
        {
          id: 'method',
          type: 'select',
          label: 'HTTP Method',
          defaultValue: 'POST',
          options: [
            { label: 'POST', value: 'POST' },
            { label: 'GET', value: 'GET' },
            { label: 'PUT', value: 'PUT' },
          ],
        },
      ],
    },
  ],
};

// Schema registry
const schemas: Record<string, NodeConfigSchema> = {
  'ai-agent': aiAgentConfigSchema,
  'trigger': triggerConfigSchema,
  'http-tool': httpToolConfigSchema,
  'code-tool': codeToolConfigSchema,
  'memory': memoryConfigSchema,
  'openai-chat': openaiChatConfigSchema,
  'anthropic-chat': anthropicChatConfigSchema,
  'webhook': webhookConfigSchema,
};

export function getNodeConfigSchema(nodeType: NodeType): NodeConfigSchema | undefined {
  return schemas[nodeType];
}

export function getDefaultValues(schema: NodeConfigSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      }
    });
  });
  return defaults;
}

export function validateField(value: unknown, field: ConfigField): string | undefined {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }

  if (field.validation) {
    const { min, max, pattern, custom } = field.validation;

    if (typeof value === 'number') {
      if (min !== undefined && value < min) return `${field.label} must be at least ${min}`;
      if (max !== undefined && value > max) return `${field.label} must be at most ${max}`;
    }

    if (typeof value === 'string') {
      if (min !== undefined && value.length < min) return `${field.label} must be at least ${min} characters`;
      if (max !== undefined && value.length > max) return `${field.label} must be at most ${max} characters`;
      if (pattern && !new RegExp(pattern).test(value)) return `${field.label} format is invalid`;
    }

    if (custom) {
      const customError = custom(value);
      if (customError) return customError;
    }
  }

  return undefined;
}
