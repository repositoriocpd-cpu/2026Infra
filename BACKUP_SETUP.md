# Backup Automático - Configuração

## Como ativar o backup automático

### 1. Configurar Secrets no GitHub

Acesse: **Settings → Secrets and variables → Actions** do seu repositório

Adicione os seguintes secrets:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `SUPABASE_URL` | URL do seu projeto Supabase | `https://xyzxyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Chave de serviço (anon/public) | `eyJhbGc...` |
| `EMAIL_USER` | Seu e-mail para envio | `seuemail@gmail.com` |
| `EMAIL_PASS` | Senha de app do Gmail | `xxxx xxxx xxxx xxxx` |
| `EMAIL_TO` | E-mail que receberá o backup | `repositoriocpd@edu.itaguai.rj.gov.br` |

### 2. Obter as chaves do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Vá em **Project Settings → API**
3. Copie a `Project URL` para `SUPABASE_URL`
4. Copie a `service_role` key para `SUPABASE_SERVICE_KEY`

### 3. Configurar e-mail (Gmail)

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative a **Verificação em 2 etapas**
4. Vá em **Senhas de app**
5. Gere uma nova senha de app para "Outros"
6. Use essa senha no `EMAIL_PASS`

### 4. Frequência do Backup

O backup roda automaticamente a cada **3 horas**:
- 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00

### 5. Backup Manual

Acesse a aba **Actions** do repositório e clique em **"Supabase Backup & Email"** → **"Run workflow"**

### 6. Verificar Logs

Acompanhe a execução em **Actions → Supabase Backup & Email**
