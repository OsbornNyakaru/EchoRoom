const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET /api/personas - Get all personas
router.get('/', async (req, res) => {
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
    console.error('Error in GET /api/personas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/personas/:id - Get specific persona by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: persona, error } = await supabase
      .from('persona')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching persona:', error.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json(persona);
  } catch (error) {
    console.error('Error in GET /api/personas/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/personas/by-mood/:mood - Get persona by mood
router.get('/by-mood/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    
    // Map mood to persona_id pattern
    const personaId = `default_${mood.toLowerCase()}_persona`;

    const { data: persona, error } = await supabase
      .from('persona')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error) {
      console.error('Error fetching persona by mood:', error.message);
      // If no specific persona found, return a default one
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
    console.error('Error in GET /api/personas/by-mood/:mood:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/personas - Create new persona
router.post('/', async (req, res) => {
  try {
    const { persona_id } = req.body;

    // Validate required fields
    if (!persona_id) {
      return res.status(400).json({ 
        error: 'Missing required field: persona_id' 
      });
    }

    console.log('Creating persona:', { persona_id });

    const { data: persona, error } = await supabase
      .from('persona')
      .insert({
        persona_id
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert persona error:', error.message);
      return res.status(500).json({ error: 'Failed to create persona' });
    }

    console.log('Persona created successfully:', persona);
    res.status(201).json(persona);

  } catch (error) {
    console.error('Error in POST /api/personas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/personas/:id - Update persona
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { persona_id } = req.body;

    console.log('Updating persona:', { id, persona_id });

    const { data: persona, error } = await supabase
      .from('persona')
      .update({ persona_id })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update persona error:', error.message);
      return res.status(500).json({ error: 'Failed to update persona' });
    }

    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    console.log('Persona updated successfully:', persona);
    res.json(persona);

  } catch (error) {
    console.error('Error in PUT /api/personas/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/personas/:id - Delete persona
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting persona:', { id });

    const { data: persona, error } = await supabase
      .from('persona')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase delete persona error:', error.message);
      return res.status(500).json({ error: 'Failed to delete persona' });
    }

    console.log('Persona deleted successfully:', persona);
    res.json({ message: 'Persona deleted successfully', persona });

  } catch (error) {
    console.error('Error in DELETE /api/personas/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;