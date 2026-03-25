import { ClientStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground" },
  em_contato: { label: "Em Contato", className: "bg-info/15 text-info" },
  agendado: { label: "Agendado", className: "bg-success/15 text-success" },
  nao_atendeu: { label: "Não Atendeu", className: "bg-warning/15 text-warning" },
  recusou: { label: "Recusou", className: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
