/**
 * API Service for The Data Vault real-time competitive scoring & leaderboard.
 * Communicates with the FastAPI backend with offline graceful fallback.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STORAGE_KEYS = {
  PLAYER_ID: 'vault_player_id',
  PLAYER_NAME: 'vault_player_name',
  LOCAL_SCORE: 'vault_local_score',
  LOCAL_RANK: 'vault_local_rank',
  COMPLETED_MILESTONES: 'vault_completed_milestones'
};

// Generates or retrieves a persistent player UUID
export const getPlayerId = () => {
  let id = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
  if (!id) {
    id = 'p-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.PLAYER_ID, id);
  }
  return id;
};

export const getPlayerName = () => {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
};

export const setPlayerName = (name) => {
  localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
};

export const apiService = {
  /**
   * Register or reconnect player with their display name
   */
  joinGame: async (name) => {
    const playerId = getPlayerId();
    setPlayerName(name);

    try {
      const res = await fetch(`${API_BASE_URL}/api/players/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, name: name.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, data.total_score.toString());
        localStorage.setItem(STORAGE_KEYS.LOCAL_RANK, (data.rank || 1).toString());
        return { success: true, player: data };
      }
    } catch (err) {
      console.warn('API unreachable, operating in offline fallback mode:', err);
    }

    return {
      success: false,
      player: {
        id: playerId,
        name: name.trim(),
        total_score: parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10),
        rank: parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_RANK) || '1', 10),
        offline: true
      }
    };
  },

  /**
   * Submit a puzzle or secret code milestone completion
   * Awards points (1st = 100, 2nd = 80, 3rd = 65, 4th+ = 50)
   */
  completeMilestone: async (milestoneKey, currentStage = 1, isVaultCracked = false) => {
    const playerId = getPlayerId();

    try {
      const res = await fetch(`${API_BASE_URL}/api/milestones/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          milestone_key: milestoneKey,
          current_stage: currentStage,
          is_vault_cracked: isVaultCracked
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, data.total_score.toString());
        return {
          success: true,
          pointsAwarded: data.points_awarded,
          rankOrder: data.rank_order,
          totalScore: data.total_score,
          alreadyCompleted: data.already_completed
        };
      }
    } catch (err) {
      console.warn('API milestone submit failed, recording locally:', err);
    }

    // Offline fallback point simulation (50 base points)
    const currentScore = parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10);
    const newScore = currentScore + 50;
    localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, newScore.toString());

    return {
      success: false,
      pointsAwarded: 50,
      rankOrder: 1,
      totalScore: newScore,
      alreadyCompleted: false,
      offline: true
    };
  },

  /**
   * Fetch live leaderboard rankings
   */
  getLeaderboard: async () => {
    const playerId = getPlayerId();

    try {
      const res = await fetch(`${API_BASE_URL}/api/leaderboard?player_id=${playerId}&limit=50`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch live leaderboard:', err);
    }

    // Offline dummy fallback
    const playerName = getPlayerName() || 'You';
    const score = parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10);
    return {
      leaderboard: [
        {
          rank: 1,
          player_id: playerId,
          name: playerName,
          total_score: score,
          milestones_count: 0,
          last_active: new Date().toISOString()
        }
      ],
      total_players: 1,
      current_player_rank: 1,
      current_player_score: score,
      offline: true
    };
  },

  /**
   * Reset game scores (Facilitator)
   */
  resetLeaderboard: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset`, { method: 'POST' });
      if (res.ok) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, '0');
        return true;
      }
    } catch (e) {
      console.warn('Failed to reset remote leaderboard:', e);
    }
    return false;
  }
};

