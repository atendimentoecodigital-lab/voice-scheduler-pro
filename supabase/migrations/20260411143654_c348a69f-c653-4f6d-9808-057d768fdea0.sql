
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text,
  phone text NOT NULL,
  message_text text NOT NULL DEFAULT '',
  direction text NOT NULL DEFAULT 'incoming' CHECK (direction IN ('incoming', 'outgoing')),
  team_slug text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon insert whatsapp_messages" ON public.whatsapp_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select whatsapp_messages" ON public.whatsapp_messages FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated select whatsapp_messages" ON public.whatsapp_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert whatsapp_messages" ON public.whatsapp_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update whatsapp_messages" ON public.whatsapp_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete whatsapp_messages" ON public.whatsapp_messages FOR DELETE TO authenticated USING (true);
