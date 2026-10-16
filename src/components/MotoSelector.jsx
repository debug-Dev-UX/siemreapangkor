import React, { useState } from "react";
import { Bike, Eye, Check, Minus, Plus, X } from "lucide-react";
import ImageModal from "./ImageModal";

export default function MotoSelector({
  motos = [],
  selectedMotos = {}, // { [motoId]: { qty: number, days: number } }
  onToggleMoto,
  onUpdateMotoQty,
  onUpdateMotoDays,
  onClearMotos,
  defaultDays = 1,
  t,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const selectedMotoList = motos.filter((m) => Boolean(selectedMotos[m.id]));
  const selectedCount = selectedMotoList.length;
  const totalMotosQty = Object.values(selectedMotos).reduce((sum, item) => sum + (item?.qty || 0), 0);

  if (!motos || motos.length === 0) {
    return (
      <div className="step-section-card">
        <div className="step-header-row">
          <div className="step-title-group">
            <div className="step-number-chip">02</div>
            <div>
              <h2 className="step-main-title">
                <Bike size={18} />
                <span>{t?.step2Title || "Step 2: Rent Your Motorbike"}</span>
              </h2>
              <div className="step-subtitle">
                {t?.skipMotoDesc || "Choose this if you only need accommodation without bike rental"}
              </div>
            </div>
          </div>
          <span className="step-tag-pill optional">{t?.optionalTag || "Optional"}</span>
        </div>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
          No motorbikes currently listed. You can book a room above!
        </div>
      </div>
    );
  }

  return (
    <div className={`step-section-card ${selectedCount > 0 ? "has-selection" : ""}`}>
      {/* Header */}
      <div className="step-header-row">
        <div className="step-title-group">
          <div className="step-number-chip">02</div>
          <div>
            <h2 className="step-main-title">
              <Bike size={18} />
              <span>{t?.step2Title || "Step 2: Rent Your Motorbike"}</span>
            </h2>
            <div className="step-subtitle">
              {selectedCount > 0
                ? `${totalMotosQty} ${totalMotosQty === 1 ? (t?.moto || "motorbike") : (t?.motos || "motorbikes")} selected (${selectedCount} models)`
                : (t?.skipMotoDesc || "Select scooter(s) or rent room only")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onClearMotos}
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#64748b" }}
              title="Clear motorbike selection"
            >
              <X size={12} />
              <span>{t?.skipMotoTitle || "No Moto"}</span>
            </button>
          )}
          <span className={`step-tag-pill ${selectedCount > 0 ? "selected" : "optional"}`}>
            {selectedCount > 0 ? (
              <>
                <Check size={12} />
                <span>{totalMotosQty} {t?.motos || "Bikes"}</span>
              </>
            ) : (
              <span>{t?.optionalTag || "Optional"}</span>
            )}
          </span>
        </div>
      </div>

      {/* Dropdown Picker to add motorbike(s) */}
      <div className="select-dropdown-container" style={{ marginBottom: selectedCount > 0 ? "14px" : "0" }}>
        <select
          className="select-dropdown"
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
              ? (t?.skipMotoTitle || "No Moto (Room Booking Only) — Click to choose motorbike")
              : `+ Add another motorbike (${selectedCount} selected)...`}
          </option>
          {motos.map((moto) => {
            const isSelected = Boolean(selectedMotos[moto.id]);
            return (
              <option key={moto.id} value={moto.id}>
                {isSelected ? "✓ [Selected] " : "+ "}
                {moto.name} — ${moto.pricePerDay}{t?.perDay || "/day"} {moto.badge ? `(${moto.badge})` : ""}
              </option>
            );
          })}
          {selectedCount > 0 && (
            <option value="__none__">— Clear All Motorbikes (Room Only) —</option>
          )}
        </select>
      </div>

      {/* ONLY SHOW CHECKED/SELECTED MOTORBIKES: IF NOT CHECKED, DON'T SHOW */}
      {selectedMotoList.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          {selectedMotoList.map((moto) => {
            const selection = selectedMotos[moto.id];
            const qty = selection?.qty || 1;
            const days = selection?.days || defaultDays;
            const cost = moto.pricePerDay * days * qty;

            return (
              <div
                key={moto.id}
                style={{
                  border: "2px solid #0f172a",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  transition: "all 0.15s ease",
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {/* Checked indicator (click to uncheck/remove) */}
                  <div
                    onClick={() => onToggleMoto(moto.id)}
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "4px",
                      border: "2px solid #0f172a",
                      background: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginTop: "2px",
                      transition: "all 0.15s ease",
                    }}
                    title="Click to uncheck / remove motorbike"
                  >
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </div>

                  {/* Photo Thumbnail */}
                  {moto.image ? (
                    <div
                      className="selected-thumbnail-wrap"
                      style={{ width: "56px", height: "56px", borderRadius: "6px" }}
                      onClick={() => {
                        setPreviewImage(moto.image);
                        setPreviewTitle(moto.name);
                      }}
                      title={t?.previewPhoto || "Preview Photo"}
                    >
                      <img src={moto.image} alt={moto.name} className="selected-thumbnail-img" />
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
                        background: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bike size={18} color="#64748b" />
                    </div>
                  )}

                  {/* Moto Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                            {moto.name}
                          </span>
                          {moto.badge && (
                            <span className="badge-emerald" style={{ fontSize: "0.68rem", padding: "2px 6px" }}>
                              {moto.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                          Free {qty * 2} Helmets & {qty} Phone Mounts included
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a", fontFamily: "var(--font-brand)" }}>
                            ${moto.pricePerDay} <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{t?.perDay || "/ day"}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleMoto(moto.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: "4px",
                          }}
                          title="Remove motorbike"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Quantity & Days Counters */}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                        {/* Moto quantity */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>{t?.motos || "Bikes"}:</span>
                          <div className="qty-counter">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateMotoQty(moto.id, Math.max(1, qty - 1))}
                              disabled={qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="qty-number">{qty}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateMotoQty(moto.id, qty + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Days rental */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>{t?.days || "Days"}:</span>
                          <div className="qty-counter">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateMotoDays(moto.id, Math.max(1, days - 1))}
                              disabled={days <= 1}
                              aria-label="Decrease days"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="qty-number">{days}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateMotoDays(moto.id, days + 1)}
                              aria-label="Increase days"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
