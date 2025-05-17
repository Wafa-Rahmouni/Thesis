// messaging.js (fully fixed and rewritten)

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

    console.log('Looking for recipient:', recipientInput);

    // Email match (case-insensitive)
    let { data: emailProfile, error: emailError } = await window.supabase
      .from('profiles')
      .select('id, first_name, last_name, email, profile_picture_url')
      .ilike('email', recipientInput.toLowerCase())
      .maybeSingle();

    console.log('Email profile result:', emailProfile, emailError);

    let recipientProfile = emailProfile;

    if (!recipientProfile) {
      const { data: nameMatches, error: nameError } = await window.supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_picture_url')
        .or(`first_name.ilike.%${recipientInput}%,last_name.ilike.%${recipientInput}%`)
        .limit(2);

      console.log('Name matches result:', nameMatches, nameError);

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

    await window.supabase.from('messages').insert([{
      user_id: user.id,
      recipient_id: recipientProfile.id,
      patient_name: recipientName,
      subject: subject,
      content: reply,
      date: new Date().toISOString(),
      status: 'Unread'
    }]);

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

async function loadConversation(chat) {
  const { data: { user } } = await window.supabase.auth.getUser();
  const { data: convoMsgs } = await window.supabase
    .from('messages')
    .select('*')
    .or(`and(user_id.eq.${user.id},recipient_id.eq.${chat.recipient_id}),and(user_id.eq.${chat.recipient_id},recipient_id.eq.${user.id})`)
    .order('date', { ascending: true });

  const unreadIds = (convoMsgs || []).filter(msg => msg.user_id !== user.id && msg.status === 'Unread').map(msg => msg.id);
  if (unreadIds.length > 0) {
    await window.supabase.from('messages').update({ status: 'Read' }).in('id', unreadIds);
    if (window.reloadMessages) window.reloadMessages();
  }

  const chatBody = document.getElementById("chat-conversation-body");
  chatBody.innerHTML = "";
  chatBody.style.display = "flex";
  chatBody.style.flexDirection = "column";
  chatBody.style.gap = "5px";
  chatBody.style.overflowY = "auto";
  chatBody.style.maxHeight = "400px";
  chatBody.style.padding = "10px";

  (convoMsgs || []).forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (msg.user_id === user.id ? 'chat-bubble-right' : 'chat-bubble-left');
    bubble.style.maxWidth = '70%';
    bubble.style.padding = '10px 15px';
    bubble.style.margin = '5px 10px';
    bubble.style.borderRadius = '20px';
    bubble.style.display = 'inline-block';
    bubble.style.position = 'relative';
    bubble.style.fontSize = '14px';
    bubble.style.lineHeight = '1.4';
    bubble.style.wordWrap = 'break-word';

    if (msg.user_id === user.id) {
      // Sender (right bubble)
      bubble.style.backgroundColor = '#007bff';
      bubble.style.color = '#fff';
      bubble.style.borderBottomRightRadius = '0';
      bubble.style.marginLeft = 'auto';
      bubble.style.marginRight = '10px';
    } else {
      // Recipient (left bubble)
      bubble.style.backgroundColor = '#e5e5ea';
      bubble.style.color = '#000';
      bubble.style.borderBottomLeftRadius = '0';
      bubble.style.marginRight = 'auto';
      bubble.style.marginLeft = '10px';
    }

    bubble.innerHTML = `
      <div>${msg.content}</div>
      <div style="font-size:11px; color:#aaa; margin-top:4px;">
        ${msg.user_id === user.id ? 'You' : chat.recipient_name} • 
        ${new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        ${msg.user_id === user.id ? `<span style="margin-left:8px; font-size:11px; color:${msg.status === 'Read' ? '#38DB7C' : '#888'}">${msg.status}</span>` : ''}
      </div>`;

    chatBody.appendChild(bubble);
  });

  chatBody.scrollTop = chatBody.scrollHeight;
}


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

      await loadConversation(currentChat);
    };
  });
}

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
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${msg.id}</td>
      <td>${msg.patient_name}</td>
      <td>${msg.subject}</td>
      <td>${msg.date ? new Date(msg.date).toLocaleDateString() : ''}</td>
      <td style="color:${msg.status === 'Unread' ? '#e53935' : '#38DB7C'};font-weight:600;">${msg.status}</td>
      <td><button data-message-id="${msg.id}">View</button></td>`;
    tableBody.appendChild(tr);
  });
  attachViewHandlers(data);
}

window.reloadMessages = loadMessages;
document.addEventListener('DOMContentLoaded', loadMessages);

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
