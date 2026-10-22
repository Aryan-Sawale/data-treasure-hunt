/**
 * Haptic Vibration Feedback Service
 * Provides tactile response on supported mobile devices.
 */

class HapticService {
  isSupported() {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  light() {
    if (this.isSupported()) {
      try {
        navigator.vibrate(15);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  }

  medium() {
    if (this.isSupported()) {
      try {
        navigator.vibrate(30);
      } catch (e) {
        // Ignore
      }
    }
  }

  success() {
    if (this.isSupported()) {
      try {
        navigator.vibrate([30, 40, 50]);
      } catch (e) {
        // Ignore
      }
    }
  }

  error() {
    if (this.isSupported()) {
      try {
        navigator.vibrate([50, 60, 50]);
      } catch (e) {
        // Ignore
      }
    }
  }

  victory() {
    if (this.isSupported()) {
      try {
        navigator.vibrate([60, 50, 60, 50, 100]);
      } catch (e) {
        // Ignore
      }
    }
  }
}

export const hapticService = new HapticService();

