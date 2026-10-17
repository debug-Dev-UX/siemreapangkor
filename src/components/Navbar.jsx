import React from "react";
import { Send, RotateCcw, Globe } from "lucide-react";
import logoImg from "../assets/logo.png";

export default function Navbar({ onReset, settings, lang, onToggleLang, t }) {
  return (
    <div className="fixed-header-wrapper">
      {/* Top Zando-style announcement banner */}
      <div className="top-promo-bar">
        {settings?.topPromoText || t?.topPromo || "FREE 2 HELMETS & PHONE HOLDER WITH EVERY MOTORBIKE • INSTANT PREVIEW"}
      </div>

      <header className="site-header">
        <div className="nav-container">
          <div className="brand-wrapper" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img
              src={logoImg}
              alt="Siemreap Angkor Logo"
              className="brand-logo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/logo.png";
              }}
            />
            <div className="brand-text-block">
              <div className="brand-title">{settings.projectName || "Siemreap Angkor"}</div>
              <div className="brand-subtitle">{t?.tagline || settings.tagline || "Motor Rental & Rooms"}</div>
            </div>
          </div>

          <div className="nav-actions">
            {/* Language Switcher Button with National Flags */}
            <button
              className="btn-secondary"
              onClick={onToggleLang}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 700,
                padding: "6px 12px",
                fontSize: "0.82rem",
                borderRadius: "6px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
              title="Change language / ផ្លាស់ប្តូរភាសា"
            >
              <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>
                {lang === "kh" ? "🇰🇭" : "🇬🇧"}
              </span>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>
                {lang === "kh" ? "ខ្មែរ (KH)" : "English (EN)"}
              </span>
            </button>

            <a
              href={`https://t.me/${(settings.telegramUsername || "Motor_Rental_Siemreap_Angkor").replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-telegram"
            >
              <Send size={15} />
              <span>{t?.telegram || "Telegram"}</span>
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}
