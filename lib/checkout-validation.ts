import { type DeliveryAddress } from "@/types/checkout";

export function validateAddress(addr: DeliveryAddress) {
  const errors: Partial<Record<keyof DeliveryAddress, string>> = {};

  if (!addr.name.trim()) errors.name = "Full name is required";
  if (!/^[6-9]\d{9}$/.test(addr.phone.replace(/\s/g, "").replace("+91", "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  if (!addr.line1.trim()) errors.line1 = "Street address is required";
  if (!addr.locality?.trim()) errors.locality = "Locality/Area is required";
  if (!addr.city.trim()) errors.city = "City is required";
  if (!addr.state) errors.state = "State is required";
  if (!/^\d{6}$/.test(addr.pincode)) errors.pincode = "Enter a valid 6-digit pincode";

  return { errors, isValid: Object.keys(errors).length === 0 };
}
