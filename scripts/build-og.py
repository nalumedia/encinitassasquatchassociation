#!/usr/bin/env python3
"""Generate 1200x630 Open Graph / Twitter card images for the ESA site.

Usage:
    python3 scripts/build-og.py
    python3 scripts/build-og.py --sheet /workspace/sasquatch/esa-site-shots/og-images.png

Writes PNGs under public/og/. Safe to re-run. No network.
"""

from __future__ import annotations

import argparse
import json
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "og"
EVENTS_JSON = ROOT / "events.json"

W, H = 1200, 630

FONTS = Path("/usr/share/fonts/truetype/sand-box/google")
FONT_DISPLAY = FONTS / "Special Elite" / "SpecialElite-Regular.ttf"
FONT_BODY = FONTS / "Libre Franklin" / "LibreFranklin-VariableFont_wght.ttf"
FONT_MONO = FONTS / "Courier Prime" / "CourierPrime-Bold.ttf"
FONT_MONO_REG = FONTS / "Courier Prime" / "CourierPrime-Regular.ttf"

LOGO = PUBLIC / "assets" / "logo-badge.png"
CAMO = PUBLIC / "assets" / "parade" / "camo.png"
GLITTER = PUBLIC / "assets" / "parade" / "glitter.png"
FOOTPRINT = PUBLIC / "assets" / "parade" / "footprint-pixel.png"

INK = (23, 21, 19, 255)
PAPER = (247, 241, 230, 255)
MUTED = (200, 190, 170, 255)
SEA = (12, 135, 152, 255)
SEA_DEEP = (7, 85, 100, 255)
SUN = (242, 184, 75, 255)
PINK = (255, 42, 157, 255)
CORAL = (214, 95, 67, 255)
LEAF = (73, 107, 63, 255)

MONTHS = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


def font(path: Path, size: int, weight: int | None = None) -> ImageFont.FreeTypeFont:
    if weight is not None and "Variable" in path.name:
        return ImageFont.truetype(str(path), size=size, layout_engine=ImageFont.Layout.BASIC)
    return ImageFont.truetype(str(path), size=size)


