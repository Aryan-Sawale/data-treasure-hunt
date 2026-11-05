import os
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Set, Dict
from fastapi import FastAPI, Depends, HTTPException, Query, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, inspect, text

try:
    from .database import engine, Base, get_db
    from .models import Player, Completion, Room, RoomChallengeTimer
    from .schemas import (
        PlayerJoinRequest,
        PlayerResponse,
        MilestoneCompleteRequest,
        MilestoneCompleteResponse,
        TimeoutRequest,
        PenaltyRequest,
        PenaltyResponse,
        LeaderboardItem,
        LeaderboardResponse,
        ChallengeTimerInfo,
        RoomStatusResponse,
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
    from models import Player, Completion, Room, RoomChallengeTimer
    from schemas import (
        PlayerJoinRequest,
        PlayerResponse,
        MilestoneCompleteRequest,
        MilestoneCompleteResponse,
        TimeoutRequest,
        PenaltyRequest,
        PenaltyResponse,
        LeaderboardItem,
        LeaderboardResponse,
        ChallengeTimerInfo,
        RoomStatusResponse,
        ResetResponse,
        AdminLoginRequest,
        AdminLoginResponse,
        AdminDashboardResponse,
        AdminPlayerDetail,
        AdminCompletionDetail
    )
    from scoring import calculate_points_for_rank

# Automatic column migration for existing SQLite DBs
try:
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    if "players" in existing_tables:
        cols = [c["name"] for c in inspector.get_columns("players")]
        if "room_id" not in cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE players ADD COLUMN room_id VARCHAR(32) DEFAULT 'DEFAULT'"))
                conn.commit()
    if "completions" in existing_tables:
        cols = [c["name"] for c in inspector.get_columns("completions")]
        if "room_id" not in cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE completions ADD COLUMN room_id VARCHAR(32) DEFAULT 'DEFAULT'"))
                conn.commit()
except Exception as e:
    print(f"[DB Migration Note] {e}")

# Initialize database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="The Data Vault - Real-time Leaderboard API",
    description="Backend API for competitive banking treasure hunt scoring with room isolation & 30s challenge rush timers",
    version="2.0.0"
)

# Enable CORS for local dev and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The 11 individual mini-games that trigger a 30s timer for room members on 1st solve
TIMED_MINI_GAMES = {
    "P1_CAPABILITY_MATCH",
    "P1_EMOJI_PHRASE",
    "P2_ASTEROIDS",
    "P2_MEMORY_PAIRS",
    "P2_INGESTION_SNAKE",
    "P3_ANOMALY_WHACK",
    "P3_DATA_AUDIT",
    "P3_WORD_SEARCH",
    "P4_SIMON_BUTTONS",
    "P4_LINEAGE_ORDER",
    "P4_BDM_BREAKOUT"
}

def clean_room_id(raw_room: Optional[str]) -> str:
    if not raw_room or not raw_room.strip():
        return "DEFAULT"
    return raw_room.strip().upper()[:32]

# In-memory WebSocket Connection Hub per Room
class RoomConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id].discard(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict):
        if room_id in self.rooms:
            dead = set()
            for ws in list(self.rooms[room_id]):
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for d in dead:
                self.rooms[room_id].discard(d)

ws_manager = RoomConnectionManager()

