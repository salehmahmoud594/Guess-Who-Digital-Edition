from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/chars_ingest')
for path in sorted(root.rglob('*')):
    if path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp'}:
        continue
    with Image.open(path) as image:
        width, height = image.size
        print(f'{path.name}\t{width}x{height}\t{width / height:.4f}')
