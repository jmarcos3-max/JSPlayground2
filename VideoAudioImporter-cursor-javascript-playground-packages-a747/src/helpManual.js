export function initHelpManual() {
  const modal = document.getElementById("manual-modal");
  const openBtn = document.getElementById("open-manual-btn");
  const closeBtn = document.getElementById("close-manual-btn");
  const gotItBtn = document.getElementById("manual-got-it-btn");

  if (!modal || !openBtn) return;

  const open = () => {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    gotItBtn?.focus?.();
  };

  const close = () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    openBtn.focus?.();
  };

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  gotItBtn?.addEventListener("click", close);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      close();
    }
  });
}
