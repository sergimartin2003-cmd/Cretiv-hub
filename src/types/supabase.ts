export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar: string;
          role: "user" | "creator" | "admin";
          verified: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          thumbnail: string;
          tags: string[];
          type: "free" | "premium";
          badge: "trending" | "new" | "official" | null;
          download_url: string | null;
          file_path: string | null;
          stars: number;
          downloads: number;
          saves: number;
          author_id: string | null;
          author_name: string;
          author_avatar: string;
          author_verified: boolean;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string; description: string; category: string; thumbnail: string;
          tags?: string[]; type?: "free" | "premium"; badge?: "trending" | "new" | "official" | null;
          download_url?: string | null; file_path?: string | null;
          author_id?: string | null; author_name: string; author_avatar?: string;
          author_verified?: boolean; status?: "pending" | "approved" | "rejected";
        };
        Update: {
          title?: string; description?: string; category?: string; thumbnail?: string;
          tags?: string[]; type?: "free" | "premium"; badge?: "trending" | "new" | "official" | null;
          download_url?: string | null; file_path?: string | null; stars?: number;
          downloads?: number; saves?: number; author_name?: string; author_avatar?: string;
          author_verified?: boolean; status?: "pending" | "approved" | "rejected";
        };
      };
      user_saves: {
        Row: {
          user_id: string;
          resource_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_saves"]["Row"], "created_at">;
        Update: never;
      };
      downloads: {
        Row: {
          id: string;
          user_id: string | null;
          resource_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["downloads"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Functions: {
      increment_downloads: { Args: { resource_id: string }; Returns: void };
      toggle_save: { Args: { p_user_id: string; p_resource_id: string }; Returns: boolean };
    };
  };
}

export type Profile  = Database["public"]["Tables"]["profiles"]["Row"];
export type DbResource = Database["public"]["Tables"]["resources"]["Row"];
