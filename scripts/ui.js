function createFeaturePills(features) {
  return features.map((f) => `<span class="pill subtle">${f.replace(/-/g, " ")}</span>`).join("");
}

export function renderVehicles(container, vehicles, compareList = []) {
  if (!vehicles.length) {
    container.innerHTML = `<div class="empty">No vehicles match those filters. Adjust dates or features.</div>`;
    return;
  }

  container.innerHTML = vehicles
    .map(
      (car) => `
      <article class="card card-shadow" data-id="${car.id}">
        <div class="card-media">
          <img src="${car.image}" alt="${car.brand} ${car.model}">
          ${car.isSpecial ? '<span class="badge">Special</span>' : ""}
        </div>
        <div class="card-body">
          <div class="card-head">
            <div>
              <p class="eyebrow">${car.brand}</p>
              <h3>${car.model}</h3>
            </div>
            <div class="price">$${car.pricePerDay}/day</div>
          </div>
          <p class="card-copy">${car.description}</p>
          <div class="specs">
            <span>${car.power}</span>
            <span>${car.transmission}</span>
            <span>${car.acceleration}</span>
            <span>${car.seats} seats</span>
          </div>
          <div class="features">${createFeaturePills(car.features)}</div>
          <div class="card-footer">
            <div class="rating">${car.rating}</div>
            <div class="availability">Available to ${car.availableTo}</div>
            <div class="actions">
              <button class="ghost compare-btn" data-id="${car.id}">
                ${compareList.includes(car.id) ? "Remove" : "Compare"}
              </button>
              <button class="primary book-btn" data-id="${car.id}">Book now</button>
            </div>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  requestAnimationFrame(() => {
    container.querySelectorAll(".card").forEach((card, idx) => {
      setTimeout(() => card.classList.add("visible"), idx * 60);
    });
  });
}

export function renderComparison(container, vehicles) {
  if (!vehicles.length) {
    container.innerHTML = `<p class="muted">Choose up to three vehicles to compare performance and rates.</p>`;
    return;
  }
  container.innerHTML = vehicles
    .map(
      (car) => `
        <div class="compare-card">
          <h4>${car.brand} ${car.model}</h4>
          <p>${car.power} · ${car.transmission}</p>
          <p>$${car.pricePerDay}/day · ${car.rating}★</p>
        </div>
      `
    )
    .join("");
}

export function renderReviews(container, reviews) {
  container.innerHTML = reviews
    .map(
      (review) => `
        <article class="review card-shadow">
          <div class="review-head">
            <strong>${review.name}</strong>
            <span class="badge">${review.rating}★</span>
          </div>
          <p>${review.feedback}</p>
          <small>Booking ${review.bookingId}</small>
        </article>
      `
    )
    .join("");
}

export function renderAdminTables(tables) {
  const fleetContainer = document.getElementById("admin-fleet");
  const bookingContainer = document.getElementById("admin-bookings");
  const reviewContainer = document.getElementById("admin-reviews");

  fleetContainer.innerHTML = tables.fleet
    .map(
      (f) => `
        <div class="row">
          <span>${f.brand} ${f.model}</span>
          <span>$${f.pricePerDay}/day</span>
          <span>${f.bookings} upcoming</span>
          <div class="row-actions">
            <button class="ghost sm" data-action="edit-price" data-id="${f.id}" data-price="${f.pricePerDay}">Edit rate</button>
          </div>
        </div>
      `
    )
    .join("");

  bookingContainer.innerHTML = tables.bookings
    .map(
      (b) => `
        <div class="row">
          <span>${b.id}</span>
          <span>${b.vehicleId}</span>
          <span>${b.from} → ${b.to}</span>
          <div class="row-actions">
            <span class="badge">${b.status}</span>
            <button class="ghost sm" data-action="booking-status" data-id="${b.id}" data-status="in-progress">In progress</button>
            <button class="ghost sm" data-action="booking-status" data-id="${b.id}" data-status="completed">Complete</button>
            <button class="ghost sm" data-action="booking-status" data-id="${b.id}" data-status="cancelled">Cancel</button>
          </div>
        </div>
      `
    )
    .join("");

  reviewContainer.innerHTML = tables.reviews
    .map(
      (r) => `
        <div class="row">
          <span>${r.name}</span>
          <span>${r.rating}★</span>
          <span>${r.bookingId}</span>
          <div class="row-actions">
            <span class="badge">${r.status || "pending"}</span>
            <button class="ghost sm" data-action="review-status" data-id="${r.id}" data-status="approved">Approve</button>
            <button class="ghost sm" data-action="review-status" data-id="${r.id}" data-status="rejected">Reject</button>
          </div>
        </div>
      `
    )
    .join("");
}

export function setMetrics({ occupancy, ticket, nps }) {
  document.getElementById("metric-occupancy").textContent = `${occupancy}%`;
  document.getElementById("metric-ticket").textContent = `$${ticket}`;
  document.getElementById("metric-nps").textContent = `${nps}`;
}

export function setAverageRating(avg, count) {
  document.getElementById("avg-rating").textContent = avg;
  document.getElementById("review-count").textContent = `${count} verified guests`;
}
