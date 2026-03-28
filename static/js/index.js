/* ========================================
   ENGLISH LEARNING HUB - JAVASCRIPT DE INICIO
   Funcionalidades específicas para la página principal
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================
let animationInterval = null;
let currentTestimonial = 0;
let testimonials = [];
let statsAnimated = false;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Página de inicio - Inicializada');
    
    // Inicializar animaciones de hero
    initializeHeroAnimations();
    
    // Inicializar contadores animados
    initializeStatsCounters();
    
    // Inicializar testimonios rotativos
    initializeTestimonials();
    
    // Inicializar carrusel de características
    initializeFeaturesCarousel();
    
    // Configurar formulario de newsletter
    setupNewsletterForm();
    
    // Configurar preguntas frecuentes
    setupFAQ();
    
    // Configurar animaciones al scroll
    setupScrollAnimations();
    
    // Configurar botón de volver arriba
    setupBackToTop();
    
    // Inicializar partículas de fondo
    initializeBackgroundParticles();
});

// ========================================
// ANIMACIONES DEL HERO
// ========================================
function initializeHeroAnimations() {
    const heroTitle = document.querySelector('.hero-section h1');
    const heroSubtitle = document.querySelector('.hero-section .lead');
    const heroButtons = document.querySelector('.hero-section .btn');
    
    if (heroTitle) {
        heroTitle.classList.add('animate__animated', 'animate__fadeInDown');
    }
    
    if (heroSubtitle) {
        heroSubtitle.classList.add('animate__animated', 'animate__fadeInUp');
        heroSubtitle.style.animationDelay = '0.3s';
    }
    
    if (heroButtons) {
        heroButtons.classList.add('animate__animated', 'animate__fadeIn');
        heroButtons.style.animationDelay = '0.6s';
    }
    
    // Efecto de escritura para el título
    const typingText = document.querySelector('.typing-animation');
    if (typingText) {
        const text = typingText.textContent;
        typingText.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                typingText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 500);
    }
}

// ========================================
// CONTADORES DE ESTADÍSTICAS
// ========================================
function initializeStatsCounters() {
    const counters = document.querySelectorAll('.counter-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                });
                observer.disconnect();
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
// TESTIMONIOS ROTATIVOS
// ========================================
function initializeTestimonials() {
    const testimonialContainer = document.querySelector('.testimonials-container');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (testimonialCards.length === 0) return;
    
    testimonials = Array.from(testimonialCards);
    
    // Ocultar todos excepto el primero
    testimonials.forEach((card, index) => {
        if (index !== 0) {
            card.style.display = 'none';
        }
    });
    
    // Crear indicadores
    const indicators = document.createElement('div');
    indicators.className = 'testimonial-indicators';
    indicators.style.display = 'flex';
    indicators.style.justifyContent = 'center';
    indicators.style.gap = '0.5rem';
    indicators.style.marginTop = '2rem';
    
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'testimonial-dot';
        dot.style.width = '10px';
        dot.style.height = '10px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = index === 0 ? '#667eea' : '#cbd5e0';
        dot.style.cursor = 'pointer';
        dot.style.transition = 'all 0.3s ease';
        
        dot.addEventListener('click', () => {
            showTestimonial(index);
            updateTestimonialDots(index);
        });
        
        indicators.appendChild(dot);
    });
    
    const testimonialSection = document.querySelector('.testimonials-section');
    if (testimonialSection) {
        testimonialSection.appendChild(indicators);
    }
    
    // Rotación automática cada 5 segundos
    setInterval(() => {
        let nextIndex = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(nextIndex);
        updateTestimonialDots(nextIndex);
    }, 5000);
}

function showTestimonial(index) {
    testimonials.forEach((card, i) => {
        if (i === index) {
            card.style.display = 'block';
            card.classList.add('animate__animated', 'animate__fadeIn');
            setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__fadeIn');
            }, 500);
        } else {
            card.style.display = 'none';
        }
    });
    currentTestimonial = index;
}

function updateTestimonialDots(index) {
    const dots = document.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, i) => {
        dot.style.backgroundColor = i === index ? '#667eea' : '#cbd5e0';
    });
}

// ========================================
// CARRUSEL DE CARACTERÍSTICAS
// ========================================
function initializeFeaturesCarousel() {
    const features = document.querySelectorAll('.feature-card');
    if (features.length === 0) return;
    
    // Agregar efecto de hover con animación
    features.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__pulse');
            }, 500);
        });
        
        // Efecto de entrada al hacer scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    card.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(card);
    });
}

// ========================================
// FORMULARIO DE NEWSLETTER
// ========================================
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showNotification('Por favor ingresa un correo válido', 'error');
            emailInput.classList.add('is-invalid');
            return;
        }
        
        emailInput.classList.remove('is-invalid');
        
        // Simular envío
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        setTimeout(() => {
            showNotification('¡Gracias por suscribirte! 🎉', 'success');
            emailInput.value = '';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    // Usar el sistema de toast global si está disponible
    if (window.englishHub && window.englishHub.showToast) {
        window.englishHub.showToast(message, type);
    } else {
        // Fallback
        alert(message);
    }
}

// ========================================
// PREGUNTAS FRECUENTES (FAQ)
// ========================================
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('.faq-icon');
            
            // Cerrar otras preguntas
            faqQuestions.forEach(q => {
                if (q !== question) {
                    const otherAnswer = q.nextElementSibling;
                    const otherIcon = q.querySelector('.faq-icon');
                    if (otherAnswer && otherAnswer.style.display === 'block') {
                        otherAnswer.style.display = 'none';
                        if (otherIcon) otherIcon.textContent = '▼';
                    }
                }
            });
            
            // Alternar respuesta actual
            if (answer.style.display === 'none' || !answer.style.display) {
                answer.style.display = 'block';
                if (icon) icon.textContent = '▲';
                answer.classList.add('animate__animated', 'animate__fadeIn');
                setTimeout(() => {
                    answer.classList.remove('animate__animated', 'animate__fadeIn');
                }, 500);
            } else {
                answer.style.display = 'none';
                if (icon) icon.textContent = '▼';
            }
        });
    });
}

// ========================================
// ANIMACIONES AL SCROLL
// ========================================
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.getAttribute('data-animation') || 'fadeInUp';
                element.classList.add(`animate__animated`, `animate__${animation}`);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// BOTÓN DE VOLVER ARRIBA
// ========================================
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// PARTÍCULAS DE FONDO
// ========================================
function initializeBackgroundParticles() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Crear canvas para partículas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    
    heroSection.style.position = 'relative';
    heroSection.insertBefore(canvas, heroSection.firstChild);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    
    function resizeCanvas() {
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
        initParticles();
    }
    
    function initParticles() {
        particles = [];
        const particleCount = Math.min(50, Math.floor(canvas.width * canvas.height / 15000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    function animateParticles() {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
            
            // Mover partícula
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Rebote en bordes
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        });
        
        animationId = requestAnimationFrame(animateParticles);
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    
    resizeCanvas();
    animateParticles();
    
    // Limpiar al salir
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
}

// ========================================
// EFECTO DE PARALLAX
// ========================================
function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            const yPos = scrolled * speed;
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ========================================
// EFECTO DE TIPO MÁQUINA DE ESCRIBIR
// ========================================
function typeWriterEffect(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ========================================
// CONTADOR REGRESIVO (para ofertas)
// ========================================
function initializeCountdown(targetDate, elementId) {
    const countdownElement = document.getElementById(elementId);
    if (!countdownElement) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            countdownElement.innerHTML = '¡Oferta expirada!';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        countdownElement.innerHTML = `
            <span class="countdown-days">${days}d</span>
            <span class="countdown-hours">${hours}h</span>
            <span class="countdown-minutes">${minutes}m</span>
            <span class="countdown-seconds">${seconds}s</span>
        `;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ========================================
// EFECTO DE GLOW EN BOTONES
// ========================================
function setupButtonGlow() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-rainbow');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const glow = document.createElement('div');
            glow.className = 'button-glow';
            glow.style.position = 'absolute';
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
            glow.style.width = '0';
            glow.style.height = '0';
            glow.style.borderRadius = '50%';
            glow.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            glow.style.transform = 'translate(-50%, -50%)';
            glow.style.transition = 'all 0.5s ease';
            glow.style.pointerEvents = 'none';
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(glow);
            
            setTimeout(() => {
                glow.style.width = '200px';
                glow.style.height = '200px';
                glow.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                glow.remove();
            }, 500);
        });
    });
}

// ========================================
// EXPORTAR FUNCIONES PARA USO EXTERNO
// ========================================
window.indexPage = {
    initializeHeroAnimations,
    initializeStatsCounters,
    initializeTestimonials,
    setupNewsletterForm,
    setupFAQ,
    setupScrollAnimations,
    setupBackToTop,
    initializeBackgroundParticles,
    setupParallaxEffect,
    typeWriterEffect,
    initializeCountdown,
    setupButtonGlow
};

// ========================================
// INICIALIZAR EFECTOS ADICIONALES
// ========================================
setupButtonGlow();
setupParallaxEffect();
