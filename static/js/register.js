/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DE REGISTRO
   Funcionalidades específicas para la página de registro
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let registerState = {
    formValid: false,
    passwordStrength: 0,
    passwordVisible: false,
    confirmVisible: false,
    usernameAvailable: null,
    emailAvailable: null,
    termsAccepted: false,
    captchaVerified: false,
    registrationAttempts: 0
};

let registerConfig = {
    usernameMinLength: 3,
    usernameMaxLength: 20,
    passwordMinLength: 6,
    passwordMaxLength: 50,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    usernamePattern: /^[a-zA-Z0-9_]{3,20}$/,
    enableCaptcha: true,
    requireEmailVerification: false
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Página de registro - Inicializada');
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar validaciones
    initializeValidation();
    
    // Inicializar captcha si está habilitado
    if (registerConfig.enableCaptcha) {
        initializeCaptcha();
    }
    
    // Configurar animaciones
    initializeAnimations();
    
    // Cargar términos y condiciones
    loadTermsAndConditions();
    
    // Animación de entrada
    animateRegisterCard();
});

// ========================================
// VALIDACIÓN DEL FORMULARIO
// ========================================
function validateForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('termsCheckbox').checked;
    
    let isValid = true;
    
    // Validar username
    if (!validateUsername(username)) {
        showFieldError('username', getUsernameErrorMessage(username));
        isValid = false;
    } else {
        clearFieldError('username');
    }
    
    // Validar email
    if (!validateEmail(email)) {
        showFieldError('email', 'Por favor ingresa un correo electrónico válido');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // Validar contraseña
    if (!validatePassword(password)) {
        showFieldError('password', getPasswordErrorMessage(password));
        isValid = false;
    } else {
        clearFieldError('password');
    }
    
    // Validar confirmación
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Las contraseñas no coinciden');
        isValid = false;
    } else if (confirmPassword && !password) {
        showFieldError('confirmPassword', 'Primero ingresa una contraseña');
        isValid = false;
    } else {
        clearFieldError('confirmPassword');
    }
    
    // Validar términos
    if (!terms) {
        showFieldError('terms', 'Debes aceptar los términos y condiciones');
        isValid = false;
    } else {
        clearFieldError('terms');
    }
    
    // Validar captcha
    if (registerConfig.enableCaptcha && !registerState.captchaVerified) {
        showFieldError('captcha', 'Por favor completa el captcha');
        isValid = false;
    } else {
        clearFieldError('captcha');
    }
    
    registerState.formValid = isValid;
    updateSubmitButton();
    
    return isValid;
}

function validateUsername(username) {
    if (!username) return false;
    if (username.length < registerConfig.usernameMinLength) return false;
    if (username.length > registerConfig.usernameMaxLength) return false;
    return registerConfig.usernamePattern.test(username);
}

function validateEmail(email) {
    if (!email) return false;
    return registerConfig.emailPattern.test(email);
}

function validatePassword(password) {
    if (!password) return false;
    if (password.length < registerConfig.passwordMinLength) return false;
    if (password.length > registerConfig.passwordMaxLength) return false;
    
    // Verificar fuerza de contraseña
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    registerState.passwordStrength = strength;
    updatePasswordStrengthIndicator(strength);
    
    return strength >= 2;
}

function getUsernameErrorMessage(username) {
    if (!username) return 'El nombre de usuario es obligatorio';
    if (username.length < registerConfig.usernameMinLength) {
        return `El nombre de usuario debe tener al menos ${registerConfig.usernameMinLength} caracteres`;
    }
    if (username.length > registerConfig.usernameMaxLength) {
        return `El nombre de usuario no puede exceder los ${registerConfig.usernameMaxLength} caracteres`;
    }
    return 'Solo se permiten letras, números y guión bajo';
}

function getPasswordErrorMessage(password) {
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < registerConfig.passwordMinLength) {
        return `La contraseña debe tener al menos ${registerConfig.passwordMinLength} caracteres`;
    }
    if (password.length > registerConfig.passwordMaxLength) {
        return `La contraseña no puede exceder los ${registerConfig.passwordMaxLength} caracteres`;
    }
    return 'La contraseña debe contener al menos 2 tipos de caracteres (letras, números, símbolos)';
}

