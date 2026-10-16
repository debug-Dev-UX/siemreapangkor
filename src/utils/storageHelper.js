import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { INITIAL_ROOMS, INITIAL_MOTOS, INITIAL_SETTINGS, INITIAL_ADDONS, INITIAL_COUPONS } from "../data/initialData";

// Local storage keys (used as offline cache)
const ROOMS_KEY = "siemreap_angkor_rooms_clean_v4";
const MOTOS_KEY = "siemreap_angkor_motos_clean_v4";
const SETTINGS_KEY = "siemreap_angkor_settings_clean_v4";
const ADDONS_KEY = "siemreap_angkor_addons_clean_v4";
const INQUIRIES_KEY = "siemreap_angkor_inquiries_clean_v4";
const COUPONS_KEY = "siemreap_angkor_coupons_clean_v4";

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
export function subscribeToCloudData(onUpdate) {
  if (!db) return () => {};
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
            if (cloudData.inquiries !== undefined) localStorage.setItem(INQUIRIES_KEY, JSON.stringify(cloudData.inquiries));
          } catch (e) {}

          if (typeof onUpdate === "function") {
            onUpdate(cloudData);
          }
        }
      },
      (err) => {
        console.warn("Firestore onSnapshot error (ensure firestore.rules allow read):", err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to cloud data:", err);
    return () => {};
  }
}

export function loadStoredData() {
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

  let rooms = INITIAL_ROOMS;
  let motos = INITIAL_MOTOS;
  let settings = INITIAL_SETTINGS;
  let addons = INITIAL_ADDONS;
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

  let coupons = INITIAL_COUPONS;

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

  return { rooms, motos, settings, addons, inquiries, coupons };
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

export function saveInquiry(inquiry) {
  const current = loadStoredData().inquiries;
  const updated = [inquiry, ...current.slice(0, 49)];
  try {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
  } catch (e) {}
  syncToCloud({ inquiries: updated });
  return updated;
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
