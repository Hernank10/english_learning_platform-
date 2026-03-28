/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DE PRÁCTICA
   Funcionalidades específicas para la página de práctica
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let practiceState = {
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    completed: [],
    hintsUsed: 0,
    totalExercises: 0,
    startTime: null,
    answers: {},
    attempts: {},
    autoSaveInterval: null,
    sessionId: null
};

let practiceConfig = {
    pointsPerExercise: 10,
    streakBonus: 2,
    autoSaveDelay: 15000, // 15 segundos
    hintPenalty: 2,
    maxAttempts: 3
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Página de práctica - Inicializada');
    
    // Inicializar variables
    practiceState.totalExercises = exercisesData ? exercisesData.length : 0;
    practiceState.startTime = new Date();
    practiceState.completed = new Array(practiceState.totalExercises).fill(false);
    practiceState.attempts = new Array(practiceState.totalExercises).fill(0);
    
    // Cargar progreso guardado
    loadSavedProgress();
    
    // Cargar ejercicio actual
    loadExercise(practiceState.currentIndex);
    
    // Configurar auto-guardado
    setupAutoSave();
    
    // Configurar eventos de teclado
    setupKeyboardEvents();
    
    // Configurar botones de navegación
    setupNavigationButtons();
    
    // Inicializar estadísticas
    updateStats();
    
    // Configurar confirmación de salida
    setupExitConfirmation();
    
    // Inicializar animaciones
    initializeAnimations();
});

// ========================================
// CARGA DE EJERCICIOS
// ========================================
function loadExercise(index) {
    if (index >= practiceState.totalExercises) {
        completeModule();
        return;
    }
    
    const exercise = exercisesData[index];
    if (!exercise) return;
    
    // Actualizar UI
    document.getElementById('exerciseType').textContent = exercise.type;
    document.getElementById('difficultyBadge').textContent = exercise.difficulty;
    document.getElementById('difficultyBadge').className = `difficulty-badge difficulty-${exercise.difficulty}`;
    document.getElementById('exerciseInstruction').textContent = exercise.instruction;
    document.getElementById('spanishSentence').textContent = exercise.spanish;
    document.getElementById('exerciseCounter').textContent = `Ejercicio ${index + 1} / ${practiceState.totalExercises}`;
    
    // Restaurar respuesta si existe
    const answerInput = document.getElementById('answerInput');
    if (practiceState.answers[index]) {
        answerInput.value = practiceState.answers[index];
    } else {
        answerInput.value = '';
    }
    
    // Habilitar/deshabilitar según estado
    const isCompleted = practiceState.completed[index];
    answerInput.disabled = isCompleted;
    document.getElementById('submitBtn').disabled = isCompleted;
    document.getElementById('hintBtn').disabled = isCompleted;
    
    if (isCompleted) {
        showFeedback('Ejercicio completado', 'Ya has respondido correctamente este ejercicio', 'info');
    } else {
        hideFeedback();
    }
    
    // Actualizar navegación
    updateNavigationButtons();
    
    // Animación de entrada
    animateExerciseCard();
}

function animateExerciseCard() {
    const card = document.querySelector('.exercise-card');
    if (card) {
        card.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            card.classList.remove('animate__animated', 'animate__fadeIn');
        }, 500);
    }
}

// ========================================
// VERIFICACIÓN DE RESPUESTAS
// ========================================
async function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const userAnswer = answerInput.value.trim();
    
    if (!userAnswer) {
        showFeedback('Respuesta vacía', 'Por favor escribe una respuesta', 'warning');
        playSound('warning');
        return;
    }
    
    const exercise = exercisesData[practiceState.currentIndex];
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(exercise.correct_answer);
    
    // Incrementar intentos
    practiceState.attempts[practiceState.currentIndex]++;
    
    if (isCorrect && !practiceState.completed[practiceState.currentIndex]) {
        // Respuesta correcta
        await handleCorrectAnswer(exercise);
    } else if (isCorrect && practiceState.completed[practiceState.currentIndex]) {
        showFeedback('Ya completado', 'Ya has respondido correctamente este ejercicio', 'info');
        playSound('info');
    } else {
        // Respuesta incorrecta
        await handleIncorrectAnswer(exercise);
    }
    
    // Guardar progreso
    saveProgress();
    updateStats();
}

function normalizeAnswer(answer) {
    return answer.trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/[¿?¡!]/g, '');
}

