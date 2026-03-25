import { Client, Appointment, CallLog, DashboardStats, DayAvailability } from "@/types";

export const mockClients: Client[] = [
  { id: "1", name: "João Silva", phone: "(11) 99999-0001", email: "joao@empresa.com", company: "Tech Solutions", status: "pendente", contactAttempts: 0, maxAttempts: 3, lastContactAt: null, createdAt: "2026-03-20" },
  { id: "2", name: "Maria Santos", phone: "(11) 99999-0002", email: "maria@startup.io", company: "StartUp Labs", status: "em_contato", contactAttempts: 1, maxAttempts: 3, lastContactAt: "2026-03-24T14:30:00", createdAt: "2026-03-18" },
  { id: "3", name: "Pedro Costa", phone: "(11) 99999-0003", email: "pedro@digital.com", company: "Digital First", status: "agendado", contactAttempts: 2, maxAttempts: 3, lastContactAt: "2026-03-23T15:00:00", createdAt: "2026-03-15" },
  { id: "4", name: "Ana Oliveira", phone: "(11) 99999-0004", email: "ana@growth.co", company: "Growth Marketing", status: "nao_atendeu", contactAttempts: 2, maxAttempts: 3, lastContactAt: "2026-03-24T16:00:00", createdAt: "2026-03-19" },
  { id: "5", name: "Carlos Lima", phone: "(11) 99999-0005", email: "carlos@ecom.br", company: "E-Commerce Plus", status: "recusou", contactAttempts: 1, maxAttempts: 3, lastContactAt: "2026-03-22T14:00:00", createdAt: "2026-03-17" },
  { id: "6", name: "Fernanda Rocha", phone: "(11) 99999-0006", email: "fer@branding.com", company: "Brand Studio", status: "pendente", contactAttempts: 0, maxAttempts: 3, lastContactAt: null, createdAt: "2026-03-21" },
  { id: "7", name: "Lucas Mendes", phone: "(11) 99999-0007", email: "lucas@saas.io", company: "SaaS Corp", status: "agendado", contactAttempts: 1, maxAttempts: 3, lastContactAt: "2026-03-25T15:00:00", createdAt: "2026-03-16" },
  { id: "8", name: "Beatriz Alves", phone: "(11) 99999-0008", email: "bia@design.co", company: "Design Hub", status: "pendente", contactAttempts: 0, maxAttempts: 3, lastContactAt: null, createdAt: "2026-03-22" },
];

export const mockAppointments: Appointment[] = [
  { id: "1", clientId: "3", clientName: "Pedro Costa", date: "2026-03-25", time: "14:00", meetLink: "https://meet.google.com/abc-defg-hij", status: "confirmado", createdAt: "2026-03-23" },
  { id: "2", clientId: "7", clientName: "Lucas Mendes", date: "2026-03-25", time: "15:00", meetLink: "https://meet.google.com/klm-nopq-rst", status: "confirmado", createdAt: "2026-03-25" },
  { id: "3", clientId: "2", clientName: "Maria Santos", date: "2026-03-26", time: "14:00", meetLink: "https://meet.google.com/uvw-xyza-bcd", status: "pendente", createdAt: "2026-03-24" },
  { id: "4", clientId: "1", clientName: "João Silva", date: "2026-03-27", time: "16:00", meetLink: "", status: "pendente", createdAt: "2026-03-25" },
];

export const mockCallLogs: CallLog[] = [
  { id: "1", clientId: "2", clientName: "Maria Santos", phone: "(11) 99999-0002", startedAt: "2026-03-24T14:30:00", duration: 180, result: "remarcou", transcript: "IA: Olá Maria, aqui é a assistente da [Empresa]. Gostaria de agendar sua reunião mensal. Maria: Oi, pode ser na quarta-feira? IA: Claro! Temos horário às 14h na quarta. Confirmo? Maria: Sim, perfeito! IA: Agendado! Você receberá um link do Google Meet por email.", attemptNumber: 1 },
  { id: "2", clientId: "3", clientName: "Pedro Costa", phone: "(11) 99999-0003", startedAt: "2026-03-23T15:00:00", duration: 145, result: "agendado", transcript: "IA: Olá Pedro, aqui é a assistente da [Empresa]. Temos disponibilidade terça às 14h, 15h ou 16h. Pedro: 14h de terça está ótimo. IA: Perfeito, agendado para terça às 14h!", attemptNumber: 2 },
  { id: "3", clientId: "4", clientName: "Ana Oliveira", phone: "(11) 99999-0004", startedAt: "2026-03-24T16:00:00", duration: 0, result: "nao_atendeu", transcript: "", attemptNumber: 2 },
  { id: "4", clientId: "5", clientName: "Carlos Lima", phone: "(11) 99999-0005", startedAt: "2026-03-22T14:00:00", duration: 95, result: "recusou", transcript: "IA: Olá Carlos, aqui é a assistente da [Empresa]. Carlos: Não tenho interesse no momento, obrigado. IA: Sem problemas, Carlos. Caso mude de ideia, entre em contato.", attemptNumber: 1 },
];

export const mockStats: DashboardStats = {
  totalClients: 8,
  pendingClients: 3,
  scheduledMeetings: 4,
  completedCalls: 4,
  successRate: 50,
  meetingsToday: 2,
};

export const mockAvailability: DayAvailability[] = [
  { date: "2026-03-25", dayName: "Quarta", slots: [
    { time: "14:00", available: false },
    { time: "15:00", available: false },
    { time: "16:00", available: true },
  ]},
  { date: "2026-03-26", dayName: "Quinta", slots: [
    { time: "14:00", available: false },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
  ]},
  { date: "2026-04-01", dayName: "Terça", slots: [
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
  ]},
  { date: "2026-04-02", dayName: "Quarta", slots: [
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
  ]},
];
