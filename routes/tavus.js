const express = require('express');
const router = express.Router();
const { createConversation, endConversation } = require('../src/api');

// Create Tavus conversation
router.post('/create-conversation', async (req, res) => {
  try {
    const { mood } = req.body;
    
    // Use environment variable for Tavus API key
    const tavusApiKey = process.env.TAVUS_API_KEY;
    if (!tavusApiKey) {
      return res.status(500).json({ error: 'Tavus API key not configured' });
    }

    // Create conversation with mood-specific persona
    const conversation = await createConversation(tavusApiKey);
    
    console.log('Tavus conversation created:', conversation);
    
    res.json({
      conversation_id: conversation.conversation_id,
      conversation_url: conversation.conversation_url,
      status: conversation.status
    });
  } catch (error) {
    console.error('Error creating Tavus conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get Daily room URL for Tavus conversation
router.post('/get-daily-room', async (req, res) => {
  try {
    const { conversation_id } = req.body;
    
    if (!conversation_id) {
      return res.status(400).json({ error: 'Conversation ID required' });
    }

    // For now, return the conversation URL as the room URL
    // In a real implementation, you would extract the Daily room URL from Tavus
    const room_url = `https://tavusapi.com/v2/conversations/${conversation_id}/daily-room`;
    
    res.json({ room_url });
  } catch (error) {
    console.error('Error getting Daily room URL:', error);
    res.status(500).json({ error: 'Failed to get room URL' });
  }
});

// End Tavus conversation
router.post('/end-conversation', async (req, res) => {
  try {
    const { conversation_id } = req.body;
    
    if (!conversation_id) {
      return res.status(400).json({ error: 'Conversation ID required' });
    }

    const tavusApiKey = process.env.TAVUS_API_KEY;
    if (!tavusApiKey) {
      return res.status(500).json({ error: 'Tavus API key not configured' });
    }

    await endConversation(conversation_id, tavusApiKey);
    
    console.log('Tavus conversation ended:', conversation_id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error ending Tavus conversation:', error);
    res.status(500).json({ error: 'Failed to end conversation' });
  }
});

module.exports = router;