/* ========================================
   ENGLISH LEARNING HUB - GENERADOR DE EJERCICIOS
   Funcionalidades para generar y gestionar ejercicios
   ======================================== */

// ========================================
// VARIABLES GLOBALES DEL GENERADOR
// ========================================
let generatedExercises = [];
let generationStartTime = null;
let currentSearchTerm = '';
let currentFilterType = 'all';
let selectedTemplate = null;

// ========================================
// PLANTILLAS PREDEFINIDAS
// ========================================
const EXERCISE_TEMPLATES = {
    'basic': {
        name: 'Básico',
        icon: '🌟',
        count: 100,
        module: '',
        difficulty: '',
        type: '',
        description: '100 ejercicios, todos los módulos, nivel básico'
    },
    'questions': {
        name: 'Preguntas',
        icon: '❓',
        count: 50,
        module: 'basic-questions',
        difficulty: '',
        type: '',
        description: '50 ejercicios de preguntas básicas'
    },
    'advanced': {
        name: 'Avanzado',
        icon: '🎯',
        count: 75,
        module: '',
        difficulty: 'avanzado',
        type: '',
        description: '75 ejercicios de nivel avanzado'
    },
    'connectors': {
        name: 'Conectores',
        icon: '🔗',
        count: 40,
        module: 'connectors',
        difficulty: '',
        type: '',
        description: '40 ejercicios de conectores'
    },
    'grammar': {
        name: 'Gramática',
        icon: '📖',
        count: 60,
        module: 'simple-sentences',
        difficulty: 'intermedio',
        type: '',
        description: '60 ejercicios de gramática básica'
    },
    'vocabulary': {
        name: 'Vocabulario',
        icon: '📚',
        count: 50,
        module: 'vocabulary',
        difficulty: 'básico',
        type: '',
        description: '50 ejercicios de vocabulario'
    }
};

// ========================================
// VOCABULARIO PARA GENERACIÓN
// ========================================
const VOCABULARY = {
    subjects: ['I', 'you', 'he', 'she', 'we', 'they', 'my brother', 'the teacher', 'Maria', 'John', 'my friend', 'the student'],
    verbs: ['work', 'study', 'live', 'eat', 'drink', 'speak', 'write', 'read', 'play', 'run', 'swim', 'travel', 'learn', 'teach'],
    objects: ['English', 'Spanish', 'French', 'coffee', 'tea', 'water', 'home', 'school', 'office', 'books', 'music', 'movies'],
    places: ['home', 'school', 'work', 'the office', 'the park', 'the cinema', 'Madrid', 'London', 'New York', 'Paris', 'Tokyo'],
    times: ['every day', 'every morning', 'on weekends', 'today', 'now', 'yesterday', 'tomorrow', 'last week', 'next month'],
    adjectives: ['happy', 'sad', 'tired', 'hungry', 'excited', 'nervous', 'calm', 'busy', 'bored', 'interested'],
    professions: ['teacher', 'doctor', 'engineer', 'student', 'nurse', 'lawyer', 'chef', 'artist', 'musician', 'writer']
};

// ========================================
// PATRONES GRAMATICALES
// ========================================
const GRAMMAR_PATTERNS = {
    to_be_question: {
        structure: '{verb} {subject} {complement}?',
        verbs: {
            'he': 'is', 'she': 'is', 'it': 'is',
            'I': 'am', 'you': 'are', 'we': 'are', 'they': 'are'
        },
        spanish: {
            'he': 'Él', 'she': 'Ella', 'it': 'Eso',
            'I': 'Yo', 'you': 'Tú', 'we': 'Nosotros', 'they': 'Ellos'
        }
    },
    do_does_question: {
        structure: '{aux} {subject} {verb} {complement}?',
        aux: {
            'he': 'Does', 'she': 'Does', 'it': 'Does',
            'I': 'Do', 'you': 'Do', 'we': 'Do', 'they': 'Do'
        },
        spanish: {
            'he': 'Él', 'she': 'Ella', 'it': 'Eso',
            'I': 'Yo', 'you': 'Tú', 'we': 'Nosotros', 'they': 'Ellos'
        }
    },
    affirmative_present: {
        structure: '{subject} {verb} {complement}.',
        spanish: '{subject_es} {verb_es} {complement_es}.'
    },
    negative_present: {
        structure: '{subject} {aux} {verb} {complement}.',
        aux: {
            'he': "doesn't", 'she': "doesn't", 'it': "doesn't",
            'I': "don't", 'you': "don't", 'we': "don't", 'they': "don't"
        }
    },
    past_simple: {
        structure: '{subject} {verb_past} {complement}.',
        irregular: {
            'go': 'went', 'come': 'came', 'eat': 'ate', 'drink': 'drank',
            'speak': 'spoke', 'write': 'wrote', 'read': 'read', 'run': 'ran',
            'see': 'saw', 'buy': 'bought', 'think': 'thought', 'know': 'knew'
        }
    }
};

