import React from "react";
import { Calendar } from "lucide-react";

export default function DateSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  days,
  t,
}) {
  const setPreset = (numDays) => {
    const start = new Date(startDate || Date.now());
    const next = new Date(start);
    next.setDate(start.getDate() + numDays);
    onEndDateChange(next.toISOString().split("T")[0]);
  };

  return (
    <div className="date-selector-bar">
      <div className="date-group">
        <label className="date-label">
          <Calendar size={13} color="#0f172a" />
          <span>{t?.rentalStart || "Rental Start / Check-in"}</span>
        </label>
        <input
          type="date"
          className="date-input"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>

      <div className="date-group">
        <label className="date-label">
          <Calendar size={13} color="#0f172a" />
          <span>{t?.rentalEnd || "Rental End / Check-out"}</span>
        </label>
        <input
          type="date"
          className="date-input"
          value={endDate}
          min={startDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>

      <div className="duration-summary-pill">
        <div className="duration-days">{days} {days === 1 ? (t?.day || "Day") : (t?.days || "Days")}</div>
        <div className="duration-sub">{t?.tripDuration || "Trip Duration"}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        <button
          type="button"
          onClick={() => setPreset(1)}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700 }}
        >
          1 {t?.day || "Day"}
        </button>
        <button
          type="button"
          onClick={() => setPreset(3)}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700 }}
        >
          3 {t?.days || "Days"}
        </button>
        <button
          type="button"
          onClick={() => setPreset(5)}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700 }}
        >
          5 {t?.days || "Days"}
        </button>
        <button
          type="button"
          onClick={() => setPreset(7)}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700 }}
        >
          7 {t?.days || "Days"}
        </button>
      </div>
    </div>
  );
}
