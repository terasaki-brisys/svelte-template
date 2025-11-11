// Database type definitions for the event scheduler

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          memo: string | null;
          admin_key_hash: string;
          share_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          memo?: string | null;
          admin_key_hash: string;
          share_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          memo?: string | null;
          admin_key_hash?: string;
          share_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      options: {
        Row: {
          id: string;
          event_id: string;
          date: string;
          sort_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          date: string;
          sort_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          date?: string;
          sort_index?: number;
          created_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          event_id: string;
          nickname: string;
          device_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          nickname: string;
          device_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          nickname?: string;
          device_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          event_id: string;
          option_id: string;
          participant_id: string;
          value: number; // 0=×, 1=△, 2=◯
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          option_id: string;
          participant_id: string;
          value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          option_id?: string;
          participant_id?: string;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          event_id: string;
          kind: 'admin' | 'share';
          token: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          kind: 'admin' | 'share';
          token: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          kind?: 'admin' | 'share';
          token?: string;
        };
      };
    };
  };
}

// Utility types for easier usage
export type Event = Database['public']['Tables']['events']['Row'];
export type Option = Database['public']['Tables']['options']['Row'];
export type Participant = Database['public']['Tables']['participants']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type Link = Database['public']['Tables']['links']['Row'];

// Vote values enum
export enum VoteValue {
  NO = 0,
  MAYBE = 1,
  YES = 2
}

// Event with related data
export interface EventWithDetails extends Event {
  options: Option[];
  participants: Participant[];
  votes: Vote[];
}

// Vote statistics for an option
export interface OptionStats {
  option_id: string;
  date: string;
  yes_count: number;
  maybe_count: number;
  no_count: number;
  total_votes: number;
}

// Participant with their votes
export interface ParticipantWithVotes extends Participant {
  votes: Vote[];
}

