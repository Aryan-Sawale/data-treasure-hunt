from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PlayerJoinRequest(BaseModel):
    id: str = Field(..., description="Unique persistent client UUID")
    name: str = Field(..., min_length=1, max_length=100, description="Player display name")

class PlayerResponse(BaseModel):
    id: str
    name: str
    total_score: int
    rank: Optional[int] = None
    current_stage: int
    is_vault_cracked: bool
    completed_milestones: List[str] = []

    class Config:
        from_attributes = True

class MilestoneCompleteRequest(BaseModel):
    player_id: str
    milestone_key: str = Field(..., description="e.g. PUZZLE_1, CODE_1, etc.")
    current_stage: Optional[int] = None
    is_vault_cracked: Optional[bool] = None

class MilestoneCompleteResponse(BaseModel):
    milestone_key: str
    rank_order: int
    points_awarded: int
    total_score: int
    already_completed: bool

class LeaderboardItem(BaseModel):
    rank: int
    player_id: str
    name: str
    total_score: int
    milestones_count: int
    last_active: datetime

class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardItem]
    total_players: int
    current_player_rank: Optional[int] = None
    current_player_score: Optional[int] = None

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
