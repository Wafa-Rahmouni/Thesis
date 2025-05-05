document.addEventListener('DOMContentLoaded', () => {

  // Function to handle image loading with fallbacks
  function loadImageWithFallback(imageElement, imageUrl, fallbackContent) {
    const img = new Image();

    img.onload = () => {
      imageElement.innerHTML = ''; // Clear previous content
      imageElement.appendChild(img); // Append the loaded image
    };

    img.onerror = () => {
      imageElement.innerHTML = fallbackContent; // Show fallback content if image fails
    };

    img.src = imageUrl;
    img.alt = 'SanteNet';
    img.style.width = '100%';  // Ensure it fills the container's width
    img.style.height = '100%'; // Ensure it fills the container's height
    img.style.objectFit = 'contain'; // Maintain aspect ratio
  }

  // Function to handle profile picture upload and preview
  function previewProfileImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const profileImg = document.getElementById('profile-img');
        if (profileImg) {
          profileImg.src = e.target.result; // Set the profile image to the uploaded file
        }
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  // Load the logo image with fallback content
  const logoContainer = document.getElementById('logo-img');
  loadImageWithFallback(
    logoContainer,
    '/images/logo-removebg-preview.png', // Image source for the logo
    '<div class="fallback-logo"><span style="color: #10b981; font-weight: bold;">S</span></div>' // Fallback content
  );

  // Load additional main images with fallbacks
  const mainImage1 = document.getElementById('main-image-1');
  loadImageWithFallback(
    mainImage1,
    'images/logo-removebg-preview.png', // Source for main image 1
    '<div class="image-error-placeholder"><i class="fas fa-tooth"></i><p>Dental Health Illustration</p></div>' // Fallback content for image 1
  );

  const mainImage2 = document.getElementById('main-image-2');
  loadImageWithFallback(
    mainImage2,
    '', // Empty source forces fallback
    '<div class="image-error-placeholder"><i class="fas fa-notes-medical"></i><p>Dental Care Illustration</p></div>' // Fallback content for image 2
  );

  // Handling the preloader display
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content');

  setTimeout(() => {
    preloader.style.opacity = '0'; // Fade out the preloader
    setTimeout(() => {
      preloader.style.display = 'none'; // Hide the preloader completely
      mainContent.style.display = 'block'; // Display the main content
    }, 500); // Delay before hiding preloader
  }, 800); // Initial delay before fade-out starts

  // Add event listener to the profile image input
  const profileImageInput = document.getElementById('profile-image-input');
  if (profileImageInput) {
    profileImageInput.addEventListener('change', previewProfileImage); // Listen for file changes
  }

  // Get the navigation bar element
  const navbar = document.querySelector('header');
  let lastScrollTop = 0; // Variable to store the last scroll position

  // Function to hide/show the navbar on scroll
  function handleScroll() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // If user is scrolling down and has scrolled more than the navbar height, hide the navbar
    if (currentScroll > lastScrollTop && currentScroll > navbar.offsetHeight) {
      navbar.style.transform = 'translateY(-100%)'; // Move navbar up (hide it)
    } 
    // If user is scrolling up, show the navbar
    else if (currentScroll < lastScrollTop) {
      navbar.style.transform = 'translateY(0)'; // Move navbar down (show it)
    }

    // Update last scroll position
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  // Add the scroll event listener
  window.addEventListener('scroll', handleScroll);

});
