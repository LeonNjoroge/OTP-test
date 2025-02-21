if ('OTPCredential' in window) {
    window.addEventListener('DOMContentLoaded', () => {
      const input = document.querySelector('input[autocomplete="one-time-code"]');
      if (!input) return;
  
      const ac = new AbortController();
      const form = input.closest('form');
  
      // Abort OTP retrieval when the form is submitted
      if (form) {
        form.addEventListener('submit', () => ac.abort());
      }
  
      // Call function to retrieve the OTP from the SMS
      retrieveOTP(ac)
        .then(code => {
          // Once the OTP is received, pass it to the function that inputs it
          fillOTP(input, code);
          // Optionally, auto-submit the form:
          if (form) form.submit();
        })
        .catch(err => {
          console.error('OTP Error:', err);
        });
    });
  }
  
  /**
   * Retrieves the OTP using the Web OTP API.
   * @param {AbortController} ac - The AbortController to cancel the request if needed.
   * @returns {Promise<string>} - Resolves with the OTP code.
   */
  function retrieveOTP(ac) {
    return navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    })
    .then(otp => otp.code); // Return only the OTP code
  }
  
  /**
   * Fills the provided input field with the OTP code.
   * @param {HTMLInputElement} input - The input element for the OTP.
   * @param {string} code - The OTP code retrieved.
   */
  function fillOTP(input, code) {
    input.value = code;
    console.log('OTP code filled:', code); // Optional logging for debugging
  }
  