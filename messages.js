let currentChat = null;
let isNewMessage = true;

// Open popup for new message
document.getElementById('open-new-message').onclick = function () {
  isNewMessage = true;
  currentChat = null;
  document.getElementById('chat-fields').style.display = 'flex';
  document.getElementById('chat-recipient').value = '';
  document.getElementById('chat-subject').value = '';
  document.getElementById('chat-recipient').disabled = false;
  document.getElementById('chat-subject').disabled = false;
  document.getElementById('recipient-pic').src = './images/unknown.png';
  document.getElementById('recipient-name').innerText = '';
  document.getElementById('recipient-status').innerText = '';
  document.getElementById('chat-conversation-body').innerHTML = '';
  document.getElementById('chat-reply').value = '';
  document.getElementById('chat-modal').style.display = 'flex';
};

// Close popup
document.getElementById('close-chat-btn').onclick = function () {
  document.getElementById('chat-modal').style.display = 'none';
};

// Send or reply
document.getElementById('chat-send-btn').onclick = async function () {
  const reply = document.getElementById('chat-reply').value.trim();
  if (!reply) return;

  const { data: { user } } = await window.supabase.auth.getUser();

  if (isNewMessage) {
    const recipientInput = document.getElementById('chat-recipient').value.trim();
    const subject = document.getElementById('chat-subject').value.trim();
    if (!recipientInput || !subject) {
      alert('Please fill in recipient and subject.');
      return;
    }

    // Try to find recipient by email
    let { data: emailProfile } = await window.supabase
      .from('profiles')
      .select('id, first_name, last_name, email, profile_picture_url')
      .ilike('email', recipientInput.toLowerCase())
      .maybeSingle();

    let recipientProfile = emailProfile;

    // If not found by email, try by name
    if (!recipientProfile) {
      const { data: nameMatches } = await window.supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_picture_url')
        .or(`first_name.ilike.%${recipientInput}%,last_name.ilike.%${recipientInput}%`)
        .limit(2);

      if (nameMatches && nameMatches.length === 1) {
        recipientProfile = nameMatches[0];
      } else if (nameMatches && nameMatches.length > 1) {
        alert('Multiple recipients found. Please be more specific or use email.');
        return;
      }
    }

    if (!recipientProfile) {
      alert('Recipient not found.');
      return;
    }

    const recipientName = `${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim() || recipientProfile.email;

    // After inserting a new message (new or reply)
    const { data: insertedMessage, error: msgError } = await window.supabase
      .from('messages')
      .insert([{
        user_id: user.id,
        recipient_id: recipientProfile ? recipientProfile.id : currentChat.recipient_id,
        patient_name: recipientName || currentChat.recipient_name,
        subject: subject || currentChat.subject,
        content: reply,
        date: new Date().toISOString(),
        status: 'Unread'
      }])
      .select();

    if (!msgError && insertedMessage && insertedMessage[0]) {
      await window.supabase.from('notifications').insert([{
        user_id: recipientProfile ? recipientProfile.id : currentChat.recipient_id,
        type: 'message',
        title: 'New Message',
        content: reply.length > 60 ? reply.slice(0, 60) + '...' : reply,
        is_read: false,
        created_at: new Date().toISOString(),
        message_id: insertedMessage[0].id // link to the message
      }]);
    }

    isNewMessage = false;
    currentChat = {
      recipient_id: recipientProfile.id,
      subject,
      recipient_email: recipientProfile.email,
      recipient_pic: recipientProfile.profile_picture_url || './images/unknown.png',
      recipient_name: recipientName
    };

    document.getElementById('chat-fields').style.display = 'none';
    document.getElementById('chat-recipient').disabled = true;
    document.getElementById('chat-subject').disabled = true;
    document.getElementById('recipient-pic').src = currentChat.recipient_pic;
    document.getElementById('recipient-name').innerText = currentChat.recipient_name;
    document.getElementById('recipient-status').innerText = 'Active now';
    document.getElementById('chat-reply').value = '';
    await loadConversation(currentChat);
    if (window.reloadMessages) window.reloadMessages();
    return;
  }

  // Reply mode
  if (currentChat) {
    await window.supabase.from('messages').insert([{
      user_id: user.id,
      recipient_id: currentChat.recipient_id,
      patient_name: currentChat.recipient_name,
      subject: currentChat.subject,
      content: reply,
      date: new Date().toISOString(),
      status: 'Unread'
    }]);

    document.getElementById('chat-reply').value = '';
    await loadConversation(currentChat);
    if (window.reloadMessages) window.reloadMessages();
  }
};

// Load conversation and render chat bubbles
async function loadConversation(chat) {
  const { data: { user } } = await window.supabase.auth.getUser();
  const { data: convoMsgs } = await window.supabase
    .from('messages')
    .select('*')
    .or(`and(user_id.eq.${user.id},recipient_id.eq.${chat.recipient_id}),and(user_id.eq.${chat.recipient_id},recipient_id.eq.${user.id})`)
    .order('date', { ascending: true });

  const chatBody = document.getElementById("chat-conversation-body");
  chatBody.innerHTML = "";

  (convoMsgs || []).forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (msg.user_id === user.id ? 'chat-bubble-right' : 'chat-bubble-left');
    bubble.innerHTML = `
      <div>${msg.content}</div>
      <div class="chat-bubble-meta">
        ${msg.user_id === user.id ? 'You' : chat.recipient_name} • 
        ${new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        ${
          // Only show status if I am the sender
          msg.user_id === user.id
            ? `<span style="margin-left:8px; font-size:11px; color:${msg.status === 'Read' ? '#38DB7C' : '#e53935'}">${msg.status}</span>`
            : ''
        }
      </div>`;
    chatBody.appendChild(bubble);
  });

  chatBody.scrollTop = chatBody.scrollHeight;
}
// Attach handlers to "View" buttons and mark unread as read before loading conversation
function attachViewHandlers(data) {
  document.querySelectorAll('button[data-message-id]').forEach(btn => {
    btn.onclick = async function () {
      const messageId = btn.getAttribute('data-message-id');
      const message = data.find(m => m.id == messageId);
      if (!message) return;

      const { data: { user } } = await window.supabase.auth.getUser();
      const otherUserId = message.user_id === user.id ? message.recipient_id : message.user_id;

      const { data: recipientProfile } = await window.supabase
        .from('profiles')
        .select('first_name, last_name, profile_picture_url, email')
        .eq('id', otherUserId)
        .single();

      const recipientName = `${recipientProfile?.first_name || ''} ${recipientProfile?.last_name || ''}`.trim() || recipientProfile?.email;

      currentChat = {
        recipient_id: otherUserId,
        subject: message.subject,
        recipient_email: recipientProfile?.email || '',
        recipient_pic: recipientProfile?.profile_picture_url || './images/unknown.png',
        recipient_name: recipientName
      };

      isNewMessage = false;
      document.getElementById('chat-fields').style.display = 'none';
      document.getElementById('chat-recipient').value = currentChat.recipient_email;
      document.getElementById('chat-subject').value = currentChat.subject;
      document.getElementById('chat-recipient').disabled = true;
      document.getElementById('chat-subject').disabled = true;
      document.getElementById('recipient-pic').src = currentChat.recipient_pic;
      document.getElementById('recipient-name').innerText = currentChat.recipient_name;
      document.getElementById('recipient-status').innerText = 'Active now';
      document.getElementById('chat-modal').style.display = 'flex';
      document.getElementById('chat-reply').value = '';

      // Mark all unread messages as read BEFORE loading the conversation
      const { data: unreadMsgs } = await window.supabase
        .from('messages')
        .select('id')
        .eq('recipient_id', user.id)
        .eq('status', 'Unread')
        .eq('subject', message.subject)
        .eq('user_id', otherUserId);

      if (unreadMsgs && unreadMsgs.length > 0) {
        const unreadIds = unreadMsgs.map(m => m.id);
        await window.supabase
          .from('messages')
          .update({ status: 'Read' })
          .in('id', unreadIds);
      }

      // 1. Reload the table (so status changes in the list)
      if (window.reloadMessages) await window.reloadMessages();
      // 2. Load the conversation (so status changes in the chat)
      await loadConversation(currentChat);
    };
  });
}

// Load messages table
async function loadMessages() {
  const tableBody = document.getElementById('messages-table-body');
  tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) {
    tableBody.innerHTML = `<tr><td colspan="6">Not logged in.</td></tr>`;
    return;
  }

  const { data, error } = await window.supabase
    .from('messages')
    .select('*')
    .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('date', { ascending: false });

  if (error || !data) {
    tableBody.innerHTML = `<tr><td colspan="6">Failed to load messages.</td></tr>`;
    return;
  }

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No messages found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = '';
  data.forEach(msg => {
    // Show "Sent" if I am the sender, otherwise show the real status
    const statusText = msg.user_id === user.id ? 'Sent' : msg.status;
    const statusColor = msg.user_id === user.id
      ? '#888'
      : (msg.status === 'Unread' ? '#e53935' : '#38DB7C');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${msg.id}</td>
      <td>${msg.patient_name}</td>
      <td>${msg.subject}</td>
      <td>${msg.date ? new Date(msg.date).toLocaleDateString() : ''}</td>
      <td style="color:${statusColor};font-weight:600;">${statusText}</td>
      <td><button data-message-id="${msg.id}">View</button></td>`;
    tableBody.appendChild(tr);
  });
  attachViewHandlers(data);
}

