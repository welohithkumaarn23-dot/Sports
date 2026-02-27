;(function () {
  emailjs.init("dTYe8UWVpk_EVZ0B8")
})()

let generatedOtp = ""

// showToast is now in script.js, but fallback if script.js isn't loaded or loaded after
if (typeof showToast === 'undefined') {
    window.showToast = function(message) {
      const toast = document.getElementById("toast")
      if (!toast) {
          alert(message);
          return;
      }
      toast.textContent = message
      toast.classList.remove("hidden")
      setTimeout(() => toast.classList.add("hidden"), 3000)
    }
}

function setStatus(message) {
  const el = document.getElementById("booking-status")
  if (!el) return
  el.textContent = message
  el.style.display = "block"
}

document.getElementById("sendOtpBtn").addEventListener("click", () => {
  const emailValue = document.getElementById("email").value
  const nameValue = document.getElementById("name").value
  if (!nameValue || !emailValue) {
    showToast("Please enter your name and email")
    return
  }
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
  emailjs
    .send("service_abu7s08", "template_mas6y1g", {
      email: emailValue,
      otp: generatedOtp,
      name: nameValue,
    })
    .then(() => {
      setStatus("OTP sent to your email")
      showToast("OTP sent to your email 📧")
      document.getElementById("otpSection").classList.remove("hidden")
    })
    .catch(() => {
      setStatus("Failed to send OTP")
      showToast("Failed to send OTP")
    })
})

document.getElementById("verifyOtpBtn").addEventListener("click", () => {
  const enteredOtp = document.getElementById("otp").value
  if (enteredOtp === generatedOtp) {
    setStatus("OTP verified successfully 🎉")
    showToast("OTP verified successfully 🎉", 'success')
    
    // LOGIN LOGIC
    const email = document.getElementById("email").value
    const name = document.getElementById("name").value
    
    // Create or Fetch User (Simulated for Client-Side OTP)
    // In a real app, you'd send the email to backend to get the user token
    const user = {
        name: name,
        email: email,
        role: 'user',
        id: Date.now() // specific ID
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const ret = params.get('return');
        window.location.href = ret ? ret : 'dashboard.html';
    }, 1500);
    
  } else {
    setStatus("Invalid OTP ❌")
    showToast("Invalid OTP ❌")
  }
})
