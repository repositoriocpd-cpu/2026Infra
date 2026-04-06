// Script de inicialização e funções auxiliares
// Este arquivo é carregado após o index.html e fornece funções base

console.log('=== SCRIPT INITIALIZING v2.0 ===');

// *** MENU TOGGLE ***
window.toggleMenu = function () {
    var sideMenu = document.getElementById('side-menu');
    var overlay = document.getElementById('overlay');
    if (!sideMenu || !overlay) return;
    sideMenu.classList.toggle('open');
    overlay.classList.toggle('visible');
    if (!sideMenu.classList.contains('open')) {
        document.querySelectorAll('.submenu').forEach(function (sub) { sub.classList.remove('open'); });
        document.querySelectorAll('.has-submenu').forEach(function (link) { link.classList.remove('active'); });
    }
};

window.closeAllModals = function () {
    var ids = ['accessibility-modal', 'cookie-modal', 'processControlModal', 'processConfigModal', 'processHistoryModal', 'remanejamento-modal', 'comments-modal', 'userManagementModal', 'processDetailsModal', 'history-modal', 'infoModal', 'confirm-modal', 'statusSummaryModal'];
    ids.forEach(function (id) {
        var m = document.getElementById(id);
        if (m) { m.classList.remove('visible'); m.style.display = 'none'; }
    });
    var overlay = document.getElementById('overlay');
    var sideMenu = document.getElementById('side-menu');
    if (overlay) { overlay.classList.remove('visible'); overlay.style.display = 'none'; }
    if (sideMenu) sideMenu.classList.remove('open');
};

window.closeModal = function (id) {
    var m = document.getElementById(id);
    if (m) { m.classList.remove('visible'); m.style.display = 'none'; }
};

// Config e Estado Global
var SUPABASE_URL = '___SUPABASE_URL___';
var SUPABASE_KEY = '___SUPABASE_KEY___';

window.supabase = window.supabase || {};
if (window.supabase.createClient) {
    try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized via createClient');
    } catch (e) {
        console.error('Supabase Client Error:', e);
    }
}
var supabase = window.supabaseClient;

window.state = {
    processes: [], suppliers: [], locations: [], objects: [],
    statuses: [], handlers: [], users: [], currentConfigType: ''
};
var statusChart, locationChart;

