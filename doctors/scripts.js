let selectedAppointmentId = null;

// --- Initialize After Common Content is Loaded ---
document.addEventListener('DOMContentLoaded', () => {
  loadCommonHTML(() => {
    console.log('Common content loaded and initialized.');
    initializeCommonEventListeners();
  });

  // Other initialization logic
  setupTabNavigation();
  renderAppointments();
});

document.addEventListener("DOMContentLoaded", function () {
  renderAppointments(); // Render existing appointments
});

// --- Tab Navigation ---
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const currentPage = window.location.pathname.split("/").pop();

  tabButtons.forEach(button => {
    const page = button.getAttribute("data-page");

    button.addEventListener("click", () => {
      if (page) window.location.href = page;
    });

    if (page === currentPage) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// --- Appointments Rendering ---
function renderAppointments() {
  const appointments = [
    { id: 1, patient: "John Doe", date: "2025-05-05", time: "10:00 AM", type: "In-person", status: "Scheduled" },
    { id: 2, patient: "Jane Smith", date: "2025-05-06", time: "2:00 PM", type: "Video", status: "Scheduled" },
  ];

  const tbody = document.getElementById("appointments-table-body");
  tbody.innerHTML = "";

  appointments.forEach(appt => {
    const row = document.createElement("tr");
    row.id = `appointment-${appt.id}`;
    row.innerHTML = `
      <td>${appt.patient}</td>
      <td class="date">${appt.date}</td>
      <td class="time">${appt.time}</td>
      <td>${appt.type}</td>
      <td class="status">${appt.status}</td>
      <td class="action-buttons">
        <button class="update" onclick="openModal(${appt.id})">Update</button>
        <button class="video-call-button" onclick="startVideoCall('appointment')">Join Call</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- Modal Control ---
function openModal(id) {
  selectedAppointmentId = id;
  document.getElementById("action-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("action-modal").style.display = "none";
  document.getElementById("reschedule-form").style.display = "none"; // Hide reschedule form
  selectedAppointmentId = null;
}

function updateStatus(status) {
  const appointmentRow = document.querySelector(`#appointment-${selectedAppointmentId}`);
  if (appointmentRow) {
    const statusCell = appointmentRow.querySelector(".status");
    if (statusCell) {
      statusCell.textContent = status;
    }
  }
  closeModal();
}

function showRescheduleForm() {
  document.getElementById("reschedule-form").style.display = "block";
}

function rescheduleAppointment() {
  const newDate = document.getElementById("new-date").value;
  const newTime = document.getElementById("new-time").value;

  if (!newDate || !newTime) {
    alert("Please select both a new date and time.");
    return;
  }

  const appointmentRow = document.querySelector(`#appointment-${selectedAppointmentId}`);
  if (appointmentRow) {
    const dateCell = appointmentRow.querySelector(".date");
    const timeCell = appointmentRow.querySelector(".time");

    if (dateCell && timeCell) {
      dateCell.textContent = newDate;
      timeCell.textContent = newTime;
    }
  }

  alert("Appointment rescheduled successfully!");
  closeModal();
}

// Start a video call
function startVideoCall(type) {
  console.log(`Starting a video call for ${type}...`);
  // Add your video call logic here
}

// --- Load Common HTML ---
function loadCommonHTML(callback) {
  fetch('common.html')
    .then(response => response.text())
    .then(data => {
      const commonContainer = document.getElementById('common-container');
      if (commonContainer) {
        commonContainer.innerHTML = data;

        // Execute the callback after the common content is loaded
        if (callback) callback();
      }
    })
    .catch(error => console.error('Error loading common HTML:', error));
}
