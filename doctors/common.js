// --- Remove Supabase Initialization ---
// (Supabase is now initialized globally in supabaseClient.js, do not re-initialize here)

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
    profileForm.addEventListener('submit', saveProfileChanges);
  }

  // Attach the profile picture upload handler
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleProfilePicUpload);
  }
}

// Utility to add click listeners by ID or selector
function addClickListener(idOrSelector, handler) {
  const element = document.getElementById(idOrSelector) || document.querySelector(`#${idOrSelector}`);
  if (element) element.addEventListener('click', handler);
}

// Utility to add click listeners by [title] attribute
function addClickListenerByTitle(title, handler) {
  const element = document.querySelector(`[title="${title}"]`);
  if (element) element.addEventListener('click', handler);
}

// --- Profile Modal ---

// Open the profile modal and load user data from Supabase
async function openProfileModal() {
  closeAllPopups();
  showPopup('profile-modal');
  await loadProfileData();
}

// Close the profile modal
function closeProfileModal() {
  hidePopup('profile-modal');
}

// Expose modal functions globally for inline HTML onclick handlers (safe)
if (typeof openProfileModal === "function") window.openProfileModal = openProfileModal;
if (typeof closeProfileModal === "function") window.closeProfileModal = closeProfileModal;

// Expose other popup/modal functions if needed
if (typeof openLanguagePopup === "function") window.openLanguagePopup = openLanguagePopup;
if (typeof closeLanguagePopup === "function") window.closeLanguagePopup = closeLanguagePopup;
if (typeof openNotificationsPopup === "function") window.openNotificationsPopup = openNotificationsPopup;
if (typeof closeNotificationsPopup === "function") window.closeNotificationsPopup = closeNotificationsPopup;
if (typeof openLogoutPopup === "function") window.openLogoutPopup = openLogoutPopup;
if (typeof closeLogoutPopup === "function") window.closeLogoutPopup = closeLogoutPopup;
if (typeof confirmLogout === "function") window.confirmLogout = confirmLogout;
if (typeof openBookVisitPopup === "function") window.openBookVisitPopup = openBookVisitPopup;
if (typeof closeBookVisitPopup === "function") window.closeBookVisitPopup = closeBookVisitPopup;
if (typeof openFindClinicPopup === "function") window.openFindClinicPopup = openFindClinicPopup;
if (typeof closeFindClinicPopup === "function") window.closeFindClinicPopup = closeFindClinicPopup;

// Load profile data from Supabase and fill the form
async function loadProfileData() {
  if (!window.supabase) return;
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) return;

  const { data: profile, error } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return;

  document.getElementById('first_name').value = profile.first_name || '';
  document.getElementById('last_name').value = profile.last_name || '';
  document.getElementById('address').value = profile.address || '';
  document.getElementById('gender').value = profile.gender || '';
  document.getElementById('dob').value = profile.dob || '';
  document.getElementById('phone').value = profile.phone || '';
  document.getElementById('email').value = profile.email || '';
  if (profile.profile_picture_url) {
    document.getElementById('profile-img').src = profile.profile_picture_url;
  }
  toggleForm(false);
  toggleFileInput(false);
}

// Enable editing
function enableProfileEditing() {
  toggleForm(true);
  toggleFileInput(true);
}

// Cancel editing and reload data
async function cancelProfileEditing() {
  await loadProfileData();
  toggleForm(false);
  toggleFileInput(false);
}

// Save changes to Supabase
async function saveProfileChanges(e) {
  if (e) e.preventDefault();
  if (!window.supabase) return;

  // Get the current user
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) return;

  // Get values directly from the separate fields
  const updateData = {
    first_name: document.getElementById('first_name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),
    address: document.getElementById('address').value,
    gender: document.getElementById('gender').value,
    dob: document.getElementById('dob').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value
  };

  // Optional: handle profile picture upload here if needed

  // Update in Supabase
  const { error } = await window.supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    alert('Failed to save profile: ' + error.message);
    return;
  }

  alert('Profile updated!');
  await loadProfileData();
  toggleForm(false);
  toggleFileInput(false);
}

