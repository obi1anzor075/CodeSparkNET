document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("section.left");

  const listButtons = section.querySelectorAll("[js-list-catalog-btn], [js-list-documents-btn], [js-list-socials-btn]");
  const lists = section.querySelectorAll("[js-list-catalog], [js-list-documents], [js-list-socials]");

  const btnDocuments = section.querySelector("[js-list-documents-btn]");
  const btnSocials = section.querySelector("[js-list-socials-btn]");

  function setWidths() {
    section.style.setProperty("--docs-width", btnDocuments.offsetWidth + "px");
    section.style.setProperty("--catalog-width", btnSocials.offsetWidth + "px");
  }

  setWidths();

  window.addEventListener("resize", setWidths);

  function closeAll() {
    lists.forEach(list => list.classList.remove("visible"));
  }

  listButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const listAttr = button.getAttributeNames().find(attr => attr.startsWith("js-list-") && attr.endsWith("-btn"));
      const listName = listAttr.replace("-btn", "");
      const targetList = section.querySelector(`[${listName}]`);

      if (targetList.classList.contains("visible")) {
        targetList.classList.remove("visible");
      } else {
        closeAll();
        targetList.classList.add("visible");
      }
    });
  });

  // === Клик вне секции закрывает все ===
  document.addEventListener("click", (e) => {
    if (!section.contains(e.target)) {
      closeAll();
    }
  });
});