"""Minimal QR Code generator (byte mode, ECC M, versions 1–10). No dependencies."""

from __future__ import annotations

# (ecc per block, group1 blocks, group1 data, group2 blocks, group2 data)
_EC_M = {
    1: (10, 1, 16, 0, 0),
    2: (16, 1, 28, 0, 0),
    3: (26, 1, 44, 0, 0),
    4: (18, 2, 32, 0, 0),
    5: (24, 2, 43, 0, 0),
    6: (16, 4, 27, 0, 0),
    7: (18, 4, 31, 0, 0),
    8: (22, 2, 38, 2, 39),
    9: (22, 3, 36, 2, 37),
    10: (26, 4, 43, 1, 44),
}

_ALIGN = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
}

_REMAINDER = {1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 0, 8: 0, 9: 0, 10: 0}


def _gf_tables():
    exp = [0] * 512
    log = [0] * 256
    x = 1
    for i in range(255):
        exp[i] = x
        log[x] = i
        x <<= 1
        if x & 0x100:
            x ^= 0x11D
    for i in range(255, 512):
        exp[i] = exp[i - 255]
    return exp, log


_EXP, _LOG = _gf_tables()


def _mul(a, b):
    if a == 0 or b == 0:
        return 0
    return _EXP[_LOG[a] + _LOG[b]]


def _poly_mul(p, q):
    res = [0] * (len(p) + len(q) - 1)
    for i, a in enumerate(p):
        for j, b in enumerate(q):
            res[i + j] ^= _mul(a, b)
    return res


def _rs_generator(degree):
    poly = [1]
    for i in range(degree):
        poly = _poly_mul(poly, [1, _EXP[i]])
    return poly


def _rs_remainder(data, degree):
    gen = _rs_generator(degree)
    msg = list(data) + [0] * degree
    for i in range(len(data)):
        coef = msg[i]
        if coef == 0:
            continue
        for j in range(len(gen)):
            msg[i + j] ^= _mul(gen[j], coef)
    return msg[-degree:]


def _bits_for(data: bytes, version: int) -> list[int]:
    bits = []

    def put(value, length):
        for i in range(length - 1, -1, -1):
            bits.append((value >> i) & 1)

    put(0b0100, 4)  # byte mode
    put(len(data), 8 if version < 10 else 16)
    for b in data:
        put(b, 8)
    ecc, g1n, g1d, g2n, g2d = _EC_M[version]
    capacity = (g1n * g1d + g2n * g2d) * 8
    remaining = capacity - len(bits)
    put(0, min(4, remaining))
    while len(bits) % 8:
        bits.append(0)
    pad = (0xEC, 0x11)
    i = 0
    while len(bits) + 8 <= capacity:
        put(pad[i % 2], 8)
        i += 1
    if len(bits) < capacity:
        put(0, capacity - len(bits))
    return bits


def _codewords(data: bytes, version: int) -> list[int]:
    bits = _bits_for(data, version)
    raw = [int("".join(map(str, bits[i : i + 8])), 2) for i in range(0, len(bits), 8)]
    ecc, g1n, g1d, g2n, g2d = _EC_M[version]
    data_blocks = []
    ecc_blocks = []
    offset = 0
    for count, size in ((g1n, g1d), (g2n, g2d)):
        for _ in range(count):
            chunk = raw[offset : offset + size]
            offset += size
            data_blocks.append(chunk)
            ecc_blocks.append(_rs_remainder(chunk, ecc))
    out = []
    for i in range(max(len(block) for block in data_blocks)):
        for block in data_blocks:
            if i < len(block):
                out.append(block[i])
    for i in range(ecc):
        for block in ecc_blocks:
            out.append(block[i])
    return out


def _size(version: int) -> int:
    return 17 + version * 4


def _version_bits(version: int) -> int:
    rem = version << 12
    for i in range(17, 11, -1):
        if rem & (1 << i):
            rem ^= 0x1F25 << (i - 12)
    return (version << 12) | rem


def _format_bits(mask: int) -> int:
    value = mask  # ECC M is 00, so the 5-bit field is the mask
    rem = value << 10
    for i in range(14, 9, -1):
        if rem & (1 << i):
            rem ^= 0x537 << (i - 10)
    return ((value << 10) | rem) ^ 0x5412


def _place(version: int, codewords: list[int]):
    n = _size(version)
    modules = [[False] * n for _ in range(n)]
    is_func = [[False] * n for _ in range(n)]

    def set_func(r, c, dark):
        modules[r][c] = dark
        is_func[r][c] = True

    def finder(r0, c0):
        for dr in range(-1, 8):
            for dc in range(-1, 8):
                r, c = r0 + dr, c0 + dc
                if not (0 <= r < n and 0 <= c < n):
                    continue
                if 0 <= dr <= 6 and 0 <= dc <= 6:
                    dark = dr in (0, 6) or dc in (0, 6) or (2 <= dr <= 4 and 2 <= dc <= 4)
                else:
                    dark = False
                set_func(r, c, dark)

    finder(0, 0)
    finder(0, n - 7)
    finder(n - 7, 0)

    for r in _ALIGN[version]:
        for c in _ALIGN[version]:
            if is_func[r][c]:
                continue
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    set_func(r + dr, c + dc, max(abs(dr), abs(dc)) != 1)

    for i in range(8, n - 8):
        if not is_func[6][i]:
            set_func(6, i, i % 2 == 0)
        if not is_func[i][6]:
            set_func(i, 6, i % 2 == 0)

    if version >= 7:
        bits = _version_bits(version)
        for i in range(18):
            dark = bool((bits >> i) & 1)
            a = n - 11 + i % 3
            b = i // 3
            set_func(a, b, dark)
            set_func(b, a, dark)

    for i in range(9):
        if i != 6:
            set_func(8, i, False)
            set_func(i, 8, False)
    for i in range(8):
        set_func(8, n - 1 - i, False)
        set_func(n - 1 - i, 8, False)
    set_func(n - 8, 8, True)

    bits = []
    for byte in codewords:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    bits.extend([0] * _REMAINDER[version])

    idx = 0
    upward = True
    col = n - 1
    while col > 0:
        if col == 6:
            col -= 1
        rows = range(n - 1, -1, -1) if upward else range(n)
        for row in rows:
            for c in (col, col - 1):
                if is_func[row][c]:
                    continue
                modules[row][c] = bool(bits[idx]) if idx < len(bits) else False
                if idx < len(bits):
                    idx += 1
        upward = not upward
        col -= 2
    return modules, is_func


