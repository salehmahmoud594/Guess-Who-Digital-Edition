from pathlib import Path
import re


log = Path("/home/ubuntu/animal_upload.log").read_text(encoding="utf-8")
rows = []
for line in log.splitlines():
    match = re.match(r"\[SUCCESS\] (.+/([^/]+\.png)) -> (/.+)$", line)
    if match:
        filename = match.group(2)
        storage = match.group(3)
        name = Path(filename).stem
        rows.append((name, storage))

rows.sort()
if len(rows) != 88 or len({name for name, _ in rows}) != len(rows):
    raise SystemExit(f"unexpected rows: {len(rows)}")

print("import type { Category } from \"./categories\";")
print()
print("export const ANIMAL_ASSETS: Record<string, string> = {")
for name, storage in rows:
    print(f'  {name!r}: "{storage}",')
print("};")
print()
print("export const ANIMAL_NAMES = Object.keys(ANIMAL_ASSETS);")
print()
print("export const ANIMAL_CATEGORY: Category = \"animals\";")
