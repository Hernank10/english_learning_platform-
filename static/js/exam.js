/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DEL EXAMEN
   Funcionalidades específicas para la página de exámenes
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let examState = {
    currentQuestion: 0,
    answers: {},
    timeLeft: 30 * 60, // 30 minutos en segundos
    timerInterval: null,
    examStarted: false,
    completed: false,
    autoSaveInterval: null,
    questionsCount: 0,
    score: 0,
    results: []
};

let examConfig = {
    timeLimit: 30 * 60,
    autoSaveDelay: 30000, // 30 segundos
    warningTime: 300, // 5 minutos de advertencia
    allowReview: true
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Página de examen - Inicializada');
    
    // Inicializar variables
    examState.questionsCount = document.querySelectorAll('.question-card').length;
    examState.timeLeft = examConfig.timeLimit;
    
    // Cargar respuestas guardadas
    loadSavedAnswers();
    
    // Iniciar temporizador
    startTimer();
    
    // Configurar auto-guardado
    setupAutoSave();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar eventos de entrada
    setupInputEvents();
    
    // Configurar confirmación de salida
    setupExitConfirmation();
    
    // Inicializar indicadores
    updateProgressIndicators();
});

// ========================================
// TEMPORIZADOR
// ========================================
function startTimer() {
    if (examState.timerInterval) clearInterval(examState.timerInterval);
    
    examState.timerInterval = setInterval(() => {
        if (examState.timeLeft <= 0) {
            // Tiempo agotado
            clearInterval(examState.timerInterval);
            examState.completed = true;
            submitExam();
            return;
        }
        
        examState.timeLeft--;
        updateTimerDisplay();
        
        // Verificar si hay advertencia de tiempo
        if (examState.timeLeft === examConfig.warningTime) {
            showTimeWarning();
        }
        
        // Guardar tiempo en localStorage
        saveExamState();
        
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    const minutes = Math.floor(examState.timeLeft / 60);
    const seconds = examState.timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.textContent = timeString;
    
    // Cambiar color según tiempo restante
    if (examState.timeLeft < 300) { // menos de 5 minutos
        timerElement.classList.add('timer-warning');
    } else {
        timerElement.classList.remove('timer-warning');
    }
}

function showTimeWarning() {
    // Mostrar advertencia visual
    const warningToast = document.createElement('div');
    warningToast.className = 'time-warning-toast';
    warningToast.innerHTML = `
        <div class="warning-content">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>¡Atención! Quedan 5 minutos para finalizar el examen</span>
        </div>
    `;
    warningToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(warningToast);
    
    setTimeout(() => {
        warningToast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => warningToast.remove(), 300);
    }, 5000);
    
    // Reproducir sonido de advertencia
    if (window.englishHub && window.englishHub.playSound) {
        window.englishHub.playSound('warning');
    }
}

// ========================================
// AUTO-GUARDADO
// ========================================
function setupAutoSave() {
    examState.autoSaveInterval = setInterval(() => {
        saveAnswers();
        saveExamState();
        showAutoSaveNotification();
    }, examConfig.autoSaveDelay);
}

function saveAnswers() {
    // Recopilar todas las respuestas
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((question, index) => {
        const textarea = question.querySelector('.answer-input');
        if (textarea) {
            examState.answers[index] = textarea.value;
        }
    });
    
    // Guardar en localStorage
    localStorage.setItem('exam_answers', JSON.stringify(examState.answers));
}

function loadSavedAnswers() {
    const savedAnswers = localStorage.getItem('exam_answers');
    if (savedAnswers) {
        examState.answers = JSON.parse(savedAnswers);
        
        // Restaurar respuestas en el formulario
        const questions = document.querySelectorAll('.question-card');
        questions.forEach((question, index) => {
            if (examState.answers[index]) {
                const textarea = question.querySelector('.answer-input');
                if (textarea) {
                    textarea.value = examState.answers[index];
                }
            }
        });
    }
    
    // Cargar estado del examen
    const savedState = localStorage.getItem('exam_state');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.timeLeft && !examState.completed) {
            examState.timeLeft = state.timeLeft;
            updateTimerDisplay();
        }
    }
}

