import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function ImageModal({
  isOpen,
  onClose,
  image,
  imageSrc,
  title,
  priceText,
  details,
  t,
  lang = "en",
}) {
  const currentImg = image || imageSrc;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentImg) return null;

  const closeLabel = t?.closeText || (lang === "kh" ? "(បិទ)" : "(close)");

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: "680px",
          width: "100%",
          padding: "18px",
          borderRadius: "14px",
          background: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          position: "relative",
          animation: "zoomCenter 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "10px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {title}
            </h3>
            {priceText && <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>{priceText}</div>}
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
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
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>{closeLabel}</span>
            <X size={16} color="#475569" />
          </button>
        </div>

        <div
          style={{
            width: "100%",
            maxHeight: "68vh",
            overflow: "hidden",
            borderRadius: "10px",
            background: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={currentImg}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "68vh",
              objectFit: "contain",
              display: "block",
            }}
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
