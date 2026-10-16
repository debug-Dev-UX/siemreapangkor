import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, X, Send, Hotel, Bike, Tag, Phone, TicketPercent } from "lucide-react";
import logoImg from "../assets/logo.png";

export default function VoucherSlipModal({
  isOpen,
  onClose,
  selectedRoomItems = [], // [ { room, qty, nights, cost } ]
  selectedMotoItems = [], // [ { moto, qty, days, cost } ]
  selectedAddonItems = [], // [ { addon, qty, cost } ]
  startDate,
  endDate,
  settings = {},
  quoteId,
  onSendTelegram,
  appliedCoupon,
  lang = "en",
  t,
}) {
  const voucherRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const roomCost = selectedRoomItems.reduce((sum, item) => sum + item.cost, 0);
  const motoCost = selectedMotoItems.reduce((sum, item) => sum + item.cost, 0);
  const addonsCost = selectedAddonItems.reduce((sum, item) => sum + item.cost, 0);

  const isCombo = selectedRoomItems.length > 0 && selectedMotoItems.length > 0;
  const comboDiscountRate = isCombo ? (settings.comboDiscountPercent || 0) / 100 : 0;
  const comboDiscountAmount = Math.round((roomCost + motoCost) * comboDiscountRate);

  const subtotal = roomCost + motoCost + addonsCost;

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

  const closeText = lang === "kh" ? "(បិទ)" : "(close)";

  const handleDownloadImage = async () => {
    if (!voucherRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Siemreap_Angkor_Quote_${quoteId || "Preview"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
      alert("Could not generate image automatically. You can take a screenshot of this slip!");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button with explicit (close) / (បិទ) text */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            width: "auto",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748b" }}>
            {closeText}
          </span>
          <X size={15} color="#64748b" />
        </button>

        <div className="modal-header-section">
          <div className="modal-title">{t?.quotationSlip || "Official Quotation Slip"}</div>
          <div className="modal-subtitle">
            {t?.quotationSlipSub || "Download this branded card or send it to Telegram for instant confirmation."}
          </div>
        </div>

        {/* Printable / Downloadable Slip Card */}
        <div className="voucher-slip" ref={voucherRef}>
          {/* Slip Header */}
          <div className="voucher-header">
            <div className="voucher-brand">
              <img src={logoImg} alt="Siemreap Angkor" className="voucher-logo-img" />
              <div>
                <div className="voucher-brand-name">{settings.projectName || "Siemreap Angkor"}</div>
                <div className="voucher-brand-tag">{settings.tagline || "Motor Rental & Rooms in Siem Reap"}</div>
              </div>
            </div>
            <div className="voucher-badge-col">
              <span className="voucher-quote-badge">{t?.quote || "QUOTE"}</span>
              <span className="voucher-id">#{quoteId}</span>
            </div>
          </div>

          {/* Details Row */}
          <div className="voucher-meta-grid">
            <div className="voucher-box">
              <div className="voucher-box-title">{t?.travelDates || "Travel Dates"}</div>
              <div className="voucher-box-val">{startDate} → {endDate}</div>
              <div className="voucher-box-sub">
                {totalRoomsQty > 0 ? `${totalRoomsQty} ${totalRoomsQty === 1 ? "Room" : "Rooms"}` : ""}
                {totalRoomsQty > 0 && totalMotosQty > 0 ? " • " : ""}
                {totalMotosQty > 0 ? `${totalMotosQty} ${totalMotosQty === 1 ? "Bike" : "Bikes"}` : ""}
              </div>
            </div>
            <div className="voucher-box">
              <div className="voucher-box-title">{t?.location || "Location"}</div>
              <div className="voucher-box-val">Siem Reap, Cambodia</div>
              <div className="voucher-box-sub">Free 2 Helmets & Phone Mount</div>
            </div>
          </div>

          {/* Table Breakdown */}
          <table className="voucher-table">
            <thead>
              <tr>
                <th>{t?.itemDescription || "Item / Description"}</th>
                <th style={{ textAlign: "center" }}>{t?.duration || "Duration / Qty"}</th>
                <th style={{ textAlign: "right" }}>{t?.total || "Total"}</th>
              </tr>
            </thead>
            <tbody>
              {/* Rooms */}
              {selectedRoomItems.length > 0 ? (
                selectedRoomItems.map(({ room, qty, nights, cost }) => (
                  <tr key={room.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Hotel size={14} />
                        <span>{room.name}{qty > 1 ? ` (${qty} Rooms)` : ""}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {t?.bookRoom || "Book Room"}: ${room.pricePerNight}{t?.perNight || "/night"}{qty > 1 ? ` × ${qty} rooms` : ""}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#475569" }}>
                      {nights} {nights === 1 ? (t?.night || "night") : (t?.nights || "nights")}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "#0f172a" }}>${cost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>
                    {t?.skipRoomTitle || "No Room selected (Moto rental only)"}
                  </td>
                </tr>
              )}

              {/* Motos */}
              {selectedMotoItems.length > 0 ? (
                selectedMotoItems.map(({ moto, qty, days, cost }) => (
                  <tr key={moto.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Bike size={14} />
                        <span>{moto.name}{qty > 1 ? ` (${qty} Bikes)` : ""}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {t?.rentMoto || "Rent Moto"}: ${moto.pricePerDay}{t?.perDay || "/day"}{qty > 1 ? ` × ${qty} bikes` : ""}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#475569" }}>
                      {days} {days === 1 ? (t?.day || "day") : (t?.days || "days")}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "#0f172a" }}>${cost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>
                    {t?.skipMotoTitle || "No Moto selected (Room only)"}
                  </td>
                </tr>
              )}

              {/* Addons (Paid & Free) */}
              {selectedAddonItems.map(({ addon, qty, cost }) => (
                <tr key={addon.id}>
                  <td>
                    <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                      + {addon.name} {qty > 1 ? `(×${qty})` : ""}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
                    {qty} {qty === 1 ? "unit" : "units"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: cost === 0 ? "#059669" : "#0f172a" }}>
                    {cost === 0 ? (t?.free || "FREE") : `$${cost}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div className="voucher-totals">
            <div className="voucher-total-row">
              <span className="voucher-total-label">Subtotal</span>
              <span className="voucher-total-val">${subtotal} USD</span>
            </div>

            {isCombo && comboDiscountAmount > 0 && (
              <div className="voucher-total-row discount">
                <span className="voucher-total-label">
                  <Tag size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                  {t?.comboDiscount || "Combo Discount"} ({settings.comboDiscountPercent}%)
                </span>
                <span className="voucher-total-val">-${comboDiscountAmount} USD</span>
              </div>
            )}

            {appliedCoupon && (
              <div className="voucher-total-row discount">
                <span className="voucher-total-label">
                  <TicketPercent size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                  {t?.couponDiscount || "Coupon"} ({appliedCoupon.code})
                </span>
                <span className="voucher-total-val">-${couponDiscountAmount} USD</span>
              </div>
            )}

            <div className="voucher-total-row grand">
              <span className="voucher-total-label">{t?.total || "Total Estimated"}</span>
              <div style={{ textAlign: "right" }}>
                <div className="voucher-total-val grand">${finalTotalUSD} USD</div>
                <div className="voucher-khr-equiv">≈ {finalTotalKHR.toLocaleString()} KHR</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="voucher-footer">
            <div>
              <div className="voucher-contact-line">
                <Phone size={12} />
                <span>Telegram / WhatsApp: {settings.phone || "+855 16 308 199"}</span>
              </div>
              <div className="voucher-note">
                {settings.address || "Street BBU, Near Pub Street & Old Market, Siem Reap"}
              </div>
            </div>
            <div className="voucher-timestamp">
              Generated {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-actions-bar">
          <button
            className="btn-primary"
            onClick={onSendTelegram}
            style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Send size={16} />
            <span>{t?.confirmViaTelegram || "Send to Telegram"}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={handleDownloadImage}
            disabled={downloading}
            style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Download size={16} />
            <span>{downloading ? (t?.generatingPng || "Saving...") : (t?.downloadPng || "Download PNG")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
