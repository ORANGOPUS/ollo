-- Opt-in for appearing on the read-only site at ollo.thng.my.
-- Off by default: nobody is listed unless they switch it on in their dashboard.
alter table public.profiles
  add column if not exists show_on_pages boolean not null default false;
