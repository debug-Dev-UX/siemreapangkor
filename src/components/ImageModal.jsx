import React from "react";
import { X } from "lucide-react";

export default function ImageModal({ isOpen, onClose, image, title, priceText, details, t, lang }) {
  if (!isOpen || !image) return null;

  const closeLabel = t?.closeText || (lang === "kh" ? "(បិទ)" : "(close)");

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="modal-content"
        style={{ maxWidth: "680px", padding: "16px", borderRadius: "var(--radius-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>{title}</h3>
            {priceText && <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{priceText}</div>}
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", width: "auto" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b" }}>{closeLabel}</span>
            <X size={16} />
          </button>
        </div>

        <div style={{ width: "100%", maxHeight: "65vh", overflow: "hidden", borderRadius: "var(--radius-sm)", background: "#f1f5f9" }}>
          <img
            src={image}
            alt={title}
            style={{ width: "100%", height: "100%", maxHeight: "65vh", objectFit: "contain", display: "block" }}
          />
        </div>

        {details && (
          <div style={{ marginTop: "12px", fontSize: "0.82rem", color: "#475569" }}>
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
