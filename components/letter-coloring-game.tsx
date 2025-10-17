"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, ChevronLeft, ChevronRight, Eraser } from "lucide-react"
import { soundManager } from "@/lib/sound-manager"
import Link from "next/link"

// Full Turkish alphabet
const TURKISH_LETTERS = [
  "A",
  "B",
  "C",
  "Ç",
  "D",
  "E",
  "F",
  "G",
  "Ğ",
  "H",
  "I",
  "İ",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "Ö",
  "P",
  "R",
  "S",
  "Ş",
  "T",
  "U",
  "Ü",
  "V",
  "Y",
  "Z",
]

const COLORS = [
  { name: "Kırmızı", value: "#ef4444" },
  { name: "Mavi", value: "#3b82f6" },
  { name: "Sarı", value: "#fbbf24" },
  { name: "Yeşil", value: "#22c55e" },
  { name: "Mor", value: "#a78bfa" },
  { name: "Turuncu", value: "#f97316" },
]

const BRUSH_SIZES = [
  { name: "Küçük", value: 8 },
  { name: "Orta", value: 16 },
  { name: "Büyük", value: 24 },
]

export default function LetterColoringGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value)
  const [isDrawing, setIsDrawing] = useState(false)
  const [coloredLetters, setColoredLetters] = useState<Set<number>>(new Set())

  const currentLetter = TURKISH_LETTERS[currentLetterIndex]

  useEffect(() => {
    initializeCanvas()
  }, [currentLetterIndex])

  const initializeCanvas = () => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    ctx.globalCompositeOperation = "source-over"
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)

    ctx.font = "bold 300px Nunito"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#f3f4f6" // Light gray background for the letter
    ctx.fillText(currentLetter, canvas.width / 2, canvas.height / 2)

    // Draw letter outline
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 3
    ctx.strokeText(currentLetter, canvas.width / 2, canvas.height / 2)

    ctx.globalCompositeOperation = "source-atop"

    // Create mask on mask canvas for hit detection
    maskCtx.font = "bold 300px Nunito"
    maskCtx.textAlign = "center"
    maskCtx.textBaseline = "middle"
    maskCtx.fillStyle = "white"
    maskCtx.fillText(currentLetter, maskCanvas.width / 2, maskCanvas.height / 2)
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
  }

  const isInsideLetter = (x: number, y: number): boolean => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return false

    const maskCtx = maskCanvas.getContext("2d")
    if (!maskCtx) return false

    const pixel = maskCtx.getImageData(x, y, 1, 1).data
    return pixel[3] > 0 // Check alpha channel
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const { x, y } = getCoordinates(e)

    if (!isInsideLetter(x, y)) return

    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const { x, y } = getCoordinates(e)

    // Draw with selected color
    ctx.strokeStyle = selectedColor
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    setColoredLetters((prev) => new Set(prev).add(currentLetterIndex))
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    initializeCanvas()
    setColoredLetters((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentLetterIndex)
      return newSet
    })
    soundManager.playSound("click")
  }

  const handlePrevious = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex(currentLetterIndex - 1)
      soundManager.playSound("click")
    }
  }

  const handleNext = () => {
    if (currentLetterIndex < TURKISH_LETTERS.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1)
      soundManager.playSound("click")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="font-bold text-3xl md:text-4xl text-primary">Harfleri Boya</h1>
        <Link href="/">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 rounded-full shadow-lg"
            onClick={() => soundManager.playSound("click")}
          >
            <Home className="h-6 w-6" />
          </Button>
        </Link>
      </motion.header>

      <main className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h3 className="font-bold text-xl text-primary mb-4">Harfler</h3>
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
            {TURKISH_LETTERS.map((letter, index) => (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentLetterIndex(index)
                  soundManager.playSound("click")
                }}
                className={`
                  aspect-square rounded-lg font-bold text-xl transition-all duration-200
                  ${currentLetterIndex === index ? "bg-primary text-white ring-4 ring-primary/30" : "bg-white text-primary"}
                  ${coloredLetters.has(index) ? "ring-2 ring-green-500" : ""}
                  hover:shadow-lg
                `}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Color Palette */}
        <Card className="p-6">
          <h3 className="font-bold text-xl text-primary mb-4">Renk Seç</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {COLORS.map((color) => (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedColor(color.value)
                  soundManager.playSound("click")
                }}
                className={`
                  w-16 h-16 rounded-full transition-all duration-200
                  ${selectedColor === color.value ? "ring-4 ring-offset-4 ring-foreground scale-110" : ""}
                `}
                style={{ backgroundColor: color.value }}
                aria-label={color.name}
              />
            ))}
          </div>
        </Card>

        {/* Brush Size */}
        <Card className="p-6">
          <h3 className="font-bold text-xl text-primary mb-4">Fırça Boyutu</h3>
          <div className="flex gap-4 justify-center">
            {BRUSH_SIZES.map((size) => (
              <Button
                key={size.value}
                onClick={() => {
                  setBrushSize(size.value)
                  soundManager.playSound("click")
                }}
                size="lg"
                variant={brushSize === size.value ? "default" : "outline"}
                className="rounded-full"
              >
                {size.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Canvas */}
        <Card className="p-8 bg-white">
          <div className="flex justify-center mb-4 relative">
            <canvas ref={maskCanvasRef} width={400} height={400} className="absolute invisible" />
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="border-4 border-dashed border-muted rounded-2xl cursor-crosshair touch-none"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
          <p className="text-center text-lg text-muted-foreground">Harfin içini boyamak için çiz!</p>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentLetterIndex === 0}
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Harf</p>
            <p className="font-bold text-4xl text-primary">{currentLetter}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentLetterIndex + 1} / {TURKISH_LETTERS.length}
            </p>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentLetterIndex === TURKISH_LETTERS.length - 1}
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 rounded-full disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Clear Button */}
        <div className="flex justify-center">
          <Button onClick={clearCanvas} size="lg" variant="outline" className="rounded-full text-xl px-8 bg-white">
            <Eraser className="mr-2 h-6 w-6" />
            Temizle
          </Button>
        </div>
      </main>
    </div>
  )
}
