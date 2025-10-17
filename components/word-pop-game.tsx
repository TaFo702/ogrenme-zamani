"use client"

import { useEffect, useRef, useState } from "react"

// components/WordPopGame.jsx
/**
 * Kelime Patlat - Balloon Pop Game (React + Tailwind)
 * Props: none (self-contained). Replace sound placeholders as needed.
 *
 * Features:
 * - Level 1/2/3 (short -> longer words)
 * - Collision-free spawn of balloons (simple retry)
 * - Touch + click support
 * - Sequence checking for target word
 * - Confetti placeholder (simple CSS)
 *
 * NOTE: Replace sound src placeholders with real audio files.
 */

const WORDS = {
  1: ["su", "ayı", "top", "ev", "bal"],
  2: ["masa", "araba", "kedi", "limon", "elma"],
  3: ["balina", "sütlaç", "kaplan", "pencere", "çocuk"],
}

const BALLOON_COLORS = ["#F8BBD0", "#80DEEA", "#FFF176", "#AED581", "#CE93D8", "#90CAF9"]

const rand = (min, max) => Math.random() * (max - min) + min

interface FallingLetter {
  id: string
  letter: string
  x: number
  y: number
  vy: number
}

function generateSpawn(existing, attempts = 0) {
  // screen area in percentage (x,y) avoid edges
  const x = rand(5, 85) // %
  const y = rand(10, 70) // %
  const size = rand(12, 20) // vw-ish percent sizing reference
  const rect = { x, y, size }
  // quick collision check (circle approx) against existing spawns
  for (const e of existing) {
    const dx = e.x - rect.x
    const dy = e.y - rect.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < (e.size + rect.size) * 0.6) {
      if (attempts > 8) return rect // give up after some tries
      return generateSpawn(existing, attempts + 1)
    }
  }
  return rect
}

