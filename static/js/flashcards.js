/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DE FLASHCARDS
   Funcionalidades específicas para la página de flashcards
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let flashcardsState = {
    currentIndex: 0,
    mastered: new Set(),
    sessionCount: 0,
    currentMode: 'all',
    currentCategory: 'all',
    currentDifficulty: 'all',
    isFlipped: false,
    autoPlay: false,
    autoPlayInterval: null,
    studyStats: {
        totalStudied: 0,
        correctCount: 0,
        incorrectCount: 0,
        sessionStart: null,
        cardsPerMinute: 0
    },
    history: [],
    favorites: new Set(),
    lastReview: {}
};

let originalFlashcards = [];
let filteredFlashcards = [];
let currentFilteredIndex = 0;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🃏 Página de flashcards - Inicializada');
    
    // Inicializar datos
    originalFlashcards = [...flashcardsData];
    filteredFlashcards = [...flashcardsData];
    
    // Cargar progreso guardado
    loadProgress();
    
    // Inicializar estadísticas
    flashcardsState.studyStats.sessionStart = new Date();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar primera flashcard
    loadFlashcard(0);
    
    // Inicializar filtros
    initializeFilters();
    
    // Actualizar estadísticas
    updateStats();
    
    // Inicializar modo de estudio rápido
    setupQuickStudy();
    
    // Configurar animaciones
    initializeAnimations();
    
    // Guardar progreso al salir
    window.addEventListener('beforeunload', () => {
        saveProgress();
    });
});

// ========================================
// CARGA DE FLASHCARDS
// ========================================
function loadFlashcard(index) {
    if (filteredFlashcards.length === 0) {
        showEmptyState();
        return;
    }
    
    const card = filteredFlashcards[index];
    if (!card) return;
    
    // Actualizar contenido
    document.getElementById('cardCategory').textContent = card.category;
    document.getElementById('cardSpanish').textContent = card.spanish;
    document.getElementById('cardEnglish').textContent = card.english;
    document.getElementById('cardExample').textContent = card.example || 'Sin ejemplo';
    document.getElementById('cardDifficulty').textContent = card.difficulty;
    document.getElementById('cardDifficulty').className = `difficulty-badge difficulty-${card.difficulty}`;
    
    // Actualizar contador
    document.getElementById('currentCardIndex').textContent = index + 1;
    document.getElementById('totalCards').textContent = filteredFlashcards.length;
    
    // Resetear estado de volteo
    if (flashcardsState.isFlipped) {
        flipCard();
    }
    
    // Actualizar estado de favorito
    updateFavoriteIcon(card.id);
    
    // Registrar vista
    recordCardView(card.id);
    
    // Animación de entrada
    animateCardEntry();
}

function showEmptyState() {
    const container = document.querySelector('.flashcards-container');
    if (container) {
        container.innerHTML = `
            <div class="empty-state text-center p-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <h4 class="mt-3">No hay flashcards</h4>
                <p class="text-muted">No se encontraron flashcards con los filtros seleccionados</p>
                <button class="btn btn-primary mt-2" onclick="resetFilters()">
                    <i class="bi bi-arrow-repeat"></i> Limpiar filtros
                </button>
            </div>
        `;
    }
}

function animateCardEntry() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        flashcard.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            flashcard.classList.remove('animate__animated', 'animate__fadeIn');
        }, 500);
    }
}

// ========================================
// VOLTEO DE TARJETA
// ========================================
function flipCard() {
    const flashcard = document.getElementById('flashcard');
    if (!flashcard) return;
    
    flashcard.classList.toggle('flipped');
    flashcardsState.isFlipped = !flashcardsState.isFlipped;
    
    // Reproducir sonido de volteo
    playSound('flip');
}

// ========================================
// MARCAR CONOCIDA / NO CONOCIDA
// ========================================
function markAsKnown() {
    const card = filteredFlashcards[flashcardsState.currentIndex];
    if (!card) return;
    
    if (!flashcardsState.mastered.has(card.id)) {
        flashcardsState.mastered.add(card.id);
        flashcardsState.sessionCount++;
        flashcardsState.studyStats.correctCount++;
        
        // Registrar en historial
        flashcardsState.history.push({
            cardId: card.id,
            result: 'known',
            timestamp: new Date().toISOString()
        });
        
        // Actualizar última revisión
        flashcardsState.lastReview[card.id] = new Date().toISOString();
        
        // Efectos visuales
        createSuccessEffect();
        playSound('correct');
        
        showToast('¡Flashcard marcada como conocida!', 'success');
        
        // Auto-avanzar después de marcar
        setTimeout(() => {
            nextCard();
        }, 500);
    } else {
        showToast('Ya has marcado esta flashcard como conocida', 'info');
        nextCard();
    }
    
    updateStats();
    saveProgress();
}

