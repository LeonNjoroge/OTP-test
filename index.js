if ('OTPCredential' in window) {
    window.addEventListener('DOMContentLoaded', () => {
      const input = document.querySelector('input[autocomplete="one-time-code"]');
      if (!input) return;
  
      const ac = new AbortController();
      const form = input.closest('form');
  
      if (form) {
        form.addEventListener('submit', () => {
          ac.abort(); // Stop listening for OTP after form submission
        });
      }
  
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      }).then(otp => {
        input.value = otp.code; // Auto-fill the OTP
        if (form) form.submit(); // Auto-submit if desired
      }).catch(err => {
        console.error('OTP Error:', err);
      });
    });
  }
  