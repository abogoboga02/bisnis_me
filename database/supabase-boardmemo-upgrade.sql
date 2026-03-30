ALTER TABLE bisnis_me.businesses
ADD COLUMN IF NOT EXISTS boardmemo_label VARCHAR(120) NOT NULL DEFAULT 'Board Memo',
ADD COLUMN IF NOT EXISTS boardmemo_title VARCHAR(160) NOT NULL DEFAULT 'Structured direction for a sharper first impression.',
ADD COLUMN IF NOT EXISTS boardmemo_body TEXT NOT NULL DEFAULT '';

UPDATE bisnis_me.businesses AS b
SET boardmemo_label = COALESCE(
      NULLIF(b.boardmemo_label, ''),
      CASE WHEN t.key = 'atelier-mosaic' THEN 'Board Memo' ELSE 'Quick Note' END
    ),
    boardmemo_title = COALESCE(
      NULLIF(b.boardmemo_title, ''),
      CASE
        WHEN t.key = 'atelier-mosaic' THEN 'Structured direction for a sharper first impression.'
        ELSE 'A short note that adds extra context near the hero area.'
      END
    ),
    boardmemo_body = COALESCE(
      NULLIF(b.boardmemo_body, ''),
      CASE
        WHEN t.key = 'atelier-mosaic' THEN 'Gunakan boardmemo untuk menaruh ringkasan positioning, arahan presentasi, atau catatan formal yang mendukung panel hero tanpa memakan fokus gambar utama.'
        ELSE ''
      END
    )
FROM bisnis_me.templates AS t
WHERE b.template_id = t.id;
