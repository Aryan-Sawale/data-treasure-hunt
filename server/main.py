import os
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

try:
    from .database import engine, Base, get_db
    from .models import Player, Completion
    from .schemas import (
        PlayerJoinRequest,
        PlayerResponse,
        MilestoneCompleteRequest,
        MilestoneCompleteResponse,
        LeaderboardItem,
        LeaderboardResponse,
        ResetResponse
    )
    from .scoring import calculate_points_for_rank
except ImportError:
    from database import engine, Base, get_db
    from models import Player, Completion
    from schemas import (
        PlayerJoinRequest,
        PlayerResponse,
        MilestoneCompleteRequest,
        MilestoneCompleteResponse,
        LeaderboardItem,
        LeaderboardResponse,
        ResetResponse
    )
    from scoring import calculate_points_for_rank

# Initialize database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="The Data Vault - Real-time Leaderboard API",
    description="Backend API for competitive banking treasure hunt scoring",
    version="1.0.0"
)

# Enable CORS for local dev and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "The Data Vault API", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/players/join", response_model=PlayerResponse)
def join_game(req: PlayerJoinRequest, db: Session = Depends(get_db)):
    """
    Registers a new player with their chosen name or updates existing session.
    """
    player = db.query(Player).filter(Player.id == req.id).first()
    
    if player:
        # Update name and activity timestamp
        player.name = req.name.strip()
        player.last_active = datetime.utcnow()
    else:
        player = Player(
            id=req.id,
            name=req.name.strip(),
            total_score=0,
            current_stage=1,
            is_vault_cracked=False
        )
        db.add(player)

    db.commit()
    db.refresh(player)

    # Calculate current player rank
    higher_count = db.query(Player).filter(Player.total_score > player.total_score).count()
    player_rank = higher_count + 1

    completed_keys = [c.milestone_key for c in player.completions]

    return PlayerResponse(
        id=player.id,
        name=player.name,
        total_score=player.total_score,
        rank=player_rank,
        current_stage=player.current_stage,
        is_vault_cracked=player.is_vault_cracked,
        completed_milestones=completed_keys
    )

@app.get("/api/players/{player_id}", response_model=PlayerResponse)
def get_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    higher_count = db.query(Player).filter(Player.total_score > player.total_score).count()
    player_rank = higher_count + 1
    completed_keys = [c.milestone_key for c in player.completions]

    return PlayerResponse(
        id=player.id,
        name=player.name,
        total_score=player.total_score,
        rank=player_rank,
        current_stage=player.current_stage,
        is_vault_cracked=player.is_vault_cracked,
        completed_milestones=completed_keys
    )

@app.post("/api/milestones/complete", response_model=MilestoneCompleteResponse)
def complete_milestone(req: MilestoneCompleteRequest, db: Session = Depends(get_db)):
    """
    Awards points for completing a puzzle or presentation code.
    First player to solve receives highest points (100 -> 80 -> 65 -> 50).
    """
    player = db.query(Player).filter(Player.id == req.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found. Join first.")

    # Check if already awarded
    existing = db.query(Completion).filter(
        Completion.player_id == req.player_id,
        Completion.milestone_key == req.milestone_key
    ).first()

    if existing:
        return MilestoneCompleteResponse(
            milestone_key=existing.milestone_key,
            rank_order=existing.rank_order,
            points_awarded=0,
            total_score=player.total_score,
            already_completed=True
        )

    # Determine rank for this milestone
    previous_count = db.query(Completion).filter(Completion.milestone_key == req.milestone_key).count()
    rank_order = previous_count + 1
    points = calculate_points_for_rank(rank_order)

    # Create completion record
    completion = Completion(
        player_id=player.id,
        milestone_key=req.milestone_key,
        rank_order=rank_order,
        points_awarded=points,
        created_at=datetime.utcnow()
    )
    db.add(completion)

    # Update player stats
    player.total_score += points
    player.last_active = datetime.utcnow()
    if req.current_stage is not None:
        player.current_stage = max(player.current_stage, req.current_stage)
    if req.is_vault_cracked is not None:
        player.is_vault_cracked = req.is_vault_cracked or player.is_vault_cracked

    db.commit()
    db.refresh(player)

    return MilestoneCompleteResponse(
        milestone_key=req.milestone_key,
        rank_order=rank_order,
        points_awarded=points,
        total_score=player.total_score,
        already_completed=False
    )

@app.get("/api/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    player_id: Optional[str] = Query(None, description="Optional ID to get current player rank"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns the live sorted leaderboard (Highest score first, ties broken by earliest active time).
    """
    players = db.query(Player).order_by(desc(Player.total_score), Player.last_active.asc()).all()
    
    total_players = len(players)
    items = []
    current_player_rank = None
    current_player_score = None

    for idx, p in enumerate(players):
        rank = idx + 1
        if player_id and p.id == player_id:
            current_player_rank = rank
            current_player_score = p.total_score

        if len(items) < limit:
            items.append(LeaderboardItem(
                rank=rank,
                player_id=p.id,
                name=p.name,
                total_score=p.total_score,
                milestones_count=len(p.completions),
                last_active=p.last_active
            ))

    return LeaderboardResponse(
        leaderboard=items,
        total_players=total_players,
        current_player_rank=current_player_rank,
        current_player_score=current_player_score
    )

@app.post("/api/admin/reset", response_model=ResetResponse)
def reset_leaderboard(admin_key: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Facilitator tool: wipes all milestone completions and resets player scores to 0.
    """
    db.query(Completion).delete()
    for player in db.query(Player).all():
        player.total_score = 0
        player.current_stage = 1
        player.is_vault_cracked = False
        player.last_active = datetime.utcnow()
    
    db.commit()
    return ResetResponse(status="success", message="All completions cleared and scores reset to 0.")
