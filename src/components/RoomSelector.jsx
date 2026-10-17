import React, { useState } from "react";
import { Hotel, Eye, Users, Minus, Plus, X, ChevronDown, Check } from "lucide-react";
import ImageModal from "./ImageModal";

export default function RoomSelector({
  rooms = [],
  selectedRooms = {}, // { [roomId]: { qty: number, nights: number } }
  onToggleRoom,
  onUpdateRoomQty,
  onUpdateRoomNights,
  onClearRooms,
  defaultNights = 1,
  isLoading = false,
  lang = "kh",
  t,
}) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
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
          <div className="clean-icon-pill" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Hotel size={18} />
          </div>
          <div>
            <h2 className="clean-section-title">
              {t?.step1Title || (lang === "kh" ? "បន្ទប់ (Room)" : "Room")}
            </h2>
            <p className="clean-section-desc">
              {isLoading
                ? (lang === "kh" ? "កំពុងទាញយកទិន្នន័យពី Database..." : "Loading rooms from database...")
                : selectedCount > 0
                ? `${totalRoomsQty} ${totalRoomsQty === 1 ? (t?.room || "room") : (t?.rooms || "rooms")} selected`
                : (lang === "kh" ? "ជ្រើសរើសបន្ទប់ស្នាក់នៅរបស់អ្នកនៅសៀមរាប" : "Select your accommodation in Siem Reap")}
            </p>
          </div>
        </div>

        {!isLoading && selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearRooms}
            className="clean-clear-btn"
            title="Clear all rooms"
          >
            <X size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ marginTop: "12px" }}>
          {/* Skeleton Trigger */}
          <div className="skeleton-trigger-box skeleton-shimmer" />

          {/* Skeleton Cards Grid */}
          <div className="skeleton-grid">
            {[1, 2].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-card-thumb skeleton-shimmer" />
                <div className="skeleton-card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skeleton-title-line skeleton-shimmer" style={{ width: "60%" }} />
                    <div className="skeleton-badge-pill skeleton-shimmer" />
                  </div>
                  <div className="skeleton-desc-line skeleton-shimmer" />
                  <div className="skeleton-chips-row">
                    <div className="skeleton-chip skeleton-shimmer" />
                    <div className="skeleton-chip skeleton-shimmer" />
                  </div>
                  <div className="skeleton-footer-row">
                    <div className="skeleton-price-block skeleton-shimmer" />
                    <div className="skeleton-action-btn skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !hasRooms ? (
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
          {/* Custom Selection Trigger (Like Extra Select) */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={`custom-select-trigger-btn ${isSelectOpen ? "is-active" : ""}`}
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <div className="trigger-label-group">
                <div className="trigger-icon-box" style={{ background: "#fef3c7", color: "#d97706" }}>
                  <Hotel size={16} />
                </div>
                <span className="trigger-text-main">
                  {selectedCount === 0
                    ? (lang === "kh" ? "+ ជ្រើសរើសប្រភេទបន្ទប់ (Room)..." : "+ Select Room Type...")
                    : (lang === "kh" ? `+ បន្ថែមប្រភេទបន្ទប់ផ្សេងទៀត (${selectedCount} បន្ទប់បានរើស)...` : `+ Add another room (${selectedCount} selected)...`)}
                </span>
              </div>
              <ChevronDown size={18} className={`trigger-chevron ${isSelectOpen ? "is-open" : ""}`} />
            </button>

            {/* Custom Dropdown Menu for Rooms */}
            {isSelectOpen && (
              <div className="custom-dropdown-panel">
                <div className="custom-dropdown-topbar">
                  <span className="custom-dropdown-heading">
                    {lang === "kh" ? "បញ្ជីបន្ទប់ស្នាក់នៅ" : "Available Rooms List"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(false)}
                    className="custom-dropdown-done-btn"
                  >
                    {lang === "kh" ? "រួចរាល់ ✓" : "Done ✓"}
                  </button>
                </div>

                <div className="custom-dropdown-items-list">
                  {rooms.map((room) => {
                    const isSelected = Boolean(selectedRooms[room.id]);
                    const selection = selectedRooms[room.id];
                    const qty = selection?.qty || 1;

                    return (
                      <div
                        key={room.id}
                        className={`custom-dropdown-row ${isSelected ? "is-selected" : ""}`}
                        onClick={() => onToggleRoom(room.id)}
                      >
                        {/* Thumbnail */}
                        {room.image ? (
                          <div
                            className="custom-row-thumb"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(room.image);
                              setPreviewTitle(room.name);
                            }}
                            title={lang === "kh" ? "ចុចដើម្បីមើលរូបធំ" : "Click to zoom"}
                          >
                            <img src={room.image} alt={room.name} />
                          </div>
                        ) : (
                          <div className="custom-row-thumb-placeholder">
                            <Hotel size={20} color="#d97706" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="custom-row-info">
                          <div className="custom-row-title">{room.name}</div>
                          <div className="custom-row-desc">
                            {room.category} • {room.bed} • {room.capacity}
                            {room.amenities && (
                              <span> • {Array.isArray(room.amenities) ? room.amenities.slice(0, 3).join(", ") : room.amenities}</span>
                            )}
                          </div>
                        </div>

                        {/* Price & Add Toggle */}
                        <div className="custom-row-right">
                          <span className="custom-row-price">
                            ${room.pricePerNight}{t?.perNight || "/night"}
                          </span>
                          <button
                            type="button"
                            className={`custom-add-toggle-btn ${isSelected ? "is-added" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleRoom(room.id);
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check size={12} />
                                <span>{lang === "kh" ? `បានរើស (×${qty})` : `Added (×${qty})`}</span>
                              </>
                            ) : (
                              <span>{lang === "kh" ? "+ ជ្រើសរើស" : "+ Add"}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
