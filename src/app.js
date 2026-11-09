pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.min.js";

const $ = (id) => document.getElementById(id);
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const MAX_CANVAS_PIXELS = 16e6;

const views = { home: $("home"), toc: $("toc"), reader: $("reader") };
const show = (name) => {
  for (const [key, el] of Object.entries(views)) el.classList.toggle("active", key === name);
};

let toc = [];
let flat = [];
let observer = null;
const state = { index: -1, doc: null, zoom: 1, pages: [], token: 0 };
const stage = $("stage");

/* ---------- Mundarija ---------- */
const renderToc = (filter = "") => {
  const q = filter.trim().toLowerCase();
  const root = $("toc-list");
  root.innerHTML = "";
  let shown = 0;
  for (const g of toc) {
    const items = g.items.filter((i) => i.title.toLowerCase().includes(q));
    if (!items.length) continue;
    const section = document.createElement("div");
    section.className = "group";
    section.innerHTML = `<h3></h3><div class="cards"></div>`;
    section.querySelector("h3").textContent = g.title;
    const cards = section.querySelector(".cards");
    items.forEach((item) => {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `<div class="num"></div><div><div class="t"></div><div class="p"></div></div>`;
      card.querySelector(".num").textContent = flat.indexOf(item) + 1;
      card.querySelector(".t").textContent = item.title;
      card.querySelector(".p").textContent = `${item.pages}-betlar`;
      card.addEventListener("click", () => openTopic(flat.indexOf(item)));
      cards.appendChild(card);
      shown++;
    });
    root.appendChild(section);
  }
  if (!shown) root.innerHTML = `<div class="empty">Hech narsa topilmadi</div>`;
};

/* ---------- PDF ochish ---------- */
const openTopic = async (index) => {
  if (index < 0 || index >= flat.length) return;
  const item = flat[index];
  const token = ++state.token;
  state.index = index;
  show("reader");
  $("r-title").textContent = item.title;
  $("prev-topic").disabled = index === 0;
  $("next-topic").disabled = index === flat.length - 1;
  $("loading").classList.remove("hidden");
  $("pages").innerHTML = "";
  $("page-label").textContent = "–";
  stage.scrollTo(0, 0);
  state.pages.forEach((p) => p.task?.cancel());
  state.pages = [];
  if (observer) observer.disconnect();
  if (state.doc) { state.doc.destroy(); state.doc = null; }

  try {
    const data = await window.api.readPdf(item.file);
    const doc = await pdfjsLib.getDocument({ data }).promise;
    if (token !== state.token) { doc.destroy(); return; }
    state.doc = doc;
    await buildPages(doc, token);
    if (token !== state.token) return;
    fitWidth();
    updatePageLabel();
  } catch (err) {
    $("pages").textContent = "PDF ochilmadi: " + err.message;
  } finally {
    if (token === state.token) $("loading").classList.add("hidden");
  }
};

const buildPages = async (doc, token) => {
  const container = $("pages");
  observer = new IntersectionObserver(onVisibility, { root: stage, rootMargin: "800px 0px" });
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    if (token !== state.token) return;
    const base = page.getViewport({ scale: 1 });
    const el = document.createElement("div");
    el.className = "page";
    el.dataset.n = n - 1;
    container.appendChild(el);
    state.pages.push({ n, page, base, el, canvas: null, task: null, renderedKey: "", visible: false });
    observer.observe(el);
  }
};

/* ---------- Zoom ---------- */
const fitScale = () => {
  const first = state.pages[0];
  return first ? (stage.clientWidth - 48) / first.base.width : 1;
};

const layout = () => {
  const css = fitScale() * state.zoom;
  for (const p of state.pages) {
    p.el.style.width = p.base.width * css + "px";
    p.el.style.height = p.base.height * css + "px";
  }
  $("zoom-label").textContent = Math.round(state.zoom * 100) + "%";
};

const setZoom = (zoom, anchor) => {
  zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  if (Math.abs(zoom - state.zoom) < 1e-4) return;
  const ratio = zoom / state.zoom;
  const rect = stage.getBoundingClientRect();
  const ax = anchor ? anchor.x - rect.left : stage.clientWidth / 2;
  const ay = anchor ? anchor.y - rect.top : stage.clientHeight / 2;
  const contentX = stage.scrollLeft + ax;
  const contentY = stage.scrollTop + ay;
  state.zoom = zoom;
  layout();
  stage.scrollLeft = contentX * ratio - ax;
  stage.scrollTop = contentY * ratio - ay;
  scheduleRerender();
};

