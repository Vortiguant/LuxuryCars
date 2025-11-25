import {
  getBrands,
  filterVehicles,
  toggleCompare,
  getCompare,
  getCompareVehicles,
  clearCompare,
  currentUser,
  registerUser,
  loginUser,
  logoutUser,
  createBooking,
  addReview,
  getAverageRating,
  addContact,
  getAdminTables,
  getAnalytics,
  updateProfile,
  getVehicle,
  isVehicleAvailable,
  updateBookingStatus,
  updateVehicleRate,
  moderateReview,
  getPublicReviews
} from "./state.js";
import { renderVehicles, renderComparison, renderReviews, renderAdminTables, setMetrics, setAverageRating } from "./ui.js";

const vehicleGrid = document.getElementById("vehicle-grid");
const compareSlots = document.getElementById("compare-slots");
const priceValue = document.getElementById("price-value");
const filtersForm = document.getElementById("filters");
const sortSelect = document.getElementById("sort");
const searchText = document.getElementById("search-text");
const bookingModal = document.getElementById("booking-modal");
const bookingForm = document.getElementById("booking-form");
const bookingTitle = document.getElementById("booking-title");
const bookingRef = document.getElementById("booking-ref");
const bookingStep = document.getElementById("booking-step");
const bookingConfirmation = document.getElementById("booking-confirmation");
const authModal = document.getElementById("auth-modal");
const profileModal = document.getElementById("profile-modal");
const profileForm = document.getElementById("profile-form");
const toast = document.getElementById("toast");
const reviewGrid = document.getElementById("review-grid");
const reviewForm = document.getElementById("review-form");
const brandSelect = filtersForm?.querySelector("select[name='brand']");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const heroTitle = document.querySelector(".hero-visual h3");
const heroPill = document.querySelector(".hero-visual .pill");
const heroImage = document.querySelector(".hero-car img");
const pageTransition = document.getElementById("page-transition");

let selectedVehicle = null;
let activeFeatures = [];
let selectedGateway = "stripe";
let resultsCache = [];
let heroIndex = -1;

function refreshOperationalUI() {
  renderAdminTables(getAdminTables());
  setMetrics(getAnalytics());
  renderReviews(reviewGrid, getPublicReviews());
  setAverageRating(getAverageRating(), getPublicReviews().length);
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function closeModals() {
  bookingModal?.classList.add("hidden");
  authModal?.classList.add("hidden");
  profileModal?.classList.add("hidden");
  bookingStep?.classList.remove("hidden");
  bookingConfirmation?.classList.add("hidden");
}

function openAuth() {
  authModal.classList.remove("hidden");
}

function openBooking(id) {
  selectedVehicle = id;
  const card = document.querySelector(`[data-id="${id}"] h3`);
  bookingTitle.textContent = card ? `Reserve ${card.textContent}` : "Reserve vehicle";
  bookingModal.classList.remove("hidden");
}

function populateBrandOptions() {
  if (!brandSelect) return;
  const brands = getBrands();
  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
}

function applyFilters() {
  const data = new FormData(filtersForm);
  const criteria = {
    brand: data.get("brand"),
    type: data.get("type"),
    price: Number(data.get("price")),
    from: data.get("from") || null,
    to: data.get("to") || null,
    special: data.get("special") === "on",
    features: activeFeatures
  };

  const compareList = getCompare();
  let filtered = filterVehicles(criteria);
  if (searchText.value) {
    const term = searchText.value.toLowerCase();
    filtered = filtered.filter(
      (car) =>
        car.brand.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term) ||
        car.description.toLowerCase().includes(term)
    );
  }

  switch (sortSelect.value) {
    case "price-asc":
      filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
      break;
    case "rating-desc":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      filtered.sort((a, b) => Number(b.isSpecial) - Number(a.isSpecial));
  }

  resultsCache = filtered;
  renderVehicles(vehicleGrid, filtered, compareList);
  renderComparison(compareSlots, getCompareVehicles());
}

function bindFilterChips() {
  document.querySelectorAll(".chip[data-feature]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const feature = chip.dataset.feature;
      if (activeFeatures.includes(feature)) {
        activeFeatures = activeFeatures.filter((f) => f !== feature);
        chip.classList.remove("active");
      } else {
        activeFeatures.push(feature);
        chip.classList.add("active");
      }
      applyFilters();
    });
  });
}

function attachFilters() {
  filtersForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilters();
  });
  filtersForm?.price?.addEventListener("input", (e) => {
    priceValue.textContent = `$${e.target.value}`;
  });
  sortSelect?.addEventListener("change", applyFilters);
  searchText?.addEventListener("input", () => {
    applyFilters();
  });
}

