const fs = require('fs');
const file = 'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<div class="lanc-main-card">';
const endMarker   = '<div class="lanc-table-area">';

const start = content.indexOf(startMarker);
const end   = content.indexOf(endMarker);

if (start < 0 || end < 0) { console.error('Markers not found'); process.exit(1); }

const newCard = `<div class="lanc-main-card">

                                <!-- ═══ LINHA SUPERIOR: 3 colunas ═══ -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">

                                  <!-- Col 1: Período de Competência -->
                                  <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.1rem 1.25rem;">
                                    <div class="lanc-section-header" style="margin-bottom:0.6rem;">
                                      <div class="lanc-section-icon"><i class="fas fa-calendar-alt"></i></div>
                                      <span class="lanc-section-title">Período de Competência</span>
                                    </div>
                                    <div class="lanc-section-divider"></div>
                                    <div class="lanc-grid-2">
                                      <div class="lanc-field">
                                        <label>Ano de Competência</label>
                                        <select id="lanc-ano" onchange="window.lancFiltrarMedicoes()">
                                          <option value="">-- Selecione --</option>
                                          <option value="2024">2024</option>
                                          <option value="2025">2025</option>
                                          <option value="2026" selected>2026</option>
                                          <option value="2027">2027</option>
                                        </select>
                                      </div>
                                      <div class="lanc-field">
                                        <label>Mês de Competência</label>
                                        <select id="lanc-mes">
                                          <option value="">-- Selecione --</option>
                                          <option value="1">Janeiro</option>
                                          <option value="2">Fevereiro</option>
                                          <option value="3">Março</option>
                                          <option value="4" selected>Abril</option>
                                          <option value="5">Maio</option>
                                          <option value="6">Junho</option>
                                          <option value="7">Julho</option>
                                          <option value="8">Agosto</option>
                                          <option value="9">Setembro</option>
                                          <option value="10">Outubro</option>
                                          <option value="11">Novembro</option>
                                          <option value="12">Dezembro</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  <!-- Col 2: Empresa (Fornecedor) — standalone, sem card -->
                                  <div style="display:flex; flex-direction:column; justify-content:center; padding: 0 0.25rem;">
                                    <div class="lanc-field" style="margin:0;">
                                      <label style="font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Empresa (Fornecedor)</label>
                                      <div id="lanc-empresa-wrapper" style="position:relative; margin-top:0.3rem;">
                                        <input type="text" id="lanc-empresa-search" placeholder="Digite para buscar..." autocomplete="off"
                                          onfocus="window.lancAbrirDropdownEmpresa()"
                                          oninput="window.lancFiltrarDropdownEmpresa(this.value)"
                                          style="width:100%;box-sizing:border-box;padding:0.5rem 2.2rem 0.5rem 0.75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;color:#1e293b;background:#fff;transition:border-color .18s,box-shadow .18s;outline:none;font-family:inherit;">
                                        <i class="fas fa-search" style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:0.8rem;pointer-events:none;"></i>
                                        <input type="hidden" id="lanc-empresa" value="">
                                        <div id="lanc-empresa-dropdown" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.13);max-height:220px;overflow-y:auto;z-index:2000;padding:4px;">
                                          <div id="lanc-empresa-options"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <!-- Col 3: Dados do Contrato -->
                                  <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.1rem 1.25rem;">
                                    <div class="lanc-section-header" style="margin-bottom:0.6rem;">
                                      <div class="lanc-section-icon"><i class="fas fa-file-contract"></i></div>
                                      <span class="lanc-section-title">Dados do Contrato</span>
                                    </div>
                                    <div class="lanc-section-divider"></div>
                                    <div class="lanc-field" style="margin:0;">
                                      <label>N.&#186; Contrato</label>
                                      <select id="lanc-contrato" disabled onchange="window.lancOnContratoChange()">
                                        <option value="">-- Selecione a Empresa primeiro --</option>
                                      </select>
                                    </div>
                                  </div>

                                </div><!-- /linha superior -->

                                <!-- ═══ DADOS DO PAGAMENTO ═══ -->
                                <div class="lanc-section">
                                  <div class="lanc-section-header">
                                    <div class="lanc-section-icon"><i class="fas fa-money-check-alt"></i></div>
                                    <span class="lanc-section-title">Dados do Pagamento</span>
                                  </div>
                                  <div class="lanc-section-divider"></div>

                                  <!-- Campo N.º Contrato (vinculado ao empenho) -->
                                  <div class="lanc-field" style="margin-bottom:1rem;">
                                    <label>N.&#186; Contrato</label>
                                    
                                  </div>

                                  <!-- Box interno: Empenho + Proc. Pagamento + NF -->
                                  <div style="padding:1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">

                                    <!-- Linha 1: Empenho | Proc. Pagamento -->
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                                      <div>
                                        <label style="font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:0.3rem;">N.&#186; Empenho(s)</label>
                                        <div id="lanc-empenhos-container">
                                          <div class="lanc-empenho-row" style="margin-bottom:0.5rem;">
                                            <select class="lanc-empenho-select form-control" onchange="window.lancOnEmpenhoChange()" style="width:100%;">
                                              <option value="">-- Selecione --</option>
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="lanc-field" style="margin:0;">
                                        <label>N.&#186; Proc. Pagamento</label>
                                        <input type="text" id="lanc-proc" placeholder="ex: 0125/2026"
                                          style="width:100%;box-sizing:border-box;padding:0.5rem 0.75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;color:#1e293b;background:#fff;outline:none;font-family:inherit;">
                                      </div>
                                    </div>

                                    <!-- Linha 2: NF | Valor NF | Botão -->
                                    <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:1rem; align-items:flex-end;">
                                      <div class="lanc-field" style="margin:0;">
                                        <label>N.&#186; da Nota Fiscal</label>
                                        <input type="text" id="lanc-nf" placeholder="ex: NF-000123">
                                      </div>
                                      <div class="lanc-field" style="margin:0;">
                                        <label>Valor Total das NF</label>
                                        <div class="lanc-money-wrap">
                                          <span>R$</span>
                                          <input type="text" id="lanc-valor-nf" placeholder="0,00" oninput="window.lancCalcSaldo()">
                                        </div>
                                      </div>
                                      <button type="button" class="lanc-btn-secondary" onclick="window.lancAdicionarNF()"
                                        style="white-space:nowrap; padding:0.5rem 1rem; align-self:flex-end;">
                                        <i class="fas fa-plus"></i> Adicionar Nota Fiscal
                                      </button>
                                    </div>

                                    <!-- Info box saldo -->
                                    <div class="lanc-info-box" id="lanc-empenho-info" style="display:none; margin-top:0.75rem;">
                                      <i class="fas fa-info-circle"></i>
                                      <span id="lanc-empenho-info-txt"></span>
                                    </div>

                                  </div><!-- /box interno -->
                                </div><!-- /Dados do Pagamento -->

                                <!-- ═══ OBSERVAÇÕES ═══ -->
                                <div class="lanc-section">
                                  <div class="lanc-section-header">
                                    <div class="lanc-section-icon"><i class="fas fa-sticky-note"></i></div>
                                    <span class="lanc-section-title">Observações</span>
                                  </div>
                                  <div class="lanc-section-divider"></div>
                                  <div class="lanc-obs-row">
                                    <div class="lanc-field" style="flex:1;">
                                      <textarea id="lanc-obs" placeholder="Adicione observações importantes sobre este lançamento..."></textarea>
                                    </div>
                                    <button class="lanc-btn-primary" onclick="window.salvarMapa()" style="flex-shrink:0;">
                                      <i class="fas fa-save"></i> Salvar Mapa
                                    </button>
                                  </div>
                                </div>

                              </div><!-- /lanc-main-card -->
                              `;

content = content.substring(0, start) + newCard + content.substring(end);
fs.writeFileSync(file, content, 'utf8');
console.log('✓ lanc-main-card substituído com o novo layout!');
console.log(`  Caracteres antes: ${start} | após: ${content.indexOf(endMarker)}`);
