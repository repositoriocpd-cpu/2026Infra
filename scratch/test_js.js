
        window.lancIrParaAba = function(abaId) {
            let btnIndex = -1;
            if (abaId === 'fornecedores') btnIndex = 0;
            else if (abaId === 'contratos') btnIndex = 3;
            else if (abaId === 'empenhos') btnIndex = 4;
            
            if (btnIndex >= 0) {
                const btns = document.querySelectorAll('.fiscal-tab');
                if (btns.length > btnIndex) {
                    window.switchFiscalTab(abaId, btns[btnIndex]);
                }
            }
        };

        window.lancBlocoContador = 0;

        window.lancNovoBlocoEmpenho = function() {
            window.lancBlocoContador++;
            const id = window.lancBlocoContador;
            
            const div = document.createElement('div');
            div.className = 'lanc-bloco-empenho';
            div.id = 'bloco-emp-' + id;
            div.dataset.blocoId = id;
            div.style.cssText = 'padding:1.2rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:1.5rem; position:relative; box-shadow:0 2px 4px rgba(0,0,0,0.02);';
            
            const empresa = document.getElementById('lanc-empresa').value;
            const contrato = (document.getElementById('lanc-contrato') || {value:''}).value;
            
            let empenhosSelectHTML = '<option value="">-- Selecione --</option>';
            if (empresa && window.fiscalData && window.fiscalData.empenhos) {
                const enempos = window.fiscalData.empenhos.filter(e => e.supplier_name === empresa && (!contrato || e.contract_number === contrato));
                empenhosSelectHTML += enempos.map(e => '<option value="' + e.ne_number + '" data-valor="' + e.value + '">' + e.ne_number + ' \u2014 R$ ' + parseFloat(e.value).toLocaleString('pt-BR', {minimumFractionDigits:2}) + '</option>').join('');
            }

            div.innerHTML = `
                <button type="button" onclick="this.closest('.lanc-bloco-empenho').remove(); window.lancAtualizarTodosEmpenhosSelects();" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:#dc2626; cursor:pointer;" title="Remover este Empenho"><i class="fas fa-trash-alt"></i> Excluir Bloco</button>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.2rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem;">
                    <div style="background:#cbd5e1; color:#334155; font-size:0.7rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:4px;">#${id}</div>
                    <h4 style="margin:0; font-size:0.95rem; color:#0f172a;">Configuração de Novo Empenho e Atribuição de NFs</h4>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:1.2rem;">
                    <div class="lanc-field" style="margin:0;">
                         <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.3rem;">
                            <label style="margin-bottom:0;">N.º Empenho Selecionado</label>
                            <a href="#" onclick="const bs = Array.from(document.querySelectorAll('.fiscal-tab')); const b = bs.find(e => e.textContent.includes('Empenhos')); if(b) b.click(); return false;" style="font-size:0.75rem; font-weight:600; color:#0f172a; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#0f172a'">Adicionar Empenho</a>
                         </div>
                         <select class="lanc-empenho-select form-control" onchange="window.lancMudouEmpenho('${id}')">
                            ${empenhosSelectHTML}
                         </select>
                    </div>
                    <div class="lanc-field" style="margin:0;">
                         <label>N.º Processo de Pagamento</label>
                         <input type="text" class="lanc-proc-input form-control" placeholder="ex: 0125/2026">
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:1.2rem; margin-bottom:1.2rem;">
                     <h5 style="margin:0 0 1rem 0; font-size:0.85rem; color:#475569; text-transform:uppercase; letter-spacing:0.05em;"><i class="fas fa-file-invoice" style="margin-right:0.4rem;"></i> Composição de Notas Fiscais</h5>
                     
                     <!-- Tabela visual de NFs no Bloco -->
                     <div class="lanc-nfs-container" id="nfs-container-${id}" style="margin-bottom:1rem;"></div>

                     <!-- Formulário de inserção de NF -->
                     <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:0.8rem; align-items:flex-end; padding-top:0.8rem; border-top:1px dashed #e2e8f0;">
                        <div class="lanc-field" style="margin:0;">
                             <label>N.º da Nota Fiscal</label>
                             <input type="text" id="nfinp-num-${id}" class="form-control" placeholder="ex: 123456">
                        </div>
                        <div class="lanc-field" style="margin:0;">
                             <label>Valor da Nota</label>
                             <div class="lanc-money-wrap">
                                <span>R$</span>
                                <input type="text" id="nfinp-val-${id}" class="form-control" placeholder="0,00" onkeydown="if(event.key==='Enter'){window.lancAdicionarNFNaLista('${id}');event.preventDefault();}">
                             </div>
                        </div>
                        <button type="button" class="lanc-btn-secondary" onclick="window.lancAdicionarNFNaLista('${id}')" style="padding:0.5rem 1rem;"><i class="fas fa-plus"></i> Inserir na Lista</button>
                     </div>
                </div>

                <div class="lanc-info-box" id="info-bloco-${id}" style="margin:0;">
                     <i class="fas fa-info-circle"></i>
                     <span class="bloco-info-text">Selecione o Empenho acima</span>
                </div>
            `;

            document.getElementById('lanc-blocos-container').appendChild(div);
        };

        window.lancAdicionarNFNaLista = function(id) {
            const iptNum = document.getElementById('nfinp-num-' + id);
            const iptVal = document.getElementById('nfinp-val-' + id);
            
            if(!iptNum.value || !iptVal.value) { alert('Preencha Número e Valor da NF'); return; }
            
            const valNumerico = parseFloat(iptVal.value.replace(/[^0-9,]/g,'').replace(',','.')) || 0;
            if(valNumerico <= 0) { alert('O valor da NF deve ser maior que zero'); return; }
            
            const div = document.createElement('div');
            div.className = 'lanc-nf-item';
            div.dataset.nfnum = iptNum.value;
            div.dataset.nfval = valNumerico;
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border-left:3px solid #3b82f6; padding:0.6rem 0.8rem; margin-bottom:0.4rem; border-top:1px solid #e2e8f0; border-right:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; border-radius:4px; font-size:0.85rem;';
            
            div.innerHTML = `
                <div><span style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">Nota Fiscal</span> <strong style="font-size:0.95rem; margin-left:0.3rem;">${iptNum.value}</strong> <span style="color:#cbd5e1; margin:0 0.8rem;">|</span> <span style="color:#10b981; font-weight:700;">R$ ${valNumerico.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                <button type="button" onclick="this.closest('.lanc-nf-item').remove(); window.lancMudouEmpenho('${id}');" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:1rem;" title="Remover Item" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#64748b'"><i class="fas fa-times-circle"></i></button>
            `;
            
            document.getElementById('nfs-container-' + id).appendChild(div);
            
            iptNum.value = '';
            iptVal.value = '';
            iptNum.focus();
            
            window.lancMudouEmpenho(id);
        };

        window.lancMudouEmpenho = function(id) {
            const bloco = document.getElementById('bloco-emp-' + id);
            if (!bloco) return;
            
            const sel = bloco.querySelector('.lanc-empenho-select');
            const opt = sel.options[sel.selectedIndex];
            
            let baseEmpenho = 0;
            if (opt && opt.value) {
                baseEmpenho = parseFloat(opt.getAttribute('data-valor')) || 0;
            }
            
            let somaNF = 0;
            const nfItems = bloco.querySelectorAll('.lanc-nf-item');
            nfItems.forEach(it => {
                somaNF += parseFloat(it.dataset.nfval) || 0;
            });
            
            const saldo = baseEmpenho - somaNF;
            const infoText = bloco.querySelector('.bloco-info-text');
            const infoBox = document.getElementById('info-bloco-' + id);
            
            let corSaldo = saldo < 0 ? '#ef4444' : (saldo > 0 ? '#0369a1' : '#16a34a');
            
            if (baseEmpenho > 0 || somaNF > 0) {
                infoText.innerHTML = `<strong>Valor do Empenho:</strong> R$ ${baseEmpenho.toLocaleString('pt-BR', {minimumFractionDigits:2})} <span style="margin:0 0.5rem; color:#bfdbfe;">|</span> <strong>NFs Alocadas (${nfItems.length}):</strong> R$ ${somaNF.toLocaleString('pt-BR', {minimumFractionDigits:2})} <span style="margin:0 0.5rem; color:#bfdbfe;">|</span> <strong>Saldo Projetado Final:</strong> <span style="color:${corSaldo}; font-weight:800; font-size:1.05em;">R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>`;
                if (saldo < 0) {
                    infoBox.style.backgroundColor = '#fef2f2';
                    infoBox.style.borderColor = '#fecaca';
                    infoBox.style.color = '#b91c1c';
                } else {
                    infoBox.style.backgroundColor = '#eff6ff';
                    infoBox.style.borderColor = '#bfdbfe';
                    infoBox.style.color = '#1d4ed8';
                }
            } else {
                infoText.innerHTML = "Selecione o Empenho acima e preencha as Notas Fiscais";
                infoBox.style.backgroundColor = '#eff6ff';
                infoBox.style.borderColor = '#bfdbfe';
                infoBox.style.color = '#1d4ed8';
            }
        };

        window.lancAtualizarTodosEmpenhosSelects = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const contrato = (document.getElementById('lanc-contrato') || {value:''}).value;
            
            let opts = '<option value="">-- Selecione --</option>';
            if (empresa && window.fiscalData && window.fiscalData.empenhos) {
                const enempos = window.fiscalData.empenhos.filter(e => e.supplier_name === empresa && (!contrato || e.contract_number === contrato));
                opts += enempos.map(e => '<option value="' + e.ne_number + '" data-valor="' + e.value + '">' + e.ne_number + ' \u2014 R$ ' + parseFloat(e.value).toLocaleString('pt-BR', {minimumFractionDigits:2}) + '</option>').join('');
            }
            
            document.querySelectorAll('.lanc-empenho-select').forEach(sel => {
                const valAtual = sel.value;
                sel.innerHTML = opts;
                if(valAtual && Array.from(sel.options).some(o => o.value===valAtual)) sel.value = valAtual;
            });
            
            document.querySelectorAll('.lanc-bloco-empenho').forEach(b => {
                window.lancMudouEmpenho(b.dataset.blocoId);
            });
        };

        window.salvarMapa = async function () {
            const year = document.getElementById('lanc-ano').value;
            const month = document.getElementById('lanc-mes').value;
            const supplier_name = document.getElementById('lanc-empresa').value;
            const contract_number = document.getElementById('lanc-contrato').value;
            const notes = document.getElementById('lanc-obs').value;
            
            if (!supplier_name) { alert('Selecione a Empresa (Fornecedor) primeiro.'); return; }
            
            const blocos = document.querySelectorAll('.lanc-bloco-empenho');
            if (blocos.length === 0) { alert('Adicione pelo menos um bloco de Empenho.'); return; }
            
            let rowsToInsert = [];
            let hasError = false;
            
            blocos.forEach(b => {
                const empNum = b.querySelector('.lanc-empenho-select').value;
                const procNum = b.querySelector('.lanc-proc-input').value;
                
                if (!empNum) { alert('Existe um bloco com Empenho vazio. Preencha-o ou exclua o bloco.'); hasError = true; return; }
                
                const nfs = Array.from(b.querySelectorAll('.lanc-nf-item'));
                if (nfs.length === 0) { alert('O Empenho ' + empNum + ' n\xe3o possui Notas Fiscais inseridas na lista. Use o bot\xe3o "Inserir na Lista".'); hasError = true; return; }
                
                const opt = b.querySelector('.lanc-empenho-select option[value="'+empNum+'"]');
                let baseVal = parseFloat(opt.getAttribute('data-valor')) || 0;
                
                nfs.forEach(nf => {
                    const nfNum = nf.dataset.nfnum;
                    const nfVal = parseFloat(nf.dataset.nfval) || 0;
                    
                    baseVal = baseVal - nfVal; // Reduz gradativamente simulando a linha no tempo
                    
                    rowsToInsert.push({
                        year,
                        month,
                        supplier_name,
                        contract_number,
                        empenho_number: empNum,
                        process_number: procNum,
                        invoice_number: nfNum,
                        invoice_value: nfVal,
                        projected_balance: baseVal,
                        notes,
                        status: 'Pendente'
                    });
                });
            });
            
            if (hasError) return;
            
            try {
                if (window.supabaseClient) {
                    // Start saving button effect
                    const submitBtn = document.querySelector('.lanc-btn-primary[onclick="window.salvarMapa()"]');
                    if(submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'; }

                    for (const row of rowsToInsert) {
                        const { error } = await window.supabaseClient.from('fiscal_measurements').insert(row);
                        if (error) throw error;
                    }
                    alert('Foram registrados ' + rowsToInsert.length + ' lançamento(s) fiscal(is) individualizado(s) com sucesso!');
                    
                    document.getElementById('lanc-blocos-container').innerHTML = '';
                    document.getElementById('lanc-obs').value = '';
                    window.lancNovoBlocoEmpenho(); 
                    
                    if(submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Mapa'; }
                    
                    window.loadFiscalData();
                } else {
                    alert('Supabase Connection Error. Client not initialized.');
                }
            } catch (err) { 
                alert('Erro ao salvar no banco: ' + err.message); 
                const submitBtn = document.querySelector('.lanc-btn-primary[onclick="window.salvarMapa()"]');
                if(submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Mapa'; }
            }
        };

        // Adiciona um bloco vazio assim que abrir
        document.addEventListener('DOMContentLoaded', () => { setTimeout(() => { if(document.getElementById('lanc-blocos-container')) window.lancNovoBlocoEmpenho(); }, 500); });