async function handleCorrectAnswer(exercise) {
    // Calcular puntos con bonificación por racha
    const pointsEarned = exercise.points + (practiceState.streak * practiceConfig.streakBonus);
    practiceState.score += pointsEarned;
    practiceState.streak++;
    practiceState.completed[practiceState.currentIndex] = true;
    
    // Guardar respuesta
    practiceState.answers[practiceState.currentIndex] = document.getElementById('answerInput').value;
    
    // Actualizar racha máxima
    if (practiceState.streak > practiceState.maxStreak) {
        practiceState.maxStreak = practiceState.streak;
    }
    
    // Mostrar feedback
    showFeedback(
        '✅ ¡Correcto!', 
        `+${pointsEarned} puntos (${exercise.points} base + ${practiceState.streak - 1 * practiceConfig.streakBonus} por racha)`,
        'success'
    );
    
    // Efectos visuales
    createSuccessEffects();
    playSound('correct');
    
    // Deshabilitar inputs
    const answerInput = document.getElementById('answerInput');
    answerInput.disabled = true;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('hintBtn').disabled = true;
    
    // Auto-avanzar
    setTimeout(() => {
        if (practiceState.currentIndex + 1 < practiceState.totalExercises) {
            nextExercise();
        } else {
            completeModule();
        }
    }, 1500);
    
    // Guardar en servidor
    await saveProgressToServer();
}

async function handleIncorrectAnswer(exercise) {
    practiceState.streak = 0;
    
    // Mostrar feedback
    showFeedback(
        '❌ Incorrecto', 
        `La respuesta correcta es: "${exercise.correct_answer}"`,
        'danger'
    );
    
    playSound('incorrect');
    
    // Mostrar pista después de 2 intentos
    if (practiceState.attempts[practiceState.currentIndex] >= 2) {
        showHint();
    }
}

// ========================================
// PISTAS
// ========================================
function showHint() {
    const exercise = exercisesData[practiceState.currentIndex];
    practiceState.hintsUsed++;
    
    showFeedback('💡 Pista', exercise.hint, 'info');
    playSound('hint');
    
    // Reducir puntos por usar pista (opcional)
    // practiceState.score = Math.max(0, practiceState.score - practiceConfig.hintPenalty);
}

// ========================================
// NAVEGACIÓN
// ========================================
function setupNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousExercise);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextExercise);
    }
    if (skipBtn) {
        skipBtn.addEventListener('click', skipExercise);
    }
}

function previousExercise() {
    if (practiceState.currentIndex > 0) {
        // Guardar respuesta actual
        saveCurrentAnswer();
        
        practiceState.currentIndex--;
        loadExercise(practiceState.currentIndex);
        playSound('click');
    }
}

function nextExercise() {
    if (practiceState.currentIndex < practiceState.totalExercises - 1) {
        // Guardar respuesta actual
        saveCurrentAnswer();
        
        practiceState.currentIndex++;
        loadExercise(practiceState.currentIndex);
        playSound('click');
    } else if (practiceState.currentIndex === practiceState.totalExercises - 1) {
        completeModule();
    }
}

function skipExercise() {
    if (!practiceState.completed[practiceState.currentIndex]) {
        Swal.fire({
            title: '¿Saltar ejercicio?',
            text: 'No perderás progreso, pero no ganarás puntos por este ejercicio.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, saltar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                practiceState.completed[practiceState.currentIndex] = true;
                saveCurrentAnswer();
                nextExercise();
                playSound('skip');
            }
        });
    } else {
        nextExercise();
    }
}