function updatePasswordStrengthIndicator(strength) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar) return;
    
    const strengths = {
        0: { class: 'strength-weak', text: '🔴 Muy débil', width: '20%' },
        1: { class: 'strength-weak', text: '🔴 Débil', width: '40%' },
        2: { class: 'strength-medium', text: '🟡 Media', width: '60%' },
        3: { class: 'strength-strong', text: '🟢 Fuerte', width: '80%' },
        4: { class: 'strength-very-strong', text: '💪 Muy fuerte', width: '100%' }
    };
    
    const current = strengths[strength] || strengths[0];
    
    strengthBar.className = `strength-bar ${current.class}`;
    strengthBar.style.width = current.width;
    
    if (strengthText) {
        strengthText.textContent = current.text;
        strengthText.className = current.class === 'strength-weak' ? 'text-danger' : 
                                current.class === 'strength-medium' ? 'text-warning' : 'text-success';
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = document.getElementById(`${fieldId}Feedback`);
    
    if (field) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    }
    if (feedback) {
        feedback.textContent = message;
        feedback.style.display = 'block';
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const feedback = document.getElementById(`${fieldId}Feedback`);
    
    if (field) {
        field.classList.remove('is-invalid');
        if (field.value && field.value.trim()) {
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
        }
    }
    if (feedback) {
        feedback.style.display = 'none';
    }
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = !registerState.formValid;
        if (registerState.formValid) {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        }
    }
}

// ========================================
// VERIFICACIÓN EN TIEMPO REAL
// ========================================
async function checkUsernameAvailability(username) {
    if (!username || username.length < registerConfig.usernameMinLength) {
        registerState.usernameAvailable = null;
        return;
    }
    
    try {
        const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        registerState.usernameAvailable = data.available;
        
        const usernameField = document.getElementById('username');
        const feedback = document.getElementById('usernameFeedback');
        
        if (usernameField) {
            if (data.available) {
                usernameField.classList.add('is-valid');
                usernameField.classList.remove('is-invalid');
                if (feedback) {
                    feedback.textContent = '✓ Nombre de usuario disponible';
                    feedback.className = 'text-success';
                    feedback.style.display = 'block';
                }
            } else {
                usernameField.classList.add('is-invalid');
                usernameField.classList.remove('is-valid');
                if (feedback) {
                    feedback.textContent = '✗ Este nombre de usuario ya está en uso';
                    feedback.className = 'text-danger';
                    feedback.style.display = 'block';
                }
            }
        }
        
        validateForm();
        
    } catch (error) {
        console.error('Error checking username:', error);
    }
}

async function checkEmailAvailability(email) {
    if (!email || !validateEmail(email)) {
        registerState.emailAvailable = null;
        return;
    }
    
    try {
        const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        registerState.emailAvailable = data.available;
        
        const emailField = document.getElementById('email');
        const feedback = document.getElementById('emailFeedback');
        
        if (emailField) {
            if (data.available) {
                emailField.classList.add('is-valid');
                emailField.classList.remove('is-invalid');
                if (feedback) {
                    feedback.textContent = '✓ Correo electrónico disponible';
                    feedback.className = 'text-success';
                    feedback.style.display = 'block';
                }
            } else {
                emailField.classList.add('is-invalid');
                emailField.classList.remove('is-valid');
                if (feedback) {
                    feedback.textContent = '✗ Este correo ya está registrado';
                    feedback.className = 'text-danger';
                    feedback.style.display = 'block';
                }
            }
        }
        
        validateForm();
        
    } catch (error) {
        console.error('Error checking email:', error);
    }
}

// ========================================
// ENVÍO DEL FORMULARIO
// ========================================
async function handleRegister(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showToast('Por favor corrige los errores en el formulario', 'warning');
        return;
    }
    
    const formData = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        terms: document.getElementById('termsCheckbox').checked
    };
    
    // Mostrar loading
    showLoading();
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            handleSuccessfulRegistration(data);
        } else {
            handleFailedRegistration(data.message);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Error de conexión. Por favor intenta de nuevo.', 'danger');
    } finally {
        hideLoading();
    }
}

