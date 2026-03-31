import { useEffect, useState } from "react";
import { Users, Calendar, Phone, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { mockCallLogs, mockStats } from "@/data/mock";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { supabase } from "@/lib/supabase";

const weeklyData = [
  { day: "Seg", ligacoes: 0, agendadas: 0 },
  { day: "Ter", ligacoes: 5, agendadas: 3 },
  { day: "Qua", ligacoes: 4, agendadas: 2 },
  { day: "Qui", ligacoes: 6, agendadas: 4 },
  { day: "Sex", ligacoes: 0, agendadas: 0 },
];

type Stats = {
  totalClients: number;
  pendingClients: number;
  scheduledMeetings: number;
  completedCalls: number;
  successRate: number;
  meetingsToday: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(mockStats);
  const [todayApts, setTodayApts] = useState<any[]>([]);
  const [calls, setCalls] = useState(mockCallLogs);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const [clientsRes, aptsRes, callsRes] = await Promise.all([
          supabase.from("clients").select("status"),
          supabase.from("appointments").select("*").gte("date", today),
          supabase.from("call_logs").select("*").order("started_at", { ascending: false }).limit(10),
        ]);

        const clientsData = clientsRes.data || [];
        const aptsData = aptsRes.data || [];
        const callsData = callsRes.data || [];

        const todayAptsFiltered = aptsData.filter((a: any) => a.date === today);
        const scheduled = clientsData.filter((c: any) => c.status === "agendado").length;
        const pending = clientsData.filter((c: any) => c.status === "pendente").length;
        const completed = callsData.filter((c: any) => c.result === "agendado").length;
        const total = callsData.length;

        setStats({
          totalClients: clientsData.length || mockStats.totalClients,
          pendingClients: pending || mockStats.pendingClients,
          scheduledMeetings: aptsData.length || mockStats.scheduledMeetings,
          completedCalls: total || mockStats.completedCalls,
          successRate: total > 0 ? Math.round((completed / total) * 100) : mockStats.successRate,
          meetingsToday: todayAptsFiltered.length,
        });

        setTodayApts(todayAptsFiltered.map((a: any) => ({
          id: a.id,
          clientName: a.client_name,
          time: a.time,
          meetLink: a.meet_link || "",
        })));

        if (callsData.length > 0) {
          setCalls(callsData.map((c: any) => ({
            id: c.id,
            clientId: c.client_id || "",
            clientName: c.client_name,
            phone: c.phone,
            startedAt: c.started_at,
            duration: c.duration,
            result: c.result,
            transcript: c.transcript || "",
            attemptNumber: c.attempt_number,
          })));
        }
      } catch {
        // fallback to mock
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema de agendamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Clientes" value={stats.totalClients} icon={Users} variant="default" />
        <StatCard title="Pendentes" value={stats.pendingClients} icon={Clock} variant="warning" />
        <StatCard title="Agendamentos" value={stats.scheduledMeetings} icon={Calendar} variant="primary" />
        <StatCard title="Ligações Feitas" value={stats.completedCalls} icon={Phone} variant="default" />
        <StatCard title="Taxa de Sucesso" value={`${stats.successRate}%`} icon={TrendingUp} variant="success" trend={{ value: 12, positive: true }} />
        <StatCard title="Reuniões Hoje" value={stats.meetingsToday} icon={CheckCircle} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">Ligações da Semana</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="ligacoes" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Ligações" />
              <Bar dataKey="agendadas" fill="hsl(var(--accent))" radius={[4,4,0,0]} name="Agendadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <RecentActivity calls={calls} />
      </div>
    </div>
  );
}
