# Quick Start Guide

## Step-by-Step Instructions to Run the Application

### Step 1: Start the Backend Server

1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install Python dependencies (first time only):
   ```bash
   pip install -r requirements.txt
   ```
   
   **Note:** If you get an error, try:
   ```bash
   pip3 install -r requirements.txt
   ```
   or
   ```bash
   python -m pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```
   
   **Note:** If `python` doesn't work, try `python3`:
   ```bash
   python3 app.py
   ```

5. You should see output like:
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```
   
   **Keep this terminal window open!** The server must be running for the application to work.

### Step 2: Open the Frontend

You have two options:

#### Option A: Direct File Open (Simplest)
1. Open the `frontend` folder in your file explorer
2. Double-click `index.html` to open it in your default browser

#### Option B: Using a Local Server (Recommended)
1. Open a **NEW** terminal/command prompt (keep the backend terminal running)
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

3. Start a local server:

   **Using Python:**
   ```bash
   python -m http.server 8000
   ```
   or
   ```bash
   python3 -m http.server 8000
   ```

   **Using Node.js (if you have it):**
   ```bash
   npx http-server -p 8000
   ```

4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

### Step 3: Use the Application

1. You'll see the home page with two options:
   - **User Portal**: Click to raise tickets
   - **Network Engineer Portal**: Click to view and acknowledge tickets

2. **To raise a ticket:**
   - Click "User Portal"
   - Fill in your name, problem title, description, and category
   - Click "Submit Ticket"
   - The system will automatically assign priority (High/Medium/Low)

3. **To view and acknowledge tickets:**
   - Click "Network Engineer Portal"
   - Enter your engineer name
   - View all tickets
   - Click "✅ Acknowledge Ticket" to acknowledge tickets

## Troubleshooting

### Backend won't start
- Make sure Python is installed: `python --version` or `python3 --version`
- Make sure you're in the `backend` folder
- Check if port 5000 is already in use

### Frontend can't connect to backend
- Make sure the backend server is running (Step 1)
- Check that you see "Running on http://127.0.0.1:5000" in the backend terminal
- Make sure both are running on the same computer

### Port already in use
- If port 5000 is busy, edit `backend/app.py` and change `port=5000` to another port (e.g., `port=5001`)
- If port 8000 is busy, use a different port: `python -m http.server 8080`

## What You Need

- **Python 3.7 or higher** (for backend)
- **Web browser** (Chrome, Firefox, Edge, Safari)
- **Internet connection** (only for installing packages, not needed to run)

## Quick Commands Summary

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend (Option B only)
cd frontend
python -m http.server 8000
```

Then open: `http://localhost:8000` or just open `index.html` directly!

