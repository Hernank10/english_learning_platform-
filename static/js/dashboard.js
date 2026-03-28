/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DEL DASHBOARD
   Funcionalidades específicas para la página de dashboard
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let dashboardCharts = {};
let currentPeriod = 'weekly';
let activityData = [];
let achievementsData = [];
let refreshInterval = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard - Inicializado');
    
    // Inicializar gráficos
    initializeCharts();
    
    // Inicializar estadísticas
    initializeStatistics();
    
    // Inicializar actividad reciente
    initializeRecentActivity();
    
    // Inicializar logros
    initializeAchievements();
    
    // Configurar actualización automática
    setupAutoRefresh();
    
    // Configurar filtros de período
    setupPeriodFilters();
    
    // Configurar notificaciones
    setupDashboardNotifications();
    
    // Inicializar tooltips
    initializeTooltips();
    
    // Configurar animaciones de tarjetas
    setupCardAnimations();
});

// ========================================
// GRÁFICOS DEL DASHBOARD
// ========================================
function initializeCharts() {
    // Gráfico de progreso semanal
    const weeklyCtx = document.getElementById('weeklyChart')?.getContext('2d');
    if (weeklyCtx) {
        dashboardCharts.weekly = new Chart(weeklyCtx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Puntos obtenidos',
                    data: getWeeklyData(),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: 'white',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBorderWidth: 2
                }]
            },
            options: getChartOptions('Progreso Semanal')
        });
    }
    
    // Gráfico de distribución de módulos
    const modulesCtx = document.getElementById('modulesChart')?.getContext('2d');
    if (modulesCtx) {
        dashboardCharts.modules = new Chart(modulesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Preguntas Básicas', 'Oraciones Simples', 'Oraciones Compuestas', 'Conectores'],
                datasets: [{
                    data: getModuleProgress(),
                    backgroundColor: ['#8ac926', '#ffd459', '#1982c4', '#ff595e'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}% (${percentage}% del total)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de precisión por módulo
    const accuracyCtx = document.getElementById('accuracyChart')?.getContext('2d');
    if (accuracyCtx) {
        dashboardCharts.accuracy = new Chart(accuracyCtx, {
            type: 'bar',
            data: {
                labels: ['Preguntas', 'Oraciones', 'Compuestas', 'Conectores'],
                datasets: [{
                    label: 'Precisión (%)',
                    data: getAccuracyData(),
                    backgroundColor: ['#8ac926', '#ffd459', '#1982c4', '#ff595e'],
                    borderRadius: 8,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw}% de precisión`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: '#667eea',
                borderWidth: 2
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };
}

function getWeeklyData() {
    // Datos simulados - en producción vendrían del backend
    return [45, 52, 48, 61, 73, 89, 94];
}

function getModuleProgress() {
    // Datos simulados - en producción vendrían del backend
    return [42, 35, 28, 22];
}

function getAccuracyData() {
    // Datos simulados - en producción vendrían del backend
    return [78, 82, 65, 71];
}

// ========================================
// ESTADÍSTICAS EN TIEMPO REAL
// ========================================
function initializeStatistics() {
    // Inicializar contadores animados
    const statsNumbers = document.querySelectorAll('.stats-number');
    statsNumbers.forEach(el => {
        const target = parseInt(el.textContent);
        if (target > 0) {
            el.textContent = '0';
            animateNumber(el, target, 1500);
        }
    });
    
    // Configurar actualización periódica de estadísticas
    setInterval(() => {
        updateRealtimeStats();
    }, 30000);
}

function animateNumber(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.floor(target);
            clearInterval(interval);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

async function updateRealtimeStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        // Actualizar estadísticas en tiempo real
        document.getElementById('total-score').textContent = data.total_score;
        document.getElementById('current-streak').textContent = data.current_streak;
        document.getElementById('completed-exercises').textContent = data.completed_exercises;
        
        // Actualizar círculo de progreso
        updateProgressCircle(data.level_progress);
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function updateProgressCircle(percentage) {
    const circle = document.getElementById('progress-circle');
    if (circle) {
        const degrees = (percentage / 100) * 360;
        circle.style.background = `conic-gradient(#ffd459 ${degrees}deg, #e9ecef ${degrees}deg)`;
        document.querySelector('.progress-text').textContent = `${Math.round(percentage)}%`;
    }
}

// ========================================
// ACTIVIDAD RECIENTE
// ========================================
function initializeRecentActivity() {
    loadRecentActivity();
    
    // Actualizar cada 60 segundos
    setInterval(() => {
        loadRecentActivity();
    }, 60000);
}

async function loadRecentActivity() {
    try {
        const response = await fetch('/api/dashboard/activity');
        const data = await response.json();
        activityData = data.activities;
        renderActivityTimeline(activityData);
    } catch (error) {
        console.error('Error loading activity:', error);
        // Datos de ejemplo
        activityData = getSampleActivity();
        renderActivityTimeline(activityData);
    }
}

function renderActivityTimeline(activities) {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;
    
    if (activities.length === 0) {
        timeline.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted mt-2">Aún no hay actividad. ¡Comienza a practicar!</p>
            </div>
        `;
        return;
    }
    
    timeline.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <i class="bi bi-${activity.icon} me-2 text-primary"></i>
                    <strong>${escapeHtml(activity.title)}</strong>
                    <p class="text-muted small mb-0">${escapeHtml(activity.description)}</p>
                </div>
                <small class="text-muted">${formatTimeAgo(activity.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
    return `hace ${Math.floor(seconds / 86400)} d`;
}

function getSampleActivity() {
    return [
        { icon: 'check-circle', title: 'Ejercicio completado', description: 'Preguntas con "to be" - 10 puntos', timestamp: new Date().toISOString() },
        { icon: 'star', title: 'Logro desbloqueado', description: 'Primeros Pasos - 5 estrellas', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { icon: 'trophy', title: 'Racha de 7 días', description: '¡Sigue así!', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ];
}

// ========================================
// LOGROS Y MEDALLAS
// ========================================
function initializeAchievements() {
    loadAchievements();
}

async function loadAchievements() {
    try {
        const response = await fetch('/api/dashboard/achievements');
        const data = await response.json();
        achievementsData = data.achievements;
        renderAchievements(achievementsData);
    } catch (error) {
        console.error('Error loading achievements:', error);
        achievementsData = getSampleAchievements();
        renderAchievements(achievementsData);
    }
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    if (achievements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-emoji-smile fs-1 text-muted"></i>
                <p class="text-muted mt-2">Completa ejercicios para desbloquear logros</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-badge mb-2 w-100" data-bs-toggle="tooltip" title="${achievement.description}">
            <i class="bi bi-${achievement.icon} me-2"></i>
            ${escapeHtml(achievement.name)}
            <small class="ms-auto text-muted">${achievement.date}</small>
        </div>
    `).join('');
    
    // Reinicializar tooltips
    initializeTooltips();
}

function getSampleAchievements() {
    return [
        { icon: 'trophy', name: 'Primeros Pasos', description: 'Completa 10 ejercicios', date: 'Hace 2 días' },
        { icon: 'star', name: 'Racha de 7 días', description: 'Practica 7 días consecutivos', date: 'Hace 5 días' },
        { icon: 'award', name: 'Maestro de Preguntas', description: '100 respuestas correctas', date: 'Hace 1 semana' }
    ];
}

// ========================================
// FILTROS DE PERÍODO
// ========================================
function setupPeriodFilters() {
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const period = btn.dataset.period;
            if (!period) return;
            
            // Actualizar botón activo
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar período
            changePeriod(period);
        });
    });
}

function changePeriod(period) {
    currentPeriod = period;
    
    // Actualizar datos del gráfico según período
    let data = [];
    let labels = [];
    
    switch(period) {
        case 'week':
            data = [45, 52, 48, 61, 73, 89, 94];
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            break;
        case 'month':
            data = [120, 135, 142, 158, 167, 189, 194, 201, 215, 223, 234, 245];
            labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 9', 'Sem 10', 'Sem 11', 'Sem 12'];
            break;
        case 'year':
            data = [450, 520, 580, 610, 730, 890, 940, 1020, 1150, 1230, 1340, 1450];
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            break;
    }
    
    if (dashboardCharts.weekly) {
        dashboardCharts.weekly.data.datasets[0].data = data;
        dashboardCharts.weekly.data.labels = labels;
        dashboardCharts.weekly.update();
    }
}

// ========================================
// ACTUALIZACIÓN AUTOMÁTICA
// ========================================
function setupAutoRefresh() {
    // Actualizar cada 5 minutos
    refreshInterval = setInterval(() => {
        refreshDashboard();
    }, 300000);
    
    // Limpiar al salir
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
}

async function refreshDashboard() {
    console.log('🔄 Actualizando dashboard...');
    
    try {
        await updateRealtimeStats();
        await loadRecentActivity();
        await loadAchievements();
        
        // Mostrar notificación silenciosa
        showSilentNotification('Dashboard actualizado');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

function showSilentNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'dashboard-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 1000;
        animation: fadeOut 3s forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ========================================
// NOTIFICACIONES DEL DASHBOARD
// ========================================
function setupDashboardNotifications() {
    // Verificar si hay notificaciones pendientes
    checkPendingNotifications();
    
    // Configurar intervalo de verificación
    setInterval(() => {
        checkPendingNotifications();
    }, 60000);
}

async function checkPendingNotifications() {
    try {
        const response = await fetch('/api/dashboard/notifications');
        const data = await response.json();
        
        if (data.notifications && data.notifications.length > 0) {
            showNotificationBadge(data.notifications.length);
            data.notifications.forEach(notif => {
                if (window.englishHub && window.englishHub.showToast) {
                    window.englishHub.showToast(notif.message, notif.type);
                }
            });
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

function showNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// ========================================
// ANIMACIONES DE TARJETAS
// ========================================
function setupCardAnimations() {
    const cards = document.querySelectorAll('.dashboard-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => observer.observe(card));
}

// ========================================
// TOOLTIPS
// ========================================
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover',
            placement: 'top'
        });
    });
}

// ========================================
// UTILIDADES
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ========================================
// EXPORTAR FUNCIONES
// ========================================
window.dashboard = {
    updateRealtimeStats,
    refreshDashboard,
    changePeriod,
    initializeCharts
};

// ========================================
// ESTILOS ADICIONALES
// ========================================
const dashboardStyles = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(0); }
        70% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(20px); }
    }
    
    .dashboard-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .dashboard-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    
    .activity-timeline {
        position: relative;
        padding-left: 1.5rem;
    }
    
    .activity-timeline::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, #667eea, #764ba2);
    }
    
    .activity-item {
        position: relative;
        padding-bottom: 1rem;
    }
    
    .activity-item::before {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 0.5rem;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #667eea;
        border: 2px solid white;
    }
    
    .achievement-badge {
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .achievement-badge:hover {
        transform: translateX(5px);
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = dashboardStyles;
document.head.appendChild(styleSheet);
