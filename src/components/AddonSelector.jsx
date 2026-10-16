import React from "react";
import { Plus, Minus, PackageCheck, X } from "lucide-react";

export default function AddonSelector({
  addons = [],
  addonQuantities = {},
  onUpdateAddonQty,
  days = 1,
  t,
}) {
  if (!addons || addons.length === 0) return null;

  const paidAddons = addons.filter((a) => a.price > 0);
  const freeAddons = addons.filter((a) => a.price === 0);

  const selectedAddonsList = addons.filter((a) => (addonQuantities[a.id] || 0) > 0);
  const selectedCount = selectedAddonsList.length;
  const totalItemsCount = selectedAddonsList.reduce(
    (sum, item) => sum + (addonQuantities[item.id] || 0),
    0
  );

  const handleToggleAddon = (addonId) => {
    const current = addonQuantities[addonId] || 0;
    if (current > 0) {
      onUpdateAddonQty(addonId, 0);
    } else {
      const item = addons.find((a) => a.id === addonId);
      onUpdateAddonQty(addonId, item?.defaultQty || 1);
    }
  };

  const handleQtyChange = (addonId, delta) => {
    const current = addonQuantities[addonId] || 0;
    const next = Math.max(0, current + delta);
    onUpdateAddonQty(addonId, next);
  };

  const handleClearAll = () => {
    addons.forEach((a) => {
      if ((addonQuantities[a.id] || 0) > 0) {
        onUpdateAddonQty(a.id, 0);
      }
    });
  };

  return (
    <section className="clean-section-card">
      {/* Clean Header */}
      <div className="clean-section-header">
        <div className="clean-header-info">
          <div className="clean-icon-pill">
            <PackageCheck size={18} />
          </div>
          <div>
            <h2 className="clean-section-title">
              {t?.step3Title || "Step 3: Extra Services & Inclusions"}
            </h2>
            <p className="clean-section-desc">
              {selectedCount > 0
                ? `${totalItemsCount} item(s) selected across ${selectedCount} services`
                : (t?.specifyQuantity || "Optional extras (e.g. gloves) or customized free gear (helmets)")}
            </p>
          </div>
        </div>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="clean-clear-btn"
            title="Clear all extras"
          >
            <X size={13} />
            <span>Clear Extras</span>
          </button>
        )}
      </div>

      {/* Modern Clean Dropdown Picker */}
      <div className="clean-select-wrapper">
        <select
          className="clean-select"
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
              ? "+ Add extra services or inclusions (e.g. Gloves, Helmets)..."
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
            <option value="__none__">— Clear All Extras —</option>
          )}
        </select>
      </div>

      {/* Selected Extras Cards */}
      {selectedAddonsList.length > 0 && (
        <div className="clean-items-grid">
          {selectedAddonsList.map((addon) => {
            const qty = addonQuantities[addon.id] || 0;
            const isFree = addon.price === 0;
            const unitPrice = addon.type === "per-day" ? addon.price * days : addon.price;
            const cost = isFree ? 0 : unitPrice * qty;

            return (
              <div key={addon.id} className={`clean-item-card ${isFree ? "clean-item-card-free" : ""}`}>
                <div className="clean-item-top">
                  <div className="clean-item-details" style={{ width: "100%" }}>
                    <div className="clean-item-row-top">
                      <div>
                        <div className="clean-item-title">
                          {addon.name}
                          {isFree ? (
                            <span className="clean-badge-free">FREE</span>
                          ) : (
                            <span className="clean-badge-paid">${unitPrice} {addon.type === "per-day" ? "/day" : "each"}</span>
                          )}
                        </div>
                        <div className="clean-item-meta">
                          {addon.description || (isFree ? "Free inclusion item" : "Optional accessory")}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateAddonQty(addon.id, 0)}
                        className="clean-remove-btn"
                        title="Remove"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Minimalist Controls */}
                <div className="clean-item-controls">
                  <div className="clean-steppers-wrap">
                    <div className="clean-stepper-group">
                      <span className="stepper-label">{t?.quantity || "Quantity"}:</span>
                      <div className="clean-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => handleQtyChange(addon.id, -1)}
                          disabled={qty <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="stepper-val">{qty}</span>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => handleQtyChange(addon.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="clean-subtotal-val">
                    Subtotal: <strong style={{ color: isFree ? "#059669" : "#0f172a" }}>{isFree ? "FREE" : `$${cost}`}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
