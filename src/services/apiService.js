/**
 * API Service for The Data Vault real-time competitive scoring & leaderboard.
 * Communicates with the FastAPI backend with offline graceful fallback,
 * room isolation, and WebSocket real-time challenge timers.
 */

export const getApiBaseUrl = () => {
  // 1. Runtime override (saved in Facilitator settings or localStorage)
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = localStorage.getItem('vault_api_url');
    if (custom) return custom.trim().replace(/\/$/, '');
  }

  // 2. Build-time environment variable (Render / Vercel / GitHub Pages)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  }

  // 3. Local dev server: Vite proxy handles relative calls if on port 3000
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.port === '3000') {
      return '';
    }
    const host = window.location.hostname || 'localhost';
    // Only assume port 8000 if on localhost or private LAN IP
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return `${protocol}//${host}:8000`;
    }
  }

  return '';
};

const STORAGE_KEYS = {
  PLAYER_ID: 'vault_player_id',
  PLAYER_NAME: 'vault_player_name',
  ROOM_ID: 'vault_room_id',
  LOCAL_SCORE: 'vault_local_score',
  LOCAL_RANK: 'vault_local_rank',
  COMPLETED_MILESTONES: 'vault_completed_milestones',
  ADMIN_TOKEN: 'vault_admin_token',
  API_URL: 'vault_api_url'
};

export const getStoredApiUrl = () => {
  return (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.API_URL)) || import.meta.env.VITE_API_URL || '';
};

export const setStoredApiUrl = (url) => {
  if (typeof localStorage === 'undefined') return;
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEYS.API_URL, url.trim().replace(/\/$/, ''));
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_URL);
  }
};

// Generates or retrieves a persistent player UUID
export const getPlayerId = () => {
  let id = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PLAYER_ID) : null;
  if (!id) {
    id = 'p-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEYS.PLAYER_ID, id);
  }
  return id;
};

export const getPlayerName = () => {
  return (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.PLAYER_NAME)) || '';
};

export const setPlayerName = (name) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
};

export const getRoomId = () => {
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.trim()) {
      const clean = roomParam.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
      if (clean) {
        if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEYS.ROOM_ID, clean);
        return clean;
      }
    }
  }
  return (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.ROOM_ID)) || 'DEFAULT';
};

export const setRoomId = (roomId) => {
  if (typeof localStorage === 'undefined') return;
  const clean = (roomId || 'DEFAULT').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32) || 'DEFAULT';
  localStorage.setItem(STORAGE_KEYS.ROOM_ID, clean);
  return clean;
};

export const getAdminToken = () => {
  return (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)) ||
         (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)) || '';
};

export const setAdminToken = (token) => {
  if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
};

export const clearAdminToken = () => {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
};

// WebSocket Real-time Hub
let activeWs = null;
const wsSubscribers = new Set();
let reconnectTimer = null;
let currentWsRoom = null;

if (typeof window !== 'undefined' && !window.__vault_ws_unload_attached) {
  window.__vault_ws_unload_attached = true;
  window.addEventListener('beforeunload', () => {
    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      try {
        activeWs.close(1000, 'Page unload');
      } catch (e) {}
    }
  });
}

export const connectRoomWebSocket = (roomId) => {
  if (typeof window === 'undefined') return;
  const cleanRoom = (roomId || getRoomId()).trim().toUpperCase() || 'DEFAULT';

  // If already connecting or open for this room, avoid redundant reconnect
  if (
    activeWs &&
    (activeWs.readyState === WebSocket.OPEN || activeWs.readyState === WebSocket.CONNECTING) &&
    currentWsRoom === cleanRoom
  ) {
    return;
  }

  currentWsRoom = cleanRoom;
  const base = getApiBaseUrl();
  let wsUrl = '';

  if (base.startsWith('http://')) {
    wsUrl = base.replace('http://', 'ws://') + `/ws/${cleanRoom}`;
  } else if (base.startsWith('https://')) {
    wsUrl = base.replace('https://', 'wss://') + `/ws/${cleanRoom}`;
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    wsUrl = `${protocol}//${host}/ws/${cleanRoom}`;
  }

  try {
    if (activeWs) {
      activeWs.onclose = null;
      activeWs.onerror = null;
      activeWs.onmessage = null;
      if (activeWs.readyState === WebSocket.OPEN) {
        try {
          activeWs.close(1000, 'Switching room');
        } catch (e) {}
      }
      activeWs = null;
    }

    activeWs = new WebSocket(wsUrl);

    activeWs.onopen = () => {
      // Periodic ping to keep alive
      if (activeWs.pingInterval) clearInterval(activeWs.pingInterval);
      activeWs.pingInterval = setInterval(() => {
        if (activeWs && activeWs.readyState === WebSocket.OPEN) {
          activeWs.send('ping');
        }
      }, 25000);
    };

    activeWs.onmessage = (event) => {
      try {
        if (event.data === 'pong') return;
        const msg = JSON.parse(event.data);
        wsSubscribers.forEach((cb) => {
          try {
            cb(msg);
          } catch (e) {
            console.error('Subscriber error:', e);
          }
        });
      } catch (e) {
        // Ignored
      }
    };

    activeWs.onclose = (event) => {
      // Only auto-reconnect if closure was unexpected (not code 1000)
      if (event?.code !== 1000) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          connectRoomWebSocket(cleanRoom);
        }, 4000);
      }
    };

    activeWs.onerror = () => {
      // Silent error, onclose handles reconnect
    };
  } catch (err) {
    console.warn('[WS] Failed to connect:', err);
  }
};

