"""Cut studio white backgrounds from fleet boat images."""
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
EN = ROOT / "en"
SESSION = new_session("u2net")

JOBS = [
    (EN / "p2.png", EN / "p2.webp", "WEBP"),
    (EN / "p3.png", EN / "p3.png", "PNG"),
    (EN / "p5.png", EN / "p5.png", "PNG"),
]


def cut(src: Path) -> Image.Image:
    raw = src.read_bytes()
    cut_bytes = remove(raw, session=SESSION)
    img = Image.open(__import__("io").BytesIO(cut_bytes)).convert("RGBA")
    return img


def save(img: Image.Image, dest: Path, fmt: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "WEBP":
        max_w = 1600
        if img.width > max_w:
            ratio = max_w / img.width
            img = img.resize((max_w, round(img.height * ratio)), Image.Resampling.LANCZOS)
        img.save(dest, "WEBP", quality=84, method=6)
    else:
        img.save(dest, "PNG", optimize=True)


def main() -> None:
    for src, dest, fmt in JOBS:
        print(f"cutting {src.name} ...")
        img = cut(src)
        save(img, dest, fmt)
        print(f"  -> {dest.name}  {dest.stat().st_size // 1024}KB  {img.size}")


if __name__ == "__main__":
    main()
