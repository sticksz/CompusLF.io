// Demo records, local storage, and shared data helpers.
(function (global) {
const STORAGE_KEY = "campus-keeps-items-v1";
const CATEGORIES = ["Accessories", "Bags", "Books & stationery", "Clothing", "Electronics", "ID & cards", "Keys", "Other"];
const DEMO_ITEMS = [
  { id: "demo-1", name: "Green water bottle", category: "Other", description: "A reusable green water bottle with a screw cap. Left behind in the library.", location: "Library", date: dateOffset(-1), contact: "", status: "Found", image: "assets/blue-water-bottle.jpg", tone: "tone-blue", demo: true },
  { id: "demo-2", name: "Calculus notebook", category: "Books & stationery", description: "A study notebook and dark pen, left on a table after class.", location: "Science Building", date: dateOffset(-2), contact: "", status: "Found", image: "assets/calculus-notebook.jpg", tone: "tone-yellow", demo: true },
  { id: "demo-3", name: "Wireless earbuds case", category: "Electronics", description: "Small white earbuds case, no earbuds inside. Found near the east entrance.", location: "Student Union", date: dateOffset(-3), contact: "", status: "Found", image: "assets/earbuds.jpg", tone: "tone-lilac", demo: true },
  { id: "demo-4", name: "Canvas tote bag", category: "Bags", description: "Cream canvas tote with broad fabric handles. Last remembered after class.", location: "Arts Building", date: dateOffset(-2), contact: "", status: "Lost", image: "assets/canvas-tote.jpg", tone: "tone-peach", demo: true },
  { id: "demo-5", name: "Student ID card", category: "ID & cards", description: "Lost my campus ID somewhere between the cafeteria and the main quad.", location: "Main Quad", date: dateOffset(-4), contact: "", status: "Lost", image: "assets/student-id.jpg", tone: "tone-yellow", demo: true },
  { id: "demo-6", name: "Silver keyring", category: "Keys", description: "Two keys on a plain silver ring, possibly dropped on the way to the gym.", location: "Sports Centre", date: dateOffset(-1), contact: "", status: "Lost", image: "assets/silver-keys.jpg", tone: "tone-blue", demo: true },
  { id: "demo-7", name: "Black umbrella", category: "Other", description: "Compact black umbrella left by the front desk during the afternoon.", location: "Library", date: dateOffset(-5), contact: "", status: "Returned", image: "assets/umbrella.jpg", tone: "tone-lilac", demo: true },
  { id: "demo-8", name: "Red pencil pouch", category: "Accessories", description: "Red zip-up pencil case with a few pens. Found outside room 204.", location: "Science Building", date: dateOffset(-3), contact: "", status: "Claimed", image: "assets/pencil-case.jpg", tone: "tone-peach", demo: true },
];

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ITEMS));
      return [...DEMO_ITEMS];
    }
    const savedItems = JSON.parse(saved);
    if (!Array.isArray(savedItems)) throw new Error("Saved item data is not a list.");
    const demoItems = new Map(DEMO_ITEMS.map(item => [item.id, item]));
    return savedItems.map(item => {
      const demoItem = item.demo && demoItems.get(item.id);
      return demoItem ? { ...item, ...demoItem, status: item.status || demoItem.status } : item;
    });
  } catch (error) {
    console.error("Could not load saved reports:", error);
    showToast("Saved reports could not be loaded. Check browser storage settings.", true);
    return [...DEMO_ITEMS];
  }
}

let items = loadItems();
let toastTimer;

function persistItems(nextItems) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    items = nextItems;
    return true;
  } catch (error) {
    console.error("Could not save report:", error);
    showToast("This report could not be saved. Try a smaller photo or remove an older report.", true);
    return false;
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function showToast(message, isError = false) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3600);
}

  global.CampusKeepsData = {
    get items() { return items; },
    CATEGORIES,
    DEMO_ITEMS,
    dateOffset,
    escapeHTML,
    persistItems,
    showToast,
  };
})(window);
