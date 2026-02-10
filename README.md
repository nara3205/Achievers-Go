# Achievers-Go (A-GO)

**A gamified web platform for managing student progress in academic courses.**

Plataforma Web per gestionar l'avenç dels alumnes en una assignatura utilitzant tècniques de gamificació.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Project Architecture](#project-architecture)
---

## ✨ Features

- **Student Dashboard**: View progress, achievements, and assignments
- **Teacher Dashboard**: Manage courses, assignments, and student evaluations
- **Gamification System**: Points, badges, and leaderboards
- **User Authentication**: Secure login with bcrypt password hashing
- **File Management**: Upload and manage course materials and assignments
- **CSV Import**: Bulk import student data
- **Responsive UI**: Vue.js-based modern interface
- **Role-Based Access**: Separate student and teacher views

---

## 🛠 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next-gen frontend build tool
- **Vue Router** - Client-side routing
- **CSS3** - Responsive styling

### Backend
- **Node.js + Express.js** - REST API server
- **MariaDB** - Database (MySQL compatible)
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-Origin Resource Sharing

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nodemon** - Hot-reload for development

---

## 📁 Project Structure

```
A-GO/
├── backend/                          # Express.js API server
│   ├── server.js                     # Main server entry point
│   ├── package.json                  # Backend dependencies
│   ├── Dockerfile                    # Backend container config
│   └── uploads/                      # User-uploaded files
├── frontend/
│   └── A-GO/                         # Vue.js application
│       ├── src/
│       │   ├── App.vue               # Root component
│       │   ├── main.js               # Entry point
│       │   ├── components/           # Reusable UI components
│       │   │   ├── Login.vue
│       │   │   ├── student_dashboard/
│       │   │   ├── teacher_dashboard/
│       │   │   └── ...
│       │   ├── router/
│       │   │   └── index.js          # Route definitions
│       │   └── assets/               # CSS and images
│       ├── package.json              # Frontend dependencies
│       ├── vite.config.js            # Vite configuration
│       └── Dockerfile                # Frontend container config
├── mariadb/
│   ├── init.sql                      # Database initialization script
│   └── a..erd.json                   # Database schema diagram
├── docker-compose.yml                # Docker Compose configuration
└── README.md                         # This file
```

---

## 📋 Prerequisites

### Option 1: Docker (Recommended)
- Docker Desktop (or Docker Engine + Docker Compose)

### Option 2: Local Development
- **Node.js** 20.19.0 or >=22.12.0
- **npm** 10+
- **MariaDB 11** or MySQL 8.0+

---

## 🚀 Setup & Installation

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/nara3205/Achievers-Go.git
   cd Achievers-Go
   ```

2. **Build and start services**
   ```bash
   docker-compose up --build
   ```

   Services will be available at:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - Database: `localhost:3306`

3. **Stop services**
   ```bash
   docker-compose down
   ```

### Local Setup (Without Docker)

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables** (create `.env` if needed)
   ```
   NODE_ENV=development
   PORT=8000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=user
   DB_NAME=user
   ```

3. **Start backend server**
   ```bash
   npm run dev      # Development with hot-reload
   # OR
   npm run basic    # Plain Node.js run
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend/A-GO
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173` with HMR enabled

3. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

#### Database Setup

1. **Start MariaDB locally** or via Docker
   ```bash
   docker run --name mariadb -e MYSQL_ROOT_PASSWORD=user \
     -e MYSQL_DATABASE=user -p 3306:3306 mariadb:11
   ```

2. **Initialize database**
   ```bash
   mysql -h localhost -u root -puser user < mariadb/init.sql
   ```

---

## 🏗 Project Architecture

### Frontend Architecture
- **Vue 3 Composition API** for component logic
- **Vue Router** for navigation between:
  - Login page
  - Student dashboard & subpages
  - Teacher dashboard & subpages
- **Asset files**: CSS imports and image assets
- **Component-based**: Reusable Vue components for UI

### Backend Architecture
- **Express.js REST API** with:
  - User authentication (bcrypt)
  - CSV file parsing for bulk imports
  - File upload management (Multer)
  - Database queries via MariaDB connector
- **CORS enabled** for frontend communication
- **Hot-reload** via nodemon in dev environment

### Database Schema
- MariaDB relational database
- Schema defined in `mariadb/init.sql`
- ER diagram available in `mariadb/a..erd.json`

---


## 🔧 Development Tips

- **Hot-reload enabled** in both frontend and backend (via Vite and Nodemon)
- **File uploads** are stored in `backend/uploads/`
- **CSV Parsing** supports bulk student import
- **Database debugging** can be done via MySQL client on `localhost:3306`

---


## 👤 Author

**Aran Franco Carreras**

---

## 📚 Resources

- [Vue.js Documentation](https://vuejs.org)
- [Express.js Documentation](https://expressjs.com)
- [MariaDB Documentation](https://mariadb.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Vite Documentation](https://vitejs.dev)