// ========================================
// FUNCIONES DE GENERACIÓN
// ========================================

/**
 * Generar ejercicios según parámetros
 */
async function generateExercises(params) {
    generationStartTime = Date.now();
    const progressBar = document.getElementById('generationProgress');
    const progressFill = progressBar?.querySelector('.progress-bar-custom');
    
    if (progressBar) progressBar.style.display = 'block';
    
    try {
        // Simular progreso de generación
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (progressFill) progressFill.style.width = `${i}%`;
        }
        
        // Generar ejercicios
        generatedExercises = await generateMockExercises(params);
        
        const generationTime = ((Date.now() - generationStartTime) / 1000).toFixed(1);
        
        // Actualizar estadísticas
        updateGenerationStats(generationTime);
        
        // Mostrar resultados
        showResultsPanel();
        renderExercisesList();
        updateStatsAlert();
        
        if (progressBar) progressBar.style.display = 'none';
        
        showToast(`${generatedExercises.length} ejercicios generados correctamente`, 'success');
        
        return generatedExercises;
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al generar ejercicios', 'danger');
        if (progressBar) progressBar.style.display = 'none';
        throw error;
    }
}

/**
 * Generar ejercicios de ejemplo (simulación)
 */
function generateMockExercises(params) {
    const count = params.count || 100;
    const module = params.module || '';
    const difficulty = params.difficulty || '';
    const type = params.type || '';
    const vocabulary = params.vocabulary || 'default';
    
    const exercises = [];
    const templates = getTemplatesByModule(module, type);
    
    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        const exercise = generateSingleExercise(template, i, vocabulary);
        
        // Aplicar filtro de dificultad si está especificado
        if (difficulty && exercise.difficulty !== difficulty) {
            continue;
        }
        
        exercises.push(exercise);
        
        if (exercises.length >= count) break;
    }
    
    return exercises;
}

/**
 * Obtener plantillas según módulo
 */
function getTemplatesByModule(module, type) {
    const allTemplates = [
        {
            type: "Preguntas con 'to be'",
            module: 'basic-questions',
            instruction: "Convierte la afirmación en pregunta:",
            pattern: 'to_be_question',
            difficulty: 'básico',
            points: 10
        },
        {
            type: "Preguntas con Do/Does",
            module: 'basic-questions',
            instruction: "Convierte en pregunta usando Do/Does:",
            pattern: 'do_does_question',
            difficulty: 'básico',
            points: 10
        },
        {
            type: "Oraciones Afirmativas - Presente Simple",
            module: 'simple-sentences',
            instruction: "Traduce al inglés:",
            pattern: 'affirmative_present',
            difficulty: 'básico',
            points: 10
        },
        {
            type: "Oraciones Negativas - Presente Simple",
            module: 'simple-sentences',
            instruction: "Traduce al inglés (negativo):",
            pattern: 'negative_present',
            difficulty: 'básico',
            points: 10
        },
        {
            type: "Pasado Simple",
            module: 'simple-sentences',
            instruction: "Traduce al inglés (pasado):",
            pattern: 'past_simple',
            difficulty: 'intermedio',
            points: 10
        },
        {
            type: "Conectores de Contraste",
            module: 'connectors',
            instruction: "Completa con el conector adecuado:",
            pattern: 'contrast_connector',
            difficulty: 'intermedio',
            points: 15
        },
        {
            type: "Oraciones Compuestas con AND/BUT",
            module: 'compound-sentences',
            instruction: "Une las oraciones usando el conector:",
            pattern: 'compound_sentence',
            difficulty: 'intermedio',
            points: 15
        }
    ];
    
    if (module) {
        return allTemplates.filter(t => t.module === module);
    }
    
    if (type) {
        return allTemplates.filter(t => t.type.toLowerCase().includes(type.toLowerCase()));
    }
    
    return allTemplates;
}

