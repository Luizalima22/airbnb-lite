# 🏠 Airbnb Lite

Um clone enxuto e funcional do Airbnb construído com **Next.js 15**, **Supabase** e **Tailwind CSS**, seguindo todos os requisitos do desafio proposto.

## 🎯 Desafio Atendido

### 👥 Roles Implementados
- **user_host**: Cadastra imóveis e administra locações
- **user_client**: Navega pela plataforma e aluga imóveis

### � Telas e Funcionalidades

#### 1. **Home** (user_client)
- ✅ Listagem de imóveis com design inspirado no Airbnb real
- ✅ Layout responsivo com cards modernos
- ✅ Busca inteligente com validação de localização
- ✅ Clique em um imóvel → vai para `/host/:id`

#### 2. **Host Page** (`/host/:id`)
- ✅ Dados detalhados do imóvel com galeria de imagens
- ✅ Valor da diária claramente exibido
- ✅ Seleção de data de entrada e saída
- ✅ Cálculo automático do valor total
- ✅ Formulário para solicitar locação

#### 3. **Dashboard** (user_host)
- ✅ Listagem dos imóveis cadastrados
- ✅ Locações ativas e status de disponibilidade
- ✅ Gestão de clientes e reservas
- ✅ Faturamento total no mês

### � Fluxo Completo Funcionando
1. ✅ **user_client** acessa Home → escolhe imóvel
2. ✅ Acessa página do imóvel → envia pedido de locação
3. ✅ **user_host** vê solicitação no Dashboard → aceita ou recusa
4. ✅ Sistema de notificações informa status da reserva

## 🛠️ Stack Obrigatória (Implementada)

- ✅ **Next.js 15** com App Router
- ✅ **Supabase** para auth, database e storage
- ✅ **Edge Functions** utilizadas para lógica avançada
- ✅ **RPCs (Supabase)** para operações no banco
- ✅ **Tailwind CSS** para estilização
- ✅ **PostgreSQL** (banco relacional do Supabase)

## 🔐 Autenticação Completa

- ✅ **Signup** com seleção de role
- ✅ **Login** com validação
- ✅ **Logout** funcional
- ✅ **Recuperação de senha**
- ✅ **Proteção de rotas** por tipo de usuário
- ✅ **Middleware** de autenticação robusto

## 📊 Avaliação dos Critérios

### Arquitetura (⭐⭐⭐⭐⭐)
- Estrutura modular com separação clara de responsabilidades
- Hooks customizados organizados por feature
- Services bem estruturados
- Middleware de autenticação robusto

### Supabase + Edge Functions (⭐⭐⭐⭐)
- Autenticação completa com RLS
- Edge Functions para lógica complexa
- RPCs para operações no banco
- Storage configurado para imagens

### Layout e Experiência (⭐⭐⭐)
- Design fiel ao Airbnb original
- Interface responsiva e moderna
- Microinterações e animações
- UX otimizada para mobile

### Código e Documentação (⭐⭐⭐)
- Código limpo sem erros de lint
- TypeScript com tipagem completa
- Documentação clara e completa
- Comentários explicativos

### Funcionalidades (⭐⭐)
- Todas as funcionalidades obrigatórias implementadas
- Funcionalidades extras agregam valor
- Fluxo completo funcionando
- Sistema de notificações automático

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Git

### Instalação Rápida

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd airbnb-lite
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Configure no .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Configure o banco de dados**
Execute os scripts SQL no Supabase na ordem:
- `supabase_schema.sql` - Estrutura das tabelas
- `supabase_policies.sql` - Políticas de segurança
- `supabase_storage_setup.sql` - Configuração de storage
- `supabase_multiple_images.sql` - Tabela de imagens

5. **Execute o projeto**
```bash
npm run dev
```

6. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🎯 Decisões Técnicas

### Arquitetura
- **App Router (Next.js 15)**: Para aproveitar os recursos mais recentes
- **Separação por features**: Hooks e services organizados por domínio
- **Middleware personalizado**: Para proteção robusta de rotas
- **TypeScript**: Para maior segurança e produtividade

### Supabase
- **Row Level Security (RLS)**: Segurança no nível de linha
- **Service Role Key**: Para operações críticas que bypass RLS
- **Storage configurado**: Para upload de múltiplas imagens
- **Edge Functions**: Para lógica complexa no servidor

### Interface
- **Mobile-first**: Design responsivo priorizando mobile
- **Tailwind CSS**: Para estilização rápida e consistente
- **Componentes reutilizáveis**: Para manutenibilidade
- **Microinterações**: Para melhor experiência do usuário

### Funcionalidades Extras
- **Validação de localização real**: Usando OpenStreetMap/Nominatim
- **Sistema de múltiplas imagens**: Upload e galeria interativa
- **Dashboard completo**: Métricas e gestão para hosts
- **Sistema de notificações**: Automático e em tempo real

## 🎯 Tempo de Desenvolvimento

**Estimativa**: 16 horas (distribuídas em 5 dias conforme solicitado)

## 🚀 Deploy

O projeto está configurado para deploy no Vercel:

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push na branch main

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/airbnb-lite)

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção  
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard do host
│   ├── host/              # Página do host (detalhes do imóvel)
│   ├── bookings/          # Reservas do cliente
│   └── api/               # API Routes
├── components/            # Componentes reutilizáveis
├── features/             # Hooks específicos por feature
├── hooks/                # Hooks personalizados
├── lib/                  # Configurações e utilitários
├── services/             # Serviços e APIs
└── types/                # Tipagens TypeScript
```

---

**Desenvolvido com ❤️ usando Next.js 15, Supabase e Tailwind CSS**

*Este projeto representa uma implementação completa e funcional de uma plataforma de locação de imóveis, seguindo as melhores práticas de desenvolvimento web moderno.*
