
-- Add team column to clients, appointments, call_logs
ALTER TABLE public.clients ADD COLUMN team text DEFAULT 'siao';
ALTER TABLE public.appointments ADD COLUMN team text DEFAULT 'siao';
ALTER TABLE public.call_logs ADD COLUMN team text DEFAULT 'siao';

-- Create teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text NOT NULL,
  description text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated select teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update teams" ON public.teams FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete teams" ON public.teams FOR DELETE TO authenticated USING (true);

-- Seed default teams
INSERT INTO public.teams (name, slug, color, description) VALUES
  ('Sião', 'siao', '#6B7280', 'Equipe Sião'),
  ('Juda', 'juda', '#DC2626', 'Equipe Juda'),
  ('Arca', 'arca', '#2563EB', 'Equipe Arca');
