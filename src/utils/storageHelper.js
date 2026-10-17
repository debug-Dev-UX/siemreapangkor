import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import {
  INITIAL_ROOMS,
  INITIAL_MOTOS,
  INITIAL_SETTINGS,
  INITIAL_ADDONS,
  INITIAL_COUPONS,
  INITIAL_BILLING_TYPES,
} from "../data/initialData";

// Local storage keys (used as offline cache)
const ROOMS_KEY = "siemreap_angkor_rooms_clean_v4";
const MOTOS_KEY = "siemreap_angkor_motos_clean_v4";
const SETTINGS_KEY = "siemreap_angkor_settings_clean_v4";
const ADDONS_KEY = "siemreap_angkor_addons_clean_v4";
const INQUIRIES_KEY = "siemreap_angkor_inquiries_clean_v4";
const COUPONS_KEY = "siemreap_angkor_coupons_clean_v4";
const BILLING_TYPES_KEY = "siemreap_angkor_billing_types_clean_v4";

// Firestore sync target
const CLOUD_COLLECTION = "siemreap_angkor";
const CLOUD_DOC = "app_data";

// Background non-blocking sync to Cloud Firestore
async function syncToCloud(partialData) {
  if (!db) return;
  try {
    const docRef = doc(db, CLOUD_COLLECTION, CLOUD_DOC);
    await setDoc(docRef, partialData, { merge: true });
  } catch (err) {
    console.warn("Firestore sync warning (check firestore.rules):", err);
  }
}

// Real-time synchronization listener for all devices (phones, laptops, customers)
export function subscribeToCloudData(onUpdate, onDone) {
  if (!db) {
    if (typeof onDone === "function") onDone();
    return () => {};
  }
  try {
    const docRef = doc(db, CLOUD_COLLECTION, CLOUD_DOC);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data();
          try {
            if (cloudData.rooms !== undefined) localStorage.setItem(ROOMS_KEY, JSON.stringify(cloudData.rooms));
            if (cloudData.motos !== undefined) localStorage.setItem(MOTOS_KEY, JSON.stringify(cloudData.motos));
            if (cloudData.settings !== undefined) localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudData.settings));
            if (cloudData.addons !== undefined) localStorage.setItem(ADDONS_KEY, JSON.stringify(cloudData.addons));
            if (cloudData.coupons !== undefined) localStorage.setItem(COUPONS_KEY, JSON.stringify(cloudData.coupons));
            if (cloudData.billingTypes !== undefined) localStorage.setItem(BILLING_TYPES_KEY, JSON.stringify(cloudData.billingTypes));
            if (cloudData.inquiries !== undefined) localStorage.setItem(INQUIRIES_KEY, JSON.stringify(cloudData.inquiries));
          } catch (e) {}

          if (typeof onUpdate === "function") {
            onUpdate(cloudData);
          }
        }
        if (typeof onDone === "function") {
          onDone();
        }
      },
      (err) => {
        console.warn("Firestore onSnapshot error (ensure firestore.rules allow read):", err);
        if (typeof onDone === "function") {
          onDone();
        }
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to cloud data:", err);
    if (typeof onDone === "function") {
      onDone();
    }
    return () => {};
  }
}

// Force sync all local data to cloud so every device receives the exact same items immediately
export async function forcePushAllToCloud() {
  const current = loadStoredData();
  await syncToCloud({
    rooms: current.rooms,
    motos: current.motos,
    settings: current.settings,
    addons: current.addons,
    coupons: current.coupons,
    billingTypes: current.billingTypes,
    inquiries: current.inquiries,
    lastSyncedAt: new Date().toISOString(),
  });
  return current;
}

