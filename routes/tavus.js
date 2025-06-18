const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { createConversation, endConversation } = require('../src/api');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Create Tavus conversation
router.post('/create-conversation', async (req, res) => {
  try {
    const { mood } = req.body;
    
    // Use environment variable for Tavus API key
    const tavusApiKey = process.env.TAVUS_API_KEY;
    if (!tavusApiKey) {
      return res.status(500).json({ error: 'Tavus API key not configured' });
    }

    // Get persona for the specific mood from database
    let personaId = null;
    try {
      const { data: persona, error: personaError } = await supabase
        .from('persona')
        .select('persona_id')
        .eq('persona_id', `default_${mood.toLowerCase()}_persona`)
        .single();

      if (!personaError && persona) {
        personaId = persona.persona_id;
        console.log(`Using persona ${personaId} for mood ${mood}`);
      } else {
        console.log(`No specific persona found for mood ${mood}, using default`);
      }
    } catch (personaError) {
      console.warn('Error fetching persona from database:', personaError);
    }

    // Create conversation with mood-specific persona
    const conversation = await createConversation(tavusApiKey, personaId);
    
    console.log('Tavus conversation created:', conversation);
    
    res.json({
      conversation_id: conversation.conversation_id,
      conversation_url: conversation.conversation_url,
      status: conversation.status,
      persona_id: personaId
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

// Get available personas
router.get('/personas', async (req, res) => {
  try {
    const { data: personas, error } = await supabase
      .from('persona')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personas:', error.message);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(personas);
  } catch (error) {
    console.error('Error in GET /api/tavus/personas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get persona by mood
router.get('/personas/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const personaId = `default_${mood.toLowerCase()}_persona`;

    const { data: persona, error } = await supabase
      .from('persona')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error) {
      console.error('Error fetching persona by mood:', error.message);
      // Return default persona if specific mood persona not found
      const { data: defaultPersona, error: defaultError } = await supabase
        .from('persona')
        .select('*')
        .eq('persona_id', 'default_calm_persona')
        .single();

      if (defaultError) {
        return res.status(500).json({ error: 'Database error' });
      }

      return res.json(defaultPersona);
    }

    res.json(persona);
  } catch (error) {
    console.error('Error in GET /api/tavus/personas/:mood:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;