window.reloadMessages = loadMessages;
document.addEventListener('DOMContentLoaded', loadMessages);

// Recipient autocomplete
document.getElementById('chat-recipient').addEventListener('input', async function () {
  const query = this.value.trim();
  const datalist = document.getElementById('recipient-suggestions');
  datalist.innerHTML = '';
  if (query.length < 2) return;

  const { data: matches } = await window.supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone')
    .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(10);

  (matches || []).forEach(profile => {
    const option = document.createElement('option');
    option.value = profile.email;
    option.label = `${profile.first_name || ''} ${profile.last_name || ''}${profile.phone ? ' (' + profile.phone + ')' : ''}`;
    datalist.appendChild(option);
  });
});

// --- Message Notifications ---

// Fetch unread message notifications for the current user
async function fetchMessageNotifications() {
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await window.supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'message')
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  return data || [];
}

// Render message notifications in the popup (append to reminders if needed)
async function renderMessageNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (!notificationsList) return;
  // Optionally, keep reminders if you want both types
  const dueReminders = getDueRemindersFromStorage ? getDueRemindersFromStorage() : [];
  notificationsList.innerHTML = '';

  // Render reminders first (if you want both)
  if (dueReminders && dueReminders.length > 0) {
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
  }

  // Now render message notifications
  const messages = await fetchMessageNotifications();
  if (messages.length === 0 && dueReminders.length === 0) {
    notificationsList.innerHTML = '<li class="notification">No notifications.</li>';
    updateNotificationBell(0);
    return;
  }
  messages.forEach(msg => {
    const li = document.createElement('li');
    li.className = 'notification new';
    li.innerHTML = `
      <div><b>New Message</b> - <span>${msg.title || 'Message'}</span></div>
      <div>${msg.content || ''}</div>
      <span class="notification-time">${new Date(msg.created_at).toLocaleString()}</span>
      <div class="notification-actions" style="margin-top:5px;">
        <button class="mark-message-read-btn" data-notification-id="${msg.id}" style="margin-right:8px;">Mark as Read</button>
      </div>
    `;
    notificationsList.appendChild(li);
  });

  // Add event listeners for "Mark as Read" (messages)
  document.querySelectorAll('.mark-message-read-btn').forEach(btn => {
    btn.onclick = async function(e) {
      e.stopPropagation();
      const id = btn.getAttribute('data-notification-id');
      await window.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      renderMessageNotifications();
    };
  });

  // Add event listeners for "Mark as Read" (reminders)
  document.querySelectorAll('.mark-reminder-read-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const id = btn.getAttribute('data-reminder-id');
      let dueReminders = getDueRemindersFromStorage();
      dueReminders = dueReminders.filter(r => String(r.id) !== String(id));
      setDueRemindersToStorage(dueReminders);
      renderMessageNotifications();
    };
  });

  // Update bell badge
  updateNotificationBell((dueReminders.length || 0) + messages.length);
}

// Call this after sending a message, and on interval
if (typeof renderMessageNotifications === 'function') {
  setInterval(renderMessageNotifications, 60000); // every minute
  document.addEventListener('DOMContentLoaded', renderMessageNotifications);
}

// After sending a message, call renderMessageNotifications()