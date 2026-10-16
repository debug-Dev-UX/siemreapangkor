import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  BedDouble,
  Bike,
  Settings as SettingsIcon,
  ListOrdered,
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  Check,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  PackageCheck,
  TicketPercent,
  Menu,
  X,
  Eye,
  EyeOff,
  Cloud,
  CloudUpload,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import {
  loadStoredData,
  saveRooms,
  saveMotos,
  saveAddons,
  saveSettings,
  saveCoupons,
  convertFileToBinaryDataUrl,
  subscribeToCloudData,
  forcePushAllToCloud,
} from "../utils/storageHelper";

export default function AdminPage() {
  const [data, setData] = useState(() => loadStoredData());
  const [rooms, setRooms] = useState(data.rooms);
  const [motos, setMotos] = useState(data.motos);
  const [addons, setAddons] = useState(data.addons || []);
  const [settings, setSettings] = useState(data.settings);
  const [inquiries, setInquiries] = useState(data.inquiries);
  const [coupons, setCoupons] = useState(data.coupons || []);

  // Listen for real-time live updates from Cloud Firestore across all devices
  useEffect(() => {
    const unsubscribe = subscribeToCloudData((cloud) => {
      if (cloud.rooms !== undefined) setRooms(cloud.rooms);
      if (cloud.motos !== undefined) setMotos(cloud.motos);
      if (cloud.addons !== undefined) setAddons(cloud.addons);
      if (cloud.settings !== undefined) setSettings((prev) => ({ ...prev, ...cloud.settings }));
      if (cloud.inquiries !== undefined) setInquiries(cloud.inquiries);
      if (cloud.coupons !== undefined) setCoupons(cloud.coupons);
    });
    return () => unsubscribe();
  }, []);

  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("siemreap_admin_authenticated") === "true";
    } catch (e) {
      return false;
    }
  });
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("rooms"); // rooms, motos, addons, coupons, settings, inquiries
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sorting & Filtering States across inventory & coupons
  const [couponFilterStatus, setCouponFilterStatus] = useState("all");
  const [couponSort, setCouponSort] = useState("expire-asc");
  const [couponSearch, setCouponSearch] = useState("");

  const [addonFilterType, setAddonFilterType] = useState("all");
  const [addonSort, setAddonSort] = useState("name-asc");
  const [addonSearch, setAddonSearch] = useState("");

  const [roomCategoryFilter, setRoomCategoryFilter] = useState("all");
  const [roomSort, setRoomSort] = useState("price-asc");
  const [roomSearch, setRoomSearch] = useState("");

  const [motoSort, setMotoSort] = useState("price-asc");
  const [motoSearch, setMotoSearch] = useState("");

  const [inquiryFilter, setInquiryFilter] = useState("all");
  const [inquirySort, setInquirySort] = useState("newest");

  // Room Edit/Add state
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    id: "",
    name: "",
    category: "Deluxe",
    pricePerNight: 25,
    capacity: "2 Guests",
    bed: "1 King Bed",
    image: "",
    amenities: "Air Conditioning, Free WiFi, Hot Shower, Swimming Pool Access",
    description: "",
    badge: "Popular",
  });
  const [roomUploading, setRoomUploading] = useState(false);

  // Moto Edit/Add state
  const [editingMoto, setEditingMoto] = useState(null);
  const [motoForm, setMotoForm] = useState({
    id: "",
    name: "",
    pricePerDay: 10,
    image: "",
    features: "2 Helmets Included, Phone Holder, USB Charger, Free Raincoat",
    badge: "Top Seller",
  });
  const [motoUploading, setMotoUploading] = useState(false);

  // Add-ons Edit/Add state
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonUploading, setAddonUploading] = useState(false);
  const [addonForm, setAddonForm] = useState({
    id: "",
    name: "",
    price: 5,
    type: "one-time",
    description: "",
    image: "",
  });

  const handleOpenAddonForm = (addon = null) => {
    if (addon) {
      setEditingAddon(addon.id);
      setAddonForm({
        ...addon,
        image: addon.image || "",
      });
    } else {
      setEditingAddon("new");
      setAddonForm({
        id: "addon-" + Date.now(),
        name: "",
        price: 5,
        type: "one-time",
        description: "",
        image: "",
      });
    }
  };

  const handleAddonImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAddonUploading(true);
      const binaryUrl = await convertFileToBinaryDataUrl(file);
      setAddonForm((prev) => ({ ...prev, image: binaryUrl }));
    } catch (err) {
      console.error("Failed to convert image to binary code", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setAddonUploading(false);
    }
  };

  const handleSaveAddon = (e) => {
    e.preventDefault();
    const isFree = addonForm.type === "free" || Number(addonForm.price) === 0;
    const formatted = {
      ...addonForm,
      price: isFree ? 0 : Number(addonForm.price),
      type: isFree ? "free" : addonForm.type,
      image: addonForm.image || "",
    };
    let updated;
    if (editingAddon === "new") {
      updated = [...addons, formatted];
    } else {
      updated = addons.map((a) => (a.id === editingAddon ? formatted : a));
    }
    setAddons(updated);
    saveAddons(updated);
    setEditingAddon(null);
  };

  const handleDeleteAddon = (id) => {
    if (window.confirm("Are you sure you want to delete this add-on service?")) {
      const updated = addons.filter((a) => a.id !== id);
      setAddons(updated);
      saveAddons(updated);
    }
  };

  // Cloud force sync state
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState(false);

  const handleForceSyncCloud = async () => {
    try {
      setCloudSyncing(true);
      await forcePushAllToCloud();
      setCloudSyncSuccess(true);
      setTimeout(() => setCloudSyncSuccess(false), 4000);
    } catch (err) {
      alert("Failed to sync to cloud: " + err.message);
    } finally {
      setCloudSyncing(false);
    }
  };

  // Coupons Edit/Add state
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    id: "",
    code: "",
    discountType: "percent",
    discountValue: 10,
    expireDate: "2026-12-31",
    usageLimit: 10,
    usedCount: 0,
    description: "",
  });

  const handleOpenCouponForm = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon.id);
      setCouponForm({
        ...coupon,
        usageLimit: coupon.usageLimit ?? 10,
        usedCount: coupon.usedCount ?? 0,
      });
    } else {
      setEditingCoupon("new");
      setCouponForm({
        id: "coupon-" + Date.now(),
        code: "",
        discountType: "percent",
        discountValue: 10,
        expireDate: "2026-12-31",
        usageLimit: 10,
        usedCount: 0,
        description: "",
      });
    }
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert("Please enter a coupon code");
      return;
    }
    const formatted = {
      ...couponForm,
      code: couponForm.code.trim().toUpperCase(),
      discountValue: Number(couponForm.discountValue),
      usageLimit: Number(couponForm.usageLimit) || 10,
      usedCount: Number(couponForm.usedCount) || 0,
    };

    let updated;
    if (editingCoupon === "new") {
      updated = [...coupons, formatted];
    } else {
      updated = coupons.map((c) => (c.id === editingCoupon ? formatted : c));
    }

    setCoupons(updated);
    saveCoupons(updated);
    setEditingCoupon(null);
    setSaveSuccessMsg("Coupon saved successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      const updated = coupons.filter((c) => c.id !== id);
      setCoupons(updated);
      saveCoupons(updated);
    }
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === (settings.adminPin || "1234")) {
      setIsAuthenticated(true);
      setPinError("");
      setSettingsForm({ ...settings });
      try {
        localStorage.setItem("siemreap_admin_authenticated", "true");
      } catch (e) {}
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    try {
      localStorage.removeItem("siemreap_admin_authenticated");
    } catch (e) {}
  };

  // ROOM ACTIONS
  const handleOpenRoomForm = (room = null) => {
    if (room) {
      setEditingRoom(room.id);
      setRoomForm({
        ...room,
        amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : room.amenities || "",
      });
    } else {
      setEditingRoom("new");
      setRoomForm({
        id: "room-" + Date.now(),
        name: "",
        category: "Deluxe",
        pricePerNight: 25,
        capacity: "2 Guests",
        bed: "1 King Bed",
        image: "",
        amenities: "Air Conditioning, High-speed WiFi, Hot Shower, Swimming Pool Access",
        description: "",
        badge: "New",
      });
    }
  };

  const handleRoomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setRoomUploading(true);
      const binaryUrl = await convertFileToBinaryDataUrl(file);
      setRoomForm((prev) => ({ ...prev, image: binaryUrl }));
    } catch (err) {
      console.error("Failed to convert image to binary code", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setRoomUploading(false);
    }
  };

  const handleSaveRoom = (e) => {
    e.preventDefault();
    const amenitiesArr = typeof roomForm.amenities === "string"
      ? roomForm.amenities.split(",").map((s) => s.trim()).filter(Boolean)
      : roomForm.amenities;

    const formatted = {
      ...roomForm,
      pricePerNight: Number(roomForm.pricePerNight),
      amenities: amenitiesArr,
    };

    let updatedRooms;
    if (editingRoom === "new") {
      updatedRooms = [...rooms, formatted];
    } else {
      updatedRooms = rooms.map((r) => (r.id === editingRoom ? formatted : r));
    }

    setRooms(updatedRooms);
    saveRooms(updatedRooms);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      const updated = rooms.filter((r) => r.id !== id);
      setRooms(updated);
      saveRooms(updated);
    }
  };

  // MOTO ACTIONS
  const handleOpenMotoForm = (moto = null) => {
    if (moto) {
      setEditingMoto(moto.id);
      setMotoForm({
        ...moto,
        features: Array.isArray(moto.features) ? moto.features.join(", ") : moto.features || "",
      });
    } else {
      setEditingMoto("new");
      setMotoForm({
        id: "moto-" + Date.now(),
        name: "",
        pricePerDay: 10,
        image: "",
        features: "2 Helmets Included, Phone Mount for Google Maps, USB Charger, Free Raincoat",
        badge: "Popular",
      });
    }
  };

  const handleMotoImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMotoUploading(true);
      const binaryUrl = await convertFileToBinaryDataUrl(file);
      setMotoForm((prev) => ({ ...prev, image: binaryUrl }));
    } catch (err) {
      console.error("Failed to convert image to binary code", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setMotoUploading(false);
    }
  };

  const handleSaveMoto = (e) => {
    e.preventDefault();
    const featuresArr = typeof motoForm.features === "string"
      ? motoForm.features.split(",").map((s) => s.trim()).filter(Boolean)
      : motoForm.features;

    const formatted = {
      ...motoForm,
      pricePerDay: Number(motoForm.pricePerDay),
      features: featuresArr,
    };

    let updatedMotos;
    if (editingMoto === "new") {
      updatedMotos = [...motos, formatted];
    } else {
      updatedMotos = motos.map((m) => (m.id === editingMoto ? formatted : m));
    }

    setMotos(updatedMotos);
    saveMotos(updatedMotos);
    setEditingMoto(null);
  };

  const handleDeleteMoto = (id) => {
    if (window.confirm("Are you sure you want to delete this motorbike?")) {
      const updated = motos.filter((m) => m.id !== id);
      setMotos(updated);
      saveMotos(updated);
    }
  };

  // SETTINGS SAVE
  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    const formatted = {
      ...settingsForm,
      comboDiscountPercent: Number(settingsForm.comboDiscountPercent),
      exchangeRateKHR: Number(settingsForm.exchangeRateKHR),
    };
    setSettings(formatted);
    saveSettings(formatted);
    setSaveSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  // CLEAR ALL DATA
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to wipe all rooms, motos, and inquiries data?")) {
      clearAllData();
      setRooms([]);
      setMotos([]);
      setInquiries([]);
      setSaveSuccessMsg("All data cleared successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }
  };

  // Filtered & Sorted Coupons (Status filter & Expiration sort)
  const displayedCoupons = coupons
    .filter((coupon) => {
      const today = new Date().toISOString().split("T")[0];
      const isExpired = coupon.expireDate && today > coupon.expireDate;
      const usageLimit = Number(coupon.usageLimit) || 10;
      const usedCount = Number(coupon.usedCount) || 0;
      const isLimitReached = usedCount >= usageLimit;
      const isActive = !isExpired && !isLimitReached;

      if (couponFilterStatus === "active" && !isActive) return false;
      if (couponFilterStatus === "expired" && !isExpired) return false;
      if (couponFilterStatus === "limit" && !isLimitReached) return false;

      if (couponSearch.trim()) {
        const q = couponSearch.toLowerCase();
        const matchCode = coupon.code?.toLowerCase().includes(q);
        const matchDesc = coupon.description?.toLowerCase().includes(q);
        if (!matchCode && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (couponSort === "expire-asc") {
        return (a.expireDate || "9999") > (b.expireDate || "9999") ? 1 : -1;
      }
      if (couponSort === "expire-desc") {
        return (a.expireDate || "0000") < (b.expireDate || "0000") ? 1 : -1;
      }
      if (couponSort === "usage-desc") {
        return (Number(b.usedCount) || 0) - (Number(a.usedCount) || 0);
      }
      if (couponSort === "usage-asc") {
        return (Number(a.usedCount) || 0) - (Number(b.usedCount) || 0);
      }
      if (couponSort === "discount-desc") {
        return (Number(b.discountValue) || 0) - (Number(a.discountValue) || 0);
      }
      if (couponSort === "code-asc") {
        return (a.code || "").localeCompare(b.code || "");
      }
      return 0;
    });

  // Filtered & Sorted Add-ons
  const displayedAddons = addons
    .filter((addon) => {
      const isFree = addon.type === "free" || Number(addon.price) === 0;
      if (addonFilterType === "free" && !isFree) return false;
      if (addonFilterType === "paid" && isFree) return false;
      if (addonSearch.trim()) {
        const q = addonSearch.toLowerCase();
        const matchName = addon.name?.toLowerCase().includes(q);
        const matchDesc = addon.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (addonSort === "price-asc") return Number(a.price) - Number(b.price);
      if (addonSort === "price-desc") return Number(b.price) - Number(a.price);
      return (a.name || "").localeCompare(b.name || "");
    });

  // Filtered & Sorted Rooms
  const displayedRooms = rooms
    .filter((room) => {
      if (roomCategoryFilter !== "all" && room.category !== roomCategoryFilter) return false;
      if (roomSearch.trim()) {
        const q = roomSearch.toLowerCase();
        const matchName = room.name?.toLowerCase().includes(q);
        const matchDesc = room.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (roomSort === "price-asc") return Number(a.pricePerNight) - Number(b.pricePerNight);
      if (roomSort === "price-desc") return Number(b.pricePerNight) - Number(a.pricePerNight);
      return (a.name || "").localeCompare(b.name || "");
    });

  // Filtered & Sorted Motos
  const displayedMotos = motos
    .filter((moto) => {
      if (motoSearch.trim()) {
        const q = motoSearch.toLowerCase();
        const matchName = moto.name?.toLowerCase().includes(q);
        const matchFeatures = moto.features?.toLowerCase().includes(q);
        if (!matchName && !matchFeatures) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (motoSort === "price-asc") return Number(a.pricePerDay) - Number(b.pricePerDay);
      if (motoSort === "price-desc") return Number(b.pricePerDay) - Number(a.pricePerDay);
      return (a.name || "").localeCompare(b.name || "");
    });

  // Filtered & Sorted Inquiries
  const displayedInquiries = inquiries
    .filter((inq) => {
      if (inquiryFilter === "with-room" && !inq.roomName) return false;
      if (inquiryFilter === "with-moto" && !inq.motoName) return false;
      if (inquiryFilter === "with-extra" && (!inq.addons || inq.addons.length === 0)) return false;
      return true;
    })
    .sort((a, b) => {
      if (inquirySort === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (inquirySort === "total-desc") return Number(b.totalUSD || 0) - Number(a.totalUSD || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {!isAuthenticated ? (
        /* PIN LOCK SCREEN */
        <div>
          <header className="site-header">
            <div className="nav-container">
              <div className="brand-wrapper">
                <img
                  src={logoImg}
                  alt="Siemreap Angkor Logo"
                  className="brand-logo-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/logo.png";
                  }}
                />
                <div className="brand-text-block">
                  <div className="brand-title">Siemreap Angkor • Admin</div>
                  <div className="brand-subtitle" style={{ color: "#34d399" }}>Management Portal</div>
                </div>
              </div>

              <div className="nav-actions">
                <Link
                  to="/dashboard"
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  <ExternalLink size={15} />
                  <span>Customer Dashboard</span>
                </Link>
              </div>
            </div>
          </header>

          <div style={{ maxWidth: "380px", margin: "60px auto", padding: "36px", textAlign: "center", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f1f5f9",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <ShieldCheck size={30} />
            </div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "8px", color: "#0f172a" }}>Admin Access</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px" }}>
              Please enter your PIN to manage rooms, motorbikes, pricing, and settings.
            </p>

            <form onSubmit={handlePinSubmit}>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <input
                  type={showPin ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  style={{ textAlign: "center", letterSpacing: showPin ? "2px" : "6px", fontSize: "1.3rem", paddingRight: "42px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                  title={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {pinError && (
                <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "14px", fontWeight: 600 }}>
                  {pinError}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }}>
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN DASHBOARD WITH LEFT SIDEBAR MENU */
        <div className="admin-dashboard-layout">
          {/* Mobile Backdrop */}
          {sidebarOpen && (
            <div
              className="admin-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Left Sidebar Menu */}
          <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
            <div className="admin-sidebar-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={logoImg}
                  alt="Logo"
                  style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "contain", background: "#ffffff", padding: "2px" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/logo.png";
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#ffffff", letterSpacing: "-0.01em" }}>
                    Siemreap Angkor
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Admin Portal
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="admin-hamburger-btn"
                onClick={() => setSidebarOpen(false)}
                style={{ color: "#ffffff", background: "transparent", border: "none", padding: "4px" }}
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="admin-sidebar-nav">
              <div className="admin-sidebar-section-title">Store Inventory</div>
              <button
                className={`admin-sidebar-btn ${activeTab === "rooms" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("rooms"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BedDouble size={18} />
                  <span>Rooms</span>
                </div>
                <span className="admin-badge-count">{rooms.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "motos" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("motos"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Bike size={18} />
                  <span>Motorbikes</span>
                </div>
                <span className="admin-badge-count">{motos.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "addons" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("addons"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <PackageCheck size={18} />
                  <span>Add-on Services</span>
                </div>
                <span className="admin-badge-count">{addons.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "coupons" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("coupons"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <TicketPercent size={18} />
                  <span>Coupons & Promo</span>
                </div>
                <span className="admin-badge-count">{coupons.length}</span>
              </button>

              <div className="admin-sidebar-section-title" style={{ marginTop: "14px" }}>System</div>
              <button
                className={`admin-sidebar-btn ${activeTab === "settings" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <SettingsIcon size={18} />
                  <span>Telegram & Settings</span>
                </div>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "inquiries" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("inquiries"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ListOrdered size={18} />
                  <span>Recent Inquiries</span>
                </div>
                <span className="admin-badge-count">{inquiries.length}</span>
              </button>
            </nav>

            <div className="admin-sidebar-footer">
              <Link
                to="/dashboard"
                className="btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                  background: "rgba(255, 255, 255, 0.06)",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                }}
              >
                <ExternalLink size={14} />
                <span>View Customer Site</span>
              </Link>

              <button
                className="btn-secondary"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "9px",
                  fontSize: "0.82rem",
                  color: "#f87171",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.2)",
                }}
              >
                <Lock size={14} />
                <span>Lock / Exit</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <div className="admin-main-wrapper">
            {/* Topbar */}
            <header className="admin-topbar">
              <div className="admin-topbar-left">
                <button
                  type="button"
                  className="admin-hamburger-btn"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open Menu"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="admin-topbar-title">
                    {activeTab === "rooms" && "Rooms Management"}
                    {activeTab === "motos" && "Motorbike Inventory"}
                    {activeTab === "addons" && "Add-on Services"}
                    {activeTab === "coupons" && "Coupons & Discounts"}
                    {activeTab === "settings" && "Telegram & Pricing Settings"}
                    {activeTab === "inquiries" && "Customer Inquiry Logs"}
                  </h1>
                </div>
              </div>

              <div className="admin-topbar-right">
                <button
                  type="button"
                  onClick={handleForceSyncCloud}
                  disabled={cloudSyncing}
                  className="btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    color: cloudSyncSuccess ? "#059669" : "#0284c7",
                    background: cloudSyncSuccess ? "rgba(16, 185, 129, 0.08)" : "rgba(2, 132, 199, 0.08)",
                    borderColor: cloudSyncSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(2, 132, 199, 0.3)",
                  }}
                  title="Push all rooms, motos, addons & settings to cloud to sync across all phones & PCs"
                >
                  <RefreshCw size={14} style={{ animation: cloudSyncing ? "spin 1s linear infinite" : "none" }} />
                  <span className="brand-text-block">
                    {cloudSyncing ? "Syncing..." : cloudSyncSuccess ? "Cloud Synced!" : "Sync All Devices"}
                  </span>
                </button>
                <Link
                  to="/dashboard"
                  className="btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    fontSize: "0.82rem",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} />
                  <span className="brand-text-block">Preview Site</span>
                </Link>
                <button
                  className="btn-secondary"
                  onClick={handleLogout}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    color: "#ef4444",
                  }}
                  title="Lock Admin"
                >
                  <Lock size={14} />
                  <span className="brand-text-block">Lock</span>
                </button>
              </div>
            </header>

            {/* Content Body */}
            <main className="admin-content-body">
              {/* Quick Metrics Row */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{rooms.length}</div>
                    <div className="admin-stat-lbl">Active Rooms</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#ecfdf5", color: "#059669" }}>
                    <Bike size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{motos.length}</div>
                    <div className="admin-stat-lbl">Motorbikes</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <TicketPercent size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{coupons.length}</div>
                    <div className="admin-stat-lbl">Promo Coupons</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                    <ListOrdered size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{inquiries.length}</div>
                    <div className="admin-stat-lbl">Total Inquiries</div>
                  </div>
                </div>
              </div>

              {/* Main Active Tab Content Card */}
              <div className="admin-card-container">
                {/* TAB 1: ROOMS */}
                {activeTab === "rooms" && (
              <div>
                {!editingRoom ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                        {rooms.length} {rooms.length === 1 ? "room" : "rooms"} available on customer dashboard
                      </span>
                      <button className="btn-primary" onClick={() => handleOpenRoomForm(null)}>
                        <Plus size={16} />
                        <span>Add New Room</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search room name or desc..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={roomSearch}
                          onChange={(e) => setRoomSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={roomCategoryFilter}
                          onChange={(e) => setRoomCategoryFilter(e.target.value)}
                        >
                          <option value="all">All Categories ({rooms.length})</option>
                          {Array.from(new Set(rooms.map((r) => r.category).filter(Boolean))).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={roomSort}
                          onChange={(e) => setRoomSort(e.target.value)}
                        >
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="name-asc">Name: A to Z</option>
                        </select>
                      </div>
                    </div>

                    {displayedRooms.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        {rooms.length === 0
                          ? "No rooms created yet. Click \"Add New Room\" above to list your rooms!"
                          : "No rooms match your filter criteria. Try clearing search or selecting \"All Categories\"."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Room Name</th>
                              <th>Price / Night</th>
                              <th>Capacity</th>
                              <th>Badge</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedRooms.map((room) => (
                              <tr key={room.id}>
                                <td>
                                  {room.image ? (
                                    <img
                                      src={room.image}
                                      alt=""
                                      style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                  ) : (
                                    <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <BedDouble size={20} color="#64748b" />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{room.name}</div>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{room.category} • {room.bed}</div>
                                </td>
                                <td style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", fontSize: "1.05rem" }}>${room.pricePerNight}</td>
                                <td style={{ color: "#334155" }}>{room.capacity}</td>
                                <td>
                                  {room.badge && <span className="badge-gold">{room.badge}</span>}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenRoomForm(room)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteRoom(room.id)}
                                    style={{ padding: "6px 10px", color: "#f43f5e" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ROOM FORM */
                  <form onSubmit={handleSaveRoom} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>{editingRoom === "new" ? "Add New Room" : "Edit Room"}</h3>
                      <button type="button" className="btn-secondary" onClick={() => setEditingRoom(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Room Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={roomForm.name}
                          onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                          placeholder="e.g. Deluxe Balcony Room"
                        />
                      </div>
                      <div>
                        <label className="date-label">Price Per Night (USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={roomForm.pricePerNight}
                          onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Category</label>
                        <input
                          type="text"
                          className="input-field"
                          value={roomForm.category}
                          onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="date-label">Capacity</label>
                        <input
                          type="text"
                          className="input-field"
                          value={roomForm.capacity}
                          onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="date-label">Bed Type</label>
                        <input
                          type="text"
                          className="input-field"
                          value={roomForm.bed}
                          onChange={(e) => setRoomForm({ ...roomForm, bed: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Photo (Upload File converts to Binary Code, or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Paste image URL or click Upload Photo to store binary code"
                          value={roomForm.image}
                          onChange={(e) => setRoomForm({ ...roomForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{roomUploading ? "Converting..." : "Upload Photo (Binary)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleRoomImageUpload}
                            disabled={roomUploading}
                          />
                        </label>
                      </div>
                      {roomForm.image && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                          <img
                            src={roomForm.image}
                            alt="Preview"
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-medium)" }}
                          />
                          <div>
                            <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check size={13} /> {roomForm.image.startsWith("data:") ? "Binary Code Stored" : "URL Configured"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRoomForm({ ...roomForm, image: "" })}
                              style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="date-label">Amenities (Comma separated or click to add)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={roomForm.amenities}
                        onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                        placeholder="Air Conditioning, High-speed WiFi, Hot Shower, Swimming Pool Access"
                      />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {[
                          "Air Conditioning",
                          "High-speed WiFi",
                          "Hot Shower",
                          "Swimming Pool Access",
                          "Balcony",
                          "Breakfast Included",
                          "Refrigerator",
                          "Daily Housekeeping",
                        ].map((amenity) => {
                          const currentArr = typeof roomForm.amenities === "string"
                            ? roomForm.amenities.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];
                          const isIncluded = currentArr.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                const updated = isIncluded
                                  ? currentArr.filter((a) => a !== amenity)
                                  : [...currentArr, amenity];
                                setRoomForm({ ...roomForm, amenities: updated.join(", ") });
                              }}
                              className="tag-mini"
                              style={{
                                cursor: "pointer",
                                padding: "4px 9px",
                                background: isIncluded ? "#0f172a" : "#f1f5f9",
                                color: isIncluded ? "#ffffff" : "#475569",
                                border: isIncluded ? "1px solid #0f172a" : "1px solid #e2e8f0",
                              }}
                            >
                              {isIncluded ? "✓ " : "+ "}
                              {amenity}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Description</label>
                      <textarea
                        className="input-field"
                        rows="2"
                        value={roomForm.description}
                        onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="date-label">Badge</label>
                      <input
                        type="text"
                        className="input-field"
                        value={roomForm.badge}
                        onChange={(e) => setRoomForm({ ...roomForm, badge: e.target.value })}
                        placeholder="e.g. Popular, Best Value"
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Room
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: MOTOS */}
            {activeTab === "motos" && (
              <div>
                {!editingMoto ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                        {motos.length} {motos.length === 1 ? "motorbike" : "motorbikes"} available on customer dashboard
                      </span>
                      <button className="btn-primary" onClick={() => handleOpenMotoForm(null)}>
                        <Plus size={16} />
                        <span>Add New Motorbike</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search moto name or features..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={motoSearch}
                          onChange={(e) => setMotoSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={motoSort}
                          onChange={(e) => setMotoSort(e.target.value)}
                        >
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="name-asc">Name: A to Z</option>
                        </select>
                      </div>
                    </div>

                    {displayedMotos.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        {motos.length === 0
                          ? "No motorbikes created yet. Click \"Add New Motorbike\" above to list your scooters!"
                          : "No motorbikes match your search criteria. Try clearing search."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Moto Name</th>
                              <th>Price / Day</th>
                              <th>Badge</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedMotos.map((moto) => (
                              <tr key={moto.id}>
                                <td>
                                  {moto.image ? (
                                    <img
                                      src={moto.image}
                                      alt=""
                                      style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                  ) : (
                                    <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Bike size={20} color="#64748b" />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{moto.name}</div>
                                </td>
                                <td style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", fontSize: "1.05rem" }}>${moto.pricePerDay}</td>
                                <td>
                                  {moto.badge && <span className="badge-emerald">{moto.badge}</span>}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenMotoForm(moto)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteMoto(moto.id)}
                                    style={{ padding: "6px 10px", color: "#f43f5e" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MOTO FORM */
                  <form onSubmit={handleSaveMoto} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>{editingMoto === "new" ? "Add New Motorbike" : "Edit Motorbike"}</h3>
                      <button type="button" className="btn-secondary" onClick={() => setEditingMoto(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      <div>
                        <label className="date-label">Model Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={motoForm.name}
                          onChange={(e) => setMotoForm({ ...motoForm, name: e.target.value })}
                          placeholder="e.g. Honda Scoopy 110cc"
                        />
                      </div>
                      <div>
                        <label className="date-label">Price Per Day (USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={motoForm.pricePerDay}
                          onChange={(e) => setMotoForm({ ...motoForm, pricePerDay: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="date-label">Badge (Optional)</label>
                        <input
                          type="text"
                          className="input-field"
                          value={motoForm.badge}
                          onChange={(e) => setMotoForm({ ...motoForm, badge: e.target.value })}
                          placeholder="e.g. Top Seller, Popular"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Photo (Upload File converts to Binary Code, or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Paste image URL or click Upload Photo to store binary code"
                          value={motoForm.image}
                          onChange={(e) => setMotoForm({ ...motoForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{motoUploading ? "Converting..." : "Upload Photo (Binary)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleMotoImageUpload}
                            disabled={motoUploading}
                          />
                        </label>
                      </div>
                      {motoForm.image && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                          <img
                            src={motoForm.image}
                            alt="Preview"
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-medium)" }}
                          />
                          <div>
                            <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check size={13} /> {motoForm.image.startsWith("data:") ? "Binary Code Stored" : "URL Configured"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMotoForm({ ...motoForm, image: "" })}
                              style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="date-label">Features & Inclusions (Comma separated or click to add)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={motoForm.features}
                        onChange={(e) => setMotoForm({ ...motoForm, features: e.target.value })}
                        placeholder="2 Helmets Included, Phone Mount for Google Maps, USB Charger, Free Raincoat"
                      />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {[
                          "2 Helmets Included",
                          "Phone Mount for Google Maps",
                          "USB Charger",
                          "Free Raincoat",
                          "Full Petrol Tank",
                          "Cable Lock",
                          "Automatic Transmission",
                          "Luggage Storage",
                        ].map((feature) => {
                          const currentArr = typeof motoForm.features === "string"
                            ? motoForm.features.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];
                          const isIncluded = currentArr.includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => {
                                const updated = isIncluded
                                  ? currentArr.filter((f) => f !== feature)
                                  : [...currentArr, feature];
                                setMotoForm({ ...motoForm, features: updated.join(", ") });
                              }}
                              className="tag-mini"
                              style={{
                                cursor: "pointer",
                                padding: "4px 9px",
                                background: isIncluded ? "#0f172a" : "#f1f5f9",
                                color: isIncluded ? "#ffffff" : "#475569",
                                border: isIncluded ? "1px solid #0f172a" : "1px solid #e2e8f0",
                              }}
                            >
                              {isIncluded ? "✓ " : "+ "}
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Motorbike
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB: ADD-ONS (STEP 3 EXTRA SERVICES) */}
            {activeTab === "addons" && (
              <div>
                {!editingAddon ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                          Add-on Services (Step 3)
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Manage free inclusions and paid accessories. Filter by Free/Paid or sort by price.
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => handleOpenAddonForm(null)}>
                        <Plus size={16} />
                        <span>Add New Add-on</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search service name or desc..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={addonSearch}
                          onChange={(e) => setAddonSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={addonFilterType}
                          onChange={(e) => setAddonFilterType(e.target.value)}
                        >
                          <option value="all">All Types ({addons.length})</option>
                          <option value="free">Free Inclusions Only</option>
                          <option value="paid">Paid Extras Only</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={addonSort}
                          onChange={(e) => setAddonSort(e.target.value)}
                        >
                          <option value="name-asc">Name: A to Z</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>

                    {displayedAddons.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed var(--border-medium)", borderRadius: "8px" }}>
                        {addons.length === 0
                          ? "No add-on services configured. Click \"Add New Add-on\" above to create extra services like Airport Shuttle, Extra Helmets, SIM Card, etc.!"
                          : "No services match your filter criteria. Try selecting \"All Types\" or clearing search."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th style={{ width: "60px" }}>Photo</th>
                              <th>Service Name</th>
                              <th>Price (USD)</th>
                              <th>Billing Type</th>
                              <th>Description</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedAddons.map((addon) => (
                              <tr key={addon.id}>
                                <td style={{ width: "60px" }}>
                                  {addon.image ? (
                                    <img
                                      src={addon.image}
                                      alt=""
                                      style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                  ) : (
                                    <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <PackageCheck size={20} color="#64748b" />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{addon.name}</div>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700, color: addon.price === 0 ? "#059669" : "#0f172a" }}>
                                    {addon.price === 0 ? "FREE" : `$${addon.price}`}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge-sale" style={{ background: addon.type === "per-day" ? "#0f172a" : "#475569" }}>
                                    {addon.type === "per-day" ? "Per Day" : "One-Time"}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "340px" }}>
                                    {addon.description}
                                  </div>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenAddonForm(addon)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteAddon(addon.id)}
                                    style={{ padding: "6px 10px", color: "#ef4444" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ADD-ON FORM */
                  <form onSubmit={handleSaveAddon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>{editingAddon === "new" ? "Add New Add-on / Extra Service" : "Edit Add-on Service"}</h3>
                      <button type="button" className="btn-secondary" onClick={() => setEditingAddon(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Service Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={addonForm.name}
                          onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                          placeholder="e.g. Extra Certified Helmet"
                        />
                      </div>
                      <div>
                        <label className="date-label">Price in USD (0 for Free)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.5"
                          className="input-field"
                          value={addonForm.price}
                          onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Billing Type</label>
                        <select
                          className="input-field"
                          value={addonForm.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setAddonForm({
                              ...addonForm,
                              type: newType,
                              price: newType === "free" ? 0 : (Number(addonForm.price) === 0 ? 5 : addonForm.price),
                            });
                          }}
                        >
                          <option value="one-time">One-Time Fee (e.g. Airport Shuttle, SIM card)</option>
                          <option value="per-day">Per Day (multiplied by rental days, e.g. Extra Helmet)</option>
                          <option value="free">Free Inclusions (e.g. Temple Route Map, Free Helmet)</option>
                        </select>
                      </div>

                      <div>
                        <label className="date-label">Short Description</label>
                        <input
                          type="text"
                          className="input-field"
                          value={addonForm.description}
                          onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                          placeholder="e.g. Sanitized helmet for passenger"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Photo (Upload File converts to Binary Code, or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Paste image URL or click Upload Photo to store binary code"
                          value={addonForm.image || ""}
                          onChange={(e) => setAddonForm({ ...addonForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{addonUploading ? "Converting..." : "Upload Photo (Binary)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAddonImageUpload}
                            disabled={addonUploading}
                          />
                        </label>
                      </div>
                      {addonForm.image && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                          <img
                            src={addonForm.image}
                            alt="Preview"
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-medium)" }}
                          />
                          <div>
                            <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check size={13} /> {addonForm.image.startsWith("data:") ? "Binary Code Stored" : "URL Configured"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddonForm({ ...addonForm, image: "" })}
                              style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Add-on Service
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB: COUPONS & DISCOUNTS */}
            {activeTab === "coupons" && (
              <div>
                {!editingCoupon ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                          Coupons & Discount Codes
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Filter by active/expired status and sort by expiration or usage for fast management.
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => handleOpenCouponForm(null)}>
                        <Plus size={16} />
                        <span>Add New Coupon</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search code or desc..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={couponSearch}
                          onChange={(e) => setCouponSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={couponFilterStatus}
                          onChange={(e) => setCouponFilterStatus(e.target.value)}
                        >
                          <option value="all">All Statuses ({coupons.length})</option>
                          <option value="active">Active Only</option>
                          <option value="expired">Expired Only</option>
                          <option value="limit">Limit Reached</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={couponSort}
                          onChange={(e) => setCouponSort(e.target.value)}
                        >
                          <option value="expire-asc">Exp: Soonest First</option>
                          <option value="expire-desc">Exp: Furthest First</option>
                          <option value="usage-desc">Usage: Most Used</option>
                          <option value="usage-asc">Usage: Least Used</option>
                          <option value="discount-desc">Discount: High to Low</option>
                          <option value="code-asc">Code: A to Z</option>
                        </select>
                      </div>
                    </div>

                    {displayedCoupons.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        {coupons.length === 0
                          ? "No coupons created yet. Click \"Add New Coupon\" above to create your first promo code!"
                          : "No coupons match your filter criteria. Try selecting \"All Statuses\" or clearing search."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Coupon Code</th>
                              <th>Discount</th>
                              <th>Usage Limit (Used / Max)</th>
                              <th>Expiration Date</th>
                              <th>Status</th>
                              <th>Description</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedCoupons.map((coupon) => {
                              const today = new Date().toISOString().split("T")[0];
                              const isExpired = coupon.expireDate && today > coupon.expireDate;
                              const usageLimit = Number(coupon.usageLimit) || 10;
                              const usedCount = Number(coupon.usedCount) || 0;
                              const isLimitReached = usedCount >= usageLimit;

                              return (
                                <tr key={coupon.id}>
                                  <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <TicketPercent size={15} color="#2563eb" />
                                      <span style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", letterSpacing: "0.05em" }}>
                                        {coupon.code}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 800, color: "#0f172a" }}>
                                      {coupon.discountType === "percent" ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} USD OFF`}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 800, color: isLimitReached ? "#b91c1c" : "#0f172a" }}>
                                      {usedCount} / {usageLimit} people
                                    </span>
                                    <div style={{ fontSize: "0.72rem", color: isLimitReached ? "#b91c1c" : "#64748b" }}>
                                      {isLimitReached ? "0 slots left (closed)" : `${usageLimit - usedCount} slots available`}
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                                      {coupon.expireDate || "No Expiry"}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        fontSize: "0.72rem",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        background: isLimitReached ? "#fee2e2" : isExpired ? "#fee2e2" : "#dcfce7",
                                        color: isLimitReached ? "#b91c1c" : isExpired ? "#b91c1c" : "#15803d",
                                      }}
                                    >
                                      {isLimitReached ? "Limit Reached" : isExpired ? "Expired" : "Active"}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "260px" }}>
                                      {coupon.description || "—"}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <button
                                      className="btn-secondary"
                                      onClick={() => handleOpenCouponForm(coupon)}
                                      style={{ padding: "6px 10px", marginRight: "6px" }}
                                      title="Edit coupon"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      onClick={() => handleDeleteCoupon(coupon.id)}
                                      style={{ padding: "6px 10px", color: "#ef4444" }}
                                      title="Delete coupon"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* COUPON FORM */
                  <form onSubmit={handleSaveCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                        {editingCoupon === "new" ? "Create New Promo Coupon" : `Edit Coupon: ${couponForm.code}`}
                      </h3>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingCoupon(null)}
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", fontSize: "0.78rem" }}
                      >
                        <span>(close)</span>
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Coupon Code (Uppercase)</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. ANGKOR10 or WELCOME5"
                          style={{ textTransform: "uppercase", fontWeight: 700 }}
                        />
                      </div>

                      <div>
                        <label className="date-label">Discount Type</label>
                        <select
                          className="input-field"
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                        >
                          <option value="percent">Percentage (% off total)</option>
                          <option value="fixed">Fixed Amount ($ off total)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      <div>
                        <label className="date-label">
                          Discount Value {couponForm.discountType === "percent" ? "(%)" : "($ USD)"}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={couponForm.discountType === "percent" ? 100 : 500}
                          className="input-field"
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="date-label">Usage Limit (Max People / Times)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={couponForm.usageLimit}
                          onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                          placeholder="e.g. 10 (can only be used by 10 people)"
                        />
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                          Limit how many customers can claim this promo (e.g. 10 people)
                        </div>
                      </div>

                      <div>
                        <label className="date-label">Expiration Date</label>
                        <input
                          type="date"
                          required
                          className="input-field"
                          value={couponForm.expireDate}
                          onChange={(e) => setCouponForm({ ...couponForm, expireDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Description / Promotion Note</label>
                      <input
                        type="text"
                        className="input-field"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        placeholder="e.g. 10% discount for holiday booking in Siem Reap (max 10 people)"
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingCoupon(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save Coupon
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB: SETTINGS & TELEGRAM */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label className="date-label">Telegram Username (without @)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.telegramUsername}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramUsername: e.target.value })}
                      placeholder="e.g. siemreapangkor"
                    />
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                      Customer quotes are sent directly to https://t.me/{settingsForm.telegramUsername || "..."}
                    </div>
                  </div>

                  <div>
                    <label className="date-label">Contact Phone / WhatsApp</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
                  <div>
                    <label className="date-label">Combo Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="input-field"
                      value={settingsForm.comboDiscountPercent}
                      onChange={(e) => setSettingsForm({ ...settingsForm, comboDiscountPercent: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="date-label">USD to KHR Rate (៛)</label>
                    <input
                      type="number"
                      min="1000"
                      className="input-field"
                      value={settingsForm.exchangeRateKHR}
                      onChange={(e) => setSettingsForm({ ...settingsForm, exchangeRateKHR: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="date-label">Admin PIN</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.adminPin}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="date-label">Top Announcement Bar Text (Promo Banner)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={settingsForm.topPromoText !== undefined ? settingsForm.topPromoText : ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, topPromoText: e.target.value })}
                    placeholder="e.g. FREE 2 HELMETS & PHONE HOLDER WITH EVERY MOTORBIKE • INSTANT PREVIEW"
                  />
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    Displays at the very top of the customer booking page.
                  </div>
                </div>

                <div>
                  <label className="date-label">Address in Siem Reap</label>
                  <input
                    type="text"
                    className="input-field"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  />
                </div>

                {saveSuccessMsg && (
                  <div style={{ color: "#34d399", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check size={16} />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                  Update Settings
                </button>
              </form>
            )}

            {/* TAB 4: INQUIRIES LOG */}
            {activeTab === "inquiries" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                      Customer Inquiry Logs
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                      Review incoming booking quotes, filtered by package components and sorted by date or value.
                    </div>
                  </div>
                </div>

                {/* Filter & Sort Bar */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Filter size={14} color="#64748b" />
                    <select
                      className="input-field"
                      style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                      value={inquiryFilter}
                      onChange={(e) => setInquiryFilter(e.target.value)}
                    >
                      <option value="all">All Inquiries ({inquiries.length})</option>
                      <option value="with-room">With Room Booking</option>
                      <option value="with-moto">With Motorbike Booking</option>
                      <option value="with-extra">With Extra Services</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ArrowUpDown size={14} color="#64748b" />
                    <select
                      className="input-field"
                      style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                      value={inquirySort}
                      onChange={(e) => setInquirySort(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="total-desc">Highest Total Price</option>
                    </select>
                  </div>
                </div>

                {displayedInquiries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                    {inquiries.length === 0
                      ? "No recent inquiries recorded yet. When users submit quotes on /dashboard, they will appear here."
                      : "No inquiries match your filter criteria. Try selecting \"All Inquiries\"."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {displayedInquiries.map((inq, index) => (
                      <div
                        key={inq.quoteId || index}
                        style={{
                          background: "#ffffff",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
                            Quote #{inq.quoteId}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "3px" }}>
                            {inq.roomName ? `Room: ${inq.roomName}` : "No Room"} • {inq.motoName ? `Moto: ${inq.motoName}` : "No Moto"}
                            {inq.addons && inq.addons.length > 0 ? ` • ${inq.addons.length} Add-on${inq.addons.length > 1 ? "s" : ""}` : ""}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "3px" }}>
                            Dates: {inq.startDate} → {inq.endDate} ({inq.days} days) • {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ""}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#059669" }}>
                            ${inq.totalUSD}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {inq.totalKHR?.toLocaleString()} KHR
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
