-- Cierra el hueco de "Eliminar cuenta": el cliente llamaba a esta función
-- pero nunca existió, así que el borrado no era ni permanente ni inmediato
-- como afirma la UI. Borra el registro de auth.users del propio usuario;
-- el cascade de las FK (public.users, daily_logs, chat_messages,
-- subscription_status) se encarga del resto.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user() to authenticated;
