import { Users, Calendar, Phone, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { mockStats, mockCallLogs, mockAppointments } from "@/data/mock";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const weeklyData = [
  { day: "Seg", ligacoes: 0, agendadas: 0 },
  { day: "Ter", ligacoes: 5, agendadas: 3 },
  { day: "Qua", ligacoes: 4, agendadas: 2 },
  { day: "Qui", ligacoes: 6, agendadas: 4 },
  { day: "Sex", ligacoes: 0, agendadas: 0 },
];

export default function Dashboard() {
  const todayAppointments = mockAppointments.filter((a) => a.date === "2026-03-25");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema de agendamento</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Clientes" value={mockStats.totalClients} icon={Users} variant="default" />
        <StatCard title="Pendentes" value={mockStats.pendingClients} icon={Clock} variant="warning" />
        <StatCard title="Agendamentos" value={mockStats.scheduledMeetings} icon={Calendar} variant="primary" />
        <StatCard title="Ligações Feitas" value={mockStats.completedCalls} icon={Phone} variant="default" />
        <StatCard title="Taxa de Sucesso" value={`${mockStats.successRate}%`} icon={TrendingUp} variant="success" trend={{ value: 12, positive: true }} />
        <StatCard title="Reuniões Hoje" value={mockStats.meetingsToday} icon={CheckCircle} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">Ligações da Semana</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="ligacoes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ligações" />
              <Bar dataKey="agendadas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Agendadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <RecentActivity calls={mockCallLogs} />
      </div>

      {/* Today's meetings */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Reuniões de Hoje</h3>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma reunião hoje.</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{apt.clientName}</p>
                  <p className="text-xs text-muted-foreground">{apt.time}</p>
                </div>
                {apt.meetLink && (
                  <a href={apt.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline">
                    Abrir Meet
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