function saveExamState() {
    const stateToSave = {
        timeLeft: examState.timeLeft,
        currentQuestion: examState.currentQuestion,
        answers: examState.answers
    };
    localStorage.setItem('exam_state', JSON.stringify(stateToSave));
}

function showAutoSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'auto-save-notification';
    notification.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>
        <span>Respuestas guardadas automáticamente</span>
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

// ========================================
// NAVEGACIÓN ENTRE PREGUNTAS
// ========================================
function setupNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateQuestion(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateQuestion(1));
    }
    if (submitBtn) {
        submitBtn.addEventListener('click', () => confirmSubmit());
    }
    
    // Teclas de navegación
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateQuestion(-1);
        } else if (e.ctrlKey && e.key === 'ArrowRight') {
            e.preventDefault();
            navigateQuestion(1);
        }
    });
}

function navigateQuestion(direction) {
    const newIndex = examState.currentQuestion + direction;
    if (newIndex >= 0 && newIndex < examState.questionsCount) {
        // Guardar respuesta actual antes de navegar
        saveCurrentAnswer();
        
        examState.currentQuestion = newIndex;
        scrollToQuestion(newIndex);
        updateProgressIndicators();
        updateQuestionHighlights();
    }
}

function scrollToQuestion(index) {
    const question = document.querySelector(`.question-card[data-question-id="${index}"]`);
    if (question) {
        question.scrollIntoView({ behavior: 'smooth', block: 'center' });
        question.classList.add('highlight-pulse');
        setTimeout(() => {
            question.classList.remove('highlight-pulse');
        }, 1000);
    }
}

function saveCurrentAnswer() {
    const currentQuestion = document.querySelector(`.question-card[data-question-id="${examState.currentQuestion}"]`);
    if (currentQuestion) {
        const textarea = currentQuestion.querySelector('.answer-input');
        if (textarea) {
            examState.answers[examState.currentQuestion] = textarea.value;
        }
    }
}

function updateProgressIndicators() {
    // Actualizar barra de progreso
    const answeredCount = Object.keys(examState.answers).length;
    const progress = (answeredCount / examState.questionsCount) * 100;
    const progressBar = document.getElementById('examProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${answeredCount}/${examState.questionsCount}`;
    }
    
    // Actualizar indicadores de preguntas
    updateQuestionStatusIndicators();
}

function updateQuestionStatusIndicators() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((question, index) => {
        const indicator = question.querySelector('.question-status');
        if (indicator) {
            if (examState.answers[index] && examState.answers[index].trim() !== '') {
                indicator.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
                indicator.setAttribute('title', 'Respuesta guardada');
            } else {
                indicator.innerHTML = '<i class="bi bi-circle text-muted"></i>';
                indicator.setAttribute('title', 'Sin responder');
            }
        }
    });
}

function updateQuestionHighlights() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((question, index) => {
        if (index === examState.currentQuestion) {
            question.classList.add('current-question');
            question.style.border = '2px solid #667eea';
            question.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        } else {
            question.classList.remove('current-question');
            question.style.border = 'none';
            question.style.boxShadow = 'none';
        }
    });
}

// ========================================
// EVENTOS DE ENTRADA
// ========================================
function setupInputEvents() {
    const textareas = document.querySelectorAll('.answer-input');
    textareas.forEach((textarea, index) => {
        textarea.addEventListener('input', () => {
            examState.answers[index] = textarea.value;
            updateProgressIndicators();
            
            // Marcar como respondida visualmente
            const questionCard = textarea.closest('.question-card');
            if (textarea.value.trim() !== '') {
                questionCard.classList.add('answered');
            } else {
                questionCard.classList.remove('answered');
            }
        });
        
        // Ctrl + Enter para enviar
        textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                confirmSubmit();
            }
        });
    });
}

