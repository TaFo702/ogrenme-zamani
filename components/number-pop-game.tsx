"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { soundManager } from "@/lib/sound-manager"
import { ConfettiEffect } from "@/components/confetti-effect"
import Link from "next/link"

interface Balloon {
  id: string
  value: number
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  stringSwing: number
  wobblePhase: number
  wobbleSpeed: number
  directionChangeTimer: number
}

interface PoppedBalloon {
  id: string
  x: number
  y: number
  value: number
}

const BALLOON_COLORS = ["#F8BBD0", "#80DEEA", "#FFF176", "#AED581", "#CE93D8", "#90CAF9"]

const rand = (min: number, max: number) => Math.random() * (max - min) + min

function generateSpawn(existing: Balloon[], attempts = 0): { x: number; y: number; size: number } {
  const x = rand(10, 85)
  const y = rand(15, 75)
  const size = rand(60, 90)
  const rect = { x, y, size }

  for (const e of existing) {
    const dx = e.x - rect.x
    const dy = e.y - rect.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < (e.size + rect.size) * 0.06) {
      if (attempts > 8) return rect
      return generateSpawn(existing, attempts + 1)
    }
  }
  return rect
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function NumberPopGame() {
  const [level, setLevel] = useState(1)
  const [targetNumbers, setTargetNumbers] = useState<number[]>([])
  const [collectedIndex, setCollectedIndex] = useState(0)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [poppedBalloons, setPoppedBalloons] = useState<PoppedBalloon[]>([])
  const [running, setRunning] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    pickTargetNumbers(level)
  }, [level])

  useEffect(() => {
    if (!targetNumbers.length) return
    spawnBalloons()
  }, [targetNumbers])

  function pickTargetNumbers(lvl: number) {
    const count = lvl === 1 ? 5 : lvl === 2 ? 10 : 20
    const arr = []
    for (let i = 1; i <= count; i++) arr.push(i)
    setTargetNumbers(arr)
    setCollectedIndex(0)
  }

  function spawnBalloons() {
    const total = targetNumbers.length + 5
    const existing: Balloon[] = []
    const newB: Balloon[] = []

    for (const n of targetNumbers) {
      const pos = generateSpawn(existing)
      const balloon: Balloon = {
        id: cryptoRandomId(),
        value: n,
        x: pos.x,
        y: pos.y,
        size: pos.size,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        vx: rand(-0.8, 0.8),
        vy: rand(-0.6, 0.3),
        stringSwing: 0,
        wobblePhase: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.5, 1.5),
        directionChangeTimer: rand(2, 5),
      }
      existing.push(balloon)
      newB.push(balloon)
    }

    while (newB.length < total) {
      const pos = generateSpawn(existing)
      const r = Math.floor(rand(1, 21))
      const balloon: Balloon = {
        id: cryptoRandomId(),
        value: r,
        x: pos.x,
        y: pos.y,
        size: pos.size,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        vx: rand(-0.8, 0.8),
        vy: rand(-0.6, 0.3),
        stringSwing: 0,
        wobblePhase: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.5, 1.5),
        directionChangeTimer: rand(2, 5),
      }
      existing.push(balloon)
      newB.push(balloon)
    }

    setBalloons(newB)
    setRunning(true)
    setShowSuccess(false)
  }

  function onBalloonTap(bid: string, x: number, y: number) {
    if (!running) return
    const b = balloons.find((bb) => bb.id === bid)
    if (!b) return

    const expected = targetNumbers[collectedIndex]

    if (b.value === expected) {
      soundManager.playSound("success")
      setPoppedBalloons((prev) => [...prev, { id: bid, x, y, value: b.value }])
      setCollectedIndex((i) => i + 1)
      setBalloons((prev) => prev.filter((p) => p.id !== bid))

      if (collectedIndex + 1 >= targetNumbers.length) {
        setRunning(false)
        setShowSuccess(true)
        setTimeout(() => soundManager.playSound("success"), 250)
      }
    } else {
      soundManager.playSound("wrong")
    }
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePos({ x, y })
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (containerRef.current && e.touches.length > 0) {
        const rect = containerRef.current.getBoundingClientRect()
        const touch = e.touches[0]
        const x = ((touch.clientX - rect.left) / rect.width) * 100
        const y = ((touch.clientY - rect.top) / rect.height) * 100
        setMousePos({ x, y })
      }
    }

    function handleMouseLeave() {
      setMousePos({ x: -1000, y: -1000 })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("touchmove", handleTouchMove)
      container.addEventListener("mouseleave", handleMouseLeave)
      return () => {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  useEffect(() => {
    let raf: number
    let last = performance.now()

    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now

      setBalloons((prev) =>
        prev.map((b) => {
          let nvx = b.vx
          let nvy = b.vy
          let directionTimer = b.directionChangeTimer - dt

          if (directionTimer <= 0) {
            nvx += rand(-0.3, 0.3)
            nvy += rand(-0.3, 0.3)
            nvx = Math.max(-1, Math.min(1, nvx))
            nvy = Math.max(-0.8, Math.min(0.5, nvy))
            directionTimer = rand(2, 5)
          }

          const dx = b.x - mousePos.x
          const dy = b.y - mousePos.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const fleeRadius = 15

          if (dist < fleeRadius && dist > 0) {
            const fleeStrength = ((fleeRadius - dist) / fleeRadius) * 0.5
            nvx += (dx / dist) * fleeStrength
            nvy += (dy / dist) * fleeStrength
            nvx = Math.max(-1.2, Math.min(1.2, nvx))
            nvy = Math.max(-1, Math.min(0.8, nvy))
          }

          let nx = b.x + nvx * dt * 10
          let ny = b.y + nvy * dt * 10

          if (nx < 8) {
            nx = 8
            nvx = Math.abs(nvx) * 0.8
          }
          if (nx > 92) {
            nx = 92
            nvx = -Math.abs(nvx) * 0.8
          }
          if (ny < 10) {
            ny = 10
            nvy = Math.abs(nvy) * 0.8
          }
          if (ny > 80) {
            ny = 80
            nvy = -Math.abs(nvy) * 0.8
          }

          const wobble = Math.sin((now / 1000) * b.wobbleSpeed + b.wobblePhase) * 0.4
          nx += wobble

          const stringSwing = Math.sin(now / 400 + b.wobblePhase) * (Math.abs(nvx) * 8)

          return {
            ...b,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            stringSwing,
            directionChangeTimer: directionTimer,
          }
        }),
      )

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mousePos])

  function handleNewGame() {
    spawnBalloons()
    setCollectedIndex(0)
    setRunning(true)
    setPoppedBalloons([])
    soundManager.playSound("click")
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col items-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-4xl font-bold text-primary mb-2">Rakam Patlat!</h1>
          <p className="text-lg text-muted-foreground">Rakamları sırayla patlatın</p>
        </motion.div>

        <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Seviye:</label>
            <select
              value={level}
              onChange={(e) => {
                setLevel(Number(e.target.value))
                soundManager.playSound("click")
              }}
              className="px-4 py-2 rounded-xl bg-secondary text-white font-semibold shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
              <option value={1}>Level 1 (1-5)</option>
              <option value={2}>Level 2 (1-10)</option>
              <option value={3}>Level 3 (1-20)</option>
            </select>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-medium">Sıradaki Rakam:</div>
            <div className="text-3xl font-bold text-primary">{targetNumbers[collectedIndex] || "—"}</div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[65vh] rounded-3xl overflow-hidden border-4 border-primary/20 bg-gradient-to-b from-[#e6f7ff] to-[#fff] shadow-2xl"
        >
          {balloons.map((b) => (
            <motion.div
              key={b.id}
              className="absolute cursor-pointer"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  const x = (b.x / 100) * rect.width
                  const y = (b.y / 100) * rect.height
                  onBalloonTap(b.id, x, y)
                }
              }}
            >
              <svg width={b.size} height={b.size * 1.2} viewBox="0 0 100 120" className="drop-shadow-lg">
                <path
                  d={`M 50 95 Q ${50 + b.stringSwing} 105 ${50 + b.stringSwing * 1.5} 115`}
                  stroke="#666"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <ellipse cx="50" cy="45" rx="35" ry="42" fill={b.color} stroke="#fff" strokeWidth="2" />
                <ellipse cx="50" cy="45" rx="35" ry="42" fill="url(#balloonGradient)" opacity="0.3" />
                <ellipse cx="50" cy="87" rx="8" ry="6" fill={b.color} />
                <path d="M 50 87 L 50 95" stroke={b.color} strokeWidth="3" strokeLinecap="round" />
                <ellipse cx="38" cy="30" rx="12" ry="18" fill="white" opacity="0.4" />
                <defs>
                  <radialGradient id="balloonGradient">
                    <stop offset="0%" stopColor="white" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ top: "-10%" }}
              >
                <span className="text-white font-bold drop-shadow-md" style={{ fontSize: `${b.size * 0.35}px` }}>
                  {b.value}
                </span>
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {poppedBalloons.map((pb) => (
              <motion.div
                key={pb.id}
                className="absolute pointer-events-none"
                style={{ left: pb.x, top: pb.y }}
                initial={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                animate={{ scale: 0.5, opacity: 0, y: 200, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeIn" }}
                onAnimationComplete={() => {
                  setPoppedBalloons((prev) => prev.filter((p) => p.id !== pb.id))
                }}
              >
                <div className="text-6xl font-bold text-primary drop-shadow-lg">{pb.value}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {showSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-bold text-success mb-2">Aferin!</h2>
                <p className="text-xl text-muted-foreground">Tüm rakamları doğru sırayla patlattın!</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleNewGame}
            size="lg"
            className="flex-1 bg-secondary text-white py-6 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform"
          >
            Yeni Oyun
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="py-6 px-8 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform bg-transparent"
              onClick={() => soundManager.playSound("click")}
            >
              <Home className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-sm text-gray-400 text-center">
          Balonlara dokun veya tıkla — doğru sırayla patlatın!
        </div>
      </div>

      {showSuccess && <ConfettiEffect />}
    </div>
  )
}
