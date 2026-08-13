from pathlib import Path
from PIL import Image, ImageChops, ImageStat

root = Path('/home/ubuntu/chars_ingest/chars')
paths = sorted(root.glob('*.png'))
thumbs = {}
for path in paths:
    with Image.open(path).convert('RGB') as image:
        thumbs[path] = image.resize((96, 41))

for index, left in enumerate(paths):
    for right in paths[index + 1:]:
        diff = ImageChops.difference(thumbs[left], thumbs[right])
        mean = sum(ImageStat.Stat(diff).mean) / 3
        if mean < 4.0:
            print(f'{mean:.3f}\t{left.name}\t{right.name}')