// Add this function to handle profile picture upload and update
async function handleProfilePicUpload(event) {
  const file = event.target.files[0];
  if (!file || !window.supabase) return;

  // Get current user
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) return;

  // Use a unique filename (e.g., user id + timestamp)
  const fileExt = file.name.split('.').pop();
  const filePath = `profile-pictures/${user.id}_${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage (bucket: 'avatars')
  let { error: uploadError } = await window.supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    alert('Failed to upload image: ' + uploadError.message);
    return;
  }

  // Get the public URL
  const { data: { publicUrl } } = window.supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update the profile in Supabase
  const { error: updateError } = await window.supabase
    .from('profiles')
    .update({ profile_picture_url: publicUrl })
    .eq('id', user.id);

  if (updateError) {
    alert('Failed to update profile picture: ' + updateError.message);
    return;
  }

  // Update the image in the modal immediately
  document.getElementById('profile-img').src = publicUrl;
}

// --- Image Preview for Profile Picture ---
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('profile-img').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Helpers for enabling/disabling form fields and file input
function toggleForm(editable) {
  const form = document.getElementById('profile-form');
  if (!form) return;
  const fields = form.querySelectorAll('input, select');
  fields.forEach(input => (input.disabled = !editable));
  document.getElementById('edit-btn').style.display = editable ? 'none' : 'inline-block';
  document.getElementById('save-btn').style.display = editable ? 'inline-block' : 'none';
  document.getElementById('cancel-btn').style.display = editable ? 'inline-block' : 'none';
}
function toggleFileInput(show) {
  const fileInputContainer = document.getElementById('file-input-container');
  if (fileInputContainer) fileInputContainer.style.display = show ? 'block' : 'none';
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

// Language, Notifications, Logout popups
function openLanguagePopup() { closeAllPopups(); showPopup('language-popup'); }
function closeLanguagePopup() { hidePopup('language-popup'); }
function openNotificationsPopup() { closeAllPopups(); showPopup('notifications-popup'); }
function closeNotificationsPopup() { hidePopup('notifications-popup'); }
function openLogoutPopup() { closeAllPopups(); showPopup('logout-popup'); }
function closeLogoutPopup() { hidePopup('logout-popup'); }
async function confirmLogout() {
  if (window.supabase && window.supabase.auth) {
    await window.supabase.auth.signOut();
  }
  window.location.href = "/home.html";
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
  logHistory('find_clinic', { query: document.getElementById("clinic-search").value.trim() });
}
function openFindClinicPopup() {
  const popup = document.getElementById("find-clinic-popup");
  if (popup) {
    popup.style.display = "flex";
    console.log("Find Clinic Popup opened.");
  } else {
    console.error("Find Clinic Popup not found.");
  }
}
function closeFindClinicPopup() {
  const popup = document.getElementById("find-clinic-popup");
  if (popup) {
    popup.style.display = "none";
    console.log("Find Clinic Popup closed.");
  } else {
    console.error("Find Clinic Popup not found.");
  }
}

// --- Book Visit Popup Functions ---
function openBookVisitPopup() {
  closeAllPopups();
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

// --- Booking Form Handling ---
async function handleBooking(event) {
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
    patient: patientName,
    date: visitDate,
    time: visitTime,
    type: visitType,
    clinic: clinic,
    reason: visitReason,
    status: 'Upcoming',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await window.supabase
      .from('appointments')
      .insert([newAppointment])
      .select();

    if (error) throw error;
    const newAppointmentId = data && data[0] && data[0].id;
    logHistory('booking', { appointment_id: newAppointmentId });
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
  closeBookVisitPopup();
}

// --- Add New Appointment ---
async function addNewAppointment(patient, date, time, type, status = 'Pending') {
  try {
    const newAppointment = {
      patient: patient,
      date: date,
      time: time,
      type: type,
      status: status,
      created_at: new Date().toISOString()
    };
    const { data, error } = await window.supabase
      .from('appointments')
      .insert([newAppointment]);
    if (error) throw error;
    console.log('New appointment added:', data);
    await populateAppointmentsTable();
  } catch (error) {
    console.error('Error adding appointment:', error);
    alert('Failed to add appointment. Please try again.');
  }
}

// --- Populate Appointments Table ---
async function populateUpcomingAppointmentsTable() {
  const upcomingTableBody = document.getElementById('upcoming-table-body');
  if (!upcomingTableBody) return;
  upcomingTableBody.innerHTML = '';

  const pastTableBody = document.getElementById('past-table-body');
  if (pastTableBody) pastTableBody.innerHTML = '';

  let patientName = '';
  if (window.supabase.auth && window.supabase.auth.getUser) {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      patientName = user.user_metadata?.full_name || user.email;
    }
  }
  if (!patientName) {
    patientName = document.getElementById('name')?.value || 'John Doe';
  }

  const { data: allAppointments, error } = await window.supabase
    .from('appointments')
    .select('*')
    .eq('patient', patientName)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching patient appointments:', error);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let hasUpcoming = false;
  let hasPast = false;

  allAppointments.forEach(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td>${appointment.type}</td>
      <td>${appointment.clinic}</td>
      <td>${appointment.reason}</td>
      <td>${appointment.status}</td>
    `;

    if (appointmentDate >= today && appointment.status.toLowerCase() === 'upcoming') {
      upcomingTableBody.appendChild(row);
      hasUpcoming = true;
    } else {
      if (pastTableBody) {
        pastTableBody.appendChild(row);
        hasPast = true;
      }
    }
  });

  if (!hasUpcoming) {
    upcomingTableBody.innerHTML = '<tr><td colspan="6">No upcoming appointments found.</td></tr>';
  }
  if (pastTableBody && !hasPast) {
    pastTableBody.innerHTML = '<tr><td colspan="6">No past appointments found.</td></tr>';
  }
}

