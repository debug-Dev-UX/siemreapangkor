import React from "react";
import {
  Send,
  Download,
  Copy,
  ShoppingBag,
  Calendar,
  Check,
  Tag,
} from "lucide-react";

export default function PreviewSidebar({
  selectedRoom,
  selectedMoto,
  selectedAddons,
  days,
  startDate,
  endDate,
  settings,
  onCopyLink,
  onOpenVoucher,
  onSendTelegram,
  copied,
}) {
  const roomCost = selectedRoom ? selectedRoom.pricePerNight * days : 0;
  const motoCost = selectedMoto ? selectedMoto.pricePerDay * days : 0;
  
  const addonsCost = selectedAddons.reduce((sum, item) => {
    return sum + (item.type === "per-day" ? item.price * days : item.price);
  }, 0);

  // Combo discount when both room and moto are booked
  const isCombo = Boolean(selectedRoom && selectedMoto);
  const comboDiscountRate = isCombo ? (settings.comboDiscountPercent || 10) / 100 : 0;
  const discountAmount = Math.round((roomCost + motoCost) * comboDiscountRate);

  const subtotal = roomCost + motoCost + addonsCost;
  const finalTotalUSD = Math.max(0, subtotal - discountAmount);
  const finalTotalKHR = Math.round(finalTotalUSD * (settings.exchangeRateKHR || 4100));

  return (
    <aside className="preview-sidebar">
      <div className="preview-box">
        <div className="preview-header">
          <div className="preview-title">
            <ShoppingBag size={18} />
            <span>Order Summary</span>
          </div>
          {isCombo && (
            <span className="badge-red" style={{ fontSize: "0.68rem" }}>
              -{settings.comboDiscountPercent}% COMBO
            </span>
          )}
        </div>

        {/* Date Row */}
        <div className="preview-dates-row">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0f172a", fontWeight: 600 }}>
            <Calendar size={14} color="#0f172a" />
            <span>
              {startDate || "Start"} → {endDate || "End"}
            </span>
          </div>
          <span style={{ fontWeight: 800, color: "#0f172a" }}>
            {days} {days === 1 ? "Day" : "Days"}
          </span>
        </div>

        {/* Selected Items Breakdown */}
        <div className="preview-items-list">
          {/* Room item */}
          <div className="preview-item-row">
            <div className="preview-item-label">
              <span className="preview-item-main">
                {selectedRoom ? selectedRoom.name : "No Room Selected"}
              </span>
              {selectedRoom && (
                <span className="preview-item-sub">
                  ${selectedRoom.pricePerNight} × {days} {days === 1 ? "night" : "nights"}
                </span>
              )}
            </div>
            <span className="preview-item-val">${roomCost}</span>
          </div>

          {/* Moto item */}
          <div className="preview-item-row">
            <div className="preview-item-label">
              <span className="preview-item-main">
                {selectedMoto ? selectedMoto.name : "No Moto Selected"}
              </span>
              {selectedMoto && (
                <span className="preview-item-sub">
                  ${selectedMoto.pricePerDay} × {days} {days === 1 ? "day" : "days"} (2 Helmets)
                </span>
              )}
            </div>
            <span className="preview-item-val">
              ${motoCost}
            </span>
          </div>

          {/* Add-ons list if any */}
          {selectedAddons.length > 0 && (
            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
              {selectedAddons.map((addon) => {
                const cost = addon.type === "per-day" ? addon.price * days : addon.price;
                return (
                  <div key={addon.id} className="preview-item-row" style={{ marginBottom: "4px" }}>
                    <div className="preview-item-label">
                      <span className="preview-item-main" style={{ fontSize: "0.82rem" }}>
                        + {addon.name}
                      </span>
                    </div>
                    <span className="preview-item-val" style={{ fontSize: "0.82rem" }}>
                      {cost === 0 ? "FREE" : `$${cost}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Combo Discount Banner */}
          {isCombo && discountAmount > 0 && (
            <div className="combo-banner">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Tag size={15} />
                <span>Combo Special ({settings.comboDiscountPercent}% OFF)</span>
              </div>
              <span style={{ fontWeight: 800 }}>-${discountAmount}</span>
            </div>
          )}
        </div>

        {/* Total Cost Display */}
        <div className="preview-total-card">
          <div className="total-row">
            <span className="total-label">Estimated Total</span>
            <div className="total-amount-usd">${finalTotalUSD} USD</div>
          </div>
          <div className="total-amount-khr">
            ≈ {finalTotalKHR.toLocaleString()} KHR
          </div>
        </div>

        {/* Action Buttons */}
        <div className="preview-actions">
          <button className="btn-telegram" onClick={onSendTelegram} style={{ width: "100%", padding: "12px" }}>
            <Send size={16} />
            <span>CONFIRM VIA TELEGRAM</span>
          </button>

          <button className="btn-primary" onClick={onOpenVoucher} style={{ width: "100%", padding: "11px" }}>
            <Download size={16} />
            <span>Download Quotation Slip (Image)</span>
          </button>

          <button className="btn-secondary" onClick={onCopyLink} style={{ width: "100%", padding: "10px" }}>
            {copied ? (
              <>
                <Check size={16} color="#059669" />
                <span style={{ color: "#059669", fontWeight: 700 }}>Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>
        </div>

        <div style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", marginTop: "2px" }}>
          Transparent pricing without middleman. Send directly to Telegram to book!
        </div>
      </div>
    </aside>
  );
}
