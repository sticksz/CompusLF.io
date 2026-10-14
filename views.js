// Page templates and UI rendering for the portal's separate screens.
(function () {
const data = window.CampusKeepsData;
const { CATEGORIES, dateOffset, escapeHTML } = data;

function formatDate(value) {
  if (!value) return "Date not given";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(value) {
  const dayDiff = Math.max(0, Math.floor((new Date(`${dateOffset(0)}T12:00:00`) - new Date(`${value}T12:00:00`)) / 86400000));
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return formatDate(value);
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function itemImage(item, detail = false) {
  const image = item.image
    ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="${detail ? "eager" : "lazy"}" decoding="async">`
    : `<span class="photo-placeholder"><svg viewBox="0 0 40 32" aria-hidden="true"><rect x="2" y="2" width="36" height="28" rx="4"></rect><circle cx="13" cy="12" r="3"></circle><path d="M4 26l9-8 6 5 5-4 12 9"></path></svg><span>No photo provided</span></span>`;
  return `<div class="${detail ? "detail-photo" : `item-image ${escapeHTML(item.tone || "")}`}">${detail ? image : `${image}<span class="status-badge ${statusClass(item.status)}">${escapeHTML(item.status)}</span>`}</div>`;
}

function cardMarkup(item) {
  return `<a class="item-card" href="#item/${encodeURIComponent(item.id)}" aria-label="${escapeHTML(item.status)}: ${escapeHTML(item.name)}">
    ${itemImage(item)}
    <div class="item-card-body">
      <div class="item-meta"><span>${escapeHTML(item.category)}</span><span>· ${escapeHTML(timeAgo(item.date))}</span></div>
      <h3>${escapeHTML(item.name)}</h3>
      <div class="item-meta"><span>⌖ ${escapeHTML(item.location)}</span></div>
    </div>
  </a>`;
}

function categoriesOptions(selected = "") {
  return `<option value="">All categories</option>${CATEGORIES.map(category => `<option value="${escapeHTML(category)}" ${category === selected ? "selected" : ""}>${escapeHTML(category)}</option>`).join("")}`;
}

function statusOptions(selected = "") {
  return ["Lost", "Found", "Claimed", "Returned"].map(status => `<option ${status === selected ? "selected" : ""}>${status}</option>`).join("");
}

function updateNav(page) {
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.classList.toggle("active", link.dataset.nav === page || (page === "report-lost" && link.dataset.nav === "browse"));
  });
}

function homePage() {
  const open = data.items.filter(item => item.status === "Lost" || item.status === "Found");
  const latest = [...open].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const foundCount = data.items.filter(item => item.status === "Returned").length;
  return `<section class="hero"><div class="container hero-grid">
    <div class="hero-copy"><span class="eyebrow">Good things find their way back</span><h1>Lost something?<br><em>Let’s bring it home.</em></h1>
      <p>A friendly campus board for the things that go missing — and the people kind enough to help them get found.</p>
      <div class="hero-actions"><a class="button button-dark" href="#report-lost">Report a lost item <span aria-hidden="true">↗</span></a><a class="button button-quiet" href="#report-found">I found something</a></div>
      <span class="microcopy">No public phone numbers. No account needed.</span>
    </div>
    <form class="search-panel" id="home-search"><h2>Find it on the board</h2><p>Search reports by item, place or keyword.</p>
      <div class="search-row"><input class="input" id="home-query" aria-label="Search items" placeholder="Try “blue bottle” or “library”"><button class="button button-dark" type="submit">Search <span aria-hidden="true">→</span></button></div>
      <div class="stats-row"><div class="stat"><strong>${data.items.length}</strong><span>board reports</span></div><div class="stat"><strong>${open.length}</strong><span>still looking</span></div><div class="stat"><strong>${foundCount}</strong><span>back where they belong</span></div></div>
    </form>
  </div></section>
  <section class="section container"><div class="section-heading"><div><span class="eyebrow">Fresh from the board</span><h2 style="margin-top:9px">Recently reported</h2><p>New reports from around campus.</p></div><a class="link-arrow" href="#browse">See all items <span aria-hidden="true">→</span></a></div>
    ${latest.length ? `<div class="item-grid">${latest.map(cardMarkup).join("")}</div>` : emptyState("Nothing on the board just yet.", "Be the first to share a report.", "Report an item", "#report-lost")}
    <p class="sample-photo-note">Sample listings and photos are illustrative only — they are not real campus reports.</p>
  </section>
  <section class="section-tight container"><div class="split-section">
    <article class="action-tile lost"><span class="tile-icon" aria-hidden="true">⌕</span><span class="eyebrow">It happens to everyone</span><h2>Misplaced something?</h2><p>Tell the campus what you’re looking for. A little detail can make all the difference.</p><a class="link-arrow" href="#report-lost">Post a lost report <span>→</span></a></article>
    <article class="action-tile found"><span class="tile-icon" aria-hidden="true">♡</span><span class="eyebrow">Small kindness, big impact</span><h2>Found something?</h2><p>Help a classmate get it back. Keep identifying details private so the right owner can verify.</p><a class="link-arrow" href="#report-found">Post a found report <span>→</span></a></article>
  </div></section>
  <section class="section soft-section"><div class="container match-box"><div><span class="eyebrow">A little serendipity</span><h2 style="margin-top:9px">Could they belong together?</h2><p>We look for simple overlaps in category, place and date to suggest possible matches. It’s a starting point, not a guarantee.</p><a class="link-arrow" href="#browse">Browse the board <span>→</span></a></div>
    <div class="match-examples"><div class="match-example"><img src="assets/canvas-tote.jpg" alt="" loading="lazy" decoding="async"><div><strong>Canvas tote bag <span class="muted">· Lost</span></strong><span>Arts Building · ${escapeHTML(timeAgo(dateOffset(-2)))}</span></div><span class="match-arrow">↕</span></div><div class="match-example"><img src="assets/canvas-tote.jpg" alt="" loading="lazy" decoding="async"><div><strong>Possible similar item <span class="muted">· Found</span></strong><span>Same category, nearby place, close date</span></div><span class="match-arrow">Possible</span></div></div>
  </div></section>`;
}

function emptyState(title, description, buttonText, href) {
  return `<div class="empty-state"><div class="empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg></div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p>${buttonText ? `<a class="button button-dark" href="${href}">${escapeHTML(buttonText)}</a>` : ""}</div>`;
}

function browsePage(query = "") {
  return `<section class="page-intro"><div class="container"><span class="eyebrow">The campus board</span><h1>Browse reports</h1><p>Every report has a story. Search the board and see if one sounds familiar. Sample listings and photos are illustrative only, not real campus reports.</p></div></section>
  <section class="section container"><div class="browse-layout"><form id="filters" class="filter-panel"><h2>Find a report</h2><div class="field"><label for="browse-query">Search</label><input class="input" id="browse-query" name="query" value="${escapeHTML(query)}" placeholder="Name, place, details"></div>
    <div class="filter-fields"><div class="field"><label for="filter-category">Category</label><select class="select" id="filter-category" name="category">${categoriesOptions()}</select></div>
    <div class="field"><label for="filter-location">Location</label><input class="input" id="filter-location" name="location" placeholder="Any campus place"></div>
    <div class="field"><label for="filter-date">Reported on or after</label><input class="input" id="filter-date" name="date" type="date"></div>
    <div class="field"><label for="filter-status">Status</label><select class="select" id="filter-status" name="status"><option value="">All statuses</option>${statusOptions()}</select></div></div>
    <button class="button button-dark" type="submit">Apply filters</button></form>
    <div class="browse-results"><div class="results-top"><p id="result-count"></p><label class="sort-control" for="sort-items">Sort by<select class="select" id="sort-items"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select></label></div><div id="results-grid" class="item-grid"></div></div>
  </div></section>`;
}

function renderBrowse(query = "") {
  const form = document.querySelector("#filters");
  if (!form) return;
  const formData = new FormData(form);
  const q = String(formData.get("query") || "").trim().toLowerCase();
  const category = String(formData.get("category") || "");
  const location = String(formData.get("location") || "").trim().toLowerCase();
  const date = String(formData.get("date") || "");
  const status = String(formData.get("status") || "");
  const sort = document.querySelector("#sort-items").value;
  let results = data.items.filter(item => {
    const searchable = [item.name, item.category, item.description, item.location, item.status].join(" ").toLowerCase();
    return (!q || searchable.includes(q)) && (!category || item.category === category) &&
      (!location || item.location.toLowerCase().includes(location)) && (!date || item.date >= date) && (!status || item.status === status);
  });
  results.sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  document.querySelector("#result-count").textContent = `${results.length} ${results.length === 1 ? "report" : "reports"} found`;
  document.querySelector("#results-grid").innerHTML = results.length ? results.map(cardMarkup).join("") : `<div class="empty-state"><div class="empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg></div><h2>No matching reports</h2><p>Try a different keyword or loosen your filters.</p><button class="button button-dark" id="clear-filters" type="button">Clear filters</button></div>`;
}

function reportPage(kind) {
  const lost = kind === "Lost";
  return `<section class="page-intro"><div class="container"><span class="eyebrow">${lost ? "Start your search" : "You’re doing a good thing"}</span><h1>Report a ${lost ? "lost" : "found"} item</h1><p>${lost ? "Share what you remember. The more helpful detail you add, the easier it is to spot a possible match." : "Share the basics, but keep one or two identifying details private so the owner can verify it."}</p></div></section>
  <section class="container form-wrap"><form class="form-card" id="report-form" data-kind="${lost ? "Lost" : "Found"}"><h2>Tell us about the item</h2><p class="form-note">Fields marked with * are required. Your contact email is never shown publicly. This demo cannot deliver claim messages.</p><div id="form-error" class="form-message" role="alert"></div>
    <div class="form-grid"><div class="field"><label for="item-name">Item name *</label><input class="input" id="item-name" name="name" maxlength="70" required placeholder="e.g. Green canvas backpack"></div>
    <div class="field"><label for="item-category">Category *</label><select class="select" id="item-category" name="category" required><option value="">Choose a category</option>${CATEGORIES.map(c => `<option>${escapeHTML(c)}</option>`).join("")}</select></div>
    <div class="field"><label for="item-location">${lost ? "Where did you last see it?" : "Where did you find it?"} *</label><input class="input" id="item-location" name="location" maxlength="80" required placeholder="e.g. Main library, ground floor"></div>
    <div class="field"><label for="item-date">${lost ? "Date last seen" : "Date found"} *</label><input class="input" id="item-date" name="date" type="date" max="${dateOffset(0)}" required value="${dateOffset(0)}"></div>
    <div class="field full"><label for="item-description">Description *</label><textarea class="textarea" id="item-description" name="description" maxlength="700" required placeholder="${lost ? "What does it look like? Any details that could help identify it?" : "Describe what you found. Keep one unique identifying detail private."}"></textarea><span class="hint">${lost ? "For valuables, keep a unique mark or what's inside private so you can verify a claim." : "Please do not include a full ID number, serial number or all the contents."}</span></div>
    <div class="field"><label for="item-contact">Contact email (optional)</label><input class="input" id="item-contact" name="contact" type="email" maxlength="120" placeholder="you@example.edu"><span class="hint">Never shown on the public board. This demo cannot deliver claim messages.</span></div>
    <div class="field"><label for="item-photo">Photo (optional)</label><input class="file-input" id="item-photo" name="photo" type="file" accept="image/*"><span class="hint">Compressed in your browser before saving. Keep it under 10 MB.</span><img id="image-preview" class="image-preview" alt="Preview of selected item photo"></div>
    </div><button class="button button-dark" type="submit">Post ${lost ? "lost" : "found"} report <span>→</span></button>
  </form><aside class="privacy-card"><span class="privacy-icon" aria-hidden="true">◈</span><h3>Your privacy comes first</h3><p>Reports are saved only in this browser. Your email is not displayed on the board.</p><ul><li>Leave identifying details out of public descriptions.</li><li>Verify ownership with a private question.</li><li>Meet in a public place if you arrange a handover.</li></ul><a class="link-arrow" href="#safety">Read safety tips →</a></aside></section>`;
}

function dayDifference(a, b) {
  return Math.abs((new Date(`${a}T12:00:00`) - new Date(`${b}T12:00:00`)) / 86400000);
}

function possibleMatches(item) {
  if (item.status !== "Lost" && item.status !== "Found") return [];
  const opposite = item.status === "Lost" ? "Found" : "Lost";
  return data.items.filter(candidate => candidate.id !== item.id && candidate.status === opposite)
    .map(candidate => {
      let score = candidate.category === item.category ? 2 : 0;
      const a = item.location.toLowerCase();
      const b = candidate.location.toLowerCase();
      if (a === b || a.includes(b) || b.includes(a)) score += 2;
      else if (a.split(/\W+/).some(word => word.length > 3 && b.includes(word))) score += 1;
      if (dayDifference(item.date, candidate.date) <= 3) score += 2;
      else if (dayDifference(item.date, candidate.date) <= 7) score += 1;
      return { item: candidate, score };
    })
    .filter(match => match.score >= 3)
    .sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date))
    .slice(0, 3).map(match => match.item);
}

function detailPage(id) {
  const item = data.items.find(entry => entry.id === id);
  if (!item) return `<section class="section container">${emptyState("We couldn’t find that report.", "It may have been removed or the link may be out of date.", "Browse reports", "#browse")}</section>`;
  const matches = possibleMatches(item);
  const canClaim = item.status === "Found";
  return `<section class="page-intro"><div class="container"><a class="link-arrow" href="#browse">← Back to all reports</a></div></section><section class="container detail-wrap"><div class="detail-grid"><div>${itemImage(item, true)}</div><div class="detail-content"><span class="status-badge ${statusClass(item.status)}">${escapeHTML(item.status)}</span><h1>${escapeHTML(item.name)}</h1><div class="item-meta"><span>${escapeHTML(item.category)}</span><span>· Reported ${escapeHTML(timeAgo(item.date).toLowerCase())}</span></div><p class="detail-description">${escapeHTML(item.description)}</p>
    <div class="detail-info"><div><small>Place</small><strong>⌖ ${escapeHTML(item.location)}</strong></div><div><small>Date</small><strong>${escapeHTML(formatDate(item.date))}</strong></div></div>
    ${item.status !== "Lost" && item.status !== "Found" ? `<div class="privacy-card" style="margin-top:18px"><h3>This item is ${escapeHTML(item.status.toLowerCase())}</h3><p>This report is no longer open for claims.</p></div>` : ""}
    <div class="detail-actions"><label class="field-label" for="status-change">Update status</label><select class="select" id="status-change" aria-label="Update report status" data-item-id="${escapeHTML(item.id)}">${statusOptions(item.status)}</select>
    ${!item.demo ? `<button class="button button-quiet button-small" id="delete-report" data-item-id="${escapeHTML(item.id)}" type="button">Delete report</button>` : ""}</div>
    ${canClaim ? `<form class="claim-card" id="claim-form" data-item-id="${escapeHTML(item.id)}"><h2>This is mine</h2><p>Answer a private verification question. This demo cannot send or save claims, so don’t include contact details. Use your campus’s official lost-property channels to reach the finder.</p><div class="field"><label for="claim-proof">What’s a detail that only the owner would know? *</label><textarea class="textarea" id="claim-proof" name="proof" maxlength="500" required placeholder="Describe a mark, contents or other detail not in the public report"></textarea></div><button class="button button-dark" type="submit">Submit claim</button></form>` : ""}
  </div></div>${matches.length ? `<section class="section-tight"><span class="eyebrow">Worth a look</span><h2 style="margin-top:8px">Possible matches</h2><p class="muted" style="font-size:.82rem">Suggestions use simple category, location and date rules — please verify details yourself.</p><div class="match-list">${matches.map(match => `<a class="item-card" href="#item/${encodeURIComponent(match.id)}">${itemImage(match)}<div class="item-card-body"><h3>${escapeHTML(match.name)}</h3><div class="item-meta"><span>${escapeHTML(match.status)} · ${escapeHTML(match.location)} · ${escapeHTML(timeAgo(match.date))}</span></div></div></a>`).join("")}</div></section>` : ""}</section>`;
}

function safetyPage() {
  return `<section class="page-intro"><div class="container"><span class="eyebrow">Look out for each other</span><h1>Find it safely.</h1><p>A reunion is a good thing. A safe, thoughtful reunion is even better.</p></div></section><section class="section container"><div class="tip-grid">
    <article class="tip-card"><span class="tip-number">01</span><h3>Verify before you hand over</h3><p>Ask the claimant to describe a mark, contents or other detail you didn’t put in the public report. Don’t share passwords, ID numbers or security codes.</p></article>
    <article class="tip-card"><span class="tip-number">02</span><h3>Choose a public campus spot</h3><p>Arrange a handover in a busy public place during the day. Bring a friend if you prefer, and trust your instincts if something feels off.</p></article>
    <article class="tip-card"><span class="tip-number">03</span><h3>Let campus staff help</h3><p>For valuables, IDs or anything you don’t feel comfortable holding, hand the item to the campus security unit or official lost-property desk.</p></article>
    <article class="tip-card"><span class="tip-number">04</span><h3>Keep personal details private</h3><p>Don’t post phone numbers, full student ID numbers, addresses, serial numbers or a photo that exposes private information.</p></article>
    <article class="tip-card"><span class="tip-number">05</span><h3>Be cautious with messages</h3><p>Never pay a fee to get your own item back. Don’t click unexpected links or share banking details as part of a claim.</p></article>
    <article class="tip-card"><span class="tip-number">06</span><h3>Close the loop</h3><p>When an item is safely returned, update its status so others know it’s no longer available to claim.</p></article>
  </div><div class="callout" style="margin-top:22px"><span class="callout-icon">✳</span><p><strong>Need immediate help?</strong> Use your campus’s official security contact or emergency services. This board is a student project and is not monitored by campus security.</p></div></section>`;
}

function aboutPage() {
  return `<section class="page-intro"><div class="container"><span class="eyebrow">A small campus project</span><h1>Good things find their way.</h1><p>Campus Keeps gives lost-and-found reports one simple place to meet.</p></div></section>
  <section class="section container"><div class="about-grid"><div class="about-copy"><span class="eyebrow">Why this exists</span><h2 style="margin-top:10px">Less searching.<br>More finding.</h2><p>Notices on boards and in group chats can be hard to keep track of. This lightweight demo brings lost and found reports together, with simple search and possible-match suggestions.</p><p>It’s designed to be easy to use on a phone, quick to load and considerate of personal information. Sample photos from Unsplash are bundled with the site for demonstration and do not depict actual campus reports.</p><h3>Fact-finding before a real launch</h3><p>Campus procedures vary, so we haven’t assumed how your security unit handles lost property. Before using this beyond a demo, ask campus security or student affairs about current reporting, storage, collection and escalation procedures.</p></div>
  <div><div class="limit-list"><div class="limit-row"><span>↗</span><div><strong>One browser, one device</strong><p>Reports live in this browser’s local storage. A post made on one phone won’t appear on another. A shared database is important future work.</p></div></div><div class="limit-row"><span>⌁</span><div><strong>Simple rule-based matching</strong><p>Suggestions compare category, location and date. This is not AI and it can miss real matches or suggest unrelated reports.</p></div></div><div class="limit-row"><span>◇</span><div><strong>No identity verification</strong><p>Claim questions can help owners describe an item, but this demo cannot verify anyone’s identity or deliver a claim to the reporter.</p></div></div><div class="limit-row"><span>▧</span><div><strong>Photos stay on this device</strong><p>Images are compressed in your browser before saving. Storage is limited; this prototype is for small demo reports, not a permanent archive.</p></div></div></div>
  <div class="research-box" style="margin-top:15px"><h3>Requirements research · to complete</h3><p><strong>Fact-finding step:</strong> speak with the campus security unit or student affairs office and record how items are currently handed in, stored, verified and collected. Confirm approved contact details and any privacy or safety requirements before launch. No interview has been conducted for this demo.</p></div></div></div></section>`;
}

function contactPage() {
  const faqs = [
    ["Can other students see my contact details?", "No. Contact email is not displayed publicly. Reports are stored in this browser only. This demo does not send messages to other students, so use the campus’s existing official channels to coordinate a handover."],
    ["Why can’t I see reports from another phone?", "This prototype uses localStorage, which is private to one browser on one device. A shared database such as Firebase or Supabase would be needed for a real campus-wide portal."],
    ["How do possible matches work?", "The app compares lost and found reports for similar categories, locations and dates. It’s simple rule-based logic, not AI; always verify an item yourself."],
    ["What should I do with a valuable item?", "Avoid publishing identifying details. Contact your campus security unit or official lost-property desk and follow their current procedure."],
    ["How do I update or remove my report?", "Open your report from the board to change its status. Reports you created in this browser can be deleted from their detail page. Seeded sample reports are examples and cannot be deleted."],
  ];
  return `<section class="page-intro"><div class="container"><span class="eyebrow">We’re here to help</span><h1>Questions? We’ve got you.</h1><p>Some helpful answers about using this demo. For campus procedures, check with your security unit or student affairs office.</p></div></section><section class="section container"><div class="contact-grid"><div class="contact-info"><span class="eyebrow">Get in touch</span><h2 style="margin-top:10px">This is a local demo.</h2><p>There isn’t a support inbox connected to this prototype. For a real item or a safety concern, use your campus’s official lost-property or security contact.</p><p class="contact-note">Please don’t send passwords, full ID numbers or other sensitive details through an unofficial channel.</p><a class="button button-dark" href="#safety">Read safety tips</a></div><div><h2 style="font-size:1.5rem">Frequently asked</h2><div class="faq-list">${faqs.map(([question, answer]) => `<details><summary>${escapeHTML(question)}</summary><p>${escapeHTML(answer)}</p></details>`).join("")}</div></div></div></section>`;
}

window.CampusKeepsViews = { formatDate, timeAgo, statusClass, itemImage, cardMarkup, categoriesOptions, statusOptions, updateNav, homePage, emptyState, browsePage, renderBrowse, reportPage, dayDifference, possibleMatches, detailPage, safetyPage, aboutPage, contactPage };
})();
