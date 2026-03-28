from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import os
from functools import wraps

# Crear la aplicación Flask
app = Flask(__name__)

# Configuración
app.config['SECRET_KEY'] = 'tu-clave-secreta-cambiar-en-produccion'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///english_learning.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar extensiones
db = SQLAlchemy(app)  # IMPORTANTE: pasar app aquí
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Modelo de Usuario (definido aquí temporalmente para evitar circular imports)
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bio = db.Column(db.Text, default='')
    avatar = db.Column(db.String(200), default='')
    
    total_score = db.Column(db.Integer, default=0)
    total_exercises = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    max_streak = db.Column(db.Integer, default=0)
    study_time = db.Column(db.Integer, default=0)
    
    stars = db.Column(db.Integer, default=0)
    medals = db.Column(db.Text, default='[]')
    level = db.Column(db.Integer, default=1)
    level_progress = db.Column(db.Integer, default=0)
    
    settings = db.Column(db.Text, default='{}')
    is_active = db.Column(db.Boolean, default=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Decorador para admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            flash('Acceso no autorizado', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# Rutas principales
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            user.last_login = datetime.utcnow()
            db.session.commit()
            flash('¡Bienvenido de vuelta!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Usuario o contraseña incorrectos', 'danger')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('El nombre de usuario ya existe', 'danger')
        elif User.query.filter_by(email=email).first():
            flash('El email ya está registrado', 'danger')
        else:
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            flash('¡Registro exitoso! Bienvenido a English Learning Hub', 'success')
            return redirect(url_for('dashboard'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Has cerrado sesión', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@app.route('/practice/<module>')
@login_required
def practice(module):
    return render_template('practice.html', module=module)

@app.route('/flashcards')
@login_required
def flashcards():
    return render_template('flashcards.html')

@app.route('/exam/<level>')
@login_required
def exam(level):
    return render_template('exam.html', level=level)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@app.route('/leaderboard')
@login_required
def leaderboard():
    return render_template('leaderboard.html')

# Rutas de administración
@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    return render_template('admin/dashboard.html')

@app.route('/admin/exercises')
@login_required
@admin_required
def admin_exercises():
    return render_template('admin/exercises.html')

@app.route('/admin/flashcards')
@login_required
@admin_required
def admin_flashcards():
    return render_template('admin/flashcards.html')

@app.route('/admin/generator')
@login_required
@admin_required
def admin_generator():
    return render_template('admin/generator.html')

@app.route('/admin/users')
@login_required
@admin_required
def admin_users():
    return render_template('admin/users.html')

@app.route('/admin/backups')
@login_required
@admin_required
def admin_backups():
    return render_template('admin/backups.html')

@app.route('/admin/exercises/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_exercise():
    return render_template('admin/add_exercise.html')

@app.route('/admin/exercises/edit/<exercise_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_exercise(exercise_id):
    return render_template('admin/edit_exercise.html', exercise_id=exercise_id)

@app.route('/admin/flashcards/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_flashcard():
    return render_template('admin/add_flashcard.html')

@app.route('/admin/flashcards/edit/<flashcard_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_flashcard(flashcard_id):
    return render_template('admin/edit_flashcard.html', flashcard_id=flashcard_id)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Crear usuario admin si no existe
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@englishhub.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('✅ Administrador creado: admin / admin123')
        
        # Crear usuario demo
        if not User.query.filter_by(username='usuario').first():
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
    
    app.run(debug=True)
