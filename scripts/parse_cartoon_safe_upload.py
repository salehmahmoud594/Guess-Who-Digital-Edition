from pathlib import Path
import json
import re

safe_map = json.loads(Path("/home/ubuntu/cartoon_safe_name_map.json").read_text())
log = Path("/home/ubuntu/cartoon_upload_safe.log").read_text()
uploaded: dict[str, str] = {}
current: str | None = None
for line in log.splitlines():
    match = re.search(r"/cartoon_crops_safe/(cartoon_\d{3}\.webp)", line)
    if match:
        current = match.group(1)
    path_match = re.search(r"Storage Path: (/.+)$", line)
    if path_match and current:
        uploaded[current] = path_match.group(1).strip()
        current = None

reverse_map = {safe_name: stable_name for stable_name, safe_name in safe_map.items()}
entries = []
for safe_name, stable_name in sorted(reverse_map.items(), key=lambda item: item[1].casefold()):
    if safe_name not in uploaded:
        raise SystemExit(f"Missing upload for {safe_name} ({stable_name})")
    entries.append(f"  {json.dumps(stable_name, ensure_ascii=False)}: {json.dumps(uploaded[safe_name], ensure_ascii=False)},")

output = "// Generated from the safe-name Cartoon upload log. Display names remain the original filename stems.\nexport const CARTOON_ASSETS = {\n" + "\n".join(entries) + "\n} as const;\n\nexport const CARTOON_NAMES = Object.keys(CARTOON_ASSETS) as Array<keyof typeof CARTOON_ASSETS>;\n"
Path("/home/ubuntu/cartoonAssets.safe.generated.ts").write_text(output)
print(f"mapped={len(entries)}")
