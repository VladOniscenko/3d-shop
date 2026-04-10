import type {
  SavedAddressOption,
  ShippingDetails,
  ShippingField,
  TranslateFn,
} from "./types";

interface ShippingModalProps {
  open: boolean;
  shippingDetails: ShippingDetails;
  shippingErrors: Record<string, string>;
  savedAddresses: SavedAddressOption[];
  selectedAddressId: string | null;
  isPaying: boolean;
  t: TranslateFn;
  onFieldChange: (field: ShippingField, value: string) => void;
  onSavedAddressChange: (addressId: string) => void;
  onCancel: () => void;
  onCheckout: () => void;
}

export default function ShippingModal({
  open,
  shippingDetails,
  shippingErrors,
  savedAddresses,
  selectedAddressId,
  isPaying,
  t,
  onFieldChange,
  onSavedAddressChange,
  onCancel,
  onCheckout,
}: ShippingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t("orderDetail.shippingModalTitle")}
        </h3>
        <p className="text-sm text-gray-600 mb-5">
          {t("orderDetail.shippingModalSubtitle")}
        </p>

        <div className="space-y-3">
          {savedAddresses.length > 0 ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Saved address
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedAddressId ?? ""}
                onChange={(e) => onSavedAddressChange(e.target.value)}
                disabled={isPaying}
              >
                <option value="">Enter a new address</option>
                {savedAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {(address.label || address.fullName) +
                      ` - ${address.addressLine1}, ${address.city}` +
                      (address.isDefault ? " (default)" : "")}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <InputField
            value={shippingDetails.fullName}
            error={shippingErrors.fullName}
            placeholder={t("quote.fullName")}
            onChange={(value) => onFieldChange("fullName", value)}
          />

          <InputField
            type="tel"
            value={shippingDetails.phoneNumber}
            error={shippingErrors.phoneNumber}
            placeholder={t("quote.phone")}
            onChange={(value) => onFieldChange("phoneNumber", value)}
          />

          <InputField
            value={shippingDetails.addressLine1}
            error={shippingErrors.addressLine1}
            placeholder={t("quote.street")}
            onChange={(value) => onFieldChange("addressLine1", value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              value={shippingDetails.city}
              error={shippingErrors.city}
              placeholder={t("quote.city")}
              onChange={(value) => onFieldChange("city", value)}
            />

            <InputField
              value={shippingDetails.postalCode}
              error={shippingErrors.postalCode}
              placeholder={t("quote.postalCode")}
              onChange={(value) => onFieldChange("postalCode", value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isPaying}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
            disabled={isPaying}
            onClick={onCheckout}
          >
            {isPaying
              ? t("orderDetail.shippingModalStarting")
              : t("orderDetail.shippingModalCheckout")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  value: string;
  error?: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}

function InputField({
  value,
  error,
  placeholder,
  type = "text",
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:ring-red-400"
            : "border-gray-200 focus:ring-emerald-500"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
