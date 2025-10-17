export type DifficultyLevel = "Level 1 - Kolay" | "Level 2 - Orta" | "Level 3 - Zor"

const STORAGE_KEY = "learning-app-difficulty"

export const difficultyManager = {
  getDifficulty(): DifficultyLevel {
    if (typeof window === "undefined") return "Level 1 - Kolay"
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored as DifficultyLevel) || "Level 1 - Kolay"
  },

  setDifficulty(level: DifficultyLevel): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, level)
  },

  getGridSize(level: DifficultyLevel): { cols: number; pairs: number } {
    switch (level) {
      case "Level 1 - Kolay":
        return { cols: 2, pairs: 2 } // 2x2 grid
      case "Level 2 - Orta":
        return { cols: 4, pairs: 4 } // 4x2 grid
      case "Level 3 - Zor":
        return { cols: 4, pairs: 6 } // 4x3 grid
      default:
        return { cols: 2, pairs: 2 }
    }
  },
}
