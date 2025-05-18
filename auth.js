// --- Registration Handler ---
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('Registration form submitted');

  // Use optional chaining and fallback values
  const first_name = this.querySelector('input[name="first_name"]')?.value || "";
  const last_name = this.querySelector('input[name="last_name"]')?.value || "";
  const email = this.querySelector('input[type="email"]')?.value || "";
  const password = this.querySelector('input[type="password"]')?.value || "";
  const phone = this.querySelector('input[type="tel"]')?.value || "";
  const role = document.getElementById('formRoleSelector')?.value || "";

  console.log('Form data collected:', { first_name, last_name, email, phone, role });

  // Patient fields
  const address = this.querySelector('input[name="address"]')?.value || null;
  const gender = this.querySelector('#patientFields select')?.value || null;
  const dob = this.querySelector('#patientFields input[type="date"]')?.value || null;

  // Doctor fields (FIX: use 'this' instead of 'document')
  const specialization = this.querySelector('#doctorFields input[placeholder="Specialization"]')?.value || null;
  const years_experience = this.querySelector('#doctorFields input[type="number"]')?.value || null;
  const clinic_name = this.querySelector('#doctorFields input[placeholder="Clinic/Hospital Name"]')?.value || null;
  const work_hours = this.querySelector('#doctorFields input[placeholder="Work Hours & Availability"]')?.value || null;

  try {
    // 1. Register with Supabase Auth
    console.log('Attempting to register with Supabase Auth...');
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert('Registration error: ' + error.message);
      return;
    }

    const userId = data.user?.id || data.session?.user?.id;

    if (userId) {
      // Insert profile as before
      const profileData = {
        id: userId,
        email,
        first_name,
        last_name,
        phone,
        role,
        address: role === 'patient' ? address : null,
        gender: role === 'patient' ? gender : null,
        dob: role === 'patient' ? dob : null,
        specialization: role === 'doctor' ? specialization : null,
        years_experience: role === 'doctor' ? years_experience : null,
        clinic_name: role === 'doctor' ? clinic_name : null,
        work_hours: role === 'doctor' ? work_hours : null
      };
      console.log('Inserting profile with id:', userId);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });
      if (profileError) {
        alert('Profile creation error: ' + profileError.message);
        return;
      }
    }

    // Registration successful, show login modal or redirect
    alert('Registration successful! Please log in.');
    // If you use a modal:
    document.getElementById('loginModal').style.display = 'block';
    // Optionally, hide the registration modal if you have one:
    document.getElementById('registerModal')?.style.display = 'none';
    // Or, to redirect to a login page:
    // window.location.href = '/login.html';

  } catch (err) {
    alert('An unexpected error occurred: ' + err.message);
  }
});

// --- Login Handler ---
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('Login form submitted');
  
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;
  
  console.log('Attempting to sign in with email:', email);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) { 
      console.error('Login error:', error);
      alert('Login error: ' + error.message); 
      return; 
    }
    
    console.log('Login successful:', data);

    // Fetch profile and redirect based on role
    const user = data.user;
    if (user) {
      console.log('Fetching user profile for ID:', user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profileError) { 
        console.error('Profile fetch error:', profileError);
        alert('Error accessing your profile: ' + profileError.message); 
        return; 
      }
      
      console.log('User profile:', profile);
      console.log('Redirecting based on role:', profile.role);

      if (profile.role === 'doctor') {
        window.location.href = '/doctors/appointments.html';
      } else if (profile.role === 'patient') {
        window.location.href = '/patients/appointments/appointment.html';
      } else {
        alert('Unknown role!');
      }
    } else {
      console.warn('No user object after successful login');
      alert('Login successful but no user data found. Please try again.');
    }
  } catch (err) {
    console.error('Unexpected error during login:', err);
    alert('An unexpected error occurred: ' + err.message);
  }
});

// --- Modal Logic (runs once on page load, not inside any handler) ---
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM fully loaded');
  
  const loginModal = document.getElementById('loginModal');
  const loginLink = document.querySelector('.login-link');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const closeModal = document.getElementById('closeModal');
  const closeModalLogin = document.getElementById('closeModalLogin');
  const roleSelector = document.getElementById('formRoleSelector');
  const patientFields = document.getElementById('patientFields');
  const doctorFields = document.getElementById('doctorFields');
  
  console.log('Elements found:', {
    loginModal: !!loginModal,
    loginLink: !!loginLink,
    registerForm: !!registerForm,
    loginForm: !!loginForm,
    showRegister: !!showRegister,
    showLogin: !!showLogin,
    roleSelector: !!roleSelector,
    patientFields: !!patientFields,
    doctorFields: !!doctorFields
  });

  // Check if user is already logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('User is already logged in:', session.user.id);
      
      // Get user role and redirect
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          
          if (profile) {
            console.log('User role:', profile.role);
            if (profile.role === 'doctor') {
              window.location.href = '/doctors/appointments.html';
            } else if (profile.role === 'patient') {
              window.location.href = '/patients/appointments/appointment.html';
            }
          }
        });
    } else {
      console.log('No active session found');
    }
  });

  // Show login modal when Login link is clicked
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Login link clicked');
      if (loginModal) loginModal.style.display = 'flex';
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    });
  }

  // Switch to Register
  if (showRegister) {
    showRegister.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Show register clicked');
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      // Reset role selector and hide custom fields
      if (roleSelector) roleSelector.value = "";
      if (patientFields) patientFields.style.display = 'none';
      if (doctorFields) doctorFields.style.display = 'none';
    });
  }

  // Switch to Login
  if (showLogin) {
    showLogin.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Show login clicked');
      if (registerForm) registerForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'block';
    });
  }

  // Close modal (Register)
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      console.log('Close modal (register) clicked');
      if (loginModal) loginModal.style.display = 'none';
    });
  }
  // Close modal (Login)
  if (closeModalLogin) {
    closeModalLogin.addEventListener('click', function() {
      console.log('Close modal (login) clicked');
      if (loginModal) loginModal.style.display = 'none';
    });
  }

  // Optional: Close modal when clicking outside modal-content
  window.onclick = function(event) {
    if (event.target === loginModal) {
      console.log('Clicked outside modal');
      loginModal.style.display = 'none';
    }
  };

  // Show/hide extra fields based on role
  if (roleSelector) {
    roleSelector.addEventListener('change', function() {
      console.log('Role selector changed to:', roleSelector.value);
      if (roleSelector.value === 'patient') {
        if (patientFields) patientFields.style.display = 'block';
        if (doctorFields) doctorFields.style.display = 'none';
      } else if (roleSelector.value === 'doctor') {
        if (patientFields) patientFields.style.display = 'none';
        if (doctorFields) doctorFields.style.display = 'block';
      } else {
        if (patientFields) patientFields.style.display = 'none';
        if (doctorFields) doctorFields.style.display = 'none';
      }
    });
  }

  // --- Auto-login after email confirmation ---
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const type = urlParams.get('type');

  if (accessToken && type === 'signup') {
    // Set the session using the access token
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: urlParams.get('refresh_token') || ''
    });
    // Redirect to home page
    window.location.href = '/home.html'; // or '/' if your home page is index.html
    return;
  }

});