function saveCurrentAnswer() {
    const answerInput = document.getElementById('answerInput');
    if (answerInput && !practiceState.completed[practiceState.currentIndex]) {
        practiceState.answers[practiceState.currentIndex] = answerInput.value;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = practiceState.currentIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

// ========================================
// ESTADÍSTICAS
// ========================================
function updateStats() {
    const completedCount = practiceState.completed.filter(c => c === true).length;
    const progressPercent = (completedCount / practiceState.totalExercises) * 100;
    
    document.getElementById('scoreDisplay').textContent = practiceState.score;
    document.getElementById('streakDisplay').textContent = practiceState.streak;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('totalScore').textContent = practiceState.score;
    document.getElementById('currentStreak').textContent = practiceState.streak;
    document.getElementById('maxStreak').textContent = practiceState.maxStreak;
    document.getElementById('progressPercent').textContent = `${Math.round(progressPercent)}%`;
    document.getElementById('moduleProgress').style.width = `${progressPercent}%`;
}

// ========================================
// AUTO-GUARDADO
// ========================================
function setupAutoSave() {
    practiceState.autoSaveInterval = setInterval(() => {
        saveProgress();
        showAutoSaveNotification();
    }, practiceConfig.autoSaveDelay);
}

function saveProgress() {
    // Guardar respuesta actual
    saveCurrentAnswer();
    
    const progressData = {
        currentIndex: practiceState.currentIndex,
        score: practiceState.score,
        streak: practiceState.streak,
        maxStreak: practiceState.maxStreak,
        completed: practiceState.completed,
        hintsUsed: practiceState.hintsUsed,
        answers: practiceState.answers,
        attempts: practiceState.attempts,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`practice_${moduleName}_progress`, JSON.stringify(progressData));
}

function loadSavedProgress() {
    const saved = localStorage.getItem(`practice_${moduleName}_progress`);
    if (saved) {
        const data = JSON.parse(saved);
        
        // Verificar si el progreso es reciente (menos de 24 horas)
        const savedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            Swal.fire({
                title: 'Progreso guardado encontrado',
                text: `¿Quieres continuar desde donde lo dejaste? (Ejercicio ${data.currentIndex + 1}/${practiceState.totalExercises})`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Comenzar de nuevo'
            }).then((result) => {
                if (result.isConfirmed) {
                    practiceState.currentIndex = data.currentIndex;
                    practiceState.score = data.score;
                    practiceState.streak = data.streak;
                    practiceState.maxStreak = data.maxStreak;
                    practiceState.completed = data.completed;
                    practiceState.hintsUsed = data.hintsUsed;
                    practiceState.answers = data.answers || {};
                    practiceState.attempts = data.attempts || new Array(practiceState.totalExercises).fill(0);
                    
                    loadExercise(practiceState.currentIndex);
                    updateStats();
                    
                    showToast('Progreso cargado correctamente', 'success');
                } else {
                    clearSavedProgress();
                }
            });
        } else {
            clearSavedProgress();
        }
    }
}

function clearSavedProgress() {
    localStorage.removeItem(`practice_${moduleName}_progress`);
}

function showAutoSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'auto-save-notification';
    notification.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>
        <span>Progreso guardado automáticamente</span>
    `;
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
        animation: fadeOut 2s forwards;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

async function saveProgressToServer() {
    try {
        const response = await fetch('/api/save_progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                module: moduleName,
                score: practiceState.score,
                completed: practiceState.completed,
                streak: practiceState.streak,
                max_streak: practiceState.maxStreak,
                hints_used: practiceState.hintsUsed,
                time_spent: Math.floor((new Date() - practiceState.startTime) / 1000)
            })
        });
        
        if (!response.ok) {
            console.error('Error saving progress');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ========================================
// FINALIZACIÓN DEL MÓDULO
// ========================================
function completeModule() {
    const completedCount = practiceState.completed.filter(c => c === true).length;
    const accuracy = Math.round((completedCount / practiceState.totalExercises) * 100);
    const timeSpent = Math.floor((new Date() - practiceState.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    // Limpiar auto-guardado
    if (practiceState.autoSaveInterval) {
        clearInterval(practiceState.autoSaveInterval);
    }
    clearSavedProgress();
    
    // Mostrar modal de finalización
    Swal.fire({
        title: '🎉 ¡Módulo Completado!',
        html: `
            <div class="text-center">
                <p>Has completado el módulo <strong>${moduleName.replace('-', ' ').toUpperCase()}</strong></p>
                <div class="row mt-3">
                    <div class="col-6">
                        <div class="display-6 text-primary">${practiceState.score}</div>
                        <small>Puntos totales</small>
                    </div>
                    <div class="col-6">
                        <div class="display-6 text-warning">${accuracy}%</div>
                        <small>Precisión</small>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-6">
                        <div class="display-6 text-danger">${practiceState.maxStreak}</div>
                        <small>Racha máxima 🔥</small>
                    </div>
                    <div class="col-6">
                        <div class="display-6 text-info">${practiceState.hintsUsed}</div>
                        <small>Pistas usadas</small>
                    </div>
                </div>
                <div class="mt-3">
                    <small class="text-muted">Tiempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</small>
                </div>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Volver al Dashboard',
        confirmButtonColor: '#667eea',
        showCancelButton: true,
        cancelButtonText: 'Seguir practicando',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/dashboard';
        } else {
            // Reiniciar módulo
            resetModule();
        }
    });
    
    // Efectos de celebración
    if (window.englishHub && window.englishHub.launchConfetti) {
        window.englishHub.launchConfetti();
    }
    playSound('complete');
}

function resetModule() {
    practiceState.currentIndex = 0;
    practiceState.score = 0;
    practiceState.streak = 0;
    practiceState.maxStreak = 0;
    practiceState.completed = new Array(practiceState.totalExercises).fill(false);
    practiceState.hintsUsed = 0;
    practiceState.answers = {};
    practiceState.attempts = new Array(practiceState.totalExercises).fill(0);
    practiceState.startTime = new Date();
    
    loadExercise(0);
    updateStats();
    saveProgress();
    
    showToast('Módulo reiniciado', 'info');
}

