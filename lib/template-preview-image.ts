const templatePreviewImageMap: Record<string, string> = {
  "atelier-mosaic": "/uploads/seed/atelier-mosaic.svg",
  "signal-frame": "/uploads/seed/signal-frame.svg",
  "noir-grid": "/uploads/seed/noir-grid.svg",
  "prism-riot": "/uploads/seed/prism-riot.svg",
  "harbor-ledger": "/uploads/seed/harbor-ledger.svg",
};

export function resolveTemplatePreviewImage(templateKey: string | null | undefined, previewImage?: string | null) {
  return previewImage || (templateKey ? templatePreviewImageMap[templateKey] ?? null : null);
}
