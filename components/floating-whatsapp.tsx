"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/contact-utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export function FloatingWhatsApp({ whatsapp }: { whatsapp: string }) {
  const reduceMotion = usePrefersReducedMotion();

  if (!whatsapp) {
    return null;
  }

  const href = buildWhatsAppHref(whatsapp);

  const commonProps = {
    href,
    target: "_blank",
    rel: "noreferrer",
    className:
      "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-[0_20px_50px_rgba(74,222,128,0.35)]",
    "aria-label": "Chat on WhatsApp",
  } as const;

  if (reduceMotion) {
    return (
      <a {...commonProps}>
        <MessageCircle className="h-6 w-6" />
      </a>
    );
  }

  return (
    <motion.a
      {...commonProps}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.7 }}
      whileHover={{ scale: 1.07, boxShadow: "0 0 28px rgba(74, 222, 128, 0.45)" }}
    >
      <MessageCircle className="h-6 w-6" />
    </motion.a>
  );
}
