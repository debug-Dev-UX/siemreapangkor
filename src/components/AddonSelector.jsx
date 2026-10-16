import React from "react";
import { Check, Plus, Minus, PackageCheck, DollarSign, Sparkles, X } from "lucide-react";

export default function AddonSelector({
  addons = [],
  addonQuantities = {},
  onUpdateAddonQty,
  days = 1,
  t,
}) {
  if (!addons || addons.length === 0) return null;

  // Split into Paid and Free categories
  const paidAddons = addons.filter((a) => a.price > 0);
  const freeAddons = addons.filter((a) => a.price === 0);

  // Only the items that have quantity > 0 are considered checked/selected
  const selectedAddonsList = addons.filter((a) => (addonQuantities[a.id] || 0) > 0);
  const selectedCount = selectedAddonsList.length;
  const totalItemsCount = selectedAddonsList.reduce(
    (sum, item) => sum + (addonQuantities[item.id] || 0),
    0
  );

  const handleToggleAddon = (addonId) => {
    const current = addonQuantities[addonId] || 0;
    if (current > 0) {
      onUpdateAddonQty(addonId, 0); // Uncheck & hide
    } else {
      const item = addons.find((a) => a.id === addonId);
      onUpdateAddonQty(addonId, item?.defaultQty || 1); // Check & show
    }
  };

  const handleQtyChange = (addonId, delta) => {
    const current = addonQuantities[addonId] || 0;
    const next = Math.max(0, current + delta);
    onUpdateAddonQty(addonId, next);
  };

  const handleDirectInput = (addonId, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    onUpdateAddonQty(addonId, parsed);
  };

  const handleClearAll = () => {
    addons.forEach((a) => {
      if ((addonQuantities[a.id] || 0) > 0) {
        onUpdateAddonQty(a.id, 0);
      }
    });
  };

  return (
    <div className={`step-section-card ${selectedCount > 0 ? "has-selection" : ""}`}>
      {/* Step Header */}
      <div className="step-header-row">
        <div className="step-title-group">
          <div className="step-number-chip">03</div>
          <div>
            <h2 className="step-main-title">
              <PackageCheck size={18} />
              <span>{t?.step3Title || "Step 3: Extra Services & Inclusions"}</span>
            </h2>
            <div className="step-subtitle">
              {selectedCount > 0
                ? `${totalItemsCount} item(s) selected across ${selectedCount} services`
                : (t?.specifyQuantity || "Select optional paid accessories (e.g. gloves) or free gear (e.g. helmets)")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#64748b" }}
              title="Clear all extras"
            >
              <X size={12} />
              <span>Clear Extras</span>
            </button>
          )}
          <span className={`step-tag-pill ${selectedCount > 0 ? "selected" : "optional"}`}>
            {selectedCount > 0 ? (
              <>
                <Check size={12} />
                <span>{selectedCount} Selected</span>
              </>
            ) : (
              <span>{t?.optionalTag || "Optional"}</span>
            )}
          </span>
        </div>
      </div>

      {/* Dropdown Selector to add/check extra services or free gear */}
      <div className="select-dropdown-container" style={{ marginBottom: "10px" }}>
        <select
          className="select-dropdown"
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (val === "__none__") {
              handleClearAll();
            } else if (val) {
              handleToggleAddon(val);
            }
          }}
        >
          <option value="">
            {selectedCount === 0
              ? "+ Click to add extra service or free inclusions (e.g. Gloves, Helmets)..."
              : `+ Add another service / gear (${selectedCount} selected)...`}
          </option>

          <optgroup label="── Paid Extras & Accessories ──">
            {paidAddons.map((addon) => {
              const isSelected = (addonQuantities[addon.id] || 0) > 0;
              const unitPrice = addon.type === "per-day" ? addon.price * days : addon.price;
              return (
                <option key={addon.id} value={addon.id}>
                  {isSelected ? `✓ [Selected: ×${addonQuantities[addon.id]}] ` : "+ "}
                  {addon.name} — ${unitPrice} {addon.type === "per-day" ? `($${addon.price}/day)` : "each"}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="── Free Inclusions & Gear ──">
            {freeAddons.map((addon) => {
              const isSelected = (addonQuantities[addon.id] || 0) > 0;
              return (
                <option key={addon.id} value={addon.id}>
                  {isSelected ? `✓ [Selected: ×${addonQuantities[addon.id]}] ` : "+ "}
                  {addon.name} — FREE
                </option>
              );
            })}
          </optgroup>

          {selectedCount > 0 && (
            <option value="__none__">— Clear All Extra Services —</option>
          )}
        </select>
      </div>

      {/* Quick clickable chips for popular items */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: selectedCount > 0 ? "14px" : "0" }}>
        {addons.map((addon) => {
          const isSelected = (addonQuantities[addon.id] || 0) > 0;
          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => handleToggleAddon(addon.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: isSelected ? "1px solid #0f172a" : "1px solid #e2e8f0",
                background: isSelected ? "#0f172a" : "#ffffff",
                color: isSelected ? "#ffffff" : "#334155",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {isSelected ? <Check size={12} color="#ffffff" /> : <Plus size={12} color="#64748b" />}
              <span>{addon.name}</span>
              <span style={{ opacity: 0.8, fontSize: "0.7rem" }}>
                {addon.price === 0 ? "(Free)" : `($${addon.price})`}
              </span>
            </button>
          );
        })}
      </div>

      {/* ONLY SHOW CHECKED/SELECTED EXTRAS: IF NOT CHECKED, DON'T SHOW */}
      {selectedAddonsList.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          {selectedAddonsList.map((addon) => {
            const qty = addonQuantities[addon.id] || 0;
            const isFree = addon.price === 0;
            const unitPrice = addon.type === "per-day" ? addon.price * days : addon.price;
            const totalPrice = unitPrice * qty;

            return (
              <div
                key={addon.id}
                style={{
                  border: "2px solid #0f172a",
                  background: isFree ? "#f0fdf4" : "#f8fafc",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  transition: "all 0.15s ease",
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {/* Checked indicator (click to uncheck/remove) */}
                  <div
                    onClick={() => handleToggleAddon(addon.id)}
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
                    title="Click to uncheck / remove extra"
                  >
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </div>

                  {/* Addon details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                            {addon.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: isFree ? "#dcfce7" : "#f1f5f9",
                              color: isFree ? "#15803d" : "#475569",
                              border: isFree ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                            }}
                          >
                            {isFree ? "FREE INCLUSION" : "PAID EXTRA"}
                          </span>
                        </div>
                        {addon.description && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px", lineHeight: 1.3 }}>
                            {addon.description}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ fontWeight: 800, color: isFree ? "#059669" : "#0f172a", fontFamily: "var(--font-brand)", fontSize: "1rem" }}>
                            {isFree ? "FREE" : `$${unitPrice}`}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {isFree ? "$0 USD" : addon.type === "per-day" ? `($${addon.price}/d × ${days}d)` : "each"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAddon(addon.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: "4px",
                          }}
                          title="Remove extra"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Quantity counter & Line total */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: isFree ? "1px dashed #bbf7d0" : "1px dashed #cbd5e1",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                          {t?.specifyQuantity || "Quantity"}:
                        </span>
                        <div className="qty-counter" style={{ background: "#ffffff" }}>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQtyChange(addon.id, -1)}
                            disabled={qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={qty}
                            onChange={(e) => handleDirectInput(addon.id, e.target.value)}
                            style={{
                              width: "36px",
                              textAlign: "center",
                              border: "none",
                              background: "transparent",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "#0f172a",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQtyChange(addon.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal / status */}
                      <div>
                        {isFree ? (
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669" }}>
                            ✓ {qty} Free Included ($0)
                          </span>
                        ) : (
                          <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                            Subtotal: <span style={{ color: "#059669" }}>${totalPrice}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
