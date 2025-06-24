"use client"

import type React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import { Home, Clock, Users, Calendar, User, Sparkles, Smile, Heart, Coffee, Star, Moon, Sun, Book } from "lucide-react"

const Dashboard: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const sessionSummary = location.state?.sessionSummary

  if (!sessionSummary) {
    // If no summary, redirect to home
    navigate("/", { replace: true })
    return null
  }

  const roomCards = [
    {
      title: "Hopeful",
      description: "Looking forward with optimism",
      icon: <Sun className="h-6 w-6" />,
      path: "/welcome?mood=hopeful",
      color: "text-[#FFE66D]",
      bg: "from-[#FFE66D]/20 to-[#FFB4A2]/20",
    },
    {
      title: "Lonely",
      description: "Seeking connection and understanding",
      icon: <Moon className="h-6 w-6" />,
      path: "/welcome?mood=lonely",
      color: "text-[#8E9AAF]",
      bg: "from-[#8E9AAF]/20 to-[#A3C4BC]/20",
    },
    {
      title: "Motivated",
      description: "Ready to take on challenges",
      icon: <Star className="h-6 w-6" />,
      path: "/welcome?mood=motivated",
      color: "text-[#FFB4A2]",
      bg: "from-[#FFB4A2]/20 to-[#FFE66D]/20",
    },
    {
      title: "Calm",
      description: "Finding peace in the moment",
      icon: <Coffee className="h-6 w-6" />,
      path: "/welcome?mood=calm",
      color: "text-[#A3C4BC]",
      bg: "from-[#A3C4BC]/20 to-[#8E9AAF]/20",
    },
    {
      title: "Loving",
      description: "Embracing warmth and compassion",
      icon: <Heart className="h-6 w-6" />,
      path: "/welcome?mood=loving",
      color: "text-pink-300",
      bg: "from-pink-300/20 to-[#FFB4A2]/20",
    },
    {
      title: "Joyful",
      description: "Celebrating life's beautiful moments",
      icon: <Smile className="h-6 w-6" />,
      path: "/welcome?mood=joyful",
      color: "text-yellow-300",
      bg: "from-yellow-300/20 to-[#FFE66D]/20",
    },
    {
      title: "Books",
      description: "Share your favorite reads",
      icon: <Book className="h-6 w-6" />,
      path: "/welcome?mood=books",
      color: "text-indigo-400",
      bg: "from-indigo-400/20 to-blue-400/20",
    },
  ]

  const handleRoomClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 aurora-bg grid-pattern">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="enhanced-glass rounded-[2rem] shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                Session Complete! <Sparkles className="h-6 w-6 text-[#FFE66D]" />
              </h2>
              <p className="text-[#D8E2DC]">Ready for your next connection?</p>
            </motion.div>
          </div>

          {/* Scroll Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="p-6 space-y-6">
              {/* Session Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="enhanced-glass p-4 rounded-2xl border border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-[#A3C4BC]/20 to-[#8E9AAF]/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-[#A3C4BC]" />
                        <div>
                          <div className="text-white font-semibold text-sm capitalize">{sessionSummary.mood}</div>
                          <div className="text-[#D8E2DC] text-xs">Room</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-[#FFB4A2]/20 to-[#FFE66D]/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#FFB4A2]" />
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {Math.floor(sessionSummary.duration / 60)}m {sessionSummary.duration % 60}s
                          </div>
                          <div className="text-[#D8E2DC] text-xs">Duration</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-[#FFE66D]/20 to-[#FFB4A2]/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#FFE66D]" />
                        <div>
                          <div className="text-white font-semibold text-sm">{sessionSummary.participantsCount}</div>
                          <div className="text-[#D8E2DC] text-xs">Participants</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-pink-300/20 to-[#FFB4A2]/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-pink-300" />
                        <div>
                          <div className="text-white font-semibold text-sm truncate">{sessionSummary.userName}</div>
                          <div className="text-[#D8E2DC] text-xs">User</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-indigo-400/20 to-blue-400/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {new Date(sessionSummary.joinedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-[#D8E2DC] text-xs">Joined</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-[#8E9AAF]/20 to-[#A3C4BC]/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#8E9AAF]" />
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {new Date(sessionSummary.leftAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-[#D8E2DC] text-xs">Left</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Room Cards Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Join Another Room</h3>
                  <p className="text-[#D8E2DC]">Choose a room that matches your current mood</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {roomCards.map((room, index) => (
                    <motion.div
                      key={room.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto p-0 w-full border-0 bg-transparent hover:scale-105 transition-all duration-300"
                        onClick={() => handleRoomClick(room.path)}
                      >
                        <Card
                          className={`glass-card p-5 rounded-2xl w-full bg-gradient-to-br ${room.bg} border border-white/20 hover:border-white/30 transition-all duration-500 group min-h-[140px] flex flex-col justify-center items-center text-center hover:bg-white/10`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`${room.color} group-hover:scale-110 transition-transform duration-300`}>
                              {room.icon}
                            </div>
                            <div>
                              <div className="text-white font-semibold text-lg mb-2">{room.title}</div>
                              <div className="text-[#D8E2DC] text-sm leading-relaxed">{room.description}</div>
                            </div>
                          </div>
                        </Card>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Fixed Bottom Action */}
          <div className="border-t border-white/10 p-6 bg-black/30 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="text-[#A3C4BC] hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all duration-200 hover:scale-105 px-6 py-3 rounded-2xl font-semibold"
              >
                <Home className="h-5 w-5" />
                Back to Home
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
