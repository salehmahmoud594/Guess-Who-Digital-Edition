from pathlib import Path

import numpy as np
from PIL import Image


for file in [Path("/home/ubuntu/animal_ingest/cropped_anials/Alligator_11_4.png"), Path("/home/ubuntu/webdev-static-assets/animals_crops/Alligator_11_4.png")]:
    array = np.asarray(Image.open(file).convert("RGB"), dtype=np.int32)
    sample_y = array.shape[0] // 10
    row = array[sample_y]
    light = np.where((row[:, 0] > 235) & (row[:, 1] > 225) & (row[:, 2] > 210))[0]
    runs = []
    if len(light):
        start = previous = int(light[0])
        for value in light[1:]:
            value = int(value)
            if value != previous + 1:
                runs.append((start, previous))
                start = value
            previous = value
        runs.append((start, previous))
    print(f"file={file.name} sample_y={sample_y} light_runs={runs}")
    for x in [0, 10, 18, 19, 20, 25, 27, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 490, 500, 510]:
        if x < array.shape[1]:
            print(x, tuple(array[sample_y, x]))

source = np.asarray(Image.open(Path("/home/ubuntu/animal_ingest/cropped_anials/Alligator_11_4.png")).convert("RGB"), dtype=np.int32)
for y, x in [(446, 129), (446, 27), (446, 458), (500, 129), (500, 27)]:
    print(f"source_at_{x}_{y}={tuple(source[y, x])}")