/**
 * Generar un ejercicio individual
 */
function generateSingleExercise(template, index, vocabulary) {
    const pattern = template.pattern;
    const randomIndex = index % 10;
    
    let spanish = '';
    let correctAnswer = '';
    let hint = template.hint || getDefaultHint(pattern);
    let explanation = getDefaultExplanation(pattern);
    
    switch (pattern) {
        case 'to_be_question':
            const subject = getRandomItem(VOCABULARY.subjects);
            const complement = getRandomItem(VOCABULARY.professions.concat(VOCABULARY.adjectives));
            const verb = GRAMMAR_PATTERNS.to_be_question.verbs[subject.toLowerCase()] || 'is';
            const subjectEs = GRAMMAR_PATTERNS.to_be_question.spanish[subject.toLowerCase()] || subject;
            
            spanish = `${subjectEs} es ${translateComplement(complement)}`;
            correctAnswer = `${verb} ${subject} ${complement}?`;
            break;
            
        case 'do_does_question':
            const subj = getRandomItem(VOCABULARY.subjects);
            const verbBase = getRandomItem(VOCABULARY.verbs);
            const complementObj = getRandomItem(VOCABULARY.objects.concat(VOCABULARY.places));
            const aux = GRAMMAR_PATTERNS.do_does_question.aux[subj.toLowerCase()] || 'Do';
            const subjEs = GRAMMAR_PATTERNS.do_does_question.spanish[subj.toLowerCase()] || subj;
            
            spanish = `${subjEs} ${translateVerb(verbBase)} ${translateComplement(complementObj)}`;
            correctAnswer = `${aux} ${subj} ${verbBase} ${complementObj}?`;
            break;
            
        case 'affirmative_present':
            const subjectAff = getRandomItem(VOCABULARY.subjects);
            const verbAff = getRandomItem(VOCABULARY.verbs);
            const complementAff = getRandomItem(VOCABULARY.objects.concat(VOCABULARY.places));
            const conjugatedVerb = subjectAff.toLowerCase() === 'he' || subjectAff.toLowerCase() === 'she' || subjectAff.toLowerCase() === 'it'
                ? addVerbEnding(verbAff)
                : verbAff;
            
            spanish = `${translateSubject(subjectAff)} ${translateVerb(verbAff)} ${translateComplement(complementAff)}`;
            correctAnswer = `${subjectAff} ${conjugatedVerb} ${complementAff}.`;
            break;
            
        case 'negative_present':
            const subjectNeg = getRandomItem(VOCABULARY.subjects);
            const verbNeg = getRandomItem(VOCABULARY.verbs);
            const complementNeg = getRandomItem(VOCABULARY.objects.concat(VOCABULARY.places));
            const auxNeg = GRAMMAR_PATTERNS.negative_present.aux[subjectNeg.toLowerCase()] || "don't";
            
            spanish = `${translateSubject(subjectNeg)} no ${translateVerb(verbNeg)} ${translateComplement(complementNeg)}`;
            correctAnswer = `${subjectNeg} ${auxNeg} ${verbNeg} ${complementNeg}.`;
            break;
            
        case 'past_simple':
            const subjectPast = getRandomItem(VOCABULARY.subjects);
            const verbPast = getRandomItem(VOCABULARY.verbs);
            const complementPast = getRandomItem(VOCABULARY.times.concat(VOCABULARY.places));
            const pastVerb = GRAMMAR_PATTERNS.past_simple.irregular[verbPast] || `${verbPast}ed`;
            
            spanish = `${translateSubject(subjectPast)} ${translateVerbPast(verbPast)} ${translateComplement(complementPast)}`;
            correctAnswer = `${subjectPast} ${pastVerb} ${complementPast}.`;
            break;
            
        default:
            spanish = `Ejemplo de ejercicio ${index + 1}`;
            correctAnswer = `Example exercise ${index + 1}`;
    }
    
    return {
        id: `gen_${Date.now()}_${index}`,
        module: template.module,
        type: template.type,
        instruction: template.instruction,
        spanish: spanish,
        correct_answer: correctAnswer,
        hint: hint,
        explanation: explanation,
        difficulty: template.difficulty,
        points: template.points
    };
}

