
let selectedAppointmentId = null;

// Fetch and render appointments from Supabase
async function renderAppointments() {
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  // Get patient name (from auth or form, adjust as needed)
  let patientName = '';
  if (window.supabase && supabase.auth && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      patientName = user.user_metadata?.full_name || user.email;
    }
  }
  if (!patientName) {
    patientName = document.getElementById('name')?.value || 'John Doe';
  }

  // Fetch appointments from Supabase
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient', patientName)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    tableBody.innerHTML = '<tr><td colspan="6">Failed to load appointments.</td></tr>';
    return;
  }

  if (!appointments || appointments.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No appointments found.</td></tr>';
    return;
  }

  appointments.forEach(appointment => {
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

// Call renderAppointments on page load
document.addEventListener("DOMContentLoaded", function() {
  renderAppointments();
  // ...other initialization code...
});

// --- Remove hardcoded data ---
// const appointments = [ ... ]; // DELETE THIS

let selectedAppointmentId = null;

// Fetch and render appointments from Supabase
async function renderAppointments() {
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  // Get patient name (from auth or form, adjust as needed)
  let patientName = '';
  if (window.supabase && supabase.auth && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      patientName = user.user_metadata?.full_name || user.email;
    }
  }
  if (!patientName) {
    patientName = document.getElementById('name')?.value || 'John Doe';
  }

  // Fetch appointments from Supabase
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient', patientName)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    tableBody.innerHTML = '<tr><td colspan="6">Failed to load appointments.</td></tr>';
    return;
  }

  if (!appointments || appointments.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No appointments found.</td></tr>';
    return;
  }

  appointments.forEach(appointment => {
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

// Call renderAppointments on page load
document.addEventListener("DOMContentLoaded", function() {
  renderAppointments();
  // ...other initialization code...
});

// The rest of your navigation and modal logic remains unchanged
