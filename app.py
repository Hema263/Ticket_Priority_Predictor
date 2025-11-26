from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import re
import os
import google.generativeai as genai


app = Flask(__name__)
CORS(app)
print("Starting Flask Application...")

# In-memory storage (replace with database in production)


# In-memory storage (replace with database in production)
tickets = []
ticket_counter = 1

# Configure LLM
def configure_llm():
    """Configure the Google Gemini API"""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment variables. LLM features will be disabled.")
        return False
    
    genai.configure(api_key=api_key)
    return True

def classify_priority(title, description):
    """
    Classify ticket priority using LLM with fallback to keyword matching
    """
    # Try LLM first if configured
    if configure_llm():
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            Analyze the following IT support ticket and classify its priority as 'High', 'Medium', or 'Low'.
            
            Ticket Title: {title}
            Ticket Description: {description}
            
            Priority Definitions:
            - High: Critical system outages, security breaches, data loss, hardware damage, or blocking issues affecting many users.
            - Medium: Performance issues, non-critical bugs, individual user issues that don't block work completely.
            - Low: Information requests, cosmetic issues, feature requests, or minor annoyances.
            
            Return ONLY the priority word (High, Medium, or Low) without explanation.
            """
            
            response = model.generate_content(prompt)
            priority = response.text.strip()
            
            # Validate response
            if priority in ['High', 'Medium', 'Low']:
                return priority
                
        except Exception as e:
            print(f"LLM classification failed: {e}")
            # Fall through to fallback
            
    return classify_priority_fallback(title, description)

def classify_priority_fallback(title, description):
    """
    Classify ticket priority based on problem nature, not just keywords
    Analyzes the actual problem to determine if it's:
    - High: Urgent/Critical problems (things not working, down, broken)
    - Medium: Performance issues (slow, degraded performance)
    - Low: Information requests (questions, inquiries, general info)
    """
    text = (title + ' ' + description).lower()
    
    # HIGH PRIORITY: Urgent problems - things that are broken, down, not working
    # Look for urgent/critical problem indicators
    urgent_indicators = [
        # System/service status issues
        'not working', 'not accessible', 'cannot access', 'unable to',
        'down', 'offline', 'unavailable', 'broken', 'crash', 'crashed',
        'error', 'failed', 'failure', 'stopped', 'stopped working',
        'outage', 'disconnected', 'connection lost', 'no connection',
        'server down', 'network down', 'system down', 'service down',
        'website down', 'application down', 'database down',
        
        # Critical/urgent language
        'urgent', 'critical', 'emergency', 'immediate', 'asap', 'as soon as possible',
        'blocking', 'severe', 'major', 'serious', 'important',
        'production down', 'live down', 'customer facing',
        
        # Security/data issues
        'security breach', 'hacked', 'compromised', 'data loss', 'data breach',
        'unauthorized access', 'malware', 'virus', 'attack',

        # Hardware/Physical Damage (High Priority)
        'spill', 'spilled', 'liquid', 'water', 'sauce', 'coffee', 'tea', 'juice',
        'motherboard', 'mobo', 'cpu', 'gpu', 'ram', 'hard drive', 'disk',
        'smoke', 'spark', 'burn', 'fire', 'smell', 'burning',
        'physical damage', 'broken screen', 'crack', 'cracked'
    ]
    
    # MEDIUM PRIORITY: Performance/speed issues
    # Look for performance-related problems
    performance_indicators = [
        'slow', 'slower', 'slowing', 'lag', 'lagging', 'delayed', 'delay',
        'degraded', 'degradation', 'poor performance', 'performance issue',
        'taking time', 'timeout', 'time out', 'hanging', 'freezing',
        'intermittent', 'sometimes', 'occasionally', 'unstable',
        'optimization', 'optimize', 'improve performance', 'speed up',
        'bottleneck', 'congestion'
    ]
    
    # LOW PRIORITY: Information/query requests
    # Look for questions and information requests
    info_indicators = [
        'question', 'questions', 'ask', 'asking', 'inquiry', 'inquiries',
        'information', 'info', 'want to know', 'wondering', 'curious',
        'how to', 'how do', 'what is', 'what are', 'explain', 'explanation',
        'clarification', 'clarify', 'understand', 'understanding',
        'general', 'general question', 'just asking', 'for information',
        'feature request', 'suggestion', 'idea', 'enhancement',
        'documentation', 'guide', 'tutorial', 'help with',
        'non-urgent', 'when possible', 'whenever', 'nice to have',
        'cosmetic', 'minor', 'small', 'low priority'
    ]
    
    # Analyze the problem nature
    # Check for urgent problems first (highest priority)
    for indicator in urgent_indicators:
        if indicator in text:
            return 'High'
    
    # Check for information requests (lowest priority)
    for indicator in info_indicators:
        if indicator in text:
            return 'Low'
    
    # Check for performance issues (medium priority)
    for indicator in performance_indicators:
        if indicator in text:
            return 'Medium'
    
    # If no clear indicators, analyze problem context
    # Check if it sounds like a working issue (High)
    working_issue_patterns = [
        'cannot', 'unable', 'not able', 'doesn\'t work', 'won\'t work',
        'not responding', 'not loading', 'not opening', 'not starting'
    ]
    for pattern in working_issue_patterns:
        if pattern in text:
            return 'High'
    
    # Check if it sounds like a question (Low)
    question_patterns = [
        '?', 'why', 'what', 'how', 'when', 'where', 'which', 'who'
    ]
    question_count = sum(1 for pattern in question_patterns if pattern in text)
    if question_count >= 2:  # Multiple question words = likely a question
        return 'Low'
    
    # Default to Medium for unclear cases
    return 'Medium'

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    """Create a new ticket with automatic priority classification"""
    global ticket_counter
    
    data = request.json
    title = data.get('title', '')
    description = data.get('description', '')
    category = data.get('category', 'Network')
    user_name = data.get('user_name', 'User')
    
    # Classify priority automatically
    priority = classify_priority(title, description)
    
    ticket = {
        'id': ticket_counter,
        'title': title,
        'description': description,
        'category': category,
        'priority': priority,
        'status': 'Open',
        'user_name': user_name,
        'assigned_to': 'Network Engineer',
        'acknowledged': False,
        'acknowledged_at': None,
        'acknowledged_by': None,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    tickets.append(ticket)
    ticket_counter += 1
    
    return jsonify({
        'success': True,
        'ticket': ticket,
        'message': f'Ticket created with {priority} priority'
    }), 201

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    """Get all tickets, optionally filtered by priority"""
    priority_filter = request.args.get('priority')
    status_filter = request.args.get('status')
    
    filtered_tickets = tickets
    
    if priority_filter:
        filtered_tickets = [t for t in filtered_tickets if t['priority'] == priority_filter]
    
    if status_filter:
        filtered_tickets = [t for t in filtered_tickets if t['status'] == status_filter]
    
    # Sort by: Unacknowledged first, then by priority (High first, then Medium, then Low)
    priority_order = {'High': 1, 'Medium': 2, 'Low': 3}
    filtered_tickets.sort(key=lambda x: (
        not x.get('acknowledged', False),  # Unacknowledged first (False sorts before True)
        priority_order.get(x['priority'], 4),  # Then by priority
        x['id']  # Then by ID
    ))
    
    return jsonify({
        'success': True,
        'tickets': filtered_tickets,
        'total': len(filtered_tickets)
    })

@app.route('/api/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    """Get a specific ticket by ID"""
    ticket = next((t for t in tickets if t['id'] == ticket_id), None)
    
    if not ticket:
        return jsonify({'success': False, 'message': 'Ticket not found'}), 404
    
    return jsonify({'success': True, 'ticket': ticket})

@app.route('/api/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    """Update ticket status or other fields"""
    ticket = next((t for t in tickets if t['id'] == ticket_id), None)
    
    if not ticket:
        return jsonify({'success': False, 'message': 'Ticket not found'}), 404
    
    data = request.json
    
    # Update allowed fields
    if 'status' in data:
        ticket['status'] = data['status']
    if 'priority' in data:
        ticket['priority'] = data['priority']
    if 'assigned_to' in data:
        ticket['assigned_to'] = data['assigned_to']
    
    ticket['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify({
        'success': True,
        'ticket': ticket,
        'message': 'Ticket updated successfully'
    })

@app.route('/api/tickets/<int:ticket_id>/acknowledge', methods=['POST'])
def acknowledge_ticket(ticket_id):
    """Acknowledge a ticket by network engineer"""
    ticket = next((t for t in tickets if t['id'] == ticket_id), None)
    
    if not ticket:
        return jsonify({'success': False, 'message': 'Ticket not found'}), 404
    
    data = request.json
    engineer_name = data.get('engineer_name', 'Network Engineer')
    
    ticket['acknowledged'] = True
    ticket['acknowledged_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ticket['acknowledged_by'] = engineer_name
    ticket['status'] = 'In Progress'
    ticket['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify({
        'success': True,
        'ticket': ticket,
        'message': 'Ticket acknowledged successfully'
    })

@app.route('/api/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    """Delete a ticket"""
    global tickets
    ticket = next((t for t in tickets if t['id'] == ticket_id), None)
    
    if not ticket:
        return jsonify({'success': False, 'message': 'Ticket not found'}), 404
    
    tickets = [t for t in tickets if t['id'] != ticket_id]
    
    return jsonify({
        'success': True,
        'message': 'Ticket deleted successfully'
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get ticket statistics"""
    total = len(tickets)
    high = len([t for t in tickets if t['priority'] == 'High'])
    medium = len([t for t in tickets if t['priority'] == 'Medium'])
    low = len([t for t in tickets if t['priority'] == 'Low'])
    open_tickets = len([t for t in tickets if t['status'] == 'Open'])
    closed_tickets = len([t for t in tickets if t['status'] == 'Closed'])
    acknowledged = len([t for t in tickets if t.get('acknowledged', False)])
    unacknowledged = total - acknowledged
    
    return jsonify({
        'success': True,
        'stats': {
            'total': total,
            'by_priority': {
                'high': high,
                'medium': medium,
                'low': low
            },
            'by_status': {
                'open': open_tickets,
                'closed': closed_tickets,
                'in_progress': total - open_tickets - closed_tickets
            },
            'acknowledged': acknowledged,
            'unacknowledged': unacknowledged
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)

