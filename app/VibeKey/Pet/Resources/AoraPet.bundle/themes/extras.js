/* Aora Bot 0.2.0; original LICENSE applies. */
(() => {
let K;
function useKit(kit) {
    K ??= kit;
}
const TIMING = {
    sine: 'ease-in-out',
    linear: 'linear',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    step: 'steps(2,jump-none)'
};
const n3 = (v)=>Math.round(1000 * v) / 1000;
const compiled = new Map();
function compile(stops, period, phase, easing) {
    const frames = stops.map((stop)=>{
        const decls = [
            void 0 === stop.transform ? '' : `transform:${stop.transform}`,
            void 0 === stop.opacity ? '' : `opacity:${n3(stop.opacity)}`
        ].filter(Boolean).join(';');
        return `${n3(100 * stop.at)}%{${decls}}`;
    }).join('');
    const name = `aora-k${K.hash(frames).toString(36)}`;
    const duration = Math.max(0.05, period);
    const delay = -n3((phase % 1 + 1) % 1 * duration);
    const key = `${name}|${duration}|${delay}|${easing}`;
    let found = compiled.get(key);
    if (!found) {
        found = {
            name,
            rule: `@keyframes ${name}{${frames}}`,
            style: `animation:${name} ${n3(duration)}s ${TIMING[easing]} ${delay}s infinite;animation-play-state:var(--aora-play,running)`
        };
        compiled.set(key, found);
    }
    return found;
}
const about = (x, y, transform, unit = 'px')=>`translate(${n3(x)}${unit},${n3(y)}${unit}) ${transform} translate(${n3(-x)}${unit},${n3(-y)}${unit})`;
const ANIMATED = 'aora-anim';
const BASE = `.${ANIMATED}{transform-box:view-box;transform-origin:0 0}@media (prefers-reduced-motion:reduce){.${ANIMATED}{animation:none!important}}`;
const animatedAttrs = (animation)=>({
        class: ANIMATED,
        style: animation.style
    });
const BASE_RULES = [
    `.${ANIMATED}{transform-box:view-box;transform-origin:0 0}`,
    `@media (prefers-reduced-motion:reduce){.${ANIMATED}{animation:none!important}}`
];
const sheets = new Map();
function styleNode(rules) {
    if (0 === rules.size) return null;
    const list = [
        ...rules
    ].sort();
    const key = list.join('');
    let text = sheets.get(key);
    if (void 0 === text) {
        text = BASE + key;
        sheets.set(key, text);
    }
    return K.node('style', void 0, void 0, {
        text
    });
}
function inside(ring, x, y) {
    let hit = false;
    for(let i = 0, j = ring.length - 1; i < ring.length; j = i++){
        const a = ring[i];
        const b = ring[j];
        if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
}
function silhouetteOf(rings) {
    return {
        rings,
        boxes: rings.map((ring)=>{
            let x0 = 1 / 0;
            let y0 = 1 / 0;
            let x1 = -1 / 0;
            let y1 = -1 / 0;
            for (const [x, y] of ring){
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
            }
            return [
                x0,
                y0,
                x1,
                y1
            ];
        })
    };
}
function clearance(figure, x, y, reach = 64) {
    let best = reach * reach;
    let within = false;
    for(let r = 0; r < figure.rings.length; r++){
        const [x0, y0, x1, y1] = figure.boxes[r];
        const ring = figure.rings[r];
        const inBox = x >= x0 && x <= x1 && y >= y0 && y <= y1;
        if (inBox && !within && inside(ring, x, y)) within = true;
        const dx = x < x0 ? x0 - x : x > x1 ? x - x1 : 0;
        const dy = y < y0 ? y0 - y : y > y1 ? y - y1 : 0;
        if (!(dx * dx + dy * dy >= best)) for(let i = 0; i < ring.length; i++){
            const a = ring[i];
            const b = ring[(i + 1) % ring.length];
            const ex = b[0] - a[0];
            const ey = b[1] - a[1];
            const len2 = ex * ex + ey * ey;
            let t = len2 > 0 ? ((x - a[0]) * ex + (y - a[1]) * ey) / len2 : 0;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const px = x - a[0] - ex * t;
            const py = y - a[1] - ey * t;
            const d2 = px * px + py * py;
            if (d2 < best) best = d2;
        }
    }
    const d = Math.sqrt(best);
    return within ? -d : d;
}
const AS_LAID = {
    mirror: false,
    dx: 0,
    dy: 0
};
const ELSEWHERE = new Set([
    'tear',
    'gather'
]);
const MARGIN = 4;
const SHIFTS = [
    0,
    -4,
    4,
    -8,
    8,
    -12,
    12
];
function itemFootprint(item) {
    const { x, y, size: s } = item;
    switch(item.shape){
        case 'z':
            return [
                [
                    x,
                    y,
                    0.72 * s
                ]
            ];
        case 'heart':
            return [
                [
                    x,
                    y - 0.2 * s,
                    1.3 * s
                ]
            ];
        case 'bang':
            return [
                [
                    x,
                    y + 4 * s,
                    4 * s
                ],
                [
                    x,
                    y + 12 * s,
                    4 * s
                ],
                [
                    x,
                    y + 19.5 * s,
                    3 * s
                ]
            ];
        case 'line':
            {
                const r = (item.width ?? 2) / 2 + 1;
                const x2 = item.x2 ?? x;
                const y2 = item.y2 ?? y;
                return [
                    [
                        x,
                        y,
                        r
                    ],
                    [
                        (x + x2) / 2,
                        (y + y2) / 2,
                        r
                    ],
                    [
                        x2,
                        y2,
                        r
                    ]
                ];
            }
        case 'arc':
            {
                const w = (item.width ?? 0) / 2;
                const sweep = item.sweep ?? 360;
                if (sweep >= 359) return [
                    [
                        x,
                        y,
                        s + w
                    ]
                ];
                return [
                    0,
                    1 / 3,
                    2 / 3,
                    1
                ].map((k)=>{
                    const a = ((item.start ?? 0) + sweep * k) * Math.PI / 180;
                    return [
                        x + Math.sin(a) * s,
                        y - Math.cos(a) * s,
                        w + 1
                    ];
                });
            }
        case 'pencil':
            return [
                [
                    x,
                    y,
                    12
                ]
            ];
        default:
            return [
                [
                    x,
                    y,
                    s
                ]
            ];
    }
}
function footprintOf(kind) {
    return K.evaluateFx(kind, 0, {
        settled: true
    }).items.flatMap(itemFootprint);
}
function cost(circles, figure, scale) {
    const { center: c, viewBox: box } = K;
    const lo = (b)=>c + (b - c) / scale;
    const x0 = lo(box.minX);
    const y0 = lo(box.minY);
    const x1 = lo(box.minX + box.width);
    const y1 = lo(box.minY + box.height);
    let overlap = 0;
    let outside = 0;
    for (const [x, y, r] of circles){
        overlap += Math.max(0, r + MARGIN - clearance(figure, x, y, r + MARGIN + 1));
        outside += Math.max(0, x0 - (x - r)) + Math.max(0, x + r - x1) + Math.max(0, y0 - (y - r)) + Math.max(0, y + r - y1);
    }
    return {
        overlap,
        outside
    };
}
const place = (circles, { mirror, dx, dy })=>circles.map(([x, y, r])=>[
            (mirror ? 2 * K.center - x : x) + dx,
            y + dy,
            r
        ]);
const figures = new WeakMap();
const placements = new WeakMap();
function figureOf(shape) {
    let figure = figures.get(shape);
    if (!figure) {
        figure = silhouetteOf([
            shape.outline,
            ...shape.parts.map((part)=>part.outline)
        ]);
        figures.set(shape, figure);
    }
    return figure;
}
function fxPlacement(shape, kind, scale) {
    if (ELSEWHERE.has(kind) || 0 === shape.parts.length) return AS_LAID;
    let byKind = placements.get(shape);
    if (!byKind) placements.set(shape, byKind = new Map());
    let found = byKind.get(kind);
    if (found) return found;
    const figure = figureOf(shape);
    const circles = footprintOf(kind);
    const laid = cost(circles, figure, scale);
    found = AS_LAID;
    const blocked = circles.some(([x, y, r])=>clearance(figure, x, y, r + 1) < 0.5 * r);
    if (blocked) {
        const score = ({ overlap, outside }, dx, dy)=>overlap + 2 * Math.max(0, outside - laid.outside) + (Math.abs(dx) + Math.abs(dy)) * 0.05;
        let best = score(laid, 0, 0);
        let bestOverlap = laid.overlap;
        for (const mirror of [
            false,
            true
        ])for (const dy of SHIFTS)for (const dx of SHIFTS){
            const option = {
                mirror,
                dx,
                dy
            };
            const placed = cost(place(circles, option), figure, scale);
            const value = score(placed, dx, dy);
            if (value < best - 0.5) {
                best = value;
                bestOverlap = placed.overlap;
                found = option;
            }
        }
        if (found !== AS_LAID && bestOverlap > 0.6 * laid.overlap) found = AS_LAID;
    }
    byKind.set(kind, found);
    return found;
}
const asLaid = (placement)=>!placement.mirror && 0 === placement.dx && 0 === placement.dy;
function fxFootprint(shape, kind, scale) {
    if (ELSEWHERE.has(kind)) return [];
    return place(footprintOf(kind), fxPlacement(shape, kind, scale));
}
const placers = new WeakMap();
function placerOf(placement) {
    let placer = placers.get(placement);
    if (!placer) {
        const { mirror, dx, dy } = placement;
        const x = (v)=>(mirror ? 2 * K.center - v : v) + dx;
        placer = (item, opacity)=>({
                ...item,
                x: x(item.x),
                y: item.y + dy,
                ...void 0 === item.x2 ? null : {
                    x2: x(item.x2)
                },
                ...void 0 === item.y2 ? null : {
                    y2: item.y2 + dy
                },
                ...mirror && void 0 !== item.rotation ? {
                    rotation: -item.rotation
                } : null,
                ...mirror && void 0 !== item.start ? {
                    start: -item.start - (item.sweep ?? 0)
                } : null,
                opacity
            });
        placers.set(placement, placer);
    }
    return placer;
}
const toLinear = (v)=>{
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
function oklch(hex) {
    const h = hex.replace('#', '');
    const full = 3 === h.length ? [
        ...h
    ].map((c)=>c + c).join('') : h.slice(0, 6);
    const [r, g, b] = [
        0,
        2,
        4
    ].map((i)=>toLinear(parseInt(full.slice(i, i + 2), 16)));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const hue = 180 * Math.atan2(B, A) / Math.PI;
    return [
        L,
        Math.hypot(A, B),
        hue < 0 ? hue + 360 : hue
    ];
}
const colour_n3 = (n)=>Math.round(1000 * n) / 1000;
function toward(from, to, step) {
    const [l, c, h] = oklch(to);
    return `oklch(from ${from} calc(l + (${colour_n3(l)} - l) * ${step}) calc(c + (${colour_n3(c)} - c) * ${step}) calc(h + (${colour_n3(h)} - h) * ${step}))`;
}
function between(origin, a, b, step) {
    const [la, ca, ha] = oklch(a);
    const [lb, cb, hb] = oklch(b);
    const dh = ((hb - ha) % 360 + 540) % 360 - 180;
    const at = (x, d)=>`calc(${colour_n3(x)} + ${colour_n3(d)} * ${step})`;
    return `oklch(from ${origin} ${at(la, lb - la)} ${at(ca, cb - ca)} ${at(ha, dh)})`;
}
function faceInk(face, ink, own) {
    if (void 0 !== own.split && own.light && own.dark && !ink.startsWith('url(')) return between(ink, own.dark, own.light, `clamp(0, (${colour_n3(own.split)} - l) * 1000, 1)`);
    let out = face;
    if (own.light) out = toward(out, own.light, 'clamp(0, (l - 0.6) * 1000, 1)');
    if (own.dark) out = toward(out, own.dark, 'clamp(0, (0.6 - l) * 1000, 1)');
    return out;
}
const lean_n3 = (n)=>Math.round(1000 * n) / 1000;
const mixPaint = (color, into, percent)=>color.startsWith('url(') ? color : `color-mix(in oklab, ${color}, ${into} ${percent}%)`;
const leanChroma = (tint, share)=>Math.round(K.chroma(tint) * Math.min(100, share) * 10) / 1000;
function held(base, floor, band) {
    const l = band ? `clamp(${lean_n3(band[0])}, l, ${lean_n3(band[1])})` : 'l';
    return `oklch(from ${base} ${l} max(c, ${lean_n3(floor)}) h / alpha)`;
}
const leans = new Map();
function leanInto(color, mood, vivid) {
    if (color.startsWith('url(')) return color;
    const own = vivid?.moods?.[mood];
    const base = K.moodLean[mood];
    const tint = own?.tint ?? base?.tint;
    if (!tint) return color;
    const key = vivid ? `${mood}|${color}|${JSON.stringify(vivid)}` : `${mood}|${color}`;
    let out = leans.get(key);
    if (void 0 !== out) return out;
    const share = Math.min(100, own?.share ?? (base?.share ?? 40) * (vivid?.share ?? 1));
    const floor = Math.max(leanChroma(tint, share), own?.chroma ?? vivid?.chroma ?? 0);
    const band = own?.lightness ?? vivid?.lightness;
    const lift = own?.lift ?? vivid?.lift;
    const [tl, tc, th] = void 0 === lift ? [
        0,
        0,
        0
    ] : oklch(tint);
    const into = void 0 === lift ? tint : `oklch(from ${color} min(${lean_n3(tl)}, calc(l + ${lean_n3(lift)})) ${lean_n3(tc)} ${lean_n3(th)})`;
    const mixed = mixPaint(color, into, Math.round(share));
    out = band && !Array.isArray(band) ? `light-dark(${held(mixed, floor, band.light)}, ${held(mixed, floor, band.dark)})` : held(mixed, floor, band);
    if (leans.size > 512) leans.clear();
    leans.set(key, out);
    return out;
}
const ZONES = {
    top: [
        -28,
        28
    ],
    'top-right': [
        22,
        72
    ],
    right: [
        62,
        118
    ],
    'bottom-right': [
        108,
        158
    ],
    bottom: [
        152,
        208
    ],
    'bottom-left': [
        202,
        252
    ],
    left: [
        242,
        298
    ],
    'top-left': [
        288,
        338
    ],
    upper: [
        -80,
        80
    ],
    lower: [
        100,
        260
    ],
    around: [
        0,
        360
    ]
};
const DECOR_MIN_PX = 64;
const DEFAULT_GAP = 6;
function decorSetKey(spec, state) {
    if (spec.states?.[state]) return `s:${state}`;
    const mood = K.moodOf(state);
    return spec.moods?.[mood] || spec.always?.length ? `m:${mood}` : null;
}
const itemsOf = (spec, key)=>[
        ...(key.startsWith('s:') ? spec.states?.[key.slice(2)] : spec.moods?.[key.slice(2)]) ?? [],
        ...spec.always ?? []
    ];
const moodOfKey = (key)=>key.startsWith('s:') ? K.moodOf(key.slice(2)) : key.slice(2);
function statesOfKey(spec, key) {
    if (key.startsWith('s:')) return [
        key.slice(2)
    ];
    const mood = key.slice(2);
    return K.states.filter((state)=>K.moodOf(state) === mood && !spec.states?.[state]);
}
const decor_placements = new WeakMap();
const RAY_STEP = 2;
function placeDecor(spec, key, shape, scale) {
    let byShape = decor_placements.get(spec);
    if (!byShape) decor_placements.set(spec, byShape = new WeakMap());
    let byKey = byShape.get(shape);
    if (!byKey) byShape.set(shape, byKey = new Map());
    const known = byKey.get(key);
    if (known) return known;
    const figure = figureOf(shape);
    const gap = spec.gap ?? DEFAULT_GAP;
    let x0 = 1 / 0;
    let y0 = 1 / 0;
    let x1 = -1 / 0;
    let y1 = -1 / 0;
    for (const [bx0, by0, bx1, by1] of figure.boxes){
        x0 = Math.min(x0, bx0);
        y0 = Math.min(y0, by0);
        x1 = Math.max(x1, bx1);
        y1 = Math.max(y1, by1);
    }
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const { center, viewBox, stateFx } = K;
    const inBox = (b)=>center + (b - center) / scale;
    const boxOf = (past)=>({
            left: inBox(viewBox.minX - past),
            top: inBox(viewBox.minY - past),
            right: inBox(viewBox.minX + viewBox.width + past),
            bottom: inBox(viewBox.minY + viewBox.height + past)
        });
    const boxes = spec.reach ? [
        boxOf(0),
        boxOf(spec.reach * viewBox.width)
    ] : [
        boxOf(0)
    ];
    let { left, top, right, bottom } = boxes[0];
    const face = shape.face;
    const taken = 'replace' === spec.fx ? [] : [
        ...new Set(statesOfKey(spec, key).flatMap((state)=>stateFx[state] ? [
                stateFx[state]
            ] : []))
    ].flatMap((kind)=>fxFootprint(shape, kind, scale));
    const fits = (x, y, r)=>{
        if (x - r < left || x + r > right || y - r < top || y + r > bottom) return false;
        const fx = (x - face.x) / (face.sx + r + gap);
        const fy = (y - face.y) / (face.sy + r + gap);
        if (fx * fx + fy * fy < 1) return false;
        for (const [tx, ty, tr] of taken)if (Math.hypot(x - tx, y - ty) < r + tr + 2) return false;
        return clearance(figure, x, y, gap + r + 1) >= gap + r;
    };
    const along = (deg, r)=>{
        const a = deg * Math.PI / 180;
        const ux = Math.sin(a);
        const uy = -Math.cos(a);
        for(let d = 0; d < 400; d += RAY_STEP){
            const x = cx + ux * d;
            const y = cy + uy * d;
            if (x < left - r || x > right + r || y < top - r || y > bottom + r) break;
            if (fits(x, y, r)) return [
                x,
                y
            ];
        }
        return null;
    };
    const out = [];
    itemsOf(spec, key).forEach((item, index)=>{
        const [a0, a1] = ZONES[item.zone];
        const count = Math.max(1, Math.round(item.count ?? 1));
        for(let k = 0; k < count; k++){
            const rand = K.random(K.hash(`${shape.id}:${key}:${index}:${k}`));
            const aim = a0 + (a1 - a0) * (k + 0.5 + (rand() - 0.5) * 0.5) / count;
            const turn = (item.turn ?? 0) + (rand() - 0.5) * 2 * (item.jitter ?? 8);
            const phase = rand();
            let spot = null;
            let size = item.size;
            for (const shrink of [
                1,
                0.75
            ]){
                size = item.size * shrink;
                const r = size / 2;
                for (const box of boxes){
                    ({ left, top, right, bottom } = box);
                    for(let step = 0; !spot && step <= 12; step++){
                        const off = (step % 2 === 1 ? 1 : -1) * Math.ceil(step / 2) * 6;
                        const deg = aim + off;
                        if (!(step > 0) || !(deg < a0) && !(deg > a1)) spot = along(deg, r);
                    }
                    if (spot) break;
                }
                if (spot) break;
            }
            if (spot) {
                out.push({
                    item,
                    x: spot[0],
                    y: spot[1],
                    size,
                    turn,
                    phase
                });
                taken.push([
                    spot[0],
                    spot[1],
                    size / 2
                ]);
            }
        }
    });
    byKey.set(key, out);
    return out;
}
const n2 = (v)=>Math.round(100 * v) / 100;
function toneOf(tone, paints, mood) {
    if ('object' == typeof tone) return paints.partColor(tone.color).fill;
    switch(tone){
        case 'ink':
            return paints.ink;
        case 'accent':
            return leanInto(paints.ink, mood, paints.vivid);
        case 'fx':
            return paints.fx;
        case 'page':
            return paints.page;
        case 'contrast':
            return paints.contrast;
    }
}
function decorColor(paint, paints, mood) {
    if ('string' == typeof paint || 'color' in paint) return toneOf(paint, paints, mood);
    let base = toneOf(paint.from, paints, mood);
    if (paint.mix) base = `color-mix(in oklab, ${base}, ${toneOf(paint.mix.with, paints, mood)} ${n2(paint.mix.share)}%)`;
    if (void 0 === paint.hue && void 0 === paint.chroma && void 0 === paint.lightness) return base;
    const l = paint.lightness ? `clamp(${paint.lightness[0]}, l, ${paint.lightness[1]})` : 'l';
    const c = void 0 === paint.chroma ? 'c' : `max(c, ${paint.chroma})`;
    const h = paint.hue ? `calc(h + ${paint.hue})` : 'h';
    return `oklch(from ${base} ${l} ${c} ${h} / alpha)`;
}
function decorStops(animation, size) {
    const a = animation.amplitude;
    switch(animation.kind){
        case 'drift':
        case 'float':
            {
                const lift = n2(a ?? 0.18 * size);
                return [
                    {
                        at: 0,
                        transform: 'translate(0px,0px)'
                    },
                    {
                        at: 0.5,
                        transform: `translate(0px,${-lift}px)`
                    },
                    {
                        at: 1,
                        transform: 'translate(0px,0px)'
                    }
                ];
            }
        case 'twinkle':
            {
                const spread = a ?? 0.36;
                const low = `scale(${n2(1 - 0.78 * spread)})`;
                return [
                    {
                        at: 0,
                        transform: low,
                        opacity: 0.6
                    },
                    {
                        at: 0.5,
                        transform: `scale(${n2(1 + 0.22 * spread)})`,
                        opacity: 1
                    },
                    {
                        at: 1,
                        transform: low,
                        opacity: 0.6
                    }
                ];
            }
        case 'rise':
            {
                const lift = a ?? 0.36 * size;
                return [
                    {
                        at: 0,
                        transform: `translate(${n2(0.1 * -size)}px,${n2(0.2 * size)}px) scale(0.8)`,
                        opacity: 0
                    },
                    {
                        at: 0.25,
                        opacity: 1
                    },
                    {
                        at: 1,
                        transform: `translate(${n2(0.18 * size)}px,${n2(-lift)}px) scale(1.05)`,
                        opacity: 0
                    }
                ];
            }
        case 'pop':
        case 'throb':
            {
                const grow = a ?? 0.16;
                return [
                    {
                        at: 0,
                        transform: 'scale(0.9)'
                    },
                    {
                        at: 0.3,
                        transform: `scale(${n2(1 + grow)})`
                    },
                    {
                        at: 1,
                        transform: 'scale(0.9)'
                    }
                ];
            }
        case 'spin':
            return [
                {
                    at: 0,
                    transform: 'rotate(0deg)'
                },
                {
                    at: 1,
                    transform: `rotate(${a ?? 360}deg)`
                }
            ];
        case 'sway':
        case 'wiggle':
            {
                const turn = a ?? 8;
                return [
                    {
                        at: 0,
                        transform: `rotate(${-turn}deg)`
                    },
                    {
                        at: 0.5,
                        transform: `rotate(${turn}deg)`
                    },
                    {
                        at: 1,
                        transform: `rotate(${-turn}deg)`
                    }
                ];
            }
        case 'bob':
            {
                const lift = n2(a ?? 0.12 * size);
                return [
                    {
                        at: 0,
                        transform: 'translate(0px,0px) rotate(0deg)'
                    },
                    {
                        at: 0.5,
                        transform: `translate(0px,${-lift}px) rotate(-10deg)`
                    },
                    {
                        at: 1,
                        transform: 'translate(0px,0px) rotate(0deg)'
                    }
                ];
            }
        case 'flick':
            {
                const dip = a ?? 0.18;
                return [
                    {
                        at: 0,
                        transform: 'scale(1)',
                        opacity: 1
                    },
                    {
                        at: 0.45,
                        transform: `scale(${n2(1 - dip)})`,
                        opacity: 0.55
                    },
                    {
                        at: 1,
                        transform: 'scale(1)',
                        opacity: 1
                    }
                ];
            }
    }
}
const PERIOD = {
    drift: 3.2,
    float: 3.2,
    twinkle: 2.2,
    rise: 3,
    pop: 0.9,
    throb: 0.9,
    spin: 9,
    sway: 1.6,
    wiggle: 1.6,
    bob: 2.4,
    flick: 1.4
};
const EASING = {
    drift: 'sine',
    float: 'sine',
    twinkle: 'sine',
    rise: 'ease-out',
    pop: 'sine',
    throb: 'sine',
    spin: 'linear',
    sway: 'sine',
    wiggle: 'sine',
    bob: 'sine',
    flick: 'sine'
};
function decorNode(placed, glyph, color, moving, rules, shift) {
    const box = glyph.box ?? 24;
    const k = placed.size / box;
    const layers = glyph.layers.map((layer)=>{
        const paint = color(layer.paint ?? placed.item.paint);
        return K.node('path', layer.stroke ? {
            d: layer.d,
            stroke: paint,
            'stroke-width': layer.stroke,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            opacity: layer.opacity
        } : {
            d: layer.d,
            fill: paint,
            opacity: layer.opacity
        });
    });
    const where = `translate(${n2(placed.x)} ${n2(placed.y)}) rotate(${n2(placed.turn)})`;
    const fit = `scale(${n2(k)}) translate(${-box / 2} ${-box / 2})`;
    const animation = placed.item.animation;
    const { node } = K;
    if (!moving || !animation) return node('g', {
        transform: `${where} ${fit}`
    }, layers);
    const played = compile(decorStops(animation, placed.size), animation.period ?? PERIOD[animation.kind], placed.phase + shift, animation.easing ?? EASING[animation.kind]);
    rules.add(played.rule);
    return node('g', {
        transform: where
    }, [
        node('g', animatedAttrs(played), [
            node('g', {
                transform: fit
            }, layers)
        ])
    ]);
}
function decorNodes(spec, key, shape, scale, paints, moving, rules, shift = 0) {
    const mood = moodOfKey(key);
    const colors = new Map();
    const color = (paint)=>{
        let css = colors.get(paint);
        if (void 0 === css) colors.set(paint, css = decorColor(paint, paints, mood));
        return css;
    };
    return placeDecor(spec, key, shape, scale).flatMap((placed)=>{
        const glyph = spec.glyphs[placed.item.glyph];
        return glyph ? [
            decorNode(placed, glyph, color, moving, rules, shift)
        ] : [];
    });
}
const decorShown = (spec, sizePx)=>!(sizePx > 0) || sizePx >= (spec.minPx ?? DECOR_MIN_PX);
const decorFade = ()=>`transition:opacity ${K.moodEaseMs}ms ease`;
const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const FILL = 'position:absolute;inset:0;width:100%;height:100%';
const stage_n3 = (v)=>Math.round(1000 * v) / 1000;
const MARK = 'data-aora-motion';
const stage_sheets = new WeakMap();
function sheetFor(root) {
    let sheet = stage_sheets.get(root);
    if (sheet?.style.isConnected) return sheet;
    const doc = root.ownerDocument ?? root;
    const parent = "u" > typeof ShadowRoot && root instanceof ShadowRoot ? root : doc.head ?? doc.documentElement;
    if (!parent) return null;
    const style = doc.createElement('style');
    style.setAttribute(MARK, '');
    parent.appendChild(style);
    sheet = {
        style,
        rules: new Set()
    };
    stage_sheets.set(root, sheet);
    return sheet;
}
function shareRules(element, rules) {
    if (0 === rules.length || !element.isConnected) return;
    const sheet = sheetFor(element.getRootNode());
    if (!sheet) return;
    let added = '';
    for (const rule of rules)if (!sheet.rules.has(rule)) {
        sheet.rules.add(rule);
        added += rule;
    }
    if (added) sheet.style.appendChild(sheet.style.ownerDocument.createTextNode(added));
}
const BOX = 'position:absolute;left:0;top:0;transform-origin:0 0';
const DRAWING = 'position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible';
const LIFTS = new Set([
    'transform',
    'opacity',
    'style',
    'class'
]);
function cssTransform(svg) {
    let out = '';
    for (const [, name, args] of svg.matchAll(/(\w+)\(([^)]*)\)/g)){
        const v = args.trim().split(/[\s,]+/).map(Number);
        let css;
        switch(name){
            case 'translate':
                css = `translate(${stage_n3(v[0])}px,${stage_n3(v[1] ?? 0)}px)`;
                break;
            case 'rotate':
                css = v.length >= 3 ? `translate(${stage_n3(v[1])}px,${stage_n3(v[2])}px) rotate(${stage_n3(v[0])}deg) translate(${stage_n3(-v[1])}px,${stage_n3(-v[2])}px)` : `rotate(${stage_n3(v[0])}deg)`;
                break;
            case 'scale':
                css = `scale(${stage_n3(v[0])},${stage_n3(v[1] ?? v[0])})`;
                break;
            case 'skewX':
            case 'skewY':
                css = `${name}(${stage_n3(v[0])}deg)`;
                break;
            case 'matrix':
                css = `matrix(${v.map(stage_n3).join(',')})`;
                break;
            default:
                css = '';
        }
        out += out && css ? ` ${css}` : css;
    }
    return out;
}
const playing = new WeakMap();
function plays(n) {
    let found = playing.get(n);
    if (void 0 === found) {
        const style = n.attrs?.style;
        found = 'string' == typeof style && (style.includes('animation:') || style.includes('transition:')) || (n.children?.some(plays) ?? false);
        playing.set(n, found);
    }
    return found;
}
const liftable = (n)=>'g' === n.tag && Object.keys(n.attrs ?? {}).every((key)=>LIFTS.has(key) || key.startsWith('data-'));
function stage_boxOf(group, before = '') {
    const attrs = group.attrs ?? {};
    const style = [
        BOX
    ];
    const transform = void 0 === attrs.transform ? '' : cssTransform(String(attrs.transform));
    if (before || transform) style.push(`transform:${[
        before,
        transform
    ].filter(Boolean).join(' ')}`);
    if (void 0 !== attrs.opacity) style.push(`opacity:${attrs.opacity}`);
    if (void 0 !== attrs.style) style.push(String(attrs.style));
    const own = {
        style: style.join(';')
    };
    for (const [key, value] of Object.entries(attrs))if ('class' === key || key.startsWith('data-')) own[key] = value;
    return K.node('div', own, boxed(group.children ?? []));
}
function boxed(children) {
    const out = [];
    let still = [];
    const draw = ()=>{
        if (still.length > 0) out.push(K.node('svg', {
            style: DRAWING
        }, still));
        still = [];
    };
    for (const child of children)if (plays(child) && liftable(child)) {
        draw();
        out.push(stage_boxOf(child));
    } else still.push(child);
    draw();
    return out;
}
const lifted = new WeakMap();
function inBoxes(group, scale = 1) {
    let found = lifted.get(group);
    if (found?.scale !== scale) {
        const shift = `translate(${-K.viewBox.minX}px,${-K.viewBox.minY}px)`;
        found = {
            scale,
            node: stage_boxOf(group, 1 === scale ? shift : `scale(${scale}) ${shift}`)
        };
        lifted.set(group, found);
    }
    return found.node;
}
function stage_layer(doc, name, style) {
    const { minX, minY, width, height } = K.viewBox;
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('style', style);
    svg.setAttribute('data-aora-layer', name);
    const root = doc.createElementNS(SVG_NS, 'g');
    svg.appendChild(root);
    return {
        svg,
        root
    };
}
function createStack(doc, scale) {
    const { minX, minY, width } = K.viewBox;
    const side = width * scale;
    const object = doc.createElementNS(SVG_NS, 'foreignObject');
    object.setAttribute('width', String(side));
    object.setAttribute('height', String(side));
    object.setAttribute('transform', 1 === scale ? `translate(${minX} ${minY})` : `translate(${minX} ${minY}) scale(${width / side})`);
    object.setAttribute('style', 'overflow:visible');
    const box = (style, name)=>{
        const div = doc.createElementNS(XHTML_NS, 'div');
        div.setAttribute('style', style);
        if (name) div.setAttribute('data-aora-layer', name);
        return div;
    };
    const frame = box(`position:relative;width:${side}px;height:${side}px`);
    const body = box(`${FILL};transform-origin:50% 50%;will-change:transform`, 'body');
    const figure = box(FILL);
    const plain = `${FILL};overflow:visible`;
    const stack = {
        object,
        frame,
        scale,
        body,
        boxes: [
            figure
        ],
        below: box(FILL, 'below'),
        skin: stage_layer(doc, 'skin', `${plain};will-change:transform`),
        above: box(FILL, 'above'),
        face: stage_layer(doc, 'face', plain),
        streams: box(FILL, 'streams'),
        front: stage_layer(doc, 'front', plain),
        decor: box(FILL, 'decor'),
        transform: '',
        figure: []
    };
    figure.append(stack.below, stack.skin.svg, stack.above, stack.face.svg);
    body.append(figure, stack.streams);
    frame.append(body, stack.front.svg, stack.decor);
    object.appendChild(frame);
    return stack;
}
function bodyTransform(frame) {
    const b = frame.body;
    const share = 100 * frame.shapeScale / K.viewBox.width;
    return `translate(${stage_n3(b.x * share)}%,${stage_n3(b.y * share)}%) rotate(${stage_n3(b.rotation)}deg) scale(${stage_n3(b.scaleX)},${stage_n3(b.scaleY)})`;
}
function playFigure(stack, wanted) {
    const { boxes } = stack;
    while(boxes.length < wanted.length){
        const inner = boxes[boxes.length - 1];
        const next = inner.ownerDocument.createElementNS(XHTML_NS, 'div');
        next.setAttribute('style', FILL);
        next.append(...Array.from(inner.childNodes));
        inner.appendChild(next);
        boxes.push(next);
    }
    for(let i = 0; i < boxes.length; i++){
        const wrap = wanted[i];
        if (stack.figure[i] === wrap) continue;
        stack.figure[i] = wrap;
        const box = boxes[i];
        if (wrap) {
            box.setAttribute('class', wrap.class);
            box.setAttribute('style', `${FILL};${wrap.style}`);
        } else {
            box.removeAttribute('class');
            box.setAttribute('style', FILL);
        }
    }
}
function createStage(svg) {
    let stack = null;
    return {
        draw (frame, layers, shownPx) {
            const scale = shownPx > 0 ? shownPx / K.viewBox.width : 1;
            if (stack && stack.scale !== scale) {
                stack.object.remove();
                stack = null;
            }
            stack ??= createStack(svg.ownerDocument, scale);
            const s = stack;
            if (s.object.parentNode !== svg) svg.appendChild(s.object);
            K.sync(s.below, inBoxes(layers.below, scale));
            K.sync(s.skin.root, layers.skin);
            K.sync(s.above, inBoxes(layers.above, scale));
            K.sync(s.face.root, layers.face);
            K.sync(s.streams, inBoxes(layers.streams, scale));
            K.sync(s.front.root, layers.front);
            K.sync(s.decor, inBoxes(layers.decor, scale));
            playFigure(s, layers.figure);
            const transform = bodyTransform(frame);
            if (transform !== s.transform) {
                s.transform = transform;
                s.body.style.transform = transform;
            }
        },
        remove () {
            stack?.object.remove();
        },
        get shown () {
            return stack?.object.parentNode === svg;
        }
    };
}
function motion_boxOf(outlines) {
    let x0 = 1 / 0;
    let y0 = 1 / 0;
    let x1 = -1 / 0;
    let y1 = -1 / 0;
    for (const outline of outlines)for (const [x, y] of outline){
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
    }
    return [
        x0,
        y0,
        x1,
        y1
    ];
}
const motion_anchors = new WeakMap();
function partAnchor(shape, part, ref) {
    let anchor = motion_anchors.get(ref);
    if (!anchor) {
        const same = shape.parts.filter((p)=>p.motion?.id === ref.id).map((p)=>p.outline);
        anchor = {
            ...ref,
            box: motion_boxOf(same.length > 0 ? same : [
                part.outline
            ])
        };
        motion_anchors.set(ref, anchor);
    }
    return anchor;
}
function figureAnchor(shape, ref) {
    let anchor = motion_anchors.get(ref);
    if (!anchor) {
        anchor = {
            ...ref,
            box: motion_boxOf([
                shape.outline,
                ...shape.parts.map((p)=>p.outline)
            ])
        };
        motion_anchors.set(ref, anchor);
    }
    return anchor;
}
function gateOpen(when, state, mood) {
    if (!when) return true;
    if (when.except?.states?.includes(state) || when.except?.moods?.includes(mood)) return false;
    if (!when.states && !when.moods) return true;
    return !!when.states?.includes(state) || !!when.moods?.includes(mood);
}
const motion_n3 = (v)=>Math.round(1000 * v) / 1000;
function pivotOf(anchor, motion) {
    if (anchor.pivot) return anchor.pivot;
    const [ox, oy] = motion.origin ?? [
        0.5,
        0.5
    ];
    const [x0, y0, x1, y1] = anchor.box;
    return [
        x0 + (x1 - x0) * ox,
        y0 + (y1 - y0) * oy
    ];
}
const inShape = (anchor, [x, y])=>[
        anchor.offset[0] + x * anchor.unit,
        anchor.offset[1] + y * anchor.unit
    ];
function waveStops(wave, duty, beats, settleBack) {
    switch(wave){
        case 'swing':
            return [
                [
                    0,
                    -1
                ],
                [
                    0.5,
                    1
                ],
                [
                    1,
                    -1
                ]
            ];
        case 'bob':
            return [
                [
                    0,
                    0
                ],
                [
                    0.5,
                    1
                ],
                [
                    1,
                    0
                ]
            ];
        case 'loop':
            return [
                [
                    0,
                    0
                ],
                [
                    1,
                    1
                ]
            ];
        case 'pulse':
            {
                const out = [
                    [
                        0,
                        0
                    ]
                ];
                const n = Math.max(1, Math.round(beats));
                for(let k = 1; k < 2 * n; k++)out.push([
                    k * duty / (2 * n),
                    k % 2 === 1 ? 1 : settleBack
                ]);
                out.push([
                    duty,
                    0
                ], [
                    1,
                    0
                ]);
                return out;
            }
    }
}
const SHAPE_SPACE = {
    point: (p)=>p,
    length: (d)=>d,
    unit: 'px'
};
function boxSpace(scale) {
    const { center, viewBox } = K;
    const share = 100 / viewBox.width;
    return {
        point: ([x, y])=>[
                (center + (x - center) * scale - viewBox.minX) * share,
                (center + (y - center) * scale - viewBox.minY) * share
            ],
        length: (d)=>d * scale * share,
        unit: '%'
    };
}
function swingStops(motion, anchor, space) {
    const wave = motion.wave ?? ('rotate' === motion.kind ? 'swing' : 'bob');
    const [ax, ay] = 'number' == typeof motion.amplitude ? [
        motion.amplitude,
        motion.amplitude
    ] : motion.amplitude;
    const [px, py] = space.point(pivotOf(anchor, motion));
    const { unit } = space;
    const back = 'rotate' === motion.kind ? -0.2 : 0;
    return waveStops(wave, motion.duty ?? 0.3, motion.beats ?? 1, back).map(([at, v])=>{
        switch(motion.kind){
            case 'rotate':
                return {
                    at,
                    transform: about(px, py, `rotate(${motion_n3(v * ax)}deg)`, unit)
                };
            case 'translate':
                return {
                    at,
                    transform: `translate(${motion_n3(space.length(v * ax * anchor.unit))}${unit},${motion_n3(space.length(v * ay * anchor.unit))}${unit})`
                };
            case 'scale':
                return {
                    at,
                    transform: about(px, py, `scale(${motion_n3(1 + v * ax)},${motion_n3(1 + v * ay)})`, unit)
                };
            case 'blink':
                {
                    const share = 'swing' === wave ? (v + 1) / 2 : v;
                    return {
                        at,
                        opacity: Math.min(1, Math.max(0, 1 - share * ax))
                    };
                }
        }
    });
}
function keyStops(motion, anchor, space) {
    const [px, py] = space.point(pivotOf(anchor, motion));
    const { unit } = space;
    return motion.keys.map((key)=>{
        const moves = void 0 !== key.translate || void 0 !== key.rotate || void 0 !== key.skew || void 0 !== key.scale;
        const [tx, ty] = key.translate ?? [
            0,
            0
        ];
        const [kx, ky] = key.skew ?? [
            0,
            0
        ];
        const [sx, sy] = 'number' == typeof key.scale ? [
            key.scale,
            key.scale
        ] : key.scale ?? [
            1,
            1
        ];
        return {
            at: key.at,
            transform: moves ? `translate(${motion_n3(space.length(tx * anchor.unit))}${unit},${motion_n3(space.length(ty * anchor.unit))}${unit}) ${about(px, py, `rotate(${motion_n3(key.rotate ?? 0)}deg) skew(${motion_n3(kx)}deg,${motion_n3(ky)}deg) scale(${motion_n3(sx)},${motion_n3(sy)})`, unit)}` : void 0,
            opacity: key.opacity
        };
    });
}
function emitStops(motion, origin, start, unit) {
    const [sx, sy] = start;
    const tx = motion.travel[0] * unit;
    const ty = motion.travel[1] * unit;
    const from = motion.from ?? 1;
    const grow = motion.grow ?? 1;
    const turn = motion.turn ?? 0;
    const [fadeIn, fadeOut] = motion.fade ?? [
        0.15,
        0.15
    ];
    const at = (k, opacity)=>({
            at: k,
            transform: `translate(${motion_n3(sx + tx * k)}px,${motion_n3(sy + ty * k)}px) ${about(origin[0], origin[1], `rotate(${motion_n3(turn * k)}deg) scale(${motion_n3(from + (grow - from) * k)})`)}`,
            opacity
        });
    return [
        at(0, 0),
        at(fadeIn, 1),
        at(1 - fadeOut, 1),
        at(1, 0)
    ];
}
const plans = new WeakMap();
function planFor(shape, motion, anchor, seed, shift, glyphs, boxScale) {
    let byMotion = plans.get(anchor);
    if (!byMotion) plans.set(anchor, byMotion = new Map());
    let byShift = byMotion.get(motion);
    if (!byShift) byMotion.set(motion, byShift = new Map());
    const key = void 0 === boxScale ? `${shift}` : `${shift}|${boxScale}`;
    let plan = byShift.get(key);
    if (plan) return plan;
    const space = void 0 === boxScale ? SHAPE_SPACE : boxSpace(boxScale);
    const phase = (motion.phase ?? 0) + shift;
    let animations;
    let glyph = null;
    if ('emit' === motion.kind) {
        const rand = K.random(K.hash(`${shape}:${seed}`));
        const count = Math.max(1, Math.round(motion.count));
        const [w, h] = 'number' == typeof motion.spread ? [
            motion.spread,
            0
        ] : motion.spread ?? [
            0,
            0
        ];
        const origin = motion.at ? inShape(anchor, motion.at) : pivotOf(anchor, motion);
        const named = 'string' == typeof motion.glyph ? glyphs[motion.glyph] : motion.glyph;
        if (named) glyph = {
            glyph: named,
            at: origin,
            size: (motion.size ?? 8) * anchor.unit,
            paint: motion.paint ?? 'ink'
        };
        animations = Array.from({
            length: count
        }, (_, k)=>{
            const start = [
                (rand() - 0.5) * w * anchor.unit,
                (rand() - 0.5) * h * anchor.unit
            ];
            const period = motion.period * (1 + (rand() - 0.5) * (motion.vary ?? 0));
            return compile(emitStops(motion, origin, start, anchor.unit), period, phase + k / count, motion.easing ?? 'linear');
        });
    } else {
        const stops = 'keys' === motion.kind ? keyStops(motion, anchor, space) : swingStops(motion, anchor, space);
        animations = [
            compile(stops, motion.period, phase, motion.easing ?? 'sine')
        ];
    }
    plan = {
        wraps: animations.map(animatedAttrs),
        rules: animations.map((a)=>a.rule),
        keep: 'emit' !== motion.kind || true !== motion.replace,
        glyph
    };
    byShift.set(key, plan);
    return plan;
}
const f2 = (v)=>Math.round(100 * v) / 100;
function glyphNodes(plan, scene) {
    const box = plan.glyph.box ?? 24;
    const k = plan.size / box;
    const { node } = K;
    return [
        node('g', {
            transform: `translate(${f2(plan.at[0])} ${f2(plan.at[1])}) scale(${f2(k)}) translate(${-box / 2} ${-box / 2})`
        }, plan.glyph.layers.map((layer)=>{
            const paint = scene.color(layer.paint ?? plan.paint);
            return node('path', layer.stroke ? {
                d: layer.d,
                stroke: paint,
                'stroke-width': layer.stroke,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                opacity: layer.opacity
            } : {
                d: layer.d,
                fill: paint,
                opacity: layer.opacity
            });
        }))
    ];
}
function play(shape, motions, ids, anchor, nodes, scene, whole = false) {
    const { node } = K;
    let out = nodes;
    const streams = [];
    let keep = true;
    for (const id of ids){
        const motion = motions.table[id];
        if (!motion || !gateOpen(motion.when, scene.state, scene.mood)) continue;
        const plan = planFor(shape.id, motion, anchor, id, scene.shift, motions.glyphs);
        for (const rule of plan.rules)scene.rules.add(rule);
        if ('emit' !== motion.kind) {
            out = [
                node('g', plan.wraps[0], out)
            ];
            continue;
        }
        if (whole && !plan.glyph) continue;
        const copy = plan.glyph ? glyphNodes(plan.glyph, scene) : nodes;
        for (const attrs of plan.wraps)streams.push(node('g', attrs, copy));
        keep &&= whole || plan.keep;
    }
    if (0 === streams.length) return out;
    return keep ? [
        ...out,
        ...streams
    ] : streams;
}
function moved(shape, motions, part, nodes, scene) {
    const ref = part.motion;
    if (!ref || !motions || !scene.live || scene.settled || 0 === nodes.length) return nodes;
    return play(shape, motions, [
        ref.id
    ], partAnchor(shape, part, ref), nodes, scene);
}
const boxAnchors = new WeakMap();
function movedBy(shape, motions, id, nodes, scene) {
    if (!motions?.table[id] || !scene.live || scene.settled || 0 === nodes.length) return nodes;
    let anchor = boxAnchors.get(shape);
    if (!anchor) {
        anchor = {
            box: motion_boxOf([
                shape.outline,
                ...shape.parts.map((p)=>p.outline)
            ]),
            unit: shape.motion?.unit ?? 1,
            offset: shape.motion?.offset ?? [
                0,
                0
            ]
        };
        boxAnchors.set(shape, anchor);
    }
    return play(shape, motions, [
        id
    ], anchor, nodes, scene);
}
function movedFigure(shape, motions, nodes, scene) {
    const ref = shape.motion;
    if (!ref || !motions || !scene.live || scene.settled) return nodes;
    return play(shape, motions, ref.ids, figureAnchor(shape, ref), nodes, scene, true);
}
const streamsKept = new WeakMap();
function streamOf(plan, scene) {
    const glyph = plan.glyph;
    const colors = glyph.glyph.layers.map((layer)=>scene.color(layer.paint ?? glyph.paint)).join('|');
    const kept = streamsKept.get(plan);
    if (kept?.colors === colors) return kept.nodes;
    const copy = glyphNodes(glyph, scene);
    const nodes = plan.wraps.map((attrs)=>K.node('g', attrs, copy));
    streamsKept.set(plan, {
        colors,
        nodes
    });
    return nodes;
}
const NO_BOX = {
    wraps: [],
    streams: []
};
function movedFigureBox(shape, motions, scale, scene) {
    const ref = shape.motion;
    if (!ref || !motions || !scene.live || scene.settled) return NO_BOX;
    const anchor = figureAnchor(shape, ref);
    const wraps = [];
    const streams = [];
    for (const id of ref.ids){
        const motion = motions.table[id];
        if (!motion || !gateOpen(motion.when, scene.state, scene.mood)) continue;
        const box = 'emit' === motion.kind ? void 0 : scale;
        const plan = planFor(shape.id, motion, anchor, id, scene.shift, motions.glyphs, box);
        for (const rule of plan.rules)scene.rules.add(rule);
        if ('emit' !== motion.kind) {
            wraps.push(plan.wraps[0]);
            continue;
        }
        if (plan.glyph) streams.push(...streamOf(plan, scene));
    }
    wraps.reverse();
    return 0 === wraps.length && 0 === streams.length ? NO_BOX : {
        wraps,
        streams
    };
}
function check(theme) {
    const id = theme.definition.id;
    const decor = theme.decor;
    const motions = theme.motions;
    for (const spec of [
        decor,
        ...theme.variants.map((skin)=>skin.decor)
    ]){
        if (!spec) continue;
        const sets = [
            ...Object.values(spec.moods ?? {}),
            ...Object.values(spec.states ?? {}),
            spec.always ?? []
        ];
        const missing = sets.flat().find((item)=>item && !spec.glyphs[item.glyph]);
        if (missing) throw new Error(`Theme "${id}": a decoration names the glyph "${missing.glyph}", which it does not draw`);
    }
    for (const [shape, entry] of Object.entries(theme.art)){
        const art = entry;
        const named = [
            ...(art.props ?? art.parts ?? []).flatMap((part)=>part.motion ? [
                    part.motion
                ] : []),
            ...'string' == typeof art.motion ? [
                art.motion
            ] : art.motion ?? []
        ];
        const unknown = named.find((motion)=>!motions?.[motion]);
        if (unknown) throw new Error(`Theme "${id}": ${shape} names the motion "${unknown}", which the theme does not declare`);
    }
    for (const [name, motion] of Object.entries(motions ?? {}))if ('emit' === motion.kind && 'string' == typeof motion.glyph && !decor?.glyphs[motion.glyph]) throw new Error(`Theme "${id}": the motion "${name}" emits the glyph "${motion.glyph}", which its decor does not draw`);
}
let emptyLayer = null;
const NO_NODES = [];
const NO_RULES = [];
function createScene(live, phaseSeed, registry) {
    const rules = new Set();
    let frame;
    let shape;
    let paints;
    let spec;
    let setKey = null;
    let moving = false;
    let framePaints = null;
    let styled = false;
    const decorPaints = ()=>framePaints ??= {
            ...paints(),
            vivid: registry.vivid.get(frame.variant)
        };
    const motion = {
        live,
        settled: false,
        state: 'idle',
        mood: 'calm',
        rules,
        color: (paint)=>decorColor(paint, decorPaints(), motion.mood),
        shift: phaseSeed ? K.hash(phaseSeed) % 20 / 20 : 0
    };
    const slots = [
        null,
        null
    ];
    let showing = 0;
    let changedAt = 0;
    const cache = new Map();
    const wanted = {
        key: null,
        set: null,
        variant: '',
        shape: '',
        ink: null,
        moving: false
    };
    const layer = {
        node: null,
        showing: 0,
        a: null,
        b: null,
        opacity: 1
    };
    const nodesFor = (key)=>{
        if (null === key || !spec) return NO_NODES;
        let entry = cache.get(key);
        if (!entry) {
            const played = new Set();
            const setId = key.slice(key.lastIndexOf('|') + 1);
            const nodes = decorNodes(spec, setId, shape, frame.shapeScale, decorPaints(), moving, played, motion.shift);
            if (cache.size > 24) cache.clear();
            entry = {
                nodes,
                rules: [
                    ...played
                ]
            };
            cache.set(key, entry);
        }
        for (const rule of entry.rules)rules.add(rule);
        return entry.nodes;
    };
    return {
        begin (next, nextShape, nextPaints, sizePx) {
            rules.clear();
            frame = next;
            shape = nextShape;
            paints = nextPaints;
            framePaints = null;
            motion.state = next.state;
            motion.mood = K.moodOf(next.state);
            motion.settled = true === next.settled;
            moving = live && !next.settled;
            spec = registry.decors.get(next.variant);
            setKey = spec && decorShown(spec, sizePx) ? decorSetKey(spec, next.state) : null;
        },
        part: (part, nodes)=>moved(shape, registry.motions.get(shape.id), part, nodes, motion),
        play: (id, nodes)=>movedBy(shape, registry.motions.get(shape.id), id, nodes, motion),
        figure: (nodes)=>movedFigure(shape, registry.motions.get(shape.id), nodes, motion),
        figureBox: ()=>movedFigureBox(shape, registry.motions.get(shape.id), frame.shapeScale, motion),
        get quiet () {
            return null !== setKey && spec?.fx === 'replace';
        },
        decor () {
            const { node } = K;
            if (!live && null === setKey) return null;
            if (live && null === setKey && null === slots[0] && null === slots[1]) return emptyLayer ??= node('g', {
                'data-aora-decor': ''
            }, []);
            const fade = (1 - (frame.belt?.blend ?? 0)) * (1 - frame.hud.opacity);
            const alpha = Math.round(100 * fade) / 100;
            if (!live) return node('g', {
                'data-aora-decor': '',
                opacity: fade < 0.999 ? alpha : void 0
            }, nodesFor(setKey));
            if (wanted.set !== setKey || wanted.variant !== frame.variant || wanted.shape !== frame.shape || wanted.ink !== frame.ink || wanted.moving !== moving) {
                const own = frame.ink;
                const inkKey = own ? 'flat' in own ? own.flat : `${own.from}>${own.to}` : '';
                wanted.key = spec && null !== setKey ? `${frame.variant}|${frame.shape}|${inkKey}|${moving ? 1 : 0}|${setKey}` : null;
                Object.assign(wanted, {
                    set: setKey,
                    variant: frame.variant,
                    shape: frame.shape,
                    ink: frame.ink,
                    moving
                });
            }
            const want = wanted.key;
            if (want !== slots[showing]) {
                if (null !== slots[showing]) {
                    showing = 1 - showing;
                    changedAt = frame.time;
                }
                slots[showing] = want;
            }
            const other = 1 - showing;
            if (null !== slots[other] && frame.time - changedAt > K.moodEaseMs / 1000 + 0.05) slots[other] = null;
            if (layer.node && layer.showing === showing && layer.a === slots[0] && layer.b === slots[1] && layer.opacity === alpha) {
                nodesFor(slots[0]);
                nodesFor(slots[1]);
                return layer.node;
            }
            const fadeStyle = decorFade();
            layer.node = node('g', {
                'data-aora-decor': '',
                opacity: alpha,
                style: 'pointer-events:none'
            }, [
                node('g', {
                    opacity: 0 === showing ? 1 : 0,
                    style: fadeStyle
                }, nodesFor(slots[0])),
                node('g', {
                    opacity: 1 === showing ? 1 : 0,
                    style: fadeStyle
                }, nodesFor(slots[1]))
            ]);
            Object.assign(layer, {
                showing,
                a: slots[0],
                b: slots[1],
                opacity: alpha
            });
            return layer.node;
        },
        style () {
            if (!live || 0 === rules.size && !styled) return null;
            styled = true;
            return styleNode(rules) ?? K.node('style', void 0, void 0, {
                text: ''
            });
        },
        rules () {
            if (!live || 0 === rules.size) return NO_RULES;
            return [
                ...BASE_RULES,
                ...rules
            ];
        }
    };
}
function createExtras() {
    const registry = {
        decors: new Map(),
        vivid: new Map(),
        motions: new Map(),
        shapes: new Set()
    };
    return {
        register (given) {
            const theme = given;
            check(theme);
            const decor = theme.decor;
            for (const skin of theme.variants){
                const spec = void 0 === skin.decor ? decor : skin.decor;
                if (spec) registry.decors.set(skin.variant, spec);
                else registry.decors.delete(skin.variant);
                registry.vivid.set(skin.variant, skin.medium?.moodAccent);
            }
            const table = theme.motions;
            for (const shape of Object.keys(theme.art)){
                registry.shapes.add(shape);
                if (table) registry.motions.set(shape, {
                    table,
                    glyphs: decor?.glyphs ?? {}
                });
            }
        },
        scene: (live, phaseSeed)=>createScene(live, phaseSeed, registry),
        decorates: (variant)=>registry.decors.has(variant),
        bleeds: (variant)=>(registry.decors.get(variant)?.reach ?? 0) > 0,
        lean: leanInto,
        placeFx (shape, kind, scale) {
            if (!registry.shapes.has(shape.id)) return null;
            const placement = fxPlacement(shape, kind, scale);
            return asLaid(placement) ? null : placerOf(placement);
        },
        faceInk: faceInk,
        stage: createStage,
        share: shareRules
    };
}
const EXTRAS = (kit)=>{
    useKit(kit);
    return createExtras();
};

globalThis.AoraThemeExtras = {DECOR_MIN_PX, EXTRAS};
})();
