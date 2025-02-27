if ('OTPCredential' in window) {
    window.addEventListener('DOMContentLoaded', e => {
      const input = document.querySelector('input.otp-input');
      if (!input) return;
      const ac = new AbortController();
      const form = input.closest('form');
      if (form) {
        form.addEventListener('submit', e => {
          ac.abort();
        });
      }
      navigator.credentials.get({
        otp: { transport:['sms'] },
        signal: ac.signal
      }).then(otp => {
        input.value = otp.code;
        if (form) form.submit();
      }).catch(err => {
        console.log(err);
      });
    });
  }