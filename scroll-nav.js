/**
 * Lightweight Section Scrollspy & Floating Rail.
 * Automatically discovers sections (.story, .market-group, aside, etc.)
 * and renders a floating indicator on the right side of the screen.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Find navigable sections
  const targets = [];
  
  // Look for sections in briefs or market closes
  const sections = document.querySelectorAll(
    "main section.story, main .market-group, main aside.why, main section.watch"
  );
  
  sections.forEach((el, index) => {
    let title = "";
    const h2 = el.querySelector("h2, h3");
    if (h2) {
      title = h2.textContent.replace(/^[0-9.]+\s*/, "").trim();
    } else if (el.classList.contains("why")) {
      title = "Why it matters";
    }
    
    if (!title) return;
    
    // Ensure element has an ID
    if (!el.id) {
      el.id = `section-target-${index}`;
    }
    
    targets.push({ id: el.id, title: title, el: el });
  });

  if (targets.length < 2) return; // Only show if multiple sections exist

  // Create rail container
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

  // IntersectionObserver for fast, accurate scroll tracking
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
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    }
  );

  targets.forEach((t) => observer.observe(t.el));
});
