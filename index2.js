/**
     * fillOTP: Sets the OTP value to the provided input element.
     * @param {HTMLInputElement} input - The OTP input element.
     * @param {string} code - The OTP code to fill.
     */
function fillOTP(input, code) {
  input.value = code;
  console.log('OTP code filled:', code);
}

/**
 * pollClipboardForOTP: Returns a promise that periodically reads the clipboard
 * until it finds an OTP (a numeric string with expected length) or times out.
 * @param {Object} options - Options for polling.
 * @param {number} options.interval - How frequently (ms) to poll the clipboard.
 * @param {number} options.timeout - Total time (ms) before giving up.
 * @param {number} options.codeLength - Expected length of the OTP.
 * @returns {Promise<string>} - Resolves with the OTP code.
 */
function pollClipboardForOTP({ interval = 1000, timeout = 30000, codeLength = 6 } = {}) {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    const poller = setInterval(async () => {
      elapsed += interval;
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          const trimmed = text.trim();
          // Very simple check: if the trimmed text is numeric and of expected length, consider it the OTP.
          if (/^\d+$/.test(trimmed) && trimmed.length === codeLength) {
            clearInterval(poller);
            resolve(trimmed);
          }
        }
      } catch (error) {
        console.error('Error reading clipboard:', error);
        // Optionally, clear the interval if there's a problem
        clearInterval(poller);
        reject(error);
      }
      if (elapsed >= timeout) {
        clearInterval(poller);
        reject(new Error('OTP not found in clipboard within timeout'));
      }
    }, interval);
  });
}

// Attach event listener to the button to start polling.
document.getElementById('start-clipboard').addEventListener('click', () => {
  const otpInput = document.querySelector('input[autocomplete="one-time-code"]');
  // Start polling the clipboard
  pollClipboardForOTP({ interval: 1000, timeout: 30000, codeLength: 6 })
    .then(code => {
      fillOTP(otpInput, code);
      // Optionally, auto-submit the form:
      const form = otpInput.closest('form');
      if (form) form.submit();
    })
    .catch(err => {
      console.error(err);
      alert('Could not retrieve OTP from clipboard.');
    });
});

// Inform user that a click is needed.
window.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded. Click "Start OTP Clipboard Polling" to begin.');
});