import React from "react";
import { Send, RotateCcw, Globe } from "lucide-react";
import logoImg from "../assets/logo.png";

export default function Navbar({ onReset, settings, lang, onToggleLang, t }) {
  return (
    <>
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
            {/* Language Switcher Button (KH / EN) */}
            <button
              className="btn-secondary"
              onClick={onToggleLang}
              style={{ fontWeight: 700, padding: "7px 12px", fontSize: "0.82rem" }}
              title="Change language / ផ្លាស់ប្តូរភាសា"
            >
              <Globe size={14} />
              <span>{lang === "en" ? "KH" : "EN"}</span>
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
    </>
  );
}
