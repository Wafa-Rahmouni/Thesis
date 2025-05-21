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
    // 1. Get logged-in doctor
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      console.log('No logged-in user');
      return;
    }

    // 2. Fetch doctor's profile to get clinic name
    const { data: profile, error: profileError } = await window.supabase
      .from('profiles')
      .select('clinic_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Could not fetch doctor profile.', profileError);
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Could not fetch doctor profile.</td></tr>';
      return;
    }

    // 3. Fetch only appointments for this clinic
    const { data: appointments, error } = await window.supabase
      .from('appointments')
      .select('*')
      .eq('clinic', profile.clinic_name)
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase doctor appointments fetch error:', error);
      throw error;
    }

    console.log(`Received ${appointments ? appointments.length : 0} doctor appointments for clinic: ${profile.clinic_name}`);

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
      row.innerHTML = '<td colspan="7" style="text-align: center;">No appointments found for your clinic</td>';
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
});

// --- Real-time updates with Supabase subscriptions
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