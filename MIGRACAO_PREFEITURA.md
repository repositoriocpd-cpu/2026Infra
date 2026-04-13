# Guia de Migração: Supabase/Netlify → Servidor Prefeitura

## Visão Geral

| Componente | Atual (Cloud) | Destino (Prefeitura) |
|------------|--------------|---------------------|
| Repositório | GitHub | Servidor Git local ou repositório interno |
| Banco de dados | Supabase (PostgreSQL cloud) | PostgreSQL on-premises |
| Backend API | Supabase REST/WebSocket | PHP (se necessário) + Redis |
| Hospedagem | Netlify | Nginx |
| Autenticação | Supabase Auth | Windows AD (LDAP) |

---

## Etapa 1: Exportar Dados do Supabase

### 1.1 Exportar schema e dados
```bash
# Via pg_dump (execute no servidor Supabase ou use dashboard)
pg_dump -h db.sxsfqvcxikdsahhidrdx.supabase.co -U postgres -d postgres > backup.dump
```

### 1.2 Exportar via Dashboard Supabase
1. Acesse o painel Supabase
2. Vá em **Settings → Database**
3. Clique em **Download dump**

---

## Etapa 2: Configurar PostgreSQL no Servidor

### 2.1 Instalação (Windows Server)
```powershell
# Instalar PostgreSQL (baixe em https://www.postgresql.org/download/windows/)
# ou via Chocolatey
choco install postgresql -y
```

### 2.2 Criar banco e usuário
```sql
-- Conecte como postgresadmin
CREATE USER subinfra WITH PASSWORD 'senha_segura';
CREATE DATABASE subinfra OWNER subinfra;
GRANT ALL PRIVILEGES ON DATABASE subinfra TO subinfra;
```

### 2.3 Restaurar dados
```bash
psql -U postgres -d subinfra -f backup.dump
```

---

## Etapa 3: Configurar Nginx

### 3.1 Arquivo de configuração
```nginx
server {
    listen 80;
    server_name subinfra.prefeitura.gov.br;

    root C:/inetpub/subinfra;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para Supabase substituído por API PHP (se necessário)
    location /rest/ {
        proxy_pass http://localhost:5433;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3.2 Habilitar CORS (se usando API própria)
```nginx
add_header 'Access-Control-Allow-Origin' 'https://subinfra.prefeitura.gov.br' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
```

---

## Etapa 4: Integrar com Active Directory (LDAP)

### 4.1 Modificar config.js
Altere o arquivo `config.js` para usar autenticação LDAP:

```javascript
const Config = {
    // Autenticação via LDAP/AD
    auth: {
        type: 'ldap',
        ldapServer: 'ldap://servidor-ad.prefeitura.local',
        baseDN: 'dc=prefeitura,dc=gov,dc=br',
    },

    // Conexão direta com PostgreSQL local
    database: {
        host: 'localhost',
        port: 5432,
        name: 'subinfra',
        user: 'subinfra',
    },

    // Redis local (se usado para sessões)
    redis: {
        host: 'localhost',
        port: 6379,
    },
};
```

### 4.2 Autenticação LDAP via PHP (recomendado)
Crie um endpoint PHP para validar usuário AD:

```php
<?php
// auth.php
header('Content-Type: application/json');

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Configuração LDAP
$ldapServer = 'ldap://servidor-ad.prefeitura.local';
$baseDN = 'dc=prefeitura,dc=gov,dc=br';

$connect = ldap_connect($ldapServer);
ldap_set_option($connect, LDAP_OPT_PROTOCOL_VERSION, 3);

$bind = @ldap_bind($connect, "$username@prefeitura.local", $password);

if ($bind) {
    // Buscar informações do usuário
    $filter = "(sAMAccountName=$username)";
    $result = ldap_search($connect, $baseDN, $filter);
    $entry = ldap_get_entries($connect, $result);

    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $username,
            'displayName' => $entry[0]['displayname'][0],
            'email' => $entry[0]['mail'][0],
            'department' => $entry[0]['department'][0],
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas']);
}

ldap_close($connect);
```

---

## Etapa 5: Ajustar Código Frontend

### 5.1 Substituir cliente Supabase
No `index.html`, remova a dependência do Supabase:

```html
<!-- Remover -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0"></script>

<!-- Adicionar seu cliente customizado ou usar fetch direto -->
<script src="api-client.js"></script>
```

### 5.2 Criar api-client.js
```javascript
const ApiClient = {
    baseUrl: '/rest/',

    async request(endpoint, options = {}) {
        const response = await fetch(this.baseUrl + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Inclui cookies LDAP
        });
        return response.json();
    },

    // Auth
    login(username, password) {
        return this.request('auth.php', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    // CRUD替代 Supabase
    async getProcessos() {
        return this.request('api/processos.php');
    },

    async createProcesso(data) {
        return this.request('api/processos.php', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateProcesso(id, data) {
        return this.request(`api/processos.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteProcesso(id) {
        return this.request(`api/processos.php?id=${id}`, {
            method: 'DELETE',
        });
    },
};

window.ApiClient = ApiClient;
```

### 5.3 Criar API PHP
```php
<?php
// api/processos.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM processos WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query("SELECT * FROM processos ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $stmt = $pdo->prepare("INSERT INTO processos (titulo, descricao, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$input['titulo'], $input['descricao']]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $stmt = $pdo->prepare("UPDATE processos SET titulo = ?, descricao = ? WHERE id = ?");
        $stmt->execute([$input['titulo'], $input['descricao'], $_GET['id']]);
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        $stmt = $pdo->prepare("DELETE FROM processos WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success' => true]);
        break;
}
```

---

## Etapa 6: Implantar no Servidor

### 6.1 Estrutura de diretórios
```
C:/inetpub/subinfra/
├── index.html
├── config.js
├── api-client.js
├── ui-kit.css
├── api/
│   ├── auth.php
��   ├── processos.php
│   └── db.php
└── dados/
    └── (arquivos de dados)
```

### 6.2 Configurar permissões
```powershell
# Permissões para IIS_NetworkService
icacls C:\inetpub\subinfra /grant "IIS_IUSRS:(OI)(CI)RX"
```

---

## Checklist de Migração

- [ ] Exportar dados do Supabase
- [ ] Instalar PostgreSQL no servidor
- [ ] Criar banco de dados local
- [ ] Restaurar dump do banco
- [ ] Configurar Nginx/IIS
- [ ] Criar endpoint PHP para auth LDAP
- [ ] Adaptar frontend para API local
- [ ] Testar autenticação AD
- [ ] Testar CRUD de processos
- [ ] Configurar SSL/TLS (https)
- [ ] Configurar backup automático

---

## Diferenças Importantes

| Recurso | Supabase | Solução Local |
|---------|---------|-------------|
| Auth automática | Supabase Auth | LDAP manual |
| Realtime | Supabase Realtime | Redis Pub/Sub |
| Storage | Supabase Storage | Servidor de arquivos local |
| Edge Functions | Supabase Functions | PHP cronjobs |

---

## Suporte a Realtime (Opcional)

Se precisar de atualizações em tempo real, configure Redis:

```php
<?php
// realtime.php (consumer)
$redis = new Redis();
$redis->connect('localhost', 6379);

$sub = $redis->subscribe(['processo_updates'], function ($message) {
    echo $message;
});
```

Frontend:
```javascript
const redis = new WebSocket('ws://localhost:6379');
redis.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateUI(data);
};
```