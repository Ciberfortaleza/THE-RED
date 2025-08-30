// Global Menu Component for THE RED
// Este archivo contiene el menú lateral que se puede usar en todas las páginas

class GlobalMenu {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.injectMenuHTML();
        this.injectMenuCSS();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    injectMenuHTML() {
        const menuHTML = `
            <!-- Menú Lateral Izquierdo (para el botón "Menú") -->
            <div class="side-menu-left" id="sideMenu">
                <div class="side-menu-header">
                    <span class="side-menu-title" id="sideMenuMainTitle">Menú Principal</span>
                    <button class="side-menu-close-btn" id="closeSideMenuBtn">×</button>
                </div>
                <!-- Contenedor para la navegación principal del menú lateral -->
                <nav class="side-menu-nav" id="sideMenuNavContent">
                    <a href="#" class="side-menu-item" id="sideMenuMission"><i class="fas fa-bullseye"></i> Misión</a>
                    <a href="#" class="side-menu-item" id="sideMenuWhoAreWe"><i class="fas fa-users"></i> Quiénes Somos</a>
                    <a href="#" class="side-menu-item" id="sideMenuPrices"><i class="fas fa-tag"></i> Precios</a>
                    <a href="#" class="side-menu-item" id="sideMenuSupport"><i class="fas fa-question-circle"></i> Soporte y Ayuda</a>
                    <a href="#" class="side-menu-item" id="sideMenuDevelopers"><i class="fas fa-code"></i> Desarrolladores</a>
                    <a href="#" class="side-menu-item" id="sideMenuLogout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </nav>
            </div>

            <!-- Menú Lateral Derecho (para el botón "Recompensas") -->
            <div class="side-menu-right" id="rewardsSideMenu">
                <div class="side-menu-header">
                    <span class="side-menu-title">Recompensas</span>
                    <button class="side-menu-close-btn" id="closeRewardsSideMenuBtn">×</button>
                </div>
                <nav class="side-menu-nav">
                    <a href="#" class="side-menu-item" data-message="Mostrando tus puntos."><i class="fas fa-star"></i> Mis Puntos</a>
                    <a href="#" class="side-menu-item" data-message="Abriendo la tienda de recompensas."><i class="fas fa-gift"></i> Canjear Recompensas</a>
                    <a href="#" class="side-menu-item" data-message="Mostrando tus logros."><i class="fas fa-trophy"></i> Logros</a>
                    <a href="#" class="side-menu-item" data-message="Consultando tu historial de recompensas."><i class="fas fa-chart-line"></i> Historial</a>
                </nav>
            </div>

            <!-- Modal de Información -->
            <div class="modal" id="infoModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="infoModalTitle">Información</h2>
                        <button class="modal-close-btn" id="closeInfoModalBtn">×</button>
                    </div>
                    <div class="modal-body" id="infoModalBody">
                        <div id="infoModalBodyContent"></div>
                    </div>
                </div>
            </div>
        `;

        // Insertar el HTML al final del body
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    injectMenuCSS() {
        const cssStyles = `
            <style id="global-menu-styles">
                /* Variables CSS para el menú */
                :root {
                    --dark-purple: #1e0525;
                    --medium-purple: #4a1a55;
                    --light-purple: #7d3490;
                    --dark-red: #a0001a;
                    --medium-red: #e01030;
                    --light-red: #ff3058;
                    --side-menu-width: 280px;
                    --gradient-red-light: linear-gradient(45deg, #ff3058, #e01030);
                }

                /* --- Menú Lateral Izquierdo --- */
                .side-menu-left {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: var(--side-menu-width);
                    height: 100%;
                    background-color: rgba(30, 5, 37, 0.9);
                    backdrop-filter: blur(15px);
                    border-right: 1px solid rgba(125, 52, 144, 0.3);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: translateX(-100%);
                }

                .side-menu-left.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0);
                }

                /* --- Menú Lateral Derecho --- */
                .side-menu-right {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: var(--side-menu-width);
                    height: 100%;
                    background-color: rgba(30, 5, 37, 0.9);
                    backdrop-filter: blur(15px);
                    border-left: 1px solid rgba(125, 52, 144, 0.3);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: translateX(100%);
                }

                .side-menu-right.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0);
                }

                .side-menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 25px 25px 25px;
                    border-bottom: 1px solid rgba(125, 52, 144, 0.3);
                    margin-bottom: 25px;
                }

                .side-menu-title {
                    font-size: 1.8em;
                    font-weight: 800;
                    color: var(--light-red);
                    text-shadow: 0 0 10px rgba(255, 48, 88, 0.7);
                }

                .side-menu-close-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                }

                .side-menu-close-btn:hover {
                    color: var(--medium-red);
                    transform: scale(1.1) rotate(90deg);
                }

                .side-menu-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex-grow: 1;
                    overflow-y: auto;
                }

                .side-menu-item {
                    display: flex;
                    align-items: center;
                    padding: 15px 25px;
                    color: #fff;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border-radius: 12px;
                    margin: 0 15px;
                    position: relative;
                    overflow: hidden;
                }

                .side-menu-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: var(--gradient-red-light);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                    z-index: -1;
                }

                .side-menu-item:hover::before {
                    transform: scaleX(1);
                }

                .side-menu-item:hover {
                    color: #fff;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
                }

                .side-menu-item:hover i {
                    color: var(--light-red);
                }

                .side-menu-item i {
                    margin-right: 15px;
                    font-size: 1.2em;
                    transition: color 0.3s ease;
                }

                /* Modal Styles */
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 10000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                }

                .modal.show {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-content {
                    background: linear-gradient(135deg, rgba(30, 5, 37, 0.95), rgba(74, 26, 85, 0.95));
                    border-radius: 15px;
                    border: 1px solid rgba(125, 52, 144, 0.3);
                    max-width: 90%;
                    max-height: 90%;
                    width: 600px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 25px;
                    border-bottom: 1px solid rgba(125, 52, 144, 0.3);
                }

                .modal-header h2 {
                    color: var(--light-red);
                    font-size: 1.8em;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 48, 88, 0.5);
                }

                .modal-close-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .modal-close-btn:hover {
                    color: var(--medium-red);
                    transform: scale(1.1) rotate(90deg);
                }

                .modal-body {
                    padding: 25px;
                    color: #fff;
                    max-height: 400px;
                    overflow-y: auto;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    :root {
                        --side-menu-width: 250px;
                    }

                    .side-menu-header {
                        padding: 0 18px 18px 18px;
                    }

                    .side-menu-item {
                        padding: 12px 18px;
                        font-size: 1.05em;
                    }

                    .modal-content {
                        width: 95%;
                        margin: 10px;
                    }
                }
            </style>
        `;

        // Insertar los estilos en el head
        document.head.insertAdjacentHTML('beforeend', cssStyles);
    }

    setupEventListeners() {
        // Elementos del DOM
        const sideMenu = document.getElementById('sideMenu');
        const closeSideMenuBtn = document.getElementById('closeSideMenuBtn');
        const rewardsSideMenu = document.getElementById('rewardsSideMenu');
        const closeRewardsSideMenuBtn = document.getElementById('closeRewardsSideMenuBtn');
        const infoModal = document.getElementById('infoModal');
        const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');

        // Event listeners para abrir menús (se conectarán con los botones del footer)
        document.addEventListener('click', (e) => {
            // Menú principal
            if (e.target.id === 'navMenu' || e.target.closest('#navMenu')) {
                this.openSideMenu();
            }
            
            // Menú de recompensas
            if (e.target.id === 'navRewards' || e.target.closest('#navRewards')) {
                this.openRewardsMenu();
            }
        });

        // Cerrar menú lateral izquierdo
        if (closeSideMenuBtn) {
            closeSideMenuBtn.addEventListener('click', () => {
                this.closeSideMenu();
            });
        }

        // Cerrar menú lateral derecho
        if (closeRewardsSideMenuBtn) {
            closeRewardsSideMenuBtn.addEventListener('click', () => {
                this.closeRewardsMenu();
            });
        }

        // Cerrar modal
        if (closeInfoModalBtn) {
            closeInfoModalBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Cerrar menús al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (sideMenu && sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && !e.target.closest('#navMenu')) {
                this.closeSideMenu();
            }
            
            if (rewardsSideMenu && rewardsSideMenu.classList.contains('open') && !rewardsSideMenu.contains(e.target) && !e.target.closest('#navRewards')) {
                this.closeRewardsMenu();
            }

            if (infoModal && infoModal.classList.contains('show') && e.target === infoModal) {
                this.closeModal();
            }
        });

        // Event listeners para elementos del menú
        this.setupMenuItemListeners();
    }