// ========================================
// EFECTOS VISUALES
// ========================================
function createSuccessEffects() {
    // Confeti
    if (window.englishHub && window.englishHub.launchConfetti) {
        window.englishHub.launchConfetti();
    }
    
    // Partículas
    const rect = document.getElementById('submitBtn').getBoundingClientRect();
    if (window.englishHub && window.englishHub.createParticles) {
        window.englishHub.createParticles(rect.left + rect.width / 2, rect.top, '✨', 15);
    }
    
    // Animación de pulso en la tarjeta
    const card = document.querySelector('.exercise-card');
    if (card) {
        card.classList.add('pulse-animation');
        setTimeout(() => {
            card.classList.remove('pulse-animation');
        }, 500);
    }
}

function showFeedback(title, message, type) {
    const feedbackArea = document.getElementById('feedbackArea');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const feedbackMessage = document.getElementById('feedbackMessage');
    
    if (!feedbackArea) return;
    
    feedbackTitle.textContent = title;
    feedbackMessage.textContent = message;
    
    feedbackArea.className = `feedback-area feedback-${type}`;
    feedbackArea.style.display = 'block';
    
    // Scroll suave al feedback
    feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFeedback() {
    const feedbackArea = document.getElementById('feedbackArea');
    if (feedbackArea) {
        feedbackArea.style.display = 'none';
    }
}

// ========================================
// EVENTOS DE TECLADO
// ========================================
function setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter para enviar respuesta
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn && !submitBtn.disabled) {
                checkAnswer();
            }
        }
        
        // Flecha derecha para siguiente ejercicio
        if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn && !nextBtn.disabled) {
                nextExercise();
            }
        }
        
        // Flecha izquierda para ejercicio anterior
        if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            const prevBtn = document.getElementById('prevBtn');
            if (prevBtn && !prevBtn.disabled) {
                previousExercise();
            }
        }
        
        // Tecla H para pista
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            const hintBtn = document.getElementById('hintBtn');
            if (hintBtn && !hintBtn.disabled) {
                showHint();
            }
        }
    });
}

// ========================================
// SONIDOS
// ========================================
function playSound(type) {
    if (window.englishHub && window.englishHub.playSound) {
        window.englishHub.playSound(type);
    }
}

// ========================================
// ANIMACIONES
// ========================================
function initializeAnimations() {
    // Agregar clase de animación a las estadísticas
    const stats = document.querySelectorAll('.stat-item');
    stats.forEach((stat, index) => {
        stat.style.animationDelay = `${index * 0.1}s`;
        stat.classList.add('animate__animated', 'animate__fadeInUp');
    });
}

// ========================================
// CONFIRMACIÓN DE SALIDA
// ========================================
function setupExitConfirmation() {
    window.addEventListener('beforeunload', (e) => {
        const hasProgress = practiceState.completed.some(c => c === true) || 
                           Object.keys(practiceState.answers).length > 0;
        
        if (hasProgress && !isModuleCompleted()) {
            e.preventDefault();
            e.returnValue = 'Tienes progreso sin guardar. ¿Estás seguro de salir?';
        }
    });
}

function isModuleCompleted() {
    return practiceState.completed.every(c => c === true);
}

// ========================================
// UTILIDADES
// ========================================
function showToast(message, type) {
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, type);
    } else {
        alert(message);
    }
}

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.practice = {
    checkAnswer,
    showHint,
    nextExercise,
    previousExercise,
    skipExercise,
    resetModule
};

// ========================================
// ESTILOS ADICIONALES
// ========================================
const practiceStyles = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(0); }
        70% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(20px); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .pulse-animation {
        animation: pulse 0.5s ease-in-out;
    }
    
    .feedback-area {
        transition: all 0.3s ease;
    }
    
    .feedback-correct {
        background: #d4edda;
        border-left: 4px solid #28a745;
        color: #155724;
    }
    
    .feedback-incorrect {
        background: #f8d7da;
        border-left: 4px solid #dc3545;
        color: #721c24;
    }
    
    .feedback-info {
        background: #d1ecf1;
        border-left: 4px solid #17a2b8;
        color: #0c5460;
    }
    
    .feedback-warning {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        color: #856404;
    }
    
    .stat-item {
        transition: all 0.3s ease;
    }
    
    .stat-item:hover {
        transform: translateY(-5px);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = practiceStyles;
document.head.appendChild(styleSheet);