function attachCardActions() {
  vehicleGrid.addEventListener("click", (event) => {
    const compareBtn = event.target.closest(".compare-btn");
    const bookBtn = event.target.closest(".book-btn");
    if (compareBtn) {
      toggleCompare(compareBtn.dataset.id);
      renderComparison(compareSlots, getCompareVehicles());
      applyFilters();
    }
    if (bookBtn) {
      if (!currentUser()) return openAuth();
      openBooking(bookBtn.dataset.id);
    }
  });

  document.getElementById("clear-compare")?.addEventListener("click", () => {
    clearCompare();
    renderComparison(compareSlots, []);
    applyFilters();
  });
}

function attachBooking() {
  document.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", closeModals)
  );

  document.querySelectorAll(".pay-options .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedGateway = chip.dataset.gateway;
      document.querySelectorAll(".pay-options .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(bookingForm);
    const extras = data.getAll("extras");

    const from = data.get("from");
    const to = data.get("to");
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const fromTime = fromDate?.getTime();
    const toTime = toDate?.getTime();
    const vehicle = getVehicle(selectedVehicle);

    if (!from || !to || Number.isNaN(fromTime) || Number.isNaN(toTime)) {
      showToast("Please select pickup and return dates");
      return;
    }

    if (toTime <= fromTime) {
      showToast("Return date must be after pickup date");
      return;
    }

    if (!vehicle) {
      showToast("Unable to find selected vehicle");
      return;
    }

    if (!isVehicleAvailable(selectedVehicle, from, to)) {
      showToast(
        `This vehicle is available between ${vehicle.availableFrom} and ${vehicle.availableTo}`
      );
      return;
    }

    try {
      const booking = createBooking(selectedVehicle, {
        from,
        to,
        location: data.get("location"),
        extras,
        gateway: selectedGateway
      });
      bookingRef.textContent = `Reference: ${booking.id} · Email confirmation dispatched.`;
      bookingStep.classList.add("hidden");
      bookingConfirmation.classList.remove("hidden");
      refreshOperationalUI();
      showToast("Booking confirmed");
    } catch (err) {
      showToast(err.message);
    }
  });
}

function attachAuth() {
  document.getElementById("open-auth")?.addEventListener("click", openAuth);
  document.querySelectorAll("#nav-book, #hero-book").forEach((btn) =>
    btn.addEventListener("click", () => {
      const user = currentUser();
      if (!user) return openAuth();
      if (!resultsCache.length) return showToast("No vehicles available for those filters");
      openBooking(resultsCache[0].id);
    })
  );
  document.getElementById("hero-explore")?.addEventListener("click", () => {
    document.getElementById("fleet").scrollIntoView({ behavior: "smooth" });
  });

  const tabs = authModal.querySelectorAll(".tab");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      if (tab.dataset.tab === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
      } else {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
      }
    })
  );

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(loginForm);
    try {
      await loginUser({ email: data.get("email"), password: data.get("password") });
      showToast("Signed in");
      closeModals();
      updateSessionUI();
    } catch (err) {
      showToast(err.message);
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(registerForm);
    try {
      await registerUser({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password")
      });
      showToast("Account created");
      closeModals();
      updateSessionUI();
    } catch (err) {
      showToast(err.message);
    }
  });
}

function updateSessionUI() {
  const user = currentUser();
  const nav = document.querySelector(".nav-links");
  if (user) {
    let profile = document.getElementById("nav-profile");
    if (!profile) {
      profile = document.createElement("button");
      profile.id = "nav-profile";
      profile.className = "ghost";
      nav.insertBefore(profile, document.getElementById("nav-book"));
      profile.addEventListener("click", () => {
        const current = currentUser();
        profileForm.name.value = current?.name || "";
        profileForm.email.value = current?.email || "";
        profileModal.classList.remove("hidden");
      });
    }
    profile.textContent = `${user.name || "Guest"}`;

    let logout = document.getElementById("nav-logout");
    if (!logout) {
      logout = document.createElement("button");
      logout.id = "nav-logout";
      logout.className = "ghost";
      nav.insertBefore(logout, document.getElementById("nav-book"));
      logout.addEventListener("click", () => {
        logoutUser();
        updateSessionUI();
        showToast("Signed out");
      });
    }
    logout.textContent = "Sign out";
  } else {
    document.getElementById("nav-profile")?.remove();
    document.getElementById("nav-logout")?.remove();
  }
}

function attachProfile() {
  profileForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(profileForm);
    try {
      updateProfile({ name: data.get("name"), email: data.get("email") });
      showToast("Profile updated");
      closeModals();
      updateSessionUI();
    } catch (err) {
      showToast(err.message);
    }
  });
}

function attachReviews() {
  const reviews = getPublicReviews();
  renderReviews(reviewGrid, reviews);
  setAverageRating(getAverageRating(), reviews.length);

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(reviewForm);
    addReview({
      name: data.get("name"),
      bookingId: data.get("bookingId"),
      rating: Number(data.get("rating")),
      feedback: data.get("feedback")
    });
    refreshOperationalUI();
    reviewForm.reset();
    showToast("Review submitted for moderation");
  });
}