function handleSuccessfulRegistration(data) {
    registerState.registrationAttempts = 0;
    
    // Mostrar mensaje de éxito
    Swal.fire({
        title: '🎉 ¡Registro exitoso!',
        html: `
            <div class="text-center">
                <i class="bi bi-check-circle-fill text-success fs-1"></i>
                <p class="mt-3">Tu cuenta ha sido creada correctamente.</p>
                ${registerConfig.requireEmailVerification ? 
                    '<p class="text-muted">Por favor verifica tu correo electrónico para activar tu cuenta.</p>' : 
                    '<p>Ahora puedes iniciar sesión.</p>'}
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Iniciar sesión',
        confirmButtonColor: '#28a745'
    }).then(() => {
        window.location.href = '/login';
    });
    
    playSound('success');
    
    // Limpiar formulario
    document.getElementById('registerForm').reset();
    clearPasswordFields();
}

function handleFailedRegistration(errorMessage) {
    registerState.registrationAttempts++;
    
    showToast(errorMessage || 'Error al crear la cuenta. Por favor intenta de nuevo.', 'danger');
    playSound('error');
    
    // Si hay muchos intentos fallidos, mostrar captcha
    if (registerState.registrationAttempts >= 3 && !registerConfig.enableCaptcha) {
        registerConfig.enableCaptcha = true;
        initializeCaptcha();
        showToast('Por seguridad, debes completar el captcha', 'warning');
    }
}

// ========================================
// CAPTCHA
// ========================================
function initializeCaptcha() {
    const captchaContainer = document.getElementById('captchaContainer');
    if (!captchaContainer) return;
    
    captchaContainer.style.display = 'block';
    generateCaptcha();
    
    const refreshBtn = document.getElementById('refreshCaptcha');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', generateCaptcha);
    }
    
    const captchaInput = document.getElementById('captchaInput');
    if (captchaInput) {
        captchaInput.addEventListener('input', validateCaptcha);
    }
}

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let captcha = '';
    
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    registerState.currentCaptcha = captcha;
    
    const canvas = document.getElementById('captchaCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar líneas de ruido
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
            ctx.stroke();
        }
        
        // Dibujar puntos de ruido
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.5})`;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
        }
        
        // Dibujar texto
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#2d3748';
        for (let i = 0; i < captcha.length; i++) {
            const x = 20 + i * 28;
            const y = 35 + (Math.random() * 10 - 5);
            const rotation = (Math.random() - 0.5) * 0.3;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(captcha[i], 0, 0);
            ctx.restore();
        }
    }
}

function validateCaptcha() {
    const userInput = document.getElementById('captchaInput')?.value;
    const captchaValid = userInput === registerState.currentCaptcha;
    
    registerState.captchaVerified = captchaValid;
    
    const captchaField = document.getElementById('captchaInput');
    const captchaFeedback = document.getElementById('captchaFeedback');
    
    if (captchaField) {
        if (userInput && userInput.length > 0) {
            if (captchaValid) {
                captchaField.classList.add('is-valid');
                captchaField.classList.remove('is-invalid');
                if (captchaFeedback) {
                    captchaFeedback.textContent = '✓ Captcha correcto';
                    captchaFeedback.className = 'text-success';
                }
            } else {
                captchaField.classList.add('is-invalid');
                captchaField.classList.remove('is-valid');
                if (captchaFeedback) {
                    captchaFeedback.textContent = '✗ Captcha incorrecto';
                    captchaFeedback.className = 'text-danger';
                }
            }
        } else {
            captchaField.classList.remove('is-valid', 'is-invalid');
            if (captchaFeedback) {
                captchaFeedback.textContent = '';
            }
        }
    }
    
    validateForm();
}

// ========================================
// VISUALIZACIÓN DE CONTRASEÑA
// ========================================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (!passwordInput || !toggleBtn) return;
    
    registerState.passwordVisible = !registerState.passwordVisible;
    passwordInput.type = registerState.passwordVisible ? 'text' : 'password';
    
    const icon = toggleBtn.querySelector('i');
    if (icon) {
        icon.className = registerState.passwordVisible ? 'bi bi-eye-slash' : 'bi bi-eye';
    }
}

function toggleConfirmVisibility() {
    const confirmInput = document.getElementById('confirmPassword');
    const toggleBtn = document.getElementById('toggleConfirm');
    
    if (!confirmInput || !toggleBtn) return;
    
    registerState.confirmVisible = !registerState.confirmVisible;
    confirmInput.type = registerState.confirmVisible ? 'text' : 'password';
    
    const icon = toggleBtn.querySelector('i');
    if (icon) {
        icon.className = registerState.confirmVisible ? 'bi bi-eye-slash' : 'bi bi-eye';
    }
}

function clearPasswordFields() {
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    registerState.passwordStrength = 0;
    updatePasswordStrengthIndicator(0);
}

// ========================================
// TÉRMINOS Y CONDICIONES
// ========================================
function loadTermsAndConditions() {
    const termsLink = document.getElementById('termsLink');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTermsModal();
        });
    }
    
    const privacyLink = document.getElementById('privacyLink');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPrivacyModal();
        });
    }
}

