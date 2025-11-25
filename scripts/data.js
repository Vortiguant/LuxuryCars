export const vehicles = [
  {
    id: "db11",
    brand: "Aston Martin",
    model: "DB11 Volante",
    type: "convertible",
    pricePerDay: 620,
    rating: 4.9,
    seats: 4,
    transmission: "ZF 8-speed",
    power: "503 hp",
    acceleration: "0-60 in 3.7s",
    features: ["convertible", "grand-tourer", "massage-seats", "chauffeur"],
    availableFrom: "2024-11-25",
    availableTo: "2025-12-31",
    isSpecial: true,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    description: "Open-top grand tourer with handcrafted leather and Bowers & Wilkins audio."
  },
  {
    id: "cayenne-turbo",
    brand: "Porsche",
    model: "Cayenne Turbo GT",
    type: "suv",
    pricePerDay: 540,
    rating: 4.8,
    seats: 5,
    transmission: "Tiptronic",
    power: "631 hp",
    acceleration: "0-60 in 3.1s",
    features: ["suv", "all-wheel-drive", "track-pack"],
    availableFrom: "2024-12-02",
    availableTo: "2025-12-31",
    isSpecial: false,
    image: "https://images.unsplash.com/photo-1617472437084-5dc63b947a88?auto=format&fit=crop&w=1200&q=80",
    description: "Sport SUV with adaptive air suspension and Alcantara interior."
  },
  {
    id: "sf90",
    brand: "Ferrari",
    model: "SF90 Stradale",
    type: "sports",
    pricePerDay: 1150,
    rating: 5,
    seats: 2,
    transmission: "8-speed DCT",
    power: "986 hp",
    acceleration: "0-60 in 2.0s",
    features: ["sports", "track-pack"],
    availableFrom: "2024-12-10",
    availableTo: "2025-12-31",
    isSpecial: true,
    image: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1200&q=80",
    description: "Hybrid supercar with e-boost and carbon-ceramic brakes."
  },
  {
    id: "g63",
    brand: "Mercedes-Benz",
    model: "G63 AMG",
    type: "suv",
    pricePerDay: 480,
    rating: 4.7,
    seats: 5,
    transmission: "9-speed auto",
    power: "577 hp",
    acceleration: "0-60 in 3.9s",
    features: ["suv", "all-wheel-drive", "chauffeur", "massage-seats"],
    availableFrom: "2024-11-20",
    availableTo: "2025-12-31",
    isSpecial: false,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80&sat=-100",
    description: "Iconic silhouette with Burmester sound and diamond-stitched Nappa leather."
  },
  {
    id: "rs6",
    brand: "Audi",
    model: "RS6 Avant",
    type: "grand-tourer",
    pricePerDay: 390,
    rating: 4.6,
    seats: 5,
    transmission: "8-speed Tiptronic",
    power: "591 hp",
    acceleration: "0-60 in 3.5s",
    features: ["grand-tourer", "all-wheel-drive", "massage-seats"],
    availableFrom: "2024-11-28",
    availableTo: "2025-12-31",
    isSpecial: true,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80&sat=-50",
    description: "Avant body with quattro AWD, perfect for alpine escapes."
  },
  {
    id: "ghost",
    brand: "Rolls-Royce",
    model: "Ghost Black Badge",
    type: "sedan",
    pricePerDay: 980,
    rating: 5,
    seats: 4,
    transmission: "8-speed auto",
    power: "591 hp",
    acceleration: "0-60 in 4.5s",
    features: ["sedan", "chauffeur", "massage-seats"],
    availableFrom: "2024-12-01",
    availableTo: "2025-12-31",
    isSpecial: false,
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    description: "Black Badge trim with starlight headliner and rear lounge seating."
  }
];

export const seedReviews = [
  {
    id: "r1",
    name: "Alexis D.",
    bookingId: "BK-421",
    rating: 5,
    feedback: "Car arrived detailed and warm, concierge tracked our flight delay and waited with patience.",
    createdAt: "2024-10-10"
  },
  {
    id: "r2",
    name: "Carter L.",
    bookingId: "BK-388",
    rating: 4,
    feedback: "Booked the RS6 for a Dolomites drive. Navigation pre-loaded and snow kit included.",
    createdAt: "2024-09-02"
  },
  {
    id: "r3",
    name: "Nina P.",
    bookingId: "BK-402",
    rating: 5,
    feedback: "Identity check and payment were seamless. Chauffeur for the Ghost was immaculate.",
    createdAt: "2024-11-03"
  }
];

export const seedUsers = [
  { id: "admin", name: "Admin", email: "admin@aurumdrive.com", password: "admin123", role: "admin" }
];