function attachContact() {
  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    addContact({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message")
    });
    showToast("We received your note");
    e.target.reset();
  });
}

function attachNav() {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

function cycleHero() {
  const slides = filterVehicles({ special: true });
  if (!slides.length || !heroTitle || !heroPill || !heroImage) return;
  heroIndex = (heroIndex + 1) % slides.length;
  const car = slides[heroIndex];
  heroTitle.textContent = `${car.brand} ${car.model}`;
  heroPill.textContent = `From $${car.pricePerDay}/day · ${car.type}`;
  heroImage.src = car.image;
  heroImage.alt = `${car.brand} ${car.model}`;
}

function animateScroll() {
  const parallaxEls = document.querySelectorAll(".parallax");
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.2;
    parallaxEls.forEach((el, i) => {
      el.style.transform = `translateY(${offset * (i + 1)}px)`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".card, .glass, .step, .section-header").forEach((el) => observer.observe(el));
}

function revealPageTransition() {
  if (!pageTransition) return;
  pageTransition.classList.add("visible", "is-revealing");
  pageTransition.addEventListener(
    "animationend",
    () => {
      pageTransition.classList.remove("is-revealing", "visible");
    },
    { once: true }
  );
}

function transitionToHash(targetId) {
  if (!pageTransition) return false;

  const target = document.getElementById(targetId);
  if (!target) return false;

  pageTransition.classList.remove("is-revealing");
  pageTransition.classList.add("visible", "is-covering");

  pageTransition.addEventListener(
    "animationend",
    () => {
      pageTransition.classList.remove("is-covering");
      target.scrollIntoView({ behavior: "smooth" });
      requestAnimationFrame(() => {
        pageTransition.classList.add("is-revealing");
        pageTransition.addEventListener(
          "animationend",
          () => pageTransition.classList.remove("is-revealing", "visible"),
          { once: true }
        );
      });
    },
    { once: true }
  );

  return true;
}

function navigateWithTransition(href) {
  if (!pageTransition) {
    window.location.href = href;
    return;
  }
  pageTransition.classList.remove("is-revealing");
  pageTransition.classList.add("visible", "is-covering");
  pageTransition.addEventListener(
    "animationend",
    () => {
      window.location.href = href;
    },
    { once: true }
  );
}

function attachPageTransitions() {
  if (!pageTransition) return;

  revealPageTransition();

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const isHashLink = href?.startsWith("#");
    if (!href || link.target === "_blank") return;

    if (isHashLink) {
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const handled = transitionToHash(href.substring(1));
        if (!handled) {
          document.getElementById(href.substring(1))?.scrollIntoView({ behavior: "smooth" });
        }
      });
      return;
    }
    if (!href || isHashLink || link.target === "_blank") return;

    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigateWithTransition(link.href);
    });
  });

  window.addEventListener("beforeunload", () => {
    pageTransition.classList.add("visible", "is-covering");
  });
}

function initAdmin() {
  refreshOperationalUI();
}

function attachAdminActions() {
  document.getElementById("admin-fleet")?.addEventListener("click", (event) => {
    const priceBtn = event.target.closest('[data-action="edit-price"]');
    if (!priceBtn) return;
    const nextRate = prompt("Set new daily rate", priceBtn.dataset.price);
    if (nextRate === null) return;
    try {
      updateVehicleRate(priceBtn.dataset.id, nextRate);
      refreshOperationalUI();
      showToast("Rate updated");
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById("admin-bookings")?.addEventListener("click", (event) => {
    const statusBtn = event.target.closest('[data-action="booking-status"]');
    if (!statusBtn) return;
    try {
      updateBookingStatus(statusBtn.dataset.id, statusBtn.dataset.status);
      refreshOperationalUI();
      showToast(`Booking ${statusBtn.dataset.status}`);
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById("admin-reviews")?.addEventListener("click", (event) => {
    const reviewBtn = event.target.closest('[data-action="review-status"]');
    if (!reviewBtn) return;
    try {
      moderateReview(reviewBtn.dataset.id, reviewBtn.dataset.status);
      refreshOperationalUI();
      showToast(`Review ${reviewBtn.dataset.status}`);
    } catch (err) {
      showToast(err.message);
    }
  });
}

function init() {
  attachPageTransitions();
  populateBrandOptions();
  bindFilterChips();
  attachFilters();
  attachCardActions();
  attachBooking();
  attachAuth();
  attachReviews();
  attachContact();
  attachProfile();
  attachAdminActions();
  attachNav();
  animateScroll();
  updateSessionUI();
  initAdmin();
  applyFilters();
  renderComparison(compareSlots, getCompareVehicles());
  cycleHero();
  setInterval(cycleHero, 5200);
}

document.addEventListener("DOMContentLoaded", init);
