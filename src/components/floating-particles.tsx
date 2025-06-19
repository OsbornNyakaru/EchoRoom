"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; size: number; delay: number }>>([])

  useEffect(() => {
    // Only create particles on client side to avoid hydration issues
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 10,
    }))
    setParticles(newParticles)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="floating-particles">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [typeof window !== "undefined" ? window.innerHeight + 100 : 1000, -100],
            x: [0, Math.sin(particle.id) * 50],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
