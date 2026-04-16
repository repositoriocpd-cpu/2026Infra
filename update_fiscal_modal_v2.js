const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'latin1'); // Read maintaining exact byte values!

// The header replace targeting specific structure that uses valid ASCII chars
const targetTabsStartStr = '<div class="modal-body" style="padding: 1.5rem 2rem;">\r\n                            <div class="fiscal-tabs">';
const targetTabsStartIndex = content.indexOf(targetTabsStartStr);
const targetTabsEndStr = '</div>\r\n                            \r\n                            <div id="fiscal-tab-fornecedores"';
const targetTabsEndIndex = content.indexOf(targetTabsEndStr, targetTabsStartIndex);

if (targetTabsStartIndex === -1 || targetTabsEndIndex === -1) {
    console.log("Could not find tabs section. Searching without \r");
    const test1 = content.indexOf('<div class="modal-body" style="padding: 1.5rem 2rem;">\n                            <div class="fiscal-tabs">');
    console.log("Found LF:", test1);
    process.exit(1);
}

// 1. Remove the old tabs and inject sidebar + style
const replacement1 = `                        <style>
                            .fiscal-layout { display: flex; align-items: stretch; background: #f8fafc; border-radius: 0 0 20px 20px; overflow: hidden; min-height: 70vh; }
                            .fiscal-sidebar { width: 240px; background: #f1f5f9; border-right: 1px solid #e2e8f0; padding: 1.5rem 0; flex-shrink: 0; display: flex; flex-direction: column; }
                            .fiscal-sidebar-group { margin-bottom: 1.5rem; }
                            .fiscal-sidebar-title { padding: 0 1.5rem; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
                            .fiscal-sidebar-title i { color: #64748b; font-size: 0.85rem; }
                            .fiscal-sidebar .fiscal-tab { display: flex; align-items: center; gap: 0.75rem; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem; padding: 0.6rem 1rem; border: none; background: transparent; border-radius: 8px; text-align: left; font-size: 0.9rem; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.2s; position: relative; }
                            .fiscal-sidebar .fiscal-tab:hover { background: #e2e8f0; color: #0f172a; }
                            .fiscal-sidebar .fiscal-tab.active { background: #dbeafe; color: #0284c7; }
                            .fiscal-main-content { flex: 1; padding: 2rem; background: #ffffff; overflow-y: auto; max-height: 80vh; }
                            
                            /* Tab Fornecedores */
                            .fiscal-page-header { margin-bottom: 1.5rem; }
                            .fiscal-page-title { font-size: 1.7rem; font-weight: 800; color: #0f172a; margin: 0; font-family: 'Inter', sans-serif; }
                            
                            .fiscal-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(15,23,42,0.06); }
                            .fiscal-card-header { display: flex; justify-content: flex-start; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                            .fiscal-card-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0; }
                            .btn-fiscal-new { background: #1e5faf; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.2s; }
                            .btn-fiscal-new:hover { background: #154582; }
                            .btn-fiscal-save { background: #1e5faf; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
                            .btn-fiscal-save:hover { background: #154582; }
                            
                            .fiscal-search-bar { position: relative; margin-bottom: 1rem; }
                            .fiscal-search-bar i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1rem; }
                            .fiscal-search-bar input { width: 100%; border: 1px solid #cbd5e1; border-radius: 20px; padding: 0.6rem 1rem 0.6rem 2.5rem; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
                            .fiscal-search-bar input:focus { border-color: #3b82f6; }
                            
                            /* Tab content hiding */
                            #fiscalModal .fiscal-tab-content { display: none; }
                            #fiscalModal .fiscal-tab-content.active { display: block; animation: fadeIn 0.3s ease; }
                            
                            /* Table actions */
                            .btn-edit-action { background: #eff6ff; color: #3b82f6; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; transition: all 0.2s; }
                            .btn-edit-action:hover { background: #dbeafe; }
                            .btn-delete-action { background: #fef2f2; color: #ef4444; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; transition: all 0.2s; margin-left: 0.5rem; }
                            .btn-delete-action:hover { background: #fee2e2; }
                        </style>
                        <div class="modal-body fiscal-layout" style="padding: 0;">
                            <div class="fiscal-sidebar">
                                <div class="fiscal-sidebar-group">
                                    <div class="fiscal-sidebar-title"><i class="far fa-folder-open"></i> Cadastros</div>
                                    <button class="fiscal-tab active" onclick="window.switchFiscalTab('fornecedores', this)">
                                        <i class="fas fa-university"></i> Fornecedores
                                    </button>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('fiscais', this)">
                                        <i class="far fa-user"></i> Fiscais
                                    </button>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('localizacao', this)">
                                        <i class="fas fa-map-marker-alt"></i> Localização
                                    </button>
                                </div>
                                <div class="fiscal-sidebar-group">
                                    <div class="fiscal-sidebar-title"><i class="fas fa-sack-dollar"></i> Pagamentos</div>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('contratos', this)">
                                        <i class="far fa-file-alt"></i> Contratos
                                    </button>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('empenhos', this)">
                                        <i class="fas fa-tag"></i> Empenhos
                                    </button>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('lancamentos', this); window.lancPopularEmpresas();">
                                        <i class="fas fa-check-circle"></i> Lançamentos
                                    </button>
                                </div>
                                <div class="fiscal-sidebar-group">
                                    <div class="fiscal-sidebar-title"><i class="fas fa-print"></i> Impressões</div>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('gerarmapas', this)">
                                        <i class="far fa-map"></i> Gerar Mapas
                                    </button>
                                    <button class="fiscal-tab" onclick="window.switchFiscalTab('gerarrelatorio', this)">
                                        <i class="fas fa-chart-bar"></i> Gerar Relatórios
                                    </button>
                                </div>
                            </div>
                            
                            <div class="fiscal-main-content">
                            
                            <div id="fiscal-tab-fornecedores"`;

