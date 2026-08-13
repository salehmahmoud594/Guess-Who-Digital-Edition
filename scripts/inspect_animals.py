from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/home/ubuntu/animal_ingest")
OUT = Path("/home/ubuntu/animal_preview")
OUT.mkdir(parents=True, exist_ok=True)

files = sorted(p for p in ROOT.rglob("*.png"))
font = ImageFont.load_default()
thumb_w, thumb_h = 150, 200
label_h = 34
cols = 8
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), "#f3eee5")
draw = ImageDraw.Draw(sheet)

for index, path in enumerate(files):
    with Image.open(path).convert("RGBA") as source:
        preview = source.copy()
        preview.thumbnail((thumb_w - 12, thumb_h - 12), Image.Resampling.LANCZOS)
        cell = Image.new("RGBA", (thumb_w, thumb_h), "#ffffff")
        cell.alpha_composite(preview, ((thumb_w - preview.width) // 2, (thumb_h - preview.height) // 2))
        x = (index % cols) * thumb_w
        y = (index // cols) * (thumb_h + label_h)
        sheet.paste(cell.convert("RGB"), (x, y))
        draw.rectangle((x, y, x + thumb_w - 1, y + thumb_h - 1), outline="#d9cec0")
        label = path.stem[:23]
        draw.text((x + 5, y + thumb_h + 5), label, fill="#1f2937", font=font)

sheet.save(OUT / "animal_contact_sheet.jpg", quality=92)

rows_out = []
for path in files:
    with Image.open(path).convert("RGBA") as image:
        alpha = image.getchannel("A")
        bbox = alpha.getbbox()
        rows_out.append(f"{path.name}\t{image.width}x{image.height}\talpha_bbox={bbox}")
(OUT / "animal_inventory.tsv").write_text("\n".join(rows_out) + "\n", encoding="utf-8")
print(f"wrote {OUT / 'animal_contact_sheet.jpg'}")
print(f"wrote {OUT / 'animal_inventory.tsv'}")
