const express = require('express');
const router = express.Router();
const DataStore = require('../models/dataStore');

// GET /api/projects - Retrieve projects (with optional category and search query)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const projects = await DataStore.getProjects({ category, search });
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
});

// GET /api/projects/:id - Retrieve single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await DataStore.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    console.error('Error fetching project by ID:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      longDescription,
      category,
      technologies,
      image,
      github,
      liveDemo,
      demo,
      featured,
      year,
      metrics
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for the project.'
      });
    }

    const created = await DataStore.createProject({
      title,
      description,
      longDescription,
      category: category || 'Full-Stack',
      technologies,
      image,
      github,
      liveDemo: liveDemo || demo,
      demo: liveDemo || demo,
      featured,
      year,
      metrics
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: created
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ success: false, message: 'Server error creating project' });
  }
});

// PUT /api/projects/:id - Update existing project
router.put('/:id', async (req, res) => {
  try {
    const updated = await DataStore.updateProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ success: false, message: 'Server error updating project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const success = await DataStore.deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
});

module.exports = router;
