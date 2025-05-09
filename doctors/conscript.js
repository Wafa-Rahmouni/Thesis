// Sample appointment data
const appointments = [
  {
    id: 1,
    patient: 'John Smith',
    date: '2025-05-05',
    time: '09:00 AM',
    type: 'General Checkup',
    status: 'Pending'
  },
  {
    id: 2,
    patient: 'Emma Johnson',
    date: '2025-05-05',
    time: '10:30 AM',
    type: 'Follow-up',
    status: 'Confirmed'
  },
  {
    id: 3,
    patient: 'Michael Brown',
    date: '2025-05-06',
    time: '02:15 PM',
    type: 'Consultation',
    status: 'Pending'
  },
  {
    id: 4,
    patient: 'Sophia Williams',
    date: '2025-05-06',
    time: '03:45 PM',
    type: 'Vaccination',
    status: 'Confirmed'
  },
  {
    id: 5,
    patient: 'James Wilson',
    date: '2025-05-07',
    time: '11:00 AM',
    type: 'Lab Results',
    status: 'Pending'
  }
];

// Function to populate the appointments table
function populateAppointmentsTable() {
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) return; // Ensure the table body exists

  tableBody.innerHTML = ''; // Clear existing rows

  appointments.forEach(appointment => {
    const row = document.createElement('tr');

    // Create status class based on appointment status
    let statusClass = '';
    switch (appointment.status) {
      case 'Pending':
        statusClass = 'status-pending';
        break;
      case 'Confirmed':
        statusClass = 'status-confirmed';
        break;
      case 'Cancelled':
        statusClass = 'status-cancelled';
        break;
      case 'Rescheduled':
        statusClass = 'status-rescheduled';
        break;
      default:
        statusClass = '';
    }

    // Add row content
    row.innerHTML = `
      <td>${appointment.patient}</td>
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.type}</td>
      <td><span class="patient-status ${statusClass}">${appointment.status}</span></td>
      <td class="action-buttons">
        <button class="confirm" onclick="updateStatus(${appointment.id}, 'Confirmed')">Confirm</button>
        <button class="reschedule" onclick="updateStatus(${appointment.id}, 'Rescheduled')">Reschedule</button>
        <button class="cancel" onclick="updateStatus(${appointment.id}, 'Cancelled')">Cancel</button>
      </td>
    `;

    // Append the row to the table body
    tableBody.appendChild(row);
  });
}

// Function to handle booking form submission
function handleBooking(event) {
  event.preventDefault(); // Prevent the form from refreshing the page

  // Check if the patient's name is available
  const nameField = document.getElementById('name');
  if (!nameField || !nameField.value) {
    alert('Please log in to book an appointment.');
    return;
  }

  // Get the patient's name from the profile
  const patientName = nameField.value;

  // Get other form values
  const date = document.getElementById('visit-date').value;
  const time = document.getElementById('visit-time').value;
  const type = document.getElementById('visit-type').value;
  const reason = document.getElementById('visit-reason').value;

  // Add the new appointment
  addNewAppointment(patientName, date, time, type, 'Pending', reason);

  // Close the booking popup
  closeBookVisitPopup();

  // Reset the form
  document.getElementById('book-visit-form').reset();
}

// Function to add a new appointment
function addNewAppointment(patient, date, time, type, status = 'Pending', reason = '') {
  // Generate a new unique ID for the appointment
  const newId = appointments.length > 0 ? appointments[appointments.length - 1].id + 1 : 1;

  // Create a new appointment object
  const newAppointment = {
    id: newId,
    patient: patient,
    date: date,
    time: time,
    type: type,
    status: status,
    reason: reason
  };

  // Add the new appointment to the appointments array
  appointments.push(newAppointment);

  // Refresh the table to include the new appointment
  populateAppointmentsTable();
}

// Function to open the action modal
let currentAppointmentId = null;
function openModal(appointmentId) {
  currentAppointmentId = appointmentId;
  document.getElementById('action-modal').style.display = 'flex';
  document.getElementById('modal-reschedule-form').style.display = 'none';
  document.getElementById('modal-title').textContent = 'Are you sure you want to update this appointment?';
  document.getElementById('confirm-button').style.display = 'inline-block';
  document.getElementById('reschedule-button').style.display = 'inline-block';
  document.getElementById('cancel-button').style.display = 'inline-block';
}

// Function to close the modal
function closeModal() {
  document.getElementById('action-modal').style.display = 'none';
}

// Function to show reschedule form
function showRescheduleForm() {
  document.getElementById('modal-title').textContent = 'Reschedule Appointment';
  document.getElementById('modal-reschedule-form').style.display = 'block';
  document.getElementById('confirm-button').textContent = 'Confirm Reschedule';
  document.getElementById('reschedule-button').style.display = 'none';
  document.getElementById('cancel-button').style.display = 'none';
}

// Function to update appointment status
function updateStatus(appointmentId, status) {
  const appointmentIndex = appointments.findIndex(appt => appt.id === appointmentId);

  if (appointmentIndex !== -1) {
    appointments[appointmentIndex].status = status;

    if (status === 'Rescheduled') {
      const newDate = document.getElementById('reschedule-date').value;
      const newTime = document.getElementById('reschedule-time').value;

      if (newDate) {
        appointments[appointmentIndex].date = newDate;
      }

      if (newTime) {
        appointments[appointmentIndex].time = formatTime(newTime);
      }
    }

    populateAppointmentsTable();
    closeModal();
  }
}

// Function to format time from 24-hour to 12-hour format
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Function to confirm logout
function confirmLogout() {
  const logoutConfirmed = confirm("Are you sure you want to log out?");
  if (logoutConfirmed) {
    // Redirect to the login page or perform logout logic
    window.location.href = "home.html";
  }
}

// Populate the appointments table on page load
document.addEventListener('DOMContentLoaded', function () {
  populateAppointmentsTable(); // Populate the table on page load
});