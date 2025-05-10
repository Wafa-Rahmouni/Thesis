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
function openBookVisitPopup() {
  showPopup('book-visit-popup');
}

// --- Find Clinic Map ---
function searchClinics() {
  const searchInput = document.getElementById('clinic-search').value.trim();
  const mapIframe = document.getElementById('google-map');

  if (searchInput) {
    // Update the iframe's src attribute with the new search query
    const query = encodeURIComponent(searchInput);
    mapIframe.src = `https://maps.google.com/maps?q=${query}&layer=c&output=embed`;
    console.log(`Searching for: ${searchInput}`);
  } else {
    alert('Please enter a location to search.');
  }
}

function openFindClinicPopup() {
  const popup = document.getElementById('find-clinic-popup');
  if (popup) {
    popup.style.display = 'flex'; // Show the popup
    console.log('Find Clinic Popup opened.');
  } else {
    console.error('Find Clinic Popup not found.');
  }
}

function closeFindClinicPopup() {
  const popup = document.getElementById('find-clinic-popup');
  if (popup) {
    popup.style.display = 'none'; // Hide the popup
    console.log('Find Clinic Popup closed.');
  } else {
    console.error('Find Clinic Popup not found.');
  }
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
});
