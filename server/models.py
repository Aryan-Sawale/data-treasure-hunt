from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    total_score = Column(Integer, default=0, index=True)
    current_stage = Column(Integer, default=1)
    is_vault_cracked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    completions = relationship("Completion", back_populates="player", cascade="all, delete-orphan")

class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(String(64), ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_key = Column(String(50), nullable=False, index=True)
    rank_order = Column(Integer, nullable=False)
    points_awarded = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="completions")

    __table_args__ = (
        UniqueConstraint('player_id', 'milestone_key', name='_player_milestone_uc'),
    )
