/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DEL PERFIL
   Funcionalidades específicas para la página de perfil
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let profileState = {
    userData: null,
    stats: {
        totalExercises: 0,
        completedExercises: 0,
        totalScore: 0,
        accuracy: 0,
        streak: 0,
        maxStreak: 0,
        level: 1,
        levelProgress: 0,
        stars: 0,
        studyTime: 0
    },
    achievements: [],
    medals: [],
    weeklyData: [],
    chart: null,
    editMode: false,
    unsavedChanges: false,
    avatarColors: ['#667eea', '#764ba2', '#8ac926', '#ffd459', '#ff595e', '#1982c4']
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Página de perfil - Inicializada');
    
    // Cargar datos del usuario
    loadUserData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar gráfico
    initializeChart();
    
    // Configurar tooltips
    initializeTooltips();
    
    // Inicializar animaciones
    initializeAnimations();
    
    // Configurar edición de avatar
    setupAvatarEditor();
    
    // Configurar tema de perfil
    setupProfileTheme();
});

// ========================================
// CARGA DE DATOS
// ========================================
async function loadUserData() {
    try {
        showLoading();
        
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        profileState.userData = data.user;
        profileState.stats = data.stats;
        profileState.achievements = data.achievements;
        profileState.medals = data.medals;
        profileState.weeklyData = data.weekly_progress;
        
        renderProfile();
        updateStats();
        updateAchievements();
        updateMedals();
        updateChart();
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error al cargar los datos del perfil');
        hideLoading();
    }
}

// ========================================
// RENDERIZADO DEL PERFIL
// ========================================
function renderProfile() {
    if (!profileState.userData) return;
    
    // Información básica
    document.getElementById('profileUsername').textContent = profileState.userData.username;
    document.getElementById('profileEmail').textContent = profileState.userData.email;
    document.getElementById('profileMemberSince').textContent = formatDate(profileState.userData.created_at);
    document.getElementById('profileLevel').textContent = profileState.stats.level;
    document.getElementById('profileStars').textContent = profileState.stats.stars;
    
    // Avatar
    const avatarElement = document.getElementById('profileAvatar');
    if (avatarElement) {
        avatarElement.textContent = profileState.userData.username.charAt(0).toUpperCase();
        avatarElement.style.background = getUserAvatarColor(profileState.userData.id);
    }
    
    // Estadísticas
    document.getElementById('statExercises').textContent = profileState.stats.completedExercises;
    document.getElementById('statScore').textContent = formatNumber(profileState.stats.totalScore);
    document.getElementById('statAccuracy').textContent = `${profileState.stats.accuracy}%`;
    document.getElementById('statStreak').textContent = profileState.stats.streak;
    document.getElementById('statMaxStreak').textContent = profileState.stats.maxStreak;
    document.getElementById('statStudyTime').textContent = formatStudyTime(profileState.stats.studyTime);
    
    // Barra de progreso de nivel
    const levelProgress = (profileState.stats.levelProgress / 100) * 100;
    document.getElementById('levelProgress').style.width = `${levelProgress}%`;
    document.getElementById('levelProgressText').textContent = `${profileState.stats.levelProgress}%`;
    document.getElementById('pointsToNextLevel').textContent = `${100 - profileState.stats.levelProgress} puntos`;
}

function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    const stats = [
        { icon: 'bi-journal-bookmark-fill', label: 'Ejercicios', value: profileState.stats.completedExercises, color: 'primary' },
        { icon: 'bi-star-fill', label: 'Puntos', value: formatNumber(profileState.stats.totalScore), color: 'warning' },
        { icon: 'bi-fire', label: 'Racha', value: profileState.stats.streak, color: 'danger' },
        { icon: 'bi-graph-up', label: 'Precisión', value: `${profileState.stats.accuracy}%`, color: 'success' }
    ];
    
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card animate__animated animate__fadeInUp">
            <div class="stat-icon text-${stat.color}">
                <i class="bi ${stat.icon}"></i>
            </div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

