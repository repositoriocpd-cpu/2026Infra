const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.cwd(), 'index.html');
let content = fs.readFileSync(targetFile, 'utf8');

console.log('--- STARTING FINAL SYSTEM STABILIZATION ---');

// 1. Fixing the Infinite Loop in initApp
// We find: if (!window.supabaseClient) { console.warn(...); setTimeout(window.initApp, 500); }
// And we'll make sure it only retries if it's NOT already trying to init.
content = content.replace(/setTimeout\(window\.initApp, 500\);/g, 'if(!window._initRetries) window._initRetries=0; if(window._initRetries++ < 10) setTimeout(window.initApp, 1000); else console.error("Supabase fail.");');

// 2. Comprehensive Lexical Restoration (Mojibake)
const patterns = {
    'Ã§': 'ç',
    'Ã£': 'ã',
    'Ã©': 'é',
    'Ã¡': 'á',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ãª': 'ê',
    'Ãµ': 'õ',
    'Ã': 'à',
    'Âº': 'º',
    'ǜ': 'ão',
    'Ǹ': 'é',
    'à‡à•ES': 'ÇÕES',
    'à‡': 'Ç',
    'à•': 'Õ',
    'à³': 'ó',
    'à¡': 'á',
    'à©': 'é',
    'àª': 'ê',
    'àº': 'ú',
    'àµ': 'õ',
    'à€': 'À',
    'àO': 'ÃO',
    'Çã': 'ÇÃO',
    'Çà': 'ÇÃO',
    'ã ': 'ÃO ',
    'MǦs': 'Mês',
    'MàE': 'MÃE',
    'IDENTIFICAÇàO': 'IDENTIFICAÇÃO',
    'TRAMITAÇàO': 'TRAMITAÇÃO',
    'SITUAÇãO': 'SITUAÇÃO',
    'CONCLUSãO': 'CONCLUSÃO',
    'RELAÇãO': 'RELAÇÃO',
    'DECLARAÇãO': 'DECLARAÇÃO'
};

for (const [corrupted, fixed] of Object.entries(patterns)) {
    content = content.split(corrupted).join(fixed);
}

// Global case fix for labels
content = content.replace(/SITUAÇãO ATUAL/g, 'SITUAÇÃO ATUAL');
content = content.replace(/DATA DE CONCLUSãO/g, 'DATA DE CONCLUSÃO');
content = content.replace(/RELAÇãO DE ITENS/g, 'RELAÇÃO DE ITENS');

// 3. Consolidate FISCO Module
// I will ensure window.openFiscoModal is defined once and properly.
// I'll search for any old definitions and remove them.
const openFiscoCode = `
        // === Módulo Fiscal (RESTAURADO) ===
        window.openFiscoModal = function () {
            console.log('openFiscoModal called - Stable Version');
            const modal = document.getElementById('fiscalModal');
            if (modal) {
                modal.classList.add('visible');
                modal.style.display = 'flex';
                window.loadFiscalData();
            } else {
                injectFiscalModal();
            }
        };

        function injectFiscalModal() {
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
                        <div id="fiscal-tab-fornecedores" class="fiscal-tab-content active"><div class="form-section"><h3>Novo Fornecedor</h3><input id="fornec-razao" placeholder="Razão"><input id="fornec-cnpj" placeholder="CNPJ"><button onclick="window.salvarFornecedor()">Salvar</button></div><table class="fiscal-table"><tbody id="fornecedores-list"></tbody></table></div>
                        <div id="fiscal-tab-fiscais" class="fiscal-tab-content" style="display:none;"><div class="form-section"><h3>Novo Fiscal</h3><input id="fiscal-nome" placeholder="Nome"><button onclick="window.salvarFiscal()">Salvar</button></div><table class="fiscal-table"><tbody id="fiscais-list"></tbody></table></div>
                        <div id="fiscal-tab-contratos" class="fiscal-tab-content" style="display:none;"><div class="form-section"><select id="contrat-fornec"></select><input id="contrat-num" placeholder="Nº Contrato"><button onclick="window.salvarContrato()">Salvar</button></div><table class="fiscal-table"><tbody id="contratos-list"></tbody></table></div>
                        <div id="fiscal-tab-empenhos" class="fiscal-tab-content" style="display:none;"><div class="form-section"><select id="emp-fornec"></select><select id="emp-fiscal" multiple></select><button onclick="window.salvarEmpenho()">Salvar</button></div><table class="fiscal-table"><tbody id="empenhos-list"></tbody></table></div>
                        <div id="fiscal-tab-lancamentos" class="fiscal-tab-content" style="display:none;"><div class="form-section"><select id="lanc-empresa"></select><input id="lanc-nf" placeholder="NF"><button onclick="window.salvarMapa()">Salvar</button></div><table class="fiscal-table"><tbody id="lanc-medicoes-tbody"></tbody></table></div>
                        <div id="fiscal-tab-gerarmapas" class="fiscal-tab-content" style="display:none;"><div id="mapa-resultado"></div></div>
                    </div>
                </div>
            </div>\`;
            document.body.insertAdjacentHTML('beforeend', html);
            if(typeof Choices === 'function') {
               window.fiscalChoices = new Choices('#emp-fiscal', { removeItemButton: true });
            }
            window.loadFiscalData();
            const m = document.getElementById('fiscalModal');
            m.classList.add('visible');
            m.style.display = 'flex';
        }
`;

// Replace the old openFiscoModal block
content = content.replace(/window\.openFiscoModal = function \(\) \{[\s\S]*?\}\;/m, openFiscoCode + ';');

// 4. Verification Check
if (!content.includes('</html>')) {
    content += '\n</body>\n</html>';
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('--- SYSTEM STABILIZED AND RESTORED ---');
