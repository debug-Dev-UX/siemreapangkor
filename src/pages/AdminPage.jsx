import React, { useState } from "react";
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
} from "../utils/storageHelper";

export default function AdminPage() {
  const [data, setData] = useState(() => loadStoredData());
  const [rooms, setRooms] = useState(data.rooms);
  const [motos, setMotos] = useState(data.motos);
  const [addons, setAddons] = useState(data.addons || []);
  const [settings, setSettings] = useState(data.settings);
  const [inquiries, setInquiries] = useState(data.inquiries);
  const [coupons, setCoupons] = useState(data.coupons || []);

  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("rooms"); // rooms, motos, addons, coupons, settings, inquiries
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [addonForm, setAddonForm] = useState({
    id: "",
    name: "",
    price: 5,
    type: "one-time",
    description: "",
  });

  const handleOpenAddonForm = (addon = null) => {
    if (addon) {
      setEditingAddon(addon.id);
      setAddonForm({ ...addon });
    } else {
      setEditingAddon("new");
      setAddonForm({
        id: "addon-" + Date.now(),
        name: "",
        price: 5,
        type: "one-time",
        description: "",
      });
    }
  };

  const handleSaveAddon = (e) => {
    e.preventDefault();
    const formatted = {
      ...addonForm,
      price: Number(addonForm.price),
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
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
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
                onClick={() => setIsAuthenticated(false)}
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
                  onClick={() => setIsAuthenticated(false)}
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

                    {rooms.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                        No rooms created yet. Click "Add New Room" above to list your rooms!
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
                            {rooms.map((room) => (
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

                    {motos.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                        No motorbikes created yet. Click "Add New Motorbike" above to list your scooters!
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
                            {motos.map((moto) => (
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {addons.length} {addons.length === 1 ? "service" : "services"} configured for Step 3
                      </span>
                      <button className="btn-primary" onClick={() => handleOpenAddonForm(null)}>
                        <Plus size={16} />
                        <span>Add New Add-on</span>
                      </button>
                    </div>

                    {addons.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed var(--border-medium)", borderRadius: "8px" }}>
                        No add-on services configured. Click "Add New Add-on" above to create extra services like Airport Shuttle, Extra Helmets, SIM Card, etc.!
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Service Name</th>
                              <th>Price (USD)</th>
                              <th>Billing Type</th>
                              <th>Description</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {addons.map((addon) => (
                              <tr key={addon.id}>
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
                          onChange={(e) => setAddonForm({ ...addonForm, type: e.target.value })}
                        >
                          <option value="one-time">One-Time Fee (e.g. Airport Shuttle, SIM card)</option>
                          <option value="per-day">Per Day (multiplied by rental days, e.g. Extra Helmet)</option>
                          <option value="free">Free Inclusions (e.g. Temple Route Map)</option>
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
                          Create promo codes with expiration dates. Customers can enter them for instant discounts.
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => handleOpenCouponForm(null)}>
                        <Plus size={16} />
                        <span>Add New Coupon</span>
                      </button>
                    </div>

                    {coupons.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        No coupons created yet. Click "Add New Coupon" above to create your first promo code!
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
                            {coupons.map((coupon) => {
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
                {inquiries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    No recent inquiries recorded yet. When users submit quotes on /dashboard, they will appear here.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {inquiries.map((inq, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          padding: "16px 20px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: "#fbbf24", fontSize: "1rem" }}>
                            Quote #{inq.quoteId}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginTop: "3px" }}>
                            {inq.roomName ? `Room: ${inq.roomName}` : "No Room"} • {inq.motoName ? `Moto: ${inq.motoName}` : "No Moto"}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "3px" }}>
                            Dates: {inq.startDate} → {inq.endDate} ({inq.days} days) • {new Date(inq.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#34d399" }}>
                            ${inq.totalUSD}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
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
