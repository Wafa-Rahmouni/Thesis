// --- Initialize Supabase ---
const SUPABASE_URL = 'https://maxavwnmszjyhahhgbzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGF2d25tc3pqeWhhaGhnYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTY4NTgsImV4cCI6MjA2Mjg5Mjg1OH0.Kxo53BVFW2r9G9GX4hqVTS2vEV-YkUb15xcIN2T7RsI';

// Initialize the Supabase client
window.supabase = window.supabase || null;
// Function to initialize Supabase
function initializeSupabase() {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
  } else {
    console.error('Supabase library not loaded!');
  }
}

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
  if (el) el.style.display = 'flex';yyy
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
    // Insert the appointment into Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([newAppointment])
      .select(); // Add .select() to get the inserted row(s)

    if (error) throw error;
    const newAppointmentId = data && data[0] && data[0].id;
    logHistory('booking', { appointment_id: newAppointmentId });
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
    // Close the booking popup
  closeBookVisitPopup();
}


// --- Add New Appointment ---
async function addNewAppointment(patient, date, time, type, status = 'Pending') {
  try {
    // Create a new appointment object
    const newAppointment = {
      patient: patient,
      date: date,
      time: time,
      type: type,
      status: status,
      created_at: new Date().toISOString()
    };

    // Insert the appointment into Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([newAppointment]);
    
    if (error) throw error;
    
    console.log('New appointment added:', data);
    
    // Refresh the appointments table
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
  if (supabase.auth && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      patientName = user.user_metadata?.full_name || user.email;
    }
  }
  if (!patientName) {
    patientName = document.getElementById('name')?.value || 'John Doe';
  }

  // Fetch all appointments for this patient
  const { data: allAppointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient', patientName)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching patient appointments:', error);
    return;
  }

  // Get today's date in YYYY-MM-DD format
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
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    console.log(`Appointment ${appointmentId} updated to ${newStatus}`);
    
    // Refresh the tables
    await populateAppointmentsTable();
    await populateUpcomingAppointmentsTable();
    
    alert(`Appointment ${newStatus}`);
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    alert('Failed to update appointment status. Please try again.');
  }
}

// --- Populate Upcoming Appointments Table ---
async function populateUpcomingAppointmentsTable() {
  const upcomingTableBody = document.getElementById('upcoming-table-body');
  if (!upcomingTableBody) return;
  upcomingTableBody.innerHTML = '';

  const pastTableBody = document.getElementById('past-table-body');
  if (pastTableBody) pastTableBody.innerHTML = '';

  let patientName = '';
  if (supabase.auth && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      patientName = user.user_metadata?.full_name || user.email;
    }
  }
  if (!patientName) {
    patientName = document.getElementById('name')?.value || 'John Doe';
  }

  // Fetch all appointments for this patient
  const { data: allAppointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient', patientName)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching patient appointments:', error);
    return;
  }

  // Get today's date in YYYY-MM-DD format
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

// --- Populate Doctor Appointments Table ---
async function populateDoctorAppointmentsTable() {
  const tableBody = document.getElementById('doctor-appointments-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';
  const { data: appointments, error } = await supabase
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
  logHistory('video_call', { type });
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
document.addEventListener('DOMContentLoaded', async () => {
  // Load Supabase script dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = function() {
    // Initialize Supabase once script is loaded
    initializeSupabase();
    
    // Continue with other initialization
    loadCommonHTML(async () => {
      setupVideoCallButtons();
      console.log('Common content loaded and initialized.');
      
      // Populate tables after Supabase is initialized
      await populateDoctorAppointmentsTable();
      await populateUpcomingAppointmentsTable();
    });
  };
  document.head.appendChild(script);
  
  function navigateToMessages() {
    // Example: Fetch the user's role from Supabase
    async function checkUserRole() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          alert('You must be logged in to access messages.');
          return;
        }
        
        // Get user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (profile.role === 'doctor') {
          window.location.href = '../../doctors/messages.html';
        } else if (profile.role === 'patient') {
          window.location.href = '../../patients/messages.html';
        } else {
          alert('Unable to determine your role. Please contact support.');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        alert('An error occurred. Please try again later.');
      }
    }
    
    checkUserRole();
  }
});

// Function to open the action modal
window.currentAppointmentId = null;function openModal(appointmentId) {
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
async function confirmLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('User logged out.');
    window.location.href = "/home.html"; // or login page
  } catch (err) {
    console.error('Error during logout:', err.message);
    alert('Failed to log out. Please try again.');
  }
}


// Real-time updates with Supabase subscriptions
function setupRealtimeUpdates() {
  // Subscribe to changes in the appointments table
  const appointmentsSubscription = supabase
    .channel('public:appointments')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'appointments' }, 
      async (payload) => {
        console.log('Change received:', payload);
        // Refresh both tables when appointments are updated
        await populateDoctorAppointmentsTable();
        await populateUpcomingAppointmentsTable();
      }
    )
    .subscribe();
}

// Log a user action to the history table in Supabase
async function logHistory(action, details = {}) {
  if (!window.supabase) {
    console.error('Supabase not initialized');
    return;
  }

  // Try to get user info (if using Supabase Auth)
  let user_id = null;
  let user_email = null;
  if (supabase.auth && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      user_id = user.id;
      user_email = user.email;
    }
  }

  const { error } = await supabase
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

// Video call
logHistory('video_call', { doctor: 'Dr. Smith', duration: '15min' });

// Reminder set
logHistory('reminder_set', { date, time, note });

// Message sent
logHistory('message', { to: 'Dr. Lee', content: 'Hello...' });