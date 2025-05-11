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
  tableBody.innerHTML = '';

  appointments.forEach(appointment => {
    const row = document.createElement('tr');
    
    // Create status class based on appointment status
    let statusClass = '';
    switch(appointment.status) {
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

    row.innerHTML = `
      <td>${appointment.patient}</td>
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.type}</td>
      <td><span class="patient-status ${statusClass}">${appointment.status}</span></td>
      <td class="action-buttons">
        <button class="confirm" onclick="openModal(${appointment.id})">Confirm</button>
        <button class="reschedule" onclick="openModal(${appointment.id})">Reschedule</button>
        <button class="cancel" onclick="openModal(${appointment.id})">Cancel</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
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
function updateStatus(status) {
  if (currentAppointmentId !== null) {
    const appointmentIndex = appointments.findIndex(appt => appt.id === currentAppointmentId);
    
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
}

// Function to format time from 24-hour to 12-hour format
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Function to handle tab switching
document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  // Populate appointments table on page load
  populateAppointmentsTable();
  
  // Set consultation as active tab initially
  showTabContent('consultation');
  
  // Add event listeners to each tab button
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');
      // Remove 'active' class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Add 'active' class to clicked button
      this.classList.add('active');
      // Show the corresponding tab content
      showTabContent(targetTab);
    });
  });
});

// Function to show content based on the active tab
function showTabContent(tab) {
  const consultationList = document.querySelector('.consultation-list');
  const appointmentsTable = document.querySelector('.appointments-table');
  
  // Hide all sections first
  consultationList.style.display = 'none';
  appointmentsTable.style.display = 'none';
  
  // Show the relevant content based on tab
  if (tab === 'consultation') {
    consultationList.style.display = 'block';
  } else if (tab === 'appointments') {
    appointmentsTable.style.display = 'block';
  }
  // Other tabs can be added similarly
}

// Modal functions
function openModal(action) {
  const modal = document.getElementById('action-modal');
  const modalTitle = document.getElementById('modal-title');
  const rescheduleForm = document.getElementById('modal-reschedule-form');

  modal.style.display = 'flex';
  modalTitle.textContent = `Are you sure you want to ${action.toLowerCase()} this appointment?`;

  if (action === 'Reschedule Appointment') {
    rescheduleForm.style.display = 'block';
  } else {
    rescheduleForm.style.display = 'none';
  }
}

function closeModal() {
  document.getElementById('action-modal').style.display = 'none';
}

function updateStatus(status) {
  alert(`Appointment has been ${status.toLowerCase()}.`);
  closeModal();
}

function showRescheduleForm() {
  document.getElementById('modal-reschedule-form').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  // Load common HTML and initialize event listeners
  loadCommonHTML(() => {
    console.log('Common content loaded and initialized.');
    initializeCommonEventListeners();
  });

  // Tab functionality for Upcoming and Past Appointments
  const upcomingBtn = document.getElementById('upcoming-btn');
  const pastBtn = document.getElementById('past-btn');
  const upcomingContainer = document.getElementById('upcoming-container');
  const pastContainer = document.getElementById('past-container');

  if (upcomingBtn && pastBtn && upcomingContainer && pastContainer) {
    upcomingBtn.addEventListener('click', () => {
      upcomingContainer.style.display = 'block';
      pastContainer.style.display = 'none';
    });

    pastBtn.addEventListener('click', () => {
      upcomingContainer.style.display = 'none';
      pastContainer.style.display = 'block';
    });
  } else {
    console.error('One or more elements for tab functionality are missing.');
  }
});

// Function to handle booking
function handleBooking(event) {
  event.preventDefault(); // Prevent the form from refreshing the page

  // Get form values
  const patientName = document.getElementById('name').value.trim();
  const visitDate = document.getElementById('visit-date').value;
  const visitTime = document.getElementById('visit-time').value;
  const visitType = document.getElementById('visit-type').value;

  if (!patientName || !visitDate || !visitTime || !visitType) {
    alert('Please fill in all the required fields.');
    return;
  }

  // Add the new appointment to the global `appointments` array
  const newAppointment = {
    id: appointments.length > 0 ? appointments[appointments.length - 1].id + 1 : 1,
    patient: patientName,
    date: visitDate,
    time: visitTime,
    type: visitType,
    status: 'Pending'
  };

  appointments.push(newAppointment);

  // Update the patient's upcoming appointments
  updatePatientUpcomingAppointments();

  // Simulate updating the doctor's dashboard
  updateDoctorAppointmentsTable();

  // Close the booking popup
  closeBookVisitPopup();

  // Reset the booking form
  document.getElementById('book-visit-form').reset();

  alert('Appointment booked successfully!');
}

// Function to update patient's upcoming appointments
function updatePatientUpcomingAppointments() {
  const upcomingContainer = document.getElementById('upcoming-container');
  if (!upcomingContainer) return;

  // Clear the existing upcoming appointments
  upcomingContainer.innerHTML = '';

  // Filter appointments for the logged-in patient
  const patientName = document.getElementById('name').value.trim();
  const upcomingAppointments = appointments.filter(appt => appt.patient === patientName);

  // Add each upcoming appointment to the container
  upcomingAppointments.forEach(appt => {
    const appointmentCard = document.createElement('div');
    appointmentCard.classList.add('appointment-card');
    appointmentCard.innerHTML = `
      <h3>${appt.type}</h3>
      <p>Date: ${appt.date}</p>
      <p>Time: ${appt.time}</p>
      <p>Status: ${appt.status}</p>
    `;
    upcomingContainer.appendChild(appointmentCard);
  });
}

// Function to update doctor's appointments table
function updateDoctorAppointmentsTable() {
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) return;

  // Clear the existing table rows
  tableBody.innerHTML = '';

  // Add each appointment to the table
  appointments.forEach(appt => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${appt.patient}</td>
      <td>${appt.date}</td>
      <td>${appt.time}</td>
      <td>${appt.type}</td>
      <td>${appt.status}</td>
      <td class="action-buttons">
        <button class="confirm" onclick="updateStatus(${appt.id}, 'Confirmed')">Confirm</button>
        <button class="reschedule" onclick="updateStatus(${appt.id}, 'Rescheduled')">Reschedule</button>
        <button class="cancel" onclick="updateStatus(${appt.id}, 'Cancelled')">Cancel</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}