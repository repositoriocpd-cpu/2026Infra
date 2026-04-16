$path = "e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"
$content = [System.IO.File]::ReadAllText($path)

$startAnchor = "        window.fiscalData = {"
# Updated end anchor with exact parameters discovered
$endAnchor = "        window.openProcessModal = function (p = null) {"

$startIndex = $content.IndexOf($startAnchor)
$endIndex = $content.LastIndexOf($endAnchor)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    
    $newLogic = @'
        window.fiscalData = {
            fornecedores: [],
            contratos: [],
            empenhos: [],
            fiscais: [],
            localizacoes: []
        };
        window.contratoEditando = null;
        window.fornecedorEditando = null;

        // ======================== FORNECEDORES LOGIC ========================
        window.salvarFornecedor = async function () {
            const nome = document.getElementById('fornec-razao').value;
            const cnpj = document.getElementById('fornec-cnpj').value;
            var objetos = [];
            document.querySelectorAll('.fornec-objeto-row').forEach(function(row) {
                var input = row.querySelector('.fornec-objeto-input');
                if (input && input.value.trim()) {
                    objetos.push(input.value.trim());
                }
            });
            if (!nome) { alert('Preencha o nome da empresa'); return; }
            var objetoTexto = objetos.join('; ');
            try {
                if (window.supabase) {
                    const data = { name: nome, cnpj: cnpj, objeto: objetoTexto };
                    const { error } = await window.supabase.from('suppliers').upsert(data, { onConflict: 'name' });
                    if (error) throw error;
                }
                alert('Fornecedor salvo com sucesso!');
                window.loadFiscalData();
                document.getElementById('fornec-razao').value = '';
                document.getElementById('fornec-cnpj').value = '';
                document.getElementById('fornec-objetos-container').innerHTML = `
                    <div class="fornec-objeto-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <input type="text" class="form-control fornec-objeto-input" placeholder="digite o objeto (opcional)">
                        <button type="button" class="btn-tiny btn-danger" onclick="window.removerObjetoFornecedor(this)" style="padding: 6px 10px;"><i class="fas fa-times"></i></button>
                    </div>
                `;
                window.fornecedorEditando = null;
            } catch (err) {
                console.error('Erro ao salvar fornecedor:', err);
                alert('Erro ao salvar: ' + err.message);
            }
        };

        window.adicionarObjetoFornecedor = function () {
            var container = document.getElementById('fornec-objetos-container');
            var div = document.createElement('div');
            div.className = 'fornec-objeto-row';
            div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
            div.innerHTML = `
                <input type="text" class="form-control fornec-objeto-input" placeholder="digite o objeto (opcional)">
                <button type="button" class="btn-tiny btn-danger" onclick="window.removerObjetoFornecedor(this)" style="padding: 6px 10px;"><i class="fas fa-times"></i></button>
            `;
            container.appendChild(div);
        };

        window.removerObjetoFornecedor = function (btn) {
            var container = document.getElementById('fornec-objetos-container');
            if (container && container.children.length > 1) { btn.closest('.fornec-objeto-row').remove(); }
        };

        window.atualizarTabelaFornecedores = function () {
            const tbody = document.getElementById('fornecedores-list');
            if (!tbody) return;
            if (window.fiscalData.fornecedores.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhum fornecedor cadastrado</td></tr>';
            } else {
                tbody.innerHTML = window.fiscalData.fornecedores.map((f, i) =>
                    '<tr><td>' + (f.name || f.nome) + '</td><td>' + (f.cnpj || '-') + '</td><td>' + (f.objeto || '-') + '</td><td><button class="btn-tiny btn-warning" onclick="window.editarFornecedor(' + i + ')"><i class="fas fa-edit"></i> Editar</button> <button class="btn-tiny btn-danger" onclick="window.excluirFornecedor(' + i + ')"><i class="fas fa-trash"></i> Excluir</button></td></tr>'
                ).join('');
            }
            window.atualizarSelectsFornecedor();
        };

        window.editarFornecedor = function (index) {
            const f = window.fiscalData.fornecedores[index];
            document.getElementById('fornec-razao').value = f.name || f.nome;
            document.getElementById('fornec-cnpj').value = f.cnpj || '';
            var objetos = (f.objeto || '').split(';').map(o => o.trim()).filter(o => o);
            var container = document.getElementById('fornec-objetos-container');
            container.innerHTML = '';
            if (objetos.length === 0) objetos = [''];
            objetos.forEach(ob => {
                var div = document.createElement('div');
                div.className = 'fornec-objeto-row';
                div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
                div.innerHTML = `<input type="text" class="form-control fornec-objeto-input" value="${ob}" placeholder="digite o objeto (opcional)"><button type="button" class="btn-tiny btn-danger" onclick="window.removerObjetoFornecedor(this)" style="padding: 6px 10px;"><i class="fas fa-times"></i></button>`;
                container.appendChild(div);
            });
            window.fornecedorEditando = index;
        };

        window.excluirFornecedor = async function (index) {
            const f = window.fiscalData.fornecedores[index];
            const nomeStr = f.name || f.nome;
            if (confirm('Excluir fornecedor ' + nomeStr + '?')) {
                if (window.supabaseClient) { await window.supabaseClient.from('suppliers').delete().eq('name', nomeStr); }
                window.loadFiscalData();
            }
        };

        window.atualizarSelectsFornecedor = function () {
            const selects = ['contrat-fornec', 'emp-fornec'];
            selects.forEach(selId => {
                const sel = document.getElementById(selId);
                if (sel) {
                    const opts = window.fiscalData.fornecedores.map(f => {
                        const n = f.name || f.nome;
                        return '<option value="' + n + '">' + n + '</option>';
                    }).join('');
                    sel.innerHTML = '<option value="">-- Selecione --</option>' + opts;
                }
            });
        };

        // ======================== CONTRATOS LOGIC ========================
        window.atualizarContratosPorFornecedor = function () {
            const fornec = document.getElementById('emp-fornec').value;
            const contratoSel = document.getElementById('emp-contrato');
            if (!fornec) { contratoSel.innerHTML = '<option value="">-- Selecione --</option>'; document.getElementById('emp-periodo').value = ''; return; }
            const contratosFiltrados = window.fiscalData.contratos.filter(c => c.supplier_name === fornec);
            if (contratosFiltrados.length === 0) { contratoSel.innerHTML = '<option value="">Nenhum contrato encontrado</option>'; return; }
            const opts = contratosFiltrados.map(c => `<option value="${c.contract_number}">${c.contract_number}</option>`).join('');
            contratoSel.innerHTML = '<option value="">-- Selecione --</option>' + opts;
        };

        window.salvarContrato = async function () {
            const fornec = document.getElementById('contrat-fornec').value;
            const numero = document.getElementById('contrat-num').value;
            if (!fornec || !numero) { alert('Preencha Fornecedor e N.º do Contrato'); return; }
            const data = {
                supplier_name: fornec,
                process_number: document.getElementById('contrat-processo').value,
                contract_number: numero,
                value: parseFloat(document.getElementById('contrat-valor').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0,
                start_date: document.getElementById('contrat-inicio').value,
                end_date: document.getElementById('contrat-termino').value,
                officers: [document.getElementById('contrat-fiscal1').value, document.getElementById('contrat-fiscal2').value, document.getElementById('contrat-fiscal3').value].filter(f => f)
            };
            try {
                if (window.supabaseClient) {
                    const { error } = await window.supabaseClient.from('fiscal_contracts').upsert(data, { onConflict: 'contract_number' });
                    if (error) throw error;
                }
                alert('Contrato salvo!');
                window.loadFiscalData();
            } catch (err) { alert(err.message); }
        };

        window.atualizarTabelaContratos = function () {
            const tbody = document.getElementById('contratos-list');
            if (!tbody) return;
            if (window.fiscalData.contratos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">Nenhum contrato cadastrado</td></tr>';
            } else {
                tbody.innerHTML = window.fiscalData.contratos.map((c, i) =>
                    '<tr><td>' + c.supplier_name + '</td><td>' + (c.process_number || '-') + '</td><td>' + c.contract_number + '</td><td>R$ ' + (parseFloat(c.value) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2}) + '</td><td>' + (c.start_date || '-') + '</td><td>' + (c.end_date || '-') + '</td><td>' + (c.officers ? c.officers.join(', ') : '-') + '</td><td><button class="btn-tiny btn-warning" onclick="window.editarContrato(' + i + ')"><i class="fas fa-edit"></i></button> <button class="btn-tiny btn-danger" onclick="window.excluirContrato(' + i + ')"><i class="fas fa-trash"></i></button></td></tr>'
                ).join('');
            }
        };

        window.editarContrato = function (index) {
            const c = window.fiscalData.contratos[index];
            document.getElementById('contrat-fornec').value = c.supplier_name || '';
            document.getElementById('contrat-processo').value = c.process_number || '';
            document.getElementById('contrat-num').value = c.contract_number || '';
            document.getElementById('contrat-valor').value = (parseFloat(c.value) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2});
            document.getElementById('contrat-inicio').value = c.start_date || '';
            document.getElementById('contrat-termino').value = c.end_date || '';
            if (c.officers) {
                ['contrat-fiscal1', 'contrat-fiscal2', 'contrat-fiscal3'].forEach((id, i) => { document.getElementById(id).value = c.officers[i] || ''; });
            }
        };

        window.excluirContrato = async function (index) {
            const c = window.fiscalData.contratos[index];
            if (confirm('Excluir?')) {
                if (window.supabaseClient) { await window.supabaseClient.from('fiscal_contracts').delete().eq('contract_number', c.contract_number); }
                window.loadFiscalData();
            }
        };

        window.calcularPeriodoContrato = function (numeroContrato) {
            const campoPeriodo = document.getElementById('emp-periodo');
            if (!numeroContrato) { campoPeriodo.value = ''; return; }
            const contrato = window.fiscalData.contratos.find(c => c.contract_number === numeroContrato);
            if (contrato && contrato.start_date && contrato.end_date) {
                const diffTime = new Date(contrato.end_date) - new Date(contrato.start_date);
                campoPeriodo.value = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)) + ' meses';
            } else { campoPeriodo.value = ''; }
        };

        // ======================== EMPENHOS LOGIC ========================
        window.salvarEmpenho = async function () {
            const fornec = document.getElementById('emp-fornec').value;
            const contrato = document.getElementById('emp-contrato').value;
            const periodo = document.getElementById('emp-periodo').value;
            const fiscaisArr = Array.from(document.getElementById('emp-fiscal').selectedOptions).map(o => o.value).filter(v => v);
            const rows = document.querySelectorAll('.emp-empenho-row');
            const empenos = [];
            rows.forEach(row => {
                const ne = row.querySelector('.emp-ne-input').value.trim();
                const valor = parseFloat(row.querySelector('.emp-valor-input').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                if (ne) empenos.push({ ne, valor });
            });
            if (!fornec || empenos.length === 0) { alert('Preencha os campos obrigatórios'); return; }
            try {
                if (window.supabase) {
                    for (const emp of empenos) {
                        const data = { supplier_name: fornec, contract_number: contrato, period: periodo, officer_name: fiscaisArr.join(', '), ne_number: emp.ne, value: emp.valor };
                        await window.supabase.from('fiscal_empenhos').upsert(data, { onConflict: 'ne_number' });
                    }
                }
                alert('Empenho(s) salvos!');
                window.loadFiscalData();
            } catch (err) { alert(err.message); }
        };

        window.adicionarEmpenhoInput = function () {
            const div = document.createElement('div'); div.className = 'emp-empenho-row'; div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
            div.innerHTML = `<input type="text" class="form-control emp-ne-input" placeholder="número do empenho" style="flex: 1;"><input type="text" class="form-control emp-valor-input" placeholder="R$ 0,00" onblur="formatarMoeda(this)" style="width: 120px;"><button type="button" class="btn-tiny btn-danger" onclick="window.removerEmpenhoInput(this)" style="padding: 6px 10px;"><i class="fas fa-times"></i></button>`;
            document.getElementById('emp-empenhos-container').appendChild(div);
        };

        window.removerEmpenhoInput = function (btn) {
            const container = document.getElementById('emp-empenhos-container');
            if (container.children.length > 1) btn.closest('.emp-empenho-row').remove();
        };

        window.atualizarTabelaEmpenhos = function () {
            const tbody = document.getElementById('empenhos-list');
            if (!tbody) return;
            tbody.innerHTML = window.fiscalData.empenhos.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: #999;">Nenhum empênho</td></tr>' : 
                window.fiscalData.empenhos.map((e, i) => `<tr><td>${e.supplier_name}</td><td>${e.contract_number || '-'}</td><td>${e.period || '-'}</td><td>${e.officer_name || '-'}</td><td>${e.ne_number}</td><td>R$ ${parseFloat(e.value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirEmpenho('${e.ne_number}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
        };

        window.excluirEmpenho = async function (ne) {
            if (confirm('Excluir?')) { 
                if (window.supabaseClient) await window.supabaseClient.from('fiscal_empenhos').delete().eq('ne_number', ne);
                window.loadFiscalData();
            }
        };

        // ======================== FISCAIS (SYNC HANDLERS) ========================
        window.salvarFiscal = async function () {
            const matricula = document.getElementById('fiscal-matricula').value;
            const nome = document.getElementById('fiscal-nome').value;
            if (!nome) { alert('Preencha o nome'); return; }
            try {
                if (window.supabase) { await window.supabase.from('handlers').upsert({ matricula, name: nome }, { onConflict: 'name' }); }
                window.loadFiscalData();
                document.getElementById('fiscal-matricula').value = '';
                document.getElementById('fiscal-nome').value = '';
                alert('Fiscal salvo!');
            } catch (err) { alert(err.message); }
        };

        window.atualizarTabelaFiscais = function () {
            const tbody = document.getElementById('fiscais-list');
            if (!tbody) return;
            tbody.innerHTML = window.fiscalData.fiscais.length === 0 ? '<tr><td colspan="3" style="text-align: center; color: #999;">Nenhum fiscal</td></tr>' :
                window.fiscalData.fiscais.map((f, i) => `<tr><td>${f.matricula || '-'}</td><td>${f.name}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirFiscal('${f.name}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
            window.atualizarSelectsFiscal();
        };

        window.excluirFiscal = async function (name) {
            if (confirm('Excluir?')) {
                if (window.supabaseClient) await window.supabaseClient.from('handlers').delete().eq('name', name);
                window.loadFiscalData();
            }
        };

        window.atualizarSelectsFiscal = function () {
            if (!window.fiscalData.fiscais) return;
            const opts = window.fiscalData.fiscais.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
            ['emp-fiscal', 'contrat-fiscal1', 'contrat-fiscal2', 'contrat-fiscal3'].forEach(id => {
                const el = document.getElementById(id); 
                if (el) el.innerHTML = (id.includes('contrat') ? `<option value="">-- Fiscal ${id.slice(-1)} --</option>` : '<option value="">-- Selecione --</option>') + opts;
            });
        };

        // ======================== LOCALIZAÇÕES ========================
        window.salvarLocalizacao = async function () {
            const depto = (document.getElementById('local-novo').value || document.getElementById('local-departamento').value).trim();
            if (!depto) { alert('Selecione ou digite'); return; }
            try { if (window.supabase) await window.supabase.from('locations').upsert({ name: depto }, { onConflict: 'name' }); window.loadFiscalData(); } catch (err) { console.error(err); }
        };

        window.atualizarTabelaLocalizacoes = function () {
            const tbody = document.getElementById('localizacao-list');
            if (!tbody) return;
            tbody.innerHTML = window.fiscalData.localizacoes.length === 0 ? '<tr><td colspan="2" style="text-align: center; color: #999;">Nenhuma</td></tr>' :
                window.fiscalData.localizacoes.map((l, i) => `<tr><td>${l.departamento}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirLocalizacao('${l.departamento}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
        };

        window.excluirLocalizacao = async function(name) {
            if (confirm('Excluir?')) {
                if (window.supabaseClient) await window.supabaseClient.from('locations').delete().eq('name', name);
                window.loadFiscalData();
            }
        };

        // ======================== LANÇAMENTOS (MEDIÇÕES) ========================
        window.lancOnEmpresaChange = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const selContrato = document.getElementById('lanc-contrato');
            if (!empresa) { selContrato.innerHTML = '<option value="">-- Selecione --</option>'; selContrato.disabled = true; return; }
            const contratos = window.fiscalData.contratos.filter(c => c.supplier_name === empresa);
            selContrato.innerHTML = '<option value="">-- Selecione --</option>' + contratos.map(c => `<option value="${c.contract_number}">${c.contract_number}</option>`).join('');
            selContrato.disabled = false;
            window.lancAtualizarTodosEmpenhosSelects();
        };

        window.lancAtualizarTodosEmpenhosSelects = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const contrato = document.getElementById('lanc-contrato').value;
            const selects = document.querySelectorAll('.lanc-empenho-select');
            selects.forEach(sel => {
                if (!empresa) { sel.innerHTML = '<option value="">-- Selecione --</option>'; return; }
                const enempos = window.fiscalData.empenhos.filter(e => e.supplier_name === empresa && (!contrato || e.contract_number === contrato));
                sel.innerHTML = '<option value="">-- Selecione --</option>' + enempos.map(e => `<option value="${e.ne_number}" data-valor="${e.value}">${e.ne_number} \u2014 R$ ${parseFloat(e.value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</option>`).join('');
            });
            window.lancCalcSaldo();
        };

        window.lancAdicionarEmpenho = function () {
            const div = document.createElement('div'); div.className = 'lanc-empenho-row'; div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';
            div.innerHTML = `<select class="lanc-empenho-select form-control" onchange="window.lancOnNovoEmpenhoChange(this)" style="flex: 1;"><option value="">-- Selecione --</option></select><div class="lanc-money-wrap" style="width: 140px;"><span>R$</span><input type="text" class="lanc-valor-empenho" placeholder="0,00" readonly style="padding-left: 2.1rem;"></div><button type="button" class="btn-tiny btn-danger" onclick="window.lancRemoverEmpenho(this)" style="padding: 6px 10px;"><i class="fas fa-times"></i></button>`;
            document.getElementById('lanc-empenhos-container').appendChild(div);
            window.lancAtualizarTodosEmpenhosSelects();
        };

        window.lancRemoverEmpenho = function (btn) {
            if (document.getElementById('lanc-empenhos-container').children.length > 1) { btn.closest('.lanc-empenho-row').remove(); window.lancCalcSaldo(); }
        };

        window.lancOnNovoEmpenhoChange = function (select) {
            const opt = select.options[select.selectedIndex];
            const row = select.closest('.lanc-empenho-row');
            row.querySelector('.lanc-valor-empenho').value = opt && opt.value ? parseFloat(opt.getAttribute('data-valor')).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
            window.lancCalcSaldo();
        };

        window.lancCalcSaldo = function () {
            const valorNf = parseFloat(document.getElementById('lanc-valor-nf').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
            let totalEmpenhos = 0;
            document.querySelectorAll('.lanc-valor-empenho').forEach(el => { totalEmpenhos += parseFloat(el.value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0; });
            const infoBox = document.getElementById('lanc-empenho-info');
            if (totalEmpenhos > 0) {
                infoBox.style.display = 'flex';
                document.getElementById('lanc-empenho-info-txt').innerHTML = `<strong>Total:</strong> R$ ${totalEmpenhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | <strong>NF:</strong> R$ ${valorNf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | <strong>Saldo:</strong> R$ ${(totalEmpenhos - valorNf).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            } else infoBox.style.display = 'none';
        };

        window.salvarMapa = async function () {
            const data = {
                year: document.getElementById('lanc-ano').value,
                month: document.getElementById('lanc-mes').value,
                supplier_name: document.getElementById('lanc-empresa').value,
                contract_number: document.getElementById('lanc-contrato').value,
                process_number: document.getElementById('lanc-proc').value,
                invoice_number: document.getElementById('lanc-nf').value,
                invoice_value: parseFloat(document.getElementById('lanc-valor-nf').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0,
                notes: document.getElementById('lanc-obs').value,
                status: 'Pendente'
            };
            const enempos = Array.from(document.querySelectorAll('.lanc-empenho-select')).map(s => s.value).filter(v => v);
            if (!data.supplier_name || !data.invoice_number || enempos.length === 0) { alert('Preencha os campos obrigatórios'); return; }
            try {
                if (window.supabase) {
                    for (const ne of enempos) {
                        const valEmp = parseFloat(document.querySelector(`.lanc-empenho-select option[value="${ne}"]`).getAttribute('data-valor')) || 0;
                        await window.supabase.from('fiscal_measurements').insert({ ...data, empenho_number: ne, projected_balance: valEmp - (data.invoice_value / enempos.length) });
                    }
                }
                alert('Medição salva!');
                window.loadFiscalData();
            } catch (err) { alert(err.message); }
        };

        window.lancFiltrarMedicoes = function () {
            const filtered = (window.lancamentos || []);
            const tbody = document.getElementById('lanc-medicoes-tbody');
            if (!tbody) return;
            tbody.innerHTML = filtered.length === 0 ? '<tr class="lanc-empty-row"><td colspan="9">Nenhuma</td></tr>' : 
                filtered.map(r => `<tr><td>${r.month}/${r.year}</td><td>${new Date(r.created_at).toLocaleDateString('pt-BR')}</td><td>${r.invoice_number}</td><td>${r.empenho_number}</td><td>${r.process_number}</td><td><span class="lanc-badge ${r.status === 'Pago' ? 'lanc-badge-ok' : 'lanc-badge-pending'}">${r.status}</span></td><td>R$ ${parseFloat(r.invoice_value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td><td>R$ ${parseFloat(r.projected_balance).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td><td><button class="btn-tiny btn-danger" onclick="window.excluirMedicao('${r.id}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
        };

        window.excluirMedicao = async function(id) {
            if (confirm('Excluir?')) { if (window.supabaseClient) await window.supabaseClient.from('fiscal_measurements').delete().eq('id', id); window.loadFiscalData(); }
        };

        window.loadFiscalData = async function () {
            if (!window.supabaseClient) await window.initializeSupabase();
            if (!window.supabaseClient) return;
            try {
                const [fornec, contr, emp, hand, meas, locs] = await Promise.all([
                    supabase.from('suppliers').select('*').order('name'),
                    supabase.from('fiscal_contracts').select('*').order('contract_number'),
                    supabase.from('fiscal_empenhos').select('*').order('ne_number'),
                    supabase.from('handlers').select('*').order('name'),
                    supabase.from('fiscal_measurements').select('*').order('created_at', { ascending: false }),
                    supabase.from('locations').select('*').order('name')
                ]);
                window.fiscalData.fornecedores = fornec.data || [];
                window.fiscalData.contratos = contr.data || [];
                window.fiscalData.empenhos = emp.data || [];
                window.fiscalData.fiscais = hand.data || [];
                window.fiscalData.localizacoes = (locs.data || []).map(l => ({ departamento: l.name }));
                window.lancamentos = meas.data || [];
                
                window.atualizarTabelaFornecedores();
                window.atualizarTabelaContratos();
                window.atualizarTabelaEmpenhos();
                window.atualizarTabelaFiscais();
                window.atualizarTabelaLocalizacoes();
                window.lancFiltrarMedicoes();
            } catch (err) { console.error(err); }
        };

        window.gerarMapa = function () {
            const empresa = document.getElementById('mapa-empresa').value;
            const res = document.getElementById('mapa-resultado');
            if (!empresa) return;
            res.style.display = 'block';
            const contr = window.fiscalData.contratos.filter(c => c.supplier_name === empresa);
            document.getElementById('mapa-conteudo').innerHTML = `<table class="fiscal-table"><thead><tr><th>Contrato</th><th>Processo</th><th>Valor</th></tr></thead><tbody>${contr.map(c => `<tr><td>${c.contract_number}</td><td>${c.process_number || '-'}</td><td>R$ ${parseFloat(c.value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td></tr>`).join('')}</tbody></table>`;
        };

        window.gerarRelatorio = function () {
            const empresa = document.getElementById('relatorio-empresa').value;
            const res = document.getElementById('relatorio-resultado');
            if (!empresa) return;
            res.style.display = 'block';
            const filtered = window.lancamentos.filter(r => r.supplier_name === empresa);
            document.getElementById('relatorio-conteudo').innerHTML = `<table class="fiscal-table"><thead><tr><th>NF</th><th>Empenho</th><th>Valor</th></tr></thead><tbody>${filtered.map(r => `<tr><td>${r.invoice_number}</td><td>${r.empenho_number}</td><td>R$ ${parseFloat(r.invoice_value).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td></tr>`).join('')}</tbody></table>`;
        };
'@

    $finalContent = $before + $newLogic + "`n" + $after
    [System.IO.File]::WriteAllText($path, $finalContent)
    Write-Host "File index.html successfully repaired."
}
else {
    Write-Error "Could not find anchors in index.html. Start: $startIndex, End: $endIndex"
}
