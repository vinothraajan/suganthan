# Sugan | Full-Stack Personal Portfolio Website

A modern, high-performance, full-stack personal portfolio designed to showcase projects, technical skills, interactive contact messages, and a dynamic database management hub.

Built with clean, production-grade architecture adhering to industry standards.

---

## 🚀 Key Highlights & Tech Stack

- **Frontend**:
  - Semantic HTML5, Vanilla CSS3 (Custom Design System: Deep Obsidian, Electric Cyan & Indigo accents, Glassmorphism, Responsive Grid/Flexbox), and Vanilla JavaScript (ES6+).
  - Dynamic typewriter animation, animated skill progress meters, instant project category filtering, live debounced search, responsive navigation, and project modal preview.
- **Backend**:
  - **Node.js & Express.js** RESTful API.
  - Endpoints for projects CRUD, categorized skills, profile details, contact message submission, and health telemetry.
  - Robust CORS configuration and error-handling middleware.
- **Database**:
  - **Dual-Mode Data Layer**:
    1. **Local Persistent Storage**: Auto-initialized from `server/data/seed.json` into `server/data/store.json`, zero external dependencies needed to run locally immediately.
    2. **Cloud Database Ready**: Direct support for MongoDB Atlas (`MONGODB_URI`) or PostgreSQL/MySQL.
- **Deployment Ready**:
  - Pre-configured for **Vercel** (`vercel.json`), **Render**, **Netlify**, and **Heroku**.

---

## 📂 Project Architecture

```
d:\Sugan portfolio\
├── package.json               # Node.js dependencies & run scripts
├── vercel.json                # Serverless deployment configuration for Vercel
├── .env.example               # Template environment configuration
├── README.md                  # Detailed documentation & deployment guide
│
├── public/                    # Frontend client assets
│   ├── index.html             # Semantic responsive HTML layout
│   ├── css/
│   │   └── style.css          # Design system, glassmorphic cards, animations
│   └── js/
│       └── main.js            # Client-side API fetch, filtering, CRUD & state
│
└── server/                    # Node.js / Express Backend
    ├── server.js              # Express app entry point & route registration
    ├── config/
    │   └── db.js              # Persistent database manager & auto-seeder
    ├── models/
    │   └── dataStore.js       # Data abstraction layer for Projects, Skills, Contacts
    ├── routes/
    │   ├── projectRoutes.js   # CRUD routes for projects
    │   ├── skillRoutes.js     # Categorized skills retrieval
    │   └── contactRoutes.js   # Contact form submission and retrieval
    └── data/
        ├── seed.json          # High-impact initial seed dataset
        └── store.json         # Active persistent local database
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)

### Installation & Launch

1. Open your terminal in the project directory:
   ```bash
   cd "d:\Sugan portfolio"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   - **Website**: [http://localhost:5000](http://localhost:5000)
   - **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **Projects API**: [http://localhost:5000/api/projects](http://localhost:5000/api/projects)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service uptime and status |
| `GET` | `/api/profile` | Developer bio, social links, and metrics |
| `GET` | `/api/skills` | Categorized tech stack & proficiencies |
| `GET` | `/api/projects` | Fetch projects (supports `?category=Full-Stack` & `?search=term`) |
| `GET` | `/api/projects/:id` | Fetch specific project details |
| `POST` | `/api/projects` | Create a new project in the database |
| `PUT` | `/api/projects/:id` | Update an existing project |
| `DELETE` | `/api/projects/:id` | Delete a project from the database |
| `POST` | `/api/contact` | Submit a contact form inquiry |
| `GET` | `/api/contact` | Retrieve stored contact inquiries |

---

## 🌐 Deployment Guide

### Option 1: Deploying to Vercel (Recommended & 1-Click)
1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sugan Fullstack Portfolio"
   git remote add origin https://github.com/<your-username>/sugan-portfolio.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `sugan-portfolio` repository.
4. The included [vercel.json](file:///d:/Sugan%20portfolio/vercel.json) automatically sets up the static frontend routing and the `/api` serverless backend!
5. Click **Deploy**. Your site will be live on `https://<your-project>.vercel.app` in under 60 seconds!

### Option 2: Deploying to Render
1. Create a free account at [Render](https://render.com).
2. Click **"New Web Service"** and link your GitHub repo.
3. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
4. Click **Create Web Service**.

### Option 3: Deploying to Netlify
1. Log into [Netlify](https://netlify.com) and import your Git repo.
2. Publish directory: `public`.

---

## 🗄️ Connecting to MongoDB Atlas (Optional Cloud DB)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and get your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
3. Set the environment variable in your `.env` or in Vercel/Render dashboard:
   ```env
   MONGODB_URI=your_connection_string_here
   ```

---

## 🧪 Interactive Testing
Navigate to the **Database Hub** section on the website to:
1. Fill out the "Save Project to Database" form and see it immediately appear in your project gallery.
2. Filter projects by category (Full-Stack, Frontend, Backend) or search using the live search bar.
3. Submit a message via the Contact Form and click "View Inquiries" to inspect stored database records!
