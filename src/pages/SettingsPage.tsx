import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useTeam, Team } from "@/hooks/useTeam";

type Settings = {
  max_meetings_per_day: string;
  max_attempts: string;
  allowed_days: string;
  vapi_api_key: string;
  calendar_id: string;
};

const DEFAULT: Settings = {
  max_meetings_per_day: "3",
  max_attempts: "3",
  allowed_days: "2,3,4",
  vapi_api_key: "",
  calendar_id: "primary",
};

const DAY_LABELS: Record<string, string> = { "1": "Seg", "2": "Ter", "3": "Qua", "4": "Qui", "5": "Sex" };
const ALL_DAYS = ["1", "2", "3", "4", "5"];

export default function SettingsPage() {
  const { teams, reloadTeams } = useTeam();
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTeams, setEditingTeams] = useState<Team[]>([]);
  const [savingTeams, setSavingTeams] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from("settings").select("key, value");
        if (data && data.length > 0) {
          const map: any = {};
          data.forEach((row: any) => { map[row.key] = row.value; });
          setSettings((prev) => ({ ...prev, ...map }));
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setEditingTeams(teams.map((t) => ({ ...t })));
  }, [teams]);

  const toggleDay = (day: string) => {
    const days = settings.allowed_days.split(",").filter(Boolean);
    const updated = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    setSettings((s) => ({ ...s, allowed_days: updated.join(",") }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
      for (const row of rows) {
        await supabase.from("settings").upsert(
          { key: row.key, value: row.value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      }
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar. Verifique a conexão.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeams = async () => {
    setSavingTeams(true);
    try {
      for (const team of editingTeams) {
        await supabase.from("teams").update({
          name: team.name,
          color: team.color,
          description: team.description,
        }).eq("id", team.id);
      }
      await reloadTeams();
      toast.success("Equipes atualizadas!");
    } catch {
      toast.error("Erro ao salvar equipes.");
    } finally {
      setSavingTeams(false);
    }
  };

  const updateTeamField = (id: string, field: keyof Team, value: string) => {
    setEditingTeams((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const enabledDays = settings.allowed_days.split(",").filter(Boolean);

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Regras de agendamento, equipes e integrações</p>
      </div>

      {/* Teams Section */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Equipes</h3>
        <div className="space-y-4">
          {editingTeams.map((team) => (
            <div key={team.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/20">
              <div
                className="w-10 h-10 rounded-full shrink-0 mt-1 flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: team.color, color: "#fff" }}
              >
                {team.name.charAt(0)}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={team.name}
                    onChange={(e) => updateTeamField(team.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      value={team.color}
                      onChange={(e) => updateTeamField(team.id, "color", e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={team.color}
                      onChange={(e) => updateTeamField(team.id, "color", e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    value={team.description}
                    onChange={(e) => updateTeamField(team.id, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleSaveTeams} disabled={savingTeams} variant="outline">
          {savingTeams ? "Salvando..." : "Salvar Equipes"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Regras de Agendamento</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Máximo de reuniões/dia</Label>
            <Input
              type="number"
              value={settings.max_meetings_per_day}
              onChange={(e) => setSettings((s) => ({ ...s, max_meetings_per_day: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Máximo de tentativas</Label>
            <Input
              type="number"
              value={settings.max_attempts}
              onChange={(e) => setSettings((s) => ({ ...s, max_attempts: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Dias permitidos</Label>
          <div className="flex gap-2">
            {ALL_DAYS.map((day) => (
              <Button
                key={day}
                type="button"
                variant={enabledDays.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day)}
                className={cn("min-w-[48px]")}
              >
                {DAY_LABELS[day]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Integrações</h3>
        <div className="space-y-2">
          <Label>VAPI API Key</Label>
          <Input
            type="password"
            value={settings.vapi_api_key}
            onChange={(e) => setSettings((s) => ({ ...s, vapi_api_key: e.target.value }))}
            placeholder="sk-..."
          />
        </div>
        <div className="space-y-2">
          <Label>Google Calendar ID</Label>
          <Input
            value={settings.calendar_id}
            onChange={(e) => setSettings((s) => ({ ...s, calendar_id: e.target.value }))}
            placeholder="primary"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
}
