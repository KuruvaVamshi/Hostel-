const header = document.querySelector("#siteHeader");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#navLinks");
const loader = document.querySelector(".loader");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const galleryButtons = document.querySelectorAll(".gallery-item");
const footerYear = document.querySelector("#year");
let currentGalleryIndex = 0;

if (window.lucide) {
  window.lucide.createIcons();
}

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader?.classList.add("hidden");
  }, 450);
});

const setHeaderState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.toggle("open");
  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.querySelectorAll(".nav-links a, .footer a, .hero-actions a, .scroll-cue").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    navToggle?.classList.remove("active");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  revealObserver.observe(item);
});

const runCounter = (counter) => {
  const target = Number(counter.dataset.counter);
  const suffix = counter.dataset.suffix ?? (target > 999 ? "" : "+");
  const format = counter.dataset.format;
  const duration = target > 1000 ? 1300 : 1000;
  const startTime = performance.now();
  const formatValue = (value) => {
    if (format === "plain") return String(value);
    return target > 999 ? value.toLocaleString("en-IN") : String(value);
  };

  const tick = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    counter.textContent = `${formatValue(value)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = `${formatValue(target)}${suffix}`;
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.55 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

const activeSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navAnchors.forEach((anchor) => {
        const href = anchor.getAttribute("href") || "";
        if (href.startsWith("#")) {
          anchor.classList.toggle("active", href === `#${entry.target.id}`);
        }
      });
    });
  },
  {
    rootMargin: "-42% 0px -48% 0px",
    threshold: 0
  }
);

sections.forEach((section) => activeSectionObserver.observe(section));

const galleryItems = Array.from(galleryButtons).map((button) => {
  const image = button.querySelector("img");
  return {
    button,
    imageUrl: button.dataset.full || image?.src,
    altText: image?.alt || "Gallery preview"
  };
});

const setLightboxNavigationState = () => {
  const hasMultipleImages = galleryItems.length > 1;
  lightboxPrev?.toggleAttribute("hidden", !hasMultipleImages);
  lightboxNext?.toggleAttribute("hidden", !hasMultipleImages);
};

setLightboxNavigationState();

const setLightboxImage = (index) => {
  if (!lightbox || !lightboxImage) return;
  if (!galleryItems.length) return;

  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const activeItem = galleryItems[currentGalleryIndex];
  lightboxImage.src = activeItem.imageUrl;
  lightboxImage.alt = activeItem.altText;
};

const openLightbox = (index) => {
  if (!lightbox || !lightboxImage) return;
  if (galleryItems.length) {
    setLightboxImage(index);
  }
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
};

const moveLightbox = (direction) => {
  if (!lightbox?.classList.contains("open") || galleryItems.length < 2) return;
  setLightboxImage(currentGalleryIndex + direction);
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  window.setTimeout(() => {
    if (!lightbox.classList.contains("open")) {
      lightboxImage.src = "";
    }
  }, 250);
};

galleryItems.forEach((item, index) => {
  item.button.addEventListener("click", () => {
    openLightbox(index);
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => moveLightbox(-1));
lightboxNext?.addEventListener("click", () => moveLightbox(1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    moveLightbox(1);
  }
});