def font_body(size: int, weight: int = 600) -> ImageFont.FreeTypeFont:
    # Libre Franklin variable: set weight via font variation if supported.
    f = ImageFont.truetype(str(FONT_BODY), size=size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def parse_focus(focus: str | None) -> tuple[float, float]:
    if not focus:
        return 0.5, 0.5
    parts = str(focus).replace(",", " ").split()
    vals = []
    for p in parts:
        p = p.strip().rstrip("%")
        try:
            vals.append(float(p) / 100.0)
        except ValueError:
            continue
    if len(vals) >= 2:
        return vals[0], vals[1]
    if len(vals) == 1:
        return vals[0], 0.5
    return 0.5, 0.5


def cover_crop(im: Image.Image, w: int, h: int, focus: str | None = None) -> Image.Image:
    im = im.convert("RGBA")
    fx, fy = parse_focus(focus)
    scale = max(w / im.width, h / im.height)
    nw, nh = max(w, int(round(im.width * scale))), max(h, int(round(im.height * scale)))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int(round(fx * nw - w / 2))
    top = int(round(fy * nh - h / 2))
    left = max(0, min(left, nw - w))
    top = max(0, min(top, nh - h))
    return im.crop((left, top, left + w, top + h))


def open_cover(path: Path, w: int, h: int, focus: str | None = None) -> Image.Image:
    return cover_crop(Image.open(path), w, h, focus)


def wrap_text(text: str, font_obj: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = str(text).split()
    if not words:
        return [""]
    lines: list[str] = []
    cur = ""
    for word in words:
        trial = word if not cur else f"{cur} {word}"
        if font_obj.getlength(trial) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            if font_obj.getlength(word) <= max_width:
                cur = word
            else:
                # hard-break very long tokens
                chunk = ""
                for ch in word:
                    if font_obj.getlength(chunk + ch) <= max_width:
                        chunk += ch
                    else:
                        if chunk:
                            lines.append(chunk)
                        chunk = ch
                cur = chunk
    if cur:
        lines.append(cur)
    return lines


def fit_lines(text: str, path: Path, max_size: int, min_size: int, max_width: int, max_lines: int, weight: int | None = None):
    is_body = "Libre Franklin" in str(path)
    for size in range(max_size, min_size - 1, -2):
        f = font_body(size, weight or 700) if is_body else font(path, size)
        lines = wrap_text(text, f, max_width)
        if len(lines) <= max_lines:
            return f, lines, size
    f = font_body(min_size, weight or 700) if is_body else font(path, min_size)
    return f, wrap_text(text, f, max_width)[:max_lines], min_size


def pretty_date(s: str | None) -> str:
    if not s:
        return ""
    s = str(s).strip()
    if len(s) >= 10 and s[4] == "-" and s[7] == "-":
        y, m, d = int(s[0:4]), int(s[5:7]), int(s[8:10])
        return f"{MONTHS[m]} {d}, {y}"
    if len(s) >= 7 and s[4] == "-":
        y, m = int(s[0:4]), int(s[5:7])
        return f"{MONTHS[m]} {y}"
    return s


def tile(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    src = src.convert("RGBA")
    out = Image.new("RGBA", size)
    for y in range(0, size[1], src.height):
        for x in range(0, size[0], src.width):
            out.paste(src, (x, y))
    return out


def gradient(size: tuple[int, int], start: tuple, end: tuple, horizontal: bool = False) -> Image.Image:
    w, h = size
    base = Image.new("RGBA", size, start)
    overlay = Image.new("RGBA", size, end)
    mask = Image.new("L", size, 0)
    md = ImageDraw.Draw(mask)
    steps = w if horizontal else h
    for i in range(steps):
        t = i / max(1, steps - 1)
        a = int(round(t * 255))
        if horizontal:
            md.line([(i, 0), (i, h)], fill=a)
        else:
            md.line([(0, i), (w, i)], fill=a)
    return Image.composite(overlay, base, mask)


def multiply_color(im: Image.Image, color: tuple[int, int, int], opacity: float = 1.0) -> Image.Image:
    tint = Image.new("RGBA", im.size, (*color, 255))
    blended = ImageChops.multiply(im.convert("RGBA"), tint)
    if opacity >= 1:
        return blended
    return Image.blend(im.convert("RGBA"), blended, opacity)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_rounded(base: Image.Image, photo: Image.Image, xy: tuple[int, int], radius: int, outline=None, outline_w: int = 0) -> None:
    mask = rounded_mask(photo.size, radius)
    if outline and outline_w:
        ox, oy = xy
        frame = Image.new("RGBA", (photo.size[0] + outline_w * 2, photo.size[1] + outline_w * 2), (0, 0, 0, 0))
        fd = ImageDraw.Draw(frame)
        fd.rounded_rectangle(
            (0, 0, frame.size[0] - 1, frame.size[1] - 1),
            radius=radius + outline_w,
            fill=outline,
        )
        base.alpha_composite(frame, (ox - outline_w, oy - outline_w))
    base.paste(photo, xy, mask)


def logo_badge(size: int = 112) -> Image.Image:
    badge = load_rgba(LOGO)
    # The source badge is dark ink on transparent — seat it on a paper
    # seal with a gold ring so it reads on night photos and camo.
    canvas = Image.new("RGBA", badge.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    inset = 6
    d.ellipse((inset, inset, badge.size[0] - inset - 1, badge.size[1] - inset - 1), fill=(247, 241, 230, 255))
    d.ellipse(
        (inset, inset, badge.size[0] - inset - 1, badge.size[1] - inset - 1),
        outline=(242, 184, 75, 255),
        width=14,
    )
    canvas.alpha_composite(badge)
    pad = 18
    out = Image.new("RGBA", (badge.size[0] + pad, badge.size[1] + pad), (0, 0, 0, 0))
    shadow = Image.new("RGBA", out.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse((8, 10, badge.size[0] + 6, badge.size[1] + 8), fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(7))
    out.alpha_composite(shadow)
    out.alpha_composite(canvas, (pad // 2, pad // 2 - 2))
    out.thumbnail((size, size), Image.Resampling.LANCZOS)
    return out


def draw_wordmark(base: Image.Image, xy: tuple[int, int], color=PAPER) -> int:
    """Small ESA kicker in Courier Prime. Returns the bottom y."""
    f = font(FONT_MONO, 20)
    ImageDraw.Draw(base).text(xy, "ENCINITAS SASQUATCH ASSOCIATION", font=f, fill=color)
    return xy[1] + 28


def text_size(draw: ImageDraw.ImageDraw, text: str, font_obj) -> tuple[int, int]:
    x0, y0, x1, y1 = draw.textbbox((0, 0), text, font=font_obj)
    return x1 - x0, y1 - y0


def draw_shadow_text(base, xy, text, font_obj, fill, shadow=(0, 0, 0, 160), offset=(2, 3)):
    d = ImageDraw.Draw(base)
    d.text((xy[0] + offset[0], xy[1] + offset[1]), text, font=font_obj, fill=shadow)
    d.text(xy, text, font=font_obj, fill=fill)


def draw_glitter_text(base: Image.Image, xy: tuple[int, int], text: str, font_obj, glow=PINK) -> tuple[int, int]:
    """Paint glitter-filled type with a pink glow. Returns (width, height)."""
    d = ImageDraw.Draw(base)
    x0, y0, x1, y1 = d.textbbox((0, 0), text, font=font_obj)
    tw, th = x1 - x0, y1 - y0
    # Glow
    glow_l = Image.new("L", base.size, 0)
    gd = ImageDraw.Draw(glow_l)
    gd.text((xy[0] - x0, xy[1] - y0), text, font=font_obj, fill=255, stroke_width=10, stroke_fill=255)
    glow_l = glow_l.filter(ImageFilter.GaussianBlur(9))
    glow_rgba = Image.new("RGBA", base.size, (glow[0], glow[1], glow[2], 0))
    glow_rgba.putalpha(glow_l.point(lambda a: min(210, int(a * 0.85))))
    base.alpha_composite(glow_rgba)
    # Glitter fill
    mask = Image.new("L", base.size, 0)
    ImageDraw.Draw(mask).text((xy[0] - x0, xy[1] - y0), text, font=font_obj, fill=255)
    glitter = tile(Image.open(GLITTER), base.size)
    # Lift and pink-bias the glitter so type reads on camo
    glitter = ImageEnhance.Brightness(glitter).enhance(1.35)
    glitter = ImageEnhance.Color(glitter).enhance(1.25)
    pink_wash = Image.new("RGBA", base.size, (255, 120, 190, 70))
    glitter = Image.alpha_composite(glitter, pink_wash)
    # Slight warm paper mix so letters stay light
    paper_wash = Image.new("RGBA", base.size, (255, 236, 210, 50))
    glitter = Image.alpha_composite(glitter, paper_wash)
    clipped = Image.new("RGBA", base.size, (0, 0, 0, 0))
    clipped.paste(glitter, (0, 0), mask)
    base.alpha_composite(clipped)
    return tw, th


def draw_string_lights(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    pts = []
    for x in range(-20, W + 21, 6):
        y = 22 + 16 * math.sin(x / 95.0) + 6 * math.sin(x / 40.0)
        pts.append((x, y))
    d.line(pts, fill=(242, 184, 75, 200), width=3)
    # a slightly darker inner wire
    d.line(pts, fill=(80, 50, 20, 80), width=1)
    colors = [
        (255, 42, 157),
        (242, 184, 75),
        (12, 135, 152),
        (214, 95, 67),
        (102, 175, 189),
        (73, 107, 63),
        (247, 241, 230),
    ]
    rng = random.Random(2026)
    x = 28
    i = 0
    while x < W - 20:
        y = 22 + 16 * math.sin(x / 95.0) + 6 * math.sin(x / 40.0) + 18
        c = colors[i % len(colors)]
        # hanging string
        d.line([(x, y - 16), (x, y - 4)], fill=(242, 184, 75, 180), width=2)
        for r, a in ((20, 28), (12, 60), (8, 110)):
            d.ellipse((x - r, y - r, x + r, y + r), fill=(*c, a))
        d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=(*c, 255))
        d.ellipse((x - 3, y - 8, x + 2, y - 3), fill=(255, 255, 255, 170))
        x += 52 + rng.randint(-4, 6)
        i += 1
    base.alpha_composite(overlay)


def draw_footprints(base: Image.Image, y: int = 540, tint=PINK, count: int = 6) -> None:
    foot = load_rgba(FOOTPRINT)
    foot = foot.resize((56, int(56 * foot.height / foot.width)), Image.Resampling.LANCZOS)
    # tint toward pink / paper
    color = Image.new("RGBA", foot.size, (*tint[:3], 255))
    tinted = ImageChops.multiply(foot, color)
    tinted.putalpha(foot.split()[-1])
    x = 48
    for i in range(count):
        im = tinted.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if i % 2 else tinted
        im = im.rotate(12 if i % 2 == 0 else -10, expand=True, resample=Image.Resampling.BICUBIC)
        # fade
        a = im.split()[-1].point(lambda v: int(v * (0.85 - i * 0.08)))
        im.putalpha(a)
        yy = y + (6 if i % 2 else 0)
        base.alpha_composite(im, (x, yy))
        x += 70


def camo_backdrop() -> Image.Image:
    camo = tile(Image.open(CAMO), (W, H))
    camo = multiply_color(camo, (40, 32, 28), 0.75)
    # darken overall
    shade = Image.new("RGBA", (W, H), (17, 14, 13, 150))
    camo = Image.alpha_composite(camo, shade)
    # pink / gold glows
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-200, 200, 520, 820), fill=(255, 42, 157, 50))
    gd.ellipse((700, -120, 1400, 500), fill=(242, 184, 75, 40))
    gd.ellipse((400, 400, 1300, 900), fill=(12, 135, 152, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    camo = Image.alpha_composite(camo, glow)
    return camo


def vignette(base: Image.Image, strength: int = 130) -> None:
    mask = Image.new("L", base.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((-80, -80, W + 80, H + 80), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(60)).point(lambda a: 255 - int((255 - a) * (strength / 255)))
    shade = Image.new("RGBA", base.size, (10, 8, 7, 255))
    shade.putalpha(ImageChops.invert(mask).point(lambda a: int(a * (strength / 255))))
    base.alpha_composite(shade)


def add_logo(base: Image.Image, xy=(36, 86), size=108) -> None:
    base.alpha_composite(logo_badge(size), xy)


def card_photo_left(
    photo: Image.Image,
    kicker: str,
    title: str,
    sub: str,
    *,
    kicker_color=SUN,
    title_color=PAPER,
    sub_color=(230, 222, 208, 255),
    parade: bool = False,
) -> Image.Image:
    base = photo.convert("RGBA")
    if base.size != (W, H):
        base = cover_crop(base, W, H)
    # left cinematic wash
    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    for x in range(0, 820):
        t = 1 - (x / 820) ** 1.15
        a = int(230 * t)
        wd.line([(x, 0), (x, H)], fill=(14, 12, 11, a))
    base.alpha_composite(wash)
    # bottom fade
    bottom = gradient((W, 180), (14, 12, 11, 0), (14, 12, 11, 140), horizontal=False)
    base.alpha_composite(bottom, (0, H - 180))
    vignette(base, 90)

    add_logo(base, (36, 86 if not parade else 100), 108)
    d = ImageDraw.Draw(base)
    kf = font(FONT_MONO, 18)
    d.text((168, 118), kicker.upper(), font=kf, fill=kicker_color)

    tf, lines, _ = fit_lines(title, FONT_DISPLAY, 78, 44, 700, 3)
    y = 208
    for line in lines:
        draw_shadow_text(base, (48, y), line, tf, title_color, shadow=(0, 0, 0, 180), offset=(2, 3))
        y += int(tf.size * 1.08)
    if sub:
        y += 8
        sf, slines, _ = fit_lines(sub, FONT_BODY, 28, 20, 680, 3, weight=500)
        for line in slines:
            d = ImageDraw.Draw(base)
            d.text((52, y), line, font=sf, fill=sub_color)
            y += int(sf.size * 1.28)
    return base


def card_parade(kicker: str, photo_path: Path | None, focus: str | None, footer: str | None = None) -> Image.Image:
    base = camo_backdrop()
    draw_string_lights(base)
    # Photo inset on the right
    if photo_path and photo_path.exists():
        inset_w, inset_h = 480, 480
        photo = open_cover(photo_path, inset_w, inset_h, focus)
        # slight warmth
        photo = ImageEnhance.Color(photo).enhance(1.12)
        paste_rounded(base, photo, (1200 - inset_w - 48, 86), radius=28, outline=(255, 42, 157, 220), outline_w=6)
        # gold inner hairline
        frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        fd = ImageDraw.Draw(frame)
        x0, y0 = 1200 - inset_w - 48, 86
        fd.rounded_rectangle((x0 + 6, y0 + 6, x0 + inset_w - 7, y0 + inset_h - 7), radius=22, outline=(242, 184, 75, 200), width=2)
        base.alpha_composite(frame)

    add_logo(base, (36, 86), 100)
    d = ImageDraw.Draw(base)
    kf = font(FONT_MONO, 18)
    d.text((156, 116), kicker.upper(), font=kf, fill=SUN)

    # Required line, stacked so it stays huge and readable
    headline_font = font(FONT_DISPLAY, 72)
    y = 168
    draw_shadow_text(base, (44, y), "10th Encinitas", headline_font, PAPER, shadow=(0, 0, 0, 200), offset=(3, 4))
    y += 82
    glitter_font = font(FONT_DISPLAY, 78)
    draw_glitter_text(base, (44, y), "Holiday Parade", glitter_font)
    y += 96
    date_font = font(FONT_DISPLAY, 44)
    draw_shadow_text(base, (48, y), "Dec 5", date_font, SUN, shadow=(0, 0, 0, 180), offset=(2, 3))
    # exact required phrase as a secondary mono line
    y += 62
    phrase_f = font(FONT_MONO, 20)
    d = ImageDraw.Draw(base)
    d.text((52, y), "10TH ENCINITAS HOLIDAY PARADE  ·  DEC 5", font=phrase_f, fill=PINK)
    if footer:
        ff = font_body(22, 600)
        d.text((52, y + 34), footer, font=ff, fill=PAPER)

    draw_footprints(base, y=548, tint=PINK, count=5)
    return base


def card_events_mosaic(photos: list[tuple[Path, str | None]], kicker: str, title: str, sub: str) -> Image.Image:
    base = Image.new("RGBA", (W, H), INK)
    # left panel
    left = Image.new("RGBA", (560, H), (23, 21, 19, 255))
    # subtle paper/sun glow
    g = Image.new("RGBA", (560, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((-80, -60, 360, 300), fill=(242, 184, 75, 40))
    ImageDraw.Draw(g).ellipse((40, 400, 520, 760), fill=(12, 135, 152, 40))
    g = g.filter(ImageFilter.GaussianBlur(30))
    left = Image.alpha_composite(left, g)
    base.paste(left, (0, 0))

    # 2x2 mosaic on the right
    grid = Image.new("RGBA", (640, H), INK)
    cw, ch = 320, 315
    for i, (path, focus) in enumerate(photos[:4]):
        x, y = (i % 2) * cw, (i // 2) * ch
        photo = open_cover(path, cw, ch, focus)
        grid.paste(photo, (x, y))
    # gutters
    gd = ImageDraw.Draw(grid)
    gd.line([(cw, 0), (cw, H)], fill=INK, width=6)
    gd.line([(0, ch), (640, ch)], fill=INK, width=6)
    base.paste(grid, (560, 0))

    add_logo(base, (36, 70), 108)
    d = ImageDraw.Draw(base)
    d.text((164, 104), kicker.upper(), font=font(FONT_MONO, 18), fill=SUN)
    tf, lines, _ = fit_lines(title, FONT_DISPLAY, 70, 42, 480, 3)
    y = 160
    for line in lines:
        d.text((40, y), line, font=tf, fill=PAPER)
        y += int(tf.size * 1.08)
    if sub:
        y += 10
        sf, slines, _ = fit_lines(sub, FONT_BODY, 26, 20, 470, 4, weight=500)
        for line in slines:
            d.text((44, y), line, font=sf, fill=MUTED)
            y += int(sf.size * 1.3)
    return base


def card_simple_brand(title: str, sub: str, kicker: str = "Encinitas Sasquatch Association") -> Image.Image:
    base = camo_backdrop()
    # paper panel
    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle((48, 80, W - 48, H - 48), radius=28, fill=(247, 241, 230, 235))
    base.alpha_composite(panel)
    add_logo(base, (80, 120), 120)
    d = ImageDraw.Draw(base)
    d.text((220, 160), kicker.upper(), font=font(FONT_MONO, 18), fill=SEA_DEEP)
    tf, lines, _ = fit_lines(title, FONT_DISPLAY, 74, 44, 980, 3)
    y = 210
    for line in lines:
        d.text((80, y), line, font=tf, fill=INK)
        y += int(tf.size * 1.08)
    if sub:
        y += 8
        sf, slines, _ = fit_lines(sub, FONT_BODY, 28, 20, 980, 3, weight=500)
        for line in slines:
            d.text((80, y), line, font=sf, fill=(94, 89, 79, 255))
            y += int(sf.size * 1.3)
    return base


def event_card(ev: dict, photo: Image.Image | None) -> Image.Image:
    if ev.get("slug") == "holiday-parade-2026":
        # handled separately
        raise ValueError("use parade card")
    if photo is None:
        photo = Image.new("RGBA", (W, H), INK)
    type_label = ev.get("type") or "Event"
    date = pretty_date(ev.get("date"))
    kicker = "  ·  ".join(p for p in (type_label, date) if p)
    title = ev.get("name") or ev.get("shortName") or ev.get("slug")
    sub = ev.get("subhead") or ev.get("theme") or ev.get("shortName") or ""
    return card_photo_left(photo, kicker, title, sub)


def resolve_event_photo(ev: dict) -> tuple[Path | None, str | None]:
    hero = ev.get("heroImage")
    focus = ev.get("heroFocus")
    if hero:
        p = PUBLIC / hero
        if p.exists():
            return p, focus
    return None, None


def save_png(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb_bg = Image.new("RGB", im.size, (23, 21, 19))
    rgba = im.convert("RGBA")
    rgb_bg.paste(rgba, mask=rgba.split()[-1])
    rgb_bg.save(dest, format="PNG", optimize=True)
    print(f"  {dest.relative_to(ROOT)}  ({dest.stat().st_size // 1024} KB)")


def contact_sheet(items: list[tuple[str, Path]], dest: Path) -> None:
    cols = 5
    tw, th = 400, 210
    pad = 18
    label_h = 40
    header = 72
    rows = math.ceil(len(items) / cols)
    sw = cols * tw + (cols + 1) * pad
    sh = header + rows * (th + label_h) + (rows + 1) * pad
    sheet = Image.new("RGB", (sw, sh), (23, 21, 19))
    d = ImageDraw.Draw(sheet)
    title_f = font(FONT_DISPLAY, 36)
    meta_f = font(FONT_MONO_REG, 16)
    d.text((pad, 18), "ESA Open Graph images", font=title_f, fill=PAPER[:3])
    d.text((pad + 460, 32), "1200 × 630  ·  www.encinitassasquatchassociation.com", font=meta_f, fill=SUN[:3])
    lf = font(FONT_MONO, 14)
    for i, (label, path) in enumerate(items):
        r, c = divmod(i, cols)
        x = pad + c * (tw + pad)
        y = header + pad + r * (th + label_h + pad)
        if path.exists():
            thumb = cover_crop(Image.open(path), tw, th)
            sheet.paste(thumb.convert("RGB"), (x, y))
        else:
            ImageDraw.Draw(sheet).rectangle((x, y, x + tw, y + th), fill=(40, 36, 32))
        d.rectangle((x, y, x + tw - 1, y + th - 1), outline=(242, 184, 75, 180))
        d.text((x, y + th + 8), label, font=lf, fill=PAPER[:3])
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, format="PNG", optimize=True)
    print(f"contact sheet → {dest}  ({dest.stat().st_size // 1024} KB)")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sheet",
        default="/workspace/sasquatch/esa-site-shots/og-images.png",
        help="Path for the contact sheet PNG",
    )
    args = parser.parse_args()

    events = json.loads(EVENTS_JSON.read_text())["events"]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "events").mkdir(parents=True, exist_ok=True)

    web = PUBLIC / "assets" / "images" / "web"
    ev_photos = {ev["slug"]: resolve_event_photo(ev) for ev in events}

    print("Generating OG images…")

    # Home
    home = open_cover(web / "parade-night-float.jpg", W, H, "48% 45%")
    save_png(
        card_photo_left(
            home,
            "Encinitas Sasquatch Association",
            "Believe.",
            "Wander often. Wonder always. We celebrate Bigfoot’s love of Encinitas.",
        ),
        OUT / "home.png",
    )

    # About
    about = open_cover(web / "parade-group-night.jpg", W, H, "50% 40%")
    save_png(
        card_photo_left(
            about,
            "About the ESA",
            "Founded in 2016 to inspire people to believe.",
            "Wander often. Wonder always.",
        ),
        OUT / "about.png",
    )

    # Events mosaic
    mosaic_specs = [
        ev_photos["holiday-parade-2016"],
        ev_photos["pride-2022"],
        ev_photos["beach-cleanup-2024"],
        ev_photos["holiday-parade-2024"],
    ]
    mosaic = [(p, f) for (p, f) in mosaic_specs if p]
    save_png(
        card_events_mosaic(
            mosaic,
            "The trail so far",
            "Event History",
            "Parades, Pride, beach cleanups, and fundraisers — from the first night on film to the 10th Holiday Parade.",
        ),
        OUT / "events.png",
    )

    # Join
    join = open_cover(web / "pride-float-love-equality.jpg", W, H, "50% 40%")
    save_png(
        card_photo_left(
            join,
            "Membership",
            "Join the Association.",
            "We welcome anyone and everyone who believes in something.",
        ),
        OUT / "join.png",
    )

    # Generic RSVP
    rsvp = open_cover(web / "parade-costume-night.jpg", W, H, "50% 30%")
    save_png(
        card_photo_left(
            rsvp,
            "RSVP  /  Volunteer",
            "Save your spot on the trail.",
            "March, clean a beach, or help build the next float.",
        ),
        OUT / "rsvp.png",
    )

    # Shop
    shop = open_cover(web / "hat-product.jpg", W, H, "50% 50%")
    save_png(
        card_photo_left(
            shop,
            "The ESA shop",
            "The Beach Cleanup Hat.",
            "Make a statement while making a difference.",
        ),
        OUT / "shop.png",
    )

    # Grow
    grow = open_cover(web / "lima-beans-green.jpg", W, H, "50% 45%")
    save_png(
        card_photo_left(
            grow,
            "A snack for Sasquatch",
            "Grow lima beans.",
            "We believe that Bigfoot loves lima beans. Grow your own.",
        ),
        OUT / "grow.png",
    )

    # Default / 404
    save_png(
        card_simple_brand("Trail went cold.", "That page could not be found. Wander back to the trailhead."),
        OUT / "default.png",
    )

    # Parade family: upcoming, event page, RSVP page
    parade_photo = ev_photos.get("holiday-parade-2025")[0] or (web / "parade-night-float.jpg")
    parade_focus = ev_photos.get("holiday-parade-2025")[1] or "52% 58%"
    save_png(
        card_parade("Upcoming  ·  Encinitas Sasquatch Association", parade_photo, parade_focus, "5:30 PM  ·  Coast Hwy 101  ·  40 & Fabulous"),
        OUT / "upcoming.png",
    )
    save_png(
        card_parade("10th parade  ·  Encinitas Sasquatch Association", parade_photo, parade_focus, "Saturday, December 5, 2026  ·  Coast Hwy 101"),
        OUT / "events" / "holiday-parade-2026.png",
    )
    save_png(
        card_parade("RSVP  ·  Encinitas Sasquatch Association", parade_photo, parade_focus, "March with us  ·  December 5, 2026"),
        OUT / "rsvp-holiday-parade-2026.png",
    )

    # One card per remaining event
    for ev in events:
        if ev.get("slug") == "holiday-parade-2026":
            continue
        path, focus = ev_photos[ev["slug"]]
        if path:
            photo = open_cover(path, W, H, focus)
        else:
            photo = Image.new("RGBA", (W, H), INK)
        save_png(event_card(ev, photo), OUT / "events" / f"{ev['slug']}.png")

    items: list[tuple[str, Path]] = [
        ("home", OUT / "home.png"),
        ("about", OUT / "about.png"),
        ("events", OUT / "events.png"),
        ("upcoming", OUT / "upcoming.png"),
        ("join", OUT / "join.png"),
        ("rsvp", OUT / "rsvp.png"),
        ("shop", OUT / "shop.png"),
        ("grow", OUT / "grow.png"),
        ("rsvp / holiday-parade-2026", OUT / "rsvp-holiday-parade-2026.png"),
        ("default / 404", OUT / "default.png"),
    ]
    for ev in events:
        items.append((f"events / {ev['slug']}", OUT / "events" / f"{ev['slug']}.png"))

    contact_sheet(items, Path(args.sheet))
    print(f"done: {len(items)} images")
    return 0


if __name__ == "__main__":
    sys.exit(main())
