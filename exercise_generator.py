"""Generador Inteligente de Ejercicios para English Learning Hub"""

import json
import random
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

class ExerciseGenerator:
    """Clase para generar ejercicios de inglés automáticamente"""
    
    def __init__(self):
        """Inicializar el generador con datos predefinidos"""
        self.vocabulary = self._load_vocabulary()
        self.templates = self._load_templates()
        self.grammar_patterns = self._load_grammar_patterns()
        
    def _load_vocabulary(self) -> Dict[str, List[str]]:
        """Cargar vocabulario para generar ejercicios variados"""
        return {
            'subjects': [
                'I', 'you', 'he', 'she', 'it', 'we', 'they',
                'my brother', 'my sister', 'the teacher', 'the student',
                'Maria', 'John', 'Peter', 'Anna', 'my friend', 'my mother',
                'my father', 'the doctor', 'the nurse', 'the engineer'
            ],
            'verbs': [
                'work', 'study', 'live', 'eat', 'drink', 'speak', 'write',
                'read', 'play', 'run', 'swim', 'travel', 'learn', 'teach',
                'cook', 'drive', 'sing', 'dance', 'paint', 'build'
            ],
            'objects': [
                'English', 'Spanish', 'French', 'German', 'Italian',
                'coffee', 'tea', 'water', 'juice', 'milk',
                'home', 'school', 'office', 'hospital', 'restaurant',
                'books', 'music', 'movies', 'sports', 'art'
            ],
            'places': [
                'home', 'school', 'work', 'the office', 'the park',
                'the cinema', 'the theater', 'the museum', 'the library',
                'Madrid', 'London', 'New York', 'Paris', 'Tokyo', 'Berlin',
                'the beach', 'the mountains', 'the city', 'the village'
            ],
            'times': [
                'every day', 'every morning', 'every afternoon', 'every evening',
                'on weekends', 'on Mondays', 'on Fridays',
                'today', 'now', 'yesterday', 'tomorrow', 'last week',
                'next week', 'this month', 'last year', 'in the morning'
            ],
            'adjectives': [
                'happy', 'sad', 'tired', 'hungry', 'thirsty', 'excited',
                'nervous', 'calm', 'busy', 'bored', 'interested', 'surprised',
                'angry', 'worried', 'confused', 'proud', 'ashamed'
            ],
            'professions': [
                'teacher', 'doctor', 'engineer', 'student', 'nurse',
                'lawyer', 'chef', 'artist', 'musician', 'writer',
                'scientist', 'architect', 'pilot', 'police officer',
                'firefighter', 'dentist', 'pharmacist', 'veterinarian'
            ],
            'connectors': {
                'contrast': ['but', 'however', 'although', 'though', 'yet', 'nevertheless'],
                'cause': ['because', 'since', 'as', 'due to', 'owing to'],
                'result': ['so', 'therefore', 'thus', 'hence', 'consequently', 'as a result'],
                'addition': ['and', 'also', 'too', 'moreover', 'furthermore', 'in addition'],
                'time': ['when', 'while', 'as', 'before', 'after', 'until', 'since']
            }
        }
    
    def _load_templates(self) -> Dict[str, List[Dict]]:
        """Cargar plantillas de ejercicios por módulo"""
        return {
            'basic-questions': [
                {
                    "type": "Preguntas con 'to be'",
                    "instruction": "Convierte la afirmación en pregunta:",
                    "pattern": "to_be_question",
                    "points": 10,
                    "difficulty": "básico"
                },
                {
                    "type": "Preguntas con Do/Does",
                    "instruction": "Convierte en pregunta usando Do/Does:",
                    "pattern": "do_does_question",
                    "points": 10,
                    "difficulty": "básico"
                },
                {
                    "type": "Preguntas con Did",
                    "instruction": "Convierte en pregunta usando Did:",
                    "pattern": "did_question",
                    "points": 10,
                    "difficulty": "básico"
                }
            ],
            'simple-sentences': [
                {
                    "type": "Oraciones Afirmativas - Presente Simple",
                    "instruction": "Traduce al inglés:",
                    "pattern": "affirmative_present",
                    "points": 10,
                    "difficulty": "básico"
                },
                {
                    "type": "Oraciones Negativas - Presente Simple",
                    "instruction": "Traduce al inglés (negativo):",
                    "pattern": "negative_present",
                    "points": 10,
                    "difficulty": "básico"
                },
                {
                    "type": "Oraciones en Pasado Simple",
                    "instruction": "Traduce al inglés (pasado):",
                    "pattern": "past_simple",
                    "points": 10,
                    "difficulty": "intermedio"
                }
            ],
            'compound-sentences': [
                {
                    "type": "Oraciones con Conectores",
                    "instruction": "Une las oraciones usando el conector indicado:",
                    "pattern": "connector_sentence",
                    "points": 15,
                    "difficulty": "intermedio"
                },
                {
                    "type": "Oraciones de Relativo",
                    "instruction": "Combina las oraciones usando un pronombre relativo:",
                    "pattern": "relative_clause",
                    "points": 15,
                    "difficulty": "avanzado"
                },
                {
                    "type": "Condicionales - Primer Condicional",
                    "instruction": "Forma una oración condicional:",
                    "pattern": "first_conditional",
                    "points": 15,
                    "difficulty": "intermedio"
                }
            ],
            'connectors': [
                {
                    "type": "Conectores de Contraste",
                    "instruction": "Completa con el conector adecuado:",
                    "pattern": "contrast_connector",
                    "points": 15,
                    "difficulty": "intermedio"
                },
                {
                    "type": "Conectores de Causa",
                    "instruction": "Completa con el conector de causa:",
                    "pattern": "cause_connector",
                    "points": 15,
                    "difficulty": "intermedio"
                },
                {
                    "type": "Conectores de Resultado",
                    "instruction": "Completa con el conector de resultado:",
                    "pattern": "result_connector",
                    "points": 15,
                    "difficulty": "avanzado"
                }
            ]
        }
    
    def _load_grammar_patterns(self) -> Dict[str, Dict]:
        """Cargar patrones gramaticales para generación"""
        return {
            'to_be_question': {
                'structure': '{verb} {subject} {complement}?',
                'verbs': {
                    'I': 'am', 'you': 'are', 'he': 'is', 'she': 'is', 'it': 'is',
                    'we': 'are', 'they': 'are'
                },
                'spanish_verbs': {
                    'I': 'soy', 'you': 'eres', 'he': 'es', 'she': 'es', 'it': 'es',
                    'we': 'somos', 'they': 'son'
                }
            },
            'do_does_question': {
                'structure': '{aux} {subject} {verb} {complement}?',
                'aux': {
                    'I': 'Do', 'you': 'Do', 'we': 'Do', 'they': 'Do',
                    'he': 'Does', 'she': 'Does', 'it': 'Does'
                }
            },
            'affirmative_present': {
                'structure': '{subject} {verb} {complement}.',
                'third_person_ending': lambda v: v + 'es' if v.endswith(('s', 'sh', 'ch', 'x', 'z', 'o')) else v + 's'
            }
        }
    
    def generate_exercises(self, count: int = 100, module: str = None, 
                          difficulty: str = None, seed: int = None) -> List[Dict]:
        """Generar ejercicios de forma inteligente"""
        if seed is not None:
            random.seed(seed)
        
        exercises = []
        templates_to_use = []
        
        # Seleccionar templates según módulo
        if module and module in self.templates:
            templates_to_use = self.templates[module]
        else:
            # Usar todos los módulos
            for module_templates in self.templates.values():
                templates_to_use.extend(module_templates)
        
        # Filtrar por dificultad si se especifica
        if difficulty:
            templates_to_use = [t for t in templates_to_use if t['difficulty'] == difficulty]
        
        if not templates_to_use:
            templates_to_use = self.templates['basic-questions']
        
        # Generar ejercicios
        for i in range(count):
            template = random.choice(templates_to_use)
            exercise = self._generate_single_exercise(template, i)
            exercises.append(exercise)
        
        return exercises
    
    def _generate_single_exercise(self, template: Dict, index: int) -> Dict:
        """Generar un ejercicio individual basado en plantilla"""
        pattern = template.get('pattern')
        
        generators = {
            'to_be_question': self._generate_to_be_question,
            'do_does_question': self._generate_do_does_question,
            'did_question': self._generate_did_question,
            'affirmative_present': self._generate_affirmative_present,
            'negative_present': self._generate_negative_present,
            'past_simple': self._generate_past_simple,
            'connector_sentence': self._generate_connector_sentence,
            'relative_clause': self._generate_relative_clause,
            'first_conditional': self._generate_first_conditional,
            'contrast_connector': self._generate_contrast_connector,
            'cause_connector': self._generate_cause_connector,
            'result_connector': self._generate_result_connector
        }
        
        generator = generators.get(pattern)
        if generator:
            return generator(template, index)
        
        # Fallback a ejercicio genérico
        return self._generate_generic_exercise(template, index)
    
    def _generate_to_be_question(self, template: Dict, index: int) -> Dict:
        """Generar pregunta con to be"""
        subject = random.choice(self.vocabulary['subjects'])
        complement = random.choice(self.vocabulary['professions'] + self.vocabulary['adjectives'])
        
        pattern = self.grammar_patterns['to_be_question']
        verb = pattern['verbs'].get(subject, 'is')
        spanish_verb = pattern['spanish_verbs'].get(subject, 'es')
        
        # Traducir sujeto
        subject_translations = {
            'I': 'Yo', 'you': 'Tú', 'he': 'Él', 'she': 'Ella', 'it': 'Eso',
            'we': 'Nosotros', 'they': 'Ellos', 'my brother': 'Mi hermano',
            'my sister': 'Mi hermana', 'the teacher': 'El profesor',
            'the student': 'El estudiante'
        }
        subject_es = subject_translations.get(subject, subject)
        
        return {
            'id': f"gen_{datetime.now().strftime('%Y%m%d%H%M%S')}_{index}",
            'module': template.get('module', 'basic-questions'),
            'type': template['type'],
            'instruction': template['instruction'],
            'spanish': f"{subject_es} {spanish_verb} {self._translate_complement(complement)}",
            'correct_answer': f"{verb} {subject} {complement}?",
            'hint': "Recuerda invertir el orden: Verbo + Sujeto + Complemento",
            'explanation': "En inglés, invertimos el verbo 'to be' para hacer preguntas",
            'difficulty': template['difficulty'],
            'points': template['points']
        }
    
    def _generate_do_does_question(self, template: Dict, index: int) -> Dict:
        """Generar pregunta con Do/Does"""
        subject = random.choice(self.vocabulary['subjects'])
        verb = random.choice(self.vocabulary['verbs'])
        complement = random.choice(self.vocabulary['objects'] + self.vocabulary['places'])
        
        pattern = self.grammar_patterns['do_does_question']
        aux = pattern['aux'].get(subject, 'Do')
        
        subject_translations = {
            'I': 'Yo', 'you': 'Tú', 'he': 'Él', 'she': 'Ella', 'it': 'Eso',
            'we': 'Nosotros', 'they': 'Ellos'
        }
        subject_es = subject_translations.get(subject, subject)
        
        return {
            'id': f"gen_{datetime.now().strftime('%Y%m%d%H%M%S')}_{index}",
            'module': template.get('module', 'basic-questions'),
            'type': template['type'],
            'instruction': template['instruction'],
            'spanish': f"{subject_es} {self._translate_verb(verb)} {self._translate_complement(complement)}",
            'correct_answer': f"{aux} {subject} {verb} {complement}?",
            'hint': f"Para {subject} usa {aux} + verbo en forma base",
            'explanation': "Añadimos 'do/does' cuando no hay otro auxiliar",
            'difficulty': template['difficulty'],
            'points': template['points']
        }
    
    def _generate_affirmative_present(self, template: Dict, index: int) -> Dict:
        """Generar oración afirmativa en presente"""
        subject = random.choice(self.vocabulary['subjects'])
        verb = random.choice(self.vocabulary['verbs'])
        complement = random.choice(self.vocabulary['objects'] + self.vocabulary['places'] + self.vocabulary['times'])
        
        # Conjugar verbo para tercera persona
        if subject in ['he', 'she', 'it', 'my brother', 'my sister', 'the teacher', 'the student']:
            if verb.endswith('y'):
                conjugated_verb = verb[:-1] + 'ies'
            elif verb.endswith(('s', 'sh', 'ch', 'x', 'z', 'o')):
                conjugated_verb = verb + 'es'
            else:
                conjugated_verb = verb + 's'
        else:
            conjugated_verb = verb
        
        subject_translations = {
            'I': 'Yo', 'you': 'Tú', 'he': 'Él', 'she': 'Ella', 'it': 'Eso',
            'we': 'Nosotros', 'they': 'Ellos', 'my brother': 'Mi hermano',
            'my sister': 'Mi hermana', 'the teacher': 'El profesor',
            'the student': 'El estudiante'
        }
        subject_es = subject_translations.get(subject, subject)
        
        return {
            'id': f"gen_{datetime.now().strftime('%Y%m%d%H%M%S')}_{index}",
            'module': template.get('module', 'simple-sentences'),
            'type': template['type'],
            'instruction': template['instruction'],
            'spanish': f"{subject_es} {self._translate_verb(verb)} {self._translate_complement(complement)}",
            'correct_answer': f"{subject} {conjugated_verb} {complement}.",
            'hint': "Orden: Sujeto + Verbo + Complemento",
            'explanation': "Las oraciones afirmativas siguen el orden Sujeto-Verbo-Complemento",
            'difficulty': template['difficulty'],
            'points': template['points']
        }
    
    def _generate_generic_exercise(self, template: Dict, index: int) -> Dict:
        """Generar ejercicio genérico (fallback)"""
        return {
            'id': f"gen_{datetime.now().strftime('%Y%m%d%H%M%S')}_{index}",
            'module': template.get('module', 'basic-questions'),
            'type': template['type'],
            'instruction': template['instruction'],
            'spanish': f"Ejemplo de ejercicio {index + 1}",
            'correct_answer': f"Example exercise {index + 1}",
            'hint': "Esta es una pista de ejemplo",
            'explanation': "Explicación del ejercicio",
            'difficulty': template['difficulty'],
            'points': template['points']
        }
    
    def _translate_verb(self, verb: str) -> str:
        """Traducir verbo al español"""
        translations = {
            'work': 'trabaja', 'study': 'estudia', 'live': 'vive', 'eat': 'come',
            'drink': 'bebe', 'speak': 'habla', 'write': 'escribe', 'read': 'lee',
            'play': 'juega', 'run': 'corre', 'swim': 'nada', 'travel': 'viaja',
            'learn': 'aprende', 'teach': 'enseña', 'cook': 'cocina', 'drive': 'conduce',
            'sing': 'canta', 'dance': 'baila', 'paint': 'pinta', 'build': 'construye'
        }
        return translations.get(verb, verb)
    
    def _translate_complement(self, complement: str) -> str:
        """Traducir complemento al español"""
        translations = {
            'English': 'inglés', 'Spanish': 'español', 'French': 'francés',
            'German': 'alemán', 'Italian': 'italiano', 'coffee': 'café',
            'tea': 'té', 'water': 'agua', 'juice': 'jugo', 'milk': 'leche',
            'home': 'casa', 'school': 'escuela', 'office': 'oficina',
            'hospital': 'hospital', 'restaurant': 'restaurante', 'books': 'libros',
            'music': 'música', 'movies': 'películas', 'sports': 'deportes',
            'art': 'arte', 'the park': 'el parque', 'the cinema': 'el cine',
            'Madrid': 'Madrid', 'London': 'Londres', 'New York': 'Nueva York',
            'Paris': 'París', 'Tokyo': 'Tokio', 'Berlin': 'Berlín',
            'every day': 'todos los días', 'yesterday': 'ayer', 'tomorrow': 'mañana'
        }
        return translations.get(complement, complement)
    
    def save_exercises_to_file(self, exercises: List[Dict], filename: str = None) -> str:
        """Guardar ejercicios a archivo JSON"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"generated_exercises_{timestamp}.json"
        
        filepath = os.path.join('data', 'exercises_backup', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(exercises, f, ensure_ascii=False, indent=2)
        
        return filepath
    
    def load_exercises_from_file(self, filepath: str) -> List[Dict]:
        """Cargar ejercicios desde archivo JSON"""
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def merge_exercises(self, current: List[Dict], new: List[Dict], replace: bool = False) -> List[Dict]:
        """Mezclar ejercicios existentes con nuevos"""
        if replace:
            return new
        
        existing_ids = {ex['id'] for ex in current}
        unique_new = [ex for ex in new if ex['id'] not in existing_ids]
        
        return current + unique_new


# Métodos adicionales para generar otros tipos de ejercicios
def _generate_did_question(self, template: Dict, index: int) -> Dict:
    """Generar pregunta con Did"""
    subject = random.choice(self.vocabulary['subjects'])
    verb = random.choice(self.vocabulary['verbs'])
    complement = random.choice(self.vocabulary['places'] + self.vocabulary['times'])
    
    subject_translations = {
        'I': 'Yo', 'you': 'Tú', 'he': 'Él', 'she': 'Ella', 'we': 'Nosotros', 'they': 'Ellos'
    }
    subject_es = subject_translations.get(subject, subject)
    
    return {
        'id': f"gen_{datetime.now().strftime('%Y%m%d%H%M%S')}_{index}",
        'module': template.get('module', 'basic-questions'),
        'type': template['type'],
        'instruction': template['instruction'],
        'spanish': f"{subject_es} {self._translate_verb_past(verb)} {self._translate_complement(complement)}",
        'correct_answer': f"Did {subject} {verb} {complement}?",
        'hint': "Did + sujeto + verbo en forma base",
        'explanation': "En pasado simple usamos 'did' + verbo en infinitivo",
        'difficulty': template['difficulty'],
        'points': template['points']
    }

def _translate_verb_past(self, verb: str) -> str:
    """Traducir verbo en pasado al español"""
    translations = {
        'work': 'trabajó', 'study': 'estudió', 'live': 'vivió', 'eat': 'comió',
        'drink': 'bebió', 'speak': 'habló', 'write': 'escribió', 'read': 'leyó',
        'play': 'jugó', 'run': 'corrió', 'swim': 'nadó', 'travel': 'viajó'
    }
    return translations.get(verb, verb + 'ó')

# Asignar métodos adicionales a la clase
ExerciseGenerator._generate_did_question = _generate_did_question
ExerciseGenerator._translate_verb_past = _translate_verb_past


# Funciones para uso directo
def generate_quick_exercises(count: int = 10, module: str = None) -> List[Dict]:
    """Función rápida para generar ejercicios"""
    generator = ExerciseGenerator()
    return generator.generate_exercises(count, module)


if __name__ == "__main__":
    # Ejemplo de uso
    generator = ExerciseGenerator()
    
    print("🎯 Generador de Ejercicios en Inglés")
    print("=" * 40)
    
    # Generar 10 ejercicios de muestra
    exercises = generator.generate_exercises(10, 'basic-questions')
    
    print(f"\n✅ Generados {len(exercises)} ejercicios:")
    for i, ex in enumerate(exercises[:3], 1):
        print(f"\n📝 Ejercicio {i}:")
        print(f"   Tipo: {ex['type']}")
        print(f"   Español: {ex['spanish']}")
        print(f"   Respuesta: {ex['correct_answer']}")
        print(f"   Dificultad: {ex['difficulty']}")
    
    # Guardar ejercicios
    filename = generator.save_exercises_to_file(exercises)
    print(f"\n💾 Ejercicios guardados en: {filename}")
