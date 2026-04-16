const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
let newContent = content;

// Fix Mojibake: "Localizao" "Aes"
newContent = newContent.replace(/Localiza\?\?o/g, "Localização");
newContent = newContent.replace(/A\?\?es/g, "Ações");
newContent = newContent.replace(/op\?\?es/g, "opções");

// Inject Sidebar Button
const fiscaisBtn = `<button class="fiscal-tab" onclick="window.switchFiscalTab('fiscais', this)">
                                        <i class="far fa-user"></i> Fiscais
                                    </button>`;
const naturezaBtn = `<button class="fiscal-tab" onclick="window.switchFiscalTab('natureza', this); window.carregarNaturezaFromSupabase();">
                                        <i class="fas fa-file-invoice-dollar"></i> Natureza/Retenções
                                    </button>\n                                    `;
if(!newContent.includes("Natureza/Retenções")) {
    newContent = newContent.replace(fiscaisBtn, naturezaBtn + fiscaisBtn);
}

// Inject Tab Div Content
const fTabContratos = `<div id="fiscal-tab-fiscais"`;
const tabNaturezaHtml = `
                            <div id="fiscal-tab-natureza" class="fiscal-tab-content">
                                <div class="fiscal-page-header">
                                    <h2 class="fiscal-page-title">Natureza e Retenções</h2>
                                </div>
                                <div class="fiscal-card">
                                    <h3 class="fiscal-card-title" style="margin-bottom: 1rem;">Nova Natureza e Retenções</h3>
                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <input class="form-control" type="text" id="nat-desc" placeholder="Descrição (Ex: Serv. Limpeza)" style="flex: 1; min-width: 250px;">
                                        <input class="form-control" type="number" id="nat-ir" placeholder="% IR" style="width: 90px;" oninput="window.calcTotalNat()">
                                        <input class="form-control" type="number" id="nat-csll" placeholder="% CSLL" style="width: 90px;" oninput="window.calcTotalNat()">
                                        <input class="form-control" type="number" id="nat-cofins" placeholder="% COFINS" style="width: 90px;" oninput="window.calcTotalNat()">
                                        <input class="form-control" type="number" id="nat-pis" placeholder="% PIS" style="width: 90px;" oninput="window.calcTotalNat()">
                                        <input class="form-control" type="number" id="nat-total" placeholder="Total %" style="width: 90px; background:#e2e8f0;" readonly>
                                        <button onclick="window.salvarNatureza()" class="btn-fiscal-save"><i class="fas fa-save"></i> Salvar</button>
                                    </div>
                                </div>
                                <div class="table-responsive" style="max-height: 40vh; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 1.5rem;">
                                    <table class="fiscal-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                        <thead>
                                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">NATUREZA</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">IR</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">CSLL</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">COFINS</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">PIS</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">TOTAL RETENÇÃO</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">AÇÕES</th>
                                            </tr>
                                        </thead>
                                        <tbody id="natureza-list"></tbody>
                                    </table>
                                </div>
                            </div>\n`;

if(!newContent.includes('id="fiscal-tab-natureza"')) {
    newContent = newContent.replace(fTabContratos, tabNaturezaHtml + fTabContratos);
}

// Ensure JS logics exist (window.calcTotalNat, etc)
// If not, append before window.carregarFiscaisFromSupabase
const jsMarker = "window.carregarFiscaisFromSupabase =";
if(!newContent.includes("window.calcTotalNat =")) {
    const jsInjection = `
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
            
            const tbody = document.getElementById('natureza-list');
            if(tbody) {
                tbody.innerHTML = data.map(n => \`
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="font-weight:600; padding:1rem;">\${String(n.natureza || '').toUpperCase()}</td>
                        <td style="padding:1rem;">\${n.ir || 0}%</td>
                        <td style="padding:1rem;">\${n.csll || 0}%</td>
                        <td style="padding:1rem;">\${n.cofins || 0}%</td>
                        <td style="padding:1rem;">\${n.pis || 0}%</td>
                        <td style="color:#d97706; font-weight:700; padding:1rem;">\${n.percentual || 0}%</td>
                        <td style="padding:1rem;"><button class="btn-delete-action" onclick="window.excluirNatureza(\${n.id})"><i class="fas fa-trash"></i> Excluir</button></td>
                    </tr>
                \`).join('');
            }

            const sel = document.getElementById('fornec-natureza');
            if(sel) {
                const currentVal = sel.value;
                sel.innerHTML = '<option value="">-- Selecione Natureza --</option>' + 
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

            if(!natureza) return alert('Informe a descrição.');

            const { error } = await window.supabaseClient.from('natureza_retencao').insert({ natureza, ir, csll, cofins, pis, percentual, codigo });
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
            if(sel && sel.selectedIndex > 0) {
                const opt = sel.options[sel.selectedIndex];
                const irrfField = document.getElementById('fornec-irrf');
                if(irrfField) irrfField.value = opt.getAttribute('data-ir');
            } else {
                const irrfField = document.getElementById('fornec-irrf');
                if(irrfField) irrfField.value = '';
            }
        };
`;
    newContent = newContent.replace(jsMarker, jsInjection + "\n" + jsMarker);
}

// Injetar <select> de natureza no Cadastro de Fornecedor
const fornecRazaoLabel = `<div class="form-group">
                                            <label style="font-size: 0.70rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; display: block;">Nome da Empresa</label>`;
const fornecNaturezaHtml = `<div class="form-group" style="grid-column: span 2; display: flex; gap: 1.5rem;">
                                            <div style="flex: 2;">
                                                <label style="font-size: 0.70rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; display: block;">Natureza do Serviço</label>
                                                <select id="fornec-natureza" class="form-control" onchange="window.fornecNaturezaChange()" style="border: 1px solid #cbd5e1; box-shadow: none; height: 42px;">
                                                    <option value="">-- Natureza (Classificação) --</option>
                                                </select>
                                            </div>
                                            <div style="flex: 1;">
                                                <label style="font-size: 0.70rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; display: block;">% IRRF Base</label>
                                                <input type="number" id="fornec-irrf" class="form-control" placeholder="% IRRF" style="border: 1px solid #cbd5e1; background: #f1f5f9; box-shadow: none; height: 42px;" readonly>
                                            </div>
                                        </div>\n                                        `;
if(!newContent.includes('id="fornec-natureza"')) {
    newContent = newContent.replace(fornecRazaoLabel, fornecNaturezaHtml + "\n" + fornecRazaoLabel);
}

const oldSalvar = "name: razao.substring(0, 50).toUpperCase(),";
const newSalvar = "name: razao.substring(0, 50).toUpperCase(),\n                natureza: (document.getElementById('fornec-natureza') || {}).value || null,\n                irrf: parseFloat((document.getElementById('fornec-irrf') || {}).value) || null,";
if(!newContent.includes("irrf: parseFloat(")) {
    newContent = newContent.replace(oldSalvar, newSalvar);
}

// Make sure loadFiscalData triggers carregarNatureza
if (!newContent.includes('window.carregarNaturezaFromSupabase();')) {
     newContent = newContent.replace('window.carregarFornecedores();', 'window.carregarFornecedores();\n            if(window.carregarNaturezaFromSupabase) window.carregarNaturezaFromSupabase();');
}

fs.writeFileSync('index.html', newContent, 'utf8');
console.log('--- RECONSTRUCTED MODAL ---');
