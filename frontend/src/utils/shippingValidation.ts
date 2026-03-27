export type ShippingInfo = {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
  postalCode: string;
};

export function normalizeShippingInfo(input: ShippingInfo): ShippingInfo {
  const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ");
  const phoneDigits = input.phoneNumber.replace(/\D/g, "");
  const phoneNumber = input.phoneNumber.trim().startsWith("+")
    ? `+${phoneDigits}`
    : phoneDigits;

  return {
    fullName: normalizeWhitespace(input.fullName),
    phoneNumber,
    addressLine1: normalizeWhitespace(input.addressLine1),
    city: normalizeWhitespace(input.city),
    postalCode: normalizeWhitespace(input.postalCode).toUpperCase(),
  };
}

export function validateShippingInfo(input: ShippingInfo): Record<string, string> {
  const errors: Record<string, string> = {};
  const normalized = normalizeShippingInfo(input);

  const nameRegex = /^[\p{L}][\p{L}\p{M}\s'.-]*$/u;
  const phoneRegex = /^\+?[0-9\s().-]+$/;
  const addressRegex = /^[\p{L}\p{M}0-9\s,'.\-/#]+$/u;
  const cityRegex = /^[\p{L}\p{M}\s'.-]+$/u;
  const postalRegex = /^[A-Za-z0-9][A-Za-z0-9\s-]{1,11}$/;

  if (!normalized.fullName) {
    errors.fullName = "Full name is required";
  } else if (normalized.fullName.length < 2 || normalized.fullName.length > 100) {
    errors.fullName = "Full name must be 2-100 characters";
  } else if (!nameRegex.test(normalized.fullName)) {
    errors.fullName = "Full name contains unsupported characters";
  }

  if (!input.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!phoneRegex.test(input.phoneNumber.trim())) {
    errors.phoneNumber = "Phone number format is invalid";
  } else if (normalized.phoneNumber.replace(/\D/g, "").length < 7 || normalized.phoneNumber.replace(/\D/g, "").length > 15) {
    errors.phoneNumber = "Phone number must contain 7-15 digits";
  }

  if (!normalized.addressLine1) {
    errors.addressLine1 = "Address is required";
  } else if (normalized.addressLine1.length < 5 || normalized.addressLine1.length > 120) {
    errors.addressLine1 = "Address must be 5-120 characters";
  } else if (!addressRegex.test(normalized.addressLine1)) {
    errors.addressLine1 = "Address contains unsupported characters";
  }

  if (!normalized.city) {
    errors.city = "City is required";
  } else if (normalized.city.length < 2 || normalized.city.length > 80) {
    errors.city = "City must be 2-80 characters";
  } else if (!cityRegex.test(normalized.city)) {
    errors.city = "City contains unsupported characters";
  }

  if (!normalized.postalCode) {
    errors.postalCode = "Postal code is required";
  } else if (normalized.postalCode.length < 3 || normalized.postalCode.length > 12) {
    errors.postalCode = "Postal code must be 3-12 characters";
  } else if (!postalRegex.test(normalized.postalCode)) {
    errors.postalCode = "Postal code format is invalid";
  }

  return errors;
}
