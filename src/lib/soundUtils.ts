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
   * Initialize common sounds from actual files
   */
  public initializeSounds(): void {
    // Load actual sound files from assets
   this.preloadSound('beep', '/sounds/beep.mp3');
   this.preloadSound('zoom', '/sounds/zoom.mp3');
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