// ========================================
// FUNCIONES DE TRADUCCIÓN
// ========================================

function translateSubject(subject) {
    const translations = {
        'I': 'Yo', 'you': 'Tú', 'he': 'Él', 'she': 'Ella', 'we': 'Nosotros',
        'they': 'Ellos', 'my brother': 'Mi hermano', 'the teacher': 'El profesor',
        'Maria': 'María', 'John': 'Juan', 'my friend': 'Mi amigo', 'the student': 'El estudiante'
    };
    return translations[subject] || subject;
}

function translateVerb(verb) {
    const translations = {
        'work': 'trabaja', 'study': 'estudia', 'live': 'vive', 'eat': 'come',
        'drink': 'bebe', 'speak': 'habla', 'write': 'escribe', 'read': 'lee',
        'play': 'juega', 'run': 'corre', 'swim': 'nada', 'travel': 'viaja',
        'learn': 'aprende', 'teach': 'enseña'
    };
    return translations[verb] || verb;
}

function translateVerbPast(verb) {
    const translations = {
        'work': 'trabajó', 'study': 'estudió', 'live': 'vivió', 'eat': 'comió',
        'drink': 'bebió', 'speak': 'habló', 'write': 'escribió', 'read': 'leyó',
        'play': 'jugó', 'run': 'corrió', 'go': 'fue', 'come': 'vino'
    };
    return translations[verb] || verb + 'ó';
}

function translateComplement(complement) {
    const translations = {
        'English': 'inglés', 'Spanish': 'español', 'French': 'francés',
        'coffee': 'café', 'tea': 'té', 'water': 'agua', 'home': 'casa',
        'school': 'escuela', 'work': 'trabajo', 'office': 'oficina',
        'the park': 'el parque', 'the cinema': 'el cine', 'Madrid': 'Madrid',
        'London': 'Londres', 'New York': 'Nueva York', 'Paris': 'París',
        'every day': 'todos los días', 'today': 'hoy', 'now': 'ahora',
        'yesterday': 'ayer', 'tomorrow': 'mañana', 'books': 'libros',
        'music': 'música', 'movies': 'películas'
    };
    return translations[complement] || complement;
}

function addVerbEnding(verb) {
    if (verb.endsWith('y')) {
        return verb.slice(0, -1) + 'ies';
    }
    if (verb.endsWith('s') || verb.endsWith('sh') || verb.endsWith('ch') || verb.endsWith('x') || verb.endsWith('z')) {
        return verb + 'es';
    }
    return verb + 's';
}

function getDefaultHint(pattern) {
    const hints = {
        'to_be_question': 'Recuerda invertir el orden: Verbo + Sujeto + Complemento',
        'do_does_question': 'Usa Do/Does + verbo en forma base',
        'affirmative_present': 'Orden: Sujeto + Verbo + Complemento',
        'negative_present': 'Usa don\'t/doesn\'t + verbo base',
        'past_simple': 'Añade -ed al verbo o usa el irregular'
    };
    return hints[pattern] || 'Completa el ejercicio correctamente';
}

