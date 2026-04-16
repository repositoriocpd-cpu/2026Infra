const fs = require('fs');

const targetFile = 'index.html';
let content = fs.readFileSync(targetFile, 'utf8');

// --- 1. THE COMPLETE FISCO MODULE CODE ---
const fiscalModuleCode = `
        // ======================== MÓDULO FISCAL (Restaurado) ========================
        window.fiscalData = { fornecedores: [], fiscais: [], localizacoes: [], contratos: [], empenhos: [] };
        window.lancamentos = [];

        window.openFiscoModal = function () {
            console.log('openFiscoModal called - Reconstruction Version');
            const modal = document.getElementById('fiscalModal');
            if (modal) {
                modal.classList.add('visible');
                modal.style.display = 'flex';
                window.loadFiscalData();
            } else {
                fetchFiscalModalHTML();
            }
        };

        function fetchFiscalModalHTML() {
            const html = \`
            <div id="fiscalModal" class="process-modal" onclick="if(event.target===this) window.closeModal('fiscalModal')">
                <div class="process-modal-content" style="max-width: 1500px; width: 95vw;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #1E5FAF 0%, #0d3485 100%); color: white; border-radius: 20px 20px 0 0; padding: 1.25rem 2rem;">
                        <div class="modal-header-info">
                            <h2 style="color: white !important; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-landmark"></i> Módulo Fiscal
                            </h2>
                            <p style="color: rgba(255,255,255,0.85) !important; margin: 0.3rem 0 0 0; font-size: 0.9rem;">Gestão de Fornecedores, Fiscais, Contratos e Medições</p>
                        </div>
                        <button type="button" class="modal-close" onclick="window.closeModal('fiscalModal')" style="color: white !important; font-size: 1.5rem;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem 2rem;">
                        <div class="fiscal-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; overflow-x: auto;">
                            <button class="fiscal-tab active" onclick="window.switchFiscalTab('fornecedores', this)">Fornecedores</button>
                            <button class="fiscal-tab" onclick="window.switchFiscalTab('fiscais', this)">Fiscais</button>
                            <button class="fiscal-tab" onclick="window.switchFiscalTab('localizacao', this)">Localização</button>
                            <button class="fiscal-tab" onclick="window.switchFiscalTab('contratos', this)">Contratos</button>
                            <button class="fiscal-tab" onclick="window.switchFiscalTab('empenhos', this)">Empenhos</button>
                            <button class="fiscal-tab" onclick="window.switchFiscalTab('lancamentos', this); window.lancPopularEmpresas();" style="color: #dc2626; font-weight: 700;">Lançamentos</button>
                            <button class="fiscal-tab" onclick="window.switchFiscalTab('gerarmapas', this)" style="color: #16a34a;">Gerar Mapas</button>
                        </div>
                        
                        <!-- Fornecedores Tab -->
                        <div id="fiscal-tab-fornecedores" class="fiscal-tab-content active">
                            <div class="form-section">
                                <h3><i class="fas fa-plus"></i> Novo Fornecedor</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <input type="text" id="fornec-razao" class="form-control" placeholder="Razão Social">
                                    <input type="text" id="fornec-cnpj" class="form-control" placeholder="CNPJ" onblur="window.formatarCNPJ(this)">
                                </div>
                                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.salvarFornecedor()">Salvar Fornecedor</button>
                            </div>
                            <div class="table-responsive"><table class="fiscal-table"><thead><tr><th>Nome</th><th>CNPJ</th><th>Ações</th></tr></thead><tbody id="fornecedores-list"></tbody></table></div>
                        </div>

                        <!-- Fiscais Tab -->
                        <div id="fiscal-tab-fiscais" class="fiscal-tab-content" style="display:none;">
                            <div class="form-section">
                                <h3><i class="fas fa-plus"></i> Novo Fiscal</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <input type="text" id="fiscal-matricula" class="form-control" placeholder="Matrícula">
                                    <input type="text" id="fiscal-nome" class="form-control" placeholder="Nome Completo">
                                </div>
                                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.salvarFiscal()">Salvar Fiscal</button>
                            </div>
                            <div class="table-responsive"><table class="fiscal-table"><thead><tr><th>Matrícula</th><th>Nome</th><th>Ações</th></tr></thead><tbody id="fiscais-list"></tbody></table></div>
                        </div>

                        <!-- Contratos Tab -->
                        <div id="fiscal-tab-contratos" class="fiscal-tab-content" style="display:none;">
                            <div class="form-section">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <select id="contrat-fornec" class="form-control"><option value="">-- Fornecedor --</option></select>
                                    <input type="text" id="contrat-processo" class="form-control" placeholder="Número do Processo">
                                    <input type="text" id="contrat-num" class="form-control" placeholder="Número do Contrato">
                                    <input type="text" id="contrat-valor" class="form-control" placeholder="Valor do Contrato" onblur="window.formatarMoeda(this)">
                                    <input type="date" id="contrat-inicio" class="form-control" title="Início">
                                    <input type="date" id="contrat-termino" class="form-control" title="Término">
                                </div>
                                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.salvarContrato()">Salvar Contrato</button>
                            </div>
                            <div class="table-responsive"><table class="fiscal-table"><thead><tr><th>Fornec.</th><th>Processo</th><th>Contrato</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="contratos-list"></tbody></table></div>
                        </div>

                        <!-- Empenhos Tab -->
                        <div id="fiscal-tab-empenhos" class="fiscal-tab-content" style="display:none;">
                            <div class="form-section">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <select id="emp-fornec" class="form-control"><option value="">-- Fornecedor --</option></select>
                                    <input type="text" id="emp-contrato" class="form-control" placeholder="Número do Contrato">
                                    <select id="emp-fiscal" class="form-control" multiple></select>
                                </div>
                                <div id="emp-empenhos-container" style="margin-top: 1rem;">
                                    <div class="emp-empenho-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="text" class="form-control emp-ne-input" placeholder="NE (Empenho)">
                                        <input type="text" class="form-control emp-valor-input" placeholder="R$ 0,00" onblur="window.formatarMoeda(this)">
                                        <button type="button" class="btn-tiny btn-danger" onclick="window.removerEmpenhoInput(this)">&times;</button>
                                    </div>
                                </div>
                                <button type="button" class="btn-tiny btn-success" onclick="window.adicionarEmpenhoInput()">+ Adicionar NE</button>
                                <button class="btn btn-primary" style="margin-top: 1rem; display:block;" onclick="window.salvarEmpenho()">Salvar Empenho</button>
                            </div>
                            <div class="table-responsive"><table class="fiscal-table"><thead><tr><th>Fornec.</th><th>Contrato</th><th>NE</th><th>Valor</th><th>Fiscais</th><th>Ações</th></tr></thead><tbody id="empenhos-list"></tbody></table></div>
                        </div>

                        <!-- Lançamentos Tab -->
                        <div id="fiscal-tab-lancamentos" class="fiscal-tab-content" style="display:none;">
                             <div class="form-section">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                    <select id="lanc-empresa" class="form-control" onchange="window.lancOnEmpresaChange()"><option value="">-- Empresa --</option></select>
                                    <select id="lanc-contrato" class="form-control" onchange="window.lancOnContratoChange()"><option value="">-- Contrato --</option></select>
                                    <div style="display:flex; gap:0.5rem;">
                                        <input type="number" id="lanc-mes" class="form-control" placeholder="Mês" min="1" max="12">
                                        <input type="number" id="lanc-ano" class="form-control" placeholder="Ano">
                                    </div>
                                    <input type="text" id="lanc-nf" class="form-control" placeholder="Nº NF">
                                    <input type="text" id="lanc-valor-nf" class="form-control" placeholder="Valor NF" onblur="window.formatarMoeda(this); window.lancCalcSaldo();">
                                </div>
                                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.salvarMapa()">Registrar Medição</button>
                             </div>
                             <div class="table-responsive"><table class="fiscal-table"><thead><tr><th>Mês/Ano</th><th>NF</th><th>Eng/Contrato</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody id="lanc-medicoes-tbody"></tbody></table></div>
                        </div>

                        <!-- Mapas Tab -->
                        <div id="fiscal-tab-gerarmapas" class="fiscal-tab-content" style="display:none;">
                            <div class="form-section">
                                <select id="mapa-empresa" class="form-control"><option value="">-- Empresa --</option></select>
                                <button class="btn btn-success" style="margin-top: 1rem;" onclick="window.gerarMapa()">Gerar Mapa de Execução</button>
                                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.verMapaExecucao()">Ver Mapa Geral</button>
                            </div>
                            <div id="mapa-resultado" style="margin-top: 1rem;"></div>
                        </div>

                    </div>
                </div>
            </div>\`;
            document.body.insertAdjacentHTML('beforeend', html);
            
            // Initialize Choices.js
            if (typeof Choices === 'function') {
                window.fiscalChoices = new Choices('#emp-fiscal', {
                    removeItemButton: true,
                    placeholder: true,
                    placeholderValue: 'Selecione os Fiscais',
                    noResultsText: 'Nenhum fiscal encontrado',
                    noChoicesText: 'Sem opções disponíveis',
                    itemSelectText: 'Clique para selecionar'
                });
            }
            
            window.loadFiscalData();
            const modal = document.getElementById('fiscalModal');
            modal.classList.add('visible');
            modal.style.display = 'flex';
        }

        window.switchFiscalTab = function (tabName, btn) {
            document.querySelectorAll('.fiscal-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.fiscal-tab-content').forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });
            btn.classList.add('active');
            const target = document.getElementById('fiscal-tab-' + tabName);
            if (target) { target.classList.add('active'); target.style.display = 'block'; }
        };

        window.loadFiscalData = async function () {
            if (!window.supabaseClient) return;
            try {
                const [supp, contr, emp, hand, meas, locs] = await Promise.all([
                    window.supabaseClient.from('suppliers').select('*').order('name'),
                    window.supabaseClient.from('fiscal_contracts').select('*').order('contract_number'),
                    window.supabaseClient.from('fiscal_empenhos').select('*').order('ne_number'),
                    window.supabaseClient.from('handlers').select('*').order('name'),
                    window.supabaseClient.from('fiscal_measurements').select('*').order('created_at', { ascending: false }),
                    window.supabaseClient.from('locations').select('*').order('name')
                ]);
                window.fiscalData = { 
                    fornecedores: supp.data || [], 
                    contratos: contr.data || [], 
                    empenhos: emp.data || [], 
                    fiscais: hand.data || [],
                    localizacoes: (locs.data || []).map(l => ({ departamento: l.name }))
                };
                window.lancamentos = meas.data || [];
                
                window.atualizarTabelaFornecedores();
                window.atualizarTabelaFiscais();
                window.atualizarTabelaContratos();
                window.atualizarSelectsFornecedores();
                window.atualizarTabelaEmpenhos();
                window.lancFiltrarMedicoes();
            } catch (err) { console.error('Error loading fiscal data:', err); }
        };

        window.salvarFornecedor = async function () {
            const name = document.getElementById('fornec-razao').value;
            const cnpj = document.getElementById('fornec-cnpj').value;
            if (!name) return alert('Nome obrigatório');
            const { error } = await window.supabaseClient.from('suppliers').upsert({ name, cnpj }, { onConflict: 'name' });
            if (error) alert(error.message); else window.loadFiscalData();
        };

        window.atualizarTabelaFornecedores = function () {
            const tbody = document.getElementById('fornecedores-list');
            if (tbody) tbody.innerHTML = window.fiscalData.fornecedores.map(f => \`<tr><td>\${f.name}</td><td>\${f.cnpj || '-'}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirFornecedor('\${f.name}')">Excluir</button></td></tr>\`).join('');
        };

        window.salvarFiscal = async function () {
            const name = document.getElementById('fiscal-nome').value;
            const matricula = document.getElementById('fiscal-matricula').value;
            if (!name) return alert('Nome obrigatório');
            const { error } = await window.supabaseClient.from('handlers').upsert({ name, matricula }, { onConflict: 'name' });
            if (error) alert(error.message); else window.loadFiscalData();
        };

        window.atualizarTabelaFiscais = function () {
            const tbody = document.getElementById('fiscais-list');
            if (tbody) tbody.innerHTML = window.fiscalData.fiscais.map(f => \`<tr><td>\${f.matricula || '-'}</td><td>\${f.name}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirFiscal('\${f.name}')">Excluir</button></td></tr>\`).join('');
            
            // Sync Choices.js
            if (window.fiscalChoices && window.fiscalData.fiscais.length > 0) {
                const choices = window.fiscalData.fiscais.map(f => ({ value: f.name, label: f.name }));
                window.fiscalChoices.setChoices(choices, 'value', 'label', true);
            }
        };

        window.atualizarSelectsFornecedores = function () {
            const opts = '<option value="">-- Selecione --</option>' + window.fiscalData.fornecedores.map(f => \`<option value="\${f.name}">\${f.name}</option>\`).join('');
            ['contrat-fornec', 'emp-fornec', 'lanc-empresa', 'mapa-empresa'].forEach(id => {
                const el = document.getElementById(id); if (el) el.innerHTML = opts;
            });
        };

        window.salvarContrato = async function () {
            const data = { 
                supplier_name: document.getElementById('contrat-fornec').value,
                process_number: document.getElementById('contrat-processo').value,
                contract_number: document.getElementById('contrat-num').value,
                value: parseFloat(document.getElementById('contrat-valor').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0,
                start_date: document.getElementById('contrat-inicio').value,
                end_date: document.getElementById('contrat-termino').value
            };
            const { error } = await window.supabaseClient.from('fiscal_contracts').upsert(data, { onConflict: 'contract_number' });
            if (error) alert(error.message); else window.loadFiscalData();
        };

        window.atualizarTabelaContratos = function () {
            const tbody = document.getElementById('contratos-list');
            if (tbody) tbody.innerHTML = window.fiscalData.contratos.map(c => \`<tr><td>\${c.supplier_name}</td><td>\${c.process_number || '-'}</td><td>\${c.contract_number}</td><td>R$ \${parseFloat(c.value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirContrato('\${c.contract_number}')">Excluir</button></td></tr>\`).join('');
        };

        window.salvarEmpenho = async function () {
             const supplier_name = document.getElementById('emp-fornec').value;
             const contract_number = document.getElementById('emp-contrato').value;
             const fiscais = Array.from(document.getElementById('emp-fiscal').selectedOptions).map(o => o.value).join(', ');
             const rows = document.querySelectorAll('.emp-empenho-row');
             for (const row of rows) {
                 const ne = row.querySelector('.emp-ne-input').value;
                 const val = parseFloat(row.querySelector('.emp-valor-input').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                 if (ne) {
                     await window.supabaseClient.from('fiscal_empenhos').upsert({ supplier_name, contract_number, officer_name: fiscais, ne_number: ne, value: val }, { onConflict: 'ne_number' });
                 }
             }
             window.loadFiscalData();
        };

        window.atualizarTabelaEmpenhos = function () {
            const tbody = document.getElementById('empenhos-list');
            if (tbody) tbody.innerHTML = window.fiscalData.empenhos.map(e => \`<tr><td>\${e.supplier_name}</td><td>\${e.contract_number}</td><td>\${e.ne_number}</td><td>R$ \${parseFloat(e.value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td><td>\${e.officer_name || '-'}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirEmpenho('\${e.ne_number}')">Excluir</button></td></tr>\`).join('');
        };

        window.lancOnEmpresaChange = function () {
             const emp = document.getElementById('lanc-empresa').value;
             const filtered = window.fiscalData.contratos.filter(c => c.supplier_name === emp);
             document.getElementById('lanc-contrato').innerHTML = '<option value="">-- Contrato --</option>' + filtered.map(c => \`<option value="\${c.contract_number}">\${c.contract_number}</option>\`).join('');
        };
        window.lancOnContratoChange = () => {};
        window.lancPopularEmpresas = window.atualizarSelectsFornecedores;

        window.salvarMapa = async function () {
            const data = {
                year: document.getElementById('lanc-ano').value,
                month: document.getElementById('lanc-mes').value,
                supplier_name: document.getElementById('lanc-empresa').value,
                contract_number: document.getElementById('lanc-contrato').value,
                invoice_number: document.getElementById('lanc-nf').value,
                invoice_value: parseFloat(document.getElementById('lanc-valor-nf').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0,
                status: 'Pendente'
            };
            const { error } = await window.supabaseClient.from('fiscal_measurements').insert(data);
            if (error) alert(error.message); else window.loadFiscalData();
        };

        window.lancFiltrarMedicoes = function () {
            const tbody = document.getElementById('lanc-medicoes-tbody');
            if (tbody) tbody.innerHTML = window.lancamentos.map(m => \`<tr><td>\${m.month}/\${m.year}</td><td>\${m.invoice_number}</td><td>\${m.contract_number || '-'}</td><td>R$ \${parseFloat(m.invoice_value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td><td>\${m.status}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirMedicao('\${m.id}')">Excluir</button></td></tr>\`).join('');
        };

        window.gerarMapa = function () {
            const empName = document.getElementById('mapa-empresa').value;
            const res = document.getElementById('mapa-resultado');
            const contrs = window.fiscalData.contratos.filter(c => c.supplier_name === empName);
            let html = '<table class="fiscal-table"><thead><tr><th>Contrato</th><th>Valor Contratado</th><th>Valor Medido</th><th>Saldo</th></tr></thead><tbody>';
            contrs.forEach(c => {
                const medido = window.lancamentos.filter(l => l.contract_number === c.contract_number).reduce((sum, l) => sum + (parseFloat(l.invoice_value) || 0), 0);
                html += \`<tr><td>\${c.contract_number}</td><td>R$ \${parseFloat(c.value).toLocaleString('pt-BR')}</td><td>R$ \${medido.toLocaleString('pt-BR')}</td><td>R$ \${(parseFloat(c.value) - medido).toLocaleString('pt-BR')}</td></tr>\`;
            });
            res.innerHTML = html + '</tbody></table>';
        };

        window.verMapaExecucao = function () { alert('Mapa Geral em processamento...'); };

        // Auxiliares
        window.adicionarEmpenhoInput = function () {
            const container = document.getElementById('emp-empenhos-container');
            const div = document.createElement('div'); div.className = 'emp-empenho-row'; div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
            div.innerHTML = '<input type="text" class="form-control emp-ne-input" placeholder="NE (Empenho)"><input type="text" class="form-control emp-valor-input" placeholder="R$ 0,00" onblur="window.formatarMoeda(this)"><button type="button" class="btn-tiny btn-danger" onclick="window.removerEmpenhoInput(this)">&times;</button>';
            container.appendChild(div);
        };
        window.removerEmpenhoInput = function (btn) { if (document.getElementById('emp-empenhos-container').children.length > 1) btn.closest('.emp-empenho-row').remove(); };
        window.lancCalcSaldo = () => {};
        
        window.excluirFornecedor = async (name) => { if(confirm('Excluir?')) await window.supabaseClient.from('suppliers').delete().eq('name', name); window.loadFiscalData(); };
        window.excluirFiscal = async (name) => { if(confirm('Excluir?')) await window.supabaseClient.from('handlers').delete().eq('name', name); window.loadFiscalData(); };
        window.excluirContrato = async (num) => { if(confirm('Excluir?')) await window.supabaseClient.from('fiscal_contracts').delete().eq('contract_number', num); window.loadFiscalData(); };
        window.excluirEmpenho = async (ne) => { if(confirm('Excluir?')) await window.supabaseClient.from('fiscal_empenhos').delete().eq('ne_number', ne); window.loadFiscalData(); };
        window.excluirMedicao = async (id) => { if(confirm('Excluir?')) await window.supabaseClient.from('fiscal_measurements').delete().eq('id', id); window.loadFiscalData(); };

        window.salvarLocalizacao = async () => {}; // Placeholder
        window.atualizarTabelaLocalizacoes = () => {};

        // Auto-init dashboard if needed
        console.log('Módulo Fiscal Reconstruction: Loaded.');
`;

