// ==================== MAIN.JS ====================
// Inicializa aplicação e coordena todos os scripts

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Aplicação iniciada');

    // Aguarda todos os scripts carregarem
    initializeApp();
});

function initializeApp() {
    console.log('✓ App inicializado');

    // Analytics (opcional)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view');
    }

    // Inicia observador de interseção para animações ao scroll
    initIntersectionObserver();
}

// ==================== INTERSECTION OBSERVER ====================
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');

                // Anima contadores
                if (entry.target.id === 'charCount') {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observa todos os elementos com classe "animate-on-scroll"
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

// ==================== ANIMATE COUNTER ====================
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    let current = 0;
    const increment = target / 50;

    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== DETECT USER DEVICE ====================
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
}

console.log('📱 Dispositivo:', getDeviceType());

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (event) => {
    console.error('❌ Erro:', event.error);
    // Em produção, envie para serviço de log
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejection:', event.reason);
});