// Here I encode replacement1 to latin1 implicitly by buffering or keeping exact representation
// JavaScript strings replace handles this securely if we use utf8 in JS string but write to buffer. Actually writeFileSync('latin1') handles the mapping. Buffer.from(string, "latin1") drops multibyte characters!
// So wait, I must decode the script source as latin1? No, my string `Localização` is UTF-8 encoded in this script, when node executes it's a UTF-16 string. When I write "latin1" it takes the lowest 8 bits. Thus á is 0xE1 which fits!
// Wait, "Localização" has 'ç' = 0xE7, 'ã' = 0xE3. Both < 256. They fit in latin1.

content = content.substring(0, targetTabsStartIndex) + replacement1 + content.substring(targetTabsEndIndex + targetTabsEndStr.length - 33);

// 2. We replace the Fornecedor content up to <div id="fiscal-tab-contratos">
const fornecedorContentStart = content.indexOf('<div class="form-section" style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">', targetTabsStartIndex);
const fornecedorContentEnd = content.indexOf('<div id="fiscal-tab-contratos"', fornecedorContentStart);

if (fornecedorContentStart === -1 || fornecedorContentEnd === -1) {
    console.log("Could not find Fornecedores content area"); process.exit(1);
}

const replacement2 = `<div class="fiscal-page-header">
                                    <h2 class="fiscal-page-title">Cadastro de Fornecedores</h2>
                                </div>
                                <div class="fiscal-card">
                                    <div class="fiscal-card-header">
                                        <h3 class="fiscal-card-title">Criar Novo Fornecedor</h3>
                                        <button class="btn-fiscal-new" type="button"><i class="fas fa-plus"></i> New</button>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
                                        <div class="form-group">
                                            <label style="font-size: 0.70rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; display: block;">Nome da Empresa</label>
                                            <input type="text" id="fornec-razao" class="form-control" placeholder="nome da empresa" style="border: 1px solid #cbd5e1; box-shadow: none; height: 42px;">
                                        </div>
                                        <div class="form-group">
                                            <label style="font-size: 0.70rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; display: block;">CNPJ</label>
                                            <input type="text" id="fornec-cnpj" class="form-control" placeholder="CNPJ (opcional)" style="border: 1px solid #cbd5e1; box-shadow: none; height: 42px;">
                                        </div>
                                        <div class="form-group" style="grid-column: span 2;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                                <label style="font-size: 0.70rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Objeto(s) <span style="font-weight: 400; font-size: 0.65rem; color: #94a3b8;">(até 10)</span></label>
                                                <button type="button" class="btn-tiny" onclick="window.adicionarObjetoFornecedor()" style="font-size: 0.7rem; padding: 4px 10px; background: #fef3c7; color: #d97706; border: none; font-weight: 600; border-radius: 4px; cursor: pointer;"><i class="fas fa-plus"></i> Adicionar Objeto</button>
                                            </div>
                                            <div id="fornec-objetos-container">
                                                <div class="fornec-objeto-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                                                    <input type="text" class="form-control fornec-objeto-input" placeholder="digite o objeto (opcional)" style="border: 1px solid #cbd5e1; box-shadow: none; height: 42px;">
                                                    <button type="button" class="btn-tiny" onclick="window.removerObjetoFornecedor(this)" style="padding: 0 14px; background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-times"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn-fiscal-save" style="margin-top: 1rem;" onclick="window.salvarFornecedor()"><i class="fas fa-save"></i> Salvar Fornecedor</button>
                                </div>
                                <div class="fiscal-search-bar">
                                    <i class="fas fa-search"></i>
                                    <input type="text" id="search-fornecedores" placeholder="Pesquisar Fornecedores..." onkeyup="window.filtrarTabela('fornecedores-list', 'search-fornecedores')">
                                </div>
                                <div class="table-responsive" style="max-height: 40vh; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 1.5rem;">
                                    <table class="fiscal-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                        <thead>
                                            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">Empresa</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">CNPJ</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">Objeto</th>
                                                <th style="padding: 1rem; text-align: left; font-weight: 700; color: #64748b;">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody id="fornecedores-list">
                                            <tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 2rem;">Nenhum fornecedor cadastrado</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            `;

