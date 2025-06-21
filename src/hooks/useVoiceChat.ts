"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import DailyIframe from "@daily-co/daily-js"

interface VoiceParticipant {
  userId: string
  userName: string
  isMuted: boolean
  isSpeaking: boolean
  audioLevel: number
}

interface UseVoiceChatOptions {
  roomId: string
  userId: string
  userName: string
  onParticipantUpdate?: (participants: VoiceParticipant[]) => void
  onError?: (error: string) => void
}

export const useVoiceChat = ({ roomId, userId, userName, onParticipantUpdate, onError }: UseVoiceChatOptions) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [voiceParticipants, setVoiceParticipants] = useState<VoiceParticipant[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const callFrameRef = useRef<any>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Daily.co call frame
  const initializeVoiceChat = useCallback(async () => {
    if (!roomId || isConnecting || isConnected) return

    try {
      setIsConnecting(true)
      setError(null)

      // Get Daily room URL from your backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      const response = await fetch(`${backendUrl}/api/voice/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          userId,
          userName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create voice room")
      }

      const { roomUrl } = await response.json()

      // Create Daily call frame
      callFrameRef.current = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: false, // Voice only
      })

      // Set up event listeners
      callFrameRef.current
        .on("joined-meeting", handleJoinedMeeting)
        .on("left-meeting", handleLeftMeeting)
        .on("participant-joined", handleParticipantJoined)
        .on("participant-left", handleParticipantLeft)
        .on("participant-updated", handleParticipantUpdated)
        .on("error", handleError)
        .on("camera-error", handleCameraError)
        .on("speaking-change", handleSpeakingChange)

      // Join the room
      await callFrameRef.current.join({
        url: roomUrl,
        userName: userName,
        userData: { userId },
      })
    } catch (err) {
      console.error("Error initializing voice chat:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize voice chat"
      setError(errorMessage)
      onError?.(errorMessage)
      setIsConnecting(false)
    }
  }, [roomId, userId, userName, isConnecting, isConnected, onError])

  // Event handlers
  const handleJoinedMeeting = useCallback(() => {
    console.log("Joined voice meeting")
    setIsConnected(true)
    setIsConnecting(false)

    // Start monitoring audio levels
    startAudioLevelMonitoring()
  }, [])

  const handleLeftMeeting = useCallback(() => {
    console.log("Left voice meeting")
    setIsConnected(false)
    setVoiceParticipants([])
    stopAudioLevelMonitoring()
  }, [])

  const handleParticipantJoined = useCallback((event: any) => {
    console.log("Participant joined voice:", event.participant)
    updateParticipants()
  }, [])

  const handleParticipantLeft = useCallback((event: any) => {
    console.log("Participant left voice:", event.participant)
    updateParticipants()
  }, [])

  const handleParticipantUpdated = useCallback((event: any) => {
    console.log("Participant updated:", event.participant)
    updateParticipants()
  }, [])

  const handleError = useCallback(
    (event: any) => {
      console.error("Daily error:", event)
      const errorMessage = event.errorMsg || "Voice chat error occurred"
      setError(errorMessage)
      onError?.(errorMessage)
    },
    [onError],
  )

  const handleCameraError = useCallback((event: any) => {
    console.error("Camera error:", event)
    // Handle camera/microphone permission errors
    if (event.errorMsg?.includes("permission")) {
      setError("Microphone permission denied. Please allow microphone access.")
    }
  }, [])

  const handleSpeakingChange = useCallback((event: any) => {
    console.log("Speaking change:", event)
    updateParticipants()
  }, [])

  // Update participants list
  const updateParticipants = useCallback(() => {
    if (!callFrameRef.current) return

    const participants = callFrameRef.current.participants()
    const voiceParticipants: VoiceParticipant[] = Object.values(participants).map((p: any) => ({
      userId: p.userData?.userId || p.session_id,
      userName: p.user_name || "Unknown",
      isMuted: !p.audio,
      isSpeaking: p.speaking,
      audioLevel: p.audioLevel || 0,
    }))

    setVoiceParticipants(voiceParticipants)
    onParticipantUpdate?.(voiceParticipants)
  }, [onParticipantUpdate])

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback(() => {
    if (audioLevelIntervalRef.current) return

    audioLevelIntervalRef.current = setInterval(() => {
      if (callFrameRef.current) {
        const localParticipant = callFrameRef.current.participants().local
        if (localParticipant?.audioLevel !== undefined) {
          setAudioLevel(localParticipant.audioLevel)
        }
      }
    }, 100)
  }, [])

  const stopAudioLevelMonitoring = useCallback(() => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }
  }, [])

  // Voice controls
  const toggleMute = useCallback(async () => {
    if (!callFrameRef.current) return

    try {
      const newMutedState = !isMuted
      await callFrameRef.current.setLocalAudio(!newMutedState)
      setIsMuted(newMutedState)
    } catch (err) {
      console.error("Error toggling mute:", err)
      setError("Failed to toggle microphone")
    }
  }, [isMuted])

  const toggleDeafen = useCallback(async () => {
    if (!callFrameRef.current) return

    try {
      const newDeafenedState = !isDeafened
      // Deafen by setting output volume to 0
      await callFrameRef.current.setOutputVolume(newDeafenedState ? 0 : 1)
      setIsDeafened(newDeafenedState)
    } catch (err) {
      console.error("Error toggling deafen:", err)
      setError("Failed to toggle audio output")
    }
  }, [isDeafened])

  const leaveVoiceChat = useCallback(async () => {
    if (!callFrameRef.current) return

    try {
      await callFrameRef.current.leave()
      callFrameRef.current.destroy()
      callFrameRef.current = null
      stopAudioLevelMonitoring()
    } catch (err) {
      console.error("Error leaving voice chat:", err)
    }
  }, [stopAudioLevelMonitoring])

  // Push to talk functionality
  const startPushToTalk = useCallback(async () => {
    if (!callFrameRef.current || !isMuted) return

    try {
      await callFrameRef.current.setLocalAudio(true)
    } catch (err) {
      console.error("Error starting push to talk:", err)
    }
  }, [isMuted])

  const stopPushToTalk = useCallback(async () => {
    if (!callFrameRef.current || !isMuted) return

    try {
      await callFrameRef.current.setLocalAudio(false)
    } catch (err) {
      console.error("Error stopping push to talk:", err)
    }
  }, [isMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy()
      }
      stopAudioLevelMonitoring()
    }
  }, [stopAudioLevelMonitoring])

  return {
    // State
    isConnected,
    isConnecting,
    isMuted,
    isDeafened,
    voiceParticipants,
    audioLevel,
    error,

    // Actions
    initializeVoiceChat,
    toggleMute,
    toggleDeafen,
    leaveVoiceChat,
    startPushToTalk,
    stopPushToTalk,
  }
}
