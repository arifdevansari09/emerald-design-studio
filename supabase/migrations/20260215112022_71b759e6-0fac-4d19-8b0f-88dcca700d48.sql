
-- Fix the permissive INSERT policy on inquiries to require valid data
DROP POLICY "Anyone can submit inquiry" ON public.inquiries;

CREATE POLICY "Anyone can submit inquiry" ON public.inquiries
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND
    length(trim(email)) > 0 AND
    email ~ '^[^@]+@[^@]+\.[^@]+$' AND
    length(trim(message)) > 0
  );
