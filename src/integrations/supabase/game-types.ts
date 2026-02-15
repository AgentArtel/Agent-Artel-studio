import type { Database } from './types';

export type GameDatabase = Database & {
  game: {
    Tables: {
      agent_configs: Database['public']['Tables']['agent_configs'];
      api_integrations: Database['public']['Tables']['api_integrations'];
      agent_memory: Database['public']['Tables']['agent_memory'];
      player_state: Database['public']['Tables']['player_state'];
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
