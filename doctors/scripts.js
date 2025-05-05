const appointments = [
    { id: 1, patient: "John Doe", date: "2025-05-05", time: "10:00 AM", type: "In-person", status: "Scheduled" },
    { id: 2, patient: "Jane Smith", date: "2025-05-06", time: "2:00 PM", type: "Video", status: "Scheduled" },
  ];
  
  let selectedAppointmentId = null;
  
  function renderAppointments() {
    const tbody = document.getElementById("appointments-table-body");
    tbody.innerHTML = "";
  
    appointments.forEach((appt) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${appt.patient}</td>
        <td>${appt.date}</td>
        <td>${appt.time}</td>
        <td>${appt.type}</td>
        <td id="status-${appt.id}">${appt.status}</td>
        <td class="action-buttons">
          <button class="confirm" onclick="openModal(${appt.id})">Confirm</button>
          <button class="reschedule" onclick="openModal(${appt.id})">Reschedule</button>
          <button class="cancel" onclick="openModal(${appt.id})">Cancel</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  function openModal(id) {
    selectedAppointmentId = id;
    document.getElementById("action-modal").style.display = "flex";
  }
  
  function closeModal() {
    document.getElementById("action-modal").style.display = "none";
    selectedAppointmentId = null;
  }
  
  function updateStatus(status) {
    const appt = appointments.find(a => a.id === selectedAppointmentId);
    if (appt) {
      appt.status = status;
      document.getElementById(`status-${appt.id}`).innerText = status;
    }
    closeModal();
  }
  
  document.addEventListener("DOMContentLoaded", renderAppointments);
  