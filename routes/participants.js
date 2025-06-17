const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET /api/participants - Get all participants (for testing)
router.get('/', async (req, res) => {
  try {
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching participants:', error.message);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(participants);
  } catch (error) {
    console.error('Error in GET /api/participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/participants/:sessionId - Get participants for a specific session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching session participants:', error.message);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(participants);
  } catch (error) {
    console.error('Error in GET /api/participants/:sessionId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/participants - Create or update a participant
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      session_id,
      user_name,
      avatar = '/avatars/default-avatar.png',
      mood = 'calm',
      is_speaking = false,
      is_muted = false
    } = req.body;

    // Validate required fields
    if (!user_id || !session_id || !user_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, session_id, user_name' 
      });
    }

    console.log('Creating/updating participant:', {
      user_id,
      session_id,
      user_name,
      avatar,
      mood,
      is_speaking,
      is_muted
    });

    // Use upsert to handle both create and update cases
    const { data: participant, error } = await supabase
      .from('participants')
      .upsert({
        user_id,
        session_id,
        user_name,
        avatar,
        mood,
        is_speaking,
        is_muted,
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,session_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert participant error:', error.message);
      return res.status(500).json({ error: 'Failed to create/update participant' });
    }

    console.log('Participant created/updated successfully:', participant);
    res.status(201).json(participant);

  } catch (error) {
    console.error('Error in POST /api/participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/participants/:userId/:sessionId - Update participant information
router.put('/:userId/:sessionId', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const updates = req.body;

    console.log('Updating participant:', { userId, sessionId, updates });

    // Only allow certain fields to be updated
    const allowedUpdates = {
      user_name: updates.user_name,
      avatar: updates.avatar,
      mood: updates.mood,
      is_speaking: updates.is_speaking,
      is_muted: updates.is_muted
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const { data: participant, error } = await supabase
      .from('participants')
      .update(allowedUpdates)
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update participant error:', error.message);
      return res.status(500).json({ error: 'Failed to update participant' });
    }

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    console.log('Participant updated successfully:', participant);
    res.json(participant);

  } catch (error) {
    console.error('Error in PUT /api/participants/:userId/:sessionId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/participants/:userId/:sessionId - Remove participant from session
router.delete('/:userId/:sessionId', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    console.log('Removing participant:', { userId, sessionId });

    const { data: participant, error } = await supabase
      .from('participants')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Supabase delete participant error:', error.message);
      return res.status(500).json({ error: 'Failed to remove participant' });
    }

    console.log('Participant removed successfully:', participant);
    res.json({ message: 'Participant removed successfully', participant });

  } catch (error) {
    console.error('Error in DELETE /api/participants/:userId/:sessionId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;