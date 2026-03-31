import { useState } from "react";
import { Calendar, ExternalLink, Clock, Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAppointments } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";

const statusStyles: Record<string, string> = {
  confirmado: "bg-success/15 text-success",
  pendente: "bg-warning/15 text-warning",
  cancelado: "bg-destructive/15 text-destructive",
  realizado: "bg-muted text-muted-foreground",
};

export default function Appointments() {
  const { appointments, availability, loading, connected, usingMock, load, createAppointment, connectGoogle } =
    useAppointments();
  const { clients } = useClients();

  const [newDialog, setNewDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ clientId: "", date: "", time: "" });

  const pendingClients = clients.filter((c) => c.status !== "agendado" && c.status !== "recusou");

  const handleCreate = async () => {
    if (!form.clientId || !form.date || !form.time) {
      toast.error("Preencha todos os campos");
      return;
    }
    const client = clients.find((c) => c.id === form.clientId);
    if (!client) return;
    setCreating(true);
    try {
      await createAppointment({
        clientId: client.id,
        clientName: client.name,
        date: form.date,
        time: form.time,
        attendeeEmail: client.email,
        description: `Reunião de alinhamento com ${client.name} — ${client.company}`,
      });
      toast.success(connected ? "Reunião criada no Google Agenda!" : "Reunião salva localmente!");
      setNewDialog(false);
      setForm({ clientId: "", date: "", time: "" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar agendamento");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Reuniões agendadas e disponibilidade</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
            connected ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"
          )}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? "Google Agenda" : usingMock ? "Modo demo" : "Desconectado"}
          </div>
          {!connected && (
            <Button variant="outline" size="sm" onClick={async () => { try { await connectGoogle(); } catch { toast.error("Erro ao conectar"); }}}>
              Conectar Google
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={load} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button size="sm" onClick={() => setNewDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Próximas Reuniões
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="rounded-xl border border-border h-20 animate-pulse bg-muted/30" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma reunião encontrada</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-primary">{apt.date.split("-")[2]}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{apt.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{apt.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[apt.status] || "bg-muted text-muted-foreground")}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                  {apt.meetLink && (
                    <a href={apt.meetLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Disponibilidade</h3>
          <div className="space-y-3">
            {availability.map((day) => (
              <div key={day.date} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">
                  {day.dayName} — {day.date.split("-").reverse().join("/")}
                </p>
                <div className="flex gap-2 mt-3">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.time}
                      onClick={() => { if (slot.available) { setForm((f) => ({ ...f, date: day.date, time: slot.time })); setNewDialog(true); }}}
                      className={cn(
                        "flex-1 text-center py-2 rounded-lg text-xs font-medium border transition-colors",
                        slot.available
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20 cursor-pointer"
                          : "bg-muted text-muted-foreground border-border cursor-not-allowed"
                      )}
                    >
                      {slot.time}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">Regras</p>
            <p>• Máx 3 reuniões/dia</p>
            <p>• Terça, Quarta e Quinta</p>
            <p>• Horários: 14h, 15h, 16h</p>
          </div>
        </div>
      </div>

      <Dialog open={newDialog} onOpenChange={setNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
                <SelectContent>
                  {pendingClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={form.time} onValueChange={(v) => setForm((f) => ({ ...f, time: v }))}>
                  <SelectTrigger><SelectValue placeholder="Horário" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {connected && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                O evento será criado no Google Agenda e o cliente receberá convite com link do Google Meet.
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setNewDialog(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleCreate} disabled={creating}>
                {creating ? "Criando..." : connected ? "Criar no Google Agenda" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}