from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path('/home/ubuntu/webdev-static-assets/fictional_crops')
paths = sorted(root.glob('fictional_characters_*.png'))[:30]
thumb_w, thumb_h, label_h = 150, 188, 22
cols = 6
rows = (len(paths) + cols - 1) // cols
canvas = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + label_h)), '#f5f0e7')
draw = ImageDraw.Draw(canvas)
font = ImageFont.load_default()
for index, path in enumerate(paths):
    with Image.open(path).convert('RGB') as image:
        image.thumbnail((thumb_w - 12, thumb_h - 8))
        x = (index % cols) * thumb_w + (thumb_w - image.width) // 2
        y = (index // cols) * (thumb_h + label_h) + 4
        canvas.paste(image, (x, y))
    draw.text(((index % cols) * thumb_w + 6, (index // cols) * (thumb_h + label_h) + thumb_h), f'{index + 1:03d}', fill='#18253a', font=font)
canvas.save('/home/ubuntu/chars_ingest/crops_preview_001_030.png')
