"""Modelos de base de datos para English Learning Hub"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import json

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """Modelo de Usuario"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Datos personales
    bio = db.Column(db.Text, default='')
    avatar = db.Column(db.String(200), default='')
    
    # Estadísticas de aprendizaje
    total_score = db.Column(db.Integer, default=0)
    total_exercises = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    max_streak = db.Column(db.Integer, default=0)
    study_time = db.Column(db.Integer, default=0)  # minutos
    
    # Sistema de recompensas
    stars = db.Column(db.Integer, default=0)
    medals = db.Column(db.Text, default='[]')  # JSON array
    level = db.Column(db.Integer, default=1)
    level_progress = db.Column(db.Integer, default=0)
    
    # Configuración
    settings = db.Column(db.Text, default='{}')  # JSON object
    is_active = db.Column(db.Boolean, default=True)
    
    # Relaciones
    progress = db.relationship('UserProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    achievements = db.relationship('UserAchievement', backref='user', lazy=True, cascade='all, delete-orphan')
    flashcards_progress = db.relationship('UserFlashcardProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    exam_results = db.relationship('ExamResult', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Establecer contraseña hasheada"""
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        """Verificar contraseña"""
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)
    
    def get_medals(self):
        """Obtener lista de medallas"""
        return json.loads(self.medals) if self.medals else []
    
    def add_medal(self, medal):
        """Agregar una medalla"""
        medals = self.get_medals()
        if medal not in medals:
            medals.append(medal)
            self.medals = json.dumps(medals)
            return True
        return False
    
    def get_settings(self):
        """Obtener configuración del usuario"""
        return json.loads(self.settings) if self.settings else {}
    
    def update_settings(self, new_settings):
        """Actualizar configuración"""
        settings = self.get_settings()
        settings.update(new_settings)
        self.settings = json.dumps(settings)
    
    def add_points(self, points):
        """Agregar puntos y actualizar nivel"""
        self.total_score += points
        self.level_progress += points
        
        # Subir de nivel
        while self.level_progress >= 100:
            self.level += 1
            self.level_progress -= 100
            # Bonus de estrellas al subir de nivel
            self.stars += 5
            
        return self.level
    
    def calculate_accuracy(self):
        """Calcular precisión del usuario"""
        if self.total_exercises > 0:
            return round((self.correct_answers / self.total_exercises) * 100, 1)
        return 0
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'bio': self.bio,
            'avatar': self.avatar,
            'total_score': self.total_score,
            'total_exercises': self.total_exercises,
            'correct_answers': self.correct_answers,
            'accuracy': self.calculate_accuracy(),
            'streak': self.streak,
            'max_streak': self.max_streak,
            'study_time': self.study_time,
            'stars': self.stars,
            'medals': self.get_medals(),
            'level': self.level,
            'level_progress': self.level_progress,
            'is_active': self.is_active
        }

class UserProgress(db.Model):
    """Progreso del usuario en ejercicios"""
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exercise_id = db.Column(db.String(50), nullable=False)
    module = db.Column(db.String(50))
    completed = db.Column(db.Boolean, default=False)
    score = db.Column(db.Integer, default=0)
    attempts = db.Column(db.Integer, default=0)
    last_attempt = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def complete(self, points):
        """Marcar ejercicio como completado"""
        if not self.completed:
            self.completed = True
            self.score = points
            self.completed_at = datetime.utcnow()
            return True
        return False
    
    def add_attempt(self):
        """Registrar intento"""
        self.attempts += 1
        self.last_attempt = datetime.utcnow()

