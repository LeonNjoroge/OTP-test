  // Function to fill the OTP input field with a given code
  function fillOTP(code) {
    const input = document.querySelector('input.otp-input');
    if (input) {
      input.value = code;
      console.log("OTP filled:", code);
    }
  }

  // Function to read OTP from clipboard (runs automatically after WebOTP API)
  async function fetchOTPFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (trimmed && /^\d{4,6}$/.test(trimmed)) { // Valid OTP format: 4-6 digits
        console.log("OTP from clipboard:", trimmed);
        fillOTP(trimmed);
      } else {
        console.log("No valid OTP found in clipboard.");
      }
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  }

  // Function to attempt OTP retrieval via WebOTP API
  async function fetchOTPViaWebAPI() {
    const input = document.querySelector('input.otp-input');
    if (!input) return;
    const ac = new AbortController();
    const form = input.closest("form");
    if (form) {
      form.addEventListener("submit", () => ac.abort());
    }
    try {
      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      });
      if (otp && otp.code) {
        console.log("OTP from WebOTP API:", otp.code);
        fillOTP(otp.code);
        // Optionally, write the OTP code to the clipboard as a backup
        await navigator.clipboard.writeText(otp.code);
        if (form) form.submit();
      }
    } catch (err) {
      console.error("WebOTP API error:", err);
    } finally {
      // After WebOTP API attempt finishes, automatically try to read from clipboard
      fetchOTPFromClipboard();
    }
  }

  // On page load, attempt to get OTP via the WebOTP API first
  window.addEventListener("DOMContentLoaded", () => {
    if ("OTPCredential" in window) {
      fetchOTPViaWebAPI();
    } else {
      // If WebOTP API isn't supported, immediately try reading from the clipboard
      fetchOTPFromClipboard();
    }
  });
  
  
  
  
  
  
  
  
  
  