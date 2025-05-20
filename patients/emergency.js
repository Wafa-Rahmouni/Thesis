document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const popup = document.getElementById('video-call-popup');
  const openBtn = document.getElementById('open-video-call-popup');
  const closeBtn = document.getElementById('close-video-call-popup');
  const form = document.getElementById('video-call-form');
  const doctorSelect = document.getElementById('doctor-select');
  const callTypeInput = document.getElementById('call-type');
  const scheduleFields = document.getElementById('schedule-fields');
  const callDate = document.getElementById('call-date');
  const callTime = document.getElementById('call-time');

  // Set min date for scheduling
  if (callDate) {
    const today = new Date().toISOString().split('T')[0];
    callDate.min = today;
  }

  // Open popup
  openBtn.addEventListener('click', () => {
    popup.style.display = 'block';
    callTypeInput.value = 'emergency'; // default to emergency
    scheduleFields.style.display = 'none'; // hide schedule fields for emergency
    form.reset();
    populateDoctors();
  });

  // Close popup
  closeBtn.addEventListener('click', () => popup.style.display = 'none');
  window.onclick = e => { if (e.target === popup) popup.style.display = 'none'; };

  // Populate doctor dropdown
  async function populateDoctors() {
    doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
    const { data: doctors, error } = await window.supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'doctor');
    if (error) return;
    doctors.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${doc.first_name || ''} ${doc.last_name || ''}`.trim();
      doctorSelect.appendChild(opt);
    });
  }

// Always default to emergency (urgent) call
doctorSelect.addEventListener('change', () => {
  callTypeInput.value = 'emergency';
  scheduleFields.style.display = 'none';
});

  let peerConnection;
  let signalingChannel;
  const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  function openVideoCallModal(callId) {
    const modal = document.getElementById('video-call-modal');
    modal.style.display = 'block';
    startVideoCall(callId);
  }

  function closeVideoCallModal() {
    document.getElementById('video-call-modal').style.display = 'none';
    const localVideo = document.getElementById('localVideo');
    if (localVideo && localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (signalingChannel) {
      signalingChannel.unsubscribe();
      signalingChannel = null;
    }
  }

  document.getElementById('close-video-call-modal').onclick = closeVideoCallModal;

  function startVideoCall(callId) {
    const callStatus = document.getElementById('call-status');
    callStatus.textContent = 'Waiting for doctor to join...';

    // Join the same signaling channel as the doctor
    signalingChannel = window.supabase.channel(`call_${callId}`);

    signalingChannel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      handleSignalingData(payload);
    }).subscribe();

    // Start WebRTC as the caller (patient)
    startWebRTC(true);

    // Notify doctor that patient is ready
    signalingChannel.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type: 'patient-joined' }
    });
  }

  async function startWebRTC(isCaller) {
    peerConnection = new RTCPeerConnection(config);

    // Local video
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('localVideo').srcObject = localStream;
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Remote video
    peerConnection.ontrack = (event) => {
      document.getElementById('remoteVideo').srcObject = event.streams[0];
    };

    // ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'candidate', data: event.candidate });
      }
    };

    // If patient is the caller, create offer when doctor is ready
    // (see handleSignalingData)
  }

  function sendSignal(data) {
    signalingChannel.send({
      type: 'broadcast',
      event: 'signal',
      payload: data
    });
  }

  async function handleSignalingData({ type, data }) {
    if (!peerConnection) await startWebRTC(false);

    if (type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      sendSignal({ type: 'answer', data: answer });
    } else if (type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === 'candidate') {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    } else if (type === 'doctor-joined') {
      // Doctor is ready, patient creates offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendSignal({ type: 'offer', data: offer });
    }
  }

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const doctorId = doctorSelect.value;
    const reason = document.getElementById('call-reason').value.trim();
    const type = callTypeInput.value;

    if (!doctorId || !reason) {
      alert('Please fill in all required fields.');
      return;
    }

    // Get current patient user
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in.');
      return;
    }

    // Create emergency call record
    let callData = {
      patient_id: user.id,
      doctor_id: doctorId,
      reason,
      type,
      status: 'active',
      started_at: new Date().toISOString()
    };

    const { data, error } = await window.supabase
      .from('emergency_calls')
      .insert([callData])
      .select()
      .single();

    if (error) {
      alert('Failed to start video call.');
      return;
    }

    // Open the video call modal and start local video
    openVideoCallModal(data.id);
  });
});