function updateAchievements() {
    const container = document.getElementById('achievementsGrid');
    if (!container) return;
    
    if (profileState.achievements.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="bi bi-emoji-smile fs-1 text-muted"></i>
                <p class="text-muted mt-2">Completa ejercicios para desbloquear logros</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = profileState.achievements.map(achievement => `
        <div class="achievement-card animate__animated animate__fadeInUp" data-bs-toggle="tooltip" title="${achievement.description}">
            <div class="achievement-icon">
                <i class="bi bi-${achievement.icon || 'trophy-fill'}"></i>
            </div>
            <div class="achievement-info">
                <div class="achievement-name">${escapeHtml(achievement.name)}</div>
                <div class="achievement-date">${achievement.date}</div>
            </div>
            <div class="achievement-points">
                <span class="badge bg-primary">+${achievement.points || 0}</span>
            </div>
        </div>
    `).join('');
}

function updateMedals() {
    const container = document.getElementById('medalsContainer');
    if (!container) return;
    
    if (profileState.medals.length === 0) {
        container.innerHTML = '<p class="text-muted">Completa exámenes para obtener medallas</p>';
        return;
    }
    
    const medalIcons = {
        '🥇 Oro': '🥇',
        '🥈 Plata': '🥈',
        '🥉 Bronce': '🥉'
    };
    
    container.innerHTML = profileState.medals.map(medal => `
        <div class="medal medal-${getMedalClass(medal)} animate__animated animate__zoomIn">
            <span class="medal-icon">${medalIcons[medal] || '🏅'}</span>
            <span class="medal-name">${escapeHtml(medal)}</span>
        </div>
    `).join('');
}

// ========================================
// GRÁFICO DE PROGRESO
// ========================================
function initializeChart() {
    const ctx = document.getElementById('weeklyChart')?.getContext('2d');
    if (!ctx) return;
    
    profileState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Puntos obtenidos',
                data: [],
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} puntos`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: { display: true, text: 'Puntos' }
                },
                x: {
                    grid: { display: false },
                    title: { display: true, text: 'Día' }
                }
            }
        }
    });
}

function updateChart() {
    if (!profileState.chart) return;
    
    const days = profileState.weeklyData.map(d => d.day);
    const scores = profileState.weeklyData.map(d => d.score);
    
    profileState.chart.data.labels = days;
    profileState.chart.data.datasets[0].data = scores;
    profileState.chart.update();
}

// ========================================
// EDICIÓN DE PERFIL
// ========================================
function toggleEditForm() {
    profileState.editMode = !profileState.editMode;
    const form = document.getElementById('editForm');
    const editBtn = document.getElementById('editProfileBtn');
    
    if (form) {
        form.style.display = profileState.editMode ? 'block' : 'none';
        
        if (profileState.editMode) {
            // Cargar datos actuales en el formulario
            document.getElementById('editUsername').value = profileState.userData.username;
            document.getElementById('editEmail').value = profileState.userData.email;
            document.getElementById('editBio').value = profileState.userData.bio || '';
            
            editBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Cancelar';
            editBtn.classList.remove('btn-primary');
            editBtn.classList.add('btn-secondary');
        } else {
            editBtn.innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Perfil';
            editBtn.classList.remove('btn-secondary');
            editBtn.classList.add('btn-primary');
        }
    }
}

async function saveProfileChanges() {
    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const password = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;
    
    // Validaciones
    if (!username || !email) {
        showToast('Por favor completa todos los campos', 'warning');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Por favor ingresa un correo válido', 'warning');
        return;
    }
    
    if (password && password !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'warning');
        return;
    }
    
    if (password && password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                bio,
                password: password || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            profileState.userData.username = username;
            profileState.userData.email = email;
            profileState.userData.bio = bio;
            
            renderProfile();
            toggleEditForm();
            showToast('Perfil actualizado correctamente', 'success');
            playSound('success');
        } else {
            showToast(data.error || 'Error al actualizar perfil', 'danger');
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error al guardar los cambios', 'danger');
        hideLoading();
    }
}

// ========================================
// EDITOR DE AVATAR
// ========================================
function setupAvatarEditor() {
    const avatarBtn = document.getElementById('changeAvatarBtn');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', openAvatarModal);
    }
}

function openAvatarModal() {
    Swal.fire({
        title: 'Elige tu avatar',
        html: `
            <div class="avatar-options" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 1rem;">
                ${generateAvatarOptions()}
            </div>
            <div class="mt-3">
                <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                <button class="btn btn-outline-primary" onclick="document.getElementById('avatarUpload').click()">
                    <i class="bi bi-cloud-upload"></i> Subir imagen
                </button>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const uploadInput = document.getElementById('avatarUpload');
            if (uploadInput) {
                uploadInput.addEventListener('change', handleAvatarUpload);
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const selectedAvatar = document.querySelector('.avatar-option.selected');
            if (selectedAvatar) {
                const avatarData = selectedAvatar.dataset.avatar;
                updateAvatar(avatarData);
            }
        }
    });
}

function generateAvatarOptions() {
    const colors = profileState.avatarColors;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    return letters.map((letter, index) => `
        <div class="avatar-option" data-avatar="${letter}" onclick="selectAvatar(this)"
             style="width: 60px; height: 60px; border-radius: 50%; background: ${colors[index % colors.length]}; 
                    display: flex; align-items: center; justify-content: center; font-size: 24px; 
                    font-weight: bold; color: white; cursor: pointer; transition: all 0.3s ease;">
            ${letter}
        </div>
    `).join('');
}

