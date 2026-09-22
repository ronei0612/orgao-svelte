/**
 * src/utils/wakeLock.js
 * Mantém a tela de celulares e tablets ligada durante apresentações musicais.
 */

class WakeLockController {
  constructor() {
    this.wakeLock = null;
    this.isEnabled = true;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', async () => {
        if (this.wakeLock !== null && document.visibilityState === 'visible') {
          await this.request();
        }
      });
    }
  }

  async request() {
    if (!('wakeLock' in navigator) || !this.isEnabled) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
      console.log('[WakeLock] ✅ Tela mantida ativa para apresentação');
    } catch (err) {
      console.warn('[WakeLock] Não foi possível ativar bloqueio de tela:', err.message);
    }
  }

  async release() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {}
    }
  }
}

export const wakeLockController = new WakeLockController();