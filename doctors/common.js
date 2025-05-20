const doctorRTCConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// --- Remove Supabase Initialization ---
// (Supabase is now initialized globally in supabaseClient.js, do not re-initialize here)

// --- Load Common HTML ---
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
        
        // Add chatbot after common HTML is loaded
        if (!document.getElementById('chatling-embed-script')) {
          const chatbotConfig = document.createElement('script');
          chatbotConfig.textContent = 'window.chtlConfig = { chatbotId: "5541694675" }';
          document.body.appendChild(chatbotConfig);
          
          const chatbotScript = document.createElement('script');
          chatbotScript.async = true;
          chatbotScript.setAttribute('data-id', '5541694675');
          chatbotScript.id = 'chatling-embed-script';
          chatbotScript.type = 'text/javascript';
          chatbotScript.src = 'https://chatling.ai/js/embed.js';
          document.body.appendChild(chatbotScript);
        }
        
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

  // Attach Book Visit button event for all users (patients and doctors)
  const bookBtn = document.getElementById('open-book-visit-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', openBookVisitPopup);
  }

  // Profile edit button
  const editBtn = document.getElementById('edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      // Enable all form fields
      const inputs = document.querySelectorAll('#profile-form input, #profile-form select');
      inputs.forEach(input => {
        input.disabled = false;
      });
      
      // Show save and cancel buttons
      document.getElementById('save-btn').style.display = 'inline-block';
      document.getElementById('cancel-btn').style.display = 'inline-block';
      document.getElementById('edit-btn').style.display = 'none';
    });
  }
  
  // Profile cancel button
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      // Reload profile data (revert changes)
      loadProfileData();
      
      // Disable form fields
      const inputs = document.querySelectorAll('#profile-form input, #profile-form select');
      inputs.forEach(input => {
        input.disabled = true;
      });
      
      // Hide save and cancel buttons, show edit button
      document.getElementById('save-btn').style.display = 'none';
      document.getElementById('cancel-btn').style.display = 'none';
      document.getElementById('edit-btn').style.display = 'inline-block';
    });
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
async function saveProfileChanges() {
  try {
    // Get user first, before checking if it exists
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      alert('You must be logged in to update your profile.');
      return;
    }
    
    // First check if form elements exist with either ID pattern
    function getElementValue(baseName) {
      const element = 
        document.getElementById(`profile-${baseName}`) || 
        document.getElementById(baseName);
      
      return element ? element.value.trim() : '';
    }
    
    // Create profileData object from form values
    const profileData = {
      first_name: getElementValue('first_name'),
      last_name: getElementValue('last_name'),
      email: getElementValue('email'),
      phone: getElementValue('phone'),
      address: getElementValue('address'),
      gender: getElementValue('gender'),
      dob: getElementValue('dob')
    };
    
    console.log('Form data collected:', profileData);
    
    // Validate required fields
    if (!profileData.first_name || !profileData.last_name) {
      alert('First name and last name are required.');
      return;
    }
    
    // Add the user ID to the profile data
    profileData.id = user.id;
    
    console.log('Updating profile with:', profileData);
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);
    
    if (error) {
      console.error('Profile update error:', error);
      alert('Could not update profile: ' + error.message);
      return;
    }
    
    // Update local storage values for immediate use
    localStorage.setItem('first_name', profileData.first_name);
    localStorage.setItem('last_name', profileData.last_name);
    
    // Close the profile modal
    closeProfileModal();
    
    // Show success message
    alert('Profile updated successfully!');
    
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('An error occurred while saving profile changes: ' + err.message);
  }
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
    populateClinicDropdown();
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

  // Get patient info from Supabase user profile
  let patientName = '';
  let patientId = '';
  if (window.supabase && window.supabase.auth) {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      patientId = user.id;
      patientName = user.user_metadata?.full_name
        || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
        || user.email
        || '';
    }
  }

  const visitDate = document.getElementById('visit-date').value;
  const visitTime = document.getElementById('visit-time').value;
  const visitType = document.getElementById('visit-type').value;
  const clinicValue = document.getElementById('clinic').value; // format: doctorId|clinicName
  const visitReason = document.getElementById('visit-reason').value;

  if (!patientName || !patientId || !visitDate || !visitTime || !visitType || !clinicValue || !visitReason) {
    alert('Please fill in all the required fields.');
    return;
  }

  // --- Prevent multiple appointments per day for the same patient ---
  const { data: existingAppointments, error: checkError } = await window.supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', patientId)
    .eq('date', visitDate);

  if (checkError) {
    alert('Error checking existing appointments.');
    return;
  }
  if (existingAppointments && existingAppointments.length > 0) {
    alert('You already have an appointment booked for this day.');
    return;
  }

  // Split value into doctorId and clinicName
  const [doctorId, clinicName] = clinicValue.split('|');

  const newAppointment = {
    patient: patientName,
    patient_id: patientId,
    date: visitDate,
    time: visitTime,
    type: visitType,
    clinic: clinicName,
    doctor_id: doctorId,
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

    await populateDoctorAppointmentsTable?.();
    await populateUpcomingAppointmentsTable?.();
    closeBookVisitPopup();
  } catch (error) {
    console.error('Error creating appointment:', error);
    alert('Check Your Email for Confirmation!');
  }
}
window.handleBooking = handleBooking;

