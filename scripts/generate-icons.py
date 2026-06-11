"""Generate minimal PNG icons for the DrunkField PWA without external deps."""
import struct
import zlib
import os

os.makedirs('public/icons', exist_ok=True)


def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', crc)


def create_png(size: int, bg: tuple[int, int, int], fg: tuple[int, int, int]) -> bytes:
    """Creates a PNG with a solid background and a simple 'DF' pixel pattern."""
    r, g, b = bg
    fr, fg_, fb = fg

    # Build a pixel grid: each row is filter_byte + RGB pixels
    pixels = [list(bg)] * size  # default background row

    # Simple block letters D and F centered in the icon
    # Scale factor relative to 192px reference
    scale = size // 48
    if scale < 1:
        scale = 1

    def dot(px: list[list[int]], x: int, y: int) -> None:
        for dy in range(scale * 2):
            for dx in range(scale * 2):
                row = y * scale * 2 + dy
                col = x * scale * 2 + dx
                if 0 <= row < size and 0 <= col < size:
                    px[row][col] = list(fg)

    grid = [[list(bg) for _ in range(size)] for _ in range(size)]

    # Offset to center the letters
    ox = size // 2 - 10 * scale
    oy = size // 2 - 7 * scale

    # Letter D (columns 0-4, rows 0-12 in pixel units)
    d_mask = [
        (0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6),
        (1,0),(1,6),
        (2,0),(2,6),
        (3,0),(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),
    ]
    for (x, y) in d_mask:
        dot(grid, ox // (scale * 2) + x, oy // (scale * 2) + y)

    # Letter F (columns 6-10)
    f_ox = ox // (scale * 2) + 5
    f_mask = [
        (0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6),
        (1,0),(2,0),(3,0),(3,1),(3,2),(3,3),
        (4,0),(5,0),(6,0),
    ]
    for (x, y) in f_mask:
        dot(grid, f_ox + x, oy // (scale * 2) + y)

    raw = b''
    for row in grid:
        raw += b'\x00'
        for px in row:
            raw += bytes(px)

    compressed = zlib.compress(raw, 9)
    png = b'\x89PNG\r\n\x1a\n'
    png += make_chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    png += make_chunk(b'IDAT', compressed)
    png += make_chunk(b'IEND', b'')
    return png


GREEN = (22, 163, 74)
WHITE = (255, 255, 255)

for sz in (192, 512):
    path = f'public/icons/icon-{sz}.png'
    with open(path, 'wb') as f:
        f.write(create_png(sz, GREEN, WHITE))
    print(f'Generated {path}')
