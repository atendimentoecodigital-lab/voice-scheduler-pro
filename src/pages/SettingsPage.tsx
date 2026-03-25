import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => toast.success("Configurações salvas! (simulação)");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Regras de agendamento e integrações</p>
      </div>

      {/* Scheduling rules */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Regras de Agendamento</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Máximo de reuniões/dia</Label>
            <Input type="number" defaultValue={3} />
          </div>
          <div className="space-y-2">
            <Label>Máximo de tentativas</Label>
            <Input type="number" defaultValue={3} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Dias permitidos</Label>
          <div className="flex gap-2">
            {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day) => {
              const enabled = ["Ter", "Qua", "Qui"].includes(day);
              return (
                <button
                  key={day}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    enabled
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Horários fixos</Label>
          <div className="flex gap-2">
            {["14:00", "15:00", "16:00"].map((time) => (
              <div key={time} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                {time}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice AI */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">IA de Voz</h3>
        <div className="space-y-2">
          <Label>Provedor</Label>
          <Input defaultValue="Vapi" disabled />
        </div>
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input type="password" placeholder="sk-..." />
        </div>
        <div className="space-y-2">
          <Label>Intervalo entre tentativas (horas)</Label>
          <Input type="number" defaultValue={24} />
        </div>
      </div>

      {/* Google Calendar */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Google Calendar</h3>
        <div className="space-y-2">
          <Label>Service Account Email</Label>
          <Input placeholder="bot@project.iam.gserviceaccount.com" />
        </div>
        <div className="space-y-2">
          <Label>Calendar ID</Label>
          <Input placeholder="primary" />
        </div>
      </div>

      <Button onClick={handleSave}>Salvar Configurações</Button>
    </div>
  );
}
