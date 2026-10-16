import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { INITIAL_ROOMS, INITIAL_MOTOS, INITIAL_SETTINGS, INITIAL_ADDONS, INITIAL_COUPONS } from "../data/initialData";

// New keys without demo data
const ROOMS_KEY = "siemreap_angkor_rooms_clean_v3";
const MOTOS_KEY = "siemreap_angkor_motos_clean_v3";
const SETTINGS_KEY = "siemreap_angkor_settings_clean_v3";
const ADDONS_KEY = "siemreap_angkor_addons_clean_v3";
const INQUIRIES_KEY = "siemreap_angkor_inquiries_clean_v3";
const COUPONS_KEY = "siemreap_angkor_coupons_clean_v3";

export function loadStoredData() {
  // Clear any old demo keys if present
  try {
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
      // Migrate if old placeholder username
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
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

export function saveMotos(motos) {
  localStorage.setItem(MOTOS_KEY, JSON.stringify(motos));
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function saveAddons(addons) {
  localStorage.setItem(ADDONS_KEY, JSON.stringify(addons));
}

export function saveCoupons(coupons) {
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
}

export function saveInquiry(inquiry) {
  const current = loadStoredData().inquiries;
  const updated = [inquiry, ...current.slice(0, 49)];
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllData() {
  localStorage.removeItem(ROOMS_KEY);
  localStorage.removeItem(MOTOS_KEY);
  localStorage.removeItem(INQUIRIES_KEY);
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
  // First convert to compressed binary data URL as requested for resilient local/cloud storage
  try {
    const binaryUrl = await convertFileToBinaryDataUrl(file);
    return { url: binaryUrl, error: null, isBinary: true };
  } catch (err) {
    console.error("Binary image conversion failed:", err);
    return { url: "", error: err.message, isBinary: false };
  }
}

