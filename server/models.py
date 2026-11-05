from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(32), primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_active = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Player(Base):
    __tablename__ = "players"

    id = Column(String(64), primary_key=True, index=True)
    room_id = Column(String(32), default="DEFAULT", index=True)
    name = Column(String(100), nullable=False)
    total_score = Column(Integer, default=0, index=True)
    current_stage = Column(Integer, default=1)
    is_vault_cracked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_active = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    completions = relationship("Completion", back_populates="player", cascade="all, delete-orphan")

class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String(32), default="DEFAULT", index=True)
    player_id = Column(String(64), ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_key = Column(String(50), nullable=False, index=True)
    rank_order = Column(Integer, nullable=False)
    points_awarded = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="completions")

    __table_args__ = (
        UniqueConstraint('player_id', 'milestone_key', name='_player_milestone_uc'),
    )

class RoomChallengeTimer(Base):
    __tablename__ = "room_challenge_timers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String(32), nullable=False, index=True)
    challenge_id = Column(String(50), nullable=False, index=True)
    first_solved_by_id = Column(String(64), nullable=False)
    first_solved_by_name = Column(String(100), nullable=False)
    first_solved_at = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint('room_id', 'challenge_id', name='_room_challenge_timer_uc'),
    )
