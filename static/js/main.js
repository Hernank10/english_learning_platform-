/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT PRINCIPAL
   Funcionalidades interactivas para toda la plataforma
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let currentStreak = 0;
let totalScore = 0;
let userLevel = 1;
let userStars = 0;
let notificationsEnabled = true;
let soundEnabled = true;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 English Learning Hub - Inicializado correctamente');
    
    // Inicializar tooltips de Bootstrap
    initializeTooltips();
    
    // Inicializar popovers de Bootstrap
    initializePopovers();
    
    // Configurar eventos globales
    setupGlobalEvents();
    
    // Cargar preferencias del usuario
    loadUserPreferences();
    
    // Inicializar contadores animados
    initializeAnimatedCounters();
    
    // Configurar lazy loading de imágenes
    setupLazyLoading();
    
    // Inicializar tema oscuro/claro
    initializeTheme();
});

// ========================================
// INICIALIZACIÓN DE COMPONENTES BOOTSTRAP
// ========================================
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initializePopovers() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

// ========================================
// EVENTOS GLOBALES
// ========================================
function setupGlobalEvents() {
    // Marcar enlace activo en la navegación
    highlightActiveNavLink();
    
    // Configurar cierre automático de alertas
    autoCloseAlerts();
    
    // Configurar scroll suave para enlaces internos
    setupSmoothScroll();
    
    // Configurar botones de compartir
    setupShareButtons();
}

function highlightActiveNavLink() {
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentLocation.includes(href)) {
            link.classList.add('active');
        }
    });
}

function autoCloseAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        }, 5000);
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
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

// ========================================
// SISTEMA DE NOTIFICACIONES
// ========================================
function showToast(message, type = 'success', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 fade show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${icon} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '1080';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle-fill',
        'danger': 'exclamation-triangle-fill',
        'warning': 'exclamation-circle-fill',
        'info': 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// ========================================
// SISTEMA DE CONFETI Y PARTÍCULAS
// ========================================
function launchConfetti() {
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
// SISTEMA DE SONIDOS
// ========================================
function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            'correct': 523.25,   // Do
            'incorrect': 392.00, // Sol
            'hint': 440.00,      // La
            'success': 659.25,   // Mi
            'click': 330.00      // Mi bajo
        };
        
        oscillator.frequency.value = frequencies[type] || 440.00;
        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio not supported:', error);
    }
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
// LAZY LOADING DE IMÁGENES
// ========================================
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
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// TEMA OSCURO/CLARO
// ========================================
function initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(isDark ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado', 'info');
}

// ========================================
// PREFERENCIAS DE USUARIO
// ========================================
function loadUserPreferences() {
    const savedSound = localStorage.getItem('soundEnabled');
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    
    if (savedSound !== null) soundEnabled = savedSound === 'true';
    if (savedNotifications !== null) notificationsEnabled = savedNotifications === 'true';
}

function saveUserPreferences() {
    localStorage.setItem('soundEnabled', soundEnabled);
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    saveUserPreferences();
    showToast(soundEnabled ? '🔊 Sonido activado' : '🔇 Sonido desactivado', 'info');
}

function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled;
    saveUserPreferences();
    showToast(notificationsEnabled ? '🔔 Notificaciones activadas' : '🔕 Notificaciones desactivadas', 'info');
}

// ========================================
// BOTONES DE COMPARTIR
// ========================================
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('[data-share]');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            shareContent(btn.dataset.share, btn.dataset.shareTitle || 'English Learning Hub');
        });
    });
}

async function shareContent(content, title) {
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
            console.log('Error sharing:', err);
        }
    } else {
        // Copiar al portapapeles como fallback
        await navigator.clipboard.writeText(`${content} ${window.location.href}`);
        showToast('¡Enlace copiado al portapapeles!', 'success');
    }
}

// ========================================
// GRÁFICOS Y VISUALIZACIONES
// ========================================
function loadChart(elementId, data, labels, type = 'line', options = {}) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return null;
    
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: 'white',
                bodyColor: 'white'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: data.label || 'Datos',
                data: data.values,
                borderColor: data.color || '#667eea',
                backgroundColor: data.backgroundColor || 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: data.pointColor || '#667eea',
                pointBorderColor: 'white',
                pointRadius: data.pointRadius || 6,
                pointHoverRadius: data.pointHoverRadius || 8
            }]
        },
        options: mergedOptions
    });
}

// ========================================
// VALIDACIÓN DE FORMULARIOS
// ========================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    return /^[a-zA-Z0-9]{3,}$/.test(username);
}

function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    
    if (score <= 2) return 'weak';
    if (score === 3) return 'medium';
    if (score === 4) return 'strong';
    return 'very-strong';
}

// ========================================
// ANIMACIONES DE SCROLL
// ========================================
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
// UTILIDADES
// ========================================
function escapeHtml(text) {
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
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.EnglishLearningHub = {
    showToast,
    launchConfetti,
    createParticles,
    playSound,
    toggleTheme,
    toggleSound,
    toggleNotifications,
    shareContent,
    loadChart,
    validateEmail,
    validatePassword,
    validateUsername,
    checkPasswordStrength,
    formatDate,
    formatTime,
    saveToLocalStorage,
    loadFromLocalStorage,
    fetchAPI
};

// ========================================
// INICIALIZAR ANIMACIONES DE SCROLL
// ========================================
setupScrollAnimations();

