function goBack() {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "../../main.html"; // 2 levels up
  }, 600);
}
