// Re-export the auto-managed Supabase client
export { supabase } from "@/integrations/supabase/client";

// DB-shaped types (snake_case matching database columns)
export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: "pendente" | "em_contato" | "agendado" | "nao_atendeu" | "recusou";
  contact_attempts: number;
  max_attempts: number;
  last_contact_at: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  client_id: string;
  client_name: string;
  date: string;
  time: string;
  meet_link: string;
  google_event_id: string;
  status: "confirmado" | "pendente" | "cancelado" | "realizado";
  created_at: string;
};

export type CallLog = {
  id: string;
  client_id: string;
  client_name: string;
  phone: string;
  started_at: string;
  duration: number;
  result: "agendado" | "nao_atendeu" | "recusou" | "remarcou" | "erro";
  transcript: string;
  attempt_number: number;
};
