-- Supabase SQL: Estrutura inicial para Airbnb Lite

-- Tabela de usuários (perfil extra, pois auth é gerenciado pelo Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('user_host', 'user_client')),
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabela de imóveis
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  price_per_night numeric not null,
  image_url text,
  location text,
  available boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabela de reservas
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  client_id uuid references profiles(id) on delete set null,
  start_date date not null,
  end_date date not null,
  total_price numeric not null,
  status text not null check (status in ('pending', 'accepted', 'rejected', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Tabela de notificações
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Função para verificar se um email já está em uso
create or replace function public.get_user_by_email(email_input text)
returns table(id uuid, email text) 
language plpgsql
security definer
as $$
begin
  return query
  select p.id, p.email
  from public.profiles p
  where p.email = email_input;
end;
$$;

-- Função para verificar se um usuário pode cadastrar imóveis
create or replace function public.can_create_property(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = user_id;
  
  return user_role = 'user_host';
end;
$$;

-- Função para verificar se um usuário pode fazer reservas
create or replace function public.can_make_booking(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = user_id;
  
  return user_role = 'user_client';
end;
$$;

-- Função para criar perfil durante o signup (security definer para bypass RLS)
create or replace function public.create_profile_signup(
  user_id uuid,
  user_email text,
  user_name text,
  user_role text
)
returns table(id uuid, email text, name text, role text, avatar_url text, created_at timestamptz)
language plpgsql
security definer
as $$
begin
  -- Tenta inserir o perfil
  insert into public.profiles (id, email, name, role, avatar_url)
  values (user_id, user_email, user_name, user_role, '');
  
  -- Retorna o perfil criado
  return query
  select p.id, p.email, p.name, p.role, p.avatar_url, p.created_at
  from public.profiles p
  where p.id = user_id;
exception
  when unique_violation then
    -- Se o perfil já existe, apenas retorna o existente
    return query
    select p.id, p.email, p.name, p.role, p.avatar_url, p.created_at
    from public.profiles p
    where p.id = user_id;
end;
$$;
