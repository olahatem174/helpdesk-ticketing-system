# 🎫 HelpDesk Pro — IT Ticketing System

A production-ready, full-stack IT Helpdesk Ticketing System built with **React**, **Node.js/Express**, and **PostgreSQL**.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | JWT login/register, bcrypt password hashing |
| 👥 Roles | Admin · Technician · End User with route protection |
| 🎫 Tickets | Create, view, filter, search, paginate |
| 🔄 Workflow | Status: Open → In Progress → Resolved → Closed |
| 💬 Comments | Threaded responses + internal staff notes |
| 📋 Audit log | Full status-change history per ticket |
| 📊 Dashboard | Role-specific stats, priority & category charts |
| 🔔 Email | Nodemailer notifications (mock mode for local dev) |
| 👤 User Mgmt | Admin can change roles, activate/deactivate accounts |

---

## 🛠 Tech Stack

- **Frontend**: React 18, React Router v6, Axios, CSS Modules
- **Backend**: Node.js, Express.js, express-validator
- **Database**: PostgreSQL 15 (pg pool)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Email**: Nodemailer (mock-safe)

---

## 📁 Project Structure

```
helpdesk/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Badge, Pagination, ProtectedRoute, Layout, Sidebar, Topbar
│       ├── context/         # AuthContext (JWT state)
│       ├── pages/           # Login, Register, Dashboard, Tickets, TicketDetail, CreateTicket, Users
│       ├── services/        # Axios API layer
│       └── utils/           # Formatters, constants
├── server/                  # Express backend
│   ├── config/              # DB pool
│   ├── controllers/         # auth, ticket, comment, user, dashboard
│   ├── middleware/          # auth (JWT protect/authorize), validate, errorHandler
│   ├── routes/              # auth, tickets, comments, users, dashboard, categories
│   └── services/            # emailService
├── docs/
│   ├── schema.sql           # Full PostgreSQL schema + seed data
│   └── api.md               # API endpoint reference
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm

### 1 — Clone & Install

```bash
git clone https://github.com/YOU/helpdesk-ticketing-system.git
cd helpdesk-ticketing-system
npm run install:all
```

### 2 — Configure Environment

```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET at minimum
```

### 3 — Create & Seed Database

```bash
psql -U postgres -c "CREATE DATABASE helpdesk_db;"
psql -U postgres -d helpdesk_db -f docs/schema.sql
```

### 4 — Run (both servers)

```bash
npm run dev
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:5000/api |

---

## 🔑 Demo Accounts

After seeding, generate real bcrypt passwords by running:

```bash
cd server
node -e "const b=require('bcryptjs'); console.log(b.hashSync('Admin@123',10))"
```

Then update the seed hashes in `docs/schema.sql`, or simply register via the UI.

| Role       | Email                | Password  |
|------------|----------------------|-----------|
| Admin      | admin@helpdesk.com   | Admin@123 |
| Technician | tech@helpdesk.com    | Tech@123  |
| User       | user@helpdesk.com    | User@123  |

---

## 📡 API Overview

See [docs/api.md](docs/api.md) for full reference.

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/tickets          (filter: status, priority, category, search, page)
POST   /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
PUT    /api/tickets/:id/status
PUT    /api/tickets/:id/assign
DELETE /api/tickets/:id

GET    /api/tickets/:id/comments
POST   /api/tickets/:id/comments

GET    /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/dashboard
GET    /api/categories
```

---

## 🔮 Future Improvements

- [ ] WebSocket real-time updates
- [ ] File attachment uploads
- [ ] SLA tracking & breach alerts
- [ ] Slack / Teams integration
- [ ] 2FA authentication

---

## 📄 License

MIT
