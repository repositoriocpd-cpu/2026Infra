(function() {
    let deferredPrompt;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // Criar o HTML do Banner se não for standalone
    if (!isStandalone) {
        window.addEventListener('load', () => {
            const banner = document.createElement('div');
            banner.id = 'pwa-install-banner';
            banner.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: rgba(6, 78, 59, 0.9);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 16px;
                z-index: 9999;
                color: white;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                transform: translateY(150%);
                transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;

            banner.innerHTML = `
                <img src="icons/icon-192.png" style="width: 48px; height: 48px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 600;">Instalar INFRASMEDU</h4>
                    <p id="pwa-text" style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${isIOS ? 'Toque em Compartilhar > Adicionar à Tela de Início' : 'Adicione à tela inicial para acesso rápido'}</p>
                </div>
                ${isIOS ? '' : '<button id="pwa-install-btn" style="background: white; color: #064e3b; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">Instalar</button>'}
                <button id="pwa-close-btn" style="background: transparent; color: white; border: none; font-size: 20px; cursor: pointer; padding: 0 4px;">&times;</button>
            `;

            document.body.appendChild(banner);

            const showBanner = () => banner.style.transform = 'translateY(0)';
            const hideBanner = () => banner.style.transform = 'translateY(150%)';

            document.getElementById('pwa-close-btn').onclick = hideBanner;

            if (isIOS) {
                // Mostrar para iOS após 3 segundos se não for standalone
                setTimeout(showBanner, 3000);
            }

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                showBanner();

                const installBtn = document.getElementById('pwa-install-btn');
                if (installBtn) {
                    installBtn.onclick = () => {
                        hideBanner();
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult) => {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('Usuário aceitou a instalação');
                            }
                            deferredPrompt = null;
                        });
                    };
                }
            });
        });
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('SW registrado com sucesso!', reg);
            }).catch(err => {
                console.log('Falha ao registrar SW:', err);
            });
        });
    }
})();
