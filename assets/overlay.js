/**
 * Overlay Module
 *
 * A self-contained module for PIN authentication and mobile blocking overlays.
 *
 * Usage:
 * 1. Include this script in your HTML: <script src="assets/overlay.js"></script>
 * 2. Add attributes to body element:
 *    - pin-protect="on" for PIN protection
 *    - disable-mobile="on" for mobile blocking
 *
 * The module will automatically:
 * - Inject all required HTML and CSS elements
 * - Handle PIN authentication (desktop/mobile)
 * - Block mobile access when configured
 * - Store PIN authentication in sessionStorage
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // PIN Protection
    CORRECT_PIN: '1234',
    PIN_SESSION_KEY: 'pinAuthenticated',
    PIN_INPUT_ID: 'pin-input',
    PIN_ERROR_ID: 'pin-error',
    ERROR_MESSAGE: 'Incorrect PIN. Please try again.',
    ERROR_DISPLAY_TIME: 2000,
    SHAKE_CLASS: 'shake',

    // Common
    OVERLAY_ID: 'overlay-container',
    MAIN_CONTENT_ID: 'main-content',
    LOGO_URL: 'https://nyc3.digitaloceanspaces.com/r2ware-public-html/r2ware/man/r2ware-logo.svg',

    // Mobile
    MOBILE_BREAKPOINT: 767
  };

  /**
   * Inject required CSS styles into the page
   */
  function injectStyles() {
    const styleId = 'overlay-styles';
    if (document.getElementById(styleId)) return; // Already injected

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #${CONFIG.OVERLAY_ID} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f8f9fa;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 2rem;
      }

      #${CONFIG.OVERLAY_ID} img.logo {
        width: 150px;
        margin-bottom: 2rem;
      }

      .overlay-box {
        background: white;
        padding: 3rem;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 400px;
        width: 90%;
      }

      .overlay-box h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .overlay-box p {
        color: #666;
        line-height: 1.6;
        margin: 0;
      }

      #${CONFIG.PIN_INPUT_ID} {
        width: 100%;
        padding: 1rem;
        font-size: 2rem;
        text-align: center;
        border: 2px solid #ddd;
        border-radius: 0.5rem;
        outline: none;
        letter-spacing: 1rem;
        font-family: monospace;
        transition: border-color 0.3s;
      }

      #${CONFIG.PIN_INPUT_ID}:focus {
        border-color: #667eea;
      }

      /* Remove number input arrows/spinners */
      #${CONFIG.PIN_INPUT_ID}::-webkit-outer-spin-button,
      #${CONFIG.PIN_INPUT_ID}::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      #${CONFIG.PIN_INPUT_ID}[type=number] {
        -moz-appearance: textfield;
      }

      #${CONFIG.PIN_ERROR_ID} {
        color: #dc3545;
        margin-top: 1rem;
        font-size: 0.9rem;
        min-height: 1.5rem;
      }

      #${CONFIG.PIN_INPUT_ID}.${CONFIG.SHAKE_CLASS} {
        animation: shake 0.5s;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }

      #${CONFIG.MAIN_CONTENT_ID} {
        display: none;
      }

      body.overlay-authenticated #${CONFIG.OVERLAY_ID} {
        display: none;
      }

      body.overlay-authenticated #${CONFIG.MAIN_CONTENT_ID} {
        display: block;
      }

      /* Mobile-specific: hide overlay on desktop if mobile-only */
      @media (min-width: ${CONFIG.MOBILE_BREAKPOINT + 1}px) {
        body[disable-mobile="on"]:not([pin-protect="on"]) #${CONFIG.OVERLAY_ID} {
          display: none !important;
        }

        body[disable-mobile="on"]:not([pin-protect="on"]) #${CONFIG.MAIN_CONTENT_ID} {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get the appropriate overlay content based on context
   */
  function getOverlayContent() {
    const isPinProtect = document.body.getAttribute('pin-protect') === 'on';
    const isDisableMobile = document.body.getAttribute('disable-mobile') === 'on';
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

    // PIN protection takes precedence
    if (isPinProtect) {
      return `
        <div class="overlay-box">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-lock-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"/>
            </svg>
            <span>Enter PIN</span>
          </h2>
          <input
            type="number"
            id="${CONFIG.PIN_INPUT_ID}"
            maxlength="4"
            placeholder="••••"
            inputmode="numeric"
            pattern="[0-9]*"
          />
          <div id="${CONFIG.PIN_ERROR_ID}"></div>
        </div>
      `;
    }

    // Mobile blocking (only shown on mobile viewports)
    if (isDisableMobile && isMobile) {
      return `
        <div class="overlay-box">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
            </svg>
            <span>Mobile Not Supported</span>
          </h2>
          <p>This site is in active development and not optimized for mobile <em>yet</em>. Please review in a desktop browser.</p>
        </div>
      `;
    }

    return null;
  }

  /**
   * Create and inject overlay HTML into the page
   */
  function injectHTML() {
    if (document.getElementById(CONFIG.OVERLAY_ID)) return; // Already exists

    const content = getOverlayContent();
    if (!content) return; // No overlay needed

    // Wrap existing body content in main-content div
    const mainContent = document.createElement('div');
    mainContent.id = CONFIG.MAIN_CONTENT_ID;

    // Move all body children into main-content
    while (document.body.firstChild) {
      mainContent.appendChild(document.body.firstChild);
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = CONFIG.OVERLAY_ID;
    overlay.innerHTML = `
      <img src="${CONFIG.LOGO_URL}" alt="Logo" class="logo" />
      ${content}
    `;

    // Add elements to body
    document.body.appendChild(overlay);
    document.body.appendChild(mainContent);
  }

  /**
   * Check if user is already authenticated in this session
   * @returns {boolean}
   */
  function isAuthenticated() {
    return sessionStorage.getItem(CONFIG.PIN_SESSION_KEY) === 'true';
  }

  /**
   * Set authentication status
   */
  function setAuthenticated() {
    sessionStorage.setItem(CONFIG.PIN_SESSION_KEY, 'true');
  }

  /**
   * Show main content and hide overlay
   */
  function showMainContent() {
    document.body.classList.add('overlay-authenticated');
  }

  /**
   * Display error message and shake animation
   * @param {HTMLElement} pinInput - The PIN input element
   * @param {HTMLElement} pinError - The error message element
   */
  function showError(pinInput, pinError) {
    if (pinError) {
      pinError.textContent = CONFIG.ERROR_MESSAGE;
    }
    pinInput.value = '';
    pinInput.classList.add(CONFIG.SHAKE_CLASS);

    setTimeout(() => {
      pinInput.classList.remove(CONFIG.SHAKE_CLASS);
      if (pinError) {
        pinError.textContent = '';
      }
    }, CONFIG.ERROR_DISPLAY_TIME);
  }

  /**
   * Validate PIN and authenticate user
   * @param {string} pin - The entered PIN
   * @param {HTMLElement} pinInput - The PIN input element
   * @param {HTMLElement} pinError - The error message element
   */
  function validatePin(pin, pinInput, pinError) {
    if (pin === CONFIG.CORRECT_PIN) {
      setAuthenticated();
      showMainContent();
    } else {
      showError(pinInput, pinError);
    }
  }

  /**
   * Setup PIN input event listeners
   * @param {HTMLElement} pinInput - The PIN input element
   * @param {HTMLElement} pinError - The error message element
   */
  function setupEventListeners(pinInput, pinError) {
    // Auto-submit when 4 digits are entered
    pinInput.addEventListener('input', function() {
      if (this.value.length === 4) {
        validatePin(this.value, pinInput, pinError);
      }
    });

    // Also allow Enter key submission
    pinInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.length === 4) {
        validatePin(this.value, pinInput, pinError);
      }
    });
  }

  /**
   * Initialize PIN authentication
   */
  function initPinAuth() {
    // Check if already authenticated
    if (isAuthenticated()) {
      showMainContent();
      return;
    }

    // Get required elements (they should now exist after injection)
    const pinInput = document.getElementById(CONFIG.PIN_INPUT_ID);
    const pinError = document.getElementById(CONFIG.PIN_ERROR_ID);

    if (!pinInput) return; // Not a PIN overlay

    // Focus on input
    setTimeout(() => pinInput.focus(), 100);

    // Setup event listeners
    setupEventListeners(pinInput, pinError);
  }

  /**
   * Initialize overlay system
   */
  function initOverlay() {
    const isPinProtect = document.body.getAttribute('pin-protect') === 'on';
    const isDisableMobile = document.body.getAttribute('disable-mobile') === 'on';
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

    // Determine if we need to show any overlay
    const needsOverlay = isPinProtect || (isDisableMobile && isMobile);

    if (!needsOverlay) return;

    // Inject styles and HTML elements
    injectStyles();
    injectHTML();

    // If PIN protection is enabled, initialize PIN auth
    if (isPinProtect) {
      initPinAuth();
    }
  }

  /**
   * Public API
   */
  window.Overlay = {
    /**
     * Initialize the overlay system
     */
    init: initOverlay,

    /**
     * Configure PIN settings
     * @param {Object} options - Configuration options
     * @param {string} options.pin - The correct PIN
     * @param {string} options.errorMessage - Custom error message
     * @param {number} options.errorDisplayTime - How long to show error (ms)
     */
    configure: function(options) {
      if (options.pin) CONFIG.CORRECT_PIN = options.pin;
      if (options.errorMessage) CONFIG.ERROR_MESSAGE = options.errorMessage;
      if (options.errorDisplayTime) CONFIG.ERROR_DISPLAY_TIME = options.errorDisplayTime;
    },

    /**
     * Manually clear authentication (logout)
     */
    logout: function() {
      sessionStorage.removeItem(CONFIG.PIN_SESSION_KEY);
      location.reload();
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: isAuthenticated,

    /**
     * Check if current viewport is mobile
     * @returns {boolean}
     */
    isMobile: function() {
      return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    }
  };

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverlay);
  } else {
    // DOM is already loaded
    initOverlay();
  }

})();
