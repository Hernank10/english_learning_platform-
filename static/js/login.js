/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DE LOGIN
   Funcionalidades específicas para la página de login
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let loginState = {
    rememberMe: false,
    loginAttempts: 0,
    maxAttempts: 5,
    lockoutTime: null,
    passwordVisible: false,
    twoFactorEnabled: false,
    securityQuestions: [],
    captchaVerified: false
};

let loginConfig = {
    sessionTimeout: 30, // minutos
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutos
    passwordMinLength: 6,
    enableCaptcha: true
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Página de login - Inicializada');
    
    // Cargar preferencias guardadas
    loadSavedCredentials();
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar animaciones
    initializeAnimations();
    
    // Configurar modo oscuro
    setupThemeToggle();
    
    // Inicializar captcha si está habilitado
    if (loginConfig.enableCaptcha) {
        initializeCaptcha();
    }
    
    // Cargar datos de seguridad
    loadSecurityData();
    
    // Animación de entrada
    animateLoginCard();
});

// ========================================
// MANEJO DEL FORMULARIO
// ========================================
async function handleLogin(event) {
    event.preventDefault();
    
    // Verificar si está bloqueado
    if (isAccountLocked()) {
        showLockoutMessage();
        return;
    }
    
    // Validar campos
    if (!validateForm()) {
        return;
    }
    
    // Verificar captcha
    if (loginConfig.enableCaptcha && !loginState.captchaVerified) {
        showToast('Por favor completa el captcha', 'warning');
        return;
    }
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // Mostrar loading
    showLoading();
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                rememberMe,
                twoFactorCode: document.getElementById('twoFactorCode')?.value
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Login exitoso
            handleSuccessfulLogin(data, rememberMe);
        } else {
            // Login fallido
            handleFailedLogin(data.message);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error de conexión. Intenta de nuevo.', 'danger');
    } finally {
        hideLoading();
    }
}

function validateForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    let isValid = true;
    
    // Validar username
    if (!username) {
        showFieldError('username', 'Por favor ingresa tu usuario o email');
        isValid = false;
    } else {
        clearFieldError('username');
    }
    
    // Validar password
    if (!password) {
        showFieldError('password', 'Por favor ingresa tu contraseña');
        isValid = false;
    } else if (password.length < loginConfig.passwordMinLength) {
        showFieldError('password', `La contraseña debe tener al menos ${loginConfig.passwordMinLength} caracteres`);
        isValid = false;
    } else {
        clearFieldError('password');
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = document.getElementById(`${fieldId}Feedback`);
    
    if (field) {
        field.classList.add('is-invalid');
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
        field.classList.add('is-valid');
    }
    if (feedback) {
        feedback.style.display = 'none';
    }
}

// ========================================
// MANEJO DE RESPUESTAS
// ========================================
function handleSuccessfulLogin(data, rememberMe) {
    // Guardar credenciales si se seleccionó recordar
    if (rememberMe) {
        saveCredentials();
    } else {
        clearSavedCredentials();
    }
    
    // Registrar intentos exitosos
    resetLoginAttempts();
    
    // Mostrar mensaje de bienvenida
    showToast(`¡Bienvenido de vuelta, ${data.username}!`, 'success');
    
    // Reproducir sonido de éxito
    playSound('success');
    
    // Redirigir después de un breve delay
    setTimeout(() => {
        window.location.href = data.redirect || '/dashboard';
    }, 1000);
}

function handleFailedLogin(errorMessage) {
    // Incrementar intentos fallidos
    loginState.loginAttempts++;
    
    // Verificar si se alcanzó el límite
    if (loginState.loginAttempts >= loginConfig.maxLoginAttempts) {
        lockAccount();
        showLockoutMessage();
    } else {
        const attemptsLeft = loginConfig.maxLoginAttempts - loginState.loginAttempts;
        showToast(errorMessage || `Usuario o contraseña incorrectos. Te quedan ${attemptsLeft} intentos.`, 'danger');
    }
    
    // Reproducir sonido de error
    playSound('error');
    
    // Agitar el formulario
    shakeForm();
}

// ========================================
// SEGURIDAD Y BLOQUEO
// ========================================
function isAccountLocked() {
    if (!loginState.lockoutTime) return false;
    
    const now = new Date();
    const lockoutEnd = new Date(loginState.lockoutTime);
    lockoutEnd.setMinutes(lockoutEnd.getMinutes() + loginConfig.lockoutDuration);
    
    return now < lockoutEnd;
}

function lockAccount() {
    loginState.lockoutTime = new Date();
    localStorage.setItem('login_lockout', loginState.lockoutTime.toISOString());
    
    const unlockTime = new Date(loginState.lockoutTime);
    unlockTime.setMinutes(unlockTime.getMinutes() + loginConfig.lockoutDuration);
    
    showToast(`Demasiados intentos fallidos. Cuenta bloqueada hasta las ${unlockTime.toLocaleTimeString()}`, 'danger');
}

