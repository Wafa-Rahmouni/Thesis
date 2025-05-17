// --- No Supabase Initialization Here ---
// (Supabase is initialized globally in supabaseClient.js, do not re-initialize here)

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

// --- Booking Form Handling ---
async function handleBooking(event) {
  event.preventDefault();
  console.log('Handling booking...');

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
    console.log('Inserting appointment into Supabase:', newAppointment);

    // Insert the appointment into Supabase
    const { data, error } = await window.supabase
      .from('appointments')
      .insert([newAppointment]);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Appointment created successfully:', data);

    // Explicitly trigger table updates
    await populateUpcomingAppointmentsTable();
    await populateDoctorAppointmentsTable();
    await populateAppointmentsTable();

    document.getElementById('book-visit-form').reset();
    alert('Appointment booked successfully!');
    closeBookVisitPopup();

  } catch (error) {
    console.error('Error creating appointment:', error);
    alert('Failed to book appointment: ' + (error.message || 'Unknown error'));
  }
}

// --- Populate Appointments Table ---
async function populateAppointmentsTable() {
  console.log('Populating appointments table...');
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) {
    console.log('appointments-table-body not found, skipping');
    return; // Ensure the table body exists
  }

  tableBody.innerHTML = ''; // Clear existing rows

  try {
    console.log('Fetching appointments from Supabase...');
    // Fetch appointments from Supabase
    const { data: appointments, error } = await window.supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    console.log(`Received ${appointments ? appointments.length : 0} appointments`);

    if (appointments && appointments.length > 0) {
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
    } else {
      // Handle empty results
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">No appointments found</td>';
      tableBody.appendChild(row);
    }

  } catch (error) {
    console.error('Error fetching appointments:', error);
    // Add error message to table
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load appointments. Please refresh the page.</td></tr>';
  }
}

// --- Populate Upcoming Appointments Table ---
async function populateUpcomingAppointmentsTable() {
  console.log('Populating upcoming appointments table...');
  const tableBody = document.getElementById('upcoming-table-body');
  if (!tableBody) {
    console.log('upcoming-table-body not found, skipping');
    return;
  }

  tableBody.innerHTML = '';

  try {
    const patientName = document.getElementById('name')?.value || 'John Doe';
    console.log(`Fetching upcoming appointments for patient: ${patientName}`);

    // Fetch upcoming appointments for this patient from Supabase
    const { data: upcomingAppointments, error } = await window.supabase
      .from('appointments')
      .select('*')
      .eq('patient', patientName)
      .eq('status', 'Upcoming')
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase upcoming appointments fetch error:', error);
      throw error;
    }

    console.log(`Received ${upcomingAppointments ? upcomingAppointments.length : 0} upcoming appointments`);

    if (upcomingAppointments && upcomingAppointments.length > 0) {
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
    } else {
      // Handle empty results
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">No upcoming appointments found</td>';
      tableBody.appendChild(row);
    }

  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    // Add error message to table
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load upcoming appointments. Please refresh the page.</td></tr>';
  }
}

// --- Populate Doctor Appointments Table ---
async function populateDoctorAppointmentsTable() {
  console.log('Populating doctor appointments table...');
  const tableBody = document.getElementById('doctor-appointments-table-body');
  if (!tableBody) {
    console.log('doctor-appointments-table-body not found, skipping');
    return;
  }

  tableBody.innerHTML = '';

  try {
    console.log('Fetching all appointments for doctor view...');
    // Fetch all appointments from Supabase (for the doctor view)
    const { data: appointments, error } = await window.supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase doctor appointments fetch error:', error);
      throw error;
    }

    console.log(`Received ${appointments ? appointments.length : 0} doctor appointments`);

    if (appointments && appointments.length > 0) {
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
    } else {
      // Handle empty results
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="7" style="text-align: center;">No appointments found</td>';
      tableBody.appendChild(row);
    }

  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    // Add error message to table
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Failed to load appointments. Please refresh the page.</td></tr>';
  }
}

// --- Update Appointment Status ---
async function updateStatus(appointmentId, newStatus) {
  console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);

  try {
    const { data, error } = await window.supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log(`Appointment ${appointmentId} updated successfully to ${newStatus}`);

    // Refresh the tables
    await populateAppointmentsTable();
    await populateUpcomingAppointmentsTable();
    await populateDoctorAppointmentsTable();

    alert(`Appointment ${newStatus} successfully`);

  } catch (error) {
    console.error('Error updating appointment:', error);
    alert('Failed to update appointment status: ' + (error.message || 'Unknown error'));
  }
}

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing application...');

  loadCommonHTML(async () => {
    setupVideoCallButtons();
    console.log('Common content loaded and initialized.');

    // Attach event listeners to booking form if it exists
    const bookVisitForm = document.getElementById('book-visit-form');
    if (bookVisitForm) {
      console.log('Adding event listener to booking form');
      bookVisitForm.addEventListener('submit', handleBooking);
    }

    // Set up realtime updates for Supabase
    setupRealtimeUpdates();
  });

  // Attach event listeners to appointment update buttons
  document.querySelectorAll('.action-buttons button').forEach(button => {
    button.addEventListener('click', function() {
      const action = this.className;
      const appointmentId = this.closest('tr').getAttribute('data-id');

      if (action === 'confirm') {
        updateStatus(appointmentId, 'Confirmed');
      } else if (action === 'reschedule') {
        updateStatus(appointmentId, 'Rescheduled');
      } else if (action === 'cancel') {
        updateStatus(appointmentId, 'Cancelled');
      }
    });
  });

  // Set up book visit popup buttons if they exist
  const bookVisitBtn = document.getElementById('book-visit-btn');
  if (bookVisitBtn) {
    bookVisitBtn.addEventListener('click', openBookVisitPopup);
  }

  const closeBookVisitBtn = document.querySelector('#book-visit-popup .close');
  if (closeBookVisitBtn) {
    closeBookVisitBtn.addEventListener('click', closeBookVisitPopup);
  }
});

// --- Book Visit Popup Functions ---
function openBookVisitPopup() {
  console.log('Opening book visit popup');
  closeAllPopups(); // Close other popups
  const popup = document.getElementById('book-visit-popup');
  if (popup) {
    popup.style.display = 'block';
  }
}

// Function to close the booking popup
function closeBookVisitPopup() {
  console.log('Closing book visit popup');
  const popup = document.getElementById('book-visit-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// Real-time updates with Supabase subscriptions
function setupRealtimeUpdates() {
  console.log('Setting up realtime updates with Supabase...');

  try {
    // Subscribe to changes in the appointments table
    const appointmentsSubscription = window.supabase
      .channel('public:appointments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        async (payload) => {
          console.log('Realtime change received:', payload);
          // Refresh both tables when appointments are updated
          await populateDoctorAppointmentsTable();
          await populateUpcomingAppointmentsTable();
          await populateAppointmentsTable();
        }
      )
      .subscribe((status) => {
        console.log('Supabase realtime subscription status:', status);
      });

    console.log('Realtime subscription setup complete');
  } catch (error) {
    console.error('Error setting up realtime updates:', error);
  }
}