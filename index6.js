// Function to clear clipboard
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
  // WebOTP API for automatic OTP fetching
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
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(otp.code); // Copy OTP to clipboard
          }
          sessionStorage.setItem("kyosk-otp", otp.code);
          if (form) form.submit();
        }
      } catch (err) {
        console.error("WebOTP failed:", err);
      }
    });
  }
  // Clipboard Polling Function (to detect changes)
  let lastClipboardText = sessionStorage.getItem("kyosk-otp") || "";
  // Function to check clipboard changes with fallback for Safari
  async function checkClipboardChanges() {
    try {
      let text = "";
      if (navigator.clipboard) {
        text = await navigator.clipboard.readText();
      } else if (document.execCommand) {
        let textarea = document.createElement("textarea");
        document.body.appendChild(textarea);
        textarea.focus();
        document.execCommand("paste");
        text = textarea.value;
        document.body.removeChild(textarea);
      }
      if (text !== lastClipboardText && /^\d{4,6}$/.test(text.trim())) {
        lastClipboardText = text; // Update last clipboard text
        document.getElementById("otp").value = text.trim();
        sessionStorage.setItem("kyosk-otp", text);
        console.log("Clipboard updated with OTP:", text.trim());
      }
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  }
  // Start polling clipboard when page is active
  let clipboardInterval;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      clipboardInterval = setInterval(checkClipboardChanges, 2000); // Check clipboard every 2 seconds
    } else {
      clearInterval(clipboardInterval); // Stop polling when page is inactive
    }
  });
  // Clear clipboard on page load and exit
  window.addEventListener("DOMContentLoaded", clearClipboard);
  window.addEventListener("beforeunload", clearClipboard);
  // Start clipboard polling
  clipboardInterval = setInterval(checkClipboardChanges, 2000);