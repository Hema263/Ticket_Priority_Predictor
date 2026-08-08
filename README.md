# 🎫 MNC Ticket Management System

[![Python](https://img.shields.io/badge/Python-3.7%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green.svg)](https://flask.palletsprojects.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%2FCSS3%2FJS-orange.svg)](https://developer.mozilla.org/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A full-stack, enterprise-ready **Ticket Management System** designed for Multinational Corporations (MNCs) to streamline IT and network support operations. The system features an **automated problem-classification engine** that dynamically evaluates ticket priority (High, Medium, Low) based on problem severity, hardware diagnostics, and urgent service indicators.

---

## 🌟 Key Features

- 🎫 **User Support Portal (`user.html`)**
  - Instant ticket submission with title, category, description, and user identification.
  - Live status tracking of submitted tickets with priority badges and engineer assignment status.

- 🚨 **Automated Priority Engine**
  - Intelligent keyword and context analyzer to classify tickets on submission:
    - **High Priority**: System outages, critical errors, security breaches, server downs, or physical/hardware damage (liquid spills, burning smell, CPU/GPU failures).
    - **Medium Priority**: Performance bottlenecks, system lag, intermittent connectivity, or speed degradation.
    - **Low Priority**: General inquiries, how-to questions, documentation requests, or minor feature suggestions.

- 👨‍💼 **Network Engineer Portal (`engineer.html`)**
  - Prioritized queue: Unacknowledged & High-priority tickets automatically float to the top.
  - **One-Click Acknowledgement**: Engineers acknowledge tickets, instantly transitioning status to **In Progress** with timestamp and engineer logging.
  - Live auto-refresh polling (every 5 seconds) to ensure real-time queue updates.

- 📊 **Real-Time Analytics Dashboard**
  - Live statistical breakdown showing total tickets, active status (Open, In Progress, Closed), priority distributions, and unacknowledged ticket alerts.

- 🔍 **Dynamic Queue Filtering**
  - Multi-criteria filtering by priority level, resolution status, or acknowledgement state.

---

## 🏗️ Architecture & Technology Stack

```
                     ┌──────────────────────────────────┐
                     │    Web Browser (User / Engineer) │
                     └────────────────┬─────────────────┘
                                      │
                         RESTful API (JSON / HTTP)
                                      │
                     ┌────────────────▼─────────────────┐
                     │       Flask Backend Server       │
                     │  - REST API Routes               │
                     │  - Priority Classification Engine│
                     │  - CORS Middleware               │
                     └──────────────────────────────────┘
```

- **Backend**: Python 3.7+, Flask, Flask-CORS, Gunicorn (Production WSGI)
- **Frontend**: Vanilla HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), JavaScript (ES6+ Fetch API)
- **API Standard**: RESTful JSON API

---

## 📁 Repository Structure

```
Ticket/
├── Backend/
│   ├── app.py              # Flask application server & API routes
│   ├── requirements.txt    # Python dependencies (Flask, Flask-CORS, gunicorn)
│   └── Procfile            # Deployment configuration for backend
├── Frontend/
│   ├── index.html          # Portal selection home page
│   ├── user.html           # User support ticket submission portal
│   ├── engineer.html       # Network Engineer operations portal
│   ├── styles.css          # Unified modern CSS styling
│   ├── script.js           # Shared utilities & API communication logic
│   ├── user-script.js      # User portal interface logic
│   └── engineer-script.js  # Engineer portal operations logic
├── Procfile                # Root process file for cloud deployments (Heroku, Render, etc.)
├── QUICK_START.md          # Step-by-step setup guide for local development
└── README.md               # Repository documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Python 3.7+](https://www.python.org/downloads/) installed
- Modern Web Browser (Chrome, Firefox, Edge, Safari)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ticket-management-system.git
cd ticket-management-system
```

---

### Step 2: Set Up & Launch the Backend

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask development server:
   ```bash
   python app.py
   ```
   > 💡 **Server URL**: The backend will run on `http://127.0.0.1:5000/`.

---

### Step 3: Launch the Frontend

You can launch the frontend using either of the following options:

#### Option A: Local HTTP Server (Recommended)
Open a new terminal window, navigate to the `Frontend` directory, and run:

```bash
cd Frontend
python -m http.server 8000
```
Then open your browser and navigate to `http://localhost:8000`.

#### Option B: Direct Browser Launch
Open `Frontend/index.html` directly in your web browser.

---

## 📡 API Reference

The backend exposes the following RESTful API endpoints:

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets` | Create a new ticket (auto-classified) | `{ "title", "description", "category", "user_name" }` |
| `GET` | `/api/tickets` | Fetch tickets (supports `?priority=` & `?status=`) | None |
| `GET` | `/api/tickets/<id>` | Retrieve a single ticket by ID | None |
| `PUT` | `/api/tickets/<id>` | Update ticket fields (e.g. status, priority) | `{ "status", "priority", "assigned_to" }` |
| `POST` | `/api/tickets/<id>/acknowledge` | Acknowledge ticket by engineer | `{ "engineer_name" }` |
| `DELETE` | `/api/tickets/<id>` | Delete a ticket by ID | None |
| `GET` | `/api/stats` | Get real-time ticket metrics & statistics | None |

---

## 🧠 Priority Classification Algorithm

The priority classification logic in `Backend/app.py` automatically evaluates the ticket text:

| Priority Level | Evaluated Keywords / Problem Context | Default Status |
| :--- | :--- | :--- |
| 🔴 **High** | `down`, `outage`, `broken`, `crash`, `not working`, `urgent`, `critical`, `security breach`, physical hardware issues (`spill`, `smoke`, `cpu`, `motherboard`, `cracked screen`) | Open |
| 🟡 **Medium** | `slow`, `lag`, `delayed`, `degraded`, `performance`, `intermittent`, `hanging`, `timeout` | Open |
| 🟢 **Low** | `question`, `inquiry`, `how to`, `information`, `feature request`, `documentation`, `cosmetic`, `non-urgent` | Open |

---

## ☁️ Deployment

The repository includes pre-configured `Procfile` manifests for zero-config deployment on platforms such as **Render**, **Railway**, or **Heroku**.

### Backend Deployment Settings:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --chdir Backend app:app`
- **Environment Variables**:
  - `PORT`: (Assigned by hosting provider, defaults to `5000`)
  - `FLASK_DEBUG`: `false`

---

## 🗺️ Production Roadmap & Enhancements

- [ ] **Database Integration**: Replace in-memory storage with PostgreSQL / SQLite via Flask-SQLAlchemy.
- [ ] **Authentication & RBAC**: Add JWT-based user authentication and role-based access for admins, users, and engineers.
- [ ] **Email / Webhook Notifications**: Notify engineers instantly via email or Slack webhooks when High-priority tickets are generated.
- [ ] **WebSocket Integration**: Upgrade dashboard updates from HTTP polling to Socket.IO for real-time push notifications.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the Repository.
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