function resetLoginAttempts() {
    loginState.loginAttempts = 0;
    loginState.lockoutTime = null;
    localStorage.removeItem('login_lockout');
}

function showLockoutMessage() {
    const unlockTime = new Date(loginState.lockoutTime);
    unlockTime.setMinutes(unlockTime.getMinutes() + loginConfig.lockoutDuration);
    
    const message = `Cuenta temporalmente bloqueada. Intenta de nuevo después de las ${unlockTime.toLocaleTimeString()}`;
    showToast(message, 'warning');
    
    // Deshabilitar botón de login
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        
        const unlockInterval = setInterval(() => {
            const now = new Date();
            if (now >= unlockTime) {
                submitBtn.disabled = false;
                clearInterval(unlockInterval);
                showToast('La cuenta ha sido desbloqueada. Puedes intentar nuevamente.', 'success');
            }
        }, 1000);
    }
}

// ========================================
// CREDENCIALES GUARDADAS
// ========================================
function saveCredentials() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    
    if (rememberMe) {
        localStorage.setItem('saved_username', username);
        // Nota: Nunca guardar contraseñas en texto plano en producción
        // Esto es solo para demostración
        localStorage.setItem('saved_password', btoa(password));
        localStorage.setItem('remember_me', 'true');
    }
}

function loadSavedCredentials() {
    const savedUsername = localStorage.getItem('saved_username');
    const savedPassword = localStorage.getItem('saved_password');
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    
    if (savedUsername && rememberMe) {
        document.getElementById('username').value = savedUsername;
        if (savedPassword) {
            document.getElementById('password').value = atob(savedPassword);
        }
        document.getElementById('rememberMe').checked = true;
    }
}

function clearSavedCredentials() {
    localStorage.removeItem('saved_username');
    localStorage.removeItem('saved_password');
    localStorage.removeItem('remember_me');
}

// ========================================
// AUTENTICACIÓN DE DOS FACTORES
// ========================================
function setupTwoFactor() {
    const twoFactorSection = document.getElementById('twoFactorSection');
    if (!twoFactorSection) return;
    
    // Mostrar campo de código 2FA si está habilitado
    if (loginState.twoFactorEnabled) {
        twoFactorSection.style.display = 'block';
        
        // Iniciar temporizador para código
        startCodeTimer();
    }
}

function startCodeTimer() {
    let timeLeft = 120; // 2 minutos
    const timerElement = document.getElementById('codeTimer');
    
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (timerElement) {
                timerElement.textContent = 'Código expirado. Solicita uno nuevo.';
            }
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerElement) {
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        timeLeft--;
    }, 1000);
}

// ========================================
// CAPTCHA
// ========================================
function initializeCaptcha() {
    const captchaContainer = document.getElementById('captchaContainer');
    if (!captchaContainer) return;
    
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
    
    loginState.currentCaptcha = captcha;
    
    // Dibujar captcha en canvas
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
    const captchaValid = userInput === loginState.currentCaptcha;
    
    loginState.captchaVerified = captchaValid;
    
    const captchaFeedback = document.getElementById('captchaFeedback');
    if (captchaFeedback) {
        if (userInput && userInput.length > 0) {
            captchaFeedback.textContent = captchaValid ? '✓ Captcha correcto' : '✗ Captcha incorrecto';
            captchaFeedback.className = captchaValid ? 'text-success' : 'text-danger';
        } else {
            captchaFeedback.textContent = '';
        }
    }
    
    return captchaValid;
}