    setupMenuItemListeners() {
        // Elementos del menú lateral
        const sideMenuMission = document.getElementById('sideMenuMission');
        const sideMenuWhoAreWe = document.getElementById('sideMenuWhoAreWe');
        const sideMenuPrices = document.getElementById('sideMenuPrices');
        const sideMenuSupport = document.getElementById('sideMenuSupport');
        const sideMenuDevelopers = document.getElementById('sideMenuDevelopers');
        const sideMenuLogout = document.getElementById('sideMenuLogout');

        // Contenido para cada sección
        const menuContent = {
            mission: {
                title: 'Nuestra Misión',
                content: `
                    <h3>🚀 Conectar el Futuro</h3>
                    <p>En THE RED, nuestra misión es crear la red social más innovadora y segura del mundo, donde cada usuario puede expresarse libremente y conectar con personas que comparten sus intereses y valores.</p>
                    
                    <h4>🎯 Nuestros Objetivos:</h4>
                    <ul>
                        <li>Fomentar conexiones auténticas y significativas</li>
                        <li>Proteger la privacidad y seguridad de nuestros usuarios</li>
                        <li>Impulsar la innovación en redes sociales</li>
                        <li>Crear un espacio inclusivo para todos</li>
                    </ul>
                `
            },
            whoAreWe: {
                title: 'Quiénes Somos',
                content: `
                    <h3>👥 El Equipo THE RED</h3>
                    <p>Somos un equipo apasionado de desarrolladores, diseñadores y visionarios tecnológicos comprometidos con revolucionar la forma en que las personas se conectan en línea.</p>
                    
                    <h4>🌟 Nuestros Valores:</h4>
                    <ul>
                        <li><strong>Innovación:</strong> Siempre buscamos nuevas formas de mejorar</li>
                        <li><strong>Privacidad:</strong> Tu información es sagrada para nosotros</li>
                        <li><strong>Comunidad:</strong> Construimos juntos un mejor futuro digital</li>
                        <li><strong>Transparencia:</strong> Comunicación clara y honesta</li>
                    </ul>
                `
            },
            prices: {
                title: 'Precios y Planes',
                content: `
                    <h3>💎 Planes de THE RED</h3>
                    
                    <h4>🆓 Plan Gratuito</h4>
                    <ul>
                        <li>Perfil personalizable</li>
                        <li>Publicaciones ilimitadas</li>
                        <li>Red de contactos básica</li>
                        <li>Funciones de descubrimiento</li>
                    </ul>
                    
                    <h4>⭐ Plan Premium - $9.99/mes</h4>
                    <ul>
                        <li>Todo lo del plan gratuito</li>
                        <li>Temas exclusivos</li>
                        <li>Análisis avanzados</li>
                        <li>Soporte prioritario</li>
                        <li>Sin publicidad</li>
                    </ul>
                `
            },
            support: {
                title: 'Soporte y Ayuda',
                content: `
                    <h3>🆘 ¿Necesitas Ayuda?</h3>
                    <p>Estamos aquí para ayudarte. Nuestro equipo de soporte está disponible 24/7.</p>
                    
                    <h4>📞 Contacto:</h4>
                    <ul>
                        <li><strong>Email:</strong> support@thered.com</li>
                        <li><strong>Chat en vivo:</strong> Disponible en la app</li>
                        <li><strong>Centro de ayuda:</strong> help.thered.com</li>
                    </ul>
                    
                    <h4>❓ Preguntas Frecuentes:</h4>
                    <ul>
                        <li>¿Cómo cambio mi contraseña?</li>
                        <li>¿Cómo configuro mi privacidad?</li>
                        <li>¿Cómo reporto contenido inapropiado?</li>
                    </ul>
                `
            },
            developers: {
                title: 'Para Desarrolladores',
                content: `
                    <h3>👨‍💻 API de THE RED</h3>
                    <p>Construye aplicaciones increíbles con nuestra API robusta y bien documentada.</p>
                    
                    <h4>🔧 Recursos para Desarrolladores:</h4>
                    <ul>
                        <li><strong>API REST:</strong> Acceso completo a datos</li>
                        <li><strong>SDK JavaScript:</strong> Integración fácil</li>
                        <li><strong>Webhooks:</strong> Notificaciones en tiempo real</li>
                        <li><strong>Documentación:</strong> docs.thered.com</li>
                    </ul>
                    
                    <h4>🚀 Empezar:</h4>
                    <p>Regístrate en nuestro portal de desarrolladores y obtén tu API key gratuita.</p>
                `
            }
        };

        // Event listeners para cada elemento del menú
        if (sideMenuMission) {
            sideMenuMission.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(menuContent.mission.title, menuContent.mission.content);
            });
        }

        if (sideMenuWhoAreWe) {
            sideMenuWhoAreWe.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(menuContent.whoAreWe.title, menuContent.whoAreWe.content);
            });
        }

        if (sideMenuPrices) {
            sideMenuPrices.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(menuContent.prices.title, menuContent.prices.content);
            });
        }

        if (sideMenuSupport) {
            sideMenuSupport.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(menuContent.support.title, menuContent.support.content);
            });
        }

        if (sideMenuDevelopers) {
            sideMenuDevelopers.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(menuContent.developers.title, menuContent.developers.content);
            });
        }

        if (sideMenuLogout) {
            sideMenuLogout.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Event listeners para elementos del menú de recompensas
        document.querySelectorAll('.side-menu-right .side-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const message = item.getAttribute('data-message') || 'Funcionalidad en desarrollo';
                this.showNotification(message);
            });
        });
    }

    // Métodos para controlar los menús
    openSideMenu() {
        const sideMenu = document.getElementById('sideMenu');
        if (sideMenu) {
            sideMenu.classList.add('open');
        }
    }

    closeSideMenu() {
        const sideMenu = document.getElementById('sideMenu');
        if (sideMenu) {
            sideMenu.classList.remove('open');
        }
    }

    openRewardsMenu() {
        const rewardsSideMenu = document.getElementById('rewardsSideMenu');
        if (rewardsSideMenu) {
            rewardsSideMenu.classList.add('open');
        }
    }

    closeRewardsMenu() {
        const rewardsSideMenu = document.getElementById('rewardsSideMenu');
        if (rewardsSideMenu) {
            rewardsSideMenu.classList.remove('open');
        }
    }

    showModal(title, content) {
        const infoModal = document.getElementById('infoModal');
        const infoModalTitle = document.getElementById('infoModalTitle');
        const infoModalBodyContent = document.getElementById('infoModalBodyContent');

        if (infoModal && infoModalTitle && infoModalBodyContent) {
            infoModalTitle.textContent = title;
            infoModalBodyContent.innerHTML = content;
            infoModal.classList.add('show');
            this.closeSideMenu(); // Cerrar el menú lateral
        }
    }

    closeModal() {
        const infoModal = document.getElementById('infoModal');
        if (infoModal) {
            infoModal.classList.remove('show');
        }
    }

    showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff3058, #e01030);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: bold;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        this.closeRewardsMenu(); // Cerrar el menú de recompensas
    }

    async logout() {
        try {
            // Importar Firebase Auth dinámicamente
            const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
            const auth = getAuth();
            
            await signOut(auth);
            
            // Limpiar almacenamiento local
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir al login
            window.location.href = '../login.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Fallback: redirigir de todas formas
            window.location.href = '../login.html';
        }
    }
}

// Inicializar el menú global cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.globalMenu = new GlobalMenu();
});

// También inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.globalMenu = new GlobalMenu();
    });
} else {
    window.globalMenu = new GlobalMenu();
}
