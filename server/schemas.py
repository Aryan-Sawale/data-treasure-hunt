from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PlayerJoinRequest(BaseModel):
    id: str = Field(..., description="Unique persistent client UUID")
    name: str = Field(..., min_length=1, max_length=100, description="Player display name")
    room_id: Optional[str] = Field(default="DEFAULT", description="Room identifier")

class PlayerResponse(BaseModel):
    id: str
    name: str
    room_id: str = "DEFAULT"
    total_score: int
    rank: Optional[int] = None
    current_stage: int
    is_vault_cracked: bool
    completed_milestones: List[str] = []

    class Config:
        from_attributes = True

class MilestoneCompleteRequest(BaseModel):
    player_id: str
    milestone_key: str = Field(..., description="e.g. P1_CAPABILITY_MATCH, CODE_1, etc.")
    room_id: Optional[str] = Field(default="DEFAULT", description="Room identifier")
    current_stage: Optional[int] = None
    is_vault_cracked: Optional[bool] = None

class MilestoneCompleteResponse(BaseModel):
    milestone_key: str
    rank_order: int
    points_awarded: int
    total_score: int
    already_completed: bool
    room_id: str = "DEFAULT"
    first_solver: bool = False

class TimeoutRequest(BaseModel):
    player_id: str
    challenge_id: str
    room_id: Optional[str] = Field(default="DEFAULT", description="Room identifier")

class PenaltyRequest(BaseModel):
    player_id: str
    penalty_points: int = Field(default=5, ge=1, le=50, description="Points to deduct")
    reason: Optional[str] = Field(default="Wrong Attempt", description="Reason for deduction")
    room_id: Optional[str] = Field(default="DEFAULT", description="Room identifier")

class PenaltyResponse(BaseModel):
    player_id: str
    penalty_applied: int
    total_score: int
    rank: int

class LeaderboardItem(BaseModel):
    rank: int
    player_id: str
    name: str
    room_id: str = "DEFAULT"
    total_score: int
    milestones_count: int
    last_active: datetime

class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardItem]
    total_players: int
    room_id: str = "DEFAULT"
    current_player_rank: Optional[int] = None
    current_player_score: Optional[int] = None

class ChallengeTimerInfo(BaseModel):
    challenge_id: str
    first_solved_by_name: str
    first_solved_at: datetime
    expires_at: datetime
    seconds_remaining: float
    is_expired: bool

class RoomStatusResponse(BaseModel):
    room_id: str
    server_time: datetime
    active_timers: List[ChallengeTimerInfo] = []
    expired_timers: List[str] = []
    total_players: int = 0

class ResetResponse(BaseModel):
    status: str
    message: str

class AdminLoginRequest(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: str
    message: str

class AdminCompletionDetail(BaseModel):
    milestone_key: str
    rank_order: int
    points_awarded: int
    created_at: datetime

class AdminPlayerDetail(BaseModel):
    id: str
    name: str
    room_id: str = "DEFAULT"
    total_score: int
    rank: int
    current_stage: int
    is_vault_cracked: bool
    last_active: datetime
    created_at: Optional[datetime] = None
    completions: List[AdminCompletionDetail] = []

class AdminDashboardResponse(BaseModel):
    total_players: int
    total_completions: int
    top_score: int
    average_score: float
    milestone_counts: dict
    players: List[AdminPlayerDetail]
    rooms: List[str] = []
    active_room: Optional[str] = None
