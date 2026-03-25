export type ClientStatus = "pendente" | "em_contato" | "agendado" | "nao_atendeu" | "recusou";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: ClientStatus;
  contactAttempts: number;
  maxAttempts: number;
  lastContactAt: string | null;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  meetLink: string;
  status: "confirmado" | "cancelado" | "realizado" | "pendente";
  createdAt: string;
}

export interface CallLog {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  startedAt: string;
  duration: number; // seconds
  result: "agendado" | "nao_atendeu" | "recusou" | "remarcou" | "erro";
  transcript: string;
  attemptNumber: number;
}

export interface DashboardStats {
  totalClients: number;
  pendingClients: number;
  scheduledMeetings: number;
  completedCalls: number;
  successRate: number;
  meetingsToday: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DayAvailability {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}
