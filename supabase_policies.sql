-- Políticas RLS para Airbnb Lite (Supabase)
-- IMPORTANTE: Se já existem políticas, execute primeiro o arquivo supabase_reset_policies.sql

-- Ativar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Cada usuário só pode ver/editar seu próprio perfil
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Previne cadastros duplicados - apenas um perfil por usuário
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON profiles (id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles (email);

-- Policy: Hosts podem criar imóveis, ver e editar apenas os seus
CREATE POLICY "Hosts can insert properties" ON properties
  FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "Hosts can update their own properties" ON properties
  FOR UPDATE USING (host_id = auth.uid());
CREATE POLICY "Anyone can view available properties" ON properties
  FOR SELECT USING (available = true);

-- Policy: RESERVAS - Apenas o sistema pode inserir (via API com service role)
-- Clientes e hosts podem visualizar suas reservas
CREATE POLICY "System only can insert bookings" ON bookings
  FOR INSERT WITH CHECK (false); -- Bloqueia inserção direta pelos usuários
CREATE POLICY "Clients can view their own bookings" ON bookings
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Hosts can view bookings for their properties" ON bookings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_id AND p.host_id = auth.uid()
  ));
CREATE POLICY "Clients can update their own bookings" ON bookings
  FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "Hosts can update bookings for their properties" ON bookings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_id AND p.host_id = auth.uid()
  ));

-- Policy: Notificações - Sistema pode inserir, usuários podem ver/atualizar as suas
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Permite inserção via sistema