content = content.substring(0, fornecedorContentStart) + replacement2 + content.substring(fornecedorContentEnd);

// 3. We close .fiscal-main-content at the end of the modal HTML creation
const modalEndTarget = '</div>\r\n                            </div>\r\n                            \r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                `;\r\n                document.body.insertAdjacentHTML';
const modalEndFixed = '</div>\r\n                            </div>\r\n                          </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                `;\r\n                document.body.insertAdjacentHTML';

if (content.includes(modalEndTarget)) {
    content = content.replace(modalEndTarget, modalEndFixed);
} else {
    // try with LF
    const lfEndTarget = '</div>\n                            </div>\n                            \n                        </div>\n                    </div>\n                </div>\n                `;\n                document.body.insertAdjacentHTML';
    const lfEndFixed = '</div>\n                            </div>\n                          </div>\n                        </div>\n                    </div>\n                </div>\n                `;\n                document.body.insertAdjacentHTML';
    if(content.includes(lfEndTarget)) {
        content = content.replace(lfEndTarget, lfEndFixed);
    }
}

// 4. Updating the Javascript functions to render the edit/delete buttons inline
let regexBtnEdit = /<button class="btn-tiny btn-warning" onclick="window\.editarFornecedor\(' \+ i \+ '\)"><i class="fas fa-edit"><\/i> Editar<\/button>/g;
let regexBtnExcluir = /<button class="btn-tiny btn-danger" onclick="window\.excluirFornecedor\(' \+ i \+ '\)"><i class="fas fa-trash"><\/i> Excluir<\/button>/g;

content = content.replace(regexBtnEdit, '<button class="btn-edit-action" onclick="window.editarFornecedor(\' + i + \')"><i class="fas fa-pen"></i> Editar</button>');
content = content.replace(regexBtnExcluir, '<button class="btn-delete-action" onclick="window.excluirFornecedor(\' + i + \')"><i class="fas fa-trash"></i> Excluir</button>');

content = content.replace(/'<tr><td>' \+ \(f\.name \|\| f\.nome\) \+ '<\/td><td>' \+ \(f\.cnpj \|\| '-'\) \+ '<\/td><td>' \+ \(/g, 
                          '\'<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 1rem; color: #334155;">\' + (f.name || f.nome) + \'</td><td style="padding: 1rem; color: #334155;">\' + (f.cnpj || \'-\') + \'</td><td style="padding: 1rem; color: #334155;">\' + (');
content = content.replace(/ \+ '<\/td><td><button class="btn-edit-action"/g, 
                          ' + \'</td><td style="padding: 1rem; color: #334155;"><button class="btn-edit-action"');

fs.writeFileSync(indexPath, content, 'latin1');
console.log('Processed successfully!');
