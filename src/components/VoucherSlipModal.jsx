import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, X, Send } from "lucide-react";
import logoImg from "../assets/logo.png";

export default function VoucherSlipModal({
  isOpen,
  onClose,
  selectedRoomItems = [], // [ { room, qty, nights, cost } ]
  selectedMotoItems = [], // [ { moto, qty, days, cost } ]
  selectedAddonItems = [], // [ { addon, qty, cost } ]
  startDate,
  endDate,
  startTime = "08:00",
  endTime = "18:00",
  settings = {},
  quoteId,
  onSendTelegram,
  appliedCoupon,
  couponDiscountAmount: directCouponDiscount,
  comboDiscountAmount: directComboDiscount,
  totalUSD: directTotalUSD,
  lang = "kh",
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
  const calculatedComboDiscount = Math.round((roomCost + motoCost) * comboDiscountRate);
  const comboDiscountAmount = directComboDiscount !== undefined ? Number(directComboDiscount) : calculatedComboDiscount;

  const subtotal = roomCost + motoCost + addonsCost;

  let couponDiscountAmount = 0;
  if (directCouponDiscount !== undefined) {
    couponDiscountAmount = Number(directCouponDiscount) || 0;
  } else if (appliedCoupon) {
    if (appliedCoupon.discountAmount !== undefined) {
      couponDiscountAmount = Number(appliedCoupon.discountAmount) || 0;
    } else if (appliedCoupon.couponDiscountUSD !== undefined) {
      couponDiscountAmount = Number(appliedCoupon.couponDiscountUSD) || 0;
    } else if (appliedCoupon.discountType === "percent") {
      couponDiscountAmount = Math.round(subtotal * (Number(appliedCoupon.discountValue || 0) / 100));
    } else {
      couponDiscountAmount = Math.min(subtotal, Number(appliedCoupon.discountValue || 0));
    }
  }

  const totalDiscount = comboDiscountAmount + couponDiscountAmount;
  const finalTotalUSD = directTotalUSD !== undefined ? Number(directTotalUSD) : Math.max(0, subtotal - totalDiscount);
  const finalTotalKHR = Math.round(finalTotalUSD * (settings.exchangeRateKHR || 4000));

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
      link.download = `Siemreap_Angkor_Invoice_${quoteId || "Preview"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
      alert("Could not generate image automatically. You can take a screenshot of this invoice!");
    } finally {
      setDownloading(false);
    }
  };

  const hasItems = selectedRoomItems.length > 0 || selectedMotoItems.length > 0 || selectedAddonItems.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top bar with close button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Invoice / #{quoteId}
          </span>
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
        </div>

        {/* Printable / Downloadable Invoice Slip */}
        <div className="invoice-slip-card" ref={voucherRef}>
          {/* 1. Header: Siemreap angkor */}
          <div className="invoice-header">
            <div className="invoice-brand-row">
              <img src={logoImg} alt="Siemreap Angkor" className="invoice-brand-logo" />
              <div className="invoice-title">Siemreap angkor</div>
            </div>
            <div className="invoice-tagline">
              {settings.tagline || "Motor Rental & Rooms in Siem Reap"}
            </div>
          </div>

          {/* 2. Divider line: ——————————— */}
          <div className="invoice-divider"></div>

          {/* 3. Date start - end date */}
          <div className="invoice-date-row">
            <span className="invoice-date-label">Date:</span>{" "}
            <span className="invoice-date-val">
              {startDate} {startTime ? `(${startTime})` : ""} - {endDate} {endTime ? `(${endTime})` : ""}
            </span>
          </div>

          <div className="invoice-divider-light"></div>

          {/* 4. Table: Item, qty, price/qty, price total */}
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", width: "45%" }}>Item</th>
                  <th style={{ textAlign: "center", width: "15%" }}>Qty</th>
                  <th style={{ textAlign: "right", width: "20%" }}>Price / Qty</th>
                  <th style={{ textAlign: "right", width: "20%" }}>Price Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Motos */}
                {selectedMotoItems.map(({ moto, qty, days, cost }) => (
                  <tr key={moto.id}>
                    <td>
                      <div className="invoice-item-name">{moto.name}</div>
                      <div className="invoice-item-meta">{days} {days === 1 ? "day" : "days"} (Free 2 Helmets & Phone Mount)</div>
                    </td>
                    <td style={{ textAlign: "center" }} className="invoice-mono">x{qty}</td>
                    <td style={{ textAlign: "right" }} className="invoice-mono">${moto.pricePerDay}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }} className="invoice-mono">${cost}</td>
                  </tr>
                ))}

                {/* Rooms */}
                {selectedRoomItems.map(({ room, qty, nights, cost }) => (
                  <tr key={room.id}>
                    <td>
                      <div className="invoice-item-name">{room.name}</div>
                      <div className="invoice-item-meta">{nights} {nights === 1 ? "night" : "nights"}</div>
                    </td>
                    <td style={{ textAlign: "center" }} className="invoice-mono">x{qty}</td>
                    <td style={{ textAlign: "right" }} className="invoice-mono">${room.pricePerNight}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }} className="invoice-mono">${cost}</td>
                  </tr>
                ))}

                {/* Extras */}
                {selectedAddonItems.map(({ addon, qty, cost }) => (
                  <tr key={addon.id}>
                    <td>
                      <div className="invoice-item-name">+ {addon.name}</div>
                    </td>
                    <td style={{ textAlign: "center" }} className="invoice-mono">x{qty}</td>
                    <td style={{ textAlign: "right" }} className="invoice-mono">
                      {cost === 0 ? "FREE" : `$${addon.price || cost}`}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: cost === 0 ? "#059669" : "#0f172a" }} className="invoice-mono">
                      {cost === 0 ? "FREE" : `$${cost}`}
                    </td>
                  </tr>
                ))}

                {!hasItems && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontStyle: "italic" }}>
                      No items selected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Total: price */}
          <div className="invoice-divider"></div>

          <div className="invoice-totals-area">
            {isCombo && comboDiscountAmount > 0 && (
              <div className="invoice-sub-row discount">
                <span>Combo Discount ({settings.comboDiscountPercent}%)</span>
                <span className="invoice-mono">-${comboDiscountAmount}</span>
              </div>
            )}

            {appliedCoupon && (
              <div className="invoice-sub-row discount">
                <span>Coupon ({appliedCoupon.code})</span>
                <span className="invoice-mono">-${couponDiscountAmount}</span>
              </div>
            )}

            <div className="invoice-total-main">
              <span className="invoice-total-label">Total:</span>
              <div style={{ textAlign: "right" }}>
                <span className="invoice-total-val">${finalTotalUSD}</span>
                <span className="invoice-total-khr"> (~{finalTotalKHR.toLocaleString()} KHR)</span>
              </div>
            </div>
          </div>

          {/* Location & Contact footer */}
          <div className="invoice-footer-note">
            <div>Tel / Telegram: {settings.phone || "+855 16 308 199"}</div>
            <div>Siem Reap, Cambodia</div>
          </div>
        </div>

        {/* 6. Action buttons: Download & Send to telegram */}
        <div className="invoice-actions-grid">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownloadImage}
            disabled={downloading}
            style={{
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 800,
              fontSize: "0.92rem",
            }}
          >
            <Download size={16} />
            <span>{downloading ? "Downloading..." : "Download"}</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onSendTelegram();
              onClose();
            }}
            style={{
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 800,
              fontSize: "0.92rem",
              background: "#0f172a",
              color: "#ffffff",
            }}
          >
            <Send size={16} />
            <span>Send to telegram</span>
          </button>
        </div>
      </div>
    </div>
  );
}
