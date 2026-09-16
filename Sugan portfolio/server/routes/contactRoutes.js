const express = require('express');
const router = express.Router();
const DataStore = require('../models/dataStore');

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Validate message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.'
      });
    }

    const newContact = await DataStore.createContact({
      name: name.trim(),
      email: email.trim(),
      subject: subject && typeof subject === 'string' ? subject.trim() : 'Portfolio Inquiry',
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: {
        id: newContact.id,
        name: newContact.name,
        subject: newContact.subject,
        createdAt: newContact.createdAt
      }
    });
  } catch (err) {
    console.error('Error saving contact message:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process message submission. Please try again later.'
    });
  }
});

// GET /api/contact - View received inquiries
router.get('/', async (req, res) => {
  try {
    const contacts = await DataStore.getContacts();
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    console.error('Error fetching contact inquiries:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.'
    });
  }
});

module.exports = router;
