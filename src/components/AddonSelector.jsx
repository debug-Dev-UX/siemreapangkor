import React, { useState } from "react";
import {
  Gift,
  Sparkles,
  ChevronDown,
  X,
  Eye,
  Plus,
  Minus,
  Check,
  PackageCheck,
} from "lucide-react";
import ImageModal from "./ImageModal";

export default function AddonSelector({
  addons = [],
  addonQuantities = {},
  onUpdateAddonQty,
  days = 1,
  billingTypes = [],
  isLoading = false,
  lang = "kh",
  t,
}) {
  const [isFreeOpen, setIsFreeOpen] = useState(false);
  const [isPaidOpen, setIsPaidOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  if (isLoading) {
    return (
      <section className="clean-section-card" style={{ marginTop: "20px" }}>
        <div className="clean-section-header">
          <div className="clean-header-info">
            <div className="clean-icon-pill" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="clean-section-title">
                {t?.step3Title || (lang === "kh" ? "សេវាកម្មបន្ថែម (Extras)" : "Extras")}
              </h2>
              <p className="clean-section-desc">
                {lang === "kh" ? "កំពុងទាញយកទិន្នន័យពី Database..." : "Loading extra services from database..."}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
          <div className="skeleton-trigger-box skeleton-shimmer" />
          <div className="skeleton-trigger-box skeleton-shimmer" />
        </div>
      </section>
    );
  }

  if (!addons || addons.length === 0) return null;

  const getBillingMode = (addon) => {
    const bType = billingTypes.find((b) => b.id === addon?.type);
    return bType ? bType.chargeMode : (addon?.type === "per-day" ? "per-day" : (addon?.type === "free" ? "free" : "one-time"));
  };
  const isFreeItem = (a) => getBillingMode(a) === "free" || Number(a.price) === 0;
  const isPerDay = (a) => getBillingMode(a) === "per-day";
  const getAddonUnitPrice = (a) => isFreeItem(a) ? 0 : (isPerDay(a) ? Number(a.price) * days : Number(a.price));
  const getAddonBadgeText = (a) => {
    const unitPrice = getAddonUnitPrice(a);
    if (isFreeItem(a)) return lang === "kh" ? "ឥតគិតថ្លៃ" : "FREE";
    if (isPerDay(a)) return `$${unitPrice} ($${a.price}/d)`;
    const bType = billingTypes.find((b) => b.id === a.type);
    return `$${unitPrice} ${bType ? bType.name : (lang === "kh" ? "ក្នុង១" : "each")}`;
  };

  const freeAddons = addons.filter(isFreeItem);
  const paidAddons = addons.filter((a) => !isFreeItem(a));

  const selectedFreeList = freeAddons.filter((a) => (addonQuantities[a.id] || 0) > 0);
  const selectedPaidList = paidAddons.filter((a) => (addonQuantities[a.id] || 0) > 0);

  const totalSelectedCount = selectedFreeList.length + selectedPaidList.length;

  const handleToggleAddon = (addonId) => {
    const current = addonQuantities[addonId] || 0;
    if (current > 0) {
      onUpdateAddonQty(addonId, 0);
    } else {
      const item = addons.find((a) => a.id === addonId);
      onUpdateAddonQty(addonId, item?.defaultQty || 1);
    }
  };

  const handleQtyChange = (addonId, delta) => {
    const current = addonQuantities[addonId] || 0;
    const next = Math.max(0, current + delta);
    onUpdateAddonQty(addonId, next);
  };

  const handleClearAll = () => {
    addons.forEach((a) => {
      if ((addonQuantities[a.id] || 0) > 0) {
        onUpdateAddonQty(a.id, 0);
      }
    });
  };

  const handleClearCategory = (categoryItems) => {
    categoryItems.forEach((a) => {
      if ((addonQuantities[a.id] || 0) > 0) {
        onUpdateAddonQty(a.id, 0);
      }
    });
  };

  return (
    <section className="clean-section-card">
      {/* Clean Step 3 Header */}
      <div className="clean-section-header">
        <div className="clean-header-info">
          <div className="clean-icon-pill">
            <PackageCheck size={18} />
          </div>
          <div>
            <h2 className="clean-section-title">
              {t?.step3Title || "Step 3: Extra Services & Inclusions"}
            </h2>
            <p className="clean-section-desc">
              {lang === "kh"
                ? "ជ្រើសរើសសម្ភារហ្វ្រី និងសេវាកម្មបន្ថែមតាមតម្រូវការរបស់អ្នក"
                : "Select free inclusions and optional extras tailored for your trip"}
            </p>
          </div>
        </div>

        {totalSelectedCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="clean-clear-btn"
            title="Clear all extras"
          >
            <X size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* ========================================================
          SECTION 1: FREE INCLUSIONS & GEAR (100% FREE)
          ======================================================== */}
      {freeAddons.length > 0 && (
        <div className="extra-category-block is-free-category">
          <div className="extra-category-header">
            <div className="extra-category-title-wrap">
              <span className="extra-badge-pill free">🎁 100% FREE</span>
            </div>
            {selectedFreeList.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="extra-category-count">
                  {selectedFreeList.length} {lang === "kh" ? "មុខបានរើស" : "selected"}
                </span>
                <button
                  type="button"
                  onClick={() => handleClearCategory(freeAddons)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {lang === "kh" ? "លុប" : "Clear"}
                </button>
              </div>
            )}
          </div>

          {/* Custom Selection Trigger for Free Items */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={`custom-select-trigger-btn is-free-trigger ${isFreeOpen ? "is-active" : ""}`}
              onClick={() => {
                setIsFreeOpen(!isFreeOpen);
                setIsPaidOpen(false);
              }}
            >
              <div className="trigger-label-group">
                <div className="trigger-icon-box free">
                  <Gift size={16} />
                </div>
                <span className="trigger-text-main">
                  {selectedFreeList.length === 0
                    ? (lang === "kh"
                        ? "+ ជ្រើសរើសសម្ភារហ្វ្រី (មួកសុវត្ថិភាព, ប្រដាប់ដាក់ទូរស័ព្ទ, ផែនទី)..."
                        : "+ Select Free Gear (Helmets, Phone Mount, Map)...")
                    : (lang === "kh"
                        ? `+ បន្ថែមសម្ភារហ្វ្រីផ្សេងទៀត (${selectedFreeList.length} មុខបានរើស)...`
                        : `+ Add more free items (${selectedFreeList.length} selected)...`)}
                </span>
              </div>
              <ChevronDown size={18} className={`trigger-chevron ${isFreeOpen ? "is-open" : ""}`} />
            </button>

            {/* Custom Dropdown Menu for Free Items */}
            {isFreeOpen && (
              <div className="custom-dropdown-panel">
                <div className="custom-dropdown-topbar">
                  <span className="custom-dropdown-heading">
                    {lang === "kh" ? "បញ្ជីសម្ភារហ្វ្រីឥតគិតថ្លៃ" : "Free Gear & Inclusions List"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFreeOpen(false)}
                    className="custom-dropdown-done-btn"
                  >
                    {lang === "kh" ? "រួចរាល់ ✓" : "Done ✓"}
                  </button>
                </div>

                <div className="custom-dropdown-items-list">
                  {freeAddons.map((addon) => {
                    const isSelected = (addonQuantities[addon.id] || 0) > 0;
                    const qty = addonQuantities[addon.id] || 0;

                    return (
                      <div
                        key={addon.id}
                        className={`custom-dropdown-row ${isSelected ? "is-selected" : ""}`}
                        onClick={() => handleToggleAddon(addon.id)}
                      >
                        {/* Thumbnail */}
                        {addon.image ? (
                          <div
                            className="custom-row-thumb"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(addon.image);
                              setPreviewTitle(addon.name);
                            }}
                            title={lang === "kh" ? "ចុចដើម្បីមើលរូបធំ" : "Click to zoom"}
                          >
                            <img src={addon.image} alt={addon.name} />
                          </div>
                        ) : (
                          <div className="custom-row-thumb-placeholder">
                            <Gift size={20} color="#059669" />
                          </div>
                        )}

                        {/* Title & Description */}
                        <div className="custom-row-info">
                          <div className="custom-row-title">{addon.name}</div>
                          {addon.description && (
                            <div className="custom-row-desc">{addon.description}</div>
                          )}
                        </div>

                        {/* Price Badge & Add Button */}
                        <div className="custom-row-right">
                          <span className="custom-row-price free">FREE</span>
                          <button
                            type="button"
                            className={`custom-add-toggle-btn ${isSelected ? "is-added-free" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAddon(addon.id);
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check size={12} />
                                <span>{lang === "kh" ? `បានរើស (×${qty})` : `Added (×${qty})`}</span>
                              </>
                            ) : (
                              <span>{lang === "kh" ? "+ ជ្រើសរើស" : "+ Add"}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Free Items Cards with Quantity Stepper */}
          {selectedFreeList.length > 0 && (
            <div className="clean-items-grid" style={{ marginTop: "14px" }}>
              {selectedFreeList.map((addon) => {
                const qty = addonQuantities[addon.id] || 1;

                return (
                  <div key={addon.id} className="clean-item-card clean-item-card-free">
                    <div className="clean-item-top">
                      {addon.image ? (
                        <div
                          className="clean-item-thumb"
                          onClick={() => {
                            setPreviewImage(addon.image);
                            setPreviewTitle(addon.name);
                          }}
                          title="Preview Photo"
                        >
                          <img src={addon.image} alt={addon.name} />
                          <div className="thumb-zoom-overlay">
                            <Eye size={14} color="#ffffff" />
                          </div>
                        </div>
                      ) : (
                        <div className="clean-item-thumb-placeholder">
                          <Gift size={20} color="#059669" />
                        </div>
                      )}

                      <div className="clean-item-details">
                        <div className="clean-item-row-top">
                          <div>
                            <div className="clean-item-title">
                              {addon.name}
                              <span className="clean-badge-free">FREE</span>
                            </div>
                            <div className="clean-item-meta">
                              {addon.description || "Free inclusion item"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateAddonQty(addon.id, 0)}
                            className="clean-remove-btn"
                            title="Remove"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="clean-item-controls">
                      <div className="clean-steppers-wrap">
                        <div className="clean-stepper-group">
                          <span className="stepper-label">{t?.quantity || "Quantity"}:</span>
                          <div className="clean-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => handleQtyChange(addon.id, -1)}
                              disabled={qty <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-val">{qty}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => handleQtyChange(addon.id, 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="clean-subtotal-val">
                        {lang === "kh" ? "តម្លៃសរុប:" : "Subtotal:"} <strong style={{ color: "#059669" }}>FREE</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SECTION 2: PAID EXTRAS & SERVICES (PRICE > 0)
          ======================================================== */}
      {paidAddons.length > 0 && (
        <div className="extra-category-block" style={{ marginTop: "20px" }}>
          <div className="extra-category-header">
            <div className="extra-category-title-wrap">
              <span className="extra-badge-pill paid">💎 Optional Extras</span>
            </div>
            {selectedPaidList.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="extra-category-count">
                  {selectedPaidList.length} {lang === "kh" ? "មុខបានរើស" : "selected"}
                </span>
                <button
                  type="button"
                  onClick={() => handleClearCategory(paidAddons)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {lang === "kh" ? "លុប" : "Clear"}
                </button>
              </div>
            )}
          </div>

          {/* Custom Selection Trigger for Paid Items */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={`custom-select-trigger-btn ${isPaidOpen ? "is-active" : ""}`}
              onClick={() => {
                setIsPaidOpen(!isPaidOpen);
                setIsFreeOpen(false);
              }}
            >
              <div className="trigger-label-group">
                <div className="trigger-icon-box paid">
                  <Sparkles size={16} />
                </div>
                <span className="trigger-text-main">
                  {selectedPaidList.length === 0
                    ? (lang === "kh"
                        ? "+ ជ្រើសរើសសេវាបន្ថែម (ស្រោមដៃ, ឡានទទួលព្រលាន, SIM, សាំង)..."
                        : "+ Select Paid Extras (Gloves, Airport Shuttle, SIM, Fuel)...")
                    : (lang === "kh"
                        ? `+ បន្ថែមសេវាផ្សេងទៀត (${selectedPaidList.length} មុខបានរើស)...`
                        : `+ Add another extra (${selectedPaidList.length} selected)...`)}
                </span>
              </div>
              <ChevronDown size={18} className={`trigger-chevron ${isPaidOpen ? "is-open" : ""}`} />
            </button>

            {/* Custom Dropdown Menu for Paid Items */}
            {isPaidOpen && (
              <div className="custom-dropdown-panel">
                <div className="custom-dropdown-topbar">
                  <span className="custom-dropdown-heading">
                    {lang === "kh" ? "បញ្ជីសេវាកម្មបន្ថែមបង់ប្រាក់" : "Paid Extras & Services List"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPaidOpen(false)}
                    className="custom-dropdown-done-btn"
                  >
                    {lang === "kh" ? "រួចរាល់ ✓" : "Done ✓"}
                  </button>
                </div>

                <div className="custom-dropdown-items-list">
                  {paidAddons.map((addon) => {
                    const isSelected = (addonQuantities[addon.id] || 0) > 0;
                    const qty = addonQuantities[addon.id] || 0;
                    const unitPrice = getAddonUnitPrice(addon);

                    return (
                      <div
                        key={addon.id}
                        className={`custom-dropdown-row ${isSelected ? "is-selected" : ""}`}
                        onClick={() => handleToggleAddon(addon.id)}
                      >
                        {/* Thumbnail */}
                        {addon.image ? (
                          <div
                            className="custom-row-thumb"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(addon.image);
                              setPreviewTitle(addon.name);
                            }}
                            title={lang === "kh" ? "ចុចដើម្បីមើលរូបធំ" : "Click to zoom"}
                          >
                            <img src={addon.image} alt={addon.name} />
                          </div>
                        ) : (
                          <div className="custom-row-thumb-placeholder">
                            <Sparkles size={20} color="#0284c7" />
                          </div>
                        )}

                        {/* Title & Description */}
                        <div className="custom-row-info">
                          <div className="custom-row-title">{addon.name}</div>
                          {addon.description && (
                            <div className="custom-row-desc">{addon.description}</div>
                          )}
                        </div>

                        {/* Price Badge & Add Button */}
                        <div className="custom-row-right">
                          <span className="custom-row-price">
                            {getAddonBadgeText(addon)}
                          </span>
                          <button
                            type="button"
                            className={`custom-add-toggle-btn ${isSelected ? "is-added" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAddon(addon.id);
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check size={12} />
                                <span>{lang === "kh" ? `បានរើស (×${qty})` : `Added (×${qty})`}</span>
                              </>
                            ) : (
                              <span>{lang === "kh" ? "+ ជ្រើសរើស" : "+ Add"}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Paid Items Cards with Quantity Stepper */}
          {selectedPaidList.length > 0 && (
            <div className="clean-items-grid" style={{ marginTop: "14px" }}>
              {selectedPaidList.map((addon) => {
                const qty = addonQuantities[addon.id] || 1;
                const unitPrice = getAddonUnitPrice(addon);
                const cost = unitPrice * qty;

                return (
                  <div key={addon.id} className="clean-item-card">
                    <div className="clean-item-top">
                      {addon.image ? (
                        <div
                          className="clean-item-thumb"
                          onClick={() => {
                            setPreviewImage(addon.image);
                            setPreviewTitle(addon.name);
                          }}
                          title="Preview Photo"
                        >
                          <img src={addon.image} alt={addon.name} />
                          <div className="thumb-zoom-overlay">
                            <Eye size={14} color="#ffffff" />
                          </div>
                        </div>
                      ) : (
                        <div className="clean-item-thumb-placeholder">
                          <Sparkles size={20} color="#0284c7" />
                        </div>
                      )}

                      <div className="clean-item-details">
                        <div className="clean-item-row-top">
                          <div>
                            <div className="clean-item-title">
                              {addon.name}
                              <span className="clean-badge-paid">
                                {getAddonBadgeText(addon)}
                              </span>
                            </div>
                            <div className="clean-item-meta">
                              {addon.description || "Optional accessory"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateAddonQty(addon.id, 0)}
                            className="clean-remove-btn"
                            title="Remove"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="clean-item-controls">
                      <div className="clean-steppers-wrap">
                        <div className="clean-stepper-group">
                          <span className="stepper-label">{t?.quantity || "Quantity"}:</span>
                          <div className="clean-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => handleQtyChange(addon.id, -1)}
                              disabled={qty <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-val">{qty}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => handleQtyChange(addon.id, 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="clean-subtotal-val">
                        {lang === "kh" ? "តម្លៃសរុប:" : "Subtotal:"} <strong>${cost}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full-Screen Photo Preview Modal */}
      <ImageModal
        isOpen={Boolean(previewImage)}
        imageUrl={previewImage}
        title={previewTitle}
        onClose={() => setPreviewImage(null)}
      />
    </section>
  );
}
