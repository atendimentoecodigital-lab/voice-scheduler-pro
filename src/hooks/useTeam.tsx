import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type Team = {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  calendar_id: string;
  created_at: string;
};

type TeamContextType = {
  teams: Team[];
  selectedTeam: string; // slug
  setSelectedTeam: (slug: string) => void;
  currentTeam: Team | null;
  loading: boolean;
  reloadTeams: () => Promise<void>;
};

const TeamContext = createContext<TeamContextType | null>(null);

const DEFAULT_TEAMS: Team[] = [
  { id: "1", name: "Sião", slug: "siao", color: "#6B7280", description: "Equipe Sião", calendar_id: "e97b5158a1c8cc6b0e44096ccb8f99d2b52fd6a25c144573348cc18be3961de0@group.calendar.google.com", created_at: "" },
  { id: "2", name: "Juda", slug: "juda", color: "#DC2626", description: "Equipe Juda", calendar_id: "0129971c7ce7226946a90e1945ae5d08cbb67e18f1f2f4f37cec80769b945a02@group.calendar.google.com", created_at: "" },
  { id: "3", name: "Arca", slug: "arca", color: "#2563EB", description: "Equipe Arca", calendar_id: "e38d5610a8720a788c358e19e267d1968f4eeb2b41d86a073d99ae93640dcf14@group.calendar.google.com", created_at: "" },
];

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    return localStorage.getItem("selectedTeam") || "siao";
  });
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase.from("teams").select("*").order("created_at");
      if (error || !data || data.length === 0) throw error;
      setTeams(data as Team[]);
    } catch {
      setTeams(DEFAULT_TEAMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeams(); }, []);

  const handleSetTeam = (slug: string) => {
    setSelectedTeam(slug);
    localStorage.setItem("selectedTeam", slug);
  };

  const currentTeam = teams.find((t) => t.slug === selectedTeam) || teams[0] || null;

  return (
    <TeamContext.Provider value={{ teams, selectedTeam, setSelectedTeam: handleSetTeam, currentTeam, loading, reloadTeams: loadTeams }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