// --- Update Appointment Status ---
async function updateStatus(appointmentId, newStatus) {
  try {
    const { data, error } = await window.supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) throw error;

    console.log(`Appointment ${appointmentId} updated to ${newStatus}`);
    await populateAppointmentsTable();
    await populateUpcomingAppointmentsTable();
    alert(`Appointment ${newStatus}`);
  } catch (error) {
    console.error('Error updating appointment:', error);
    alert('Failed to update appointment status. Please try again.');
  }
}

// --- Populate Doctor Appointments Table ---
async function populateDoctorAppointmentsTable() {
  const tableBody = document.getElementById('doctor-appointments-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';
  const { data: appointments, error } = await window.supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true });
  if (error) return;
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
  logHistory('video_call', { type });
}
function openVideoCallPopup() { showPopup('video-call-popup'); }
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
document.addEventListener('DOMContentLoaded', async () => {
  loadCommonHTML(async () => {
    setupVideoCallButtons();
    console.log('Common content loaded and initialized.');
    await populateDoctorAppointmentsTable();
    await populateUpcomingAppointmentsTable();
  });
});

// --- Real-time updates with Supabase subscriptions ---
function setupRealtimeUpdates() {
  if (!window.supabase || !window.supabase.channel) return;
  window.supabase
    .channel('public:appointments')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      async (payload) => {
        console.log('Change received:', payload);
        await populateDoctorAppointmentsTable();
        await populateUpcomingAppointmentsTable();
      }
    )
    .subscribe();
}

// --- Log a user action to the history table in Supabase ---
async function logHistory(action, details = {}) {
  if (!window.supabase) {
    console.error('Supabase not initialized');
    return;
  }
  let user_id = null;
  let user_email = null;
  if (window.supabase.auth && window.supabase.auth.getUser) {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      user_id = user.id;
      user_email = user.email;
    }
  }
  const { error } = await window.supabase
    .from('history')
    .insert([{
      user_id,
      user_email,
      action,
      details,
      timestamp: new Date().toISOString()
    }]);
  if (error) {
    console.error('Failed to log history:', error);
  }
}

// --- Profile Modal ---
function closeProfileModal() {
  hidePopup('profile-modal');
}

// Expose modal functions globally for inline HTML onclick handlers
window.closeProfileModal = closeProfileModal;
window.openProfileModal = openProfileModal;
// Add any other modal functions used in onclick attributes

