const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

// GET /api/tavus-persona/:personaId
router.get('/api/tavus-persona/:personaId', async (req, res) => {
  const personaId = req.params.personaId;
  const apiKey = process.env.TAVUS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Tavus API key is not set in backend environment.' });
  }
  if (!personaId) {
    return res.status(400).json({ error: 'Missing personaId parameter.' });
  }

  const tavusUrl = `https://tavusapi.com/v2/personas/${personaId}`;
  const options = {
    method: 'GET',
    headers: { 'x-api-key': apiKey },
  };

  try {
    const response = await fetch(tavusUrl, options);
    const data = await response.json();
    if (!response.ok) {
      // Forward Tavus error message if available
      return res.status(response.status).json({ error: data.message || 'Failed to fetch Tavus persona.' });
    }
    res.json(data);
  } catch (err) {
    console.error('Error fetching Tavus persona:', err);
    res.status(500).json({ error: 'Internal server error while fetching Tavus persona.' });
  }
});

module.exports = router;