function showTermsModal() {
    Swal.fire({
        title: 'Términos y Condiciones',
        html: `
            <div class="text-start" style="max-height: 400px; overflow-y: auto;">
                <h6>1. Aceptación de los Términos</h6>
                <p>Al registrarte en English Learning Hub, aceptas estos términos y condiciones en su totalidad.</p>
                
                <h6>2. Uso de la Plataforma</h6>
                <p>La plataforma está diseñada para el aprendizaje del inglés. No está permitido el uso indebido de los contenidos.</p>
                
                <h6>3. Privacidad</h6>
                <p>Tus datos personales serán tratados de acuerdo con nuestra Política de Privacidad.</p>
                
                <h6>4. Responsabilidad del Usuario</h6>
                <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>
                
                <h6>5. Propiedad Intelectual</h6>
                <p>Todo el contenido de la plataforma está protegido por derechos de autor.</p>
                
                <h6>6. Modificaciones</h6>
                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonText: 'Cerrar'
    });
}

function showPrivacyModal() {
    Swal.fire({
        title: 'Política de Privacidad',
        html: `
            <div class="text-start" style="max-height: 400px; overflow-y: auto;">
                <h6>1. Datos que recopilamos</h6>
                <p>Recopilamos información de registro, progreso de aprendizaje y estadísticas de uso.</p>
                
                <h6>2. Uso de la información</h6>
                <p>Utilizamos tus datos para personalizar tu experiencia de aprendizaje y mejorar la plataforma.</p>
                
                <h6>3. Protección de datos</h6>
                <p>Implementamos medidas de seguridad para proteger tu información personal.</p>
                
                <h6>4. Compartición de datos</h6>
                <p>No compartimos tus datos personales con terceros sin tu consentimiento.</p>
                
                <h6>5. Tus derechos</h6>
                <p>Puedes acceder, modificar o eliminar tus datos personales en cualquier momento.</p>
                
                <h6>6. Cookies</h6>
                <p>Utilizamos cookies para mejorar la experiencia de usuario.</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonText: 'Cerrar'
    });
}

// ========================================
// EFECTOS VISUALES
// ========================================
function animateRegisterCard() {
    const card = document.querySelector('.register-card');
    if (card) {
        card.classList.add('animate__animated', 'animate__fadeInUp');
    }
}

function showLoading() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creando cuenta...';
    }
}

function hideLoading() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = !registerState.formValid;
        submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Crear Cuenta';
    }
}

function initializeAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .strength-bar {
            height: 4px;
            border-radius: 2px;
            transition: all 0.3s ease;
            background: #e9ecef;
        }
        
        .strength-weak {
            background: #dc3545;
            width: 25%;
        }
        
        .strength-medium {
            background: #ffc107;
            width: 50%;
        }
        
        .strength-strong {
            background: #28a745;
            width: 75%;
        }
        
        .strength-very-strong {
            background: #20c997;
            width: 100%;
        }
        
        .register-card {
            transition: all 0.3s ease;
        }
        
        .register-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .password-toggle, .confirm-toggle {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .password-toggle:hover, .confirm-toggle:hover {
            opacity: 0.7;
        }
        
        #captchaCanvas {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            background: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// EVENTOS Y UTILIDADES
// ========================================
function setupEventListeners() {
    // Formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Validación en tiempo real
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('termsCheckbox');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            validateUsername(usernameInput.value);
            checkUsernameAvailability(usernameInput.value);
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            validateEmail(emailInput.value);
            checkEmailAvailability(emailInput.value);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            validatePassword(passwordInput.value);
            if (confirmInput && confirmInput.value) {
                validateForm();
            }
        });
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', validateForm);
    }
    
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', validateForm);
    }
    
    // Botones de mostrar contraseña
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmBtn = document.getElementById('toggleConfirm');
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
    if (toggleConfirmBtn) {
        toggleConfirmBtn.addEventListener('click', toggleConfirmVisibility);
    }
}

function showToast(message, type) {
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, type);
    } else {
        alert(message);
    }
}

function playSound(type) {
    if (window.englishHub && window.englishHub.playSound) {
        window.englishHub.playSound(type);
    }
}

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.register = {
    handleRegister,
    validateForm,
    checkUsernameAvailability,
    checkEmailAvailability,
    togglePasswordVisibility,
    toggleConfirmVisibility,
    generateCaptcha,
    validateCaptcha,
    showTermsModal,
    showPrivacyModal
};
