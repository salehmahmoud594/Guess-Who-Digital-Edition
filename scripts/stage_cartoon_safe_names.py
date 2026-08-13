from pathlib import Path
import json
import shutil

source = Path("/home/ubuntu/webdev-static-assets/cartoon_crops")
target = Path("/home/ubuntu/webdev-static-assets/cartoon_crops_safe")
target.mkdir(parents=True, exist_ok=True)

files = sorted(source.glob("*.webp"), key=lambda path: path.stem.casefold())
mapping: dict[str, str] = {}
for index, path in enumerate(files, start=1):
    safe_name = f"cartoon_{index:03d}.webp"
    shutil.copy2(path, target / safe_name)
    mapping[path.stem] = safe_name

Path("/home/ubuntu/cartoon_safe_name_map.json").write_text(json.dumps(mapping, ensure_ascii=False, indent=2))
print(f"staged={len(files)}")
if len(files) != 123:
    raise SystemExit(1)
