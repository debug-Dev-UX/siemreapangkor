// Clean production initial data (No demo data)
export const INITIAL_ROOMS = [];

export const INITIAL_MOTOS = [];

export const INITIAL_ADDONS = [
  // Paid Extras
  {
    id: "addon-gloves",
    name: "Riding Gloves / ស្រោមដៃ",
    price: 2,
    type: "one-time",
    category: "paid",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80",
    description: "Comfortable breathable motorcycle riding gloves for sun and grip",
  },
  {
    id: "addon-pickup",
    name: "Airport Shuttle (Siem Reap SAI)",
    price: 15,
    type: "one-time",
    category: "paid",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80",
    description: "Private AC car transfer directly from new Siem Reap airport to your hotel",
  },
  {
    id: "addon-sim",
    name: "Cambodia 4G Travel SIM (Unlimited)",
    price: 5,
    type: "one-time",
    category: "paid",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=80",
    description: "Ready-to-use local SIM card with high-speed 4G data for Google Maps",
  },
  {
    id: "addon-fuel",
    name: "Full Tank of Petrol on Pickup",
    price: 4,
    type: "one-time",
    category: "paid",
    image: "https://images.unsplash.com/photo-1527018607912-0bb0dc55b184?w=500&auto=format&fit=crop&q=80",
    description: "Pick up your scooter with 100% full tank, drive immediately to Angkor",
  },
  {
    id: "addon-helmet-extra",
    name: "Extra Certified Helmet (Daily)",
    price: 1,
    type: "per-day",
    category: "paid",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80",
    description: "Additional sanitized safety helmet for third passenger",
  },
  // Free Inclusions
  {
    id: "addon-free-helmets",
    name: "Free Safety Helmets / មួកសុវត្ថិភាព (Free)",
    price: 0,
    type: "free",
    category: "free",
    defaultQty: 2,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80",
    description: "Sanitized certified safety helmets included free with your motorbike",
  },
  {
    id: "addon-free-holder",
    name: "Free Phone Holder / ប្រដាប់ដាក់ទូរស័ព្ទ (Free)",
    price: 0,
    type: "free",
    category: "free",
    defaultQty: 1,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80",
    description: "Secure handlebar phone mount for easy navigation around Angkor",
  },
  {
    id: "addon-tour-map",
    name: "Angkor Wat Secret Route Map (Free)",
    price: 0,
    type: "free",
    category: "free",
    defaultQty: 1,
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=80",
    description: "Curated Google Maps pins for best photography & quiet temple tracks",
  },
];

export const INITIAL_SETTINGS = {
  projectName: "Siemreap Angkor",
  tagline: "Motor Rental & Rooms in Siem Reap",
  telegramUsername: "Motor_Rental_Siemreap_Angkor",
  phone: "+855 16 308 199",
  whatsapp: "+85516308199",
  comboDiscountPercent: 0,
  exchangeRateKHR: 4000,
  adminPin: "1234",
  address: "Street BBU, Near Pub Street & Old Market, Siem Reap, Cambodia",
  topPromoText: "FREE 2 HELMETS & PHONE HOLDER WITH EVERY MOTORBIKE • INSTANT PREVIEW",
};

export const INITIAL_COUPONS = [];


