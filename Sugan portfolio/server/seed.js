/**
 * Standalone Database Seeder Script
 * Run via: npm run seed
 * Populates local store and MongoDB (if MONGODB_URI is provided) with sample data.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const SEED_FILE = path.join(__dirname, 'data', 'seed.json');
const STORE_FILE = path.join(__dirname, 'data', 'store.json');
const ROOT_DATA_DIR = path.join(__dirname, '..', 'data');
const ROOT_DB_FILE = path.join(ROOT_DATA_DIR, 'database.json');

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding Process...');

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`❌ Seed file not found at: ${SEED_FILE}`);
    process.exit(1);
  }

  const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
  const seedData = JSON.parse(rawSeed);

  // 1. Seed Local JSON Stores
  const serverDataDir = path.dirname(STORE_FILE);
  if (!fs.existsSync(serverDataDir)) {
    fs.mkdirSync(serverDataDir, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log(`✅ Local store successfully seeded: ${STORE_FILE}`);

  if (!fs.existsSync(ROOT_DATA_DIR)) {
    fs.mkdirSync(ROOT_DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(ROOT_DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log(`✅ Root data store synced: ${ROOT_DB_FILE}`);

  // 2. Seed MongoDB if MONGODB_URI is configured
  if (process.env.MONGODB_URI) {
    console.log('🔄 MONGODB_URI detected. Attempting to seed MongoDB Atlas...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Connected to MongoDB.');

      const db = mongoose.connection.db;
      // Seed collections
      if (seedData.projects && seedData.projects.length > 0) {
        const projectsColl = db.collection('projects');
        await projectsColl.deleteMany({});
        await projectsColl.insertMany(seedData.projects);
        console.log(`✅ Seeded ${seedData.projects.length} projects to MongoDB.`);
      }

      if (seedData.skills && seedData.skills.length > 0) {
        const skillsColl = db.collection('skills');
        await skillsColl.deleteMany({});
        await skillsColl.insertMany(seedData.skills);
        console.log(`✅ Seeded ${seedData.skills.length} skills to MongoDB.`);
      }

      if (seedData.profile) {
        const profileColl = db.collection('profiles');
        await profileColl.deleteMany({});
        await profileColl.insertOne(seedData.profile);
        console.log('✅ Seeded profile to MongoDB.');
      }

      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB after seeding.');
    } catch (err) {
      console.warn('⚠️ Could not connect to MongoDB for seeding (continuing with local database):', err.message);
    }
  } else {
    console.log('ℹ️ No MONGODB_URI detected. Local zero-config store is active and ready.');
  }

  console.log('✨ Database seeding completed successfully!');
}

seedDatabase().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