function getDefaultExplanation(pattern) {
    const explanations = {
        'to_be_question': 'En inglés, invertimos el verbo "to be" para hacer preguntas',
        'do_does_question': 'Añadimos "do/does" cuando no hay otro auxiliar en la oración',
        'affirmative_present': 'Las oraciones afirmativas siguen el orden Sujeto-Verbo-Complemento',
        'negative_present': 'Para hacer negativas en presente añadimos don\'t/doesn\'t',
        'past_simple': 'El pasado simple se forma con -ed o verbos irregulares'
    };
    return explanations[pattern] || 'Revisa la estructura gramatical';
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function updateGenerationStats(generationTime) {
    const totalPoints = generatedExercises.reduce((sum, ex) => sum + ex.points, 0);
    const difficulties = generatedExercises.reduce((acc, ex) => {
        acc[ex.difficulty] = (acc[ex.difficulty] || 0) + 1;
        return acc;
    }, {});
    
    const totalGeneratedEl = document.getElementById('totalGenerated');
    const totalPointsEl = document.getElementById('totalPoints');
    const difficultyStatsEl = document.getElementById('difficultyStats');
    const generationTimeEl = document.getElementById('generationTime');
    
    if (totalGeneratedEl) totalGeneratedEl.textContent = `${generatedExercises.length} ejercicios`;
    if (totalPointsEl) totalPointsEl.textContent = `${totalPoints} puntos`;
    if (difficultyStatsEl) {
        difficultyStatsEl.innerHTML = `🟢 Básico: ${difficulties.básico || 0} | 🟡 Intermedio: ${difficulties.intermedio || 0} | 🔴 Avanzado: ${difficulties.avanzado || 0}`;
    }
    if (generationTimeEl) generationTimeEl.textContent = `${generationTime}s`;
}

function updateStatsAlert() {
    const statsAlert = document.getElementById('statsAlert');
    if (!statsAlert) return;
    
    const difficulties = generatedExercises.reduce((acc, ex) => {
        acc[ex.difficulty] = (acc[ex.difficulty] || 0) + 1;
        return acc;
    }, {});
    
    statsAlert.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        ✅ ¡Generación completada! Se crearon <strong>${generatedExercises.length}</strong> ejercicios.
        <br>
        <small>📊 Distribución: ${difficulties.básico || 0} básicos, 
        ${difficulties.intermedio || 0} intermedios,
        ${difficulties.avanzado || 0} avanzados</small>
    `;
}

function showResultsPanel() {
    const resultsCard = document.getElementById('resultsCard');
    const statsCard = document.getElementById('statsCard');
    if (resultsCard) resultsCard.style.display = 'block';
    if (statsCard) statsCard.style.display = 'block';
}

function renderExercisesList() {
    const container = document.getElementById('exercisesPreview');
    if (!container) return;
    
    let filteredExercises = generatedExercises;
    
    if (currentSearchTerm) {
        filteredExercises = generatedExercises.filter(ex => 
            ex.spanish.toLowerCase().includes(currentSearchTerm) ||
            ex.correct_answer.toLowerCase().includes(currentSearchTerm) ||
            ex.type.toLowerCase().includes(currentSearchTerm)
        );
    }
    
    container.innerHTML = filteredExercises.slice(0, 20).map((ex, idx) => `
        <div class="exercise-preview slide-in">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge bg-${getDifficultyBadgeColor(ex.difficulty)}">${ex.difficulty}</span>
                        <span class="badge bg-primary">${ex.points} pts</span>
                        <small class="text-muted">${ex.module?.replace('-', ' ') || 'general'}</small>
                    </div>
                    <div class="fw-bold">${escapeHtml(ex.type)}</div>
                    <div class="text-muted small">${escapeHtml(ex.instruction)}</div>
                    <div class="mt-2">
                        <span class="tag">🇪🇸 ${escapeHtml(ex.spanish.substring(0, 60))}${ex.spanish.length > 60 ? '...' : ''}</span>
                        <span class="tag">✅ ${escapeHtml(ex.correct_answer.substring(0, 60))}${ex.correct_answer.length > 60 ? '...' : ''}</span>
                    </div>
                </div>
                <div class="ms-2">
                    <button class="btn btn-sm btn-outline-danger" onclick="window.removeExercise(${idx})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (filteredExercises.length > 20) {
        container.innerHTML += `
            <div class="text-center text-muted mt-2">
                <small>... y ${filteredExercises.length - 20} ejercicios más</small>
            </div>
        `;
    }
    
    if (filteredExercises.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="mt-2">No se encontraron ejercicios</p>
            </div>
        `;
    }
}

function getDifficultyBadgeColor(difficulty) {
    const colors = {
        'básico': 'success',
        'intermedio': 'warning',
        'avanzado': 'danger'
    };
    return colors[difficulty] || 'secondary';
}

// ========================================
// FUNCIONES DE ACCIÓN
// ========================================

function loadTemplate(templateName) {
    const template = EXERCISE_TEMPLATES[templateName];
    if (!template) return;
    
    const countInput = document.getElementById('exerciseCount');
    const moduleSelect = document.getElementById('exerciseModule');
    const difficultySelect = document.getElementById('exerciseDifficulty');
    const typeSelect = document.getElementById('exerciseType');
    
    if (countInput) {
        countInput.value = template.count;
        document.getElementById('countValue').textContent = template.count;
    }
    if (moduleSelect) moduleSelect.value = template.module;
    if (difficultySelect) difficultySelect.value = template.difficulty;
    if (typeSelect) typeSelect.value = template.type;
    
    // Resaltar plantilla seleccionada
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
    
    showToast(`Plantilla "${template.name}" cargada`, 'success');
}

function removeExercise(index) {
    generatedExercises.splice(index, 1);
    renderExercisesList();
    updateGenerationStats(document.getElementById('generationTime')?.textContent || '0');
    updateStatsAlert();
    showToast('Ejercicio eliminado', 'info');
}

function saveToApp() {
    if (generatedExercises.length === 0) {
        showToast('No hay ejercicios para guardar', 'warning');
        return;
    }
    
    Swal.fire({
        title: 'Guardar Ejercicios',
        text: `¿Guardar ${generatedExercises.length} ejercicios en la base de datos?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Simular guardado
            setTimeout(() => {
                showToast(`${generatedExercises.length} ejercicios guardados correctamente`, 'success');
            }, 1000);
        }
    });
}