// ========================================
// ENVÍO DEL EXAMEN
// ========================================
function confirmSubmit() {
    // Verificar si todas las preguntas están respondidas
    const unanswered = getUnansweredQuestions();
    
    let message = '¿Estás seguro de finalizar el examen?';
    if (unanswered.length > 0) {
        message = `Tienes ${unanswered.length} pregunta(s) sin responder. ¿Deseas finalizar de todas formas?`;
    }
    
    Swal.fire({
        title: 'Finalizar Examen',
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545'
    }).then((result) => {
        if (result.isConfirmed) {
            submitExam();
        }
    });
}

function getUnansweredQuestions() {
    const unanswered = [];
    for (let i = 0; i < examState.questionsCount; i++) {
        if (!examState.answers[i] || examState.answers[i].trim() === '') {
            unanswered.push(i);
        }
    }
    return unanswered;
}

async function submitExam() {
    // Detener temporizador
    if (examState.timerInterval) {
        clearInterval(examState.timerInterval);
    }
    if (examState.autoSaveInterval) {
        clearInterval(examState.autoSaveInterval);
    }
    
    // Mostrar loading
    Swal.fire({
        title: 'Corrigiendo examen...',
        text: 'Por favor espera mientras evaluamos tus respuestas',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Preparar datos para enviar
        const answersData = {};
        const questions = document.querySelectorAll('.question-card');
        questions.forEach((question, index) => {
            const questionId = question.dataset.questionId;
            answersData[questionId] = examState.answers[index] || '';
        });
        
        const response = await fetch('/api/submit_exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level: examLevel,
                answers: answersData,
                timeSpent: examConfig.timeLimit - examState.timeLeft
            })
        });
        
        const results = await response.json();
        
        Swal.close();
        showResults(results);
        
        // Limpiar localStorage
        localStorage.removeItem('exam_answers');
        localStorage.removeItem('exam_state');
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar el examen',
            confirmButtonText: 'Reintentar'
        }).then(() => {
            submitExam();
        });
    }
}

