import { mockAppointments, mockAvailability } from "@/data/mock";
import { Calendar, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles = {
  confirmado: "bg-success/15 text-success",
  pendente: "bg-warning/15 text-warning",
  cancelado: "bg-destructive/15 text-destructive",
  realizado: "bg-muted text-muted-foreground",
};

export default function Appointments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Reuniões agendadas e disponibilidade</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Próximas Reuniões
          </h3>
          {mockAppointments.map((apt) => (
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
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[apt.status])}>
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
                {apt.meetLink && (
                  <a href={apt.meetLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Disponibilidade</h3>
          <div className="space-y-3">
            {mockAvailability.map((day) => (
              <div key={day.date} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{day.dayName} — {day.date.split("-").reverse().join("/")}</p>
                <div className="flex gap-2 mt-3">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.time}
                      className={cn(
                        "flex-1 text-center py-2 rounded-lg text-xs font-medium border",
                        slot.available
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border"
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
    </div>
  );
}
