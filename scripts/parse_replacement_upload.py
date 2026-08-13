from pathlib import Path
import re

LOG = Path('/home/ubuntu/replacement_chars/upload.log')
OUT = Path('/home/ubuntu/replacement_chars/replacement_asset_urls.ts')

rows = []
for line in LOG.read_text().splitlines():
    match = re.search(r'^\[SUCCESS\] (.+?)\.png -> (/.+?\.png)$', line)
    if match:
        filename, url = match.groups()
        rows.append((filename, url))

rows.sort(key=lambda row: row[0].lower())
if len(rows) != 150 or len({name for name, _ in rows}) != 150:
    raise SystemExit(f'Expected 150 unique successful uploads, found {len(rows)}')

lines = [
    '// Generated from the verified cropped_characters.zip upload log.',
    'export const REPLACEMENT_CHARACTER_ASSETS: Record<string, string> = {',
]
lines.extend(f'  {name!r}: {url!r},' for name, url in rows)
lines.append('};')
OUT.write_text('\n'.join(lines) + '\n')
print(f'Wrote {len(rows)} asset URLs to {OUT}')
