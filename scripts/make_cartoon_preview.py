"""Create a labeled contact sheet for the supplied Cartoon card assets."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


SOURCE = Path("/home/ubuntu/cartoon_ingest")
OUTPUT_DIR = Path("/home/ubuntu/cartoon_preview")
OUTPUT = OUTPUT_DIR / "cartoon_contact_sheet.jpg"
COLUMNS = 8
THUMB_WIDTH = 180
THUMB_HEIGHT = 225
LABEL_HEIGHT = 42
GAP = 12


def load_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def short_label(name: str) -> str:
    stem = Path(name).stem.replace("_", " ")
    return stem if len(stem) <= 25 else f"{stem[:22]}…"


def main() -> None:
    files = sorted(
        p
        for p in SOURCE.rglob("*")
        if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
    )
    if not files:
        raise SystemExit("No image files found")

    rows = (len(files) + COLUMNS - 1) // COLUMNS
    cell_width = THUMB_WIDTH + GAP
    cell_height = THUMB_HEIGHT + LABEL_HEIGHT + GAP
    canvas = Image.new(
        "RGB",
        (COLUMNS * cell_width + GAP, rows * cell_height + GAP),
        (243, 237, 224),
    )
    draw = ImageDraw.Draw(canvas)
    label_font = load_font(16)

    for index, path in enumerate(files):
        with Image.open(path) as source:
            image = source.convert("RGB")
            image.thumbnail((THUMB_WIDTH, THUMB_HEIGHT), Image.Resampling.LANCZOS)
            x = GAP + (index % COLUMNS) * cell_width
            y = GAP + (index // COLUMNS) * cell_height
            tile = Image.new("RGB", (THUMB_WIDTH, THUMB_HEIGHT), (250, 246, 237))
            tile.paste(
                image,
                ((THUMB_WIDTH - image.width) // 2, (THUMB_HEIGHT - image.height) // 2),
            )
            canvas.paste(tile, (x, y))
            draw.text(
                (x, y + THUMB_HEIGHT + 6),
                short_label(path.name),
                fill=(26, 42, 64),
                font=label_font,
            )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT, quality=92, optimize=True)
    print(f"files={len(files)}")
    print(f"output={OUTPUT}")


if __name__ == "__main__":
    main()
