"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Smile, Heart, Coffee, Star, Moon, Sun, Book, Home, Bot, Info, Shield, Zap, MessageCircle, Github, Twitter, Mail, ArrowUp, Target, Lightbulb, Globe } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import FloatingParticles from "../components/floating-particles"
import ElevenLabsConvoAIWidget from "../components/ElevenLabsConvoAIWidget"
import SoundToggle from "../components/ui/SoundToggle"

export default function HomePage() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<string | null>(null)

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
    {
      title: "Books",
      desc: "Share your favorite reads.",
      color: "text-indigo-400",
      bg: "from-indigo-400/20 to-blue-400/20",
      icon: <Book className="h-10 w-10" />,
    },
  ]

  const stats = [
    { icon: <Target className="h-6 w-6" />, label: "Mood Categories", value: "7+ Moods" },
    { icon: <Lightbulb className="h-6 w-6" />, label: "Tavus + ElevenLabs, Mistral", value: "AI-Integration" },
    { icon: <Globe className="h-6 w-6" />, label: "Global Reach", value: "24/7 Access" },
  ]

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe & Anonymous",
      description: "Your privacy is our priority. Connect without revealing your identity.",
      color: "text-[#A3C4BC]",
      bg: "from-[#A3C4BC]/20 to-[#8E9AAF]/20"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Real Conversations",
      description: "Engage in meaningful discussions with people who understand.",
      color: "text-[#FFB4A2]",
      bg: "from-[#FFB4A2]/20 to-[#FFE66D]/20"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Connection",
      description: "Find your tribe in seconds based on your current mood and feelings.",
      color: "text-[#FFE66D]",
      bg: "from-[#FFE66D]/20 to-[#FFB4A2]/20"
    }
  ]

  const handleMoodClick = (m: string) => {
    setMood(m)
    navigate(`/welcome?mood=${encodeURIComponent(m.toLowerCase())}`)
  }

  const scrollToRooms = () => {
    const roomsSection = document.querySelector('.rooms-section')
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('.about-section')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Enhanced home navigation function
  const handleHomeClick = () => {
    // If we're on a different page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/')
      // Small delay to ensure navigation completes before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      // If we're already on the home page, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Get current year dynamically
  const currentYear = new Date().getFullYear()

  // Social media links with their respective colors and animations
  const socialLinks = [
    {
      icon: Twitter,
      href: "https://twitter.com/echoroom",
      color: "#1DA1F2",
      hoverColor: "#0d8bd9",
      name: "Twitter"
    },
    {
      icon: Github,
      href: "https://github.com/echoroom",
      color: "#333",
      hoverColor: "#24292e",
      name: "GitHub"
    },
    {
      icon: Mail,
      href: "mailto:hello@echoroom.com",
      color: "#EA4335",
      hoverColor: "#d33b2c",
      name: "Email"
    }
  ]

  return (
    <div className="aurora-bg grid-pattern min-h-screen relative">
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Compact Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Logo/Brand - Smaller */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#FFB4A2] to-[#A3C4BC] rounded-lg flex items-center justify-center">
                <Home className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-bold text-sm">EchoRoom</span>
            </div>

            {/* Navigation Icons Only with Tooltips */}
            <div className="flex items-center gap-1">
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 w-8 h-8 p-0 transition-all duration-200"
                  onClick={handleHomeClick}
                >
                  <Home className="w-4 h-4" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10">
                  Home
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 w-8 h-8 p-0 transition-all duration-200"
                  onClick={scrollToRooms}
                >
                  <Bot className="w-4 h-4" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10">
                  Popular Rooms
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 w-8 h-8 p-0 transition-all duration-200"
                  onClick={scrollToAbout}
                >
                  <Info className="w-4 h-4" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10">
                  About
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sound Toggle */}
      <SoundToggle className="fixed top-16 left-4 z-50" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-10 min-h-screen p-6 md:p-10">
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

        <Card className="enhanced-glass p-8 md:p-12 rounded-[2rem] w-full max-w-5xl rooms-section">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-6">What's your mood today?</h2>
          <p className="text-center text-lg md:text-xl text-[#D8E2DC] mb-10">
            Tap a card below that resonates with you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const books = moodOptions.find((item) => item.title === "Books");
              const others = moodOptions.filter((item) => item.title !== "Books");
              const total = moodOptions.length;
              // Mobile: 1 column, just render all in order
              // Tablet: 2 columns, center Books if odd number of cards
              // Desktop: 3 columns, center Books in last row
              if (typeof window !== 'undefined' && window.innerWidth < 640) {
                // Mobile
                return [...others, books].filter(Boolean).map((item) => (
                  <Button
                    key={item!.title}
                    variant="outline"
                    className={`flex flex-col items-center justify-center min-h-[200px] gap-4 rounded-3xl border-2 transition-all duration-500 glass-card bg-gradient-to-br ${item!.bg} ${mood === item!.title ? "border-[#FFB4A2] scale-105" : "border-transparent hover:border-white/30 hover:bg-white/10"} text-center px-4 py-6 md:px-6 md:py-8`}
                    onClick={() => item && handleMoodClick(item.title)}
                  >
                    <div className={`${item?.color}`}>{item?.icon}</div>
                    <div className="text-white text-lg font-semibold w-full text-center">{item?.title}</div>
                    <p className="text-sm text-[#D8E2DC] w-full text-center max-w-xs mx-auto break-words">{item?.desc}</p>
                  </Button>
                ));
              } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                // Tablet (2 columns)
                const rows = [];
                const perRow = 2;
                const n = others.length;
                for (let i = 0; i < n; i += perRow) {
                  rows.push(others.slice(i, i + perRow));
                }
                // If odd, center Books in last row
                if (total % 2 !== 0) {
                  rows.push([null, books].filter(Boolean));
                } else {
                  if (books) {
                    rows[rows.length - 1].push(books);
                  }
                }
                return rows.flat().map((item, idx) =>
                  item ? (
                    <Button
                      key={item.title}
                      variant="outline"
                      className={`flex flex-col items-center justify-center min-h-[200px] gap-4 rounded-3xl border-2 transition-all duration-500 glass-card bg-gradient-to-br ${item.bg} ${mood === item.title ? "border-[#FFB4A2] scale-105" : "border-transparent hover:border-white/30 hover:bg-white/10"} text-center px-4 py-6 md:px-6 md:py-8`}
                      onClick={() => handleMoodClick(item.title)}
                    >
                      <div className={`${item.color}`}>{item.icon}</div>
                      <div className="text-white text-lg font-semibold w-full text-center">{item.title}</div>
                      <p className="text-sm text-[#D8E2DC] w-full text-center max-w-xs mx-auto break-words">{item.desc}</p>
                    </Button>
                  ) : (
                    <div key={"empty-" + idx} className="" />
                  )
                );
              } else {
                // Desktop (3 columns)
                const n = others.length;
                const perRow = 3;
                const rows = [];
                for (let i = 0; i < n; i += perRow) {
                  rows.push(others.slice(i, i + perRow));
                }
                // Center Books in last row
                rows.push([null, books, null]);
                return rows.flat().map((item, idx) =>
                  item ? (
                    <Button
                      key={item.title}
                      variant="outline"
                      className={`flex flex-col items-center justify-center min-h-[200px] gap-4 rounded-3xl border-2 transition-all duration-500 glass-card bg-gradient-to-br ${item.bg} ${mood === item.title ? "border-[#FFB4A2] scale-105" : "border-transparent hover:border-white/30 hover:bg-white/10"} text-center px-4 py-6 md:px-6 md:py-8`}
                      onClick={() => handleMoodClick(item.title)}
                    >
                      <div className={`${item.color}`}>{item.icon}</div>
                      <div className="text-white text-lg font-semibold w-full text-center">{item.title}</div>
                      <p className="text-sm text-[#D8E2DC] w-full text-center max-w-xs mx-auto break-words">{item.desc}</p>
                    </Button>
                  ) : (
                    <div key={"empty-" + idx} className="hidden lg:block" />
                  )
                );
              }
            })()}
          </div>
        </Card>
      </div>

      {/* About Section */}
      <section className="about-section relative z-10 py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-gradient">EchoRoom</span>
            </h2>
            <p className="text-xl md:text-2xl text-[#D8E2DC] max-w-3xl mx-auto">
              We believe everyone deserves a space to be heard, understood, and supported.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <Card className="enhanced-glass p-8 md:p-12 rounded-[2rem] text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-lg md:text-xl text-[#D8E2DC] leading-relaxed max-w-4xl mx-auto">
                EchoRoom creates safe, anonymous spaces where people can connect based on their current emotional state. 
                Whether you're feeling hopeful, lonely, motivated, or calm, you'll find others who understand your journey. 
                Our platform fosters genuine human connection through <span className="text-[#FFB4A2]">empathy, respect, and shared experiences</span>.
              </p>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className={`enhanced-glass p-6 md:p-8 rounded-2xl h-full text-center bg-gradient-to-br ${feature.bg} border-2 border-transparent hover:border-white/20 transition-all duration-500`}>
                  <div className={`${feature.color} mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-[#D8E2DC] leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="enhanced-glass p-8 md:p-12 rounded-[2rem]">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Our Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Empathy", desc: "Understanding without judgment", color: "text-[#A3C4BC]" },
                  { title: "Privacy", desc: "Your safety is paramount", color: "text-[#FFB4A2]" },
                  { title: "Authenticity", desc: "Be your true self", color: "text-[#FFE66D]" },
                  { title: "Growth", desc: "Healing through connection", color: "text-pink-300" }
                ].map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <h4 className={`text-lg font-bold ${value.color} mb-2`}>{value.title}</h4>
                    <p className="text-[#D8E2DC] text-sm">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFB4A2] to-[#A3C4BC] rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">EchoRoom</span>
              </div>
              <p className="text-[#D8E2DC] leading-relaxed max-w-md mb-6">
                Creating safe spaces for authentic human connection. Join thousands who have found their voice and community.
              </p>
              
              {/* Animated Social Icons */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Animated background circle */}
                      <motion.div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ backgroundColor: social.color }}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Pulsing ring effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-60"
                        style={{ borderColor: social.color }}
                        animate={{
                          scale: [1, 1.5],
                          opacity: [0.6, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                      
                      {/* Icon container */}
                      <motion.div
                        className="relative w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-white/30"
                        whileHover={{
                          backgroundColor: `${social.color}20`,
                          borderColor: `${social.color}60`,
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <IconComponent 
                            className="w-5 h-5 text-[#A3C4BC] group-hover:text-white transition-colors duration-300" 
                          />
                        </motion.div>
                      </motion.div>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10">
                        {social.name}
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg mb-4">Quick Links</h4>
              <nav className="flex flex-col space-y-3">
                {[
                  { name: 'Home', action: handleHomeClick },
                  { name: 'Rooms', action: scrollToRooms },
                  { name: 'About', action: scrollToAbout },
                  { name: 'Privacy Policy', action: () => {} },
                  { name: 'Terms of Service', action: () => {} }
                ].map((link) => (
                  <button
                    key={link.name}
                    onClick={link.action}
                    className="text-[#D8E2DC] hover:text-white hover:translate-x-1 transition-all duration-200 text-left text-sm group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#FFB4A2] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg mb-4">Support</h4>
              <nav className="flex flex-col space-y-3">
                {[
                  { name: 'Help Center', action: () => {} },
                  { name: 'Community Guidelines', action: () => {} },
                  { name: 'Report Issue', action: () => {} },
                  { name: 'Contact Us', action: () => {} },
                  { name: 'Safety Resources', action: () => {} }
                ].map((link) => (
                  <button
                    key={link.name}
                    onClick={link.action}
                    className="text-[#D8E2DC] hover:text-white hover:translate-x-1 transition-all duration-200 text-left text-sm group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#A3C4BC] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <p className="text-[#8E9AAF] text-sm mb-4 md:mb-0">
              © {currentYear} EchoRoom. All rights reserved. Made with ❤️ for human connection.
            </p>
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="sm"
              className="text-[#A3C4BC] hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowUp className="w-4 h-4" />
              Back to top
            </Button>
          </div>
        </div>
      </footer>

      <ElevenLabsConvoAIWidget agentId="agent_01jx8ahxfveh2r99gz4x07hd0w" />
    </div>
  )
}
