// Route handling and browser interactions for forms, search, and report updates.
(function () {
const store = window.CampusKeepsData;
const { dateOffset, escapeHTML, persistItems, showToast } = store;
const { aboutPage, browsePage, contactPage, detailPage, homePage, renderBrowse, reportPage, safetyPage, updateNav } = window.CampusKeepsViews;

function render() {
  const [route = "home", ...rest] = decodeURIComponent(location.hash.slice(1)).split("/");
  const main = document.querySelector("#main");
  if (route === "home") { main.innerHTML = homePage(); updateNav("home"); }
  else if (route === "browse") { main.innerHTML = browsePage(new URLSearchParams(location.search).get("q") || ""); updateNav("browse"); renderBrowse(); }
  else if (route === "report-lost" || route === "report-found") { main.innerHTML = reportPage(route === "report-lost" ? "Lost" : "Found"); updateNav(route); }
  else if (route === "item") { main.innerHTML = detailPage(rest.join("/")); updateNav("browse"); }
  else if (route === "safety") { main.innerHTML = safetyPage(); updateNav("safety"); }
  else if (route === "about") { main.innerHTML = aboutPage(); updateNav("about"); }
  else if (route === "contact") { main.innerHTML = contactPage(); updateNav(""); }
  else { main.innerHTML = homePage(); updateNav("home"); }
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const maxSide = 1000;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

document.addEventListener("click", event => {
  if (event.target.closest("#clear-filters")) {
    const filters = document.querySelector("#filters");
    filters.reset();
    filters.querySelector("#browse-query").value = "";
    document.querySelector("#sort-items").value = "newest";
    history.replaceState(null, "", `${location.pathname}#browse`);
    renderBrowse();
    return;
  }
  const menuToggle = event.target.closest("#menu-toggle");
  if (menuToggle) {
    const nav = document.querySelector("#site-nav");
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    nav.classList.toggle("open", !expanded);
    return;
  }
  if (event.target.closest("#site-nav a")) {
    document.querySelector("#site-nav").classList.remove("open");
    const menuToggle = document.querySelector("#menu-toggle");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
  const deleteButton = event.target.closest("#delete-report");
  if (deleteButton) {
    if (!window.confirm("Delete this report from this browser? This can’t be undone.")) return;
    const next = store.items.filter(item => item.id !== deleteButton.dataset.itemId);
    if (persistItems(next)) { showToast("Report deleted."); location.hash = "#browse"; }
  }
});

document.addEventListener("submit", async event => {
  const form = event.target;
  if (form.id === "home-search") {
    event.preventDefault();
    const query = document.querySelector("#home-query").value.trim();
    const queryString = query ? `?q=${encodeURIComponent(query)}` : "";
    history.pushState(null, "", `${location.pathname}${queryString}#browse`);
    render();
    document.querySelector("#browse-query")?.focus();
    return;
  }
  if (form.id === "filters") { event.preventDefault(); renderBrowse(); return; }
  if (form.id === "report-form") {
    event.preventDefault();
    const data = new FormData(form);
    const error = document.querySelector("#form-error");
    error.classList.remove("visible");
    let image = "";
    const file = data.get("photo");
    try {
      if (file && file.size) image = await compressImage(file);
      const item = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: String(data.get("name")).trim(),
        category: String(data.get("category")),
        location: String(data.get("location")).trim(),
        date: String(data.get("date")),
        description: String(data.get("description")).trim(),
        contact: String(data.get("contact") || "").trim(),
        status: form.dataset.kind,
        image,
        tone: "tone-yellow",
        demo: false,
      };
      if (!persistItems([item, ...store.items])) return;
      showToast("Your report is on the board.");
      location.hash = `#item/${encodeURIComponent(item.id)}`;
    } catch (errorValue) {
      console.error("Could not prepare report:", errorValue);
      error.textContent = errorValue.message || "The image could not be prepared. Try another photo.";
      error.classList.add("visible");
    }
    return;
  }
  if (form.id === "claim-form") {
    event.preventDefault();
    const item = store.items.find(entry => entry.id === form.dataset.itemId);
    if (!item) { showToast("This report is no longer available.", true); return; }
    showToast("Claim not sent or saved. Use your campus’s official lost-property channels to contact the finder.");
    return;
  }
  if (form.id === "contact-form") {
    event.preventDefault();
    showToast("This demo has no connected support inbox.");
  }
});

document.addEventListener("change", async event => {
  const target = event.target;
  if (target.id === "sort-items") { renderBrowse(); return; }
  if (target.id === "status-change") {
    const changed = items.map(item => item.id === target.dataset.itemId ? { ...item, status: target.value } : item);
    if (persistItems(changed)) {
      showToast("Report status updated.");
      render();
    }
    return;
  }
  if (target.id === "item-photo" && target.files?.[0]) {
    const preview = document.querySelector("#image-preview");
    try {
      const compressed = await compressImage(target.files[0]);
      preview.src = compressed;
      preview.classList.add("visible");
    } catch (error) {
      target.value = "";
      preview.removeAttribute("src");
      preview.classList.remove("visible");
      const message = document.querySelector("#form-error");
      message.textContent = error.message;
      message.classList.add("visible");
    }
  }
});

window.addEventListener("hashchange", render);
render();
})();