function selectAvatar(element) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.style.transform = 'scale(1)';
        opt.style.boxShadow = 'none';
    });
    element.style.transform = 'scale(1.1)';
    element.style.boxShadow = '0 0 0 3px #667eea';
    element.classList.add('selected');
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            updateAvatar(avatarUrl, true);
        };
        reader.readAsDataURL(file);
    }
}

async function updateAvatar(avatarData, isImage = false) {
    try {
        const response = await fetch('/api/user/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: avatarData, isImage })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const avatarElement = document.getElementById('profileAvatar');
            if (isImage) {
                avatarElement.style.backgroundImage = `url(${avatarData})`;
                avatarElement.style.backgroundSize = 'cover';
                avatarElement.textContent = '';
            } else {
                avatarElement.textContent = avatarData;
                avatarElement.style.backgroundImage = 'none';
            }
            showToast('Avatar actualizado', 'success');
            playSound('success');
        }
        
    } catch (error) {
        console.error('Error updating avatar:', error);
        showToast('Error al actualizar avatar', 'danger');
    }
}

// ========================================
// TEMA DE PERFIL
// ========================================
function setupProfileTheme() {
    const themeSelect = document.getElementById('profileTheme');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            changeProfileTheme(e.target.value);
        });
    }
}

function changeProfileTheme(theme) {
    const profileCard = document.querySelector('.profile-card');
    const themes = {
        'default': {
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            text: '#2d3748'
        },
        'ocean': {
            gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            text: '#ffffff'
        },
        'forest': {
            gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
            text: '#ffffff'
        },
        'sunset': {
            gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
            text: '#ffffff'
        },
        'purple': {
            gradient: 'linear-gradient(135deg, #8e44ad 0%, #c0392b 100%)',
            text: '#ffffff'
        }
    };
    
    const selectedTheme = themes[theme] || themes.default;
    
    if (profileCard) {
        profileCard.style.background = selectedTheme.gradient;
        profileCard.style.color = selectedTheme.text;
    }
    
    localStorage.setItem('profile_theme', theme);
}

// ========================================
// ESTADÍSTICAS AVANZADAS
// ========================================
function loadAdvancedStats() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'advancedStatsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-graph-up me-2"></i>Estadísticas Avanzadas
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="stat-card">
                                <h6>Mejor racha</h6>
                                <div class="display-6">${profileState.stats.maxStreak}</div>
                                <small>días consecutivos</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="stat-card">
                                <h6>Tasa de acierto</h6>
                                <div class="display-6">${profileState.stats.accuracy}%</div>
                                <small>sobre ${profileState.stats.completedExercises} ejercicios</small>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <canvas id="moduleStatsChart" height="200"></canvas>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Inicializar gráfico de módulos
    setTimeout(() => {
        const ctx = document.getElementById('moduleStatsChart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Preguntas', 'Oraciones', 'Compuestas', 'Conectores'],
                    datasets: [{
                        label: 'Precisión por módulo',
                        data: [85, 78, 72, 68],
                        backgroundColor: ['#8ac926', '#ffd459', '#1982c4', '#ff595e'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }, 100);
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// ========================================
// UTILIDADES
// ========================================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatStudyTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
}

function getUserAvatarColor(userId) {
    const colors = profileState.avatarColors;
    const hash = userId ? userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return colors[hash % colors.length];
}

function getMedalClass(medal) {
    if (medal.includes('Oro')) return 'gold';
    if (medal.includes('Plata')) return 'silver';
    if (medal.includes('Bronce')) return 'bronze';
    return 'default';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

function showToast(message, type) {
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, type);
    } else {
        alert(message);
    }
}

function showError(message) {
    showToast(message, 'danger');
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
        .stat-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .achievement-card {
            transition: all 0.3s ease;
        }
        .achievement-card:hover {
            transform: translateX(5px);
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }
        .medal {
            transition: all 0.3s ease;
        }
        .medal:hover {
            transform: scale(1.05) rotate(5deg);
        }
        .avatar-option {
            transition: all 0.3s ease;
        }
        .avatar-option:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

function setupEventListeners() {
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfileChanges();
        });
    }
    
    const advancedStatsBtn = document.getElementById('advancedStatsBtn');
    if (advancedStatsBtn) {
        advancedStatsBtn.addEventListener('click', loadAdvancedStats);
    }
    
    const shareProfileBtn = document.getElementById('shareProfileBtn');
    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', shareProfile);
    }
}

async function shareProfile() {
    const shareData = {
        title: 'Mi perfil en English Learning Hub',
        text: `¡Mira mi progreso! Nivel ${profileState.stats.level}, ${profileState.stats.totalScore} puntos, ${profileState.stats.completedExercises} ejercicios completados.`,
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
        await navigator.clipboard.writeText(shareData.text);
        showToast('Enlace copiado al portapapeles', 'success');
    }
}

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.profile = {
    toggleEditForm,
    saveProfileChanges,
    loadAdvancedStats,
    shareProfile,
    changeProfileTheme,
    selectAvatar
};
