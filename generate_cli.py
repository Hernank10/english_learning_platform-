#!/usr/bin/env python3
"""Script de línea de comandos para generar ejercicios en English Learning Hub"""

import argparse
import json
import sys
import os
from datetime import datetime
from typing import List, Dict, Any

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from exercise_generator import ExerciseGenerator


class Colors:
    """Colores para terminal"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text: str):
    """Imprimir encabezado con color"""
    print(f"\n{Colors.CYAN}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text}{Colors.ENDC}")
    print(f"{Colors.CYAN}{'='*60}{Colors.ENDC}\n")


def print_success(text: str):
    """Imprimir mensaje de éxito"""
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")


def print_error(text: str):
    """Imprimir mensaje de error"""
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")


def print_warning(text: str):
    """Imprimir mensaje de advertencia"""
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")


def print_info(text: str):
    """Imprimir mensaje informativo"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.ENDC}")


def generate_exercises(args):
    """Generar ejercicios según argumentos"""
    print_header("🎯 GENERADOR DE EJERCICIOS")
    
    print_info(f"Cantidad: {args.count}")
    if args.module:
        print_info(f"Módulo: {args.module}")
    if args.difficulty:
        print_info(f"Dificultad: {args.difficulty}")
    if args.seed is not None:
        print_info(f"Seed: {args.seed}")
    
    # Crear generador
    generator = ExerciseGenerator()
    
    try:
        # Generar ejercicios
        print_info("Generando ejercicios...")
        exercises = generator.generate_exercises(
            count=args.count,
            module=args.module,
            difficulty=args.difficulty,
            seed=args.seed
        )
        
        print_success(f"Generados {len(exercises)} ejercicios")
        
        # Mostrar ejemplos
        if args.preview > 0:
            print_header("📝 VISTA PREVIA")
            for i, ex in enumerate(exercises[:args.preview], 1):
                print(f"\n{Colors.BOLD}Ejercicio {i}:{Colors.ENDC}")
                print(f"  📂 Módulo: {ex['module']}")
                print(f"  📌 Tipo: {ex['type']}")
                print(f"  📖 Instrucción: {ex['instruction']}")
                print(f"  🇪🇸 Español: {ex['spanish']}")
                print(f"  ✅ Respuesta: {ex['correct_answer']}")
                print(f"  💡 Pista: {ex['hint']}")
                print(f"  🎯 Dificultad: {ex['difficulty']}")
                print(f"  ⭐ Puntos: {ex['points']}")
        
        # Guardar archivo
        if args.output:
            filename = args.output
        else:
            filename = None
        
        filepath = generator.save_exercises_to_file(exercises, filename)
        print_success(f"Ejercicios guardados en: {filepath}")
        
        # Estadísticas
        print_header("📊 ESTADÍSTICAS")
        modules = {}
        difficulties = {}
        total_points = 0
        
        for ex in exercises:
            modules[ex['module']] = modules.get(ex['module'], 0) + 1
            difficulties[ex['difficulty']] = difficulties.get(ex['difficulty'], 0) + 1
            total_points += ex['points']
        
        print(f"📚 Por módulo:")
        for mod, count in modules.items():
            print(f"   - {mod}: {count} ejercicios")
        
        print(f"\n🎯 Por dificultad:")
        for diff, count in difficulties.items():
            emoji = "🟢" if diff == "básico" else "🟡" if diff == "intermedio" else "🔴"
            print(f"   - {emoji} {diff}: {count} ejercicios")
        
        print(f"\n⭐ Puntos totales: {total_points}")
        print(f"📈 Promedio por ejercicio: {total_points // len(exercises)}")
        
        return exercises
        
    except Exception as e:
        print_error(f"Error al generar ejercicios: {e}")
        return None


