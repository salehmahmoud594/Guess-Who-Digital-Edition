from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
import re

BASE = "https://3000-i1313885rih3bhzodyu84-f80e85b4.us3.manus.computer"
source = Path("client/src/data/cartoonAssets.ts").read_text()
paths = re.findall(r"['\"]?/manus-storage/([^'\"]+)['\"]?", source)
failures: list[tuple[int, str]] = []

for path in paths:
    url = f"{BASE}/manus-storage/{quote(path, safe='/()_-.')}"
    try:
        request = Request(url, method="HEAD")
        with urlopen(request, timeout=30) as response:
            if response.status != 200:
                failures.append((response.status, path))
    except Exception as error:
        failures.append((0, f"{path}: {error}"))

print(f"checked={len(paths)} bad={len(failures)}")
for status, path in failures:
    print(status, path)
if len(paths) != 123 or failures:
    raise SystemExit(1)
