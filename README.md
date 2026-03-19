# 🚀 Personal Portfolio Website

A personal portfolio designed to showcase projects and technical skills. Built with **Node.js**, **Express**, and **PostgreSQL**, this application features a real-time admin dashboard for seamless content management.

🔗 **Live Demo:** [https://personalportfolio-production-d8b8.up.railway.app/](https://personalportfolio-production-d8b8.up.railway.app/)

---

## ✨ Key Features

- **Dynamic Content Loading:** Projects and skills are fetched and updated asynchronously using the Fetch API, providing an app-like experience.
- **Admin Dashboard:** A secured portal (`/login`) for managing projects and technical stack labels.
- **Responsive Design:** Optimized for all screen sizes with a premium, minimalist aesthetic.
- **Dockerized Architecture:** Easily deployable using Docker and Docker Compose.
- **Persistent Storage:** Relational database management using PostgreSQL.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Frontend** | EJS, Vanilla CSS, JavaScript (Fetch API) |
| **Auth** | express-session, bcrypt |
| **DevOps** | Docker, Docker Compose |

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (if running locally)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### 2. Environment Setup

Create a `.env` file in the root directory and fill in your details.

```env
POSTGRES_USER = user_name
POSTGRES_DB = database_name 
POSTGRES_PASSWORD = your_password
POSTGRES_HOST = host

POSTGRES_EXTERNAL_PORT =5432 
POSTGRES_INTERNAL_PORT =5432

SESSION_SECRET = your_secret_key
PORT = 3000

```

### 3. Installation & Run

#### Using Docker (Recommended)

```bash
docker compose up --build -d
```

The app will be available at `http://localhost:3000`.

#### Manual Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Initialize the database using `init.sql`.
3. Start the server:

   ```bash
   npm start
   ```

---

## 📂 Project Structure

```text
├── db/              # Database connection logic
├── models/          # Business logic and queries
├── static/          # Client-side assets (CSS, JS, Images)
├── views/           # EJS templates
├── init.sql         # Database schema & seed data
├── index.js         # Entry point
└── docker-compose.yml
```

---

## 📜 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.
