import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Send,
  Download,
  Copy,
  Check,
  Calendar,
  X,
  TicketPercent,
  ArrowRight,
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

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
    }
  };

  return (
    <>
      {/* Sleek Floating Bottom Checkout Pill */}
      {totalItemsCount > 0 && (
        <div className="cart-floating-dock">
          <button
            type="button"
            className="cart-floating-btn"
            onClick={() => setIsOpen(true)}
            aria-label="View Cart"
          >
            <div className="cart-floating-left">
              <div className="cart-icon-bubble">
                <ShoppingBag size={17} />
                <span className="cart-bubble-badge">{totalItemsCount}</span>
              </div>
              <div className="cart-floating-text">
                <span className="cart-floating-count">{totalItemsCount} {t?.items || "items"}</span>
                <span className="cart-floating-price">${finalTotalUSD} USD</span>
              </div>
            </div>

            <div className="cart-floating-right">
              <span>{t?.viewCart || "View Cart"}</span>
              <ArrowRight size={15} />
            </div>
          </button>
        </div>
      )}

      {/* Clean Centered Cart Modal Dialog */}
      {isOpen && (
        <div className="cart-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="cart-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="cart-sheet-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 className="cart-sheet-title">{t?.cartSummary || "Cart Summary"}</h3>
                  <span className="cart-sheet-badge">{totalItemsCount} {t?.items || "items"}</span>
                </div>
                <div className="cart-sheet-dates">
                  <Calendar size={12} />
                  <span>{startDate} → {endDate}</span>
                </div>
              </div>

              {/* Clean Inline Close Button (NEVER floats outside!) */}
              <button
                type="button"
                className="cart-sheet-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="cart-sheet-body">
              {totalItemsCount === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag size={36} color="#cbd5e1" style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#334155" }}>
                    {t?.noItemsSelected || "Your cart is empty"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                    Select rooms, motorbikes, or extras to preview your booking.
                  </div>
                </div>
              ) : (
                <>
                  {/* Clean List Items (NO nested boxes!) */}
                  <div className="cart-items-stream">
                    {/* Rooms */}
                    {selectedRoomItems.map(({ room, qty, nights, cost }) => (
                      <div key={room.id} className="cart-stream-row">
                        <div className="stream-row-left">
                          <span className="stream-type-tag room">Room</span>
                          <div>
                            <div className="stream-row-title">{room.name}</div>
                            <div className="stream-row-sub">
                              {qty > 1 ? `${qty} rooms • ` : ""}${nights} {nights === 1 ? "night" : "nights"} (${room.pricePerNight}$/night)
                            </div>
                          </div>
                        </div>
                        <div className="stream-row-price">${cost}</div>
                      </div>
                    ))}

                    {/* Motos */}
                    {selectedMotoItems.map(({ moto, qty, days, cost }) => (
                      <div key={moto.id} className="cart-stream-row">
                        <div className="stream-row-left">
                          <span className="stream-type-tag moto">Moto</span>
                          <div>
                            <div className="stream-row-title">{moto.name}</div>
                            <div className="stream-row-sub">
                              {qty > 1 ? `${qty} bikes • ` : ""}${days} {days === 1 ? "day" : "days"} (${moto.pricePerDay}$/day)
                            </div>
                          </div>
                        </div>
                        <div className="stream-row-price">${cost}</div>
                      </div>
                    ))}

                    {/* Extras */}
                    {selectedAddonItems.map(({ addon, qty, cost }) => (
                      <div key={addon.id} className="cart-stream-row">
                        <div className="stream-row-left">
                          <span className={`stream-type-tag ${cost === 0 ? "free" : "extra"}`}>
                            {cost === 0 ? "Free" : "Extra"}
                          </span>
                          <div>
                            <div className="stream-row-title">{addon.name}</div>
                            <div className="stream-row-sub">
                              {qty > 1 ? `Quantity: ${qty}` : "1 unit included"}
                            </div>
                          </div>
                        </div>
                        <div className={`stream-row-price ${cost === 0 ? "free-text" : ""}`}>
                          {cost === 0 ? "FREE" : `$${cost}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean Coupon Input */}
                  <div className="cart-coupon-strip">
                    {!appliedCoupon ? (
                      <form onSubmit={handleApplyClick} className="cart-coupon-form">
                        <div style={{ position: "relative", flex: 1 }}>
                          <TicketPercent size={15} className="coupon-input-icon" />
                          <input
                            type="text"
                            className="cart-coupon-input"
                            placeholder={t?.enterCoupon || "Coupon code (e.g. ANGKOR10)"}
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="cart-coupon-btn">
                          {t?.apply || "Apply"}
                        </button>
                      </form>
                    ) : (
                      <div className="cart-coupon-active">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <TicketPercent size={15} color="#059669" />
                          <span style={{ fontWeight: 700, color: "#059669", fontSize: "0.82rem" }}>
                            {appliedCoupon.code} (-${couponDiscountAmount})
                          </span>
                        </div>
                        <button
                          type="button"
                          className="cart-coupon-remove"
                          onClick={onRemoveCoupon}
                        >
                          {t?.removeCoupon || "Remove"}
                        </button>
                      </div>
                    )}
                    {couponError && <div className="cart-coupon-error">{couponError}</div>}
                    {couponSuccess && <div className="cart-coupon-success">{couponSuccess}</div>}
                  </div>

                  {/* Clean Summary Breakdown */}
                  <div className="cart-cost-summary">
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <span className="summary-mono">${subtotal} USD</span>
                    </div>

                    {isCombo && comboDiscountAmount > 0 && (
                      <div className="summary-line discount">
                        <span>Combo Discount ({settings.comboDiscountPercent}%)</span>
                        <span className="summary-mono">-${comboDiscountAmount} USD</span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="summary-line discount">
                        <span>Coupon ({appliedCoupon.code})</span>
                        <span className="summary-mono">-${couponDiscountAmount} USD</span>
                      </div>
                    )}

                    <div className="summary-divider"></div>

                    <div className="summary-total-row">
                      <div>
                        <div className="summary-total-title">{t?.estimatedTotal || "Estimated Total"}</div>
                        <div className="summary-khr-equiv">≈ {finalTotalKHR.toLocaleString()} KHR</div>
                      </div>
                      <div className="summary-total-figure">
                        ${finalTotalUSD} <span className="figure-unit">USD</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="cart-sheet-footer">
              <button
                type="button"
                className="cart-primary-action"
                onClick={() => {
                  setIsOpen(false);
                  onSendTelegram();
                }}
                disabled={totalItemsCount === 0}
              >
                <Send size={16} />
                <span>{t?.confirmViaTelegram || "CONFIRM VIA TELEGRAM"}</span>
              </button>

              <div className="cart-secondary-actions">
                <button
                  type="button"
                  className="cart-ghost-action"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenVoucher();
                  }}
                  disabled={totalItemsCount === 0}
                >
                  <Download size={14} />
                  <span>{lang === "kh" ? "វិក្កយបត្រ (Invoice)" : "Invoice"}</span>
                </button>

                <button
                  type="button"
                  className="cart-ghost-action"
                  onClick={onCopyLink}
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
