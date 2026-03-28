# Documento de Requisitos do Produto (PRD) - SUB INFRA

## 1. Visão Geral do Produto
O **SUB INFRA** é uma aplicação web interna desenvolvida para a Secretaria Municipal de Educação de Itaguaí. O objetivo principal é centralizar e gerenciar o fluxo de processos de pagamentos e infraestrutura, oferecendo uma visão analítica e operacional clara para os gestores e técnicos.

## 2. Objetivos Principais
- Monitorar processos de pagamentos em tempo real.
- Facilitar a localização e o rastreio histórico de cada processo.
- Oferecer indicadores de desempenho (KPIs) através de um dashboard intuitivo.
- Garantir a integridade dos dados através de um sistema de autenticação robusto.

## 3. Público-Alvo
- **Administradores**: Gestores que precisam de visão macro e controle de permissões.
- **Técnicos/Tratadores**: Usuários operacionais que atualizam o status e a localização dos processos.

## 4. Funcionalidades Detalhadas

### 4.1. Dashboard Analítico
- **Contadores de Status**: Exibição total de processos, processos em tramitação, liquidados, vencidos e no financeiro.
- **Gráficos Dinâmicos**: Distribuição de processos por Status e por Localização (setores).
- **Filtros Rápidos**: Atalhos que filtram a tabela principal baseados no clique dos cards do dashboard.

### 4.2. Gestão de Processos (CRUD)
- **Consulta**: Tabela dinâmica com filtros por E-mail do Tratador, Status e Localização.
- **Novo Processo**: Cadastro de novos processos com campos como Fornecedor, Objeto, Valor da Capa, Data de Abertura e Prazo.
- **Edição**: Atualização de qualquer dado do processo existente.
- **Histórico (Timeline)**: Registro automático e manual de todas as movimentações e alterações de status de um processo.

### 4.3. Configurações e Cadastros Base
- Gerenciamento de listas auxiliares para padronização de dados:
  - Fornecedores
  - Objetos
  - Localizações (Setores)
  - Status
  - Tratadores (Usuários)

### 4.4. Autenticação e Segurança
- Login via e-mail institucional e senha.
- Controle de acesso baseado em funções (Admin vs Usuário Comum).
- Integração com Supabase Auth.

---

## 5. Requisitos Técnicos (Tech Stack)
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+).
- **Banco de Dados & Auth**: Supabase (PostgreSQL + Auth).
- **Bibliotecas Principais**:
  - **Chart.js**: Renderização de gráficos.
  - **Choices.js**: Seleções dinâmicas e pesquisáveis.
  - **jspdf / html2canvas**: Geração de relatórios em PDF.
  - **xlsx**: Exportação para Excel.
- **Hospedagem**: Servidor local (v8080) com integração externa via API.

## 6. Design e Experiência do Usuário (UX)
- Interface inspirada em sistemas governamentais modernos (Padrão GOV.BR).
- Cores predominantes: Azul Marinho (Escuro) e Branco.
- Design Responsivo: Adaptado para Desktop e Dispositivos Móveis.
- Modo Escuro (Dark Mode): Suporte nativo para conforto visual.

## 7. Critérios de Sucesso
- Redução no tempo de localização de processos físicos.
- Acurácia de 100% no histórico de tramitação.
- Visualização imediata de gargalos operacionais via Dashboard.

## 8. Segurança e Auditoria de Acesso

### 8.1. Controle de Acesso Baseado em Cargos (RBAC)
- **Administrador**: Acesso total a configurações, gestão de usuários, backup e logs.
- **Usuário Colaborador**: Acesso restrito apenas ao Dashboard e Consulta de Processos.
- **Convidado (Padrão)**: Perfil de acesso de leitura básica; menus administrativos são ocultados por padrão.

### 8.2. Medidas de Segurança Implementadas
- **Ocultação de UI**: Menus críticos (`Configurações`, `Backup`, `Logs`) são removidos da barra lateral para não-administradores.
- **Proteção de Funções (Trava Lógica)**: Verificação de `currentUserRole` em todas as funções administrativas (`openConfigModal`, `deleteUser`, etc.) para impedir execução via console.
- **Gestão de Sessão Segura**: Limpeza total de tokens no `localStorage` e reset de variáveis de estado durante o logout.
- **Proteção de Credenciais**: Scripts de manutenção e chaves de API sensíveis isolados em diretórios ignorados pelo controle de versão.

### 8.3. Auditoria e Verificação
- Testes de intrusão realizados para validar a eficácia do bloqueio de UI e o isolamento de funções administrativas.
- Screenshots de auditoria capturados para demonstrar a conformidade da barra lateral protegida.