// Export utilities
window.formatCurrency = function (v) {
    const n = parseFloat(v);
    return isNaN(n) ? (v || '') : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

// Info Modal Functions
const infoContent = {
    faq: {
        title: '<i class="fas fa-question-circle"></i> Perguntas Frequentes',
        subtitle: 'Tire suas dúvidas sobre o sistema',
        content: `<div class="faq-container">
                    <details class="faq-item"><summary>Como faço para acessar o sistema?</summary><p>Utilize seu e-mail institucional (seu.nome@edu.itaguai.rj.gov.br) e a senha cadastrada pela equipe de TI para fazer login.</p></details>
                    <details class="faq-item"><summary>Esqueci minha senha, o que devo fazer?</summary><p>Entre em contato com o suporte técnico através do e-mail cpd@itaguai.rj.gov.br ou pelo ramal 2222.</p></details>
                    <details class="faq-item"><summary>Quais navegadores são suportados?</summary><p>O sistema funciona melhor no Google Chrome (versão 90+), Mozilla Firefox (versão 88+), Microsoft Edge e Safari. Recomendamos sempre manter o navegador atualizado.</p></details>
                    <details class="faq-item"><summary>Como solicito um novo usuário para o sistema?</summary><p>Preencha o formulário de solicitação de acesso disponível no menu "Perfil" > "Solicitar Acesso" e aguarde a aprovação do seu coordenador.</p></details>
                    <details class="faq-item"><summary>Quais documentos são necessários para iniciar um processo de pagamento?</summary><p>Você precisará de: nota fiscal/fatura, relatório de execução, certidões atualizadas (federal, estadual, municipal e FGTS), e autorização do ordenador de despesas.</p></details>
                    <details class="faq-item"><summary>Como acompanhar o status do meu processo?</summary><p>Na tela inicial, visualize a seção "Meus Processos" ou utilize a função de busca por número de processo para verificar o status em tempo real.</p></details>
                    <details class="faq-item"><summary>O que significa cada status do processo?</summary><p><strong>Pendente:</strong> Aguardando análise | <strong>Em Análise:</strong> Being avaliado pela chefia | <strong>Aprovado:</strong> Liberado para pagamento | <strong>Reprovado:</strong> Necesita correção | <strong>Pago:</strong> Processo concluído</p></details>
                    <details class="faq-item"><summary>Como funciona a aprovação em cadeia?</summary><p>Os processos passam por níveis de aprovação: Solicitante → Coordenador → Diretor → Ordenador de Despesas. Cada aprovador recebe notificação por e-mail.</p></details>
                    <details class="faq-item"><summary>Posso editar um processo após enviá-lo?</summary><p>Não. Após o envio, o processo fica bloqueado para edição. Caso precise alterar algo, solicite a devolução ao status "Pendente" através do seu coordenador.</p></details>
                    <details class="faq-item"><summary>Como gerar relatórios do sistema?</summary><p>Acesse o menu "Relatórios" no painel lateral. Você pode filtrar por período, tipo de processo, status e unidade executora.</p></details>
                    <details class="faq-item"><summary>O sistema possui aplicativo móvil?</summary><p>No momento, o sistema é web e responsivo, ou seja, pode ser acessado via navegador em tablets e smartphones. Em breve teremos aplicativo nativo.</p></details>
                    <details class="faq-item"><summary>Como reportar um problema técnico?</summary><p>Clique em "Ajuda" no menu superior e selecione "Reportar Problema" ou envie um e-mail para suporte@itaguai.rj.gov.br com prints da tela.</p></details>
                    <details class="faq-item"><summary>Quais são os prazos para aprovação de processos?</summary><p>Prazos estimado: Coordenação (2 dias), Diretoria (3 dias), Ordenador (2 dias). Processos urgentes podem ser solicitados com justificativa.</p></details>
                    <details class="faq-item"><summary>Posso delegar minha aprovação para outro usuário?</summary><p>Sim, entre em "Perfil" > "Delegar Aprovações" e selecione um substituto temporário. A delegação tem validade máxima de 30 dias.</p></details>
                </div>`
    },
    manual: {
        title: '<i class="fas fa-book-open"></i> Manual do Usuário',
        subtitle: 'Guia completo de utilização do sistema',
        content: `<div class="manual-container">
                    <div class="manual-section">
                        <h3><i class="fas fa-sign-in-alt"></i> 1. Acesso ao Sistema</h3>
                        <p>O Sistema de Gestão de Pagamentos é acessado através do endereço <strong>sgep.edu.itaguai.rj.gov.br</strong>. Utilize seu e-mail institucional e senha fornecida pela equipe de TI.</p>
                        <ul>
                            <li><strong>Primeiro acesso:</strong> Ao fazer login pela primeira vez, você será solicitado a alterar sua senha.</li>
                            <li><strong>Session timeout:</strong> Por segurança, a sessão expira após 30 minutos de inatividade.</li>
                            <li><strong>Múltiplos logins:</strong> Não é permitido estar logado em múltiplos dispositivos simultaneamente.</li>
                        </ul>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-home"></i> 2. Painel Inicial (Dashboard)</h3>
                        <p>Ao acessar o sistema, você verá o painel principal com:</p>
                        <ul>
                            <li><strong>KPIs:</strong> Total de processos, pendentes, em análise, pagos e reprovados.</li>
                            <li><strong>Gráficos:</strong> Evolução mensal de processos e distribuição por unidade.</li>
                            <li><strong>Lista de processos:</strong> Seus processos recentes com status e ações rápidas.</li>
                            <li><strong>Filtros:</strong> Busque por número, data, tipo, status ou unidade executora.</li>
                        </ul>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-plus-circle"></i> 3. Criando um Novo Processo</h3>
                        <ol>
                            <li>Clique no botão <strong>"Novo Processo"</strong> no canto superior direito.</li>
                            <li>Selecione o <strong>tipo de despesa</strong> (suprimentos, serviços, obras, etc.).</li>
                            <li>Preencha os dados obrigatórios:
                                <ul>
                                    <li>CNPJ/CPF do credor</li>
                                    <li>Descrição do objeto</li>
                                    <li>Valor total</li>
                                    <li>Data de vencimento</li>
                                    <li>Unidade executora</li>
                                </ul>
                            </li>
                            <li>Faça o <strong>upload dos documentos</strong> necessários (nota fiscal, autorização, etc.).</li>
                            <li>Clique em <strong>"Salvar Rascunho"</strong> ou <strong>"Enviar para Aprovação"</strong>.</li>
                        </ol>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-check-double"></i> 4. Fluxo de Aprovação</h3>
                        <p>Os processos seguem uma cadeia de aprovação sequencial:</p>
                        <div class="approval-flow">
                            <span class="flow-step">1. Solicitante</span>
                            <span class="flow-arrow">→</span>
                            <span class="flow-step">2. Coordenador</span>
                            <span class="flow-arrow">→</span>
                            <span class="flow-step">3. Diretor</span>
                            <span class="flow-arrow">→</span>
                            <span class="flow-step">4. Ordenador</span>
                        </div>
                        <p>Cada aprovador recebe <strong>notificação por e-mail</strong> e pode:</p>
                        <ul>
                            <li><strong>Aprovar:</strong> Encaminha para o próximo nível.</li>
                            <li><strong>Reprovar:</strong> Devolve ao solicitante com motivo.</li>
                            <li><strong>Solicitar Informação:</strong> Pede esclarecimentos sem devolver o processo.</li>
                        </ul>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-search"></i> 5. Busca e Filtros</h3>
                        <p>Use a barra de busca para encontrar processos por:</p>
                        <ul>
                            <li>Número do processo</li>
                            <li>Nome/Razão social do credor</li>
                            <li>CNPJ/CPF</li>
                            <li>Descrição do objeto</li>
                        </ul>
                        <p>Os <strong>filtros avançados</strong> permitem combinar:</p>
                        <ul>
                            <li>Período de data</li>
                            <li>Tipo de despesa</li>
                            <li>Status atual</li>
                            <li>Unidade executora</li>
                            <li>Valor mínimo/máximo</li>
                        </ul>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-file-pdf"></i> 6. Anexando Documentos</h3>
                        <p>Formatos aceitos: <strong>PDF, JPG, PNG</strong> (tamanho máx: 10MB por arquivo).</p>
                        <p>Documentos obrigatórios por tipo de despesa:</p>
                        <table class="manual-table">
                            <tr><th>Tipo</th><th>Documentos</th></tr>
                            <tr><td>Suprimentos</td><td>Nota fiscal, relatório de compras</td></tr>
                            <tr><td>Serviços</td><td>Nota fiscal, contrato, medição</td></tr>
                            <tr><td>Obras</td><td>Nota fiscal, cronograma, ART</td></tr>
                            <tr><td>Diárias</td><td>Portaria, relatório de viagem</td></tr>
                        </table>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-chart-bar"></i> 7. Relatórios</h3>
                        <p>Gere relatórios em <strong>PDF</strong> ou <strong>Excel</strong> através do menu "Relatórios".</p>
                        <ul>
                            <li><strong>Por período:</strong> Defina data inicial e final.</li>
                            <li><strong>Por unidade:</strong> Filtre por secretaria/departamento.</li>
                            <li><strong>Por status:</strong> Inclua apenas processos específicos.</li>
                            <li><strong>Consolidado:</strong> Resume valores por categoria.</li>
                        </ul>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-user-cog"></i> 8. Perfil do Usuário</h3>
                        <p>No menu "Perfil", você pode:</p>
                        <ul>
                            <li><strong>Alterar senha:</strong> Mínimo 8 caracteres com letras e números.</li>
                            <li><strong>Atualizar dados:</strong> Telefone, unidade, cargo.</li>
                            <li><strong>Delegar aprovações:</strong> Designar substituto temporário.</li>
                            <li><strong>Notificações:</strong> Configurar alertas por e-mail.</li>
                            <li><strong>Histórico de acesso:</strong> Ver últimos logins.</li>
                        </ul>
                    </div>
                    <div class="manual-section">
                        <h3><i class="fas fa-life-ring"></i> 9. Suporte e Ajuda</h3>
                        <p>Precisa de ajuda? Utilize os canais de suporte:</p>
                        <ul>
                            <li><strong>E-mail:</strong> cpdinfra@edu.@itaguai.rj.gov.br</li>
                            <li><strong>Ramal:</strong> 2905 (CPD)</li>
                            <li><strong>Presencial:</strong> Centro de Processamento de Dados - Prédio admin.</li>
                            <li><strong>Horário:</strong> Segunda a sexta, 8h às 17h.</li>
                        </ul>
                    </div>
                </div>`
    },
    termos: {
        title: '<i class="fas fa-file-contract"></i> Política de Uso',
        subtitle: 'Termos e condições de uso do sistema',
        content: '<p>O acesso é restrito a servidores municipais devidamente autorizados.</p>'
    }
};

window.openInfoModal = function (route) {
    const modal = document.getElementById('infoModal');
    const titleEl = document.getElementById('infoModalTitle');
    const subtitleEl = document.getElementById('infoModalSubtitle');
    const contentEl = document.getElementById('infoModalContent');

    const content = infoContent[route];
    if (content) {
        titleEl.innerHTML = content.title;
        subtitleEl.innerText = content.subtitle;
        contentEl.innerHTML = content.content;
        modal.classList.add('visible');
        modal.style.display = 'flex';
    }
};

// Setup click handlers for data-route links
document.querySelectorAll('[data-route]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const route = this.getAttribute('data-route');
        window.openInfoModal(route);
    });
});

// End of 2026_script.js