@app.websocket("/ws/{room_id}")
async def room_websocket_endpoint(websocket: WebSocket, room_id: str):
    room_code = clean_room_id(room_id)
    await ws_manager.connect(room_code, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(room_code, websocket)
    except Exception:
        ws_manager.disconnect(room_code, websocket)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "The Data Vault API", "version": "2.0.0", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.post("/api/players/join", response_model=PlayerResponse)
async def join_game(req: PlayerJoinRequest, db: Session = Depends(get_db)):
    """
    Registers a new player with their chosen name and room code, or reconnects existing player.
    Anyone can join or create any room on the fly.
    """
    room_code = clean_room_id(req.room_id)

    # Ensure room record exists
    room = db.query(Room).filter(Room.id == room_code).first()
    if not room:
        room = Room(id=room_code)
        db.add(room)
        db.commit()

    player = db.query(Player).filter(Player.id == req.id).first()
    
    if player:
        player.name = req.name.strip()
        player.room_id = room_code
        player.last_active = datetime.now(timezone.utc)
    else:
        player = Player(
            id=req.id,
            room_id=room_code,
            name=req.name.strip(),
            total_score=0,
            current_stage=1,
            is_vault_cracked=False
        )
        db.add(player)

    db.commit()
    db.refresh(player)

    # Calculate current player rank inside this room
    higher_count = db.query(Player).filter(
        Player.room_id == room_code,
        Player.total_score > player.total_score
    ).count()
    player_rank = higher_count + 1

    completed_keys = [c.milestone_key for c in player.completions]

    return PlayerResponse(
        id=player.id,
        name=player.name,
        room_id=player.room_id,
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

    higher_count = db.query(Player).filter(
        Player.room_id == player.room_id,
        Player.total_score > player.total_score
    ).count()
    player_rank = higher_count + 1
    completed_keys = [c.milestone_key for c in player.completions]

    return PlayerResponse(
        id=player.id,
        name=player.name,
        room_id=player.room_id,
        total_score=player.total_score,
        rank=player_rank,
        current_stage=player.current_stage,
        is_vault_cracked=player.is_vault_cracked,
        completed_milestones=completed_keys
    )

@app.post("/api/milestones/complete", response_model=MilestoneCompleteResponse)
async def complete_milestone(req: MilestoneCompleteRequest, db: Session = Depends(get_db)):
    """
    Awards points for completing an individual mini-game or presentation code.
    If it's an individual mini-game, 1st solver triggers a 30s countdown timer for everyone in that room.
    Subsequent solvers within 30s earn rank-based points; solvers after 30s receive 0 points.
    """
    player = db.query(Player).filter(Player.id == req.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found. Join first.")

    room_code = clean_room_id(req.room_id or player.room_id)
    if player.room_id != room_code:
        player.room_id = room_code

    # Check if already completed by this player
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
            already_completed=True,
            room_id=room_code,
            first_solver=False
        )

    now = datetime.now(timezone.utc)
    is_timed_mini_game = req.milestone_key in TIMED_MINI_GAMES
    first_solver = False
    points = 0
    rank_order = 1

    if is_timed_mini_game:
        # Check if a timer exists for this room & challenge
        timer = db.query(RoomChallengeTimer).filter(
            RoomChallengeTimer.room_id == room_code,
            RoomChallengeTimer.challenge_id == req.milestone_key
        ).first()

        if not timer:
            # 1st solver in the room!
            first_solver = True
            rank_order = 1
            points = calculate_points_for_rank(1) # 100 points
            expires_at = now + timedelta(seconds=30)

            timer = RoomChallengeTimer(
                room_id=room_code,
                challenge_id=req.milestone_key,
                first_solved_by_id=player.id,
                first_solved_by_name=player.name,
                first_solved_at=now,
                expires_at=expires_at
            )
            db.add(timer)
            db.commit()

            # Broadcast 30-second timer to room via WebSocket
            await ws_manager.broadcast_to_room(room_code, {
                "type": "CHALLENGE_TIMER_STARTED",
                "challenge_id": req.milestone_key,
                "first_solved_by_name": player.name,
                "first_solved_at": now.isoformat(),
                "expires_at": expires_at.isoformat(),
                "duration_seconds": 30
            })
        else:
            # Timer already exists
            exp = timer.expires_at if timer.expires_at.tzinfo else timer.expires_at.replace(tzinfo=timezone.utc)
            if now <= exp:
                # Solved within 30-second window! Award rank-based points
                previous_count = db.query(Completion).filter(
                    Completion.room_id == room_code,
                    Completion.milestone_key == req.milestone_key,
                    Completion.points_awarded > 0
                ).count()
                rank_order = previous_count + 1
                points = calculate_points_for_rank(rank_order) # 80, 65, 50
            else:
                # Solved after 30-second window expired
                rank_order = 999
                points = 0
    else:
        # Non-timed milestone (presentation code or vault)
        previous_count = db.query(Completion).filter(
            Completion.room_id == room_code,
            Completion.milestone_key == req.milestone_key
        ).count()
        rank_order = previous_count + 1
        points = calculate_points_for_rank(rank_order)

    # Record completion
    completion = Completion(
        room_id=room_code,
        player_id=player.id,
        milestone_key=req.milestone_key,
        rank_order=rank_order,
        points_awarded=points,
        created_at=now
    )
    db.add(completion)

    # Update player stats
    player.total_score += points
    player.last_active = now
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
        already_completed=False,
        room_id=room_code,
        first_solver=first_solver
    )

@app.post("/api/challenges/timeout", response_model=MilestoneCompleteResponse)
def challenge_timeout(req: TimeoutRequest, db: Session = Depends(get_db)):
    """
    Called when a player's 30s timer expires or when catching up on an already expired challenge.
    Records a 0-point completion so they auto-advance without scoring.
    """
    player = db.query(Player).filter(Player.id == req.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    room_code = clean_room_id(req.room_id or player.room_id)

    existing = db.query(Completion).filter(
        Completion.player_id == req.player_id,
        Completion.milestone_key == req.challenge_id
    ).first()

    if existing:
        return MilestoneCompleteResponse(
            milestone_key=existing.milestone_key,
            rank_order=existing.rank_order,
            points_awarded=0,
            total_score=player.total_score,
            already_completed=True,
            room_id=room_code,
            first_solver=False
        )

    now = datetime.now(timezone.utc)
    completion = Completion(
        room_id=room_code,
        player_id=player.id,
        milestone_key=req.challenge_id,
        rank_order=999,
        points_awarded=0,
        created_at=now
    )
    db.add(completion)
    player.last_active = now
    db.commit()
    db.refresh(player)

    return MilestoneCompleteResponse(
        milestone_key=req.challenge_id,
        rank_order=999,
        points_awarded=0,
        total_score=player.total_score,
        already_completed=False,
        room_id=room_code,
        first_solver=False
    )

@app.get("/api/rooms/{room_id}/status", response_model=RoomStatusResponse)
def get_room_status(room_id: str, db: Session = Depends(get_db)):
    """
    Returns active 30s timers and expired timers for room state synchronization and catchup logic.
    """
    room_code = clean_room_id(room_id)
    now = datetime.now(timezone.utc)
    timers = db.query(RoomChallengeTimer).filter(RoomChallengeTimer.room_id == room_code).all()

    active_timers = []
    expired_timers = []

    for t in timers:
        exp = t.expires_at if t.expires_at.tzinfo else t.expires_at.replace(tzinfo=timezone.utc)
        diff = (exp - now).total_seconds()
        if diff > 0:
            active_timers.append(ChallengeTimerInfo(
                challenge_id=t.challenge_id,
                first_solved_by_name=t.first_solved_by_name,
                first_solved_at=t.first_solved_at,
                expires_at=exp,
                seconds_remaining=round(diff, 1),
                is_expired=False
            ))
        else:
            expired_timers.append(t.challenge_id)

    total_players = db.query(Player).filter(Player.room_id == room_code).count()

    return RoomStatusResponse(
        room_id=room_code,
        server_time=now,
        active_timers=active_timers,
        expired_timers=expired_timers,
        total_players=total_players
    )

@app.post("/api/players/penalty", response_model=PenaltyResponse)
def apply_penalty(req: PenaltyRequest, db: Session = Depends(get_db)):
    """
    Applies negative points for incorrect attempts in puzzles (floor at 0).
    """
    player = db.query(Player).filter(Player.id == req.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    penalty = max(1, req.penalty_points)
    previous_score = player.total_score
    new_score = max(0, previous_score - penalty)
    applied = previous_score - new_score

    player.total_score = new_score
    player.last_active = datetime.now(timezone.utc)
    db.commit()
    db.refresh(player)

    higher_count = db.query(Player).filter(
        Player.room_id == player.room_id,
        Player.total_score > player.total_score
    ).count()
    player_rank = higher_count + 1

    return PenaltyResponse(
        player_id=player.id,
        penalty_applied=applied,
        total_score=player.total_score,
        rank=player_rank
    )

@app.get("/api/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    room_id: Optional[str] = Query("DEFAULT", description="Room identifier to filter scores"),
    player_id: Optional[str] = Query(None, description="Optional ID to get current player rank"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns the live sorted leaderboard for a specific room.
    """
    room_code = clean_room_id(room_id)
    players = db.query(Player).filter(Player.room_id == room_code).order_by(
        desc(Player.total_score), Player.last_active.asc()
    ).all()
    
    total_players = len(players)
    items = []
    current_player_rank = None
    current_player_score = None

    current_rank = 1
    for idx, p in enumerate(players):
        if idx > 0 and p.total_score < players[idx - 1].total_score:
            current_rank = idx + 1

        if player_id and p.id == player_id:
            current_player_rank = current_rank
            current_player_score = p.total_score

        if len(items) < limit:
            items.append(LeaderboardItem(
                rank=current_rank,
                player_id=p.id,
                name=p.name,
                room_id=p.room_id,
                total_score=p.total_score,
                milestones_count=len(p.completions),
                last_active=p.last_active
            ))

    return LeaderboardResponse(
        leaderboard=items,
        total_players=total_players,
        room_id=room_code,
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
    if req.password.strip() == ADMIN_PASSWORD:
        return AdminLoginResponse(
            success=True,
            token=ADMIN_TOKEN,
            message="Facilitator authentication successful"
        )
    raise HTTPException(status_code=401, detail="Invalid administrator password")

@app.get("/api/admin/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    room_id: Optional[str] = Query(None, description="Optional room ID filter"),
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_auth)
):
    # Fetch all distinct room IDs
    all_rooms = [r[0] for r in db.query(Player.room_id).distinct().all() if r[0]]
    if not all_rooms:
        all_rooms = ["DEFAULT"]

    query = db.query(Player)
    if room_id and room_id.strip():
        room_code = clean_room_id(room_id)
        query = query.filter(Player.room_id == room_code)
    else:
        room_code = None

    players = query.order_by(desc(Player.total_score), Player.last_active.asc()).all()
    total_players = len(players)

    comp_query = db.query(Completion)
    if room_code:
        comp_query = comp_query.filter(Completion.room_id == room_code)
    completions = comp_query.all()
    total_completions = len(completions)

    top_score = max([p.total_score for p in players], default=0)
    avg_score = round(sum([p.total_score for p in players]) / total_players, 1) if total_players > 0 else 0.0

    milestone_counts = {}
    for c in completions:
        milestone_counts[c.milestone_key] = milestone_counts.get(c.milestone_key, 0) + 1

    player_details = []
    current_rank = 1
    for idx, p in enumerate(players):
        if idx > 0 and p.total_score < players[idx - 1].total_score:
            current_rank = idx + 1

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
            room_id=p.room_id,
            total_score=p.total_score,
            rank=current_rank,
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
        players=player_details,
        rooms=sorted(list(set(all_rooms))),
        active_room=room_code
    )

@app.delete("/api/admin/players/{player_id}")
def delete_player(
    player_id: str,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_auth)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player_name = player.name
    db.delete(player)
    db.commit()
    return {"status": "success", "message": f"Player '{player_name}' ({player_id}) deleted successfully"}

@app.post("/api/admin/reset", response_model=ResetResponse)
def reset_leaderboard(
    room_id: Optional[str] = Query(None, description="Optional room ID to reset"),
    delete_players: bool = Query(False, description="Whether to also delete player records entirely"),
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_auth)
):
    room_code = clean_room_id(room_id) if room_id else None

    # Delete timers for room or all
    timer_q = db.query(RoomChallengeTimer)
    if room_code:
        timer_q = timer_q.filter(RoomChallengeTimer.room_id == room_code)
    timer_q.delete()

    # Clear completions
    comp_q = db.query(Completion)
    if room_code:
        comp_q = comp_q.filter(Completion.room_id == room_code)
    comp_q.delete()

    if delete_players:
        player_q = db.query(Player)
        if room_code:
            player_q = player_q.filter(Player.room_id == room_code)
        player_q.delete()
        msg = f"All completions, timers, and player records for {room_code or 'all rooms'} have been permanently cleared."
    else:
        player_q = db.query(Player)
        if room_code:
            player_q = player_q.filter(Player.room_id == room_code)
        for player in player_q.all():
            player.total_score = 0
            player.current_stage = 1
            player.is_vault_cracked = False
            player.last_active = datetime.now(timezone.utc)
        msg = f"All completions and timers cleared; player scores reset to 0 for {room_code or 'all rooms'}."

    db.commit()
    return ResetResponse(status="success", message=msg)
