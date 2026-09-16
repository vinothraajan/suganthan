const db = require('../config/db');

class DataStore {
  // ==========================================
  // Profile
  // ==========================================
  static async getProfile() {
    if (db.isMongo() && db.models.Profile) {
      try {
        const profile = await db.models.Profile.findOne().lean();
        if (profile) return profile;
      } catch (err) {
        console.warn('MongoDB getProfile error, falling back to local store:', err.message);
      }
    }
    return db.getLocalData().profile || {};
  }

  static async updateProfile(updatedFields) {
    if (db.isMongo() && db.models.Profile) {
      try {
        const updated = await db.models.Profile.findOneAndUpdate(
          {},
          { $set: updatedFields },
          { new: true, upsert: true }
        ).lean();
        return updated;
      } catch (err) {
        console.warn('MongoDB updateProfile error, falling back to local store:', err.message);
      }
    }
    const data = db.getLocalData();
    data.profile = { ...data.profile, ...updatedFields };
    db.saveLocal();
    return data.profile;
  }

  // ==========================================
  // Skills
  // ==========================================
  static async getSkills(filter = {}) {
    if (db.isMongo() && db.models.Skill) {
      try {
        const query = {};
        if (filter.category && filter.category !== 'All') {
          query.category = new RegExp(`^${filter.category}$`, 'i');
        }
        const skills = await db.models.Skill.find(query).lean();
        if (skills && skills.length > 0) return skills;
      } catch (err) {
        console.warn('MongoDB getSkills error, falling back to local store:', err.message);
      }
    }

    let skills = db.getLocalData().skills || [];
    if (filter.category && filter.category !== 'All') {
      skills = skills.filter(s => s.category.toLowerCase() === filter.category.toLowerCase());
    }
    return skills;
  }

  // ==========================================
  // Projects
  // ==========================================
  static async getProjects(filter = {}) {
    if (db.isMongo() && db.models.Project) {
      try {
        const query = {};
        if (filter.category && filter.category !== 'All') {
          query.category = new RegExp(`^${filter.category}$`, 'i');
        }
        if (filter.search) {
          const searchRegex = new RegExp(filter.search, 'i');
          query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { technologies: searchRegex }
          ];
        }
        return await db.models.Project.find(query).sort({ featured: -1, year: -1, createdAt: -1 }).lean();
      } catch (err) {
        console.warn('MongoDB getProjects error, falling back to local store:', err.message);
      }
    }

    let projects = db.getLocalData().projects || [];

    if (filter.category && filter.category !== 'All') {
      projects = projects.filter(p => p.category.toLowerCase() === filter.category.toLowerCase());
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.technologies && p.technologies.some(t => t.toLowerCase().includes(q)))
      );
    }

    return projects;
  }

  static async getProjectById(id) {
    if (db.isMongo() && db.models.Project) {
      try {
        const proj = await db.models.Project.findOne({ id }).lean();
        if (proj) return proj;
      } catch (err) {
        console.warn('MongoDB getProjectById error, falling back to local store:', err.message);
      }
    }

    const projects = db.getLocalData().projects || [];
    return projects.find(p => p.id === id) || null;
  }

  static async createProject(projectData) {
    const newProject = {
      id: projectData.id || 'proj-' + Date.now(),
      title: projectData.title || 'Untitled Project',
      description: projectData.description || '',
      longDescription: projectData.longDescription || projectData.description || '',
      category: projectData.category || 'Full-Stack',
      technologies: Array.isArray(projectData.technologies)
        ? projectData.technologies
        : (projectData.technologies ? projectData.technologies.split(',').map(t => t.trim()) : []),
      image: projectData.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      github: projectData.github || '',
      liveDemo: projectData.liveDemo || projectData.demo || '',
      demo: projectData.liveDemo || projectData.demo || '',
      featured: Boolean(projectData.featured),
      year: Number(projectData.year) || new Date().getFullYear(),
      metrics: projectData.metrics || '',
      createdAt: new Date().toISOString()
    };

    if (db.isMongo() && db.models.Project) {
      try {
        const created = await db.models.Project.create(newProject);
        return created.toObject ? created.toObject() : created;
      } catch (err) {
        console.warn('MongoDB createProject error, falling back to local store:', err.message);
      }
    }

    const data = db.getLocalData();
    data.projects.unshift(newProject);
    db.saveLocal();
    return newProject;
  }

  static async updateProject(id, updateData) {
    if (updateData.technologies && typeof updateData.technologies === 'string') {
      updateData.technologies = updateData.technologies.split(',').map(t => t.trim());
    }
    if (updateData.liveDemo && !updateData.demo) updateData.demo = updateData.liveDemo;
    if (updateData.demo && !updateData.liveDemo) updateData.liveDemo = updateData.demo;

    if (db.isMongo() && db.models.Project) {
      try {
        const updated = await db.models.Project.findOneAndUpdate(
          { id },
          { $set: { ...updateData, updatedAt: new Date() } },
          { new: true }
        ).lean();
        if (updated) return updated;
      } catch (err) {
        console.warn('MongoDB updateProject error, falling back to local store:', err.message);
      }
    }

    const data = db.getLocalData();
    const index = data.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    data.projects[index] = {
      ...data.projects[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    db.saveLocal();
    return data.projects[index];
  }

  static async deleteProject(id) {
    if (db.isMongo() && db.models.Project) {
      try {
        const res = await db.models.Project.deleteOne({ id });
        if (res.deletedCount > 0) return true;
      } catch (err) {
        console.warn('MongoDB deleteProject error, falling back to local store:', err.message);
      }
    }

    const data = db.getLocalData();
    const initialLength = data.projects.length;
    data.projects = data.projects.filter(p => p.id !== id);
    if (data.projects.length !== initialLength) {
      db.saveLocal();
      return true;
    }
    return false;
  }

  // ==========================================
  // Contacts / Inquiries
  // ==========================================
  static async createContact(contactData) {
    const newContact = {
      id: 'msg-' + Date.now(),
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject || 'Portfolio Inquiry',
      message: contactData.message,
      createdAt: new Date().toISOString()
    };

    if (db.isMongo() && db.models.Contact) {
      try {
        const created = await db.models.Contact.create(newContact);
        return created.toObject ? created.toObject() : created;
      } catch (err) {
        console.warn('MongoDB createContact error, saving locally:', err.message);
      }
    }

    const data = db.getLocalData();
    if (!data.contacts) data.contacts = [];
    data.contacts.unshift(newContact);
    db.saveLocal();
    return newContact;
  }

  static async getContacts() {
    if (db.isMongo() && db.models.Contact) {
      try {
        return await db.models.Contact.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn('MongoDB getContacts error, falling back to local store:', err.message);
      }
    }

    return db.getLocalData().contacts || [];
  }
}

module.exports = DataStore;