function markAsUnknown() {
    const card = filteredFlashcards[flashcardsState.currentIndex];
    if (!card) return;
    
    flashcardsState.studyStats.incorrectCount++;
    
    // Registrar en historial
    flashcardsState.history.push({
        cardId: card.id,
        result: 'unknown',
        timestamp: new Date().toISOString()
    });
    
    // Efectos visuales
    createShakeEffect();
    playSound('incorrect');
    
    showToast('Flashcard marcada para repasar', 'warning');
    
    // Auto-avanzar
    setTimeout(() => {
        nextCard();
    }, 500);
    
    updateStats();
    saveProgress();
}

// ========================================
// NAVEGACIÓN
// ========================================
function nextCard() {
    if (flashcardsState.currentIndex < filteredFlashcards.length - 1) {
        flashcardsState.currentIndex++;
        loadFlashcard(flashcardsState.currentIndex);
        playSound('click');
    } else if (flashcardsState.currentMode === 'pending' && getPendingCards().length > 0) {
        // Reiniciar pendientes
        flashcardsState.currentIndex = 0;
        loadFlashcard(0);
        showToast('Has completado todas las flashcards, comenzando de nuevo', 'info');
    } else {
        showCompletionMessage();
    }
}

function previousCard() {
    if (flashcardsState.currentIndex > 0) {
        flashcardsState.currentIndex--;
        loadFlashcard(flashcardsState.currentIndex);
        playSound('click');
    } else {
        showToast('Esta es la primera flashcard', 'info');
    }
}

function shuffleCards() {
    // Mezclar flashcards
    for (let i = filteredFlashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredFlashcards[i], filteredFlashcards[j]] = [filteredFlashcards[j], filteredFlashcards[i]];
    }
    
    flashcardsState.currentIndex = 0;
    loadFlashcard(0);
    
    showToast('Flashcards mezcladas', 'success');
    playSound('shuffle');
}

// ========================================
// FILTROS
// ========================================
function initializeFilters() {
    // Filtro de categoría
    const categoryButtons = document.querySelectorAll('.category-filter');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = btn.dataset.category;
            filterByCategory(category);
            
            // Actualizar UI
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Filtro de dificultad
    const difficultySelect = document.getElementById('difficultyFilter');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            filterByDifficulty(e.target.value);
        });
    }
}

function filterByCategory(category) {
    flashcardsState.currentCategory = category;
    applyFilters();
}

function filterByDifficulty(difficulty) {
    flashcardsState.currentDifficulty = difficulty;
    applyFilters();
}

function setStudyMode(mode) {
    flashcardsState.currentMode = mode;
    
    // Actualizar botones
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    applyFilters();
}

function applyFilters() {
    let filtered = [...originalFlashcards];
    
    // Filtrar por categoría
    if (flashcardsState.currentCategory !== 'all') {
        filtered = filtered.filter(c => c.category === flashcardsState.currentCategory);
    }
    
    // Filtrar por dificultad
    if (flashcardsState.currentDifficulty !== 'all') {
        filtered = filtered.filter(c => c.difficulty === flashcardsState.currentDifficulty);
    }
    
    // Filtrar por modo de estudio
    if (flashcardsState.currentMode === 'pending') {
        filtered = filtered.filter(c => !flashcardsState.mastered.has(c.id));
    } else if (flashcardsState.currentMode === 'mastered') {
        filtered = filtered.filter(c => flashcardsState.mastered.has(c.id));
    }
    
    filteredFlashcards = filtered;
    flashcardsState.currentIndex = 0;
    
    if (filteredFlashcards.length === 0) {
        showEmptyState();
    } else {
        loadFlashcard(0);
    }
    
    updateStats();
}

function resetFilters() {
    flashcardsState.currentCategory = 'all';
    flashcardsState.currentDifficulty = 'all';
    flashcardsState.currentMode = 'all';
    
    // Resetear UI
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    const difficultySelect = document.getElementById('difficultyFilter');
    if (difficultySelect) {
        difficultySelect.value = 'all';
    }
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes('Todas')) {
            btn.classList.add('active');
        }
    });
    
    applyFilters();
    showToast('Filtros reiniciados', 'info');
}

