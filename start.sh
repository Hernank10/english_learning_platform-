#!/bin/bash

# ============================================
# ENGLISH LEARNING HUB - SCRIPT DE INICIO
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

# Banner de inicio
clear
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║     🌟   ENGLISH LEARNING HUB - PLATAFORMA DE INGLÉS   🌟        ║"
echo "║                                                                   ║"
echo "║              ¡Bienvenido a tu plataforma de aprendizaje!          ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "app.py" ]; then
    print_error "No se encuentra el archivo app.py. ¿Estás en el directorio correcto?"
    echo "Ejecuta: cd ~/english_learning_platform"
    exit 1
fi

print_header "🔍 VERIFICANDO CONFIGURACIÓN"

# Verificar entorno virtual
print_step "Verificando entorno virtual..."
if [ -d "venv" ]; then
    print_success "Entorno virtual encontrado"
else
    print_warning "No se encontró entorno virtual. Ejecuta ./setup.sh primero"
    echo -e "\n${YELLOW}¿Deseas ejecutar el script de configuración ahora? (s/n)${NC}"
    read -r respuesta
    if [[ "$respuesta" == "s" || "$respuesta" == "S" ]]; then
        ./setup.sh
        exit 0
    else
        exit 1
    fi
fi

# Activar entorno virtual
print_step "Activando entorno virtual..."
source venv/bin/activate
print_success "Entorno virtual activado"

# Verificar dependencias
print_step "Verificando dependencias..."
python -c "import flask" 2>/dev/null
if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas"
else
    print_warning "Faltan dependencias. Instalando..."
    pip install -r requirements.txt 2>/dev/null || pip install flask flask-sqlalchemy flask-login werkzeug
fi

# Verificar base de datos
print_step "Verificando base de datos..."
if [ -f "english_learning.db" ]; then
    print_success "Base de datos encontrada"
else
    print_warning "No se encontró base de datos. Creando..."
    python -c "from app import app, db; app.app_context().push(); db.create_all()" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Base de datos creada"
    else
        print_error "Error al crear base de datos"
    fi
fi

# Verificar archivos de datos
print_step "Verificando archivos de datos..."

if [ -f "data/exercises.json" ]; then
    EXERCISES_COUNT=$(python -c "import json; print(len(json.load(open('data/exercises.json'))))" 2>/dev/null || echo "?")
    print_success "Ejercicios encontrados: $EXERCISES_COUNT"
else
    print_warning "No se encontraron ejercicios. Generando datos de ejemplo..."
    python -c "
from exercise_generator import ExerciseGenerator
generator = ExerciseGenerator()
exercises = generator.generate_exercises(50)
generator.save_exercises_to_file(exercises, 'exercises.json')
print('Ejercicios generados')
" 2>/dev/null
fi

if [ -f "data/flashcards.json" ]; then
    FLASHCARDS_COUNT=$(python -c "import json; print(len(json.load(open('data/flashcards.json'))))" 2>/dev/null || echo "?")
    print_success "Flashcards encontradas: $FLASHCARDS_COUNT"
else
    print_warning "No se encontraron flashcards. Generando datos de ejemplo..."
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
        'example': f'Ejemplo con \"{spanish}\" en contexto',
        'difficulty': random.choice(['básico', 'intermedio', 'avanzado'])
    })

with open('data/flashcards.json', 'w', encoding='utf-8') as f:
    json.dump(flashcards, f, ensure_ascii=False, indent=2)
print('Flashcards generadas')
" 2>/dev/null
fi

# Verificar usuario admin
print_step "Verificando usuario administrador..."
python -c "
from app import app, db
from models import User

with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if admin:
        print('✅ Administrador encontrado')
    else:
        print('⚠️ No hay administrador')
" 2>/dev/null

print_header "🚀 INICIANDO APLICACIÓN"

# Mostrar información de la aplicación
echo -e "${CYAN}📊 INFORMACIÓN:${NC}"
echo -e "   🌐 URL: ${GREEN}http://localhost:5000${NC}"
echo -e "   🔑 Admin: ${GREEN}admin / admin123${NC}"
echo -e "   👤 Demo: ${GREEN}usuario / usuario123${NC}"
echo -e "   📚 Ejercicios: en data/exercises.json"
echo -e "   🃏 Flashcards: en data/flashcards.json"

echo -e "\n${YELLOW}💡 CONSEJOS:${NC}"
echo -e "   • Presiona ${GREEN}Ctrl+C${NC} para detener el servidor"
echo -e "   • Accede al panel admin en ${GREEN}/admin${NC}"
echo -e "   • Los cambios se guardan automáticamente"

echo -e "\n${MAGENTA}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🌟 INICIANDO SERVIDOR... ¡A PRACTICAR INGLÉS! 🌟${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════════${NC}\n"

# Variable para contar errores
ERROR_COUNT=0

# Intentar diferentes puertos si es necesario
PORT=5000
MAX_PORT=5010

while [ $PORT -le $MAX_PORT ]; do
    # Verificar si el puerto está en uso
    if ! lsof -i:$PORT > /dev/null 2>&1; then
        break
    fi
    PORT=$((PORT + 1))
done

if [ $PORT -gt $MAX_PORT ]; then
    print_error "No se encontró un puerto disponible entre 5000 y $MAX_PORT"
    exit 1
fi

# Iniciar la aplicación
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

echo -e "${BLUE}🔌 Conectando en puerto: ${GREEN}$PORT${NC}\n"

# Iniciar con Flask o Python
if command -v flask &> /dev/null; then
    flask run --host=0.0.0.0 --port=$PORT
else
    python app.py
fi

# Capturar cierre
trap ctrl_c INT

function ctrl_c() {
    echo -e "\n\n${YELLOW}🛑 Deteniendo el servidor...${NC}"
    print_success "Servidor detenido correctamente"
    echo -e "\n${CYAN}¡Gracias por usar English Learning Hub! 🌟${NC}\n"
    exit 0
}
