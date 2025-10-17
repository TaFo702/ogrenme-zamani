"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Music, Volume2, VolumeX, Settings } from "lucide-react"
import { soundManager } from "@/lib/sound-manager"
import { difficultyManager, type DifficultyLevel } from "@/lib/difficulty-manager"
import Link from "next/link"

export default function HomePage() {
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Level 1 - Kolay")

  useEffect(() => {
    soundManager.preloadSounds()
    setMusicEnabled(soundManager.isMusicEnabled())
    setSfxEnabled(soundManager.isSFXEnabled())
    setDifficulty(difficultyManager.getDifficulty())
  }, [])

  const handleToggleMusic = () => {
    const enabled = soundManager.toggleMusic()
    setMusicEnabled(enabled)
    soundManager.playSound("click")
  }

  const handleToggleSFX = () => {
    const enabled = soundManager.toggleSFX()
    setSfxEnabled(enabled)
  }

  const handleButtonClick = () => {
    soundManager.playSound("click")
  }

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = e.target.value as DifficultyLevel
    setDifficulty(newDifficulty)
    difficultyManager.setDifficulty(newDifficulty)
    soundManager.playSound("click")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 p-6 flex flex-col">
      {/* Header with Title */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 pt-8"
      >
       <h1 className="font-extrabold text-5xl md:text-6xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2 text-balance">
  Öğrenme Zamanı v2
</h1>
        <p className="text-xl text-muted-foreground font-semibold">Hadi öğrenmeye başlayalım!</p>
      </motion.header>

      {/* Difficulty Selector Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="max-w-md mx-auto w-full mb-8"
      >
        <label htmlFor="difficulty" className="block text-center text-lg font-semibold mb-3 text-foreground">
          Zorluk Seç:
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={handleDifficultyChange}
          className="w-full h-14 text-xl font-semibold bg-white text-foreground rounded-2xl shadow-lg border-4 border-primary/30 px-4 cursor-pointer hover:border-primary/50 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          <option value="Level 1 - Kolay">Level 1 - Kolay</option>
          <option value="Level 2 - Orta">Level 2 - Orta</option>
          <option value="Level 3 - Zor">Level 3 - Zor</option>
        </select>
      </motion.div>

      {/* Main Game Buttons */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full"
        >
          <Link href="/letters" onClick={handleButtonClick}>
            <Button
              size="lg"
              className="w-full h-28 text-3xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
            >
              <span className="text-5xl mr-4">🔤</span>
              Harfleri Eşleştir
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full"
        >
          <Link href="/numbers" onClick={handleButtonClick}>
            <Button
              size="lg"
              className="w-full h-28 text-3xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
            >
              <span className="text-5xl mr-4">🔢</span>
              Rakamları Eşleştir
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full"
        >
          <Link href="/paint" onClick={handleButtonClick}>
            <Button
              size="lg"
              className="w-full h-28 text-3xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
            >
              <span className="text-5xl mr-4">🎨</span>
              Harfleri Boya
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-full"
        >
          <Link href="/word-pop" onClick={handleButtonClick}>
            <Button
              size="lg"
              className="w-full h-28 text-3xl font-bold bg-success text-white hover:bg-success/90 rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
            >
              <span className="text-5xl mr-4">🎈</span>
              Kelime Patlat
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="w-full"
        >
          <Link href="/number-pop" onClick={handleButtonClick}>
            <Button
              size="lg"
              className="w-full h-28 text-3xl font-bold bg-purple-400 text-white hover:bg-purple-500 rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
            >
              <span className="text-5xl mr-4">🎈</span>
              Rakam Patlat
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Settings Button */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center gap-4 pb-8"
      >
        <Button
          onClick={() => {
            setShowSettings(!showSettings)
            soundManager.playSound("click")
          }}
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 bg-white/80 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
        >
          <Settings className="h-8 w-8 text-primary" />
        </Button>
      </motion.footer>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl p-6 z-50 w-80"
        >
          <h3 className="font-bold text-2xl text-center mb-4 text-primary">Ayarlar</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg flex items-center gap-2">
                <Music className="h-6 w-6" />
                Müzik
              </span>
              <Button
                onClick={handleToggleMusic}
                size="lg"
                variant={musicEnabled ? "default" : "outline"}
                className="rounded-full"
              >
                {musicEnabled ? "Açık" : "Kapalı"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg flex items-center gap-2">
                {sfxEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                Ses Efektleri
              </span>
              <Button
                onClick={handleToggleSFX}
                size="lg"
                variant={sfxEnabled ? "default" : "outline"}
                className="rounded-full"
              >
                {sfxEnabled ? "Açık" : "Kapalı"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
