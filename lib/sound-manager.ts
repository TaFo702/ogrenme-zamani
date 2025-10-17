class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private musicEnabled = true
  private sfxEnabled = true
  private bgMusic: HTMLAudioElement | null = null

  constructor() {
    if (typeof window !== "undefined") {
      // Load settings from localStorage
      this.musicEnabled = localStorage.getItem("musicEnabled") !== "false"
      this.sfxEnabled = localStorage.getItem("sfxEnabled") !== "false"
    }
  }

  // Preload sounds
  preloadSounds() {
    if (typeof window === "undefined") return

    // Background music (placeholder)
    this.bgMusic = new Audio("/sounds/bg-music.mp3")
    this.bgMusic.loop = true
    this.bgMusic.volume = 0.3

    // Sound effects (placeholders)
    this.sounds.set("click", new Audio("/sounds/click.wav"))
    this.sounds.set("correct", new Audio("/sounds/correct.wav"))
    this.sounds.set("wrong", new Audio("/sounds/wrong.wav"))
    this.sounds.set("cheer", new Audio("/sounds/cheer.mp3"))
  }

  playSound(soundName: string) {
    if (!this.sfxEnabled) return

    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }

  playBackgroundMusic() {
    if (!this.musicEnabled || !this.bgMusic) return

    this.bgMusic.play().catch(() => {
      // Ignore autoplay errors
    })
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause()
      this.bgMusic.currentTime = 0
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled
    localStorage.setItem("musicEnabled", String(this.musicEnabled))

    if (this.musicEnabled) {
      this.playBackgroundMusic()
    } else {
      this.stopBackgroundMusic()
    }

    return this.musicEnabled
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled
    localStorage.setItem("sfxEnabled", String(this.sfxEnabled))
    return this.sfxEnabled
  }

  isMusicEnabled() {
    return this.musicEnabled
  }

  isSFXEnabled() {
    return this.sfxEnabled
  }
}

export const soundManager = new SoundManager()
