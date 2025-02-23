// Clear clipboard function, wrapped in user-initiated events if needed.
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
  
  // WebOTP API for automatic OTP fetching on devices that support it.
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
          // Optionally copy OTP to clipboard if allowed.
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
  
  // Clipboard update using visibility change event
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      try {
        const text = await navigator.clipboard.readText();
        if (/^\d{4,6}$/.test(text.trim())) {
          document.querySelector("input.otp-input").value = text.trim();
          sessionStorage.setItem("kyosk-otp", text.trim());
          console.log("Clipboard updated on visibility change:", text.trim());
        }
      } catch (err) {
        console.error("Clipboard read failed on visibility change:", err);
      }
    }
  });
  
  // Clipboard update on input focus as an extra measure on iOS.
  document.querySelector("input.otp-input")?.addEventListener("focus", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (/^\d{4,6}$/.test(text.trim())) {
        document.querySelector("input.otp-input").value = text.trim();
        sessionStorage.setItem("kyosk-otp", text.trim());
        console.log("Clipboard updated on input focus:", text.trim());
      }
    } catch (err) {
      console.error("Clipboard read failed on input focus:", err);
    }
  });
  
  // Clear clipboard on page load and exit.
  window.addEventListener("DOMContentLoaded", clearClipboard);
  window.addEventListener("beforeunload", clearClipboard);
  