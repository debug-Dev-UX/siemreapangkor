import React from "react";
import { Sparkles, CheckCircle2, Shield, MapPin, Zap } from "lucide-react";

export default function Hero({ comboDiscountPercent }) {
  return (
    <div className="hero-banner">
      <div className="hero-tag">
        <Sparkles size={16} />
        <span>Instant Price Preview & Combo Deals</span>
      </div>

      <h1 className="hero-heading">
        Explore <span className="gold">Siem Reap & Angkor</span> Your Way
      </h1>

      <p className="hero-desc">
        Select your boutique room and reliable motorbike together. Get transparent instant price calculations,
        save with our <span style={{ color: "#fbbf24", fontWeight: 700 }}>{comboDiscountPercent}% Combo Discount</span>,
        and send your custom quote directly via Telegram with one tap.
      </p>

      <div className="hero-highlights">
        <div className="highlight-pill">
          <CheckCircle2 size={16} />
          <span>Real-time Transparent Pricing</span>
        </div>
        <div className="highlight-pill">
          <CheckCircle2 size={16} />
          <span>Angkor-Ready Scooters (Helmets & Phone Holder)</span>
        </div>
        <div className="highlight-pill">
          <CheckCircle2 size={16} />
          <span>Near Pub Street & Old Market</span>
        </div>
        <div className="highlight-pill">
          <CheckCircle2 size={16} />
          <span>Downloadable Quotation Card</span>
        </div>
      </div>
    </div>
  );
}
