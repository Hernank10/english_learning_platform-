/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DEL RANKING
   Funcionalidades específicas para la página de leaderboard
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let leaderboardState = {
    currentPeriod: 'all',
    currentCategory: 'all',
    sortBy: 'points',
    sortOrder: 'desc',
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    users: [],
    filteredUsers: [],
    currentUser: null,
    chart: null,
    refreshInterval: null
};

let leaderboardConfig = {
    autoRefreshInterval: 60000, // 1 minuto
    cacheDuration: 300000, // 5 minutos
    lastUpdate: null
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 Página de ranking - Inicializada');
    
    // Cargar datos iniciales
    loadLeaderboardData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar gráfico
    initializeChart();
    
    // Configurar auto-actualización
    setupAutoRefresh();
    
    // Configurar tooltips
    initializeTooltips();
    
    // Animaciones de entrada
    initializeAnimations();
});

// ========================================
// CARGA DE DATOS
// ========================================
async function loadLeaderboardData() {
    try {
        showLoading();
        
        const response = await fetch(`/api/leaderboard?period=${leaderboardState.currentPeriod}&category=${leaderboardState.currentCategory}`);
        const data = await response.json();
        
        leaderboardState.users = data.users;
        leaderboardState.currentUser = data.current_user;
        leaderboardState.lastUpdate = new Date();
        
        applyFilters();
        renderLeaderboard();
        updateStats();
        
        hideLoading();
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('Error al cargar el ranking. Por favor, intenta de nuevo.');
        hideLoading();
    }
}

function applyFilters() {
    let filtered = [...leaderboardState.users];
    
    // Aplicar ordenamiento
    filtered.sort((a, b) => {
        let aVal = a[leaderboardState.sortBy];
        let bVal = b[leaderboardState.sortBy];
        
        if (leaderboardState.sortOrder === 'desc') {
            return bVal - aVal;
        } else {
            return aVal - bVal;
        }
    });
    
    // Recalcular posiciones después del ordenamiento
    filtered.forEach((user, index) => {
        user.rank = index + 1;
    });
    
    leaderboardState.filteredUsers = filtered;
    leaderboardState.totalPages = Math.ceil(filtered.length / leaderboardState.pageSize);
    
    // Asegurar que la página actual sea válida
    if (leaderboardState.currentPage > leaderboardState.totalPages) {
        leaderboardState.currentPage = Math.max(1, leaderboardState.totalPages);
    }
}

// ========================================
// RENDERIZADO DEL RANKING
// ========================================
function renderLeaderboard() {
    const startIdx = (leaderboardState.currentPage - 1) * leaderboardState.pageSize;
    const endIdx = startIdx + leaderboardState.pageSize;
    const pageUsers = leaderboardState.filteredUsers.slice(startIdx, endIdx);
    
    // Renderizar top 3 en podio
    renderTopThree(leaderboardState.filteredUsers.slice(0, 3));
    
    // Renderizar tabla
    renderTable(pageUsers);
    
    // Renderizar paginación
    renderPagination();
    
    // Actualizar estadísticas del usuario actual
    updateCurrentUserStats();
}

function renderTopThree(topUsers) {
    const container = document.getElementById('topThree');
    if (!container) return;
    
    if (topUsers.length < 3) {
        container.innerHTML = '<div class="text-center py-4">No hay suficientes usuarios para mostrar el podio</div>';
        return;
    }
    
    // Orden para podio: 2do, 1ro, 3ro (para que el 1ro esté en el centro)
    const podiumOrder = [topUsers[1], topUsers[0], topUsers[2]];
    const podiumClasses = ['podium-2', 'podium-1', 'podium-3'];
    const podiumIcons = ['🥈', '🥇', '🥉'];
    const podiumColors = ['#c0c0c0', '#ffd700', '#cd7f32'];
    
    container.innerHTML = podiumOrder.map((user, idx) => `
        <div class="podium-card ${podiumClasses[idx]} animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.2}s">
            <div class="podium-avatar" style="background: linear-gradient(135deg, ${podiumColors[idx]}, ${podiumColors[idx]}dd);">
                ${user.username.charAt(0).toUpperCase()}
            </div>
            <div class="podium-name">${escapeHtml(user.username)}</div>
            <div class="podium-score">${formatNumber(user.total_score)} pts</div>
            <div class="medal-icon mt-2">${podiumIcons[idx]}</div>
            ${user.level ? `<div class="badge bg-primary mt-2">Nivel ${user.level}</div>` : ''}
        </div>
    `).join('');
}

