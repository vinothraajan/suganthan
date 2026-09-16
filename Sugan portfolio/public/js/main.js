/**
 * SUGAN PORTFOLIO - FRONTEND CONTROLLER
 * Handles asynchronous API communications, state management, UI rendering & animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let projectsData = [];
  let currentCategory = 'All';
  let searchQuery = '';

  // Initialize UI features
  initNavbar();
  initTypewriter();
  initFooterYear();
  
  // Fetch initial data from Express backend APIs
  loadProfile();
  loadSkills();
  loadProjects();
  refreshInquiriesCount();

  // Setup event listeners
  setupFilterButtons();
  setupSearchInput();
  setupProjectForm();
  setupContactForm();
  setupModals();
  setupPhotoUpload();
});

/* ==========================================================================
   1. UI & Navigation Logic
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll spy for active section highlight
    const sections = document.querySelectorAll('section');
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 150;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

function initTypewriter() {
  const words = [
    'HTML & CSS',
    'JavaScript (ES6+)',
    'React.js Web Apps',
    'Responsive UI Design'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const target = document.getElementById('typewriter');

  if (!target) return;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 90;

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

function initFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ==========================================================================
   2. API Ingestion & Rendering
   ========================================================================== */

// Fetch and render profile data
async function loadProfile() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to load profile');
    const result = await res.json();
    const p = result.data;

    if (p) {
      if (p.name) {
        document.getElementById('hero-name').textContent = p.name;
        document.title = `${p.name} | React.js & Frontend Developer Portfolio`;
      }
      if (p.tagline) document.getElementById('hero-tagline').textContent = p.tagline;
      if (p.bio) document.getElementById('about-bio').textContent = p.bio;
      if (p.status) {
        document.getElementById('hero-status').textContent = p.status;
        document.getElementById('contact-status').textContent = p.status;
      }
      if (p.location) document.getElementById('contact-location').textContent = p.location;
      if (p.email) {
        const mailEl = document.getElementById('contact-email');
        if (mailEl) {
          mailEl.textContent = p.email;
          mailEl.href = `mailto:${p.email}`;
        }
      }

      if (p.photo) {
        const photoEl = document.getElementById('hero-profile-img');
        if (photoEl) photoEl.src = p.photo;
      }

      if (p.stats && Array.isArray(p.stats)) {
        const statsContainer = document.getElementById('hero-stats-container');
        if (statsContainer) {
          statsContainer.innerHTML = p.stats.map(s => `
            <div class="stat-item">
              <h3>${escapeHTML(s.value)}</h3>
              <p>${escapeHTML(s.label)}</p>
            </div>
          `).join('');
        }
      }
    }
  } catch (err) {
    console.warn('Profile load using fallback values:', err.message);
  }
}

