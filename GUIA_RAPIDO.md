# 🚀 Guia Rápido - EcomLytics com Backend Supabase

## ⚡ Início Rápido (5 minutos)

### 1. Instalar Dependências

```bash
cd /caminho/do/projeto
pnpm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env.local` já está configurado com:

```env
VITE_SUPABASE_URL=https://xzbnyqsaeeolfvsxavie.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Pronto para usar!** O banco de dados já está configurado.

### 3. Iniciar o Servidor

```bash
pnpm dev
```

Acesse: **http://localhost:3000**

### 4. Criar sua Conta

1. Clique em **"Cadastro"**
2. Preencha:
   - Nome Completo
   - Email
   - Senha (mínimo 6 caracteres)
3. Clique em **"Criar Conta"**
4. Pronto! Você está logado.

---

## 📊 Funcionalidades Disponíveis

### ✅ Já Funcionando

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| **Autenticação** | ✅ Funcionando | Login/Registro com Supabase |
| **Persistência** | ✅ Funcionando | Dados salvos automaticamente |
| **Planejamento Anual** | ✅ Funcionando | OPEX com múltiplos cenários |
| **Metas** | ✅ Funcionando | Definição de metas financeiras |
| **Dashboard** | ✅ Funcionando | Visualização de métricas |
| **Dark Mode** | ✅ Funcionando | Tema claro/escuro |
| **Exportação** | ✅ Funcionando | Excel, PDF, CSV |

### 🔧 Preparado (Requer Configuração)

| Funcionalidade | Status | O que falta |
|----------------|--------|-------------|
| **Google Ads** | 🔧 Preparado | Configurar OAuth e API Key |
| **Shopify** | 🔧 Preparado | Configurar OAuth e API Key |

---

## 🔑 Credenciais de Teste

Para testar rapidamente, você pode usar:

- **Email**: teste@ecomlitycs.app
- **Senha**: teste123

Ou criar sua própria conta!

---

## 📁 Estrutura do Projeto

```
ecomlitycs/
├── components/          # Componentes React
│   ├── Auth/           # Login/Registro
│   ├── IntegrationsFunctional.tsx
│   └── ...
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Gerenciamento de autenticação
├── services/           # Serviços de API
│   ├── googleAdsService.ts
│   ├── shopifyService.ts
│   ├── annualPlanService.ts
│   └── planningGoalsService.ts
├── lib/                # Bibliotecas
│   └── supabaseClient.ts
├── App.tsx             # App principal
└── .env.local          # Variáveis de ambiente
```

---

## 🗄️ Banco de Dados

### Tabelas Criadas

1. **profiles** - Perfis de usuários
2. **integrations** - Credenciais de integrações
3. **annual_plans** - Planos anuais OPEX
4. **planning_goals** - Metas de planejamento
5. **daily_actuals** - Dados diários reais
6. **google_ads_metrics** - Métricas do Google Ads
7. **shopify_products** - Produtos do Shopify

### Segurança

✅ **Row Level Security (RLS)** habilitado  
✅ Cada usuário vê apenas seus dados  
✅ Políticas de acesso automáticas  

---

## 🔗 Conectar Integrações (Opcional)

### Google Ads

**Para usar em produção:**

1. Criar projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar Google Ads API
3. Criar credenciais OAuth 2.0
4. Adicionar ao `.env.local`:
   ```env
   VITE_GOOGLE_ADS_CLIENT_ID=seu_client_id_aqui
   ```
5. Configurar redirect URI: `http://localhost:3000/auth/google-ads/callback`

### Shopify

**Para usar em produção:**

1. Criar app no [Shopify Partners](https://partners.shopify.com)
2. Configurar OAuth
3. Adicionar ao `.env.local`:
   ```env
   VITE_SHOPIFY_API_KEY=sua_api_key_aqui
   ```
4. Configurar redirect URI: `http://localhost:3000/auth/shopify/callback`

---

## 🎯 Como Usar

### 1. Definir Metas

1. Vá para **"Planejamento"** no menu
2. Configure:
   - Meta de Receita
   - Taxa de Conversão
   - Ticket Médio
   - Custos e Taxas
3. Dados são salvos automaticamente ✅

### 2. Criar Plano Anual

1. Vá para **"Planejamento Anual"**
2. Configure OPEX por categoria:
   - Pessoal
   - Marketing
   - Tecnologia
   - Operações
   - Administrativo
3. Crie cenários:
   - Base
   - Corte de Gastos
   - Crescimento Acelerado
4. Alterne entre cenários
5. Dados são salvos automaticamente ✅

### 3. Visualizar Dashboard

1. Vá para **"Dashboard"**
2. Veja métricas em tempo real
3. Exporte relatórios (Excel, PDF, CSV)

### 4. Conectar Integrações

1. Vá para **"Dados"**
2. Conecte Google Ads ou Shopify
3. Sincronize dados
4. Dados aparecem no Dashboard

---

## 🆘 Problemas Comuns

### Não consigo fazer login

**Solução:**
- Verifique se criou a conta
- Verifique email e senha
- Senha deve ter no mínimo 6 caracteres

### Dados não estão salvando

**Solução:**
- Verifique se está logado
- Abra o Console do navegador (F12)
- Veja se há erros
- Verifique conexão com internet

### Integração não conecta

**Solução:**
- Verifique se configurou as variáveis de ambiente
- Verifique se criou as credenciais OAuth
- Veja documentação completa em `DOCUMENTACAO_BACKEND_SUPABASE.md`

---

## 📚 Documentação Completa

Para documentação detalhada, consulte:

- **DOCUMENTACAO_BACKEND_SUPABASE.md** - Documentação completa do backend
- **MELHORIAS_IMPLEMENTADAS.md** - Melhorias de design e performance
- **README_NOVO.md** - README atualizado do projeto

---

## 🎨 Recursos Visuais

### Dark Mode

Clique no ícone de lua/sol no canto superior direito para alternar entre tema claro e escuro.

### Exportação

Clique no botão de exportação em qualquer dashboard para baixar dados em:
- **Excel** (.xlsx)
- **PDF** (.pdf)
- **CSV** (.csv)

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
pnpm build

# Deploy pasta dist/
```

### Variáveis de Ambiente

Não esqueça de configurar as variáveis de ambiente no serviço de deploy:

```
VITE_SUPABASE_URL=https://xzbnyqsaeeolfvsxavie.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📞 Suporte

Precisa de ajuda?

- 📧 Email: suporte@ecomlitycs.com
- 📖 Docs: Veja arquivos de documentação
- 🐛 Bugs: Abra uma issue no GitHub

---

## ✨ Próximos Passos

1. **Testar todas as funcionalidades**
2. **Configurar integrações** (Google Ads, Shopify)
3. **Customizar** para suas necessidades
4. **Fazer deploy** em produção
5. **Convidar usuários** para testar

---

**Desenvolvido com ❤️ para E-commerce**

**Versão:** 2.0.0 com Backend Supabase  
**Data:** Novembro 2025
