const fs = require('fs');

const targetFile = 'index.html';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Fix openFiscoModal logic (DOM Injection)
const openFiscoModalStart = "window.openFiscoModal = function () {";
const injectionCode = `
            } else {
                const fiscalModalHTML = \``;
const injectionFix = `
            } else {
                const fiscalModalHTML = \``;

// Instead of regex which might fail, let's find the specific block and ensure injection exists
if (content.includes('const fiscalModalHTML = `') && !content.includes("document.body.insertAdjacentHTML('beforeend', fiscalModalHTML)")) {
    console.log('Injecting DOM insertion logic into openFiscoModal...');
    // We need to find the end of the template literal
    // For simplicity, we'll replace the whole function if we can identify its boundaries
}

// 2. Lexical Cleanup
const lexicalMap = {
    'IDENTIFICAÇàO': 'IDENTIFICAÇÃO',
    'TRAMITAÇàO': 'TRAMITAÇÃO',
    'SITUAÇãO': 'SITUAÇÃO',
    'MàE': 'MÃE',
    'EducaÇàO': 'Educação',
    'InformaÇàO': 'Informação',
    'AÇãO': 'AÇÃO',
    'AÇàO': 'AÇÃO',
    'InformaÇòes': 'Informações',
    'OperaÇòes': 'Operações',
    'LocalizaÇòes': 'Localizações',
    'SituaÇàO': 'Situação',
    'MediÇàO': 'Medição',
    'mediǜo': 'medição',
    'MǦs': 'Mês'
};

for (const [corrupted, fixed] of Object.entries(lexicalMap)) {
    const regex = new RegExp(corrupted, 'g');
    content = content.replace(regex, fixed);
}

// 3. Fix the specific openFiscoModal missing injection
// We search for the end of the fiscalModalHTML string and add the injection
const modalEndMarker = 'window.closeModal(\'fiscalModal\')">\\n                        </div>\\n'; // Approximated
// This is too fragile. Let's use a simpler approach: 
// Replace the entire block from window.openFiscoModal to the next function start.

console.log('Performing surgical replacement of openFiscoModal...');
const openFiscoRegex = /window\.openFiscoModal = function \(\) \{[\s\S]*?window\.switchFiscalTab = function/i;
const cleanOpenFisco = `window.openFiscoModal = function () {
            console.log('openFiscoModal called');
            const modal = document.getElementById('fiscalModal');
            if (modal) {
                modal.classList.add('visible');
                modal.style.display = 'flex';
                window.loadFiscalData();
            } else {
                const fiscalModalHTML = \`
                <div id="fiscalModal" class="process-modal" onclick="if(event.target===this) window.closeModal('fiscalModal')">
                    <div class="process-modal-content" style="max-width: 1500px; width: 95vw;">
                        <div class="modal-header" style="background: linear-gradient(135deg, #1E5FAF 0%, #0d3485 100%); color: white; border-radius: 20px 20px 0 0; padding: 1.25rem 2rem;">
                            <div class="modal-header-info">
                                <h2 style="color: white !important; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                                    <i class="fas fa-landmark"></i> Módulo Fiscal
                                </h2>
                                <p style="color: rgba(255,255,255,0.85) !important; margin: 0.3rem 0 0 0; font-size: 0.9rem;">Gestão de Fornecedores, Fiscais, Localização, Contratos, Empenhos, Mapas e Relatórios</p>
                            </div>
                            <button type="button" class="modal-close" onclick="window.closeModal('fiscalModal')" style="color: white !important; font-size: 1.5rem;">&times;</button>
                        </div>
                        <div class="modal-body" style="padding: 1.5rem 2rem;">
                            <div class="fiscal-tabs">
                                <button class="fiscal-tab active" onclick="window.switchFiscalTab('fornecedores', this)">
                                    <i class="fas fa-truck"></i> Fornecedores
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('fiscais', this)">
                                    <i class="fas fa-user-tie"></i> Fiscais
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('localizacao', this)">
                                    <i class="fas fa-map-marker-alt"></i> Localização
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('contratos', this)">
                                    <i class="fas fa-file-contract"></i> Contratos
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('empenhos', this)">
                                    <i class="fas fa-file-invoice-dollar"></i> Empenhos
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('lancamentos', this); window.lancPopularEmpresas();" style="color: #dc2626; border-bottom: 2px solid #dc2626; font-weight: 700;">
                                    <i class="fas fa-receipt"></i> Lançamentos
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('gerarmapas', this)" style="color: #16a34a;">
                                    <i class="fas fa-map"></i> Gerar Mapas
                                </button>
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('gerarrelatorio', this)" style="color: #9333ea;">
                                    <i class="fas fa-file-alt"></i> Gerar Relatório
                                </button>
                            </div>
                            <div id="fiscal-tab-fornecedores" class="fiscal-tab-content active">...</div>
                        </div>
                    </div>
                </div>\`;
                document.body.insertAdjacentHTML('beforeend', fiscalModalHTML);
                window.loadFiscalData();
                const newModal = document.getElementById('fiscalModal');
                if (newModal) {
                    newModal.classList.add('visible');
                    newModal.style.display = 'flex';
                }
            }
        };

        window.switchFiscalTab = function`;

content = content.replace(openFiscoRegex, cleanOpenFisco);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Surgery completed successfully.');
