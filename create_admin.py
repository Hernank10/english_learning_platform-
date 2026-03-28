#!/usr/bin/env python3
"""Script para crear usuario administrador en English Learning Hub"""

import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import User
from werkzeug.security import generate_password_hash

def create_admin():
    """Crear usuario administrador"""
    with app.app_context():
        # Verificar si ya existe un administrador
        existing_admin = User.query.filter_by(role='admin').first()
        
        if existing_admin:
            print(f"⚠️  Ya existe un administrador: {existing_admin.username}")
            print("¿Deseas crear otro administrador? (s/n): ", end='')
            respuesta = input().lower()
            if respuesta != 's':
                print("❌ Operación cancelada")
                return
        
        # Solicitar datos del administrador
        print("\n" + "="*50)
        print("   CREAR USUARIO ADMINISTRADOR")
        print("="*50)
        
        username = input("📝 Nombre de usuario (admin): ").strip() or "admin"
        email = input("📧 Correo electrónico (admin@englishhub.com): ").strip() or "admin@englishhub.com"
        password = input("🔒 Contraseña (admin123): ").strip() or "admin123"
        
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"❌ El usuario '{username}' ya existe")
            return
        
        # Crear nuevo administrador
        admin = User(
            username=username,
            email=email,
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
        admin.set_password(password)
        
        try:
            db.session.add(admin)
            db.session.commit()
            print("\n" + "="*50)
            print("   ✅ ADMINISTRADOR CREADO EXITOSAMENTE")
            print("="*50)
            print(f"👤 Usuario: {username}")
            print(f"📧 Email: {email}")
            print(f"🔑 Contraseña: {password}")
            print(f"👑 Rol: Administrador")
            print("="*50)
            print("\n🔐 Puedes iniciar sesión en: http://localhost:5000/login")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error al crear administrador: {e}")

def create_demo_users():
    """Crear usuarios de demostración (opcional)"""
    demo_users = [
        {'username': 'usuario', 'email': 'usuario@example.com', 'password': 'usuario123', 'role': 'user'},
        {'username': 'maria', 'email': 'maria@example.com', 'password': 'maria123', 'role': 'user'},
        {'username': 'juan', 'email': 'juan@example.com', 'password': 'juan123', 'role': 'user'},
    ]
    
    print("\n" + "="*50)
    print("   CREAR USUARIOS DE DEMOSTRACIÓN")
    print("="*50)
    print("¿Deseas crear usuarios de demostración? (s/n): ", end='')
    respuesta = input().lower()
    
    if respuesta == 's':
        for user_data in demo_users:
            existing = User.query.filter_by(username=user_data['username']).first()
            if not existing:
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    role=user_data['role'],
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
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"✅ Usuario {user_data['username']} creado")
        
        db.session.commit()
        print("\n✅ Usuarios de demostración creados exitosamente")

if __name__ == "__main__":
    print("\n🌟 ENGLISH LEARNING HUB - CREACIÓN DE USUARIOS 🌟")
    create_admin()
    create_demo_users()
    print("\n🎉 Proceso completado. ¡Disfruta tu plataforma!")
