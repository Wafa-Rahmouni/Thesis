const appointments = [
  { id: 1, patient: "John Doe", date: "2025-05-05", time: "10:00 AM", type: "In-person", status: "Scheduled" },
  { id: 2, patient: "Jane Smith", date: "2025-05-06", time: "2:00 PM", type: "Video", status: "Scheduled" },
];

let selectedAppointmentId = null;

// Add page navigation to tabs when the document is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Set up navigation for each tab button
  const tabButtons = document.querySelectorAll('.tabs button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the tab name and navigate to the corresponding page
      const tabName = this.textContent.trim().toLowerCase();
      navigateToPage(tabName);
    });
  });
  
  // Render appointments for the current page
  renderAppointments();
});

// Function to navigate to the correct page based on tab name
function navigateToPage(tabName) {
  // Define page mappings (tab name to HTML file)
  const pageMap = {
    'appointments': 'appointments.html',
    'patients': 'patients.html',
    'consultations': 'consultations.html',
    'prescriptions': 'prescriptions.html',
    'emergencies': 'emergencies.html',
    'messages': 'messages.html'
  };
  
  // Get the page URL
  const pageUrl = pageMap[tabName] || 'appointments.html'; // Default to appointments if not found
  
  // Navigate to the page
  window.location.href = pageUrl;
}

function renderAppointments() {
  const tbody = document.getElementById("appointments-table-body");
  if (!tbody) return; // Exit if element doesn't exist on this page
  
  tbody.innerHTML = "";

  appointments.forEach((appt) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${appt.patient}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>${appt.type}</td>
      <td id="status-${appt.id}">${appt.status}</td>
      <td class="action-buttons">
        <button class="confirm" onclick="openModal(${appt.id})">Confirm</button>
        <button class="reschedule" onclick="openModal(${appt.id})">Reschedule</button>
        <button class="cancel" onclick="openModal(${appt.id})">Cancel</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openModal(id) {
  selectedAppointmentId = id;
  document.getElementById("action-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("action-modal").style.display = "none";
  selectedAppointmentId = null;
}

function updateStatus(status) {
  const appt = appointments.find(a => a.id === selectedAppointmentId);
  if (appt) {
    appt.status = status;
    document.getElementById(`status-${appt.id}`).innerText = status;
  }
  closeModal();
}