// --- Populate Upcoming Appointments Table (for patients) ---
async function populateUpcomingAppointmentsTable() {
  const upcomingTableBody = document.getElementById('upcoming-table-body');
  if (!upcomingTableBody) return;
  upcomingTableBody.innerHTML = '';

  const pastTableBody = document.getElementById('past-table-body');
  if (pastTableBody) pastTableBody.innerHTML = '';

// Get current user ID
let userId = '';
if (window.supabase.auth && window.supabase.auth.getUser) {
  const { data: { user } } = await window.supabase.auth.getUser();
  if (user) {
    userId = user.id;
  }
}

if (!userId) {
  upcomingTableBody.innerHTML = '<tr><td colspan="6">No upcoming appointments found.</td></tr>';
  if (pastTableBody) pastTableBody.innerHTML = '<tr><td colspan="6">No past appointments found.</td></tr>';
  return;
}

const { data: allAppointments, error } = await window.supabase
  .from('appointments')
  .select('*')
  .eq('patient_id', userId) // <-- fetch by patient_id!
  .order('date', { ascending: false })
  .order('created_at', { ascending: false });
  
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

// --- Hide Book Visit Button for Doctors ---
document.addEventListener('DOMContentLoaded', async () => {
  loadCommonHTML(async () => {
    initializeCommonEventListeners();
    setupTabNavigation();
    console.log('Common content loaded and initialized.');

    // Wait for Supabase auth to be ready and user to be available
    let user = null;
    if (window.supabase && window.supabase.auth) {
      for (let i = 0; i < 20; i++) { // Try for up to ~2 seconds
        const { data } = await window.supabase.auth.getUser();
        if (data && data.user) {
          user = data.user;
          break;
        }
        await new Promise(res => setTimeout(res, 100));
      }
    }

    // --- Hide or disable Book Visit button for doctors ---
    if (user) {
      // Fetch the user's profile to get the role
      const { data: profile } = await window.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role && profile.role.toLowerCase() === 'doctor') {
        // Hide by class
        document.querySelectorAll('.book-button').forEach(btn => btn.style.display = 'none');
        // Hide by ID
        const bookBtnById = document.getElementById('open-book-visit-btn');
        if (bookBtnById) bookBtnById.style.display = 'none';
        // Remove any button with text "Book Visit"
        document.querySelectorAll('button').forEach(btn => {
          if (btn.textContent.trim().toLowerCase() === 'book visit') {
            btn.style.display = 'none';
          }
        });
      }
    }

    // Now populate tables
    await populateDoctorAppointmentsTable();
    await populateUpcomingAppointmentsTable();
  });
});

// --- Expose popup/modal functions globally for inline HTML onclick handlers ---
window.openBookVisitPopup = openBookVisitPopup;
window.closeBookVisitPopup = closeBookVisitPopup;

// (Other modal and utility functions can be exposed as needed)

// --- Real-time updates with Supabase subscriptions ---
function setupRealtimeUpdates() {
  if (!window.supabase || !window.supabase.channel) return;
  window.supabase
    .channel('public:appointments')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      async (payload) => {
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

window.supabase
  .channel('public:appointments')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'appointments' },
    async (payload) => {
      await populateDoctorAppointmentsTable();
      await populateUpcomingAppointmentsTable();
    }
  )
  .subscribe();

