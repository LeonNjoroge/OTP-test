 /**
     * Fills the provided input field with the OTP code.
     * @param {HTMLInputElement} input - The OTP input element.
     * @param {string} code - The OTP code to fill.
     */
 function fillOTP(input, code) {
  input.value = code;
  console.log('OTP code filled:', code);
}

/**
 * Reads text from the clipboard using the Clipboard API.
 * @returns {Promise<string|null>} - Resolves with the trimmed text if available.
 */
async function readClipboardOTP() {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return text.trim();
    } else {
      console.warn('Clipboard API not available.');
      return null;
    }
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    return null;
  }
}

/**
 * Polls the clipboard for an OTP code until found or until timeout.
 * @param {Object} options - Polling options.
 * @param {number} options.interval - Polling interval in ms.
 * @param {number} options.timeout - Timeout in ms.
 * @param {number} options.codeLength - Expected OTP code length.
 * @returns {Promise<string>} - Resolves with the OTP code.
 */
function pollClipboardForOTP({ interval = 1000, timeout = 30000, codeLength = 6 } = {}) {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    const poller = setInterval(async () => {
      elapsed += interval;
      const text = await readClipboardOTP();
      if (text && /^\d+$/.test(text) && text.length === codeLength) {
        clearInterval(poller);
        resolve(text);
      }
      if (elapsed >= timeout) {
        clearInterval(poller);
        reject(new Error('OTP not found in clipboard within timeout'));
      }
    }, interval);
  });
}

// Main OTP retrieval with Web OTP API
if ('OTPCredential' in window) {
  window.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('input.otp-input');
    if (!input) return;
    const ac = new AbortController();
    const form = input.closest('form');

    if (form) {
      form.addEventListener('submit', () => {
        ac.abort();
      });
    }

    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    }).then(otp => {
      // Successfully received OTP via SMS
      fillOTP(input, otp.code);
      if (form) form.submit();
    }).catch(err => {
      console.error('Web OTP API error:', err);
      // If Web OTP API fails, display the fallback button
      const pasteButton = document.getElementById('paste-otp');
      pasteButton.style.display = 'inline-block';
      pasteButton.textContent = 'Paste OTP from Clipboard';
    });
  });
}

// Fallback: Use the Clipboard API if user clicks the button
document.getElementById('paste-otp').addEventListener('click', () => {
  const input = document.querySelector('input.otp-input');
  pollClipboardForOTP({ interval: 1000, timeout: 30000, codeLength: 6 })
    .then(code => {
      fillOTP(input, code);
      const form = input.closest('form');
      if (form) form.submit();
    })
    .catch(err => {
      console.error(err);
      alert('Failed to retrieve OTP from clipboard.');
    });
});