export default function WordPopGame() {
  const [level, setLevel] = useState(1)
  const [target, setTarget] = useState("")
  const [targetChars, setTargetChars] = useState([])
  const [collectedIndex, setCollectedIndex] = useState(0)
  const [balloons, setBalloons] = useState([])
  const [running, setRunning] = useState(true)
  const containerRef = useRef(null)
  const [popAnim, setPopAnim] = useState(null)
  const audioRef = useRef({
    pop: null,
    wrong: null,
    success: null,
    pick: null,
  })
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([])

  useEffect(() => {
    // preload audio (replace sources with real files)
    audioRef.current.pop = new Audio("/sounds/pop.mp3") // placeholder
    audioRef.current.wrong = new Audio("/sounds/wrong.mp3")
    audioRef.current.success = new Audio("/sounds/success.mp3")
    audioRef.current.pick = new Audio("/sounds/pick.mp3")
  }, [])

  useEffect(() => {
    pickNewWord(level)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  useEffect(() => {
    if (!target) return
    spawnBalloonsForTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, level])

  useEffect(() => {
    let raf
    let last = performance.now()
    function tick(now) {
      const dt = (now - last) / 1000
      last = now
      setBalloons((prev) =>
        prev.map((b) => {
          let nx = b.x + b.vx * dt * 10
          let ny = b.y + b.vy * dt * 10
          let nvx = b.vx
          let nvy = b.vy

          // Bounce off edges
          if (nx < 5) {
            nx = 5
            nvx = Math.abs(nvx)
          }
          if (nx > 90) {
            nx = 90
            nvx = -Math.abs(nvx)
          }
          if (ny < 5) {
            ny = 5
            nvy = Math.abs(nvy)
          }
          if (ny > 75) {
            ny = 75
            nvy = -Math.abs(nvy)
          }

          // Random direction changes
          if (Math.random() < 0.02) {
            nvx += rand(-0.2, 0.2)
            nvy += rand(-0.1, 0.1)
          }

          // Clamp velocity
          nvx = Math.max(-0.8, Math.min(0.8, nvx))
          nvy = Math.max(-0.5, Math.min(0.3, nvy))

          // String physics - swings opposite to movement direction
          const stringAngle = Math.sin(now / 300 + b.x) * 8 + nvx * 15

          return { ...b, x: nx, y: ny, vx: nvx, vy: nvy, stringAngle }
        }),
      )

      // Animate falling letters
      setFallingLetters(
        (prev) =>
          prev
            .map((fl) => ({
              ...fl,
              y: fl.y + fl.vy * dt * 50,
              vy: fl.vy + 0.5, // gravity
            }))
            .filter((fl) => fl.y < 100), // remove when off screen
      )

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [])

  function pickNewWord(lvl = 1) {
    const list = WORDS[lvl] || WORDS[1]
    const w = list[Math.floor(Math.random() * list.length)].toUpperCase()
    setTarget(w)
    setTargetChars(w.split(""))
    setCollectedIndex(0)
    setPopAnim(null)
  }

  function spawnBalloonsForTarget() {
    const base = level === 1 ? 8 : level === 2 ? 12 : 16
    const total = base
    const existing = []
    const charsNeeded = [...targetChars]
    const lettersPool = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"
    const newB = []

    for (const ch of charsNeeded) {
      const pos = generateSpawn(existing)
      existing.push(pos)
      newB.push({
        id: cryptoRandomId(),
        letter: ch,
        x: pos.x,
        y: pos.y,
        size: pos.size,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        vx: rand(-0.5, 0.5),
        vy: rand(-0.3, -0.1), // balloons float upward
        stringAngle: 0, // for string physics
      })
    }

    while (newB.length < total) {
      const pos = generateSpawn(existing)
      existing.push(pos)
      const r = lettersPool[Math.floor(Math.random() * lettersPool.length)]
      newB.push({
        id: cryptoRandomId(),
        letter: r,
        x: pos.x,
        y: pos.y,
        size: pos.size,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        vx: rand(-0.5, 0.5),
        vy: rand(-0.3, -0.1),
        stringAngle: 0,
      })
    }
    setBalloons(newB)
  }

  function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9)
  }

  function onBalloonTap(bid) {
    if (!running) return
    const b = balloons.find((bb) => bb.id === bid)
    if (!b) return
    const expected = targetChars[collectedIndex]
    if (b.letter === expected) {
      audioRef.current.pop?.play().catch(() => {})
      setCollectedIndex((i) => i + 1)

      setFallingLetters((prev) => [...prev, { id: cryptoRandomId(), letter: b.letter, x: b.x, y: b.y, vy: 0 }])

      setBalloons((prev) => prev.filter((p) => p.id !== bid))
      setPopAnim({ id: bid, x: b.x, y: b.y, letter: b.letter })

      if (collectedIndex + 1 >= targetChars.length) {
        setRunning(false)
        setTimeout(() => {
          audioRef.current.success?.play().catch(() => {})
          setPopAnim({ ...popAnim, success: true })
        }, 250)
      } else {
        audioRef.current.pick?.play().catch(() => {})
      }
    } else {
      audioRef.current.wrong?.play().catch(() => {})
      setBalloons((prev) => prev.map((p) => (p.letter === expected ? { ...p, vy: p.vy - 0.5 } : p)))
    }
  }

  function handleNewWord() {
    pickNewWord(level)
    setRunning(true)
    setFallingLetters([])
    spawnBalloonsForTarget()
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-[#FFF8E1] to-white flex flex-col items-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-center w-full text-[#374151]">Kelime Patlat!</h1>
        </div>

        {/* Level select and target */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Seviye:</label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="p-2 rounded-lg bg-white shadow"
            >
              <option value={1}>Level 1 - Kolay</option>
              <option value={2}>Level 2 - Orta</option>
              <option value={3}>Level 3 - Zor</option>
            </select>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Kelime</div>
            <div className="text-lg font-semibold">{target}</div>
          </div>
        </div>

        {/* Game area */}
        <div
          ref={containerRef}
          className="relative w-full h-[60vh] rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-b from-[#e6f7ff] to-[#fff] shadow-inner"
        >
          <div className="absolute left-3 top-3 opacity-20">☁️ ☁️</div>

          {balloons.map((b) => (
            <button
              key={b.id}
              onClick={() => onBalloonTap(b.id)}
              onTouchStart={() => onBalloonTap(b.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}vmin`,
                height: `${b.size * 1.4}vmin`,
              }}
              aria-label={`harf ${b.letter}`}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 140"
                className="drop-shadow-lg hover:scale-110 transition-transform"
              >
                {/* String */}
                <line
                  x1="50"
                  y1="95"
                  x2={50 + b.stringAngle}
                  y2="135"
                  stroke="#8B4513"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Balloon body */}
                <ellipse cx="50" cy="50" rx="35" ry="45" fill={b.color} stroke="#333" strokeWidth="1.5" />

                {/* Balloon knot */}
                <ellipse cx="50" cy="92" rx="6" ry="8" fill={b.color} stroke="#333" strokeWidth="1.5" />

                {/* Shine effect */}
                <ellipse cx="38" cy="35" rx="12" ry="18" fill="white" opacity="0.4" />

                {/* Letter */}
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fontSize="28"
                  fontWeight="bold"
                  fill="#333"
                  className="select-none pointer-events-none"
                >
                  {b.letter}
                </text>
              </svg>
            </button>
          ))}

          {fallingLetters.map((fl) => (
            <div
              key={fl.id}
              className="absolute text-3xl font-bold pointer-events-none animate-fall"
              style={{
                left: `${fl.x}%`,
                top: `${fl.y}%`,
                transform: "translate(-50%, -50%)",
                opacity: Math.max(0, 1 - fl.y / 100),
              }}
            >
              {fl.letter}
            </div>
          ))}

          {popAnim && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${popAnim.x}%`,
                top: `${popAnim.y}%`,
                transform: "translate(-50%,-50%)",
              }}
            >
              {!popAnim.success ? (
                <div className="relative">
                  <div className="text-4xl font-bold text-yellow-500 animate-burst">💥</div>
                  <div className="absolute inset-0 animate-ping opacity-75">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
              ) : (
                <div className="text-3xl animate-bounce">🎉</div>
              )}
            </div>
          )}
        </div>

        {/* Target progress */}
        <div className="mt-3 bg-white p-3 rounded-lg shadow flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Sıradaki Harf:</div>
            <div className="text-lg font-medium">{targetChars[collectedIndex] || "—"}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Durum</div>
            <div className="text-lg font-semibold">
              {running ? `${collectedIndex}/${targetChars.length}` : "Tamamlandı!"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleNewWord}
            className="flex-1 bg-[#80DEEA] text-white py-3 rounded-lg font-semibold shadow hover:scale-105 transform transition"
          >
            Yeni Kelime
          </button>
          <button
            onClick={() => {
              setTarget("")
              pickNewWord(level)
              setRunning(true)
              setFallingLetters([])
              spawnBalloonsForTarget()
            }}
            className="w-16 bg-white p-3 rounded-lg shadow"
            title="Yeniden yerleştir"
          >
            🔄
          </button>
        </div>

        {/* Footer - large space for mobile */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Dokun veya tıkla — doğru harfe basınca balon patlar!
        </div>
      </div>

      <style jsx>{`
        .animate-pop {
          animation: pop 300ms ease-out;
        }
        .animate-burst {
          animation: burst 400ms ease-out;
        }
        .animate-fall {
          animation: fall 1.5s ease-in;
        }
        @keyframes pop {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          60% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes burst {
          0% {
            transform: scale(0.5) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(2) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes fall {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, 100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
