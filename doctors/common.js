// --- Load Common HTML ---
function loadCommonHTML(callback) {
  console.log('Attempting to load common HTML...');
  fetch('../../doctors/common.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const commonContainer = document.getElementById('common-container');
      if (commonContainer) {
        commonContainer.innerHTML = data;
        console.log('Common HTML loaded successfully.');
        initializeCommonEventListeners();
        if (callback) callback();
      } else {
        console.error('common-container not found in the DOM.');
      }
    })
    .catch(error => console.error('Error loading common HTML:', error));
}

// --- Initialize Event Listeners ---
function initializeCommonEventListeners() {
  addClickListener('profile-link', e => {
    e.preventDefault();
    openProfileModal();
  });
  addClickListener('edit-btn', enableProfileEditing);
  addClickListener('cancel-btn', cancelProfileEditing);
  addClickListener('save-btn', saveProfileChanges);

  addClickListener('language-popup .close-btn', closeLanguagePopup);
  addClickListener('notifications-popup .close-btn', closeNotificationsPopup);
  addClickListener('logout-popup .close-btn', closeLogoutPopup);
  addClickListener('logout-popup .confirm', confirmLogout);

  addClickListenerByTitle('Language', openLanguagePopup);
  addClickListenerByTitle('Notifications', openNotificationsPopup);
  addClickListenerByTitle('Logout', openLogoutPopup);

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('Profile updated!');
      toggleForm(false);
      toggleFileInput(false);
    });
  }
}

function addClickListener(idOrSelector, handler) {
  const element = document.getElementById(idOrSelector) || document.querySelector(`#${idOrSelector}`);
  if (element) element.addEventListener('click', handler);
}

function addClickListenerByTitle(title, handler) {
  const element = document.querySelector(`[title="${title}"]`);
  if (element) element.addEventListener('click', handler);
}

// --- Profile Modal ---
function openProfileModal() {
  closeAllPopups();
  showPopup('profile-modal');
}

function closeProfileModal() {
  hidePopup('profile-modal');
  toggleForm(false);
}

function enableProfileEditing() {
  toggleForm(true);
  toggleFileInput(true);
}

function cancelProfileEditing() {
  toggleForm(false);
  toggleFileInput(false);
}

function saveProfileChanges() {
  alert('Profile saved!');
  toggleForm(false);
  toggleFileInput(false);
}

function toggleForm(editable) {
  const form = document.getElementById('profile-form');
  if (!form) return;
  form.querySelectorAll('input, select').forEach(input => input.disabled = !editable);
  document.getElementById('edit-btn').style.display = editable ? 'none' : 'inline-block';
  document.getElementById('save-btn').style.display = editable ? 'inline-block' : 'none';
  document.getElementById('cancel-btn').style.display = editable ? 'inline-block' : 'none';
}

function toggleFileInput(show) {
  const inputContainer = document.getElementById('file-input-container');
  if (inputContainer) inputContainer.style.display = show ? 'block' : 'none';
}

