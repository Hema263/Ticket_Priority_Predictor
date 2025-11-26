# Ticket Management System for MNC

A comprehensive ticket management system with automatic priority classification (High, Medium, Low) for network engineers in MNCs.

## Features

- 🎫 **User Portal**: Separate page for users to raise tickets
- 🚨 **Automatic Priority Classification**: 
  - **High Priority**: Urgent, critical, down, outage, emergency issues
  - **Medium Priority**: Normal performance issues, standard problems
  - **Low Priority**: Questions, inquiries, non-urgent requests
- 👨‍💼 **Network Engineer Portal**: Separate page for engineers to view and manage tickets
- ✅ **Acknowledgement System**: Engineers can acknowledge tickets, which updates status to "In Progress"
- 📊 **Statistics Dashboard**: Real-time statistics for ticket priorities and acknowledgement status
- 🔍 **Advanced Filtering**: Filter tickets by priority, status, or acknowledgement status
- 💾 **Ticket Storage**: All tickets are stored and can be viewed by both users and engineers

## Technology Stack

- **Backend**: Python Flask
- **Frontend**: HTML, CSS, JavaScript
- **API**: RESTful API

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open the `frontend/index.html` file in a web browser (this is the home page with links to both portals)
2. Or use a local server (recommended):
   - Using Python: `python -m http.server 8000` (in the frontend directory)
   - Using Node.js: `npx http-server` (in the frontend directory)
   - Then open `http://localhost:8000` in your browser

### Pages Available

- **index.html**: Home page with links to User and Engineer portals
- **user.html**: User portal for raising tickets
- **engineer.html**: Network Engineer portal for viewing and acknowledging tickets

## How Priority Classification Works

The system automatically classifies ticket priority based on keywords in the title and description:

### High Priority Keywords
- urgent, critical, down, outage, broken, not working
- emergency, immediate, severe, blocking
- production down, server down, network down
- security breach, data loss

### Medium Priority Keywords
- slow, degraded, intermittent, minor issue
- performance, optimization, enhancement
- moderate, normal, standard

### Low Priority Keywords
- question, inquiry, information, general
- low priority, non-urgent, when possible
- nice to have, feature request
- cosmetic, minor, documentation

**Note**: If no keywords match, the ticket defaults to **Medium** priority.

## API Endpoints

- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get all tickets (with optional priority/status filters)
- `GET /api/tickets/<id>` - Get a specific ticket
- `PUT /api/tickets/<id>` - Update a ticket
- `POST /api/tickets/<id>/acknowledge` - Acknowledge a ticket (by engineer)
- `DELETE /api/tickets/<id>` - Delete a ticket
- `GET /api/stats` - Get ticket statistics

## Usage Flow

### For Users:
1. Go to **User Portal** (`user.html`)
2. Fill in your name, problem title, description, and category
3. Submit the ticket
4. The system automatically:
   - Classifies priority (High/Medium/Low) based on keywords
   - Assigns to Network Engineer
   - Stores the ticket
5. View your submitted tickets on the same page

### For Network Engineers:
1. Go to **Engineer Portal** (`engineer.html`)
2. Enter your engineer name
3. View all tickets (sorted with unacknowledged High priority tickets first)
4. Click "Acknowledge Ticket" to acknowledge tickets
   - This updates status to "In Progress"
   - Records acknowledgement time and engineer name
5. Filter tickets by priority, status, or acknowledgement status
6. Close tickets when resolved

## Usage Example

1. **User creates a High Priority Ticket**:
   - Title: "Network Down - Urgent"
   - Description: "The entire network is down and we cannot access any servers. This is critical."
   - Result: Automatically classified as **High** priority and sent to engineer

2. **Engineer acknowledges the ticket**:
   - Engineer sees the ticket in their portal
   - Clicks "Acknowledge Ticket"
   - Status changes to "In Progress"
   - User can see the acknowledgement status

## Project Structure

```
ticket/
├── backend/
│   ├── app.py              # Flask backend server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Home page
│   ├── user.html           # User portal (raise tickets)
│   ├── engineer.html       # Engineer portal (view & acknowledge)
│   ├── styles.css          # CSS styling
│   ├── user-script.js      # User portal JavaScript
│   └── engineer-script.js  # Engineer portal JavaScript
└── README.md               # This file
```

## Notes

- The current implementation uses in-memory storage. For production, replace with a database (SQLite, PostgreSQL, MySQL, etc.)
- All tickets are automatically assigned to "Network Engineer"
- Tickets are sorted with unacknowledged tickets first, then by priority (High first, then Medium, then Low)
- When an engineer acknowledges a ticket, it automatically changes status to "In Progress"
- Users can see acknowledgement status on their submitted tickets
- Engineer portal auto-refreshes every 5 seconds to show new tickets

## License

This project is open source and available for use in MNC environments.