function renderTable(users) {
    const tbody = document.getElementById('rankingBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-2">No hay datos para mostrar en este período</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map((user, index) => {
        const rank = user.rank;
        let rankClass = '';
        let rankIcon = '';
        let medalClass = '';
        
        if (rank === 1) {
            rankClass = 'rank-1';
            rankIcon = '🥇';
            medalClass = 'gold';
        } else if (rank === 2) {
            rankClass = 'rank-2';
            rankIcon = '🥈';
            medalClass = 'silver';
        } else if (rank === 3) {
            rankClass = 'rank-3';
            rankIcon = '🥉';
            medalClass = 'bronze';
        }
        
        return `
            <tr class="ranking-row animate__animated animate__fadeIn" style="animation-delay: ${index * 0.05}s">
                <td>
                    <div class="rank-position ${rankClass} d-flex align-items-center gap-2">
                        <span class="medal-${medalClass}">${rankIcon}</span>
                        <span class="fw-bold">#${rank}</span>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <div class="user-avatar" style="background: ${getUserColor(user.id)}">
                            ${user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="fw-bold">${escapeHtml(user.username)}</div>
                            <small class="text-muted">${escapeHtml(user.email || '')}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-primary">Nivel ${user.level || 1}</span>
                </td>
                <td>
                    <span class="fw-bold text-warning">${formatNumber(user.total_score)}</span> pts
                </td>
                <td>
                    <div class="d-flex gap-1">
                        ${renderStars(user.stars || 0)}
                        ${renderMedals(user.medals || [])}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStars(stars) {
    const fullStars = Math.min(stars, 5);
    const hasExtra = stars > 5;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
    }
    
    if (hasExtra) {
        starsHtml += `<span class="ms-1 badge bg-warning">+${stars - 5}</span>`;
    }
    
    return starsHtml || '<span class="text-muted">-</span>';
}

function renderMedals(medals) {
    if (!medals || medals.length === 0) return '<span class="text-muted">-</span>';
    
    const medalIcons = {
        '🥇 Oro': '🥇',
        '🥈 Plata': '🥈',
        '🥉 Bronce': '🥉'
    };
    
    const medalColors = {
        '🥇 Oro': 'gold',
        '🥈 Plata': 'silver',
        '🥉 Bronce': 'bronze'
    };
    
    return medals.slice(0, 3).map(medal => `
        <span class="medal-badge medal-${medalColors[medal]}" data-bs-toggle="tooltip" title="${medal}">
            ${medalIcons[medal] || '🏅'}
        </span>
    `).join('');
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (leaderboardState.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<ul class="pagination justify-content-center">';
    
    // Botón anterior
    html += `
        <li class="page-item ${leaderboardState.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${leaderboardState.currentPage - 1})">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Números de página
    const maxVisible = 5;
    let startPage = Math.max(1, leaderboardState.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(leaderboardState.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${leaderboardState.currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    if (endPage < leaderboardState.totalPages) {
        if (endPage < leaderboardState.totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${leaderboardState.totalPages})">${leaderboardState.totalPages}</a></li>`;
    }
    
    // Botón siguiente
    html += `
        <li class="page-item ${leaderboardState.currentPage === leaderboardState.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${leaderboardState.currentPage + 1})">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    html += '</ul>';
    pagination.innerHTML = html;
}

// ========================================
// GRÁFICO DE TENDENCIAS
// ========================================
function initializeChart() {
    const ctx = document.getElementById('trendsChart')?.getContext('2d');
    if (!ctx) return;
    
    leaderboardState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 11 } }
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
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

async function loadTrends(userId) {
    try {
        const response = await fetch(`/api/leaderboard/trends?user=${userId}`);
        const data = await response.json();
        
        updateChart(data);
    } catch (error) {
        console.error('Error loading trends:', error);
    }
}

function updateChart(trendsData) {
    if (!leaderboardState.chart) return;
    
    const colors = ['#667eea', '#764ba2', '#8ac926', '#ffd459', '#ff595e'];
    
    const datasets = trendsData.map((user, index) => ({
        label: user.username,
        data: user.scores,
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}20`,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: 'white',
        pointRadius: 4,
        pointHoverRadius: 6
    }));
    
    leaderboardState.chart.data.datasets = datasets;
    leaderboardState.chart.update();
}

// ========================================
// ESTADÍSTICAS
// ========================================
function updateStats() {
    const totalUsers = leaderboardState.users.length;
    const totalPoints = leaderboardState.users.reduce((sum, u) => sum + u.total_score, 0);
    const avgPoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    const topUser = leaderboardState.filteredUsers[0];
    
    document.getElementById('total-users').textContent = formatNumber(totalUsers);
    document.getElementById('total-points').textContent = formatNumber(totalPoints);
    document.getElementById('avg-points').textContent = formatNumber(avgPoints);
    
    if (topUser) {
        document.getElementById('top-user').innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <div class="user-avatar-sm">${topUser.username.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="fw-bold">${escapeHtml(topUser.username)}</div>
                    <small>${formatNumber(topUser.total_score)} pts</small>
                </div>
            </div>
        `;
    }
}

function updateCurrentUserStats() {
    const userRank = leaderboardState.filteredUsers.findIndex(u => u.id === leaderboardState.currentUser?.id) + 1;
    const userData = leaderboardState.currentUser;
    
    if (userData) {
        document.getElementById('userRank').textContent = userRank > 0 ? `#${userRank}` : '#--';
        document.getElementById('userScore').textContent = formatNumber(userData.total_score);
        document.getElementById('userLevel').textContent = userData.level || 1;
    }
}

function updateLastUpdateTime() {
    const timeElement = document.getElementById('lastUpdate');
    if (timeElement && leaderboardState.lastUpdate) {
        timeElement.textContent = `Última actualización: ${formatTime(leaderboardState.lastUpdate)}`;
    }
}

// ========================================
// FILTROS Y ORDENAMIENTO
// ========================================
function changePeriod(period) {
    leaderboardState.currentPeriod = period;
    leaderboardState.currentPage = 1;
    
    // Actualizar UI de botones
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        }
    });
    
    loadLeaderboardData();
    playSound('click');
}

