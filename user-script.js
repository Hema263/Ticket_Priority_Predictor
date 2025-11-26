const API_BASE_URL = 'http://localhost:5000/api';

// Load user's tickets on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMyTickets();
    
    // Setup form submission
    document.getElementById('ticketForm').addEventListener('submit', handleTicketSubmit);
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
            // Show success message
            const successDiv = document.getElementById('successMessage');
            const ticketInfo = document.getElementById('ticketInfo');
            ticketInfo.innerHTML = `
                <strong>Ticket ID:</strong> #${data.ticket.id}<br>
                <strong>Priority:</strong> <span class="priority-badge ${data.ticket.priority.toLowerCase()}">${data.ticket.priority}</span><br>
                <strong>Status:</strong> ${data.ticket.status}<br>
                <strong>Assigned to:</strong> ${data.ticket.assigned_to}
            `;
            successDiv.style.display = 'block';
            
            // Reset form
            document.getElementById('ticketForm').reset();
            
            // Scroll to success message
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Reload tickets
            loadMyTickets();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        } else {
            alert('Error creating ticket: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating ticket. Please make sure the backend server is running.');
    }
}

// Load user's tickets
async function loadMyTickets() {
    try {
        const response = await fetch(`${API_BASE_URL}/tickets`);
        const data = await response.json();
        
        if (data.success) {
            // Get user name from form or show all tickets
            const userName = document.getElementById('userName').value;
            let userTickets = data.tickets;
            
            // If user has entered name, filter by user name
            if (userName) {
                userTickets = data.tickets.filter(t => 
                    t.user_name.toLowerCase() === userName.toLowerCase()
                );
            }
            
            // Sort by created date (newest first)
            userTickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            displayMyTickets(userTickets);
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        document.getElementById('myTicketsList').innerHTML = 
            '<div class="empty-state"><h3>Error loading tickets</h3><p>Please make sure the backend server is running.</p></div>';
    }
}

// Display user's tickets
function displayMyTickets(tickets) {
    const ticketsList = document.getElementById('myTicketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = '<div class="empty-state"><h3>No tickets submitted yet</h3><p>Create a ticket above to get started!</p></div>';
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
                ${ticket.acknowledged ? `<span><strong>Acknowledged:</strong> ✅ ${formatDate(ticket.acknowledged_at)} by ${ticket.acknowledged_by}</span>` : '<span><strong>Acknowledged:</strong> ⏳ Pending</span>'}
            </div>
        </div>
    `).join('');
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

// Reload tickets when user name changes
document.getElementById('userName').addEventListener('blur', () => {
    loadMyTickets();
});

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

