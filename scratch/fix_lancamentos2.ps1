$file = "e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# ======= 1) Substituir bloco do container de empenhos + grid abaixo =======
$oldBlock = '<div id="lanc-empenhos-container">
                                      <div class="lanc-empenho-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                                        <select class="lanc-empenho-select form-control" onchange="window.lancOnEmpenhoChange()" style="flex: 1;">
                                          <option value="">-- Selecione --</option>
                                        </select>
                                        <div class="lanc-money-wrap" style="width: 140px;">
                                          
                                        
                                      </div>
                                    </div>
                                  </div>
                                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; margin-top: 1rem;">
                                    <div class="lanc-field"><label>N.o Proc. Pagamento</label><input type="text" id="lanc-proc" placeholder="ex: 0125/2026"></div>
                                    <div class="lanc-field"><label>N.o da Nota Fiscal</label><input type="text" id="lanc-nf" placeholder="ex: NF-000123"></div>
                                    <div class="lanc-field"><label>Valor Total das NF</label><div class="lanc-money-wrap"><span>R$</span><input type="text" id="lanc-valor-nf" placeholder="0,00" oninput="window.lancCalcSaldo()"></div></div>
                                  </div>'

$newBlock = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                                    <div>
                                      <div id="lanc-empenhos-container">
                                        <div class="lanc-empenho-row" style="margin-bottom: 0.5rem;">
                                          <select class="lanc-empenho-select form-control" onchange="window.lancOnEmpenhoChange()" style="width:100%;">
                                            <option value="">-- Selecione --</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="lanc-field">
                                      <label style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">N.&#186; Proc. Pagamento</label>
                                      <input type="text" id="lanc-proc" placeholder="ex: 0125/2026" style="width:100%;box-sizing:border-box;padding:0.5rem 0.75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;color:#1e293b;background:#fff;outline:none;font-family:inherit;">
                                    </div>
                                  </div>
                                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 1rem;">
                                    <div class="lanc-field"><label>N.&#186; da Nota Fiscal</label><input type="text" id="lanc-nf" placeholder="ex: NF-000123"></div>
                                    <div class="lanc-field"><label>Valor Total das NF</label><div class="lanc-money-wrap"><span>R$</span><input type="text" id="lanc-valor-nf" placeholder="0,00" oninput="window.lancCalcSaldo()"></div></div>
                                  </div>'

if ($content.Contains($oldBlock)) {
    $content = $content.Replace($oldBlock, $newBlock)
    Write-Host "Bloco HTML substituido com sucesso!"
} else {
    Write-Host "AVISO: Bloco exato nao encontrado - tentando localizacao parcial..."
    $idxPartial = $content.IndexOf('lanc-empenhos-container')
    Write-Host "Idx container: $idxPartial"
}

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)