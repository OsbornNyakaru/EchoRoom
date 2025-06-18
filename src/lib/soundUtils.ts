/**
 * Sound Manager for EchoRoom
 * Handles audio playback for navigation and interaction sounds
 */

class SoundManager {
  private static instance: SoundManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private constructor() {
    // Load mute preference from localStorage
    const savedMute = localStorage.getItem('echoroom_soundMuted');
    this.isMuted = savedMute === 'true';
    
    // Load volume preference from localStorage
    const savedVolume = localStorage.getItem('echoroom_soundVolume');
    this.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Preload an audio file
   */
  public preloadSound(name: string, url: string): void {
    if (this.audioCache.has(name)) return;

    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = this.volume;
    
    // Handle loading errors gracefully
    audio.addEventListener('error', () => {
      console.warn(`Failed to load sound: ${name} from ${url}`);
    });

    this.audioCache.set(name, audio);
  }

  /**
   * Play a sound by name
   */
  public async playSound(name: string): Promise<void> {
    if (this.isMuted) return;

    const audio = this.audioCache.get(name);
    if (!audio) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    try {
      // Reset audio to beginning
      audio.currentTime = 0;
      audio.volume = this.volume;
      
      // Play the audio
      await audio.play();
    } catch (error) {
      console.warn(`Failed to play sound: ${name}`, error);
    }
  }

  /**
   * Set volume for all sounds
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('echoroom_soundVolume', this.volume.toString());
    
    // Update volume for all cached audio
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('echoroom_soundMuted', this.isMuted.toString());
    return this.isMuted;
  }

  /**
   * Get current mute state
   */
  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Initialize common sounds
   */
  public initializeSounds(): void {
    // Create simple beep sound programmatically
    this.createBeepSound();
    this.createZoomSound();
  }

  /**
   * Create a beep sound using Web Audio API
   */
  private createBeepSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      // Create audio element from the generated sound
      const canvas = document.createElement('canvas');
      const canvasCtx = canvas.getContext('2d');
      
      // For now, we'll use a simple approach with a data URL
      const beepDataUrl = this.generateBeepDataUrl();
      const audio = new Audio(beepDataUrl);
      audio.volume = this.volume;
      this.audioCache.set('beep', audio);
    } catch (error) {
      console.warn('Failed to create beep sound:', error);
    }
  }

  /**
   * Create a zoom sound using Web Audio API
   */
  private createZoomSound(): void {
    try {
      const zoomDataUrl = this.generateZoomDataUrl();
      const audio = new Audio(zoomDataUrl);
      audio.volume = this.volume;
      this.audioCache.set('zoom', audio);
    } catch (error) {
      console.warn('Failed to create zoom sound:', error);
    }
  }

  /**
   * Generate a simple beep sound as data URL
   */
  private generateBeepDataUrl(): string {
    // Simple sine wave beep
    const sampleRate = 44100;
    const duration = 0.3;
    const frequency = 800;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  /**
   * Generate a zoom sound as data URL
   */
  private generateZoomDataUrl(): string {
    // Frequency sweep for zoom effect
    const sampleRate = 44100;
    const duration = 0.5;
    const startFreq = 200;
    const endFreq = 800;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header (same as beep)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate frequency sweep
    for (let i = 0; i < samples; i++) {
      const progress = i / samples;
      const frequency = startFreq + (endFreq - startFreq) * progress;
      const envelope = Math.sin(Math.PI * progress); // Fade in and out
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * envelope * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Convenience functions
export const playBeep = () => soundManager.playSound('beep');
export const playZoom = () => soundManager.playSound('zoom');
export const toggleSoundMute = () => soundManager.toggleMute();
export const setSoundVolume = (volume: number) => soundManager.setVolume(volume);
export const isSoundMuted = () => soundManager.getMuted();
export const getSoundVolume = () => soundManager.getVolume();

// Initialize sounds when module loads
soundManager.initializeSounds();