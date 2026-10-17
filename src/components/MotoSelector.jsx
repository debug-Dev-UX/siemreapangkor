import React, { useState } from "react";
import { Bike, Eye, Minus, Plus, X, ChevronDown, Check } from "lucide-react";
import ImageModal from "./ImageModal";

export default function MotoSelector({
  motos = [],
  selectedMotos = {}, // { [motoId]: { qty: number, days: number } }
  onToggleMoto,
  onUpdateMotoQty,
  onUpdateMotoDays,
  onClearMotos,
  defaultDays = 1,
  isLoading = false,
  lang = "kh",
  t,
}) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const selectedMotoList = motos.filter((m) => Boolean(selectedMotos[m.id]));
  const selectedCount = selectedMotoList.length;
  const totalMotosQty = Object.values(selectedMotos).reduce((sum, item) => sum + (item?.qty || 0), 0);
  const hasMotos = motos && motos.length > 0;

  return (
    <section className="clean-section-card">
      {/* Clean Header */}
      <div className="clean-section-header">
        <div className="clean-header-info">
          <div className="clean-icon-pill" style={{ background: "#ecfdf5", color: "#059669" }}>
            <Bike size={18} />
          </div>
          <div>
            <h2 className="clean-section-title">
              {t?.step2Title || (lang === "kh" ? "ម៉ូតូ (Moto)" : "Moto")}
            </h2>
            <p className="clean-section-desc">
              {isLoading
                ? (lang === "kh" ? "កំពុងទាញយកទិន្នន័យពី Database..." : "Loading motorbikes from database...")
                : selectedCount > 0
                ? `${totalMotosQty} ${totalMotosQty === 1 ? (t?.moto || "bike") : (t?.motos || "bikes")} selected (Free 2 Helmets & Mount included)`
                : (lang === "kh" ? "ជ្រើសរើសម៉ូតូសម្រាប់ដំណើរកម្សាន្តនៅសៀមរាប" : "Select your motorbike for exploring Siem Reap")}
            </p>
          </div>
        </div>

        {!isLoading && selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearMotos}
            className="clean-clear-btn"
            title="Clear all motorbikes"
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
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-card-thumb skeleton-shimmer" />
                <div className="skeleton-card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skeleton-title-line skeleton-shimmer" style={{ width: "55%" }} />
                    <div className="skeleton-badge-pill skeleton-shimmer" />
                  </div>
                  <div className="skeleton-desc-line skeleton-shimmer" />
                  <div className="skeleton-chips-row">
                    <div className="skeleton-chip skeleton-shimmer" />
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
      ) : !hasMotos ? (
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
            ? "មិនទាន់មានម៉ូតូដាក់ជួលនៅឡើយទេ (អាចបន្ថែមម៉ូតូបាននៅទំព័រ Admin)"
            : "No motorbikes currently listed. You can add motorbikes in the Admin panel (/admin)."}
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
                <div className="trigger-icon-box" style={{ background: "#ecfdf5", color: "#059669" }}>
                  <Bike size={16} />
                </div>
                <span className="trigger-text-main">
                  {selectedCount === 0
                    ? (lang === "kh" ? "+ ជ្រើសរើសម៉ូតូ (Moto)..." : "+ Select Motorbike Model...")
                    : (lang === "kh" ? `+ បន្ថែមម៉ូតូផ្សេងទៀត (${selectedCount} គ្រឿងបានរើស)...` : `+ Add another bike (${selectedCount} selected)...`)}
                </span>
              </div>
              <ChevronDown size={18} className={`trigger-chevron ${isSelectOpen ? "is-open" : ""}`} />
            </button>

            {/* Custom Dropdown Menu for Motorbikes */}
            {isSelectOpen && (
              <div className="custom-dropdown-panel">
                <div className="custom-dropdown-topbar">
                  <span className="custom-dropdown-heading">
                    {lang === "kh" ? "បញ្ជីម៉ូតូដាក់ជួល" : "Available Motorbikes List"}
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
                  {motos.map((moto) => {
                    const isSelected = Boolean(selectedMotos[moto.id]);
                    const selection = selectedMotos[moto.id];
                    const qty = selection?.qty || 1;

                    return (
                      <div
                        key={moto.id}
                        className={`custom-dropdown-row ${isSelected ? "is-selected" : ""}`}
                        onClick={() => onToggleMoto(moto.id)}
                      >
                        {/* Thumbnail */}
                        {moto.image ? (
                          <div
                            className="custom-row-thumb"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(moto.image);
                              setPreviewTitle(moto.name);
                            }}
                            title={lang === "kh" ? "ចុចដើម្បីមើលរូបធំ" : "Click to zoom"}
                          >
                            <img src={moto.image} alt={moto.name} />
                          </div>
                        ) : (
                          <div className="custom-row-thumb-placeholder">
                            <Bike size={20} color="#059669" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="custom-row-info">
                          <div className="custom-row-title">{moto.name}</div>
                          <div className="custom-row-desc">
                            {moto.type || "Scooter"} • {moto.engine || "125cc"} • Free 2 Helmets & Mount
                            {moto.features && (
                              <span> • {Array.isArray(moto.features) ? moto.features.slice(0, 2).join(", ") : moto.features}</span>
                            )}
                          </div>
                        </div>

                        {/* Price & Add Toggle */}
                        <div className="custom-row-right">
                          <span className="custom-row-price">
                            ${moto.pricePerDay}{t?.perDay || "/day"}
                          </span>
                          <button
                            type="button"
                            className={`custom-add-toggle-btn ${isSelected ? "is-added" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleMoto(moto.id);
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

          {/* Selected Moto Cards */}
          {selectedMotoList.length > 0 && (
            <div className="clean-items-grid">
              {selectedMotoList.map((moto) => {
                const selection = selectedMotos[moto.id];
                const qty = selection?.qty || 1;
                const days = selection?.days || defaultDays;
                const cost = moto.pricePerDay * days * qty;

                return (
                  <div key={moto.id} className="clean-item-card">
                    <div className="clean-item-top">
                      {/* Photo or Icon */}
                      {moto.image ? (
                        <div
                          className="clean-item-thumb"
                          onClick={() => {
                            setPreviewImage(moto.image);
                            setPreviewTitle(moto.name);
                          }}
                          title="Preview Photo"
                        >
                          <img src={moto.image} alt={moto.name} />
                          <div className="thumb-zoom-overlay">
                            <Eye size={14} color="#ffffff" />
                          </div>
                        </div>
                      ) : (
                        <div className="clean-item-thumb-placeholder">
                          <Bike size={20} color="#94a3b8" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="clean-item-details">
                        <div className="clean-item-row-top">
                          <div>
                            <div className="clean-item-title">{moto.name}</div>
                            <div className="clean-item-meta">
                              <span>{moto.type || "Scooter"}</span>
                              {moto.engine && <span> • {moto.engine}</span>}
                              <span className="free-perk-chip">Free 2 Helmets & Mount</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleMoto(moto.id)}
                            className="clean-remove-btn"
                            title="Remove"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <div className="clean-item-rate">
                          ${moto.pricePerDay} <span className="rate-unit">{t?.perDay || "/ day"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Minimalist Controls */}
                    <div className="clean-item-controls">
                      <div className="clean-steppers-wrap">
                        {/* Qty */}
                        <div className="clean-stepper-group">
                          <span className="stepper-label">{t?.motos || "Bikes"}:</span>
                          <div className="clean-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateMotoQty(moto.id, Math.max(1, qty - 1))}
                              disabled={qty <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-val">{qty}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateMotoQty(moto.id, qty + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Days */}
                        <div className="clean-stepper-group">
                          <span className="stepper-label">{t?.days || "Days"}:</span>
                          <div className="clean-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateMotoDays(moto.id, Math.max(1, days - 1))}
                              disabled={days <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-val">{days}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => onUpdateMotoDays(moto.id, days + 1)}
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
