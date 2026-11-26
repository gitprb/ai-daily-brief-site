/**
 * Section Scrollspy & Floating Rail.
 * Automatically discovers sections across standalone briefs, market closes,
 * and the tabbed index.html page.
 */
function initScrollRail() {
  // Remove any prior rail (e.g. if tabs switched) and disconnect its observer
  const existingRail = document.querySelector(".section-rail");
  if (existingRail) {
    if (existingRail._observer) {
      existingRail._observer.disconnect();
      existingRail._observer = null;
    }
    existingRail.remove();
  }

  // Find all sections that are currently visible (not in hidden tab panels)
  const allCandidates = document.querySelectorAll(
    "section.story, .market-group, aside.why, section.watch"
  );
  
  const targets = [];
  allCandidates.forEach((el, index) => {
    // Skip if inside a hidden tab panel
    if (el.closest('.tab-panel[hidden]')) {
      return;
    }

    let title = "";
    const heading = el.querySelector("h2, h3, .market-group-title");
    if (heading) {
      title = heading.textContent.replace(/^[0-9.]+\s*/, "").trim();
    } else if (el.classList.contains("why")) {
      title = "Why it matters";
    }

    if (!title) return;

    if (!el.id) {
      el.id = `scroll-target-${index}`;
    }

    targets.push({ id: el.id, title: title, el: el });
  });

  if (targets.length < 2) return;

  const rail = document.createElement("nav");
  rail.className = "section-rail";
  rail.setAttribute("aria-label", "Section navigation");

  targets.forEach((target, index) => {
    const item = document.createElement("a");
    item.className = "section-rail-item" + (index === 0 ? " active" : "");
    item.href = `#${target.id}`;
    item.setAttribute("title", target.title);

    const label = document.createElement("span");
    label.className = "section-rail-label";
    label.textContent = target.title;

    const dot = document.createElement("span");
    dot.className = "section-rail-dot";

    item.appendChild(label);
    item.appendChild(dot);

    item.addEventListener("click", (e) => {
      e.preventDefault();
      target.el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    rail.appendChild(item);
    target.railItem = item;
  });

  document.body.appendChild(rail);

  // IntersectionObserver for tracking current section while scrolling
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          rail.querySelectorAll(".section-rail-item").forEach((it) => it.classList.remove("active"));
          const matched = targets.find((t) => t.id === entry.target.id);
          if (matched && matched.railItem) {
            matched.railItem.classList.add("active");
          }
        }
      });
    },
    {
      rootMargin: "-15% 0px -65% 0px",
      threshold: 0,
    }
  );

  targets.forEach((t) => observer.observe(t.el));

  rail._observer = observer;
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollRail();

  // If user switches tabs on index.html, re-initialize the scroll rail for the new tab!
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(initScrollRail, 50);
    });
  });
});
