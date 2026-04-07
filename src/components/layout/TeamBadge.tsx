import { useTeam } from "@/hooks/useTeam";

export function TeamBadge() {
  const { currentTeam } = useTeam();
  if (!currentTeam) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: currentTeam.color }}
      />
      <span className="text-xs font-medium text-foreground">{currentTeam.name}</span>
    </div>
  );
}
