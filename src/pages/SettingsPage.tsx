import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      toast.error("Erro ao salvar. Verifique a conexão com o Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const enabledDays = settings.allowed_days.split(",").filter(Boolean);

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Regras de agendamento e integrações</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Regras de Agendamento</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Máximo de reuniões/dia</Label>
            <Input
              type="number"
              value={settings.max_meetings_per_day}
              onChange