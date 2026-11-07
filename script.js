// Edit these two lines:
const MONEY_TRACKER_URL = "https://pandureksanalendraarya-spec.github.io/money-tracker/index.html";
const CONTACT_EMAIL = "pandureksanalendra@gmail.com";

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const slides = $$(".slide"), navBtns = $$(".nav-actions button"), progress = $(".progress"), toast = $("#toast");
const slugs = ["home", "about", "projects", "contact"];
let cur = 0;

function say(m) { toast.textContent = m; toast.classList.add("show"); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove("show"), 3200); }

function go(n) {
  cur = Math.max(0, Math.min(3, n - 1));
  slides.forEach((s, i) => s.hidden = i !== cur);
  navBtns.forEach((b, i) => i === cur ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  progress.style.width = (cur + 1) * 25 + "%";
  history.replaceState(null, "", "#" + slugs[cur]);
  window.scrollTo(0, 0);
  if (cur === 1) showPanel(0);
  if (cur === 2) showProject(pi, null, true);
}
$$("[data-go]").forEach(b => b.addEventListener("click", () => go(Number(b.dataset.go))));

/* About slideshow */
const panels = $$(".panel"), dots = $$(".dot"), prev = $("#prev"), next = $("#next");
let pn = 0;
function showPanel(i) {
  pn = Math.max(0, Math.min(panels.length - 1, i));
  panels.forEach((p, n) => { p.classList.toggle("on", n === pn); p.classList.toggle("before", n < pn); p.setAttribute("aria-hidden", n !== pn); });
  dots.forEach((d, n) => d.classList.toggle("on", n === pn));
  prev.disabled = pn === 0;
  next.disabled = pn === panels.length - 1;
}
prev.addEventListener("click", () => showPanel(pn - 1));
next.addEventListener("click", () => showPanel(pn + 1));
dots.forEach((d, n) => d.addEventListener("click", () => showPanel(n)));
let sx = null; const stage = $("#stage");
stage.addEventListener("pointerdown", e => sx = e.clientX);
stage.addEventListener("pointerup", e => { if (sx === null) return; const d = e.clientX - sx; sx = null; if (d < -50) showPanel(pn + 1); if (d > 50) showPanel(pn - 1); });

/* Projects carousel: the next card opens up into the background */
const projects = [
  { name: "Money Tracker", label: "Personal finance", kicker: "Personal finance · In progress", title: "Money<br>Tracker", desc: "A personal finance app that works offline. Log your income and spending, and your data stays on your device.", cta: "Open project", act: "link" },
  { name: "My Portfolio", label: "This website", kicker: "This website · Live", title: "My<br>Portfolio", desc: "Interactive slides that introduce who I am and what I’m building, styled after the colors of my own portrait.", cta: "Back to home", act: "home" },
  { name: "Next Project", label: "Coming soon", kicker: "Coming soon", title: "Next<br>Project", desc: "The next thing I build will show up here.", cta: null }
];
const stage3 = $("#stage3"), bgs = $$(".bg"), copy = $("#copy"), cardsEl = $("#cards"), still = matchMedia("(prefers-reduced-motion: reduce)");
document.documentElement.style.setProperty("--photo", 'url("' + $(".frame img").src + '")');
let pi = 0, timer;

function renderCards() {
  cardsEl.innerHTML = "";
  [1, 2].forEach((d, k) => {
    const n = (pi + d) % projects.length, p = projects[n], b = document.createElement("button");
    b.type = "button"; b.className = "pcard"; b.style.setProperty("--k", k);
    b.setAttribute("aria-label", "Show project: " + p.name);
    b.innerHTML = '<span class="cv c' + n + '"></span><span class="lab"><small>' + p.label + "</small><strong>" + p.name + "</strong></span>";
    b.addEventListener("click", () => showProject(n, b));
    b.addEventListener("pointermove", e => {
      if (e.pointerType === "touch" || still.matches) return;
      const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      b.style.transform = "perspective(700px) rotateX(" + (.5 - y) * 14 + "deg) rotateY(" + (x - .5) * 14 + "deg) translateY(-6px)";
    });
    b.addEventListener("pointerleave", () => b.style.transform = "");
    cardsEl.appendChild(b);
  });
}

function showProject(i, from, init) {
  const n = (i + projects.length) % projects.length, p = projects[n];
  if (n === pi && !init) return;
  clearTimeout(timer);
  if (init || still.matches) {
    bgs.forEach((b, k) => { b.classList.toggle("on", k === n); b.classList.remove("top"); b.style.clipPath = ""; });
  } else {
    // The chosen card grows from its own rectangle until it fills the screen.
    const nb = bgs[n], s = stage3.getBoundingClientRect();
    let clip = "inset(35% 25% 35% 45% round 16px)";
    if (from) { const r = from.getBoundingClientRect(); clip = "inset(" + (r.top - s.top) + "px " + (s.right - r.right) + "px " + (s.bottom - r.bottom) + "px " + (r.left - s.left) + "px round 16px)"; }
    bgs.forEach(b => b.classList.remove("top"));
    nb.classList.add("top", "on"); nb.style.transition = "none"; nb.style.clipPath = clip; void nb.offsetWidth;
    nb.style.transition = "clip-path .85s cubic-bezier(.7,0,.2,1)"; nb.style.clipPath = "inset(0px 0px 0px 0px round 0px)";
    timer = setTimeout(() => { bgs.forEach((b, k) => { if (k !== n) b.classList.remove("on"); }); nb.classList.remove("top"); nb.style.transition = ""; nb.style.clipPath = ""; }, 900);
  }
  pi = n;
  $("#p-kicker").textContent = p.kicker;
  $("#pt").innerHTML = p.title;
  $("#p-desc").textContent = p.desc;
  const cta = $("#p-cta"); cta.hidden = !p.cta; cta.textContent = p.cta || ""; $("#p-open").hidden = !p.cta;
  $("#p-num").textContent = "0" + (n + 1);
  $("#p-fill").style.width = (n + 1) / projects.length * 100 + "%";
  [copy, $("#p-num")].forEach(el => { el.classList.remove("sw"); void el.offsetWidth; el.classList.add("sw"); });
  renderCards();
}
$("#p-prev").addEventListener("click", () => showProject(pi - 1));
$("#p-next").addEventListener("click", () => showProject(pi + 1, cardsEl.firstElementChild));
function openProject() {
  if (projects[pi].act === "home") return go(1);
  if (MONEY_TRACKER_URL.startsWith("YOUR-")) return say("The Money Tracker link isn’t set yet. Edit MONEY_TRACKER_URL in the script.");
  window.open(MONEY_TRACKER_URL, "_blank", "noopener");
}
$("#p-cta").addEventListener("click", openProject);
$("#p-open").addEventListener("click", openProject);

/* Contact: opens the visitor's email app */
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  if (CONTACT_EMAIL.startsWith("YOUR-")) return say("Your email isn’t set yet. Edit CONTACT_EMAIL in the script.");
  const f = new FormData(e.target);
  location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Message from " + f.get("name")) + "&body=" + encodeURIComponent(f.get("msg"));
});

document.addEventListener("keydown", e => {
  const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
  if (!d || e.target.matches("input,textarea")) return;
  if (cur === 1) showPanel(pn + d);
  if (cur === 2) showProject(pi + d);
});

go(Math.max(1, slugs.indexOf(location.hash.slice(1)) + 1));
showPanel(0);