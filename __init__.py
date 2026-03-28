# -*- coding: utf-8 -*-
"""English Learning Hub - Plataforma de Aprendizaje de Inglés

Este paquete contiene la aplicación web completa para el aprendizaje de inglés,
diseñada específicamente para hispanohablantes.
"""

__version__ = '1.0.0'
__author__ = 'English Learning Hub Team'
__license__ = 'MIT'
__copyright__ = 'Copyright 2024 English Learning Hub'

# Importar módulos principales para facilitar el acceso
from .app import app, db
from .models import User, UserProgress, UserAchievement, UserFlashcardProgress, ExamResult
from .exercise_generator import ExerciseGenerator

# Definir qué se exporta cuando se usa "from english_learning_platform import *"
__all__ = [
    'app',
    'db',
    'User',
    'UserProgress',
    'UserAchievement',
    'UserFlashcardProgress',
    'ExamResult',
    'ExerciseGenerator'
]

# Información del paquete
def get_info():
    """Obtener información del paquete"""
    return {
        'name': 'English Learning Hub',
        'version': __version__,
        'author': __author__,
        'description': 'Plataforma de aprendizaje de inglés para hispanohablantes',
        'url': 'https://github.com/yourusername/english_learning_platform'
    }
