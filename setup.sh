#!/bin/bash

# ============================================
# ENGLISH LEARNING HUB - SCRIPT DE CONFIGURACIÓN
# ============================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_header() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${MAGENTA}▶ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "app.py" ] && [ ! -f "models.py" ]; then
    print_error "No se encuentran los archivos principales. ¿Estás en el directorio correcto?"
    echo "Ejecuta: cd ~/english_learning_platform"
    exit 1
fi

# Banner de inicio
clear
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║     🌟   ENGLISH LEARNING HUB - CONFIGURACIÓN AUTOMÁTICA   🌟     ║"
echo "║                                                                   ║"
echo "║              Plataforma de Aprendizaje de Inglés                   ║"
echo "║                     Para Hispanohablantes                          ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_header "📋 VERIFICACIÓN DEL SISTEMA"

# Verificar Python
print_step "Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python encontrado: $PYTHON_VERSION"
else
    print_error "Python 3 no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
fi

# Verificar pip
print_step "Verificando pip..."
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version)
    print_success "pip encontrado: $PIP_VERSION"
else
    print_error "pip no está instalado. Instalando pip..."
    python3 -m ensurepip --upgrade
fi

# Verificar SQLite
print_step "Verificando SQLite..."
if command -v sqlite3 &> /dev/null; then
    SQLITE_VERSION=$(sqlite3 --version | cut -d' ' -f1)
    print_success "SQLite encontrado: $SQLITE_VERSION"
else
    print_warning "SQLite no encontrado. Se usará SQLite incluido con Python."
fi

print_header "🔧 CREANDO ENTORNO VIRTUAL"

# Crear entorno virtual
print_step "Creando entorno virtual..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Entorno virtual creado"
else
    print_warning "El entorno virtual ya existe"
fi

# Activar entorno virtual
print_step "Activando entorno virtual..."
source venv/bin/activate
print_success "Entorno virtual activado"

print_header "📦 INSTALANDO DEPENDENCIAS"

# Actualizar pip
print_step "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
print_step "Instalando dependencias desde requirements.txt..."

if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    print_success "Dependencias instaladas correctamente"
else
    print_warning "No se encontró requirements.txt. Instalando dependencias por defecto..."
    pip install flask flask-sqlalchemy flask-login werkzeug
fi

# Verificar instalación
print_step "Verificando instalación..."
python -c "import flask; import flask_sqlalchemy; import flask_login" 2>/dev/null
if [ $? -eq 0 ]; then
    print_success "Todas las dependencias están instaladas"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

print_header "🗄️ CONFIGURANDO BASE DE DATOS"

# Crear directorios necesarios
print_step "Creando directorios..."
mkdir -p data data/exercises_backup data/temp data/uploads static/css static/js static/images
print_success "Directorios creados"

# Inicializar base de datos
print_step "Inicializando base de datos..."
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('✅ Base de datos creada correctamente')
" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Base de datos inicializada"
else
    print_warning "No se pudo inicializar la base de datos automáticamente"
fi

print_header "👑 CREANDO USUARIO ADMINISTRADOR"

# Crear administrador
print_step "Creando usuario administrador..."
python -c "
from app import app, db
from models import User

with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@englishhub.com',
            role='admin',
            total_score=0,
            total_exercises=0,
            correct_answers=0,
            streak=0,
            max_streak=0,
            study_time=0,
            stars=0,
            level=1,
            level_progress=0
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('✅ Administrador creado: admin / admin123')
    else:
        print('⚠️ El administrador ya existe')
" 2>/dev/null

# Crear usuario demo
print_step "Creando usuario demo..."
python -c "
from app import app, db
from models import User

with app.app_context():
    demo = User.query.filter_by(username='usuario').first()
    if not demo:
        demo = User(
            username='usuario',
            email='usuario@example.com',
            role='user',
            total_score=150,
            total_exercises=15,
            correct_answers=12,
            streak=3,
            max_streak=5,
            study_time=45,
            stars=5,
            level=2,
            level_progress=30
        )
        demo.set_password('usuario123')
        db.session.add(demo)
        db.session.commit()
        print('✅ Usuario demo creado: usuario / usuario123')
    else:
        print('⚠️ El usuario demo ya existe')
" 2>/dev/null

print_header "📊 GENERANDO DATOS DE EJEMPLO"

# Generar ejercicios de ejemplo si no existen
if [ ! -f "data/exercises.json" ] || [ ! -s "data/exercises.json" ]; then
    print_step "Generando ejercicios de ejemplo..."
    python -c "
from exercise_generator import ExerciseGenerator
generator = ExerciseGenerator()
exercises = generator.generate_exercises(50, 'basic-questions')
generator.save_exercises_to_file(exercises, 'exercises.json')
print('✅ Ejercicios de ejemplo generados')
" 2>/dev/null
else
    print_info "Los ejercicios ya existen"
