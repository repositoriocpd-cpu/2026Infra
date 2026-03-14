// Script 0

        document.addEventListener("DOMContentLoaded", () => {
            console.log('DOMContentLoaded fired');
            // Side Menu Toggle
            const menuToggle = document.getElementById('menu-toggle');
            const sideMenu = document.getElementById('side-menu');
            const overlay = document.getElementById('overlay');
            console.log('Elements found:', { menuToggle: !!menuToggle, sideMenu: !!sideMenu, overlay: !!overlay });

            const toggleMenu = () => {
                sideMenu.classList.toggle('open');
                overlay.classList.toggle('visible');
                // Close any open submenus when main menu closes
                if (!sideMenu.classList.contains('open')) {
                    document.querySelectorAll('.submenu').forEach(sub => {
                        sub.classList.remove('open');
                    });
                    document.querySelectorAll('.has-submenu').forEach(link => {
                        link.classList.remove('active');
                    });
                }
            };

            // Submenu click behavior
            const submenuLinks = document.querySelectorAll('.has-submenu');
            console.log('Submenu links found:', submenuLinks.length);
            submenuLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    console.log('Submenu clicked:', this.innerText);
                    const submenu = this.nextElementSibling || this.parentElement.querySelector('.submenu');
                    console.log('Submenu found:', submenu);

                    if (!submenu) {
                        console.error('Submenu element not found for:', this);
                        return;
                    }

                    const isActive = this.classList.contains('active');

                    // Close all other submenus
                    document.querySelectorAll('.submenu').forEach(sub => {
                        if (sub !== submenu) sub.classList.remove('open');
                    });
                    document.querySelectorAll('.has-submenu').forEach(otherLink => {
                        if (otherLink !== this) otherLink.classList.remove('active');
                    });

                    // Toggle current submenu
                    if (isActive) {
                        submenu.classList.remove('open');
                        this.classList.remove('active');
                    } else {
                        submenu.classList.add('open');
                        this.classList.add('active');
                    }
                });
            });

            if (menuToggle && sideMenu && overlay) {
                menuToggle.addEventListener('click', toggleMenu);
                overlay.addEventListener('click', () => {
                    if (sideMenu.classList.contains('open')) {
                        toggleMenu();
                    }
                });
            }

            // Accessibility Modal
            const accessibilityToggle = document.getElementById('accessibility-toggle');
            const accessibilityModal = document.getElementById('accessibility-modal');
            const closeModalButton = document.getElementById('close-modal-button');

            const toggleAccessibilityModal = () => {
                accessibilityModal.classList.toggle('visible');
                overlay.classList.toggle('visible');
            };

            if (accessibilityToggle && accessibilityModal && closeModalButton && overlay) {
                accessibilityToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleAccessibilityModal();
                });
                closeModalButton.addEventListener('click', toggleAccessibilityModal);
                overlay.addEventListener('click', () => {
                    if (accessibilityModal.classList.contains('visible')) {
                        toggleAccessibilityModal();
                    }
                });
            }

            // Cookie Modal
            const cookieToggle = document.getElementById('cookie-toggle');
            const cookieModal = document.getElementById('cookie-modal');
            const closeCookieModalButton = document.getElementById('close-cookie-modal-button');

            const toggleCookieModal = () => {
                cookieModal.classList.toggle('visible');
                overlay.classList.toggle('visible');
            };

            if (cookieToggle && cookieModal && closeCookieModalButton && overlay) {
                cookieToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCookieModal();
                });
                closeCookieModalButton.addEventListener('click', toggleCookieModal);
                overlay.addEventListener('click', () => {
                    if (cookieModal.classList.contains('visible')) {
                        toggleCookieModal();
                    }
                });
            }

            // Prevent navigation on editable links
            document.querySelectorAll('a[contenteditable="true"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (document.activeElement === link) {
                        e.preventDefault();
                    }
                });
            });

            // Stat Counter Animation & Editable Cards
            const counters = document.querySelectorAll('.stat-number');
            const animationDuration = 2000; // 2 seconds

            const animateCounter = (counter) => {
                if (counter.parentElement.dataset.edited === 'true') return;

                const target = +counter.getAttribute('data-target');
                const suffix = counter.getAttribute('data-suffix') || '';
                const isFloat = target % 1 !== 0;

                const updateCount = (timestamp) => {
                    if (counter.parentElement.dataset.edited === 'true') {
                        // Ensure final value is set correctly if edited during animation.
                        let currentText = counter.innerText.replace(suffix, '').trim().replace(',', '.');
                        let newTarget = parseFloat(currentText);
                        if (isNaN(newTarget)) newTarget = target; // fallback to original target

                        if (isFloat) {
                            counter.innerText = newTarget.toFixed(1).replace('.', ',') + suffix;
                        } else {
                            counter.innerText = Math.floor(newTarget).toLocaleString('pt-BR') + suffix;
                        }
                        return; // Stop animation
                    }
                    if (!startTime) startTime = timestamp;
                    const progress = timestamp - startTime;
                    const percentage = Math.min(progress / animationDuration, 1);

                    let currentValue = percentage * target;

                    if (isFloat) {
                        // Keep decimal for animation, replace with comma at the end.
                        counter.innerText = currentValue.toFixed(1) + suffix;
                    } else {
                        counter.innerText = Math.floor(currentValue).toLocaleString('pt-BR') + suffix;
                    }

                    if (progress < animationDuration) {
                        requestAnimationFrame(updateCount);
                    } else {
                        // Ensure final value is exact
                        if (isFloat) {
                            counter.innerText = target.toFixed(1).replace('.', ',') + suffix;
                        } else {
                            counter.innerText = target.toLocaleString('pt-BR') + suffix;
                        }
                    }
                };

                let startTime;
                requestAnimationFrame(updateCount);
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target.parentElement.dataset.edited !== 'true') {
                            animateCounter(entry.target);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => {
                const card = counter.parentElement;
                const h3 = card.querySelector('h3');

                const handleEdit = (element) => {
                    card.dataset.edited = 'true';
                    if (element.classList.contains('stat-number')) {
                        const suffix = element.getAttribute('data-suffix') || '';
                        let newText = element.innerText.replace(suffix, '').trim().replace(',', '.');
                        const newTarget = parseFloat(newText);

                        if (!isNaN(newTarget)) {
                            element.setAttribute('data-target', newTarget);
                        }
                        // Re-add suffix if it's not there
                        if (suffix && !element.innerText.includes(suffix)) {
                            element.innerText += suffix;
                        }
                    }
                };

                counter.addEventListener('input', () => handleEdit(counter));
                h3.addEventListener('input', () => handleEdit(h3));

                observer.observe(counter);
            });

            // Dark Mode Toggle
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent page from jumping to top
                    document.body.classList.toggle('dark-mode');

                    const icon = darkModeToggle.querySelector('i');
                    const isDarkMode = document.body.classList.contains('dark-mode');

                    icon.classList.toggle('fa-moon', !isDarkMode);
                    icon.classList.toggle('fa-sun', isDarkMode);
                });
            }

            // Remanejamento Modal
            document.addEventListener('click', function (e) {
                // Check if clicked element is specifically the remanejamento link
                if (e.target.closest('#remanejamento-link') ||
                    e.target.closest('#remanejamento-link i')) {
                    e.preventDefault();
                    const modal = document.getElementById('remanejamento-modal');
                    const overlay = document.getElementById('overlay');
                    modal.classList.add('visible');
                    overlay.classList.add('visible');
                }

                // Handle modal close buttons
                if (e.target.id === 'close-remanejamento-modal-button' ||
                    e.target.id === 'cancel-remanejamento-button' ||
                    e.target === overlay) {
                    const modal = document.getElementById('remanejamento-modal');
                    const overlay = document.getElementById('overlay');
                    modal.classList.remove('visible');
                    overlay.classList.remove('visible');
                }

                // Handle confirm button
                if (e.target.id === 'confirm-remanejamento-button') {
                    const modal = document.getElementById('remanejamento-modal');
                    const overlay = document.getElementById('overlay');
                    modal.classList.remove('visible');
                    overlay.classList.remove('visible');
                    // Add your continue logic here
                    console.log("Continuar com o remanejamento");
                }
            });

            // Handle Remanejamento Modal
            const remanejamentoLink = document.getElementById('remanejamento-link');
            const remanejamentoModal = document.getElementById('remanejamento-modal');
            const closeRemanejamentoButton = document.getElementById('close-remanejamento-modal-button');
            const cancelRemanejamentoButton = document.getElementById('cancel-remanejamento-button');
            const confirmRemanejamentoButton = document.getElementById('confirm-remanejamento-button');

            const toggleRemanejamentoModal = () => {
                remanejamentoModal.classList.toggle('visible');
                overlay.classList.toggle('visible');
            };

            if (remanejamentoLink && remanejamentoModal && overlay) {
                remanejamentoLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleRemanejamentoModal();
                });

                closeRemanejamentoButton.addEventListener('click', toggleRemanejamentoModal);
                cancelRemanejamentoButton.addEventListener('click', toggleRemanejamentoModal);

                confirmRemanejamentoButton.addEventListener('click', () => {
                    toggleRemanejamentoModal();
                    // Add your continue logic here
                    console.log("Continuar com o remanejamento");
                });

                overlay.addEventListener('click', () => {
                    if (remanejamentoModal.classList.contains('visible')) {
                        toggleRemanejamentoModal();
                    }
                });
            }

            // Comments Modal
            const commentsToggle = document.getElementById('comments-toggle');
            const commentsModal = document.getElementById('comments-modal');
            const closeCommentsModalButton = document.getElementById('close-comments-modal-button');

            const toggleCommentsModal = () => {
                commentsModal.classList.toggle('visible');
                overlay.classList.toggle('visible');
            };

            if (commentsToggle && commentsModal && overlay) {
                commentsToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCommentsModal();
                });

                closeCommentsModalButton.addEventListener('click', toggleCommentsModal);
                overlay.addEventListener('click', () => {
                    if (commentsModal.classList.contains('visible')) {
                        toggleCommentsModal();
                    }
                });
            }

            // Swiper Initialization
            const swiper = new Swiper('.swiper', {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 30,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },

                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },

                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });

        // --- PAYMENT PROCESS CONTROL LOGIC ---
        const SUPABASE_URL = 'https://sxsfqvcxikdsahhidrdx.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let state = {
            processes: [],
            suppliers: [],
            locations: [],
            objects: [],
            statuses: [],
            handlers: [],
            users: [],
            currentConfigType: ''
        };

        let statusChart, locationChart;

        async function initApp() {
            try {
                // Fetch all data concurrently
                const [
                    { data: suppliers },
                    { data: locations },
                    { data: objects },
                    { data: statuses },
                    { data: handlers },
                    { data: users },
                    { data: processes }
                ] = await Promise.all([
                    supabase.from('suppliers').select('name').order('name'),
                    supabase.from('locations').select('name').order('name'),
                    supabase.from('objects').select('name').order('name'),
                    supabase.from('statuses').select('name').order('name'),
                    supabase.from('handlers').select('name').order('name'),
                    supabase.from('users').select('name').order('name'),
                    supabase.from('processes').select('*, process_history(*)').order('created_at', { ascending: false })
                ]);

                // Map data to the state array format
                state.suppliers = suppliers?.map(s => s.name) || [];
                state.locations = locations?.map(l => l.name) || [];
                state.objects = objects?.map(o => o.name) || [];
                state.statuses = statuses?.map(s => s.name) || [];
                state.handlers = handlers?.map(h => h.name) || [];
                state.users = users?.map(u => u.name) || [];

                // Map processes to match the existing camelCase structure
                state.processes = processes?.map(p => ({
                    id: p.id,
                    ppNumber: p.pp_number,
                    exerciseYear: p.exercise_year,
                    ppAno: p.pp_ano,
                    coverValue: p.cover_value,
                    supplier: p.supplier_name,
                    object: p.object_name,
                    openingDate: p.opening_date,
                    deadline: p.deadline,
                    treatedBy: p.treated_by,
                    status: p.status,
                    location: p.location,
                    locationDate: p.location_date,
                    situation: p.situation,
                    notes: p.notes,
                    history: p.process_history?.map(h => ({
                        date: h.history_date,
                        from: h.location_from,
                        to: h.location_to,
                        msg: h.message
                    })) || []
                })) || [];

                updateSelects();
                updateDashboardCounters();
                renderProcessTable();
            } catch (error) {
                console.error("Error initializing app from Supabase:", error);
                alert("Erro ao conectar com o banco de dados.");
            }
        }
        window.addEventListener('load', initApp);

        async function saveData() {
            // saveData will be replaced by specific remote saving logic
            // keeping this as a no-op fallback to prevent errors during transition
            console.log("saveData called (Local logic disabled)");
        }

        function showSection(sectionId) {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('processes-section').style.display = 'none';
            document.getElementById(`${sectionId}-section`).style.display = 'block';

            // Close menu
            document.getElementById('side-menu').classList.remove('open');
            document.getElementById('overlay').classList.remove('visible');

            if (sectionId === 'dashboard') updateDashboardCounters();
        }

        // --- SELF TEST CONSOLE ---
        setTimeout(() => {
            console.log("=== BEGIN SELF TEST ===");
            try {
                const mt = document.getElementById('menu-toggle');
                const sm = document.getElementById('side-menu');
                const ov = document.getElementById('overlay');
                console.log(`menuToggle id found: ${!!mt}`);
                console.log(`sideMenu id found: ${!!sm}`);
                console.log(`overlay id found: ${!!ov}`);

                if (mt) {
                    console.log(`mt display: ${window.getComputedStyle(mt).display}, tagName: ${mt.tagName}`);
                    mt.click();
                    console.log(`After click, sideMenu classes: ${sm.className}`);
                }
            } catch (e) {
                console.error(`Self-Test Error: ${e.message}`);
            }
            console.log("=== END SELF TEST ===");
        }, 1000);

        function updateDashboardCounters() {
            const now = new Date();
            const total = state.processes.length;
            const pending = state.processes.filter(p => p.status !== 'Concluído').length;
            const completed = total - pending;
            const delayed = state.processes.filter(p => p.status !== 'Concluído' && new Date(p.deadline) < now).length;

            setCount('total-processes', total);
            setCount('treating-processes', pending);
            setCount('completed-processes', completed);
            setCount('pending-percent', total ? ((pending / total) * 100).toFixed(1) : 0);
            setCount('delayed-processes', delayed);

            // Specific location counts
            setCount('finance-processes', state.processes.filter(p => p.location === 'Finanças').length);
            setCount('cabinet-processes', state.processes.filter(p => p.location === 'Gabinete').length);
            setCount('purchase-processes', state.processes.filter(p => p.location === 'Compras').length);
            setCount('warehouse-processes', state.processes.filter(p => p.location === 'Almoxarifado').length);
            setCount('treasury-processes', state.processes.filter(p => p.location === 'Tesouraria').length);
            setCount('nutrition-processes', state.processes.filter(p => p.location === 'Nutrição').length);

            renderCharts();
        }

        function setCount(id, val) {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = val + (el.getAttribute('data-suffix') || '');
                el.setAttribute('data-target', val);
            }
        }

        function renderCharts() {
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            const locationCtx = document.getElementById('locationChart').getContext('2d');

            const statusCounts = state.statuses.map(s => state.processes.filter(p => p.status === s).length);
            const locationCounts = state.locations.map(l => state.processes.filter(p => p.location === l).length);

            if (statusChart) statusChart.destroy();
            if (locationChart) locationChart.destroy();

            statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: state.statuses,
                    datasets: [{
                        data: statusCounts,
                        backgroundColor: ['#005A9C', '#f1c40f', '#2ecc71', '#e74c3c', '#9b59b6']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            locationChart = new Chart(locationCtx, {
                type: 'bar',
                data: {
                    labels: state.locations,
                    datasets: [{
                        label: 'Processos',
                        data: locationCounts,
                        backgroundColor: '#005A9C'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }

        function renderProcessTable(data = state.processes) {
            const tbody = document.getElementById('processTableBody');
            tbody.innerHTML = '';

            data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).forEach(p => {
                const row = document.createElement('tr');
                const remainingDays = calculateRemainingDays(p.deadline);
                const colorClass = getDeadlineColorClass(remainingDays, p.status);

                row.innerHTML = `
                    <td><strong>${p.ppAno}</strong></td>
                    <td>${p.supplier}</td>
                    <td>${p.object}</td>
                    <td>${p.location}</td>
                    <td><span class="badge" style="background:${getStatusColor(p.status)}; color:white">${p.status}</span></td>
                    <td>${p.status === 'Concluído' ? 'OK' : remainingDays + ' dias'}</td>
                    <td style="display:flex; flex-direction: column; gap:4px; align-items: center;">
                        <button class="btn btn-warning" style="padding:6px; width: 32px; height: 32px; justify-content: center;" onclick='openProcessModal(${JSON.stringify(p)})'><i class="fas fa-edit"></i></button>
                        <button class="btn btn-primary" style="padding:6px; width: 32px; height: 32px; justify-content: center;" onclick='showHistory(${JSON.stringify(p)})'><i class="fas fa-history"></i></button>
                        <button class="btn btn-danger" style="padding:6px; width: 32px; height: 32px; justify-content: center; background: #333;" onclick='deleteProcess("${p.id}")'><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function filterTable() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const status = document.getElementById('statusFilter').value;
            const location = document.getElementById('locationFilter').value;

            const filtered = state.processes.filter(p => {
                const matchQuery = p.ppAno.toLowerCase().includes(query) || p.supplier.toLowerCase().includes(query);
                const matchStatus = !status || p.status === status;
                const matchLoc = !location || p.location === location;
                return matchQuery && matchStatus && matchLoc;
            });
            renderProcessTable(filtered);
        }

        function calculateRemainingDays(deadline) {
            const diff = new Date(deadline + 'T23:59:59') - new Date();
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        function getDeadlineColorClass(days, status) {
            if (status === 'Concluído') return 'btn-success';
            if (days < 0) return 'btn-danger';
            if (days < 5) return 'btn-warning';
            return 'btn-success';
        }

        function getStatusColor(status) {
            const colors = { 'Em Análise': '#005A9C', 'Aguardando Assinatura': '#f1c40f', 'Concluído': '#2ecc71', 'Pendente': '#e67e22' };
            return colors[status] || '#95a5a6';
        }

        function updateModalRemainingDays() {
            const deadline = document.getElementById('deadline').value;
            if (deadline) {
                const days = calculateRemainingDays(deadline);
                document.getElementById('modalRemainingDays').value = days + (days === 1 ? ' dia' : ' dias');
            } else {
                document.getElementById('modalRemainingDays').value = '';
            }
        }

        function renderModalHistory(history = []) {
            const container = document.getElementById('modalTimeline');
            if (!container) return;
            container.innerHTML = history.length ? '' : '<p style="text-align:center; color:#94A3B8; font-size:0.75rem; margin-top:1rem;">Nenhuma atualização registrada.</p>';

            [...history].reverse().forEach(h => {
                const item = document.createElement('div');
                item.className = 'modal-timeline-item';
                item.innerHTML = `
                    <span class="modal-timeline-date">${h.date}</span>
                    <div class="modal-timeline-content">
                        ${h.from && h.to ? `<strong>Tramitação:</strong> ${h.from} &rarr; ${h.to}` : h.message}
                    </div>
                `;
                container.appendChild(item);
            });
        }

        async function launchManualUpdate() {
            const input = document.getElementById('newManualUpdate');
            const message = input.value.trim();
            if (!message) return;

            const id = document.getElementById('processId').value;
            const update = {
                date: new Date().toLocaleString(),
                message: message
            };

            if (id) {
                try {
                    const { error } = await supabase.from('process_history').insert({
                        process_id: id,
                        history_date: update.date,
                        message: message
                    });
                    if (error) throw error;

                    const idx = state.processes.findIndex(p => p.id === id);
                    if (idx !== -1) {
                        state.processes[idx].history.push(update);
                        renderModalHistory(state.processes[idx].history);
                    }
                } catch (e) {
                    console.error(e);
                    alert("Erro ao salvar atualização no banco.");
                }
            } else {
                // For new processes, we store in a temporary property on the form or global
                if (!window._tempHistory) window._tempHistory = [];
                window._tempHistory.push(update);
                renderModalHistory(window._tempHistory);
            }

            input.value = '';
        }

        function openProcessModal(process = null) {
            const form = document.getElementById('processForm');
            form.reset();
            updateSelects();
            document.getElementById('newManualUpdate').value = '';
            window._tempHistory = [];

            if (process && typeof process === 'object') {
                document.getElementById('processModalTitle').innerText = 'Editar Processo';
                document.getElementById('processId').value = process.id;
                document.getElementById('ppNumber').value = process.ppNumber || '';
                document.getElementById('exerciseYear').value = process.exerciseYear || '';
                document.getElementById('ppAno').value = process.ppAno;
                document.getElementById('coverValue').value = process.coverValue || '';
                document.getElementById('supplierSelect').value = process.supplier;
                document.getElementById('objectSelect').value = process.object;
                document.getElementById('openingDate').value = process.openingDate || '';
                document.getElementById('deadline').value = process.deadline;
                document.getElementById('treatedBy').value = process.treatedBy || '';
                document.getElementById('statusSelect').value = process.status;
                document.getElementById('locationSelect').value = process.location;
                document.getElementById('locationDate').value = process.locationDate || '';
                document.getElementById('situation').value = process.situation || '';
                document.getElementById('notes').value = process.notes;
                updateModalRemainingDays();
                renderModalHistory(process.history);
            } else {
                document.getElementById('processModalTitle').innerText = 'Novo Processo';
                document.getElementById('processId').value = '';
                document.getElementById('ppAno').value = generatePPAno();
                document.getElementById('openingDate').value = new Date().toISOString().split('T')[0];
                document.getElementById('locationDate').value = new Date().toISOString().split('T')[0];
                document.getElementById('modalRemainingDays').value = '';
                renderModalHistory([]);
            }
            document.getElementById('processControlModal').style.display = 'flex';
        }

        function generatePPAno() {
            const year = new Date().getFullYear();
            const lastId = state.processes.filter(p => p.ppAno.endsWith(`/${year}`)).length + 1;
            return `${String(lastId).padStart(3, '0')}/${year}`;
        }

        function closeModal(id) { document.getElementById(id).style.display = 'none'; }

        document.getElementById('processForm').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('processId').value;
            const dataBase = {
                pp_number: document.getElementById('ppNumber').value,
                exercise_year: document.getElementById('exerciseYear').value,
                pp_ano: document.getElementById('ppAno').value,
                cover_value: document.getElementById('coverValue').value,
                supplier_name: document.getElementById('supplierSelect').value,
                object_name: document.getElementById('objectSelect').value,
                opening_date: document.getElementById('openingDate').value,
                deadline: document.getElementById('deadline').value,
                treated_by: document.getElementById('treatedBy').value,
                status: document.getElementById('statusSelect').value,
                location: document.getElementById('locationSelect').value,
                location_date: document.getElementById('locationDate').value,
                situation: document.getElementById('situation').value,
                notes: document.getElementById('notes').value
            };

            const btn = document.querySelector('#processForm button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Salvando...';
            btn.disabled = true;

            try {
                if (id) {
                    const idx = state.processes.findIndex(p => p.id === id);
                    const oldLoc = state.processes[idx].location;

                    const { error } = await supabase.from('processes').update(dataBase).eq('id', id);
                    if (error) throw error;

                    if (oldLoc !== dataBase.location) {
                        await supabase.from('process_history').insert({
                            process_id: id,
                            history_date: new Date().toLocaleString(),
                            location_from: oldLoc,
                            location_to: dataBase.location
                        });
                    }
                } else {
                    const { data: newProc, error } = await supabase.from('processes').insert(dataBase).select().single();
                    if (error) throw error;

                    const newHistories = [
                        { process_id: newProc.id, history_date: new Date().toLocaleString(), location_from: 'Início', location_to: dataBase.location },
                        ...(window._tempHistory || []).map(h => ({ process_id: newProc.id, history_date: h.date, message: h.message }))
                    ];

                    await supabase.from('process_history').insert(newHistories);
                }

                await initApp();
                closeModal('processControlModal');
            } catch (error) {
                console.error(error);
                alert("Erro ao salvar o processo no banco de dados.");
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        };

        function showHistory(process) {
            const timeline = document.getElementById('historyTimeline');
            const summary = document.getElementById('historyProcessSummary');

            summary.innerHTML = `Processo: <strong>${process.ppAno}</strong> | Fornecedor: <strong>${process.supplier}</strong>`;
            timeline.innerHTML = '';

            const history = process.history || [];
            if (history.length === 0) {
                timeline.innerHTML = '<p style="text-align:center; color:#94A3B8; padding:2rem;">Nenhum registro encontrado.</p>';
            } else {
                [...history].reverse().forEach(h => {
                    const item = document.createElement('div');
                    const isMovement = h.from !== undefined;
                    item.className = `history-item ${isMovement ? 'movement' : 'log'}`;

                    item.innerHTML = `
                        <div class="history-node"></div>
                        <div class="history-date">
                            <i class="far fa-clock"></i> ${h.date}
                            <span class="history-badge ${isMovement ? 'badge-movement' : 'badge-log'}">
                                ${isMovement ? 'MUDANÇA DE LOCAL' : 'REGISTRO MANUAL'}
                            </span>
                        </div>
                        <div class="history-card">
                            <div class="history-title">
                                ${isMovement ? '<i class="fas fa-exchange-alt"></i> Tramitação de Localização' : '<i class="fas fa-comment-dots"></i> Atualização de Status'}
                            </div>
                            <div class="history-details">
                                ${isMovement
                            ? `<span>De: <strong>${h.from}</strong></span> <i class="fas fa-long-arrow-alt-right"></i> <span>Para: <strong>${h.to}</strong></span>`
                            : h.message}
                            </div>
                        </div>
                    `;
                    timeline.appendChild(item);
                });
            }
            document.getElementById('processHistoryModal').style.display = 'flex';
        }

        function openConfigModal(type) {
            state.currentConfigType = type;
            const labels = { suppliers: 'Fornecedores', locations: 'Localizações', objects: 'Objetos', users: 'Usuários', statuses: 'Status', handlers: 'Tratadores' };
            document.getElementById('configModalTitle').innerText = `Gestão de ${labels[type]}`;
            renderConfigList();
            document.getElementById('processConfigModal').style.display = 'flex';
        }

        function renderConfigList() {
            const list = document.getElementById('configList');
            list.innerHTML = '';
            state[state.currentConfigType].forEach((item, idx) => {
                const li = document.createElement('li');
                li.style = 'display:flex; justify-content:space-between; padding:0.5rem; border-bottom:1px solid #eee;';
                li.innerHTML = `<span>${item}</span><i class="fas fa-trash" style="color:red; cursor:pointer" onclick="deleteConfigItem(${idx})"></i>`;
                list.appendChild(li);
            });
            const inputLabel = { suppliers: 'Nome do Fornecedor', locations: 'Nome da Localização', objects: 'Nome do Objeto', users: 'Nome do Usuário', statuses: 'Status do Processo', handlers: 'Nome do Tratador do Processo' };
            document.getElementById('configInputLabel').innerText = inputLabel[state.currentConfigType] || 'Novo Item';
        }

        async function saveConfigItem() {
            const table = state.currentConfigType;
            const val = document.getElementById('configInput').value.trim();
            if (val) {
                try {
                    const { error } = await supabase.from(table).insert({ name: val });
                    if (error) throw error;

                    state[table].push(val);
                    document.getElementById('configInput').value = '';
                    renderConfigList();
                    updateSelects();
                } catch (e) {
                    console.error(e);
                    alert(`Erro ao adicionar item em ${table}.`);
                }
            }
        }

        async function deleteConfigItem(idx) {
            const table = state.currentConfigType;
            const nameToDelete = state[table][idx];
            try {
                const { error } = await supabase.from(table).delete().eq('name', nameToDelete);
                if (error) throw error;

                state[table].splice(idx, 1);
                renderConfigList();
                updateSelects();
            } catch (e) {
                console.error(e);
                alert(`Erro ao remover item de ${table}.`);
            }
        }

        async function quickAddConfig(type) {
            const labels = { suppliers: 'Fornecedor', locations: 'Localização', objects: 'Objeto', statuses: 'Status', handlers: 'Tratador' };
            const val = prompt(`Digite o novo ${labels[type]}:`);
            if (val && val.trim()) {
                const trimmed = val.trim();
                if (state[type].includes(trimmed)) {
                    alert('Este item já existe.');
                    return;
                }

                try {
                    const { error } = await supabase.from(type).insert({ name: trimmed });
                    if (error) throw error;

                    state[type].push(trimmed);
                    updateSelects();

                    const selectId = type === 'suppliers' ? 'supplierSelect' :
                        type === 'objects' ? 'objectSelect' :
                            type === 'locations' ? 'locationSelect' :
                                type === 'handlers' ? 'treatedBy' : 'statusSelect';
                    document.getElementById(selectId).value = trimmed;
                } catch (e) {
                    console.error(e);
                    alert(`Erro ao adicionar ${labels[type]}.`);
                }
            }
        }

        async function deleteProcess(id) {
            if (confirm('Tem certeza que deseja excluir este processo?')) {
                try {
                    const { error } = await supabase.from('processes').delete().eq('id', id);
                    if (error) throw error;

                    state.processes = state.processes.filter(p => p.id !== id);
                    renderProcessTable();
                    updateDashboardCounters();
                } catch (error) {
                    console.error(error);
                    alert("Erro ao excluir processo do banco de dados.");
                }
            }
        }

        function updateSelects() {
            const fills = [
                { id: 'supplierSelect', data: state.suppliers },
                { id: 'objectSelect', data: state.objects },
                { id: 'locationSelect', data: state.locations },
                { id: 'statusSelect', data: state.statuses },
                { id: 'treatedBy', data: state.handlers },
                { id: 'statusFilter', data: state.statuses, opt: true },
                { id: 'locationFilter', data: state.locations, opt: true }
            ];
            fills.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                el.innerHTML = f.opt ? `<option value="">Selecione...</option>` : '';
                f.data.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item; opt.innerText = item;
                    el.appendChild(opt);
                });
                if (currentVal && Array.from(el.options).some(o => o.value === currentVal)) {
                    el.value = currentVal;
                }
            });
        }

        async function exportToPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better fit
            const margin = 14;
            const logoUrl = "https://novoportal.itaguai.rj.gov.br/@@obter_logo_portal/logo25.png";

            try {
                // Header Area
                // Logo
                doc.addImage(logoUrl, 'PNG', margin, 10, 40, 20);

                // Institutional Texts
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text("ESTADO DO RIO DE JANEIRO", 60, 15);
                doc.text("PREFEITURA MUNICIPAL DE ITAGUAÍ", 60, 20);
                doc.text("SECRETARIA MUNICIPAL DE EDUCAÇÃO", 60, 25);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.setTextColor(0);
                doc.text("CONTROLE DE PROCESSOS DE PAGAMENTOS", 60, 35);

                // Line separator
                doc.setDrawColor(200);
                doc.line(margin, 42, 283, 42);

                // Emission Date
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(150);
                const now = new Date();
                const emissionDate = now.toLocaleString('pt-BR');
                doc.text(`Data de Emissão: ${emissionDate}`, margin, 48);

                // Table Data
                const head = [[
                    'NÚMERO DO P.P.', 'ANO', 'PPANO', 'FORNECEDOR',
                    'VALOR DE CAPA', 'DATA DE CONCLUSÃO', 'TRATADO POR',
                    'STATUS', 'Localização', 'SITUAÇÃO',
                    'Ano Exercício OF', 'OBSERVAÇÃO'
                ]];

                const body = state.processes.map(p => [
                    p.ppNumber,
                    p.ppAno.split('/')[1] || '',
                    p.ppAno,
                    p.supplier,
                    p.coverValue,
                    p.deadline ? new Date(p.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : '',
                    p.treatedBy,
                    p.status,
                    `${p.location} | ${p.locationDate ? new Date(p.locationDate + 'T12:00:00').toLocaleDateString('pt-BR') : ''}`,
                    p.situation,
                    p.exerciseYear,
                    p.notes
                ]);

                doc.autoTable({
                    head: head,
                    body: body,
                    startY: 55,
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: 7,
                        cellPadding: 2,
                        lineColor: [200, 200, 200],
                        lineWidth: 0.1,
                    },
                    headStyles: {
                        fillColor: [0, 0, 0], // Base color
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 15 }, // PP Number
                        1: { cellWidth: 12 }, // Ano
                        2: { cellWidth: 18 }, // PPANO
                        3: { cellWidth: 45 }, // Fornecedor
                        4: { cellWidth: 20 }, // Valor
                        11: { cellWidth: 35 } // Observação
                    },
                    didParseCell: function (data) {
                        if (data.section === 'head') {
                            const green = [122, 147, 66]; // #7A9342
                            const black = [0, 0, 0];

                            const colIndex = data.column.index;
                            if (colIndex === 0 || colIndex === 1 || // NUMERO, ANO
                                (colIndex >= 4 && colIndex <= 6) || // VALOR, DATA CONCLUSAO, TRATADO
                                colIndex === 11) {                  // OBSERVACAO
                                data.cell.styles.fillColor = green;
                            } else {
                                data.cell.styles.fillColor = black;
                            }
                        }
                    }
                });

                doc.save(`processos_pagamento_${now.getTime()}.pdf`);
            } catch (error) {
                console.error("Erro ao gerar PDF:", error);
                alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
            }
        }

        function exportToExcel() {
            const ws = XLSX.utils.json_to_sheet(state.processes);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Processos");
            XLSX.writeFile(wb, "processos.xlsx");
        }
    
