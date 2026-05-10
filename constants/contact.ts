import { Mail, Phone, MapPin, LucideIcon } from "lucide-react";
import settings from "./settings";

export type ContactInfoItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  target?: string;
  rel?: string;
};

export const CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: Mail,
    label: "Concierge Email",
    value: settings.EMAIL,
    href: `mailto:${settings.EMAIL}`
  },
  {
    icon: Phone,
    label: "Customer Support",
    value: settings.PHONE,
    href: `tel:${settings.PHONE.split('/')[0].trim().replace(/\s+/g, '')}`
  },
  {
    icon: MapPin,
    label: "The Headquarters",
    value: settings.ADDRESS,
    href: "https://maps.google.com/?q=Raja+Mahindra+Varam+Rajamahindra+yJunction+Mark+point",
    target: "_blank",
    rel: "noopener noreferrer"
  },
];

export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com/treekart" },
  // { name: "X", href: "https://x.com/treekart" },
];
