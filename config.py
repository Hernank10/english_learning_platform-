"""Archivo de configuración para English Learning Hub"""

import os
from datetime import timedelta

class Config:
    """Configuración base de la aplicación"""
    
    # Configuración básica
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production-2024'
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    TESTING = os.environ.get('TESTING', 'False').lower() == 'true'
    
    # Base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///english_learning.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('SQL_ECHO', 'False').lower() == 'true'
    
    # Sesión
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Archivos
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'uploads')
    BACKUP_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'exercises_backup')
    TEMP_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'temp')
    
    # Configuración de ejercicios
    DEFAULT_EXERCISES_COUNT = 100
    MAX_EXERCISES_PER_GENERATION = 500
    EXERCISES_POINTS_RANGE = (5, 50)
    
    # Configuración de flashcards
    DEFAULT_FLASHCARDS_COUNT = 50
    MAX_FLASHCARDS_PER_GENERATION = 200
    
    # Configuración de exámenes
    EXAM_TIME_LIMIT = 30 * 60  # 30 minutos en segundos
    EXAM_WARNING_TIME = 5 * 60  # 5 minutos de advertencia
    EXAM_PASSING_SCORE = 70  # Porcentaje para aprobar
    
    # Sistema de niveles
    LEVELS = {
        1: {'name': 'Principiante', 'points_needed': 0, 'badge': '🌱'},
        2: {'name': 'Aprendiz', 'points_needed': 100, 'badge': '📚'},
        3: {'name': 'Estudiante', 'points_needed': 250, 'badge': '✏️'},
        4: {'name': 'Intermedio', 'points_needed': 500, 'badge': '🌟'},
        5: {'name': 'Avanzado', 'points_needed': 1000, 'badge': '⭐'},
        6: {'name': 'Experto', 'points_needed': 2000, 'badge': '🏆'},
        7: {'name': 'Maestro', 'points_needed': 3500, 'badge': '👑'},
        8: {'name': 'Genio', 'points_needed': 5000, 'badge': '🧠'},
        9: {'name': 'Leyenda', 'points_needed': 7500, 'badge': '🔥'},
        10: {'name': 'Mítico', 'points_needed': 10000, 'badge': '⚡'}
    }
    
    # Sistema de logros
    ACHIEVEMENTS = {
        'first_steps': {
            'name': 'Primeros Pasos',
            'description': 'Completa 10 ejercicios',
            'icon': 'trophy',
            'points': 50,
            'condition': lambda stats: stats.get('total_exercises', 0) >= 10
        },
        'dedicated': {
            'name': 'Dedicado',
            'description': 'Completa 50 ejercicios',
            'icon': 'star',
            'points': 100,
            'condition': lambda stats: stats.get('total_exercises', 0) >= 50
        },
        'master': {
            'name': 'Maestro',
            'description': 'Completa 100 ejercicios',
            'icon': 'award',
            'points': 200,
            'condition': lambda stats: stats.get('total_exercises', 0) >= 100
        },
        'streak_7': {
            'name': 'Racha de 7 días',
            'description': 'Practica 7 días consecutivos',
            'icon': 'fire',
            'points': 50,
            'condition': lambda stats: stats.get('max_streak', 0) >= 7
        },
        'streak_30': {
            'name': 'Racha de 30 días',
            'description': 'Practica 30 días consecutivos',
            'icon': 'flame',
            'points': 200,
            'condition': lambda stats: stats.get('max_streak', 0) >= 30
        },
        'score_1000': {
            'name': '1000 Puntos',
            'description': 'Alcanza 1000 puntos',
            'icon': 'star-fill',
            'points': 100,
            'condition': lambda stats: stats.get('total_score', 0) >= 1000
        },
        'flashcard_master': {
            'name': 'Maestro de Flashcards',
            'description': 'Domina 50 flashcards',
            'icon': 'card-list',
            'points': 100,
            'condition': lambda stats: stats.get('mastered_flashcards', 0) >= 50
        },
        'grammar_guru': {
            'name': 'Gurú de Gramática',
            'description': 'Completa todos los ejercicios de gramática',
            'icon': 'book',
            'points': 200,
            'condition': lambda stats: stats.get('grammar_completed', 0) >= 100
        }
    }
    
    # Medallas por nivel de examen
    EXAM_MEDALS = {
        'gold': {'name': '🥇 Oro', 'min_score': 90, 'stars': 5},
        'silver': {'name': '🥈 Plata', 'min_score': 70, 'stars': 3},
        'bronze': {'name': '🥉 Bronce', 'min_score': 50, 'stars': 1}
    }
    
    # Configuración de caché
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Configuración de email (para recuperación de contraseña)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@englishhub.com')
    
    # Configuración de paginación
    ITEMS_PER_PAGE = 15
    ADMIN_ITEMS_PER_PAGE = 20
    
    # Configuración de backup
    BACKUP_RETENTION_DAYS = 30
    AUTO_BACKUP_ENABLED = True
    AUTO_BACKUP_FREQUENCY = 'daily'  # daily, weekly, monthly
    AUTO_BACKUP_TIME = '03:00'  # Hora UTC
    
    # Configuración de API
    API_RATE_LIMIT = 100  # requests por minuto
    API_VERSION = 'v1'
    
    # Configuración de seguridad
    BCRYPT_ROUNDS = 12
    PASSWORD_MIN_LENGTH = 6
    USERNAME_MIN_LENGTH = 3
    USERNAME_MAX_LENGTH = 20
    
    # Configuración de generación de ejercicios
    EXERCISE_GENERATION = {
        'max_attempts': 3,
        'default_points': 10,
        'bonus_streak': 2,
        'hint_penalty': 2
    }
    
    # Configuración de práctica
    PRACTICE_CONFIG = {
        'auto_save_interval': 15,  # segundos
        'max_hints_per_exercise': 3,
        'streak_bonus_multiplier': 1.5
    }
    
    # Configuración de estudio rápido
    QUICK_STUDY = {
        'cards_count': 10,
        'time_limit': 300,  # segundos
        'min_success_rate': 70  # porcentaje
    }
    
    @staticmethod
    def init_app(app):
        """Inicializar la aplicación con la configuración"""
        # Crear carpetas necesarias
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.BACKUP_FOLDER, exist_ok=True)
        os.makedirs(Config.TEMP_FOLDER, exist_ok=True)
        
        # Configurar logging
        if app.debug:
            import logging
            logging.basicConfig(level=logging.DEBUG)


