document.addEventListener("DOMContentLoaded", () => {
  const previews = document.querySelectorAll(".pre-view");
  const overview = document.querySelector(".overview-pre-video");

  previews.forEach(preview => {
    const video = preview.querySelector(".content.video");
    const button = preview.querySelector(".content.button");
    let timer = null;

    preview.addEventListener("mouseenter", async () => {
      clearTimeout(timer);
      video.currentTime = 0;
      preview.classList.add("hovered");

      preview.style.zIndex = "12";
      preview.style.boxShadow = "0 0px 20px 0px var(--palette-acient)";

      try { await video.play(); } catch (e) { }

      timer = setTimeout(() => {
        overview.classList.remove("hidden");
        overview.classList.add("visible");
        button.style.top = "50%";
        preview.style.cursor = "default";
      }, 5000);
    });

    preview.addEventListener("mouseleave", () => {
      clearTimeout(timer);
      preview.style.zIndex = "";
      preview.classList.remove("hovered");

      try {
        video.pause();
        video.currentTime = 0;
      } catch (e) { }

      overview.classList.remove("visible");
      overview.classList.add("hidden");
      button.style.top = "125%";
      preview.style.cursor = "pointer";
      preview.style.boxShadow = "none";
    });
  });
});