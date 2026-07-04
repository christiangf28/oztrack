-- Migración: columna struggles del quiz de onboarding (Fase 1 monetización).
-- Correr en el SQL Editor de Supabase si la BD ya existía antes de esta fecha.
alter table public.users
  add column if not exists struggles text[] default '{}';