// --- Popup Handling ---
function showPopup(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function hidePopup(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function closeAllPopups() {
  document.querySelectorAll('.popup').forEach(popup => popup.style.display = 'none');
}

function openLanguagePopup() {
  closeAllPopups();
  showPopup('language-popup');
}

function closeLanguagePopup() {
  hidePopup('language-popup');
}

function openNotificationsPopup() {
  closeAllPopups();
  showPopup('notifications-popup');
}

function closeNotificationsPopup() {
  hidePopup('notifications-popup');
}

function openLogoutPopup() {
  closeAllPopups();
  showPopup('logout-popup');
}

function closeLogoutPopup() {
  hidePopup('logout-popup');
}

function confirmLogout() {
  console.log('User logged out.');
  window.location.href = '/home.html';
}

// --- Book Visit ---
function searchClinics() {
  const searchInput = document.getElementById("clinic-search").value.trim();
  const mapIframe = document.getElementById("google-map");

  if (searchInput) {
    const query = encodeURIComponent(searchInput);
    mapIframe.src = `https://maps.google.com/maps?q=${query}&output=embed`;
    console.log(`Searching for: ${searchInput}`);
  } else {
    alert("Please enter a location to search.");
  }
}

function openFindClinicPopup() {
  const popup = document.getElementById("find-clinic-popup");
  if (popup) {
    popup.style.display = "flex"; // Show the popup
    console.log("Find Clinic Popup opened.");
  } else {
    console.error("Find Clinic Popup not found.");
  }
}

function closeFindClinicPopup() {
  const popup = document.getElementById("find-clinic-popup");
  if (popup) {
    popup.style.display = "none"; // Hide the popup
    console.log("Find Clinic Popup closed.");
  } else {
    console.error("Find Clinic Popup not found.");
  }
}

// --- Book Visit Popup Functions ---
function openBookVisitPopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('book-visit-popup');
  if (popup) {
    popup.style.display = 'block';
  }
}

// Function to close the booking popup
function closeBookVisitPopup() {
  const popup = document.getElementById('book-visit-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// --- Booking Form Handling ---
function handleBooking(event) {
  event.preventDefault();

  const patientName = document.getElementById('name').value.trim();
  const visitDate = document.getElementById('visit-date').value;
  const visitTime = document.getElementById('visit-time').value;
  const visitType = document.getElementById('visit-type').value;
  const clinic = document.getElementById('clinic').value;
  const visitReason = document.getElementById('visit-reason').value;

  if (!patientName || !visitDate || !visitTime || !visitType || !clinic || !visitReason) {
    alert('Please fill in all the required fields.');
    return;
  }

  const newAppointment = {
    id: Date.now(),
    patient: patientName,
    date: visitDate,
    time: visitTime,
    type: visitType,
    clinic: clinic,
    reason: visitReason,
    status: 'Upcoming',
  };

  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
  appointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Trigger table updates
  populateUpcomingAppointmentsTable();

  document.getElementById('book-visit-form').reset();
}

// --- Add New Appointment ---
function addNewAppointment(patient, date, time, type, status = 'Pending') {
  // Generate a new unique ID for the appointment
  const newId = appointments.length > 0 ? appointments[appointments.length - 1].id + 1 : 1;

  // Create a new appointment object
  const newAppointment = {
    id: newId,
    patient: patient,
    date: date,
    time: time,
    type: type,
    status: status
  };

  // Add the new appointment to the `appointments` array
  appointments.push(newAppointment);

  // Refresh the appointments table
  populateAppointmentsTable();
}

// --- Populate Appointments Table ---
function populateAppointmentsTable() {
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) return; // Ensure the table body exists

  tableBody.innerHTML = ''; // Clear existing rows

  appointments.forEach(appointment => {
    const row = document.createElement('tr');

    // Add row content
    row.innerHTML = `
      <td>${appointment.patient}</td>
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.type}</td>
      <td>${appointment.status}</td>
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

// --- Populate Upcoming Appointments Table ---
function populateUpcomingAppointmentsTable() {
  const tableBody = document.getElementById('upcoming-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
  const patientName = document.getElementById('name')?.value || 'John Doe';

  const upcomingAppointments = appointments.filter(
    appt => appt.patient === patientName && appt.status === 'Upcoming'
  );

  upcomingAppointments.forEach(appointment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.type}</td>
      <td>${appointment.clinic}</td>
      <td>${appointment.reason}</td>
      <td>${appointment.status}</td>
    `;
    tableBody.appendChild(row);
  });
}

// --- Populate Doctor Appointments Table ---
function populateDoctorAppointmentsTable() {
  const tableBody = document.getElementById('doctor-appointments-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

  appointments.forEach(appointment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${appointment.patient}</td>
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.type}</td>
      <td>${appointment.clinic}</td>
      <td>${appointment.reason}</td>
      <td>${appointment.status}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Profile modal functionality
const profileLink = document.getElementById('profile-link');
if (profileLink) {
  profileLink.addEventListener('click', function (e) {
    e.preventDefault();
    openProfileModal();
  });
}

const closeProfileButton = document.querySelector('#profile-modal .close');
if (closeProfileButton) {
  closeProfileButton.addEventListener('click', closeProfileModal);
}

// Enable form editing
const editButton = document.getElementById('edit-btn');
if (editButton) {
  editButton.addEventListener('click', function () {
    toggleForm(true);
    document.getElementById('file-input-container').style.display = 'block'; // Show file input for profile picture
  });
}

// Cancel editing
const cancelButton = document.getElementById('cancel-btn');
if (cancelButton) {
  cancelButton.addEventListener('click', function () {
    toggleForm(false);
    document.getElementById('file-input-container').style.display = 'none'; // Hide file input
  });
}

// Save changes
const profileForm = document.getElementById('profile-form');
if (profileForm) {
  profileForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Profile updated!');
    toggleForm(false);
    document.getElementById('file-input-container').style.display = 'none'; // Hide file input after saving
  });
}

// --- Video Call ---
function setupVideoCallButtons() {
  document.querySelectorAll('.video-call-button').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-type');
      startVideoCall(type);
    });
  });
}

function startVideoCall(type) {
  console.log(`Starting a video call for ${type}...`);
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      const videoElement = document.getElementById('local-video');
      if (videoElement) {
        videoElement.srcObject = stream;
        openVideoCallPopup();
      }
      window.localStream = stream;
    })
    .catch(err => {
      console.error('Media error:', err);
      alert('Please allow camera and microphone access.');
    });
}

function openVideoCallPopup() {
  showPopup('video-call-popup');
}

function closeVideoCallPopup() {
  hidePopup('video-call-popup');
  if (window.localStream) {
    window.localStream.getTracks().forEach(track => track.stop());
    window.localStream = null;
  }
}

function endVideoCall() {
  closeVideoCallPopup();
  alert('Video call ended.');
}

function toggleMute() {
  const stream = window.localStream;
  if (stream) {
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    alert(audioTrack.enabled ? 'Microphone Unmuted' : 'Microphone Muted');
  }
}

function toggleCamera() {
  const stream = window.localStream;
  if (stream) {
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    alert(videoTrack.enabled ? 'Camera On' : 'Camera Off');
  }
}

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  loadCommonHTML(() => {
    setupVideoCallButtons();
    console.log('Common content loaded and initialized.');
  });
  function navigateToMessages() {
    // Example: Fetch the user's role from a global variable, localStorage, or an API
    const userRole = localStorage.getItem('profileRole'); // Replace with actual role-fetching logic

    if (userRole === 'doctor') {
      window.location.href = '../../doctors/messages.html'; // Redirect to the doctor's messages page
    } else if (userRole === 'patient') {
      window.location.href = '../../patients/messages.html'; // Redirect to the patient's messages page
    } else {
      alert('Unable to determine your role. Please contact support.');
    }
  }
  populateDoctorAppointmentsTable();
  populateUpcomingAppointmentsTable();
});

// Global appointments array
const appointments = [];
let nextAppointmentId = 1; // Unique ID for each appointment

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

// Listen for changes in localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'appointments') {
    // Refresh both tables when appointments are updated
    populateDoctorAppointmentsTable();
    populateUpcomingAppointmentsTable();
  }
});
