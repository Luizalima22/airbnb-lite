-- Atualização do schema para suporte a múltiplas imagens

-- Tabela de imagens dos imóveis
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  is_main boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Index para performance
create index if not exists idx_property_images_property_id on property_images(property_id);
create index if not exists idx_property_images_main on property_images(property_id, is_main);

-- Função para garantir que apenas uma imagem seja marcada como principal
create or replace function ensure_single_main_image()
returns trigger as $$
begin
  if NEW.is_main = true then
    -- Remove is_main de outras imagens da mesma propriedade
    update property_images 
    set is_main = false 
    where property_id = NEW.property_id and id != NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger para garantir uma única imagem principal
drop trigger if exists trigger_ensure_single_main_image on property_images;
create trigger trigger_ensure_single_main_image
  before insert or update on property_images
  for each row execute function ensure_single_main_image();

-- RLS (Row Level Security) para property_images
alter table property_images enable row level security;

-- Políticas de segurança para property_images
create policy "Todos podem ver imagens dos imóveis" on property_images
  for select using (true);

create policy "Hosts podem inserir imagens em seus imóveis" on property_images
  for insert with check (
    exists (
      select 1 from properties 
      where id = property_id 
      and host_id = auth.uid()
    )
  );

create policy "Hosts podem atualizar imagens de seus imóveis" on property_images
  for update using (
    exists (
      select 1 from properties 
      where id = property_id 
      and host_id = auth.uid()
    )
  );

create policy "Hosts podem deletar imagens de seus imóveis" on property_images
  for delete using (
    exists (
      select 1 from properties 
      where id = property_id 
      and host_id = auth.uid()
    )
  );

-- Migração: Mover imagens existentes para a nova tabela
insert into property_images (property_id, image_url, display_order, is_main)
select id, image_url, 0, true
from properties 
where image_url is not null and image_url != '';

-- Função para obter imagens de uma propriedade ordenadas
create or replace function get_property_images(property_uuid uuid)
returns table(
  id uuid,
  image_url text,
  display_order integer,
  is_main boolean
) as $$
begin
  return query
  select pi.id, pi.image_url, pi.display_order, pi.is_main
  from property_images pi
  where pi.property_id = property_uuid
  order by pi.is_main desc, pi.display_order asc, pi.created_at asc;
end;
$$ language plpgsql;
