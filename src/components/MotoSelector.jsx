import React, { useState } from "react";
import { Bike, Eye, Minus, Plus, X } from "lucide-react";
import ImageModal from "./ImageModal";

export default function MotoSelector({
  motos = [],
  selectedMotos = {}, // { [motoId]: { qty: number, days: number } }
  onToggleMoto,
  onUpdateMotoQty,
  onUpdateMotoDays,
  onClearMotos,
  defaultDays = 1,
  lang = "kh",
  t,
}) {
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
          <div className="clean-icon-pill">
            <Bike size={18} />
          </div>
          <div>
            <h2 className="clean-section-title">
              {t?.step2Title || "Step 2: Rent Your Motorbike"}
            </h2>
            <p className="clean-section-desc">
              {selectedCount > 0
                ? `${totalMotosQty} ${totalMotosQty === 1 ? (t?.moto || "bike") : (t?.motos || "bikes")} selected (Free 2 Helmets & Mount included)`
                : (t?.skipMotoDesc || "Select your motorbike, or skip if room only")}
            </p>
          </div>
        </div>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearMotos}
            className="clean-clear-btn"
            title="Clear all motorbikes"
          >
            <X size={13} />
            <span>{t?.skipMotoTitle || "No Moto"}</span>
          </button>
        )}
      </div>

      {!hasMotos ? (
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
          {/* Modern Clean Dropdown Picker */}
          <div className="clean-select-wrapper">
            <select
              className="clean-select"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__none__") {
                  onClearMotos();
                } else if (val) {
                  onToggleMoto(val);
                }
              }}
            >
              <option value="">
                {selectedCount === 0
                  ? `+ ${t?.selectMoto || "Select motorbike model..."}`
                  : `+ Add another motorbike (${selectedCount} selected)...`}
              </option>
              {motos.map((moto) => {
                const isSelected = Boolean(selectedMotos[moto.id]);
                return (
                  <option key={moto.id} value={moto.id}>
                    {isSelected ? "✓ [Selected] " : "+ "}
                    {moto.name} — ${moto.pricePerDay}{t?.perDay || "/day"} ({moto.type || "Scooter"}, {moto.engine || "125cc"})
                  </option>
                );
              })}
              {selectedCount > 0 && (
                <option value="__none__">— Clear All Motorbikes (Room Only) —</option>
              )}
            </select>
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