// --- Tab Navigation Setup ---
function setupTabNavigation() {
  // Try both selectors for compatibility
  const tabButtons = document.querySelectorAll(".tab-button");

  // Detect if we're in /patients/ or /doctors/
  let basePath = "";
  if (window.location.pathname.includes("/patients/")) {
    basePath = "/patients";
  } else if (window.location.pathname.includes("/doctors/")) {
    basePath = "/doctors";
  }

  // Define tab routes for each role
  const patientTabRoutes = {
    "appointments": "/patients/appointments/appointment.html",
    "consultation": "/patients/consultation.html",
    "history": "/patients/history.html",
    "clinics": "/patients/clinics.html",
    "plans": "/patients/plans.html",
    "emergency": "/patients/emergency.html",
    "reminders": "/patients/reminders.html"
  };

  const doctorTabRoutes = {
    "appointments": "/doctors/appointments.html",
    "patients": "/doctors/patients.html",
    "consultations": "/doctors/consultations.html",
    "prescriptions": "/doctors/prescriptions.html",
    "emergencies": "/doctors/emergencies.html"
  };

  // Choose which routes to use
  const tabRoutes = basePath === "/patients" ? patientTabRoutes : doctorTabRoutes;

  // Use data-tab for patients, data-page for doctors
  const dataAttr = basePath === "/patients" ? "data-tab" : "data-page";

  // Navigation on click
  tabButtons.forEach(button => {
    const tab = button.getAttribute(dataAttr);
    if (!tab) return;
    button.addEventListener("click", () => {
      if (tabRoutes[tab]) {
        location.href = tabRoutes[tab];
      }
    });
  });

  // Highlight active tab
  const currentPage = window.location.pathname.toLowerCase();
  tabButtons.forEach(button => {
    const tab = button.getAttribute(dataAttr);
    const route = tabRoutes[tab];
    if (route && currentPage.endsWith(route.toLowerCase())) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// After loading common HTML and initializing event listeners:
document.addEventListener('DOMContentLoaded', () => {
  loadCommonHTML(() => {
    initializeCommonEventListeners();
    setupTabNavigation();
    console.log('Common content loaded and initialized.');
    // ...any other startup logic...
  });
});



window.toggleLanguagePopup = function() {
  const popup = document.getElementById('ladssnguage-popup');
  popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
};

window.closeLanguagePopup = function() {
  document.getElementById('language-popup').style.display = 'none';
};
window.translatePage = function(lang) {
  let attempts = 0;
  function setLang() {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = lang;
      // Google Translate sometimes needs a click event as well
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      combo.dispatchEvent(new Event('input', { bubbles: true }));
      combo.blur(); // Remove focus to trigger translation
      window.closeLanguagePopup();
    } else if (attempts < 30) { // Try for up to 3 seconds
      attempts++;
      setTimeout(setLang, 100);
    } else {
      alert('Translation widget not loaded yet. Please try again in a moment.');
    }
  }
  setLang();
};



// Fill clinics dropdown with all unique doctor clinics
async function populateClinicDropdown() {
  const clinicSelect = document.getElementById('clinic');
  if (!clinicSelect || !window.supabase) {
    console.log('Clinic select not found or Supabase not ready');
    return;
  }

  // Clear all options
  clinicSelect.innerHTML = '';

  // Add default option (do NOT set selected here)
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.textContent = 'Select a clinic';
  clinicSelect.appendChild(defaultOption);

  // Fetch all doctor profiles with a clinic_name
  const { data: doctors, error } = await window.supabase
    .from('profiles')
    .select('id, clinic_name, first_name, last_name, role')
    .eq('role', 'doctor')
    .not('clinic_name', 'is', null)
    .neq('clinic_name', '');

  if (error) {
    console.error('Error fetching clinics:', error);
    return;
  }

  // Only show unique clinic names, but keep the doctor id for booking
  const seen = new Set();
  let hasOptions = false;
  doctors.forEach(doc => {
    if (!seen.has(doc.clinic_name)) {
      seen.add(doc.clinic_name);
      const option = document.createElement('option');
      option.value = `${doc.id}|${doc.clinic_name}`;
      option.textContent = `${doc.clinic_name} (${doc.first_name || ''} ${doc.last_name || ''})`;
      clinicSelect.appendChild(option);
      hasOptions = true;
    }
  });

  // If no value is selected, set the default option as selected
  if (!clinicSelect.value) {
    clinicSelect.selectedIndex = 0;
  }

  // Debug: log what is actually being added
  console.log('Clinics shown in dropdown:', Array.from(seen));
}

// --- Emergency Call Notification Logic ---

// 1. Fetch active emergency calls for the logged-in doctor
async function loadEmergencyCallNotifications() {
  if (!window.supabase) return [];

  // Get current doctor user
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) return [];

  // Fetch active emergency calls assigned to this doctor
  // Make sure your emergency_calls table has: id, reason, started_at, status, patient_id
  // We'll join to profiles to get patient name
  const { data, error } = await window.supabase
    .from('emergency_calls')
    .select(`
      id,
      reason,
      started_at,
      status,
      patient_id,
      profiles:patient_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq('doctor_id', user.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching emergency call notifications:', error);
    return [];
  }

  return data || [];
}

// 2. Render notifications in the notification panel
async function renderEmergencyCallNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (!notificationsList) return;

  const calls = await loadEmergencyCallNotifications();
  let count = 0;

  calls.forEach(call => {
    count++;
    const patientName = call.profiles
      ? `${call.profiles.first_name || ''} ${call.profiles.last_name || ''}`.trim() || call.profiles.email
      : 'Unknown Patient';

    const li = document.createElement('li');
    li.className = 'notification new emergency';
    li.innerHTML = `
      <div>
        <b class="emergency-tag">EMERGENCY CALL</b> - <span>${patientName}</span>
      </div>
      <div>Reason: <span>${call.reason || 'No reason provided'}</span></div>
      <span class="notification-time">${call.started_at ? new Date(call.started_at).toLocaleString() : 'Now'}</span>
      <div class="notification-actions" style="margin-top:5px;">
        <button class="join-emergency-call-btn" data-call-id="${call.id}" style="margin-right:8px;">Join Call</button>
        <button class="decline-emergency-call-btn" data-call-id="${call.id}">Decline</button>
      </div>
    `;

    // Join Call
    li.querySelector('.join-emergency-call-btn').onclick = function(e) {
      e.stopPropagation();
      startDoctorVideoCall(call.id);
      closeNotificationsPopup();
    };

    // Decline Call
    li.querySelector('.decline-emergency-call-btn').onclick = async function(e) {
      e.stopPropagation();
      await window.supabase
        .from('emergency_calls')
        .update({ status: 'declined' })
        .eq('id', call.id);
      renderEmergencyCallNotifications();
      updateNotificationBell(count - 1);
    };

    notificationsList.appendChild(li);
  });

  // If no calls
  if (count === 0) {
    notificationsList.innerHTML = '<li class="notification">No emergency calls.</li>';
  }

  updateNotificationBell(count);
}

// 3. Update notification bell badge
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

// 4. Real-time subscription for emergency calls
function setupEmergencyCallRealtime() {
  if (!window.supabase || !window.supabase.channel) return;
  window.supabase
    .channel('public:emergency_calls')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'emergency_calls' },
      async (payload) => {
        await renderEmergencyCallNotifications();
      }
    )
    .subscribe();
}

// 5. Helper: Start video call (redirect to call page)
function startDoctorVideoCall(callId) {
  openDoctorVideoCallModal(callId);
}

function openDoctorVideoCallModal(callId) {
  const modal = document.getElementById('video-call-modal');
  if (modal) {
    modal.style.display = 'block';
    startDoctorVideoCallSession(callId);
  }
}

// Close modal logic for doctor
document.getElementById('close-video-call-modal').onclick = function() {
  document.getElementById('video-call-modal').style.display = 'none';
  // Stop camera/mic if needed
  const localVideo = document.getElementById('localVideo');
  if (localVideo && localVideo.srcObject) {
    localVideo.srcObject.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
  }
  // Optionally, disconnect signaling here
};

// Start local video and connect to call session
function startDoctorVideoCallSession(callId) {
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const callStatus = document.getElementById('call-status');
  callStatus.textContent = 'Connecting to patient...';

  // 1. Join the same signaling channel as the patient
  doctorSignalingChannel = window.supabase.channel(`call_${callId}`);

doctorSignalingChannel.on('broadcast', { event: 'signal' }, ({ payload }) => {
  handleDoctorSignalingData(payload);
}).subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // Notify patient that doctor is ready
    doctorSignalingChannel.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type: 'doctor-joined' }
    });
  }
});

  // 2. Start WebRTC as the callee (doctor)
  startDoctorWebRTC(false);
}

async function startDoctorWebRTC(isCaller) {
  doctorPeerConnection = new RTCPeerConnection(doctorRTCConfig);

  // Local video
  const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById('localVideo').srcObject = localStream;
  localStream.getTracks().forEach(track => doctorPeerConnection.addTrack(track, localStream));

  // Remote video
  doctorPeerConnection.ontrack = (event) => {
    document.getElementById('remoteVideo').srcObject = event.streams[0];
  };

  // ICE candidates
  doctorPeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendDoctorSignal({ type: 'candidate', data: event.candidate });
    }
  };
}
function sendDoctorSignal(data) {
  doctorSignalingChannel.send({
    type: 'broadcast',
    event: 'signal',
    payload: data
  });
}

async function handleDoctorSignalingData({ type, data }) {
  if (!doctorPeerConnection) await startDoctorWebRTC(false);

  if (type === 'offer') {
    await doctorPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
    const answer = await doctorPeerConnection.createAnswer();
    await doctorPeerConnection.setLocalDescription(answer);
    sendDoctorSignal({ type: 'answer', data: answer });
  } else if (type === 'answer') {
    await doctorPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
  } else if (type === 'candidate') {
    try {
      await doctorPeerConnection.addIceCandidate(new RTCIceCandidate(data));
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  }
}

// 6. Show notifications popup with fresh data
function openNotificationsPopup() {
  closeAllPopups();
  showPopup('notifications-popup');
  renderEmergencyCallNotifications();
}

// 7. Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderEmergencyCallNotifications();
  setupEmergencyCallRealtime();
});

// 8. Expose for global use
window.openNotificationsPopup = openNotificationsPopup;
document.addEventListener('DOMContentLoaded', function() {
  // Get profile form element (if it exists)
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveProfileChanges();
    });
  }
});



