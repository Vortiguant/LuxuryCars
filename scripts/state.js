import { vehicles, seedReviews, seedUsers } from "./data.js";

const STORAGE_KEYS = {
  users: "lux-users",
  session: "lux-session",
  bookings: "lux-bookings",
  reviews: "lux-reviews",
  compare: "lux-compare",
  contacts: "lux-contact"
};

const hasStorage = typeof localStorage !== "undefined";
const clone = (value) =>
  typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

async function hashPassword(password) {
  if (!password) return "";

  if (typeof crypto !== "undefined" && crypto.subtle?.digest && encoder) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Legacy fallback for environments without SubtleCrypto (demo-only, not secure)
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return `legacy-${Math.abs(hash)}`;
}

function isHashed(password) {
  return typeof password === "string" && /^[a-f0-9]{64}$/i.test(password);
}

function load(key, fallback = []) {
  if (!hasStorage) return clone(fallback);
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function save(key, value) {
  if (!hasStorage) return;
  localStorage.setItem(key, JSON.stringify(value));
}

let users = load(STORAGE_KEYS.users, seedUsers);
let reviews = load(STORAGE_KEYS.reviews, seedReviews);
let bookings = load(STORAGE_KEYS.bookings, []);
let compare = load(STORAGE_KEYS.compare, []);
let contacts = load(STORAGE_KEYS.contacts, []);
let session = load(STORAGE_KEYS.session, null);

async function ensureHashedUsers() {
  const transformed = [];
  let changed = false;

  for (const user of users) {
    if (isHashed(user.password)) {
      transformed.push(user);
      continue;
    }
    const hashedPassword = await hashPassword(user.password || "");
    transformed.push({ ...user, password: hashedPassword });
    changed = true;
  }

  if (changed) {
    users = transformed;
    save(STORAGE_KEYS.users, users);
  } else {
    users = transformed;
  }
}

const usersReady = ensureHashedUsers();

function normalizeReviews() {
  const source = Array.isArray(reviews) ? reviews : seedReviews;
  const sanitized = [];
  let changed = !Array.isArray(reviews);

  for (const review of source) {
    if (!review || typeof review !== "object") {
      changed = true;
      continue;
    }

    const ratingNumber = Number(review.rating);
    if (!Number.isFinite(ratingNumber)) {
      changed = true;
      continue;
    }

    const clampedRating = Math.min(5, Math.max(1, ratingNumber));
    if (clampedRating !== ratingNumber) changed = true;

    sanitized.push({
      ...review,
      rating: clampedRating,
      createdAt: review.createdAt || new Date().toISOString()
    });
  }

  reviews = sanitized;
  if (changed) {
    save(STORAGE_KEYS.reviews, reviews);
  }
}

normalizeReviews();

export function getSession() {
  return session;
}

export async function registerUser({ name, email, password }) {
  await usersReady;
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Account already exists");
  const hashedPassword = await hashPassword(password);
  const user = { id: uuid(), name, email, password: hashedPassword, role: "guest" };
  users.push(user);
  save(STORAGE_KEYS.users, users);
  session = { userId: user.id };
  save(STORAGE_KEYS.session, session);
  return user;
}

export async function loginUser({ email, password }) {
  await usersReady;
  const hashedPassword = await hashPassword(password);
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword
  );
  if (!user) throw new Error("Invalid credentials");
  session = { userId: user.id };
  save(STORAGE_KEYS.session, session);
  return user;
}

export function logoutUser() {
  session = null;
  save(STORAGE_KEYS.session, session);
}

export function currentUser() {
  if (!session) return null;
  return users.find((u) => u.id === session.userId) || null;
}

export function updateProfile({ name, email }) {
  const user = currentUser();
  if (!user) throw new Error("Login required");
  user.name = name || user.name;
  user.email = email || user.email;
  users = users.map((u) => (u.id === user.id ? user : u));
  save(STORAGE_KEYS.users, users);
  return user;
}

export function getBrands() {
  return Array.from(new Set(vehicles.map((v) => v.brand)));
}

