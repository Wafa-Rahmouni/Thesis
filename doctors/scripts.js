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

// --- Initialize Event Listeners for Common Content ---
function initializeCommonEventListeners() {
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

  // Language popup functionality
  const languageButton = document.querySelector('[title="Language"]');
  if (languageButton) {
    languageButton.addEventListener('click', openLanguagePopup);
  }

  const closeLanguageButton = document.querySelector('#language-popup .close-btn');
  if (closeLanguageButton) {
    closeLanguageButton.addEventListener('click', closeLanguagePopup);
  }

  // Notifications popup functionality
  const notificationsButton = document.querySelector('[title="Notifications"]');
  if (notificationsButton) {
    notificationsButton.addEventListener('click', openNotificationsPopup);
  }

  const closeNotificationsButton = document.querySelector('#notifications-popup .close-btn');
  if (closeNotificationsButton) {
    closeNotificationsButton.addEventListener('click', closeNotificationsPopup);
  }

  // Logout confirmation popup functionality
  const logoutButton = document.querySelector('[title="Logout"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', openLogoutPopup);
  }

  const closeLogoutButton = document.querySelector('#logout-popup .close-btn');
  if (closeLogoutButton) {
    closeLogoutButton.addEventListener('click', closeLogoutPopup);
  }

  const confirmLogoutButton = document.querySelector('#logout-popup .confirm');
  if (confirmLogoutButton) {
    confirmLogoutButton.addEventListener('click', confirmLogout);
  }
}

// --- Utility Functions ---
function closeAllPopups() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => {
    popup.style.display = 'none'; // Hide all popups
  });
}

// --- Profile Modal Functions ---
function openProfileModal() {
  closeAllPopups(); // Close other popups
  const profileModal = document.getElementById('profile-modal');
  if (profileModal) {
    profileModal.style.display = 'flex';
  }
}

function closeProfileModal() {
  const profileModal = document.getElementById('profile-modal');
  if (profileModal) {
    profileModal.style.display = 'none';
    toggleForm(false); // Reset form if closed during editing
  }
}

function toggleForm(editable) {
  const form = document.getElementById('profile-form');
  const fields = form.querySelectorAll('input, select');
  fields.forEach(input => (input.disabled = !editable));

  document.getElementById('edit-btn').style.display = editable ? 'none' : 'inline-block';
  document.getElementById('save-btn').style.display = editable ? 'inline-block' : 'none';
  document.getElementById('cancel-btn').style.display = editable ? 'inline-block' : 'none';
}

// --- Language Popup Functions ---
function openLanguagePopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('language-popup');
  if (popup) {
    popup.style.display = 'block';
  }
}

function closeLanguagePopup() {
  const popup = document.getElementById('language-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// --- Language Translation Function ---
function translatePage(language) {
  const currentUrl = window.location.href; // Get the current page URL
  const translateUrl = `https://translate.google.com/translate?hl=${language}&sl=auto&tl=${language}&u=${encodeURIComponent(currentUrl)}`;
  window.location.href = translateUrl; // Redirect to the Google Translate URL
}

// --- Initialize Event Listeners for Language Buttons ---
function initializeLanguageButtons() {
  const englishButton = document.querySelector('.popup-button[onclick="translatePage(\'en\')"]');
  const arabicButton = document.querySelector('.popup-button[onclick="translatePage(\'ar\')"]');
  const frenchButton = document.querySelector('.popup-button[onclick="translatePage(\'fr\')"]');

  if (englishButton) {
    englishButton.addEventListener('click', () => translatePage('en'));
  }
  if (arabicButton) {
    arabicButton.addEventListener('click', () => translatePage('ar'));
  }
  if (frenchButton) {
    frenchButton.addEventListener('click', () => translatePage('fr'));
  }
}

// --- Notifications Popup Functions ---
function openNotificationsPopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('notifications-popup');
  if (popup) {
    popup.style.display = 'block';
  }
}

function closeNotificationsPopup() {
  const popup = document.getElementById('notifications-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// --- Logout Confirmation Popup Functions ---
function openLogoutPopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('logout-popup');
  if (popup) {
    popup.style.display = 'block';
  }
}

function closeLogoutPopup() {
  const popup = document.getElementById('logout-popup');
  if (popup) {
    popup.style.display = 'none';
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

function closeBookVisitPopup() {
  const popup = document.getElementById('book-visit-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// --- Login and Role Management Functions ---
// Store the user's role during login
function login(userRole) {
  localStorage.setItem("userRole", userRole); // Save the role ("doctor" or "patient")
  window.location.href = "dashboard.html"; // Redirect to the dashboard after login
}

// Redirect to the appropriate Messages page based on the stored role
function redirectToMessages() {
  const userRole = localStorage.getItem("userRole"); // Retrieve the stored role
  if (userRole === "doctor") {
    window.location.href = "/messages.html"; // Redirect to Doctors Messages page
  } else if (userRole === "patient") {
    window.location.href = "patients/messages.html"; // Redirect to Patients Messages page
  } else {
    alert("Please log in to access messages.");
    window.location.href = "home.html"; // Redirect to login page if no role is found
  }
}

// --- Booking Form Handling ---
function handleBookingForm(event) {
  event.preventDefault(); // Prevent form submission

  // Get form values
  const patientName = document.getElementById("patient-name").value;
  const appointmentDate = document.getElementById("appointment-date").value;
  const appointmentTime = document.getElementById("appointment-time").value;
  const appointmentType = document.getElementById("appointment-type").value;
  const appointmentStatus = document.getElementById("appointment-status").value;

  // Call the addBooking function from common.js
  addBooking(patientName, appointmentDate, appointmentTime, appointmentType, appointmentStatus);

  // Clear the form
  document.getElementById("booking-form").reset();
}
