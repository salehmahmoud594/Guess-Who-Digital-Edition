from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path('/home/ubuntu/chars_ingest/chars')
paths = sorted(root.glob('*.png'))
thumb_w, thumb_h = 420, 178
label_h = 30
cols = 2
rows = (len(paths) + cols - 1) // cols
canvas = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + label_h)), '#f5f0e7')
draw = ImageDraw.Draw(canvas)
font = ImageFont.load_default()
for index, path in enumerate(paths):
    with Image.open(path).convert('RGB') as image:
        image.thumbnail((thumb_w - 12, thumb_h - 12))
        x = (index % cols) * thumb_w + (thumb_w - image.width) // 2
        y = (index // cols) * (thumb_h + label_h) + 4
        canvas.paste(image, (x, y))
    label = f'{index + 1:02d}  {path.name}'
    draw.text(((index % cols) * thumb_w + 6, (index // cols) * (thumb_h + label_h) + thumb_h), label[:62], fill='#18253a', font=font)
canvas.save('/home/ubuntu/chars_ingest/contact_sheet.png')
