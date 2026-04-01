// Script de inicialização e funções auxiliares
// Este arquivo é carregado após o index.html e fornece funções base

        console.log('=== SCRIPT INITIALIZING v2.0 ===');

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

        // Config e Estado Global
        var SUPABASE_URL = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
        var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';

        window.supabase = window.supabase || {};
        if (window.supabase.createClient) {
            try {
                window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log('Supabase client initialized via createClient');
            } catch (e) {
                console.error('Supabase Client Error:', e);
            }
        }
        var supabase = window.supabaseClient;

        window.state = {
            processes: [], suppliers: [], locations: [], objects: [],
            statuses: [], handlers: [], users: [], currentConfigType: ''
        };
        var statusChart, locationChart;

        // Export utilities
        window.formatCurrency = function(v) {
            const n = parseFloat(v);
            return isNaN(n) ? (v || '') : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
        };

        // Info Modal Functions
        const infoContent = {
            faq: {
                title: '<i class="fas fa-question-circle"></i> Perguntas Frequentes',
                subtitle: 'Tire suas dúvidas sobre o sistema',
                content: '<p>Utilize seu e-mail institucional e senha cadastrada para fazer login.</p>'
            },
            manual: {
                title: '<i class="fas fa-book-open"></i> Manual do Usuário',
                subtitle: 'Guia completo de utilização do sistema',
                content: '<p>O sistema gerencia processos de pagamento da Secretaria Municipal de Educação.</p>'
            },
            termos: {
                title: '<i class="fas fa-file-contract"></i> Política de Uso',
                subtitle: 'Termos e condições de uso do sistema',
                content: '<p>O acesso é restrito a servidores municipais devidamente autorizados.</p>'
            }
        };

        window.openInfoModal = function(route) {
            const modal = document.getElementById('infoModal');
            const titleEl = document.getElementById('infoModalTitle');
            const subtitleEl = document.getElementById('infoModalSubtitle');
            const contentEl = document.getElementById('infoModalContent');
            
            const content = infoContent[route];
            if (content) {
                titleEl.innerHTML = content.title;
                subtitleEl.innerText = content.subtitle;
                contentEl.innerHTML = content.content;
                modal.classList.add('visible');
                modal.style.display = 'flex';
            }
        };

        // Setup click handlers for data-route links
        document.querySelectorAll('[data-route]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const route = this.getAttribute('data-route');
                window.openInfoModal(route);
            });
        });

        // End of 2026_script.js
