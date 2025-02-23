// Clear clipboard function (optional, run on page load/exit)
async function clearClipboard() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(""); // Overwrite clipboard with an empty string
        console.log("Clipboard cleared on page load/exit.");
      }
    } catch (err) {
      console.error("Failed to clear clipboard:", err);
    }
  }
  
  // WebOTP API: if supported, auto-fill the input field with an OTP from SMS.
  if ("OTPCredential" in window) {
    window.addEventListener("DOMContentLoaded", async () => {
      const input = document.querySelector("input.otp-input");
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
        if (otp) {
          console.log("WebOTP received:", otp);
          input.value = otp.code;
          // Optionally copy OTP to clipboard
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(otp.code);
          }
          sessionStorage.setItem("kyosk-otp", otp.code);
          if (form) form.submit();
        }
      } catch (err) {
        console.error("WebOTP failed:", err);
      }
    });
  }
  
  // Function to copy clipboard text into the input field
  async function copyClipboardToInput() {
    try {
      // Using readText() will trigger the permission and use the spec-defined algorithm
      const clipboardText = await navigator.clipboard.readText();
      // Validate if clipboardText contains a 4-6 digit OTP, or you can customize the regex as needed.
      if (/^\d{4,6}$/.test(clipboardText.trim())) {
        const input = document.querySelector("input.otp-input");
        if (input) {
          input.value = clipboardText.trim();
          sessionStorage.setItem("kyosk-otp", clipboardText.trim());
          console.log("Clipboard content copied to input:", clipboardText.trim());
        }
      } else {
        console.log("Clipboard text does not match expected OTP format:", clipboardText);
      }
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  }
  
  // Listen for visibility change: when the page becomes visible, attempt to read clipboard.
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      await copyClipboardToInput();
    }
  });
  
  // Listen for input focus (user gesture) to trigger clipboard reading.
  const otpInput = document.querySelector("input.otp-input");
  if (otpInput) {
    otpInput.addEventListener("focus", copyClipboardToInput);
  }
  
  // Clear clipboard on page load and before unload.
  //window.addEventListener("DOMContentLoaded", clearClipboard);
  window.addEventListener("beforeunload", clearClipboard);
  

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const input = document.querySelector("input.otp-input");
      if (input) {
        input.focus();
        console.log("Input focused after 2 seconds.");
      }
    }, 2000); // 2000 milliseconds = 2 seconds
  });