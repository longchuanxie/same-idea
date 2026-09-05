from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
APP_ASSETS = ROOT / "anniversary_app" / "assets" / "brand"
WINDOWS_RESOURCES = ROOT / "anniversary_app" / "windows" / "runner" / "resources"
ANDROID_RESOURCES = ROOT / "anniversary_app" / "android" / "app" / "src" / "main" / "res"
BRAND_DOCS = ROOT / "docs" / "brand"

GREEN = "#5f857b"
GREEN_DARK = "#41685f"
GREEN_LIGHT = "#7ea49a"
CREAM = "#fff8ee"
CREAM_DARK = "#efe3d4"
PEACH = "#e6a08b"
INK = "#314b45"


def draw_logo(size: int) -> Image.Image:
    scale = size / 1024

    def xy(values: tuple[int, ...]) -> tuple[int, ...]:
        return tuple(round(value * scale) for value in values)

    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")

    background = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    background_draw = ImageDraw.Draw(background, "RGBA")
    background_draw.rounded_rectangle(
        xy((44, 44, 980, 980)),
        radius=round(214 * scale),
        fill=GREEN,
    )
    background_draw.ellipse(
        xy((-170, -190, 650, 610)),
        fill=(*hex_to_rgb(GREEN_LIGHT), 82),
    )
    background_draw.ellipse(
        xy((650, 690, 1210, 1230)),
        fill=(*hex_to_rgb(GREEN_DARK), 92),
    )
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        xy((44, 44, 980, 980)),
        radius=round(214 * scale),
        fill=255,
    )
    image.alpha_composite(Image.composite(background, Image.new("RGBA", (size, size)), mask))

    draw.rounded_rectangle(
        xy((224, 180, 800, 850)),
        radius=round(88 * scale),
        fill=CREAM,
    )
    draw.rounded_rectangle(
        xy((224, 180, 800, 328)),
        radius=round(88 * scale),
        fill=CREAM_DARK,
    )
    draw.rectangle(xy((224, 258, 800, 328)), fill=CREAM_DARK)

    for x in (372, 652):
        draw.rounded_rectangle(
            xy((x - 36, 122, x + 36, 252)),
            radius=round(34 * scale),
            fill=GREEN_DARK,
        )
        draw.rounded_rectangle(
            xy((x - 18, 146, x + 18, 226)),
            radius=round(18 * scale),
            fill=CREAM,
        )

    draw.polygon(
        [xy((706, 180))[0:2], xy((800, 180))[0:2], xy((800, 274))[0:2]],
        fill="#f7eddf",
    )
    draw.line(xy((706, 180, 800, 274)), fill="#dcccb8", width=round(10 * scale))

    line_width = round(58 * scale)
    draw.line(
        xy((372, 470, 512, 362, 652, 470)),
        fill=GREEN_DARK,
        width=line_width,
        joint="curve",
    )
    draw.rounded_rectangle(
        xy((478, 440, 546, 632)),
        radius=round(34 * scale),
        fill=GREEN_DARK,
    )
    draw.rounded_rectangle(
        xy((356, 628, 668, 696)),
        radius=round(34 * scale),
        fill=GREEN_DARK,
    )
    draw.rounded_rectangle(
        xy((390, 744, 634, 806)),
        radius=round(31 * scale),
        fill=INK,
    )
    draw.ellipse(xy((662, 618, 762, 718)), fill=PEACH)

    return image


def write_svg(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="今念 logo">
  <defs>
    <clipPath id="app-icon-shape">
      <rect x="44" y="44" width="936" height="936" rx="214"/>
    </clipPath>
  </defs>
  <g clip-path="url(#app-icon-shape)">
    <rect x="44" y="44" width="936" height="936" rx="214" fill="{GREEN}"/>
    <circle cx="240" cy="210" r="410" fill="{GREEN_LIGHT}" opacity=".32"/>
    <circle cx="930" cy="960" r="280" fill="{GREEN_DARK}" opacity=".36"/>
  </g>
  <rect x="224" y="180" width="576" height="670" rx="88" fill="{CREAM}"/>
  <path d="M312 180h400a88 88 0 0 1 88 88v60H224v-60a88 88 0 0 1 88-88Z" fill="{CREAM_DARK}"/>
  <g>
    <rect x="336" y="122" width="72" height="130" rx="34" fill="{GREEN_DARK}"/>
    <rect x="354" y="146" width="36" height="80" rx="18" fill="{CREAM}"/>
    <rect x="616" y="122" width="72" height="130" rx="34" fill="{GREEN_DARK}"/>
    <rect x="634" y="146" width="36" height="80" rx="18" fill="{CREAM}"/>
  </g>
  <path d="M706 180h94v94Z" fill="#f7eddf"/>
  <path d="M706 180 800 274" fill="none" stroke="#dcccb8" stroke-width="10"/>
  <path d="M372 470 512 362l140 108" fill="none" stroke="{GREEN_DARK}" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="478" y="440" width="68" height="192" rx="34" fill="{GREEN_DARK}"/>
  <rect x="356" y="628" width="312" height="68" rx="34" fill="{GREEN_DARK}"/>
  <rect x="390" y="744" width="244" height="62" rx="31" fill="{INK}"/>
  <circle cx="712" cy="668" r="50" fill="{PEACH}"/>
</svg>
""",
        encoding="utf-8",
    )


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def main() -> None:
    APP_ASSETS.mkdir(parents=True, exist_ok=True)
    WINDOWS_RESOURCES.mkdir(parents=True, exist_ok=True)
    BRAND_DOCS.mkdir(parents=True, exist_ok=True)

    write_svg(BRAND_DOCS / "jinnian_logo.svg")
    draw_logo(512).save(APP_ASSETS / "jinnian_logo.png")
    draw_logo(1024).save(BRAND_DOCS / "jinnian_logo_1024.png")
    draw_logo(256).save(BRAND_DOCS / "jinnian_logo_256.png")
    icon = draw_logo(256)
    icon.save(
        WINDOWS_RESOURCES / "app_icon.ico",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    for folder, size in {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }.items():
        output_dir = ANDROID_RESOURCES / folder
        output_dir.mkdir(parents=True, exist_ok=True)
        draw_logo(size).save(output_dir / "ic_launcher.png")


if __name__ == "__main__":
    main()
