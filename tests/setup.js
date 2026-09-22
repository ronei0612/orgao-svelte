// tests/setup.js
import { vi } from 'vitest';

// 1. Mock do Fetch do Node para não dar "Failed to parse URL"
global.fetch = vi.fn().mockImplementation(async (url) => {
  return {
    ok: true,
    status: 200,
    headers: new Map(),
    json: async () => ({}),
    arrayBuffer: async () => new ArrayBuffer(8)
  };
});

// 2. Mock do Web Audio API com currentTime dinâmico
class AudioContextMock {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
  }
  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn()
      },
      connect: vi.fn()
    };
  }
  createDynamicsCompressor() {
    return { connect: vi.fn() };
  }
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
  }
  decodeAudioData(arrayBuffer) {
    return Promise.resolve({
      duration: 1,
      numberOfChannels: 2,
      sampleRate: 44100
    });
  }
  resume() { return Promise.resolve(); }
}

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// 3. Mock do requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);