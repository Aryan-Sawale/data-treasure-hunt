import os
import hashlib
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query, Header
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
        ResetResponse,
        AdminLoginRequest,
        AdminLoginResponse,
        AdminDashboardResponse,
        AdminPlayerDetail,
        AdminCompletionDetail
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
        ResetResponse,
        AdminLoginRequest,
        AdminLoginResponse,
        AdminDashboardResponse,
        AdminPlayerDetail,
        AdminCompletionDetail
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
    return {"status": "ok", "app": "The Data Vault API", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.post("/api/players/join", response_model=PlayerResponse)
def join_game(req: PlayerJoinRequest, db: Session = Depends(get_db)):
    """
    Registers a new player with their chosen name or updates existing session.
    """
    player = db.query(Player).filter(Player.id == req.id).first()
    
    if player:
        # Update name and activity timestamp
        player.name = req.name.strip()
        player.last_active = datetime.now(timezone.utc)
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
        created_at=datetime.now(timezone.utc)
    )
    db.add(completion)

    # Update player stats
    player.total_score += points
    player.last_active = datetime.now(timezone.utc)
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

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "abnamro2026")
ADMIN_TOKEN = f"adm_{hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()[:24]}"

def verify_admin_auth(
    authorization: Optional[str] = Header(None),
    x_admin_token: Optional[str] = Header(None),
    admin_key: Optional[str] = Query(None)
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
    elif x_admin_token:
        token = x_admin_token.strip()
    elif admin_key:
        token = admin_key.strip()
    
    if token and (token == ADMIN_TOKEN or token == ADMIN_PASSWORD):
        return True
    raise HTTPException(status_code=401, detail="Invalid admin credentials or session expired")

@app.post("/api/admin/login", response_model=AdminLoginResponse)
def admin_login(req: AdminLoginRequest):
    """
    Validates facilitator password and issues an administrative session token.
    """
    if req.password.strip() == ADMIN_PASSWORD:
        return AdminLoginResponse(
            success=True,
            token=ADMIN_TOKEN,
            message="Facilitator authentication successful"
        )
    raise HTTPException(status_code=401, detail="Invalid administrator password")

@app.get("/api/admin/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_auth)
):
    """
    Returns complete real-time session telemetry, player progress, and completion funnels.
    """
    players = db.query(Player).order_by(desc(Player.total_score), Player.last_active.asc()).all()
    total_players = len(players)
    completions = db.query(Completion).all()
    total_completions = len(completions)

    top_score = max([p.total_score for p in players], default=0)
    avg_score = round(sum([p.total_score for p in players]) / total_players, 1) if total_players > 0 else 0.0

    milestone_counts = {}
    for c in completions:
        milestone_counts[c.milestone_key] = milestone_counts.get(c.milestone_key, 0) + 1

    player_details = []
    for idx, p in enumerate(players):
        comp_list = [
            AdminCompletionDetail(
                milestone_key=c.milestone_key,
                rank_order=c.rank_order,
                points_awarded=c.points_awarded,
                created_at=c.created_at
            )
            for c in sorted(p.completions, key=lambda x: x.created_at)
        ]
        player_details.append(AdminPlayerDetail(
            id=p.id,
            name=p.name,
            total_score=p.total_score,
            rank=idx + 1,
            current_stage=p.current_stage,
            is_vault_cracked=p.is_vault_cracked,
            last_active=p.last_active,
            created_at=p.created_at,
            completions=comp_list
        ))

    return AdminDashboardResponse(
        total_players=total_players,
        total_completions=total_completions,
        top_score=top_score,
        average_score=avg_score,
        milestone_counts=milestone_counts,
        players=player_details
    )

@app.delete("/api/admin/players/{player_id}")
def delete_player(
    player_id: str,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_auth)
):
    """
    Removes a player and all their completions from the leaderboard.
    """
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player_name = player.name
    db.delete(player)
    db.commit()
    return {"status": "success", "message": f"Player '{player_name}' ({player_id}) deleted successfully"}

@app.post("/api/admin/reset", response_model=ResetResponse)
def reset_leaderboard(
    delete_players: bool = Query(False, description="Whether to also delete player records entirely"),
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_auth)
):
    """
    Facilitator tool: wipes all milestone completions and resets player scores to 0 (or wipes all players).
    """
    db.query(Completion).delete()
    if delete_players:
        db.query(Player).delete()
        msg = "All milestone completions and player records have been permanently cleared."
    else:
        for player in db.query(Player).all():
            player.total_score = 0
            player.current_stage = 1
            player.is_vault_cracked = False
            player.last_active = datetime.now(timezone.utc)
        msg = "All completions cleared and scores reset to 0."

    db.commit()
    return ResetResponse(status="success", message=msg)
