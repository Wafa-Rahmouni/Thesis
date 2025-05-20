async function getCurrentUser() {
  if (window.supabase && window.supabase.auth && window.supabase.auth.getUser) {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) return { user_id: user.id, user_email: user.email };
  }
  return { user_id: null, user_email: null };
}

async function renderReminders() {
  const remindersList = document.getElementById('reminders-list');
  remindersList.innerHTML = '<p>Loading...</p>';

  const { user_email } = await getCurrentUser();
  if (!user_email) {
    remindersList.innerHTML = '<p>Please log in to see your reminders.</p>';
    return;
  }

  const { data: reminders, error } = await window.supabase
    .from('reminders')
    .select('*')
    .eq('user_email', user_email);

  if (error || !reminders || reminders.length === 0) {
    remindersList.innerHTML = '<p>No reminders.</p>';
    return;
  }

  // Sort reminders: latest at top (descending by date+time)
  reminders.sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time || '00:00'}`);
    const bDate = new Date(`${b.date}T${b.time || '00:00'}`);
    return bDate - aDate;
  });

  const now = new Date();
  let html = '';

  reminders.forEach(reminder => {
    const reminderDate = new Date(`${reminder.date}T${reminder.time || '00:00'}`);
    const isPast = reminderDate < now;
    const isDue = Math.abs(reminderDate - now) < 60000; // within 1 minute

    html += `
      <div class="consultation-card">
        <div>
          <h3>${reminder.title}</h3>
          <p>${new Date(reminder.date).toLocaleDateString()}${reminder.time ? ' - ' + reminder.time : ''}</p>
        </div>
        <div class="status ${isDue ? 'status-due' : isPast ? 'status-past' : 'status-upcoming'}">
          ${isDue ? 'Due Now' : isPast ? 'Past' : 'Upcoming'}
        </div>
        <button class="edit-reminder-btn" data-reminder-id="${reminder.id}">Edit</button>
      </div>
    `;
  });

  remindersList.innerHTML = html;

  // Add event listeners for Edit buttons
  document.querySelectorAll('.edit-reminder-btn').forEach(btn => {
    btn.onclick = async function() {
      const id = btn.getAttribute('data-reminder-id');
      const reminder = reminders.find(r => String(r.id) === String(id));
      if (reminder) {
        // Populate form fields
        document.getElementById('reminder-title').value = reminder.title;
        document.getElementById('reminder-date').value = reminder.date;
        document.getElementById('reminder-time').value = reminder.time || '';
        document.getElementById('reminder-title').focus();
        // Store editing reminder id globally
        window.editingReminderId = reminder.id;
      }
    };
  });
}

async function addReminder() {
  const title = document.getElementById('reminder-title').value.trim();
  const date = document.getElementById('reminder-date').value;
  const time = document.getElementById('reminder-time').value;
  const { user_id, user_email } = await getCurrentUser();
  if (!title || !date || !user_email) {
    alert('Please fill all fields and make sure you are logged in.');
    return;
  }

  // If editing, update the reminder
  if (window.editingReminderId) {
    // Remove old notification if present
    let dueReminders = getDueRemindersFromStorage();
    dueReminders = dueReminders.filter(r => String(r.id) !== String(window.editingReminderId));
    setDueRemindersToStorage(dueReminders);

    // Update in Supabase
    const { error } = await window.supabase
      .from('reminders')
      .update({ title, date, time })
      .eq('id', window.editingReminderId);

    if (error) {
      alert('Failed to update reminder.');
      return;
    }

    // Check if the edited reminder is now due and add notification if needed
    const editedReminder = {
      id: window.editingReminderId,
      title,
      date,
      time,
      user_id,
      user_email
    };
    const now = new Date();
    const reminderDate = new Date(`${date}T${time || '00:00'}`);
    if (Math.abs(reminderDate - now) < 60000) {
      addDueReminder(editedReminder);
    }

    window.editingReminderId = null; // Clear editing state
  } else {
    // Insert new reminder
    const { error } = await window.supabase
      .from('reminders')
      .insert([{ user_id, user_email, title, date, time }]);
    if (error) {
      alert('Failed to add reminder.');
      return;
    }
    if (typeof logHistory === 'function') {
      logHistory('reminder_set', { title, date, time });
    }
  }

  await renderReminders();
  checkDueReminders(); // Ensure notifications are up to date
  renderDueRemindersNotifications();

  document.getElementById('reminder-title').value = '';
  document.getElementById('reminder-date').value = '';
  document.getElementById('reminder-time').value = '';
}

// Helper: Get and set due reminders in localStorage
function getDueRemindersFromStorage() {
  return JSON.parse(localStorage.getItem('due_reminders') || '[]');
}
function setDueRemindersToStorage(reminders) {
  localStorage.setItem('due_reminders', JSON.stringify(reminders));
}

// Add due reminder to storage if not already present
function addDueReminder(reminder) {
  const dueReminders = getDueRemindersFromStorage();
  if (!dueReminders.some(r => r.id === reminder.id)) {
    dueReminders.unshift(reminder); // latest at top
    setDueRemindersToStorage(dueReminders);
  }
}

// Render due reminders in the notifications popup
function renderDueRemindersNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (!notificationsList) return;
  const dueReminders = getDueRemindersFromStorage();
  notificationsList.innerHTML = '';
  if (dueReminders.length === 0) {
    notificationsList.innerHTML = '<li class="notification">No due reminders.</li>';
    updateNotificationBell(0);
    return;
  }
  dueReminders.forEach(reminder => {
    const li = document.createElement('li');
    li.className = 'notification new';
    li.innerHTML = `
      <div><b>Reminder Due</b> - <span>${reminder.title}</span></div>
      <div>${reminder.date} ${reminder.time || ''}</div>
      <span class="notification-time">${new Date(reminder.date + 'T' + (reminder.time || '00:00')).toLocaleString()}</span>
      <div class="notification-actions" style="margin-top:5px;">
        <button class="mark-reminder-read-btn" data-reminder-id="${reminder.id}" style="margin-right:8px;">Mark as Read</button>
      </div>
    `;
    notificationsList.appendChild(li);
  });

  // Add event listeners for "Mark as Read"
  document.querySelectorAll('.mark-reminder-read-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const id = btn.getAttribute('data-reminder-id');
      // Remove from localStorage
      let dueReminders = getDueRemindersFromStorage();
      dueReminders = dueReminders.filter(r => String(r.id) !== String(id));
      setDueRemindersToStorage(dueReminders);
      renderDueRemindersNotifications();
    };
  });

  updateNotificationBell(dueReminders.length);
}

// Update notification bell badge (reuse from common.js if available)
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

// Modified checkDueReminders to use popup notifications
async function checkDueReminders() {
  const { user_email } = await getCurrentUser();
  if (!user_email) return;

  const { data: reminders } = await window.supabase
    .from('reminders')
    .select('*')
    .eq('user_email', user_email);

  if (!reminders) return;

  const now = new Date();
  reminders.forEach(reminder => {
    const reminderDate = new Date(`${reminder.date}T${reminder.time || '00:00'}`);
    // If due within 1 minute and not already stored
    if (
      Math.abs(reminderDate - now) < 60000 &&
      !getDueRemindersFromStorage().some(r => r.id === reminder.id)
    ) {
      addDueReminder(reminder);
    }
  });
  renderDueRemindersNotifications();
}

// Request notification permission on load
if (window.Notification && Notification.permission !== "granted") {
  Notification.requestPermission();
}

document.addEventListener('DOMContentLoaded', () => {
  renderReminders();
  checkDueReminders();
  renderDueRemindersNotifications();
  setInterval(checkDueReminders, 60000); // Check every minute
  document.querySelector('.book-button').addEventListener('click', async () => {
    await addReminder();
    await renderReminders();
    await checkDueReminders();
    renderDueRemindersNotifications();
  });
});