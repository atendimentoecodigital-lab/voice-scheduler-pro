
-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  company TEXT,
  status TEXT DEFAULT 'pendente',
  contact_attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT,
  date DATE,
  time TEXT,
  meet_link TEXT DEFAULT '',
  google_event_id TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- Create call_logs table
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT,
  phone TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  duration INTEGER DEFAULT 0,
  result TEXT DEFAULT 'erro',
  transcript TEXT DEFAULT '',
  attempt_number INTEGER DEFAULT 1
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on call_logs" ON public.call_logs FOR ALL USING (true) WITH CHECK (true);

-- Create google_tokens table
CREATE TABLE public.google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'default',
  access_token TEXT,
  refresh_token TEXT,
  expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on google_tokens" ON public.google_tokens FOR ALL USING (true) WITH CHECK (true);

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