const fitWidth = () => {
  state.zoom = 1;
  layout();
  layout(); // vertikal skroll paydo bo'lgach kenglik qayta hisoblanadi
  stage.scrollLeft = 0;
  scheduleRerender();
};

let rerenderTimer = null;
const scheduleRerender = () => {
  clearTimeout(rerenderTimer);
  rerenderTimer = setTimeout(() => {
    for (const p of state.pages) if (p.visible) renderPage(p);
  }, 120);
};

/* ---------- Sahifalarni chizish ---------- */
function onVisibility(entries) {
  for (const e of entries) {
    const p = state.pages[Number(e.target.dataset.n)];
    if (!p) continue;
    p.visible = e.isIntersecting;
    if (e.isIntersecting) renderPage(p);
    else releasePage(p);
  }
}

const renderPage = (p) => {
  const css = fitScale() * state.zoom;
  let ratio = css * (window.devicePixelRatio || 1);
  const pixels = p.base.width * p.base.height * ratio * ratio;
  if (pixels > MAX_CANVAS_PIXELS) ratio *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
  const key = ratio.toFixed(3);
  if (p.renderedKey === key) return;
  p.task?.cancel();

  const viewport = p.page.getViewport({ scale: ratio });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const task = p.page.render({ canvasContext: canvas.getContext("2d"), viewport });
  p.task = task;
  task.promise.then(() => {
    p.el.replaceChildren(canvas);
    p.canvas = canvas;
    p.renderedKey = key;
  }).catch(() => {});
};

const releasePage = (p) => {
  p.task?.cancel();
  p.renderedKey = "";
  p.canvas = null;
  p.el.replaceChildren();
};

/* ---------- Sahifa raqami ---------- */
function updatePageLabel() {
  if (!state.pages.length) return;
  const mid = stage.scrollTop + stage.clientHeight / 3;
  let current = 1;
  for (const p of state.pages) {
    if (p.el.offsetTop <= mid) current = p.n; else break;
  }
  $("page-label").textContent = `${current} / ${state.pages.length}`;
}
stage.addEventListener("scroll", updatePageLabel, { passive: true });

/* ---------- Pan (sudrab siljitish) ---------- */
let drag = null;
stage.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
  stage.classList.add("dragging");
});
window.addEventListener("mousemove", (e) => {
  if (!drag) return;
  stage.scrollLeft = drag.left - (e.clientX - drag.x);
  stage.scrollTop = drag.top - (e.clientY - drag.y);
});
window.addEventListener("mouseup", () => {
  drag = null;
  stage.classList.remove("dragging");
});

/* ---------- Ctrl + g'ildirak / touchpad pinch ---------- */
stage.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  setZoom(state.zoom * Math.exp(-e.deltaY * 0.01), { x: e.clientX, y: e.clientY });
}, { passive: false });

/* ---------- Tugmalar ---------- */
$("enter").addEventListener("click", () => show("toc"));
$("toc-back").addEventListener("click", () => show("home"));
$("r-back").addEventListener("click", () => show("toc"));
$("zoom-in").addEventListener("click", () => setZoom(state.zoom * 1.25));
$("zoom-out").addEventListener("click", () => setZoom(state.zoom / 1.25));
$("fit").addEventListener("click", fitWidth);
$("prev-topic").addEventListener("click", () => openTopic(state.index - 1));
$("next-topic").addEventListener("click", () => openTopic(state.index + 1));
$("search").addEventListener("input", (e) => renderToc(e.target.value));

window.addEventListener("keydown", (e) => {
  if (!views.reader.classList.contains("active")) return;
  const page = stage.clientHeight * 0.9;
  switch (e.key) {
    case "Escape": show("toc"); break;
    case "+": case "=": setZoom(state.zoom * 1.25); break;
    case "-": setZoom(state.zoom / 1.25); break;
    case "0": fitWidth(); break;
    case "PageDown": case " ": e.preventDefault(); stage.scrollBy({ top: page }); break;
    case "PageUp": e.preventDefault(); stage.scrollBy({ top: -page }); break;
    case "ArrowDown": stage.scrollBy({ top: 60 }); break;
    case "ArrowUp": stage.scrollBy({ top: -60 }); break;
    case "ArrowRight": stage.scrollBy({ left: 60 }); break;
    case "ArrowLeft": stage.scrollBy({ left: -60 }); break;
  }
});

window.addEventListener("resize", () => {
  if (!state.pages.length) return;
  layout();
  scheduleRerender();
});

(async () => {
  toc = await window.api.getToc();
  flat = toc.flatMap((g) => g.items);
  renderToc();
})();