// ========================================
// RECUPERACIÓN DE CONTRASEÑA
// ========================================
function showForgotPassword() {
    Swal.fire({
        title: 'Recuperar contraseña',
        html: `
            <div class="text-start">
                <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
                <div class="mb-3">
                    <input type="email" id="resetEmail" class="form-control" placeholder="tu@email.com">
                </div>
                <div class="mb-3" id="securityQuestionContainer" style="display: none;">
                    <label class="form-label">Pregunta de seguridad</label>
                    <select id="securityQuestion" class="form-select">
                        ${generateSecurityQuestions()}
                    </select>
                    <input type="text" id="securityAnswer" class="form-control mt-2" placeholder="Respuesta">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const email = document.getElementById('resetEmail').value;
            const securityAnswer = document.getElementById('securityAnswer')?.value;
            
            if (!email) {
                Swal.showValidationMessage('Por favor ingresa tu correo electrónico');
                return false;
            }
            
            return { email, securityAnswer };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Solicitud enviada',
                        text: 'Revisa tu correo para las instrucciones de recuperación',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'No se pudo procesar la solicitud',
                        confirmButtonText: 'Intentar de nuevo'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión. Intenta de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    });
}

function generateSecurityQuestions() {
    const questions = [
        '¿Cuál es el nombre de tu primera mascota?',
        '¿Cuál es el apellido de soltera de tu madre?',
        '¿En qué ciudad naciste?',
        '¿Cuál es tu comida favorita?'
    ];
    
    return questions.map(q => `<option value="${q}">${q}</option>`).join('');
}

// ========================================
// VISUALIZACIÓN DE CONTRASEÑA
// ========================================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (!passwordInput || !toggleBtn) return;
    
    loginState.passwordVisible = !loginState.passwordVisible;
    passwordInput.type = loginState.passwordVisible ? 'text' : 'password';
    
    const icon = toggleBtn.querySelector('i');
    if (icon) {
        icon.className = loginState.passwordVisible ? 'bi bi-eye-slash' : 'bi bi-eye';
    }
}

// ========================================
// REGISTRO DE USUARIO
// ========================================
function showRegister() {
    Swal.fire({
        title: 'Crear cuenta nueva',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <input type="text" id="regUsername" class="form-control" placeholder="Nombre de usuario" required>
                </div>
                <div class="mb-3">
                    <input type="email" id="regEmail" class="form-control" placeholder="Correo electrónico" required>
                </div>
                <div class="mb-3">
                    <input type="password" id="regPassword" class="form-control" placeholder="Contraseña" required>
                </div>
                <div class="mb-3">
                    <input type="password" id="regConfirmPassword" class="form-control" placeholder="Confirmar contraseña" required>
                </div>
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="termsCheckbox">
                    <label class="form-check-label">
                        Acepto los <a href="#" onclick="showTerms()">términos y condiciones</a>
                    </label>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Registrarse',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const terms = document.getElementById('termsCheckbox').checked;
            
            if (!username || !email || !password) {
                Swal.showValidationMessage('Por favor completa todos los campos');
                return false;
            }
            
            if (password !== confirmPassword) {
                Swal.showValidationMessage('Las contraseñas no coinciden');
                return false;
            }
            
            if (password.length < 6) {
                Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
                return false;
            }
            
            if (!terms) {
                Swal.showValidationMessage('Debes aceptar los términos y condiciones');
                return false;
            }
            
            return { username, email, password };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro exitoso!',
                        text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                        confirmButtonText: 'Iniciar sesión'
                    }).then(() => {
                        document.getElementById('username').value = result.value.username;
                        document.getElementById('password').focus();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'No se pudo crear la cuenta',
                        confirmButtonText: 'Intentar de nuevo'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión. Intenta de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    });
}

// ========================================
// EFECTOS VISUALES
// ========================================
function animateLoginCard() {
    const card = document.querySelector('.login-card');
    if (card) {
        card.classList.add('animate__animated', 'animate__fadeInUp');
    }
}

function shakeForm() {
    const form = document.querySelector('.login-card');
    if (form) {
        form.classList.add('shake-animation');
        setTimeout(() => {
            form.classList.remove('shake-animation');
        }, 500);
    }
}

function showLoading() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Iniciando sesión...';
    }
}

function hideLoading() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
    }
}

// ========================================
// EVENTOS Y UTILIDADES
// ========================================
function setupEventListeners() {
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Botón de mostrar/ocultar contraseña
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
    
    // Enlace de olvidé contraseña
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPassword();
        });
    }
    
    // Enlace de registro
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    }
    
    // Recordar usuario
    const rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', (e) => {
            loginState.rememberMe = e.target.checked;
            if (!loginState.rememberMe) {
                clearSavedCredentials();
            }
        });
    }
    
    // Validación en tiempo real
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', () => clearFieldError('username'));
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', () => clearFieldError('password'));
    }
}

function loadSecurityData() {
    // Cargar datos de seguridad desde localStorage
    const savedLockout = localStorage.getItem('login_lockout');
    if (savedLockout) {
        loginState.lockoutTime = new Date(savedLockout);
    }
    
    const savedAttempts = localStorage.getItem('login_attempts');
    if (savedAttempts) {
        loginState.loginAttempts = parseInt(savedAttempts);
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (window.englishHub && window.englishHub.toggleTheme) {
                window.englishHub.toggleTheme();
            }
        });
    }
}

function initializeAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .shake-animation {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .login-card {
            transition: all 0.3s ease;
        }
        
        .login-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .password-toggle {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .password-toggle:hover {
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
window.login = {
    handleLogin,
    showForgotPassword,
    showRegister,
    togglePasswordVisibility,
    generateCaptcha,
    validateCaptcha
};
