/**
 * Tipos gerados a partir do schema do Supabase (projeto business-os).
 * Regenerar após mudar o banco:
 *   npx supabase gen types typescript --project-id hrrvmvtnnobrzyiatkpk > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      client_projects: {
        Row: { client_id: string; created_at: string; project_id: string; user_id: string }
        Insert: { client_id: string; created_at?: string; project_id: string; user_id?: string }
        Update: { client_id?: string; created_at?: string; project_id?: string; user_id?: string }
        Relationships: [
          {
            foreignKeyName: 'client_projects_client_id_user_id_fkey'
            columns: ['client_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'client_projects_project_id_user_id_fkey'
            columns: ['project_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      clients: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          is_demo: boolean
          name: string
          notes: string
          phone: string
          status: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          is_demo?: boolean
          name: string
          notes?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string
          created_at: string
          description: string
          id: string
          is_demo: boolean
          name: string
          status: string
          updated_at: string
          user_id: string
          type: string
          owners: string[]
          client_id: string | null
          start_date: string | null
          due_date: string | null
          boards_provisioned_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          is_demo?: boolean
          name: string
          status?: string
          updated_at?: string
          user_id?: string
          type?: string
          owners?: string[]
          client_id?: string | null
          start_date?: string | null
          due_date?: string | null
          boards_provisioned_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          is_demo?: boolean
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
          type?: string
          owners?: string[]
          client_id?: string | null
          start_date?: string | null
          due_date?: string | null
          boards_provisioned_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          is_demo: boolean
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          is_demo?: boolean
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          is_demo?: boolean
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_client_id_user_id_fkey'
            columns: ['client_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'tasks_project_id_user_id_fkey'
            columns: ['project_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          category: string
          client_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          is_demo: boolean
          project_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          category?: string
          client_id?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          is_demo?: boolean
          project_id?: string | null
          status: string
          type: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_demo?: boolean
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_client_id_user_id_fkey'
            columns: ['client_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_project_id_user_id_fkey'
            columns: ['project_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      events: {
        Row: { id: string; user_id: string; is_demo: boolean; created_at: string; updated_at: string; project_id: string | null; client_id: string | null; title: string; description: string; type: string; date: string; start_time: string | null; end_time: string | null; status: string }
        Insert: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; title: string; description?: string; type?: string; date: string; start_time?: string | null; end_time?: string | null; status?: string }
        Update: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; title?: string; description?: string; type?: string; date?: string; start_time?: string | null; end_time?: string | null; status?: string }
        Relationships: []
      }
      contracts: {
        Row: { id: string; user_id: string; is_demo: boolean; created_at: string; updated_at: string; project_id: string | null; client_id: string | null; title: string; service: string; amount_cents: number; periodicity: string; start_date: string; end_date: string | null; next_renewal: string | null; status: string; notes: string }
        Insert: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; title: string; service?: string; amount_cents?: number; periodicity?: string; start_date: string; end_date?: string | null; next_renewal?: string | null; status?: string; notes?: string }
        Update: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; title?: string; service?: string; amount_cents?: number; periodicity?: string; start_date?: string; end_date?: string | null; next_renewal?: string | null; status?: string; notes?: string }
        Relationships: []
      }
      files: {
        Row: { id: string; user_id: string; is_demo: boolean; created_at: string; updated_at: string; project_id: string | null; client_id: string | null; name: string; description: string; category: string; mime_type: string; size_bytes: number | null; storage_path: string | null; url: string | null; board_card_id: string | null }
        Insert: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; name: string; description?: string; category?: string; mime_type?: string; size_bytes?: number | null; storage_path?: string | null; url?: string | null; board_card_id?: string | null }
        Update: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; name?: string; description?: string; category?: string; mime_type?: string; size_bytes?: number | null; storage_path?: string | null; url?: string | null; board_card_id?: string | null }
        Relationships: []
      }
      contents: {
        Row: { id: string; user_id: string; is_demo: boolean; created_at: string; updated_at: string; project_id: string | null; client_id: string | null; title: string; description: string; type: string; status: string; planned_date: string | null; publish_date: string | null; caption: string; cta: string; notes: string }
        Insert: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; title: string; description?: string; type?: string; status?: string; planned_date?: string | null; publish_date?: string | null; caption?: string; cta?: string; notes?: string }
        Update: { id?: string; user_id?: string; is_demo?: boolean; created_at?: string; updated_at?: string; project_id?: string | null; client_id?: string | null; title?: string; description?: string; type?: string; status?: string; planned_date?: string | null; publish_date?: string | null; caption?: string; cta?: string; notes?: string }
        Relationships: []
      }
      knowledge_items: {
        Row: { id: string; user_id: string; title: string; content: string; category: string; project_id: string | null; client_id: string | null; tags: string[]; is_demo: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; title: string; content?: string; category?: string; project_id?: string | null; client_id?: string | null; tags?: string[]; is_demo?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; title?: string; content?: string; category?: string; project_id?: string | null; client_id?: string | null; tags?: string[]; is_demo?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      activity_logs: {
        Row: { id: string; user_id: string; type: string; entity: string; entity_id: string | null; description: string; project_id: string | null; client_id: string | null; is_demo: boolean; created_at: string }
        Insert: { id?: string; user_id?: string; type: string; entity: string; entity_id?: string | null; description: string; project_id?: string | null; client_id?: string | null; is_demo?: boolean; created_at?: string }
        Update: { id?: string; user_id?: string; type?: string; entity?: string; entity_id?: string | null; description?: string; project_id?: string | null; client_id?: string | null; is_demo?: boolean; created_at?: string }
        Relationships: []
      }
      automations: {
        Row: { id: string; user_id: string; name: string; enabled: boolean; trigger: string; conditions: Json; action: Json; is_system: boolean; last_run_at: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; name: string; enabled?: boolean; trigger: string; conditions?: Json; action: Json; is_system?: boolean; last_run_at?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; enabled?: boolean; trigger?: string; conditions?: Json; action?: Json; is_system?: boolean; last_run_at?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      automation_runs: {
        Row: { id: string; user_id: string; automation_id: string; entity_key: string; status: string; message: string; created_at: string }
        Insert: { id?: string; user_id?: string; automation_id: string; entity_key: string; status?: string; message?: string; created_at?: string }
        Update: { id?: string; user_id?: string; automation_id?: string; entity_key?: string; status?: string; message?: string; created_at?: string }
        Relationships: []
      }
      notifications: {
        Row: { id: string; user_id: string; severity: string; title: string; body: string; link: string | null; entity: string | null; entity_id: string | null; automation_id: string | null; dedupe_key: string | null; read_at: string | null; created_at: string }
        Insert: { id?: string; user_id?: string; severity?: string; title: string; body?: string; link?: string | null; entity?: string | null; entity_id?: string | null; automation_id?: string | null; dedupe_key?: string | null; read_at?: string | null; created_at?: string }
        Update: { id?: string; user_id?: string; severity?: string; title?: string; body?: string; link?: string | null; entity?: string | null; entity_id?: string | null; automation_id?: string | null; dedupe_key?: string | null; read_at?: string | null; created_at?: string }
        Relationships: []
      }
      ai_usage_logs: {
        Row: { id: string; user_id: string; request_id: string; task: string; layer: string; provider: string; model: string; tier: string; status: string; reason: string | null; duration_ms: number; retries: number; input_tokens: number | null; output_tokens: number | null; estimated_cost_usd: number | null; fallback_from: string | null; created_at: string }
        Insert: { request_id: string; task: string; layer: string; provider: string; model: string; tier: string; status: string; reason?: string | null; duration_ms?: number; retries?: number; input_tokens?: number | null; output_tokens?: number | null; estimated_cost_usd?: number | null; fallback_from?: string | null }
        Update: { reason?: string | null }
        Relationships: []
      }
      study_progress: {
        Row: { id: string; user_id: string; item_id: string; kind: string; done: boolean; done_at: string | null; answer: string; notes: string; checks: number[]; level: number | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; item_id: string; kind: string; done?: boolean; done_at?: string | null; answer?: string; notes?: string; checks?: number[]; level?: number | null; created_at?: string; updated_at?: string }
        Update: { done?: boolean; done_at?: string | null; answer?: string; notes?: string; checks?: number[]; level?: number | null }
        Relationships: []
      }
      study_hours: {
        Row: { id: string; user_id: string; date: string; minutes: number; track_id: string; note: string; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; date: string; minutes: number; track_id: string; note?: string; created_at?: string; updated_at?: string }
        Update: { date?: string; minutes?: number; track_id?: string; note?: string }
        Relationships: []
      }
      study_library: {
        Row: { id: string; user_id: string; type: string; title: string; url: string; content: string; tags: string[]; track_id: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string; type?: string; title: string; url?: string; content?: string; tags?: string[]; track_id?: string | null; created_at?: string; updated_at?: string }
        Update: { type?: string; title?: string; url?: string; content?: string; tags?: string[]; track_id?: string | null }
        Relationships: []
      }
      boards: {
        Row: { id: string; user_id: string; project_id: string; template_key: string | null; name: string; icon: string; position: number; fields: Json; automations: Json; created_at: string; updated_at: string }
        Insert: { project_id: string; name: string; template_key?: string | null; icon?: string; position?: number; fields?: Json; automations?: Json }
        Update: { [key: string]: unknown }
        Relationships: []
      }
      board_lists: {
        Row: { id: string; user_id: string; board_id: string; name: string; icon: string; kind: string; template_key: string | null; position: number; created_at: string; updated_at: string }
        Insert: { board_id: string; name: string; icon?: string; kind?: string; template_key?: string | null; position?: number }
        Update: { [key: string]: unknown }
        Relationships: []
      }
      board_labels: {
        Row: { id: string; user_id: string; board_id: string; name: string; color: string; position: number; created_at: string; updated_at: string }
        Insert: { board_id: string; name: string; color?: string; position?: number }
        Update: { [key: string]: unknown }
        Relationships: []
      }
      board_cards: {
        Row: { id: string; user_id: string; board_id: string; list_id: string; title: string; description: string; position: number; priority: string | null; due_date: string | null; assignee: string; label_ids: string[]; checklist: Json; fields: Json; completed_at: string | null; created_at: string; updated_at: string }
        Insert: { board_id: string; list_id: string; title: string; description?: string; position?: number; priority?: string | null; due_date?: string | null; assignee?: string; label_ids?: string[]; checklist?: Json; fields?: Json; completed_at?: string | null }
        Update: { [key: string]: unknown }
        Relationships: []
      }
      board_card_comments: {
        Row: { id: string; user_id: string; card_id: string; kind: string; body: string; created_at: string; updated_at: string }
        Insert: { card_id: string; body: string; kind?: string }
        Update: { [key: string]: unknown }
        Relationships: []
      }
      board_card_events: {
        Row: { id: string; user_id: string; card_id: string; type: string; description: string; created_at: string; updated_at: string }
        Insert: { card_id: string; type: string; description: string }
        Update: { [key: string]: unknown }
        Relationships: []
      }
      user_settings: {
        Row: { seeded: boolean; seed_version: number; theme: string; updated_at: string; user_id: string; user_name: string; ai_provider: string; ai_model: string; ai_instructions: string; ai_cascade: Json }
        Insert: { seeded?: boolean; seed_version?: number; theme?: string; updated_at?: string; user_id?: string; user_name?: string; ai_provider?: string; ai_model?: string; ai_instructions?: string; ai_cascade?: Json }
        Update: { seeded?: boolean; seed_version?: number; theme?: string; updated_at?: string; user_id?: string; user_name?: string; ai_provider?: string; ai_model?: string; ai_instructions?: string; ai_cascade?: Json }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      create_project: {
        Args: { p_project: Json; p_boards: Json }
        Returns: string
      }
      provision_client_board: {
        Args: { p_project_id: string; p_client_id: string; p_board: Json }
        Returns: string
      }
      provision_project_boards: {
        Args: { p_project_id: string; p_boards: Json }
        Returns: number
      }
      instantiate_board: {
        Args: { p_project_id: string; p_board: Json }
        Returns: string
      }
      set_client_projects: {
        Args: { p_client_id: string; p_project_ids: string[] }
        Returns: undefined
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type TableName = keyof Database['public']['Tables']