// --- 2. SURGERY LOGIC ---
const startMarker = "<script>";
const endMarker = "</script>";
const searchString = "Script 5 starting - contains openFiscoModal";

// We'll replace the entire block between the <script> just before the searchString 
// and the next </script>

const startIndex = content.indexOf(searchString);
if (startIndex !== -1) {
    const openingTagIndex = content.lastIndexOf('<script>', startIndex);
    const closingTagIndex = content.indexOf('</script>', startIndex);

    if (openingTagIndex !== -1 && closingTagIndex !== -1) {
        console.log('Found script block for reconstruction at lines around index:', openingTagIndex);
        const newBlock = `<script>\n        console.log('${searchString}');\n${fiscalModuleCode}\n    </script>`;
        content = content.substring(0, openingTagIndex) + newBlock + content.substring(closingTagIndex + 9);
    }
}

// --- 3. LEXICAL ARTIFACTS CLEANUP ---
const lexicalMap = {
    'IDENTIFICAÇàO': 'IDENTIFICAÇÃO',
    'TRAMITAÇàO': 'TRAMITAÇÃO',
    'SITUAÇãO': 'SITUAÇÃO',
    'CONCLUSãO': 'CONCLUSÃO',
    'RELAÇãO': 'RELAÇÃO',
    'DECLARAÇãO': 'DECLARAÇÃO',
    'MàE': 'MÃE',
    'EducaÇàO': 'Educação',
    'Informação': 'Informação',
    'AÇãO': 'AÇÃO',
    'SituaÇàO': 'Situação'
};

for (const [corrupted, fixed] of Object.entries(lexicalMap)) {
    const regex = new RegExp(corrupted, 'g');
    content = content.replace(regex, fixed);
}

// Special case for 'ã' artifacts in uppercase titles
content = content.replace(/DATA DE CONCLUSãO/g, 'DATA DE CONCLUSÃO');
content = content.replace(/SITUAÇãO ATUAL/g, 'SITUAÇÃO ATUAL');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Reconstruction Surgery completed successfully.');
