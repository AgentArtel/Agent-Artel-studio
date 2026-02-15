import type { Database } from './types';

export type GameDatabase = Database & {
  game: {
    Tables: {
      agent_configs: Database['public']['Tables']['agent_configs'];
      api_integrations: Database['public']['Tables']['api_integrations'];
      agent_memory: Database['public']['Tables']['agent_memory'];
      player_state: Database['public']['Tables']['player_state'];
      map_entities: {
        Row: {
          id: string;
          map_id: string;
          entity_type: string;
          display_name: string;
          position_x: number;
          position_y: number;
          tiled_class: string | null;
          role: string | null;
          sprite: string | null;
          ai_enabled: boolean;
          tools: string[];
          area_id: string | null;
          metadata: Record<string, unknown>;
          agent_config_id: string | null;
          synced_at: string;
        };
        Insert: {
          id: string;
          map_id: string;
          entity_type: string;
          display_name: string;
          position_x: number;
          position_y: number;
          tiled_class?: string | null;
          role?: string | null;
          sprite?: string | null;
          ai_enabled?: boolean;
          tools?: string[];
          area_id?: string | null;
          metadata?: Record<string, unknown>;
          agent_config_id?: string | null;
          synced_at?: string;
        };
        Update: {
          id?: string;
          map_id?: string;
          entity_type?: string;
          display_name?: string;
          position_x?: number;
          position_y?: number;
          tiled_class?: string | null;
          role?: string | null;
          sprite?: string | null;
          ai_enabled?: boolean;
          tools?: string[];
          area_id?: string | null;
          metadata?: Record<string, unknown>;
          agent_config_id?: string | null;
          synced_at?: string;
        };
        Relationships: [];
      };
      map_metadata: {
        Row: {
          map_id: string;
          description: string | null;
          theme: string | null;
          ambient: string | null;
          synced_at: string;
        };
        Insert: {
          map_id: string;
          description?: string | null;
          theme?: string | null;
          ambient?: string | null;
          synced_at?: string;
        };
        Update: {
          map_id?: string;
          description?: string | null;
          theme?: string | null;
          ambient?: string | null;
          synced_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