export function loadStoredData(includeDemoFallback = false) {
  // Clear any old demo/test keys if present
  try {
    localStorage.removeItem("siemreap_angkor_rooms_clean_v3");
    localStorage.removeItem("siemreap_angkor_motos_clean_v3");
    localStorage.removeItem("siemreap_angkor_inquiries_clean_v3");
    localStorage.removeItem("siemreap_angkor_coupons_clean_v3");
    localStorage.removeItem("siemreap_angkor_rooms_v2");
    localStorage.removeItem("siemreap_angkor_motos_v2");
    localStorage.removeItem("siemreap_angkor_rooms_v1");
    localStorage.removeItem("siemreap_angkor_motos_v1");
  } catch (e) {
    // ignore
  }

  // Do not use demo data by default; start with real data or empty list until database responds
  let rooms = includeDemoFallback ? INITIAL_ROOMS : [];
  let motos = includeDemoFallback ? INITIAL_MOTOS : [];
  let settings = INITIAL_SETTINGS;
  let addons = includeDemoFallback ? INITIAL_ADDONS : [];
  let billingTypes = INITIAL_BILLING_TYPES;
  let coupons = includeDemoFallback ? INITIAL_COUPONS : [];
  let inquiries = [];

  try {
    const storedRooms = localStorage.getItem(ROOMS_KEY);
    if (storedRooms !== null) {
      rooms = JSON.parse(storedRooms);
    }
  } catch (e) {
    console.error("Failed to parse rooms", e);
  }

  try {
    const storedMotos = localStorage.getItem(MOTOS_KEY);
    if (storedMotos !== null) {
      motos = JSON.parse(storedMotos);
    }
  } catch (e) {
    console.error("Failed to parse motos", e);
  }

  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings !== null) {
      const parsed = JSON.parse(storedSettings);
      if (parsed.telegramUsername === "siemreapangkor") {
        settings = { ...INITIAL_SETTINGS, ...parsed, telegramUsername: INITIAL_SETTINGS.telegramUsername, phone: INITIAL_SETTINGS.phone, exchangeRateKHR: INITIAL_SETTINGS.exchangeRateKHR, address: INITIAL_SETTINGS.address };
      } else {
        settings = { ...INITIAL_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to parse settings", e);
  }

  try {
    const storedAddons = localStorage.getItem(ADDONS_KEY);
    if (storedAddons !== null) {
      addons = JSON.parse(storedAddons);
    }
  } catch (e) {
    console.error("Failed to parse addons", e);
  }

  try {
    const storedBillingTypes = localStorage.getItem(BILLING_TYPES_KEY);
    if (storedBillingTypes !== null) {
      billingTypes = JSON.parse(storedBillingTypes);
    }
  } catch (e) {
    console.error("Failed to parse billingTypes", e);
  }

  try {
    const storedCoupons = localStorage.getItem(COUPONS_KEY);
    if (storedCoupons !== null) {
      coupons = JSON.parse(storedCoupons);
    }
  } catch (e) {
    console.error("Failed to parse coupons", e);
  }

  try {
    const storedInquiries = localStorage.getItem(INQUIRIES_KEY);
    if (storedInquiries !== null) {
      inquiries = JSON.parse(storedInquiries);
    }
  } catch (e) {
    console.error("Failed to parse inquiries", e);
  }

  return { rooms, motos, settings, addons, inquiries, coupons, billingTypes };
}

export function saveRooms(rooms) {
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch (e) {}
  syncToCloud({ rooms });
}

export function saveMotos(motos) {
  try {
    localStorage.setItem(MOTOS_KEY, JSON.stringify(motos));
  } catch (e) {}
  syncToCloud({ motos });
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
  syncToCloud({ settings });
}

export function saveAddons(addons) {
  try {
    localStorage.setItem(ADDONS_KEY, JSON.stringify(addons));
  } catch (e) {}
  syncToCloud({ addons });
}

export function saveCoupons(coupons) {
  try {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  } catch (e) {}
  syncToCloud({ coupons });
}

export function saveBillingTypes(billingTypes) {
  try {
    localStorage.setItem(BILLING_TYPES_KEY, JSON.stringify(billingTypes));
  } catch (e) {}
  syncToCloud({ billingTypes });
}

// Calculate cost of an add-on item dynamically based on its billing type
export function calculateAddonCost(addon, days = 1, billingTypes = []) {
  if (!addon) return 0;
  const price = Number(addon.price) || 0;
  if (price === 0) return 0;
  const bType = billingTypes.find((b) => b.id === addon.type);
  const chargeMode = bType ? bType.chargeMode : (addon.type === "per-day" ? "per-day" : (addon.type === "free" ? "free" : "one-time"));
  if (chargeMode === "free") return 0;
  if (chargeMode === "per-day") return price * (Number(days) || 1);
  return price;
}

export function getBillingTypeLabel(typeId, billingTypes = []) {
  const b = billingTypes.find((item) => item.id === typeId);
  if (b) return b.name;
  if (typeId === "per-day") return "Per Day";
  if (typeId === "free") return "Free Inclusions";
  return "One-Time";
}

export function saveInquiry(inquiry) {
  const current = loadStoredData().inquiries;
  const normalizedInquiry = {
    ...inquiry,
    status: inquiry.status || "pending",
  };
  const updated = [normalizedInquiry, ...current.slice(0, 99)];
  try {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
  } catch (e) {}
  syncToCloud({ inquiries: updated });
  return updated;
}

export function saveInquiries(inquiries) {
  try {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  } catch (e) {}
  syncToCloud({ inquiries });
  return inquiries;
}

export function updateInquiry(quoteId, updates) {
  const current = loadStoredData().inquiries;
  const updated = current.map((inq) => {
    if (inq.quoteId === quoteId) {
      return { ...inq, ...updates, updatedAt: new Date().toISOString() };
    }
    return inq;
  });
  saveInquiries(updated);
  return updated;
}

export function deleteInquiry(quoteId) {
  const current = loadStoredData().inquiries;
  const updated = current.filter((inq) => inq.quoteId !== quoteId);
  saveInquiries(updated);
  return updated;
}

export function deleteMultipleInquiries(quoteIds = []) {
  const current = loadStoredData().inquiries;
  const set = new Set(quoteIds);
  const updated = current.filter((inq) => !set.has(inq.quoteId));
  saveInquiries(updated);
  return updated;
}

export function clearInquiries() {
  saveInquiries([]);
  return [];
}

export function clearAllData() {
  localStorage.removeItem(ROOMS_KEY);
  localStorage.removeItem(MOTOS_KEY);
  localStorage.removeItem(INQUIRIES_KEY);
  syncToCloud({ rooms: [], motos: [], inquiries: [] });
  return { rooms: [], motos: [], inquiries: [] };
}

// Convert uploaded image file to compressed Base64 Binary Data URL for reliable storage
export async function convertFileToBinaryDataUrl(file, maxWidth = 1200, maxHeight = 900, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided"));
    }
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (canvasErr) {
          console.warn("Canvas compression fallback to raw binary:", canvasErr);
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToFirebase(file, folder = "images") {
  try {
    const binaryUrl = await convertFileToBinaryDataUrl(file);
    return { url: binaryUrl, error: null, isBinary: true };
  } catch (err) {
    console.error("Binary image conversion failed:", err);
    return { url: "", error: err.message, isBinary: false };
  }
}
