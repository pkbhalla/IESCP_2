from datetime import timedelta


class Config:
    SECRET_KEY = "JAI_SHRI_RAM_JAI_SHRI_KRISHNA"
    SQLALCHEMY_DATABASE_URI = "sqlite:///iescp.sqlite3"  
    SQLALCHEMY_TRACK_MODIFICATIONS = False  
    JWT_ACCESS_TOKEN_EXPIRES= timedelta(hours=2)
    JWT_SECRET_KEY = "JAI_SHRI_RAM_JAI_SHRI_KRISHNA"  
    DEBUG = True  
    CELERY_BROKER_URL = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/1"
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_DEFAULT_TIMEOUT = 300