import { useTeam } from "@/hooks/useTeam";
import { cn } from "@/lib/utils";

export function TeamSelector({ collapsed }: { collapsed: boolean }) {
  const { teams, selectedTeam, setSelectedTeam } = useTeam();

  return (
    <div className={cn("px-3 py-3 border-b border-sidebar-border", collapsed && "px-2")}>
      {!collapsed && (
        <p className="text-[10px] uppercase tracking-wider text-sidebar-muted mb-2 px-1">Equipe</p>
      )}
      <div className={cn("flex gap-1.5", collapsed ? "flex-col items-center" : "flex-col")}>
        {teams.map((team) => (
          <button
            key={team.slug}
            onClick={() => setSelectedTeam(team.slug)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg transition-colors text-sm font-medium",
              collapsed ? "w-9 h-9 justify-center" : "px-3 py-2",
              selectedTeam === team.slug
                ? "bg-sidebar-accent text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
            title={team.name}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/20"
              style={{ backgroundColor: team.color }}
            />
            {!collapsed && <span>{team.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