def generate_flashcards(args):
    """Generar flashcards"""
    print_header("🃏 GENERADOR DE FLASHCARDS")
    
    print_info(f"Cantidad: {args.count}")
    
    # Vocabulario base
    vocabulary = {
        'Saludos': ['Hola', 'Buenos días', 'Buenas tardes', 'Buenas noches', '¿Cómo estás?'],
        'Verbos': ['Correr', 'Comer', 'Dormir', 'Estudiar', 'Trabajar', 'Viajar'],
        'Sustantivos': ['Casa', 'Coche', 'Libro', 'Escuela', 'Familia', 'Amigo'],
        'Adjetivos': ['Grande', 'Pequeño', 'Bonito', 'Feo', 'Feliz', 'Triste'],
        'Conectores': ['Pero', 'Y', 'Porque', 'Aunque', 'Sin embargo', 'Además']
    }
    
    translations = {
        'Hola': 'Hello', 'Buenos días': 'Good morning', 'Buenas tardes': 'Good afternoon',
        'Buenas noches': 'Good night', '¿Cómo estás?': 'How are you?',
        'Correr': 'Run', 'Comer': 'Eat', 'Dormir': 'Sleep', 'Estudiar': 'Study',
        'Trabajar': 'Work', 'Viajar': 'Travel', 'Casa': 'House', 'Coche': 'Car',
        'Libro': 'Book', 'Escuela': 'School', 'Familia': 'Family', 'Amigo': 'Friend',
        'Grande': 'Big', 'Pequeño': 'Small', 'Bonito': 'Beautiful', 'Feo': 'Ugly',
        'Feliz': 'Happy', 'Triste': 'Sad', 'Pero': 'But', 'Y': 'And',
        'Porque': 'Because', 'Aunque': 'Although', 'Sin embargo': 'However', 'Además': 'Moreover'
    }
    
    flashcards = []
    
    for i in range(args.count):
        category = random.choice(list(vocabulary.keys()))
        spanish = random.choice(vocabulary[category])
        english = translations.get(spanish, spanish)
        
        flashcard = {
            'id': f"fc_gen_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}",
            'category': category,
            'spanish': spanish,
            'english': english,
            'example': f"Ejemplo con '{spanish}' en contexto",
            'difficulty': random.choice(['básico', 'intermedio', 'avanzado'])
        }
        flashcards.append(flashcard)
    
    print_success(f"Generadas {len(flashcards)} flashcards")
    
    # Guardar archivo
    filename = args.output or f"generated_flashcards_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join('data', 'exercises_backup', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(flashcards, f, ensure_ascii=False, indent=2)
    
    print_success(f"Flashcards guardadas en: {filepath}")
    
    # Mostrar ejemplos
    if args.preview > 0:
        print_header("📝 VISTA PREVIA")
        for i, fc in enumerate(flashcards[:args.preview], 1):
            print(f"\n{Colors.BOLD}Flashcard {i}:{Colors.ENDC}")
            print(f"  📂 Categoría: {fc['category']}")
            print(f"  🇪🇸 Español: {fc['spanish']}")
            print(f"  🇬🇧 English: {fc['english']}")
            print(f"  📖 Ejemplo: {fc['example']}")
            print(f"  🎯 Dificultad: {fc['difficulty']}")
    
    return flashcards


def merge_files(args):
    """Combinar archivos de ejercicios"""
    print_header("🔗 COMBINAR ARCHIVOS")
    
    if not args.files:
        print_error("No se especificaron archivos para combinar")
        return None
    
    generator = ExerciseGenerator()
    merged = []
    
    for filepath in args.files:
        try:
            exercises = generator.load_exercises_from_file(filepath)
            print_info(f"Cargados {len(exercises)} ejercicios de {filepath}")
            merged.extend(exercises)
        except Exception as e:
            print_error(f"Error al cargar {filepath}: {e}")
    
    # Eliminar duplicados
    unique_ids = set()
    unique_exercises = []
    for ex in merged:
        if ex['id'] not in unique_ids:
            unique_ids.add(ex['id'])
            unique_exercises.append(ex)
    
    print_success(f"Total ejercicios únicos: {len(unique_exercises)}")
    
    # Guardar
    filename = args.output or f"merged_exercises_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = generator.save_exercises_to_file(unique_exercises, filename)
    print_success(f"Archivo combinado guardado en: {filepath}")
    
    return unique_exercises