function isWithinAvailability(car, from, to) {
  if (from && new Date(from) < new Date(car.availableFrom)) return false;
  if (to && new Date(to) > new Date(car.availableTo)) return false;
  return true;
}

export function filterVehicles(criteria = {}) {
  const { brand, type, price, from, to, features = [], special } = criteria;
  return vehicles.filter((car) => {
    if (brand && car.brand !== brand) return false;
    if (type && car.type !== type) return false;
    if (price && car.pricePerDay > price) return false;
    if (special && !car.isSpecial) return false;
    if (features.length && !features.every((f) => car.features.includes(f))) return false;
    if (!isWithinAvailability(car, from, to)) return false;
    return true;
  });
}

export function getVehicle(vehicleId) {
  return vehicles.find((v) => v.id === vehicleId) || null;
}

export function isVehicleAvailable(vehicleId, from, to) {
  const vehicle = getVehicle(vehicleId);
  if (!vehicle) return false;
  return isWithinAvailability(vehicle, from, to);
}

export function createBooking(vehicleId, payload) {
  const user = currentUser();
  if (!user) throw new Error("Login required");
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) throw new Error("Vehicle not found");
  const booking = {
    id: `BK-${Math.floor(Math.random() * 900 + 100)}`,
    userId: user.id,
    vehicleId,
    from: payload.from,
    to: payload.to,
    location: payload.location,
    extras: payload.extras || [],
    gateway: payload.gateway || "stripe",
    status: "confirmed",
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  save(STORAGE_KEYS.bookings, bookings);
  return booking;
}

export function getBookings() {
  return bookings;
}

export function getUserBookings(userId) {
  return bookings.filter((b) => b.userId === userId);
}

export function addReview(input) {
  const rating = Number(input.rating);
  if (!Number.isFinite(rating)) {
    throw new Error("Please provide a rating between 1 and 5");
  }

  const clampedRating = Math.min(5, Math.max(1, rating));
  if (clampedRating !== rating) {
    throw new Error("Rating must be between 1 and 5");
  }

  const review = {
    id: uuid(),
    ...input,
    rating: clampedRating,
    createdAt: new Date().toISOString()
  };
  reviews.unshift(review);
  save(STORAGE_KEYS.reviews, reviews);
  return review;
}

export function getReviews() {
  return reviews;
}

export function getAverageRating() {
  const numericRatings = reviews
    .map((r) => Number(r.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (!numericRatings.length) return 0;
  const total = numericRatings.reduce((sum, rating) => sum + rating, 0);
  return (total / numericRatings.length).toFixed(1);
}

export function toggleCompare(vehicleId) {
  if (compare.includes(vehicleId)) {
    compare = compare.filter((id) => id !== vehicleId);
  } else if (compare.length < 3) {
    compare.push(vehicleId);
  }
  save(STORAGE_KEYS.compare, compare);
  return compare;
}

export function clearCompare() {
  compare = [];
  save(STORAGE_KEYS.compare, compare);
}

export function getCompare() {
  return compare;
}

export function getCompareVehicles() {
  return compare.map((id) => vehicles.find((v) => v.id === id)).filter(Boolean);
}

export function addContact(entry) {
  contacts.push({ ...entry, id: uuid(), createdAt: new Date().toISOString() });
  save(STORAGE_KEYS.contacts, contacts);
}

export function getAdminTables() {
  const fleet = vehicles.map((v) => {
    const futureBookings = bookings.filter((b) => b.vehicleId === v.id);
    return { ...v, bookings: futureBookings.length };
  });
  return { fleet, bookings, reviews };
}

export function getAnalytics() {
  const occupancy = Math.min(100, Math.round((bookings.length / (vehicles.length * 3)) * 100));
  const ticket =
    bookings.length === 0
      ? 0
      : Math.round(
          bookings.reduce((sum, b) => {
            const vehicle = vehicles.find((v) => v.id === b.vehicleId);
            return sum + (vehicle?.pricePerDay || 0);
          }, 0) / bookings.length
        );
  return {
    occupancy,
    ticket,
    nps: 78
  };
}
