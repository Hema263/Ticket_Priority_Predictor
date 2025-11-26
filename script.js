const API_BASE_URL = 'http://localhost:5000/api';

// Load tickets and stats on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTickets();
    loadStats();
    
    // Setup form submission
    document.getElementById('ticketForm').addEventListener('submit', handleTicketSubmit);
    
    // Setup filter buttons
    setupFilters();
});

// Handle ticket form submission
async function handleTicketSubmit(e) {
    e.preventDefault();
    
    const formData = {
        user_name: document.getElementById('userName').value,
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        category: document.getElementById('ticketCategory').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Ticket created successfully!\nPriority: ${data.ticket.priority}\nTicket ID: #${data.ticket.id}`);
            
            // Reset form
            document.getElementById('ticketForm').reset();
            
            // Reload tickets and stats
            loadTickets();
            loadStats();
        } else {
            alert('Error creating ticket: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating ticket. Please make sure the backend server is running.');
    }
}

// Load all tickets
async function loadTickets(priority = 'all', status = 'all') {
    try {
        let url = `${API_BASE_URL}/tickets`;
        const params = [];
        
        if (priority !== 'all') {
            params.push(`priority=${priority}`);
        }
        if (status !== 'all') {
            params.push(`status=${status}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayTickets(data.tickets);
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
        ticketsList.innerHTML = '<div class="empty-state"><h3>No tickets found</h3><p>Create a new ticket to get started!</p></div>';
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-card ${ticket.priority.toLowerCase()}">
            <div class="ticket-header">
                <div>
                    <span class="ticket-id">Ticket #${ticket.id}</span>
                    <div class="ticket-title">${escapeHtml(ticket.title)}</div>
                </div>
                <span class="priority-badge ${ticket.priority.toLowerCase()}">${ticket.priority}</span>
            </div>
            
            <div class="ticket-description">${escapeHtml(ticket.description)}</div>
            
            <div class="ticket-meta">
                <span><strong>Category:</strong> ${ticket.category}</span>
                <span><strong>Status:</strong> <span class="status-badge ${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></span>
                <span><strong>Assigned to:</strong> ${ticket.assigned_to}</span>
                <span><strong>Created:</strong> ${formatDate(ticket.created_at)}</span>
                <span><strong>By:</strong> ${ticket.user_name}</span>
            </div>
            
            <div class="ticket-actions">
                ${ticket.status !== 'Closed' ? 
                    `<button class="btn-action btn-close" onclick="updateTicketStatus(${ticket.id}, 'Closed')">Close Ticket</button>` : 
                    ''
                }
                <button class="btn-action btn-delete" onclick="deleteTicket(${ticket.id})">Delete</button>
            </div>
        </div>
    `).join('');
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
            const priority = btn.dataset.priority || 'all';
            const status = btn.dataset.status || 'all';
            
            // Load filtered tickets
            loadTickets(priority, status);
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
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

