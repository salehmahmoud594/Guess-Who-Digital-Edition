"""Generate a TypeScript asset registry from the Cartoon upload log."""

from pathlib import Path
import re


LOG = Path("/home/ubuntu/cartoon_upload.log")
OUTPUT = Path("/home/ubuntu/cartoonAssets.generated.ts")


def escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def main() -> None:
    lines = LOG.read_text(encoding="utf-8").splitlines()
    names: list[str] = []
    paths: list[str] = []
    current_name = None
    for line in lines:
        upload_match = re.search(r"cartoon_crops/(.+?) \(size:", line)
        if upload_match:
            current_name = Path(upload_match.group(1)).stem
            continue
        path_match = re.search(r"Storage Path: (/.+)$", line)
        if path_match and current_name is not None:
            names.append(current_name)
            paths.append(path_match.group(1))
            current_name = None

    if len(names) != len(set(names)):
        raise SystemExit("Duplicate cartoon filename stems detected")
    if not names:
        raise SystemExit("No uploaded cartoon assets found")

    rows = [
        "// Generated from /home/ubuntu/cartoon_upload.log; do not edit by hand.",
        "export const cartoonCharacterAssets = {",
    ]
    rows.extend(f"  '{escape(name)}': '{escape(path)}'," for name, path in zip(names, paths))
    rows.extend(["} as const;", "", f"export const cartoonCharacterAssetCount = {len(names)};"])
    OUTPUT.write_text("\n".join(rows) + "\n", encoding="utf-8")
    print(f"assets={len(names)}")
    print(f"output={OUTPUT}")


if __name__ == "__main__":
    main()
