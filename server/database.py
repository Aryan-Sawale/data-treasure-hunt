import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL from environment (PostgreSQL for Render/Koyeb/Neon)
# Fallback to local SQLite for zero-setup development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vault.db")

# Render and older platforms sometimes provide 'postgres://', which SQLAlchemy 1.4+ expects as 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
