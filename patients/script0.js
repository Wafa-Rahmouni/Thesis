const tabButtons = document.querySelectorAll(".tab-button");

// Map tab keys to full paths (from project root)
const tabRoutes = {
  "appointments": "/patients/appointments/appointment.html",
  "consultation": "/patients/consultation.html",
  "history": "/patients/history.html",
  "clinics": "/patients/clinics.html",
  "plans": "/patients/plans.html",
  "emergency": "/patients/emergency.html",
  "reminders": "/patients/reminders.html"
};

// Handle tab click navigation
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.getAttribute("data-tab");
    if (tabRoutes[tab]) {
      location.href = tabRoutes[tab];
    }
  });
});

// Highlight active tab on page load
const currentPage = window.location.pathname.toLowerCase();
tabButtons.forEach(button => {
  const tab = button.getAttribute("data-tab");
  const route = tabRoutes[tab];
  if (route && currentPage.endsWith(route.toLowerCase())) {
    button.classList.add("active");
  } else {
    button.classList.remove("active");
  }
});

// Load common HTML
function loadCommonHTML(callback) {
  fetch('/doctors/common.html') // Adjust the path to `common.html` as needed
    .then(response => response.text())
    .then(data => {
      const commonContainer = document.getElementById('common-container');
      if (commonContainer) {
        commonContainer.innerHTML = data;

        // Reinitialize event listeners for dynamically loaded content
        initializeCommonEventListeners();

        // Execute the callback after the common content is loaded
        if (callback) callback();
      }
    })
    .catch(error => console.error('Error loading common HTML:', error));
}

// Initialize event listeners for common content
function initializeCommonEventListeners() {
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

  const markAsReadButton = document.getElementById('mark-as-read-btn');
  if (markAsReadButton) {
    markAsReadButton.addEventListener('click', markAllNotificationsAsRead);
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

  // Profile modal functionality
  const profileLink = document.getElementById('profile-link');
  if (profileLink) {
    profileLink.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('profile-modal').style.display = 'flex';
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
}

// Language popup functions
function openLanguagePopup() {
  const popup = document.getElementById('language-popup');
  if (popup) {
    popup.style.display = 'block'; // Show the popup
  } else {
    console.error('Language popup element not found.');
  }
}

function closeLanguagePopup() {
  const popup = document.getElementById('language-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
  } else {
    console.error('Language popup element not found.');
  }
}

// Notifications popup functions
function openNotificationsPopup() {
  const popup = document.getElementById('notifications-popup');
  if (popup) {
    popup.style.display = 'block'; // Show the popup
  } else {
    console.error('Notifications popup element not found.');
  }
}

function closeNotificationsPopup() {
  const popup = document.getElementById('notifications-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
  } else {
    console.error('Notifications popup element not found.');
  }
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
  const notifications = document.querySelectorAll('.notification.new');
  notifications.forEach(notification => {
    notification.classList.remove('new'); // Remove the "new" class
  });
  console.log('All notifications marked as read.');
}

// Logout confirmation popup functions
function openLogoutPopup() {
  const popup = document.getElementById('logout-popup');
  if (popup) {
    popup.style.display = 'block'; // Show the popup
  } else {
    console.error('Logout popup element not found.');
  }
}

function closeLogoutPopup() {
  const popup = document.getElementById('logout-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
  } else {
    console.error('Logout popup element not found.');
  }
}

function confirmLogout() {
  console.log('User logged out.');
  // Redirect to the login page or perform logout logic
  window.location.href = '/login.html'; // Adjust the path to your login page
}

// Profile modal functions
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

// Switch language function (optional)
function switchLanguage(lang) {
  console.log(`Language switched to: ${lang}`);
  closeLanguagePopup();
}

// Utility function to close all popups
function closeAllPopups() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => {
    popup.style.display = 'none'; // Hide all popups
  });
}

// Open Language Popup
function openLanguagePopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('language-popup');
  if (popup) {
    popup.style.display = 'block'; // Show the language popup
  } else {
    console.error('Language popup element not found.');
  }
}

// Close Language Popup
function closeLanguagePopup() {
  const popup = document.getElementById('language-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
  } else {
    console.error('Language popup element not found.');
  }
}

// Open Notifications Popup
function openNotificationsPopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('notifications-popup');
  if (popup) {
    popup.style.display = 'block'; // Show the notifications popup
  } else {
    console.error('Notifications popup element not found.');
  }
}

// Close Notifications Popup
function closeNotificationsPopup() {
  const popup = document.getElementById('notifications-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
  } else {
    console.error('Notifications popup element not found.');
  }
}

// Open Logout Confirmation Popup
function openLogoutPopup() {
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('logout-popup');
  if (popup) {
    popup.style.display = 'block'; // Show the logout popup
  } else {
    console.error('Logout popup element not found.');
  }
}

// Close Logout Confirmation Popup
function closeLogoutPopup() {
  const popup = document.getElementById('logout-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
  } else {
    console.error('Logout popup element not found.');
  }
}

// Confirm Logout
function confirmLogout() {
  console.log('User logged out.');
  // Redirect to the login page or perform logout logic
  window.location.href = '/home.html'; // Adjust the path to your login page
}

// Initialize event listeners for common content
function initializeCommonEventListeners() {
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

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadCommonHTML(() => {
    console.log('Common content loaded and initialized.');
  });
});