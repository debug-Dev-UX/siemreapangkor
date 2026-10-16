import React, { useState } from "react";
import {
  X,
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
  AlertCircle,
} from "lucide-react";
import { uploadImageToFirebase } from "../utils/storageHelper";

export default function AdminModal({
  isOpen,
  onClose,
  rooms,
  motos,
  settings,
  inquiries,
  onSaveRooms,
  onSaveMotos,
  onSaveSettings,
}) {
  const [pinInput, setPinInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("rooms"); // rooms, motos, settings, inquiries

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
    type: "Automatic",
    pricePerDay: 10,
    engine: "125cc Automatic",
    image: "",
    features: "2 Helmets Included, Phone Holder, USB Charger, Free Raincoat",
    badge: "Top Seller",
  });
  const [motoUploading, setMotoUploading] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === (settings.adminPin || "1234")) {
      setIsAuthenticated(true);
      setPinError("");
      setSettingsForm({ ...settings });
    } else {
      setPinError("Incorrect PIN! (Default PIN is 1234)");
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
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        amenities: "Air Conditioning, High-speed WiFi, Hot Shower, Swimming Pool Access",
        description: "",
        badge: "New",
      });
    }
  };

  const handleRoomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRoomUploading(true);
    const res = await uploadImageToFirebase(file, "rooms");
    setRoomForm((prev) => ({ ...prev, image: res.url }));
    setRoomUploading(false);
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

    onSaveRooms(updatedRooms);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      const updated = rooms.filter((r) => r.id !== id);
      onSaveRooms(updated);
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
        type: "Automatic",
        pricePerDay: 10,
        engine: "125cc Automatic",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        features: "2 Helmets Included, Phone Mount for Google Maps, USB Charger, Free Raincoat",
        badge: "Popular",
      });
    }
  };

  const handleMotoImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMotoUploading(true);
    const res = await uploadImageToFirebase(file, "motos");
    setMotoForm((prev) => ({ ...prev, image: res.url }));
    setMotoUploading(false);
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

    onSaveMotos(updatedMotos);
    setEditingMoto(null);
  };

  const handleDeleteMoto = (id) => {
    if (window.confirm("Are you sure you want to delete this motorbike?")) {
      const updated = motos.filter((m) => m.id !== id);
      onSaveMotos(updated);
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
    onSaveSettings(formatted);
    setSaveSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "880px" }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {!isAuthenticated ? (
          /* PIN LOCK SCREEN */
          <div style={{ maxWidth: "340px", margin: "40px auto", textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.15)",
                color: "#fbbf24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Lock size={26} />
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>Owner & Admin Access</h3>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "20px" }}>
              Enter your admin PIN to manage rooms, motorbikes, pricing, and settings.
            </p>

            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                className="input-field"
                placeholder="Enter PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1.2rem", marginBottom: "14px" }}
              />
              {pinError && (
                <div style={{ color: "#f43f5e", fontSize: "0.8rem", marginBottom: "12px" }}>
                  {pinError}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.4rem", color: "#fbbf24" }}>Siemreap Angkor Management</h3>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                  Manage rooms, motos, pricing, and direct sales configuration
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setIsAuthenticated(false)}
                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
              >
                Lock
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${activeTab === "rooms" ? "is-active" : ""}`}
                onClick={() => setActiveTab("rooms")}
              >
                <BedDouble size={16} />
                <span>Rooms ({rooms.length})</span>
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "motos" ? "is-active" : ""}`}
                onClick={() => setActiveTab("motos")}
              >
                <Bike size={16} />
                <span>Motos ({motos.length})</span>
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "settings" ? "is-active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                <SettingsIcon size={16} />
                <span>Telegram & Settings</span>
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "inquiries" ? "is-active" : ""}`}
                onClick={() => setActiveTab("inquiries")}
              >
                <ListOrdered size={16} />
                <span>Recent Inquiries ({inquiries.length})</span>
              </button>
            </div>

            {/* TAB 1: ROOMS */}
            {activeTab === "rooms" && (
              <div>
                {!editingRoom ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>List of available accommodations</span>
                      <button className="btn-primary" onClick={() => handleOpenRoomForm(null)}>
                        <Plus size={16} />
                        <span>Add New Room</span>
                      </button>
                    </div>

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
                                <img
                                  src={room.image}
                                  alt=""
                                  style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                />
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: "#f8fafc" }}>{room.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{room.category} • {room.bed}</div>
                              </td>
                              <td style={{ fontWeight: 700, color: "#fbbf24" }}>${room.pricePerNight}</td>
                              <td>{room.capacity}</td>
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
                  </div>
                ) : (
                  /* ROOM FORM */
                  <form onSubmit={handleSaveRoom} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{editingRoom === "new" ? "Add New Room" : "Edit Room"}</h4>
                      <button type="button" className="btn-secondary" onClick={() => setEditingRoom(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
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
                      <label className="date-label">Photo (Upload to Firebase Storage or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Image URL"
                          value={roomForm.image}
                          onChange={(e) => setRoomForm({ ...roomForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{roomUploading ? "Uploading..." : "Upload"}</span>
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
                        <img
                          src={roomForm.image}
                          alt="Preview"
                          style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      )}
                    </div>

                    <div>
                      <label className="date-label">Amenities (Comma separated)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={roomForm.amenities}
                        onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                        placeholder="Air Con, Free WiFi, Hot Shower, Pool"
                      />
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
                        placeholder="e.g. Most Popular"
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>List of rental scooters & bikes</span>
                      <button className="btn-primary" onClick={() => handleOpenMotoForm(null)}>
                        <Plus size={16} />
                        <span>Add New Motorbike</span>
                      </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Moto Name</th>
                            <th>Price / Day</th>
                            <th>Engine / Type</th>
                            <th>Badge</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {motos.map((moto) => (
                            <tr key={moto.id}>
                              <td>
                                <img
                                  src={moto.image}
                                  alt=""
                                  style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                />
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: "#f8fafc" }}>{moto.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{moto.engine} • {moto.type}</div>
                              </td>
                              <td style={{ fontWeight: 700, color: "#34d399" }}>${moto.pricePerDay}</td>
                              <td>{moto.engine}</td>
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
                  </div>
                ) : (
                  /* MOTO FORM */
                  <form onSubmit={handleSaveMoto} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{editingMoto === "new" ? "Add New Motorbike" : "Edit Motorbike"}</h4>
                      <button type="button" className="btn-secondary" onClick={() => setEditingMoto(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
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
                      <label className="date-label">Photo (Upload to Firebase Storage or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Image URL"
                          value={motoForm.image}
                          onChange={(e) => setMotoForm({ ...motoForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{motoUploading ? "Uploading..." : "Upload"}</span>
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
                        <img
                          src={motoForm.image}
                          alt="Preview"
                          style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      )}
                    </div>

                    <div>
                      <label className="date-label">Features (Comma separated)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={motoForm.features}
                        onChange={(e) => setMotoForm({ ...motoForm, features: e.target.value })}
                        placeholder="2 Helmets Included, Phone Holder, USB Charger"
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Motorbike
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: SETTINGS & TELEGRAM */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                      Pre-filled quote message will be sent to https://t.me/{settingsForm.telegramUsername || "..."}
                    </div>
                  </div>

                  <div>
                    <label className="date-label">Contact Phone / Telegram</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
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
                    No recent inquiries recorded yet. When users click "Send to Telegram" or generate quotes, they appear here.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {inquiries.map((inq, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          padding: "14px 18px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: "#fbbf24", fontSize: "0.95rem" }}>
                            Quote #{inq.quoteId}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "2px" }}>
                            {inq.roomName ? `Room: ${inq.roomName}` : "No Room"} • {inq.motoName ? `Moto: ${inq.motoName}` : "No Moto"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                            Dates: {inq.startDate} → {inq.endDate} ({inq.days} days) • {new Date(inq.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#34d399" }}>
                            ${inq.totalUSD}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
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
        )}
      </div>
    </div>
  );
}
