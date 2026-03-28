/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT BASE
   Funcionalidades esenciales para templates/base.html
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
window.englishHub = window.englishHub || {};
window.englishHub.config = {
    debug: false,
    soundEnabled: true,
    notificationsEnabled: true,
    theme: 'auto',
    language: 'es'
};

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌍 English Learning Hub - Inicializado');
    
    // Inicializar componentes de Bootstrap
    initializeBootstrapComponents();
    
    // Configurar eventos globales
    setupGlobalEvents();
    
    // Cargar preferencias del usuario
    loadUserPreferences();
    
    // Inicializar tema
    initializeTheme();
    
    // Configurar lazy loading
    setupLazyLoading();
    
    // Configurar animaciones de scroll
    setupScrollAnimations();
    
    // Marcar enlace activo en navegación
    highlightActiveNavLink();
    
    // Configurar cierre automático de alertas
    autoCloseAlerts();
});

// ========================================
// COMPONENTES DE BOOTSTRAP
// ========================================
function initializeBootstrapComponents() {
    // Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover',
            placement: 'top'
        });
    });
    
    // Popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl, {
            trigger: 'click',
            html: true
        });
    });
    
    // Toasts
    const toastTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="toast"]'));
    toastTriggerList.map(function(toastTriggerEl) {
        const toast = new bootstrap.Toast(toastTriggerEl, {
            autohide: true,
            delay: 3000
        });
        toastTriggerEl.addEventListener('click', () => toast.show());
    });
    
    // Dropdowns
    const dropdownTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
    dropdownTriggerList.map(function(dropdownTriggerEl) {
        return new bootstrap.Dropdown(dropdownTriggerEl);
    });
    
    // Modals
    const modalTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="modal"]'));
    modalTriggerList.map(function(modalTriggerEl) {
        const modal = new bootstrap.Modal(modalTriggerEl);
        modalTriggerEl.addEventListener('click', () => modal.show());
    });
}

// ========================================
// EVENTOS GLOBALES
// ========================================
function setupGlobalEvents() {
    // Cerrar alertas con botón
    document.querySelectorAll('.alert .btn-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const alert = this.closest('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 300);
            }
        });
    });
    
    // Confirmar antes de salir si hay cambios
    let hasUnsavedChanges = false;
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('input', () => {
            hasUnsavedChanges = true;
        });
    });
    
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de salir?';
        }
    });
    
    // Tecla Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modal = bootstrap.Modal.getInstance(openModal);
                modal.hide();
            }
        }
    });
    
    // Prevenir envío duplicado de formularios
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('[type="submit"]');
            if (submitBtn && submitBtn.disabled) {
                e.preventDefault();
                return;
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
}

// ========================================
// PREFERENCIAS DE USUARIO
// ========================================
function loadUserPreferences() {
    // Cargar preferencias desde localStorage
    const savedSound = localStorage.getItem('soundEnabled');
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedSound !== null) window.englishHub.config.soundEnabled = savedSound === 'true';
    if (savedNotifications !== null) window.englishHub.config.notificationsEnabled = savedNotifications === 'true';
    if (savedTheme) window.englishHub.config.theme = savedTheme;
    if (savedLanguage) window.englishHub.config.language = savedLanguage;
}

function saveUserPreferences() {
    localStorage.setItem('soundEnabled', window.englishHub.config.soundEnabled);
    localStorage.setItem('notificationsEnabled', window.englishHub.config.notificationsEnabled);
    localStorage.setItem('theme', window.englishHub.config.theme);
    localStorage.setItem('language', window.englishHub.config.language);
}

// ========================================
// TEMA OSCURO/CLARO
// ========================================
function initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-theme');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    window.englishHub.config.theme = isDark ? 'dark' : 'light';
    saveUserPreferences();
    showToast(isDark ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado', 'info', 2000);
}

// ========================================
// SISTEMA DE NOTIFICACIONES (TOAST)
// ========================================
function showToast(message, type = 'success', duration = 3000) {
    // Crear contenedor si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1080';
        document.body.appendChild(toastContainer);
    }
    
    // Crear toast
    const toastId = `toast-${Date.now()}`;
    const icon = getToastIcon(type);
    const bgClass = `bg-${type}`;
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
    toast.show();
    
    // Eliminar del DOM después de ocultarse
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle-fill',
        'danger': 'exclamation-triangle-fill',
        'warning': 'exclamation-circle-fill',
        'info': 'info-circle-fill',
        'primary': 'star-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// ========================================
// NOTIFICACIONES DEL SISTEMA
// ========================================
function showNotification(title, body, icon = '🎉') {
    if (!window.englishHub.config.notificationsEnabled) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`)}` });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ========================================
// SISTEMA DE SONIDOS
// ========================================
function playSound(type) {
    if (!window.englishHub.config.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            'correct': 523.25,
            'incorrect': 392.00,
            'hint': 440.00,
            'success': 659.25,
            'click': 330.00,
            'level-up': 783.99,
            'achievement': 987.77
        };
        
        oscillator.frequency.value = frequencies[type] || 440.00;
        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        if (window.englishHub.config.debug) console.log('Audio not supported:', error);
    }
}

// ========================================
// EFECTOS VISUALES
// ========================================
function launchConfetti() {
    if (typeof confetti !== 'undefined') {
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#ff595e', '#ff9d59', '#ffd459', '#8ac926', '#1982c4', '#6a4c93'];
        
        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });
            
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

function createParticles(x, y, emoji = '✨', count = 15) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
        particle.style.top = (y + (Math.random() - 0.5) * 100) + 'px';
        particle.style.fontSize = (Math.random() * 20 + 10) + 'px';
        particle.style.position = 'fixed';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.animation = 'floatUp 2s ease-out forwards';
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
    }
}

// ========================================
// NAVEGACIÓN Y UTILIDADES
// ========================================
function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentPath.includes(href)) {
            link.classList.add('active');
        } else if (currentPath === '/' && href === '/') {
            link.classList.add('active');
        }
    });
}

function autoCloseAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        }, 5000);
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });
    
    images.forEach(img => imageObserver.observe(img));
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// CONTADORES ANIMADOS
// ========================================
function initializeAnimatedCounters() {
    const counters = document.querySelectorAll('.counter-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(interval);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ========================================
// UTILIDADES GENERALES
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Justo ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} d`;
    
    return date.toLocaleDateString();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// ALMACENAMIENTO LOCAL
// ========================================
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved);
        }
        return defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

// ========================================
// API REQUESTS
// ========================================
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast('Error de conexión', 'danger');
        throw error;
    }
}

// ========================================
// COMPARTIR CONTENIDO
// ========================================
async function shareContent(content, title = 'English Learning Hub') {
    const shareData = {
        title: title,
        text: content,
        url: window.location.href
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('¡Gracias por compartir!', 'success');
        } catch (err) {
            if (window.englishHub.config.debug) console.log('Error sharing:', err);
        }
    } else {
        await navigator.clipboard.writeText(`${content} ${window.location.href}`);
        showToast('¡Enlace copiado al portapapeles!', 'success');
    }
}

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.englishHub = {
    ...window.englishHub,
    config: window.englishHub.config,
    showToast,
    showNotification,
    requestNotificationPermission,
    playSound,
    launchConfetti,
    createParticles,
    toggleTheme,
    shareContent,
    fetchAPI,
    saveToLocalStorage,
    loadFromLocalStorage,
    formatDate,
    formatTime,
    escapeHtml,
    debounce,
    throttle
};

// ========================================
// INICIALIZAR CONTADORES ANIMADOS
// ========================================
initializeAnimatedCounters();