fi

# Generar flashcards de ejemplo si no existen
if [ ! -f "data/flashcards.json" ] || [ ! -s "data/flashcards.json" ]; then
    print_step "Generando flashcards de ejemplo..."
    python -c "
import json
import random
from datetime import datetime

vocabulary = {
    'Saludos': ['Hola', 'Buenos días', 'Buenas tardes', 'Buenas noches', '¿Cómo estás?'],
    'Verbos': ['Correr', 'Comer', 'Dormir', 'Estudiar', 'Trabajar'],
    'Sustantivos': ['Casa', 'Coche', 'Libro', 'Escuela', 'Familia']
}

translations = {
    'Hola': 'Hello', 'Buenos días': 'Good morning', 'Buenas tardes': 'Good afternoon',
    'Buenas noches': 'Good night', '¿Cómo estás?': 'How are you?',
    'Correr': 'Run', 'Comer': 'Eat', 'Dormir': 'Sleep', 'Estudiar': 'Study', 'Trabajar': 'Work',
    'Casa': 'House', 'Coche': 'Car', 'Libro': 'Book', 'Escuela': 'School', 'Familia': 'Family'
}

flashcards = []
for i in range(30):
    category = random.choice(list(vocabulary.keys()))
    spanish = random.choice(vocabulary[category])
    english = translations.get(spanish, spanish)
    flashcards.append({
        'id': f'fc_{i+1}',
        'category': category,
        'spanish': spanish,
        'english': english,
        'example': f'Ejemplo con "{spanish}" en contexto',
        'difficulty': random.choice(['básico', 'intermedio', 'avanzado'])
    })

with open('data/flashcards.json', 'w', encoding='utf-8') as f:
    json.dump(flashcards, f, ensure_ascii=False, indent=2)
print('✅ Flashcards de ejemplo generadas')
" 2>/dev/null
else
    print_info "Las flashcards ya existen"
fi

print_header "🔐 CONFIGURANDO PERMISOS"

# Dar permisos de ejecución a scripts
print_step "Configurando permisos..."
chmod +x start.sh 2>/dev/null
chmod +x create_admin.py 2>/dev/null
chmod +x generate_cli.py 2>/dev/null
print_success "Permisos configurados"

print_header "✅ CONFIGURACIÓN COMPLETADA"

# Mostrar resumen
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 ¡TODO LISTO! ENGLISH LEARNING HUB ESTÁ CONFIGURADO 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${CYAN}📊 RESUMEN:${NC}"
echo -e "   📁 Directorios creados: 6"
echo -e "   📦 Dependencias instaladas: Flask, SQLAlchemy, Login"
echo -e "   🗄️ Base de datos: SQLite"
echo -e "   👑 Usuario admin: ${GREEN}admin / admin123${NC}"
echo -e "   👤 Usuario demo: ${GREEN}usuario / usuario123${NC}"
echo -e "   📚 Ejercicios: 50 ejercicios de ejemplo"
echo -e "   🃏 Flashcards: 30 flashcards de ejemplo"

echo -e "\n${CYAN}🚀 COMANDOS ÚTILES:${NC}"
echo -e "   ${YELLOW}Iniciar la aplicación:${NC}     ./start.sh"
echo -e "   ${YELLOW}Crear administrador:${NC}      python create_admin.py"
echo -e "   ${YELLOW}Generar ejercicios:${NC}       python generate_cli.py generate --count 100"
echo -e "   ${YELLOW}Generar flashcards:${NC}       python generate_cli.py flashcards --count 50"
echo -e "   ${YELLOW}Validar ejercicios:${NC}       python generate_cli.py validate --file data/exercises.json"

echo -e "\n${CYAN}🌐 ACCESO A LA APLICACIÓN:${NC}"
echo -e "   🔗 URL local: ${GREEN}http://localhost:5000${NC}"
echo -e "   🔗 Dashboard admin: ${GREEN}http://localhost:5000/admin${NC}"

echo -e "\n${YELLOW}💡 Para iniciar la aplicación, ejecuta:${NC}"
echo -e "   ${GREEN}./start.sh${NC}\n"

# Preguntar si desea iniciar la aplicación
echo -e "${BLUE}¿Deseas iniciar la aplicación ahora? (s/n)${NC}"
read -r respuesta

if [[ "$respuesta" == "s" || "$respuesta" == "S" ]]; then
    echo -e "\n${GREEN}Iniciando English Learning Hub...${NC}\n"
    ./start.sh
else
    echo -e "\n${YELLOW}Puedes iniciar la aplicación más tarde con: ./start.sh${NC}"
fi
