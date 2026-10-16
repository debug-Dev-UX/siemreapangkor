import React, { useState } from "react";
import {
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Calendar,
  Hotel,
  Bike,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";

export default function CartPopup({
  selectedRoomItems = [], // [ { room, qty, nights, cost } ]
  selectedMotoItems = [], // [ { moto, qty, days, cost } ]
  selectedAddonItems = [], // [ { addon, qty, cost } ]
  startDate,
  endDate,
  settings = {},
  onCopyLink,
  onOpenVoucher,
  onSendTelegram,
  copied,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  couponSuccess,
  lang = "en",
  t,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  const roomCost = selectedRoomItems.reduce((sum, item) => sum + item.cost, 0);
  const motoCost = selectedMotoItems.reduce((sum, item) => sum + item.cost, 0);
  const addonsCost = selectedAddonItems.reduce((sum, item) => sum + item.cost, 0);

  const subtotal = roomCost + motoCost + addonsCost;

  // Combo discount
  const isCombo = selectedRoomItems.length > 0 && selectedMotoItems.length > 0;
  const comboDiscountRate = isCombo ? (settings.comboDiscountPercent || 0) / 100 : 0;
  const comboDiscountAmount = Math.round((roomCost + motoCost) * comboDiscountRate);

  // Coupon discount
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      couponDiscountAmount = Math.round(subtotal * (Number(appliedCoupon.discountValue || 0) / 100));
    } else {
      couponDiscountAmount = Math.min(subtotal, Number(appliedCoupon.discountValue || 0));
    }
  }

  const totalDiscount = comboDiscountAmount + couponDiscountAmount;
  const finalTotalUSD = Math.max(0, subtotal - totalDiscount);
  const finalTotalKHR = Math.round(finalTotalUSD * (settings.exchangeRateKHR || 4000));

  const totalRoomsQty = selectedRoomItems.reduce((sum, i) => sum + i.qty, 0);
  const totalMotosQty = selectedMotoItems.reduce((sum, i) => sum + i.qty, 0);
  const totalAddonsQty = selectedAddonItems.reduce((sum, i) => sum + i.qty, 0);
  const totalItemsCount = totalRoomsQty + totalMotosQty + totalAddonsQty;

  const closeText = lang === "kh" ? "(បិទ)" : "(close)";

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
    }
  };

  return (
    <div className="cart-popup-container">
      {/* Collapsed Pill Button */}
      {!isOpen ? (
        <button
          className="cart-floating-pill"
          onClick={() => setIsOpen(true)}
          title={t?.viewCart || "View Cart"}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <ShoppingBag size={20} color="#ffffff" />
            {totalItemsCount > 0 && (
              <span className="cart-count-badge">{totalItemsCount}</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#94a3b8" }}>
              {t?.cart || "Cart"}
            </span>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#ffffff" }}>
              ${finalTotalUSD} USD
            </span>
          </div>
          <ChevronUp size={18} color="#ffffff" style={{ marginLeft: "4px" }} />
        </button>
      ) : (
        /* Expanded Cart Popup */
        <div className="cart-popup-card">
          {/* Header with explicit (close) / (បិទ) text */}
          <div className="cart-popup-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  background: "#0f172a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a", textTransform: "uppercase" }}>
                  {t?.cart || "Cart"} ({totalItemsCount} {t?.items || "items"})
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={11} />
                  <span>{startDate} → {endDate}</span>
                </div>
              </div>
            </div>

            {/* Close button with explicit (close) / (បិទ) text */}
            <button
              className="cart-toggle-btn"
              onClick={() => setIsOpen(false)}
              title={t?.hideCart || "Close Cart"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                width: "auto",
                background: "#f1f5f9",
                borderRadius: "4px",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#475569" }}>
                {closeText}
              </span>
              <ChevronDown size={16} color="#475569" />
            </button>
          </div>

          {/* Body itemized breakdown */}
          <div className="cart-popup-body">
            {totalItemsCount === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 8px", color: "#64748b", fontSize: "0.82rem" }}>
                {t?.noItemsSelected || "No items selected yet. Choose room or moto above!"}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Rooms List */}
                {selectedRoomItems.map(({ room, qty, nights, cost }) => (
                  <div key={room.id} className="cart-item-row">
                    <div>
                      <div className="cart-item-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Hotel size={14} color="#0f172a" />
                        <span>{room.name}{qty > 1 ? ` (×${qty} rooms)` : ""}</span>
                      </div>
                      <div className="cart-item-subtitle">
                        {t?.bookRoom || "Book"}: ${room.pricePerNight} × {nights} {nights === 1 ? (t?.night || "night") : (t?.nights || "nights")}{qty > 1 ? ` × ${qty} rooms` : ""}
                      </div>
                    </div>
                    <div className="cart-item-price">${cost}</div>
                  </div>
                ))}

                {/* Motorbikes List */}
                {selectedMotoItems.map(({ moto, qty, days, cost }) => (
                  <div key={moto.id} className="cart-item-row">
                    <div>
                      <div className="cart-item-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Bike size={14} color="#0f172a" />
                        <span>{moto.name}{qty > 1 ? ` (×${qty} bikes)` : ""}</span>
                      </div>
                      <div className="cart-item-subtitle">
                        {t?.rentMoto || "Rent"}: ${moto.pricePerDay} × {days} {days === 1 ? (t?.day || "day") : (t?.days || "days")}{qty > 1 ? ` × ${qty} bikes` : ""}
                      </div>
                    </div>
                    <div className="cart-item-price">${cost}</div>
                  </div>
                ))}

                {/* Extras & Add-ons (Paid & Free) */}
                {selectedAddonItems.map(({ addon, qty, cost }) => (
                  <div key={addon.id} className="cart-item-row">
                    <div className="cart-item-title" style={{ fontSize: "0.8rem", color: "#475569" }}>
                      + {addon.name} {qty > 1 ? `(×${qty})` : ""}
                    </div>
                    <div className="cart-item-price" style={{ fontSize: "0.82rem", color: cost === 0 ? "#059669" : "#0f172a" }}>
                      {cost === 0 ? (t?.free || "FREE") : `$${cost}`}
                    </div>
                  </div>
                ))}

                {/* Combo discount */}
                {isCombo && comboDiscountAmount > 0 && (
                  <div className="combo-banner" style={{ padding: "6px 10px", fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Tag size={13} />
                      <span>{t?.comboDiscount || "Combo Special"} ({settings.comboDiscountPercent}%)</span>
                    </div>
                    <span>-${comboDiscountAmount}</span>
                  </div>
                )}

                {/* Applied Coupon banner */}
                {appliedCoupon && (
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px dashed #3b82f6",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <TicketPercent size={14} color="#2563eb" />
                      <span style={{ fontWeight: 700, color: "#1e40af" }}>
                        Coupon {appliedCoupon.code}
                      </span>
                      <span style={{ color: "#3b82f6" }}>
                        ({appliedCoupon.discountType === "percent" ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`})
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 800, color: "#2563eb" }}>-${couponDiscountAmount}</span>
                      <button
                        type="button"
                        onClick={onRemoveCoupon}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px" }}
                        title="Remove coupon"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coupon Input Form */}
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              {!appliedCoupon ? (
                <form onSubmit={handleApplyClick} style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ padding: "6px 10px", fontSize: "0.78rem", textTransform: "uppercase" }}
                    placeholder={t?.enterCoupon || "Promo Code (e.g. ANGKOR10)"}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                  >
                    {t?.apply || "Apply"}
                  </button>
                </form>
              ) : null}

              {couponError && (
                <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "4px" }}>
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: "4px" }}>
                  {couponSuccess}
                </div>
              )}
            </div>

            {/* Total Footer */}
            <div className="cart-total-footer">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{t?.estimatedTotal || "Estimated Total"}</span>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  ~{finalTotalKHR.toLocaleString()} KHR
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>USD</span>
                <span className="cart-price-big">${finalTotalUSD}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
              <button
                className="cart-action-btn primary"
                onClick={onSendTelegram}
                title="Send reservation request to Telegram"
              >
                <span>{t?.confirmViaTelegram || "CONFIRM VIA TELEGRAM"}</span>
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <button
                  className="cart-action-btn secondary"
                  onClick={onOpenVoucher}
                  style={{ fontSize: "0.75rem", padding: "8px" }}
                >
                  <span>{t?.downloadSlip || "Quotation Slip"}</span>
                </button>
                <button
                  className="cart-action-btn secondary"
                  onClick={onCopyLink}
                  style={{ fontSize: "0.75rem", padding: "8px" }}
                >
                  <span>{copied ? (t?.linkCopied || "Copied!") : (t?.copyLink || "Share Link")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
