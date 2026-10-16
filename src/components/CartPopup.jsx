import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Send,
  Download,
  Copy,
  Check,
  Tag,
  Calendar,
  X,
  Hotel,
  Bike,
  PackageCheck,
  TicketPercent,
  Sparkles,
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
  lang = "kh",
  t,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
    <>
      {/* Floating Pill Button (Bottom Left) */}
      <div className="cart-popup-container">
        <button
          type="button"
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
            <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#94a3b8", fontWeight: 700 }}>
              {t?.cart || "Cart"} ({totalItemsCount})
            </span>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff", fontFamily: "var(--font-brand)" }}>
              ${finalTotalUSD} USD
            </span>
          </div>
        </button>
      </div>

      {/* NEW CENTERED CART MODAL DIALOG */}
      {isOpen && (
        <div className="cart-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="cart-modal-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="cart-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>
                      {t?.cartSummary || "Cart Summary"}
                    </h3>
                    <span
                      style={{
                        background: "#0f172a",
                        color: "#ffffff",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "2px 7px",
                        borderRadius: "10px",
                      }}
                    >
                      {totalItemsCount} {t?.items || "items"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <Calendar size={12} />
                    <span>{startDate} → {endDate}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  width: "auto",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  {closeText}
                </span>
                <X size={16} color="#475569" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="cart-modal-body">
              {totalItemsCount === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 16px", color: "#64748b" }}>
                  <ShoppingBag size={36} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#334155" }}>
                    {t?.noItemsSelected || "Your cart is currently empty"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                    Select a room, motorbike, or extra services above to get started.
                  </div>
                </div>
              ) : (
                <>
                  {/* ROOMS BREAKDOWN */}
                  {selectedRoomItems.length > 0 && (
                    <div className="cart-section-box">
                      <div className="cart-section-title">
                        <Hotel size={14} color="#0f172a" />
                        <span>{t?.bookRoom || "Room Accommodation"}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedRoomItems.map(({ room, qty, nights, cost }) => (
                          <div key={room.id} className="cart-item-row">
                            <div>
                              <div className="cart-item-title">
                                {room.name} {qty > 1 ? `(×${qty} rooms)` : ""}
                              </div>
                              <div className="cart-item-subtitle">
                                ${room.pricePerNight} × {nights} {nights === 1 ? (t?.night || "night") : (t?.nights || "nights")}{qty > 1 ? ` × ${qty} rooms` : ""}
                              </div>
                            </div>
                            <div className="cart-item-price">${cost}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MOTOS BREAKDOWN */}
                  {selectedMotoItems.length > 0 && (
                    <div className="cart-section-box">
                      <div className="cart-section-title">
                        <Bike size={14} color="#0f172a" />
                        <span>{t?.rentMoto || "Motorbike Rentals"}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedMotoItems.map(({ moto, qty, days, cost }) => (
                          <div key={moto.id} className="cart-item-row">
                            <div>
                              <div className="cart-item-title">
                                {moto.name} {qty > 1 ? `(×${qty} bikes)` : ""}
                              </div>
                              <div className="cart-item-subtitle">
                                ${moto.pricePerDay} × {days} {days === 1 ? (t?.day || "day") : (t?.days || "days")}{qty > 1 ? ` × ${qty} bikes` : ""}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                                ✓ Includes {qty * 2} free helmets & {qty} phone mount
                              </div>
                            </div>
                            <div className="cart-item-price">${cost}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ADDONS BREAKDOWN */}
                  {selectedAddonItems.length > 0 && (
                    <div className="cart-section-box">
                      <div className="cart-section-title">
                        <PackageCheck size={14} color="#0f172a" />
                        <span>{t?.step3Title || "Extra Services & Inclusions"}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedAddonItems.map(({ addon, qty, cost }) => (
                          <div key={addon.id} className="cart-item-row">
                            <div>
                              <div className="cart-item-title">
                                {addon.name} {qty > 1 ? `(×${qty})` : ""}
                              </div>
                              <div className="cart-item-subtitle">
                                {addon.price === 0
                                  ? "Free inclusion item"
                                  : addon.type === "per-day"
                                  ? `$${addon.price}/day × rental days`
                                  : "One-time service"}
                              </div>
                            </div>
                            <div
                              className="cart-item-price"
                              style={{ color: cost === 0 ? "#059669" : "#0f172a" }}
                            >
                              {cost === 0 ? (t?.free || "FREE") : `$${cost}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROMO COUPON CODE */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}
                  >
                    {!appliedCoupon ? (
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                          {t?.haveCoupon || "Have a promo discount coupon?"}
                        </div>
                        <form onSubmit={handleApplyClick} style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            className="input-field"
                            style={{ padding: "8px 12px", fontSize: "0.82rem", textTransform: "uppercase" }}
                            placeholder={t?.enterCoupon || "e.g. ANGKOR10"}
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: "8px 16px", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                          >
                            {t?.apply || "Apply"}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#eff6ff",
                          border: "1px dashed #3b82f6",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <TicketPercent size={16} color="#2563eb" />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1e40af" }}>
                              {appliedCoupon.code}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#3b82f6" }}>
                              {appliedCoupon.discountType === "percent"
                                ? `${appliedCoupon.discountValue}% Off Total Order`
                                : `$${appliedCoupon.discountValue} USD Off`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.95rem" }}>
                            -${couponDiscountAmount} USD
                          </span>
                          <button
                            type="button"
                            onClick={onRemoveCoupon}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#94a3b8",
                              padding: "2px",
                            }}
                            title="Remove coupon"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {couponError && (
                      <div style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "6px", fontWeight: 600 }}>
                        {couponError}
                      </div>
                    )}
                    {couponSuccess && (
                      <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "6px", fontWeight: 600 }}>
                        {couponSuccess}
                      </div>
                    )}
                  </div>

                  {/* COMBO DISCOUNT BANNER */}
                  {isCombo && comboDiscountAmount > 0 && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#15803d",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Tag size={14} />
                        <span>{t?.comboDiscount || "Combo Special"} ({settings.comboDiscountPercent}%)</span>
                      </div>
                      <span>-${comboDiscountAmount} USD</span>
                    </div>
                  )}

                  {/* FINANCIAL TOTALS SUMMARY */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748b" }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>${subtotal} USD</span>
                    </div>

                    {isCombo && comboDiscountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#16a34a" }}>
                        <span>Combo Discount</span>
                        <span style={{ fontWeight: 700 }}>-${comboDiscountAmount} USD</span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#2563eb" }}>
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span style={{ fontWeight: 700 }}>-${couponDiscountAmount} USD</span>
                      </div>
                    )}

                    <div
                      style={{
                        borderTop: "2px solid #0f172a",
                        paddingTop: "8px",
                        marginTop: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.78rem", textTransform: "uppercase", fontWeight: 800, color: "#64748b" }}>
                          {t?.estimatedTotal || "Estimated Total"}
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#059669", marginTop: "2px" }}>
                          ≈ {finalTotalKHR.toLocaleString()} KHR
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#0f172a", fontFamily: "var(--font-brand)", lineHeight: 1 }}>
                          ${finalTotalUSD} <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="cart-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setIsOpen(false);
                  onSendTelegram();
                }}
                disabled={totalItemsCount === 0}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  cursor: totalItemsCount === 0 ? "not-allowed" : "pointer",
                  opacity: totalItemsCount === 0 ? 0.6 : 1,
                }}
              >
                <Send size={16} />
                <span>{t?.confirmViaTelegram || "CONFIRM VIA TELEGRAM"}</span>
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenVoucher();
                  }}
                  disabled={totalItemsCount === 0}
                  style={{
                    padding: "10px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Download size={14} />
                  <span>{t?.downloadSlip || "Quotation Slip"}</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onCopyLink}
                  style={{
                    padding: "10px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? (t?.linkCopied || "Copied!") : (t?.copyLink || "Share Link")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
