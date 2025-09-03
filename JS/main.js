function openGame(game) {
  // 🚀 For now just redirect to a new page
  window.location.href = game + ".html";
}

 function openGame(game) {
      window.location.href = game + ".html";
    }

    function switchPanel(from, to) {
      document.getElementById(from + "-panel").style.display = "none";
      document.getElementById(to + "-panel").style.display = "flex";
    }

    // Fake login handling (replace with Firebase/Auth later)
    document.getElementById("login-form").addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("login-panel").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
    });

    document.getElementById("register-form").addEventListener("submit", function(e) {
      e.preventDefault();
      document.getElementById("register-panel").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
    });