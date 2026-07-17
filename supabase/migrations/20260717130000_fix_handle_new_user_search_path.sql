-- handle_new_user() cast bare `user_role` (unqualified) with no explicit
-- search_path. SECURITY DEFINER changes the executing ROLE, not the
-- search_path -- it still resolves identifiers using the CALLER's session
-- search_path unless one is pinned on the function. supabase_auth_admin
-- (the role GoTrue connects as) doesn't have `public` in its search_path,
-- so every real signup hit "type user_role does not exist" and aborted the
-- whole auth.users insert with "Database error saving new user". Testing
-- via the SQL editor (connected as `postgres`, whose search_path includes
-- `public`) hid the bug entirely.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, phone, role, email)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
      COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
      NULL
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN unique_violation THEN
      INSERT INTO public.profiles (id, full_name, avatar_url, phone, role, email)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        NULL,
        COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        NULL
      )
      ON CONFLICT (id) DO NOTHING;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;
