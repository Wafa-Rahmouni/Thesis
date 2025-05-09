// --- Load Common HTML ---
function loadCommonHTML(callback) {
  console.log('Attempting to load common HTML...');
  fetch('../../doctors/common.html') // Adjusted path
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

        // Initialize event listeners after the content is loaded
        initializeCommonEventListeners();

        // Execute the callback after the common content is loaded
        if (callback) callback();
      } else {
        console.error('common-container not found in the DOM.');
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

function confirmLogout() {
  console.log('User logged out.');
  window.location.href = '/login.html'; // Adjust the path to your login page
}

// --- Utility Functions ---
function closeAllPopups() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => {
    popup.style.display = 'none'; // Hide all popups
  });
}

// --- Book Visit Popup Functions ---
function openBookVisitPopup() {
  const popup = document.getElementById('book-visit-popup');
  if (popup) {
    popup.style.display = 'block';
  } else {
    console.error('Book Visit Popup not found in the DOM.');
  }
}

// Call the function after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadCommonHTML(() => {
    console.log('Common content loaded and initialized.');
  });
});