// --- Recipient Autocomplete for Messages ---
async function setupRecipientAutocomplete() {
  const recipientInput = document.getElementById('recipient');
  if (!recipientInput) return;

  // Create datalist if not present
  let dataList = document.getElementById('recipient-suggestions');
  if (!dataList) {
    dataList = document.createElement('datalist');
    dataList.id = 'recipient-suggestions';
    recipientInput.setAttribute('list', 'recipient-suggestions');
    recipientInput.parentNode.insertBefore(dataList, recipientInput.nextSibling);
  }

  recipientInput.addEventListener('input', async function () {
    const query = recipientInput.value.trim();
    if (query.length < 2) {
      dataList.innerHTML = '';
      return;
    }
    // Fetch matching profiles from Supabase
    const { data, error } = await window.supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      dataList.innerHTML = '';
      return;
    }

    // Populate datalist with suggestions
    dataList.innerHTML = '';
    data.forEach(profile => {
      const option = document.createElement('option');
      option.value = `${profile.first_name} ${profile.last_name}`.trim();
      option.label = profile.email;
      dataList.appendChild(option);
    });
  });
}

// Call this after DOM is ready
document.addEventListener('DOMContentLoaded', setupRecipientAutocomplete);

// --- Message Notifications ---
async function loadMessageNotifications() {
  if (!window.supabase) return;
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) return;

  // Fetch unread messages where the current user is the recipient
  const { data: messages, error } = await window.supabase
    .from('messages')
    .select('id, user_id, patient_name, subject, content, date')
    .eq('recipient_id', user.id)
    .eq('status', 'Unread')
    .order('date', { ascending: false })
    .limit(20);

  const notificationsList = document.querySelector('.notifications-list');
  if (!notificationsList) return;

  notificationsList.innerHTML = '';

  if (error || !messages || messages.length === 0) {
    notificationsList.innerHTML = '<li class="notification">No new messages.</li>';
    updateNotificationBell(0);
    return;
  }
messages.forEach(msg => {
  const li = document.createElement('li');
  li.className = 'notification new';
  li.innerHTML = `
    <div><b>New Message</b> - <span>${msg.subject || ''}</span></div>
    <div>${msg.content ? msg.content.slice(0, 60) : ''}</div>
    <span class="notification-time">${msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
    <div class="notification-actions" style="margin-top:5px;">
      <button class="mark-read-btn" style="margin-right:8px;">Mark as Read</button>
      <button class="mark-unread-btn">Mark as Unread</button>
    </div>
  `;
  li.style.cursor = 'pointer';

  // Open chat on main click (not on action buttons)
  li.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-read-btn') || e.target.classList.contains('mark-unread-btn')) return;
    // Mark message as read
    await window.supabase
      .from('messages')
      .update({ status: 'Read' })
      .eq('id', msg.id);
    loadMessageNotifications();

    if (window.location.pathname.endsWith('messages.html') && typeof window.openChatWithMessage === 'function') {
      window.openChatWithMessage(msg);
    } else {
      window.location.href = `/messages.html?subject=${encodeURIComponent(msg.subject)}`;
    }
  });

  // Mark as Read button
  li.querySelector('.mark-read-btn').onclick = async (e) => {
    e.stopPropagation();
    await window.supabase
      .from('messages')
      .update({ status: 'Read' })
      .eq('id', msg.id);
    loadMessageNotifications();
  };

  // Mark as Unread button
  li.querySelector('.mark-unread-btn').onclick = async (e) => {
    e.stopPropagation();
    await window.supabase
      .from('messages')
      .update({ status: 'Unread' })
      .eq('id', msg.id);
    loadMessageNotifications();
  };

  notificationsList.appendChild(li);
});
  updateNotificationBell(messages.length);
}

function updateNotificationBell(count) {
  const bellBtn = document.querySelector('.icon-button[title="Notifications"]');
  if (!bellBtn) return;
  let badge = bellBtn.querySelector('.notification-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'notification-badge';
    bellBtn.appendChild(badge);
  }
  badge.textContent = count > 0 ? count : '';
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

// Real-time subscription for messages
function setupMessageNotificationRealtime() {
  if (!window.supabase || !window.supabase.channel) return;
  window.supabase
    .channel('public:messages')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      async (payload) => {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;
        if (
          payload.new?.recipient_id === user.id ||
          payload.old?.recipient_id === user.id
        ) {
          loadMessageNotifications();
        }
      }
    )
    .subscribe();
}

// Call these after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadMessageNotifications();
  setupMessageNotificationRealtime();
});
