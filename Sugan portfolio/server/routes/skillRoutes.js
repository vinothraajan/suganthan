const express = require('express');
const router = express.Router();
const DataStore = require('../models/dataStore');

// GET /api/skills - Retrieve categorized skills
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const skills = await DataStore.getSkills({ category });

    res.json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ success: false, message: 'Server error fetching skills' });
  }
});

module.exports = router;