// Fetch and render skills
async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  try {
    const res = await fetch('/api/skills');
    if (!res.ok) throw new Error('Failed to fetch skills');
    const result = await res.json();
    const skillsList = result.data || [];

    const categoryOrder = ['Languages', 'Frontend', 'Backend', 'Databases', 'DevOps / Cloud', 'Tools'];
    const grouped = {};
    categoryOrder.forEach(cat => { grouped[cat] = []; });

    skillsList.forEach(s => {
      const cat = s.category || 'Tools';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

    const categoryIcons = {
      'Languages': 'code-2',
      'Frontend': 'atom',
      'Backend': 'server',
      'Databases': 'database',
      'DevOps / Cloud': 'cloud',
      'Tools': 'wrench'
    };

    container.innerHTML = Object.entries(grouped)
      .filter(([_, items]) => items.length > 0)
      .map(([cat, items]) => `
        <div class="skill-category-card">
          <div class="skill-cat-header">
            <h3 class="skill-cat-title">
              <i data-lucide="${categoryIcons[cat] || 'folder'}" style="width: 18px; height: 18px; color: var(--accent-cyan);"></i>
              ${escapeHTML(cat)}
            </h3>
            <span style="color: var(--accent-cyan); font-size: 0.8rem; font-weight: 600;">${items.length} Techs</span>
          </div>
          <div class="skill-items-list">
            ${items.map(item => {
              const prof = item.proficiency || 80;
              return `
                <div class="skill-item">
                  <div class="skill-info">
                    <span class="skill-name">
                      <i data-lucide="${escapeHTML(item.icon || 'code')}" style="width: 15px; height: 15px; color: var(--text-subtle);"></i>
                      ${escapeHTML(item.name)}
                    </span>
                    <span class="skill-percent">${prof}%</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill" style="width: ${prof}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch (err) {
    container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Unable to load skills: ${escapeHTML(err.message)}</p>`;
  }
}

// Fetch projects
async function loadProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p>Loading projects from database...</p>
      </div>
    `;

    let url = '/api/projects';
    const params = [];
    if (currentCategory && currentCategory !== 'All') params.push(`category=${encodeURIComponent(currentCategory)}`);
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch projects');
    const result = await res.json();
    projectsData = result.data || [];

    renderProjects(projectsData);
  } catch (err) {
    container.innerHTML = `<p style="color: #ef4444; grid-column: 1/-1; text-align: center;">Error loading projects: ${escapeHTML(err.message)}</p>`;
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <h4 style="font-size: 1.2rem; margin-bottom: 8px;">No projects found</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try changing your filter or query.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(proj => `
    <article class="project-card" data-id="${proj.id}">
      <div class="project-image-wrapper">
        <img src="${escapeHTML(proj.image)}" alt="${escapeHTML(proj.title)}" class="project-image" loading="lazy">
        <div style="position: absolute; top: 14px; right: 14px; display: flex; gap: 8px; z-index: 2;">
          ${proj.year ? `<span class="project-year-badge">${escapeHTML(String(proj.year))}</span>` : ''}
          <span class="project-category-badge" style="position: static;">${escapeHTML(proj.category)}</span>
        </div>
      </div>
      <div class="project-body">
        <h3 class="project-title">${escapeHTML(proj.title)}</h3>
        <p class="project-desc">${escapeHTML(proj.description)}</p>

        ${proj.metrics ? `
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 14px; font-size: 0.8rem; color: var(--accent-emerald);">
            <span>⚡</span>
            <span>${escapeHTML(proj.metrics)}</span>
          </div>
        ` : ''}

        <div class="tech-tag-list">
          ${(proj.technologies || []).map(t => `<span class="tech-tag">${escapeHTML(t)}</span>`).join('')}
        </div>

        <div class="project-footer">
          <div class="project-links">
            ${proj.github ? `
              <a href="${escapeHTML(proj.github)}" target="_blank" rel="noopener noreferrer" class="project-link-btn" title="View Code">
                <span>Code</span>
              </a>
            ` : ''}
            ${(proj.liveDemo || proj.demo) ? `
              <a href="${escapeHTML(proj.liveDemo || proj.demo)}" target="_blank" rel="noopener noreferrer" class="project-link-btn" title="Live Demo" style="color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.3);">
                <span>Live Demo</span>
              </a>
            ` : ''}
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="project-link-btn view-details-btn" data-id="${proj.id}">
              <span>Details</span>
            </button>
            <button class="project-link-btn delete-proj-btn" data-id="${proj.id}" title="Delete project from DB" style="color: #f87171;">
              <span>&times;</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Re-run lucide icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Attach event handlers to card action buttons
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openProjectModal(id);
    });
  });

  document.querySelectorAll('.delete-proj-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this project from the database?')) {
        await deleteProject(id);
      }
    });
  });
}

/* ==========================================================================
   3. Search & Filter Handlers
   ========================================================================== */
function setupFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      loadProjects();
    });
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById('project-search');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      loadProjects();
    }, 250);
  });
}

/* ==========================================================================
   4. Database Admin / Project CRUD
   ========================================================================== */
function setupProjectForm() {
  const form = document.getElementById('add-project-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('new-title').value.trim();
    const category = document.getElementById('new-category').value;
    const description = document.getElementById('new-description').value.trim();
    const techInput = document.getElementById('new-tech').value.trim();
    const metrics = document.getElementById('new-metric').value.trim();
    const github = document.getElementById('new-github').value.trim();
    const demo = document.getElementById('new-demo').value.trim();

    const technologies = techInput ? techInput.split(',').map(t => t.trim()).filter(Boolean) : [];

    const submitBtn = document.getElementById('submit-project-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Saving to Database...';

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          technologies,
          metrics,
          github,
          demo
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save project');

      showToast('Project saved successfully to database!', 'success');
      form.reset();
      loadProjects(); // Refresh project list live
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="plus-circle"></i> Save Project to Database';
      if (window.lucide) window.lucide.createIcons();
    }
  });
}

async function deleteProject(id) {
  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to delete');

    showToast('Project deleted from database', 'success');
    loadProjects();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

/* ==========================================================================
   5. Contact Form Handling
   ========================================================================== */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email-input').value.trim();
    const subject = document.getElementById('contact-subject').value.trim() || 'Frontend Role Inquiry for Suganthan M';
    const message = document.getElementById('contact-message').value.trim();

    const submitBtn = document.getElementById('contact-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Connecting to suganthansugan47@gmail.com...';

    try {
      // 1. Save message to backend database
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to send message');
      }

      showToast(result.message || 'Message sent successfully.', 'success');

      // 2. Open email client with pre-filled details for direct delivery
      const mailtoUrl = `mailto:suganthansugan47@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Suganthan M,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 700);

      form.reset();
      refreshInquiriesCount();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send"></i> Send Message to suganthansugan47@gmail.com';
      if (window.lucide) window.lucide.createIcons();
    }
  });
}

async function refreshInquiriesCount() {
  const countEl = document.getElementById('inquiry-count');
  if (!countEl) return;
  try {
    const res = await fetch('/api/contact');
    if (res.ok) {
      const result = await res.json();
      countEl.textContent = result.count || 0;
    }
  } catch (err) {
    // Ignore silent polling
  }
}

/* ==========================================================================
   6. Modals
   ========================================================================== */
function setupModals() {
  const projModal = document.getElementById('project-modal');
  const projCloseBtn = document.getElementById('modal-close-btn');

  const inquiriesModal = document.getElementById('inquiries-modal');
  const inquiriesCloseBtn = document.getElementById('inquiries-close-btn');
  const viewInquiriesBtn = document.getElementById('view-messages-btn');

  if (projCloseBtn && projModal) {
    projCloseBtn.addEventListener('click', () => projModal.classList.remove('open'));
    projModal.addEventListener('click', (e) => {
      if (e.target === projModal) projModal.classList.remove('open');
    });
  }

  if (viewInquiriesBtn && inquiriesModal) {
    viewInquiriesBtn.addEventListener('click', async () => {
      await renderInquiriesModal();
      inquiriesModal.classList.add('open');
    });
  }

  if (inquiriesCloseBtn && inquiriesModal) {
    inquiriesCloseBtn.addEventListener('click', () => inquiriesModal.classList.remove('open'));
    inquiriesModal.addEventListener('click', (e) => {
      if (e.target === inquiriesModal) inquiriesModal.classList.remove('open');
    });
  }
}

function openProjectModal(id) {
  const project = projectsData.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const titleEl = document.getElementById('modal-project-title');
  const bodyEl = document.getElementById('modal-project-body');

  titleEl.textContent = project.title;
  bodyEl.innerHTML = `
    <div style="margin-bottom: 20px;">
      <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: var(--radius-md);">
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <span class="project-category-badge" style="position: static;">${escapeHTML(project.category)}</span>
      ${project.metrics ? `<span style="font-size: 0.8rem; color: var(--accent-emerald); display: flex; align-items: center; gap: 4px;">⚡ ${escapeHTML(project.metrics)}</span>` : ''}
    </div>
    <p style="color: var(--text-main); font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">
      ${escapeHTML(project.longDescription || project.description)}
    </p>
    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 0.9rem; color: var(--text-subtle); text-transform: uppercase; margin-bottom: 10px;">Tech Stack</h4>
      <div class="tech-tag-list">
        ${(project.technologies || []).map(t => `<span class="tech-tag">${escapeHTML(t)}</span>`).join('')}
      </div>
    </div>
    <div style="display: flex; gap: 14px; border-top: 1px solid var(--border-subtle); padding-top: 20px;">
      ${project.github ? `<a href="${escapeHTML(project.github)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm"><i data-lucide="github"></i> View GitHub Repository</a>` : ''}
      ${project.demo ? `<a href="${escapeHTML(project.demo)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm"><i data-lucide="external-link"></i> Launch Live Application</a>` : ''}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  modal.classList.add('open');
}

async function renderInquiriesModal() {
  const bodyEl = document.getElementById('inquiries-modal-body');
  if (!bodyEl) return;

  try {
    bodyEl.innerHTML = '<p style="color: var(--text-muted);">Fetching inquiries from database...</p>';
    const res = await fetch('/api/contact');
    const result = await res.json();
    const contacts = result.data || [];

    if (contacts.length === 0) {
      bodyEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 24px;">No inquiries stored in database yet. Try submitting the Contact Form!</p>';
      return;
    }

    bodyEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${contacts.map(msg => `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="font-size: 1rem; color: #fff;">${escapeHTML(msg.name)} &lt;<a href="mailto:${escapeHTML(msg.email)}" style="color: var(--accent-cyan);">${escapeHTML(msg.email)}</a>&gt;</h4>
              <span style="font-size: 0.75rem; color: var(--text-subtle);">${new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            <p style="font-weight: 600; color: #e2e8f0; font-size: 0.9rem; margin-bottom: 6px;">Subject: ${escapeHTML(msg.subject)}</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">${escapeHTML(msg.message)}</p>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    bodyEl.innerHTML = `<p style="color: #ef4444;">Error fetching inquiries: ${escapeHTML(err.message)}</p>`;
  }
}

/* ==========================================================================
   7. Utilities
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function setupPhotoUpload() {
  const fileInput = document.getElementById('hero-photo-upload');
  const imgEl = document.getElementById('hero-profile-img');

  if (!fileInput || !imgEl) return;

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      imgEl.src = base64Data; // Immediate optimistic visual showcase
      showToast('Showcasing your photo! Saving to server...', 'info');

      try {
        const res = await fetch('/api/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Photo showcased and saved successfully!', 'success');
        } else {
          showToast('Photo active in browser preview', 'info');
        }
      } catch (err) {
        showToast('Photo active in browser preview', 'info');
      }
    };

    reader.readAsDataURL(file);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
