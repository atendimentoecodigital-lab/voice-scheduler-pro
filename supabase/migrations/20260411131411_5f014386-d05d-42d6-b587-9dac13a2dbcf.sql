
CREATE POLICY "Anon select clients"
ON public.clients
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon update clients"
ON public.clients
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
