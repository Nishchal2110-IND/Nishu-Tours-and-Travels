// nav background on scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

// mobile menu toggle
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  navLinks.style.display = navLinks.classList.contains("open") ? "flex" : "";
});

// route line fills in as you scroll through the page
const routeWrap = document.querySelector(".route-wrap");
const routeFill = document.getElementById("route-fill");

function updateRouteLine() {
  const rect = routeWrap.getBoundingClientRect();
  const total = rect.height;
  const scrolled = Math.min(Math.max(-rect.top + window.innerHeight * 0.4, 0), total);
  const percent = (scrolled / total) * 100;
  routeFill.style.height = percent + "%";
}
window.addEventListener("scroll", updateRouteLine);
window.addEventListener("resize", updateRouteLine);
updateRouteLine();

// pop the mile-marker dots as they come into view
const markers = document.querySelectorAll(".stop-marker");
const markerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.6 }
);
markers.forEach((m) => markerObserver.observe(m));

// booking form
// booking form -> opens WhatsApp with the enquiry pre-filled
const form = document.getElementById("booking-form");
const confirmationMsg = document.getElementById("confirmation-msg");
const OWNER_WHATSAPP = "918861947700"; // Jaiprakash, NTT Travels

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const route = form.route.value.trim();
  const date = form.date.value;
  const message = form.message.value.trim();

  const text =
`New booking request from the website:
Name: ${name}
Phone: ${phone}
Route: ${route}
Travel date: ${date}
Message: ${message || "-"}`;

  const waLink = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`;

  confirmationMsg.classList.remove("hidden");
  form.reset();
  window.open(waLink, "_blank");
});
// scroll progress bar
const scrollProgress = document.getElementById("scroll-progress");
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (window.scrollY / scrollable) * 100;
  scrollProgress.style.width = percent + "%";
});

// headlight glow follows cursor in hero
const heroSection = document.querySelector(".hero");
heroSection.addEventListener("mousemove", (e) => {
  const rect = heroSection.getBoundingClientRect();
  heroSection.style.setProperty("--x", `${e.clientX - rect.left}px`);
  heroSection.style.setProperty("--y", `${e.clientY - rect.top}px`);
});

// count-up stats when hero is visible
const statEls = document.querySelectorAll(".hero-stats strong[data-target]");
let statsStarted = false;

function animateStats() {
  statEls.forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !statsStarted) {
      statsStarted = true;
      animateStats();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector(".hero-stats");
if (heroStats) statsObserver.observe(heroStats);

// draw-in icons + generic reveal, both staggered per group
function setupStagger(selector, groupSelector) {
  document.querySelectorAll(groupSelector).forEach((group) => {
    const items = group.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.12}s`;
    });
  });
}
setupStagger(".reveal", "#services, #why, .packages-section");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.2 });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const iconObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.5 });

document.querySelectorAll(".service-icon").forEach((el) => iconObserver.observe(el));

// tilt effect on vehicle photo
const vehicleWrap = document.querySelector(".vehicle-image");
if (vehicleWrap) {
  const vehicleImg = vehicleWrap.querySelector("img");
  vehicleWrap.addEventListener("mousemove", (e) => {
    const rect = vehicleWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    vehicleImg.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  });
  vehicleWrap.addEventListener("mouseleave", () => {
    vehicleImg.style.transform = "rotateY(0) rotateX(0)";
  });
}