class UserAchievement(db.Model):
    """Logros desbloqueados por el usuario"""
    __tablename__ = 'user_achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.String(50), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con achievement (simulada, sin tabla de achievements)
    def get_achievement_info(self):
        """Obtener información del logro"""
        achievements_info = {
            'first_steps': {'name': 'Primeros Pasos', 'icon': 'trophy', 'description': 'Completa 10 ejercicios', 'points': 50},
            'dedicated': {'name': 'Dedicado', 'icon': 'star', 'description': 'Completa 50 ejercicios', 'points': 100},
            'master': {'name': 'Maestro', 'icon': 'award', 'description': 'Completa 100 ejercicios', 'points': 200},
            'legend': {'name': 'Leyenda', 'icon': 'crown', 'description': 'Completa 500 ejercicios', 'points': 500},
            'streak_7': {'name': 'Racha de 7 días', 'icon': 'fire', 'description': 'Practica 7 días consecutivos', 'points': 50},
            'streak_30': {'name': 'Racha de 30 días', 'icon': 'flame', 'description': 'Practica 30 días consecutivos', 'points': 200},
            'score_1000': {'name': '1000 Puntos', 'icon': 'star-fill', 'description': 'Alcanza 1000 puntos', 'points': 100},
            'perfect_score': {'name': 'Puntuación Perfecta', 'icon': 'check-circle', 'description': 'Obtén 100% en un examen', 'points': 150},
            'flashcard_master': {'name': 'Maestro de Flashcards', 'icon': 'card-list', 'description': 'Domina 50 flashcards', 'points': 100},
            'grammar_guru': {'name': 'Gurú de Gramática', 'icon': 'book', 'description': 'Completa todos los ejercicios de gramática', 'points': 200}
        }
        return achievements_info.get(self.achievement_id, {'name': self.achievement_id, 'icon': 'medal', 'description': '', 'points': 0})

class UserFlashcardProgress(db.Model):
    """Progreso del usuario en flashcards"""
    __tablename__ = 'user_flashcard_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flashcard_id = db.Column(db.String(50), nullable=False)
    mastered = db.Column(db.Boolean, default=False)
    times_studied = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    incorrect_count = db.Column(db.Integer, default=0)
    last_reviewed = db.Column(db.DateTime)
    next_review = db.Column(db.DateTime)
    
    def study(self, correct):
        """Registrar estudio de flashcard"""
        self.times_studied += 1
        self.last_reviewed = datetime.utcnow()
        
        if correct:
            self.correct_count += 1
            # Algoritmo de repaso espaciado simple
            if self.correct_count >= 3:
                self.mastered = True
        else:
            self.incorrect_count += 1
            self.mastered = False
    
    def get_success_rate(self):
        """Obtener tasa de éxito"""
        total = self.correct_count + self.incorrect_count
        if total > 0:
            return round((self.correct_count / total) * 100, 1)
        return 0

class ExamResult(db.Model):
    """Resultados de exámenes"""
    __tablename__ = 'exam_results'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    level = db.Column(db.String(20), nullable=False)
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float, default=0)
    stars_earned = db.Column(db.Integer, default=0)
    medal = db.Column(db.String(20))
    answers = db.Column(db.Text, default='{}')  # JSON con respuestas
    time_spent = db.Column(db.Integer, default=0)  # segundos
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_answers(self):
        """Obtener respuestas del examen"""
        return json.loads(self.answers) if self.answers else {}
    
    def save_answers(self, answers_dict):
        """Guardar respuestas"""
        self.answers = json.dumps(answers_dict)

class SystemSettings(db.Model):
    """Configuración del sistema"""
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.Text, default='')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @classmethod
    def get(cls, key, default=None):
        """Obtener valor de configuración"""
        setting = cls.query.filter_by(key=key).first()
        if setting:
            return setting.value
        return default
    
    @classmethod
    def set(cls, key, value):
        """Establecer valor de configuración"""
        setting = cls.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = cls(key=key, value=value)
            db.session.add(setting)
        db.session.commit()

class BackupLog(db.Model):
    """Registro de respaldos"""
    __tablename__ = 'backup_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(20), default='full')  # full, exercises, flashcards, users
    size = db.Column(db.Integer, default=0)  # bytes
    records = db.Column(db.Integer, default=0)
    created_by = db.Column(db.String(80))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='success')
    error_message = db.Column(db.Text, default='')
    
    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'filename': self.filename,
            'type': self.type,
            'size': self.format_size(),
            'records': self.records,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'status': self.status
        }
    
    def format_size(self):
        """Formatear tamaño de archivo"""
        if self.size < 1024:
            return f"{self.size} B"
        elif self.size < 1024 * 1024:
            return f"{self.size / 1024:.1f} KB"
        else:
            return f"{self.size / (1024 * 1024):.1f} MB"
