import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  BedDouble,
  Bike,
  Settings as SettingsIcon,
  ListOrdered,
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  Check,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  PackageCheck,
  TicketPercent,
  Menu,
  X,
  Eye,
  EyeOff,
  Cloud,
  CloudUpload,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Coins,
  Share2,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import VoucherSlipModal from "../components/VoucherSlipModal";
import { INITIAL_BILLING_TYPES } from "../data/initialData";
import {
  loadStoredData,
  saveRooms,
  saveMotos,
  saveAddons,
  saveSettings,
  saveCoupons,
  saveBillingTypes,
  saveInquiries,
  updateInquiry,
  deleteInquiry,
  deleteMultipleInquiries,
  clearInquiries,
  convertFileToBinaryDataUrl,
  subscribeToCloudData,
  forcePushAllToCloud,
} from "../utils/storageHelper";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(() => loadStoredData(false));
  const [rooms, setRooms] = useState(data.rooms || []);
  const [motos, setMotos] = useState(data.motos || []);
  const [addons, setAddons] = useState(data.addons || []);
  const [settings, setSettings] = useState(data.settings);
  const [inquiries, setInquiries] = useState(data.inquiries || []);
  const [coupons, setCoupons] = useState(data.coupons || []);
  const [billingTypes, setBillingTypes] = useState(data.billingTypes || INITIAL_BILLING_TYPES);

  // Listen for real-time live updates from Cloud Firestore across all devices
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    const unsubscribe = subscribeToCloudData(
      (cloud) => {
        if (cloud.rooms !== undefined) setRooms(cloud.rooms);
        if (cloud.motos !== undefined) setMotos(cloud.motos);
        if (cloud.addons !== undefined) setAddons(cloud.addons);
        if (cloud.settings !== undefined) setSettings((prev) => ({ ...prev, ...cloud.settings }));
        if (cloud.inquiries !== undefined) setInquiries(cloud.inquiries);
        if (cloud.coupons !== undefined) setCoupons(cloud.coupons);
        if (cloud.billingTypes !== undefined) setBillingTypes(cloud.billingTypes);
        setIsLoading(false);
        clearTimeout(timer);
      },
      () => {
        setIsLoading(false);
        clearTimeout(timer);
      }
    );
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("siemreap_admin_authenticated") === "true";
    } catch (e) {
      return false;
    }
  });
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("rooms"); // rooms, motos, addons, billing-types, coupons, settings, inquiries
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sorting & Filtering States across inventory & coupons
  const [couponFilterStatus, setCouponFilterStatus] = useState("all");
  const [couponSort, setCouponSort] = useState("expire-asc");
  const [couponSearch, setCouponSearch] = useState("");

  const [addonFilterType, setAddonFilterType] = useState("all");
  const [addonSort, setAddonSort] = useState("name-asc");
  const [addonSearch, setAddonSearch] = useState("");

  const [roomCategoryFilter, setRoomCategoryFilter] = useState("all");
  const [roomSort, setRoomSort] = useState("price-asc");
  const [roomSearch, setRoomSearch] = useState("");

  const [motoSort, setMotoSort] = useState("price-asc");
  const [motoSearch, setMotoSearch] = useState("");

  // Customer Inquiry Logs Filter Shot & Search States
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryFilterShot, setInquiryFilterShot] = useState("all"); // "all", "pending", "confirmed", "in-progress", "completed", "cancelled", "today", "moto", "room", "extra", "high-value"
  const [inquiryDateRange, setInquiryDateRange] = useState("all"); // "all", "today", "7days", "month"
  const [inquirySort, setInquirySort] = useState("newest"); // "newest", "oldest", "total-desc", "total-asc", "days-desc", "status"
  const [selectedInquiryIds, setSelectedInquiryIds] = useState([]);
  const [viewingInquiry, setViewingInquiry] = useState(null);
  const [voucherModalInquiry, setVoucherModalInquiry] = useState(null);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState("");
  const [customerNameEdit, setCustomerNameEdit] = useState("");
  const [customerPhoneEdit, setCustomerPhoneEdit] = useState("");

  // Billing Types state
  const [editingBillingType, setEditingBillingType] = useState(null); // null | "new" | typeId
  const [billingTypeForm, setBillingTypeForm] = useState({
    id: "",
    name: "",
    chargeMode: "per-day",
    badgeColor: "#0f172a",
    description: "",
  });

  // Room Edit/Add state
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    id: "",
    name: "",
    category: "Deluxe",
    pricePerNight: 25,
    capacity: "2 Guests",
    bed: "1 King Bed",
    image: "",
    amenities: "Air Conditioning, Free WiFi, Hot Shower, Swimming Pool Access",
    description: "",
    badge: "Popular",
  });
  const [roomUploading, setRoomUploading] = useState(false);

  // Moto Edit/Add state
  const [editingMoto, setEditingMoto] = useState(null);
  const [motoForm, setMotoForm] = useState({
    id: "",
    name: "",
    pricePerDay: 10,
    image: "",
    features: "2 Helmets Included, Phone Holder, USB Charger, Free Raincoat",
    badge: "Top Seller",
  });
  const [motoUploading, setMotoUploading] = useState(false);

  // Add-ons Edit/Add state
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonUploading, setAddonUploading] = useState(false);
  const [addonForm, setAddonForm] = useState({
    id: "",
    name: "",
    price: 5,
    type: "one-time",
    description: "",
    image: "",
  });

  const handleOpenAddonForm = (addon = null) => {
    if (addon) {
      setEditingAddon(addon.id);
      setAddonForm({
        ...addon,
        image: addon.image || "",
      });
    } else {
      setEditingAddon("new");
      setAddonForm({
        id: "addon-" + Date.now(),
        name: "",
        price: 5,
        type: "one-time",
        description: "",
        image: "",
      });
    }
  };

  const handleAddonImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAddonUploading(true);
      const binaryUrl = await convertFileToBinaryDataUrl(file);
      setAddonForm((prev) => ({ ...prev, image: binaryUrl }));
    } catch (err) {
      console.error("Failed to convert image to binary code", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setAddonUploading(false);
    }
  };

  const handleSaveAddon = (e) => {
    e.preventDefault();
    const isFree = addonForm.type === "free" || Number(addonForm.price) === 0;
    const formatted = {
      ...addonForm,
      price: isFree ? 0 : Number(addonForm.price),
      type: isFree ? "free" : addonForm.type,
      image: addonForm.image || "",
    };
    let updated;
    if (editingAddon === "new") {
      updated = [...addons, formatted];
    } else {
      updated = addons.map((a) => (a.id === editingAddon ? formatted : a));
    }
    setAddons(updated);
    saveAddons(updated);
    setEditingAddon(null);
  };

  const handleDeleteAddon = (id) => {
    if (window.confirm("Are you sure you want to delete this add-on service?")) {
      const updated = addons.filter((a) => a.id !== id);
      setAddons(updated);
      saveAddons(updated);
    }
  };

  // BILLING TYPES ACTIONS & CONTROLS
  const handleOpenBillingTypeForm = (bt = null) => {
    if (bt) {
      setEditingBillingType(bt.id);
      setBillingTypeForm({
        id: bt.id,
        name: bt.name,
        chargeMode: bt.chargeMode || "one-time",
        badgeColor: bt.badgeColor || "#0f172a",
        description: bt.description || "",
      });
    } else {
      setEditingBillingType("new");
      setBillingTypeForm({
        id: "",
        name: "",
        chargeMode: "one-time",
        badgeColor: "#2563eb",
        description: "",
      });
    }
  };

  const handleSaveBillingType = (e) => {
    e.preventDefault();
    const slug = (billingTypeForm.id || billingTypeForm.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const typeId = editingBillingType === "new" ? (slug || "billing-" + Date.now()) : billingTypeForm.id;

    if (editingBillingType === "new" && billingTypes.some((b) => b.id === typeId)) {
      alert(`A billing type with ID "${typeId}" already exists. Please choose a different name.`);
      return;
    }

    const formatted = {
      id: typeId,
      name: billingTypeForm.name.trim(),
      chargeMode: billingTypeForm.chargeMode,
      badgeColor: billingTypeForm.badgeColor || "#475569",
      description: billingTypeForm.description.trim(),
      isDefault: editingBillingType === "new" ? false : Boolean(billingTypes.find((b) => b.id === typeId)?.isDefault),
    };

    let updated;
    if (editingBillingType === "new") {
      updated = [...billingTypes, formatted];
    } else {
      updated = billingTypes.map((b) => (b.id === editingBillingType ? formatted : b));
    }
    setBillingTypes(updated);
    saveBillingTypes(updated);
    setEditingBillingType(null);
  };

  const handleDeleteBillingType = (id) => {
    const affectedAddons = addons.filter((a) => a.type === id);
    let confirmMsg = `Are you sure you want to delete this billing type?`;
    if (affectedAddons.length > 0) {
      confirmMsg += `\n\nNotice: ${affectedAddons.length} add-on service(s) currently use this billing type and will be automatically reassigned to "One-Time Fee".`;
    }
    if (window.confirm(confirmMsg)) {
      const updated = billingTypes.filter((b) => b.id !== id);
      setBillingTypes(updated);
      saveBillingTypes(updated);

      if (affectedAddons.length > 0) {
        const updatedAddons = addons.map((a) => (a.type === id ? { ...a, type: "one-time" } : a));
        setAddons(updatedAddons);
        saveAddons(updatedAddons);
      }
    }
  };

  const handleResetBillingTypes = () => {
    if (window.confirm("Reset all billing types back to system defaults?")) {
      setBillingTypes(INITIAL_BILLING_TYPES);
      saveBillingTypes(INITIAL_BILLING_TYPES);
    }
  };

  // CUSTOMER INQUIRY LOGS ACTIONS & CONTROLS
  const handleUpdateInquiryStatus = (quoteId, newStatus) => {
    const updated = updateInquiry(quoteId, { status: newStatus });
    setInquiries(updated);
    if (viewingInquiry && viewingInquiry.quoteId === quoteId) {
      setViewingInquiry((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleOpenInquiryDetails = (inq) => {
    setViewingInquiry(inq);
    setEditingNotesId(inq.quoteId);
    setAdminNotesText(inq.adminNotes || "");
    setCustomerNameEdit(inq.customerName || "");
    setCustomerPhoneEdit(inq.customerPhone || "");
  };

  const handleSaveInquiryNotes = (quoteId) => {
    const updated = updateInquiry(quoteId, {
      adminNotes: adminNotesText,
      customerName: customerNameEdit,
      customerPhone: customerPhoneEdit,
    });
    setInquiries(updated);
    if (viewingInquiry && viewingInquiry.quoteId === quoteId) {
      setViewingInquiry((prev) => ({
        ...prev,
        adminNotes: adminNotesText,
        customerName: customerNameEdit,
        customerPhone: customerPhoneEdit,
      }));
    }
    alert("Inquiry notes and customer details updated!");
  };

  const handleDeleteSingleInquiry = (quoteId) => {
    if (window.confirm(`Delete inquiry quote #${quoteId}? This cannot be undone.`)) {
      const updated = deleteInquiry(quoteId);
      setInquiries(updated);
      setSelectedInquiryIds((prev) => prev.filter((id) => id !== quoteId));
      if (viewingInquiry && viewingInquiry.quoteId === quoteId) {
        setViewingInquiry(null);
      }
    }
  };

  const handleToggleSelectInquiry = (quoteId) => {
    setSelectedInquiryIds((prev) =>
      prev.includes(quoteId) ? prev.filter((id) => id !== quoteId) : [...prev, quoteId]
    );
  };

  const handleSelectAllInquiries = () => {
    if (selectedInquiryIds.length === displayedInquiries.length && displayedInquiries.length > 0) {
      setSelectedInquiryIds([]);
    } else {
      setSelectedInquiryIds(displayedInquiries.map((i) => i.quoteId));
    }
  };

  const handleDeleteSelectedInquiries = () => {
    if (selectedInquiryIds.length === 0) return;
    if (window.confirm(`Permanently delete ${selectedInquiryIds.length} selected inquiry logs?`)) {
      const updated = deleteMultipleInquiries(selectedInquiryIds);
      setInquiries(updated);
      setSelectedInquiryIds([]);
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedInquiryIds.length === 0) return;
    const current = loadStoredData().inquiries;
    const set = new Set(selectedInquiryIds);
    const updated = current.map((i) => (set.has(i.quoteId) ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i));
    saveInquiries(updated);
    setInquiries(updated);
    setSelectedInquiryIds([]);
  };

  const handleClearAllInquiries = () => {
    if (inquiries.length === 0) return;
    if (window.confirm("Are you sure you want to permanently clear ALL customer inquiry logs?")) {
      clearInquiries();
      setInquiries([]);
      setSelectedInquiryIds([]);
      setViewingInquiry(null);
    }
  };

  const handleExportInquiriesCSV = () => {
    if (displayedInquiries.length === 0) {
      alert("No inquiries to export!");
      return;
    }
    const headers = [
      "Quote ID",
      "Status",
      "Created At",
      "Start Date",
      "End Date",
      "Days",
      "Room",
      "Motorbike",
      "Addons",
      "Subtotal USD",
      "Coupon Code",
      "Coupon Discount USD",
      "Combo Discount USD",
      "Total Discount USD",
      "Total USD",
      "Total KHR",
      "Customer Name",
      "Customer Phone",
      "Admin Notes",
    ];
    const rows = displayedInquiries.map((i) => [
      `"${i.quoteId || ""}"`,
      `"${i.status || "pending"}"`,
      `"${i.createdAt || ""}"`,
      `"${i.startDate || ""}"`,
      `"${i.endDate || ""}"`,
      `"${i.tripDays || i.days || 1}"`,
      `"${(i.roomName || "").replace(/"/g, '""')}"`,
      `"${(i.motoName || "").replace(/"/g, '""')}"`,
      `"${(i.addons ? i.addons.map((a) => `${a.name} (x${a.qty})`).join("; ") : "").replace(/"/g, '""')}"`,
      `"${i.subtotalUSD || i.totalUSD || 0}"`,
      `"${i.couponCode || ""}"`,
      `"${i.couponDiscountUSD || 0}"`,
      `"${i.comboDiscountUSD || 0}"`,
      `"${i.discountUSD || 0}"`,
      `"${i.totalUSD || 0}"`,
      `"${i.totalKHR || 0}"`,
      `"${(i.customerName || "").replace(/"/g, '""')}"`,
      `"${(i.customerPhone || "").replace(/"/g, '""')}"`,
      `"${(i.adminNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `siemreap_angkor_inquiries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Cloud force sync state
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState(false);

  const handleForceSyncCloud = async () => {
    try {
      setCloudSyncing(true);
      await forcePushAllToCloud();
      setCloudSyncSuccess(true);
      setTimeout(() => setCloudSyncSuccess(false), 4000);
    } catch (err) {
      alert("Failed to sync to cloud: " + err.message);
    } finally {
      setCloudSyncing(false);
    }
  };

  // Coupons Edit/Add state
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    id: "",
    code: "",
    discountType: "percent",
    discountValue: 10,
    expireDate: "2026-12-31",
    usageLimit: 10,
    usedCount: 0,
    description: "",
  });

  const handleOpenCouponForm = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon.id);
      setCouponForm({
        ...coupon,
        usageLimit: coupon.usageLimit ?? 10,
        usedCount: coupon.usedCount ?? 0,
      });
    } else {
      setEditingCoupon("new");
      setCouponForm({
        id: "coupon-" + Date.now(),
        code: "",
        discountType: "percent",
        discountValue: 10,
        expireDate: "2026-12-31",
        usageLimit: 10,
        usedCount: 0,
        description: "",
      });
    }
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert("Please enter a coupon code");
      return;
    }
    const formatted = {
      ...couponForm,
      code: couponForm.code.trim().toUpperCase(),
      discountValue: Number(couponForm.discountValue),
      usageLimit: Number(couponForm.usageLimit) || 10,
      usedCount: Number(couponForm.usedCount) || 0,
    };

    let updated;
    if (editingCoupon === "new") {
      updated = [...coupons, formatted];
    } else {
      updated = coupons.map((c) => (c.id === editingCoupon ? formatted : c));
    }

    setCoupons(updated);
    saveCoupons(updated);
    setEditingCoupon(null);
    setSaveSuccessMsg("Coupon saved successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      const updated = coupons.filter((c) => c.id !== id);
      setCoupons(updated);
      saveCoupons(updated);
    }
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === (settings.adminPin || "1234")) {
      setIsAuthenticated(true);
      setPinError("");
      setSettingsForm({ ...settings });
      try {
        localStorage.setItem("siemreap_admin_authenticated", "true");
      } catch (e) {}
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    try {
      localStorage.removeItem("siemreap_admin_authenticated");
    } catch (e) {}
  };

  // ROOM ACTIONS
  const handleOpenRoomForm = (room = null) => {
    if (room) {
      setEditingRoom(room.id);
      setRoomForm({
        ...room,
        amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : room.amenities || "",
      });
    } else {
      setEditingRoom("new");
      setRoomForm({
        id: "room-" + Date.now(),
        name: "",
        category: "Deluxe",
        pricePerNight: 25,
        capacity: "2 Guests",
        bed: "1 King Bed",
        image: "",
        amenities: "Air Conditioning, High-speed WiFi, Hot Shower, Swimming Pool Access",
        description: "",
        badge: "New",
      });
    }
  };

  const handleRoomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setRoomUploading(true);
      const binaryUrl = await convertFileToBinaryDataUrl(file);
      setRoomForm((prev) => ({ ...prev, image: binaryUrl }));
    } catch (err) {
      console.error("Failed to convert image to binary code", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setRoomUploading(false);
    }
  };

  const handleSaveRoom = (e) => {
    e.preventDefault();
    const amenitiesArr = typeof roomForm.amenities === "string"
      ? roomForm.amenities.split(",").map((s) => s.trim()).filter(Boolean)
      : roomForm.amenities;

    const formatted = {
      ...roomForm,
      pricePerNight: Number(roomForm.pricePerNight),
      amenities: amenitiesArr,
    };

    let updatedRooms;
    if (editingRoom === "new") {
      updatedRooms = [...rooms, formatted];
    } else {
      updatedRooms = rooms.map((r) => (r.id === editingRoom ? formatted : r));
    }

    setRooms(updatedRooms);
    saveRooms(updatedRooms);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      const updated = rooms.filter((r) => r.id !== id);
      setRooms(updated);
      saveRooms(updated);
    }
  };

  // MOTO ACTIONS
  const handleOpenMotoForm = (moto = null) => {
    if (moto) {
      setEditingMoto(moto.id);
      setMotoForm({
        ...moto,
        features: Array.isArray(moto.features) ? moto.features.join(", ") : moto.features || "",
      });
    } else {
      setEditingMoto("new");
      setMotoForm({
        id: "moto-" + Date.now(),
        name: "",
        pricePerDay: 10,
        image: "",
        features: "2 Helmets Included, Phone Mount for Google Maps, USB Charger, Free Raincoat",
        badge: "Popular",
      });
    }
  };

  const handleMotoImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMotoUploading(true);
      const binaryUrl = await convertFileToBinaryDataUrl(file);
      setMotoForm((prev) => ({ ...prev, image: binaryUrl }));
    } catch (err) {
      console.error("Failed to convert image to binary code", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setMotoUploading(false);
    }
  };

  const handleSaveMoto = (e) => {
    e.preventDefault();
    const featuresArr = typeof motoForm.features === "string"
      ? motoForm.features.split(",").map((s) => s.trim()).filter(Boolean)
      : motoForm.features;

    const formatted = {
      ...motoForm,
      pricePerDay: Number(motoForm.pricePerDay),
      features: featuresArr,
    };

    let updatedMotos;
    if (editingMoto === "new") {
      updatedMotos = [...motos, formatted];
    } else {
      updatedMotos = motos.map((m) => (m.id === editingMoto ? formatted : m));
    }

    setMotos(updatedMotos);
    saveMotos(updatedMotos);
    setEditingMoto(null);
  };

  const handleDeleteMoto = (id) => {
    if (window.confirm("Are you sure you want to delete this motorbike?")) {
      const updated = motos.filter((m) => m.id !== id);
      setMotos(updated);
      saveMotos(updated);
    }
  };

  // SETTINGS SAVE
  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    const formatted = {
      ...settingsForm,
      comboDiscountPercent: Number(settingsForm.comboDiscountPercent),
      exchangeRateKHR: Number(settingsForm.exchangeRateKHR),
    };
    setSettings(formatted);
    saveSettings(formatted);
    setSaveSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  // CLEAR ALL DATA
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to wipe all rooms, motos, and inquiries data?")) {
      clearAllData();
      setRooms([]);
      setMotos([]);
      setInquiries([]);
      setSaveSuccessMsg("All data cleared successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }
  };

  // Filtered & Sorted Coupons (Status filter & Expiration sort)
  const displayedCoupons = coupons
    .filter((coupon) => {
      const today = new Date().toISOString().split("T")[0];
      const isExpired = coupon.expireDate && today > coupon.expireDate;
      const usageLimit = Number(coupon.usageLimit) || 10;
      const usedCount = Number(coupon.usedCount) || 0;
      const isLimitReached = usedCount >= usageLimit;
      const isActive = !isExpired && !isLimitReached;

      if (couponFilterStatus === "active" && !isActive) return false;
      if (couponFilterStatus === "expired" && !isExpired) return false;
      if (couponFilterStatus === "limit" && !isLimitReached) return false;

      if (couponSearch.trim()) {
        const q = couponSearch.toLowerCase();
        const matchCode = coupon.code?.toLowerCase().includes(q);
        const matchDesc = coupon.description?.toLowerCase().includes(q);
        if (!matchCode && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (couponSort === "expire-asc") {
        return (a.expireDate || "9999") > (b.expireDate || "9999") ? 1 : -1;
      }
      if (couponSort === "expire-desc") {
        return (a.expireDate || "0000") < (b.expireDate || "0000") ? 1 : -1;
      }
      if (couponSort === "usage-desc") {
        return (Number(b.usedCount) || 0) - (Number(a.usedCount) || 0);
      }
      if (couponSort === "usage-asc") {
        return (Number(a.usedCount) || 0) - (Number(b.usedCount) || 0);
      }
      if (couponSort === "discount-desc") {
        return (Number(b.discountValue) || 0) - (Number(a.discountValue) || 0);
      }
      if (couponSort === "code-asc") {
        return (a.code || "").localeCompare(b.code || "");
      }
      return 0;
    });

  // Filtered & Sorted Add-ons
  const displayedAddons = addons
    .filter((addon) => {
      const isFree = addon.type === "free" || Number(addon.price) === 0;
      if (addonFilterType === "free" && !isFree) return false;
      if (addonFilterType === "paid" && isFree) return false;
      if (addonSearch.trim()) {
        const q = addonSearch.toLowerCase();
        const matchName = addon.name?.toLowerCase().includes(q);
        const matchDesc = addon.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (addonSort === "price-asc") return Number(a.price) - Number(b.price);
      if (addonSort === "price-desc") return Number(b.price) - Number(a.price);
      return (a.name || "").localeCompare(b.name || "");
    });

  // Filtered & Sorted Rooms
  const displayedRooms = rooms
    .filter((room) => {
      if (roomCategoryFilter !== "all" && room.category !== roomCategoryFilter) return false;
      if (roomSearch.trim()) {
        const q = roomSearch.toLowerCase();
        const matchName = room.name?.toLowerCase().includes(q);
        const matchDesc = room.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (roomSort === "price-asc") return Number(a.pricePerNight) - Number(b.pricePerNight);
      if (roomSort === "price-desc") return Number(b.pricePerNight) - Number(a.pricePerNight);
      return (a.name || "").localeCompare(b.name || "");
    });

  // Filtered & Sorted Motos
  const displayedMotos = motos
    .filter((moto) => {
      if (motoSearch.trim()) {
        const q = motoSearch.toLowerCase();
        const matchName = moto.name?.toLowerCase().includes(q);
        const matchFeatures = moto.features?.toLowerCase().includes(q);
        if (!matchName && !matchFeatures) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (motoSort === "price-asc") return Number(a.pricePerDay) - Number(b.pricePerDay);
      if (motoSort === "price-desc") return Number(b.pricePerDay) - Number(a.pricePerDay);
      return (a.name || "").localeCompare(b.name || "");
    });

  // Inquiry Counter calculations for interactive Filter Shot Badges
  const inquiryCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      all: inquiries.length,
      pending: inquiries.filter((i) => (i.status || "pending") === "pending").length,
      confirmed: inquiries.filter((i) => i.status === "confirmed").length,
      inProgress: inquiries.filter((i) => i.status === "in-progress").length,
      completed: inquiries.filter((i) => i.status === "completed").length,
      cancelled: inquiries.filter((i) => i.status === "cancelled").length,
      today: inquiries.filter((i) => (i.createdAt ? i.createdAt.split("T")[0] : i.startDate) === todayStr).length,
      moto: inquiries.filter((i) => i.motoName || (i.selectedMotoItems && i.selectedMotoItems.length > 0)).length,
      room: inquiries.filter((i) => i.roomName || (i.selectedRoomItems && i.selectedRoomItems.length > 0)).length,
      extra: inquiries.filter((i) => (i.addons && i.addons.length > 0) || (i.selectedAddonItems && i.selectedAddonItems.length > 0)).length,
      highValue: inquiries.filter((i) => Number(i.totalUSD || 0) >= 50).length,
      coupon: inquiries.filter((i) => Boolean(i.couponCode) || Number(i.discountUSD || 0) > 0 || Number(i.couponDiscountUSD || 0) > 0).length,
    };
  }, [inquiries]);

  // Filtered & Sorted Inquiries with Feature Filter Shot
  const displayedInquiries = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return inquiries
      .filter((inq) => {
        const status = inq.status || "pending";
        if (inquiryFilterShot === "pending" && status !== "pending") return false;
        if (inquiryFilterShot === "confirmed" && status !== "confirmed") return false;
        if (inquiryFilterShot === "in-progress" && status !== "in-progress") return false;
        if (inquiryFilterShot === "completed" && status !== "completed") return false;
        if (inquiryFilterShot === "cancelled" && status !== "cancelled") return false;
        if (inquiryFilterShot === "moto" && !inq.motoName && (!inq.selectedMotoItems || inq.selectedMotoItems.length === 0)) return false;
        if (inquiryFilterShot === "room" && !inq.roomName && (!inq.selectedRoomItems || inq.selectedRoomItems.length === 0)) return false;
        if (inquiryFilterShot === "extra" && (!inq.addons || inq.addons.length === 0) && (!inq.selectedAddonItems || inq.selectedAddonItems.length === 0)) return false;
        if (inquiryFilterShot === "high-value" && Number(inq.totalUSD || 0) < 50) return false;
        if (inquiryFilterShot === "coupon" && !inq.couponCode && Number(inq.discountUSD || 0) <= 0 && Number(inq.couponDiscountUSD || 0) <= 0) return false;
        if (inquiryFilterShot === "today") {
          const inqDate = inq.createdAt ? inq.createdAt.split("T")[0] : inq.startDate;
          if (inqDate !== todayStr) return false;
        }

        // Date range
        if (inquiryDateRange === "today") {
          const inqDate = inq.createdAt ? inq.createdAt.split("T")[0] : inq.startDate;
          if (inqDate !== todayStr) return false;
        } else if (inquiryDateRange === "7days") {
          const created = new Date(inq.createdAt || inq.startDate || 0);
          if (created < sevenDaysAgo) return false;
        } else if (inquiryDateRange === "month") {
          const created = new Date(inq.createdAt || inq.startDate || 0);
          if (created < firstDayOfMonth) return false;
        }

        // Search query
        if (inquirySearch.trim()) {
          const q = inquirySearch.toLowerCase().trim();
          const matchQuote = (inq.quoteId || "").toLowerCase().includes(q);
          const matchRoom = (inq.roomName || "").toLowerCase().includes(q);
          const matchMoto = (inq.motoName || "").toLowerCase().includes(q);
          const matchNotes = (inq.adminNotes || "").toLowerCase().includes(q);
          const matchCustomer = (inq.customerName || inq.customerPhone || "").toLowerCase().includes(q);
          const matchCoupon = (inq.couponCode || "").toLowerCase().includes(q);
          const matchAddon = inq.addons && inq.addons.some((a) => (a.name || "").toLowerCase().includes(q));
          if (!matchQuote && !matchRoom && !matchMoto && !matchNotes && !matchCustomer && !matchCoupon && !matchAddon) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (inquirySort === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (inquirySort === "total-desc") return Number(b.totalUSD || 0) - Number(a.totalUSD || 0);
        if (inquirySort === "total-asc") return Number(a.totalUSD || 0) - Number(b.totalUSD || 0);
        if (inquirySort === "days-desc") return Number(b.tripDays || b.days || 0) - Number(a.tripDays || a.days || 0);
        if (inquirySort === "status") return (a.status || "pending").localeCompare(b.status || "pending");
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [inquiries, inquiryFilterShot, inquiryDateRange, inquirySearch, inquirySort]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {!isAuthenticated ? (
        /* PIN LOCK SCREEN */
        <div>
          <header className="site-header">
            <div className="nav-container">
              <div className="brand-wrapper">
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
                  <div className="brand-title">Siemreap Angkor • Admin</div>
                  <div className="brand-subtitle" style={{ color: "#34d399" }}>Management Portal</div>
                </div>
              </div>

              <div className="nav-actions">
                <Link
                  to="/dashboard"
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  <ExternalLink size={15} />
                  <span>Customer Dashboard</span>
                </Link>
              </div>
            </div>
          </header>

          <div style={{ maxWidth: "380px", margin: "60px auto", padding: "36px", textAlign: "center", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f1f5f9",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <ShieldCheck size={30} />
            </div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "8px", color: "#0f172a" }}>Admin Access</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px" }}>
              Please enter your PIN to manage rooms, motorbikes, pricing, and settings.
            </p>

            <form onSubmit={handlePinSubmit}>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <input
                  type={showPin ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  style={{ textAlign: "center", letterSpacing: showPin ? "2px" : "6px", fontSize: "1.3rem", paddingRight: "42px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                  title={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {pinError && (
                <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "14px", fontWeight: 600 }}>
                  {pinError}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }}>
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN DASHBOARD WITH LEFT SIDEBAR MENU */
        <div className="admin-dashboard-layout">
          {/* Mobile Backdrop */}
          {sidebarOpen && (
            <div
              className="admin-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Left Sidebar Menu */}
          <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
            <div className="admin-sidebar-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={logoImg}
                  alt="Logo"
                  style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "contain", background: "#ffffff", padding: "2px" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/logo.png";
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#ffffff", letterSpacing: "-0.01em" }}>
                    Siemreap Angkor
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Admin Portal
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="admin-hamburger-btn"
                onClick={() => setSidebarOpen(false)}
                style={{ color: "#ffffff", background: "transparent", border: "none", padding: "4px" }}
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="admin-sidebar-nav">
              <div className="admin-sidebar-section-title">Store Inventory</div>
              <button
                className={`admin-sidebar-btn ${activeTab === "rooms" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("rooms"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BedDouble size={18} />
                  <span>Rooms</span>
                </div>
                <span className="admin-badge-count">{rooms.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "motos" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("motos"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Bike size={18} />
                  <span>Motorbikes</span>
                </div>
                <span className="admin-badge-count">{motos.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "addons" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("addons"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <PackageCheck size={18} />
                  <span>Add-on Services</span>
                </div>
                <span className="admin-badge-count">{addons.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "billing-types" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("billing-types"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Receipt size={18} />
                  <span>Billing Types</span>
                </div>
                <span className="admin-badge-count">{billingTypes.length}</span>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "coupons" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("coupons"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <TicketPercent size={18} />
                  <span>Coupons & Promo</span>
                </div>
                <span className="admin-badge-count">{coupons.length}</span>
              </button>

              <div className="admin-sidebar-section-title" style={{ marginTop: "14px" }}>System</div>
              <button
                className={`admin-sidebar-btn ${activeTab === "settings" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <SettingsIcon size={18} />
                  <span>Telegram & Settings</span>
                </div>
              </button>

              <button
                className={`admin-sidebar-btn ${activeTab === "inquiries" ? "is-active" : ""}`}
                onClick={() => { setActiveTab("inquiries"); setSidebarOpen(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ListOrdered size={18} />
                  <span>Recent Inquiries</span>
                </div>
                <span className="admin-badge-count">{inquiries.length}</span>
              </button>
            </nav>

            <div className="admin-sidebar-footer">
              <Link
                to="/dashboard"
                className="btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                  background: "rgba(255, 255, 255, 0.06)",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                }}
              >
                <ExternalLink size={14} />
                <span>View Customer Site</span>
              </Link>

              <button
                className="btn-secondary"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "9px",
                  fontSize: "0.82rem",
                  color: "#f87171",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.2)",
                }}
              >
                <Lock size={14} />
                <span>Lock / Exit</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <div className="admin-main-wrapper">
            {/* Topbar */}
            <header className="admin-topbar">
              <div className="admin-topbar-left">
                <button
                  type="button"
                  className="admin-hamburger-btn"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open Menu"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="admin-topbar-title">
                    {activeTab === "rooms" && "Rooms Management"}
                    {activeTab === "motos" && "Motorbike Inventory"}
                    {activeTab === "addons" && "Add-on Services"}
                    {activeTab === "billing-types" && "Dynamic Billing Types & Calculation Modes"}
                    {activeTab === "coupons" && "Coupons & Discounts"}
                    {activeTab === "settings" && "Telegram & Pricing Settings"}
                    {activeTab === "inquiries" && "Customer Inquiry Logs & Filters"}
                  </h1>
                </div>
              </div>

              <div className="admin-topbar-right">
                <button
                  type="button"
                  onClick={handleForceSyncCloud}
                  disabled={cloudSyncing}
                  className="btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    color: cloudSyncSuccess ? "#059669" : "#0284c7",
                    background: cloudSyncSuccess ? "rgba(16, 185, 129, 0.08)" : "rgba(2, 132, 199, 0.08)",
                    borderColor: cloudSyncSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(2, 132, 199, 0.3)",
                  }}
                  title="Push all rooms, motos, addons & settings to cloud to sync across all phones & PCs"
                >
                  <RefreshCw size={14} style={{ animation: cloudSyncing ? "spin 1s linear infinite" : "none" }} />
                  <span className="brand-text-block">
                    {cloudSyncing ? "Syncing..." : cloudSyncSuccess ? "Cloud Synced!" : "Sync All Devices"}
                  </span>
                </button>
                <Link
                  to="/dashboard"
                  className="btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    fontSize: "0.82rem",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} />
                  <span className="brand-text-block">Preview Site</span>
                </Link>
                <button
                  className="btn-secondary"
                  onClick={handleLogout}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    color: "#ef4444",
                  }}
                  title="Lock Admin"
                >
                  <Lock size={14} />
                  <span className="brand-text-block">Lock</span>
                </button>
              </div>
            </header>

            {/* Content Body */}
            <main className="admin-content-body">
              {/* Quick Metrics Row */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{rooms.length}</div>
                    <div className="admin-stat-lbl">Active Rooms</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#ecfdf5", color: "#059669" }}>
                    <Bike size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{motos.length}</div>
                    <div className="admin-stat-lbl">Motorbikes</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <TicketPercent size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{coupons.length}</div>
                    <div className="admin-stat-lbl">Promo Coupons</div>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon-wrap" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                    <ListOrdered size={22} />
                  </div>
                  <div>
                    <div className="admin-stat-val">{inquiries.length}</div>
                    <div className="admin-stat-lbl">Total Inquiries</div>
                  </div>
                </div>
              </div>

              {/* Main Active Tab Content Card */}
              <div className="admin-card-container">
                {isLoading ? (
                  <div style={{ padding: "8px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                      <div className="skeleton-title-line skeleton-shimmer" style={{ width: "220px", height: "20px" }} />
                      <div className="skeleton-action-btn skeleton-shimmer" style={{ width: "120px", height: "36px" }} />
                    </div>
                    <div className="skeleton-admin-table">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-table-row">
                          <div className="skeleton-cell skeleton-shimmer" style={{ width: "45px", height: "45px", borderRadius: "8px" }} />
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div className="skeleton-title-line skeleton-shimmer" style={{ width: "40%", height: "16px" }} />
                            <div className="skeleton-desc-line skeleton-shimmer" style={{ width: "65%", height: "12px" }} />
                          </div>
                          <div className="skeleton-cell skeleton-shimmer" style={{ width: "70px", height: "20px" }} />
                          <div className="skeleton-cell skeleton-shimmer" style={{ width: "90px", height: "30px", borderRadius: "6px" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                {/* TAB 1: ROOMS */}
                {activeTab === "rooms" && (
              <div>
                {!editingRoom ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                        {rooms.length} {rooms.length === 1 ? "room" : "rooms"} available on customer dashboard
                      </span>
                      <button className="btn-primary" onClick={() => handleOpenRoomForm(null)}>
                        <Plus size={16} />
                        <span>Add New Room</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search room name or desc..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={roomSearch}
                          onChange={(e) => setRoomSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={roomCategoryFilter}
                          onChange={(e) => setRoomCategoryFilter(e.target.value)}
                        >
                          <option value="all">All Categories ({rooms.length})</option>
                          {Array.from(new Set(rooms.map((r) => r.category).filter(Boolean))).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={roomSort}
                          onChange={(e) => setRoomSort(e.target.value)}
                        >
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="name-asc">Name: A to Z</option>
                        </select>
                      </div>
                    </div>

                    {displayedRooms.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        {rooms.length === 0
                          ? "No rooms created yet. Click \"Add New Room\" above to list your rooms!"
                          : "No rooms match your filter criteria. Try clearing search or selecting \"All Categories\"."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Room Name</th>
                              <th>Price / Night</th>
                              <th>Capacity</th>
                              <th>Badge</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedRooms.map((room) => (
                              <tr key={room.id}>
                                <td>
                                  {room.image ? (
                                    <img
                                      src={room.image}
                                      alt=""
                                      style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                  ) : (
                                    <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <BedDouble size={20} color="#64748b" />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{room.name}</div>
                                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{room.category} • {room.bed}</div>
                                </td>
                                <td style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", fontSize: "1.05rem" }}>${room.pricePerNight}</td>
                                <td style={{ color: "#334155" }}>{room.capacity}</td>
                                <td>
                                  {room.badge && <span className="badge-gold">{room.badge}</span>}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenRoomForm(room)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteRoom(room.id)}
                                    style={{ padding: "6px 10px", color: "#f43f5e" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ROOM FORM */
                  <form onSubmit={handleSaveRoom} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>{editingRoom === "new" ? "Add New Room" : "Edit Room"}</h3>
                      <button type="button" className="btn-secondary" onClick={() => setEditingRoom(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Room Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={roomForm.name}
                          onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                          placeholder="e.g. Deluxe Balcony Room"
                        />
                      </div>
                      <div>
                        <label className="date-label">Price Per Night (USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={roomForm.pricePerNight}
                          onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Category</label>
                        <input
                          type="text"
                          className="input-field"
                          value={roomForm.category}
                          onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="date-label">Capacity</label>
                        <input
                          type="text"
                          className="input-field"
                          value={roomForm.capacity}
                          onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="date-label">Bed Type</label>
                        <input
                          type="text"
                          className="input-field"
                          value={roomForm.bed}
                          onChange={(e) => setRoomForm({ ...roomForm, bed: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Photo (Upload File converts to Binary Code, or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Paste image URL or click Upload Photo to store binary code"
                          value={roomForm.image}
                          onChange={(e) => setRoomForm({ ...roomForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{roomUploading ? "Converting..." : "Upload Photo (Binary)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleRoomImageUpload}
                            disabled={roomUploading}
                          />
                        </label>
                      </div>
                      {roomForm.image && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                          <img
                            src={roomForm.image}
                            alt="Preview"
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-medium)" }}
                          />
                          <div>
                            <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check size={13} /> {roomForm.image.startsWith("data:") ? "Binary Code Stored" : "URL Configured"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRoomForm({ ...roomForm, image: "" })}
                              style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="date-label">Amenities (Comma separated or click to add)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={roomForm.amenities}
                        onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                        placeholder="Air Conditioning, High-speed WiFi, Hot Shower, Swimming Pool Access"
                      />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {[
                          "Air Conditioning",
                          "High-speed WiFi",
                          "Hot Shower",
                          "Swimming Pool Access",
                          "Balcony",
                          "Breakfast Included",
                          "Refrigerator",
                          "Daily Housekeeping",
                        ].map((amenity) => {
                          const currentArr = typeof roomForm.amenities === "string"
                            ? roomForm.amenities.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];
                          const isIncluded = currentArr.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                const updated = isIncluded
                                  ? currentArr.filter((a) => a !== amenity)
                                  : [...currentArr, amenity];
                                setRoomForm({ ...roomForm, amenities: updated.join(", ") });
                              }}
                              className="tag-mini"
                              style={{
                                cursor: "pointer",
                                padding: "4px 9px",
                                background: isIncluded ? "#0f172a" : "#f1f5f9",
                                color: isIncluded ? "#ffffff" : "#475569",
                                border: isIncluded ? "1px solid #0f172a" : "1px solid #e2e8f0",
                              }}
                            >
                              {isIncluded ? "✓ " : "+ "}
                              {amenity}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Description</label>
                      <textarea
                        className="input-field"
                        rows="2"
                        value={roomForm.description}
                        onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="date-label">Badge</label>
                      <input
                        type="text"
                        className="input-field"
                        value={roomForm.badge}
                        onChange={(e) => setRoomForm({ ...roomForm, badge: e.target.value })}
                        placeholder="e.g. Popular, Best Value"
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Room
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: MOTOS */}
            {activeTab === "motos" && (
              <div>
                {!editingMoto ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                        {motos.length} {motos.length === 1 ? "motorbike" : "motorbikes"} available on customer dashboard
                      </span>
                      <button className="btn-primary" onClick={() => handleOpenMotoForm(null)}>
                        <Plus size={16} />
                        <span>Add New Motorbike</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search moto name or features..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={motoSearch}
                          onChange={(e) => setMotoSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={motoSort}
                          onChange={(e) => setMotoSort(e.target.value)}
                        >
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="name-asc">Name: A to Z</option>
                        </select>
                      </div>
                    </div>

                    {displayedMotos.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        {motos.length === 0
                          ? "No motorbikes created yet. Click \"Add New Motorbike\" above to list your scooters!"
                          : "No motorbikes match your search criteria. Try clearing search."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Moto Name</th>
                              <th>Price / Day</th>
                              <th>Badge</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedMotos.map((moto) => (
                              <tr key={moto.id}>
                                <td>
                                  {moto.image ? (
                                    <img
                                      src={moto.image}
                                      alt=""
                                      style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                  ) : (
                                    <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Bike size={20} color="#64748b" />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{moto.name}</div>
                                </td>
                                <td style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", fontSize: "1.05rem" }}>${moto.pricePerDay}</td>
                                <td>
                                  {moto.badge && <span className="badge-emerald">{moto.badge}</span>}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenMotoForm(moto)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteMoto(moto.id)}
                                    style={{ padding: "6px 10px", color: "#f43f5e" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MOTO FORM */
                  <form onSubmit={handleSaveMoto} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>{editingMoto === "new" ? "Add New Motorbike" : "Edit Motorbike"}</h3>
                      <button type="button" className="btn-secondary" onClick={() => setEditingMoto(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      <div>
                        <label className="date-label">Model Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={motoForm.name}
                          onChange={(e) => setMotoForm({ ...motoForm, name: e.target.value })}
                          placeholder="e.g. Honda Scoopy 110cc"
                        />
                      </div>
                      <div>
                        <label className="date-label">Price Per Day (USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={motoForm.pricePerDay}
                          onChange={(e) => setMotoForm({ ...motoForm, pricePerDay: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="date-label">Badge (Optional)</label>
                        <input
                          type="text"
                          className="input-field"
                          value={motoForm.badge}
                          onChange={(e) => setMotoForm({ ...motoForm, badge: e.target.value })}
                          placeholder="e.g. Top Seller, Popular"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Photo (Upload File converts to Binary Code, or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Paste image URL or click Upload Photo to store binary code"
                          value={motoForm.image}
                          onChange={(e) => setMotoForm({ ...motoForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{motoUploading ? "Converting..." : "Upload Photo (Binary)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleMotoImageUpload}
                            disabled={motoUploading}
                          />
                        </label>
                      </div>
                      {motoForm.image && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                          <img
                            src={motoForm.image}
                            alt="Preview"
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-medium)" }}
                          />
                          <div>
                            <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check size={13} /> {motoForm.image.startsWith("data:") ? "Binary Code Stored" : "URL Configured"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMotoForm({ ...motoForm, image: "" })}
                              style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="date-label">Features & Inclusions (Comma separated or click to add)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={motoForm.features}
                        onChange={(e) => setMotoForm({ ...motoForm, features: e.target.value })}
                        placeholder="2 Helmets Included, Phone Mount for Google Maps, USB Charger, Free Raincoat"
                      />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {[
                          "2 Helmets Included",
                          "Phone Mount for Google Maps",
                          "USB Charger",
                          "Free Raincoat",
                          "Full Petrol Tank",
                          "Cable Lock",
                          "Automatic Transmission",
                          "Luggage Storage",
                        ].map((feature) => {
                          const currentArr = typeof motoForm.features === "string"
                            ? motoForm.features.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];
                          const isIncluded = currentArr.includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => {
                                const updated = isIncluded
                                  ? currentArr.filter((f) => f !== feature)
                                  : [...currentArr, feature];
                                setMotoForm({ ...motoForm, features: updated.join(", ") });
                              }}
                              className="tag-mini"
                              style={{
                                cursor: "pointer",
                                padding: "4px 9px",
                                background: isIncluded ? "#0f172a" : "#f1f5f9",
                                color: isIncluded ? "#ffffff" : "#475569",
                                border: isIncluded ? "1px solid #0f172a" : "1px solid #e2e8f0",
                              }}
                            >
                              {isIncluded ? "✓ " : "+ "}
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Motorbike
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB: ADD-ONS (STEP 3 EXTRA SERVICES) */}
            {activeTab === "addons" && (
              <div>
                {!editingAddon ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                          Add-on Services (Step 3)
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Manage free inclusions and paid accessories. Filter by Free/Paid or sort by price.
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setActiveTab("billing-types")}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Receipt size={16} />
                          <span>Manage Billing Types ({billingTypes.length})</span>
                        </button>
                        <button className="btn-primary" onClick={() => handleOpenAddonForm(null)}>
                          <Plus size={16} />
                          <span>Add New Add-on</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search service name or desc..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={addonSearch}
                          onChange={(e) => setAddonSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={addonFilterType}
                          onChange={(e) => setAddonFilterType(e.target.value)}
                        >
                          <option value="all">All Types ({addons.length})</option>
                          <option value="free">Free Inclusions Only</option>
                          <option value="paid">Paid Extras Only</option>
                          <optgroup label="Dynamic Billing Types">
                            {billingTypes.map((bt) => (
                              <option key={bt.id} value={bt.id}>
                                {bt.name} ({addons.filter((a) => a.type === bt.id).length})
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={addonSort}
                          onChange={(e) => setAddonSort(e.target.value)}
                        >
                          <option value="name-asc">Name: A to Z</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>

                    {displayedAddons.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed var(--border-medium)", borderRadius: "8px" }}>
                        {addons.length === 0
                          ? "No add-on services configured. Click \"Add New Add-on\" above to create extra services like Airport Shuttle, Extra Helmets, SIM Card, etc.!"
                          : "No services match your filter criteria. Try selecting \"All Types\" or clearing search."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th style={{ width: "60px" }}>Photo</th>
                              <th>Service Name</th>
                              <th>Price (USD)</th>
                              <th>Billing Type</th>
                              <th>Description</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedAddons.map((addon) => (
                              <tr key={addon.id}>
                                <td style={{ width: "60px" }}>
                                  {addon.image ? (
                                    <img
                                      src={addon.image}
                                      alt=""
                                      style={{ width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                  ) : (
                                    <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <PackageCheck size={20} color="#64748b" />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{addon.name}</div>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700, color: addon.price === 0 ? "#059669" : "#0f172a" }}>
                                    {addon.price === 0 ? "FREE" : `$${addon.price}`}
                                  </span>
                                </td>
                                <td>
                                  {(() => {
                                    const bt = billingTypes.find((b) => b.id === addon.type);
                                    const bg = bt?.badgeColor || (addon.type === "per-day" ? "#0f172a" : (addon.type === "free" ? "#059669" : "#475569"));
                                    const label = bt?.name || (addon.type === "per-day" ? "Per Day" : (addon.type === "free" ? "Free" : "One-Time"));
                                    return (
                                      <span className="badge-sale" style={{ background: bg, color: "#ffffff", padding: "4px 8px", borderRadius: "6px" }}>
                                        {label}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "340px" }}>
                                    {addon.description}
                                  </div>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenAddonForm(addon)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteAddon(addon.id)}
                                    style={{ padding: "6px 10px", color: "#ef4444" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ADD-ON FORM */
                  <form onSubmit={handleSaveAddon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>{editingAddon === "new" ? "Add New Add-on / Extra Service" : "Edit Add-on Service"}</h3>
                      <button type="button" className="btn-secondary" onClick={() => setEditingAddon(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Service Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={addonForm.name}
                          onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                          placeholder="e.g. Extra Certified Helmet"
                        />
                      </div>
                      <div>
                        <label className="date-label">Price in USD (0 for Free)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.5"
                          className="input-field"
                          value={addonForm.price}
                          onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <label className="date-label" style={{ margin: 0 }}>Billing Type</label>
                          <button
                            type="button"
                            onClick={() => setActiveTab("billing-types")}
                            style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                          >
                            + Manage Types
                          </button>
                        </div>
                        <select
                          className="input-field"
                          value={addonForm.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const bt = billingTypes.find((b) => b.id === newType);
                            const isFree = (bt && bt.chargeMode === "free") || newType === "free";
                            setAddonForm({
                              ...addonForm,
                              type: newType,
                              price: isFree ? 0 : (Number(addonForm.price) === 0 ? 5 : addonForm.price),
                            });
                          }}
                        >
                          {billingTypes.map((bt) => (
                            <option key={bt.id} value={bt.id}>
                              {bt.name} ({bt.chargeMode === "per-day" ? "Daily Multiplier" : bt.chargeMode === "free" ? "Complimentary Free" : "Flat One-Time"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="date-label">Short Description</label>
                        <input
                          type="text"
                          className="input-field"
                          value={addonForm.description}
                          onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                          placeholder="e.g. Sanitized helmet for passenger"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Photo (Upload File converts to Binary Code, or paste URL)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Paste image URL or click Upload Photo to store binary code"
                          value={addonForm.image || ""}
                          onChange={(e) => setAddonForm({ ...addonForm, image: e.target.value })}
                        />
                        <label className="btn-secondary" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                          <UploadCloud size={16} />
                          <span>{addonUploading ? "Converting..." : "Upload Photo (Binary)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAddonImageUpload}
                            disabled={addonUploading}
                          />
                        </label>
                      </div>
                      {addonForm.image && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                          <img
                            src={addonForm.image}
                            alt="Preview"
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-medium)" }}
                          />
                          <div>
                            <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check size={13} /> {addonForm.image.startsWith("data:") ? "Binary Code Stored" : "URL Configured"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddonForm({ ...addonForm, image: "" })}
                              style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                      Save Add-on Service
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB: BILLING TYPES (DYNAMIC CREATE & FULL CONTROL) */}
            {activeTab === "billing-types" && (
              <div>
                {!editingBillingType ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                          Dynamic Billing Types & Calculation Modes
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Admin full control to dynamically create, customize, and manage billing categories for add-ons and extra services.
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleResetBillingTypes}
                          style={{ fontSize: "0.82rem" }}
                        >
                          <RotateCcw size={14} />
                          <span>Reset Defaults</span>
                        </button>
                        <button className="btn-primary" onClick={() => handleOpenBillingTypeForm(null)}>
                          <Plus size={16} />
                          <span>Create Billing Type</span>
                        </button>
                      </div>
                    </div>

                    {/* Summary Metric Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                      <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Billing Types</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{billingTypes.length}</div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 700, textTransform: "uppercase" }}>Daily Multipliers</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0284c7", marginTop: "2px" }}>
                          {billingTypes.filter((b) => b.chargeMode === "per-day").length}
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>Flat One-Time</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#475569", marginTop: "2px" }}>
                          {billingTypes.filter((b) => b.chargeMode === "one-time").length}
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700, textTransform: "uppercase" }}>Free Inclusions</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                          {billingTypes.filter((b) => b.chargeMode === "free").length}
                        </div>
                      </div>
                    </div>

                    {/* Billing Types Table */}
                    <div style={{ overflowX: "auto" }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Billing Type Name</th>
                            <th>Slug / ID</th>
                            <th>Calculation Formula</th>
                            <th>Badge Theme</th>
                            <th>Active Services</th>
                            <th>Description</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingTypes.map((bt) => {
                            const usageCount = addons.filter((a) => a.type === bt.id).length;
                            return (
                              <tr key={bt.id}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        width: "12px",
                                        height: "12px",
                                        borderRadius: "50%",
                                        backgroundColor: bt.badgeColor || "#0f172a",
                                      }}
                                    />
                                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{bt.name}</span>
                                  </div>
                                </td>
                                <td>
                                  <code style={{ fontSize: "0.78rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>
                                    {bt.id}
                                  </code>
                                </td>
                                <td>
                                  <span
                                    className="status-pill"
                                    style={{
                                      background: bt.chargeMode === "per-day" ? "#eff6ff" : (bt.chargeMode === "free" ? "#ecfdf5" : "#f8fafc"),
                                      color: bt.chargeMode === "per-day" ? "#1d4ed8" : (bt.chargeMode === "free" ? "#047857" : "#334155"),
                                      border: `1px solid ${bt.chargeMode === "per-day" ? "#bfdbfe" : (bt.chargeMode === "free" ? "#a7f3d0" : "#cbd5e1")}`,
                                    }}
                                  >
                                    {bt.chargeMode === "per-day" ? "Price × Rental Days" : (bt.chargeMode === "free" ? "Free ($0.00)" : "Flat Fixed Rate")}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="badge-sale"
                                    style={{
                                      backgroundColor: bt.badgeColor || "#0f172a",
                                      color: "#ffffff",
                                      padding: "4px 8px",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    {bt.name}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700, color: usageCount > 0 ? "#0f172a" : "#94a3b8" }}>
                                    {usageCount} {usageCount === 1 ? "service" : "services"}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "260px" }}>
                                    {bt.description || "—"}
                                  </div>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleOpenBillingTypeForm(bt)}
                                    style={{ padding: "6px 10px", marginRight: "6px" }}
                                    title="Edit Billing Type"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handleDeleteBillingType(bt.id)}
                                    style={{ padding: "6px 10px", color: "#ef4444" }}
                                    title="Delete Billing Type"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* BILLING TYPE FORM (DYNAMIC CREATE / EDIT) */
                  <form onSubmit={handleSaveBillingType} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3>{editingBillingType === "new" ? "Create Dynamic Billing Type" : "Edit Billing Type"}</h3>
                        <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          Define how prices are calculated for add-ons and extra services.
                        </p>
                      </div>
                      <button type="button" className="btn-secondary" onClick={() => setEditingBillingType(null)}>
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Billing Type Name</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={billingTypeForm.name}
                          onChange={(e) => setBillingTypeForm({ ...billingTypeForm, name: e.target.value })}
                          placeholder="e.g. Airport Transfer, Per Week, Safety Deposit"
                        />
                      </div>

                      <div>
                        <label className="date-label">Unique Slug / ID (Identifier)</label>
                        <input
                          type="text"
                          className="input-field"
                          value={billingTypeForm.id}
                          disabled={editingBillingType !== "new"}
                          onChange={(e) => setBillingTypeForm({ ...billingTypeForm, id: e.target.value })}
                          placeholder={editingBillingType === "new" ? "Auto-generated from name (e.g. airport-transfer)" : billingTypeForm.id}
                        />
                        {editingBillingType !== "new" && (
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                            Slug is locked while editing to preserve existing item references.
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Calculation Mode</label>
                        <select
                          className="input-field"
                          value={billingTypeForm.chargeMode}
                          onChange={(e) => setBillingTypeForm({ ...billingTypeForm, chargeMode: e.target.value })}
                        >
                          <option value="per-day">Daily Multiplier (Price × Total Rental Days)</option>
                          <option value="one-time">Flat One-Time (Fixed price regardless of duration)</option>
                          <option value="free">Complimentary Free ($0 Total Cost)</option>
                        </select>
                      </div>

                      <div>
                        <label className="date-label">Badge Theme Color</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="color"
                            value={billingTypeForm.badgeColor || "#0f172a"}
                            onChange={(e) => setBillingTypeForm({ ...billingTypeForm, badgeColor: e.target.value })}
                            style={{ width: "42px", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", padding: "2px" }}
                          />
                          <input
                            type="text"
                            className="input-field"
                            value={billingTypeForm.badgeColor}
                            onChange={(e) => setBillingTypeForm({ ...billingTypeForm, badgeColor: e.target.value })}
                            placeholder="#0f172a"
                            style={{ flex: 1 }}
                          />
                          <div style={{ display: "flex", gap: "4px" }}>
                            {["#0f172a", "#2563eb", "#059669", "#d97706", "#7c3aed", "#e11d48"].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setBillingTypeForm({ ...billingTypeForm, badgeColor: c })}
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  backgroundColor: c,
                                  border: billingTypeForm.badgeColor === c ? "2px solid #0f172a" : "1px solid #cbd5e1",
                                  cursor: "pointer",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Description / Internal Notes</label>
                      <input
                        type="text"
                        className="input-field"
                        value={billingTypeForm.description}
                        onChange={(e) => setBillingTypeForm({ ...billingTypeForm, description: e.target.value })}
                        placeholder="e.g. Billed once upon hotel/airport greeting"
                      />
                    </div>

                    {/* Live Badge Preview */}
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                        Live Badge Preview on Customer Portal & Invoices:
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span
                          className="badge-sale"
                          style={{
                            backgroundColor: billingTypeForm.badgeColor || "#0f172a",
                            color: "#ffffff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                          }}
                        >
                          {billingTypeForm.name || "Preview Badge"}
                        </span>
                        <span style={{ fontSize: "0.82rem", color: "#334155" }}>
                          Calculation formula: <strong>
                            {billingTypeForm.chargeMode === "per-day" ? "$Price × Trip Days" : (billingTypeForm.chargeMode === "free" ? "FREE ($0.00)" : "$Price (Flat Rate)")}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button type="button" className="btn-secondary" onClick={() => setEditingBillingType(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingBillingType === "new" ? "Create Billing Type" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB: COUPONS & DISCOUNTS */}
            {activeTab === "coupons" && (
              <div>
                {!editingCoupon ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                          Coupons & Discount Codes
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          Filter by active/expired status and sort by expiration or usage for fast management.
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => handleOpenCouponForm(null)}>
                        <Plus size={16} />
                        <span>Add New Coupon</span>
                      </button>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ position: "relative", minWidth: "180px", flex: "1" }}>
                        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                          type="text"
                          placeholder="Search code or desc..."
                          className="input-field"
                          style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                          value={couponSearch}
                          onChange={(e) => setCouponSearch(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={couponFilterStatus}
                          onChange={(e) => setCouponFilterStatus(e.target.value)}
                        >
                          <option value="all">All Statuses ({coupons.length})</option>
                          <option value="active">Active Only</option>
                          <option value="expired">Expired Only</option>
                          <option value="limit">Limit Reached</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowUpDown size={14} color="#64748b" />
                        <select
                          className="input-field"
                          style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                          value={couponSort}
                          onChange={(e) => setCouponSort(e.target.value)}
                        >
                          <option value="expire-asc">Exp: Soonest First</option>
                          <option value="expire-desc">Exp: Furthest First</option>
                          <option value="usage-desc">Usage: Most Used</option>
                          <option value="usage-asc">Usage: Least Used</option>
                          <option value="discount-desc">Discount: High to Low</option>
                          <option value="code-asc">Code: A to Z</option>
                        </select>
                      </div>
                    </div>

                    {displayedCoupons.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
                        {coupons.length === 0
                          ? "No coupons created yet. Click \"Add New Coupon\" above to create your first promo code!"
                          : "No coupons match your filter criteria. Try selecting \"All Statuses\" or clearing search."}
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Coupon Code</th>
                              <th>Discount</th>
                              <th>Usage Limit (Used / Max)</th>
                              <th>Expiration Date</th>
                              <th>Status</th>
                              <th>Description</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedCoupons.map((coupon) => {
                              const today = new Date().toISOString().split("T")[0];
                              const isExpired = coupon.expireDate && today > coupon.expireDate;
                              const usageLimit = Number(coupon.usageLimit) || 10;
                              const usedCount = Number(coupon.usedCount) || 0;
                              const isLimitReached = usedCount >= usageLimit;

                              return (
                                <tr key={coupon.id}>
                                  <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <TicketPercent size={15} color="#2563eb" />
                                      <span style={{ fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-brand)", letterSpacing: "0.05em" }}>
                                        {coupon.code}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 800, color: "#0f172a" }}>
                                      {coupon.discountType === "percent" ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} USD OFF`}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 800, color: isLimitReached ? "#b91c1c" : "#0f172a" }}>
                                      {usedCount} / {usageLimit} people
                                    </span>
                                    <div style={{ fontSize: "0.72rem", color: isLimitReached ? "#b91c1c" : "#64748b" }}>
                                      {isLimitReached ? "0 slots left (closed)" : `${usageLimit - usedCount} slots available`}
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                                      {coupon.expireDate || "No Expiry"}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        fontSize: "0.72rem",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        background: isLimitReached ? "#fee2e2" : isExpired ? "#fee2e2" : "#dcfce7",
                                        color: isLimitReached ? "#b91c1c" : isExpired ? "#b91c1c" : "#15803d",
                                      }}
                                    >
                                      {isLimitReached ? "Limit Reached" : isExpired ? "Expired" : "Active"}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "260px" }}>
                                      {coupon.description || "—"}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <button
                                      className="btn-secondary"
                                      onClick={() => handleOpenCouponForm(coupon)}
                                      style={{ padding: "6px 10px", marginRight: "6px" }}
                                      title="Edit coupon"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      onClick={() => handleDeleteCoupon(coupon.id)}
                                      style={{ padding: "6px 10px", color: "#ef4444" }}
                                      title="Delete coupon"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* COUPON FORM */
                  <form onSubmit={handleSaveCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                        {editingCoupon === "new" ? "Create New Promo Coupon" : `Edit Coupon: ${couponForm.code}`}
                      </h3>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingCoupon(null)}
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", fontSize: "0.78rem" }}
                      >
                        <span>(close)</span>
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="date-label">Coupon Code (Uppercase)</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. ANGKOR10 or WELCOME5"
                          style={{ textTransform: "uppercase", fontWeight: 700 }}
                        />
                      </div>

                      <div>
                        <label className="date-label">Discount Type</label>
                        <select
                          className="input-field"
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                        >
                          <option value="percent">Percentage (% off total)</option>
                          <option value="fixed">Fixed Amount ($ off total)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      <div>
                        <label className="date-label">
                          Discount Value {couponForm.discountType === "percent" ? "(%)" : "($ USD)"}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={couponForm.discountType === "percent" ? 100 : 500}
                          className="input-field"
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="date-label">Usage Limit (Max People / Times)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={couponForm.usageLimit}
                          onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                          placeholder="e.g. 10 (can only be used by 10 people)"
                        />
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                          Limit how many customers can claim this promo (e.g. 10 people)
                        </div>
                      </div>

                      <div>
                        <label className="date-label">Expiration Date</label>
                        <input
                          type="date"
                          required
                          className="input-field"
                          value={couponForm.expireDate}
                          onChange={(e) => setCouponForm({ ...couponForm, expireDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="date-label">Description / Promotion Note</label>
                      <input
                        type="text"
                        className="input-field"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        placeholder="e.g. 10% discount for holiday booking in Siem Reap (max 10 people)"
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingCoupon(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save Coupon
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB: SETTINGS & TELEGRAM */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label className="date-label">Telegram Username (without @)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.telegramUsername}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramUsername: e.target.value })}
                      placeholder="e.g. siemreapangkor"
                    />
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                      Customer quotes are sent directly to https://t.me/{settingsForm.telegramUsername || "..."}
                    </div>
                  </div>

                  <div>
                    <label className="date-label">Contact Phone / WhatsApp</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
                  <div>
                    <label className="date-label">Combo Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="input-field"
                      value={settingsForm.comboDiscountPercent}
                      onChange={(e) => setSettingsForm({ ...settingsForm, comboDiscountPercent: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="date-label">USD to KHR Rate (៛)</label>
                    <input
                      type="number"
                      min="1000"
                      className="input-field"
                      value={settingsForm.exchangeRateKHR}
                      onChange={(e) => setSettingsForm({ ...settingsForm, exchangeRateKHR: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="date-label">Admin PIN</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.adminPin}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="date-label">Top Announcement Bar Text (Promo Banner)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={settingsForm.topPromoText !== undefined ? settingsForm.topPromoText : ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, topPromoText: e.target.value })}
                    placeholder="e.g. FREE 2 HELMETS & PHONE HOLDER WITH EVERY MOTORBIKE • INSTANT PREVIEW"
                  />
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    Displays at the very top of the customer booking page.
                  </div>
                </div>

                <div>
                  <label className="date-label">Address in Siem Reap</label>
                  <input
                    type="text"
                    className="input-field"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  />
                </div>

                {saveSuccessMsg && (
                  <div style={{ color: "#34d399", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check size={16} />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                  Update Settings
                </button>
              </form>
            )}

            {/* TAB 4: INQUIRIES LOG & FEATURE FILTER SHOT */}
            {activeTab === "inquiries" && (
              <div>
                {/* Header & Main Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>Customer Inquiry Logs & Bookings</span>
                      <span className="chip-count" style={{ background: "#0f172a", color: "#ffffff", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem" }}>
                        {inquiries.length} Total
                      </span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                      Full control to track statuses, review itemized quotations, edit admin notes, filter & sort, and generate invoice slips.
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleExportInquiriesCSV}
                      disabled={displayedInquiries.length === 0}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
                      title="Download spreadsheet of all filtered inquiries"
                    >
                      <FileSpreadsheet size={15} color="#059669" />
                      <span>Export CSV ({displayedInquiries.length})</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleClearAllInquiries}
                      disabled={inquiries.length === 0}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#ef4444" }}
                      title="Clear all inquiry records"
                    >
                      <Trash2 size={15} />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* FEATURE FILTER SHOT BAR (Interactive Quick Filter Chips with Live Counters) */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                    Filter Shots:
                  </div>
                  <div className="filter-shot-bar">
                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "all" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("all")}
                    >
                      <span>All Inquiries</span>
                      <span className="chip-count">{inquiryCounts.all}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "pending" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("pending")}
                    >
                      <span style={{ color: inquiryFilterShot === "pending" ? "#ffffff" : "#d97706" }}>●</span>
                      <span>Pending</span>
                      <span className="chip-count">{inquiryCounts.pending}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "confirmed" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("confirmed")}
                    >
                      <span style={{ color: inquiryFilterShot === "confirmed" ? "#ffffff" : "#059669" }}>●</span>
                      <span>Confirmed</span>
                      <span className="chip-count">{inquiryCounts.confirmed}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "in-progress" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("in-progress")}
                    >
                      <span style={{ color: inquiryFilterShot === "in-progress" ? "#ffffff" : "#0284c7" }}>●</span>
                      <span>In Progress</span>
                      <span className="chip-count">{inquiryCounts.inProgress}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "completed" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("completed")}
                    >
                      <span style={{ color: inquiryFilterShot === "completed" ? "#ffffff" : "#7c3aed" }}>●</span>
                      <span>Completed</span>
                      <span className="chip-count">{inquiryCounts.completed}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "cancelled" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("cancelled")}
                    >
                      <span style={{ color: inquiryFilterShot === "cancelled" ? "#ffffff" : "#dc2626" }}>●</span>
                      <span>Cancelled</span>
                      <span className="chip-count">{inquiryCounts.cancelled}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "today" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("today")}
                    >
                      <span>📅 Today</span>
                      <span className="chip-count">{inquiryCounts.today}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "moto" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("moto")}
                    >
                      <span>🛵 With Motorbike</span>
                      <span className="chip-count">{inquiryCounts.moto}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "room" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("room")}
                    >
                      <span>🛏️ With Room</span>
                      <span className="chip-count">{inquiryCounts.room}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "extra" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("extra")}
                    >
                      <span>🎁 With Extra Add-ons</span>
                      <span className="chip-count">{inquiryCounts.extra}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "coupon" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("coupon")}
                    >
                      <span>🎟️ With Coupon</span>
                      <span className="chip-count">{inquiryCounts.coupon}</span>
                    </button>

                    <button
                      type="button"
                      className={`filter-shot-chip ${inquiryFilterShot === "high-value" ? "is-active" : ""}`}
                      onClick={() => setInquiryFilterShot("high-value")}
                    >
                      <span>💎 High Value ($50+)</span>
                      <span className="chip-count">{inquiryCounts.highValue}</span>
                    </button>
                  </div>
                </div>

                {/* Search & Secondary Filter / Sort Bar */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ position: "relative", minWidth: "200px", flex: "1" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="Search quote #, customer, room, moto, coupon, notes..."
                      className="input-field"
                      style={{ paddingLeft: "30px", paddingRight: "10px", height: "36px", fontSize: "0.82rem" }}
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={14} color="#64748b" />
                    <select
                      className="input-field"
                      style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                      value={inquiryDateRange}
                      onChange={(e) => setInquiryDateRange(e.target.value)}
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today Only</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ArrowUpDown size={14} color="#64748b" />
                    <select
                      className="input-field"
                      style={{ height: "36px", padding: "4px 8px", fontSize: "0.82rem", width: "auto" }}
                      value={inquirySort}
                      onChange={(e) => setInquirySort(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="total-desc">Highest Price ($$$ → $)</option>
                      <option value="total-asc">Lowest Price ($ → $$$)</option>
                      <option value="days-desc">Longest Rental Duration</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>

                  {(inquiryFilterShot !== "all" || inquirySearch.trim() || inquiryDateRange !== "all") && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setInquiryFilterShot("all");
                        setInquirySearch("");
                        setInquiryDateRange("all");
                      }}
                      style={{ height: "36px", padding: "0 10px", fontSize: "0.8rem", color: "#64748b" }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Bulk Actions Bar */}
                {displayedInquiries.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 14px",
                      marginBottom: "12px",
                      background: selectedInquiryIds.length > 0 ? "#eff6ff" : "#ffffff",
                      border: selectedInquiryIds.length > 0 ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                      <input
                        type="checkbox"
                        checked={selectedInquiryIds.length > 0 && selectedInquiryIds.length === displayedInquiries.length}
                        onChange={handleSelectAllInquiries}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                      <span>Select All ({displayedInquiries.length})</span>
                    </label>

                    {selectedInquiryIds.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1d4ed8" }}>
                          {selectedInquiryIds.length} selected:
                        </span>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleBulkStatusChange("confirmed")}
                          style={{ padding: "4px 8px", fontSize: "0.75rem", background: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0" }}
                        >
                          Mark Confirmed
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleBulkStatusChange("completed")}
                          style={{ padding: "4px 8px", fontSize: "0.75rem", background: "#f3e8ff", color: "#7e22ce", borderColor: "#e9d5ff" }}
                        >
                          Mark Completed
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleDeleteSelectedInquiries}
                          style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#b91c1c", background: "#fee2e2", borderColor: "#fecaca" }}
                        >
                          Delete Selected
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Inquiry Cards List */}
                {displayedInquiries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: "12px", background: "#ffffff" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "4px" }}>
                      No Customer Inquiries Found
                    </div>
                    <div style={{ fontSize: "0.85rem" }}>
                      {inquiries.length === 0
                        ? "Incoming quotes generated on /dashboard will automatically appear here with real-time sync."
                        : "No logs match your filter criteria. Try clicking \"All Inquiries\" or clearing search terms."}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {displayedInquiries.map((inq, index) => {
                      const status = inq.status || "pending";
                      const isSelected = selectedInquiryIds.includes(inq.quoteId);
                      const hasAddons = inq.addons && inq.addons.length > 0;
                      const hasNotes = Boolean(inq.adminNotes?.trim());
                      const hasCoupon = Boolean(inq.couponCode);
                      const hasDiscount = Number(inq.discountUSD || inq.couponDiscountUSD || 0) > 0;

                      return (
                        <div
                          key={inq.quoteId || index}
                          className={`inquiry-card ${isSelected ? "is-selected" : ""}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "14px",
                          }}
                        >
                          {/* Left: Checkbox + Quote Overview */}
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: "1", minWidth: "280px" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectInquiry(inq.quoteId)}
                              style={{ marginTop: "4px", width: "16px", height: "16px", cursor: "pointer" }}
                            />

                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem", fontFamily: "var(--font-brand)" }}>
                                  Quote #{inq.quoteId}
                                </span>

                                {/* Direct Status Changer */}
                                <select
                                  value={status}
                                  onChange={(e) => handleUpdateInquiryStatus(inq.quoteId, e.target.value)}
                                  className={`status-pill status-${status}`}
                                  style={{
                                    border: "none",
                                    cursor: "pointer",
                                    outline: "none",
                                    fontWeight: 800,
                                    fontSize: "0.75rem",
                                  }}
                                  title="Change inquiry booking status"
                                >
                                  <option value="pending">⏳ Pending</option>
                                  <option value="confirmed">✅ Confirmed</option>
                                  <option value="in-progress">🛵 In Progress</option>
                                  <option value="completed">🏁 Completed</option>
                                  <option value="cancelled">❌ Cancelled</option>
                                </select>

                                <span style={{ fontSize: "0.74rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", color: "#475569", fontWeight: 700 }}>
                                  {inq.tripDays || inq.days || 1} {(inq.tripDays || inq.days || 1) === 1 ? "day" : "days"}
                                </span>

                                {hasCoupon && (
                                  <span style={{ fontSize: "0.74rem", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "12px", fontWeight: 700, border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    🎟️ Coupon: {inq.couponCode} {inq.couponDiscountUSD ? `(-$${inq.couponDiscountUSD})` : (inq.discountUSD ? `(-$${inq.discountUSD})` : "")}
                                  </span>
                                )}
                              </div>

                              {/* Components breakdown */}
                              <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {inq.motoName && (
                                  <span style={{ background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    🛵 {inq.motoName}
                                  </span>
                                )}
                                {inq.roomName && (
                                  <span style={{ background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    🛏️ {inq.roomName}
                                  </span>
                                )}
                                {hasAddons && (
                                  <span style={{ background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    🎁 {inq.addons.length} extra{inq.addons.length > 1 ? "s" : ""} ({inq.addons.map((a) => a.name).join(", ")})
                                  </span>
                                )}
                              </div>

                              {/* Dates & Timestamp */}
                              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "6px" }}>
                                Dates: <strong>{inq.startDate} ({inq.startTime || "08:00"})</strong> → <strong>{inq.endDate} ({inq.endTime || "18:00"})</strong>
                                {inq.createdAt && ` • Submitted: ${new Date(inq.createdAt).toLocaleString()}`}
                              </div>

                              {/* Customer info if recorded */}
                              {(inq.customerName || inq.customerPhone) && (
                                <div style={{ fontSize: "0.8rem", color: "#0f172a", marginTop: "4px", fontWeight: 600 }}>
                                  👤 Customer: {inq.customerName || "Guest"} {inq.customerPhone ? `(${inq.customerPhone})` : ""}
                                </div>
                              )}

                              {/* Admin Notes Preview */}
                              {hasNotes && (
                                <div style={{ fontSize: "0.78rem", color: "#0284c7", background: "#f0f9ff", padding: "4px 8px", borderRadius: "6px", marginTop: "6px", border: "1px solid #e0f2fe" }}>
                                  📝 <strong>Admin Note:</strong> {inq.adminNotes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Price & Actions */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                            <div style={{ textAlign: "right" }}>
                              {inq.subtotalUSD && Number(inq.subtotalUSD) > Number(inq.totalUSD) && (
                                <div style={{ fontSize: "0.76rem", color: "#94a3b8", textDecoration: "line-through" }}>
                                  ${inq.subtotalUSD}
                                </div>
                              )}
                              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "#059669" }}>
                                ${inq.totalUSD}
                              </div>
                              {hasDiscount && (
                                <div style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 700 }}>
                                  Discount -${inq.discountUSD || inq.couponDiscountUSD}
                                </div>
                              )}
                              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                {inq.totalKHR?.toLocaleString()} KHR
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setVoucherModalInquiry(inq)}
                                style={{ padding: "5px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                title="View & Download Invoice Slip"
                              >
                                <FileText size={13} color="#2563eb" />
                                <span>View Slip</span>
                              </button>

                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleOpenInquiryDetails(inq)}
                                style={{ padding: "5px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                title="View itemized breakdown & edit notes"
                              >
                                <Edit2 size={13} />
                                <span>Details & Notes</span>
                              </button>

                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleDeleteSingleInquiry(inq.quoteId)}
                                style={{ padding: "5px 8px", color: "#ef4444" }}
                                title="Delete this quote"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MODAL 1: INQUIRY DETAILS & ADMIN NOTES MODAL */}
                {viewingInquiry && (
                  <div className="modal-overlay-backdrop" onClick={() => setViewingInquiry(null)}>
                    <div className="admin-detail-modal" onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #e2e8f0" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                            Inquiry Quote #{viewingInquiry.quoteId}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            Created: {viewingInquiry.createdAt ? new Date(viewingInquiry.createdAt).toLocaleString() : "—"}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setViewingInquiry(null)}
                          style={{ padding: "6px", borderRadius: "50%" }}
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Status bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>Booking Status:</span>
                          <select
                            value={viewingInquiry.status || "pending"}
                            onChange={(e) => handleUpdateInquiryStatus(viewingInquiry.quoteId, e.target.value)}
                            className={`status-pill status-${viewingInquiry.status || "pending"}`}
                            style={{ border: "none", cursor: "pointer", fontWeight: 800, fontSize: "0.8rem" }}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="in-progress">🛵 In Progress</option>
                            <option value="completed">🏁 Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </div>

                        {/* Customer Information (Editable) */}
                        <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                            Customer Contact Information:
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div>
                              <label className="date-label">Customer Name</label>
                              <input
                                type="text"
                                className="input-field"
                                value={customerNameEdit}
                                onChange={(e) => setCustomerNameEdit(e.target.value)}
                                placeholder="e.g. John Doe"
                              />
                            </div>
                            <div>
                              <label className="date-label">Phone / Telegram Handle</label>
                              <input
                                type="text"
                                className="input-field"
                                value={customerPhoneEdit}
                                onChange={(e) => setCustomerPhoneEdit(e.target.value)}
                                placeholder="e.g. +855 12 345 678 / @johndoe"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Schedule & Timing */}
                        <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.82rem" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Schedule & Duration</div>
                          <div style={{ color: "#475569" }}>
                            From: <strong>{viewingInquiry.startDate} ({viewingInquiry.startTime || "08:00"})</strong>
                          </div>
                          <div style={{ color: "#475569" }}>
                            To: <strong>{viewingInquiry.endDate} ({viewingInquiry.endTime || "18:00"})</strong>
                          </div>
                          <div style={{ color: "#0f172a", fontWeight: 700, marginTop: "4px" }}>
                            Total Duration: {viewingInquiry.tripDays || viewingInquiry.days || 1} Days
                          </div>
                        </div>

                        {/* Package Breakdown */}
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                            Selected Items & Services Breakdown:
                          </div>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                            <table className="admin-table" style={{ margin: 0 }}>
                              <thead>
                                <tr>
                                  <th>Item Description</th>
                                  <th style={{ textAlign: "center" }}>Qty</th>
                                  <th style={{ textAlign: "right" }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewingInquiry.motoName && (
                                  <tr>
                                    <td>
                                      <strong>🛵 Motorbike:</strong> {viewingInquiry.motoName}
                                    </td>
                                    <td style={{ textAlign: "center" }}>—</td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>Included</td>
                                  </tr>
                                )}
                                {viewingInquiry.roomName && (
                                  <tr>
                                    <td>
                                      <strong>🛏️ Room:</strong> {viewingInquiry.roomName}
                                    </td>
                                    <td style={{ textAlign: "center" }}>—</td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>Included</td>
                                  </tr>
                                )}
                                {viewingInquiry.addons && viewingInquiry.addons.map((a, i) => (
                                  <tr key={i}>
                                    <td>
                                      <strong>🎁 Extra:</strong> {a.name}
                                    </td>
                                    <td style={{ textAlign: "center" }}>x{a.qty || 1}</td>
                                    <td style={{ textAlign: "right", fontWeight: 700, color: a.cost === 0 ? "#059669" : "#0f172a" }}>
                                      {a.cost === 0 ? "FREE" : `$${a.cost || a.price}`}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Discounts & Coupon Breakdown (ព័ត៌មានបញ្ចុះតម្លៃ) */}
                        {(viewingInquiry.couponCode || Number(viewingInquiry.discountUSD || 0) > 0 || Number(viewingInquiry.couponDiscountUSD || 0) > 0) && (
                          <div style={{ background: "#fefce8", padding: "14px 16px", borderRadius: "8px", border: "1px solid #fef08a" }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#854d0e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>🎟️ Coupon & Discount Details (ព័ត៌មានបញ្ចុះតម្លៃ):</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", color: "#713f12" }}>
                                <span>Original Subtotal (តម្លៃដើមសរុប):</span>
                                <span style={{ fontWeight: 700 }}>
                                  ${viewingInquiry.subtotalUSD || (Number(viewingInquiry.totalUSD) + Number(viewingInquiry.discountUSD || 0))} USD
                                </span>
                              </div>
                              {viewingInquiry.couponCode && (
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#b45309", fontWeight: 700 }}>
                                  <span>Coupon Code ({viewingInquiry.couponCode}):</span>
                                  <span>
                                    -${viewingInquiry.couponDiscountUSD || viewingInquiry.discountUSD || 0} USD
                                    {viewingInquiry.couponDiscountValue ? ` (${viewingInquiry.couponDiscountType === "percent" ? `${viewingInquiry.couponDiscountValue}%` : `$${viewingInquiry.couponDiscountValue}`})` : ""}
                                  </span>
                                </div>
                              )}
                              {Number(viewingInquiry.comboDiscountUSD || 0) > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#b45309" }}>
                                  <span>Combo Special Discount:</span>
                                  <span style={{ fontWeight: 700 }}>-${viewingInquiry.comboDiscountUSD} USD</span>
                                </div>
                              )}
                              <div style={{ borderTop: "1px dashed #fde047", paddingTop: "6px", display: "flex", justifyContent: "space-between", color: "#854d0e", fontWeight: 800 }}>
                                <span>Total Amount Discounted (តម្លៃដែលបានបញ្ចុះ):</span>
                                <span style={{ color: "#dc2626" }}>
                                  -${viewingInquiry.discountUSD || viewingInquiry.couponDiscountUSD || 0} USD
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Financial Totals */}
                        <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Final Quote Amount:</div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669" }}>
                              ${viewingInquiry.totalUSD} USD
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Exchange (KHR):</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                              {viewingInquiry.totalKHR?.toLocaleString()} ៛
                            </div>
                          </div>
                        </div>

                        {/* Internal Admin Notes (ABA reference, payment status, pickup notes) */}
                        <div>
                          <label className="date-label">
                            Internal Admin Notes & Payment Records (Private to Admin)
                          </label>
                          <textarea
                            className="input-field"
                            rows={3}
                            value={adminNotesText}
                            onChange={(e) => setAdminNotesText(e.target.value)}
                            placeholder="e.g. ABA Transaction #489291, 50% deposit received, requested airport pickup at 9am..."
                            style={{ resize: "vertical", fontFamily: "inherit" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setVoucherModalInquiry(viewingInquiry)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <FileText size={15} color="#2563eb" />
                          <span>View Invoice Slip</span>
                        </button>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setViewingInquiry(null)}
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleSaveInquiryNotes(viewingInquiry.quoteId)}
                          >
                            Save Details & Notes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL 2: INVOICE VOUCHER SLIP PREVIEW & PNG DOWNLOAD */}
                {voucherModalInquiry && (
                  <VoucherSlipModal
                    isOpen={Boolean(voucherModalInquiry)}
                    onClose={() => setVoucherModalInquiry(null)}
                    selectedRoomItems={
                      voucherModalInquiry.selectedRoomItems ||
                      (voucherModalInquiry.roomName ? [{ room: { name: voucherModalInquiry.roomName, pricePerNight: 0 }, qty: 1, nights: voucherModalInquiry.tripDays || 1, cost: 0 }] : [])
                    }
                    selectedMotoItems={
                      voucherModalInquiry.selectedMotoItems ||
                      (voucherModalInquiry.motoName ? [{ moto: { name: voucherModalInquiry.motoName, pricePerDay: 0 }, qty: 1, days: voucherModalInquiry.tripDays || 1, cost: 0 }] : [])
                    }
                    selectedAddonItems={
                      voucherModalInquiry.selectedAddonItems ||
                      (voucherModalInquiry.addons ? voucherModalInquiry.addons.map((a) => ({ addon: { name: a.name, price: a.price || 0, type: a.type }, qty: a.qty || 1, cost: a.cost || 0 })) : [])
                    }
                    startDate={voucherModalInquiry.startDate}
                    endDate={voucherModalInquiry.endDate}
                    startTime={voucherModalInquiry.startTime || "08:00"}
                    endTime={voucherModalInquiry.endTime || "18:00"}
                    settings={settings}
                    quoteId={voucherModalInquiry.quoteId}
                    appliedCoupon={
                      voucherModalInquiry.couponCode
                        ? {
                            code: voucherModalInquiry.couponCode,
                            discountAmount: voucherModalInquiry.couponDiscountUSD || voucherModalInquiry.discountUSD || 0,
                          }
                        : null
                    }
                    couponDiscountAmount={voucherModalInquiry.couponDiscountUSD || voucherModalInquiry.discountUSD || 0}
                    comboDiscountAmount={voucherModalInquiry.comboDiscountUSD || 0}
                    totalUSD={voucherModalInquiry.totalUSD}
                    lang="en"
                  />
                )}
              </div>
            )}
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
