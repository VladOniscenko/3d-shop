import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  Plus,
  Package,
  Loader2,
  CheckCircle,
  Layers,
  Palette,
  MessageSquare,
  Hash,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import type { OrderItem, Filament } from "../types";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { useNotify } from "../context/NotifyContext";
import ModelDiscoveryCards from "./ModelDiscoveryCards";
import { getOrCreateVisitorId } from "../services/api";

const ALLOWED_UPLOAD_ACCEPT =
  ".stl,.obj,.3mf,.step,.stp,.png,.jpg,.jpeg,.webp,.gif";
const MODEL_EXTENSIONS = new Set([".stl", ".obj", ".3mf", ".step", ".stp"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MAX_FILES_PER_ITEM = 5;

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return fileName.slice(dotIndex).toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Quote() {
  const { t } = useI18n();
  const { notifyError } = useNotify();
  const navigate = useNavigate();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const submittedRef = useRef(false);
  const uploadedFileUrlsRef = useRef<Set<string>>(new Set());
  const isLoggedIn = !!localStorage.getItem("token");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestSubmittedOrderId, setGuestSubmittedOrderId] = useState<
    string | null
  >(null);
  const [guestAccountCreated, setGuestAccountCreated] = useState(false);

  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const res = await api.get("/filaments");
        if (Array.isArray(res.data)) {
          setFilaments(res.data);
        } else {
          setFilaments([]);
        }
      } catch (err) {
        console.error("Failed to fetch filaments", err);
      }
    };
    fetchFilaments();
  }, []);

  const availableMaterials = Array.from(
    new Set(filaments.map((f) => f.material)),
  );
  const availableColors = Array.from(new Set(filaments.map((f) => f.name)));

  const finalMaterials =
    availableMaterials.length > 0 ? availableMaterials : ["PLA", "PETG"];
  const finalColors =
    availableColors.length > 0 ? availableColors : ["Black", "White"];

  const getColorsForMaterial = (selectedMaterial: string) => {
    const matchingFilaments = filaments.filter(
      (f) => f.material === selectedMaterial,
    );
    const colors = Array.from(new Set(matchingFilaments.map((f) => f.name)));
    return colors.length > 0 ? colors : finalColors;
  };

  const uploadSelectedFilesForItem = async (
    selectedFiles: File[],
    itemIndex: number,
  ) => {
    if (selectedFiles.length === 0) return;

    const currentFileCount = items[itemIndex]?.files?.length || 0;
    const remainingSlots = MAX_FILES_PER_ITEM - currentFileCount;
    if (remainingSlots <= 0) {
      notifyError(`Max ${MAX_FILES_PER_ITEM} files per item.`);
      return;
    }

    const filesToUpload = selectedFiles.slice(0, remainingSlots);
    if (filesToUpload.length < selectedFiles.length) {
      notifyError(
        `Max ${MAX_FILES_PER_ITEM} files per item. Only ${filesToUpload.length} file(s) were added.`,
      );
    }

    setIsUploading(true);
    let failedCount = 0;
    let firstErrorMessage: string | null = null;
    const uploadedEntries: Array<{
      file: File;
      url: string;
      isImage: boolean;
      isModel: boolean;
    }> = [];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await api.post("/upload", formData);

          const extension = getFileExtension(file.name);
          const isImage = IMAGE_EXTENSIONS.has(extension);
          const isModel = MODEL_EXTENSIONS.has(extension);

          if (typeof res.data?.url === "string" && res.data.url.length > 0) {
            uploadedFileUrlsRef.current.add(res.data.url);
            uploadedEntries.push({
              file,
              url: res.data.url,
              isImage,
              isModel,
            });
          }
        } catch (err: any) {
          failedCount += 1;

          if (!firstErrorMessage) {
            const backendMessage = err?.response?.data?.message;
            const isUnsupportedType =
              typeof backendMessage === "string" &&
              /unsupported file type|unsupported content type/i.test(
                backendMessage,
              );

            if (isUnsupportedType) {
              firstErrorMessage = `${t("quote.uploadUnsupportedType")} ${t("quote.allowedFilesInline")}`;
            } else {
              firstErrorMessage = backendMessage || t("quote.uploadFailed");
            }
          }
        }
      }

      if (uploadedEntries.length > 0) {
        setItems((prev) => {
          const nextItems = [...prev];
          if (!nextItems[itemIndex]) return nextItems;

          const existingFiles = nextItems[itemIndex].files || [];
          const newFiles = uploadedEntries.map((entry) => ({
            url: entry.url,
            name: entry.file.name,
            kind: (entry.isModel
              ? "model"
              : entry.isImage
                ? "image"
                : "other") as "model" | "image" | "other",
          }));

          const mergedFiles = [...existingFiles, ...newFiles];
          const firstModel = mergedFiles.find((file) => file.kind === "model");
          const firstImage = mergedFiles.find((file) => file.kind === "image");
          const firstAny = mergedFiles[0];

          nextItems[itemIndex] = {
            ...nextItems[itemIndex],
            files: mergedFiles,
            fileUrl: firstModel?.url || firstAny?.url || "",
            fileName: firstModel?.name || firstAny?.name || "",
            imageUrl: firstImage?.url || nextItems[itemIndex].imageUrl || "",
          };

          return nextItems;
        });
      }

      if (failedCount > 0) {
        const hasSuccessfulUploads = uploadedEntries.length > 0;
        if (hasSuccessfulUploads) {
          notifyError(
            `${t("quote.uploadPartialFailed")} (${failedCount}/${selectedFiles.length})`,
          );
        } else {
          notifyError(firstErrorMessage || t("quote.uploadFailed"));
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    await uploadSelectedFilesForItem(selectedFiles, itemIndex);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    itemIndex: number,
  ) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;

    const droppedFiles = Array.from(e.dataTransfer.files ?? []);
    await uploadSelectedFilesForItem(droppedFiles, itemIndex);
  };

  const deleteTempUpload = async (fileUrl?: string | null) => {
    if (!fileUrl) return;

    try {
      await api.delete("/upload/temp", {
        params: { fileUrl },
      });
      uploadedFileUrlsRef.current.delete(fileUrl);
    } catch {
      // Best-effort cleanup; ignore if file is already linked or removed.
    }
  };

  const removeItem = (index: number) => {
    const removed = items[index];
    setItems(items.filter((_, i) => i !== index));

    if (removed?.fileUrl) {
      void deleteTempUpload(removed.fileUrl);
    }

    if (removed?.imageUrl) {
      void deleteTempUpload(removed.imageUrl);
    }

    if (Array.isArray(removed?.files)) {
      for (const file of removed.files) {
        if (!file?.url) continue;
        if (file.url === removed.fileUrl || file.url === removed.imageUrl)
          continue;
        void deleteTempUpload(file.url);
      }
    }
  };

  const removeItemFile = (itemIndex: number, fileIndex: number) => {
    setItems((prev) => {
      const nextItems = [...prev];
      const item = nextItems[itemIndex];
      if (!item) return nextItems;

      const existingFiles = item.files || [];
      if (fileIndex < 0 || fileIndex >= existingFiles.length) return nextItems;

      const removed = existingFiles[fileIndex];
      const nextFiles = existingFiles.filter((_, index) => index !== fileIndex);

      const firstModel = nextFiles.find((file) => file.kind === "model");
      const firstImage = nextFiles.find((file) => file.kind === "image");
      const firstAny = nextFiles[0];

      nextItems[itemIndex] = {
        ...item,
        files: nextFiles,
        fileUrl: firstModel?.url || firstAny?.url || "",
        fileName: firstModel?.name || firstAny?.name || "",
        imageUrl: firstImage?.url || "",
      };

      if (removed?.url) {
        void deleteTempUpload(removed.url);
      }

      return nextItems;
    });
  };

  const clearItemFiles = (itemIndex: number) => {
    setItems((prev) => {
      const nextItems = [...prev];
      const item = nextItems[itemIndex];
      if (!item) return nextItems;

      const existingFiles = item.files || [];
      for (const file of existingFiles) {
        if (!file?.url) continue;
        void deleteTempUpload(file.url);
      }

      nextItems[itemIndex] = {
        ...item,
        files: [],
        fileUrl: "",
        fileName: "",
        imageUrl: "",
      };

      return nextItems;
    });
  };

  const addTextOnlyItem = () => {
    const defaultMat = finalMaterials[0];
    const defaultColor = getColorsForMaterial(defaultMat)[0];

    const newItem: OrderItem = {
      fileUrl: "",
      fileName: "",
      notes: "",
      imageUrl: "",
      files: [],
      material: defaultMat,
      color: defaultColor,
      price: 0,
      count: 1,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      const normalizedName = guestName.trim();
      const normalizedEmail = guestEmail.trim();

      if (normalizedName.length < 2) {
        notifyError(t("quote.guestRequiredName"));
        return;
      }

      if (!normalizedEmail) {
        notifyError(t("quote.guestRequiredEmail"));
        return;
      }

      if (!isValidEmail(normalizedEmail)) {
        notifyError(t("quote.guestInvalidEmail"));
        return;
      }
    }

    if (items.length === 0) {
      notifyError(t("quote.noFiles"));
      return;
    }

    // Validate each item has either uploaded files or description
    if (
      items.some(
        (item) =>
          (!item.files || item.files.length === 0) &&
          !item.fileUrl &&
          !item.imageUrl &&
          !item.notes,
      )
    ) {
      notifyError(
        "Each item must have either a model, reference image, or description.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isLoggedIn) {
        setGuestAccountCreated(false);
        setGuestSubmittedOrderId(null);
      }

      const payload: {
        items: OrderItem[];
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
      } = {
        items: items.map((item) => ({
          ...item,
          files: (item.files || []).map((file) => ({
            url: file.url,
            name: file.name,
            kind: file.kind || "other",
          })),
        })),
      };

      if (!isLoggedIn) {
        payload.guestName = guestName.trim();
        payload.guestEmail = guestEmail.trim();
        payload.guestPhone = guestPhone.trim();
      }

      const res = await api.post("/orders/quote", payload);
      submittedRef.current = true;
      uploadedFileUrlsRef.current.clear();

      if (isLoggedIn) {
        navigate("/orders");
        return;
      }

      setItems([]);
      setGuestSubmittedOrderId(res?.data?.order?.id || res?.data?.id || null);
      setGuestAccountCreated(!!res?.data?.accountCreated);
    } catch (err: any) {
      const message = err?.response?.data?.message || t("quote.submitFailed");
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (submittedRef.current) return;

      const pendingFileUrls = Array.from(uploadedFileUrlsRef.current);
      if (pendingFileUrls.length === 0) return;

      const token = localStorage.getItem("token");
      const visitorId = getOrCreateVisitorId();

      void fetch("/api/upload/temp/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visitor-Id": visitorId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fileUrls: pendingFileUrls }),
        keepalive: true,
      }).catch(() => {
        // Best-effort fallback if keepalive batch call fails.
      });

      for (const fileUrl of pendingFileUrls) {
        void api
          .delete("/upload/temp", {
            params: { fileUrl },
          })
          .catch(() => {
            // Best-effort cleanup only.
          });
      }
    };
  }, []);

  return (
    <div className="site-shell">
      <Navbar />

      <main className="site-main px-4 sm:px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="site-heading text-4xl font-bold mb-2">
            {t("quote.title")}
          </h2>
          <p className="site-subheading text-lg">{t("quote.subtitle")}</p>
        </div>

        <div className="mb-8">
          <ModelDiscoveryCards compact lowEmphasis inlineMinimal />
        </div>

        {!isLoggedIn && (
          <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">
              {t("quote.guestContactTitle")}
            </h3>
            <p className="mt-1 text-sm text-[#5f736d]">
              {t("quote.guestContactSubtitle")}
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t("quote.fullName")}
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t("quote.fullName")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t("quote.guestEmail")}
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t("quote.phone")}
                </label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t("quote.phone")}
                />
              </div>
            </div>
          </div>
        )}

        {!isLoggedIn && guestSubmittedOrderId && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <h3 className="text-lg font-bold text-emerald-800">
              {guestAccountCreated
                ? t("quote.guestAccountCreatedTitle")
                : t("quote.guestSubmittedTitle")}
            </h3>
            <p className="mt-1 text-sm text-emerald-900/80">
              {guestAccountCreated
                ? t("quote.guestAccountCreatedBody")
                : t("quote.guestSubmittedBody")}
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-800">
              {t("quote.guestSubmittedReference")} {guestSubmittedOrderId}
            </p>
            {guestAccountCreated && (
              <p className="mt-3 text-xs text-[#0f766e] font-semibold">
                {t("quote.guestAccountCreatedHint")}
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Package className="text-emerald-600" size={20} />
                  {t("quote.models")}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addTextOnlyItem}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    {t("quote.addItem")}
                  </button>
                </div>
              </div>
              <p className="mb-4 text-xs text-[#5f736d]">
                {t("quote.allowedFilesInline")}
              </p>
              <p className="mb-4 text-xs text-amber-700">
                {t("quote.materialAvailabilityDisclaimer")}
              </p>

              {items.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                  }}
                  className={`border-2 border-dashed rounded-xl py-12 text-center transition-colors ${
                    isDragOver
                      ? "border-emerald-400 bg-emerald-50/50"
                      : "border-gray-200"
                  } ${isUploading ? "opacity-70" : ""}`}
                >
                  <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-400">{t("quote.noFiles")}</p>
                  <p className="mt-2 text-xs text-[#5f736d]">
                    {t("quote.addItem")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50/50"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-800 truncate max-w-[300px]">
                          {item.fileName || t("quote.textDescription")}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            {isUploading ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Plus size={14} />
                            )}
                            {t("quote.addFile")}
                            <input
                              type="file"
                              multiple
                              accept={ALLOWED_UPLOAD_ACCEPT}
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, idx)}
                              disabled={
                                isUploading ||
                                (item.files || []).length >= MAX_FILES_PER_ITEM
                              }
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {(item.files || []).length > 0 && (
                        <div className="mb-3">
                          <button
                            type="button"
                            onClick={() => clearItemFiles(idx)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                          >
                            {t("quote.removeAllFiles")}
                          </button>
                        </div>
                      )}

                      {(item.files || []).length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {(item.files || []).map((file, fileIndex) => (
                            <span
                              key={`${file.url}-${fileIndex}`}
                              className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs text-[#2e423d]"
                            >
                              <span>{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeItemFile(idx, fileIndex)}
                                className="text-rose-500 hover:text-rose-700 leading-none"
                                aria-label={`Remove ${file.name}`}
                                title={`Remove ${file.name}`}
                              >
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers size={12} /> {t("quote.material")}
                          </label>
                          <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            value={item.material}
                            onChange={(e) => {
                              const newMaterial = e.target.value;
                              const validColors =
                                getColorsForMaterial(newMaterial);

                              const newItems = [...items];
                              newItems[idx].material = newMaterial;

                              if (!validColors.includes(newItems[idx].color)) {
                                newItems[idx].color = validColors[0];
                              }

                              setItems(newItems);
                            }}
                          >
                            {finalMaterials.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Palette size={12} /> {t("quote.color")}
                          </label>
                          <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            value={item.color}
                            onChange={(e) =>
                              updateItem(idx, "color", e.target.value)
                            }
                          >
                            {getColorsForMaterial(item.material).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Hash size={12} /> {t("quote.quantity")}
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={item.count}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "count",
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <MessageSquare
                          className="absolute left-3 top-3 text-gray-300"
                          size={16}
                        />
                        <textarea
                          placeholder={t("quote.notesPlaceholder")}
                          className="w-full p-3 pl-10 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                          value={item.notes}
                          onChange={(e) =>
                            updateItem(idx, "notes", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">
                {t("quote.shippingLaterNotice")}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-[#5e7069]">
                {t("quote.pricingDisclaimer")}{" "}
                <Link
                  to="/terms"
                  className="font-semibold text-[#0f766e] hover:underline"
                >
                  {t("footer.terms")}
                </Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full mt-8 bg-[#133827] text-white font-bold py-4 rounded-xl hover:bg-[#1c4d37] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                {t("quote.submit")}
              </button>
              <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest">
                {t("quote.secure")}
              </p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
