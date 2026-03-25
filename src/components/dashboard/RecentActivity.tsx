import { CallLog } from "@/types";
import { Phone, PhoneOff, CalendarCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const resultConfig = {
  agendado: { icon: CalendarCheck, label: "Agendado", className: "text-success" },
  nao_atendeu: { icon: PhoneOff, label: "Não atendeu", className: "text-warning" },
  recusou: { icon: XCircle, label: "Recusou", className: "text-destructive" },
  remarcou: { icon: Phone, label: "Remarcou", className: "text-info" },
  erro: { icon: XCircle, label: "Erro", className: "text-destructive" },
};

interface RecentActivityProps {
  calls: CallLog[];
}

export function RecentActivity({ calls }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Atividade Recente</h3>
      <div className="space-y-3">
        {calls.map((call) => {
          const config = resultConfig[call.result];
          const Icon = config.icon;
          return (
            <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-muted", config.className)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{call.clientName}</p>
                <p className="text-xs text-muted-foreground">{call.phone} · Tentativa {call.attemptNumber}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-xs font-medium", config.className)}>{config.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {call.duration > 0 ? `${Math.floor(call.duration / 60)}m${call.duration % 60}s` : "—"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
