const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.cwd(), 'index.html');
let content = fs.readFileSync(targetFile, 'utf8');

console.log('--- RESTORING NATUREZA TAB ---');

// 1. Inserir botão na Tab Bar do Fiscal Modal
const fornecedoresTabBtn = `<button class="fiscal-tab active" onclick="window.switchFiscalTab('fornecedores', this)">
                                    <i class="fas fa-truck"></i> Fornecedores
                                </button>`;
const naturezaTabBtn = `
                                <button class="fiscal-tab" onclick="window.switchFiscalTab('natureza', this); window.carregarNaturezaFromSupabase();">
                                    <i class="fas fa-file-invoice-dollar"></i> Natureza de Retenções
                                </button>`;
if (!content.includes('Natureza de Retenções')) {
    content = content.replace(fornecedoresTabBtn, fornecedoresTabBtn + naturezaTabBtn);
}


// 2. Inserir o HTML Content
const contratosTabDiv = '<div id="fiscal-tab-contratos" class="fiscal-tab-content">';
const naturezaTabHtml = `
                            <div id="fiscal-tab-natureza" class="fiscal-tab-content">
                                <div class="form-section" style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h3 style="margin-top: 0; color: #1e293b; font-size: 1.05rem;">Nova Natureza e Retenções</h2>
                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <input type="text" id="nat-desc" placeholder="Descrição da Natureza (Ex: Serv. Limpeza)" style="flex: 1; min-width: 250px;">
                                        <input type="number" id="nat-ir" placeholder="% IR" style="width: 100px;" oninput="window.calcTotalNat()">
                                        <input type="number" id="nat-csll" placeholder="% CSLL" style="width: 100px;" oninput="window.calcTotalNat()">
                                        <input type="number" id="nat-cofins" placeholder="% COFINS" style="width: 100px;" oninput="window.calcTotalNat()">
                                        <input type="number" id="nat-pis" placeholder="% PIS" style="width: 100px;" oninput="window.calcTotalNat()">
                                        <input type="number" id="nat-total" placeholder="Total %" style="width: 100px; background:#e2e8f0;" readonly>
                                        <button onclick="window.salvarNatureza()" class="btn" style="background:#10b981; color:white;"><i class="fas fa-save"></i> Salvar</button>
                                    </div>
                                </div>
                                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                                    <table class="fiscal-table">
                                        <thead>
                                            <tr>
                                                <th>NATUREZA</th>
                                                <th>IR</th>
                                                <th>CSLL</th>
                                                <th>COFINS</th>
                                                <th>PIS</th>
                                                <th>TOTAL RETENÇÃO</th>
                                                <th>AÇÃO</th>
                                            </tr>
                                        </thead>
                                        <tbody id="natureza-list"></tbody>
                                    </table>
                                </div>
                            </div>
`;

if (!content.includes('id="fiscal-tab-natureza"')) {
    content = content.replace(contratosTabDiv, naturezaTabHtml + '\n' + contratosTabDiv);
}

// 3. Atualizar Formulário Cadastro de Fornecedor
const oldFornecForm = `<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="text" id="fornec-razao" placeholder="Razão Social" style="flex: 2;">
                                        <input type="text" id="fornec-cnpj" placeholder="CNPJ" style="flex: 1;" oninput="window.formatCnpj(this)">
                                    </div>`;
const newFornecForm = `<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="text" id="fornec-razao" placeholder="Razão Social" style="flex: 2;">
                                        <input type="text" id="fornec-cnpj" placeholder="CNPJ" style="flex: 1;" oninput="window.formatCnpj(this)">
                                    </div>
                                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <select id="fornec-natureza" style="flex: 2;" onchange="window.fornecNaturezaChange()">
                                            <option value="">-- Natureza (Classificação) --</option>
                                        </select>
                                        <input type="number" id="fornec-irrf" placeholder="% IRRF Base" style="flex: 1; background: #f1f5f9;" readonly>
                                    </div>`;

if (!content.includes('id="fornec-natureza"')) {
    content = content.replace(oldFornecForm, newFornecForm);
}