function changeSort(sortBy) {
    if (leaderboardState.sortBy === sortBy) {
        leaderboardState.sortOrder = leaderboardState.sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
        leaderboardState.sortBy = sortBy;
        leaderboardState.sortOrder = 'desc';
    }
    
    applyFilters();
    renderLeaderboard();
    
    // Actualizar iconos de ordenamiento
    updateSortIcons();
}

function updateSortIcons() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        const field = btn.dataset.sort;
        const icon = btn.querySelector('i');
        
        if (field === leaderboardState.sortBy) {
            icon.className = leaderboardState.sortOrder === 'desc' ? 'bi bi-arrow-down' : 'bi bi-arrow-up';
            btn.classList.add('active');
        } else {
            icon.className = 'bi bi-arrow-down-up';
            btn.classList.remove('active');
        }
    });
}

function changePage(page) {
    if (page >= 1 && page <= leaderboardState.totalPages) {
        leaderboardState.currentPage = page;
        renderLeaderboard();
        scrollToTop();
        playSound('click');
    }
}

// ========================================
// BÚSQUEDA
// ========================================
function searchUsers() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim();
    
    if (!searchTerm) {
        applyFilters();
        return;
    }
    
    const filtered = leaderboardState.users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(searchTerm))
    );
    
    leaderboardState.filteredUsers = filtered;
    leaderboardState.totalPages = Math.ceil(filtered.length / leaderboardState.pageSize);
    leaderboardState.currentPage = 1;
    
    renderLeaderboard();
}

// ========================================
// EXPORTACIÓN DE DATOS
// ========================================
function exportLeaderboard() {
    const dataToExport = leaderboardState.filteredUsers.map(user => ({
        ranking: user.rank,
        usuario: user.username,
        email: user.email,
        nivel: user.level,
        puntos: user.total_score,
        estrellas: user.stars,
        medallas: user.medals?.join(', ') || ''
    }));
    
    const csv = convertToCSV(dataToExport);
    downloadFile(csv, 'ranking_english_hub.csv', 'text/csv');
    
    showToast('Ranking exportado correctamente', 'success');
    playSound('export');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// AUTO-ACTUALIZACIÓN
// ========================================
function setupAutoRefresh() {
    leaderboardState.refreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadLeaderboardData();
        }
    }, leaderboardConfig.autoRefreshInterval);
    
    // Limpiar al salir
    window.addEventListener('beforeunload', () => {
        if (leaderboardState.refreshInterval) {
            clearInterval(leaderboardState.refreshInterval);
        }
    });
}

function manualRefresh() {
    loadLeaderboardData();
    showToast('Ranking actualizado', 'success');
    playSound('refresh');
}

// ========================================
// UTILIDADES
// ========================================
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatTime(date) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getUserColor(userId) {
    const colors = ['#667eea', '#764ba2', '#8ac926', '#ffd459', '#ff595e', '#1982c4', '#6a4c93'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showError(message) {
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, 'danger');
    } else {
        alert(message);
    }
}

function showToast(message, type) {
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, type);
    }
}

function playSound(type) {
    if (window.englishHub && window.englishHub.playSound) {
        window.englishHub.playSound(type);
    }
}

function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover',
            placement: 'top'
        });
    });
}

function initializeAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .ranking-row {
            transition: all 0.3s ease;
        }
        .ranking-row:hover {
            transform: translateX(5px);
            background: rgba(102, 126, 234, 0.05);
        }
        .podium-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .podium-card:hover {
            transform: translateY(-10px);
        }
        .medal-gold { background: linear-gradient(135deg, #ffd700, #ffb347); color: white; }
        .medal-silver { background: linear-gradient(135deg, #c0c0c0, #a0a0a0); color: white; }
        .medal-bronze { background: linear-gradient(135deg, #cd7f32, #b87333); color: white; }
        .rank-1 { color: #ffd700; }
        .rank-2 { color: #c0c0c0; }
        .rank-3 { color: #cd7f32; }
    `;
    document.head.appendChild(style);
}

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.leaderboard = {
    changePeriod,
    changeSort,
    changePage,
    searchUsers,
    exportLeaderboard,
    manualRefresh,
    loadTrends
};
