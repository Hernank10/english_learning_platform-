#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""English Learning Hub - Punto de entrada principal

Este script inicia la aplicación web de English Learning Hub.
Ejecuta: python run.py
"""

import os
import sys
import argparse
from datetime import datetime

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importar la aplicación
from app import app, db
from models import User
from config import get_config, DevelopmentConfig, ProductionConfig


def print_banner():
    """Imprimir banner de inicio"""
    banner = """
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🌟   ENGLISH LEARNING HUB - PLATAFORMA DE INGLÉS   🌟         ║
║                                                                   ║
║              ¡Bienvenido a tu plataforma de aprendizaje!          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    """
    print(banner)


def print_info(config):
    """Imprimir información de configuración"""
    print("\n📋 CONFIGURACIÓN:")
    print(f"   🔧 Entorno: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"   🗄️  Base de datos: {config.SQLALCHEMY_DATABASE_URI}")
    print(f"   🐍 Python: {sys.version.split()[0]}")
    print(f"   📁 Directorio: {os.getcwd()}")


def print_endpoints():
    """Imprimir endpoints disponibles"""
    print("\n🌐 ENDPOINTS PRINCIPALES:")
    print("   🏠 Inicio: http://localhost:5000/")
    print("   📊 Dashboard: http://localhost:5000/dashboard")
    print("   🎯 Práctica: http://localhost:5000/practice/basic-questions")
    print("   🃏 Flashcards: http://localhost:5000/flashcards")
    print("   📝 Exámenes: http://localhost:5000/exam/basico")
    print("   🏆 Ranking: http://localhost:5000/leaderboard")
    print("   👤 Perfil: http://localhost:5000/profile")
    print("   🔐 Login: http://localhost:5000/login")
    print("   📝 Registro: http://localhost:5000/register")
    print("   👑 Admin: http://localhost:5000/admin")


def print_credentials():
    """Imprimir credenciales por defecto"""
    print("\n🔑 CREDENCIALES POR DEFECTO:")
    print("   👑 Administrador: admin / admin123")
    print("   👤 Usuario demo: usuario / usuario123")
    print("\n💡 Puedes crear más usuarios en: http://localhost:5000/register")


def create_admin_if_not_exists():
    """Crear usuario administrador si no existe"""
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
            print("✅ Administrador creado: admin / admin123")
        else:
            print("✅ Administrador ya existe")


def create_demo_user_if_not_exists():
    """Crear usuario demo si no existe"""
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
            print("✅ Usuario demo creado: usuario / usuario123")
        else:
            print("✅ Usuario demo ya existe")


def init_database():
    """Inicializar la base de datos"""
    with app.app_context():
        print("\n🗄️  INICIALIZANDO BASE DE DATOS...")
        db.create_all()
        print("✅ Tablas creadas correctamente")
        
        create_admin_if_not_exists()
        create_demo_user_if_not_exists()


def check_data_files():
    """Verificar archivos de datos"""
    print("\n📁 VERIFICANDO ARCHIVOS DE DATOS...")
    
    exercises_path = 'data/exercises.json'
    flashcards_path = 'data/flashcards.json'
    
    if os.path.exists(exercises_path):
        import json
        try:
            with open(exercises_path, 'r', encoding='utf-8') as f:
                exercises = json.load(f)
            print(f"✅ Ejercicios: {len(exercises)} ejercicios cargados")
        except:
            print("⚠️  Error al leer ejercicios.json")
    else:
        print("⚠️  No se encontró exercises.json")
    
    if os.path.exists(flashcards_path):
        import json
        try:
            with open(flashcards_path, 'r', encoding='utf-8') as f:
                flashcards = json.load(f)
            print(f"✅ Flashcards: {len(flashcards)} flashcards cargadas")
        except:
            print("⚠️  Error al leer flashcards.json")
    else:
        print("⚠️  No se encontró flashcards.json")


def find_available_port(start_port=5000, max_port=5010):
    """Encontrar un puerto disponible"""
    import socket
    
    for port in range(start_port, max_port + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except socket.error:
                continue
    return None


def main():
    """Función principal"""
    # Configurar argumentos de línea de comandos
    parser = argparse.ArgumentParser(
        description='English Learning Hub - Plataforma de Aprendizaje de Inglés',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python run.py                    # Iniciar en modo desarrollo
  python run.py --host 0.0.0.0    # Permitir conexiones externas
  python run.py --port 8080        # Usar puerto 8080
  python run.py --init-db          # Solo inicializar base de datos
  python run.py --prod             # Modo producción
        """
    )
    
    parser.add_argument('--host', default='127.0.0.1', help='Host para el servidor (default: 127.0.0.1)')
    parser.add_argument('--port', type=int, default=None, help='Puerto para el servidor (default: auto)')
    parser.add_argument('--debug', action='store_true', default=True, help='Modo debug (default: True)')
    parser.add_argument('--prod', action='store_true', help='Modo producción')
    parser.add_argument('--init-db', action='store_true', help='Solo inicializar base de datos')
    parser.add_argument('--check', action='store_true', help='Verificar configuración')
    
    args = parser.parse_args()
    
    # Mostrar banner
    print_banner()
    
    # Configurar entorno
    if args.prod:
        os.environ['FLASK_ENV'] = 'production'
        app.config.from_object('config.ProductionConfig')
        debug = False
    else:
        os.environ['FLASK_ENV'] = 'development'
        app.config.from_object('config.DevelopmentConfig')
        debug = args.debug
    
    # Solo inicializar base de datos
    if args.init_db:
        print("📦 INICIALIZACIÓN DE BASE DE DATOS")
        print("=" * 50)
        init_database()
        print("\n✅ Base de datos inicializada correctamente")
        return
    
    # Solo verificar configuración
    if args.check:
        print("🔍 VERIFICACIÓN DE CONFIGURACIÓN")
        print("=" * 50)
        config = get_config()
        print_info(config)
        check_data_files()
        print("\n✅ Configuración verificada")
        return
    
    # Inicializar base de datos
    init_database()
    
    # Verificar archivos de datos
    check_data_files()
    
    # Mostrar información
    config = get_config()
    print_info(config)
    print_credentials()
    print_endpoints()
    
    # Encontrar puerto disponible
    port = args.port
    if port is None:
        port = find_available_port()
        if port is None:
            print("\n❌ No se encontró un puerto disponible")
            return
    
    print(f"\n🚀 INICIANDO SERVIDOR...")
    print(f"   🌐 URL: http://{args.host}:{port}")
    print(f"   🔧 Modo: {'Producción' if args.prod else 'Desarrollo'}")
    print(f"   🖥️  Puerto: {port}")
    
    print("\n" + "=" * 60)
    print("   ¡La aplicación está lista! Presiona Ctrl+C para detener")
    print("=" * 60 + "\n")
    
    # Iniciar la aplicación
    try:
        app.run(
            host=args.host,
            port=port,
            debug=debug,
            use_reloader=debug
        )
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido correctamente")
        print("👋 ¡Gracias por usar English Learning Hub!\n")
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
