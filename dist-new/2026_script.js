// Script de inicialização e funções auxiliares - Versão Simplificada
// Este arquivo fornece apenas utilitários de Menu, Modais e Formatação para evitar conflitos com o index.html

console.log('=== SCRIPT AUXILIAR INICIADO ===');

// *** MENU TOGGLE ***
window.toggleMenu = function () {
    var sideMenu = document.getElementById('side-menu');
    var overlay = document.getElementById('overlay');
    if (!sideMenu || !overlay) return;
    sideMenu.classList.toggle('open');
    overlay.classList.toggle('visible');
    if (!sideMenu.classList.contains('open')) {
        document.querySelectorAll('.submenu').forEach(function (sub) { sub.classList.remove('open'); });
        document.querySelectorAll('.has-submenu').forEach(function (link) { link.classList.remove('active'); });
    }
};

window.closeAllModals = function () {
    var ids = ['accessibility-modal', 'cookie-modal', 'processControlModal', 'processConfigModal', 'processHistoryModal', 'remanejamento-modal', 'comments-modal', 'userManagementModal', 'processDetailsModal', 'history-modal', 'infoModal', 'confirm-modal', 'statusSummaryModal'];
    ids.forEach(function (id) {
        var m = document.getElementById(id);
        if (m) { m.classList.remove('visible'); m.style.display = 'none'; }
    });
    var overlay = document.getElementById('overlay');
    var sideMenu = document.getElementById('side-menu');
    if (overlay) { overlay.classList.remove('visible'); overlay.style.display = 'none'; }
    if (sideMenu) sideMenu.classList.remove('open');
};

window.closeModal = function (id) {
    var m = document.getElementById(id);
    if (m) { m.classList.remove('visible'); m.style.display = 'none'; }
};

// Export utilities
window.formatCurrency = function (v) {
    const n = parseFloat(v);
    return isNaN(n) ? (v || '') : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

// As funções de Info Modal e a variável infoContent agora são gerenciadas centralmente no index.html 
// para evitar erros de declaração duplicada.

// End of script
