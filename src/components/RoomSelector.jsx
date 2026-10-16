import React, { useState } from "react";
import { Hotel, Eye, Users, Minus, Plus, X } from "lucide-react";
import ImageModal from "./ImageModal";

export default function RoomSelector({
  rooms = [],
  selectedRooms = {}, // { [roomId]: { qty: number, nights: number } }
  onToggleRoom,
  onUpdateRoomQty,
  onUpdateRoomNights,
  onClearRooms,
  defaultNights = 1,
  lang = "kh",
  t,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const selectedRoomList = rooms.filter((r) => Boolean(selectedRooms[r.id]));
  const selectedCount = selectedRoomList.length;
  const totalRoomsQty = Object.values(selectedRooms).reduce((sum, item) => sum + (item?.qty || 0), 0);
  const hasRooms = rooms && rooms.length > 0;

  return (
    <section className="clean-section-card">
      {/* Clean Header */}
      <div className="clean-section-header">
        <div className="clean-header-info">
          <div className="clean-icon-pill">
            <Hotel size={18} />
          </div>
          <div>
            <h2 className="clean-section-title">
              {t?.step1Title || "Step 1: Book Your Room"}
            </h2>
            <p className="clean-section-desc">
              {selectedCount > 0
                ? `${totalRoomsQty} ${totalRoomsQty === 1 ? (t?.room || "room") : (t?.rooms || "rooms")} selected`
                : (t?.skipRoomDesc || "Select your room in Siem Reap, or skip for motorbike only")}
            </p>
          </div>
        </div>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearRooms}
            className="clean-clear-btn"
            title="Clear all rooms"
          >
            <X size={13} />
            <span>{t?.skipRoomTitle || "No Room"}</span>
          </button>
        )}
      </div>

      {!hasRooms ? (
        <div style={{
          padding: "20px 16px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px dashed #cbd5e1",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.85rem",
        }}>
          {lang === "kh"
            ? "មិនទាន់មានបន្ទប់ដាក់ជួលនៅឡើយទេ (អាចបន្ថែមបន្ទប់បាននៅទំព័រ Admin)"
            : "No rooms currently listed. You can add rooms in the Admin panel (/admin)."}
        </div>
      ) : (
        <>
          {/* Modern Clean Dropdown Picker */}
          <div className="clean-select-wrapper">
            <select
              className="clean-select"
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
                {selectedCount === 0
                  ? `+ ${t?.selectRoom || "Select room type..."}`
                  : `+ Add another room (${selectedCount} selected)...`}
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

          {/* Selected Room Cards (Clean Minimalist Luxury Card) */}
          {selectedRoomList.length > 0 && (
            <div className="clean-items-grid">
              {selectedRoomList.map((room) => {
                const selection = selectedRooms[room.id];
                const qty = selection?.qty || 1;
                const nights = selection?.nights || defaultNights;
                const cost = room.pricePerNight * nights * qty;

                return (
                  <div key={room.id} className="clean-item-card">
                    <div className="clean-item-top">
                      {/* Photo or Icon */}
                      {room.image ? (
                        <div
                          className="clean-item-thumb"
                          onClick={() => {
                            setPreviewImage(room.image);
                            setPreviewTitle(room.name);
                          }}
                          title="Preview Photo"
                        >
                          <img src={room.image} alt={room.name} />
                          <div className="thumb-zoom-overlay">
                            <Eye size={14} color="#ffffff" />
                          </div>
                        </div>
                      ) : (
                        <div className="clean-item-thumb-placeholder">
                          <Hotel size={20} color="#94a3b8" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="clean-item-details">
                        <div className="clean-item-row-top">
                          <div>
                            <div className="clean-item-title">{room.name}</div>
                            <div className="clean-item-meta">
                              <span><Users size={12} style={{ display: "inline" }} /> {room.capacity}</span>
                              {room.bed && <span> • {room.bed}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleRoom(room.id)}
                            className="clean-remove-btn"
                            title="Remove"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <div className="clean-item-rate">
                          ${room.pricePerNight} <span className="rate-unit">{t?.perNight || "/ night"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Minimalist Controls */}
                    <div className="clean-item-controls">
                      <div className="clean-steppers-wrap">
                        {/* Qty */}
                        <div className="clean-stepper-group">
                          <span className="stepper-label">{t?.rooms || "Rooms"}:</span>
                          <div className="clean-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateRoomQty(room.id, Math.max(1, qty - 1))}
                              disabled={qty <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-val">{qty}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateRoomQty(room.id, qty + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Nights */}
                        <div className="clean-stepper-group">
                          <span className="stepper-label">{t?.nights || "Nights"}:</span>
                          <div className="clean-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateRoomNights(room.id, Math.max(1, nights - 1))}
                              disabled={nights <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-val">{nights}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateRoomNights(room.id, nights + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="clean-subtotal-val">
                        Subtotal: <strong>${cost}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <ImageModal
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          imageSrc={previewImage}
          title={previewTitle}
        />
      )}
    </section>
  );
}
