document.addEventListener("DOMContentLoaded", () => {
  const btnProfile = document.querySelector("[js-window-profile-btn]");
  const modalProfile = document.querySelector("[js-window-profile]");

  if (!btnProfile || !modalProfile) return;

  function toggleModal(forceClose = false) {
    const isActive = btnProfile.classList.contains("active");

    if (isActive || forceClose) {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
      btnProfile.classList.remove("active");
      modalProfile.classList.remove("visible");
      modalProfile.classList.add("hidden");
    } else {
      document.body.style.paddingRight = "calc(clamp(0.375rem, 0.2079rem + 0.495vw, 1rem) + 4.5px)";
      document.body.style.overflow = "hidden"
      btnProfile.classList.add("active");
      modalProfile.classList.remove("hidden");
      modalProfile.classList.add("visible");
    }
  }

  btnProfile.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleModal();
  });

  modalProfile.addEventListener("click", (e) => {
    if (e.target === modalProfile) {
      toggleModal(true);
    }
  });
});