// ========================================
// ESTADÍSTICAS
// ========================================
function updateStats() {
    const total = filteredFlashcards.length;
    const masteredCount = flashcardsState.mastered.size;
    const pendingCount = total - masteredCount;
    const accuracy = flashcardsState.studyStats.correctCount + flashcardsState.studyStats.incorrectCount > 0
        ? Math.round((flashcardsState.studyStats.correctCount / 
            (flashcardsState.studyStats.correctCount + flashcardsState.studyStats.incorrectCount)) * 100)
        : 0;
    
    // Calcular tarjetas por minuto
    const sessionDuration = (new Date() - flashcardsState.studyStats.sessionStart) / 1000 / 60;
    const cardsPerMinute = sessionDuration > 0 
        ? Math.round(flashcardsState.sessionCount / sessionDuration)
        : 0;
    
    document.getElementById('totalCardsStat').textContent = total;
    document.getElementById('masteredCardsStat').textContent = masteredCount;
    document.getElementById('pendingCardsStat').textContent = pendingCount;
    document.getElementById('studySessionStat').textContent = flashcardsState.sessionCount;
    document.getElementById('accuracyStat').textContent = `${accuracy}%`;
    document.getElementById('cardsPerMinute').textContent = cardsPerMinute;
    document.getElementById('masteredCount').textContent = `📊 Dominadas: ${masteredCount}/${total}`;
}

function recordCardView(cardId) {
    // Registrar visualización para algoritmo de repaso espaciado
    if (!flashcardsState.lastReview[cardId]) {
        flashcardsState.lastReview[cardId] = new Date().toISOString();
    }
}

// ========================================
// MODO DE ESTUDIO RÁPIDO
// ========================================
function setupQuickStudy() {
    const quickStudyBtn = document.getElementById('quickStudyBtn');
    if (quickStudyBtn) {
        quickStudyBtn.addEventListener('click', startQuickStudy);
    }
}

function startQuickStudy() {
    const quickCards = [...originalFlashcards]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
    
    filteredFlashcards = quickCards;
    flashcardsState.currentIndex = 0;
    flashcardsState.currentMode = 'quick';
    loadFlashcard(0);
    updateStats();
    
    // Iniciar temporizador
    startQuickStudyTimer();
    
    Swal.fire({
        title: 'Modo Estudio Rápido',
        html: `
            <div class="text-center">
                <i class="bi bi-stopwatch fs-1 text-primary"></i>
                <p class="mt-2">Estudiarás <strong>10 flashcards aleatorias</strong></p>
                <p class="small text-muted">Tienes 5 minutos para completar el estudio rápido</p>
                <div class="progress mt-3">
                    <div id="quickTimer" class="progress-bar progress-bar-animated" style="width: 100%"></div>
                </div>
            </div>
        `,
        icon: 'info',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function startQuickStudyTimer() {
    let timeLeft = 300; // 5 minutos
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0 || flashcardsState.currentMode !== 'quick') {
            clearInterval(timerInterval);
            if (timeLeft <= 0) {
                endQuickStudy();
            }
            return;
        }
        
        timeLeft--;
        const progress = (timeLeft / 300) * 100;
        const timerBar = document.getElementById('quickTimer');
        if (timerBar) {
            timerBar.style.width = `${progress}%`;
        }
    }, 1000);
}

