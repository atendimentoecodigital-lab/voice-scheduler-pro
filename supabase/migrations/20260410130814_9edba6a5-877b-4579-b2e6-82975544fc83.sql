ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS calendar_id text DEFAULT '' NOT NULL;

UPDATE public.teams SET calendar_id = 'e38d5610a8720a788c358e19e267d1968f4eeb2b41d86a073d99ae93640dcf14@group.calendar.google.com' WHERE slug = 'arca';
UPDATE public.teams SET calendar_id = '0129971c7ce7226946a90e1945ae5d08cbb67e18f1f2f4f37cec80769b945a02@group.calendar.google.com' WHERE slug = 'juda';
UPDATE public.teams SET calendar_id = 'e97b5158a1c8cc6b0e44096ccb8f99d2b52fd6a25c144573348cc18be3961de0@group.calendar.google.com' WHERE slug = 'siao';