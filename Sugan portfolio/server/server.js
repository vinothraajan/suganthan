require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const contactRoutes = require('./routes/contactRoutes');
const DataStore = require('./models/dataStore');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, '..', 'public')));
// Also serve assets if referenced as /assets
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sugan Portfolio API is running'
  });
});

// Profile endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await DataStore.getProfile();
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const updated = await DataStore.updateProfile(req.body);
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Photo Upload Endpoint
app.post('/api/upload-photo', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const data = matches && matches.length === 3 ? matches[2] : imageBase64;
    const buffer = Buffer.from(data, 'base64');

    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, 'profile.jpg');
    fs.writeFileSync(filePath, buffer);

    await DataStore.updateProfile({ photo: `/images/profile.jpg?t=${Date.now()}` });

    res.json({
      success: true,
      message: 'Photo updated and showcased successfully!',
      photoUrl: `/images/profile.jpg?t=${Date.now()}`
    });
  } catch (err) {
    console.error('Error saving uploaded photo:', err);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// Mount Core REST APIs
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);

// Dedicated 404 Handling for /api/* routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Fallback for Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Sugan Portfolio Server running on port ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📁 Static files served from /public`);
    console.log(`=========================================`);
  });
}

module.exports = app;
