from pathlib import Path

from PIL import Image

from prepare_animal_assets import discover_boxes


SOURCE = Path("/home/ubuntu/animal_ingest/cropped_anials")
for stem in ("Rabbit_4_6", "Moose_18_1", "Horse_19_6", "Bird_19_4", "Alligator_11_4"):
    path = SOURCE / f"{stem}.png"
    image = Image.open(path).convert("RGB")
    panel_box, subject_box, panel_color = discover_boxes(image)
    print(stem, "size=", image.size, "panel=", panel_box, "subject=", subject_box, "color=", panel_color)
