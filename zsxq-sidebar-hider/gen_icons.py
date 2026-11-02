#!/usr/bin/env python3
"""纯 Python 生成扩展图标 PNG（RGB、无 alpha、无任何元数据块）。

不依赖 qlmanage/Pillow，排除渲染器附加色彩配置或 DPI 元数据导致
Dia 工具栏把图标缩没/显暗的问题。几何按 128 基准坐标定义，超采样抗锯齿。
"""
import struct
import zlib

C1 = (79, 70, 229)    # 靛蓝 #4f46e5
C2 = (2, 132, 199)    # 天蓝 #0284c7
WHITE = (255, 255, 255)

# 128 基准坐标系里的图形
BAR = (34.0, 64.0, 12.0, 38.0, 9.0)          # 圆角白条 cx, cy, hw, hh, r
SEGS = (((94.0, 44.0), (64.0, 64.0)), ((64.0, 64.0), (94.0, 84.0)))  # 折叠箭头两段
HALF_W = 8.0                                  # 箭头线宽一半


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def seg_dist(px, py, ax, ay, bx, by):
    abx, aby = bx - ax, by - ay
    t = clamp(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby), 0, 1)
    dx, dy = px - (ax + abx * t), py - (ay + aby * t)
    return (dx * dx + dy * dy) ** 0.5


def rrect_sdf(px, py, cx, cy, hw, hh, r):
    qx, qy = abs(px - cx) - (hw - r), abs(py - cy) - (hh - r)
    ox, oy = max(qx, 0), max(qy, 0)
    return (ox * ox + oy * oy) ** 0.5 + min(max(qx, qy), 0) - r


def render(size, ss=4):
    S = size * ss
    sc = S / 128.0
    grid = []
    for y in range(S):
        row = bytearray(S * 3)
        for x in range(S):
            bx, by = (x + 0.5) / sc, (y + 0.5) / sc
            col = lerp(C1, C2, clamp((bx + by) / 256.0, 0, 1))
            if (
                rrect_sdf(bx, by, *BAR) <= 0
                or seg_dist(bx, by, *SEGS[0][0], *SEGS[0][1]) <= HALF_W
                or seg_dist(bx, by, *SEGS[1][0], *SEGS[1][1]) <= HALF_W
            ):
                col = WHITE
            i = x * 3
            row[i], row[i + 1], row[i + 2] = col
        grid.append(row)
    # ss×ss 盒式降采样
    out = bytearray()
    for y in range(size):
        for x in range(size):
            r = g = b = 0
            for dy in range(ss):
                src = grid[y * ss + dy]
                base = x * ss * 3
                for dx in range(ss):
                    r += src[base + dx * 3]
                    g += src[base + dx * 3 + 1]
                    b += src[base + dx * 3 + 2]
            n = ss * ss
            out += bytes((round(r / n), round(g / n), round(b / n)))
    return out


def write_png(path, size, pixels):
    stride = size * 3
    raw = b"".join(b"\x00" + bytes(pixels[y * stride:(y + 1) * stride]) for y in range(size))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)  # 8bit 真彩色，无交错
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


if __name__ == "__main__":
    for s in (16, 32, 48, 128):
        write_png(f"icons/icon{s}.png", s, render(s))
        print(f"icons/icon{s}.png done")
