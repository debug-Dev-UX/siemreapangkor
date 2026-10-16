import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import DateSelector from "../components/DateSelector";
import RoomSelector from "../components/RoomSelector";
import MotoSelector from "../components/MotoSelector";
import AddonSelector from "../components/AddonSelector";
import CartPopup from "../components/CartPopup";
import VoucherSlipModal from "../components/VoucherSlipModal";
import {
  loadStoredData,
  saveInquiry,
  saveCoupons,
  subscribeToCloudData,
} from "../utils/storageHelper";
import { translations } from "../utils/translations";
import { CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [data] = useState(() => loadStoredData());
  const [rooms, setRooms] = useState(data.rooms);
  const [motos, setMotos] = useState(data.motos);
  const [settings, setSettings] = useState(data.settings);
  const [addons, setAddons] = useState(data.addons || []);
  const [coupons, setCoupons] = useState(data.coupons || []);

  // Listen for real-time live cloud data updates from Firestore across all devices
  useEffect(() => {
    const unsubscribe = subscribeToCloudData((cloud) => {
      if (cloud.rooms !== undefined) setRooms(cloud.rooms);
      if (cloud.motos !== undefined) setMotos(cloud.motos);
      if (cloud.settings !== undefined) setSettings((prev) => ({ ...prev, ...cloud.settings }));
      if (cloud.addons !== undefined) setAddons(cloud.addons);
      if (cloud.coupons !== undefined) setCoupons(cloud.coupons);
    });
    return () => unsubscribe();
  }, []);

  // Language state (default to khmer 'kh' on first visit, or read from localStorage)
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("preferred_lang") || "kh";
    } catch (e) {
      return "kh";
    }
  });
  const t = translations[lang];

  // Default dates
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  }, []);

  // Dates state
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");

  // Multi-selection states:
  // selectedRooms: { [roomId]: { qty: number, nights: number } }
  const [selectedRooms, setSelectedRooms] = useState({});
  // selectedMotos: { [motoId]: { qty: number, days: number } }
  const [selectedMotos, setSelectedMotos] = useState({});
  // addonQuantities: { [addonId]: number }
  const [addonQuantities, setAddonQuantities] = useState({});

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // UI state
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [quoteId, setQuoteId] = useState(() => "SA-" + Math.floor(1000 + Math.random() * 9000));

  // Calculated overall trip duration in days
  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDate, endDate]);

  // Read URL query parameters on mount to restore shared quote
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRooms = params.get("rooms");
      const urlMotos = params.get("motos");
      const urlLegacyRoom = params.get("room");
      const urlLegacyMoto = params.get("moto");
      const urlStart = params.get("start");
      const urlEnd = params.get("end");
      const urlStartTime = params.get("stime");
      const urlEndTime = params.get("etime");
      const urlAddonQtys = params.get("addons_qty");
      const urlLegacyAddons = params.get("addons");
      const urlQuote = params.get("qid");
      const urlCoupon = params.get("cp");

      if (urlStart) setStartDate(urlStart);
      if (urlEnd) setEndDate(urlEnd);
      if (urlStartTime) setStartTime(urlStartTime);
      if (urlEndTime) setEndTime(urlEndTime);
      if (urlQuote) setQuoteId(urlQuote);

      // Restore multi rooms
      if (urlRooms) {
        try {
          const parsed = JSON.parse(decodeURIComponent(urlRooms));
          if (parsed && typeof parsed === "object") setSelectedRooms(parsed);
        } catch (e) {
          // fallback
        }
      } else if (urlLegacyRoom && urlLegacyRoom !== "none") {
        const rq = Math.max(1, parseInt(params.get("rq"), 10) || 1);
        const rn = Math.max(1, parseInt(params.get("rn"), 10) || 3);
        setSelectedRooms({ [urlLegacyRoom]: { qty: rq, nights: rn } });
      }

      // Restore multi motos
      if (urlMotos) {
        try {
          const parsed = JSON.parse(decodeURIComponent(urlMotos));
          if (parsed && typeof parsed === "object") setSelectedMotos(parsed);
        } catch (e) {
          // fallback
        }
      } else if (urlLegacyMoto && urlLegacyMoto !== "none") {
        const mq = Math.max(1, parseInt(params.get("mq"), 10) || 1);
        const md = Math.max(1, parseInt(params.get("md"), 10) || 3);
        setSelectedMotos({ [urlLegacyMoto]: { qty: mq, days: md } });
      }

      // Restore addons
      if (urlAddonQtys) {
        try {
          const parsed = JSON.parse(decodeURIComponent(urlAddonQtys));
          if (parsed && typeof parsed === "object") setAddonQuantities(parsed);
        } catch (e) {}
      } else if (urlLegacyAddons) {
        const ids = urlLegacyAddons.split(",").filter(Boolean);
        const mapped = {};
        ids.forEach((id) => (mapped[id] = 1));
        setAddonQuantities(mapped);
      }

      if (urlCoupon) {
        const found = coupons.find((c) => c.code.toUpperCase() === urlCoupon.toUpperCase());
        if (found) {
          const today = new Date().toISOString().split("T")[0];
          const isExpired = found.expireDate && today > found.expireDate;
          const usageLimit = Number(found.usageLimit) || 10;
          const usedCount = Number(found.usedCount) || 0;
          if (!isExpired && usedCount < usageLimit) {
            setAppliedCoupon(found);
          }
        }
      }
    } catch (e) {
      console.error("Error reading URL params", e);
    }
  }, [coupons]);

  // Multi-room handlers
  const handleToggleRoom = (roomId) => {
    setSelectedRooms((prev) => {
      const next = { ...prev };
      if (next[roomId]) {
        delete next[roomId];
      } else {
        next[roomId] = { qty: 1, nights: tripDays };
      }
      return next;
    });
  };

  const handleUpdateRoomQty = (roomId, qty) => {
    setSelectedRooms((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[roomId];
        return next;
      }
      return {
        ...prev,
        [roomId]: { ...(prev[roomId] || { nights: tripDays }), qty },
      };
    });
  };

  const handleUpdateRoomNights = (roomId, nights) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || { qty: 1 }), nights: Math.max(1, nights) },
    }));
  };

  const handleClearRooms = () => {
    setSelectedRooms({});
  };

  // Multi-moto handlers
  const handleToggleMoto = (motoId) => {
    setSelectedMotos((prev) => {
      const next = { ...prev };
      if (next[motoId]) {
        delete next[motoId];
      } else {
        next[motoId] = { qty: 1, days: tripDays };
      }
      return next;
    });
  };

  const handleUpdateMotoQty = (motoId, qty) => {
    setSelectedMotos((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[motoId];
        return next;
      }
      return {
        ...prev,
        [motoId]: { ...(prev[motoId] || { days: tripDays }), qty },
      };
    });
  };

  const handleUpdateMotoDays = (motoId, days) => {
    setSelectedMotos((prev) => ({
      ...prev,
      [motoId]: { ...(prev[motoId] || { qty: 1 }), days: Math.max(1, days) },
    }));
  };

  const handleClearMotos = () => {
    setSelectedMotos({});
  };

  // Addon quantity handler (supports both paid extras and free inclusions)
  const handleUpdateAddonQty = (addonId, qty) => {
    setAddonQuantities((prev) => ({
      ...prev,
      [addonId]: Math.max(0, qty),
    }));
  };

  // Derived arrays of selected items with calculated subtotals
  const selectedRoomItems = useMemo(() => {
    return Object.entries(selectedRooms)
      .map(([roomId, conf]) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room || !conf || conf.qty <= 0) return null;
        const qty = conf.qty;
        const nights = conf.nights || tripDays;
        const cost = room.pricePerNight * nights * qty;
        return { room, qty, nights, cost };
      })
      .filter(Boolean);
  }, [rooms, selectedRooms, tripDays]);

  const selectedMotoItems = useMemo(() => {
    return Object.entries(selectedMotos)
      .map(([motoId, conf]) => {
        const moto = motos.find((m) => m.id === motoId);
        if (!moto || !conf || conf.qty <= 0) return null;
        const qty = conf.qty;
        const days = conf.days || tripDays;
        const cost = moto.pricePerDay * days * qty;
        return { moto, qty, days, cost };
      })
      .filter(Boolean);
  }, [motos, selectedMotos, tripDays]);

  const selectedAddonItems = useMemo(() => {
    return addons
      .map((addon) => {
        const qty = addonQuantities[addon.id] || 0;
        if (qty <= 0) return null;
        const unitPrice = addon.type === "per-day" ? addon.price * tripDays : addon.price;
        const cost = unitPrice * qty;
        return { addon, qty, cost };
      })
      .filter(Boolean);
  }, [addons, addonQuantities, tripDays]);

  // Overall Financial Calculations
  const roomCost = selectedRoomItems.reduce((sum, item) => sum + item.cost, 0);
  const motoCost = selectedMotoItems.reduce((sum, item) => sum + item.cost, 0);
  const addonsCost = selectedAddonItems.reduce((sum, item) => sum + item.cost, 0);

  const subtotal = roomCost + motoCost + addonsCost;

  // Combo discount when both room and moto are booked
  const isCombo = selectedRoomItems.length > 0 && selectedMotoItems.length > 0;
  const comboDiscountRate = isCombo ? (settings.comboDiscountPercent || 0) / 100 : 0;
  const comboDiscountAmount = Math.round((roomCost + motoCost) * comboDiscountRate);

  // Coupon discount calculation
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      couponDiscountAmount = Math.round(subtotal * (Number(appliedCoupon.discountValue || 0) / 100));
    } else {
      couponDiscountAmount = Math.min(subtotal, Number(appliedCoupon.discountValue || 0));
    }
  }

  const finalTotalUSD = Math.max(0, subtotal - comboDiscountAmount - couponDiscountAmount);
  const finalTotalKHR = Math.round(finalTotalUSD * (settings.exchangeRateKHR || 4000));

  // Coupon validation including user limit (e.g. 1 coupon for 10 people max)
  const handleApplyCoupon = (inputCode) => {
    if (!inputCode) return;
    const clean = inputCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      setCouponError(t?.couponInvalid || "Invalid coupon code!");
      setCouponSuccess("");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (found.expireDate && today > found.expireDate) {
      setCouponError(`${t?.couponExpired || "This coupon has expired!"} (${found.expireDate})`);
      setCouponSuccess("");
      return;
    }

    const usageLimit = Number(found.usageLimit) || 10;
    const usedCount = Number(found.usedCount) || 0;
    if (usedCount >= usageLimit) {
      setCouponError(
        t?.couponLimitReached ||
          `This coupon has reached its maximum user limit (${usageLimit} people max)!`
      );
      setCouponSuccess("");
      return;
    }

    setAppliedCoupon(found);
    setCouponError("");
    setCouponSuccess(`${t?.couponApplied || "Coupon applied!"} (${found.code})`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponSuccess("");
  };

  // Generate URL for sharing or restoring
  const generateShareUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (Object.keys(selectedRooms).length > 0) {
      url.searchParams.set("rooms", encodeURIComponent(JSON.stringify(selectedRooms)));
    }
    if (Object.keys(selectedMotos).length > 0) {
      url.searchParams.set("motos", encodeURIComponent(JSON.stringify(selectedMotos)));
    }
    const nonZeroAddons = {};
    Object.entries(addonQuantities).forEach(([k, v]) => {
      if (v > 0) nonZeroAddons[k] = v;
    });
    if (Object.keys(nonZeroAddons).length > 0) {
      url.searchParams.set("addons_qty", encodeURIComponent(JSON.stringify(nonZeroAddons)));
    }
    url.searchParams.set("start", startDate);
    url.searchParams.set("end", endDate);
    if (startTime) url.searchParams.set("stime", startTime);
    if (endTime) url.searchParams.set("etime", endTime);
    if (appliedCoupon) {
      url.searchParams.set("cp", appliedCoupon.code);
    }
    url.searchParams.set("qid", quoteId);
    return url.toString();
  };

  const handleCopyLink = async () => {
    const shareUrl = generateShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    } catch (err) {
      window.prompt("Copy this quote link:", shareUrl);
    }
  };

  // Telegram reservation handler matching user requested format
  const handleSendTelegram = () => {
    // If coupon was applied, increment usedCount and persist
    if (appliedCoupon) {
      const updatedCoupons = coupons.map((c) => {
        if (c.id === appliedCoupon.id || c.code.toUpperCase() === appliedCoupon.code.toUpperCase()) {
          const nextCount = (Number(c.usedCount) || 0) + 1;
          return { ...c, usedCount: nextCount };
        }
        return c;
      });
      setCoupons(updatedCoupons);
      saveCoupons(updatedCoupons);
    }

    // Save inquiry to admin panel
    saveInquiry({
      quoteId,
      roomName:
        selectedRoomItems.length > 0
          ? selectedRoomItems.map((i) => `${i.room.name} (×${i.qty})`).join(", ")
          : null,
      motoName:
        selectedMotoItems.length > 0
          ? selectedMotoItems.map((i) => `${i.moto.name} (×${i.qty})`).join(", ")
          : null,
      tripDays,
      startDate,
      endDate,
      startTime,
      endTime,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      totalUSD: finalTotalUSD,
      totalKHR: finalTotalKHR,
      createdAt: new Date().toISOString(),
    });

    // Build Telegram message
    const hasMotos = selectedMotoItems.length > 0;
    const hasRooms = selectedRoomItems.length > 0;
    const hasExtras = selectedAddonItems.length > 0;

    let greetingItem = "";
    if (hasMotos && hasRooms) {
      greetingItem = "ជួលម៉ូតូ និង បន្ទប់";
    } else if (hasMotos && !hasRooms) {
      greetingItem = "ជួលម៉ូតូ";
    } else if (!hasMotos && hasRooms) {
      greetingItem = "កក់បន្ទប់";
    } else if (hasExtras) {
      greetingItem = "កក់សេវាកម្មបន្ថែម";
    } else {
      greetingItem = "សួរព័ត៌មាន";
    }

    const lines = [];
    lines.push(`សួរស្ដីបងខ្ញុំចង់${greetingItem}`);
    lines.push(`- ចាប់ផ្ដើមថ្ងៃទី ${startDate} ម៉ោង ${startTime}`);
    lines.push(`-ចប់ថ្ងៃទី ${endDate} ម៉ោង ${endTime}`);
    lines.push("");

    if (hasMotos) {
      selectedMotoItems.forEach((i) => {
        lines.push(`-${i.moto.name} x${i.qty}`);
      });
    }

    if (hasRooms) {
      selectedRoomItems.forEach((i) => {
        lines.push(`-${i.room.name} x${i.qty}`);
      });
    }

    if (hasExtras) {
      lines.push("");
      lines.push("+Extra");
      selectedAddonItems.forEach((i) => {
        if (i.cost === 0) {
          lines.push(`-${i.addon.name} x${i.qty}`);
        } else {
          lines.push(`-${i.addon.name} x${i.qty} ${i.cost}$`);
        }
      });
    }

    lines.push("");
    lines.push(`Total: ${finalTotalUSD}$`);

    const message = lines.join("\n");
    const cleanUsername = (settings.telegramUsername || "Motor_Rental_Siemreap_Angkor").replace("@", "");
    const tgUrl = `https://t.me/${cleanUsername}?text=${encodeURIComponent(message)}`;
    window.open(tgUrl, "_blank");
  };

  const handleReset = () => {
    setSelectedRooms({});
    setSelectedMotos({});
    setAddonQuantities({});
    setAppliedCoupon(null);
    setCouponError("");
    setCouponSuccess("");
    setStartDate(todayStr);
    setEndDate(defaultEndStr);
    setQuoteId("SA-" + Math.floor(1000 + Math.random() * 9000));
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === "en" ? "kh" : "en";
      try {
        localStorage.setItem("preferred_lang", next);
      } catch (e) {}
      return next;
    });
  };

  return (
    <div>
      {/* Navbar with National Flag language switcher */}
      <Navbar
        settings={settings}
        onReset={handleReset}
        lang={lang}
        onToggleLang={handleToggleLang}
        t={t}
      />

      <main className="app-container" style={{ paddingBottom: "100px" }}>
        {/* Date Selector */}
        <DateSelector
          startDate={startDate}
          endDate={endDate}
          startTime={startTime}
          endTime={endTime}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          days={tripDays}
          t={t}
        />

        {/* Step 1: Book Room (Supports multi-room e.g. 1 Bed + 2 Bed) */}
        <RoomSelector
          rooms={rooms}
          selectedRooms={selectedRooms}
          onToggleRoom={handleToggleRoom}
          onUpdateRoomQty={handleUpdateRoomQty}
          onUpdateRoomNights={handleUpdateRoomNights}
          onClearRooms={handleClearRooms}
          defaultNights={tripDays}
          lang={lang}
          t={t}
        />

        {/* Step 2: Rent Motorbike (Supports multi-moto e.g. Scoopy + Click) */}
        <MotoSelector
          motos={motos}
          selectedMotos={selectedMotos}
          onToggleMoto={handleToggleMoto}
          onUpdateMotoQty={handleUpdateMotoQty}
          onUpdateMotoDays={handleUpdateMotoDays}
          onClearMotos={handleClearMotos}
          defaultDays={tripDays}
          lang={lang}
          t={t}
        />

        {/* Step 3: Extra Services (Paid Extras & Free Inclusions with custom quantities) */}
        <AddonSelector
          addons={addons}
          addonQuantities={addonQuantities}
          onUpdateAddonQty={handleUpdateAddonQty}
          days={tripDays}
          lang={lang}
          t={t}
        />
      </main>

      {/* Cart Popup Anchored Bottom-Left (Auto closed by default) */}
      <CartPopup
        selectedRoomItems={selectedRoomItems}
        selectedMotoItems={selectedMotoItems}
        selectedAddonItems={selectedAddonItems}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        settings={settings}
        onCopyLink={handleCopyLink}
        onOpenVoucher={() => setIsVoucherOpen(true)}
        onSendTelegram={handleSendTelegram}
        copied={copiedToast}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        couponError={couponError}
        couponSuccess={couponSuccess}
        lang={lang}
        t={t}
      />

      {/* Invoice Modal (with Download PNG & Send to Telegram) */}
      <VoucherSlipModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        selectedRoomItems={selectedRoomItems}
        selectedMotoItems={selectedMotoItems}
        selectedAddonItems={selectedAddonItems}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        settings={settings}
        quoteId={quoteId}
        onSendTelegram={handleSendTelegram}
        appliedCoupon={appliedCoupon}
        lang={lang}
        t={t}
      />

      {/* Copied Link Toast */}
      {copiedToast && (
        <div className="toast-notice">
          <CheckCircle2 size={18} />
          <span>{t?.linkCopied || "Quotation Link copied to clipboard!"}</span>
        </div>
      )}
    </div>
  );
}