def _apply_format(modules, mask):
    # ISO/IEC 18004 format information. Bit 0 is the LSB.
    # Horizontal copy is MSB-first; vertical copy is LSB-first.
    bits = _format_bits(mask)
    n = len(modules)
    voffset = 0
    hoffset = 0
    for i in range(8):
        vbit = bool((bits >> i) & 1)
        hbit = bool((bits >> (14 - i)) & 1)
        if i == 6:
            voffset = 1
            hoffset = 1
        modules[i + voffset][8] = vbit
        modules[8][i + hoffset] = hbit
        modules[8][n - 1 - i] = vbit
        modules[n - 1 - i][8] = hbit
    modules[n - 8][8] = True


def _mask_fn(mask, r, c):
    if mask == 0:
        return (r + c) % 2 == 0
    if mask == 1:
        return r % 2 == 0
    if mask == 2:
        return c % 3 == 0
    if mask == 3:
        return (r + c) % 3 == 0
    if mask == 4:
        return (r // 2 + c // 3) % 2 == 0
    if mask == 5:
        return (r * c) % 2 + (r * c) % 3 == 0
    if mask == 6:
        return ((r * c) % 2 + (r * c) % 3) % 2 == 0
    return ((r + c) % 2 + (r * c) % 3) % 2 == 0


def _penalty(modules):
    n = len(modules)
    score = 0
    for row in modules:
        run = 1
        for c in range(1, n):
            if row[c] == row[c - 1]:
                run += 1
                score += 3 if run == 5 else 1 if run > 5 else 0
            else:
                run = 1
    for c in range(n):
        run = 1
        for r in range(1, n):
            if modules[r][c] == modules[r - 1][c]:
                run += 1
                score += 3 if run == 5 else 1 if run > 5 else 0
            else:
                run = 1
    for r in range(n - 1):
        for c in range(n - 1):
            if modules[r][c] == modules[r][c + 1] == modules[r + 1][c] == modules[r + 1][c + 1]:
                score += 3
    finder = (1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0)
    for row in modules:
        bits = [1 if cell else 0 for cell in row]
        for c in range(n - 10):
            window = tuple(bits[c : c + 11])
            if window == finder or window == finder[::-1]:
                score += 40
    for c in range(n):
        bits = [1 if modules[r][c] else 0 for r in range(n)]
        for r in range(n - 10):
            window = tuple(bits[r : r + 11])
            if window == finder or window == finder[::-1]:
                score += 40
    dark = sum(cell for row in modules for cell in row)
    score += abs(dark * 100 // (n * n) - 50) // 5 * 10
    return score


def _needed_version(length: int) -> int:
    for version, (ecc, g1n, g1d, g2n, g2d) in _EC_M.items():
        capacity = (g1n * g1d + g2n * g2d) * 8
        header = 4 + (8 if version < 10 else 16)
        if header + length * 8 <= capacity:
            return version
    raise ValueError("payload too long for QR versions 1–10")


def matrix(text: str):
    data = text.encode("utf-8")
    version = _needed_version(len(data))
    base, is_func = _place(version, _codewords(data, version))
    best = None
    best_score = 10**9
    best_mask = 0
    n = len(base)
    for mask in range(8):
        modules = [row[:] for row in base]
        for r in range(n):
            for c in range(n):
                if not is_func[r][c] and _mask_fn(mask, r, c):
                    modules[r][c] = not modules[r][c]
        _apply_format(modules, mask)
        score = _penalty(modules)
        if score < best_score:
            best, best_score, best_mask = modules, score, mask
    return best, version, best_mask


def svg(text: str, dark: str = "#14110e", light: str = "#f4efe6", quiet: int = 4) -> str:
    modules, _, _ = matrix(text)
    n = len(modules)
    size = n + quiet * 2
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" shape-rendering="crispEdges" role="img">',
        f'<rect width="{size}" height="{size}" fill="{light}"/>',
    ]
    for r, row in enumerate(modules):
        c = 0
        while c < n:
            if not row[c]:
                c += 1
                continue
            start = c
            while c < n and row[c]:
                c += 1
            parts.append(
                f'<rect x="{start + quiet}" y="{r + quiet}" width="{c - start}" height="1" fill="{dark}"/>'
            )
    parts.append("</svg>")
    return "".join(parts)
