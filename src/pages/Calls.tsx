import { useState, useEffect } from "react";
import { mockCallLogs } from "@/data/mock";
import { Phone, Play, PhoneOff, CalendarCheck, XCircle, Clock, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CallLog } from "@/types";
import { toast } from "sonner";
import { useTeam } from "@/hooks/useTeam";
import { supabase } from "@/lib/supabase";

const resultConfig = {
  agendado: { icon: CalendarCheck, label: "Agendado", className: "text-success" },
  nao_atendeu: { icon: PhoneOff, label: "Não Atendeu", className: "text-warning" },
  recusou: { icon: XCircle, label: "Recusou", className: "text-destructive" },
  remarcou: { icon: Phone, label: "Remarcou", className: "text-info" },
  erro: { icon: XCircle, label: "Erro", className: "text-destructive" },
};

export default function Calls() {
  const { selectedTeam } = useTeam();
  const [transcriptDialog, setTranscriptDialog] = useState<CallLog | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>(mockCallLogs);
  const [pendingClients, setPendingClients] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [callsRes, clientsRes] = await Promise.all([
          supabase.from("call_logs").select("*").eq("team", selectedTeam).order("started_at", { ascending: false }),
          supabase.from("clients").select("*").eq("team", selectedTeam).in("status", ["pendente", "em_contato"]),
        ]);

        if (callsRes.data && callsRes.data.length > 0) {
          setCallLogs(callsRes.data.map((c: any) => ({
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

        if (clientsRes.data) {
          setPendingClients(clientsRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            contactAttempts: c.contact_attempts,
            maxAttempts: c.max_attempts,
          })));
        }
      } catch {
        // fallback
      }
    };
    load();
  }, [selectedTeam]);

  const handleStartQueue = () => {
    toast.info("Fila de ligações iniciada! (simulação)", { description: `${pendingClients.length} clientes na fila` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ligações IA</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de chamadas automáticas com IA de voz</p>
        </div>
        <Button onClick={handleStartQueue} className="gap-2">
          <Play className="w-4 h-4" /> Iniciar Fila ({pendingClients.length})
        </Button>
      </div>

      {/* Queue */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" /> Fila de Ligações
        </h3>
        {pendingClients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cliente pendente nesta equipe</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingClients.map((client) => (
              <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.phone}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{client.contactAttempts}/{client.maxAttempts}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Logs */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Histórico de Ligações</h3>
        <div className="space-y-2">
          {callLogs.map((call) => {
            const config = resultConfig[call.result];
            const Icon = config.icon;
            return (
              <div key={call.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-muted", config.className)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{call.clientName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{call.phone}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {call.duration > 0 ? `${Math.floor(call.duration / 60)}m${call.duration % 60}s` : "Sem resposta"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full bg-muted", config.className)}>{config.label}</span>
                  {call.transcript && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTranscriptDialog(call)}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transcript dialog */}
      <Dialog open={!!transcriptDialog} onOpenChange={() => setTranscriptDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transcrição — {transcriptDialog?.clientName}</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {transcriptDialog?.transcript}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Duração: {transcriptDialog && transcriptDialog.duration > 0 ? `${Math.floor(transcriptDialog.duration / 60)}m${transcriptDialog.duration % 60}s` : "—"}</span>
            <span>Tentativa: {transcriptDialog?.attemptNumber}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
