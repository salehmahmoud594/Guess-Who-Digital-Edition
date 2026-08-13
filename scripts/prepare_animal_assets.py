from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SOURCE = Path("/home/ubuntu/animal_ingest/cropped_anials")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/animals_crops")
PREVIEW = Path("/home/ubuntu/animal_preview/animal_crops_contact_sheet.jpg")
OUTPUT.mkdir(parents=True, exist_ok=True)
PREVIEW.parent.mkdir(parents=True, exist_ok=True)


def color_distance(pixels: np.ndarray, color: np.ndarray) -> np.ndarray:
    return np.sqrt(((pixels.astype(np.int32) - color.astype(np.int32)) ** 2).sum(axis=2))


def longest_true_run(values: np.ndarray):
    indices = np.where(values)[0]
    if len(indices) == 0:
        return None
    runs = []
    start = previous = int(indices[0])
    for value in indices[1:]:
        value = int(value)
        if value != previous + 1:
            runs.append((start, previous + 1))
            start = value
        previous = value
    runs.append((start, previous + 1))
    return max(runs, key=lambda run: run[1] - run[0])


def discover_boxes(image: Image.Image):
    pixels = np.asarray(image.convert("RGB"), dtype=np.int32)
    height, width = pixels.shape[:2]

    corner_samples = np.concatenate(
        [pixels[:12, :12].reshape(-1, 3), pixels[:12, -12:].reshape(-1, 3),
         pixels[-12:, :12].reshape(-1, 3), pixels[-12:, -12:].reshape(-1, 3)],
        axis=0,
    )
    outer = np.median(corner_samples, axis=0)
    border_distance = color_distance(pixels, outer)
    # Find the panel from the stable outer cream matte. The previous approach
    # sampled a peach row through the artwork; an animal crossing that row could
    # make the detected panel only a narrow strip or a blank lower segment.
    outer_like = border_distance < 34
    x_margin = max(8, height // 30)
    y_margin = max(8, width // 30)
    x_outer_ratio = outer_like[x_margin:height - x_margin, :].mean(axis=0)
    y_outer_ratio = outer_like[:, y_margin:width - y_margin].mean(axis=1)
    horizontal = longest_true_run(x_outer_ratio < 0.72)
    vertical = longest_true_run(y_outer_ratio < 0.72)
    if horizontal and vertical:
        panel_box = (horizontal[0], vertical[0], horizontal[1], vertical[1])
    else:
        outer_mask = border_distance > 16
        y_panel, x_panel = np.where(outer_mask)
        panel_box = (int(x_panel.min()), int(y_panel.min()), int(x_panel.max()) + 1, int(y_panel.max()) + 1)

    x0, y0, x1, y1 = panel_box
    # The source card has a thin cream keyline immediately inside the panel edge.
    # Trim it before sampling or copying so it never becomes a stripe in the game card.
    border = max(6, int(min(width, height) * 0.016))
    panel_box = (min(x0 + border, x1), min(y0 + border, y1),
                 max(x1 - border, x0), max(y1 - border, y0))
    x0, y0, x1, y1 = panel_box
    panel_crop = pixels[y0:y1, x0:x1]
    # Sample the most common quantized RGB bin from the panel perimeter. This avoids
    # sampling an animal when it reaches the top or center of a portrait.
    perimeter = np.concatenate(
        [panel_crop[: max(8, panel_crop.shape[0] // 12), :].reshape(-1, 3),
         panel_crop[-max(8, panel_crop.shape[0] // 12):, :].reshape(-1, 3),
         panel_crop[:, : max(8, panel_crop.shape[1] // 12)].reshape(-1, 3),
         panel_crop[:, -max(8, panel_crop.shape[1] // 12):].reshape(-1, 3)],
        axis=0,
    )
    quantized = (perimeter // 8) * 8
    unique, counts = np.unique(quantized, axis=0, return_counts=True)
    panel = unique[int(np.argmax(counts))]

    subject_mask = color_distance(panel_crop, panel) > 30
    y_subject, x_subject = np.where(subject_mask)
    if len(x_subject) == 0:
        subject_box = panel_box
    else:
        subject_box = (int(x_subject.min()) + x0, int(y_subject.min()) + y0,
                       int(x_subject.max()) + x0 + 1, int(y_subject.max()) + y0 + 1)
    return panel_box, subject_box, tuple(int(value) for value in panel)


def expand_to_card(image: Image.Image, panel_box, subject_box, panel_color):
    # Preserve the complete illustrated subject. The previous subject-mask
    # reconstruction removed legitimate animal pixels on several source files
    # (for example Rabbit_4_6), leaving a flat peach card with tiny fragments.
    # Only the outer matte/keyline is excluded by panel_box; no foreground mask
    # or synthetic repainting is applied to the artwork itself.
    source = image.convert("RGB")
    panel_x0, panel_y0, panel_x1, panel_y1 = panel_box
    sx0, sy0, sx1, sy1 = subject_box
    subject_width = max(1, sx1 - sx0)
    subject_height = max(1, sy1 - sy0)
    padding = max(16, int(max(subject_width, subject_height) * 0.045))
    target_width = subject_width + (padding * 2)
    target_height = subject_height + (padding * 2)
    if target_width / target_height < 0.8:
        target_width = int(round(target_height * 0.8))
    else:
        target_height = int(round(target_width / 0.8))

    center_x = (sx0 + sx1) / 2
    center_y = (sy0 + sy1) / 2
    crop_x0 = int(round(center_x - target_width / 2))
    crop_y0 = int(round(center_y - target_height / 2))
    canvas = Image.new("RGB", (target_width, target_height), panel_color)
    source_x0 = max(crop_x0, panel_x0)
    source_y0 = max(crop_y0, panel_y0)
    source_x1 = min(crop_x0 + target_width, panel_x1)
    source_y1 = min(crop_y0 + target_height, panel_y1)
    if source_x1 > source_x0 and source_y1 > source_y0:
        source_region = source.crop((source_x0, source_y0, source_x1, source_y1))
        canvas.paste(source_region, (source_x0 - crop_x0, source_y0 - crop_y0))
    return canvas.resize((640, 800), Image.Resampling.LANCZOS)


files = sorted(SOURCE.glob("*.png"))
font = ImageFont.load_default()
thumb_w, thumb_h, label_h, columns = 160, 200, 34, 8
rows = (len(files) + columns - 1) // columns
sheet = Image.new("RGB", (columns * thumb_w, rows * (thumb_h + label_h)), "#f3eee5")
draw = ImageDraw.Draw(sheet)

for index, path in enumerate(files):
    source = Image.open(path).convert("RGB")
    panel_box, subject_box, panel_color = discover_boxes(source)
    prepared = expand_to_card(source, panel_box, subject_box, panel_color)
    output_path = OUTPUT / path.name
    prepared.save(output_path, format="PNG", optimize=True)

    preview = prepared.copy()
    preview.thumbnail((thumb_w - 12, thumb_h - 12), Image.Resampling.LANCZOS)
    x = (index % columns) * thumb_w
    y = (index // columns) * (thumb_h + label_h)
    cell = Image.new("RGB", (thumb_w, thumb_h), "#ffffff")
    cell.paste(preview, ((thumb_w - preview.width) // 2, (thumb_h - preview.height) // 2))
    sheet.paste(cell, (x, y))
    draw.rectangle((x, y, x + thumb_w - 1, y + thumb_h - 1), outline="#d9cec0")
    draw.text((x + 5, y + thumb_h + 5), path.stem[:23], fill="#1f2937", font=font)

sheet.save(PREVIEW, quality=92)
print(f"prepared={len(files)}")
print(f"output={OUTPUT}")
print(f"preview={PREVIEW}")
