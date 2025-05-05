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
  