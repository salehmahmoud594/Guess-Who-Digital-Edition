from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path("/home/ubuntu/animal_ingest/cropped_anials")


def analyze(path: Path):
    image = Image.open(path).convert("RGB")
    pixels = np.asarray(image, dtype=np.int32)
    height, width = pixels.shape[:2]
    outer = pixels[2, 2]
    panel = pixels[max(10, height // 12), width // 2]

    # The source sheets use a near-uniform cream outer matte and peach inner panel.
    # Find the largest rectangle that is close to the sampled peach panel color.
    panel_distance = np.sqrt(((pixels - panel) ** 2).sum(axis=2))
    panel_mask = panel_distance < 18
    ys, xs = np.where(panel_mask)
    panel_box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1) if len(xs) else (0, 0, width, height)

    px0, py0, px1, py1 = panel_box
    threshold = 28
    crop = pixels[py0:py1, px0:px1]
    subject_distance = np.sqrt(((crop - panel) ** 2).sum(axis=2))
    outer_distance = np.sqrt(((crop - outer) ** 2).sum(axis=2))
    subject_mask = (subject_distance > threshold) & (outer_distance > 10)
    local_y, local_x = np.where(subject_mask)

    if len(local_x) == 0:
        subject_box = panel_box
    else:
        subject_box = (int(local_x.min()) + px0, int(local_y.min()) + py0,
                       int(local_x.max()) + px0 + 1, int(local_y.max()) + py0 + 1)

    sw = subject_box[2] - subject_box[0]
    sh = subject_box[3] - subject_box[1]
    print(f"{path.name}\t{width}x{height}\tpanel={panel_box}\tsubject={subject_box}\tsubject_ratio={sw / max(sh, 1):.3f}")


for file in sorted(ROOT.glob("*.png")):
    analyze(file)
