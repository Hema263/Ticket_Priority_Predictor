const API_BASE_URL = 'http://localhost:5000/api';

let currentPriority = 'all';
let currentAck = 'all';
let currentStatus = 'all';

// Load tickets and stats on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTickets();
    loadStats();
    
    // Setup filter buttons
    setupFilters();
    
    // Auto refresh every 5 seconds
    setInterval(() => {
        loadTickets();
        loadStats();
    }, 5000);
});

// Load all tickets
async function loadTickets() {
    try {
        let url = `${API_BASE_URL}/tickets`;
        const params = [];
        
        if (currentPriority !== 'all') {
            params.push(`priority=${currentPriority}`);
        }
        if (currentStatus !== 'all') {
            params.push(`status=${currentStatus}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            let tickets = data.tickets;
            
            // Filter by acknowledgement status
            if (currentAck === 'acknowledged') {
                tickets = tickets.filter(t => t.acknowledged === true);
            } else if (currentAck === 'unacknowledged') {
                tickets = tickets.filter(t => !t.acknowledged);
            }
            
            // Sort: Unacknowledged first, then by priority
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            tickets.sort((a, b) => {
                // Unacknowledged first
                if (a.acknowledged !== b.acknowledged) {
                    return a.acknowledged ? 1 : -1;
                }
                // Then by priority
                const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
                if (priorityDiff !== 0) return priorityDiff;
                // Then by ID
                return a.id - b.id;
            });
            
            displayTickets(tickets);
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        document.getElementById('ticketsList').innerHTML = 
            '<div class="empty-state"><h3>Error loading tickets</h3><p>Please make sure the backend server is running.</p></div>';
    }
}

// Display tickets in the UI
function displayTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = '<div class="empty-state"><h3>No tickets found</h3><p>No tickets match the current filter.</p></div>';
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-card ${ticket.priority.toLowerCase()}">
            <div class="ticket-header">
                <div>
                    <span class="ticket-id">Ticket #${ticket.id}</span>
                    <div class="ticket-title">${escapeHtml(ticket.title)}</div>
                </div>
                <div>
                    <span class="priority-badge ${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                    ${!ticket.acknowledged ? '<span class="ack-badge unacknowledged">⚠️ Unacknowledged</span>' : '<span class="ack-badge acknowledged">✅ Acknowledged</span>'}
                </div>
            </div>
            
            <div class="ticket-description">${escapeHtml(ticket.description)}</div>
            
            <div class="ticket-meta">
                <span><strong>Category:</strong> ${ticket.category}</span>
                <span><strong>Status:</strong> <span class="status-badge ${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></span>
                <span><strong>Created by:</strong> ${ticket.user_name}</span>
                <span><strong>Created:</strong> ${formatDate(ticket.created_at)}</span>
                ${ticket.acknowledged ? `<span><strong>Acknowledged:</strong> ${formatDate(ticket.acknowledged_at)} by ${ticket.acknowledged_by}</span>` : ''}
            </div>
            
            <div class="ticket-actions">
                ${!ticket.acknowledged ? 
                    `<button class="btn-action btn-acknowledge" onclick="acknowledgeTicket(${ticket.id})">✅ Acknowledge Ticket</button>` : 
                    '<span class="acknowledged-text">✅ Acknowledged</span>'
                }
                ${ticket.status !== 'Closed' ? 
                    `<button class="btn-action btn-close" onclick="updateTicketStatus(${ticket.id}, 'Closed')">Close Ticket</button>` : 
                    ''
                }
                <button class="btn-action btn-delete" onclick="deleteTicket(${ticket.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Acknowledge ticket
async function acknowledgeTicket(ticketId) {
    const engineerName = document.getElementById('engineerName').value || 'Network Engineer';
    
    if (!engineerName || engineerName.trim() === '') {
        alert('Please enter your engineer name first!');
        document.getElementById('engineerName').focus();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/acknowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ engineer_name: engineerName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Ticket #${ticketId} acknowledged successfully!`);
            loadTickets();
            loadStats();
        } else {
            alert('Error acknowledging ticket: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error acknowledging ticket');
    }
}

// Update ticket status
async function updateTicketStatus(ticketId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTickets();
            loadStats();
        } else {
            alert('Error updating ticket: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating ticket');
    }
}

// Delete ticket
async function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTickets();
            loadStats();
        } else {
            alert('Error deleting ticket: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting ticket');
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('stat-high').textContent = stats.by_priority.high;
            document.getElementById('stat-medium').textContent = stats.by_priority.medium;
            document.getElementById('stat-low').textContent = stats.by_priority.low;
            document.getElementById('stat-total').textContent = stats.total;
            document.getElementById('stat-unack').textContent = stats.unacknowledged || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get filter values
            currentPriority = btn.dataset.priority || 'all';
            currentAck = btn.dataset.ack || 'all';
            currentStatus = btn.dataset.status || 'all';
            
            // Load filtered tickets
            loadTickets();
        });
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Toggle technical criteria
function toggleCriteria() {
    const criteriaDiv = document.getElementById('technicalCriteria');
    const toggleBtn = document.querySelector('.criteria-toggle-btn');
    
    criteriaDiv.classList.toggle('expanded');
    toggleBtn.classList.toggle('expanded');
    
    if (criteriaDiv.classList.contains('expanded')) {
        toggleBtn.querySelector('span:first-child').textContent = '🔧 Hide Technical Classification Criteria';
    } else {
        toggleBtn.querySelector('span:first-child').textContent = '🔧 View Technical Classification Criteria';
    }
}

