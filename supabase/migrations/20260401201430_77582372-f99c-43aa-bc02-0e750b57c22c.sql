-- Drop all existing permissive policies
DROP POLICY IF EXISTS "Allow all on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all on call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow all on google_tokens" ON public.google_tokens;
DROP POLICY IF EXISTS "Allow all on settings" ON public.settings;

-- clients: authenticated users only
CREATE POLICY "Authenticated select clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update clients" ON public.clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- appointments: authenticated users only
CREATE POLICY "Authenticated select appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);

-- call_logs: authenticated users only
CREATE POLICY "Authenticated select call_logs" ON public.call_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert call_logs" ON public.call_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update call_logs" ON public.call_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete call_logs" ON public.call_logs FOR DELETE TO authenticated USING (true);

-- google_tokens: no public access (only service_role from edge functions)

-- settings: authenticated users only
CREATE POLICY "Authenticated select settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update settings" ON public.settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete settings" ON public.settings FOR DELETE TO authenticated USING (true);