function downloadJSON() {
    if (generatedExercises.length === 0) {
        showToast('No hay ejercicios para descargar', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(generatedExercises, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exercises_${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Archivo descargado correctamente', 'success');
}

function clearResults() {
    generatedExercises = [];
    currentSearchTerm = '';
    document.getElementById('resultsCard').style.display = 'none';
    document.getElementById('statsCard').style.display = 'none';
    document.getElementById('searchPreview').value = '';
    showToast('Resultados limpiados', 'info');
}

function filterExercises() {
    const searchInput = document.getElementById('searchPreview');
    if (searchInput) {
        currentSearchTerm = searchInput.value.toLowerCase();
        renderExercisesList();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupGeneratorEventListeners() {
    // Slider de cantidad
    const countSlider = document.getElementById('exerciseCount');
    if (countSlider) {
        countSlider.addEventListener('input', (e) => {
            document.getElementById('countValue').textContent = e.target.value;
        });
    }
    
    // Búsqueda en ejercicios generados
    const searchInput = document.getElementById('searchPreview');
    if (searchInput) {
        searchInput.addEventListener('input', filterExercises);
    }
    
    // Botones de acción
    const saveBtn = document.getElementById('saveBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (saveBtn) saveBtn.addEventListener('click', saveToApp);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadJSON);
    if (clearBtn) clearBtn.addEventListener('click', clearResults);
}

// ========================================
// INICIALIZACIÓN
// ========================================

function initGenerator() {
    console.log('⚙️ Generador de ejercicios inicializado');
    setupGeneratorEventListeners();
    
    // Mostrar plantillas en la interfaz
    const templatesGrid = document.getElementById('templatesGrid');
    if (templatesGrid && Object.keys(EXERCISE_TEMPLATES).length > 0) {
        templatesGrid.innerHTML = Object.entries(EXERCISE_TEMPLATES).map(([key, template]) => `
            <div class="col-6">
                <div class="template-card" onclick="loadTemplate('${key}')">
                    <i class="bi bi-${getTemplateIcon(key)} fs-1 text-primary"></i>
                    <div class="fw-bold mt-2">${template.icon} ${template.name}</div>
                    <small class="text-muted">${template.description}</small>
                </div>
            </div>
        `).join('');
    }
}

function getTemplateIcon(templateKey) {
    const icons = {
        'basic': 'star',
        'questions': 'question-circle',
        'advanced': 'diamond',
        'connectors': 'link',
        'grammar': 'book',
        'vocabulary': 'card-list'
    };
    return icons[templateKey] || 'file-text';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initGenerator);

// Exportar funciones globales
window.generateExercises = generateExercises;
window.loadTemplate = loadTemplate;
window.removeExercise = removeExercise;
window.saveToApp = saveToApp;
window.downloadJSON = downloadJSON;
window.clearResults = clearResults;
window.filterExercises = filterExercises;
