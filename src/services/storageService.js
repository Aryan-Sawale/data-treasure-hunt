import { DEFAULT_VAULT_CODE } from '../config/questConfig';

const STORAGE_KEY = 'dutch_banking_data_quest_v2';

export const getInitialState = () => {
  return {
    stage: 0, // 0 = Welcome, 1..5 = Teams, 6 = Vault Screen
    step: 'PUZZLE', // 'PUZZLE' | 'TEAM_REVEALED' | 'MILESTONE'
    solvedPuzzles: [], // [1, 2, ...]
    verifiedPresentations: [], // [1, 2, ...]
    unlockedDigits: {}, // { 0: '7', 1: '3', ... }
    vaultCode: DEFAULT_VAULT_CODE,
    startTime: Date.now(),
    isVaultCracked: false
  };
};

export const storageService = {
  loadState: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...getInitialState(), ...parsed };
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

