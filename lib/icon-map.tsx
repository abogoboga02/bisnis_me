import type { ComponentType } from "react";
import {
  BadgePercent,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Bus,
  CalendarDays,
  CarFront,
  CookingPot,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Hotel,
  LayoutTemplate,
  Megaphone,
  Package,
  PenSquare,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserRound,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

export type IconOption = {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

export const iconOptions: IconOption[] = [
  { key: "badge-percent", label: "Badge Percent", Icon: BadgePercent },
  { key: "book-open", label: "Book Open", Icon: BookOpen },
  { key: "briefcase-business", label: "Briefcase Business", Icon: BriefcaseBusiness },
  { key: "building", label: "Building", Icon: Building2 },
  { key: "bus", label: "Bus", Icon: Bus },
  { key: "calendar-days", label: "Calendar Days", Icon: CalendarDays },
  { key: "car-front", label: "Car Front", Icon: CarFront },
  { key: "cooking-pot", label: "Cooking Pot", Icon: CookingPot },
  { key: "globe", label: "Globe", Icon: Globe },
  { key: "graduation-cap", label: "Graduation Cap", Icon: GraduationCap },
  { key: "handshake", label: "Handshake", Icon: Handshake },
  { key: "heart-pulse", label: "Heart Pulse", Icon: HeartPulse },
  { key: "hotel", label: "Hotel", Icon: Hotel },
  { key: "layout-template", label: "Layout Template", Icon: LayoutTemplate },
  { key: "megaphone", label: "Megaphone", Icon: Megaphone },
  { key: "package", label: "Package", Icon: Package },
  { key: "pen-square", label: "Pen Square", Icon: PenSquare },
  { key: "phone-call", label: "Phone Call", Icon: PhoneCall },
  { key: "shield", label: "Shield Check", Icon: ShieldCheck },
  { key: "shopping-bag", label: "Shopping Bag", Icon: ShoppingBag },
  { key: "smartphone", label: "Smartphone", Icon: Smartphone },
  { key: "sparkles", label: "Sparkles", Icon: Sparkles },
  { key: "store", label: "Store", Icon: Store },
  { key: "truck", label: "Truck", Icon: Truck },
  { key: "user-round", label: "User Round", Icon: UserRound },
  { key: "utensils-crossed", label: "Utensils Crossed", Icon: UtensilsCrossed },
  { key: "wrench", label: "Wrench", Icon: Wrench },
];

export const iconMap: Record<string, ComponentType<{ className?: string }>> = Object.fromEntries(
  iconOptions.map((option) => [option.key, option.Icon]),
);
