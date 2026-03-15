// Script 0

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
            var ids = ['accessibility-modal', 'cookie-modal', 'processControlModal', 'processConfigModal', 'processHistoryModal', 'remanejamento-modal', 'comments-modal'];
            ids.forEach(function (id) {
                var m = document.getElementById(id);
                if (m) { m.classList.remove('visible'); m.style.display = 'none'; }
            });
            var overlay = document.getElementById('overlay');
            var sideMenu = document.getElementById('side-menu');
            if (overlay) overlay.classList.remove('visible');
            if (sideMenu) sideMenu.classList.remove('open');
        };

        window.closeModal = function (id) {
            var m = document.getElementById(id);
            if (m) { m.classList.remove('visible'); m.style.display = 'none'; }
            var overlay = document.getElementById('overlay');
            if (overlay) overlay.classList.remove('visible');
        };

        // --- GLOBAL CONFIG & STATE ---
        var SUPABASE_URL = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
        var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';

        var supabase;
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase client initialized');
        } catch (e) { console.error('Supabase Client Error:', e); }

        window.state = {
            processes: [], suppliers: [], locations: [], objects: [],
            statuses: [], handlers: [], users: [], currentConfigType: ''
        };
        var statusChart, locationChart;

        // (toggleMenu, toggleSubmenu, closeAllModals already defined above)

        // --- STATE ---

        // --- 3. EVENT LISTENERS SETUP (DOM already ready at end of body) ---
        (function setupListeners() {
            console.log('Setting up listeners...');

            const menuBtn = document.getElementById('menu-toggle');
            if (menuBtn) menuBtn.addEventListener('click', function (e) { e.stopPropagation(); window.toggleMenu(); });

            const overlay = document.getElementById('overlay');
            if (overlay) overlay.addEventListener('click', function (e) { e.stopPropagation(); window.closeAllModals(); });

            // Submenu Logic
            document.querySelectorAll('.has-submenu').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Submenu clicked:', this.innerText.trim());

                    var submenu = this.nextElementSibling;
                    if (!submenu || !submenu.classList.contains('submenu')) {
                        submenu = this.parentElement.querySelector('.submenu');
                    }
                    if (!submenu) return;

                    var isActive = this.classList.contains('active');

                    // Close all other submenus
                    document.querySelectorAll('.submenu').forEach(function (sub) {
                        if (sub !== submenu) sub.classList.remove('open');
                    });
                    document.querySelectorAll('.has-submenu').forEach(function (other) {
                        if (other !== link) other.classList.remove('active');
                    });

                    if (isActive) {
                        submenu.classList.remove('open');
                        this.classList.remove('active');
                    } else {
                        submenu.classList.add('open');
                        this.classList.add('active');
                    }
                });
            });

            // Modal Trigger Shortcuts
            var setupTrigger = function (tid, mid) {
                var btn = document.getElementById(tid);
                if (btn) btn.onclick = function (e) {
                    e.preventDefault();
                    window.closeAllModals();
                    var m = document.getElementById(mid);
                    if (m) { m.classList.add('visible'); m.style.display = 'flex'; }
                    var ov = document.getElementById('overlay');
                    if (ov) ov.classList.add('visible');
                };
            };
            setupTrigger('accessibility-toggle', 'accessibility-modal');
            setupTrigger('cookie-toggle', 'cookie-modal');
            setupTrigger('remanejamento-link', 'remanejamento-modal');
            setupTrigger('comments-toggle', 'comments-modal');

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        window.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            window.animateCounter = function(el) {
                if (el._animating) return;
                var target = +el.getAttribute('data-target');
                if (isNaN(target) || target === 0) {
                    el.innerText = el.getAttribute('data-suffix') || '0';
                    return;
                }
                
                el._animating = true;
                console.log('Animating', el.id, 'to', target);
                var suffix = el.getAttribute('data-suffix') || '';
                var isFloat = target % 1 !== 0;
                var start = null;
                var animate = function (now) {
                    if (!start) start = now;
                    var progress = Math.min((now - start) / 800, 1);
                    var val = progress * target;
                    el.innerText = (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString('pt-BR')) + suffix;
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        el._animating = false;
                        // Final safety check: if target changed while animating, re-run
                        if (+el.getAttribute('data-target') !== target) window.animateCounter(el);
                    }
                };
                requestAnimationFrame(animate);
            };

            document.querySelectorAll('.stat-number').forEach(function (el) { observer.observe(el); });

            // Dark Mode
            var darkToggle = document.getElementById('dark-mode-toggle');
            if (darkToggle) {
                darkToggle.onclick = function (e) {
                    e.preventDefault();
                    document.body.classList.toggle('dark-mode');
                    var icon = darkToggle.querySelector('i');
                    if (icon) {
                        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
                    }
                };
            }

            console.log('Listeners ready. Submenus found:', document.querySelectorAll('.has-submenu').length);
        })();

        // --- 4. APP INITIALIZATION ---
        window.initApp = async function () {
            if (!supabase) return;
            console.log('initApp starting data fetch...');
            try {
                const [suppliers, locations, objects, statuses, handlers, processes] = await Promise.all([
                    supabase.from('suppliers').select('name').order('name'),
                    supabase.from('locations').select('name').order('name'),
                    supabase.from('objects').select('name').order('name'),
                    supabase.from('statuses').select('name').order('name'),
                    supabase.from('handlers').select('name').order('name'),
                    supabase.from('processes').select('*, process_history(*)').order('created_at', { ascending: false })
                ]);

                window.state.suppliers = (suppliers.data || []).map(s => s.name);
                window.state.locations = (locations.data || []).map(l => l.name);
                window.state.objects = (objects.data || []).map(o => o.name);
                window.state.statuses = (statuses.data || []).map(s => s.name);
                window.state.handlers = (handlers.data || []).map(h => h.name);
                window.state.processes = (processes.data || []).map(p => ({
                    id: p.id, ppNumber: p.pp_number, exerciseYear: p.exercise_year, ppAno: p.pp_ano,
                    coverValue: p.cover_value, supplier: p.supplier_name, object: p.object_name,
                    openingDate: p.opening_date, deadline: p.deadline, treatedBy: p.treated_by,
                    status: p.status, location: p.location, locationDate: p.location_date,
                    situation: p.situation, notes: p.notes,
                    history: (p.process_history || []).map(h => ({
                        date: h.history_date, from: h.location_from, to: h.location_to, msg: h.message
                    }))
                }));

                window.updateSelects(); window.updateDashboardCounters(); window.renderProcessTable();
                console.log('initApp success');
            } catch (err) { console.error('initApp Error:', err); }
        };

        if (document.readyState === 'complete') window.initApp();
        else window.addEventListener('load', window.initApp);

        // --- 5. LOGIC & TABLE RENDERING ---
        window.getStatusColor = function(status) {
            const st = (status || '').toUpperCase();
            if (st === 'LIQUIDADO') return '#2ecc71'; // Verde
            if (st === 'DESPACHADO') return '#e67e22'; // Laranja
            if (st === 'CONCLUÍDO') return '#27ae60'; // Verde Escuro
            if (st === 'EM ANÁLISE') return '#005A9C'; // Azul
            if (st === 'PENDENTE') return '#e74c3c'; // Vermelho
            if (st === 'DEVOLVIDO') return '#9b59b6'; // Roxo
            if (st === 'CANCELADO') return '#c0392b'; // Vermelho Escuro
            if (st === 'EM PAGAMENTO') return '#3498db'; // Azul Claro
            if (st === 'AGUARDANDO') return '#f1c40f'; // Amarelo
            if (st === 'ARQUIVADO') return '#7f8c8d'; // Cinza
            return '#f39c12'; // Laranja padrão fallback ou qualquer cor diferenciada para 'outros'
        };
        window.showSection = function (id) {
            document.querySelectorAll('[id$="-section"]').forEach(s => s.style.display = 'none');
            const target = document.getElementById(`${id}-section`);
            if (target) target.style.display = 'block';
            window.closeAllModals();
            if (id === 'dashboard') {
                window.updateDashboardCounters();
                // Re-run counters for visible cards immediately
                document.querySelectorAll('#dashboard-section .stat-number').forEach(el => window.animateCounter(el));
            }

            // Expand container width specifically for the processes table to prevent scrolling
            const mainContainer = document.querySelector('main.container');
            if (mainContainer) {
                if (id === 'processes') {
                    mainContainer.style.maxWidth = '98%';
                } else {
                    mainContainer.style.maxWidth = ''; // Reverts to CSS default (1200px)
                }
            }
        };

        window.updateDashboardCounters = function () {
            const total = window.state.processes.length;
            const pending = window.state.processes.filter(p => p.status && p.status !== 'Concluído').length;

            const set = (id, val) => {
                const el = document.getElementById(id);
                if (el) {
                    el.setAttribute('data-target', val);
                    // Update innerText immediately to avoid blank display
                    const suffix = el.getAttribute('data-suffix') || '';
                    const isFloat = val % 1 !== 0;
                    el.innerText = (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString('pt-BR')) + suffix;
                }
            };

            set('total-processes', total);
            set('treating-processes', pending);
            set('completed-processes', total - pending);
            set('pending-percent', total ? ((pending / total) * 100) : 0);
            
            set('list-total-processes', total);
            set('list-treating-processes', pending);
            set('list-completed-processes', total - pending);
            set('list-pending-percent', total ? ((pending / total) * 100) : 0);

            const localeMap = {
                'finance-processes': 'finanç',
                'cabinet-processes': 'gabinete',
                'purchase-processes': 'compras',
                'warehouse-processes': 'almoxarifado',
                'treasury-processes': 'tesouraria',
                'nutrition-processes': 'nutriç',
                'secretariat-processes': 'secretaria',
                'protocol-processes': 'protocolo'
            };

            Object.keys(localeMap).forEach(id => {
                const count = window.state.processes.filter(p => p.location && p.location.toLowerCase().includes(localeMap[id])).length;
                set(id, count);
                if (id === 'finance-processes') set('list-' + id, count);
            });

            // Trigger animation for visible counters in dashboard
            if (document.getElementById('dashboard-section').style.display !== 'none') {
                document.querySelectorAll('#dashboard-section .stat-number').forEach(el => window.animateCounter(el));
            }
            // Also trigger for process list if visible
            if (document.getElementById('processes-section').style.display !== 'none') {
                document.querySelectorAll('#processes-section .stat-number').forEach(el => window.animateCounter(el));
            }

            const delayed = window.state.processes.filter(p => {
                if (p.status === 'Concluído' || !p.deadline) return false;
                const days = Math.ceil((new Date(p.deadline + 'T23:59:59') - new Date()) / 86400000);
                return days < 0;
            }).length;
            set('delayed-processes', delayed);
            set('list-delayed-processes', delayed);

            window.renderCharts();
        };

        window.renderCharts = function () {
            const sEl = document.getElementById('statusChart');
            const lEl = document.getElementById('locationChart');
            if (!sEl || !lEl) return;
            if (statusChart) statusChart.destroy();
            if (locationChart) locationChart.destroy();

            Chart.register(ChartDataLabels);

            const vibrantColors = [
                '#005A9C', '#2ecc71', '#e67e22', '#e74c3c', '#9b59b6',
                '#3498db', '#1abc9c', '#f1c40f', '#34495e', '#d35400'
            ];

            // Gráfico de Status Dinâmico (inclui todos os status presentes no banco)
            const actualStatuses = [...new Set(window.state.processes.map(p => p.status || 'Não Definido'))];
            const statusCounts = actualStatuses.map(s => window.state.processes.filter(p => (p.status || 'Não Definido') === s).length);

            statusChart = new Chart(sEl.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: actualStatuses,
                    datasets: [{
                        data: statusCounts,
                        backgroundColor: vibrantColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: { size: 10 }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            fontWeight: 'bold',
                            font: { size: 11 },
                            formatter: (value, ctx) => {
                                if (!value || value === 0) return null;
                                let sum = 0;
                                let dataArr = ctx.chart.data.datasets[0].data;
                                dataArr.map(data => { sum += data; });
                                let percentage = (value * 100 / sum).toFixed(1) + "%";
                                return `${value}\n(${percentage})`;
                            },
                            textAlign: 'center'
                        }
                    }
                }
            });

            locationChart = new Chart(lEl.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: window.state.locations,
                    datasets: [{
                        label: 'Processos',
                        data: window.state.locations.map(l => window.state.processes.filter(p => p.location === l).length),
                        backgroundColor: vibrantColors,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 40 // Increased space for labels
                        }
                    },
                    plugins: {
                        datalabels: {
                            color: (ctx) => {
                                return document.body.classList.contains('dark-mode') ? '#60A5FA' : '#1452B5';
                            },
                            anchor: 'end',
                            align: 'end',
                            offset: 5,
                            fontWeight: 'bold',
                            font: { size: 10 },
                            formatter: (value, ctx) => {
                                if (!value || value === 0) return null;
                                let sum = 0;
                                let dataArr = ctx.chart.data.datasets[0].data;
                                dataArr.forEach(data => { sum += data; });
                                let percentage = (value * 100 / sum).toFixed(0) + "%";
                                return `${value} (${percentage})`;
                            }
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: {
                                display: false
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        };

        window._dashboardFilter = null;

        window.filterFromDashboard = function(type, value) {
            window.showSection('processes');
            
            const searchInput = document.getElementById('searchInput');
            const statusFilter = document.getElementById('statusFilter');
            const locationFilter = document.getElementById('locationFilter');
            
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (locationFilter) locationFilter.value = '';

            window._dashboardFilter = null; 

            if (type === 'all') {
                // nada a fazer
            } else if (type === 'status') {
                if (value === '!Concluído') {
                    window._dashboardFilter = { type: 'status_not_completed' };
                } else {
                    const exactStatus = window.state.statuses.find(s => s.toLowerCase() === value.toLowerCase());
                    if (exactStatus && statusFilter) {
                        statusFilter.value = exactStatus;
                    }
                }
            } else if (type === 'location') {
                const exactLoc = window.state.locations.find(l => l.toLowerCase().includes(value.toLowerCase()));
                if (exactLoc && locationFilter) {
                    locationFilter.value = exactLoc;
                }
            } else if (type === 'delayed') {
                window._dashboardFilter = { type: 'delayed' };
            }

            window.filterTable(false);
            const tableSection = document.getElementById('processes-section');
            if (tableSection) {
                window.scrollTo({ top: tableSection.offsetTop - 50, behavior: 'smooth' });
            }
        };

        window.filterTable = function (fromDomInteraction = false) {
            if (fromDomInteraction) {
                window._dashboardFilter = null;
            }

            const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
            const status = document.getElementById('statusFilter')?.value || '';
            const locationArr = document.getElementById('locationFilter')?.value || '';

            const filtered = window.state.processes.filter(p => {
                const matchSearch = !query || 
                    (p.ppNumber || '').toString().toLowerCase().includes(query) ||
                    (p.supplier || '').toLowerCase().includes(query) ||
                    (p.object || '').toLowerCase().includes(query);
                
                let matchStatus = true;
                if (!fromDomInteraction && window._dashboardFilter && window._dashboardFilter.type === 'status_not_completed') {
                    matchStatus = p.status !== 'Concluído';
                } else {
                    matchStatus = !status || (p.status || '').trim().toLowerCase() === status.trim().toLowerCase();
                }

                // Remove prefixos numéricos (ex: "24 - ", "25 -") para comparar corretamente processos antigos
                const stripPrefix = (str) => (str || '').replace(/^\d+\s*[-.]*\s*/, '').trim().toLowerCase();
                const locTarget = stripPrefix(locationArr);
                const matchLoc = !locationArr || stripPrefix(p.location) === locTarget || (p.location || '').toLowerCase().includes(locTarget);

                let matchDelayed = true;
                if (!fromDomInteraction && window._dashboardFilter && window._dashboardFilter.type === 'delayed') {
                    if (p.status === 'Concluído' || !p.deadline) {
                        matchDelayed = false;
                    } else {
                        const days = Math.ceil((new Date(p.deadline + 'T23:59:59') - new Date()) / 86400000);
                        matchDelayed = days < 0;
                    }
                }

                return matchSearch && matchStatus && matchLoc && matchDelayed;
            });

            window.renderProcessTable(filtered);
            
            // Update Filtered Count Label
            const countLabel = document.getElementById('filteredCountLabel');
            if (countLabel) {
                const totalLength = window.state.processes.length;
                if (filtered.length < totalLength || query || status || locationArr || window._dashboardFilter) {
                    countLabel.style.display = 'block';
                    countLabel.innerHTML = `Total dos Processos Filtrados: <span style="background:var(--govbr-blue); color:#fff; padding:2px 8px; border-radius:12px; font-size:0.85rem;">${filtered.length}</span>`;
                } else {
                    countLabel.style.display = 'none';
                }
            }
        };

        window.clearFilters = function() {
            window._dashboardFilter = null;
            const searchInput = document.getElementById('searchInput');
            const statusFilter = document.getElementById('statusFilter');
            const locationFilter = document.getElementById('locationFilter');
            
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (locationFilter) locationFilter.value = '';
            
            window.filterTable(true);
        };

        window.currentSort = { field: '', asc: true };
        window.sortTable = function (field) {
            if (window.currentSort.field === field) {
                window.currentSort.asc = !window.currentSort.asc;
            } else {
                window.currentSort.field = field;
                window.currentSort.asc = true;
            }

            const sorted = [...(window._lastFiltered || window.state.processes)].sort((a, b) => {
                let valA = a[field];
                let valB = b[field];

                // Handle numbers
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return window.currentSort.asc ? valA - valB : valB - valA;
                }

                // Handle dates
                if (field.toLowerCase().includes('date') || field === 'deadline') {
                    const dA = valA ? new Date(valA) : new Date(0);
                    const dB = valB ? new Date(valB) : new Date(0);
                    return window.currentSort.asc ? dA - dB : dB - dA;
                }

                // Default string compare
                valA = (valA || '').toString().toLowerCase();
                valB = (valB || '').toString().toLowerCase();
                if (valA < valB) return window.currentSort.asc ? -1 : 1;
                if (valA > valB) return window.currentSort.asc ? 1 : -1;
                return 0;
            });

            window.renderProcessTable(sorted);
        };

        window.renderProcessTable = function (data = window.state.processes) {
            window._lastFiltered = data;
            const tbody = document.getElementById('processTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            data.forEach(p => {
                const tr = document.createElement('tr');
                tr.onclick = () => window.showProcessDetails(p); // Abre detalhes ao clicar na linha
                
                let daysText = '';
                let daysColor = 'gray';

                if (p.deadline) {
                    const d = Math.ceil((new Date(p.deadline + 'T23:59:59') - new Date()) / 86400000);
                    daysText = p.status === 'Concluído' ? 'OK' : d + 'd';
                    daysColor = d < 0 ? 'red' : 'gray';
                }

                const color = window.getStatusColor(p.status);

                const formatDate = (d) => d ? d.split('-').reverse().join('/') : '';
                const formatCurrency = (v) => {
                    const num = parseFloat(v);
                    if (isNaN(num)) return v || '';
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
                };

                tr.innerHTML = `
                    <td>${p.ppNumber || ''}</td>
                    <td>${p.exerciseYear || ''}</td>
                    <td><strong>${p.ppAno}</strong></td>
                    <td title="${p.supplier}">${p.supplier ? (p.supplier.length > 20 ? p.supplier.substring(0, 20) + '...' : p.supplier) : ''}</td>
                    <td title="${p.object}">${p.object ? (p.object.length > 20 ? p.object.substring(0, 20) + '...' : p.object) : ''}</td>
                    <td>${formatCurrency(p.coverValue)}</td>
                    <td>${formatDate(p.openingDate)}</td>
                    <td>${formatDate(p.deadline)}${daysText ? `<br><small style="color:${daysColor}">(${daysText})</small>` : ''}</td>
                    <td><span class="badge" style="background:${color}; color:white">${p.status}</span></td>
                    <td>${p.treatedBy || ''}</td>
                    <td>${p.location && p.location !== 'null' ? p.location : ''}</td>
                    <td>${formatDate(p.locationDate)}</td>
                    <td onclick="event.stopPropagation();" style="display:flex; flex-direction: row; gap:4px; align-items:center;">
                        <button class="btn btn-warning" style="padding:4px; width:28px; height:28px" onclick='window.openProcessModal(${JSON.stringify(p)})' title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-primary" style="padding:4px; width:28px; height:28px" onclick='window.showHistory(${JSON.stringify(p)})' title="Histórico"><i class="fas fa-history"></i></button>
                        <button class="btn btn-danger" style="padding:4px; width:28px; height:28px" onclick="window.deleteProcess('${p.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>`;
                tbody.appendChild(tr);
            });
        };

        window.deleteProcess = async function (id) {
            if (!confirm('Deseja realmente excluir este processo? Esta ação não pode ser desfeita.')) return;
            try {
                const { error } = await supabase.from('processes').delete().eq('id', id);
                if (error) throw error;
                await window.initApp();
            } catch (err) {
                console.error('Delete Error:', err);
                alert('Erro ao excluir o processo.');
            }
        };

        window.updateModalRemainingDays = function () {
            const deadlineInput = document.getElementById('deadline');
            const remainingDaysInput = document.getElementById('modalRemainingDays');
            if (deadlineInput && remainingDaysInput && deadlineInput.value) {
                const deadline = new Date(deadlineInput.value + 'T23:59:59');
                const now = new Date();
                const days = Math.ceil((deadline - now) / 86400000);
                remainingDaysInput.value = days + ' dias';
            } else if (remainingDaysInput) {
                remainingDaysInput.value = '';
            }
        };

        window.openProcessModal = function (p = null) {
            const form = document.getElementById('processForm');
            if (!form) return;
            form.reset(); window.updateSelects();
            window._tempHistory = [];

            // clear config search if exists
            const sInput = document.getElementById('configSearchInput');
            if (sInput) sInput.value = '';

            if (p) {
                document.getElementById('processModalTitle').innerText = 'Editar Processo';
                document.getElementById('processId').value = p.id;
                document.getElementById('ppNumber').value = p.ppNumber || '';
                document.getElementById('exerciseYear').value = p.exerciseYear || '';
                document.getElementById('ppAno').value = p.ppAno || '';
                document.getElementById('coverValue').value = p.coverValue || '';
                document.getElementById('openingDate').value = p.openingDate || '';
                document.getElementById('supplierSelect').value = p.supplier || '';
                document.getElementById('objectSelect').value = p.object || '';
                document.getElementById('treatedBy').value = p.treatedBy || '';
                document.getElementById('deadline').value = p.deadline || '';
                document.getElementById('statusSelect').value = p.status || '';
                document.getElementById('locationSelect').value = p.location || '';
                document.getElementById('locationDate').value = p.locationDate || '';
                document.getElementById('situation').value = p.situation || '';
                document.getElementById('notes').value = p.notes || '';
                window.renderModalHistory(p.history);
                window.updateModalRemainingDays();
            } else {
                document.getElementById('processModalTitle').innerText = 'Novo Processo';
                document.getElementById('processId').value = '';
                document.getElementById('ppAno').value = `00${window.state.processes.length + 1}/${new Date().getFullYear()}`;
                document.getElementById('openingDate').value = new Date().toISOString().split('T')[0];
                window.renderModalHistory([]);
            }
            document.getElementById('processControlModal').style.display = 'flex';
        };

        window.renderModalHistory = function (history = []) {
            const cont = document.getElementById('modalTimeline');
            if (!cont) return;
            cont.innerHTML = history.length ? '' : '<p style="text-align:center; color:#888; font-size:12px;">Sem histórico.</p>';
            [...history].reverse().forEach(h => {
                const div = document.createElement('div');
                div.className = 'modal-timeline-item';
                div.innerHTML = `<span class="modal-timeline-date">${h.date}</span><div class="modal-timeline-content">${h.from ? `${h.from} &rarr; ${h.to}` : h.msg || h.message}</div>`;
                cont.appendChild(div);
            });
        };

        window.launchManualUpdate = async function () {
            const input = document.getElementById('newManualUpdate');
            const msg = input.value.trim();
            if (!msg) return;
            const id = document.getElementById('processId').value;
            const item = { date: new Date().toLocaleString(), msg };
            if (id && supabase) {
                await supabase.from('process_history').insert({ process_id: id, history_date: item.date, message: msg });
                const p = window.state.processes.find(x => x.id === id);
                if (p) { p.history.push(item); window.renderModalHistory(p.history); }
            } else {
                window._tempHistory.push(item); window.renderModalHistory(window._tempHistory);
            }
            input.value = '';
        };

        const procForm = document.getElementById('processForm');
        if (procForm) procForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('processId').value;
            const data = {
                pp_ano: document.getElementById('ppAno').value,
                supplier_name: document.getElementById('supplierSelect').value,
                object_name: document.getElementById('objectSelect').value,
                treated_by: document.getElementById('treatedBy').value,
                deadline: document.getElementById('deadline').value,
                status: document.getElementById('statusSelect').value,
                location: document.getElementById('locationSelect').value,
                notes: document.getElementById('notes').value
            };
            try {
                if (id) {
                    const p = window.state.processes.find(x => x.id === id);
                    if (p.location !== data.location) await supabase.from('process_history').insert({ process_id: id, history_date: new Date().toLocaleString(), location_from: p.location, location_to: data.location });
                    await supabase.from('processes').update(data).eq('id', id);
                } else {
                    const { data: nProc } = await supabase.from('processes').insert(data).select().single();
                    if (window._tempHistory.length) await supabase.from('process_history').insert(window._tempHistory.map(h => ({ process_id: nProc.id, history_date: h.date, message: h.msg })));
                }
                await window.initApp(); window.closeAllModals();
            } catch (err) { console.error(err); }
        };

        window.showHistory = function (p) {
            const timeline = document.getElementById('historyTimeline');
            const sym = document.getElementById('historyProcessSummary');
            if (!timeline || !sym) return;
            sym.innerHTML = `Processo: <strong>${p.ppAno}</strong>`;
            timeline.innerHTML = '';
            [...p.history].reverse().forEach(h => {
                const div = document.createElement('div');
                div.className = 'history-item log';
                div.innerHTML = `<div class="history-node"></div><div class="history-date">${h.date}</div><div class="history-card">${h.from ? `${h.from} &rarr; ${h.to}` : h.msg || h.message}</div>`;
                timeline.appendChild(div);
            });
            document.getElementById('processHistoryModal').style.display = 'flex';
        };

        window.showProcessDetails = function (p) {
            const modal = document.getElementById('processDetailsModal');
            if (!modal) return;

            const formatDate = (d) => d ? d.split('-').reverse().join('/') : '-';
            const formatCurrency = (v) => {
                const num = parseFloat(v);
                if (isNaN(num)) return v || '-';
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
            };

            // Basic Info
            document.getElementById('detailsModalTitle').innerText = `Processo ${p.ppAno}`;
            document.getElementById('detailsSupplier').innerText = p.supplier || '-';
            document.getElementById('detailsObject').innerText = p.object || '-';
            document.getElementById('detailsValue').innerText = formatCurrency(p.coverValue);
            
            // Dates & Personnel
            document.getElementById('detailsOpeningDate').innerText = formatDate(p.openingDate);
            document.getElementById('detailsDeadline').innerText = formatDate(p.deadline);
            document.getElementById('detailsTreatedBy').innerText = p.treatedBy || '-';

            // Location & Notes
            document.getElementById('detailsLocation').innerText = (p.location && p.location !== 'null') ? p.location : 'Não definida';
            document.getElementById('detailsLocationDate').innerText = formatDate(p.locationDate);
            document.getElementById('detailsNotes').innerText = p.notes || 'Sem observações.';

            // Status Badge
            const statusBadge = document.getElementById('detailsStatusBadge');
            const statusColor = window.getStatusColor(p.status);
            statusBadge.innerText = p.status;
            statusBadge.style.background = statusColor;
            statusBadge.style.color = 'white';

            // Timeline
            const timeline = document.getElementById('detailsTimeline');
            timeline.innerHTML = '';
            if (p.history && p.history.length > 0) {
                [...p.history].reverse().forEach(h => {
                    const node = document.createElement('div');
                    node.className = 'timeline-node';
                    node.innerHTML = `
                        <div class="timeline-date">${h.date}</div>
                        <div class="timeline-msg">${h.from ? `<strong>Movimentação:</strong> ${h.from} <i class="fas fa-arrow-right" style="font-size: 10px; margin: 0 5px;"></i> ${h.to}` : h.msg || h.message}</div>
                    `;
                    timeline.appendChild(node);
                });
            } else {
                timeline.innerHTML = '<p style="color: #888; font-size: 0.9rem; margin-left: 10px;">Sem histórico de tramitações.</p>';
            }

            // Other Processes from same supplier
            const otherContainer = document.getElementById('detailsOtherProcesses');
            otherContainer.innerHTML = '';
            if (p.supplier) {
                const otherProcs = window.state.processes.filter(op => op.supplier === p.supplier && op.id !== p.id);
                if (otherProcs.length > 0) {
                    otherProcs.forEach(op => {
                         const badge = document.createElement('span');
                         badge.className = 'badge';
                         badge.style.background = '#eef3fc';
                         badge.style.color = '#1452B5';
                         badge.style.border = '1px solid #cce0ff';
                         badge.style.cursor = 'pointer';
                         badge.style.fontSize = '0.8rem';
                         badge.title = `Clique para ver o processo ${op.ppAno}`;
                         badge.innerText = op.ppAno;
                         badge.onclick = () => {
                             window.closeModal('processDetailsModal');
                             setTimeout(() => window.showProcessDetails(op), 300); // Wait for modal animation
                         };
                         otherContainer.appendChild(badge);
                    });
                } else {
                    otherContainer.innerHTML = '<span style="color: #666; font-size: 0.85rem;">Nenhum outro processo encontrado.</span>';
                }
            } else {
                otherContainer.innerHTML = '<span style="color: #666; font-size: 0.85rem;">Fornecedor não informado.</span>';
            }

            // Action Buttons
            const btnEdit = document.getElementById('detailsBtnEdit');
            const btnDelete = document.getElementById('detailsBtnDelete');
            
            btnEdit.onclick = () => {
                window.closeModal('processDetailsModal');
                window.openProcessModal(p);
            };
            
            btnDelete.onclick = async () => {
                if (confirm('Deseja realmente excluir este processo?')) {
                    window.closeModal('processDetailsModal');
                    await window.deleteProcess(p.id);
                }
            };

            modal.style.display = 'flex';
        };

        window.choicesInstances = {};

        window.updateSelects = function () {
            const sets = [
                { id: 'supplierSelect', data: window.state.suppliers, searchable: true },
                { id: 'objectSelect', data: window.state.objects, searchable: true },
                { id: 'treatedBy', data: window.state.handlers, searchable: true },
                { id: 'locationSelect', data: window.state.locations, searchable: true },
                { id: 'statusSelect', data: window.state.statuses, searchable: true },
                { id: 'statusFilter', data: window.state.statuses, opt: true, placeholder: 'Todos os Status', searchable: false },
                { id: 'locationFilter', data: window.state.locations, opt: true, placeholder: 'Todas Localizações', searchable: false }
            ];

            sets.forEach(s => {
                const el = document.getElementById(s.id);
                if (!el) return;

                const old = el.value;

                el.innerHTML = s.opt ? `<option value="">${s.placeholder || 'Selecionar...'}</option>` : '';
                s.data.forEach(d => {
                    const o = document.createElement('option');
                    o.value = d;
                    o.innerText = d;
                    el.appendChild(o);
                });

                if (old && s.data.includes(old)) {
                    el.value = old;
                }

                if (s.searchable) {
                    window.choicesInstances[s.id] = new Choices(el, {
                        searchEnabled: true,
                        itemSelectText: '',
                        noResultsText: 'Nenhum resultado encontrado',
                        noChoicesText: 'Sem opções para escolher',
                        shouldSort: false
                    });
                }
            });
        };

        window.openConfigModal = function (type) {
            window.state.currentConfigType = type;
            const titles = {
                'users': 'Cadastro de Usuários',
                'suppliers': 'Cadastro de Fornecedores',
                'objects': 'Cadastro de Objetos',
                'locations': 'Cadastro de Localização',
                'statuses': 'Cadastro de Status',
                'handlers': 'Cadastro de Tratadores'
            };
            document.getElementById('configModalTitle').innerText = titles[type] || type;
            window.renderConfigList();

            // Re-apply focus
            const searchInput = document.getElementById('configSearchInput');
            if (searchInput) searchInput.value = '';

            document.getElementById('processConfigModal').style.display = 'flex';
        };

        window.quickAddConfig = function (type) {
            // Closes current form modal implicitly over layered logic, but here we just pop the config modal above it via z-index
            window.openConfigModal(type);
        };

        window.renderConfigList = function () {
            const list = document.getElementById('configList');
            const searchInput = document.getElementById('configSearchInput');
            if (!list) return;
            list.innerHTML = '';

            let arr = window.state[window.state.currentConfigType] || [];

            if (searchInput && searchInput.value) {
                const term = searchInput.value.toLowerCase();
                arr = arr.filter(it => it.toLowerCase().includes(term));
            }

            if (arr.length === 0) {
                list.innerHTML = '<li style="text-align:center; padding: 2rem; color: #9CA3AF; font-size: 0.9rem;">Nenhum item cadastrado.</li>';
                return;
            }

            // Sort alphabetically for display
            [...arr].sort((a, b) => a.localeCompare(b)).forEach((it) => {
                const originalIdx = window.state[window.state.currentConfigType].indexOf(it);
                const li = document.createElement('li');
                li.className = 'config-list-item';
                li.innerHTML = `
                    <span style="font-weight: 500; color: #374151;">${it}</span>
                    <div>
                        <i class="fas fa-edit config-edit-icon" style="color:#f59e0b; cursor:pointer; padding:0.5rem; transition:all 0.2s;" onmouseover="this.style.color='#d97706'" onmouseout="this.style.color='#f59e0b'" title="Editar" onclick="window.editConfigItem(${originalIdx})"></i>
                        <i class="fas fa-trash config-trash-icon" title="Excluir" onclick="window.deleteConfigItem(${originalIdx})"></i>
                    </div>
                `;
                list.appendChild(li);
            });
        };

        window.saveConfigItem = async function () {
            const val = document.getElementById('configInput').value.trim();
            if (!val) return;
            try {
                await supabase.from(window.state.currentConfigType).insert({ name: val });
                window.state[window.state.currentConfigType].push(val);
                window.renderConfigList(); window.updateSelects();
                document.getElementById('configInput').value = '';
            } catch (err) { console.error('Error saving config item:', err); }
        };

        window.editConfigItem = async function (idx) {
            const oldName = window.state[window.state.currentConfigType][idx];
            const newName = prompt(`Editar item: ${oldName}`, oldName);
            if (!newName || newName.trim() === '' || newName === oldName) return;

            try {
                await supabase.from(window.state.currentConfigType).update({ name: newName.trim() }).eq('name', oldName);
                window.state[window.state.currentConfigType][idx] = newName.trim();
                window.renderConfigList(); window.updateSelects();
            } catch (err) { console.error('Error editing config item:', err); }
        };

        window.deleteConfigItem = async function (idx) {
            const name = window.state[window.state.currentConfigType][idx];
            if (confirm(`Excluir ${name}?`)) {
                try {
                    await supabase.from(window.state.currentConfigType).delete().eq('name', name);
                    window.state[window.state.currentConfigType].splice(idx, 1);
                    window.renderConfigList(); window.updateSelects();
                } catch (err) { console.error('Error deleting config item:', err); }
            }
        };

        window.exportToPDF = async function () {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4');

            try {
                const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Bras%C3%A3o_de_Armas_de_Itagua%C3%AD.jpg/120px-Bras%C3%A3o_de_Armas_de_Itagua%C3%AD.jpg';
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = logoUrl;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });

                if (img.naturalWidth > 0) {
                    doc.addImage(img, 'JPEG', 14, 10, 16, 20);
                }
            } catch (e) { console.warn('Falha ao carregar logo no PDF:', e); }

            // Cabeçalho - Textos Menores
            const pdfWidth = doc.internal.pageSize.width;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("ESTADO DO RIO DE JANEIRO", pdfWidth / 2, 14, { align: 'center' });
            doc.text("PREFEITURA MUNICIPAL DE ITAGUAÍ", pdfWidth / 2, 19, { align: 'center' });
            doc.text("SECRETARIA MUNICIPAL DE EDUCAÇÃO", pdfWidth / 2, 24, { align: 'center' });

            // Cabeçalho - Título
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(20, 20, 20);
            doc.text("CONTROLE DE PROCESSOS DE PAGAMENTOS", pdfWidth / 2, 34, { align: 'center' });

            // Linha Separadora
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(14, 38, 283, 38);

            // Data de Emissão
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            doc.text("Data de Emissão: " + dateStr, 14, 43);

            // Tabela com Colunas Seletivas
            const allChecks = document.querySelectorAll('.pdf-col-check');
            const selectedIndices = [];
            const selectedHeaders = [];

            allChecks.forEach((check, index) => {
                if (check.checked) {
                    selectedIndices.push(index);
                    selectedHeaders.push(check.parentElement.textContent.replace('✓', '').trim());
                }
            });

            if (selectedIndices.length === 0) {
                alert('Selecione ao menos uma coluna para exportar.');
                return;
            }

            const formatDate = (d) => d ? d.split('-').reverse().join('/') : '';
            const dataToExport = window._lastFiltered || window.state.processes;

            const tableBody = dataToExport.map(p => {
                const row = [];
                const fullRowData = [
                    p.ppNumber || '',
                    p.exerciseYear || '',
                    p.ppAno || '',
                    p.supplier || '',
                    p.object || '',
                    p.coverValue || '',
                    formatDate(p.openingDate),
                    formatDate(p.deadline),
                    p.status || '',
                    p.treatedBy || '',
                    p.location || '',
                    formatDate(p.locationDate)
                ];
                
                selectedIndices.forEach(idx => {
                    row.push(fullRowData[idx]);
                });
                return row;
            });

            doc.autoTable({
                head: [selectedHeaders],
                body: tableBody,
                startY: 48,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: [20, 82, 181], textColor: [255, 255, 255], fontStyle: 'bold' }
            });

            doc.save('processos.pdf');
        };

        window.exportDashboardToPDF = async function () {
            const btn = event.currentTarget || event.target;
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
            btn.disabled = true;

            const element = document.getElementById('dashboard-section');

            try {
                // Captura a tela atual do dashboard
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f2f2f2' });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem para caber o Dashboard largo
                
                const pdfWidth = doc.internal.pageSize.width;
                const pdfHeight = doc.internal.pageSize.height;

                // --- Cabeçalho e Logo ---
                try {
                    const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Bras%C3%A3o_de_Armas_de_Itagua%C3%AD.jpg/120px-Bras%C3%A3o_de_Armas_de_Itagua%C3%AD.jpg';
                    const imgLogo = new Image();
                    imgLogo.crossOrigin = 'Anonymous';
                    imgLogo.src = logoUrl;
                    await new Promise((resolve) => {
                        imgLogo.onload = resolve;
                        imgLogo.onerror = resolve;
                    });

                    if (imgLogo.naturalWidth > 0) {
                        doc.addImage(imgLogo, 'JPEG', 14, 10, 16, 20);
                    }
                } catch (e) {
                    console.warn('Falha ao carregar logo no PDF:', e);
                }

                // Textos do Cabeçalho
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text("ESTADO DO RIO DE JANEIRO", pdfWidth / 2, 14, { align: 'center' });
                doc.text("PREFEITURA MUNICIPAL DE ITAGUAÍ", pdfWidth / 2, 19, { align: 'center' });
                doc.text("SECRETARIA MUNICIPAL DE EDUCAÇÃO", pdfWidth / 2, 24, { align: 'center' });

                // Título do Cabeçalho
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(20, 20, 20);
                doc.text("DASHBOARD - PROCESSOS DE PAGAMENTOS", pdfWidth / 2, 34, { align: 'center' });

                // Linha Separadora
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.5);
                doc.line(14, 38, 283, 38);

                // Data de Emissão
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                const now = new Date();
                const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                doc.text("Data de Emissão: " + dateStr, 14, 43);

                // Imagem do Dashboard
                // Calcula dimensões, mantendo a proporção (aspect ratio) da captura 
                const canvasAspectRatio = canvas.width / canvas.height;
                // Margens e Y de começo
                const marginX = 14;
                const startY = 48; // Após a data de emissão
                
                // Dimensões do PDF disponíveis
                const availablePageWidth = pdfWidth - (marginX * 2);
                const availablePageHeight = pdfHeight - startY - 10; // 10 é margem inferior

                let finalImgWidth = availablePageWidth;
                let finalImgHeight = finalImgWidth / canvasAspectRatio;

                // Redimensiona se ficar mais alto que o espaço disponível
                if(finalImgHeight > availablePageHeight) {
                    finalImgHeight = availablePageHeight;
                    finalImgWidth = finalImgHeight * canvasAspectRatio;
                }
                
                // Centraliza horizontalmente
                const finalImgX = (pdfWidth - finalImgWidth) / 2;

                doc.addImage(imgData, 'JPEG', finalImgX, startY, finalImgWidth, finalImgHeight);
                doc.save('dashboard.pdf');

            } catch(e) {
                console.error("Erro na exportação para PDF: ", e);
                alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        };

        window.exportToExcel = function () {
            const header = ['NÚMERO DO P.P.', 'ANO', 'PPANO', 'FORNECEDOR', 'VALOR DE CAPA', 'DATA DE CONCLUSÃO', 'TRATADO POR', 'STATUS', 'Localização'];
            
            const formatDate = (d) => d ? d.split('-').reverse().join('/') : '';
            const dataToExportSource = window._lastFiltered || window.state.processes;
            const dataToExport = dataToExportSource.map(p => {
                let cover = p.coverValue || '';
                if (cover && !cover.includes('R$')) cover = 'R$ ' + cover;

                const locDate = formatDate(p.locationDate);
                const locStr = (p.location && locDate) ? `${p.location} | ${locDate}` : (p.location || locDate);

                return [
                    p.ppNumber || '',
                    p.exerciseYear || '',
                    p.ppAno || '',
                    p.supplier || '',
                    cover,
                    formatDate(p.deadline),
                    p.treatedBy || '',
                    p.status || '',
                    locStr
                ];
            });

            const ws_data = [header, ...dataToExport];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);

            const headerStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "000000" } },
                alignment: { horizontal: "center", vertical: "center" }
            };

            const dataStyleCenter = { alignment: { horizontal: "center", vertical: "center" } };
            const dataStyleLeft = { alignment: { horizontal: "left", vertical: "center" } };

            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                    if (!ws[cell_ref]) continue;

                    if (R === 0) {
                        ws[cell_ref].s = headerStyle;
                    } else {
                        ws[cell_ref].s = dataStyleCenter;
                        
                        // Left align supplier string
                        if (C === 3) {
                            ws[cell_ref].s = dataStyleLeft;
                        }

                        // Add color to status cell
                        if (C === 7) { 
                            const val = ws[cell_ref].v;
                            let color = "C6E0B4"; // default light green
                            if (val === 'Em Análise') color = "BDD7EE";
                            else if (val === 'Pendente') color = "F8CBAD";
                            else if (val === 'Concluído') color = "A9D08E";
                            else if (val === 'Aguardando Assinatura') color = "D9D9D9";
                            else if (val === 'Atrasado' || val === 'Vencido') color = "FFC7CE";

                            ws[cell_ref].s = {
                                fill: { fgColor: { rgb: color } },
                                alignment: { horizontal: "center", vertical: "center" },
                                font: { color: { rgb: "333333" } }
                            };
                        }
                    }
                }
            }

            ws['!cols'] = [
                { wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 55 }, { wch: 20 }, 
                { wch: 22 }, { wch: 20 }, { wch: 25 }, { wch: 45 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Processos");
            XLSX.writeFile(wb, "processos.xlsx");
        };

        try { new Swiper('.swiper', { loop: true, autoplay: { delay: 3000 } }); } catch (e) { console.warn('Swiper init failed:', e); }

        // Final Integration Check
        // Integration check script removed
    