// ========================================
// RESULTADOS DEL EXAMEN
// ========================================
function showResults(results) {
    const percentage = results.percentage;
    const score = results.score;
    const total = results.total;
    const starsEarned = results.stars_earned;
    const medal = results.medal;
    const resultsData = results.results;
    
    let medalIcon = '';
    let medalColor = '';
    let medalClass = '';
    
    if (medal === '🥇 Oro') {
        medalIcon = '🏆🥇';
        medalColor = '#ffd700';
        medalClass = 'medal-gold';
    } else if (medal === '🥈 Plata') {
        medalIcon = '🏆🥈';
        medalColor = '#c0c0c0';
        medalClass = 'medal-silver';
    } else if (medal === '🥉 Bronce') {
        medalIcon = '🏆🥉';
        medalColor = '#cd7f32';
        medalClass = 'medal-bronze';
    } else {
        medalIcon = '📚';
        medalColor = '#6c757d';
        medalClass = 'medal-none';
    }
    
    let message = '';
    let emoji = '';
    if (percentage >= 90) {
        message = '¡Excelente! Dominas el tema perfectamente';
        emoji = '🏆✨';
    } else if (percentage >= 70) {
        message = '¡Muy bien! Tienes un buen dominio';
        emoji = '👍🌟';
    } else if (percentage >= 50) {
        message = 'Bien, pero necesitas practicar más';
        emoji = '📚💪';
    } else {
        message = 'Sigue practicando, lo lograrás';
        emoji = '🌱🚀';
    }
    
    // Crear modal de resultados
    const modalHtml = `
        <div class="result-card text-center">
            <div class="score-circle" style="background: linear-gradient(135deg, ${medalColor}, ${medalColor}dd);">
                ${Math.round(percentage)}%
            </div>
            <div class="medal-badge ${medalClass}">
                ${medalIcon}
            </div>
            <h3>${score}/${total} puntos</h3>
            <p class="text-muted">${message} ${emoji}</p>
            ${starsEarned > 0 ? `<div class="alert alert-success">✨ +${starsEarned} estrellas ganadas</div>` : ''}
            ${medal ? `<div class="alert alert-warning">🏅 ${medal} obtenida</div>` : ''}
        </div>
        
        <h5 class="mt-4 mb-3">Detalle de respuestas</h5>
        <div class="results-list" style="max-height: 400px; overflow-y: auto;">
            ${resultsData.map((result, idx) => `
                <div class="result-detail ${result.correct ? 'result-correct' : 'result-incorrect'} mb-2 p-3 rounded">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <strong>Pregunta ${idx + 1}</strong>
                            <div class="small mt-1">
                                <div><strong>Tu respuesta:</strong> ${escapeHtml(result.user_answer || '(sin respuesta)')}</div>
                                <div><strong>Respuesta correcta:</strong> ${escapeHtml(result.correct_answer)}</div>
                                ${result.explanation ? `<div class="text-muted mt-1">📖 ${escapeHtml(result.explanation)}</div>` : ''}
                            </div>
                        </div>
                        <div class="ms-3">
                            ${result.correct ? 
                                '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Correcto</span>' : 
                                '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Incorrecto</span>'
                            }
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="mt-4 d-flex gap-2 justify-content-center">
            <button class="btn btn-secondary" onclick="window.location.href='${window.location.origin}/dashboard'">
                <i class="bi bi-speedometer2"></i> Ir al Dashboard
            </button>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="bi bi-arrow-repeat"></i> Intentar de nuevo
            </button>
        </div>
    `;
    
    // Mostrar modal con resultados
    Swal.fire({
        title: '🎓 Resultados del Examen',
        html: modalHtml,
        showConfirmButton: false,
        showCloseButton: true,
        width: '800px',
        customClass: {
            popup: 'results-modal'
        },
        didOpen: () => {
            // Reproducir sonido de éxito
            if (window.englishHub && window.englishHub.playSound) {
                window.englishHub.playSound(percentage >= 70 ? 'success' : 'complete');
            }
            
            // Lanzar confeti si es buena calificación
            if (percentage >= 70 && window.englishHub && window.englishHub.launchConfetti) {
                window.englishHub.launchConfetti();
            }
        }
    });
}

// ========================================
// CONFIRMACIÓN DE SALIDA
// ========================================
function setupExitConfirmation() {
    window.addEventListener('beforeunload', (e) => {
        if (!examState.completed && Object.keys(examState.answers).length > 0) {
            e.preventDefault();
            e.returnValue = 'Tienes respuestas sin enviar. ¿Estás seguro de salir?';
        }
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

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ========================================
// ESTILOS ADICIONALES
// ========================================
const examStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
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
    
    .highlight-pulse {
        animation: pulse 0.5s ease-in-out;
    }
    
    .current-question {
        transition: all 0.3s ease;
    }
    
    .answered {
        border-left: 4px solid #28a745;
    }
    
    .timer-warning {
        color: #dc3545;
        animation: pulse 1s infinite;
    }
    
    .result-detail {
        transition: all 0.2s ease;
        cursor: pointer;
    }
    
    .result-detail:hover {
        transform: translateX(5px);
    }
    
    .result-correct {
        background: #d4edda;
        border-left: 4px solid #28a745;
    }
    
    .result-incorrect {
        background: #f8d7da;
        border-left: 4px solid #dc3545;
    }
    
    .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        color: white;
        font-size: 2rem;
        font-weight: bold;
    }
    
    .medal-badge {
        font-size: 2rem;
        margin: 0.5rem 0;
    }
    
    .results-modal {
        border-radius: 20px;
        padding: 0;
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = examStyles;
document.head.appendChild(styleSheet);
