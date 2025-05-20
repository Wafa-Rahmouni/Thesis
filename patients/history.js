// No Supabase initialization here; use window.supabase from supabaseClient.js
function formatDetails(details, action = '') {
  if (action === 'booking' && typeof details === 'object' && details.appointment_id) {
    return `<b>Booking ID:</b> ${details.appointment_id}`;
  }

  // Pretty print JSON, but flatten if simple
  if (typeof details === 'object' && details !== null) {
    const keys = Object.keys(details);
    if (keys.length <= 2) {
      return keys.map(k => `<b>${k}:</b> ${details[k]}`).join('<br>');
    }
    // For more complex objects, show only keys and short values
    return keys.map(k => `<b>${k}:</b> ${String(details[k]).length > 30 ? String(details[k]).slice(0, 30) + '…' : details[k]}`).join('<br>');
  }
  return String(details);
}

async function renderHistory() {
  const tableBody = document.getElementById('history-table-body');
  if (!window.supabase || !tableBody) return;

  const { data: logs, error } = await window.supabase
    .from('history')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    tableBody.innerHTML = '<tr><td colspan="3">Failed to load history.</td></tr>';
    return;
  }

  tableBody.innerHTML = '';
  logs.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</td>
      <td class="history-action">${log.action || ''}</td>
      <td>${formatDetails(log.details, log.action)}</td>
    `;
    tableBody.appendChild(row);
  });

  if (!tableBody.hasChildNodes()) {
    tableBody.innerHTML = '<tr><td colspan="3">No history found.</td></tr>';
  }
}