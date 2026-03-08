import {
  BadgePercent,
  LayoutTemplate,
  PenSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "badge-percent": BadgePercent,
  "layout-template": LayoutTemplate,
  "pen-square": PenSquare,
  shield: ShieldCheck,
  smartphone: Smartphone,
  sparkles: Sparkles,
  wrench: Wrench,
};
