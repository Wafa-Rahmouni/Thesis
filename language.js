// Apply saved language preference from localStorage
function applyLanguageFromStorage() {
  const lang = localStorage.getItem('preferredLanguage');
  if (lang) {
    // Set proper cookie for Google Translate
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    
    // Hide Google Translate widget UI
    hideTranslateBar();
  }
}

// Hide the Google Translate bar
function hideTranslateBar() {
  // Add CSS to hide the Google Translate bar
  const style = document.createElement('style');
  style.textContent = `
    .goog-te-banner-frame, 
    .skiptranslate,
    .goog-te-gadget {
      display: none !important;
    }
    body {
      top: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

// Initialize Google Translate element if not present
function initTranslateElement() {
  if (!document.getElementById('google_translate_element')) {
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    translateDiv.style.display = 'none';
    document.body.appendChild(translateDiv);
    
    if (typeof googleTranslateElementInit !== 'function') {
      window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,fr,ar',
          autoDisplay: false,
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      };
    }
    
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(scriptElement);
  }
}

// Switch language via language popup
function switchLanguage(lang) {
  // Save to localStorage
  localStorage.setItem('preferredLanguage', lang);
  
  // Set cookie for Google Translate
  document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
  
  // Hide any popup that might be open
  const popups = document.querySelectorAll('.popup, #language-popup');
  popups.forEach(popup => {
    popup.style.display = 'none';
  });

  // Hide the Google Translate bar if it appears
  hideTranslateBar();
  
  // Reload the page to apply the new language
  location.reload();
}

// Make switchLanguage available globally
window.switchLanguage = switchLanguage;

// Apply language when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  initTranslateElement();
  setTimeout(applyLanguageFromStorage, 500);
  setTimeout(hideTranslateBar, 1000);
  setTimeout(hideTranslateBar, 2000); // Extra attempt
});

// Add additional CSS to ensure the bar stays hidden
window.addEventListener('load', function() {
  hideTranslateBar();
});