export const subscribeToRoomEvents = (callback) => {
  wsSubscribers.add(callback);
  return () => {
    wsSubscribers.delete(callback);
  };
};

export const apiService = {
  checkHealth: async () => {
    const base = getApiBaseUrl();
    try {
      const res = await fetch(`${base}/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return { online: true, ...data };
      }
    } catch (e) {}
    return { online: false };
  },

  joinGame: async (name, roomId = null) => {
    const playerId = getPlayerId();
    setPlayerName(name);
    if (roomId) setRoomId(roomId);
    const activeRoom = getRoomId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/players/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, name: name.trim(), room_id: activeRoom })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, data.total_score.toString());
        localStorage.setItem(STORAGE_KEYS.LOCAL_RANK, (data.rank || 1).toString());
        connectRoomWebSocket(activeRoom);
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
        room_id: activeRoom,
        total_score: parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10),
        rank: parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_RANK) || '1', 10),
        offline: true
      }
    };
  },

  getPlayer: async (playerId = getPlayerId()) => {
    const base = getApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/players/${playerId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  },

  completeMilestone: async (milestoneKey, currentStage = 1, isVaultCracked = false, roomId = null) => {
    const playerId = getPlayerId();
    const activeRoom = roomId ? setRoomId(roomId) : getRoomId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/milestones/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          milestone_key: milestoneKey,
          room_id: activeRoom,
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
          alreadyCompleted: data.already_completed,
          firstSolver: data.first_solver
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
      offline: true,
      firstSolver: false
    };
  },

  recordTimeout: async (challengeId, roomId = null) => {
    const playerId = getPlayerId();
    const activeRoom = roomId ? setRoomId(roomId) : getRoomId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/challenges/timeout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          room_id: activeRoom,
          challenge_id: challengeId
        })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to record timeout with backend:', e);
    }
    return { points_awarded: 0, total_score: parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10) };
  },

  getRoomStatus: async (roomId = null) => {
    const activeRoom = roomId ? setRoomId(roomId) : getRoomId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/rooms/${activeRoom}/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return { room_id: activeRoom, active_timers: [], expired_timers: [], total_players: 1 };
  },

  deductPenalty: async (penaltyPoints = 5, reason = 'Wrong Attempt', roomId = null) => {
    const playerId = getPlayerId();
    const activeRoom = roomId || getRoomId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/players/penalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          penalty_points: penaltyPoints,
          reason: reason,
          room_id: activeRoom
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, data.total_score.toString());
        localStorage.setItem(STORAGE_KEYS.LOCAL_RANK, (data.rank || 1).toString());
        return {
          success: true,
          penaltyApplied: data.penalty_applied,
          totalScore: data.total_score,
          rank: data.rank
        };
      }
    } catch (err) {
      console.warn('API penalty submit failed, applying locally:', err);
    }

    const currentScore = parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10);
    const newScore = Math.max(0, currentScore - penaltyPoints);
    const applied = currentScore - newScore;
    localStorage.setItem(STORAGE_KEYS.LOCAL_SCORE, newScore.toString());

    return {
      success: false,
      penaltyApplied: applied,
      totalScore: newScore,
      rank: parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_RANK) || '1', 10),
      offline: true
    };
  },

  getLeaderboard: async (limit = 50, roomId = null) => {
    const playerId = getPlayerId();
    const activeRoom = roomId || getRoomId();
    const base = getApiBaseUrl();

    try {
      const res = await fetch(`${base}/api/leaderboard?player_id=${playerId}&limit=${limit}&room_id=${activeRoom}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch live leaderboard:', err);
    }

    const playerName = getPlayerName() || 'You';
    const score = parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_SCORE) || '0', 10);
    return {
      leaderboard: [
        {
          rank: 1,
          player_id: playerId,
          name: playerName,
          room_id: activeRoom,
          total_score: score,
          milestones_count: 0,
          last_active: new Date().toISOString()
        }
      ],
      total_players: 1,
      room_id: activeRoom,
      current_player_rank: 1,
      current_player_score: score,
      offline: true
    };
  },

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

  getAdminDashboard: async (roomId = null) => {
    const base = getApiBaseUrl();
    const token = getAdminToken();
    const query = roomId ? `?room_id=${roomId}` : '';

    try {
      const res = await fetch(`${base}/api/admin/dashboard${query}`, {
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

  deletePlayer: async (playerId) => {
    const base = getApiBaseUrl();
    const token = getAdminToken() || 'abnamro2026';

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

  resetLeaderboard: async (deletePlayers = false, roomId = null) => {
    const base = getApiBaseUrl();
    const token = getAdminToken() || 'abnamro2026';
    let url = `${base}/api/admin/reset?delete_players=${deletePlayers}`;
    if (roomId) url += `&room_id=${roomId}`;

    try {
      const res = await fetch(url, {
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
