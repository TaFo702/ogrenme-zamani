"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, RefreshCw } from "lucide-react"
import { soundManager } from "@/lib/sound-manager"
import { ConfettiEffect } from "@/components/confetti-effect"
import { difficultyManager } from "@/lib/difficulty-manager"
import Link from "next/link"

type CardType = {
  id: number
  value: number
  shape: string
  color: string
  isFlipped: boolean
  isMatched: boolean
}

const SHAPES = ["❤️", "⭐", "🔵", "🔺"]
const COLORS = ["#ff6b9d", "#4ecdc4", "#ffd93d", "#c4b5fd"]

export default function NumberMatchingGame() {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hintCard, setHintCard] = useState<number | null>(null)
  const [gridCols, setGridCols] = useState(4)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const difficulty = difficultyManager.getDifficulty()
    const { cols, pairs } = difficultyManager.getGridSize(difficulty)
    setGridCols(cols)

    const numbers = Array.from({ length: pairs }, (_, i) => i + 1)
    const pairsArray: CardType[] = []

    numbers.forEach((num, index) => {
      const shape = SHAPES[index % SHAPES.length]
      const color = COLORS[index % COLORS.length]

      pairsArray.push({
        id: index * 2,
        value: num,
        shape,
        color,
        isFlipped: false,
        isMatched: false,
      })

      pairsArray.push({
        id: index * 2 + 1,
        value: num,
        shape,
        color,
        isFlipped: false,
        isMatched: false,
      })
    })

    const shuffled = pairsArray.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlippedCards([])
    setIsComplete(false)
    setHintCard(null)
    soundManager.playSound("click")
  }

  const handleCardClick = (id: number) => {
    const card = cards.find((c) => c.id === id)
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return
    }

    soundManager.playSound("click")

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    setCards(newCards)

    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 1) {
      const flippedCard = newCards.find((c) => c.id === id)
      const matchingCard = newCards.find((c) => c.id !== id && c.value === flippedCard?.value && !c.isMatched)
      if (matchingCard) {
        setHintCard(matchingCard.id)
        setTimeout(() => setHintCard(null), 1000)
      }
    }

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards.find((c) => c.id === firstId)
      const secondCard = newCards.find((c) => c.id === secondId)

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        soundManager.playSound("correct")
        setTimeout(() => {
          const matchedCards = newCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c,
          )
          setCards(matchedCards)
          setFlippedCards([])

          if (matchedCards.every((c) => c.isMatched)) {
            setIsComplete(true)
            soundManager.playSound("cheer")
          }
        }, 600)
      } else {
        soundManager.playSound("wrong")
        setTimeout(() => {
          const flippedBackCards = newCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c,
          )
          setCards(flippedBackCards)
          setFlippedCards([])
        }, 1200)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100 p-6">
      <ConfettiEffect trigger={isComplete} />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-bold text-3xl md:text-4xl text-secondary">Rakamları Eşleştir</h1>
        <Link href="/">
          <Button
            size="lg"
            className="bg-white text-secondary hover:bg-white/90 rounded-full shadow-lg"
            onClick={() => soundManager.playSound("click")}
          >
            <Home className="h-6 w-6" />
          </Button>
        </Link>
      </motion.header>

      <main className="max-w-2xl mx-auto">
        <div className={`grid gap-4 mb-8`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square flex items-center justify-center cursor-pointer
                  transition-all duration-500 hover:scale-105 relative
                  ${card.isFlipped || card.isMatched ? "bg-white" : "bg-secondary"}
                  ${card.isMatched ? "opacity-60 ring-4 ring-success" : ""}
                  ${hintCard === card.id && !card.isFlipped ? "animate-wiggle ring-4 ring-accent" : ""}
                  ${flippedCards.includes(card.id) && !card.isMatched ? "ring-4 ring-primary" : ""}
                `}
                style={{
                  transform: card.isFlipped || card.isMatched ? "rotateY(0deg)" : "rotateY(0deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <AnimatePresence mode="wait">
                  {card.isFlipped || card.isMatched ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: 90 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center"
                    >
                      {card.id % 2 === 0 ? (
                        <span className="font-bold text-6xl" style={{ color: card.color }}>
                          {card.value}
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 justify-center items-center p-2">
                          {Array.from({ length: card.value }).map((_, i) => (
                            <span key={i} className="text-3xl">
                              {card.shape}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 0 }}
                      className="text-6xl text-white"
                    >
                      ?
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={initializeGame}
            size="lg"
            className="bg-secondary text-white hover:bg-secondary/90 rounded-full shadow-xl text-xl px-8"
          >
            <RefreshCw className="mr-2 h-6 w-6" />
            Yeni Oyun
          </Button>
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
            >
              <Card className="p-12 bg-white text-center max-w-md mx-4 shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="font-bold text-4xl text-primary mb-4">Tebrikler!</h2>
                <p className="text-2xl text-foreground mb-2">Hepsini buldun!</p>
                <p className="text-xl text-muted-foreground mb-8">Aferin sana! 👏</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={initializeGame}
                    size="lg"
                    className="bg-secondary text-white hover:bg-secondary/90 rounded-full text-xl"
                  >
                    Tekrar Oyna
                  </Button>
                  <Link href="/">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full text-xl bg-transparent"
                      onClick={() => soundManager.playSound("click")}
                    >
                      Ana Sayfa
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