def validate_file(args):
    """Validar archivo de ejercicios"""
    print_header("✅ VALIDAR ARCHIVO")
    
    generator = ExerciseGenerator()
    
    try:
        exercises = generator.load_exercises_from_file(args.file)
        print_success(f"Archivo cargado correctamente: {len(exercises)} ejercicios")
        
        # Validar estructura
        required_fields = ['id', 'module', 'type', 'instruction', 'spanish', 'correct_answer', 'difficulty', 'points']
        errors = []
        
        for i, ex in enumerate(exercises):
            for field in required_fields:
                if field not in ex:
                    errors.append(f"Ejercicio {i+1}: falta campo '{field}'")
        
        if errors:
            print_warning(f"Se encontraron {len(errors)} errores:")
            for err in errors[:10]:
                print(f"   - {err}")
        else:
            print_success("Todos los ejercicios tienen la estructura correcta")
        
        # Estadísticas
        modules = {}
        difficulties = {}
        
        for ex in exercises:
            modules[ex['module']] = modules.get(ex['module'], 0) + 1
            difficulties[ex['difficulty']] = difficulties.get(ex['difficulty'], 0) + 1
        
        print_header("📊 ESTADÍSTICAS")
        print(f"📚 Por módulo:")
        for mod, count in modules.items():
            print(f"   - {mod}: {count} ejercicios")
        
        print(f"\n🎯 Por dificultad:")
        for diff, count in difficulties.items():
            emoji = "🟢" if diff == "básico" else "🟡" if diff == "intermedio" else "🔴"
            print(f"   - {emoji} {diff}: {count} ejercicios")
        
        return True
        
    except Exception as e:
        print_error(f"Error al validar archivo: {e}")
        return False


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description='English Learning Hub - Generador de Ejercicios CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  # Generar 100 ejercicios
  python generate_cli.py generate --count 100
  
  # Generar ejercicios de preguntas básicas
  python generate_cli.py generate --module basic-questions --count 50
  
  # Generar ejercicios de nivel avanzado
  python generate_cli.py generate --difficulty avanzado --count 75 --preview 5
  
  # Generar flashcards
  python generate_cli.py flashcards --count 50 --preview 3
  
  # Combinar archivos
  python generate_cli.py merge --files file1.json file2.json --output combined.json
  
  # Validar archivo
  python generate_cli.py validate --file exercises.json
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponibles')
    
    # Comando generate
    generate_parser = subparsers.add_parser('generate', help='Generar ejercicios')
    generate_parser.add_argument('--count', '-c', type=int, default=100, help='Cantidad de ejercicios (default: 100)')
    generate_parser.add_argument('--module', '-m', choices=['basic-questions', 'simple-sentences', 'compound-sentences', 'connectors'], help='Módulo específico')
    generate_parser.add_argument('--difficulty', '-d', choices=['básico', 'intermedio', 'avanzado'], help='Dificultad')
    generate_parser.add_argument('--seed', '-s', type=int, help='Seed para reproducibilidad')
    generate_parser.add_argument('--output', '-o', help='Archivo de salida')
    generate_parser.add_argument('--preview', '-p', type=int, default=3, help='Número de ejercicios para vista previa')
    
    # Comando flashcards
    flashcards_parser = subparsers.add_parser('flashcards', help='Generar flashcards')
    flashcards_parser.add_argument('--count', '-c', type=int, default=50, help='Cantidad de flashcards (default: 50)')
    flashcards_parser.add_argument('--output', '-o', help='Archivo de salida')
    flashcards_parser.add_argument('--preview', '-p', type=int, default=3, help='Número de flashcards para vista previa')
    
    # Comando merge
    merge_parser = subparsers.add_parser('merge', help='Combinar archivos JSON')
    merge_parser.add_argument('--files', '-f', nargs='+', required=True, help='Archivos a combinar')
    merge_parser.add_argument('--output', '-o', help='Archivo de salida')
    
    # Comando validate
    validate_parser = subparsers.add_parser('validate', help='Validar archivo JSON')
    validate_parser.add_argument('--file', '-f', required=True, help='Archivo a validar')
    
    args = parser.parse_args()
    
    # Importar random aquí para evitar problemas
    import random
    
    if args.command == 'generate':
        generate_exercises(args)
    elif args.command == 'flashcards':
        generate_flashcards(args)
    elif args.command == 'merge':
        merge_files(args)
    elif args.command == 'validate':
        validate_file(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