class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    """Configuración para pruebas"""
    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SESSION_COOKIE_SECURE = True
    
    # En producción, usar base de datos como PostgreSQL
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')


# Diccionario de configuraciones disponibles
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Obtener la configuración según el entorno"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, DevelopmentConfig)


# Funciones de utilidad para configuración
def get_level_info(level: int) -> dict:
    """Obtener información de un nivel"""
    levels = sorted(Config.LEVELS.items())
    
    for lvl, info in levels:
        if level <= lvl:
            return info
    
    return levels[-1][1]


def get_next_level_info(current_level: int) -> dict:
    """Obtener información del siguiente nivel"""
    levels = sorted(Config.LEVELS.items())
    
    for lvl, info in levels:
        if lvl > current_level:
            return {'level': lvl, **info}
    
    return None


def get_level_by_points(points: int) -> int:
    """Obtener nivel según puntos"""
    levels = sorted(Config.LEVELS.items())
    current_level = 1
    
    for lvl, info in levels:
        if points >= info['points_needed']:
            current_level = lvl
    
    return current_level


def get_achievement_info(achievement_id: str) -> dict:
    """Obtener información de un logro"""
    return Config.ACHIEVEMENTS.get(achievement_id, {})


def get_exam_medal(percentage: float) -> dict:
    """Obtener medalla según porcentaje del examen"""
    for medal, info in Config.EXAM_MEDALS.items():
        if percentage >= info['min_score']:
            return {'id': medal, **info}
    
    return None


# Ejecutar configuración si se llama directamente
if __name__ == "__main__":
    print("📋 Configuración de English Learning Hub")
    print("=" * 40)
    
    cfg = get_config()
    print(f"🔧 Entorno: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"🗄️ Base de datos: {cfg.SQLALCHEMY_DATABASE_URI}")
    print(f"📁 Carpeta de uploads: {cfg.UPLOAD_FOLDER}")
    print(f"💾 Carpeta de backups: {cfg.BACKUP_FOLDER}")
    print(f"🎯 Niveles disponibles: {len(cfg.LEVELS)}")
    print(f"🏆 Logros disponibles: {len(cfg.ACHIEVEMENTS)}")
    
    print("\n✨ Configuración cargada correctamente")
