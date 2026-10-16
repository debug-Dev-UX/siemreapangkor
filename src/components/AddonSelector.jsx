import React from "react";
import { Check, Plus, Minus, PackageCheck, Sparkles, DollarSign } from "lucide-react";

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

  const totalPaidSelectedCount = paidAddons.reduce((sum, item) => sum + (addonQuantities[item.id] || 0), 0);
  const totalFreeSelectedCount = freeAddons.reduce((sum, item) => sum + (addonQuantities[item.id] || 0), 0);
  const totalSelectedCount = totalPaidSelectedCount + totalFreeSelectedCount;

  const handleQtyChange = (addonId, delta, defaultVal = 1) => {
    const current = addonQuantities[addonId] || 0;
    const next = Math.max(0, current + delta);
    if (onUpdateAddonQty) {
      onUpdateAddonQty(addonId, next);
    }
  };

  const handleDirectInput = (addonId, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    if (onUpdateAddonQty) {
      onUpdateAddonQty(addonId, parsed);
    }
  };

  return (
    <div className={`step-section-card ${totalSelectedCount > 0 ? "has-selection" : ""}`}>
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
              {totalSelectedCount > 0
                ? `${totalSelectedCount} item(s) selected (${totalPaidSelectedCount} paid, ${totalFreeSelectedCount} free)`
                : "Customize paid accessories (e.g. gloves) and free items (e.g. helmets)"}
            </div>
          </div>
        </div>

        <span className={`step-tag-pill ${totalSelectedCount > 0 ? "selected" : "optional"}`}>
          {totalSelectedCount > 0 ? (
            <>
              <Check size={12} />
              <span>{totalSelectedCount} Selected</span>
            </>
          ) : (
            <span>{t?.optionalTag || "Optional"}</span>
          )}
        </span>
      </div>

      {/* SECTION 1: PAID EXTRAS */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              background: "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarSign size={14} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>
              {t?.paidServices || "Paid Extras & Add-ons"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
              Choose items and set the quantity you need (e.g. 3 pairs of riding gloves)
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
          {paidAddons.map((addon) => {
            const qty = addonQuantities[addon.id] || 0;
            const isSelected = qty > 0;
            const unitPrice = addon.type === "per-day" ? addon.price * days : addon.price;
            const totalPrice = unitPrice * qty;

            return (
              <div
                key={addon.id}
                style={{
                  background: isSelected ? "#f8fafc" : "#ffffff",
                  border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "10px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                      {addon.name}
                    </div>
                    {addon.description && (
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px", lineHeight: 1.3 }}>
                        {addon.description}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", fontSize: "0.95rem" }}>
                      ${unitPrice}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      {addon.type === "per-day" ? `($${addon.price}/d × ${days}d)` : "each"}
                    </div>
                  </div>
                </div>

                {/* Quantity input & subtotal row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                      {t?.specifyQuantity || "Qty"}:
                    </span>
                    <div className="qty-counter" style={{ background: "#f1f5f9" }}>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleQtyChange(addon.id, -1)}
                        disabled={qty === 0}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={qty}
                        onChange={(e) => handleDirectInput(addon.id, e.target.value)}
                        style={{
                          width: "36px",
                          textAlign: "center",
                          border: "none",
                          background: "transparent",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          fontFamily: "var(--font-brand)",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleQtyChange(addon.id, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: isSelected ? "#0f172a" : "#94a3b8" }}>
                    {isSelected ? `Total: $${totalPrice}` : "$0"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FREE INCLUSIONS */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              background: "#059669",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={14} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#065f46" }}>
              {t?.freeServices || "Free Inclusions & Amenities"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
              Input how many free helmets, phone holders, or maps you need for your trip
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
          {freeAddons.map((addon) => {
            const qty = addonQuantities[addon.id] !== undefined ? addonQuantities[addon.id] : (addon.defaultQty || 0);
            const isSelected = qty > 0;

            return (
              <div
                key={addon.id}
                style={{
                  background: isSelected ? "#ecfdf5" : "#ffffff",
                  border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "10px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isSelected ? "#065f46" : "#0f172a" }}>
                      {addon.name}
                    </div>
                    {addon.description && (
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px", lineHeight: 1.3 }}>
                        {addon.description}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {t?.free || "FREE"}
                  </span>
                </div>

                {/* Free Quantity input row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px dashed #cbd5e1",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                      {t?.specifyQuantity || "Input Qty"}:
                    </span>
                    <div className="qty-counter" style={{ background: isSelected ? "#dcfce7" : "#f1f5f9" }}>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleQtyChange(addon.id, -1)}
                        disabled={qty === 0}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={qty}
                        onChange={(e) => handleDirectInput(addon.id, e.target.value)}
                        style={{
                          width: "36px",
                          textAlign: "center",
                          border: "none",
                          background: "transparent",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          fontFamily: "var(--font-brand)",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleQtyChange(addon.id, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isSelected ? "#059669" : "#94a3b8" }}>
                    {isSelected ? `✓ ${qty} Free Included` : "Not requested"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
