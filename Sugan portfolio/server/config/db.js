/**
 * Dual-Mode Database Configuration & Manager
 * Supports:
 * 1. Zero-config persistent JSON storage (Local development, instant setup)
 * 2. MongoDB Atlas cloud connection via Mongoose (Production ready)
 * Fail-safe: Never crashes if MongoDB is unconfigured or unreachable.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const ROOT_DATA_DIR = path.join(__dirname, '..', '..', 'data');
const ROOT_DB_FILE = path.join(ROOT_DATA_DIR, 'database.json');

// Define Mongoose Schemas for MongoDB mode
const ProjectSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, default: '' },
  category: { type: String, default: 'Full-Stack' },
  technologies: { type: [String], default: [] },
  image: { type: String, default: '' },
  github: { type: String, default: '' },
  liveDemo: { type: String, default: '' },
  demo: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  year: { type: Number, default: 2026 },
  metrics: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: Number, default: 80 },
  icon: { type: String, default: 'code' }
});

const ContactSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'Portfolio Inquiry' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'SUGANTHAN M' },
  title: { type: String, default: 'Full-Stack Software Engineer' },
  tagline: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: 'Chennai, Tamil Nadu' },
  email: { type: String, default: 'suganthansugan47@gmail.com' },
  github: { type: String, default: 'https://github.com/suganthan-dev' },
  linkedin: { type: String, default: 'https://linkedin.com/in/suganthan-m' },
  photo: { type: String, default: '/images/profile.jpg' },
  status: { type: String, default: 'Available for Full-Stack & Frontend Roles' },
  stats: { type: Array, default: [] }
});

class DatabaseManager {
  constructor() {
    this.mode = 'local'; // 'local' or 'mongodb'
    this.localData = null;
    this.models = {};
    this.initLocal();
    this.initMongo();
  }

  initLocal() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Check if store.json exists; if not, populate from seed.json
      if (!fs.existsSync(DB_FILE)) {
        if (fs.existsSync(SEED_FILE)) {
          const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
          fs.writeFileSync(DB_FILE, seedContent, 'utf-8');
          this.localData = JSON.parse(seedContent);
          console.log('📦 Initialized local database store from seed data.');
        } else {
          this.localData = { profile: {}, skills: [], projects: [], contacts: [] };
          fs.writeFileSync(DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
        }
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.localData = JSON.parse(raw);
        console.log('💾 Loaded existing local database store.');
      }

      // Also ensure root data/database.json is synced
      if (!fs.existsSync(ROOT_DATA_DIR)) {
        fs.mkdirSync(ROOT_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(ROOT_DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.error('⚠️ Error initializing local database store:', err.message);
      this.localData = { profile: {}, skills: [], projects: [], contacts: [] };
    }
  }

  async initMongo() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚡ Dual-Mode: Using zero-config local JSON database store.');
      return;
    }

    try {
      console.log('🌐 MONGODB_URI detected. Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000
      });
      
      this.models = {
        Project: mongoose.models.Project || mongoose.model('Project', ProjectSchema),
        Skill: mongoose.models.Skill || mongoose.model('Skill', SkillSchema),
        Contact: mongoose.models.Contact || mongoose.model('Contact', ContactSchema),
        Profile: mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)
      };

      this.mode = 'mongodb';
      console.log('🚀 Dual-Mode: Connected to MongoDB Atlas in production mode.');
    } catch (err) {
      console.warn(`⚠️ MongoDB connection error: ${err.message}. Seamlessly falling back to local database.`);
      this.mode = 'local';
    }
  }

  isMongo() {
    return this.mode === 'mongodb' && mongoose.connection.readyState === 1;
  }

  saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
      if (fs.existsSync(ROOT_DATA_DIR)) {
        fs.writeFileSync(ROOT_DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
      }
      return true;
    } catch (err) {
      console.error('Failed to save to local database store:', err.message);
      return false;
    }
  }

  getLocalData() {
    return this.localData;
  }
}

const db = new DatabaseManager();

module.exports = db;