function endQuickStudy() {
    const masteredInSession = flashcardsState.mastered.size;
    const accuracy = flashcardsState.studyStats.correctCount;
    
    Swal.fire({
        title: '¡Estudio Rápido Completado!',
        html: `
            <div class="text-center">
                <p>Has completado el modo estudio rápido</p>
                <div class="row mt-3">
                    <div class="col-6">
                        <div class="display-6 text-primary">${masteredInSession}</div>
                        <small>Flashcards dominadas</small>
                    </div>
                    <div class="col-6">
                        <div class="display-6 text-success">${accuracy}</div>
                        <small>Aciertos</small>
                    </div>
                </div>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Continuar'
    }).then(() => {
        resetFilters();
    });
}

// ========================================
// PROGRESO Y ALMACENAMIENTO
// ========================================
function loadProgress() {
    const saved = localStorage.getItem('flashcard_progress');
    if (saved) {
        const data = JSON.parse(saved);
        flashcardsState.mastered = new Set(data.mastered);
        flashcardsState.history = data.history || [];
        flashcardsState.lastReview = data.lastReview || {};
        flashcardsState.favorites = new Set(data.favorites || []);
    }
}

function saveProgress() {
    const data = {
        mastered: Array.from(flashcardsState.mastered),
        history: flashcardsState.history,
        lastReview: flashcardsState.lastReview,
        favorites: Array.from(flashcardsState.favorites)
    };
    localStorage.setItem('flashcard_progress', JSON.stringify(data));
}

function resetProgress() {
    Swal.fire({
        title: 'Reiniciar progreso',
        text: '¿Estás seguro? Se perderá todo el progreso de estas flashcards.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, reiniciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            flashcardsState.mastered.clear();
            flashcardsState.history = [];
            flashcardsState.sessionCount = 0;
            flashcardsState.studyStats.correctCount = 0;
            flashcardsState.studyStats.incorrectCount = 0;
            saveProgress();
            updateStats();
            loadFlashcard(flashcardsState.currentIndex);
            showToast('Progreso reiniciado', 'success');
            playSound('reset');
        }
    });
}

function clearAllProgress() {
    Swal.fire({
        title: 'Borrar todo el progreso',
        text: 'Esta acción no se puede deshacer. ¿Estás seguro?',
        icon: 'danger',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar todo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
    }).then((result) => {
        if (result.isConfirmed) {
            flashcardsState.mastered.clear();
            flashcardsState.history = [];
            flashcardsState.sessionCount = 0;
            flashcardsState.studyStats.correctCount = 0;
            flashcardsState.studyStats.incorrectCount = 0;
            flashcardsState.favorites.clear();
            flashcardsState.lastReview = {};
            saveProgress();
            updateStats();
            loadFlashcard(flashcardsState.currentIndex);
            showToast('Todo el progreso ha sido borrado', 'info');
            playSound('reset');
        }
    });
}

// ========================================
// FAVORITOS
// ========================================
function toggleFavorite() {
    const card = filteredFlashcards[flashcardsState.currentIndex];
    if (!card) return;
    
    if (flashcardsState.favorites.has(card.id)) {
        flashcardsState.favorites.delete(card.id);
        showToast('Eliminado de favoritos', 'info');
    } else {
        flashcardsState.favorites.add(card.id);
        showToast('Añadido a favoritos', 'success');
        playSound('favorite');
    }
    
    updateFavoriteIcon(card.id);
    saveProgress();
}

function updateFavoriteIcon(cardId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        if (flashcardsState.favorites.has(cardId)) {
            favoriteBtn.innerHTML = '<i class="bi bi-star-fill"></i>';
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.innerHTML = '<i class="bi bi-star"></i>';
            favoriteBtn.classList.remove('active');
        }
    }
}

// ========================================
// EFECTOS VISUALES
// ========================================
function createSuccessEffect() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        flashcard.classList.add('success-flash');
        setTimeout(() => {
            flashcard.classList.remove('success-flash');
        }, 500);
    }
    
    // Confeti
    if (window.englishHub && window.englishHub.launchConfetti) {
        window.englishHub.launchConfetti();
    }
}

function createShakeEffect() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        flashcard.classList.add('shake-animation');
        setTimeout(() => {
            flashcard.classList.remove('shake-animation');
        }, 500);
    }
}

function initializeAnimations() {
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successFlash {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
            100% { box-shadow: 0 0 0 20px rgba(40, 167, 69, 0); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .success-flash {
            animation: successFlash 0.5s ease-out;
        }
        
        .shake-animation {
            animation: shake 0.3s ease-in-out;
        }
        
        .flashcard {
            transition: transform 0.6s, box-shadow 0.3s;
        }
        
        .flashcard:hover {
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// SONIDOS
// ========================================
function playSound(type) {
    if (window.englishHub && window.englishHub.playSound) {
        window.englishHub.playSound(type);
    }
}

function showToast(message, type) {
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, type);
    } else {
        alert(message);
    }
}

function getPendingCards() {
    return filteredFlashcards.filter(c => !flashcardsState.mastered.has(c.id));
}

function showCompletionMessage() {
    Swal.fire({
        title: '🎉 ¡Felicidades!',
        text: 'Has completado todas las flashcards de esta selección',
        icon: 'success',
        confirmButtonText: 'Continuar'
    }).then(() => {
        if (flashcardsState.currentMode === 'pending') {
            resetFilters();
        }
    });
}

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.flashcards = {
    flipCard,
    markAsKnown,
    markAsUnknown,
    nextCard,
    previousCard,
    shuffleCards,
    resetProgress,
    clearAllProgress,
    setStudyMode,
    resetFilters,
    toggleFavorite,
    startQuickStudy
};
