import { DEFAULT_VAULT_CODE } from '../config/questConfig';

const STORAGE_KEY = 'dutch_banking_data_quest_v2';

export const getInitialState = () => {
  return {
    stage: 0, // 0 = Welcome, 1..4 = Teams, 5 = Vault / Datasphere Screen
    step: 'PUZZLE', // 'PUZZLE' | 'TEAM_REVEALED' | 'MILESTONE'
    solvedPuzzles: [], // [1, 2, ...]
    verifiedPresentations: [], // [1, 2, ...]
    unlockedFragments: {}, // { 1: 'HACN', 2: 'EUL', 3: 'ATD', 4: 'AIV' }
    unlockedDigits: {}, // for backwards compatibility
    vaultCode: DEFAULT_VAULT_CODE,
    startTime: Date.now(),
    isVaultCracked: false,
    isDatasphereUnlocked: false
  };
};

export const storageService = {
  loadState: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const state = { ...getInitialState(), ...parsed };
        
        // Ensure vaultCode defaults to 2347 if previously on older versions
        if (state.vaultCode === '7394' || state.vaultCode === '2374') {
          state.vaultCode = DEFAULT_VAULT_CODE;
        }

        // Migrate any verified presentations into unlockedFragments if missing
        const FRAGMENT_MAP = {
          1: 'HACN',
          2: 'EUL',
          3: 'ATD',
          4: 'AAIV'
        };
        if (!state.unlockedFragments) state.unlockedFragments = {};
        (state.verifiedPresentations || []).forEach(teamId => {
          if (!state.unlockedFragments[teamId] && FRAGMENT_MAP[teamId]) {
            state.unlockedFragments[teamId] = FRAGMENT_MAP[teamId];
          }
        });

        return state;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return getInitialState();
  },

  saveState: (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  },

  clearState: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear state:', e);
    }
    return getInitialState();
  }
};
