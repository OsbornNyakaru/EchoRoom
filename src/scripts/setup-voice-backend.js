// Backend API endpoints needed for voice chat functionality

const express = require("express")
const { DailyApi } = require("@daily-co/daily-js")

const app = express()
app.use(express.json())

// Initialize Daily API
const daily = DailyApi.createInstance({
  apiKey: process.env.DAILY_API_KEY,
})

// Create voice room endpoint
app.post("/api/voice/create-room", async (req, res) => {
  try {
    const { roomId, userId, userName } = req.body

    // Create or get existing Daily room
    const roomName = `voice-${roomId}`

    let room
    try {
      // Try to get existing room
      room = await daily.rooms.get(roomName)
    } catch (error) {
      // Room doesn't exist, create it
      room = await daily.rooms.create({
        name: roomName,
        properties: {
          enable_chat: false,
          enable_screenshare: false,
          enable_recording: false,
          start_video_off: true,
          start_audio_off: false,
          max_participants: 50,
          eject_at_room_exp: true,
          exp: Math.round(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        },
      })
    }

    // Create meeting token for the user
    const token = await daily.meetingTokens.create({
      properties: {
        room_name: roomName,
        user_name: userName,
        user_id: userId,
        is_owner: false,
        start_video_off: true,
        start_audio_off: false,
        enable_screenshare: false,
        enable_recording: false,
      },
    })

    res.json({
      roomUrl: room.url,
      token: token.token,
    })
  } catch (error) {
    console.error("Error creating voice room:", error)
    res.status(500).json({ error: "Failed to create voice room" })
  }
})

// Get room info endpoint
app.get("/api/voice/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const roomName = `voice-${roomId}`

    const room = await daily.rooms.get(roomName)
    res.json(room)
  } catch (error) {
    console.error("Error getting room info:", error)
    res.status(404).json({ error: "Room not found" })
  }
})

// Delete room endpoint
app.delete("/api/voice/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const roomName = `voice-${roomId}`

    await daily.rooms.delete(roomName)
    res.json({ success: true })
  } catch (error) {
    console.error("Error deleting room:", error)
    res.status(500).json({ error: "Failed to delete room" })
  }
})

console.log("Voice chat backend endpoints ready!")
console.log("Required environment variables:")
console.log("- DAILY_API_KEY: Your Daily.co API key")

module.exports = app
