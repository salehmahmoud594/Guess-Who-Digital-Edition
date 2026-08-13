from pathlib import Path
from PIL import Image

ROOT = Path('/home/ubuntu/webdev-static-assets/fictional_crops')
FILES = sorted(ROOT.glob('*.png'))[:12]

def color_distance(pixel, target):
    return sum((int(pixel[i]) - int(target[i])) ** 2 for i in range(3)) ** 0.5

for path in FILES:
    with Image.open(path).convert('RGB') as image:
        width, height = image.size
        pixels = image.load()
        samples = [pixels[width // 2, 96], pixels[width // 2, 160], pixels[width // 2, height - 96]]
        target = tuple(round(sum(sample[i] for sample in samples) / len(samples)) for i in range(3))
        points = []
        for y in range(0, height, 4):
            for x in range(0, width, 4):
                if color_distance(pixels[x, y], target) > 26:
                    points.append((x, y))
        bbox = (min(x for x, _ in points), min(y for _, y in points), max(x for x, _ in points), max(y for _, y in points)) if points else None
        print(f'{path.name}\tsize={width}x{height}\tbg={target}\tbbox={bbox}')
