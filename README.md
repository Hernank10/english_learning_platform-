# 🌟 English Learning Hub

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Flask-2.3.0-green.svg" alt="Flask">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-purple.svg" alt="Bootstrap">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen.svg" alt="Status">
</div>

<p align="center">
  <strong>Plataforma educativa completa para el aprendizaje del inglés, diseñada específicamente para hispanohablantes</strong>
</p>

<p align="center">
  <a href="#-características">Características</a> •
  <a href="#-tecnologías">Tecnologías</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-estructura">Estructura</a> •
  <a href="#-contribuciones">Contribuciones</a>
</p>

---

## 📋 Tabla de Contenidos

- [🌟 English Learning Hub](#-english-learning-hub)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [✨ Características](#-características)
  - [🚀 Tecnologías](#-tecnologías)
  - [📦 Instalación](#-instalación)
    - [Requisitos previos](#requisitos-previos)
    - [Pasos de instalación](#pasos-de-instalación)
  - [🎮 Uso](#-uso)
    - [Credenciales por defecto](#credenciales-por-defecto)
    - [Acceso a la aplicación](#acceso-a-la-aplicación)
  - [📚 Contenido Educativo](#-contenido-educativo)
    - [Ejercicios (100+)](#ejercicios-100)
    - [Flashcards (50+)](#flashcards-50)
  - [🏆 Sistema de Logros](#-sistema-de-logros)
  - [📁 Estructura del Proyecto](#-estructura-del-proyecto)
  - [👨‍💻 Contribuciones](#-contribuciones)
  - [📄 Licencia](#-licencia)
  - [👥 Autores](#-autores)
  - [🙏 Agradecimientos](#-agradecimientos)

---

## ✨ Características

### 🎯 **Para Estudiantes**
- **100+ ejercicios interactivos** de preguntas, oraciones y conectores
- **50+ flashcards** con sistema de repaso espaciado
- **Exámenes por niveles** (básico, intermedio, avanzado)
- **Dashboard personalizado** con estadísticas de progreso
- **Sistema de logros y medallas** para motivarte
- **Ranking de estudiantes** para competir sanamente
- **Modo estudio rápido** para repasos exprés

### 👑 **Para Administradores**
- **Panel de administración** completo e intuitivo
- **Gestión de ejercicios** (CRUD completo)
- **Gestión de flashcards** (CRUD completo)
- **Generador automático de ejercicios** (hasta 500 ejercicios)
- **Sistema de respaldos** automáticos
- **Estadísticas detalladas** de usuarios
- **Exportación de datos** en JSON/CSV

### 🎨 **Características Técnicas**
- 🌙 **Modo oscuro** automático
- 📱 **Diseño responsive** para todos los dispositivos
- 🔐 **Autenticación segura** con Flask-Login
- 💾 **Auto-guardado** de respuestas
- 📊 **Gráficos interactivos** con Chart.js
- 🎮 **Gamificación** con sistema de rachas y puntos
- 🔊 **Efectos de sonido** en respuestas correctas/incorrectas

---

## 🚀 Tecnologías

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Python | 3.8+ | Lenguaje principal |
| Flask | 2.3.0 | Framework web |
| Flask-SQLAlchemy | 3.0.0 | ORM para base de datos |
| Flask-Login | 0.6.2 | Autenticación de usuarios |
| SQLite | 3 | Base de datos |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Bootstrap | 5.3 | Framework CSS |
| Chart.js | 4.4 | Gráficos interactivos |
| SweetAlert2 | 11 | Alertas modernas |
| Font Awesome | 6 | Iconografía |

---

## 📦 Instalación

### Requisitos previos
- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Git (opcional, para clonar el repositorio)

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/english-learning-hub.git
cd english-learning-hub

# 2. Ejecutar script de configuración automática
chmod +x setup.sh
./setup.sh

# Este script:
# ✓ Crea entorno virtual
# ✓ Instala dependencias
# ✓ Inicializa base de datos
# ✓ Crea usuario administrador
# ✓ Genera datos de ejemplo
# ✓ Configura permisos

# 3. Iniciar la aplicación
./start.sh

# O manualmente:
# source venv/bin/activate
# python run.py

nstalación manual paso a paso
bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Crear usuario administrador
python create_admin.py

# Iniciar aplicación
python run.py
🎮 Uso
Credenciales por defecto
Rol	Usuario	Contraseña
👑 Administrador	admin	admin123
👤 Usuario demo	usuario	usuario123
Acceso a la aplicación
Una vez iniciada la aplicación, abre tu navegador y accede a:

Página	URL
🏠 Inicio	http://localhost:5000
🔐 Login	http://localhost:5000/login
📝 Registro	http://localhost:5000/register
📊 Dashboard	http://localhost:5000/dashboard
🎯 Práctica	http://localhost:5000/practice/basic-questions
🃏 Flashcards	http://localhost:5000/flashcards
📝 Exámenes	http://localhost:5000/exam/basico
🏆 Ranking	http://localhost:5000/leaderboard
👤 Perfil	http://localhost:5000/profile
👑 Admin	http://localhost:5000/admin
📚 Contenido Educativo
Ejercicios (100+)
Módulo	Cantidad	Dificultad	Puntos
Preguntas Básicas	20	Básico/Intermedio/Avanzado	10-15
Oraciones Simples	20	Básico/Intermedio	10
Oraciones Compuestas	30	Intermedio/Avanzado	15
Conectores	30	Intermedio/Avanzado	15
Flashcards (50+)
Categoría	Cantidad	Ejemplos
Saludos	5	Hola, Buenos días, Buenas tardes
Verbos	8	Correr, Comer, Estudiar, Trabajar
Sustantivos	6	Casa, Coche, Libro, Escuela
Adjetivos	7	Grande, Pequeño, Feliz, Triste
Conectores	7	Pero, Y, Porque, Aunque
Vocabulario	17	Computadora, Teléfono, Internet
🏆 Sistema de Logros
Logro	Requisito	Puntos	Icono
Primeros Pasos	10 ejercicios	50	🏆
Dedicado	50 ejercicios	100	⭐
Maestro	100 ejercicios	200	🎖️
Racha de 7 días	7 días consecutivos	50	🔥
Racha de 30 días	30 días consecutivos	200	🔥
1000 Puntos	Alcanzar 1000 puntos	100	💎
Maestro de Flashcards	Dominar 50 flashcards	100	🃏
Gurú de Gramática	100 ejercicios de gramática	200	📚
📁 Estructura del Proyecto
text
english-learning-hub/
├── 📁 data/                      # Datos JSON
│   ├── exercises.json            # 100 ejercicios
│   ├── flashcards.json           # 50 flashcards
│   ├── exercises_backup/         # Respaldos
│   └── temp/                     # Archivos temporales
│
├── 📁 static/                    # Archivos estáticos
│   ├── css/                      # 16 archivos CSS
│   ├── js/                       # 13 archivos JavaScript
│   └── images/                   # Imágenes
│
├── 📁 templates/                 # Plantillas HTML
│   ├── admin/                    # 10 plantillas admin
│   └── *.html                    # 10 plantillas principales
│
├── 📄 app.py                     # Aplicación principal
├── 📄 models.py                  # Modelos de base de datos
├── 📄 config.py                  # Configuración
├── 📄 exercise_generator.py      # Generador de ejercicios
├── 📄 generate_cli.py            # CLI para generar ejercicios
├── 📄 run.py                     # Punto de entrada
├── 📄 create_admin.py            # Crear usuario admin
├── 📄 setup.sh                   # Script de configuración
├── 📄 start.sh                   # Script de inicio
├── 📄 requirements.txt           # Dependencias
├── 📄 .gitignore                 # Archivos ignorados
└── 📄 README.md                  # Documentación
👨‍💻 Contribuciones
¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

Fork el proyecto

Crea una rama para tu feature (git checkout -b feature/AmazingFeature)

Commit tus cambios (git commit -m 'Add some AmazingFeature')

Push a la rama (git push origin feature/AmazingFeature)

Abre un Pull Request

Reportar errores
Si encuentras un bug, por favor abre un issue con:

Descripción clara del problema

Pasos para reproducirlo

Capturas de pantalla (si aplica)

Versión del sistema operativo y navegador