// 4. Inserir Logic Blocks
const natureJsLogic = `
        window.calcTotalNat = function() {
            const ir = parseFloat(document.getElementById('nat-ir').value) || 0;
            const csll = parseFloat(document.getElementById('nat-csll').value) || 0;
            const cofins = parseFloat(document.getElementById('nat-cofins').value) || 0;
            const pis = parseFloat(document.getElementById('nat-pis').value) || 0;
            document.getElementById('nat-total').value = (ir + csll + cofins + pis).toFixed(2);
        };

        window.carregarNaturezaFromSupabase = async function() {
            if(!window.supabaseClient) return;
            const { data, error } = await window.supabaseClient.from('natureza_retencao').select('*').order('natureza');
            if(error) { console.error('Error load natureza', error); return; }
            window.naturezaDataMap = data;
            
            const tbody = document.getElementById('natureza-list');
            if(tbody) {
                tbody.innerHTML = data.map(n => \`
                    <tr>
                        <td style="font-weight:600;">\${String(n.natureza || '').toUpperCase()}</td>
                        <td>\${n.ir || 0}%</td>
                        <td>\${n.csll || 0}%</td>
                        <td>\${n.cofins || 0}%</td>
                        <td>\${n.pis || 0}%</td>
                        <td style="color:#d97706; font-weight:700;">\${n.percentual || 0}%</td>
                        <td><button onclick="window.excluirNatureza(\${n.id})" style="background:none; border:none; color:#dc2626; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
                    </tr>
                \`).join('');
            }

            const sel = document.getElementById('fornec-natureza');
            if(sel) {
                const currentVal = sel.value;
                sel.innerHTML = '<option value="">-- Natureza (Classificação) --</option>' + 
                    data.map(n => \`<option value="\${n.natureza}" data-ir="\${n.ir}">\${String(n.natureza).toUpperCase()}</option>\`).join('');
                sel.value = currentVal;
            }
        };

        window.salvarNatureza = async function() {
            if(!window.supabaseClient) return alert('Banco offline.');
            const natureza = document.getElementById('nat-desc').value;
            const ir = parseFloat(document.getElementById('nat-ir').value) || 0;
            const csll = parseFloat(document.getElementById('nat-csll').value) || 0;
            const cofins = parseFloat(document.getElementById('nat-cofins').value) || 0;
            const pis = parseFloat(document.getElementById('nat-pis').value) || 0;
            const percentual = ir + csll + cofins + pis;
            const codigo = natureza.substring(0, 5).toUpperCase() + Math.random().toString(36).substr(2, 4);

            if(!natureza) return alert('Informe a descrição da natureza.');

            const { error } = await window.supabaseClient.from('natureza_retencao').insert({
                natureza, ir, csll, cofins, pis, percentual, codigo
            });

            if(error) alert('Erro ao salvar: ' + error.message);
            else {
                document.getElementById('nat-desc').value = '';
                document.getElementById('nat-ir').value = '';
                document.getElementById('nat-csll').value = '';
                document.getElementById('nat-cofins').value = '';
                document.getElementById('nat-pis').value = '';
                document.getElementById('nat-total').value = '';
                window.carregarNaturezaFromSupabase();
            }
        };

        window.excluirNatureza = async function(id) {
            if(!confirm('Excluir esta Natureza?')) return;
            const { error } = await window.supabaseClient.from('natureza_retencao').delete().eq('id', id);
            if(error) alert('Erro: ' + error.message);
            else window.carregarNaturezaFromSupabase();
        };

        window.fornecNaturezaChange = function() {
            const sel = document.getElementById('fornec-natureza');
            if(sel.selectedIndex > 0) {
                const opt = sel.options[sel.selectedIndex];
                document.getElementById('fornec-irrf').value = opt.getAttribute('data-ir');
            } else {
                document.getElementById('fornec-irrf').value = '';
            }
        };
`;

if (!content.includes('window.carregarNaturezaFromSupabase = async function')) {
    content = content.replace('// Initialization', natureJsLogic + '\n        // Initialization');
}

// 5. Corrigir as funções originais do Fornecedores salvamento para incluir natureza
const oldSalvarF = `const payload = { 
                cnpj: cnpj.replace(/\\D/g, ''), 
                name: razao.substring(0, 50).toUpperCase(),
                razao_social: razao.toUpperCase()`;
const newSalvarF = `const natureza = (document.getElementById('fornec-natureza') || {value:''}).value;
            const irrfStr = (document.getElementById('fornec-irrf') || {value:''}).value;
            const irrfNum = parseFloat(irrfStr) || null;
            const payload = { 
                cnpj: cnpj.replace(/\\D/g, ''), 
                name: razao.substring(0, 50).toUpperCase(),
                razao_social: razao.toUpperCase(),
                natureza: natureza,
                irrf: irrfNum`;

if (content.includes(oldSalvarF)) {
    content = content.replace(oldSalvarF, newSalvarF);
}

// Make sure loadFiscalData triggers carregarNatureza
if (!content.includes('window.carregarNaturezaFromSupabase();')) {
     content = content.replace('window.carregarFornecedores();', 'window.carregarFornecedores();\n            if(window.carregarNaturezaFromSupabase) window.carregarNaturezaFromSupabase();');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('--- DONE ---');
