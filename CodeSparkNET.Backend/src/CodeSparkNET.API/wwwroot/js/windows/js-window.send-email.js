document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll('[data-function="send-confirmation-email"]'));
  const modal = document.querySelector("[js-window-send-confirmation-email]");
  const closeBtn = document.querySelector('[data-function="close-sendConfirmationEmail-btn"]');

  if (!buttons.length) return;

  //TODO: Показать на паре, потом поменять на F:60, потом на S:180, потом на FB: 300.
  const STORAGE_KEY = "emailConfirmLocks";
  const FIRST_LOCK_SECONDS = 10;
  const SECOND_LOCK_SECONDS = 12;
  const FINAL_BLOCK_SECONDS = 15;

  const LOCK_GROUP_ID = (() => {
    const first = buttons[0];
    return (first && first.dataset.lockGroup) ? first.dataset.lockGroup : "send-confirmation-email";
  })();

  let locks = {};
  try {
    locks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    locks = {};
  }

  function saveLocks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function showSendEmailResultModal() {
    if (modal) {
      document.body.style.paddingRight = "calc(clamp(0.375rem, 0.2079rem + 0.495vw, 1rem) + 4.5px)";
      document.body.style.overflow = "hidden"
      modal.classList.replace("hidden", "visible");
    }
  }

  function hideSendEmailResultModal() {
    if (modal) {
      document.body.style.paddingRight = "";
      document.body.style.overflow = ""
      modal.classList.replace("visible", "hidden");
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", hideSendEmailResultModal);
  }

  function getGroupData() {
    return locks[LOCK_GROUP_ID] || null;
  }

  function setGroupData(data) {
    locks[LOCK_GROUP_ID] = data;
    saveLocks();

    buttons.forEach(updateButtonState);
  }

  function setUntilAndClicksForGroup(untilMs, incrementClicks = true) {
    const existing = locks[LOCK_GROUP_ID] || {};
    const clicks = (existing.clicks || 0) + (incrementClicks ? 1 : 0);
    const merged = { ...existing, until: untilMs, clicks };
    setGroupData(merged);
  }

  function lockGroup(seconds) {
    const until = Date.now() + seconds * 1000;
    setUntilAndClicksForGroup(until, true);
  }

  function setFinalBlockForGroup(seconds) {
    const until = Date.now() + seconds * 1000;
    const existing = locks[LOCK_GROUP_ID] || {};
    const clicks = (existing.clicks || 0) + 1;
    const merged = { ...existing, until, clicks, finalBlock: true };
    setGroupData(merged);
  }

  function clearFinalBlockIfExpiredForGroup() {
    const data = locks[LOCK_GROUP_ID];
    if (!data) return;
    const now = Date.now();
    if (data.until && data.until <= now) {
      if (data.finalBlock) {
        const newData = { clicks: 0, until: null };
        setGroupData(newData);
      } else {
        const newData = { ...data, until: null };
        setGroupData(newData);
      }
    }
  }

  function updateButtonState(btn) {
    const data = locks[LOCK_GROUP_ID];

    if (!data) {
      btn.disabled = false;
      btn.classList.remove("locked");
      btn.removeAttribute("data-time");
      return;
    }

    const now = Date.now();

    if (data.until && data.until > now) {
      btn.disabled = true;
      btn.classList.add("locked");

      if (data.finalBlock) {
        btn.dataset.time = "Обратитесь в поддержку";
      } else {
        const remaining = Math.floor((data.until - now) / 1000);
        if (btn.classList.contains("right")) {
          btn.dataset.time = formatTime(remaining);
        } else {
          btn.removeAttribute("data-time");
        }
      }
      return;
    }

    if (!data.until || data.until <= now) {

      btn.disabled = false;
      btn.classList.remove("locked");


      if (!btn.classList.contains("right") && (data.clicks || 0) >= 2 && !data.finalBlock) {
        btn.dataset.time = "Обратитесь в поддержку";
      } else {
        btn.removeAttribute("data-time");
      }
      return;
    }
  }

  setInterval(() => {
    clearFinalBlockIfExpiredForGroup();
    buttons.forEach(updateButtonState);
  }, 1000);

  buttons.forEach(btn => updateButtonState(btn));


  buttons.forEach(btn => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();

      if (btn.disabled) return;

      const groupData = locks[LOCK_GROUP_ID] || {};
      const prevClicks = groupData.clicks || 0;
      const isFinalBlockedNow = groupData.finalBlock && groupData.until && groupData.until > Date.now();

      if (isFinalBlockedNow) return;

      if (prevClicks >= 2) {
        setFinalBlockForGroup(FINAL_BLOCK_SECONDS);
        return;
      }

      showSendEmailResultModal();

      try {
        await fetch('@Url.Action("SendEmailConfirmation", "Profile")', {
          method: "POST",
            headers: { "Content-Type": "application/json", 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
        });
      } catch (error) {
        console.error("Произошла ошибка:", error);
      }

      if (prevClicks === 0) {
        lockGroup(FIRST_LOCK_SECONDS);
      } else {
        lockGroup(SECOND_LOCK_SECONDS);
      }
    });
  });
});