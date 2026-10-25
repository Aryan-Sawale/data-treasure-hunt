/**
 * API Service for The Data Vault real-time competitive scoring & leaderboard.
 * Communicates with the FastAPI backend with offline graceful fallback.
 */

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    // If running in dev on port 3000, Vite proxy forwards /api and /health
    if (window.location.port === '3000') {
      return '';
    }
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8000`;
  }
  return 'http://localhost:8000';
};

const STORAGE_KEYS = {
  PLAYER_ID: 'vault_player_id',
  PLAYER_NAME: 'vault_player_name',
  LOCAL_SCORE: 'vault_local_score',
  LOCAL_RANK: 'vault_local_rank',
  COMPLETED_MILESTONES: 'vault_completed_milestones',
  ADMIN_TOKEN: 'vault_admin_token'
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

export const getAdminToken = () => {
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || '';
};

export const setAdminToken = (token) => {
  sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
};

export const clearAdminToken = () => {
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
};

export const apiService = {
  /**
   * Ping backend health endpoint to check connection
   */
  checkHealth: async () => {
    const base = getApiBaseUrl();
    try {
      const res = await fetch(`${base}/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return { online: true, ...data };
      }
    } catch (e) {
      // Backend not currently reachable
    }
    return { online: false };
  },

  /**
   * Register or reconnect player with their display name
   */
  joinGame: async (name) => {
    const playerId = getPlayerId();
    setPlayerName(name);
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/players/join`, {
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
   * Fetch current stats for this or another player
   */
  getPlayer: async (playerId = getPlayerId()) => {
    const base = getApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/players/${playerId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch player stats:', e);
    }
    return null;
  },

  /**
   * Submit a puzzle or secret code milestone completion
   * Awards points (1st = 100, 2nd = 80, 3rd = 65, 4th+ = 50)
   */
  completeMilestone: async (milestoneKey, currentStage = 1, isVaultCracked = false) => {
    const playerId = getPlayerId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/milestones/complete`, {
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
  getLeaderboard: async (limit = 50) => {
    const playerId = getPlayerId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/leaderboard?player_id=${playerId}&limit=${limit}`);
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
   * Facilitator Admin Login
   */
  adminLogin: async (password) => {
    const base = getApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.token);
        return { success: true, token: data.token };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.detail || 'Invalid password' };
      }
    } catch (e) {
      return { success: false, message: 'Server unreachable. Ensure backend is running.' };
    }
  },

  /**
   * Fetch full telemetry for Admin Dashboard
   */
  getAdminDashboard: async () => {
    const base = getApiBaseUrl();
    const token = getAdminToken();

    try {
      const res = await fetch(`${base}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token
        }
      });

      if (res.ok) {
        return { success: true, data: await res.json() };
      } else if (res.status === 401) {
        clearAdminToken();
        return { success: false, unauthorized: true, message: 'Admin session expired.' };
      }
    } catch (e) {
      console.warn('Failed to fetch admin telemetry:', e);
    }
    return { success: false, message: 'Could not connect to backend server.' };
  },

  /**
   * Delete a player (Admin)
   */
  deletePlayer: async (playerId) => {
    const base = getApiBaseUrl();
    const token = getAdminToken();

    try {
      const res = await fetch(`${base}/api/admin/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token
        }
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to delete player:', e);
      return false;
    }
  },

  /**
   * Reset game scores and optionally delete all players (Admin / Facilitator)
   */
  resetLeaderboard: async (deletePlayers = false) => {
    const base = getApiBaseUrl();
    const token = getAdminToken();

    try {
      const res = await fetch(`${base}/api/admin/reset?delete_players=${deletePlayers}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token
        }
      });
      if (res.ok) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, '0');
        return true;
      }
    } catch (e) {
      console.warn('Failed to reset remote leaderboard:', e);
    }
    return false;
  },

  adminLogout: () => {
    clearAdminToken();
  }
};
