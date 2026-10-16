import React, { useState } from "react";
import { Hotel, Eye, Users, Check, Minus, Plus, X } from "lucide-react";
import ImageModal from "./ImageModal";

export default function RoomSelector({
  rooms = [],
  selectedRooms = {}, // { [roomId]: { qty: number, nights: number } }
  onToggleRoom,
  onUpdateRoomQty,
  onUpdateRoomNights,
  onClearRooms,
  defaultNights = 1,
  t,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const selectedCount = Object.keys(selectedRooms).length;
  const totalRoomsQty = Object.values(selectedRooms).reduce((sum, item) => sum + (item?.qty || 0), 0);

  if (!rooms || rooms.length === 0) {
    return (
      <div className="step-section-card">
        <div className="step-header-row">
          <div className="step-title-group">
            <div className="step-number-chip">01</div>
            <div>
              <h2 className="step-main-title">
                <Hotel size={18} />
                <span>{t?.step1Title || "Step 1: Book Your Room"}</span>
              </h2>
              <div className="step-subtitle">
                {t?.skipRoomDesc || "Choose this if you already have accommodation in Siem Reap"}
              </div>
            </div>
          </div>
          <span className="step-tag-pill optional">{t?.optionalTag || "Optional"}</span>
        </div>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
          No rooms currently listed. You can rent a motorbike in Step 2 below!
        </div>
      </div>
    );
  }

  return (
    <div className={`step-section-card ${selectedCount > 0 ? "has-selection" : ""}`}>
      {/* Header */}
      <div className="step-header-row">
        <div className="step-title-group">
          <div className="step-number-chip">01</div>
          <div>
            <h2 className="step-main-title">
              <Hotel size={18} />
              <span>{t?.step1Title || "Step 1: Book Your Room"}</span>
            </h2>
            <div className="step-subtitle">
              {selectedCount > 0
                ? `${totalRoomsQty} ${totalRoomsQty === 1 ? (t?.room || "room") : (t?.rooms || "rooms")} selected (${selectedCount} room types)`
                : (t?.skipRoomDesc || "Select your room(s) in Siem Reap or rent motorbike only")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onClearRooms}
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#64748b" }}
              title="Clear room selection"
            >
              <X size={12} />
              <span>{t?.skipRoomTitle || "No Room"}</span>
            </button>
          )}
          <span className={`step-tag-pill ${selectedCount > 0 ? "selected" : "optional"}`}>
            {selectedCount > 0 ? (
              <>
                <Check size={12} />
                <span>{totalRoomsQty} {t?.rooms || "Rooms"}</span>
              </>
            ) : (
              <span>{t?.optionalTag || "Optional"}</span>
            )}
          </span>
        </div>
      </div>

      {/* Quick Dropdown Picker to add/select room */}
      <div className="select-dropdown-container" style={{ marginBottom: "14px" }}>
        <select
          className="select-dropdown"
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (val === "__none__") {
              onClearRooms();
            } else if (val) {
              onToggleRoom(val);
            }
          }}
        >
          <option value="">
            {selectedCount > 0
              ? `+ Add / Select another room type (${selectedCount} chosen)...`
              : (t?.selectRoom || "Select room type to book (or check below)...")}
          </option>
          {rooms.map((room) => {
            const isSelected = Boolean(selectedRooms[room.id]);
            return (
              <option key={room.id} value={room.id}>
                {isSelected ? "✓ [Selected] " : "+ "}
                {room.name} — ${room.pricePerNight}{t?.perNight || "/night"} ({room.bed}, {room.capacity})
              </option>
            );
          })}
          {selectedCount > 0 && (
            <option value="__none__">— Clear All Rooms (Moto Only) —</option>
          )}
        </select>
      </div>

      {/* List of Room Cards with Checkboxes & Multi-selection controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {rooms.map((room) => {
          const selection = selectedRooms[room.id];
          const isSelected = Boolean(selection);
          const qty = selection?.qty || 1;
          const nights = selection?.nights || defaultNights;
          const cost = room.pricePerNight * nights * qty;

          return (
            <div
              key={room.id}
              style={{
                border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                background: isSelected ? "#f8fafc" : "#ffffff",
                borderRadius: "8px",
                padding: "12px 14px",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                {/* Checkbox */}
                <div
                  onClick={() => onToggleRoom(room.id)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    border: isSelected ? "2px solid #0f172a" : "2px solid #cbd5e1",
                    background: isSelected ? "#0f172a" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: "2px",
                    transition: "all 0.15s ease",
                  }}
                  title={isSelected ? "Uncheck room" : "Check to book this room"}
                >
                  {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </div>

                {/* Photo Thumbnail */}
                {room.image ? (
                  <div
                    className="selected-thumbnail-wrap"
                    style={{ width: "56px", height: "56px", borderRadius: "6px" }}
                    onClick={() => {
                      setPreviewImage(room.image);
                      setPreviewTitle(room.name);
                    }}
                    title={t?.previewPhoto || "Preview Photo"}
                  >
                    <img src={room.image} alt={room.name} className="selected-thumbnail-img" />
                    <div className="selected-thumbnail-overlay">
                      <Eye size={14} color="#ffffff" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="selected-thumbnail-wrap"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "6px",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Hotel size={18} color="#64748b" />
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => onToggleRoom(room.id)}
                    style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                        {room.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", gap: "8px", marginTop: "2px", flexWrap: "wrap" }}>
                        <span><Users size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {room.capacity}</span>
                        <span>•</span>
                        <span>{room.bed}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a", fontFamily: "var(--font-brand)" }}>
                        ${room.pricePerNight} <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{t?.perNight || "/ night"}</span>
                      </div>
                    </div>
                  </div>

                  {/* If checked: Show individual Quantity & Nights Counters */}
                  {isSelected && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px dashed #cbd5e1",
                      }}
                    >
                      {/* Qty & Nights controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                        {/* Rooms quantity */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>{t?.rooms || "Rooms"}:</span>
                          <div className="qty-counter">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateRoomQty(room.id, Math.max(1, qty - 1))}
                              disabled={qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="qty-number">{qty}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateRoomQty(room.id, qty + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Nights stay */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>{t?.nights || "Nights"}:</span>
                          <div className="qty-counter">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateRoomNights(room.id, Math.max(1, nights - 1))}
                              disabled={nights <= 1}
                              aria-label="Decrease nights"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="qty-number">{nights}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateRoomNights(room.id, nights + 1)}
                              aria-label="Increase nights"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Line Subtotal */}
                      <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                        Subtotal: <span style={{ color: "#059669" }}>${cost}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewImage && (
        <ImageModal
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          imageSrc={previewImage}
          title={previewTitle}
        />
      )}
    </div>
  );
}
