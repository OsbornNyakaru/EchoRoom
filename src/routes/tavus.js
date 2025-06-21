const express = require("express");
const { DailyApi } = require("@daily-co/daily-js");
const fetch = require("node-fetch");

const router = express.Router();

const daily = DailyApi.createInstance({
  apiKey: process.env.DAILY_API_KEY,
});

// POST /api/tavus/get-daily-room
router.post("/api/tavus/get-daily-room", async (req, res) => {
  const { conversation_id } = req.body;
  if (!conversation_id) {
    return res.status(400).json({ message: "conversation_id is required" });
  }

  // Tavus conversation status check
  try {
    const tavusRes = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}`, {
      method: "GET",
      headers: {
        "x-api-key": process.env.TAVUS_API_KEY,
      },
    });
    if (!tavusRes.ok) {
      return res.status(400).json({ message: "Failed to fetch Tavus conversation status" });
    }
    const tavusData = await tavusRes.json();
    if (tavusData.status !== "active") {
      return res.status(400).json({
        error: "Room URL not available",
        message: "The conversation may not be ready yet",
        tavus_status: tavusData.status,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error checking Tavus conversation status", error: err.message });
  }

  const roomName = `tavus-${conversation_id}`;
  try {
    let room;
    try {
      room = await daily.rooms.get(roomName);
    } catch (e) {
      room = await daily.rooms.create({
        name: roomName,
        properties: {
          enable_chat: false,
          enable_screenshare: false,
          enable_recording: false,
          start_video_off: true,
          start_audio_off: false,
          max_participants: 10,
          exp: Math.round(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        },
      });
    }
    res.json({ room_url: room.url });
  } catch (error) {
    console.error("Error creating/fetching Daily room:", error);
    res.status(500).json({ message: "Failed to create or fetch Daily room" });
  }
});

module.exports = router; 