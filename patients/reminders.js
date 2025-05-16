async function getCurrentUser() {
  if (window.supabase && supabase.auth && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
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

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_email', user_email)
    .order('date', { ascending: true });

  if (error || !reminders || reminders.length === 0) {
    remindersList.innerHTML = '<p>No upcoming reminders.</p>';
    return;
  }

  remindersList.innerHTML = reminders.map(reminder => `
    <div class="consultation-card">
      <div>
        <h3>${reminder.title}</h3>
        <p>${new Date(reminder.date).toLocaleDateString()}${reminder.time ? ' - ' + reminder.time : ''}</p>
      </div>
      <div class="status status-upcoming">Upcoming</div>
    </div>
  `).join('');
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
  const { error } = await supabase
    .from('reminders')
    .insert([{ user_id, user_email, title, date, time }]);
  if (error) {
    alert('Failed to add reminder.');
    return;
  }
  if (typeof logHistory === 'function') {
    logHistory('reminder_set', { title, date, time });
  }
  await renderReminders();
}

document.addEventListener('DOMContentLoaded', () => {
  renderReminders();
  document.querySelector('.book-button').addEventListener('click', addReminder);
});