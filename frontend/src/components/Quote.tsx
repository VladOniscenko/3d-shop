import { useState, useEffect, useRef } from "react";
import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
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
  Ruler,
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
import { resolveAssetUrl } from "../utils/assetUrl";

const ALLOWED_UPLOAD_ACCEPT =
  ".stl,.obj,.3mf,.step,.stp,.png,.jpg,.jpeg,.webp,.gif";
const MODEL_EXTENSIONS = new Set([".stl", ".obj", ".3mf", ".step", ".stp"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MAX_FILES_PER_ITEM = 3;
const MAX_DIMENSION_MM = 256;
const SCALE_STEP = 0.01;

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return fileName.slice(dotIndex).toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasDimensionValue(value?: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function formatDimensions(
  x?: number,
  y?: number,
  z?: number,
): string | undefined {
  if (!hasDimensionValue(x) && !hasDimensionValue(y) && !hasDimensionValue(z)) {
    return undefined;
  }

  if (!hasDimensionValue(x) || !hasDimensionValue(y) || !hasDimensionValue(z)) {
    return undefined;
  }

  return `${x} x ${y} x ${z} mm`;
}

function roundMillimeters(value: number): number {
  return Math.round(value * 10) / 10;
}

function getMaximumScaleForBase(x: number, y: number, z: number): number {
  if (x <= 0 || y <= 0 || z <= 0) return 1;
  return Math.min(
    MAX_DIMENSION_MM / x,
    MAX_DIMENSION_MM / y,
    MAX_DIMENSION_MM / z,
  );
}

function clampScale(scale: number, maxScale: number): number {
  const safeMaxScale = Math.max(0, maxScale);
  return Math.max(0, Math.min(scale, safeMaxScale));
}

function almostEqual(a: number, b: number, epsilon = 0.001) {
  return Math.abs(a - b) <= epsilon;
}

function formatScaleForFileName(scale: number): string {
  return scale.toFixed(2).replace(/\.00$/, "").replace(/(\.\d*[1-9])0$/, "$1");
}

async function detectStlDimensions(file: File): Promise<{
  x: number;
  y: number;
  z: number;
} | null> {
  if (getFileExtension(file.name) !== ".stl") return null;

  try {
    const buffer = await file.arrayBuffer();
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);

    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return null;

    const size = new Vector3();
    box.getSize(size);

    const x = roundMillimeters(Math.abs(size.x));
    const y = roundMillimeters(Math.abs(size.y));
    const z = roundMillimeters(Math.abs(size.z));

    if (x <= 0 || y <= 0 || z <= 0) return null;

    return { x, y, z };
  } catch {
    return null;
  }
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

    const existingFiles = items[itemIndex]?.files || [];
    const currentFileCount = existingFiles.length;
    const remainingSlots = MAX_FILES_PER_ITEM - currentFileCount;
    if (remainingSlots <= 0) {
      notifyError(`Max ${MAX_FILES_PER_ITEM} files per item.`);
      return;
    }

    let hasModelFile = existingFiles.some((file) => file.kind === "model");
    const filesToUpload: File[] = [];
    let skippedForModelConstraint = 0;

    for (const file of selectedFiles) {
      if (filesToUpload.length >= remainingSlots) break;

      const extension = getFileExtension(file.name);
      const isModel = MODEL_EXTENSIONS.has(extension);
      if (isModel && hasModelFile) {
        skippedForModelConstraint += 1;
        continue;
      }

      filesToUpload.push(file);
      if (isModel) {
        hasModelFile = true;
      }
    }

    const skippedForSlotConstraint =
      selectedFiles.length - filesToUpload.length - skippedForModelConstraint;

    if (skippedForModelConstraint > 0) {
      notifyError(t("quote.singleModelPerItem"));
    }

    if (skippedForSlotConstraint > 0) {
      notifyError(
        `Max ${MAX_FILES_PER_ITEM} files per item. Only ${filesToUpload.length} file(s) were added.`,
      );
    }

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    let failedCount = 0;
    let firstErrorMessage: string | null = null;
    let detectedDimensions: { x: number; y: number; z: number } | null = null;
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

      if (!detectedDimensions) {
        const firstUploadedStl = uploadedEntries.find(
          (entry) => getFileExtension(entry.file.name) === ".stl",
        );
        if (firstUploadedStl) {
          detectedDimensions = await detectStlDimensions(firstUploadedStl.file);
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
            ...(detectedDimensions &&
            !hasDimensionValue(nextItems[itemIndex].dimensionX) &&
            !hasDimensionValue(nextItems[itemIndex].dimensionY) &&
            !hasDimensionValue(nextItems[itemIndex].dimensionZ)
              ? {
                  dimensionBaseX: detectedDimensions.x,
                  dimensionBaseY: detectedDimensions.y,
                  dimensionBaseZ: detectedDimensions.z,
                  dimensionScale: clampScale(
                    1,
                    getMaximumScaleForBase(
                      detectedDimensions.x,
                      detectedDimensions.y,
                      detectedDimensions.z,
                    ),
                  ),
                  dimensionX: roundMillimeters(
                    detectedDimensions.x *
                      clampScale(
                        1,
                        getMaximumScaleForBase(
                          detectedDimensions.x,
                          detectedDimensions.y,
                          detectedDimensions.z,
                        ),
                      ),
                  ),
                  dimensionY: roundMillimeters(
                    detectedDimensions.y *
                      clampScale(
                        1,
                        getMaximumScaleForBase(
                          detectedDimensions.x,
                          detectedDimensions.y,
                          detectedDimensions.z,
                        ),
                      ),
                  ),
                  dimensionZ: roundMillimeters(
                    detectedDimensions.z *
                      clampScale(
                        1,
                        getMaximumScaleForBase(
                          detectedDimensions.x,
                          detectedDimensions.y,
                          detectedDimensions.z,
                        ),
                      ),
                  ),
                }
              : {}),
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
        ...(removed?.kind === "model" && !firstModel
          ? {
              dimensionX: undefined,
              dimensionY: undefined,
              dimensionZ: undefined,
              dimensionBaseX: undefined,
              dimensionBaseY: undefined,
              dimensionBaseZ: undefined,
              dimensionScale: undefined,
            }
          : {}),
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
        dimensionX: undefined,
        dimensionY: undefined,
        dimensionZ: undefined,
        dimensionBaseX: undefined,
        dimensionBaseY: undefined,
        dimensionBaseZ: undefined,
        dimensionScale: undefined,
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
      size: "",
      dimensionX: undefined,
      dimensionY: undefined,
      dimensionZ: undefined,
      dimensionBaseX: undefined,
      dimensionBaseY: undefined,
      dimensionBaseZ: undefined,
      dimensionScale: undefined,
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

  const updateItemScale = (index: number, nextScale: number) => {
    setItems((prev) => {
      const nextItems = [...prev];
      const item = nextItems[index];
      if (!item) return nextItems;

      if (
        !hasDimensionValue(item.dimensionBaseX) ||
        !hasDimensionValue(item.dimensionBaseY) ||
        !hasDimensionValue(item.dimensionBaseZ)
      ) {
        return nextItems;
      }

      const maxScale = getMaximumScaleForBase(
        item.dimensionBaseX,
        item.dimensionBaseY,
        item.dimensionBaseZ,
      );
      const clampedScale = clampScale(nextScale, maxScale);

      nextItems[index] = {
        ...item,
        dimensionScale: clampedScale,
        dimensionX: roundMillimeters(item.dimensionBaseX * clampedScale),
        dimensionY: roundMillimeters(item.dimensionBaseY * clampedScale),
        dimensionZ: roundMillimeters(item.dimensionBaseZ * clampedScale),
      };

      return nextItems;
    });
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

    for (const item of items) {
      const dimensions = [item.dimensionX, item.dimensionY, item.dimensionZ];
      const hasAnyDimension = dimensions.some((value) =>
        hasDimensionValue(value),
      );

      if (!hasAnyDimension) continue;

      const allProvided = dimensions.every((value) => hasDimensionValue(value));
      if (!allProvided) {
        notifyError(t("quote.dimensionsAllOrNone"));
        return;
      }

      const allWithinMax = dimensions.every(
        (value) => typeof value === "number" && value <= MAX_DIMENSION_MM,
      );
      if (!allWithinMax) {
        notifyError(t("quote.dimensionsMaxExceeded"));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (!isLoggedIn) {
        setGuestAccountCreated(false);
        setGuestSubmittedOrderId(null);
      }

      let replacedOriginalModelUrls: string[] = [];

      const itemsForPayload = await Promise.all(
        items.map(async (item) => {
          const modelFileIndex = (item.files || []).findIndex(
            (file) => file.kind === "model",
          );

          if (
            modelFileIndex < 0 ||
            !hasDimensionValue(item.dimensionScale) ||
            almostEqual(item.dimensionScale, 1)
          ) {
            return item;
          }

          const modelFile = item.files?.[modelFileIndex];
          if (!modelFile?.url) return item;

          const extension = getFileExtension(modelFile.name || "");
          if (extension !== ".stl") return item;

          try {
            const sourceUrl = resolveAssetUrl(modelFile.url);
            const sourceResponse = await fetch(sourceUrl);
            if (!sourceResponse.ok) {
              throw new Error("Failed to fetch STL for scaling.");
            }

            const sourceBuffer = await sourceResponse.arrayBuffer();
            const loader = new STLLoader();
            const geometry = loader.parse(sourceBuffer);
            geometry.scale(
              item.dimensionScale,
              item.dimensionScale,
              item.dimensionScale,
            );

            const exporter = new STLExporter();
            const mesh = new Mesh(geometry, new MeshStandardMaterial());
            const exported = exporter.parse(mesh, {
              binary: true,
            }) as DataView | ArrayBuffer | string;

            let scaledBlob: Blob;
            if (typeof exported === "string") {
              scaledBlob = new Blob([exported], { type: "model/stl" });
            } else if (exported instanceof DataView) {
              const bytes = new Uint8Array(exported.byteLength);
              for (let i = 0; i < exported.byteLength; i += 1) {
                bytes[i] = exported.getUint8(i);
              }
              scaledBlob = new Blob(
                [bytes],
                { type: "model/stl" },
              );
            } else {
              scaledBlob = new Blob([exported], { type: "model/stl" });
            }

            const scaleLabel = formatScaleForFileName(item.dimensionScale);
            const scaledFileName = modelFile.name.endsWith(".stl")
              ? modelFile.name.replace(/\.stl$/i, "") + `_scaled_${scaleLabel}x.stl`
              : modelFile.name + `_scaled_${scaleLabel}x.stl`;

            const scaledFile = new File([scaledBlob], scaledFileName, {
              type: "model/stl",
            });

            const uploadFormData = new FormData();
            uploadFormData.append("file", scaledFile);

            const uploadRes = await api.post("/upload", uploadFormData);
            const scaledUrl = uploadRes.data?.url;
            if (typeof scaledUrl !== "string" || !scaledUrl) {
              throw new Error("Failed to upload scaled STL.");
            }

            uploadedFileUrlsRef.current.add(scaledUrl);

            const nextFiles = [...(item.files || [])];
            nextFiles[modelFileIndex] = {
              ...nextFiles[modelFileIndex],
              url: scaledUrl,
              name: scaledFileName,
            };

            replacedOriginalModelUrls.push(modelFile.url);

            return {
              ...item,
              files: nextFiles,
              fileUrl: scaledUrl,
              fileName: scaledFileName,
            };
          } catch {
            throw new Error(t("quote.scaleFailed"));
          }
        }),
      );

      const payload: {
        items: Array<{
          fileUrl?: string;
          imageUrl?: string;
          fileName?: string;
          notes?: string;
          size?: string;
          material: string;
          color: string;
          count: number;
          files: Array<{
            url: string;
            name: string;
            kind: "model" | "image" | "other";
          }>;
        }>;
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
      } = {
        items: itemsForPayload.map((item) => ({
          fileUrl: item.fileUrl || undefined,
          imageUrl: item.imageUrl || undefined,
          fileName: item.fileName || undefined,
          notes: item.notes?.trim() || undefined,
          size: formatDimensions(
            item.dimensionX,
            item.dimensionY,
            item.dimensionZ,
          ),
          material: item.material,
          color: item.color,
          count: item.count,
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

      for (const originalUrl of replacedOriginalModelUrls) {
        void deleteTempUpload(originalUrl);
      }

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

                      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                            <Ruler size={12} /> {t("quote.size")}
                          </label>
                        </div>

                        {hasDimensionValue(item.dimensionBaseX) &&
                        hasDimensionValue(item.dimensionBaseY) &&
                        hasDimensionValue(item.dimensionBaseZ) ? (
                          <div className="grid grid-cols-1 gap-2.5">
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600">
                                  {t("quote.scale")}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">
                                  {(item.dimensionScale ?? 0).toFixed(2)}x
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={getMaximumScaleForBase(
                                  item.dimensionBaseX,
                                  item.dimensionBaseY,
                                  item.dimensionBaseZ,
                                )}
                                step={SCALE_STEP}
                                value={item.dimensionScale ?? 0}
                                className="w-full accent-emerald-600"
                                onChange={(e) =>
                                  updateItemScale(idx, Number(e.target.value))
                                }
                              />
                              <p className="mt-1 text-[11px] text-slate-500">
                                {t("quote.scaleHint")}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-500">
                            {t("quote.scaleNeedsStl")}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] text-slate-500">
                            {t("quote.dimensionsMaxHint")}
                          </p>
                          {hasDimensionValue(item.dimensionX) &&
                            hasDimensionValue(item.dimensionY) &&
                            hasDimensionValue(item.dimensionZ) && (
                              <span className="text-[11px] font-bold text-slate-700">
                                {item.dimensionX} x {item.dimensionY} x{" "}
                                {item.dimensionZ} mm
                              </span>
                            )}
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
