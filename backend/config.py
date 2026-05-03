import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'assessly-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'assessly-jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Sandbox defaults
    SANDBOX_TIME_LIMIT = int(os.environ.get('SANDBOX_TIME_LIMIT', 10))
    SANDBOX_MEMORY_LIMIT = int(os.environ.get('SANDBOX_MEMORY_LIMIT', 256))
    SANDBOX_CPU_LIMIT = float(os.environ.get('SANDBOX_CPU_LIMIT', 0.5))
    SANDBOX_ALLOWED_LANGUAGES = ['python', 'java', 'c']

    # Moodle
    MOODLE_API_URL = os.environ.get('MOODLE_API_URL', '')
    MOODLE_TOKEN = os.environ.get('MOODLE_TOKEN', '')


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(basedir, "assessly.db")}'
    )


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'TEST_DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/assessly_test'
    )


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
