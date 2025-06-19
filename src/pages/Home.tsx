"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Smile, Heart, Coffee, Star, Moon, Sun, Sparkles, Users, Clock } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import FloatingParticles from "../components/floating-particles"
import ElevenLabsConvoAIWidget from "../components/ElevenLabsConvoAIWidget"
import SoundToggle from "../components/ui/SoundToggle"

export default function HomePage() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const debug = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev.slice(-4), `${timestamp}: ${msg}`])
  }

  const moodOptions = [
    {
      title: "Hopeful",
      desc: "Looking forward with optimism",
      color: "text-[#FFE66D]",
      bg: "from-[#FFE66D]/20 to-[#FFB4A2]/20",
      icon: <Sun className="h-10 w-10" />,
    },
    {
      title: "Lonely",
      desc: "Seeking connection and understanding",
      color: "text-[#8E9AAF]",
      bg: "from-[#8E9AAF]/20 to-[#A3C4BC]/20",
      icon: <Moon className="h-10 w-10" />,
    },
    {
      title: "Motivated",
      desc: "Ready to take on challenges",
      color: "text-[#FFB4A2]",
      bg: "from-[#FFB4A2]/20 to-[#FFE66D]/20",
      icon: <Star className="h-10 w-10" />,
    },
    {
      title: "Calm",
      desc: "Finding peace in the moment",
      color: "text-[#A3C4BC]",
      bg: "from-[#A3C4BC]/20 to-[#8E9AAF]/20",
      icon: <Coffee className="h-10 w-10" />,
    },
    {
      title: "Loving",
      desc: "Embracing warmth and compassion",
      color: "text-pink-300",
      bg: "from-pink-300/20 to-[#FFB4A2]/20",
      icon: <Heart className="h-10 w-10" />,
    },
    {
      title: "Joyful",
      desc: "Celebrating life's beautiful moments",
      color: "text-yellow-300",
      bg: "from-yellow-300/20 to-[#FFE66D]/20",
      icon: <Smile className="h-10 w-10" />,
    },
  ]

  const stats = [
    { icon: <Users className="h-6 w-6" />, label: "Active Members", value: "5.3K+" },
    { icon: <Clock className="h-6 w-6" />, label: "Daily Sessions", value: "847" },
    { icon: <Sparkles className="h-6 w-6" />, label: "Satisfaction Rate", value: "94%" },
  ]

  const handleMoodClick = (m: string) => {
    debug(`Mood: ${m}`)
    setMood(m)
    navigate(`/welcome?mood=${encodeURIComponent(m.toLowerCase())}`)
  }

  return (
    <div className="aurora-bg grid-pattern min-h-screen relative">
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Sound Toggle */}
      <SoundToggle className="fixed top-4 left-4 z-50" />

      <div className="relative z-10 flex flex-col items-center pt-20 pb-10 min-h-screen p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            Welcome to <span className="text-gradient">EchoRoom</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#D8E2DC] max-w-2xl mx-auto">
            A safe space to share, connect, and grow. <span className="text-[#FFB4A2]">Speak freely. Heal deeply.</span>
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {stats.map(({ icon, label, value }) => (
            <div key={label} className="glass-card flex items-center gap-3 px-6 py-4 rounded-2xl">
              <div className="text-[#A3C4BC]">{icon}</div>
              <div>
                <div className="text-white font-bold text-xl">{value}</div>
                <div className="text-sm text-[#D8E2DC]">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <Card className="enhanced-glass p-8 md:p-12 rounded-[2rem] w-full max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-6">What's your mood today?</h2>
          <p className="text-center text-lg md:text-xl text-[#D8E2DC] mb-10">
            Tap a card below that resonates with you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moodOptions.map((item) => (
              <Button
                key={item.title}
                variant="outline"
                className={`flex flex-col items-center justify-center min-h-[200px] gap-4 rounded-3xl border-2 transition-all duration-500 glass-card bg-gradient-to-br ${item.bg} ${mood === item.title ? "border-[#FFB4A2] scale-105" : "border-transparent hover:border-white/30 hover:bg-white/10"}`}
                onClick={() => handleMoodClick(item.title)}
              >
                <div className={`${item.color}`}>{item.icon}</div>
                <div className="text-white text-lg font-semibold">{item.title}</div>
                <p className="text-sm text-[#D8E2DC] text-center max-w-[200px]">{item.desc}</p>
              </Button>
            ))}
          </div>
        </Card>
      </div>
      <ElevenLabsConvoAIWidget agentId="agent_01jxcd8ch5fzd801q9k9g6q8b3" />
    </div>
  )
}