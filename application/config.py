class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///trek.db"

    #config for security
    SECRET_KEY = "PANDEY" #require for session cookies
    SECURITY_PASSWORD_HASH = "bcrypt" #encryption algorithm
    SECURITY_PASSWORD_SALT = "NAMAK" #use along with the algorithm

    WTF_CSRF_ENABLED = False
    SECURITY_CSRF_PROTECT_MECHANISMS = []
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"

    # configuration for MailHog
    SMTP_SERVER_HOST = "localhost"
    SMTP_SERVER_PORT = 1025
    SENDER_ADDRESS = "noreply@trekking.com"
    SENDER_PASSWORD = ""

