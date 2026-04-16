const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'latin1'); // Read exactly

// 1. Fix the encoding corruptions I introduced.
// Since Javascript treats the source as UTF-8, these string literals are UTF-16.
// In the file, the corrupted strings are just single-byte latin1 chars from my previous write.
content = content.replace(/Localiza\xE7\xE3o/g, 'Localiza\xC3\xA7\xC3\xA3o'); // Localização
content = content.replace(/Lan\xE7amentos/g, 'Lan\xC3\xA7amentos'); // Lançamentos
content = content.replace(/Impress\xF5es/g, 'Impress\xC3\xB5es'); // Impressões
content = content.replace(/Relat\xF3rios/g, 'Relat\xC3\xB3rios'); // Relatórios
content = content.replace(/A\xE7\xF5es/g, 'A\xC3\xA7\xC3\xB5es'); // Ações

// Also check if I corrupted other parts like 'Ações' in the headers:
content = content.replace(/A\xE7\xE3o/g, 'A\xC3\xA7\xC3\xA3o'); // Ação

// 2. Fix the Table Action buttons for the other tabs
// We replace btn-tiny btn-warning with btn-edit-action and btn-tiny btn-danger with btn-delete-action

// updating Fiscais table
let regexFiscaisEdit = /<button class=\"btn-tiny btn-warning\" onclick=\"window\.editarFiscal\(' \+ i \+ '\)\"><i class=\"fas fa-edit\"><\/i> Editar<\/button>/g;
let regexFiscaisDel = /<button class=\"btn-tiny btn-danger\" onclick=\"window\.excluirFiscal\(' \+ i \+ '\)\"><i class=\"fas fa-trash\"><\/i> Excluir<\/button>/g;
content = content.replace(regexFiscaisEdit, '<button class="btn-edit-action" onclick="window.editarFiscal(\' + i + \')"><i class="fas fa-pen"></i> Editar</button>');
content = content.replace(regexFiscaisDel, '<button class="btn-delete-action" onclick="window.excluirFiscal(\' + i + \')"><i class="fas fa-trash"></i> Excluir</button>');

// updating Localizacao table
let regexLocalEdit = /<button class=\"btn-tiny btn-warning\" onclick=\"window\.editarLocalizacao\(' \+ i \+ '\)\"><i class=\"fas fa-edit\"><\/i> Editar<\/button>/g;
let regexLocalDel = /<button class=\"btn-tiny btn-danger\" onclick=\"window\.excluirLocalizacao\(' \+ i \+ '\)\"><i class=\"fas fa-trash\"><\/i> Excluir<\/button>/g;
content = content.replace(regexLocalEdit, '<button class="btn-edit-action" onclick="window.editarLocalizacao(\' + i + \')"><i class="fas fa-pen"></i> Editar</button>');
content = content.replace(regexLocalDel, '<button class="btn-delete-action" onclick="window.excluirLocalizacao(\' + i + \')"><i class="fas fa-trash"></i> Excluir</button>');

// updating Contratos table
let regexContratosEdit = /<button class=\"btn-tiny btn-warning\" onclick=\"window\.editarContrato\(' \+ i \+ '\)\"><i class=\"fas fa-edit\"><\/i> Editar<\/button>/g;
let regexContratosDel = /<button class=\"btn-tiny btn-danger\" onclick=\"window\.excluirContrato\(' \+ i \+ '\)\"><i class=\"fas fa-trash\"><\/i> Excluir<\/button>/g;
content = content.replace(regexContratosEdit, '<button class="btn-edit-action" onclick="window.editarContrato(\' + i + \')"><i class="fas fa-pen"></i> Editar</button>');
content = content.replace(regexContratosDel, '<button class="btn-delete-action" onclick="window.excluirContrato(\' + i + \')"><i class="fas fa-trash"></i> Excluir</button>');

// updating Empenhos table
let regexEmpenhosEdit = /<button class=\"btn-tiny btn-warning\" onclick=\"window\.editarEmpenho\(' \+ i \+ '\)\"><i class=\"fas fa-edit\"><\/i> Editar<\/button>/g;
let regexEmpenhosDel = /<button class=\"btn-tiny btn-danger\" onclick=\"window\.excluirEmpenho\(' \+ i \+ '\)\"><i class=\"fas fa-trash\"><\/i> Excluir<\/button>/g;
content = content.replace(regexEmpenhosEdit, '<button class="btn-edit-action" onclick="window.editarEmpenho(\' + i + \')"><i class="fas fa-pen"></i> Editar</button>');
content = content.replace(regexEmpenhosDel, '<button class="btn-delete-action" onclick="window.excluirEmpenho(\' + i + \')"><i class="fas fa-trash"></i> Excluir</button>');

// Lancamentos table - it seems it has 'Acoes' instead of Ações in the HTML 
// "<button class="lanc-btn-secondary" title="Editar" onclick="window.lancEditarMedicao(' + m.id + ')"><i class="fas fa-edit"></i></button>"
content = content.replace(/<button class=\"lanc-btn-secondary\" title=\"Editar\"/g, '<button class="btn-edit-action" title="Editar"');
content = content.replace(/<button class=\"lanc-btn-secondary\" title=\"Finalizar\"/g, '<button class="btn-edit-action" style="background:#dcfce7;color:#166534;border:none;" title="Finalizar"');
content = content.replace(/<button class=\"lanc-btn-secondary\" title=\"Excluir Medicao\" onclick=\"window\.lancExcluirMedicao/g, '<button class="btn-delete-action" title="Excluir Medicao" onclick="window.lancExcluirMedicao');

fs.writeFileSync(indexPath, content, 'latin1');
console.log('Fixed encodings and table buttons.');
