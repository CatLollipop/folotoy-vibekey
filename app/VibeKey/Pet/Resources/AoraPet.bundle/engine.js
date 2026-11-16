var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports, definition)=>{
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports)=>{
        if ("u" > typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };
})();
var generators_namespaceObject = {};
__webpack_require__.r(generators_namespaceObject);
__webpack_require__.d(generators_namespaceObject, {
    circleUnion: ()=>circleUnion,
    fourierSmooth: ()=>fourierSmooth,
    resampleClosed: ()=>resampleClosed,
    roundedPolygon: ()=>roundedPolygon,
    superellipse: ()=>superellipse
});
const CHRISTMAS = [
    'xm-tree',
    'xm-snowman',
    'xm-ginger',
    'xm-deer',
    'xm-stocking',
    'xm-cane',
    'xm-globe',
    'xm-santa',
    'xm-cocoa',
    'xm-bauble',
    'xm-mochi-hat',
    'xm-chirp-hat',
    'xm-waddle-scarf',
    'xm-miso-antlers',
    'xm-kiki-muffs',
    'xm-pokey-mittens',
    'xm-pud-holly',
    'xm-chime-holly'
];
const SPRING_FESTIVAL = [
    'sf-tangyuan',
    'sf-hongbao',
    'sf-firecracker',
    'sf-fu',
    'sf-nian',
    'sf-knot',
    'sf-orange',
    'sf-goat',
    'sf-koi',
    'sf-ingot',
    'sf-kiki-tiger',
    'sf-waddle-scarf',
    'sf-hop-lantern',
    'sf-maru-collar',
    'sf-mochi-fu',
    'sf-lulu-crackers',
    'sf-nook-couplets',
    'sf-chirp-lion'
];
const MID_AUTUMN = [
    'ma-mooncake',
    'ma-rabbit',
    'ma-lantern',
    'ma-osmanthus',
    'ma-moon',
    'ma-pomelo',
    'ma-skylantern',
    'ma-crab',
    'ma-mochi-ears',
    'ma-hop-cake',
    'ma-chirp-cake',
    'ma-lulu-pin',
    'ma-kiki-pin',
    'ma-miso-lamp',
    'ma-waddle-lamp',
    'ma-bao-hat',
    'ma-pip-hat'
];
const EASTER = [
    'ea-dapple',
    'ea-wicker',
    'ea-cocoa',
    'ea-crunchy',
    'ea-posy',
    'ea-breezy',
    'ea-peeky',
    'ea-hop-crown',
    'ea-chirp-shell',
    'ea-mochi-ears',
    'ea-momo-ears',
    'ea-waddle-shell',
    'ea-kiki-crown',
    'ea-lulu-bow',
    'ea-hammy-basket'
];
const SUMMER = [
    'sm-popsicle',
    'sm-coconut',
    'sm-ring',
    'sm-castle',
    'sm-fan',
    'sm-ice',
    'sm-pineapple',
    'sm-shell',
    'sm-cicada',
    'sm-miso-shades',
    'sm-waddle-goggles',
    'sm-chirp-hat',
    'sm-hop-hat',
    'sm-bruno-melon',
    'sm-koko-lei',
    'sm-leo-sunscreen',
    'sm-scoop-shades'
];
const VALENTINE = [
    'vl-bonbon',
    'vl-rose',
    'vl-cherub',
    'vl-ring',
    'vl-dove',
    'vl-dipped',
    'vl-mochi-stickers',
    'vl-miso-bowtie',
    'vl-waddle-bowtie',
    'vl-bruno-rose',
    'vl-hop-glasses',
    'vl-oink-stickers',
    'vl-kiki-letter',
    'vl-chirp-headband'
];
const THEME_MANIFEST = [
    {
        id: 'halloween',
        name: {
            en: 'Halloween',
            zh: '万圣节'
        },
        shapes: [
            'spook',
            'pumpkin',
            'nightcat',
            'batling',
            'cauldron',
            'witch',
            'toffee',
            'manor',
            'wisp',
            'deadtree',
            'scarecrow',
            'tombstone',
            'candycorn',
            'mummy',
            'skull',
            'spider',
            'owl',
            'pail',
            'candle',
            'vampire',
            'witchmochi',
            'lanterncat',
            'nightcapmoon'
        ],
        listedShapes: [],
        cast: [
            'floaty',
            'gourdy',
            'coal',
            'flitter',
            'bubbles',
            'hatty',
            'twisty',
            'creaky',
            'wisp',
            'knotty',
            'patch',
            'resty',
            'corny',
            'wraps',
            'rattle',
            'dangle',
            'hoot',
            'pail',
            'wick',
            'cape',
            'witchmochi',
            'lanternmiso',
            'nightcapluna'
        ],
        cards: [
            'floaty',
            'gourdy',
            'coal',
            'flitter',
            'bubbles',
            'hatty',
            'twisty',
            'creaky',
            'wisp',
            'knotty',
            'patch',
            'resty',
            'corny',
            'wraps',
            'rattle',
            'dangle',
            'hoot',
            'pail',
            'wick',
            'cape',
            'witchmochi',
            'lanternmiso',
            'nightcapluna',
            'jelly',
            'flap',
            'luna'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'doodle'
            },
            {
                style: 'vector',
                variant: 'grainy'
            }
        ],
        colors: [],
        load: ()=>import("@aora-bot/engine/themes/halloween")
    },
    {
        id: 'christmas',
        name: {
            en: 'Christmas',
            zh: '圣诞节'
        },
        shapes: CHRISTMAS,
        listedShapes: [],
        cast: CHRISTMAS,
        cards: [
            ...CHRISTMAS,
            'twinkle',
            'joy',
            'nimbo'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'felt'
            }
        ],
        colors: [
            'peach',
            'pine',
            'crimson',
            'snow'
        ],
        load: ()=>import("@aora-bot/engine/themes/christmas")
    },
    {
        id: 'spring-festival',
        name: {
            en: 'Spring Festival',
            zh: '春节'
        },
        shapes: SPRING_FESTIVAL,
        listedShapes: [],
        cast: SPRING_FESTIVAL,
        cards: [
            ...SPRING_FESTIVAL,
            'bao',
            'ember',
            'finn'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'papercut'
            }
        ],
        colors: [],
        load: ()=>import("@aora-bot/engine/themes/spring-festival")
    },
    {
        id: 'mid-autumn',
        name: {
            en: 'Mid-Autumn',
            zh: '中秋节'
        },
        shapes: MID_AUTUMN,
        listedShapes: [],
        cast: MID_AUTUMN,
        cards: [
            ...MID_AUTUMN,
            'luna',
            'lumi',
            'orbi'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'lantern'
            }
        ],
        colors: [
            'indigo',
            'crust',
            'jade',
            'peel'
        ],
        load: ()=>import("@aora-bot/engine/themes/mid-autumn")
    },
    {
        id: 'easter',
        name: {
            en: 'Easter',
            zh: '复活节'
        },
        shapes: EASTER,
        listedShapes: [],
        cast: EASTER,
        cards: [
            ...EASTER,
            'lucky',
            'bloom',
            'sprout'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'pastel'
            }
        ],
        colors: [
            'mint',
            'carrot',
            'caramel'
        ],
        load: ()=>import("@aora-bot/engine/themes/easter")
    },
    {
        id: 'summer',
        name: {
            en: 'Summer',
            zh: '夏日'
        },
        shapes: SUMMER,
        listedShapes: [],
        cast: SUMMER,
        cards: [
            ...SUMMER,
            'melo',
            'puff',
            'dew'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'soda'
            }
        ],
        colors: [
            'lagoon',
            'lemon',
            'aqua',
            'sand',
            'grass'
        ],
        load: ()=>import("@aora-bot/engine/themes/summer")
    },
    {
        id: 'valentine',
        name: {
            en: "Valentine's Day",
            zh: '情人节'
        },
        shapes: VALENTINE,
        listedShapes: [],
        cast: VALENTINE,
        cards: [
            ...VALENTINE,
            'luv',
            'cheri',
            'cuppy'
        ],
        variants: [
            {
                style: 'vector',
                variant: 'candy'
            }
        ],
        colors: [
            'wine',
            'plum'
        ],
        load: ()=>import("@aora-bot/engine/themes/valentine")
    }
];
const THEME_IDS = THEME_MANIFEST.map((entry)=>entry.id);
const SHAPE_SPACE = 240;
const CENTER = SHAPE_SPACE / 2;
const VIEWBOX_MARGIN = 24;
const VIEWBOX = {
    minX: -VIEWBOX_MARGIN,
    minY: -VIEWBOX_MARGIN,
    width: SHAPE_SPACE + 2 * VIEWBOX_MARGIN,
    height: SHAPE_SPACE + 2 * VIEWBOX_MARGIN
};
const VIEWBOX_STR = `${VIEWBOX.minX} ${VIEWBOX.minY} ${VIEWBOX.width} ${VIEWBOX.height}`;
const ALL_SHAPE_FAMILIES = [
    {
        id: 'round',
        label: {
            en: 'Round',
            zh: '圆润'
        },
        shapes: [
            'circle',
            'mochi',
            'blob',
            'pebble',
            'egg',
            'bun'
        ]
    },
    {
        id: 'rect',
        label: {
            en: 'Rounded rectangle',
            zh: '方圆'
        },
        shapes: [
            'tofu',
            'pill'
        ]
    },
    {
        id: 'polygon',
        label: {
            en: 'Polygon',
            zh: '多边'
        },
        shapes: [
            'hex',
            'onigiri',
            'gem'
        ]
    },
    {
        id: 'petal',
        label: {
            en: 'Petal',
            zh: '花叶'
        },
        shapes: [
            'cloud',
            'drop',
            'leaf',
            'flower',
            'clover'
        ]
    },
    {
        id: 'garden',
        label: {
            en: 'Garden',
            zh: '田园'
        },
        shapes: [
            'sprout',
            'mushroom',
            'acorn',
            'cactus',
            'eggplant'
        ]
    },
    {
        id: 'fruit',
        label: {
            en: 'Fruit',
            zh: '水果'
        },
        shapes: [
            'pear',
            'apple',
            'strawberry',
            'cherry',
            'avocado',
            'melon'
        ]
    },
    {
        id: 'treat',
        label: {
            en: 'Treats',
            zh: '美食'
        },
        shapes: [
            'pudding',
            'toast',
            'icecream',
            'cupcake',
            'fries',
            'candy',
            'burger'
        ]
    },
    {
        id: 'figure',
        label: {
            en: 'Figure',
            zh: '造型'
        },
        shapes: [
            'star',
            'heart',
            'flame',
            'bell',
            'ghost',
            'bot',
            'crescent',
            'boba',
            'planet'
        ]
    },
    {
        id: 'object',
        label: {
            en: 'Objects',
            zh: '物件'
        },
        shapes: [
            'cottage',
            'chat',
            'gift',
            'bulb'
        ]
    },
    {
        id: 'sea',
        label: {
            en: 'Sea',
            zh: '海洋'
        },
        shapes: [
            'fish',
            'octopus',
            'seal',
            'puffer'
        ]
    },
    {
        id: 'critter',
        label: {
            en: 'Critter',
            zh: '小动物'
        },
        shapes: [
            'cat',
            'bunny',
            'bear',
            'chick',
            'penguin',
            'pig',
            'fox',
            'lion',
            'hamster',
            'hedgehog',
            'koala',
            'bat'
        ]
    },
    {
        id: 'people',
        label: {
            en: 'People',
            zh: '人物'
        },
        shapes: [
            'bob',
            'topknot',
            'spiky',
            'curly',
            'twinbuns'
        ]
    },
    {
        id: 'coal',
        label: {
            en: 'Coal',
            zh: '煤球'
        },
        shapes: [
            'chunk',
            'lump',
            'fluff'
        ]
    }
];
const isListed = (family)=>false !== family.listed;
const SHAPE_FAMILIES = [
    ...ALL_SHAPE_FAMILIES.filter(isListed).map((family)=>family),
    ...THEME_MANIFEST.filter((theme)=>theme.listedShapes.length > 0).map((theme)=>({
            id: theme.id,
            label: theme.name,
            shapes: theme.listedShapes
        }))
];
const SHAPE_IDS = SHAPE_FAMILIES.flatMap((family)=>family.shapes);
const CORE_SHAPE_IDS = ALL_SHAPE_FAMILIES.flatMap((family)=>family.shapes);
const ALL_SHAPE_IDS = [
    ...new Set([
        ...SHAPE_IDS,
        ...CORE_SHAPE_IDS,
        ...THEME_MANIFEST.flatMap((theme)=>theme.shapes)
    ])
];
const isListedShape = (id)=>SHAPE_IDS.includes(id);
const CORE_COLOR_IDS = [
    'cream',
    'ivory',
    'black',
    'brown',
    'red',
    'orange',
    'yellow',
    'green',
    'cyan',
    'blue',
    'violet',
    'magenta',
    'pink',
    'gray',
    'sage',
    'clay',
    'navy',
    'mauve',
    'night',
    'cocoa',
    'sky',
    'blush',
    'lilac',
    'butter',
    'meadow'
];
const UNLISTED_COLOR_IDS = [
    'night',
    'cocoa',
    'sky',
    'blush',
    'lilac',
    'butter',
    'meadow'
];
const COLOR_IDS = CORE_COLOR_IDS.filter((id)=>!UNLISTED_COLOR_IDS.includes(id));
const ALL_COLOR_IDS = [
    ...CORE_COLOR_IDS,
    ...THEME_MANIFEST.flatMap((theme)=>theme.colors)
];
const ASSIGNABLE_COLOR_IDS = [
    'brown',
    'red',
    'orange',
    'yellow',
    'green',
    'cyan',
    'blue',
    'violet',
    'magenta',
    'pink',
    'gray'
];
const AUTO_SHAPE_POOL = [
    'blob',
    'pebble',
    'mochi',
    'tofu',
    'onigiri',
    'hex',
    'cloud',
    'drop'
];
const DRAWN_FACE_STYLES = [
    'capsule',
    'brow',
    'glossy',
    'sparkle',
    'button',
    'shades',
    'droopy',
    'bigmouth',
    'pie',
    'screen',
    'symbol',
    'teardrop',
    'specs'
];
const [LEAD_FACE, ...LATER_FACES] = DRAWN_FACE_STYLES;
const FACE_STYLES = [
    LEAD_FACE,
    'cute',
    'eyes',
    'line',
    ...LATER_FACES
];
const DEFAULT_FACE = 'cute';
const DEFAULT_SHAPE = 'mochi';
const DEFINED_FACES = new Set();
const markDefinedFace = (id)=>{
    DEFINED_FACES.add(id);
};
const isDrawnFace = (face)=>DRAWN_FACE_STYLES.includes(face ?? '') || DEFINED_FACES.has(face ?? '');
const isFaceStyle = (face)=>FACE_STYLES.includes(face ?? '') || DEFINED_FACES.has(face ?? '');
const isCuteFamily = (face)=>'cute' === face || isDrawnFace(face);
const NOSE_IDS = [
    'slant',
    'angular',
    'hook',
    'long',
    'curve',
    'bow'
];
const MOUTH_IDS = [
    'flat',
    'soft',
    'smile',
    'grin',
    'smirk',
    'o',
    'open',
    'dot',
    'wavy',
    'frown',
    'pout',
    'hum',
    'tight'
];
const CUTE_MOUTH_IDS = [
    'none',
    'smile',
    'cat',
    'grin',
    'laugh',
    'flat',
    'frown',
    'o',
    'dot',
    'wavy',
    'smirk',
    'pout'
];
const FX_KINDS = [
    'zz',
    'sparkle',
    'bang',
    'strokes',
    'heart',
    'tear',
    'arc',
    'dots',
    'ellipsis',
    'orbit',
    'bubbles',
    'spinner',
    'progress',
    'ripple',
    'waves',
    'rise',
    'fall',
    'send',
    'gather',
    'pencil'
];
const DEFAULT_FACE_TUNE = {
    size: 1,
    gap: 1,
    height: 1,
    eyeWidth: 1,
    eyeHeight: 1
};
const DEFAULT_POSE = {
    turn: 0,
    tilt: 0,
    roll: 0,
    scale: 1
};
const DEFAULT_POSE_HOME = {
    turn: 13,
    tilt: -5,
    roll: 0
};
const PART_TONES = [
    'body',
    'leaf',
    'inner',
    'hair'
];
const clamp = (v, lo, hi)=>v < lo ? lo : v > hi ? hi : v;
const clamp01 = (v)=>clamp(v, 0, 1);
const easing_lerp = (a, b, t)=>a + (b - a) * t;
const frameLerp = (current, target, rate, dt)=>current + (target - current) * (1 - Math.pow(1 - rate, 60 * dt));
const easeInOutCubic = (t)=>t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t)=>1 - Math.pow(1 - t, 3);
const easeOutQuart = (t)=>1 - Math.pow(1 - t, 4);
const smoothstep = (edge0, edge1, x)=>{
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
};
const roundTo = (n, decimals = 2)=>{
    const k = 10 ** decimals;
    return Math.round(n * k) / k;
};
const path_builder_round = (n)=>roundTo(n, 3);
class PathBuilder {
    parts = [];
    moveTo(x, y) {
        this.parts.push(`M${path_builder_round(x)} ${path_builder_round(y)}`);
        return this;
    }
    lineTo(x, y) {
        this.parts.push(`L${path_builder_round(x)} ${path_builder_round(y)}`);
        return this;
    }
    curveTo(x1, y1, x2, y2, x, y) {
        this.parts.push(`C${path_builder_round(x1)} ${path_builder_round(y1)} ${path_builder_round(x2)} ${path_builder_round(y2)} ${path_builder_round(x)} ${path_builder_round(y)}`);
        return this;
    }
    quadTo(x1, y1, x, y) {
        this.parts.push(`Q${path_builder_round(x1)} ${path_builder_round(y1)} ${path_builder_round(x)} ${path_builder_round(y)}`);
        return this;
    }
    arcTo(cx, cy, r, from, to) {
        const sweep = to - from;
        const segments = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)));
        const step = sweep / segments;
        const k = 4 / 3 * Math.tan(step / 4);
        for(let i = 0; i < segments; i++){
            const a0 = from + step * i;
            const a1 = a0 + step;
            const x0 = cx + r * Math.cos(a0);
            const y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            if (0 === i && 0 === this.parts.length) this.moveTo(x0, y0);
            this.curveTo(x0 - k * r * Math.sin(a0), y0 + k * r * Math.cos(a0), x1 + k * r * Math.sin(a1), y1 - k * r * Math.cos(a1), x1, y1);
        }
        return this;
    }
    close() {
        this.parts.push('Z');
        return this;
    }
    toString() {
        return this.parts.join('');
    }
}
function dedupePoints(points, epsilon = 1e-4) {
    const out = [];
    for (const p of points){
        const last = out[out.length - 1];
        if (!(last && Math.hypot(p[0] - last[0], p[1] - last[1]) < epsilon)) out.push([
            p[0],
            p[1]
        ]);
    }
    const first = out[0];
    const last = out[out.length - 1];
    if (out.length > 1 && first && last && Math.hypot(first[0] - last[0], first[1] - last[1]) < epsilon) out.pop();
    return out;
}
function resampleEvenly(points, maxLength = 5) {
    const n = points.length;
    if (n < 2) return points.map((p)=>[
            p[0],
            p[1]
        ]);
    const out = [];
    for(let i = 0; i < n; i++){
        const a = points[i];
        const b = points[(i + 1) % n];
        out.push([
            a[0],
            a[1]
        ]);
        const distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const steps = Math.floor(distance / maxLength);
        for(let s = 1; s < steps; s++){
            const t = s / steps;
            out.push([
                a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t
            ]);
        }
    }
    return out;
}
function smoothClosedPath(points, { alpha = 0.5, resample = 5 } = {}) {
    const prepared = resample > 0 ? dedupePoints(resampleEvenly(dedupePoints(points), resample)) : dedupePoints(points);
    const n = prepared.length;
    if (n < 3) return '';
    const p = (i)=>prepared[(i % n + n) % n];
    const knot = (a, b)=>Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), alpha) || 1e-6;
    const b = new PathBuilder();
    const first = p(0);
    b.moveTo(first[0], first[1]);
    for(let i = 0; i < n; i++){
        const p0 = p(i - 1);
        const p1 = p(i);
        const p2 = p(i + 1);
        const p3 = p(i + 2);
        const d1 = knot(p0, p1);
        const d2 = knot(p1, p2);
        const d3 = knot(p2, p3);
        const m1x = (p2[0] - p0[0]) / (d1 + d2) * d2;
        const m1y = (p2[1] - p0[1]) / (d1 + d2) * d2;
        const m2x = (p3[0] - p1[0]) / (d2 + d3) * d2;
        const m2y = (p3[1] - p1[1]) / (d2 + d3) * d2;
        b.curveTo(p1[0] + m1x / 3, p1[1] + m1y / 3, p2[0] - m2x / 3, p2[1] - m2y / 3, p2[0], p2[1]);
    }
    b.close();
    return b.toString();
}
const LOOPS = {
    pebble: {
        points: [
            50,
            27,
            55.47,
            27.05,
            60.76,
            27.4,
            64.92,
            27.96,
            68.53,
            28.78,
            72.23,
            30.01,
            75.34,
            31.37,
            78.02,
            32.93,
            80.34,
            34.67,
            82.43,
            36.68,
            84.2,
            38.84,
            85.76,
            41.28,
            86.84,
            43.54,
            87.7,
            46.2,
            88.51,
            49.91,
            88.92,
            53.39,
            89,
            57.99,
            88.92,
            62.69,
            88.48,
            66.26,
            87.65,
            69.97,
            86.77,
            72.62,
            85.68,
            74.87,
            84.1,
            77.3,
            82.31,
            79.45,
            80.2,
            81.44,
            77.87,
            83.16,
            75.28,
            84.66,
            72.07,
            86.05,
            68.46,
            87.24,
            64.85,
            88.05,
            60.69,
            88.6,
            55.4,
            88.95,
            50,
            89,
            44.6,
            88.95,
            39.31,
            88.6,
            35.15,
            88.05,
            31.54,
            87.24,
            27.93,
            86.05,
            24.72,
            84.66,
            22.13,
            83.16,
            19.8,
            81.44,
            17.69,
            79.45,
            15.9,
            77.3,
            14.32,
            74.87,
            13.23,
            72.62,
            12.35,
            69.97,
            11.52,
            66.26,
            11.08,
            62.69,
            11,
            57.99,
            11.08,
            53.39,
            11.49,
            49.91,
            12.3,
            46.2,
            13.16,
            43.54,
            14.24,
            41.28,
            15.8,
            38.84,
            17.57,
            36.68,
            19.66,
            34.67,
            21.98,
            32.93,
            24.66,
            31.37,
            27.77,
            30.01,
            31.47,
            28.78,
            35.08,
            27.96,
            39.24,
            27.4,
            44.53,
            27.05,
            50,
            27
        ],
        face: [
            50,
            60
        ]
    },
    egg: {
        points: [
            50,
            29.12,
            52.98,
            29.27,
            55.94,
            29.73,
            59.14,
            30.52,
            61.68,
            31.43,
            64.48,
            32.76,
            66.88,
            34.21,
            68.94,
            35.79,
            70.96,
            37.72,
            72.98,
            40.08,
            74.58,
            42.37,
            75.94,
            44.82,
            77.1,
            47.58,
            78.07,
            50.63,
            78.68,
            53.46,
            79.03,
            56.64,
            79.1,
            59.84,
            78.88,
            63.13,
            78.34,
            66.59,
            77.54,
            69.89,
            76.53,
            72.93,
            75.26,
            75.76,
            73.51,
            78.9,
            71.84,
            81.39,
            69.86,
            83.77,
            67.53,
            86.12,
            65.53,
            87.77,
            63.18,
            89.29,
            60.26,
            90.82,
            57.66,
            91.87,
            55.16,
            92.58,
            52.8,
            92.96,
            50,
            93.09,
            47.2,
            92.96,
            44.84,
            92.58,
            42.34,
            91.87,
            39.74,
            90.82,
            36.82,
            89.29,
            34.47,
            87.77,
            32.47,
            86.12,
            30.14,
            83.77,
            28.16,
            81.39,
            26.49,
            78.9,
            24.74,
            75.76,
            23.47,
            72.93,
            22.46,
            69.89,
            21.66,
            66.59,
            21.12,
            63.13,
            20.9,
            59.84,
            20.97,
            56.64,
            21.32,
            53.46,
            21.93,
            50.63,
            22.9,
            47.58,
            24.06,
            44.82,
            25.42,
            42.37,
            27.02,
            40.08,
            29.04,
            37.72,
            31.06,
            35.79,
            33.12,
            34.21,
            35.52,
            32.76,
            38.32,
            31.43,
            40.86,
            30.52,
            44.06,
            29.73,
            47.02,
            29.27,
            50,
            29.12
        ],
        face: [
            50,
            62
        ]
    },
    star: {
        points: [
            50,
            18.06,
            51.94,
            18.34,
            54.06,
            19.22,
            55.99,
            20.64,
            57.94,
            22.78,
            59.72,
            25.67,
            61.33,
            29.33,
            63.08,
            33.8,
            64.29,
            35.86,
            65.43,
            36.98,
            66.77,
            37.64,
            69.22,
            38.14,
            73.91,
            38.39,
            77.69,
            38.77,
            81.08,
            39.63,
            83.99,
            40.93,
            85.77,
            42.23,
            87.15,
            43.93,
            87.98,
            45.74,
            88.31,
            47.71,
            88.13,
            50,
            87.4,
            52.17,
            85.89,
            54.76,
            83.67,
            57.33,
            80.6,
            60.05,
            77.03,
            62.94,
            75.44,
            64.73,
            74.78,
            66.07,
            74.55,
            67.65,
            74.82,
            70.13,
            76.03,
            74.67,
            76.86,
            78.48,
            77.1,
            81.87,
            76.75,
            84.84,
            76,
            87.11,
            74.79,
            89.07,
            73.42,
            90.37,
            71.74,
            91.25,
            69.51,
            91.76,
            67.11,
            91.72,
            64.18,
            91.1,
            60.95,
            89.76,
            57.39,
            87.73,
            53.62,
            85.28,
            51.43,
            84.31,
            50,
            84.1,
            48.57,
            84.31,
            46.38,
            85.28,
            42.61,
            87.73,
            39.05,
            89.76,
            35.82,
            91.1,
            32.89,
            91.72,
            30.49,
            91.76,
            28.26,
            91.25,
            26.58,
            90.37,
            25.21,
            89.07,
            24,
            87.11,
            23.25,
            84.84,
            22.9,
            81.87,
            23.14,
            78.48,
            23.97,
            74.67,
            25.18,
            70.13,
            25.45,
            67.65,
            25.22,
            66.07,
            24.56,
            64.73,
            22.97,
            62.94,
            19.4,
            60.05,
            16.33,
            57.33,
            14.11,
            54.76,
            12.6,
            52.17,
            11.87,
            50,
            11.69,
            47.71,
            12.02,
            45.74,
            12.85,
            43.93,
            14.23,
            42.23,
            16.01,
            40.93,
            18.92,
            39.63,
            22.31,
            38.77,
            26.09,
            38.39,
            30.78,
            38.14,
            33.23,
            37.64,
            34.57,
            36.98,
            35.71,
            35.86,
            36.92,
            33.8,
            38.67,
            29.33,
            40.28,
            25.67,
            42.06,
            22.78,
            44.01,
            20.64,
            45.94,
            19.22,
            48.06,
            18.34,
            50,
            18.06
        ],
        face: [
            50,
            60
        ]
    },
    flower: {
        points: [
            50,
            22.27,
            51.66,
            22.51,
            53.42,
            23.22,
            55.36,
            24.63,
            57.76,
            27.03,
            59.93,
            29.1,
            61.57,
            30.05,
            63.2,
            30.51,
            66,
            30.6,
            69.8,
            30.65,
            72.26,
            31.05,
            74,
            31.8,
            75.27,
            32.77,
            76.28,
            34.13,
            76.99,
            35.88,
            77.35,
            38.25,
            77.4,
            41.85,
            77.5,
            44.85,
            78.01,
            46.57,
            78.93,
            48.11,
            80.93,
            50.21,
            83.4,
            52.68,
            84.8,
            54.63,
            85.51,
            56.39,
            85.73,
            58.07,
            85.5,
            59.65,
            84.73,
            61.49,
            83.38,
            63.34,
            80.98,
            65.75,
            78.85,
            68,
            77.95,
            69.55,
            77.5,
            71.19,
            77.4,
            74.08,
            77.35,
            77.78,
            76.96,
            80.24,
            76.21,
            81.99,
            75.24,
            83.25,
            73.89,
            84.27,
            72.13,
            84.99,
            69.76,
            85.35,
            66.06,
            85.4,
            63.17,
            85.5,
            61.45,
            86,
            59.91,
            86.92,
            57.81,
            88.92,
            55.33,
            91.39,
            53.39,
            92.79,
            51.63,
            93.5,
            50,
            93.73,
            48.37,
            93.5,
            46.61,
            92.79,
            44.67,
            91.39,
            42.19,
            88.92,
            40.09,
            86.92,
            38.55,
            86,
            36.83,
            85.5,
            33.94,
            85.4,
            30.24,
            85.35,
            27.87,
            84.99,
            26.11,
            84.27,
            24.76,
            83.25,
            23.79,
            81.99,
            23.04,
            80.24,
            22.65,
            77.78,
            22.6,
            74.08,
            22.5,
            71.19,
            22.05,
            69.55,
            21.15,
            68,
            19.02,
            65.75,
            16.62,
            63.34,
            15.27,
            61.49,
            14.5,
            59.65,
            14.27,
            58.07,
            14.49,
            56.39,
            15.2,
            54.63,
            16.6,
            52.68,
            19.07,
            50.21,
            21.07,
            48.11,
            21.99,
            46.57,
            22.5,
            44.85,
            22.6,
            41.85,
            22.65,
            38.25,
            23.01,
            35.88,
            23.72,
            34.13,
            24.73,
            32.77,
            26,
            31.8,
            27.74,
            31.05,
            30.2,
            30.65,
            34,
            30.6,
            36.8,
            30.51,
            38.43,
            30.05,
            40.07,
            29.1,
            42.24,
            27.03,
            44.64,
            24.63,
            46.58,
            23.22,
            48.34,
            22.51,
            50,
            22.27
        ],
        face: [
            50,
            59
        ]
    },
    hex: {
        points: [
            50,
            26.1,
            54.36,
            26.18,
            59.05,
            26.5,
            63.93,
            26.91,
            65.71,
            27.21,
            66.66,
            27.51,
            67.47,
            27.91,
            68.12,
            28.36,
            68.92,
            29.12,
            70.05,
            30.52,
            72.81,
            34.45,
            75.23,
            38.12,
            77.66,
            42.15,
            79.74,
            45.91,
            81.82,
            50.12,
            83.8,
            54.38,
            84.47,
            56.16,
            84.71,
            57.23,
            84.76,
            58.13,
            84.68,
            58.93,
            84.42,
            60,
            83.78,
            61.67,
            81.79,
            65.94,
            79.66,
            70.24,
            77.63,
            73.91,
            75.14,
            78.01,
            72.72,
            81.69,
            69.95,
            85.61,
            68.81,
            87,
            67.99,
            87.74,
            67.33,
            88.18,
            66.51,
            88.55,
            65.55,
            88.83,
            63.77,
            89.1,
            58.99,
            89.51,
            54.3,
            89.82,
            50,
            89.9,
            45.7,
            89.82,
            41.01,
            89.51,
            36.23,
            89.1,
            34.45,
            88.83,
            33.49,
            88.55,
            32.67,
            88.18,
            32.01,
            87.74,
            31.19,
            87,
            30.05,
            85.61,
            27.28,
            81.69,
            24.86,
            78.01,
            22.37,
            73.91,
            20.34,
            70.24,
            18.21,
            65.94,
            16.22,
            61.67,
            15.58,
            60,
            15.32,
            58.93,
            15.24,
            58.13,
            15.29,
            57.23,
            15.53,
            56.16,
            16.2,
            54.38,
            18.18,
            50.12,
            20.26,
            45.91,
            22.34,
            42.15,
            24.77,
            38.12,
            27.19,
            34.45,
            29.95,
            30.52,
            31.08,
            29.12,
            31.88,
            28.36,
            32.53,
            27.91,
            33.34,
            27.51,
            34.29,
            27.21,
            36.07,
            26.91,
            40.95,
            26.5,
            45.64,
            26.18,
            50,
            26.1
        ],
        face: [
            50,
            59
        ]
    },
    blob: {
        points: [
            50,
            25.84,
            52.79,
            25.69,
            55.39,
            25.84,
            57.75,
            26.26,
            59.95,
            26.94,
            62.32,
            28,
            64.47,
            29.28,
            66.2,
            30.63,
            67.95,
            32.41,
            70.08,
            35.06,
            73.01,
            39.11,
            75.02,
            41.6,
            77.01,
            43.57,
            80.32,
            46.31,
            83.35,
            48.92,
            85.43,
            51.08,
            86.89,
            52.99,
            87.83,
            54.64,
            88.53,
            56.4,
            88.95,
            58.15,
            89.11,
            59.94,
            89.02,
            61.64,
            88.69,
            63.3,
            88.02,
            65.19,
            87.06,
            67.05,
            85.75,
            68.94,
            83.84,
            71.12,
            81.1,
            73.75,
            77.58,
            76.72,
            73.4,
            80.13,
            70.57,
            82.18,
            67.48,
            84.03,
            65.04,
            85.2,
            62.58,
            86.03,
            59.95,
            86.61,
            56.97,
            86.93,
            53.97,
            86.97,
            50.09,
            86.62,
            44.82,
            86,
            39.86,
            85.42,
            34.87,
            85.01,
            30.8,
            84.54,
            27.56,
            83.9,
            25.08,
            83.12,
            22.9,
            82.14,
            20.84,
            80.9,
            19.21,
            79.59,
            17.9,
            78.21,
            16.86,
            76.74,
            16.1,
            75.23,
            15.56,
            73.61,
            15.16,
            71.55,
            15.03,
            69.36,
            15.19,
            67.07,
            15.77,
            64.02,
            16.91,
            59.77,
            17.62,
            56.65,
            18.08,
            53.08,
            18.31,
            49.09,
            18.64,
            46.31,
            19.24,
            43.68,
            19.96,
            41.71,
            20.95,
            39.86,
            22.22,
            38.07,
            23.78,
            36.38,
            25.61,
            34.83,
            28.11,
            33.17,
            30.76,
            31.76,
            34.27,
            30.31,
            39.05,
            28.53,
            42.76,
            27.35,
            46.85,
            26.38,
            50,
            25.84
        ],
        face: [
            50,
            60
        ]
    },
    heart: {
        points: [
            50,
            22.73,
            51.47,
            22.61,
            53.02,
            22.22,
            54.95,
            21.41,
            58.38,
            19.55,
            61.42,
            18.04,
            63.96,
            17.13,
            66.5,
            16.55,
            69.08,
            16.27,
            71.68,
            16.31,
            74.25,
            16.65,
            76.77,
            17.31,
            79.19,
            18.26,
            81.47,
            19.49,
            83.6,
            20.99,
            85.53,
            22.73,
            87.23,
            24.69,
            88.69,
            26.84,
            89.88,
            29.15,
            90.79,
            31.58,
            91.39,
            34.11,
            91.7,
            36.79,
            91.68,
            39.39,
            91.34,
            41.97,
            90.69,
            44.59,
            89.64,
            47.39,
            88.05,
            50.62,
            85.79,
            54.51,
            83.14,
            58.64,
            80.33,
            62.65,
            77.34,
            66.53,
            74.24,
            70.19,
            70.97,
            73.71,
            67.55,
            77.08,
            63.99,
            80.29,
            60.58,
            83.07,
            57.87,
            84.95,
            55.66,
            86.13,
            53.7,
            86.86,
            51.84,
            87.27,
            50,
            87.41,
            48.16,
            87.27,
            46.3,
            86.86,
            44.34,
            86.13,
            42.13,
            84.95,
            39.42,
            83.07,
            36.01,
            80.29,
            32.45,
            77.08,
            29.03,
            73.71,
            25.76,
            70.19,
            22.66,
            66.53,
            19.67,
            62.65,
            16.86,
            58.64,
            14.21,
            54.51,
            11.95,
            50.62,
            10.36,
            47.39,
            9.31,
            44.59,
            8.66,
            41.97,
            8.32,
            39.39,
            8.3,
            36.79,
            8.61,
            34.11,
            9.21,
            31.58,
            10.12,
            29.15,
            11.31,
            26.84,
            12.77,
            24.69,
            14.47,
            22.73,
            16.4,
            20.99,
            18.53,
            19.49,
            20.81,
            18.26,
            23.23,
            17.31,
            25.75,
            16.65,
            28.32,
            16.31,
            30.92,
            16.27,
            33.5,
            16.55,
            36.04,
            17.13,
            38.58,
            18.04,
            41.62,
            19.55,
            45.05,
            21.41,
            46.98,
            22.22,
            48.53,
            22.61,
            50,
            22.73
        ],
        face: [
            50,
            52
        ]
    },
    gem: {
        points: [
            50,
            19.01,
            54.46,
            19.08,
            58.95,
            19.3,
            63.44,
            19.66,
            67.41,
            20.1,
            69.47,
            20.49,
            71.2,
            21.01,
            72.85,
            21.72,
            74.42,
            22.6,
            76.63,
            24.15,
            79.61,
            26.5,
            82.24,
            28.82,
            84.79,
            31.35,
            87.07,
            33.87,
            88.16,
            35.31,
            88.91,
            36.6,
            89.47,
            37.89,
            89.87,
            39.23,
            90.11,
            40.61,
            90.19,
            42.1,
            90.1,
            43.5,
            89.86,
            44.88,
            89.45,
            46.21,
            88.85,
            47.59,
            87.89,
            49.23,
            85.48,
            52.79,
            82.81,
            56.54,
            80.03,
            60.2,
            77.15,
            63.79,
            74.23,
            67.21,
            71.13,
            70.61,
            68.01,
            73.85,
            64.59,
            77.22,
            61.5,
            80.2,
            59.81,
            81.61,
            58.23,
            82.67,
            56.64,
            83.51,
            54.96,
            84.17,
            53.32,
            84.62,
            51.65,
            84.89,
            50,
            84.97,
            48.35,
            84.89,
            46.68,
            84.62,
            45.04,
            84.17,
            43.36,
            83.51,
            41.77,
            82.67,
            40.19,
            81.61,
            38.5,
            80.2,
            35.41,
            77.22,
            31.99,
            73.85,
            28.87,
            70.61,
            25.77,
            67.21,
            22.85,
            63.79,
            19.97,
            60.2,
            17.19,
            56.54,
            14.52,
            52.79,
            12.11,
            49.23,
            11.15,
            47.59,
            10.55,
            46.21,
            10.14,
            44.88,
            9.9,
            43.5,
            9.81,
            42.1,
            9.89,
            40.61,
            10.13,
            39.23,
            10.53,
            37.89,
            11.09,
            36.6,
            11.84,
            35.31,
            12.93,
            33.87,
            15.21,
            31.35,
            17.76,
            28.82,
            20.39,
            26.5,
            23.37,
            24.15,
            25.58,
            22.6,
            27.15,
            21.72,
            28.8,
            21.01,
            30.53,
            20.49,
            32.59,
            20.1,
            36.56,
            19.66,
            41.05,
            19.3,
            45.54,
            19.08,
            50,
            19.01
        ],
        face: [
            50,
            60
        ]
    }
};
const loopPoints = (points)=>'string' == typeof points ? points.split(' ').map(Number) : points;
const loop = (id)=>({
        body: {
            loop: LOOPS[id].points
        },
        face: LOOPS[id].face
    });
const COAL = {
    chunk: {
        body: 'M18.7 44.8Q20 40 23 36L29 28Q32 24 36.6 22.1L47.4 17.9Q52 16 56.8 17.4L67.2 20.6Q72 22 74.8 26.2L81.2 35.8Q84 40 84.5 45L85.5 57Q86 62 83.4 66.3L76.6 77.7Q74 82 69.1 83.2L54.9 86.8Q50 88 45.2 86.7L32.8 83.3Q28 82 25.1 77.9L16.9 66.1Q14 62 15.3 57.2Z',
        face: [
            50,
            56
        ]
    },
    lump: {
        body: 'M46.6 16.2Q53.6 16.2 60.4 17.6L63 18.1Q69.8 19.6 73.9 25.3L75.3 27.3Q79.4 33 83.2 38.9L84.9 41.3Q88.7 47.2 86.8 53.9L86 56.7Q84.1 63.5 80.8 69.7L79.8 71.7Q76.5 77.8 70 80.5L68.1 81.3Q61.6 84 55.1 86.4L52.7 87.3Q46.2 89.8 39.9 86.8L37.5 85.7Q31.2 82.7 25.4 78.8L23 77.1Q17.2 73.2 16.4 66.2L16.1 63.3Q15.3 56.3 15.1 49.3L15.1 47.2Q14.9 40.2 18.9 34.5L20.2 32.6Q24.2 26.9 29.6 22.4L31.6 20.7Q37 16.3 44 16.2Z',
        face: [
            50,
            54
        ]
    },
    fluff: {
        body: 'M50.1 15.1Q51.2 14 52.3 15.2L54.6 17.8Q55.7 19 56.9 17.9L61 14.3Q62.2 13.3 62.7 14.8L64.1 20.1Q64.6 21.6 66.1 21.4L68.9 21Q70.5 20.8 71 22.3L71.9 25Q72.4 26.5 74 26.3L78.6 25.7Q80.2 25.5 79.9 27.1L79.1 31.7Q78.8 33.2 80.4 33.3L86.3 33.6Q87.9 33.6 87 35L84 40Q83.2 41.4 84.6 42.2L87.6 44Q88.9 44.8 88.1 46.2L86.2 49.1Q85.3 50.4 86.6 51.4L90.7 54.3Q92 55.3 90.6 56.1L86.4 58.8Q85 59.7 85.7 61.1L87.1 63.9Q87.8 65.4 86.5 66.2L83.8 67.8Q82.4 68.6 82.9 70.1L84.3 74Q84.9 75.6 83.3 75.7L79.1 76.3Q77.5 76.4 77.9 78L79.1 83.7Q79.5 85.3 77.9 84.9L72.3 83.2Q70.8 82.8 70.4 84.4L69.5 88.1Q69.2 89.7 67.7 89.1L64.1 87.8Q62.6 87.2 61.6 88.5L59.9 90.7Q59 92 57.5 91.3L55 90Q53.6 89.3 52.6 90.6L49.7 94.7Q48.7 96 47.9 94.6L45.2 90.4Q44.3 89 43 90L39.5 92.4Q38.2 93.3 37.6 91.8L36 87.9Q35.4 86.4 34 87.1L28.8 89.8Q27.4 90.6 27.4 89L27.5 83.1Q27.6 81.5 26 81.4L22.8 81.2Q21.2 81.1 21.2 79.5L21.2 76.4Q21.2 74.8 19.6 74.5L15 73.9Q13.5 73.7 14.1 72.2L16.1 68Q16.8 66.6 15.4 65.8L12.4 64Q11.1 63.2 11.9 61.8L13.8 58.9Q14.7 57.6 13.4 56.7L8.8 53.6Q7.5 52.7 8.9 51.9L13.6 49.1Q15 48.3 14.1 47L12.1 43.7Q11.2 42.3 12.7 41.7L16.2 40.1Q17.6 39.4 17.4 37.9L17 35.1Q16.8 33.5 18.3 33L21 32.1Q22.5 31.6 22.2 30L21.5 25Q21.2 23.4 22.8 23.8L27.7 24.9Q29.2 25.2 29.5 23.6L30.3 19.5Q30.6 17.9 32 18.5L35.9 20.2Q37.4 20.8 37.9 19.3L39.6 13.7Q40.1 12.2 41.2 13.3L45.3 17.5Q46.4 18.7 47.6 17.6Z',
        face: [
            50,
            56
        ]
    }
};
const CRITTER = {
    cat: {
        body: 'M24 42L21 17L41 30C47 28.5 53 28.5 59 30L79 17L76 42C84 49 88 56 88 64C88 80 72 88 50 88C28 88 12 80 12 64C12 56 16 49 24 42Z',
        face: [
            50,
            62
        ]
    },
    bunny: {
        body: 'M50 34C72 34 86 50 86 66C86 80 72 88 50 88C28 88 14 80 14 66C14 50 28 34 50 34Z',
        parts: [
            {
                tone: 'body',
                d: 'M33 44C27 34 25 14 31 9C37 5 43 18 44 38Z'
            },
            {
                tone: 'body',
                d: 'M67 44C73 34 75 14 69 9C63 5 57 18 56 38Z'
            },
            {
                tone: 'inner',
                d: 'M34 36C31 28 30 18 32 14C35 15 38 24 39 35Z'
            },
            {
                tone: 'inner',
                d: 'M66 36C69 28 70 18 68 14C65 15 62 24 61 35Z'
            }
        ],
        face: [
            50,
            64
        ]
    },
    bear: {
        body: 'M50 28C73 28 88 44 88 62C88 80 72 88 50 88C28 88 12 80 12 62C12 44 27 28 50 28Z',
        parts: [
            {
                tone: 'body',
                d: 'M26 17A12 12 0 1 1 26 41A12 12 0 1 1 26 17Z'
            },
            {
                tone: 'body',
                d: 'M74 17A12 12 0 1 1 74 41A12 12 0 1 1 74 17Z'
            },
            {
                tone: 'inner',
                d: 'M26 24A6 6 0 1 1 26 36A6 6 0 1 1 26 24Z'
            },
            {
                tone: 'inner',
                d: 'M74 24A6 6 0 1 1 74 36A6 6 0 1 1 74 24Z'
            }
        ],
        face: [
            50,
            63
        ]
    },
    chick: {
        body: 'M50 24C72 24 86 40 86 60C86 78 72 88 50 88C28 88 14 78 14 60C14 40 28 24 50 24Z',
        parts: [
            {
                tone: 'body',
                d: 'M41.6 23.6A3.8 8.5 -25 1 1 48.4 20.4A3.8 8.5 -25 1 1 41.6 23.6Z'
            },
            {
                tone: 'body',
                d: 'M52.6 19.4A3.8 8 25 1 1 59.4 22.6A3.8 8 25 1 1 52.6 19.4Z'
            },
            {
                tone: 'body',
                d: 'M7.2 63.5A7 12 -12 1 1 20.8 60.5A7 12 -12 1 1 7.2 63.5Z'
            },
            {
                tone: 'body',
                d: 'M79.2 60.5A7 12 12 1 1 92.8 63.5A7 12 12 1 1 79.2 60.5Z'
            },
            {
                tone: 'body',
                d: 'M29 90A9 4.5 0 1 1 47 90A9 4.5 0 1 1 29 90Z'
            },
            {
                tone: 'body',
                d: 'M53 90A9 4.5 0 1 1 71 90A9 4.5 0 1 1 53 90Z'
            }
        ],
        face: [
            50,
            58
        ]
    },
    penguin: {
        body: 'M50 14C72 14 84 32 84 56C84 78 72 90 50 90C28 90 16 78 16 56C16 32 28 14 50 14Z',
        parts: [
            {
                tone: 'body',
                d: 'M19.1 44.5A16 7.5 105 1 1 10.9 75.5A16 7.5 105 1 1 19.1 44.5Z'
            },
            {
                tone: 'body',
                d: 'M80.9 44.5A16 7.5 75 1 1 89.1 75.5A16 7.5 75 1 1 80.9 44.5Z'
            },
            {
                tone: 'inner',
                d: 'M33 72A17 16 0 1 1 67 72A17 16 0 1 1 33 72Z'
            }
        ],
        face: [
            50,
            36
        ]
    },
    pig: {
        body: 'M50 28C73 28 88 44 88 62C88 80 72 88 50 88C28 88 12 80 12 62C12 44 27 28 50 28Z',
        parts: [
            {
                tone: 'body',
                d: 'M46 32C38 24 26 20 15 25C13 33 19 43 30 44Z'
            },
            {
                tone: 'body',
                d: 'M54 32C62 24 74 20 85 25C87 33 81 43 70 44Z'
            },
            {
                tone: 'inner',
                d: 'M30 71A20 13.5 0 1 1 70 71A20 13.5 0 1 1 30 71Z'
            }
        ],
        face: [
            50,
            58
        ]
    },
    fox: {
        body: 'M44 32C64 32 76 47 76 64C76 80 63 88 44 88C25 88 12 80 12 64C12 47 24 32 44 32Z',
        parts: [
            {
                tone: 'body',
                d: 'M16 50C14 38 15 26 20 18C22 15 25 14 28 16C33 21 38 29 40 36Z'
            },
            {
                tone: 'body',
                d: 'M72 50C74 38 73 26 68 18C66 15 63 14 60 16C55 21 50 29 48 36Z'
            },
            {
                tone: 'inner',
                d: 'M21 38C20 31 21 25 24 21C27 24 30 29 32 34Z'
            },
            {
                tone: 'inner',
                d: 'M67 38C68 31 67 25 64 21C61 24 58 29 56 34Z'
            },
            {
                tone: 'body',
                d: 'M62 86C78 88 92 78 95 62C97 52 95 43 91 37C87 45 81 51 75 55C70 59 66 66 64 72Z'
            },
            {
                tone: 'inner',
                d: 'M91 37C94 41 96 48 96 55C92 54 88 50 86 45Z'
            },
            {
                tone: 'inner',
                d: 'M22 76C28 71 36 71 44 76C52 71 60 71 66 76C64 84 55 88 44 88C33 88 24 84 22 76Z'
            }
        ],
        face: [
            44,
            60
        ]
    },
    lion: {
        body: 'M59.8 15.1A2.5 2.5 0 0 0 61.8 16.2L73.5 16.1A5.5 5.5 0 0 1 79 21.4L79.2 26.6A2.5 2.5 0 0 0 80 28.3L88.7 36.4A5.5 5.5 0 0 1 90.3 41.5L89.1 47.5A2.5 2.5 0 0 0 89.3 49.1L94.2 59.6A5.5 5.5 0 0 1 91.7 66.8L87.1 69.2A2.5 2.5 0 0 0 85.8 70.7L82.1 81.9A5.5 5.5 0 0 1 78.1 85.5L72.1 86.9A2.5 2.5 0 0 0 70.8 87.7L63.2 96.5A5.5 5.5 0 0 1 55.7 97.3L51.5 94A2.5 2.5 0 0 0 49.7 93.5L38 94.8A5.5 5.5 0 0 1 33 92.7L29.3 87.8A2.5 2.5 0 0 0 28 86.9L16.8 83.7A5.5 5.5 0 0 1 13 77.1L14.2 72A2.5 2.5 0 0 0 13.9 70.2L7.9 60A5.5 5.5 0 0 1 7.8 54.7L10.6 49.2A2.5 2.5 0 0 0 10.9 47.7L9.2 36.1A5.5 5.5 0 0 1 13.6 29.9L18.7 29A2.5 2.5 0 0 0 20.3 27.9L27 18.2A5.5 5.5 0 0 1 31.9 15.9L38 16.2A2.5 2.5 0 0 0 39.5 15.8L49.3 9.5A5.5 5.5 0 0 1 56.8 10.9Z',
        parts: [
            {
                tone: 'hair',
                d: 'M59.8 15.1A2.5 2.5 0 0 0 61.8 16.2L73.5 16.1A5.5 5.5 0 0 1 79 21.4L79.2 26.6A2.5 2.5 0 0 0 80 28.3L88.7 36.4A5.5 5.5 0 0 1 90.3 41.5L89.1 47.5A2.5 2.5 0 0 0 89.3 49.1L94.2 59.6A5.5 5.5 0 0 1 91.7 66.8L87.1 69.2A2.5 2.5 0 0 0 85.8 70.7L82.1 81.9A5.5 5.5 0 0 1 78.1 85.5L72.1 86.9A2.5 2.5 0 0 0 70.8 87.7L63.2 96.5A5.5 5.5 0 0 1 55.7 97.3L51.5 94A2.5 2.5 0 0 0 49.7 93.5L38 94.8A5.5 5.5 0 0 1 33 92.7L29.3 87.8A2.5 2.5 0 0 0 28 86.9L16.8 83.7A5.5 5.5 0 0 1 13 77.1L14.2 72A2.5 2.5 0 0 0 13.9 70.2L7.9 60A5.5 5.5 0 0 1 7.8 54.7L10.6 49.2A2.5 2.5 0 0 0 10.9 47.7L9.2 36.1A5.5 5.5 0 0 1 13.6 29.9L18.7 29A2.5 2.5 0 0 0 20.3 27.9L27 18.2A5.5 5.5 0 0 1 31.9 15.9L38 16.2A2.5 2.5 0 0 0 39.5 15.8L49.3 9.5A5.5 5.5 0 0 1 56.8 10.9L59.8 15.1L61.4 30.1A2.5 2.5 0 0 1 59 30.5A28 28 0 0 0 41 30.5A2.5 2.5 0 0 1 38.6 30.1A7.5 7.5 0 0 0 27.1 38.9A2.5 2.5 0 0 1 26.8 41.3A28 28 0 1 0 73.2 41.3A2.5 2.5 0 0 1 72.9 38.9A7.5 7.5 0 0 0 61.4 30.1L59.8 15.1Z'
            },
            {
                tone: 'inner',
                d: 'M30.2 36A3.8 3.8 0 1 1 37.8 36A3.8 3.8 0 1 1 30.2 36Z'
            },
            {
                tone: 'inner',
                d: 'M62.2 36A3.8 3.8 0 1 1 69.8 36A3.8 3.8 0 1 1 62.2 36Z'
            }
        ],
        face: [
            50,
            58
        ]
    },
    hamster: {
        body: 'M36.6 30.3A29 29 0 0 1 63.4 30.3A4 4 0 0 0 68.3 29.2A6 6 0 1 1 76.8 37.7A4 4 0 0 0 75.7 42.6A29 29 0 0 1 77.2 45.9A34 34 0 0 0 86.1 59.1A12 12 0 0 1 85 77.8A60.1 60.1 0 0 1 15 77.8A12 12 0 0 1 13.9 59.1A34 34 0 0 0 22.8 45.9A29 29 0 0 1 24.3 42.6A4 4 0 0 0 23.2 37.7A6 6 0 1 1 31.7 29.2A4 4 0 0 0 36.6 30.3Z',
        parts: [
            {
                tone: 'inner',
                d: 'M30.5 33.5A3 3 0 0 1 24.5 33.5A3 3 0 0 1 30.5 33.5Z'
            },
            {
                tone: 'inner',
                d: 'M75.5 33.5A3 3 0 0 1 69.5 33.5A3 3 0 0 1 75.5 33.5Z'
            },
            {
                tone: 'inner',
                d: 'M89.7 65.3A12 12 0 0 1 85 77.8A60.1 60.1 0 0 1 15 77.8A12 12 0 0 1 10.3 65.3A14 14 0 0 1 26.7 76A12 12 0 0 0 41.2 85A38 38 0 0 1 58.8 85A12 12 0 0 0 73.3 76A14 14 0 0 1 89.7 65.3Z'
            }
        ],
        face: [
            50,
            57
        ]
    },
    hedgehog: {
        body: 'M85.4 56.8A14 14 0 0 1 83.9 74.9A47.8 47.8 0 0 1 16.1 74.9A14 14 0 0 1 14.6 56.8A8 8 0 0 0 16.1 53A20 20 0 0 1 17.8 46.7A35.4 35.4 0 0 1 82.2 46.7A20 20 0 0 1 83.9 53A8 8 0 0 0 85.4 56.8Z',
        parts: [
            {
                tone: 'hair',
                d: 'M19.8 78.2A47.8 47.8 0 0 1 18.1 76.8A2.5 2.5 0 0 0 16.6 76.2L10 75.9A2.4 2.4 0 0 1 8.2 72L11.5 67.7A2.5 2.5 0 0 0 12 66A14 14 0 0 1 12 65.4A2.5 2.5 0 0 0 10.6 63.2L5 60.5A2.4 2.4 0 0 1 4.8 56.3L10.5 53A2.5 2.5 0 0 0 11.2 49.2L7.1 44.6A2.4 2.4 0 0 1 8.6 40.6L18.3 39.5A2.5 2.5 0 0 0 18.1 36.8L16.1 30.7A2.4 2.4 0 0 1 19 27.6L28.4 30.4A2.5 2.5 0 0 0 30.1 28.6L30.4 20.9A2.4 2.4 0 0 1 34.3 19.2L41.9 25.4A2.5 2.5 0 0 0 44.2 24.2L47.9 16.9A2.4 2.4 0 0 1 52.1 16.9L56.6 25.5A2.5 2.5 0 0 0 59 24.8L65.7 19.2A2.4 2.4 0 0 1 69.6 20.9L70.4 30.6A2.5 2.5 0 0 0 72.6 30.1L81 27.6A2.4 2.4 0 0 1 83.9 30.7L81.9 36.8A2.5 2.5 0 0 0 83.4 39.9L91.4 40.6A2.4 2.4 0 0 1 92.9 44.6L88.8 49.2A2.5 2.5 0 0 0 89.5 53L95.2 56.3A2.4 2.4 0 0 1 95 60.5L89.4 63.2A2.5 2.5 0 0 0 88 65.4A14 14 0 0 1 88 66A2.5 2.5 0 0 0 88.5 67.7L91.8 72A2.4 2.4 0 0 1 90 75.9L83.4 76.2A2.5 2.5 0 0 0 81.9 76.8A47.8 47.8 0 0 1 80.2 78.2A32 28 0 0 0 82 69A32 28 0 0 0 18 69A32 28 0 0 0 19.8 78.2Z'
            }
        ],
        face: [
            50,
            67
        ]
    },
    koala: {
        body: 'M38.3 36A35.6 35.6 0 0 1 61.7 36A5 5 0 0 0 67.9 33.1A13 13 0 0 1 84.4 25.7A2.5 2.5 0 0 0 86.5 25.5A6.5 6.5 0 0 1 96.1 33.3A2.5 2.5 0 0 0 96.8 36.1A6.5 6.5 0 0 1 95.4 46.8A2.5 2.5 0 0 0 94 49.4A5.5 5.5 0 0 1 89.1 55.5A7 7 0 0 0 83 62A20 20 0 0 1 79.7 72A35.6 35.6 0 0 1 20.3 72A20 20 0 0 1 17 62A7 7 0 0 0 10.9 55.5A5.5 5.5 0 0 1 6 49.4A2.5 2.5 0 0 0 4.6 46.8A6.5 6.5 0 0 1 3.2 36.1A2.5 2.5 0 0 0 3.9 33.3A6.5 6.5 0 0 1 13.5 25.5A2.5 2.5 0 0 0 15.6 25.7A13 13 0 0 1 32.1 33.1A5 5 0 0 0 38.3 36Z',
        parts: [
            {
                tone: 'inner',
                d: 'M28 39.5A7.5 7.5 0 0 1 13 39.5A7.5 7.5 0 0 1 28 39.5Z'
            },
            {
                tone: 'inner',
                d: 'M87 39.5A7.5 7.5 0 0 1 72 39.5A7.5 7.5 0 0 1 87 39.5Z'
            }
        ],
        face: [
            50,
            62
        ]
    },
    bat: {
        body: 'M72.2 43.4A26 26 0 0 1 76 57A26 26 0 0 1 24 57A26 26 0 0 1 27.8 43.4A4 4 0 0 0 28.3 40.3A9 9 0 0 1 28 38V16A3 3 0 0 1 33.6 14.5L42.3 29.3A4 4 0 0 0 46.3 31.3A26 26 0 0 1 53.7 31.3A4 4 0 0 0 57.7 29.3L66.4 14.5A3 3 0 0 1 72 16V38A9 9 0 0 1 71.7 40.3A4 4 0 0 0 72.2 43.4Z',
        parts: [
            {
                tone: 'hair',
                d: 'M27.9 70.6A4 4 0 0 0 26.6 69.4A1.5 1.5 0 0 1 26.4 69.2A6.5 6.5 0 0 0 16.6 70.3A1.5 1.5 0 0 1 15.4 69.1A6.5 6.5 0 0 0 5.3 64.6A1.5 1.5 0 0 1 3.3 64.3A7 7 0 0 1 2.2 57.7A27 27 0 0 1 24.7 39.6A4 4 0 0 0 28.2 36.3H28.4V38A8.6 8.6 0 0 0 28.7 40.2A4.4 4.4 0 0 1 28.2 43.6A25.6 25.6 0 0 0 24.4 57A25.6 25.6 0 0 0 28.2 70.4L27.9 70.6Z'
            },
            {
                tone: 'hair',
                d: 'M71.8 36.3A4 4 0 0 0 75.3 39.6A27 27 0 0 1 97.8 57.7A7 7 0 0 1 96.7 64.3A1.5 1.5 0 0 1 94.7 64.6A6.5 6.5 0 0 0 84.5 70A1.5 1.5 0 0 1 83.4 70.3A6.5 6.5 0 0 0 73.6 69.2A1.5 1.5 0 0 1 73.4 69.4A4 4 0 0 0 72.1 70.6L71.8 70.4A25.6 25.6 0 0 0 75.6 57A25.6 25.6 0 0 0 71.8 43.6A4.4 4.4 0 0 1 71.3 40.2A8.6 8.6 0 0 0 71.6 38V36.3H71.8Z'
            }
        ],
        face: [
            50,
            58
        ]
    }
};
const FIGURE = {
    star: loop('star'),
    heart: loop('heart'),
    flame: {
        body: 'M50 10C53 26 78 40 80 62C82 80 68 90 50 90C32 90 18 80 20 62C21 52 28 46 33 40C35 48 39 52 43 52C40 36 44 22 50 10Z',
        face: [
            50,
            66
        ],
        leftDX: -2
    },
    bell: {
        body: 'M50 16C66 16 74 30 74 46C74 60 82 68 88 76C91 81 88 86 83 86H17C12 86 9 81 12 76C18 68 26 60 26 46C26 30 34 16 50 16Z',
        parts: [
            {
                tone: 'body',
                d: 'M44 88A6 6 0 1 0 56 88A6 6 0 1 0 44 88Z'
            }
        ],
        face: [
            50,
            56
        ]
    },
    ghost: {
        body: 'M16.9 53.4A35 35 0 1 1 84 56.4A2.5 2.5 0 0 0 86.2 59.7A4.5 4.5 0 0 1 90 65.9L81.2 86.8A13 13 0 0 1 59.9 90.9A2.5 2.5 0 0 0 56.4 90.8A12.5 12.5 0 0 1 37.5 89.2A2.5 2.5 0 0 0 34 88.6A13 13 0 0 1 13.9 81.5L8.5 62A4.5 4.5 0 0 1 13.9 56.4A2.5 2.5 0 0 0 16.9 53.4Z',
        face: [
            51,
            43
        ]
    },
    bot: {
        body: 'M24 32H76Q88 32 88 44V76Q88 88 76 88H24Q12 88 12 76V44Q12 32 24 32Z',
        parts: [
            {
                tone: 'body',
                d: 'M47 33V19H53V33Z'
            },
            {
                tone: 'body',
                d: 'M50 8A6 6 0 1 1 50 20A6 6 0 1 1 50 8Z'
            }
        ],
        face: [
            50,
            60
        ]
    },
    crescent: {
        body: 'M19.5 22.8A41 41 0 1 0 81.4 74.7A10 10 0 0 0 71 59.8A30 30 0 0 1 35.9 30.3A10 10 0 0 0 19.5 22.8Z',
        face: [
            33.1,
            69.3
        ]
    },
    boba: {
        body: 'M22 38L28 82Q29 90 38 90H62Q71 90 72 82L78 38Z',
        parts: [
            {
                tone: 'body',
                d: 'M63.2 29.4L73.2 7.4A3.5 3.5 0 0 0 66.8 4.6L56.8 26.6A3.5 3.5 0 0 0 63.2 29.4Z'
            },
            {
                tone: 'body',
                d: 'M14 38C14 26 30 22 50 22C70 22 86 26 86 38C86 42 84 44 80 44H20C16 44 14 42 14 38Z'
            },
            {
                tone: 'inner',
                d: 'M18 37C18 29.5 32 26 50 26C68 26 82 29.5 82 37C82 38.5 81 39.5 79.5 39.5H20.5C19 39.5 18 38.5 18 37Z'
            },
            {
                tone: 'inner',
                d: 'M31.5 83A4.5 4.5 0 1 1 40.5 83A4.5 4.5 0 1 1 31.5 83Z'
            },
            {
                tone: 'inner',
                d: 'M45.5 85A4.5 4.5 0 1 1 54.5 85A4.5 4.5 0 1 1 45.5 85Z'
            },
            {
                tone: 'inner',
                d: 'M59.5 83A4.5 4.5 0 1 1 68.5 83A4.5 4.5 0 1 1 59.5 83Z'
            }
        ],
        face: [
            50,
            62
        ]
    },
    planet: {
        body: 'M81 46A31 31 0 0 1 19 46A31 31 0 0 1 81 46Z',
        parts: [
            {
                tone: 'hair',
                d: 'M80.5 44.1A30.6 30.6 0 0 0 79.6 38.1A43.5 14 -10 0 1 92.8 45.4A43.5 14 -10 0 1 7.2 60.6A43.5 14 -10 0 1 19.5 47.8A30.6 30.6 0 0 0 20.5 54A36.5 7 -10 0 0 14.1 59.3A36.5 7 -10 0 0 85.9 46.7A36.5 7 -10 0 0 80.5 44.1Z'
            }
        ],
        face: [
            50,
            39
        ]
    }
};
const FRUIT = {
    pear: {
        body: 'M37.1 29A17 17 0 0 1 69.8 32.3A30 30 0 0 0 75.5 45.7A32 32 0 1 1 28.8 41A30 30 0 0 0 37.1 29Z',
        parts: [
            {
                tone: 'body',
                d: 'M50 25Q49 17 51.5 12Q54 10 55.5 13Q55 18 56 25Z'
            },
            {
                tone: 'leaf',
                d: 'M55 16C58 8 67 5 75 7C74 16 65 21 56 19Z'
            }
        ],
        face: [
            50,
            67
        ]
    },
    apple: {
        body: 'M50 38C54 30 61 25 69 25C83 25 91 36 91 50C91 70 74 90 50 90C26 90 9 70 9 50C9 36 17 25 31 25C39 25 46 30 50 38Z',
        parts: [
            {
                tone: 'body',
                d: 'M46.5 40C45 31 46 22 51 14L57 16C53 23 53 31 54 40Z'
            },
            {
                tone: 'leaf',
                d: 'M54 22C58 13 68 10 76 13C75 22 65 26 55 24Z'
            }
        ],
        face: [
            50,
            62
        ]
    },
    strawberry: {
        body: 'M50 31C62 31 76 31 82 35C90 38 92 48 89 58C85 72 70 88 56 91C52.5 91.7 47.5 91.7 44 91C30 88 15 72 11 58C8 48 10 38 18 35C24 31 38 31 50 31Z',
        parts: [
            {
                tone: 'leaf',
                d: 'M43.5 26A6.5 11 0 1 1 56.5 26A6.5 11 0 1 1 43.5 26Z'
            },
            {
                tone: 'leaf',
                d: 'M20.9 35.9A13 6 -22 1 1 45.1 26.1A13 6 -22 1 1 20.9 35.9Z'
            },
            {
                tone: 'leaf',
                d: 'M54.9 26.1A13 6 22 1 1 79.1 35.9A13 6 22 1 1 54.9 26.1Z'
            },
            {
                tone: 'inner',
                d: 'M26 46.9A2.2 3.4 -25 1 1 30 45.1A2.2 3.4 -25 1 1 26 46.9Z'
            },
            {
                tone: 'inner',
                d: 'M70 45.1A2.2 3.4 25 1 1 74 46.9A2.2 3.4 25 1 1 70 45.1Z'
            },
            {
                tone: 'inner',
                d: 'M17.3 62.4A2.2 3.4 -40 1 1 20.7 59.6A2.2 3.4 -40 1 1 17.3 62.4Z'
            },
            {
                tone: 'inner',
                d: 'M79.3 59.6A2.2 3.4 40 1 1 82.7 62.4A2.2 3.4 40 1 1 79.3 59.6Z'
            },
            {
                tone: 'inner',
                d: 'M28 75.9A2.2 3.4 -25 1 1 32 74.1A2.2 3.4 -25 1 1 28 75.9Z'
            },
            {
                tone: 'inner',
                d: 'M68 74.1A2.2 3.4 25 1 1 72 75.9A2.2 3.4 25 1 1 68 74.1Z'
            },
            {
                tone: 'inner',
                d: 'M47.8 85A2.2 3.4 0 1 1 52.2 85A2.2 3.4 0 1 1 47.8 85Z'
            }
        ],
        face: [
            50,
            60
        ]
    },
    cherry: {
        body: 'M3 67A30 30 0 1 1 63 67A30 30 0 1 1 3 67Z',
        parts: [
            {
                tone: 'body',
                d: 'M50 72A23 23 0 1 1 96 72A23 23 0 1 1 50 72Z'
            },
            {
                tone: 'body',
                d: 'M35.7 41.8L54.7 13.8A3.3 3.3 0 0 0 49.3 10.2L30.3 38.2A3.3 3.3 0 0 0 35.7 41.8Z'
            },
            {
                tone: 'body',
                d: 'M75.9 48.5L56.9 10.5A3.3 3.3 0 0 0 51.1 13.5L70.1 51.5A3.3 3.3 0 0 0 75.9 48.5Z'
            },
            {
                tone: 'leaf',
                d: 'M54 14C60 4 74 2 84 8C80 18 66 22 54 16Z'
            }
        ],
        face: [
            33,
            67
        ]
    },
    avocado: {
        body: 'M23.3 39.3A27 27 0 1 1 76.7 39.3A9 9 0 0 0 80.1 47.8A23 23 0 0 1 70.7 88.5L58.3 91.1A40 40 0 0 1 41.7 91.1L29.3 88.5A23 23 0 0 1 19.9 47.8A9 9 0 0 0 23.3 39.3Z',
        parts: [
            {
                tone: 'leaf',
                d: 'M25.8 38.9A24.5 24.5 0 1 1 74.2 38.9A11.5 11.5 0 0 0 78.5 49.8A20.5 20.5 0 0 1 70.2 86.1L57.7 88.7A37.5 37.5 0 0 1 42.3 88.7L29.8 86.1A20.5 20.5 0 0 1 21.5 49.8A11.5 11.5 0 0 0 25.8 38.9L29.8 38.2A15.5 15.5 0 0 1 23.9 52.9A16.5 16.5 0 0 0 30.6 82.1L43.1 84.8A33.5 33.5 0 0 0 56.9 84.8L69.4 82.1A16.5 16.5 0 0 0 76.1 52.9A15.5 15.5 0 0 1 70.2 38.2A20.5 20.5 0 1 0 29.8 38.2L25.8 38.9Z'
            },
            {
                tone: 'hair',
                d: 'M23.3 39.3A27 27 0 1 1 76.7 39.3A9 9 0 0 0 80.1 47.8A23 23 0 0 1 70.7 88.5L58.3 91.1A40 40 0 0 1 41.7 91.1L29.3 88.5A23 23 0 0 1 19.9 47.8A9 9 0 0 0 23.3 39.3L25.8 38.9A11.5 11.5 0 0 1 21.5 49.8A20.5 20.5 0 0 0 29.8 86.1L42.3 88.7A37.5 37.5 0 0 0 57.7 88.7L70.2 86.1A20.5 20.5 0 0 0 78.5 49.8A11.5 11.5 0 0 1 74.2 38.9A24.5 24.5 0 1 0 25.8 38.9L23.3 39.3Z'
            },
            {
                tone: 'hair',
                d: 'M40 75.5A10 10 0 1 1 60 75.5A10 10 0 1 1 40 75.5Z'
            },
            {
                tone: 'inner',
                d: 'M42.9 74A3.3 2.1 -35 1 1 48.3 70.2A3.3 2.1 -35 1 1 42.9 74Z'
            }
        ],
        face: [
            50,
            46
        ]
    },
    melon: {
        body: 'M7 35A5 5 0 0 1 12 30H88A5 5 0 0 1 93 35V42A23 23 0 0 1 90.2 53L78.1 75.3A32 32 0 0 1 21.9 75.3L9.8 53A23 23 0 0 1 7 42Z',
        parts: [
            {
                tone: 'leaf',
                d: 'M93 37V42A23 23 0 0 1 90.2 53L78.1 75.3A32 32 0 0 1 21.9 75.3L9.8 53A23 23 0 0 1 7 42V37H12.7A18 18 0 0 0 14.2 50.6L26.3 72.9A27 27 0 0 0 73.7 72.9L85.8 50.6A18 18 0 0 0 87.3 37Z'
            },
            {
                tone: 'inner',
                d: 'M87.3 37A18 18 0 0 1 85.8 50.6L73.7 72.9A27 27 0 0 1 26.3 72.9L14.2 50.6A18 18 0 0 1 12.7 37H16.4A14.5 14.5 0 0 0 17.3 48.9L29.3 71.2A23.5 23.5 0 0 0 70.7 71.2L82.7 48.9A14.5 14.5 0 0 0 83.6 37Z'
            },
            {
                tone: 'hair',
                d: 'M27.2 61.5A2.3 3.5 40 1 1 30.8 64.5A2.3 3.5 40 1 1 27.2 61.5Z'
            },
            {
                tone: 'hair',
                d: 'M47.7 79A2.3 3.5 0 1 1 52.3 79A2.3 3.5 0 1 1 47.7 79Z'
            },
            {
                tone: 'hair',
                d: 'M69.2 64.5A2.3 3.5 -40 1 1 72.8 61.5A2.3 3.5 -40 1 1 69.2 64.5Z'
            }
        ],
        face: [
            50,
            54
        ]
    }
};
const GARDEN = {
    sprout: {
        body: 'M50 34C72 34 86 50 86 66C86 80 72 88 50 88C28 88 14 80 14 66C14 50 28 34 50 34Z',
        parts: [
            {
                tone: 'leaf',
                d: 'M51 35C50 25 54 17 62 14C69 12 75 14 77 15C76 23 69 30 60 31C56 31 53 32 51 35Z'
            },
            {
                tone: 'leaf',
                d: 'M49 35C47 29 41 25 33 25C32 31 38 35 47 36Z'
            }
        ],
        face: [
            50,
            64
        ]
    },
    mushroom: {
        body: 'M50 20C74 20 91 34 91 52C91 60 84 64 74 64C70 64 68 66 68 70V78C68 86 62 90 50 90C38 90 32 86 32 78V70C32 66 30 64 26 64C16 64 9 60 9 52C9 34 26 20 50 20Z',
        face: [
            50,
            52
        ]
    },
    acorn: {
        body: 'M16 36H84C86 62 74 90 50 90C26 90 14 62 16 36Z',
        parts: [
            {
                tone: 'body',
                d: 'M45 20V9Q45 5 50 5Q55 5 55 9V20Z'
            },
            {
                tone: 'body',
                d: 'M6 38C6 24 26 18 50 18C74 18 94 24 94 38C94 42 91 44 87 44H13C9 44 6 42 6 38Z'
            },
            {
                tone: 'inner',
                d: 'M11 37C11 27 28 22.5 50 22.5C72 22.5 89 27 89 37C89 38.5 88 39.5 86.5 39.5H13.5C12 39.5 11 38.5 11 37Z'
            }
        ],
        face: [
            50,
            68
        ]
    },
    cactus: {
        body: 'M28 32A22 22 0 0 1 72 32V80Q72 90 62 90H38Q28 90 28 80Z',
        parts: [
            {
                tone: 'body',
                d: 'M32 58H18V42A6 6 0 0 0 6 42V62Q6 70 14 70H32Z'
            },
            {
                tone: 'body',
                d: 'M68 46H82V32A6 6 0 0 1 94 32V50Q94 58 86 58H68Z'
            }
        ],
        face: [
            50,
            54
        ]
    },
    eggplant: {
        body: 'M38.1 31.4A14 14 0 1 1 65.8 32.3A18 18 0 0 0 74.5 50.8A21 21 0 0 1 63.2 90L37.2 89A21 21 0 0 1 28.4 49.3A18 18 0 0 0 38.1 31.4Z',
        parts: [
            {
                tone: 'leaf',
                d: 'M32.5 46.4A18 18 0 0 0 38.1 31.4A14 14 0 1 1 65.8 32.3A18 18 0 0 0 70.4 47.5A3.5 3.5 0 0 1 67 46.3L64 42.5A2.5 2.5 0 0 0 60.1 42.5L54.9 49.2A3.5 3.5 0 0 1 49.3 49.1L44.8 42.6A2.5 2.5 0 0 0 40.9 42.3L37.4 46.2A3.5 3.5 0 0 1 32.5 46.4Z'
            },
            {
                tone: 'leaf',
                d: 'M56.1 24.7L59.1 10.7A3.2 3.2 0 0 0 52.9 9.3L49.9 23.3A3.2 3.2 0 0 0 56.1 24.7Z'
            }
        ],
        face: [
            51,
            68
        ]
    }
};
const OBJECT = {
    cottage: {
        body: 'M75.8 31.6L88.7 43A4 4 0 0 1 86 50H82.5A2.5 2.5 0 0 0 80 52.4V82A6 6 0 0 1 74 88H26A6 6 0 0 1 20 82V52A2.5 2.5 0 0 0 17.5 50H14A4 4 0 0 1 11.3 43L47.3 11A4 4 0 0 1 52.7 11L60.8 18.3A2.5 2.5 0 0 0 65 16.4V14A2 2 0 0 1 67 12H73A2 2 0 0 1 75 14V30A2.5 2.5 0 0 0 75.8 31.6Z',
        parts: [
            {
                tone: 'hair',
                d: 'M75.8 31.6L88.7 43A4 4 0 0 1 86 50H14A4 4 0 0 1 11.3 43L47.3 11A4 4 0 0 1 52.7 11L60.8 18.3A2.5 2.5 0 0 0 65 16.4V14A2 2 0 0 1 67 12H73A2 2 0 0 1 75 14V30A2.5 2.5 0 0 0 75.8 31.6Z'
            },
            {
                tone: 'inner',
                d: 'M54.2 33A4.2 4.2 0 0 1 45.8 33A4.2 4.2 0 0 1 54.2 33Z'
            }
        ],
        face: [
            50,
            69
        ]
    },
    chat: {
        body: 'M19.1 69.8A24 24 0 0 1 10 51V41A24 24 0 0 1 34 17H66A24 24 0 0 1 90 41V51A24 24 0 0 1 66 75H43.7A5 5 0 0 0 40.5 76.2L21.6 91.9A2.5 2.5 0 0 1 17.6 89.4L20.9 74.9A5 5 0 0 0 19.1 69.8Z',
        face: [
            50,
            46
        ]
    },
    gift: {
        body: 'M82 50.2V85A6 6 0 0 1 76 91H24A6 6 0 0 1 18 85V50.2A3 3 0 0 0 16.2 47.5A5.5 5.5 0 0 1 13 42.5V37.5A5.5 5.5 0 0 1 18.5 32H81.5A5.5 5.5 0 0 1 87 37.5V42.5A5.5 5.5 0 0 1 83.8 47.5A3 3 0 0 0 82 50.2Z',
        parts: [
            {
                tone: 'hair',
                d: 'M81.5 32A5.5 5.5 0 0 1 87 37.5V42.5A5.5 5.5 0 0 1 81.5 48H18.5A5.5 5.5 0 0 1 13 42.5V37.5A5.5 5.5 0 0 1 18.5 32H81.5Z'
            },
            {
                tone: 'leaf',
                d: 'M48.3 35.7L45 41.6A3.4 3.4 0 1 1 39.1 38.2L41.9 33.9A2 2 0 0 0 40.2 30.8L35.3 31A8 8 0 1 1 40.1 16.8L46.4 22A2 2 0 0 0 48.3 22.3A5 5 0 0 1 51.7 22.3A2 2 0 0 0 53.6 22L59.9 16.8A8 8 0 1 1 64.7 31L59.8 30.8A2 2 0 0 0 58.1 33.9L60.9 38.2A3.4 3.4 0 1 1 55 41.6L51.7 35.7A2 2 0 0 0 48.3 35.7Z'
            }
        ],
        face: [
            50,
            69
        ]
    },
    bulb: {
        body: 'M41 89A4 4 0 0 1 37 85V77A4 4 0 0 1 37.3 75.5A3 3 0 0 0 37.5 73.6L35.7 65.5A3 3 0 0 0 34.3 63.6A30 30 0 0 1 20 38A30 30 0 0 1 80 38A30 30 0 0 1 65.7 63.6A3 3 0 0 0 64.3 65.5L62.5 73.6A3 3 0 0 0 62.7 75.5A4 4 0 0 1 63 77V85A4 4 0 0 1 59 89A3 3 0 0 0 56 92A2 2 0 0 1 54 93H46A2 2 0 0 1 44 91A3 3 0 0 0 41 89Z',
        parts: [
            {
                tone: 'hair',
                d: 'M62.5 74A3 3 0 0 0 62.7 75.5A4 4 0 0 1 63 77V85A4 4 0 0 1 59 89A3 3 0 0 0 56 92A2 2 0 0 1 54 93H46A2 2 0 0 1 44 91A3 3 0 0 0 41 89A4 4 0 0 1 37 85V77A4 4 0 0 1 37.3 75.5A3 3 0 0 0 37.5 74H62.5Z'
            },
            {
                tone: 'inner',
                d: 'M41.5 81.2A1.2 1.2 0 0 1 41.5 78.8H58.5A1.2 1.2 0 0 1 58.5 81.2H41.5Z'
            },
            {
                tone: 'inner',
                d: 'M25.1 36A25 25 0 0 1 46 13.3V19.4A24 24 0 0 0 30.8 36H25.1Z'
            }
        ],
        face: [
            50,
            39
        ]
    }
};
const HEAD = 'M18 56A32 31 0 1 1 82 56A32 31 0 1 1 18 56Z';
const PEOPLE = {
    bob: {
        body: HEAD,
        parts: [
            {
                tone: 'hair',
                d: 'M13 76C11 48 24 20 50 20C76 20 89 48 87 76C86.5 80 82 81 80.5 77.5L79 52C75 46.5 64 44 50 44C36 44 25 46.5 21 52L19.5 77.5C18 81 13.5 80 13 76Z'
            }
        ],
        face: [
            50,
            69
        ]
    },
    topknot: {
        body: HEAD,
        parts: [
            {
                tone: 'hair',
                d: 'M18 54C18 35 32 23.5 50 23.5C68 23.5 82 35 82 54C76 45 64 41 50 41C36 41 24 45 18 54Z'
            },
            {
                tone: 'hair',
                d: 'M39 15A11 11 0 1 1 61 15A11 11 0 1 1 39 15Z'
            }
        ],
        face: [
            50,
            67
        ]
    },
    spiky: {
        body: HEAD,
        parts: [
            {
                tone: 'hair',
                d: 'M18 54C18 42 21 35 26 30C22 25 21 19 23 15C29 17 34 20 37 23C38 17 41 11 45 8C49 12 52 17 53 22C57 17 62 13 68 12C68 18 67 23 65 26C71 25 76 25 80 27C79 31 77 34 75 36C79 41 82 47 82 54C76 45 64 41 50 41C36 41 24 45 18 54Z'
            }
        ],
        face: [
            50,
            67
        ]
    },
    curly: {
        body: HEAD,
        parts: [
            {
                tone: 'hair',
                d: 'M14 62C9 57 10 49 15 46C12 39 17 31 24 30C25 22 33 17 40 20C44 14 56 14 60 20C67 17 75 22 76 30C83 31 88 39 85 46C90 49 91 57 86 62C83 53 76 46 66 44C61 47 55 47 50 44C45 47 39 47 34 44C24 46 17 53 14 62Z'
            }
        ],
        face: [
            50,
            69
        ]
    },
    twinbuns: {
        body: HEAD,
        parts: [
            {
                tone: 'hair',
                d: 'M18 54C18 35 32 23.5 50 23.5C68 23.5 82 35 82 54C76 45 64 41 50 41C36 41 24 45 18 54Z'
            },
            {
                tone: 'hair',
                d: 'M8 49A9.5 9.5 0 1 1 27 49A9.5 9.5 0 1 1 8 49Z'
            },
            {
                tone: 'hair',
                d: 'M73 49A9.5 9.5 0 1 1 92 49A9.5 9.5 0 1 1 73 49Z'
            }
        ],
        face: [
            50,
            67
        ]
    }
};
const PETAL = {
    cloud: {
        body: 'M26 84C16 84 10 77 10 69C10 61 17 55 25 55C25 42 36 32 49 32C60 32 68 39 71 47C81 46 90 54 90 65C90 76 83 84 74 84Z',
        face: [
            50,
            64
        ]
    },
    drop: {
        body: 'M50 12C60 30 82 44 82 64C82 80 68 90 50 90C32 90 18 80 18 64C18 44 40 30 50 12Z',
        face: [
            50,
            64
        ]
    },
    leaf: {
        body: 'M82 14C87 40 85 57 75 72C65 86 46 91 32 84C18 77 12 62 18 48C27 28 54 16 82 14Z',
        parts: [
            {
                tone: 'body',
                d: 'M24 78L12 92Q10 95 13 95Q16 95 18 93L30 82Z'
            }
        ],
        face: [
            48,
            60
        ]
    },
    flower: loop('flower'),
    clover: {
        body: 'M52.9 23.7A18 18 0 0 1 78.3 49.1Q75 52 78.3 54.9A18 18 0 0 1 52.9 80.3Q50 77 47.1 80.3A18 18 0 0 1 21.7 54.9Q25 52 21.7 49.1A18 18 0 0 1 47.1 23.7Q50 27 52.9 23.7Z',
        parts: [
            {
                tone: 'body',
                d: 'M47 76V86Q47 92 51.5 92Q56 92 56 86V76Z'
            }
        ],
        face: [
            50,
            52
        ]
    }
};
const POLYGON = {
    hex: loop('hex'),
    onigiri: {
        body: 'M50 20C58 20 64 25 69 33L85 62C91 73 88 88 73 88H27C12 88 9 73 15 62L31 33C36 25 42 20 50 20Z',
        face: [
            50,
            62
        ]
    },
    gem: {
        body: loop('gem').body,
        face: [
            50,
            60
        ]
    }
};
const RECT = {
    tofu: {
        body: 'M28 32H72Q86 32 86 46V74Q86 88 72 88H28Q14 88 14 74V46Q14 32 28 32Z',
        face: [
            50,
            61
        ]
    },
    pill: {
        body: 'M36 36H64A24 24 0 0 1 64 84H36A24 24 0 0 1 36 36Z',
        face: [
            50,
            60
        ]
    }
};
const ROUND = {
    mochi: {
        body: 'M50 26C74 26 88 44 88 63C88 80 73 88 50 88C27 88 12 80 12 63C12 44 26 26 50 26Z',
        face: [
            50,
            60
        ]
    },
    circle: {
        body: 'M14 52A36 36 0 1 1 86 52A36 36 0 1 1 14 52Z',
        face: [
            50,
            54
        ]
    },
    blob: loop('blob'),
    pebble: loop('pebble'),
    egg: loop('egg'),
    bun: {
        body: 'M50 27C55 27 58 33 64 37C79 42 90 55 90 69C90 82 74 88 50 88C26 88 10 82 10 69C10 55 21 42 36 37C42 33 45 27 50 27Z',
        parts: [
            {
                tone: 'inner',
                d: 'M48.6 31C45.5 35.5 41.5 39.5 36.5 43C42.5 41.5 47 38 50.2 33.5Z'
            },
            {
                tone: 'inner',
                d: 'M51.4 31C54.5 35.5 58.5 39.5 63.5 43C57.5 41.5 53 38 49.8 33.5Z'
            },
            {
                tone: 'inner',
                d: 'M50 31.5C48.4 35 48.4 39 50 43C51.6 39 51.6 35 50 31.5Z'
            }
        ],
        face: [
            50,
            64
        ]
    }
};
const SEA = {
    fish: {
        body: 'M9 52A33 30 0 1 1 75 52A33 30 0 1 1 9 52Z',
        parts: [
            {
                tone: 'body',
                d: 'M64 52C70 44 76 34 86 26C93 21 97 26 96 33C95 40 91 46 91 52C91 58 95 64 96 71C97 78 93 83 86 78C76 70 70 60 64 52Z'
            }
        ],
        face: [
            38,
            52
        ]
    },
    octopus: {
        body: 'M19 38A31 31 0 1 1 81 38A31 31 0 1 1 19 38Z',
        parts: [
            {
                tone: 'body',
                d: 'M23.1 51L21 56.8L18.9 62.1L16.8 66.5L14.8 70L13 72.3L11.6 73.5L10.3 74L8 73.5L6 73L4 73.5L2.5 75L2 77L2.5 79L4 80.5L8.9 82.8L14.3 82.9L19.3 80.9L23.5 77.5L27.2 73.2L30.6 68.3L33.8 62.8L36.9 57Z'
            },
            {
                tone: 'body',
                d: 'M36 59.6L35.9 65.2L35.5 70.2L34.9 74.6L34 78.1L32.9 80.8L31.7 82.7L30.2 83.8L28 84.5L26.2 85L24.9 86.3L24.5 88L25 89.8L26.3 91.1L28 91.5L32.7 91.1L36.9 89.1L40.2 85.9L42.7 81.9L44.7 77.2L46.1 72L47.2 66.4L48 60.4Z'
            },
            {
                tone: 'body',
                d: 'M52 60.4L52.8 66.4L53.9 72L55.3 77.2L57.3 81.9L59.8 85.9L63.1 89.1L67.3 91.1L72 91.5L73.7 91.1L75 89.8L75.5 88L75.1 86.3L73.8 85L72 84.5L69.8 83.8L68.3 82.7L67.1 80.8L66 78.1L65.1 74.6L64.5 70.2L64.1 65.2L64 59.6Z'
            },
            {
                tone: 'body',
                d: 'M63.1 57L66.2 62.8L69.4 68.3L72.8 73.2L76.5 77.5L80.7 80.9L85.7 82.9L91.1 82.8L96 80.5L97.5 79L98 77L97.5 75L96 73.5L94 73L92 73.5L89.7 74L88.4 73.5L87 72.3L85.2 70L83.2 66.5L81.1 62.1L79 56.8L76.9 51Z'
            }
        ],
        face: [
            50,
            40
        ]
    },
    seal: {
        body: 'M34 86.4A32 32 0 1 1 71.9 56.9A10 10 0 0 0 78.1 66.8A37 37 0 0 1 82.6 69A3 3 0 0 0 87.1 66.3A4.4 4.4 0 1 1 95.7 67.2L93.2 76.1A3.4 3.4 0 0 0 93.6 78.7L96.8 84.3A4.4 4.4 0 1 1 88.7 87.6A5 5 0 0 0 82.2 84.2A80 80 0 0 1 40 87.6L34 86.4Z',
        parts: [
            {
                tone: 'inner',
                d: 'M71.4 87.3A80 80 0 0 1 40 87.6L37.7 87.1A44 16 0 0 1 71.4 87.3Z'
            }
        ],
        face: [
            39,
            54
        ]
    },
    puffer: {
        body: 'M42.1 26A32 32 0 0 1 45.4 25.3A1.5 1.5 0 0 0 46.7 24.2L48.5 17.6A1.6 1.6 0 0 1 51.5 17.6L53.3 24.2A1.5 1.5 0 0 0 54.6 25.3A32 32 0 0 1 57.9 26A1.5 1.5 0 0 0 59.5 25.5L63.7 20A1.6 1.6 0 0 1 66.5 21.2L65.6 28A1.5 1.5 0 0 0 66.3 29.5A32 32 0 0 1 69.2 31.4A1.5 1.5 0 0 0 70.8 31.5L76.8 28A1.6 1.6 0 0 1 79 30.2L75.5 36.2A1.5 1.5 0 0 0 75.6 37.8A32 32 0 0 1 77.5 40.7A1.5 1.5 0 0 0 79 41.4L85.8 40.5A1.6 1.6 0 0 1 87 43.3L81.5 47.5A1.5 1.5 0 0 0 81 49.1A32 32 0 0 1 81.7 52.4A1.5 1.5 0 0 0 82.8 53.7L89.4 55.5A1.6 1.6 0 0 1 89.4 58.5L82.8 60.3A1.5 1.5 0 0 0 81.7 61.6A32 32 0 0 1 81 64.9A1.5 1.5 0 0 0 81.5 66.5L87 70.7A1.6 1.6 0 0 1 85.8 73.5L79 72.6A1.5 1.5 0 0 0 77.5 73.3A32 32 0 0 1 75.6 76.2A1.5 1.5 0 0 0 75.5 77.8L79 83.8A1.6 1.6 0 0 1 76.8 86L70.8 82.5A1.5 1.5 0 0 0 69.2 82.6A32 32 0 0 1 30.8 82.6A1.5 1.5 0 0 0 29.2 82.5L23.2 86A1.6 1.6 0 0 1 21 83.8L24.5 77.8A1.5 1.5 0 0 0 24.4 76.2A32 32 0 0 1 22.5 73.3A1.5 1.5 0 0 0 21 72.6L14.2 73.5A1.6 1.6 0 0 1 13 70.7L18.5 66.5A1.5 1.5 0 0 0 19 64.9A32 32 0 0 1 18.3 61.6A1.5 1.5 0 0 0 17.2 60.3L10.6 58.5A1.6 1.6 0 0 1 10.6 55.5L17.2 53.7A1.5 1.5 0 0 0 18.3 52.4A32 32 0 0 1 19 49.1A1.5 1.5 0 0 0 18.5 47.5L13 43.3A1.6 1.6 0 0 1 14.2 40.5L21 41.4A1.5 1.5 0 0 0 22.5 40.7A32 32 0 0 1 24.4 37.8A1.5 1.5 0 0 0 24.5 36.2L21 30.2A1.6 1.6 0 0 1 23.2 28L29.2 31.5A1.5 1.5 0 0 0 30.8 31.4A32 32 0 0 1 33.7 29.5A1.5 1.5 0 0 0 34.4 28L33.5 21.2A1.6 1.6 0 0 1 36.3 20L40.5 25.5A1.5 1.5 0 0 0 42.1 26Z',
        parts: [
            {
                tone: 'inner',
                d: 'M68.6 83.1A32 32 0 0 1 31.4 83.1A30 19 0 0 1 68.6 83.1Z'
            }
        ],
        face: [
            50,
            54
        ]
    }
};
const TREAT = {
    pudding: {
        body: 'M20.3 38.7A10 10 0 0 1 30 31H70A10 10 0 0 1 79.7 38.7L88.7 76.7A10 10 0 0 1 79 89H21A10 10 0 0 1 11.3 76.7Z',
        parts: [
            {
                tone: 'hair',
                d: 'M24.8 44.8A7.5 7.5 0 1 1 21.7 30.1L39.4 26.9A60 60 0 0 1 60.6 26.9L78.3 30.1A7.5 7.5 0 1 1 73.8 44.3A3 3 0 0 0 69.6 47.2A4.6 4.6 0 1 1 60.4 47.8A5 5 0 0 0 51.1 45.5A3 3 0 0 1 46.3 46A5 5 0 0 0 37.6 49.2A4.6 4.6 0 1 1 28.5 48.2A3 3 0 0 0 24.8 44.8Z'
            },
            {
                tone: 'leaf',
                d: 'M51 28A16 16 0 0 1 68 12A16 16 0 0 1 51 28Z'
            }
        ],
        face: [
            50,
            70
        ]
    },
    toast: {
        body: 'M17.3 48.9A16 16 0 0 1 30.8 21.2L43.1 23.4A40 40 0 0 0 56.9 23.4L69.2 21.2A16 16 0 0 1 82.7 48.9L82 49.5A6 6 0 0 0 80 54V81A9 9 0 0 1 71 90H29A9 9 0 0 1 20 81V54A6 6 0 0 0 18 49.5Z',
        parts: [
            {
                tone: 'hair',
                d: 'M17.3 48.9A16 16 0 0 1 30.8 21.2L43.1 23.4A40 40 0 0 0 56.9 23.4L69.2 21.2A16 16 0 0 1 82.7 48.9L82 49.5A6 6 0 0 0 80 54V81A9 9 0 0 1 71 90H29A9 9 0 0 1 20 81V54A6 6 0 0 0 18 49.5L17.3 48.9L21.6 44.1L22.4 44.7A12.5 12.5 0 0 1 26.5 54V81A2.5 2.5 0 0 0 29 83.5H71A2.5 2.5 0 0 0 73.5 81V54A12.5 12.5 0 0 1 77.6 44.7L78.4 44.1A9.5 9.5 0 0 0 70.4 27.6L58 29.8A46.5 46.5 0 0 1 42 29.8L29.6 27.6A9.5 9.5 0 0 0 21.6 44.1L17.3 48.9Z'
            }
        ],
        face: [
            50,
            60
        ]
    },
    icecream: {
        body: 'M50 6C68 6 82 19 82 36C82 40 81 44 80 47C82 51 80 56 75 56H74L54 93C52 96 48 96 46 93L26 56H25C20 56 18 51 20 47C19 44 18 40 18 36C18 19 32 6 50 6Z',
        parts: [
            {
                tone: 'hair',
                d: 'M26.1 54H33C33.6 54 34 54.6 34 55.5V59C34 62.5 36 64.5 38.5 64.5C41 64.5 43 62.5 43 59V55.5C43 54.6 43.4 54 44 54H54C54.6 54 55 54.6 55 55.5V62C55 65.5 57 67.5 59.5 67.5C62 67.5 64 65.5 64 62V55.5C64 54.6 64.4 54 65 54H73.9L53.9 91C52 94.5 48 94.5 46.1 91Z'
            },
            {
                tone: 'inner',
                d: 'M40.1 66.9L51.9 88.8A1.3 1.3 0 0 0 54.2 87.6L42.4 65.6A1.3 1.3 0 0 0 40.1 66.9Z'
            },
            {
                tone: 'inner',
                d: 'M56 68.7L45.8 87.6A1.3 1.3 0 0 0 48.1 88.8L58.3 69.9A1.3 1.3 0 0 0 56 68.7Z'
            },
            {
                tone: 'inner',
                d: 'M43.8 58.1L56.2 80.9A1.3 1.3 0 0 0 58.5 79.7L46.1 56.8A1.3 1.3 0 0 0 43.8 58.1Z'
            },
            {
                tone: 'inner',
                d: 'M51.7 60.8L41.5 79.7A1.3 1.3 0 0 0 43.8 80.9L54 62A1.3 1.3 0 0 0 51.7 60.8Z'
            },
            {
                tone: 'inner',
                d: 'M46.1 55.5L43.7 59.9A1.3 1.3 0 0 0 46 61.2L48.4 56.8A1.3 1.3 0 0 0 46.1 55.5Z'
            },
            {
                tone: 'inner',
                d: 'M41.4 64.3L37.3 71.8A1.3 1.3 0 0 0 39.6 73L43.6 65.6A1.3 1.3 0 0 0 41.4 64.3Z'
            }
        ],
        face: [
            50,
            32
        ]
    },
    cupcake: {
        body: 'M14.6 56.8A20 20 0 0 1 35.6 24.8A5 5 0 0 0 42 19.6A8 8 0 1 1 58 19.6A5 5 0 0 0 64.4 24.8A20 20 0 0 1 85.4 56.8L83.1 59.6A4 4 0 0 1 81.5 60.7L78 62.1A1.5 1.5 0 0 0 77 63.2L71.9 86.1A5 5 0 0 1 67 90H33A5 5 0 0 1 28.1 86.1L23 63.2A1.5 1.5 0 0 0 22 62.1L18.5 60.7A4 4 0 0 1 16.9 59.6Z',
        parts: [
            {
                tone: 'hair',
                d: 'M76.8 64.2L71.9 86.1A5 5 0 0 1 67 90H33A5 5 0 0 1 28.1 86.1L23.2 64.2A7.1 7.1 0 0 0 29.7 61.4A1 1 0 0 1 31.3 61.4A7.1 7.1 0 0 0 42.7 61.4A1 1 0 0 1 44.3 61.4A7.1 7.1 0 0 0 55.7 61.4A1 1 0 0 1 57.3 61.4A7.1 7.1 0 0 0 68.7 61.4A1 1 0 0 1 70.3 61.4A7.1 7.1 0 0 0 76.8 64.2Z'
            },
            {
                tone: 'inner',
                d: 'M32.4 70.2L35.7 85.2A1.1 1.1 0 0 0 37.9 84.8L34.6 69.8A1.1 1.1 0 0 0 32.4 70.2Z'
            },
            {
                tone: 'inner',
                d: 'M40.7 70.1L42.3 85.1A1.1 1.1 0 0 0 44.5 84.9L42.8 69.9A1.1 1.1 0 0 0 40.7 70.1Z'
            },
            {
                tone: 'inner',
                d: 'M48.9 70V85A1.1 1.1 0 0 0 51.1 85V70A1.1 1.1 0 0 0 48.9 70Z'
            },
            {
                tone: 'inner',
                d: 'M57.2 69.9L55.5 84.9A1.1 1.1 0 0 0 57.7 85.1L59.3 70.1A1.1 1.1 0 0 0 57.2 69.9Z'
            },
            {
                tone: 'inner',
                d: 'M65.4 69.8L62.1 84.8A1.1 1.1 0 0 0 64.3 85.2L67.6 70.2A1.1 1.1 0 0 0 65.4 69.8Z'
            }
        ],
        face: [
            50,
            42
        ]
    },
    fries: {
        body: 'M28.2 92A5 5 0 0 1 23.2 87.5L18.5 44.7A2.5 2.5 0 0 0 18.4 44.5L16.2 33.1A2.8 2.8 0 0 1 18.4 29.8L20.2 29.5A2.8 2.8 0 0 1 23.5 31.7L26.4 46.9A0.9 0.9 0 0 0 27.1 47.6L28.7 48.1A0.9 0.9 0 0 0 29.9 47.1L27 22.5A2.8 2.8 0 0 1 29.5 19.4L31.3 19.2A2.8 2.8 0 0 1 34.4 21.7L37.6 49.3A0.9 0.9 0 0 0 38.3 50.1L39.8 50.3A0.9 0.9 0 0 0 40.8 49.4L39.6 16A2.8 2.8 0 0 1 42.3 13.1L44.1 13A2.8 2.8 0 0 1 47 15.7L48.2 50.1A0.9 0.9 0 0 0 49.1 51H50.4A0.9 0.9 0 0 0 51.3 50.1L52.3 19.7A2.8 2.8 0 0 1 55.2 17L57 17.1A2.8 2.8 0 0 1 59.7 20L58.7 49.5A0.9 0.9 0 0 0 59.7 50.4L61.2 50.2A0.9 0.9 0 0 0 61.9 49.4L65.9 14.7A2.8 2.8 0 0 1 69 12.2L70.8 12.4A2.8 2.8 0 0 1 73.2 15.5L69.6 47.2A0.9 0.9 0 0 0 70.8 48.2L72.4 47.8A0.9 0.9 0 0 0 73 47.1L77 26.8A2.8 2.8 0 0 1 80.2 24.6L82 24.9A2.8 2.8 0 0 1 84.2 28.2L81 44.7A2.5 2.5 0 0 0 81 44.9L76.7 87.5A5 5 0 0 1 71.8 92Z',
        parts: [
            {
                tone: 'inner',
                d: 'M18.4 44.1L16.2 33.1A2.8 2.8 0 0 1 18.4 29.8L20.2 29.5A2.8 2.8 0 0 1 23.5 31.7L26.4 46.9A0.9 0.9 0 0 0 26.5 47A81.3 81.3 0 0 1 18.4 44.1Z'
            },
            {
                tone: 'inner',
                d: 'M29.5 47.9A0.9 0.9 0 0 0 29.9 47.1L27 22.5A2.8 2.8 0 0 1 29.5 19.4L31.3 19.2A2.8 2.8 0 0 1 34.4 21.7L37.6 49.3A0.9 0.9 0 0 0 37.6 49.6A81.3 81.3 0 0 1 29.5 47.9Z'
            },
            {
                tone: 'inner',
                d: 'M40.6 50A0.9 0.9 0 0 0 40.8 49.4L39.6 16A2.8 2.8 0 0 1 42.3 13.1L44.1 13A2.8 2.8 0 0 1 47 15.7L48.2 50.1A0.9 0.9 0 0 0 48.3 50.5A81.3 81.3 0 0 1 40.6 50Z'
            },
            {
                tone: 'inner',
                d: 'M51.2 50.5A0.9 0.9 0 0 0 51.3 50.1L52.3 19.7A2.8 2.8 0 0 1 55.2 17L57 17.1A2.8 2.8 0 0 1 59.7 20L58.7 49.5A0.9 0.9 0 0 0 58.9 50A81.3 81.3 0 0 1 51.2 50.5Z'
            },
            {
                tone: 'inner',
                d: 'M61.9 49.6A0.9 0.9 0 0 0 61.9 49.4L65.9 14.7A2.8 2.8 0 0 1 69 12.2L70.8 12.4A2.8 2.8 0 0 1 73.2 15.5L69.6 47.2A0.9 0.9 0 0 0 69.9 48A81.3 81.3 0 0 1 61.9 49.6Z'
            },
            {
                tone: 'inner',
                d: 'M73 47.2A0.9 0.9 0 0 0 73 47.1L77 26.8A2.8 2.8 0 0 1 80.2 24.6L82 24.9A2.8 2.8 0 0 1 84.2 28.2L81.1 44.3A81.3 81.3 0 0 1 73 47.2Z'
            }
        ],
        face: [
            50,
            71
        ]
    },
    candy: {
        body: 'M21.5 39.9A31 31 0 0 1 78.5 39.9A6 6 0 0 0 90 38.1A3.5 3.5 0 1 1 97 39.1L96 44.7A2 2 0 0 0 96.2 45.9L98.7 50.9A2.5 2.5 0 0 1 98.7 53.1L96.2 58.1A2 2 0 0 0 96 59.3L97 64.9A3.5 3.5 0 1 1 90 65.9A6 6 0 0 0 78.5 64.1A31 31 0 0 1 21.5 64.1A6 6 0 0 0 10 65.9A3.5 3.5 0 1 1 3 64.9L4 59.3A2 2 0 0 0 3.8 58.1L1.3 53.1A2.5 2.5 0 0 1 1.3 50.9L3.8 45.9A2 2 0 0 0 4 44.7L3 39.1A3.5 3.5 0 1 1 10 38.1A6 6 0 0 0 21.5 39.9Z',
        parts: [
            {
                tone: 'hair',
                d: 'M79.6 41.6A6 6 0 0 0 90 38.1A3.5 3.5 0 1 1 97 39.1L96 44.7A2 2 0 0 0 96.2 45.9L98.7 50.9A2.5 2.5 0 0 1 98.7 53.1L96.2 58.1A2 2 0 0 0 96 59.3L97 64.9A3.5 3.5 0 1 1 90 65.9A6 6 0 0 0 79.6 62.4A31.4 31.4 0 0 0 79.6 41.6Z'
            },
            {
                tone: 'hair',
                d: 'M20.4 62.4A6 6 0 0 0 10 65.9A3.5 3.5 0 1 1 3 64.9L4 59.3A2 2 0 0 0 3.8 58.1L1.3 53.1A2.5 2.5 0 0 1 1.3 50.9L3.8 45.9A2 2 0 0 0 4 44.7L3 39.1A3.5 3.5 0 1 1 10 38.1A6 6 0 0 0 20.4 41.6A31.4 31.4 0 0 0 20.4 62.4Z'
            },
            {
                tone: 'inner',
                d: 'M84.5 51.2L93 44.7A0.9 0.9 0 0 0 92 43.3L83.5 49.8A0.9 0.9 0 0 0 84.5 51.2Z'
            },
            {
                tone: 'inner',
                d: 'M83.5 54.2L92 60.7A0.9 0.9 0 0 0 93 59.3L84.5 52.8A0.9 0.9 0 0 0 83.5 54.2Z'
            },
            {
                tone: 'inner',
                d: 'M16.5 49.8L8 43.3A0.9 0.9 0 0 0 7 44.7L15.5 51.2A0.9 0.9 0 0 0 16.5 49.8Z'
            },
            {
                tone: 'inner',
                d: 'M15.5 52.8L7 59.3A0.9 0.9 0 0 0 8 60.7L16.5 54.2A0.9 0.9 0 0 0 15.5 52.8Z'
            }
        ],
        face: [
            50,
            52
        ]
    },
    burger: {
        body: 'M14.9 48.3A18 18 0 0 1 24.6 18.3L43.9 14.6A32 32 0 0 1 56.1 14.6L75.4 18.3A18 18 0 0 1 85.1 48.3A1.5 1.5 0 0 0 87.1 50.6A3.5 3.5 0 1 1 89.8 56.9A2 2 0 0 0 89.2 60.6A4.5 4.5 0 0 1 88.7 68.7A2 2 0 0 0 87.8 71.8A10 10 0 0 1 80 88H20A10 10 0 0 1 12.2 71.8A2 2 0 0 0 11.3 68.7A4.5 4.5 0 0 1 10.8 60.6A2 2 0 0 0 10.2 56.9A3.5 3.5 0 1 1 12.9 50.6A1.5 1.5 0 0 0 14.9 48.3Z',
        parts: [
            {
                tone: 'hair',
                d: 'M88.3 58.5A2 2 0 0 0 89.2 60.6A4.5 4.5 0 0 1 88.7 68.7A2 2 0 0 0 87.4 70.5H12.6A2 2 0 0 0 11.3 68.7A4.5 4.5 0 0 1 10.8 60.6A2 2 0 0 0 11.7 58.5H88.3Z'
            },
            {
                tone: 'leaf',
                d: 'M84.8 49.7A1.5 1.5 0 0 0 87.1 50.6A3.5 3.5 0 0 1 92.4 54.4A3.4 3.4 0 0 0 89 56.2A3.4 3.4 0 0 1 83 56.2A3.4 3.4 0 0 0 77 56.2A3.4 3.4 0 0 1 71 56.2A3.4 3.4 0 0 0 65 56.2A3.4 3.4 0 0 1 59 56.2A3.4 3.4 0 0 0 53 56.2A3.4 3.4 0 0 1 47 56.2A3.4 3.4 0 0 0 41 56.2A3.4 3.4 0 0 1 35 56.2A3.4 3.4 0 0 0 29 56.2A3.4 3.4 0 0 1 23 56.2A3.4 3.4 0 0 0 17 56.2A3.4 3.4 0 0 1 11 56.2A3.4 3.4 0 0 0 7.6 54.4A3.5 3.5 0 0 1 12.9 50.6A1.5 1.5 0 0 0 15.2 49.7H84.8Z'
            },
            {
                tone: 'inner',
                d: 'M35.6 24.5A1.7 2.8 -35 1 1 38.4 22.5A1.7 2.8 -35 1 1 35.6 24.5Z'
            },
            {
                tone: 'inner',
                d: 'M48.3 20.5A1.7 2.8 0 1 1 51.7 20.5A1.7 2.8 0 1 1 48.3 20.5Z'
            },
            {
                tone: 'inner',
                d: 'M61.6 22.5A1.7 2.8 35 1 1 64.4 24.5A1.7 2.8 35 1 1 61.6 22.5Z'
            }
        ],
        face: [
            50,
            35
        ]
    }
};
const CHARACTERS = {
    ...ROUND,
    ...RECT,
    ...POLYGON,
    ...PETAL,
    ...GARDEN,
    ...FRUIT,
    ...TREAT,
    ...FIGURE,
    ...OBJECT,
    ...SEA,
    ...CRITTER,
    ...PEOPLE,
    ...COAL
};
function face_boxes_faceInputsDigest({ points, leftDX, hint, avoid }) {
    const bits = new Float64Array(1);
    const words = new Uint32Array(bits.buffer);
    let h = 0x811c9dc5;
    const mix = (v)=>{
        bits[0] = v;
        h = Math.imul(h ^ words[0], 0x01000193) >>> 0;
        h = Math.imul(h ^ words[1], 0x01000193) >>> 0;
    };
    const ring = (outline)=>{
        mix(outline.length);
        for (const [x, y] of outline){
            mix(x);
            mix(y);
        }
    };
    ring(points);
    mix(leftDX);
    mix(hint ? 1 : 0);
    if (hint) ring([
        hint
    ]);
    mix(avoid.length);
    for (const outline of avoid)ring(outline);
    return h.toString(36);
}
const FACE_BOXES = {
    circle: {
        digest: 'skxwf9',
        box: {
            x: 120,
            y: 120.65,
            sx: 119.0207066192236,
            sy: 106.26848805287821,
            eye: 1,
            leftDX: 0
        }
    },
    mochi: {
        digest: '19kbmws',
        box: {
            x: 120,
            y: 125.44999999999999,
            sx: 92.19560159207754,
            sy: 63.583173511777616,
            eye: 0.9093029643919316,
            leftDX: 0
        }
    },
    blob: {
        digest: '5aq1yg',
        box: {
            x: 115.31050215982721,
            y: 123.83136701401347,
            sx: 93.60413437415649,
            sy: 64.55457543045276,
            eye: 0.9231949832309048,
            leftDX: 0
        }
    },
    pebble: {
        digest: 'qtc8sv',
        box: {
            x: 120,
            y: 120.1382604618361,
            sx: 95.00306819075476,
            sy: 65.51935737293432,
            eye: 0.9369923297903336,
            leftDX: 0
        }
    },
    egg: {
        digest: '4ap5lf',
        box: {
            x: 120,
            y: 119.34942942004064,
            sx: 74.58038218604685,
            sy: 108.14155416976793,
            eye: 1,
            leftDX: 0
        }
    },
    bun: {
        digest: '1heyeut',
        box: {
            x: 120,
            y: 131.45125000000002,
            sx: 79.81779176186348,
            sy: 55.04675293921619,
            eye: 0.85,
            leftDX: 0
        }
    },
    tofu: {
        digest: 'ylq23k',
        box: {
            x: 120,
            y: 121.325,
            sx: 91.77500000000002,
            sy: 63.29310344827588,
            eye: 0.9051546724137932,
            leftDX: 0
        }
    },
    pill: {
        digest: 'cfx6w0',
        box: {
            x: 120,
            y: 120,
            sx: 75.6,
            sy: 52.13793103448276,
            eye: 0.85,
            leftDX: 0
        }
    },
    hex: {
        digest: '1pqtj79',
        box: {
            x: 120,
            y: 119.44361334867664,
            sx: 109.293770134252,
            sy: 75.37501388569103,
            eye: 1,
            leftDX: 0
        }
    },
    onigiri: {
        digest: '9fal48',
        box: {
            x: 119.99999999999996,
            y: 145.2739002932551,
            sx: 82.14017595307917,
            sy: 56.64839720902012,
            eye: 0.85,
            leftDX: 0
        }
    },
    gem: {
        digest: '1f1qier',
        box: {
            x: 120,
            y: 111.85660612092559,
            sx: 89.395503750115,
            sy: 61.65207155180345,
            eye: 0.8816862752623411,
            leftDX: 0
        }
    },
    cloud: {
        digest: '11j9gm5',
        box: {
            x: 122,
            y: 125.95500000000001,
            sx: 71.85,
            sy: 49.55172413793103,
            eye: 0.85,
            leftDX: 0
        }
    },
    drop: {
        digest: '1ys6px8',
        box: {
            x: 120,
            y: 149.9,
            sx: 89.78720378169642,
            sy: 61.92220950461822,
            eye: 0.8855495181255452,
            leftDX: 0
        }
    },
    leaf: {
        digest: 'ke950b',
        box: {
            x: 122.24790812761887,
            y: 124.25555555555556,
            sx: 88.20831774488649,
            sy: 60.83332258268034,
            eye: 0.8699773462549115,
            leftDX: 0
        }
    },
    flower: {
        digest: '19be7ny',
        box: {
            x: 120,
            y: 119.35012594458438,
            sx: 100.741427263833,
            sy: 69.47684638885035,
            eye: 0.9935883802069487,
            leftDX: 0
        }
    },
    clover: {
        digest: 'uuni73',
        box: {
            x: 120.00000000000004,
            y: 108.08247922969944,
            sx: 60.475981526353614,
            sy: 87.69017321321273,
            eye: 0.864867011808383,
            leftDX: 0
        }
    },
    sprout: {
        digest: 'y7e08h',
        box: {
            x: 120,
            y: 154.94360430164986,
            sx: 84.75116077325258,
            sy: 58.44907639534661,
            eye: 0.85,
            leftDX: 0
        }
    },
    mushroom: {
        digest: 'fkfbjj',
        box: {
            x: 120,
            y: 95.24146341463415,
            sx: 77.41653314648099,
            sy: 53.390712514814474,
            eye: 0.85,
            leftDX: 0
        }
    },
    acorn: {
        digest: '1f12l85',
        box: {
            x: 120,
            y: 161.7693181818182,
            sx: 73.05454545454546,
            sy: 50.38244514106584,
            eye: 0.85,
            leftDX: 0
        }
    },
    cactus: {
        digest: '14h9qp5',
        box: {
            x: 120,
            y: 130.88181818181818,
            sx: 41.27586206896552,
            sy: 59.85000000000001,
            eye: 0.85,
            leftDX: 0
        }
    },
    eggplant: {
        digest: '1irrsio',
        box: {
            x: 118.01240095909198,
            y: 170.04888672297113,
            sx: 68.15429816263268,
            sy: 47.00296425009151,
            eye: 0.85,
            leftDX: 0
        }
    },
    pear: {
        digest: 'disxbh',
        box: {
            x: 120.07511247456392,
            y: 148.44665718224178,
            sx: 54.95243544648147,
            sy: 79.68103139739813,
            eye: 0.85,
            leftDX: 0
        }
    },
    apple: {
        digest: '1xxy0xj',
        box: {
            x: 120,
            y: 158.2925545571245,
            sx: 75.73278390360788,
            sy: 52.22950614041923,
            eye: 0.85,
            leftDX: 0
        }
    },
    strawberry: {
        digest: 'topcck',
        box: {
            x: 120,
            y: 140.00454849847569,
            sx: 86.10491848735155,
            sy: 59.38270240507004,
            eye: 0.85,
            leftDX: 0
        }
    },
    cherry: {
        digest: 'jqn5bb',
        box: {
            x: 77.52580645161291,
            y: 161.68344204791055,
            sx: 77.19843848482402,
            sy: 68.92717721859287,
            eye: 0.8997478005406239,
            leftDX: 0
        }
    },
    avocado: {
        digest: '1n7stdv',
        box: {
            x: 120,
            y: 86.18085093839362,
            sx: 47.6608315766348,
            sy: 69.10820578612045,
            eye: 0.85,
            leftDX: 0
        }
    },
    melon: {
        digest: '7esxv7',
        box: {
            x: 120,
            y: 92.54143328617063,
            sx: 57.696267061830284,
            sy: 39.79052900815882,
            eye: 0.85,
            leftDX: 0
        }
    },
    pudding: {
        digest: '16e7s9d',
        box: {
            x: 122,
            y: 175.9685443286943,
            sx: 62.39761142739249,
            sy: 43.03283546716724,
            eye: 0.85,
            leftDX: 0
        }
    },
    toast: {
        digest: '1d4qeuf',
        box: {
            x: 120,
            y: 124.243948641761,
            sx: 50.97805665574425,
            sy: 73.91818215082915,
            eye: 0.85,
            leftDX: 0
        }
    },
    icecream: {
        digest: 'av0hnq',
        box: {
            x: 120,
            y: 66.04117647058823,
            sx: 63.01176470588237,
            sy: 43.45638945233267,
            eye: 0.85,
            leftDX: 0
        }
    },
    cupcake: {
        digest: '1ahk4s6',
        box: {
            x: 120,
            y: 93.69096073170755,
            sx: 60.03568981109157,
            sy: 41.403924007649366,
            eye: 0.85,
            leftDX: 0
        }
    },
    fries: {
        digest: '1lgtqya',
        box: {
            x: 119.39999999999999,
            y: 178.7,
            sx: 61,
            sy: 42.06896551724138,
            eye: 0.85,
            leftDX: 0
        }
    },
    candy: {
        digest: 'jb4uff',
        box: {
            x: 120,
            y: 120,
            sx: 75.53839143594378,
            sy: 67.44499235352123,
            eye: 0.8803999521859247,
            leftDX: 0
        }
    },
    burger: {
        digest: '1mxn287',
        box: {
            x: 120.00000000000004,
            y: 79.02424279809922,
            sx: 62.03087721849792,
            sy: 42.77991532310202,
            eye: 0.85,
            leftDX: 0
        }
    },
    star: {
        digest: 'sj1cs6',
        box: {
            x: 120,
            y: 129.8319170992759,
            sx: 81.30070477682065,
            sy: 56.06945157022114,
            eye: 0.85,
            leftDX: 0
        }
    },
    heart: {
        digest: '1dr8tsc',
        box: {
            x: 120,
            y: 120.48594740813466,
            sx: 83.95909688710695,
            sy: 57.90282543938411,
            eye: 0.85,
            leftDX: 0
        }
    },
    flame: {
        digest: '1me06jb',
        box: {
            x: 130,
            y: 177.88,
            sx: 60.42217127222425,
            sy: 41.67046294636155,
            eye: 0.85,
            leftDX: -2
        }
    },
    bell: {
        digest: '1eybjhu',
        box: {
            x: 120.00000000000003,
            y: 117.05381725479673,
            sx: 51.70619119431395,
            sy: 74.97397723175523,
            eye: 0.85,
            leftDX: 0
        }
    },
    ghost: {
        digest: 'za9icg',
        box: {
            x: 124.70825499364408,
            y: 117.35954337290991,
            sx: 64.98888967815351,
            sy: 94.2338900333226,
            eye: 0.9294061112872735,
            leftDX: 0
        }
    },
    bot: {
        digest: '13n5ark',
        box: {
            x: 120,
            y: 155.91,
            sx: 83.78999999999999,
            sy: 57.786206896551725,
            eye: 0.85,
            leftDX: 0
        }
    },
    crescent: {
        digest: 'o3rw43',
        box: {
            x: 86.9694817677439,
            y: 155.3029277998317,
            sx: 64.6595640342341,
            sy: 44.592802782230414,
            eye: 0.85,
            leftDX: 0
        }
    },
    boba: {
        digest: '1k93hmn',
        box: {
            x: 120,
            y: 168.85253973445197,
            sx: 45.815377279750706,
            sy: 66.43229705563851,
            eye: 0.85,
            leftDX: 0
        }
    },
    planet: {
        digest: '1u0uo58',
        box: {
            x: 120.10302862316807,
            y: 96.44326522437987,
            sx: 60.92092135266645,
            sy: 42.01442851908031,
            eye: 0.85,
            leftDX: 0
        }
    },
    cottage: {
        digest: 'p873w6',
        box: {
            x: 120.00000000000001,
            y: 179.91115185211484,
            sx: 56.8463424998142,
            sy: 39.2043741378029,
            eye: 0.85,
            leftDX: 0
        }
    },
    chat: {
        digest: '1b5lq9l',
        box: {
            x: 120,
            y: 93.90134974078723,
            sx: 86.7825,
            sy: 59.85,
            eye: 0.85591485,
            leftDX: 0
        }
    },
    gift: {
        digest: 'i8g256',
        box: {
            x: 120,
            y: 172.36820379223332,
            sx: 67.33179620776667,
            sy: 46.43572152259771,
            eye: 0.85,
            leftDX: 0
        }
    },
    bulb: {
        digest: 'ze7cz',
        box: {
            x: 120,
            y: 89.59156275122707,
            sx: 55.53430517858915,
            sy: 80.52474250895426,
            eye: 0.85,
            leftDX: 0
        }
    },
    fish: {
        digest: '105uaz1',
        box: {
            x: 89.97317864730582,
            y: 120,
            sx: 82.36969406054442,
            sy: 73.54436969691466,
            eye: 0.9600187842756451,
            leftDX: 0
        }
    },
    octopus: {
        digest: 'trhz4r',
        box: {
            x: 120,
            y: 92.9199977333892,
            sx: 76.29312046677838,
            sy: 68.11885755962355,
            eye: 0.889196319040302,
            leftDX: 0
        }
    },
    seal: {
        digest: '7jmvky',
        box: {
            x: 85.49654919441639,
            y: 114.285925435473,
            sx: 84.93851372502378,
            sy: 75.83795868305694,
            eye: 0.989958377465152,
            leftDX: 0
        }
    },
    puffer: {
        digest: 'mqvg7b',
        box: {
            x: 119.99999999999999,
            y: 131.3593060169162,
            sx: 94.10537512090436,
            sy: 84.02265635795031,
            eye: 1,
            leftDX: 0
        }
    },
    cat: {
        digest: 'kmfrfz',
        box: {
            x: 120,
            y: 143.925,
            sx: 87.89518024793901,
            sy: 60.617365688233804,
            eye: 0.8668889467074316,
            leftDX: 0
        }
    },
    bunny: {
        digest: 'xwt48q',
        box: {
            x: 120,
            y: 159.6286359458055,
            sx: 80.06641849710904,
            sy: 55.21821965317865,
            eye: 0.85,
            leftDX: 0
        }
    },
    bear: {
        digest: '8ww2j6',
        box: {
            x: 120,
            y: 141.075,
            sx: 90.74553118122228,
            sy: 62.58312495256709,
            eye: 0.8950012699466618,
            leftDX: 0
        }
    },
    chick: {
        digest: '3j7vzm',
        box: {
            x: 119.99999999999999,
            y: 128.3765602762557,
            sx: 86.48198451031058,
            sy: 67.56405039868014,
            eye: 0.9228168259653329,
            leftDX: 0
        }
    },
    penguin: {
        digest: 'ftut97',
        box: {
            x: 120,
            y: 119.83022285942839,
            sx: 64.26708724037574,
            sy: 93.18727649854483,
            eye: 0.9190836146246135,
            leftDX: 0
        }
    },
    pig: {
        digest: 'yea1mt',
        box: {
            x: 120,
            y: 128.19823292512532,
            sx: 94.48566980169612,
            sy: 65.16253089772147,
            eye: 0.9318893543683148,
            leftDX: 0
        }
    },
    fox: {
        digest: '1xzrwvf',
        box: {
            x: 91.5,
            y: 144.22915451895042,
            sx: 79.78257791643128,
            sy: 55.0224675285733,
            eye: 0.85,
            leftDX: 0
        }
    },
    lion: {
        digest: 'hs1bw5',
        box: {
            x: 117.52572023471562,
            y: 130.0038026856351,
            sx: 73.90431218323894,
            sy: 65.98599302074905,
            eye: 0.8613547584956497,
            leftDX: 0
        }
    },
    hamster: {
        digest: '14us2po',
        box: {
            x: 120,
            y: 122.92655372814082,
            sx: 89.77569514689864,
            sy: 61.91427251510252,
            eye: 0.885436011238481,
            leftDX: 0
        }
    },
    hedgehog: {
        digest: '3hwvkl',
        box: {
            x: 120.00000000000001,
            y: 153.88938354815724,
            sx: 60.82065096873138,
            sy: 41.945276530159575,
            eye: 0.85,
            leftDX: 0
        }
    },
    koala: {
        digest: 'zkc45b',
        box: {
            x: 120.00000000000001,
            y: 132.10148217344846,
            sx: 65.47619407144416,
            sy: 45.1559959113408,
            eye: 0.85,
            leftDX: 0
        }
    },
    bat: {
        digest: 'xdsx32',
        box: {
            x: 120,
            y: 142.8537059313004,
            sx: 43.66740931492039,
            sy: 63.317743506634564,
            eye: 0.85,
            leftDX: 0
        }
    },
    bob: {
        digest: 'rtytnm',
        box: {
            x: 120,
            y: 157.8927234160526,
            sx: 68.4445871768409,
            sy: 47.203163570235105,
            eye: 0.85,
            leftDX: 0
        }
    },
    topknot: {
        digest: '1fzg4kt',
        box: {
            x: 120,
            y: 172.0343503074881,
            sx: 64.99678298217344,
            sy: 44.82536757391272,
            eye: 0.85,
            leftDX: 0
        }
    },
    spiky: {
        digest: '3owqr6',
        box: {
            x: 120,
            y: 169.11421441730224,
            sx: 68.79451507482545,
            sy: 47.444493155052044,
            eye: 0.85,
            leftDX: 0
        }
    },
    curly: {
        digest: 'yzqpht',
        box: {
            x: 120,
            y: 166.08162073966668,
            sx: 62.823142592154454,
            sy: 43.32630523596859,
            eye: 0.85,
            leftDX: 0
        }
    },
    twinbuns: {
        digest: '1m55m99',
        box: {
            x: 120,
            y: 147.50123038511396,
            sx: 62.97253922977211,
            sy: 43.42933739984284,
            eye: 0.85,
            leftDX: 0
        }
    },
    chunk: {
        digest: '1qd8tm7',
        box: {
            x: 121.1877833280397,
            y: 127.25122859700289,
            sx: 110.52715427002151,
            sy: 76.2256236344976,
            eye: 1,
            leftDX: 0
        }
    },
    lump: {
        digest: '13ghhcz',
        box: {
            x: 119.80774193548388,
            y: 117.56720430107525,
            sx: 111.43669428307297,
            sy: 76.85289260901584,
            eye: 1,
            leftDX: 0
        }
    },
    fluff: {
        digest: '1xddyur',
        box: {
            x: 120.80432253535251,
            y: 119.5942433055862,
            sx: 103.4555668281282,
            sy: 71.34866677801945,
            eye: 1,
            leftDX: 0
        }
    }
};
function distanceToOutline(points, x, y) {
    let best = 1 / 0;
    const n = points.length;
    for(let i = 0; i < n; i++){
        const a = points[i];
        const b = points[i + 1 === n ? 0 : i + 1];
        const abx = b[0] - a[0];
        const aby = b[1] - a[1];
        const apx = x - a[0];
        const apy = y - a[1];
        const len2 = abx * abx + aby * aby;
        let t = len2 > 0 ? (apx * abx + apy * aby) / len2 : 0;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        const dx = apx - abx * t;
        const dy = apy - aby * t;
        const d2 = dx * dx + dy * dy;
        if (d2 < best) best = d2;
    }
    return Math.sqrt(best);
}
function fit_face_inside(polygon, x, y) {
    let hit = false;
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
        const a = polygon[i];
        const b = polygon[j];
        if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
}
const ASPECT_CANDIDATES = [
    1 / 1.45,
    1 / 1.28,
    1 / 1.12,
    1,
    1.12,
    1.28,
    1.45
];
const EYE_FACTOR_FLOOR = 0.85;
const PROBE_COS = Array.from({
    length: 16
}, (_, i)=>Math.cos(i / 16 * Math.PI * 2));
const PROBE_SIN = Array.from({
    length: 16
}, (_, i)=>Math.sin(i / 16 * Math.PI * 2));
function fit_face_fitFace(points, leftDX = 0, hint = [
    0,
    0
], avoid = []) {
    const originX = CENTER + hint[0];
    const originY = CENTER + hint[1];
    let best = {
        x: originX,
        y: originY,
        sx: 40,
        sy: 40,
        score: -1 / 0
    };
    const room = 0 === avoid.length ? (x, y)=>distanceToOutline(points, x, y) : (x, y)=>{
        let d = distanceToOutline(points, x, y);
        for (const obstacle of avoid){
            if (fit_face_inside(obstacle, x, y)) return 0;
            d = Math.min(d, distanceToOutline(obstacle, x, y));
        }
        return d;
    };
    const evaluate = (cx, cy)=>{
        const clearance = room(cx, cy);
        if (clearance <= 0) return;
        const offCentre = Math.hypot(cx - originX, cy - originY);
        for (const aspect of ASPECT_CANDIDATES){
            const sx = clearance * (aspect >= 1 ? 1 : aspect);
            const sy = clearance * (aspect >= 1 ? 1 / aspect : 1);
            let tightest = 1 / 0;
            for(let i = 0; i < 16; i++){
                const px = cx + sx * PROBE_COS[i];
                const py = cy + sy * PROBE_SIN[i];
                const d = room(px, py);
                if (d < tightest) tightest = d;
            }
            const score = clearance + 0.6 * tightest - 0.22 * offCentre;
            if (score > best.score) best = {
                x: cx,
                y: cy,
                sx,
                sy,
                score
            };
        }
    };
    for(let dx = -16; dx <= 16; dx += 8)for(let dy = -56; dy <= 56; dy += 8)evaluate(originX + dx, originY + dy);
    const coarse = {
        x: best.x,
        y: best.y
    };
    for(let dx = -8; dx <= 8; dx += 2)for(let dy = -8; dy <= 8; dy += 2)evaluate(coarse.x + dx, coarse.y + dy);
    return {
        x: best.x,
        y: best.y,
        sx: best.sx,
        sy: best.sy,
        eye: eyeFactor(best.sx, best.sy),
        leftDX
    };
}
function eyeFactor(sx, sy) {
    const min = Math.min(sx, sy);
    const max = Math.max(sx, sy);
    return clamp((0.7 * min + 0.3 * max) * 0.0126, EYE_FACTOR_FLOOR, 1);
}
class ThemeNotInstalledError extends Error {
    theme;
    kind;
    id;
    name = 'ThemeNotInstalledError';
    constructor(theme, kind, id){
        super(('theme' === kind ? `The "${theme}" theme is not installed. ` : `The ${kind} "${id}" belongs to the "${theme}" theme, which is not installed. `) + `Call \`await loadTheme('${theme}')\`, or \`installTheme\` with the \`@aora-bot/engine/themes/${theme}\` entry, first.`), this.theme = theme, this.kind = kind, this.id = id;
    }
}
const installed = new Set();
const SHARED = Symbol.for('@aora-bot/engine/themes');
const shared = globalThis[SHARED] ??= new Map();
let installer = null;
function setInstaller(install) {
    installer = install;
}
function markInstalled(id, theme) {
    installed.add(id);
    shared.set(id, theme);
}
function adopt(id) {
    if (installed.has(id)) return true;
    const theme = shared.get(id);
    if (void 0 === theme || !installer) return false;
    installer(theme);
    return installed.has(id);
}
const isThemeInstalled = (id)=>adopt(id);
const sharedThemes = ()=>[
        ...shared.values()
    ];
function adoptAll() {
    for (const id of shared.keys())adopt(id);
}
function themeOwning(kind, id, style) {
    for (const entry of THEME_MANIFEST){
        const owns = 'theme' === kind ? entry.id === id : 'shape' === kind ? entry.shapes.includes(id) : 'cast' === kind ? entry.cast.includes(id) : 'color' === kind ? entry.colors.includes(id) : entry.variants.some((v)=>v.variant === id && (void 0 === style || v.style === style));
        if (owns) return entry;
    }
    return null;
}
function requireTheme(kind, id, style) {
    const owner = themeOwning(kind, id, style);
    if (owner && !adopt(owner.id)) throw new ThemeNotInstalledError(owner.id, kind, id);
}
function themesNeeded(ids) {
    const out = new Set();
    const add = (owner)=>{
        if (owner && !adopt(owner.id)) out.add(owner.id);
    };
    if (ids.shape) add(themeOwning('shape', ids.shape));
    if (ids.preset) add(themeOwning('cast', ids.preset));
    if (ids.variant) add(themeOwning('variant', ids.variant, ids.style ?? void 0));
    if (ids.color) add(themeOwning('color', ids.color));
    return [
        ...out
    ];
}
const DEFAULT_STEP = 1.6;
const ARG_COUNT = {
    M: 2,
    L: 2,
    H: 1,
    V: 1,
    C: 6,
    Q: 4,
    A: 7,
    Z: 0
};
function arcPoints([x0, y0], [rx0, ry0, rotation, large, sweep, x, y], step) {
    let rx = Math.abs(rx0);
    let ry = Math.abs(ry0);
    if (0 === rx || 0 === ry) return [
        [
            x,
            y
        ]
    ];
    const phi = rotation * Math.PI / 180;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    const dx = (x0 - x) / 2;
    const dy = (y0 - y) / 2;
    const x1 = cos * dx + sin * dy;
    const y1 = -sin * dx + cos * dy;
    const lambda = x1 * x1 / (rx * rx) + y1 * y1 / (ry * ry);
    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }
    const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
    const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
    const factor = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));
    const cx1 = factor * rx * y1 / ry;
    const cy1 = -factor * ry * x1 / rx;
    const cx = cos * cx1 - sin * cy1 + (x0 + x) / 2;
    const cy = sin * cx1 + cos * cy1 + (y0 + y) / 2;
    const angle = (ux, uy, vx, vy)=>Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const theta = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
    let delta = angle((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
    if (!sweep && delta > 0) delta -= 2 * Math.PI;
    else if (sweep && delta < 0) delta += 2 * Math.PI;
    const length = Math.abs(delta) * Math.max(rx, ry);
    const count = Math.max(2, Math.ceil(length / step));
    const out = [];
    for(let i = 1; i <= count; i++){
        const t = theta + delta * i / count;
        const px = rx * Math.cos(t);
        const py = ry * Math.sin(t);
        out.push([
            cos * px - sin * py + cx,
            sin * px + cos * py + cy
        ]);
    }
    return out;
}
function samplePath(d, step = DEFAULT_STEP) {
    const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
    const points = [];
    let i = 0;
    let command = '';
    let x = 0;
    let y = 0;
    let startX = 0;
    let startY = 0;
    let started = false;
    const take = (n)=>{
        const out = tokens.slice(i, i + n).map(Number);
        if (out.length < n || out.some((v)=>Number.isNaN(v))) throw new Error(`Bad path data: ${d}`);
        i += n;
        return out;
    };
    const push = (px, py)=>{
        points.push([
            px,
            py
        ]);
        x = px;
        y = py;
    };
    while(i < tokens.length){
        const token = tokens[i];
        if (/[A-Za-z]/.test(token)) {
            command = token;
            i++;
            if ('Z' === command || 'z' === command) {
                x = startX;
                y = startY;
                continue;
            }
        } else if ('' === command) throw new Error(`Bad path data: ${d}`);
        const upper = command.toUpperCase();
        const relative = command !== upper;
        const args = take(ARG_COUNT[upper] ?? NaN);
        const ox = relative ? x : 0;
        const oy = relative ? y : 0;
        switch(upper){
            case 'M':
                if (started) throw new Error('Only one subpath is supported');
                started = true;
                push(args[0] + ox, args[1] + oy);
                startX = x;
                startY = y;
                command = relative ? 'l' : 'L';
                break;
            case 'L':
                push(args[0] + ox, args[1] + oy);
                break;
            case 'H':
                push(args[0] + ox, y);
                break;
            case 'V':
                push(x, args[0] + oy);
                break;
            case 'C':
                {
                    const p0 = [
                        x,
                        y
                    ];
                    const p1 = [
                        args[0] + ox,
                        args[1] + oy
                    ];
                    const p2 = [
                        args[2] + ox,
                        args[3] + oy
                    ];
                    const p3 = [
                        args[4] + ox,
                        args[5] + oy
                    ];
                    const length = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
                    const count = Math.max(2, Math.ceil((length + Math.hypot(p3[0] - p2[0], p3[1] - p2[1])) / step));
                    for(let s = 1; s <= count; s++){
                        const t = s / count;
                        const u = 1 - t;
                        points.push([
                            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
                            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
                        ]);
                    }
                    x = p3[0];
                    y = p3[1];
                    break;
                }
            case 'Q':
                {
                    const p0 = [
                        x,
                        y
                    ];
                    const p1 = [
                        args[0] + ox,
                        args[1] + oy
                    ];
                    const p2 = [
                        args[2] + ox,
                        args[3] + oy
                    ];
                    const length = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
                    const count = Math.max(2, Math.ceil(length / step));
                    for(let s = 1; s <= count; s++){
                        const t = s / count;
                        const u = 1 - t;
                        points.push([
                            u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
                            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
                        ]);
                    }
                    x = p2[0];
                    y = p2[1];
                    break;
                }
            case 'A':
                {
                    const end = [
                        args[5] + ox,
                        args[6] + oy
                    ];
                    const arc = arcPoints([
                        x,
                        y
                    ], [
                        args[0],
                        args[1],
                        args[2],
                        args[3],
                        args[4],
                        end[0],
                        end[1]
                    ], step);
                    points.push(...arc);
                    x = end[0];
                    y = end[1];
                    break;
                }
            default:
                throw new Error(`Unsupported path command ${command}`);
        }
    }
    return dropRepeats(points);
}
function dropRepeats(points) {
    const out = [];
    for (const p of points){
        const last = out[out.length - 1];
        if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-6) out.push(p);
    }
    const first = out[0];
    const last = out[out.length - 1];
    if (out.length > 1 && first && last && Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-6) out.pop();
    return out;
}
function smoothLoop(flat, step = DEFAULT_STEP) {
    const raw = [];
    for(let i = 0; i + 1 < flat.length; i += 2)raw.push([
        flat[i],
        flat[i + 1]
    ]);
    const pts = dropRepeats(raw);
    const n = pts.length;
    if (n < 3) return pts;
    const at = (k)=>pts[(k % n + n) % n];
    const out = [];
    for(let k = 0; k < n; k++){
        const p0 = at(k - 1);
        const p1 = at(k);
        const p2 = at(k + 1);
        const p3 = at(k + 2);
        const t1 = Math.pow(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), 0.5);
        const t2 = t1 + Math.pow(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), 0.5);
        const t3 = t2 + Math.pow(Math.hypot(p3[0] - p2[0], p3[1] - p2[1]), 0.5);
        const count = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
        for(let s = 0; s < count; s++){
            const t = t1 + (t2 - t1) * s / count;
            const lerp = (a, b, ta, tb)=>{
                const w = tb === ta ? 0 : (t - ta) / (tb - ta);
                return [
                    a[0] + (b[0] - a[0]) * w,
                    a[1] + (b[1] - a[1]) * w
                ];
            };
            const a1 = lerp(p0, p1, 0, t1);
            const a2 = lerp(p1, p2, t1, t2);
            const a3 = lerp(p2, p3, t2, t3);
            const b1 = lerp(a1, a2, 0, t2);
            const b2 = lerp(a2, a3, t1, t3);
            out.push(lerp(b1, b2, t1, t2));
        }
    }
    return out;
}
const NORMALISED_SIZE = SHAPE_SPACE - 0.6;
const SPAN_ROWS = 160;
const partOutline = (part)=>'d' in part ? samplePath(part.d) : smoothLoop(loopPoints(part.loop));
const fromArt = (part, prop)=>({
        tone: part.tone,
        outline: partOutline(part),
        ...void 0 === part.color ? null : {
            color: part.color
        },
        ...void 0 === part.minPx ? null : {
            minPx: part.minPx
        },
        ...part.plain ? {
            plain: true
        } : null,
        ...part.underFace ? {
            underFace: true
        } : null,
        ...part.motion ? {
            motion: {
                id: part.motion,
                ...part.pivot ? {
                    pivot: part.pivot
                } : null
            }
        } : null,
        ...prop ? {
            prop
        } : null
    });
function figureMotionOf(art) {
    if (!art.motion) return;
    const ids = 'string' == typeof art.motion ? [
        art.motion
    ] : art.motion;
    return ids.length > 0 ? {
        ids,
        ...art.pivot ? {
            pivot: art.pivot
        } : null
    } : void 0;
}
function sourceFromArt(art) {
    const motion = figureMotionOf(art);
    if ('base' in art) {
        const source = propSource(art.base, ()=>art.props.map((part)=>fromArt(part)), art.at, art.scale, art, motion);
        if (art.faceBox) source.faceBox = art.faceBox;
        if (void 0 !== art.hairDeep) source.hairDeep = art.hairDeep;
        return source;
    }
    const parts = art.parts;
    return {
        outline: ()=>'string' == typeof art.body ? samplePath(art.body) : smoothLoop(loopPoints(art.body.loop)),
        parts: parts && (()=>parts.map((part)=>fromArt(part))),
        leftDX: art.leftDX,
        face: art.face,
        ...motion ? {
            motion
        } : null,
        ...art.faceBox ? {
            faceBox: art.faceBox
        } : null,
        ...void 0 !== art.hairDeep ? {
            hairDeep: art.hairDeep
        } : null
    };
}
function pinnedFace(source, fitted) {
    const pin = source.faceBox;
    if (!pin) return null;
    const [x, y] = fitted.map([
        pin.x,
        pin.y
    ]);
    const sx = pin.sx * fitted.unit;
    const sy = pin.sy * fitted.unit;
    return {
        x,
        y,
        sx,
        sy,
        eye: eyeFactor(sx, sy),
        leftDX: source.leftDX ?? 0
    };
}
function propSource(base, props, at, scale, { drop = [], tint = {}, plain = [] } = {}, motion) {
    let placed = null;
    const place = ()=>{
        if (placed) return placed;
        const shape = getShape(base);
        const k = 100 * scale / SHAPE_SPACE;
        const map = ([x, y])=>[
                at[0] + (x - CENTER) * k,
                at[1] + (y - CENTER) * k
            ];
        placed = {
            body: shape.outline.map(map),
            parts: [
                ...shape.parts.flatMap((part, i)=>drop.includes(i) ? [] : [
                        {
                            ...part,
                            outline: part.outline.map(map),
                            ...tint[i] ? {
                                color: tint[i]
                            } : null,
                            ...plain.includes(i) ? {
                                plain: true
                            } : null,
                            ...part.motion ? {
                                motion: {
                                    id: part.motion.id,
                                    ...part.motion.pivot ? {
                                        pivot: map(part.motion.pivot)
                                    } : null,
                                    unit: part.motion.unit * k,
                                    offset: map(part.motion.offset)
                                }
                            } : null
                        }
                    ]),
                ...props().map((part)=>({
                        ...part,
                        prop: true
                    }))
            ],
            face: map([
                shape.face.x,
                shape.face.y
            ]),
            leftDX: shape.face.leftDX
        };
        return placed;
    };
    return {
        outline: ()=>place().body,
        parts: ()=>place().parts,
        get leftDX () {
            return place().leftDX;
        },
        get face () {
            return place().face;
        },
        ...motion ? {
            motion
        } : null
    };
}
const SOURCES = Object.fromEntries(CORE_SHAPE_IDS.map((id)=>[
        id,
        sourceFromArt(CHARACTERS[id])
    ]));
const STORED = new Map(Object.entries(FACE_BOXES).flatMap(([id, box])=>box ? [
        [
            id,
            box
        ]
    ] : []));
function registerArt(art, boxes = {}) {
    for (const [id, entry] of Object.entries(art)){
        SOURCES[id] = sourceFromArt(entry);
        cache.delete(id);
    }
    for (const [id, box] of Object.entries(boxes))STORED.set(id, box);
}
function polygonArea(points) {
    let sum = 0;
    for(let i = 0; i < points.length; i++){
        const a = points[i];
        const b = points[(i + 1) % points.length];
        sum += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(sum) / 2;
}
const AREA_WEIGHT = 0.5;
const REFERENCE_AREA = Math.PI * Math.pow(NORMALISED_SIZE / 2, 2);
function normalise(points, parts) {
    let minX = 1 / 0;
    let minY = 1 / 0;
    let maxX = -1 / 0;
    let maxY = -1 / 0;
    const grow = (list)=>{
        for (const [x, y] of list){
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    };
    grow(points);
    for (const part of parts)grow(part.outline);
    const boxScale = NORMALISED_SIZE / Math.max(maxX - minX, maxY - minY);
    const area = polygonArea(points);
    const areaScale = area > 0 ? Math.sqrt(REFERENCE_AREA / area) : boxScale;
    let scale = boxScale * (1 - AREA_WEIGHT) + areaScale * AREA_WEIGHT;
    const maxScale = NORMALISED_SIZE / Math.max(maxX - minX, maxY - minY);
    if (scale > maxScale) scale = maxScale;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const map = ([x, y])=>[
            CENTER + (x - cx) * scale,
            CENTER + (y - cy) * scale
        ];
    return {
        body: points.map(map),
        parts: parts.map(({ motion, ...part })=>({
                ...part,
                outline: part.outline.map(map),
                ...motion ? {
                    motion: {
                        id: motion.id,
                        ...motion.pivot ? {
                            pivot: map(motion.pivot)
                        } : null,
                        unit: (motion.unit ?? 1) * scale,
                        offset: map(motion.offset ?? [
                            0,
                            0
                        ])
                    }
                } : null
            })),
        map,
        unit: scale
    };
}
function toRing(points, samples = 96) {
    const ring = [];
    for(let i = 0; i < samples; i++){
        const theta = i / samples * Math.PI * 2;
        const dx = Math.cos(theta);
        const dy = Math.sin(theta);
        let hit = 0;
        for(let j = 0; j < points.length; j++){
            const a = points[j];
            const b = points[(j + 1) % points.length];
            const ax = a[0] - CENTER;
            const ay = a[1] - CENTER;
            const bx = b[0] - CENTER;
            const by = b[1] - CENTER;
            const denom = (bx - ax) * dy - (by - ay) * dx;
            if (Math.abs(denom) < 1e-9) continue;
            const t = (ax * dy - ay * dx) / -denom;
            if (t < 0 || t > 1) continue;
            const px = ax + (bx - ax) * t;
            const py = ay + (by - ay) * t;
            const along = px * dx + py * dy;
            if (along > hit) hit = along;
        }
        if (0 === hit) {
            let bestDiff = 1 / 0;
            for (const [x, y] of points){
                const px = x - CENTER;
                const py = y - CENTER;
                let diff = Math.atan2(py, px) - theta;
                while(diff > Math.PI)diff -= 2 * Math.PI;
                while(diff < -Math.PI)diff += 2 * Math.PI;
                diff = Math.abs(diff);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    hit = Math.hypot(px, py);
                }
            }
        }
        ring.push([
            CENTER + hit * dx,
            CENTER + hit * dy
        ]);
    }
    return ring;
}
function buildSpanTable(points, top, bottom) {
    const rows = [];
    const height = bottom - top;
    for(let r = 0; r < SPAN_ROWS; r++){
        const y = 0 === r ? top : r === SPAN_ROWS - 1 ? bottom : top + height * r / (SPAN_ROWS - 1);
        let lo = 1 / 0;
        let hi = -1 / 0;
        for(let j = 0; j < points.length; j++){
            const a = points[j];
            const b = points[(j + 1) % points.length];
            if (a[1] === b[1]) continue;
            const t = (y - a[1]) / (b[1] - a[1]);
            if (t < 0 || t > 1) continue;
            const x = a[0] + (b[0] - a[0]) * t;
            if (x < lo) lo = x;
            if (x > hi) hi = x;
        }
        if (lo === 1 / 0) {
            const prev = rows[r - 1];
            rows.push(prev ? [
                prev[0],
                prev[1]
            ] : [
                CENTER,
                CENTER
            ]);
        } else rows.push([
            lo,
            hi
        ]);
    }
    return (y)=>{
        const t = clamp((y - top) / height, 0, 1);
        const idx = t * (SPAN_ROWS - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(SPAN_ROWS - 1, i0 + 1);
        const f = idx - i0;
        const a = rows[i0];
        const b = rows[i1];
        return [
            a[0] + (b[0] - a[0]) * f,
            a[1] + (b[1] - a[1]) * f
        ];
    };
}
function deriveTiltScale(spanAt, bottom) {
    const near = spanAt(bottom - 1);
    const above = spanAt(bottom - 9);
    const nearWidth = near[1] - near[0];
    const aboveWidth = above[1] - above[0];
    if (aboveWidth <= 0) return 1;
    const ratio = nearWidth / aboveWidth;
    return clamp(1 - 1.9 * (ratio - 0.36), 0.15, 1);
}
function sourceOf(id) {
    const source = SOURCES[id];
    if (source) return source;
    requireTheme('shape', id);
    const adopted = SOURCES[id];
    if (adopted) return adopted;
    throw new Error(`Unknown shape "${id}". Shapes are the roster's, a theme's once installed, or registered with defineShape.`);
}
function registry_build(id) {
    const source = sourceOf(id);
    const fitted = normalise(source.outline(), source.parts?.() ?? []);
    const points = fitted.body;
    let radius = 0;
    let top = 1 / 0;
    let bottom = -1 / 0;
    for (const [x, y] of points){
        const d = Math.hypot(x - CENTER, y - CENTER);
        if (d > radius) radius = d;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
    }
    const spanAt = buildSpanTable(points, top, bottom);
    let beltRadius = 0;
    for(let i = 0; i < 64; i++){
        const y = top + (bottom - top) * i / 63;
        const [lo, hi] = spanAt(y);
        const half = (hi - lo) / 2;
        if (half > beltRadius) beltRadius = half;
    }
    if (fitted.parts.length > 0) {
        let bodyLo = 1 / 0;
        let bodyHi = -1 / 0;
        for (const [x] of points){
            if (x < bodyLo) bodyLo = x;
            if (x > bodyHi) bodyHi = x;
        }
        let lo = bodyLo;
        let hi = bodyHi;
        for (const part of fitted.parts)for (const [x] of part.outline){
            if (x < lo) lo = x;
            if (x > hi) hi = x;
        }
        if (hi - lo > bodyHi - bodyLo + 1) beltRadius = Math.max(beltRadius, (hi - lo) / 2);
    }
    const inputs = faceInputs(source, fitted);
    const stored = STORED.get(id);
    const face = pinnedFace(source, fitted) ?? (stored && stored.digest === face_boxes_faceInputsDigest(inputs) ? {
        ...stored.box
    } : fit_face_fitFace(inputs.points, inputs.leftDX, inputs.hint, inputs.avoid));
    return {
        id,
        path: smoothClosedPath(points),
        outline: points,
        radius,
        beltRadius,
        tiltScale: deriveTiltScale(spanAt, bottom),
        top,
        bottom,
        spanAt,
        ring: toRing(points),
        face,
        parts: fitted.parts,
        ...void 0 !== source.hairDeep ? {
            hairDeep: source.hairDeep
        } : null,
        ...source.motion ? {
            motion: {
                ids: source.motion.ids,
                ...source.motion.pivot ? {
                    pivot: fitted.map(source.motion.pivot)
                } : null,
                unit: fitted.unit,
                offset: fitted.map([
                    0,
                    0
                ])
            }
        } : null
    };
}
function faceInputs(source, fitted) {
    let hint = source.faceHint;
    if (source.face) {
        const [fx, fy] = fitted.map(source.face);
        hint = [
            fx - CENTER,
            fy - CENTER
        ];
    }
    return {
        points: fitted.body,
        leftDX: source.leftDX ?? 0,
        hint,
        avoid: fitted.parts.filter((part)=>'hair' === part.tone || true === part.prop && !part.underFace && covers(part.outline, fitted.body)).map((part)=>part.outline)
    };
}
function covers(prop, body) {
    const inside = (polygon, [x, y])=>{
        let hit = false;
        for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
            const a = polygon[i];
            const b = polygon[j];
            if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
        }
        return hit;
    };
    return prop.some((p)=>inside(body, p)) || body.some((p)=>inside(prop, p));
}
const cache = new Map();
function getShape(id) {
    let def = cache.get(id);
    if (!def) {
        def = registry_build(id);
        cache.set(id, def);
    }
    return def;
}
function allShapes() {
    return SHAPE_IDS.map(getShape);
}
function defineShape(id, outline, options = {}) {
    const { parts = [], props = [] } = options;
    SOURCES[id] = {
        outline,
        parts: ()=>[
                ...parts.map((part)=>({
                        ...part
                    })),
                ...props.map((part)=>({
                        ...part,
                        prop: true
                    }))
            ],
        leftDX: options.leftDX,
        faceHint: options.faceHint
    };
    cache.delete(id);
    return getShape(id);
}
function defineShapeWithProps(id, options) {
    const { base, props, at = [
        50,
        50
    ], scale = 0.7 } = options;
    SOURCES[id] = propSource(base, ()=>props.map((part)=>({
                ...part
            })), at, scale, options);
    cache.delete(id);
    return getShape(id);
}
const getShapeScale = (_id)=>1;
const getEyeScaleForShape = (_id)=>0.92;
const TAU = 2 * Math.PI;
function polar(radiusAt, samples = 160) {
    const out = [];
    for(let i = 0; i < samples; i++){
        const t = i / samples * TAU;
        const r = radiusAt(t);
        out.push([
            r * Math.cos(t),
            r * Math.sin(t)
        ]);
    }
    return out;
}
function parametric(at, samples = 160) {
    const out = [];
    for(let i = 0; i < samples; i++)out.push(at(i / samples * TAU));
    return out;
}
function roundedPolygon(vertices, radii, arcSamples = 16) {
    const n = vertices.length;
    const out = [];
    const pushEdge = (from, to)=>{
        const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
        const steps = Math.max(1, Math.round(distance / EDGE_SPACING));
        for(let s = 1; s < steps; s++){
            const t = s / steps;
            out.push([
                from[0] + (to[0] - from[0]) * t,
                from[1] + (to[1] - from[1]) * t
            ]);
        }
    };
    for(let i = 0; i < n; i++){
        const prev = vertices[(i - 1 + n) % n];
        const cur = vertices[i];
        const next = vertices[(i + 1) % n];
        const v1x = prev[0] - cur[0];
        const v1y = prev[1] - cur[1];
        const v2x = next[0] - cur[0];
        const v2y = next[1] - cur[1];
        const l1 = Math.hypot(v1x, v1y);
        const l2 = Math.hypot(v2x, v2y);
        if (l1 < 1e-6 || l2 < 1e-6) {
            pushEdge(out[out.length - 1] ?? cur, cur);
            out.push(cur);
            continue;
        }
        const u1x = v1x / l1;
        const u1y = v1y / l1;
        const u2x = v2x / l2;
        const u2y = v2y / l2;
        const dot = Math.max(-1, Math.min(1, u1x * u2x + u1y * u2y));
        const angle = Math.acos(dot);
        if (angle < 1e-4 || Math.abs(Math.PI - angle) < 1e-4) {
            pushEdge(out[out.length - 1] ?? cur, cur);
            out.push(cur);
            continue;
        }
        const half = angle / 2;
        const maxOffset = Math.min(l1, l2) / 2;
        const radius = Math.min(radii[i] ?? 0, maxOffset * Math.tan(half));
        const offset = radius / Math.tan(half);
        const t1 = [
            cur[0] + u1x * offset,
            cur[1] + u1y * offset
        ];
        const t2 = [
            cur[0] + u2x * offset,
            cur[1] + u2y * offset
        ];
        const bx = u1x + u2x;
        const by = u1y + u2y;
        const bl = Math.hypot(bx, by) || 1;
        const dist = radius / Math.sin(half);
        const cx = cur[0] + bx / bl * dist;
        const cy = cur[1] + by / bl * dist;
        const a1 = Math.atan2(t1[1] - cy, t1[0] - cx);
        const a2 = Math.atan2(t2[1] - cy, t2[0] - cx);
        let sweep = a2 - a1;
        while(sweep > Math.PI)sweep -= TAU;
        while(sweep < -Math.PI)sweep += TAU;
        pushEdge(out[out.length - 1] ?? t1, t1);
        const arcLength = Math.abs(sweep) * radius;
        const steps = Math.max(4, Math.min(2 * arcSamples, Math.round(arcLength / EDGE_SPACING)));
        for(let s = 0; s <= steps; s++){
            const a = a1 + sweep * s / steps;
            out.push([
                cx + radius * Math.cos(a),
                cy + radius * Math.sin(a)
            ]);
        }
    }
    const firstPoint = out[0];
    const lastPoint = out[out.length - 1];
    if (firstPoint && lastPoint) pushEdge(lastPoint, firstPoint);
    return out;
}
const EDGE_SPACING = 4;
const superellipse = (a, b, n, samples = 180)=>parametric((t)=>{
        const c = Math.cos(t);
        const s = Math.sin(t);
        return [
            a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n),
            b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)
        ];
    }, samples);
const circleUnion = (circles)=>polar((t)=>{
        const dx = Math.cos(t);
        const dy = Math.sin(t);
        let best = 0;
        for (const c of circles){
            const b = c.x * dx + c.y * dy;
            const cc = c.x * c.x + c.y * c.y - c.r * c.r;
            const disc = b * b - cc;
            if (disc < 0) continue;
            const hit = b + Math.sqrt(disc);
            if (hit > best) best = hit;
        }
        return best;
    }, 200);
function resampleClosed(points, count) {
    const n = points.length;
    const cumulative = [
        0
    ];
    for(let i = 1; i <= n; i++){
        const a = points[i - 1];
        const b = points[i % n];
        cumulative.push(cumulative[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    const total = cumulative[n];
    const out = [];
    let seg = 0;
    for(let i = 0; i < count; i++){
        const target = total * i / count;
        while(seg < n - 1 && cumulative[seg + 1] < target)seg++;
        const span = cumulative[seg + 1] - cumulative[seg] || 1;
        const t = (target - cumulative[seg]) / span;
        const a = points[seg];
        const b = points[(seg + 1) % n];
        out.push([
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t
        ]);
    }
    return out;
}
function fourierSmooth(points, harmonics) {
    const n = points.length;
    if (harmonics <= 0 || harmonics >= n / 2) return points.map((p)=>[
            p[0],
            p[1]
        ]);
    const coefficients = [];
    for (const axis of [
        0,
        1
    ]){
        const a = [];
        const b = [];
        for(let k = 0; k <= harmonics; k++){
            let ak = 0;
            let bk = 0;
            for(let i = 0; i < n; i++){
                const t = TAU * k * i / n;
                ak += points[i][axis] * Math.cos(t);
                bk += points[i][axis] * Math.sin(t);
            }
            const norm = (0 === k ? 1 : 2) / n;
            a.push(ak * norm);
            b.push(bk * norm);
        }
        coefficients.push({
            a,
            b
        });
    }
    const out = [];
    for(let i = 0; i < n; i++){
        const p = [
            0,
            0
        ];
        for (const axis of [
            0,
            1
        ]){
            const { a, b } = coefficients[axis];
            for(let k = 0; k <= harmonics; k++){
                const t = TAU * k * i / n;
                p[axis] += a[k] * Math.cos(t) + b[k] * Math.sin(t);
            }
        }
        out.push(p);
    }
    return out;
}
const COLOR_SWATCHES = [
    {
        id: 'cream',
        value: '#E9D9B6',
        ink: {
            light: '#F1E2C1',
            dark: '#EADBB9'
        },
        gradient: {
            lightFrom: '#FAF0DA',
            lightTo: '#E2CDA1',
            darkFrom: '#F3E6CA',
            darkTo: '#D8C397'
        }
    },
    {
        id: 'ivory',
        value: '#F7EFDF',
        ink: {
            light: '#FFF8EA',
            dark: '#F7EFDF'
        },
        gradient: {
            lightFrom: '#FFFCF5',
            lightTo: '#F0E4CC',
            darkFrom: '#FBF6EC',
            darkTo: '#E6DAC2'
        }
    },
    {
        id: 'black',
        value: '#1A1A1A',
        ink: {
            light: '#1F1F1F',
            dark: '#FFFFFF'
        },
        gradient: {
            lightFrom: '#333333',
            lightTo: '#111111',
            darkFrom: '#FFFFFF',
            darkTo: '#CFCFCF'
        }
    },
    {
        id: 'brown',
        value: '#C46A32',
        ink: {
            light: '#D07A44',
            dark: '#BF703F'
        },
        gradient: {
            lightFrom: '#E08C58',
            lightTo: '#A85422',
            darkFrom: '#BF703F',
            darkTo: '#965831'
        }
    },
    {
        id: 'red',
        value: '#E0363A',
        ink: {
            light: '#EB4B4F',
            dark: '#D84549'
        },
        gradient: {
            lightFrom: '#F26467',
            lightTo: '#C41F24',
            darkFrom: '#D84549',
            darkTo: '#A93639'
        }
    },
    {
        id: 'orange',
        value: '#F25C0F',
        ink: {
            light: '#FF7228',
            dark: '#EB6925'
        },
        gradient: {
            lightFrom: '#FF8A4A',
            lightTo: '#D44C08',
            darkFrom: '#EB6925',
            darkTo: '#B8521D'
        }
    },
    {
        id: 'yellow',
        value: '#E9A20C',
        ink: {
            light: '#F0B326',
            dark: '#DDA523'
        },
        gradient: {
            lightFrom: '#F6C44A',
            lightTo: '#C88800',
            darkFrom: '#DDA523',
            darkTo: '#AD811B'
        }
    },
    {
        id: 'green',
        value: '#1B9A5C',
        ink: {
            light: '#28B06C',
            dark: '#25A263'
        },
        gradient: {
            lightFrom: '#3EC484',
            lightTo: '#147A48',
            darkFrom: '#25A263',
            darkTo: '#1D7F4E'
        }
    },
    {
        id: 'cyan',
        value: '#0899B8',
        ink: {
            light: '#14B0D2',
            dark: '#12A2C1'
        },
        gradient: {
            lightFrom: '#3AC4E0',
            lightTo: '#067A94',
            darkFrom: '#12A2C1',
            darkTo: '#0E7F97'
        }
    },
    {
        id: 'blue',
        value: '#0D7EFF',
        ink: {
            light: '#2B8FFF',
            dark: '#2884EB'
        },
        gradient: {
            lightFrom: '#4DA3FF',
            lightTo: '#0A6AD6',
            darkFrom: '#2884EB',
            darkTo: '#1F67B8'
        }
    },
    {
        id: 'violet',
        value: '#6F55E0',
        ink: {
            light: '#846BEC',
            dark: '#7962D9'
        },
        gradient: {
            lightFrom: '#9D88F2',
            lightTo: '#5A3FCB',
            darkFrom: '#7962D9',
            darkTo: '#5F4DAA'
        }
    },
    {
        id: 'magenta',
        value: '#D12D8C',
        ink: {
            light: '#E0449E',
            dark: '#CE3F91'
        },
        gradient: {
            lightFrom: '#EC64B2',
            lightTo: '#B01E74',
            darkFrom: '#CE3F91',
            darkTo: '#A13172'
        }
    },
    {
        id: 'pink',
        value: '#E8628F',
        ink: {
            light: '#F0709F',
            dark: '#DD6792'
        },
        gradient: {
            lightFrom: '#F78DB2',
            lightTo: '#D4507F',
            darkFrom: '#DD6792',
            darkTo: '#AD5172'
        }
    },
    {
        id: 'gray',
        value: '#6E7382',
        ink: {
            light: '#83889A',
            dark: '#797D8E'
        },
        gradient: {
            lightFrom: '#9AA0B0',
            lightTo: '#585C6A',
            darkFrom: '#797D8E',
            darkTo: '#5E626F'
        }
    },
    {
        id: 'sage',
        value: '#87A383',
        ink: {
            light: '#8FAC8B',
            dark: '#88A584'
        },
        gradient: {
            lightFrom: '#B2CAAE',
            lightTo: '#6E8C6B',
            darkFrom: '#A4BFA0',
            darkTo: '#67835F'
        }
    },
    {
        id: 'clay',
        value: '#B9633F',
        ink: {
            light: '#C66C47',
            dark: '#BB6641'
        },
        gradient: {
            lightFrom: '#DB8C69',
            lightTo: '#9C4D2E',
            darkFrom: '#C7744F',
            darkTo: '#8F4A2D'
        }
    },
    {
        id: 'navy',
        value: '#2A4373',
        ink: {
            light: '#2E4C80',
            dark: '#3E5E98'
        },
        gradient: {
            lightFrom: '#46669F',
            lightTo: '#1E355C',
            darkFrom: '#5373AE',
            darkTo: '#2D4877'
        }
    },
    {
        id: 'mauve',
        value: '#9C7898',
        ink: {
            light: '#A7839F',
            dark: '#9E7B97'
        },
        gradient: {
            lightFrom: '#C4A3BC',
            lightTo: '#86627F',
            darkFrom: '#B897B0',
            darkTo: '#7C5A76'
        }
    },
    {
        id: 'night',
        value: '#2A2433',
        ink: {
            light: '#2A2433',
            dark: '#2F2839'
        },
        gradient: {
            lightFrom: '#3D3449',
            lightTo: '#1C1823',
            darkFrom: '#3A3245',
            darkTo: '#211C29'
        }
    },
    {
        id: 'cocoa',
        value: '#6C4330',
        ink: {
            light: '#7A4C36',
            dark: '#8A5A42'
        },
        gradient: {
            lightFrom: '#93624A',
            lightTo: '#5E3A28',
            darkFrom: '#9C6A50',
            darkTo: '#6E4632'
        }
    },
    {
        id: 'sky',
        value: '#9CCDE6',
        ink: {
            light: '#A9D6EA',
            dark: '#9ACBE2'
        },
        gradient: {
            lightFrom: '#C6E6F4',
            lightTo: '#86BDD9',
            darkFrom: '#B4DCEE',
            darkTo: '#7DB2CE'
        }
    },
    {
        id: 'blush',
        value: '#F7AEC1',
        ink: {
            light: '#FFB4C7',
            dark: '#F5ABBE'
        },
        gradient: {
            lightFrom: '#FFD0DC',
            lightTo: '#E890A8',
            darkFrom: '#FCC6D4',
            darkTo: '#DD889F'
        }
    },
    {
        id: 'lilac',
        value: '#C2ABEA',
        ink: {
            light: '#CBB5F0',
            dark: '#BFA8E8'
        },
        gradient: {
            lightFrom: '#DDCDF6',
            lightTo: '#AA92DD',
            darkFrom: '#D3C1F2',
            darkTo: '#A189D4'
        }
    },
    {
        id: 'butter',
        value: '#F7D883',
        ink: {
            light: '#FFE38F',
            dark: '#F5D886'
        },
        gradient: {
            lightFrom: '#FFEDB5',
            lightTo: '#EBC766',
            darkFrom: '#FBE6A4',
            darkTo: '#DFBC5C'
        }
    },
    {
        id: 'meadow',
        value: '#74C288',
        ink: {
            light: '#7CC98F',
            dark: '#76C08A'
        },
        gradient: {
            lightFrom: '#A3DCB1',
            lightTo: '#5EB073',
            darkFrom: '#98D4A8',
            darkTo: '#58A56C'
        }
    }
];
const BY_ID = new Map(COLOR_SWATCHES.map((s)=>[
        s.id,
        s
    ]));
const palette_fallback = ()=>BY_ID.get('black');
function registerSwatch(swatch) {
    BY_ID.set(swatch.id, swatch);
}
const getSwatch = (id)=>{
    const swatch = BY_ID.get(id);
    if (swatch) return swatch;
    requireTheme('color', id);
    return BY_ID.get(id) ?? palette_fallback();
};
const getSwatchHex = (id)=>getSwatch(id).value;
const getInkColor = (id, scheme = 'light')=>getSwatch(id).ink[scheme];
const getInkColorCss = (id)=>{
    const { ink } = getSwatch(id);
    return `light-dark(${ink.light}, ${ink.dark})`;
};
const FACE_INK = '#FFFFFF';
const FEATURE_INK = '#2B2420';
const RISO_INK_ON_PINK = '#F5B428';
const RISO_INK = '#FF78A6';
const HAIR_SHADE = '#000000';
const HAIR_SHADE_TOKEN = `var(--aora-hair-shade, ${HAIR_SHADE})`;
const INK_TOKEN = 'var(--aora-fg, currentColor)';
const FX_TOKEN = `var(--aora-fx, ${INK_TOKEN})`;
const LINE_TOKEN = `var(--aora-ink-line, ${INK_TOKEN})`;
const PAGE_TOKEN = 'var(--aora-bg, var(--aora-bg-base, #fcfcfc))';
const FACE_TOKEN = `var(--aora-face, ${FACE_INK})`;
const FEATURE_TOKEN = `var(--aora-face-soft, ${FEATURE_INK})`;
const PUPIL_TOKEN = `var(--aora-face-pupil, ${FEATURE_INK})`;
const GLINT_TOKEN = `var(--aora-face-glint, ${FACE_INK})`;
const eyeToken = (paint)=>`var(--aora-eye, ${paint})`;
const channels = (hex)=>[
        1,
        3,
        5
    ].map((i)=>{
        const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
function luminance(hex) {
    const [r, g, b] = channels(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function chromaHue(hex) {
    const [r, g, b] = channels(hex);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const z = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const hue = 180 * Math.atan2(z, a) / Math.PI;
    return [
        Math.hypot(a, z),
        hue < 0 ? hue + 360 : hue
    ];
}
const contrast = (a, b)=>(Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const contrastOf = (a, b)=>contrast(luminance(a), luminance(b));
const READS = {
    face: 2.4,
    feature: 3,
    shade: 1.8
};
const readsOn = (ground, preferred, other, min)=>{
    const own = contrastOf(ground, preferred);
    return own >= min || own >= contrastOf(ground, other) ? preferred : other;
};
const palette_across = (paint)=>paint === FACE_INK ? FEATURE_INK : FACE_INK;
const isLightInk = (hex)=>readsOn(hex, FACE_INK, FEATURE_INK, READS.face) !== FACE_INK;
const STICKER_DARK = '#1F1F1F';
function faceOn(ink) {
    const face = readsOn(ink, FACE_INK, FEATURE_INK, READS.face);
    const feature = readsOn(ink, FEATURE_INK, FACE_INK, READS.feature);
    return {
        face,
        feature,
        sticker: face === FACE_INK ? FACE_INK : STICKER_DARK,
        hair: readsOn(ink, HAIR_SHADE, '#FFFFFF', READS.shade),
        pupil: palette_across(face),
        glint: palette_across(feature)
    };
}
const PLAIN_FACE = {
    face: FACE_INK,
    feature: FEATURE_INK,
    sticker: FACE_INK,
    hair: HAIR_SHADE,
    pupil: FEATURE_INK,
    glint: FACE_INK
};
const KEYS = Object.keys(PLAIN_FACE);
const sameFace = (a, b)=>KEYS.every((key)=>a[key] === b[key]);
function faceInks(id) {
    const { ink } = getSwatch(id);
    const light = faceOn(ink.light);
    const dark = faceOn(ink.dark);
    return {
        light,
        dark,
        turns: !sameFace(light, dark),
        plain: sameFace(light, PLAIN_FACE) && sameFace(dark, PLAIN_FACE)
    };
}
const hairShade = (id)=>{
    const { light, dark } = faceInks(id);
    return {
        light: light.hair,
        dark: dark.hair
    };
};
const PAGE = {
    light: '#FFFFFF',
    dark: '#000000'
};
const ON_PAGE = {
    mass: 1.6,
    line: 2.2
};
const LINE_CONTRAST = {
    light: 3,
    dark: 4.5
};
const perPage = (id, pick)=>{
    const { ink } = getSwatch(id);
    return {
        light: pick(ink.light, 'light'),
        dark: pick(ink.dark, 'dark')
    };
};
const lostOn = (ink, page, min)=>contrastOf(ink, PAGE[page]) < min;
function effectInks(id) {
    const rule = faceInks(id);
    return perPage(id, (ink, page)=>lostOn(ink, page, ON_PAGE.mass) ? rule[page].face : null);
}
const toHex = (linear)=>`#${linear.map((v)=>{
        const c = Math.min(1, Math.max(0, v));
        const g = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
        return Math.round(255 * g).toString(16).padStart(2, '0');
    }).join('').toUpperCase()}`;
function deepened(hex) {
    const l = luminance(hex);
    const k = (1.05 / LINE_CONTRAST.light - 0.05) / l;
    return toHex(channels(hex).map((v)=>v * k));
}
function palette_lifted(hex) {
    const l = luminance(hex);
    const t = (0.05 * LINE_CONTRAST.dark - 0.05 - l) / (1 - l);
    return toHex(channels(hex).map((v)=>v + (1 - v) * t));
}
const palette_asLine = (ink, page)=>'light' === page ? deepened(ink) : palette_lifted(ink);
function lineInks(id) {
    return perPage(id, (ink, page)=>lostOn(ink, page, ON_PAGE.line) ? palette_asLine(ink, page) : null);
}
function rimInks(id) {
    return perPage(id, (ink, page)=>lostOn(ink, page, ON_PAGE.mass) ? palette_asLine(ink, page) : null);
}
const RISO_CLASH = {
    chroma: 0.05,
    hue: 25
};
function risoSecondInk(id) {
    const [, riso] = chromaHue(RISO_INK);
    return perPage(id, (ink)=>{
        if (isLightInk(ink)) return ink;
        const [chroma, hue] = chromaHue(ink);
        const apart = Math.abs((hue - riso + 540) % 360 - 180);
        return chroma >= RISO_CLASH.chroma && apart < RISO_CLASH.hue ? RISO_INK_ON_PINK : null;
    });
}
const pairCss = (light, dark)=>light === dark ? light : `light-dark(${light}, ${dark})`;
const getInkVars = (id)=>{
    const { light, dark, plain } = faceInks(id);
    const pair = (key)=>pairCss(light[key], dark[key]);
    const effects = effectInks(id);
    const lines = lineInks(id);
    const rim = rimInks(id);
    const second = risoSecondInk(id);
    const { ink } = getSwatch(id);
    return {
        '--aora-fg': getInkColorCss(id),
        ...plain ? {
            '--aora-face': FACE_INK
        } : {
            '--aora-face': pair('face'),
            '--aora-face-soft': pair('feature'),
            '--aora-face-sticker': pair('sticker'),
            '--aora-hair-shade': pair('hair'),
            '--aora-face-pupil': pair('pupil'),
            '--aora-face-glint': pair('glint')
        },
        ...effects.light || effects.dark ? {
            '--aora-fx': pairCss(effects.light ?? ink.light, effects.dark ?? ink.dark)
        } : null,
        ...lines.light || lines.dark ? {
            '--aora-ink-line': pairCss(lines.light ?? ink.light, lines.dark ?? ink.dark)
        } : null,
        ...rim.light || rim.dark ? {
            '--aora-rim': pairCss(rim.light ?? 'transparent', rim.dark ?? 'transparent')
        } : null,
        ...second.light || second.dark ? {
            '--aora-ink2': pairCss(second.light ?? RISO_INK, second.dark ?? RISO_INK)
        } : null
    };
};
const INK_GRADIENT_ANGLE = 135;
const getInkGradient = (id)=>{
    const { gradient } = getSwatch(id);
    return {
        from: `light-dark(${gradient.lightFrom}, ${gradient.darkFrom})`,
        to: `light-dark(${gradient.lightTo}, ${gradient.darkTo})`,
        angle: INK_GRADIENT_ANGLE
    };
};
const getInkGradientFor = (id, scheme)=>{
    const { gradient } = getSwatch(id);
    return 'dark' === scheme ? {
        from: gradient.darkFrom,
        to: gradient.darkTo
    } : {
        from: gradient.lightFrom,
        to: gradient.lightTo
    };
};
const haloBackground = (id)=>{
    const hex = getSwatchHex(id);
    return [
        `radial-gradient(at 22% 18%, color-mix(in oklab, ${hex} 26%, transparent), transparent 60%)`,
        `radial-gradient(at 78% 26%, color-mix(in oklab, ${hex} 20%, transparent), transparent 58%)`,
        `linear-gradient(160deg, color-mix(in oklab, ${hex} 14%, transparent), color-mix(in oklab, ${hex} 7%, transparent))`
    ].join(', ');
};
const cast_ink = (color)=>getSwatchHex(color);
const CORE_CAST_IDS = [
    'dot',
    'mochi',
    'pip',
    'byte',
    'momo',
    'bao',
    'teal',
    'tato',
    'hexa',
    'tri',
    'gemma',
    'nimbo',
    'dew',
    'leafy',
    'bloom',
    'lucky',
    'sprout',
    'shroom',
    'oak',
    'pokey',
    'aubie',
    'nashi',
    'pomme',
    'berry',
    'cheri',
    'avo',
    'melo',
    'pud',
    'toasty',
    'scoop',
    'cuppy',
    'fry',
    'candy',
    'patty',
    'twinkle',
    'luv',
    'ember',
    'chime',
    'jelly',
    'beep',
    'luna',
    'boba',
    'orbi',
    'nook',
    'chatty',
    'joy',
    'lumi',
    'finn',
    'inky',
    'roly',
    'puff',
    'miso',
    'hop',
    'bruno',
    'chirp',
    'waddle',
    'oink',
    'rusty',
    'leo',
    'hammy',
    'prickle',
    'koko',
    'flap',
    'kiki',
    'maru',
    'zip',
    'fuzz',
    'lulu',
    'cinder',
    'sooty',
    'ashy'
];
const ALL_CAST_IDS = [
    ...CORE_CAST_IDS,
    ...THEME_MANIFEST.flatMap((theme)=>theme.cast)
];
const CORE_CAST = [
    {
        id: 'dot',
        name: {
            en: 'Dot',
            zh: '球球'
        },
        desc: {
            en: 'A cream-white ball with two tall capsule eyes that tip together when it is happy and apart when it is cross.',
            zh: '奶白色的小圆球，一对竖直的胶囊眼，开心时眼顶往里靠，生气时往外撇。'
        },
        shape: 'circle',
        color: 'cream',
        accent: cast_ink('cream'),
        face: 'capsule'
    },
    {
        id: 'mochi',
        name: {
            en: 'Mochi',
            zh: '糯糯'
        },
        desc: {
            en: 'A soft rice cake with a flat seat and a round head — the default friend.',
            zh: '软软的小年糕，底是平的，头是圆的，是最先认识的那个朋友。'
        },
        shape: 'mochi',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'pip',
        name: {
            en: 'Pip',
            zh: '团团'
        },
        desc: {
            en: 'A soft cyan blob that never quite sits still.',
            zh: '一坨青蓝软团，从来坐不老实。'
        },
        shape: 'blob',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'byte',
        name: {
            en: 'Byte',
            zh: '比特'
        },
        desc: {
            en: 'A pebble-round little shell in calm device violet.',
            zh: '圆石小方壳，浑身是安静的器件紫。'
        },
        shape: 'pebble',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'momo',
        name: {
            en: 'Momo',
            zh: '桃桃'
        },
        desc: {
            en: 'A peach-pink egg, pointy on top and plump below — the steadiest sitter of the family.',
            zh: '蜜桃粉的小蛋蛋，上尖下鼓，坐得比谁都稳。'
        },
        shape: 'egg',
        color: 'red',
        accent: cast_ink('red')
    },
    {
        id: 'bao',
        name: {
            en: 'Bao',
            zh: '包包'
        },
        desc: {
            en: 'A warm little bun with a knot on top.',
            zh: '奶黄小馒头，头顶一个小揪揪，热乎乎的。'
        },
        shape: 'bun',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'teal',
        name: {
            en: 'Teal',
            zh: '青青'
        },
        desc: {
            en: 'A lake-teal block of tofu: square without corners, round without slouching.',
            zh: '湖水青的小豆腐块，方而不楞，圆而不塌。'
        },
        shape: 'tofu',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'tato',
        name: {
            en: 'Tato',
            zh: '薯薯'
        },
        desc: {
            en: 'A pill on its side: round caps, a straight middle, and zero ability to sit still.',
            zh: '躺平的小胶囊，两端圆帽中间直腰，一刻也坐不住。'
        },
        shape: 'pill',
        color: 'red',
        accent: cast_ink('red')
    },
    {
        id: 'hexa',
        name: {
            en: 'Hexa',
            zh: '六六'
        },
        desc: {
            en: 'A rounded hexagon in lake teal, every corner worn soft.',
            zh: '湖青圆角六边形，每个角都被磨软了。'
        },
        shape: 'hex',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'tri',
        name: {
            en: 'Tri',
            zh: '尖尖'
        },
        desc: {
            en: 'A rice ball of a triangle that hops sharp and lands steady.',
            zh: '圆角小饭团三角，蹦得利落落得稳，浑身都是冲劲。'
        },
        shape: 'onigiri',
        color: 'magenta',
        accent: cast_ink('magenta')
    },
    {
        id: 'gemma',
        name: {
            en: 'Gemma',
            zh: '晶晶'
        },
        desc: {
            en: 'A soft-cut gem with every corner rounded.',
            zh: '软切面小宝石，每个角都是圆的。'
        },
        shape: 'gem',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'nimbo',
        name: {
            en: 'Nimbo',
            zh: '云宝'
        },
        desc: {
            en: 'A puffy scallop-edged cloud that drifts half a beat behind the world.',
            zh: '雾蓝薰衣草色的蓬松云朵，波浪扇贝边，总比世界慢半拍。'
        },
        shape: 'cloud',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'dew',
        name: {
            en: 'Dew',
            zh: '滴滴'
        },
        desc: {
            en: 'A sky-blue droplet that lands without ever losing its plump shine.',
            zh: '晴空蓝的小水滴，落地也不散，永远饱满欲滴。'
        },
        shape: 'drop',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'leafy',
        name: {
            en: 'Leafy',
            zh: '叶叶'
        },
        desc: {
            en: 'A tilted leaf with a little stem, as if it just decided to unfurl.',
            zh: '一片斜着的小叶子，带一截小梗，像刚决定要舒展开。'
        },
        shape: 'leaf',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'bloom',
        name: {
            en: 'Bloom',
            zh: '仙仙'
        },
        desc: {
            en: 'A rose flower with soft scalloped petals and a calm face in the middle.',
            zh: '霞粉小花，花瓣一圈软软的，花心里是一张安静的脸。'
        },
        shape: 'flower',
        color: 'magenta',
        accent: cast_ink('magenta')
    },
    {
        id: 'lucky',
        name: {
            en: 'Lucky',
            zh: '幸幸'
        },
        desc: {
            en: 'Four plump leaves and a calm face in the middle, good luck without the fuss.',
            zh: '四片圆鼓鼓的叶，中间一张安静的脸，好运不吵不闹。'
        },
        shape: 'clover',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'sprout',
        name: {
            en: 'Sprout',
            zh: '芽芽'
        },
        desc: {
            en: 'A round little seed with two leaves, as if it just decided to grow.',
            zh: '顶着两片嫩叶的小圆籽，像刚决定要长出来。'
        },
        shape: 'sprout',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'shroom',
        name: {
            en: 'Shroom',
            zh: '菇菇'
        },
        desc: {
            en: 'A red-capped mushroom with three pale spots and a thick stalk.',
            zh: '红帽小蘑菇，帽子上三颗浅色斑点，柄又粗又稳。'
        },
        shape: 'mushroom',
        color: 'red',
        accent: cast_ink('red')
    },
    {
        id: 'oak',
        name: {
            en: 'Oak',
            zh: '橡橡'
        },
        desc: {
            en: 'A brown acorn in a cap one size too big, hoarding small secrets.',
            zh: '戴着大一号帽子的棕色小橡果，悄悄囤着小秘密。'
        },
        shape: 'acorn',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'pokey',
        name: {
            en: 'Pokey',
            zh: '刺刺'
        },
        desc: {
            en: 'A round-armed cactus that hugs from a polite distance.',
            zh: '两只圆胳膊的小仙人掌，隔着一点点距离抱抱你。'
        },
        shape: 'cactus',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'aubie',
        name: {
            en: 'Aubie',
            zh: '茄茄'
        },
        desc: {
            en: 'A plump purple eggplant in a pointed green cap, round at the bottom and in no hurry.',
            zh: '戴着尖角绿帽子的紫茄子，底下圆滚滚的，做什么都不着急。'
        },
        shape: 'eggplant',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'nashi',
        name: {
            en: 'Nashi',
            zh: '梨梨'
        },
        desc: {
            en: 'A plump little pear with a leaf on its stem, round at the top and wide at the seat.',
            zh: '头顶一片小叶的圆胖小梨，上圆下宽，坐得稳稳的。'
        },
        shape: 'pear',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'pomme',
        name: {
            en: 'Pomme',
            zh: '苹苹'
        },
        desc: {
            en: 'A green apple with a deep dimple and one leaf, crisp even when it is sad.',
            zh: '凹着一个小窝、顶着一片叶子的青苹果，难过的时候也脆脆的。'
        },
        shape: 'apple',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'berry',
        name: {
            en: 'Berry',
            zh: '莓莓'
        },
        desc: {
            en: 'A red strawberry in a green crown and a face full of freckles, sweet with a little sour.',
            zh: '戴着绿王冠、满脸小雀斑的红草莓，甜里带一点点酸。'
        },
        shape: 'strawberry',
        color: 'red',
        accent: cast_ink('red')
    },
    {
        id: 'cheri',
        name: {
            en: 'Cheri',
            zh: '樱樱'
        },
        desc: {
            en: 'Two cherries on one stalk; the big one does the talking.',
            zh: '一根梗上挂着两颗樱桃，说话的总是大的那颗。'
        },
        shape: 'cherry',
        color: 'magenta',
        accent: cast_ink('magenta')
    },
    {
        id: 'avo',
        name: {
            en: 'Avo',
            zh: '油油'
        },
        desc: {
            en: 'Half an avocado with its round pit still in, creamy and unbothered.',
            zh: '切开的半个牛油果，圆圆的果核还在，软软糯糯，什么都不放在心上。'
        },
        shape: 'avocado',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'melo',
        name: {
            en: 'Melo',
            zh: '瓜瓜'
        },
        desc: {
            en: 'A slice of watermelon with a green rind and three seeds, cool on the hottest day.',
            zh: '绿皮红瓤的一角西瓜，带着三颗瓜子，再热的天也清清爽爽。'
        },
        shape: 'melon',
        color: 'red',
        accent: cast_ink('red')
    },
    {
        id: 'pud',
        name: {
            en: 'Pud',
            zh: '布布'
        },
        desc: {
            en: 'A wobbly custard pudding under a cap of caramel, with a mint leaf on top.',
            zh: '顶着一层焦糖和一片薄荷叶的布丁，轻轻一碰就晃一晃。'
        },
        shape: 'pudding',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'toasty',
        name: {
            en: 'Toasty',
            zh: '脆脆'
        },
        desc: {
            en: 'A slice of toast with a golden crust, still warm from the toaster.',
            zh: '一片烤得金黄的吐司，边是脆的，刚从烤面包机里跳出来，还热乎着。'
        },
        shape: 'toast',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'scoop',
        name: {
            en: 'Scoop',
            zh: '冰冰'
        },
        desc: {
            en: 'A pink scoop on a waffle cone, melting a little at the edges.',
            zh: '华夫筒上顶着一球粉色冰淇淋，边上微微化开了。'
        },
        shape: 'icecream',
        color: 'pink',
        accent: cast_ink('pink')
    },
    {
        id: 'cuppy',
        name: {
            en: 'Cuppy',
            zh: '杯杯'
        },
        desc: {
            en: 'A cupcake with a dome of frosting and a pleated paper cup, sweet all the way down.',
            zh: '顶着一团奶油的纸杯蛋糕，杯子上一道道褶，从上甜到下。'
        },
        shape: 'cupcake',
        color: 'pink',
        accent: cast_ink('pink')
    },
    {
        id: 'fry',
        name: {
            en: 'Fry',
            zh: '条条'
        },
        desc: {
            en: 'A carton of fresh fries, long ones and short ones squeezed in side by side.',
            zh: '一盒刚出锅的薯条，长长短短挤在纸盒里。'
        },
        shape: 'fries',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'candy',
        name: {
            en: 'Candy',
            zh: '糖糖'
        },
        desc: {
            en: 'A round hard candy twisted into a bow at each end, its wrapper rustling.',
            zh: '两头拧成蝴蝶结的圆硬糖，糖纸一动就沙沙响。'
        },
        shape: 'candy',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'patty',
        name: {
            en: 'Patty',
            zh: '堡堡'
        },
        desc: {
            en: 'A little burger with lettuce and a patty between round buns, three sesame seeds on top.',
            zh: '圆面包夹着生菜和肉饼的小汉堡，头顶三粒芝麻。'
        },
        shape: 'burger',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'twinkle',
        name: {
            en: 'Twinkle',
            zh: '亮亮'
        },
        desc: {
            en: 'A soft five-point star, round-tipped and glowing gold.',
            zh: '圆尖软五角星，边上没有波浪，金黄得发亮。'
        },
        shape: 'star',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'luv',
        name: {
            en: 'Luv',
            zh: '心心'
        },
        desc: {
            en: 'A plump red heart that wears its feelings in the middle of its face.',
            zh: '圆鼓鼓的小红心，心事都写在脸上。'
        },
        shape: 'heart',
        color: 'red',
        accent: cast_ink('red')
    },
    {
        id: 'ember',
        name: {
            en: 'Ember',
            zh: '焰焰'
        },
        desc: {
            en: 'A little flame leaning sideways, tip flicking in the breeze.',
            zh: '一苗侧倾的小火苗，尖顶轻轻甩。'
        },
        shape: 'flame',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'chime',
        name: {
            en: 'Chime',
            zh: '叮叮'
        },
        desc: {
            en: 'A violet bell with a round clapper, swaying one beat before it rings.',
            zh: '紫色小铃铛，底下一颗圆圆的铃舌，响之前先晃一晃。'
        },
        shape: 'bell',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'jelly',
        name: {
            en: 'Jelly',
            zh: '水灵'
        },
        desc: {
            en: 'An apricot ghost with a round head, two little nub arms and a soft scalloped hem, drifting along unhurried.',
            zh: '杏橙色的小幽灵，圆脑袋，两只小短手，裙边软软的波浪，慢悠悠地漂。'
        },
        shape: 'ghost',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'beep',
        name: {
            en: 'Beep',
            zh: '哔哔'
        },
        desc: {
            en: 'A cyan little robot with a bobbing antenna and a rounded-square head.',
            zh: '青蓝小机器人，方圆的脑袋，天线一晃一晃。'
        },
        shape: 'bot',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'luna',
        name: {
            en: 'Luna',
            zh: '露娜'
        },
        desc: {
            en: 'A plump crescent, forever on the edge of sleep.',
            zh: '圆鼓鼓的小月牙，安安静静地弯着，永远想睡觉。'
        },
        shape: 'crescent',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'boba',
        name: {
            en: 'Boba',
            zh: '波波'
        },
        desc: {
            en: 'A brown milk tea with three pearls at the bottom and a straw pointing at the sky.',
            zh: '棕色的珍珠奶茶，杯底三颗珍珠，吸管直指天空。'
        },
        shape: 'boba',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'orbi',
        name: {
            en: 'Orbi',
            zh: '环环'
        },
        desc: {
            en: 'A violet planet in a tilted ring, waltzing slowly on its own axis.',
            zh: '戴着一圈斜光环的紫色小星球，转起来像在跳圆舞。'
        },
        shape: 'planet',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'nook',
        name: {
            en: 'Nook',
            zh: '窝窝'
        },
        desc: {
            en: 'An orange cottage with a pointed roof and a chimney; the front wall is its face.',
            zh: '尖屋顶、小烟囱的橘色小房子，正面的墙就是它的脸。'
        },
        shape: 'cottage',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'chatty',
        name: {
            en: 'Chatty',
            zh: '叨叨'
        },
        desc: {
            en: 'A rounded speech bubble with a little tail; once it starts talking, it does not stop.',
            zh: '拖着一条小尾巴的圆角对话气泡，一开口就停不下来。'
        },
        shape: 'chat',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'joy',
        name: {
            en: 'Joy',
            zh: '喜喜'
        },
        desc: {
            en: 'A magenta gift box under a green bow, its lid one size wider than the box.',
            zh: '扎着绿蝴蝶结的洋红礼物盒，盖子比盒身宽一圈。'
        },
        shape: 'gift',
        color: 'magenta',
        accent: cast_ink('magenta')
    },
    {
        id: 'lumi',
        name: {
            en: 'Lumi',
            zh: '点点'
        },
        desc: {
            en: 'A round little light bulb that lights up whenever it has an idea.',
            zh: '圆圆的小灯泡，一有好点子就亮起来。'
        },
        shape: 'bulb',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'finn',
        name: {
            en: 'Finn',
            zh: '鱼鱼'
        },
        desc: {
            en: 'A round cyan fish with a big forked tail, swimming in place.',
            zh: '圆滚滚的青色小鱼，尾巴大大分叉，原地也能游起来。'
        },
        shape: 'fish',
        color: 'cyan',
        accent: cast_ink('cyan')
    },
    {
        id: 'inky',
        name: {
            en: 'Inky',
            zh: '墨墨'
        },
        desc: {
            en: 'A violet octopus with four fat legs that never agree on a direction.',
            zh: '紫色的小章鱼，四条胖腿，从来对不上方向。'
        },
        shape: 'octopus',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'roly',
        name: {
            en: 'Roly',
            zh: '噜噜'
        },
        desc: {
            en: 'A blue seal lying on its belly, one smooth roll from round head to forked tail.',
            zh: '趴着的蓝色小海豹，从圆脑袋一路滑到分叉的尾鳍。'
        },
        shape: 'seal',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'puff',
        name: {
            en: 'Puff',
            zh: '鼓鼓'
        },
        desc: {
            en: 'A green pufferfish that puffs into a ball of spikes when cross, and never actually pricks.',
            zh: '一生气就鼓成小刺球的绿色河豚，其实一点也不扎。'
        },
        shape: 'puffer',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'miso',
        name: {
            en: 'Miso',
            zh: '喵喵'
        },
        desc: {
            en: 'An orange cat with two pointed ears, curious about everything within reach.',
            zh: '一只竖着两只尖耳朵的橘猫，什么都想凑过去看看。'
        },
        shape: 'cat',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'hop',
        name: {
            en: 'Hop',
            zh: '跳跳'
        },
        desc: {
            en: 'A pink bunny with long ears and a round seat, always about to jump.',
            zh: '粉粉的小兔子，长耳朵圆屁股，随时准备蹦一下。'
        },
        shape: 'bunny',
        color: 'magenta',
        accent: cast_ink('magenta')
    },
    {
        id: 'bruno',
        name: {
            en: 'Bruno',
            zh: '熊熊'
        },
        desc: {
            en: 'A round brown bear with two small ears and a very soft heart.',
            zh: '圆滚滚的棕熊，两只小圆耳朵，心比谁都软。'
        },
        shape: 'bear',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'chirp',
        name: {
            en: 'Chirp',
            zh: '啾啾'
        },
        desc: {
            en: 'A yellow chick, all fluff, a tuft on top and tiny feet.',
            zh: '一团黄绒绒的小鸡，头顶一撮毛，脚丫小小的。'
        },
        shape: 'chick',
        color: 'yellow',
        accent: cast_ink('yellow')
    },
    {
        id: 'waddle',
        name: {
            en: 'Waddle',
            zh: '摇摇'
        },
        desc: {
            en: 'A penguin with a pale round belly, rocking from side to side.',
            zh: '肚皮圆圆发亮的小企鹅，走起路来左摇右晃。'
        },
        shape: 'penguin',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'oink',
        name: {
            en: 'Oink',
            zh: '哼哼'
        },
        desc: {
            en: 'A pink pig with folded ears and a big round snout, always sniffing out a snack.',
            zh: '耳朵折向两边、鼻子圆圆的粉色小猪，总能闻出点心在哪。'
        },
        shape: 'pig',
        color: 'pink',
        accent: cast_ink('pink')
    },
    {
        id: 'rusty',
        name: {
            en: 'Rusty',
            zh: '狐狐'
        },
        desc: {
            en: 'An orange fox with a heart-shaped face and a white chin, sly in a very polite way.',
            zh: '心形小脸、白下巴的橘色狐狸，狡黠得很有礼貌。'
        },
        shape: 'fox',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'leo',
        name: {
            en: 'Leo',
            zh: '狮狮'
        },
        desc: {
            en: 'A small lion in a big swirl of a mane, very brave as long as someone is watching.',
            zh: '顶着一大圈蓬蓬鬃毛的小狮子，只要有人看着就特别勇敢。'
        },
        shape: 'lion',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'hammy',
        name: {
            en: 'Hammy',
            zh: '囤囤'
        },
        desc: {
            en: 'An orange hamster with stuffed cheeks and a pale chin, always hoarding one more seed.',
            zh: '腮帮子鼓鼓、下巴白白的橘色小仓鼠，总想再多囤一颗瓜子。'
        },
        shape: 'hamster',
        color: 'orange',
        accent: cast_ink('orange')
    },
    {
        id: 'prickle',
        name: {
            en: 'Prickle',
            zh: '扎扎'
        },
        desc: {
            en: 'A brown hedgehog in a coat of round spikes, with the softest face underneath.',
            zh: '背着一圈圆圆小刺的棕色刺猬，底下藏着一张软乎乎的脸。'
        },
        shape: 'hedgehog',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'koko',
        name: {
            en: 'Koko',
            zh: '抱抱'
        },
        desc: {
            en: 'A gray koala with big fluffy ears that never lets go once it hugs.',
            zh: '大耳朵毛茸茸的灰色小考拉，抱住了就不撒手。'
        },
        shape: 'koala',
        color: 'gray',
        accent: cast_ink('gray')
    },
    {
        id: 'flap',
        name: {
            en: 'Flap',
            zh: '扑扑'
        },
        desc: {
            en: 'A violet bat with scalloped wings, wide awake in broad daylight.',
            zh: '翅膀边一波一波的紫色小蝙蝠，大白天也醒着陪你。'
        },
        shape: 'bat',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'kiki',
        name: {
            en: 'Kiki',
            zh: '琪琪'
        },
        desc: {
            en: 'A straight-banged bob in warm brown, neat to the last strand.',
            zh: '齐刘海的波波头，暖棕色，一丝不乱。'
        },
        shape: 'bob',
        color: 'brown',
        accent: cast_ink('brown')
    },
    {
        id: 'maru',
        name: {
            en: 'Maru',
            zh: '丸丸'
        },
        desc: {
            en: 'A pink top knot, tied up high and ready for anything.',
            zh: '粉色丸子头，扎得高高的，随时开工。'
        },
        shape: 'topknot',
        color: 'pink',
        accent: cast_ink('pink')
    },
    {
        id: 'zip',
        name: {
            en: 'Zip',
            zh: '小刺'
        },
        desc: {
            en: 'Blue spikes that never lie down, whatever the comb says.',
            zh: '一头蓝色刺毛，梳子说什么都不管用。'
        },
        shape: 'spiky',
        color: 'blue',
        accent: cast_ink('blue')
    },
    {
        id: 'fuzz',
        name: {
            en: 'Fuzz',
            zh: '卷卷'
        },
        desc: {
            en: 'A green cloud of curls with a very calm face underneath.',
            zh: '一团绿色卷毛，底下是一张很淡定的脸。'
        },
        shape: 'curly',
        color: 'green',
        accent: cast_ink('green')
    },
    {
        id: 'lulu',
        name: {
            en: 'Lulu',
            zh: '露露'
        },
        desc: {
            en: 'Two violet buns, one on each side, perfectly even.',
            zh: '两边各一个紫色小丸子，对得整整齐齐。'
        },
        shape: 'twinbuns',
        color: 'violet',
        accent: cast_ink('violet')
    },
    {
        id: 'cinder',
        name: {
            en: 'Cinder',
            zh: '红红'
        },
        desc: {
            en: 'A black lump of coal with blunt corners, named for the glow it keeps inside.',
            zh: '一块有棱有角的黑煤块，名字来自它肚子里那点没熄的红火。'
        },
        shape: 'chunk',
        color: 'night',
        accent: cast_ink('night')
    },
    {
        id: 'sooty',
        name: {
            en: 'Sooty',
            zh: '烟烟'
        },
        desc: {
            en: 'A round ball of coal, bumpy all over, who leaves a little smudge wherever it sits.',
            zh: '圆滚滚、边缘坑坑洼洼的小煤球，坐过的地方总会留下一点黑印。'
        },
        shape: 'lump',
        color: 'night',
        accent: cast_ink('night')
    },
    {
        id: 'ashy',
        name: {
            en: 'Ashy',
            zh: '灰灰'
        },
        desc: {
            en: 'A fluffy tuft of soot, bristling all the way round, that puffs up a little more when it is surprised.',
            zh: '一团毛茸茸的煤灰，一圈短绒毛炸开着，一吃惊就炸得更蓬。'
        },
        shape: 'fluff',
        color: 'night',
        accent: cast_ink('night')
    }
];
const CAST = CORE_CAST.filter((member)=>isListedShape(member.shape));
const CAST_IDS = CAST.map((member)=>member.id);
const cast_BY_ID = new Map(CORE_CAST.map((m)=>[
        m.id,
        m
    ]));
function registerCast(members) {
    for (const member of members)cast_BY_ID.set(member.id, {
        ...member,
        accent: cast_ink(member.color)
    });
}
const allCast = ()=>[
        ...cast_BY_ID.values()
    ];
const castMember = (id)=>{
    if (!id) return null;
    const member = cast_BY_ID.get(id);
    if (member) return member;
    requireTheme('cast', id);
    return cast_BY_ID.get(id) ?? null;
};
const isCastId = (value)=>ALL_CAST_IDS.includes(value);
const THEME_MEMBER_KINDS = [
    'new',
    'combo',
    'borrowed'
];
const topologies_eye = (len, width, angle, { dx = 0, dy = 0, bend = 0, extra, star } = {})=>({
        dx,
        dy,
        len,
        width,
        angle,
        bend,
        ...extra ? {
            extra
        } : null,
        ...star ? {
            star
        } : null
    });
const topologies_mirror = (s)=>({
        ...s,
        dx: -s.dx,
        angle: -s.angle,
        bend: -s.bend,
        ...s.extra ? {
            extra: {
                ...s.extra,
                dx: -s.extra.dx,
                angle: -s.extra.angle,
                bend: -s.extra.bend
            }
        } : null
    });
const topologies_both = (s)=>[
        s,
        {
            ...s
        }
    ];
const opposed = (s)=>[
        s,
        topologies_mirror(s)
    ];
const V = Math.PI / 2;
const EYE_TOPOLOGIES = {
    neutral: topologies_both(topologies_eye(0.5, 0.52, V)),
    neutralSoft: topologies_both(topologies_eye(0.46, 0.49, V)),
    closed: topologies_both(topologies_eye(0.62, 0.06, 0)),
    half: topologies_both(topologies_eye(0.28, 0.52, V)),
    wide: topologies_both(topologies_eye(0.62, 0.66, V)),
    happy: topologies_both(topologies_eye(0.58, 0.115, 0, {
        bend: -0.3
    })),
    joyful: topologies_both(topologies_eye(0.66, 0.1, 0, {
        bend: -0.38
    })),
    angry: opposed(topologies_eye(0.5, 0.28, 0.42)),
    squint: topologies_both(topologies_eye(0.55, 0.16, 0)),
    lookLeft: topologies_both(topologies_eye(0.48, 0.5, V, {
        dx: -0.3
    })),
    lookRight: topologies_both(topologies_eye(0.48, 0.5, V, {
        dx: 0.3
    })),
    lookUp: topologies_both(topologies_eye(0.46, 0.5, V, {
        dy: -0.26
    })),
    shy: topologies_both(topologies_eye(0.32, 0.48, V, {
        dy: 0.2
    })),
    suspicious: [
        topologies_eye(0.24, 0.48, V),
        topologies_eye(0.48, 0.5, V)
    ],
    sleepy: topologies_both(topologies_eye(0.56, 0.13, 0, {
        bend: 0.2
    })),
    excited: topologies_both(topologies_eye(0.64, 0.46, V)),
    dizzy: topologies_both(topologies_eye(0.26, 0.26, 0)),
    wink: [
        topologies_eye(0.56, 0.11, 0, {
            bend: -0.28
        }),
        topologies_eye(0.48, 0.5, V)
    ]
};
const EYE_TOPOLOGY_IDS = Object.keys(EYE_TOPOLOGIES);
const dotEye = (width, offset = {})=>topologies_both(topologies_eye(0.02, width, V, offset));
const brow = (angle, dy)=>({
        dx: -0.11,
        dy,
        len: 1.05,
        width: 0.3,
        angle,
        bend: 0,
        amount: 1
    });
const LOOK = 0.45;
const CUTE_EYE_TOPOLOGIES = {
    dot: dotEye(1),
    dotSmall: dotEye(0.62),
    dotWide: dotEye(1.35),
    dotLeft: dotEye(1, {
        dx: -LOOK
    }),
    dotRight: dotEye(1, {
        dx: LOOK
    }),
    dotUp: dotEye(1, {
        dy: -LOOK
    }),
    dotDown: dotEye(0.96, {
        dy: 0.39
    }),
    dotLook: dotEye(1, {
        dx: 0.43,
        dy: -0.48
    }),
    dotHalf: topologies_both(topologies_eye(0.45, 0.45, 0, {
        dy: 0.2
    })),
    dotSuspicious: [
        topologies_eye(0.45, 0.45, 0, {
            dy: 0.2
        }),
        topologies_eye(0.02, 1, V)
    ],
    arch: topologies_both(topologies_eye(1.09, 0.37, 0, {
        dy: 0.43,
        bend: -0.87
    })),
    archWide: topologies_both(topologies_eye(1.2, 0.34, 0, {
        dy: 0.45,
        bend: -1.02
    })),
    curve: topologies_both(topologies_eye(1.09, 0.37, 0, {
        bend: 0.43
    })),
    curveSleepy: topologies_both(topologies_eye(1.0, 0.34, 0, {
        dy: 0.1,
        bend: 0.62
    })),
    cross: topologies_both(topologies_eye(1.23, 0.37, Math.PI / 4, {
        extra: {
            dx: 0,
            dy: 0,
            len: 1.23,
            width: 0.37,
            angle: -Math.PI / 4,
            bend: 0,
            amount: 1
        }
    })),
    star: topologies_both(topologies_eye(0.02, 0.2, V, {
        star: 1
    })),
    sad: opposed(topologies_eye(0.02, 0.91, V, {
        dy: 0.26,
        extra: brow(-0.38, -1.48)
    })),
    mad: opposed(topologies_eye(0.02, 0.95, V, {
        dy: 0.12,
        extra: brow(0.4, -1.4)
    })),
    wink: [
        topologies_eye(1.0, 0.36, 0, {
            dy: 0.43,
            bend: -0.8
        }),
        topologies_eye(0.02, 1, V)
    ]
};
const CUTE_EYE_IDS = Object.keys(CUTE_EYE_TOPOLOGIES);
const EYE_TO_CUTE = {
    neutral: 'dot',
    neutralSoft: 'dot',
    closed: 'curve',
    half: 'dotHalf',
    wide: 'dotWide',
    happy: 'arch',
    joyful: 'archWide',
    angry: 'mad',
    squint: 'dotHalf',
    lookLeft: 'dotLeft',
    lookRight: 'dotRight',
    lookUp: 'dotUp',
    shy: 'dotDown',
    suspicious: 'dotSuspicious',
    sleepy: 'curveSleepy',
    excited: 'dotWide',
    dizzy: 'cross',
    wink: 'wink'
};
function cuteNameFor(id) {
    if (id in CUTE_EYE_TOPOLOGIES) return id;
    return EYE_TO_CUTE[id] ?? 'dot';
}
function eyePairFor(cute, id) {
    if (cute) {
        const own = CUTE_EYE_TOPOLOGIES[id];
        return own ?? CUTE_EYE_TOPOLOGIES[EYE_TO_CUTE[id] ?? 'dot'];
    }
    return EYE_TOPOLOGIES[id] ?? EYE_TOPOLOGIES.neutral;
}
const CHARACTER_STATES = [
    'idle',
    'sleeping',
    'drowsy',
    'bored',
    'waking',
    'powering-down',
    'listening',
    'thinking',
    'searching',
    'reading',
    'writing',
    'working',
    'loading',
    'progress',
    'radar',
    'orbit',
    'dictating',
    'uploading',
    'sending',
    'receiving',
    'messaging',
    'waiting',
    'spawning',
    'composing',
    'dragging',
    'happy',
    'excited',
    'laughing',
    'playful',
    'proud',
    'celebrate',
    'bouncing',
    'shy',
    'sad',
    'angry',
    'confused',
    'suspicious',
    'surprised',
    'scared',
    'curious',
    'humming',
    'alerting',
    'notifying',
    'refusing'
];
const STATE_GROUP_IDS = [
    'resting',
    'attending',
    'feeling',
    'signalling'
];
const STATE_GROUPS = [
    {
        id: 'resting',
        label: 'Resting',
        labelZh: '静息',
        states: [
            'idle',
            'sleeping',
            'drowsy',
            'bored',
            'waking',
            'powering-down'
        ]
    },
    {
        id: 'attending',
        label: 'Attending',
        labelZh: '处理中',
        states: [
            'listening',
            'thinking',
            'searching',
            'reading',
            'writing',
            'working',
            'loading',
            'progress',
            'radar',
            'orbit',
            'dictating',
            'uploading',
            'sending',
            'receiving',
            'messaging',
            'waiting',
            'spawning',
            'composing',
            'dragging'
        ]
    },
    {
        id: 'feeling',
        label: 'Feeling',
        labelZh: '情绪',
        states: [
            'happy',
            'excited',
            'laughing',
            'playful',
            'proud',
            'celebrate',
            'bouncing',
            'shy',
            'sad',
            'angry',
            'confused',
            'suspicious',
            'surprised',
            'scared',
            'curious',
            'humming'
        ]
    },
    {
        id: 'signalling',
        label: 'Signalling',
        labelZh: '提示',
        states: [
            'alerting',
            'notifying',
            'refusing'
        ]
    }
];
const STATE_EYE_TOPOLOGIES = {
    idle: [
        'neutral',
        'neutralSoft',
        'neutral',
        'lookLeft',
        'neutral',
        'lookRight'
    ],
    sleeping: [
        'closed'
    ],
    drowsy: [
        'sleepy',
        'half',
        'sleepy'
    ],
    bored: [
        'half',
        'lookLeft',
        'half',
        'lookRight'
    ],
    waking: [
        'closed',
        'half',
        'neutral'
    ],
    'powering-down': [
        'neutral',
        'half',
        'closed'
    ],
    listening: [
        'lookLeft',
        'neutral',
        'lookLeft'
    ],
    thinking: [
        'squint',
        'lookUp',
        'squint'
    ],
    searching: [
        'lookLeft',
        'lookRight',
        'lookUp',
        'neutral'
    ],
    reading: [
        'lookLeft',
        'lookRight'
    ],
    writing: [
        'shy',
        'neutral'
    ],
    working: [
        'angry',
        'squint',
        'angry'
    ],
    loading: [
        'neutral',
        'neutralSoft'
    ],
    progress: [
        'neutral'
    ],
    radar: [
        'neutral',
        'lookLeft',
        'lookRight'
    ],
    orbit: [
        'neutral',
        'neutralSoft'
    ],
    dictating: [
        'lookLeft',
        'neutral'
    ],
    uploading: [
        'lookUp',
        'neutral'
    ],
    sending: [
        'neutral',
        'happy'
    ],
    receiving: [
        'wide',
        'neutral'
    ],
    messaging: [
        'neutral',
        'happy'
    ],
    waiting: [
        'neutral',
        'lookLeft',
        'neutral',
        'lookRight'
    ],
    spawning: [
        'wide',
        'neutral'
    ],
    composing: [
        'squint',
        'neutral'
    ],
    dragging: [
        'lookRight',
        'neutral',
        'lookRight'
    ],
    happy: [
        'happy',
        'neutral',
        'happy'
    ],
    excited: [
        'excited',
        'joyful'
    ],
    laughing: [
        'joyful',
        'happy'
    ],
    playful: [
        'happy',
        'wink',
        'joyful',
        'neutral'
    ],
    proud: [
        'lookUp',
        'happy'
    ],
    celebrate: [
        'joyful',
        'excited',
        'wink',
        'happy'
    ],
    bouncing: [
        'happy',
        'excited'
    ],
    shy: [
        'shy',
        'half'
    ],
    sad: [
        'sleepy',
        'half'
    ],
    angry: [
        'angry'
    ],
    confused: [
        'suspicious',
        'lookUp',
        'squint'
    ],
    suspicious: [
        'suspicious',
        'squint'
    ],
    surprised: [
        'wide'
    ],
    scared: [
        'wide',
        'dizzy'
    ],
    curious: [
        'wide',
        'lookLeft',
        'wide',
        'lookRight'
    ],
    humming: [
        'half',
        'sleepy',
        'half',
        'neutralSoft'
    ],
    alerting: [
        'wide',
        'neutral'
    ],
    notifying: [
        'wide',
        'happy',
        'neutral'
    ],
    refusing: [
        'suspicious',
        'half'
    ]
};
const STATE_CUTE_EYES = {
    idle: [
        'dot',
        'dot',
        'dot',
        'dotLeft',
        'dot',
        'dotRight'
    ],
    sleeping: [
        'curve'
    ],
    drowsy: [
        'curveSleepy',
        'dotHalf',
        'curveSleepy'
    ],
    bored: [
        'dotHalf',
        'dotLeft',
        'dotHalf',
        'dotRight'
    ],
    waking: [
        'curve',
        'dotHalf',
        'dot'
    ],
    'powering-down': [
        'dot',
        'dotHalf',
        'curve'
    ],
    listening: [
        'dotLeft',
        'dot',
        'dotLeft'
    ],
    thinking: [
        'dotLook',
        'dotUp',
        'dotLook'
    ],
    searching: [
        'dotLeft',
        'dotRight',
        'dotUp',
        'dot'
    ],
    reading: [
        'dotLeft',
        'dotRight'
    ],
    writing: [
        'dotDown',
        'dot'
    ],
    working: [
        'dotDown',
        'dot',
        'dotDown'
    ],
    loading: [
        'dot',
        'dotLook'
    ],
    progress: [
        'dot'
    ],
    radar: [
        'dot',
        'dotLeft',
        'dotRight'
    ],
    orbit: [
        'dot',
        'dotLook'
    ],
    dictating: [
        'dotLeft',
        'dot'
    ],
    uploading: [
        'dotUp',
        'dot'
    ],
    sending: [
        'dot',
        'arch'
    ],
    receiving: [
        'dotWide',
        'dot'
    ],
    messaging: [
        'dot',
        'arch'
    ],
    waiting: [
        'dot',
        'dotLeft',
        'dot',
        'dotRight'
    ],
    spawning: [
        'dotWide',
        'dot'
    ],
    composing: [
        'dotDown',
        'dot'
    ],
    dragging: [
        'dotRight',
        'dot',
        'dotRight'
    ],
    happy: [
        'arch',
        'archWide',
        'arch'
    ],
    excited: [
        'dotWide',
        'archWide'
    ],
    laughing: [
        'archWide',
        'arch'
    ],
    playful: [
        'arch',
        'wink',
        'archWide',
        'dot'
    ],
    proud: [
        'dotUp',
        'arch'
    ],
    celebrate: [
        'star',
        'archWide',
        'wink',
        'arch'
    ],
    bouncing: [
        'arch',
        'dotWide'
    ],
    shy: [
        'dotDown',
        'dotHalf'
    ],
    sad: [
        'sad'
    ],
    angry: [
        'mad'
    ],
    confused: [
        'dotSuspicious',
        'dotLook',
        'dotHalf'
    ],
    suspicious: [
        'dotSuspicious',
        'dotHalf'
    ],
    surprised: [
        'dotWide'
    ],
    scared: [
        'dotWide',
        'dotSmall'
    ],
    curious: [
        'dotWide',
        'dotLeft',
        'dotWide',
        'dotRight'
    ],
    humming: [
        'curve',
        'dotHalf',
        'curve',
        'dot'
    ],
    alerting: [
        'dotWide',
        'dot'
    ],
    notifying: [
        'dotWide',
        'arch',
        'dot'
    ],
    refusing: [
        'cross',
        'dotHalf'
    ]
};
const STATE_CUTE_MOUTH = {
    idle: 'none',
    sleeping: 'none',
    drowsy: 'none',
    bored: 'flat',
    waking: 'dot',
    'powering-down': 'none',
    listening: 'none',
    thinking: 'flat',
    searching: 'dot',
    reading: 'none',
    writing: 'none',
    working: 'none',
    loading: 'none',
    progress: 'none',
    radar: 'none',
    orbit: 'none',
    dictating: 'o',
    uploading: 'none',
    sending: 'smile',
    receiving: 'dot',
    messaging: 'cat',
    waiting: 'none',
    spawning: 'dot',
    composing: 'cat',
    dragging: 'o',
    happy: 'cat',
    excited: 'grin',
    laughing: 'laugh',
    playful: 'smirk',
    proud: 'smile',
    celebrate: 'grin',
    bouncing: 'smile',
    shy: 'cat',
    sad: 'frown',
    angry: 'frown',
    confused: 'wavy',
    suspicious: 'flat',
    surprised: 'o',
    scared: 'wavy',
    curious: 'dot',
    humming: 'smile',
    alerting: 'o',
    notifying: 'dot',
    refusing: 'wavy'
};
const STATE_BLUSH = {
    idle: 0,
    sleeping: 0.6,
    drowsy: 0,
    bored: 0,
    waking: 0,
    'powering-down': 0,
    listening: 0,
    thinking: 0,
    searching: 0,
    reading: 0,
    writing: 0,
    working: 0,
    loading: 0,
    progress: 0,
    radar: 0,
    orbit: 0,
    dictating: 0,
    uploading: 0,
    sending: 0,
    receiving: 0,
    messaging: 0,
    waiting: 0,
    spawning: 0,
    composing: 0,
    dragging: 0,
    happy: 1,
    excited: 1,
    laughing: 1,
    playful: 0.6,
    proud: 0.6,
    celebrate: 1,
    bouncing: 0,
    shy: 1,
    sad: 0,
    angry: 0,
    confused: 0,
    suspicious: 0,
    surprised: 0,
    scared: 0,
    curious: 0,
    humming: 0.6,
    alerting: 0,
    notifying: 0,
    refusing: 0
};
const STATE_FX = {
    sleeping: 'zz',
    drowsy: 'zz',
    working: 'arc',
    proud: 'sparkle',
    celebrate: 'sparkle',
    refusing: 'bang',
    surprised: 'strokes',
    scared: 'strokes',
    happy: 'heart',
    sad: 'tear',
    thinking: 'dots',
    waiting: 'ellipsis',
    orbit: 'orbit',
    messaging: 'bubbles',
    loading: 'spinner',
    progress: 'progress',
    radar: 'ripple',
    dictating: 'waves',
    uploading: 'rise',
    receiving: 'fall',
    sending: 'send',
    spawning: 'gather',
    writing: 'pencil',
    alerting: 'bang'
};
const STATE_EYE_SWITCH_MS = {
    idle: [
        9000,
        16000
    ],
    sleeping: null,
    drowsy: [
        2600,
        4200
    ],
    bored: [
        2400,
        4000
    ],
    waking: [
        420,
        700
    ],
    'powering-down': [
        600,
        900
    ],
    listening: [
        2200,
        3800
    ],
    thinking: [
        1600,
        2800
    ],
    searching: [
        550,
        1150
    ],
    reading: [
        900,
        1500
    ],
    writing: [
        1800,
        3000
    ],
    working: [
        2600,
        4200
    ],
    loading: [
        2400,
        3600
    ],
    progress: null,
    radar: [
        1800,
        3000
    ],
    orbit: [
        2600,
        4200
    ],
    dictating: [
        1400,
        2400
    ],
    uploading: [
        1600,
        2600
    ],
    sending: [
        900,
        1500
    ],
    receiving: [
        900,
        1500
    ],
    messaging: [
        1800,
        3000
    ],
    waiting: [
        2000,
        3400
    ],
    spawning: [
        700,
        1100
    ],
    composing: [
        1600,
        2600
    ],
    dragging: [
        1500,
        2100
    ],
    happy: [
        2400,
        4200
    ],
    excited: [
        900,
        1600
    ],
    laughing: [
        700,
        1200
    ],
    playful: [
        800,
        1600
    ],
    proud: [
        2000,
        3400
    ],
    celebrate: [
        700,
        1300
    ],
    bouncing: [
        1200,
        2000
    ],
    shy: [
        2200,
        3600
    ],
    sad: [
        2600,
        4200
    ],
    angry: null,
    confused: [
        1100,
        1900
    ],
    suspicious: [
        1800,
        3000
    ],
    surprised: null,
    scared: [
        600,
        1100
    ],
    curious: [
        1800,
        3200
    ],
    humming: [
        2400,
        4000
    ],
    alerting: [
        700,
        1200
    ],
    notifying: [
        900,
        1500
    ],
    refusing: [
        2600,
        4500
    ]
};
const STATE_BLINK_MS = Object.fromEntries(CHARACTER_STATES.map((s)=>{
    if ('sleeping' === s || 'drowsy' === s || 'powering-down' === s || 'sad' === s) return [
        s,
        null
    ];
    if ('surprised' === s || 'scared' === s || 'alerting' === s) return [
        s,
        [
            5200,
            9000
        ]
    ];
    if ('excited' === s || 'celebrate' === s || 'laughing' === s) return [
        s,
        [
            2600,
            4600
        ]
    ];
    return [
        s,
        [
            3400,
            7200
        ]
    ];
}));
const STATE_FACE_TUNE = {
    angry: {
        gap: 1.08,
        size: 0.9
    },
    working: {
        size: 1.05,
        eyeWidth: 1.16,
        eyeHeight: 1.14
    },
    surprised: {
        size: 1.1,
        gap: 1.04
    },
    scared: {
        size: 1.12,
        gap: 1.06
    },
    shy: {
        size: 0.93,
        gap: 0.94,
        height: 1.06
    },
    sad: {
        size: 0.95,
        height: 1.05
    },
    proud: {
        size: 1.02,
        height: 0.94
    },
    excited: {
        size: 1.07
    },
    celebrate: {
        size: 1.07
    },
    sleeping: {
        size: 0.98,
        height: 1.04
    },
    thinking: {
        gap: 1.04
    },
    suspicious: {
        gap: 1.05,
        size: 0.95
    },
    refusing: {
        gap: 1.05,
        size: 0.98
    },
    curious: {
        size: 1.05
    },
    humming: {
        size: 0.98,
        height: 1.02
    }
};
function faceTuneForState(state, base) {
    const adjust = STATE_FACE_TUNE[state];
    if (!adjust) return base;
    return {
        size: base.size * (adjust.size ?? 1),
        gap: base.gap * (adjust.gap ?? 1),
        height: base.height * (adjust.height ?? 1),
        eyeWidth: base.eyeWidth * (adjust.eyeWidth ?? 1),
        eyeHeight: base.eyeHeight * (adjust.eyeHeight ?? 1)
    };
}
const STATE_GAZE = {
    default: {
        x: 4,
        y: 2.4,
        every: [
            2400,
            4600
        ]
    },
    searching: {
        x: 15,
        y: 9,
        every: [
            550,
            1150
        ]
    },
    reading: {
        x: 12,
        y: 4,
        every: [
            700,
            1200
        ]
    },
    thinking: {
        x: 7,
        y: 6,
        every: [
            1400,
            2400
        ]
    },
    listening: {
        x: 5,
        y: 3,
        every: [
            1800,
            3000
        ]
    },
    shy: {
        x: 3,
        y: 7,
        every: [
            2000,
            3400
        ]
    },
    bored: {
        x: 10,
        y: 4,
        every: [
            1600,
            2800
        ]
    },
    confused: {
        x: 9,
        y: 7,
        every: [
            900,
            1600
        ]
    },
    scared: {
        x: 11,
        y: 6,
        every: [
            500,
            1000
        ]
    },
    curious: {
        x: 9,
        y: 5,
        every: [
            1200,
            2200
        ]
    },
    humming: {
        x: 5,
        y: 4,
        every: [
            2200,
            3800
        ]
    },
    dragging: {
        x: 13,
        y: 5,
        every: [
            1500,
            2100
        ]
    }
};
const gazeForState = (state)=>STATE_GAZE[state] ?? STATE_GAZE.default;
const STATE_ENTRY_EFFECTS = {
    celebrate: {
        spin: 1,
        burst: 16
    },
    surprised: {
        bounce: true
    },
    waking: {
        bounce: true
    }
};
const ANTIC_STATES = [
    'idle',
    'happy',
    'proud'
];
const STATE_MOUTH = {
    idle: 'soft',
    sleeping: 'flat',
    drowsy: 'flat',
    bored: 'flat',
    waking: 'o',
    'powering-down': 'flat',
    listening: 'soft',
    thinking: 'flat',
    searching: 'dot',
    reading: 'flat',
    writing: 'soft',
    working: 'flat',
    loading: 'dot',
    progress: 'flat',
    radar: 'dot',
    orbit: 'soft',
    dictating: 'o',
    uploading: 'soft',
    sending: 'smile',
    receiving: 'o',
    messaging: 'soft',
    waiting: 'soft',
    spawning: 'o',
    composing: 'soft',
    dragging: 'o',
    happy: 'smile',
    excited: 'grin',
    laughing: 'open',
    playful: 'smirk',
    proud: 'grin',
    celebrate: 'grin',
    bouncing: 'smile',
    shy: 'pout',
    sad: 'frown',
    angry: 'wavy',
    confused: 'wavy',
    suspicious: 'tight',
    surprised: 'open',
    scared: 'wavy',
    curious: 'o',
    humming: 'hum',
    alerting: 'o',
    notifying: 'dot',
    refusing: 'frown'
};
const STATE_MOUTH_TALK = [
    'composing',
    'dictating',
    'messaging',
    'sending',
    'laughing',
    'humming'
];
const STATE_SETTLE_TO = {
    spawning: {
        to: 'idle',
        afterMs: 2000
    },
    waking: {
        to: 'idle',
        afterMs: 1600
    }
};
const settleForState = (state)=>STATE_SETTLE_TO[state] ?? null;
const mouthForState = (state)=>STATE_MOUTH[state] ?? 'soft';
const isCharacterState = (value)=>CHARACTER_STATES.includes(value);
const LINE_WEIGHT = 0.34;
const LINE_WEIGHT_RANGE = [
    0.8,
    1.25
];
function resolveLineWeight(multiplier) {
    const m = null != multiplier && Number.isFinite(multiplier) ? multiplier : 1;
    return LINE_WEIGHT * clamp(m, LINE_WEIGHT_RANGE[0], LINE_WEIGHT_RANGE[1]);
}
const LINE_FACE_TUNE = {
    eyeWidth: 0.66,
    eyeHeight: 0.66
};
const NOSE_DROP = 0.86;
const MOUTH_DROP = 2.3;
const NOSE_GAZE = 0.6;
const MOUTH_GAZE = 0.5;
const MOUTH_SCALE = 1.5;
const features_mouth = (width, bend, open = 0, { wave = 0, skew = 0, dy = 0 } = {})=>({
        width: width * MOUTH_SCALE,
        bend: bend * MOUTH_SCALE,
        open: open * MOUTH_SCALE,
        wave: wave * MOUTH_SCALE,
        skew,
        dy: dy * MOUTH_SCALE
    });
const MOUTHS = {
    flat: features_mouth(0.5, 0),
    soft: features_mouth(0.5, 0.09),
    smile: features_mouth(0.6, 0.22),
    grin: features_mouth(0.7, 0.26, 0.14),
    smirk: features_mouth(0.5, 0.15, 0, {
        skew: 0.7
    }),
    o: features_mouth(0.24, 0, 0.48),
    open: features_mouth(0.5, 0.14, 0.62),
    dot: features_mouth(0.1, 0, 0.2),
    wavy: features_mouth(0.55, 0, 0, {
        wave: 0.11
    }),
    frown: features_mouth(0.5, -0.18),
    pout: features_mouth(0.3, -0.1, 0, {
        dy: 0.06
    }),
    hum: features_mouth(0.34, 0.14, 0, {
        wave: 0.05
    }),
    tight: features_mouth(0.32, 0, 0, {
        dy: 0.04
    })
};
const getMouth = (id)=>MOUTHS[id] ?? MOUTHS.flat;
const features_cute = (width, bend, open = 0, { wave = 0, skew = 0, dy = 0, cat, upper, show } = {})=>({
        width,
        bend,
        open,
        wave,
        skew,
        dy,
        ...null != cat ? {
            cat
        } : null,
        ...null != upper ? {
            upper
        } : null,
        ...null != show ? {
            show
        } : null
    });
const CUTE_MOUTHS = {
    none: features_cute(0.76, 0, 0, {
        dy: 0.22,
        show: 0
    }),
    smile: features_cute(1.09, 0.54),
    cat: features_cute(1.3, 0, 0, {
        cat: 0.43
    }),
    grin: features_cute(1.41, 0, 1.74, {
        dy: -0.22,
        upper: 0
    }),
    laugh: features_cute(1.6, 0, 2.3, {
        dy: -0.3,
        upper: 0
    }),
    flat: features_cute(0.76, 0, 0, {
        dy: 0.22
    }),
    frown: features_cute(1.09, -0.54, 0, {
        dy: 0.65
    }),
    o: features_cute(0.65, 0, 1.57, {
        dy: 0.22,
        upper: 0.5
    }),
    dot: features_cute(0.24, 0, 0.5, {
        dy: 0.1,
        upper: 0.5
    }),
    wavy: features_cute(1.52, 0, 0, {
        dy: 0.22,
        cat: -0.54
    }),
    smirk: features_cute(1.0, 0.35, 0, {
        skew: 0.7
    }),
    pout: features_cute(0.6, -0.3, 0, {
        dy: 0.5
    })
};
const getCuteMouth = (id)=>CUTE_MOUTHS[id] ?? CUTE_MOUTHS.flat;
function mouthSpecFor(isCute, id) {
    return (isCute ? CUTE_MOUTHS : MOUTHS)[id];
}
function morphMouth(a, b, t) {
    const out = {
        width: easing_lerp(a.width, b.width, t),
        bend: easing_lerp(a.bend, b.bend, t),
        open: easing_lerp(a.open, b.open, t),
        wave: easing_lerp(a.wave, b.wave, t),
        skew: easing_lerp(a.skew, b.skew, t),
        dy: easing_lerp(a.dy, b.dy, t)
    };
    if (null != a.cat || null != b.cat) out.cat = easing_lerp(a.cat ?? 0, b.cat ?? 0, t);
    if (null != a.upper || null != b.upper) out.upper = easing_lerp(a.upper ?? UPPER_SHARE, b.upper ?? UPPER_SHARE, t);
    if (null != a.show || null != b.show) out.show = easing_lerp(a.show ?? 1, b.show ?? 1, t);
    return out;
}
const UPPER_SHARE = 0.38;
function mouthOutline(spec, radius, samples = 16) {
    const { width, bend, open, wave, skew, dy } = spec;
    const W = width * radius;
    const B = bend * radius;
    const O = open * radius;
    const A = wave * radius;
    const Y = dy * radius;
    const C = (spec.cat ?? 0) * radius;
    const UPPER = spec.upper ?? UPPER_SHARE;
    const lip = (u)=>{
        const bow = B * (1 - u * u) * (1 + skew * u);
        const ripple = A * Math.sin(Math.PI * u);
        const bumps = 0.5 * C * (1 - Math.cos(2 * Math.PI * u));
        return Y + bow + ripple + bumps;
    };
    const lens = (u)=>O * Math.sqrt(Math.max(0, 1 - u * u));
    const upper = [];
    const lower = [];
    for(let i = 0; i <= samples; i++){
        const u = -1 + 2 * i / samples;
        const x = u * W;
        const y = lip(u);
        const gap = lens(u);
        upper.push([
            x,
            y - gap * UPPER
        ]);
        lower.push([
            x,
            y + gap * (1 - UPPER)
        ]);
    }
    lower.reverse();
    return upper.concat(lower.slice(1, -1));
}
function mouthProfile(spec, radius) {
    const W = Math.max(spec.width * radius, 1e-6);
    const upper = spec.upper ?? UPPER_SHARE;
    const lip = (u)=>spec.dy * radius + spec.bend * radius * (1 - u * u) * (1 + spec.skew * u) + spec.wave * radius * Math.sin(Math.PI * u) + (spec.cat ?? 0) * radius * 0.5 * (1 - Math.cos(2 * Math.PI * u));
    const lens = (u)=>spec.open * radius * Math.sqrt(Math.max(0, 1 - u * u));
    return {
        x0: -W,
        x1: W,
        top: (x)=>lip(x / W) - lens(x / W) * upper,
        bottom: (x)=>lip(x / W) + lens(x / W) * (1 - upper)
    };
}
const quad = (p0, p1, p2, n)=>{
    const out = [];
    for(let i = 0; i <= n; i++){
        const t = i / n;
        const u = 1 - t;
        out.push([
            u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
        ]);
    }
    return out;
};
const cubic = (p0, p1, p2, p3, n)=>{
    const out = [];
    for(let i = 0; i <= n; i++){
        const t = i / n;
        const u = 1 - t;
        const a = u * u * u;
        const b = 3 * u * u * t;
        const c = 3 * u * t * t;
        const d = t * t * t;
        out.push([
            a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
            a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
        ]);
    }
    return out;
};
const join = (...parts)=>parts.reduce((acc, p)=>acc.concat(acc.length ? p.slice(1) : p), []);
const RAW_NOSES = {
    slant: [
        [
            13,
            5
        ],
        [
            6,
            29
        ]
    ],
    angular: [
        [
            13,
            6
        ],
        [
            7,
            26
        ],
        [
            15,
            28.5
        ]
    ],
    hook: join([
        [
            13,
            5
        ],
        [
            5.5,
            27
        ]
    ], quad([
        5.5,
        27
    ], [
        4.5,
        33.5
    ], [
        11,
        32.5
    ], 8)),
    long: join([
        [
            15,
            3
        ],
        [
            4,
            30
        ]
    ], quad([
        4,
        30
    ], [
        2.5,
        35.5
    ], [
        10,
        35
    ], 8)),
    curve: join(cubic([
        12,
        6
    ], [
        9.5,
        14
    ], [
        5,
        21
    ], [
        6,
        28
    ], 10), quad([
        6,
        28
    ], [
        6.5,
        33
    ], [
        12,
        32
    ], 6)),
    bow: cubic([
        13,
        5
    ], [
        7.5,
        13
    ], [
        5,
        21
    ], [
        7,
        29
    ], 14)
};
const NOSE_UNIT = 1.4 / 24;
function resampleOpen(points, n) {
    if (points.length < 2) return points.slice();
    const cum = [
        0
    ];
    for(let i = 1; i < points.length; i++){
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        cum.push(cum[i - 1] + Math.hypot(x1 - x0, y1 - y0));
    }
    const total = cum[cum.length - 1];
    const out = [];
    let seg = 1;
    for(let i = 0; i < n; i++){
        const target = total * i / (n - 1);
        while(seg < cum.length - 1 && cum[seg] < target)seg++;
        const a = points[seg - 1];
        const b = points[seg];
        const span = cum[seg] - cum[seg - 1] || 1;
        const t = (target - cum[seg - 1]) / span;
        out.push([
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t
        ]);
    }
    return out;
}
function buildNose(raw) {
    let minX = 1 / 0;
    let maxX = -1 / 0;
    let minY = 1 / 0;
    let maxY = -1 / 0;
    for (const [x, y] of raw){
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return resampleOpen(raw.map(([x, y])=>[
            (x - cx) * NOSE_UNIT,
            (y - cy) * NOSE_UNIT
        ]), 16);
}
const NOSES = {
    slant: buildNose(RAW_NOSES.slant),
    angular: buildNose(RAW_NOSES.angular),
    hook: buildNose(RAW_NOSES.hook),
    long: buildNose(RAW_NOSES.long),
    curve: buildNose(RAW_NOSES.curve),
    bow: buildNose(RAW_NOSES.bow)
};
function nosePolyline(id, radius, cx = 0, cy = 0) {
    const base = NOSES[id] ?? NOSES.slant;
    return base.map(([x, y])=>[
            cx + x * radius,
            cy + y * radius
        ]);
}
const isMouthId = (value)=>MOUTH_IDS.includes(value);
const isNoseId = (value)=>NOSE_IDS.includes(value);
const BAND_COLUMNS = 24;
function ellipseBand(cx, cy, rx, ry) {
    const half = (x)=>ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / Math.max(rx, 1e-6)) ** 2));
    return {
        x0: cx - rx,
        x1: cx + rx,
        top: (x)=>cy - half(x),
        bottom: (x)=>cy + half(x)
    };
}
function lidBand(top, bottom) {
    return {
        x0: -1 / 0,
        x1: 1 / 0,
        top,
        bottom
    };
}
function roundedRectBand(cx, cy, w, h, r) {
    const k = Math.max(0, Math.min(r, w, h));
    const half = (x)=>{
        const dx = Math.abs(x - cx) - (w - k);
        return dx > 0 ? h - k + Math.sqrt(Math.max(0, k * k - dx * dx)) : h;
    };
    return {
        x0: cx - w,
        x1: cx + w,
        top: (x)=>cy - half(x),
        bottom: (x)=>cy + half(x)
    };
}
function convexBand(points) {
    const xs = points.map(([x])=>x);
    const cross = (x, pick, start)=>{
        let y = start;
        for(let i = 0; i < points.length; i++){
            const [x0, y0] = points[i];
            const [x1, y1] = points[(i + 1) % points.length];
            if (!(x < Math.min(x0, x1) || x > Math.max(x0, x1)) && x0 !== x1) y = pick(y, y0 + (y1 - y0) * (x - x0) / (x1 - x0));
        }
        return y;
    };
    return {
        x0: Math.min(...xs),
        x1: Math.max(...xs),
        top: (x)=>cross(x, Math.min, 1 / 0),
        bottom: (x)=>cross(x, Math.max, -1 / 0)
    };
}
function meet(...bands) {
    return {
        x0: Math.max(...bands.map((b)=>b.x0)),
        x1: Math.min(...bands.map((b)=>b.x1)),
        top: (x)=>Math.max(...bands.map((b)=>b.top(x))),
        bottom: (x)=>Math.min(...bands.map((b)=>b.bottom(x)))
    };
}
function bandRing(band, columns = BAND_COLUMNS) {
    if (!(band.x1 > band.x0) || !Number.isFinite(band.x0) || !Number.isFinite(band.x1)) return null;
    const top = [];
    const bottom = [];
    let open = false;
    for(let i = 0; i <= columns; i++){
        const u = 0.5 - 0.5 * Math.cos(Math.PI * i / columns);
        const x = band.x0 + (band.x1 - band.x0) * u;
        const t = band.top(x);
        const b = Math.max(t, band.bottom(x));
        if (Number.isFinite(t) && Number.isFinite(b)) {
            if (b - t > 1e-4) open = true;
            top.push([
                x,
                t
            ]);
            bottom.push([
                x,
                b
            ]);
        }
    }
    if (!open) return null;
    bottom.reverse();
    return top.concat(bottom);
}
function geometry_ribbon(points, half, closed = false) {
    const n = points.length;
    if (0 === n) return [];
    const width = (i)=>Math.max(0, 'number' == typeof half ? half : half[i] ?? 0);
    if (1 === n) return circleRing(points[0][0], points[0][1], width(0), 10);
    const normal = (i)=>{
        const prev = points[closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
        const next = points[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
        const dx = next[0] - prev[0];
        const dy = next[1] - prev[1];
        const l = Math.hypot(dx, dy) || 1;
        return [
            -dy / l,
            dx / l
        ];
    };
    const left = [];
    const right = [];
    for(let i = 0; i < n; i++){
        const [x, y] = points[i];
        const [nx, ny] = normal(i);
        const w = width(i);
        left.push([
            x + nx * w,
            y + ny * w
        ]);
        right.push([
            x - nx * w,
            y - ny * w
        ]);
    }
    if (closed) {
        const rightStart = right[0];
        right.reverse();
        return left.concat([
            left[0]
        ], [
            rightStart
        ], right);
    }
    const cap = (at, from, w)=>{
        const a = Math.atan2(from[1] - at[1], from[0] - at[0]);
        const out = [];
        for(let i = 1; i < 6; i++){
            const t = a + Math.PI / 2 + Math.PI * i / 6;
            out.push([
                at[0] + Math.cos(t) * w,
                at[1] + Math.sin(t) * w
            ]);
        }
        return out;
    };
    const end = cap(points[n - 1], points[n - 2], width(n - 1));
    const start = cap(points[0], points[1], width(0));
    right.reverse();
    return left.concat(end, right, start);
}
function circleRing(cx, cy, r, n = 20) {
    return ellipseRing(cx, cy, r, r, n);
}
function ellipseRing(cx, cy, rx, ry, n = 24) {
    return Array.from({
        length: n
    }, (_, i)=>{
        const a = i / n * Math.PI * 2;
        return [
            cx + Math.cos(a) * rx,
            cy + Math.sin(a) * ry
        ];
    });
}
function geometry_quad(p0, p1, p2, n = 12) {
    return Array.from({
        length: n + 1
    }, (_, i)=>{
        const t = i / n;
        const u = 1 - t;
        return [
            u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
        ];
    });
}
function geometry_arcPoints(cx, cy, r, a0, a1, n = 16) {
    return Array.from({
        length: n + 1
    }, (_, i)=>{
        const a = a0 + (a1 - a0) * i / n;
        return [
            cx + Math.cos(a) * r,
            cy + Math.sin(a) * r
        ];
    });
}
function starRing(r, inner, points = 5) {
    return Array.from({
        length: 2 * points
    }, (_, i)=>{
        const a = -Math.PI / 2 + i * Math.PI / points;
        const rr = i % 2 ? r * inner : r;
        return [
            Math.cos(a) * rr,
            Math.sin(a) * rr
        ];
    });
}
function sparkleRing(r, k = 0.14) {
    const tips = [
        [
            0,
            -r
        ],
        [
            r,
            0
        ],
        [
            0,
            r
        ],
        [
            -r,
            0
        ]
    ];
    const out = [];
    for(let i = 0; i < 4; i++){
        const a = tips[i];
        const b = tips[(i + 1) % 4];
        const pull = [
            (a[0] + b[0]) * k,
            (a[1] + b[1]) * k
        ];
        out.push(...geometry_quad(a, pull, b, 6).slice(0, -1));
    }
    return out;
}
function dropRing(w) {
    const tip = [
        0,
        1.2 * -w
    ];
    const right = geometry_quad(tip, [
        0.95 * w,
        0.1 * -w
    ], [
        w,
        0.45 * w
    ], 6);
    const bottom = geometry_arcPoints(0, 0.45 * w, w, 0, Math.PI, 10).slice(1, -1);
    const left = geometry_quad([
        -w,
        0.45 * w
    ], [
        0.95 * -w,
        0.1 * -w
    ], tip, 6).slice(0, -1);
    return right.concat(bottom, left);
}
function heartRing(s, n = 28) {
    const k = s / 16;
    return Array.from({
        length: n
    }, (_, i)=>{
        const t = i / n * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return [
            x * k,
            (y - 2.5) * k
        ];
    });
}
function geometry_place(ring, dx, dy, scale = 1, rotate = 0, sy = scale) {
    const c = Math.cos(rotate);
    const s = Math.sin(rotate);
    return ring.map(([x, y])=>{
        const px = x * scale;
        const py = y * sy;
        return [
            dx + px * c - py * s,
            dy + px * s + py * c
        ];
    });
}
function dashes(points, on, off) {
    const out = [];
    let current = [];
    let inDash = true;
    let left = on;
    for(let i = 1; i < points.length; i++){
        const a = points[i - 1];
        const b = points[i];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len <= 0) continue;
        const at = (k)=>[
                a[0] + (b[0] - a[0]) * k / len,
                a[1] + (b[1] - a[1]) * k / len
            ];
        let t = 0;
        while(len - t > 1e-9){
            const step = Math.min(len - t, left);
            if (inDash) {
                if (0 === current.length) current.push(at(t));
                current.push(at(t + step));
            }
            t += step;
            left -= step;
            if (left <= 1e-9) {
                if (inDash && current.length > 1) out.push(current);
                if (inDash) current = [];
                inDash = !inDash;
                left = inDash ? on : off;
            }
        }
    }
    if (current.length > 1) out.push(current);
    return out;
}
const DOT_LENGTH = 0.1;
function readCuteEye(spec, nose) {
    const off = [
        spec.dx * nose,
        spec.dy
    ];
    const base = {
        open: 1,
        size: 1,
        off
    };
    if ((spec.star ?? 0) > 0.5) return {
        ...base,
        kind: 'star'
    };
    const extra = spec.extra;
    if (extra && extra.amount > 0.5) {
        if (Math.abs(Math.abs(extra.angle) - Math.PI / 4) < 0.1) return {
            ...base,
            kind: 'cross'
        };
        return {
            ...base,
            kind: extra.angle * nose > 0 ? 'mad' : 'sad'
        };
    }
    if (spec.len > DOT_LENGTH && 0 !== spec.bend) return {
        ...base,
        kind: spec.bend < 0 ? 'smile' : 'closed'
    };
    if (spec.len > DOT_LENGTH) {
        const tall = spec.width;
        const long = spec.len + spec.width;
        return {
            kind: 'open',
            open: tall / long,
            size: long,
            off
        };
    }
    return {
        kind: 'open',
        open: 1,
        size: spec.width,
        off
    };
}
const CUTE_EYE_READINGS = Object.fromEntries(CUTE_EYE_IDS.map((id)=>{
    const [left, right] = CUTE_EYE_TOPOLOGIES[id];
    return [
        id,
        [
            readCuteEye(left, 1),
            readCuteEye(right, -1)
        ]
    ];
}));
function vocabulary(rest, form) {
    const out = {};
    for (const id of CUTE_EYE_IDS){
        const [l, r] = CUTE_EYE_READINGS[id];
        out[id] = [
            {
                ...rest,
                ...form(l)
            },
            {
                ...rest,
                ...form(r)
            }
        ];
    }
    return out;
}
const looking = (off, k, limit)=>{
    const x = off[0] * k;
    const y = off[1] * k;
    const len = Math.hypot(x, y);
    const s = len > limit ? limit / len : 1;
    return [
        x * s,
        y * s
    ];
};
const startle = (size)=>Math.min(1, Math.max(0, (size - 1.18) / 0.14));
const fright = (size)=>Math.min(1, Math.max(0, (0.8 - size) / 0.1));
const VISIBLE = 0.004;
class LayerList {
    layers = [];
    add(paint, rings, opacity = 1, extra = {}) {
        if (opacity < VISIBLE) return;
        const kept = rings.filter((ring)=>!!ring && ring.length > 2);
        if (0 === kept.length) return;
        this.layers.push({
            paint,
            rings: kept,
            opacity: Math.min(1, opacity),
            ...extra
        });
    }
}
const unit = (v)=>Math.min(1, Math.max(0, v));
const smooth = (u)=>{
    const v = unit(u);
    return v * v * (3 - 2 * v);
};
const reading_pulse = (u)=>Math.max(0, Math.sin(u));
const reading_noise = (n)=>{
    const x = 43758.5453 * Math.sin(127.1 * n + 311.7);
    return x - Math.floor(x);
};
const SETTLED_TIME = 0.9;
const clockOf = (ctx)=>ctx.settled ? SETTLED_TIME : ctx.time;
const TEAR = {
    width: 0.52,
    well: 0.2
};
function fallingTear(out, ctx, weight, x, y0, y1) {
    if (weight < 0.004) return;
    const phase = (0.42 * clockOf(ctx) + 0.37 * ctx.order) % 1;
    const fade = Math.min(1, phase / TEAR.well) * Math.min(1, (1 - phase) * 4);
    const k = 0.55 + 0.45 * Math.min(1, 3 * phase);
    const y = y0 + (y1 - y0) * phase;
    out.add('tear', [
        geometry_place(dropRing(TEAR.width), x, y, k)
    ], weight * fade, {
        loose: true
    });
    out.add('glint', [
        geometry_place(ellipseRing(-0.18, 0.38, 0.12, 0.2, 12), x, y, k)
    ], weight * fade * 0.9, {
        detail: true,
        loose: true
    });
}
const reading_spread = (a, b, n)=>Array.from({
        length: n + 1
    }, (_, i)=>a + (b - a) * i / n);
function insideRuns(f, rx, ry, below, n = 30) {
    const runs = [];
    let run = [];
    for (const x of reading_spread(-rx, rx, n)){
        const edge = ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
        const v = f(x);
        if (below ? v < edge - 0.04 : v > -edge + 0.04) run.push([
            x,
            v
        ]);
        else if (run.length > 0) {
            if (run.length > 1) runs.push(run);
            run = [];
        }
    }
    if (run.length > 1) runs.push(run);
    return runs;
}
const shutness = (gap, span)=>unit((span - gap) / span);
const BEAD = 0.72;
const LIFT = 0.9;
const SEPARATION = 4.7;
const MOUTH_GAP = 1.7;
const bigmouth_MOUTH_SCALE = 1.9;
const MOUTH_WEIGHT = 1.3;
const TONGUE = {
    from: 1,
    span: 1.5
};
const TEETH = {
    from: 1.2,
    span: 1.2
};
const BLINK_FLOOR = 0.12;
const REST = {
    bead: 0,
    bw: BEAD,
    bo: 1,
    smile: 0,
    closed: 0,
    cross: 0,
    star: 0,
    brow: 0,
    ba: 0,
    by: -1.4,
    ax: 0,
    ay: 0
};
const EXPRESSIONS = vocabulary(REST, (read)=>{
    switch(read.kind){
        case 'open':
            return {
                bead: 1,
                bw: BEAD * Math.min(1.2, Math.max(0.8, 0.75 + 0.25 * read.size)),
                bo: Math.max(BLINK_FLOOR, read.open),
                ax: 0.4 * read.off[0],
                ay: 0.4 * read.off[1],
                ...read.size > 1.2 ? {
                    brow: 1,
                    by: -1.7,
                    ba: 0
                } : read.size < 0.8 ? {
                    brow: 1,
                    by: -1.45,
                    ba: -0.3
                } : null
            };
        case 'smile':
            return {
                smile: 1
            };
        case 'closed':
            return {
                closed: 1
            };
        case 'mad':
            return {
                bead: 1,
                brow: 1,
                ba: 0.42,
                by: -1.2,
                ax: 0.15
            };
        case 'sad':
            return {
                bead: 1,
                brow: 1,
                ba: -0.4,
                by: -1.3,
                ay: 0.2
            };
        case 'cross':
            return {
                cross: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
function bigmouth_eye(s, ctx) {
    const w = ctx.weight;
    const bo = s.bo * Math.max(BLINK_FLOOR, Math.min(1, ctx.blink));
    const ax = s.ax + 0.3 * ctx.look[0];
    const ay = s.ay + 0.3 * ctx.look[1];
    const out = new LayerList();
    out.add('feature', [
        bandRing(ellipseBand(ax, ay, s.bw, s.bw * bo))
    ], s.bead);
    out.add('glint', [
        bandRing(ellipseBand(ax - 0.3 * s.bw, ay - 0.34 * s.bw * bo, 0.3 * s.bw, 0.3 * s.bw * bo))
    ], s.bead * unit((bo - 0.4) / 0.2), {
        detail: true
    });
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            -0.8,
            0.25
        ], [
            0,
            -0.95
        ], [
            0.8,
            0.25
        ]), 0.17 * w)
    ], s.smile);
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            -0.75,
            -0.05
        ], [
            0,
            0.55
        ], [
            0.75,
            -0.05
        ]), 0.15 * w)
    ], s.closed);
    out.add('feature', [
        geometry_ribbon([
            [
                -0.45,
                -0.45
            ],
            [
                0.45,
                0.45
            ]
        ], 0.11 * w),
        geometry_ribbon([
            [
                0.45,
                -0.45
            ],
            [
                -0.45,
                0.45
            ]
        ], 0.11 * w)
    ], s.cross);
    const star = starRing(0.85, 0.46);
    out.add('gold', [
        star
    ], s.star);
    out.add('feature', [
        geometry_ribbon(star, 0.05 * w, true)
    ], s.star);
    out.add('feature', [
        geometry_ribbon(geometry_place([
            [
                -0.62,
                0
            ],
            [
                0.62,
                0
            ]
        ], -0.05, s.by, 1, s.ba), 0.12 * w)
    ], s.brow);
    return out.layers;
}
function inMouth({ mouth }) {
    const opening = mouthProfile(mouth, 1);
    const out = new LayerList();
    const tongue = unit((mouth.open - TONGUE.from) / TONGUE.span);
    const height = mouth.open;
    const low = opening.bottom(0);
    const ry = 0.5 * height * tongue;
    out.add('tongue', [
        bandRing(meet(opening, ellipseBand(0, low + 0.02 * height - 0.35 * ry, 0.54 * mouth.width, ry)))
    ], tongue);
    const flat = 1 - unit((mouth.upper ?? 0.38) / 0.38);
    const teeth = flat * unit((mouth.open - TEETH.from) / TEETH.span);
    const reach = 0.48 * mouth.width;
    out.add('glint', [
        bandRing(meet(opening, {
            x0: -reach,
            x1: reach,
            top: (x)=>opening.top(x) - 0.2,
            bottom: (x)=>opening.top(x) + 0.34 * height * teeth
        }))
    ], teeth);
    return out.layers;
}
const BARE = {
    idle: 'smile',
    sleeping: 'dot',
    drowsy: 'flat',
    'powering-down': 'flat',
    listening: 'smile',
    reading: 'flat',
    writing: 'cat',
    working: 'flat',
    loading: 'o',
    progress: 'flat',
    radar: 'dot',
    orbit: 'smile',
    uploading: 'smile',
    waiting: 'flat'
};
const BIGMOUTH = {
    id: 'bigmouth',
    layout: {
        lift: LIFT,
        separation: SEPARATION,
        minSeparation: 3.2,
        mouthDrop: BEAD - LIFT + MOUTH_GAP,
        mouthScale: bigmouth_MOUTH_SCALE,
        mouthWeight: MOUTH_WEIGHT,
        blush: {
            x: 4.3,
            y: 1.2
        },
        gazeShift: 0.6
    },
    expressions: EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: {
        ...STATE_CUTE_MOUTH,
        ...BARE
    },
    mouthPaint: 'feature',
    quietFx: [],
    kaomoji: {
        eyes: {
            open: '•',
            wide: '°',
            small: '˙',
            half: '-',
            look: '•',
            smile: '^',
            closed: '－',
            mad: [
                '•̀',
                '•́'
            ],
            sad: [
                '•́',
                '•̀'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: {
            none: '◡',
            smile: '◡',
            cat: 'ω',
            grin: 'ᗜ',
            laugh: '▽',
            flat: '▭',
            frown: '︵',
            o: 'O',
            dot: 'o',
            wavy: '〰',
            smirk: '◡',
            pout: 'з'
        }
    },
    eye: bigmouth_eye,
    inMouth
};
const CUTE_MOUTH_GLYPHS = {
    none: ' ',
    smile: 'ᴗ',
    cat: 'ω',
    grin: '▽',
    laugh: 'ᗜ',
    flat: '_',
    frown: '︿',
    o: 'o',
    dot: '.',
    wavy: '﹏',
    smirk: '‿',
    pout: 'ε'
};
const SIZE = 2.2;
const TALL = 1.12;
const brow_SEPARATION = 5.8;
const brow_LIFT = 0.45;
const brow_MOUTH_GAP = 1.5;
const BROW_WEIGHT = 0.5;
const BROW_OUTER = -1.28;
const SHUT = 0.8;
const SHUT_GAP = 0.3;
const PUPIL_GAZE = 0.5;
const brow_REST = {
    browY: -1.2,
    browA: 0.08,
    browT: 1,
    browIn: 0.9,
    lidY: -1.4,
    lidA: 0,
    lowY: 1.4,
    lowK: 0,
    px: 0,
    py: 0,
    pr: 0.42,
    sc: 1,
    cross: 0,
    star: 0
};
const brow_EXPRESSIONS = vocabulary(brow_REST, (read)=>{
    switch(read.kind){
        case 'open':
            {
                const wide = read.size > 1.2;
                const browA = wide ? -0.1 : brow_REST.browA;
                return {
                    ...wide ? {
                        browY: -1.52,
                        browA,
                        sc: 1.08,
                        pr: 0.3
                    } : null,
                    ...read.size < 0.8 ? {
                        pr: 0.22
                    } : null,
                    lidY: -1.4 + (1 - read.open) * 2.3,
                    lidA: 0.4 * browA,
                    lowY: 1.4 - (1 - read.open) * 0.4,
                    px: 0.4 * read.off[0],
                    py: 0.4 * read.off[1]
                };
            }
        case 'smile':
            return {
                browY: -1.36,
                browA: -0.1,
                lowY: 0.25,
                lowK: 0.55,
                px: 0.3 * read.off[0],
                py: -0.35
            };
        case 'closed':
            return {
                browY: -1.05,
                browA: -0.04,
                lidY: 0.78,
                lowY: 0.78
            };
        case 'mad':
            return {
                browY: -0.72,
                browA: 0.52,
                browT: 1.2,
                browIn: -0.2,
                lidY: -0.42,
                lidA: 0.5,
                pr: 0.36,
                px: 0.22,
                py: 0.18
            };
        case 'sad':
            return {
                browY: -1.28,
                browA: -0.45,
                lidY: -0.62,
                lidA: -0.42,
                py: 0.28
            };
        case 'cross':
            return {
                browY: -1.35,
                browA: -0.18,
                cross: 1
            };
        case 'star':
            return {
                browY: -1.42,
                browA: -0.12,
                star: 1,
                pr: 0.58
            };
    }
});
const browInner = (s, mid)=>(mid - s.browIn) / SIZE;
const brow_along = (x, x0, x1)=>unit((x - x0) / (x1 - x0));
function browHalf(x, s, tip) {
    const u = brow_along(x, BROW_OUTER, tip);
    const outer = Math.sqrt(Math.min(1, u / 0.3));
    const inner = Math.sqrt(Math.min(1, (1 - u) / 0.12));
    return BROW_WEIGHT * s.browT * (0.45 + 0.55 * u) * outer * inner / 2;
}
const browLine = (x, s, tip)=>s.browY + x * Math.tan(s.browA) - 0.14 * Math.sin(Math.PI * brow_along(x, BROW_OUTER, tip));
function brow_eye(spec, ctx) {
    const b = unit(ctx.blink);
    const s = {
        ...spec,
        lidY: SHUT + (spec.lidY - SHUT) * b,
        lowY: SHUT + (spec.lowY - SHUT) * b
    };
    const x1 = browInner(s, ctx.mid);
    const upper = (x)=>Math.max(browLine(x, s, x1) + 0.9 * browHalf(x, s, x1), s.lidY + x * Math.tan(s.lidA));
    const lower = (x)=>s.lowY - s.lowK * (1 - x * x);
    const white = meet(ellipseBand(0, 0, s.sc, TALL * s.sc), lidBand(upper, lower));
    const shut = shutness(lower(0) - upper(0), SHUT_GAP);
    const lim = Math.max(0, s.sc - s.pr - 0.1);
    const gx = s.px + ctx.look[0] * PUPIL_GAZE / SIZE;
    const gy = s.py + ctx.look[1] * PUPIL_GAZE / SIZE;
    const len = Math.hypot(gx, gy);
    const k = len > lim ? lim / len : 1;
    const px = gx * k;
    const py = gy * k;
    const mark = unit(s.cross + s.star);
    const pr = s.pr * (1 - mark);
    const out = new LayerList();
    const grow = (ring)=>ring && geometry_place(ring, 0, 0, SIZE);
    const whiteRing = bandRing(white);
    out.add('face', [
        grow(whiteRing)
    ], 1, {
        plate: true
    });
    out.add('pupil', [
        grow(bandRing(meet(white, ellipseBand(px, py, pr, pr))))
    ]);
    out.add('face', [
        grow(bandRing(meet(white, ellipseBand(px - 0.32 * pr, py - 0.36 * pr, 0.3 * pr, 0.3 * pr))))
    ], 1, {
        detail: true
    });
    const r = 0.42;
    const markWeight = 0.1 * ctx.weight;
    out.add('pupil', [
        grow(geometry_ribbon([
            [
                -r,
                -r
            ],
            [
                r,
                r
            ]
        ], markWeight)),
        grow(geometry_ribbon([
            [
                r,
                -r
            ],
            [
                -r,
                r
            ]
        ], markWeight))
    ], s.cross);
    const star = starRing(s.pr, 0.42, 4);
    out.add('gold', [
        grow(star)
    ], s.star);
    out.add('pupil', [
        grow(geometry_ribbon(star, 0.04 * ctx.weight, true))
    ], s.star);
    if (whiteRing) out.add('pupil', [
        grow(geometry_ribbon(whiteRing, 0.035 * ctx.weight, true))
    ], 0.55 * (1 - shut), {
        detail: true
    });
    const ly = (s.lidY + s.lowY) / 2;
    out.add('feature', [
        grow(geometry_ribbon(geometry_quad([
            -0.95,
            ly - 0.12
        ], [
            0,
            ly + 0.3
        ], [
            0.95,
            ly - 0.12
        ]), 0.08 * ctx.weight))
    ], shut);
    const xs = Array.from({
        length: 21
    }, (_, i)=>BROW_OUTER + (x1 - BROW_OUTER) * i / 20);
    const top = xs.map((x)=>[
            x,
            browLine(x, s, x1) - browHalf(x, s, x1)
        ]);
    const bottom = xs.map((x)=>[
            x,
            browLine(x, s, x1) + browHalf(x, s, x1)
        ]);
    bottom.reverse();
    out.add('feature', [
        grow(top.concat(bottom))
    ]);
    return out.layers;
}
const BROW = {
    id: 'brow',
    layout: {
        lift: brow_LIFT,
        separation: brow_SEPARATION,
        minSeparation: 5,
        mouthDrop: SIZE * TALL - brow_LIFT + brow_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.6,
            y: 2.75
        },
        gazeShift: 0.5
    },
    expressions: brow_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [],
    kaomoji: {
        eyes: {
            open: 'ō',
            wide: 'Ō',
            small: '°',
            half: '¬',
            look: 'ō',
            smile: 'ᵔ',
            closed: '－',
            mad: [
                'ò',
                'ó'
            ],
            sad: [
                'ó',
                'ò'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: brow_eye
};
const R = 1.9;
const button_LIFT = 0.4;
const button_SEPARATION = 5.7;
const button_MOUTH_GAP = 1;
const STITCH = {
    on: 0.7,
    off: 0.45,
    half: 0.21
};
const HOLE = {
    at: 0.5,
    r: 0.23
};
const RIM_RING = 1.24;
const button_LOOK = {
    k: 0.3,
    limit: 0.3
};
const button_BLINK_FLOOR = 0.1;
const button_REST = {
    sc: 1,
    sy: 1,
    px: 0,
    py: 0,
    rot: 0,
    squash: 1,
    arc: 0,
    closed: 0,
    x: 0,
    star: 0,
    brow: 0,
    browA: 0
};
const button_EXPRESSIONS = vocabulary(button_REST, (read)=>{
    const [gx, gy] = looking(read.off, button_LOOK.k, button_LOOK.limit);
    switch(read.kind){
        case 'open':
            return {
                sc: read.size < 0.8 ? 0.82 : read.size > 1.2 ? 1.12 : Math.min(1.12, Math.max(0.8, 0.55 + 0.45 * read.size)),
                sy: Math.min(1, Math.max(0.1, 0.1 + 1.05 * read.open)),
                px: gx,
                py: gy
            };
        case 'smile':
            return {
                arc: 1
            };
        case 'closed':
            return {
                closed: 1
            };
        case 'mad':
            return {
                rot: 24,
                squash: 0.8,
                brow: 1,
                browA: 0.3
            };
        case 'sad':
            return {
                rot: -24,
                squash: 0.84,
                brow: 1,
                browA: -0.3,
                py: 0.2
            };
        case 'cross':
            return {
                x: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
const stitched = (points, weight, on = STITCH.on, off = STITCH.off)=>dashes(points, on, off).map((dash)=>geometry_ribbon(dash, STITCH.half * weight));
function button_eye(s, ctx) {
    const w = ctx.weight;
    const sy = s.sy * Math.max(button_BLINK_FLOOR, Math.min(1, ctx.blink));
    const rot = s.rot * Math.PI / 180;
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    const px = s.px + ctx.look[0] * button_LOOK.k;
    const py = s.py + ctx.look[1] * button_LOOK.k;
    const sew = (ring)=>ring.map(([x, y])=>{
            const ty = y * s.squash;
            const rx = x * c - ty * sn;
            const ry = x * sn + ty * c;
            return [
                px + rx * s.sc,
                py + ry * s.sc * sy
            ];
        });
    const gone = unit(Math.max(s.arc, s.closed, s.x, s.star));
    const shown = 1 - gone;
    const out = new LayerList();
    out.add('pupil', [
        sew(circleRing(0.14, 0.26, R))
    ], 0.2 * shown, {
        detail: true
    });
    const disc = sew(circleRing(0, 0, R, 28));
    out.add('bone', [
        disc
    ], shown, {
        plate: true
    });
    out.add('feature', [
        geometry_ribbon(disc, 0.08 * w, true)
    ], shown);
    out.add('thread', [
        geometry_ribbon(sew(circleRing(0, 0, RIM_RING, 24)), 0.06 * w, true)
    ], 0.4 * shown, {
        detail: true
    });
    const holes = [];
    for (const hx of [
        -HOLE.at,
        HOLE.at
    ])for (const hy of [
        -HOLE.at,
        HOLE.at
    ])holes.push(sew(circleRing(hx, hy, HOLE.r, 10)));
    out.add('glass', holes, shown);
    out.add('thread', [
        geometry_ribbon(sew([
            [
                -HOLE.at,
                -HOLE.at
            ],
            [
                HOLE.at,
                HOLE.at
            ]
        ]), 0.1 * w),
        geometry_ribbon(sew([
            [
                HOLE.at,
                -HOLE.at
            ],
            [
                -HOLE.at,
                HOLE.at
            ]
        ]), 0.1 * w)
    ], shown);
    out.add('face', [
        geometry_ribbon(sew(geometry_quad([
            -1.3,
            -0.35
        ], [
            -1.1,
            -1
        ], [
            -0.4,
            -1.3
        ], 8)), 0.1 * w)
    ], 0.85 * shown, {
        detail: true
    });
    out.add('feature', stitched(geometry_quad([
        -1.7,
        0.7
    ], [
        0,
        -1.9
    ], [
        1.7,
        0.7
    ], 20), w), s.arc);
    out.add('feature', stitched(geometry_quad([
        -1.7,
        -0.4
    ], [
        0,
        1.5
    ], [
        1.7,
        -0.4
    ], 20), w), s.closed);
    out.add('feature', [
        ...stitched([
            [
                -1.45,
                -1.45
            ],
            [
                1.45,
                1.45
            ]
        ], w),
        ...stitched([
            [
                1.45,
                -1.45
            ],
            [
                -1.45,
                1.45
            ]
        ], w)
    ], s.x);
    const felt = starRing(2.05, 0.46);
    out.add('gold', [
        felt
    ], s.star);
    out.add('feature', [
        geometry_ribbon(felt, 0.08 * w, true)
    ], s.star);
    const seam = starRing(1.45, 0.46);
    out.add('feature', stitched([
        ...seam,
        seam[0]
    ], 0.43 * w, 0.4, 0.32), s.star);
    const rise = 1.5 * Math.tan(s.browA);
    out.add('feature', stitched([
        [
            -1.5,
            -2.65 - rise
        ],
        [
            1.5,
            -2.65 + rise
        ]
    ], w), s.brow);
    return out.layers;
}
const BUTTON = {
    id: 'button',
    layout: {
        lift: button_LIFT,
        separation: button_SEPARATION,
        minSeparation: 4.4,
        mouthDrop: R - button_LIFT + button_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.6,
            y: 2.2
        },
        gazeShift: 0.3
    },
    expressions: button_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [],
    kaomoji: {
        eyes: {
            open: '⊕',
            wide: '⊕',
            small: '⊙',
            half: '⊖',
            look: '⊕',
            smile: '^',
            closed: '－',
            mad: [
                '⊘',
                '⊘'
            ],
            sad: [
                '⊖',
                '⊖'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '✶'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: button_eye
};
const HW = 0.9;
const HL = 2.05;
const capsule_ROUND = {
    hw: 1.55,
    hl: 1.85
};
const FLAT = {
    hw: 0.42,
    hl: 1.75
};
const capsule_LIFT = 0.55;
const capsule_SEPARATION = 4.4;
const capsule_MOUTH_GAP = 0.75;
const capsule_LOOK = {
    k: 0.9,
    limit: 0.9
};
const capsule_BLINK_FLOOR = 0.08;
const capsule_REST = {
    open: 1,
    sc: 1,
    round: 0,
    lean: 0,
    shut: 0,
    px: 0,
    py: 0,
    x: 0,
    star: 0,
    tear: 0
};
const capsule_EXPRESSIONS = vocabulary(capsule_REST, (read)=>{
    const [gx, gy] = looking(read.off, capsule_LOOK.k, capsule_LOOK.limit);
    switch(read.kind){
        case 'open':
            return {
                open: read.open,
                round: read.size > 1.2 ? 1 : 0,
                sc: read.size < 0.8 ? 0.75 : 1,
                px: gx,
                py: gy
            };
        case 'smile':
            return {
                sc: 1.12,
                lean: 0.32,
                py: -0.15
            };
        case 'closed':
            return {
                shut: 1,
                py: 0.2
            };
        case 'mad':
            return {
                lean: -0.42,
                py: 0.1
            };
        case 'sad':
            return {
                sc: 0.88,
                lean: 0.36,
                py: 0.35,
                tear: 1
            };
        case 'cross':
            return {
                x: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
function capsule(hw, hl) {
    const reach = Math.max(0, hl - hw);
    const n = 12;
    const out = [];
    for(let i = 0; i <= n; i++){
        const a = Math.PI + Math.PI * i / n;
        out.push([
            Math.cos(a) * hw,
            -reach + Math.sin(a) * hw
        ]);
    }
    for(let i = 0; i <= n; i++){
        const a = Math.PI * i / n;
        out.push([
            Math.cos(a) * hw,
            reach + Math.sin(a) * hw
        ]);
    }
    return out;
}
function capsule_eye(s, ctx) {
    const w = ctx.weight;
    const flat = s.shut;
    const round = s.round * (1 - flat);
    const hw = s.sc * (HW + (capsule_ROUND.hw - HW) * round + (FLAT.hw - HW) * flat);
    const full = s.sc * (HL + (capsule_ROUND.hl - HL) * round + (FLAT.hl - HL) * flat);
    const hl = Math.max(hw, full * (1 - (1 - s.open) * 0.65 * (1 - flat)));
    const turn = s.lean * (1 - flat) + Math.PI / 2 * flat;
    const squash = 1 - (1 - Math.max(capsule_BLINK_FLOOR, unit(ctx.blink))) * (1 - flat);
    const cx = s.px + ctx.look[0];
    const cy = s.py + ctx.look[1];
    const shown = 1 - unit(Math.max(s.x, s.star));
    const out = new LayerList();
    const body = geometry_place(capsule(hw, hl), 0, 0, 1, turn).map(([x, y])=>[
            cx + x,
            cy + y * squash
        ]);
    out.add('feature', [
        body
    ], shown);
    out.add('feature', [
        geometry_ribbon([
            [
                cx - 1.05,
                cy - 1.05
            ],
            [
                cx + 1.05,
                cy + 1.05
            ]
        ], 0.3 * w),
        geometry_ribbon([
            [
                cx + 1.05,
                cy - 1.05
            ],
            [
                cx - 1.05,
                cy + 1.05
            ]
        ], 0.3 * w)
    ], s.x);
    out.add('gold', [
        geometry_place(starRing(1.25, 0.46), cx, cy)
    ], s.star);
    fallingTear(out, ctx, s.tear, cx - 0.5, cy + 0.6 * hl, cy + hl + 2.2);
    return out.layers;
}
const CAPSULE = {
    id: 'capsule',
    layout: {
        lift: capsule_LIFT,
        separation: capsule_SEPARATION,
        minSeparation: 3.1,
        mouthDrop: HL - capsule_LIFT + capsule_MOUTH_GAP,
        mouthScale: 0.95,
        mouthWeight: 1,
        blush: {
            x: 3.9,
            y: 2.2
        },
        gazeShift: 1
    },
    expressions: capsule_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'tear'
    ],
    kaomoji: {
        eyes: {
            open: '▮',
            wide: '●',
            small: '▪',
            half: '▬',
            look: '▮',
            smile: [
                '/',
                '\\'
            ],
            closed: '－',
            mad: [
                '＼',
                '／'
            ],
            sad: '╥',
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: capsule_eye
};
const LID_NONE = 2.1;
const LID_REST = {
    lidY: -LID_NONE,
    lidA: 0,
    upK: 0,
    lowY: LID_NONE,
    lowK: 0,
    px: 0,
    py: 0,
    pr: 0.5,
    pt: 1,
    sc: 1,
    cross: 0,
    star: 0,
    markR: 0.5,
    bag: 0,
    sweat: 0
};
function blinkLids(open, rest, shut) {
    return {
        lidY: rest + (1 - open) * (shut - rest),
        lowY: LID_NONE - unit((0.6 - open) / 0.6) * (LID_NONE - shut)
    };
}
const lid_eye_SHUT_GAP = 0.3;
const WEDGE = {
    at: -0.95,
    half: 0.74
};
const lid_eye_PUPIL_GAZE = 0.5;
function lidEye(cfg) {
    return (s, ctx)=>{
        const blink = unit(ctx.blink);
        const lidY = cfg.shut + (s.lidY - cfg.shut) * blink;
        const lowY = s.lowY > cfg.shut ? s.lowY - unit((0.6 - blink) / 0.6) * (s.lowY - cfg.shut) : s.lowY;
        const rx = cfg.rx * s.sc;
        const ry = rx * cfg.tall;
        const bowl = (x)=>1 - Math.min(1, (x / rx) ** 2);
        const top = (x)=>lidY + Math.tan(s.lidA) * x + s.upK * bowl(x);
        const low = (x)=>Math.max(lowY - s.lowK * bowl(x), top(x));
        const white = meet(ellipseBand(0, 0, rx, ry), lidBand(top, low));
        const whiteRing = bandRing(white);
        const shut = shutness(low(0) - top(0), lid_eye_SHUT_GAP);
        const w = ctx.weight;
        const out = new LayerList();
        out.add('face', [
            whiteRing
        ], 1, {
            plate: true
        });
        const prx = s.pr;
        const pry = s.pr * s.pt;
        const gx = s.px + ctx.look[0] * lid_eye_PUPIL_GAZE;
        const gy = s.py + ctx.look[1] * lid_eye_PUPIL_GAZE;
        const nx = gx / Math.max(0.01, rx - prx - 0.1);
        const ny = gy / Math.max(0.01, ry - pry - 0.1);
        const k = Math.hypot(nx, ny) > 1 ? 1 / Math.hypot(nx, ny) : 1;
        const px = gx * k;
        const py = gy * k;
        const markless = 1 - unit(s.cross + s.star);
        out.add('pupil', [
            bandRing(meet(white, ellipseBand(px, py, prx, pry)))
        ], markless);
        if (cfg.wedge) {
            const mid = 1 === ctx.nose ? WEDGE.at : Math.PI - WEDGE.at;
            const fan = [
                [
                    px,
                    py
                ]
            ];
            for(let i = 0; i <= 8; i++){
                const a = mid - WEDGE.half + 2 * WEDGE.half * i / 8;
                fan.push([
                    px + Math.cos(a) * prx * 1.05,
                    py + Math.sin(a) * pry * 1.05
                ]);
            }
            out.add('face', [
                bandRing(meet(white, ellipseBand(px, py, prx, pry), convexBand(fan)))
            ], markless);
        }
        const markY = 0.5 * s.py;
        const r = s.markR;
        out.add('pupil', [
            geometry_ribbon([
                [
                    -r,
                    markY - r
                ],
                [
                    r,
                    markY + r
                ]
            ], cfg.cross / 2 * w),
            geometry_ribbon([
                [
                    r,
                    markY - r
                ],
                [
                    -r,
                    markY + r
                ]
            ], cfg.cross / 2 * w)
        ], s.cross);
        const star = geometry_place(starRing(r, 0.46), 0, markY);
        out.add('gold', [
            star
        ], s.star);
        out.add('pupil', [
            geometry_ribbon(star, 0.06 * w, true)
        ], s.star);
        if (whiteRing) out.add('feature', [
            geometry_ribbon(whiteRing, cfg.rim / 2 * w, true)
        ], 1 - shut, {
            detail: !cfg.outlined
        });
        const lids = insideRuns(top, rx, ry, false).concat(lowY < LID_NONE - 0.3 ? insideRuns(low, rx, ry, true) : []);
        out.add('feature', lids.map((run)=>geometry_ribbon(run, cfg.lid / 2 * w)), 1 - shut);
        const ly = (top(0) + low(0)) / 2;
        const reach = 0.92 * rx;
        const curve = geometry_quad([
            -reach,
            ly - 0.1
        ], [
            0,
            ly + 0.62
        ], [
            reach,
            ly - 0.1
        ]);
        const lash = [
            geometry_ribbon(curve, cfg.lash / 2 * w)
        ];
        if (cfg.ticks) for (const t of [
            0.02,
            0.16,
            0.3
        ]){
            const at = curve[Math.round(t * (curve.length - 1))];
            lash.push(geometry_ribbon([
                at,
                [
                    at[0] - 0.3 + 0.5 * t,
                    at[1] + 0.3 - 0.2 * t
                ]
            ], cfg.lash / 2 * w));
        }
        out.add('feature', lash, shut);
        if (cfg.bag) {
            const bag = geometry_quad([
                0.62 * -rx,
                ry + 0.22
            ], [
                0,
                ry + 0.55
            ], [
                0.62 * rx,
                ry + 0.22
            ]);
            out.add('feature', [
                geometry_ribbon(bag, 0.05 * w)
            ], s.bag * (1 - 0.4 * shut) * 0.55);
        }
        if (s.sweat > 0.004) {
            const p = 0.45 * clockOf(ctx) % 1;
            const fade = p < 0.75 ? 1 : (1 - p) / 0.25;
            const drop = geometry_place(dropRing(0.4), 0.5 * -rx, -ry - 0.3 + 1.1 * p);
            out.add('tear', [
                drop
            ], s.sweat * fade, {
                loose: true
            });
            out.add('feature', [
                geometry_ribbon(drop, 0.035 * w, true)
            ], s.sweat * fade, {
                loose: true
            });
        }
        return out.layers;
    };
}
const droopy_EYE = {
    rx: 1.45,
    tall: 1,
    rim: 0.11,
    lid: 0.3,
    lash: 0.26,
    cross: 0.24,
    shut: 0.55,
    bag: true
};
const REST_LID = -0.05;
const droopy_LIFT = 0.2;
const droopy_SEPARATION = 5.6;
const droopy_MOUTH_GAP = 1.1;
const droopy_forms = vocabulary({
    ...LID_REST,
    pr: 0.68,
    py: 0.4,
    bag: 1
}, (read)=>{
    switch(read.kind){
        case 'open':
            {
                const w = startle(read.size);
                const f = fright(read.size);
                const x = Math.max(w, f);
                return {
                    sc: 1 + 0.12 * w - 0.1 * f,
                    pr: easing_lerp(0.68, 0.3, x),
                    py: easing_lerp(0.4 + 0.4 * read.off[1], 0.05, x),
                    px: 0.5 * read.off[0] * (1 - x),
                    bag: 1 - w,
                    sweat: f,
                    ...blinkLids(read.open, easing_lerp(easing_lerp(REST_LID, -0.2, f), -1.1, w), droopy_EYE.shut)
                };
            }
        case 'smile':
            return {
                lidY: 0.12,
                lowY: 0.7,
                lowK: -0.4,
                py: -0.15,
                pr: 0.58,
                px: 0.3 * read.off[0],
                bag: 1.4
            };
        case 'closed':
            return {
                lidY: droopy_EYE.shut,
                lowY: droopy_EYE.shut
            };
        case 'mad':
            return {
                lidY: -0.4,
                lidA: 0.62,
                pr: 0.6,
                px: 0.28,
                py: 0.3
            };
        case 'sad':
            return {
                lidY: -0.1,
                lidA: -0.55,
                pr: 0.68,
                py: 0.6,
                bag: 1.4
            };
        case 'cross':
            return {
                lidY: -0.85,
                sc: 1.05,
                cross: 1,
                markR: 0.6,
                bag: 0.4
            };
        case 'star':
            return {
                lidY: -0.9,
                sc: 1.05,
                star: 1,
                markR: 0.9,
                bag: 0.4
            };
    }
});
const oneSided = ([left, right])=>[
        {
            ...left,
            sweat: 0
        },
        right
    ];
const DROOPY = {
    id: 'droopy',
    layout: {
        lift: droopy_LIFT,
        separation: droopy_SEPARATION,
        minSeparation: 3.6,
        mouthDrop: 1.1 * droopy_EYE.rx + 0.3 - droopy_LIFT + droopy_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.5,
            y: 1.95
        },
        gazeShift: 0.4
    },
    expressions: {
        ...droopy_forms,
        dotSmall: oneSided(droopy_forms.dotSmall)
    },
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [],
    kaomoji: {
        eyes: {
            open: '◒',
            wide: '◉',
            small: '◦',
            half: '◒',
            look: '◒',
            smile: '◡',
            closed: '－',
            mad: [
                '◣',
                '◢'
            ],
            sad: [
                '◞',
                '◟'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '✦'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: lidEye(droopy_EYE)
};
const RX = 2.3;
const RY = 2.5;
const glossy_LIFT = 0.5;
const glossy_SEPARATION = 5.8;
const glossy_MOUTH_GAP = 0.9;
const glossy_LOOK = {
    k: 0.5,
    limit: 0.5
};
const SURFACE_GAZE = 0.3;
const SHUT_FROM = 0.4;
const SHUT_SPAN = 0.3;
const glossy_REST = {
    open: 1,
    sc: 1,
    px: 0,
    py: 0,
    tilt: 0,
    glow: 1,
    shine: 0.4,
    arc: 0,
    x: 0,
    star: 0,
    brow: 0,
    browA: 0,
    tear: 0
};
const glossy_EXPRESSIONS = vocabulary(glossy_REST, (read)=>{
    const [gx, gy] = looking(read.off, glossy_LOOK.k, glossy_LOOK.limit);
    switch(read.kind){
        case 'open':
            return {
                open: read.open,
                sc: Math.min(1.1, Math.max(0.78, 0.55 + 0.45 * read.size)),
                glow: read.size > 1.2 ? 1.12 : read.size < 0.8 ? 0.8 : 1,
                px: gx,
                py: gy
            };
        case 'smile':
            return {
                arc: 1,
                px: 0.4 * gx,
                py: 0.4 * gy - 0.1
            };
        case 'closed':
            return {
                open: 0
            };
        case 'mad':
            return {
                open: 0.78,
                tilt: 0.5,
                glow: 0.75,
                shine: 0.2,
                brow: 1,
                browA: 0.42,
                py: 0.1
            };
        case 'sad':
            return {
                open: 0.88,
                tilt: -0.3,
                glow: 1.2,
                shine: 1,
                brow: 1,
                browA: -0.42,
                tear: 1,
                py: 0.12
            };
        case 'cross':
            return {
                x: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
function glossy_eye(s, ctx) {
    const w = ctx.weight;
    const open = s.open * unit(ctx.blink);
    const lid = -RY + (1 - open) * 2 * RY;
    const sag = 0.35 * (1 - open) ** 2;
    const top = (x)=>lid + s.tilt * x + sag * (1 - (x / RX) ** 2);
    const opening = meet(ellipseBand(0, 0, RX, RY), lidBand(top, ()=>1 / 0));
    const px = s.px + ctx.look[0] * SURFACE_GAZE;
    const py = s.py + ctx.look[1] * SURFACE_GAZE;
    const surface = meet(opening, ellipseBand(px, py, RX * s.sc, RY * s.sc));
    const shown = 1 - unit(Math.max(s.arc, s.x));
    const shut = unit((SHUT_FROM - open) / SHUT_SPAN);
    const out = new LayerList();
    out.add('feature', [
        bandRing(surface)
    ], shown);
    const a = 0.36 * Math.PI;
    const shine = reading_spread(a, Math.PI - a, 12).map((t)=>[
            px + Math.cos(t) * RX * 0.88 * s.sc,
            py + Math.sin(t) * RY * 0.88 * s.sc
        ]);
    out.add('glint', [
        geometry_ribbon(shine, 0.08 * w)
    ], s.shine * shown * unit(2 * open), {
        detail: true
    });
    const lx = px - 0.25 * s.px;
    const ly = py - 0.25 * s.py;
    const light = (cx, cy, r)=>bandRing(meet(surface, ellipseBand(lx + cx * s.glow, ly + cy * s.glow, r * s.glow, r * s.glow)));
    out.add('glint', [
        light(-0.8, -0.95, 0.8)
    ], shown);
    out.add('glint', [
        light(0.88, 0.72, 0.38),
        light(1.3, -0.3, 0.2)
    ], shown, {
        detail: true
    });
    out.add('gold', [
        geometry_place(starRing(1.15, 0.46), px, py, s.sc)
    ], s.star);
    const dx = 0.6 * s.px;
    const dy = 0.6 * s.py;
    const lash = [
        geometry_ribbon(geometry_place(geometry_quad([
            -1.5,
            -0.3
        ], [
            0,
            1.05
        ], [
            1.5,
            -0.3
        ]), dx, dy), 0.25 * w),
        geometry_ribbon(geometry_place([
            [
                -1.5,
                -0.3
            ],
            [
                -2,
                -0.85
            ]
        ], dx, dy), 0.25 * w),
        geometry_ribbon(geometry_place([
            [
                -0.9,
                0.4
            ],
            [
                -1.15,
                1.05
            ]
        ], dx, dy), 0.25 * w)
    ];
    out.add('feature', lash, shut * (1 - s.arc) * (1 - s.x));
    out.add('feature', [
        geometry_ribbon(geometry_place(geometry_quad([
            -1.55,
            0.65
        ], [
            0,
            -1.55
        ], [
            1.55,
            0.65
        ]), dx, dy), 0.25 * w)
    ], s.arc);
    out.add('face', [
        geometry_place(sparkleRing(0.62), -1.35 + dx, -1.55 + dy)
    ], s.arc);
    out.add('feature', [
        geometry_ribbon(geometry_place([
            [
                -1.05,
                -1.05
            ],
            [
                1.05,
                1.05
            ]
        ], dx, dy), 0.275 * w),
        geometry_ribbon(geometry_place([
            [
                1.05,
                -1.05
            ],
            [
                -1.05,
                1.05
            ]
        ], dx, dy), 0.275 * w)
    ], s.x);
    const by = -RY * s.sc - 0.7;
    const rise = 0.85 * Math.tan(s.browA);
    out.add('feature', [
        geometry_ribbon([
            [
                -0.85,
                by - rise
            ],
            [
                0.85,
                by + rise
            ]
        ], 0.2 * w)
    ], s.brow);
    fallingTear(out, ctx, s.tear, -1.05, 1.5, 3.7);
    return out.layers;
}
const GLOSSY = {
    id: 'glossy',
    layout: {
        lift: glossy_LIFT,
        separation: glossy_SEPARATION,
        minSeparation: 5.2,
        mouthDrop: RY - glossy_LIFT + glossy_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.75,
            y: 2.55
        },
        gazeShift: 0.4
    },
    expressions: glossy_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'tear'
    ],
    kaomoji: {
        eyes: {
            open: '◕',
            wide: '◉',
            small: '•',
            half: '◔',
            look: '◕',
            smile: 'ᵔ',
            closed: '－',
            mad: [
                'ò',
                'ó'
            ],
            sad: '╥',
            cross: [
                '＞',
                '＜'
            ],
            star: '✧'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: glossy_eye
};
const pie_EYE = {
    rx: 1.25,
    tall: 1.38,
    rim: 0.22,
    lid: 0.26,
    lash: 0.22,
    cross: 0.3,
    shut: 0.35,
    wedge: true,
    ticks: true,
    outlined: true
};
const pie_LIFT = 0.55;
const pie_SEPARATION = 5;
const pie_MOUTH_GAP = 0.9;
const PIE = {
    id: 'pie',
    layout: {
        lift: pie_LIFT,
        separation: pie_SEPARATION,
        minSeparation: 3.2,
        mouthDrop: pie_EYE.rx * pie_EYE.tall * 1.1 + 0.15 - pie_LIFT + pie_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.1,
            y: 1.9
        },
        gazeShift: 0.4
    },
    expressions: vocabulary({
        ...LID_REST,
        pr: 0.74,
        pt: 1.36,
        py: 0.3
    }, (read)=>{
        switch(read.kind){
            case 'open':
                {
                    const w = startle(read.size);
                    const f = fright(read.size);
                    const x = Math.max(w, f);
                    return {
                        sc: 1 + 0.1 * w - 0.1 * f,
                        pr: easing_lerp(0.74, 0.46, x),
                        py: easing_lerp(0.3 + 0.4 * read.off[1], 0.05, x),
                        px: 0.4 * read.off[0] * (1 - x),
                        lidA: -0.12 * f,
                        ...blinkLids(read.open, easing_lerp(-LID_NONE, -1.1, f), pie_EYE.shut)
                    };
                }
            case 'smile':
                return {
                    lowY: 0.55,
                    lowK: 0.3,
                    py: -0.15
                };
            case 'closed':
                return {
                    lidY: pie_EYE.shut,
                    lowY: pie_EYE.shut
                };
            case 'mad':
                return {
                    lidY: -0.6,
                    lidA: 0.78,
                    px: 0.2,
                    py: 0.35
                };
            case 'sad':
                return {
                    lidY: -0.5,
                    lidA: -0.7,
                    py: 0.55
                };
            case 'cross':
                return {
                    cross: 1,
                    markR: 0.6
                };
            case 'star':
                return {
                    star: 1,
                    markR: 1
                };
        }
    }),
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [],
    kaomoji: {
        eyes: {
            open: '◔',
            wide: 'O',
            small: '◦',
            half: '◓',
            look: '◔',
            smile: '◠',
            closed: '－',
            mad: [
                '◣',
                '◢'
            ],
            sad: [
                '◥',
                '◤'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: lidEye(pie_EYE)
};
const PANEL = {
    w: 1.35,
    h: 1.8,
    r: 0.95
};
const VISOR = {
    half: 2.6,
    pad: 2.5,
    corner: 1.7
};
const screen_LIFT = 0.3;
const screen_SEPARATION = 5.4;
const screen_MOUTH_GAP = 1.15;
const screen_MOUTH_SCALE = 0.88;
const HALO = {
    grow: 0.22,
    opacity: 0.35
};
const PIXEL = {
    cell: 0.46,
    pitch: 0.5
};
const TINTS = {
    calm: {
        core: [
            217,
            252,
            255
        ],
        halo: [
            48,
            214,
            255
        ]
    },
    mint: {
        core: [
            214,
            255,
            236
        ],
        halo: [
            52,
            232,
            164
        ]
    },
    warm: {
        core: [
            255,
            228,
            196
        ],
        halo: [
            255,
            132,
            56
        ]
    },
    coral: {
        core: [
            255,
            214,
            200
        ],
        halo: [
            255,
            92,
            72
        ]
    },
    blue: {
        core: [
            204,
            218,
            255
        ],
        halo: [
            96,
            126,
            255
        ]
    }
};
const screen_tint = (name)=>{
    const { core, halo } = TINTS[name];
    return {
        cr: core[0],
        cg: core[1],
        cb: core[2],
        hr: halo[0],
        hg: halo[1],
        hb: halo[2]
    };
};
const screen_REST = {
    w: PANEL.w,
    h: PANEL.h,
    r: PANEL.r,
    cut: 0,
    tilt: 0,
    bend: 0,
    cx: 0,
    cy: 0,
    core: 1,
    sc: 1,
    dim: 1,
    glow: 1,
    ...screen_tint('calm'),
    pixStar: 0,
    pixX: 0,
    ring: 0,
    bars: 0,
    dots: 0,
    seek: 0,
    orbit: 0,
    radar: 0,
    fill: 0,
    packet: 0,
    scan: 0,
    sweep: 0,
    read: 0,
    eqFast: 0,
    eqWave: 0,
    up: 0,
    recv: 0,
    send: 0,
    wait: 0,
    ping: 0,
    alarm: 0,
    breathe: 0,
    off: 0,
    tremble: 0,
    boot: 0
};
const KINDS = vocabulary(screen_REST, (read)=>{
    const [gx, gy] = read.off;
    switch(read.kind){
        case 'open':
            {
                const open = Math.min(1, Math.max(0.06, read.open));
                const grow = read.size > 1 ? 1 + (read.size - 1) * 0.6 : read.size;
                return {
                    h: PANEL.h * grow * open,
                    w: PANEL.w * Math.sqrt(grow) * (1 + (1 - open) * 0.25),
                    cy: -PANEL.h * Math.max(0, grow - 1) * 0.5 + 0.5 * gy,
                    cx: 0.5 * gx
                };
            }
        case 'smile':
            return {
                h: 0.34,
                w: 1.45,
                r: 0.34,
                bend: 0.85,
                cx: 0.4 * gx,
                cy: 0.35 + 0.3 * gy,
                ...screen_tint('mint')
            };
        case 'closed':
            return {
                h: 0.17,
                w: 1.4,
                r: 0.17,
                cx: 0.4 * gx,
                cy: 0.2 + 0.3 * gy
            };
        case 'mad':
            return {
                h: 1.35,
                w: 1.3,
                cut: 0.6,
                tilt: 0.95,
                cy: 0.2,
                cx: 0.3 * gx,
                ...screen_tint('coral')
            };
        case 'sad':
            return {
                h: 1.4,
                w: 1.25,
                cut: 0.55,
                tilt: -0.85,
                cy: 0.3,
                cx: 0.3 * gx,
                ...screen_tint('blue')
            };
        case 'cross':
            return {
                core: 0,
                pixX: 1
            };
        case 'star':
            return {
                core: 0,
                pixStar: 1
            };
    }
});
const mode = (fields)=>{
    const both = {
        ...KINDS.dot[0],
        ...fields
    };
    return [
        both,
        both
    ];
};
const MODES = {
    scan: mode({
        h: 0.7,
        w: 1.25,
        r: 0.7,
        cy: -0.2,
        sweep: 1
    }),
    read: mode({
        h: 0.8,
        w: 1,
        r: 0.8,
        cy: 0.1,
        read: 1
    }),
    seek: mode({
        w: 1.25,
        h: 1.7,
        r: 0.9,
        core: 0.24,
        seek: 1
    }),
    orbit: mode({
        w: 1.25,
        h: 1.25,
        r: 1.25,
        core: 0.24,
        orbit: 1
    }),
    radar: mode({
        w: 1.25,
        h: 1.25,
        r: 1.25,
        core: 0.3,
        radar: 1
    }),
    scanline: mode({
        core: 0.4,
        scan: 1
    }),
    spin: mode({
        core: 0,
        ring: 1
    }),
    bar: mode({
        w: 1.5,
        h: 0.55,
        r: 0.55,
        core: 0.26,
        fill: 1
    }),
    up: mode({
        w: 0.65,
        h: 1.75,
        r: 0.65,
        core: 0.26,
        packet: 1,
        up: 1
    }),
    recv: mode({
        w: 1.5,
        h: 0.55,
        r: 0.55,
        core: 0.26,
        packet: 1,
        recv: 1
    }),
    send: mode({
        w: 1.5,
        h: 0.55,
        r: 0.55,
        core: 0.26,
        packet: 1,
        send: 1
    }),
    eq: mode({
        core: 0,
        bars: 1
    }),
    eqFast: mode({
        core: 0,
        bars: 1,
        eqFast: 1
    }),
    eqWave: mode({
        core: 0,
        bars: 1,
        eqWave: 1
    }),
    typing: mode({
        core: 0,
        dots: 1
    }),
    wait: mode({
        wait: 1
    }),
    ping: mode({
        ping: 1
    }),
    alarm: mode({
        h: 1.15 * PANEL.h,
        alarm: 1,
        ...screen_tint('warm')
    }),
    sleep: mode({
        h: 0.17,
        w: 1.4,
        r: 0.17,
        bend: -0.12,
        cy: 0.3,
        breathe: 1,
        ...screen_tint('blue')
    }),
    off: mode({
        off: 1
    }),
    tremble: mode({
        ...KINDS.dotWide[0],
        tremble: 1
    }),
    drowsy: mode({
        dim: 0.78,
        glow: 0.6
    }),
    boot: mode({
        boot: 1
    })
};
const CLASSES = {
    scan: [
        'look',
        'look'
    ],
    read: [
        'look',
        'look'
    ],
    seek: [
        'look',
        'look'
    ],
    orbit: [
        'open',
        'open'
    ],
    radar: [
        'open',
        'open'
    ],
    scanline: [
        'open',
        'open'
    ],
    spin: [
        'open',
        'open'
    ],
    bar: [
        'half',
        'half'
    ],
    up: [
        'open',
        'open'
    ],
    recv: [
        'half',
        'half'
    ],
    send: [
        'half',
        'half'
    ],
    eq: [
        'open',
        'open'
    ],
    eqFast: [
        'open',
        'open'
    ],
    eqWave: [
        'open',
        'open'
    ],
    typing: [
        'open',
        'open'
    ],
    wait: [
        'open',
        'open'
    ],
    ping: [
        'wide',
        'wide'
    ],
    alarm: [
        'wide',
        'wide'
    ],
    sleep: [
        'closed',
        'closed'
    ],
    off: [
        'closed',
        'closed'
    ],
    tremble: [
        'wide',
        'wide'
    ],
    drowsy: [
        'half',
        'half'
    ],
    boot: [
        'open',
        'open'
    ]
};
function pixelCells(rows, scale) {
    const cells = [];
    const half = PIXEL.cell / 2 * scale;
    rows.forEach((row, y)=>{
        [
            ...row
        ].forEach((c, x)=>{
            if ('#' !== c) return;
            const cx = (x - 2) * PIXEL.pitch * scale;
            const cy = (y - 2) * PIXEL.pitch * scale;
            cells.push([
                [
                    cx - half,
                    cy - half
                ],
                [
                    cx + half,
                    cy - half
                ],
                [
                    cx + half,
                    cy + half
                ],
                [
                    cx - half,
                    cy + half
                ]
            ]);
        });
    });
    return cells;
}
const PIXEL_STAR = [
    '..#..',
    '.###.',
    '#####',
    '.###.',
    '.#.#.'
];
const PIXEL_X = [
    '#...#',
    '.#.#.',
    '..#..',
    '.#.#.',
    '#...#'
];
const screen_rect = (x, y, w, h)=>[
        [
            x,
            y
        ],
        [
            x + w,
            y
        ],
        [
            x + w,
            y + h
        ],
        [
            x,
            y + h
        ]
    ];
function screen_eye(spec, ctx) {
    const t = clockOf(ctx);
    const n = ctx.nose;
    const o = ctx.order;
    const s = {
        ...spec
    };
    let flash = 1;
    s.cx += s.sweep * n * Math.sin(1.7 * t);
    const u = 0.9 * t % 1;
    s.cx += s.read * n * (u < 0.88 ? u / 0.88 * 2 - 1 : easing_lerp(1, -1, (u - 0.88) / 0.12)) * 0.95;
    s.cx += s.tremble * Math.sin(38 * t + o) * 0.07;
    flash *= easing_lerp(1, 0.35 + 0.65 * smooth(0.5 + 0.5 * Math.sin(3 * t + o * Math.PI)), s.wait);
    flash *= easing_lerp(1, Math.floor(4 * t) % 2 ? 0.55 : 1, s.alarm);
    const ping = t % 1.3 < 0.35 ? Math.sin(t % 1.3 / 0.35 * Math.PI) : 0;
    s.sc *= 1 + 0.2 * ping * s.ping;
    s.glow *= 1 + 0.6 * ping * s.ping;
    const breath = 0.5 + 0.5 * Math.sin(1.3 * t);
    s.dim *= easing_lerp(1, 0.5 + 0.22 * breath, s.breathe);
    s.glow *= easing_lerp(1, 0.6 + 0.6 * breath, s.breathe);
    if (s.off > 0.004) {
        const v = t % 3.4 / 3.4;
        const line = smooth(v / 0.45);
        const dot = smooth((v - 0.5) / 0.3);
        s.h = easing_lerp(s.h, easing_lerp(PANEL.h, 0.17, line), s.off);
        s.r = easing_lerp(s.r, easing_lerp(PANEL.r, 0.17, line), s.off);
        s.w = easing_lerp(s.w, easing_lerp(easing_lerp(PANEL.w, 1.4, line), 0.2, dot), s.off);
        s.cy += 0.1 * line * s.off;
        s.dim *= easing_lerp(1, 1 - smooth((v - 0.62) / 0.3), s.off);
        s.glow *= easing_lerp(1, 0.8 + 0.4 * line, s.off);
    }
    if (s.boot > 0.004 && !ctx.settled && t < 1.2) {
        const v = t / 1.2;
        flash *= easing_lerp(1, v < 0.7 ? reading_noise(Math.floor(20 * t) + 5 * o) > 0.4 ? 1 : 0.12 : 1, s.boot);
        const grow = smooth((v - 0.3) / 0.5);
        s.h = easing_lerp(s.h, easing_lerp(0.15, PANEL.h, grow), s.boot);
        s.w = easing_lerp(s.w, easing_lerp(1.7, PANEL.w, grow), s.boot);
        s.r = easing_lerp(s.r, easing_lerp(0.15, PANEL.r, grow), s.boot);
    }
    s.h *= Math.max(0.06, Math.min(1, ctx.blink));
    const light = [
        s.cr,
        s.cg,
        s.cb
    ];
    const halo = [
        s.hr,
        s.hg,
        s.hb
    ];
    const lit = unit(s.dim) * flash;
    const shape = (grow)=>{
        const w = s.w * grow;
        const h = s.h * grow;
        const box = roundedRectBand(0, 0, w, h, Math.min(s.r, s.w, s.h) * grow);
        const bow = (x)=>-s.bend * (1 - Math.min(1, (x / Math.max(w, 1e-3)) ** 2));
        const lid = (x)=>s.cut > 0.001 ? -h + s.cut * h * 1.1 + x * s.tilt * s.cut : -1 / 0;
        const top = (x)=>Math.max(box.top(x) + bow(x), lid(x));
        const bottom = (x)=>Math.max(box.bottom(x) + bow(x), top(x));
        const local = (x)=>(x - s.cx) / s.sc;
        return {
            x0: s.cx + box.x0 * s.sc,
            x1: s.cx + box.x1 * s.sc,
            top: (x)=>s.cy + s.sc * top(local(x)),
            bottom: (x)=>s.cy + s.sc * bottom(local(x))
        };
    };
    const panel = shape(1);
    const move = (ring)=>ring.map(([x, y])=>[
                s.cx + x * s.sc,
                s.cy + y * s.sc
            ]);
    const inPanel = (ring)=>{
        const xs = ring.map(([x])=>x);
        const ys = ring.map(([, y])=>y);
        const band = meet(panel, {
            x0: Math.min(...xs),
            x1: Math.max(...xs),
            top: ()=>Math.min(...ys),
            bottom: ()=>Math.max(...ys)
        });
        return bandRing(band, 8);
    };
    const out = new LayerList();
    const add = (rings, opacity, detail = false)=>out.add('light', rings, opacity * lit, {
            light,
            detail
        });
    out.add('light', [
        bandRing(shape(1 + HALO.grow))
    ], HALO.opacity * s.glow * lit * Math.max(s.core, 0.3), {
        light: halo,
        detail: true
    });
    add([
        bandRing(panel)
    ], unit(s.core));
    add(pixelCells(PIXEL_STAR, 0.7 + 0.3 * s.pixStar).map(move), s.pixStar);
    add(pixelCells(PIXEL_X, 0.7 + 0.3 * s.pixX).map(move), s.pixX);
    if (s.ring > 0.004) {
        const turn = 340 * t * n * Math.PI / 180;
        add([
            geometry_ribbon(circleRing(0, 0, 0.95, 28).map(([x, y])=>[
                    x + s.cx,
                    y + s.cy
                ]), 0.25, true)
        ], 0.3 * s.ring);
        add([
            geometry_ribbon(geometry_arcPoints(s.cx, s.cy, 0.95, turn, turn + 2 * Math.PI * 0.28, 10), 0.25)
        ], s.ring);
    }
    if (s.bars > 0.004) {
        const bars = [
            0,
            1,
            2
        ].map((i)=>{
            const steady = 0.5 + 0.25 * Math.sin(4.3 * t + 1.9 * i + o) + 0.25 * Math.sin(7.1 * t + 3.1 * i);
            const fast = reading_noise(Math.floor(11 * t) + 7 * i + 13 * o);
            const wave = 0.5 + 0.5 * Math.sin(3 * t - 0.9 * i - 2.7 * o);
            const v = 0.3 + (steady * (1 - s.eqFast - s.eqWave) + fast * s.eqFast + wave * s.eqWave) * 1.4;
            return roundedRectBand(s.cx + (i - 1) * 0.82, s.cy, 0.28, v, 0.28);
        });
        add(bars.map((b)=>bandRing(b, 10)), s.bars);
    }
    if (s.dots > 0.004) add([
        0,
        1,
        2
    ].map((i)=>circleRing(s.cx + (i - 1) * 0.92, s.cy - 0.8 * reading_pulse(6 * t - (i + 3 * o) * 0.9), 0.36, 12)), s.dots);
    if (s.seek > 0.004) add([
        circleRing(s.cx + n * Math.sin(1.9 * t) * 0.55, s.cy + 0.8 * Math.sin(2.9 * t + 1), 0.4, 12)
    ], s.seek);
    if (s.orbit > 0.004) {
        const a = 3.4 * t * n;
        const trail = [
            0.3,
            0.22,
            0.15
        ].map((r, i)=>{
            const b = a - 0.45 * i * Math.sign(n);
            return circleRing(s.cx + 0.85 * Math.cos(b), s.cy + 0.85 * Math.sin(b), r, 10);
        });
        add([
            trail[0],
            circleRing(s.cx, s.cy, 0.18, 8)
        ], s.orbit);
        add([
            trail[1]
        ], 0.5 * s.orbit);
        add([
            trail[2]
        ], 0.28 * s.orbit);
    }
    if (s.radar > 0.004) {
        const turn = 200 * t * n * Math.PI / 180;
        const fan = [
            [
                s.cx,
                s.cy
            ],
            ...geometry_arcPoints(s.cx, s.cy, 1.2, turn - 50 * Math.PI / 180, turn, 8)
        ];
        add([
            bandRing(meet(panel, convexBand(fan)))
        ], 0.7 * s.radar);
    }
    if (s.fill > 0.004) {
        const p = 0.32 * t % 1.25;
        const len = 2 * unit(2 * p - o) * s.w;
        const x = 1 === n ? -s.w : s.w - len;
        add([
            inPanel(move(screen_rect(x, -s.h, len, 2 * s.h)))
        ], s.fill);
    }
    if (s.packet > 0.004) {
        const rings = [];
        if (s.up > 0.004) {
            const v = (0.85 * t + 0.18 * o) % 1;
            const y = easing_lerp(s.h + 0.8, -s.h - 0.8, v);
            rings.push(inPanel(move(screen_rect(-3, y - 0.55, 6, 1.1))));
        }
        for (const [amount, dir] of [
            [
                s.recv,
                -1
            ],
            [
                s.send,
                1
            ]
        ]){
            if (amount < 0.004) continue;
            const v = (1.1 * t + 0.2 * o) % 1;
            const x = n * dir * easing_lerp(-1, 1, v) * (s.w + 0.8);
            rings.push(inPanel(move(screen_rect(x - 0.55, -3, 1.1, 6))));
        }
        add(rings, s.packet);
    }
    if (s.scan > 0.004) add([
        inPanel(move(screen_rect(-s.w, Math.sin(2.6 * t) * s.h * 0.85 - 0.18, 2 * s.w, 0.36)))
    ], s.scan);
    return out.layers;
}
function screen_plate(_left, _right, ctx) {
    const half = ctx.mid + VISOR.pad;
    const visor = bandRing(roundedRectBand(0, 0, half, VISOR.half, VISOR.corner));
    const out = new LayerList();
    out.add('glass', [
        visor
    ], 1, {
        plate: true
    });
    out.add('feature', [
        visor && geometry_ribbon(visor, 0.06 * ctx.weight, true)
    ], 0.6);
    out.add('glint', [
        geometry_ribbon([
            [
                -half + 1.5,
                -VISOR.half + 0.35
            ],
            [
                -half + 3.2,
                -VISOR.half + 0.35
            ]
        ], 0.06)
    ], 0.3, {
        detail: true
    });
    return out.layers;
}
const SCREEN = {
    id: 'screen',
    layout: {
        lift: screen_LIFT,
        separation: screen_SEPARATION,
        minSeparation: 4,
        mouthDrop: VISOR.half + screen_MOUTH_GAP - screen_LIFT,
        mouthScale: screen_MOUTH_SCALE,
        mouthWeight: 1,
        blush: {
            x: 4.4,
            y: 2.95
        },
        gazeShift: 0.3
    },
    expressions: {
        ...KINDS,
        ...MODES
    },
    classes: CLASSES,
    states: {
        ...STATE_CUTE_EYES,
        thinking: [
            'scan'
        ],
        composing: [
            'scan'
        ],
        reading: [
            'read'
        ],
        writing: [
            'read'
        ],
        searching: [
            'seek'
        ],
        orbit: [
            'orbit'
        ],
        radar: [
            'radar'
        ],
        working: [
            'scanline'
        ],
        loading: [
            'spin'
        ],
        progress: [
            'bar'
        ],
        uploading: [
            'up'
        ],
        receiving: [
            'recv'
        ],
        sending: [
            'send'
        ],
        listening: [
            'eq'
        ],
        dictating: [
            'eqFast'
        ],
        humming: [
            'eqWave'
        ],
        messaging: [
            'typing'
        ],
        waiting: [
            'wait'
        ],
        notifying: [
            'ping'
        ],
        alerting: [
            'alarm'
        ],
        sleeping: [
            'sleep'
        ],
        'powering-down': [
            'off'
        ],
        drowsy: [
            'drowsy'
        ],
        bored: [
            'drowsy'
        ],
        waking: [
            'boot'
        ],
        spawning: [
            'boot'
        ],
        scared: [
            'tremble',
            'dotSmall'
        ]
    },
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'dots',
        'ellipsis',
        'spinner',
        'progress',
        'ripple',
        'orbit',
        'waves',
        'rise',
        'fall',
        'send',
        'bubbles'
    ],
    kaomoji: {
        eyes: {
            open: '▮',
            wide: '█',
            small: '▪',
            half: '▬',
            look: '▮',
            smile: '◠',
            closed: '▁',
            mad: [
                '◣',
                '◢'
            ],
            sad: [
                '◥',
                '◤'
            ],
            cross: '⊠',
            star: '✦'
        },
        special: {
            scan: '▬',
            read: '▭',
            seek: '◎',
            orbit: '◌',
            radar: '◴',
            scanline: '▤',
            spin: '◷',
            bar: '▰',
            up: '▴',
            recv: '◂',
            send: '▸',
            eq: '▥',
            eqFast: '▥',
            eqWave: '▥',
            typing: '…',
            ping: '◉',
            alarm: '▲',
            off: '▫',
            boot: '▯'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: screen_eye,
    plate: screen_plate
};
const LENS = {
    w: 2.3,
    h: 1.75,
    corner: 0.7
};
const shades_SEPARATION = 5.3;
const shades_LIFT = 0;
const shades_MOUTH_GAP = 0.8;
const PUSHED_UP = {
    rise: 3.5,
    turn: 7,
    shrink: 0.08,
    leaves: 0.5
};
const shades_BEAD = 0.75;
const shades_LOOK = {
    k: 0.7,
    limit: 0.55
};
const FRAME = 0.21;
const shades_REST = {
    rot: 0,
    sc: 1,
    dy: 0,
    dot: 1,
    dr: 1,
    open: 1,
    px: 0,
    py: 0,
    smile: 0,
    shut: 0,
    x: 0,
    star: 0,
    brow: 0,
    browA: 0,
    tear: 0,
    up: 0
};
const shades_EXPRESSIONS = vocabulary(shades_REST, (read)=>{
    const [gx, gy] = looking(read.off, shades_LOOK.k, shades_LOOK.limit);
    const wide = read.size > 1.2;
    const small = read.size < 0.8;
    switch(read.kind){
        case 'open':
            return {
                open: read.open,
                sc: wide ? 1.12 : small ? 0.9 : 1,
                dr: wide ? 0.85 : small ? 0.7 : 1,
                px: gx,
                py: gy,
                dy: wide ? -0.25 : 0
            };
        case 'smile':
            return {
                dot: 0,
                smile: 1,
                dy: -0.2,
                sc: 1.04
            };
        case 'closed':
            return {
                dot: 0,
                shut: 1,
                up: 1
            };
        case 'mad':
            return {
                rot: 13,
                dr: 0.8,
                brow: 1,
                browA: 0.42,
                py: 0.25
            };
        case 'sad':
            return {
                rot: -9,
                sc: 0.94,
                dr: 1.12,
                brow: 1,
                browA: -0.42,
                tear: 1,
                py: 0.25,
                dy: 0.1
            };
        case 'cross':
            return {
                dot: 0,
                x: 1
            };
        case 'star':
            return {
                dot: 0,
                star: 1,
                sc: 1.05
            };
    }
});
const LENS_BAND = {
    x0: -LENS.w,
    x1: LENS.w,
    top: (x)=>{
        const dx = Math.abs(x) - (LENS.w - LENS.corner);
        return -LENS.h + (dx > 0 ? LENS.corner - Math.sqrt(Math.max(0, LENS.corner ** 2 - dx * dx)) : 0);
    },
    bottom: (x)=>LENS.h * (0.1 + 0.9 * Math.sqrt(Math.max(0, 1 - (x / LENS.w) ** 2)))
};
const mover = (dx, dy, scale, rotate)=>(ring)=>{
        const c = Math.cos(rotate) * scale;
        const s = Math.sin(rotate) * scale;
        return ring.map(([x, y])=>[
                dx + x * c - y * s,
                dy + x * s + y * c
            ]);
    };
const pushedUp = (up, mid, nose)=>{
    const turn = -PUSHED_UP.turn * up * nose * Math.PI / 180;
    const shrink = 1 - PUSHED_UP.shrink * up;
    const inner = mover(0, 0, shrink, turn);
    return (ring)=>inner(ring.map(([x, y])=>[
                x - mid,
                y
            ])).map(([x, y])=>[
                x + mid,
                y - PUSHED_UP.rise * up
            ]);
};
function shades_eye(s, ctx) {
    const w = ctx.weight;
    const lens = mover(0, s.dy, s.sc, s.rot * Math.PI / 180);
    const rig = pushedUp(s.up, ctx.mid, ctx.nose);
    const onLens = (ring)=>ring && rig(lens(ring));
    const through = 1 - s.up;
    const t = clockOf(ctx);
    const out = new LayerList();
    const glass = bandRing(LENS_BAND);
    out.add('glass', [
        onLens(glass)
    ], 1, {
        plate: true
    });
    const px = s.px + ctx.look[0] * shades_LOOK.k;
    const py = s.py + ctx.look[1] * shades_LOOK.k + 0.1;
    const open = s.open * unit(ctx.blink);
    const bead = shades_BEAD * s.dr;
    out.add('face', [
        onLens(bandRing(meet(LENS_BAND, ellipseBand(px, py, bead, Math.max(0.05, bead * open)))))
    ], s.dot * through);
    const lineHalf = 0.21 * w;
    out.add('face', [
        onLens(geometry_ribbon(geometry_quad([
            -1,
            0.4
        ], [
            0,
            -1
        ], [
            1,
            0.4
        ]), lineHalf))
    ], s.smile * through);
    out.add('face', [
        onLens(geometry_ribbon(geometry_quad([
            -1,
            -0.2
        ], [
            0,
            0.95
        ], [
            1,
            -0.2
        ]), lineHalf))
    ], s.shut * through);
    out.add('face', [
        onLens(geometry_ribbon([
            [
                -0.8,
                -0.8
            ],
            [
                0.8,
                0.8
            ]
        ], 0.25 * w)),
        onLens(geometry_ribbon([
            [
                0.8,
                -0.8
            ],
            [
                -0.8,
                0.8
            ]
        ], 0.25 * w))
    ], s.x * through);
    out.add('gold', [
        onLens(starRing(1.2, 0.46))
    ], s.star * through);
    const rise = Math.tan(s.browA);
    out.add('face', [
        onLens(geometry_ribbon([
            [
                -1,
                -0.95 - rise
            ],
            [
                1,
                -0.95 + rise
            ]
        ], 0.19 * w))
    ], s.brow * through);
    const streak = (x, width)=>bandRing(meet(LENS_BAND, convexBand(mover(0, 0, 1, 28 * Math.PI / 180)([
            [
                x,
                -2.2
            ],
            [
                x + width,
                -2.2
            ],
            [
                x + width,
                1
            ],
            [
                x,
                1
            ]
        ]))));
    out.add('face', [
        onLens(streak(-1.6, 0.5))
    ], 0.4, {
        detail: true
    });
    out.add('face', [
        onLens(streak(-0.75, 0.24))
    ], 0.3, {
        detail: true
    });
    out.add('feature', [
        onLens(glass && geometry_ribbon(glass, FRAME * w, true))
    ]);
    const twinkle = 0.85 + 0.15 * Math.sin(5 * t + ctx.order);
    const spark = mover(LENS.w - 0.3, -LENS.h + 0.1, twinkle, 0)(sparkleRing(0.7));
    out.add('glint', [
        onLens(spark)
    ], Math.max(s.smile, s.star));
    const tears = new LayerList();
    fallingTear(tears, ctx, s.tear, 0.9, LENS.h + 0.3, LENS.h + 2.2);
    for (const { paint, rings, opacity, ...rest } of tears.layers)out.add(paint, rings.map(onLens), opacity, rest);
    if (s.up >= PUSHED_UP.leaves) for (const layer of out.layers)layer.loose = true;
    const bare = unit(1.2 * s.up - 0.2);
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            -1.45,
            -0.3
        ], [
            0,
            1.2
        ], [
            1.45,
            -0.3
        ]), 0.23 * w),
        geometry_ribbon([
            [
                -1.45,
                -0.3
            ],
            [
                -2,
                -0.8
            ]
        ], 0.15 * w),
        geometry_ribbon([
            [
                -0.9,
                0.5
            ],
            [
                -1.2,
                1.2
            ]
        ], 0.15 * w)
    ], bare);
    return out.layers;
}
function shades_plate(left, right, ctx) {
    const up = (left.up + right.up) / 2;
    const rig = pushedUp(up, 0, 1);
    const edge = ctx.mid + LENS.w;
    const out = new LayerList();
    out.add('feature', [
        rig(geometry_ribbon(geometry_quad([
            -0.45,
            -0.55
        ], [
            0,
            -1
        ], [
            0.45,
            -0.55
        ]), 0.23 * ctx.weight)),
        rig(geometry_ribbon([
            [
                -edge,
                -0.9
            ],
            [
                -edge - 0.85,
                -1.15
            ]
        ], 0.23 * ctx.weight)),
        rig(geometry_ribbon([
            [
                edge,
                -0.9
            ],
            [
                edge + 0.85,
                -1.15
            ]
        ], 0.23 * ctx.weight))
    ], 1, {
        loose: up >= PUSHED_UP.leaves
    });
    return out.layers;
}
const SHADES = {
    id: 'shades',
    layout: {
        lift: shades_LIFT,
        separation: shades_SEPARATION,
        minSeparation: 5,
        mouthDrop: LENS.h - shades_LIFT + shades_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.6,
            y: 2.25
        },
        gazeShift: 0.25
    },
    expressions: shades_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'tear'
    ],
    kaomoji: {
        eyes: {
            open: [
                '⌐■',
                '■'
            ],
            wide: [
                '⌐■',
                '■'
            ],
            small: [
                '⌐■',
                '■'
            ],
            half: [
                '⌐■',
                '■'
            ],
            look: [
                '⌐■',
                '■'
            ],
            smile: [
                '⌐■',
                '■'
            ],
            closed: '－',
            mad: [
                '◤',
                '◥'
            ],
            sad: [
                '◢',
                '◣'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: [
                '⌐★',
                '★'
            ]
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: shades_eye,
    plate: shades_plate
};
const sparkle_RX = 1.85;
const sparkle_RY = 2.5;
const IRIS = {
    cy: 0.2,
    rx: 1.4,
    ry: 1.85
};
const PUPIL = {
    cy: 0.15,
    rx: 0.62,
    ry: 0.88
};
const sparkle_LIFT = 0.5;
const sparkle_SEPARATION = 5.7;
const sparkle_MOUTH_GAP = 0.9;
const sparkle_LOOK = {
    k: 0.4,
    limit: 0.36
};
const BALL_GAZE = 0.3;
const sparkle_SHUT_FROM = 0.4;
const sparkle_SHUT_SPAN = 0.3;
const sparkle_REST = {
    open: 1,
    sc: 1,
    px: 0,
    py: 0,
    ir: 1,
    tilt: 0,
    glow: 1,
    arc: 0,
    x: 0,
    star: 0,
    brow: 0,
    browA: 0,
    tear: 0,
    pupil: 1
};
const sparkle_EXPRESSIONS = vocabulary(sparkle_REST, (read)=>{
    const [gx, gy] = looking(read.off, sparkle_LOOK.k, sparkle_LOOK.limit);
    const wide = read.size > 1.2;
    const small = read.size < 0.8;
    switch(read.kind){
        case 'open':
            return {
                open: read.open,
                sc: wide ? 1.08 : small ? 0.94 : 1,
                ir: wide ? 0.94 : small ? 0.72 : 1,
                pupil: wide ? 0.7 : small ? 0.62 : 1,
                px: gx,
                py: gy
            };
        case 'smile':
            return {
                arc: 1
            };
        case 'closed':
            return {
                open: 0
            };
        case 'mad':
            return {
                open: 0.8,
                tilt: 0.42,
                ir: 0.84,
                pupil: 0.8,
                glow: 0.7,
                brow: 1,
                browA: 0.4,
                py: 0.05
            };
        case 'sad':
            return {
                open: 0.9,
                tilt: -0.24,
                ir: 1.06,
                pupil: 1.1,
                glow: 1.25,
                brow: 1,
                browA: -0.4,
                tear: 1,
                py: 0.12
            };
        case 'cross':
            return {
                x: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
function sparkle_eye(s, ctx) {
    const w = ctx.weight;
    const open = s.open * unit(ctx.blink);
    const rx = sparkle_RX * s.sc;
    const ry = sparkle_RY * s.sc;
    const lid = -ry + (1 - open) * 2 * ry;
    const sag = 0.4 * (1 - open) ** 2;
    const top = (x)=>lid + s.tilt * x + sag * (1 - (x / rx) ** 2);
    const white = meet(ellipseBand(0, 0, rx, ry), lidBand(top, ()=>1 / 0));
    const shown = 1 - unit(Math.max(s.arc, s.x));
    const shut = unit((sparkle_SHUT_FROM - open) / sparkle_SHUT_SPAN);
    const lines = shown * (1 - shut);
    const out = new LayerList();
    const whiteRing = bandRing(white);
    out.add('face', [
        whiteRing
    ], shown, {
        plate: true
    });
    const bx = s.px + ctx.look[0] * BALL_GAZE;
    const by = s.py + ctx.look[1] * BALL_GAZE;
    const k = s.ir;
    const inBall = (band)=>bandRing(meet(white, band));
    const iris = ellipseBand(bx, by + IRIS.cy * k, IRIS.rx * k, IRIS.ry * k);
    const irisRing = inBall(iris);
    out.add('iris', [
        irisRing
    ], shown);
    const glowTop = (x)=>by + k * (0.95 + 0.35 * (1 - ((x - bx) / (1.05 * k)) ** 2));
    const glowBottom = (x)=>by + k * (0.95 + 0.7 * (1 - ((x - bx) / (1.05 * k)) ** 2));
    out.add('face', [
        inBall(meet(iris, {
            x0: bx - 1.05 * k,
            x1: bx + 1.05 * k,
            top: glowTop,
            bottom: glowBottom
        }))
    ], 0.38 * shown, {
        detail: true
    });
    const pr = s.pupil * k;
    out.add('pupil', [
        inBall(ellipseBand(bx, by + PUPIL.cy * k, PUPIL.rx * pr, PUPIL.ry * pr))
    ], shown * (1 - s.star));
    if (irisRing) out.add('pupil', [
        geometry_ribbon(irisRing, 0.07 * w, true)
    ], 0.45 * shown, {
        detail: true
    });
    const g = s.glow * k;
    out.add('face', [
        inBall(ellipseBand(bx - 0.52 * g, by - 0.62 * g, 0.52 * g, 0.6 * g))
    ], shown);
    out.add('face', [
        inBall(ellipseBand(bx + 0.62 * g, by + 0.78 * g, 0.24 * g, 0.24 * g))
    ], shown, {
        detail: true
    });
    out.add('face', [
        geometry_place(sparkleRing(0.42 * g), bx + 0.52 * g, by - 0.1 * g)
    ], shown * (1 - shut), {
        detail: true
    });
    out.add('gold', [
        geometry_place(starRing(1.15, 0.46), bx, by, k)
    ], s.star * shown);
    const xs = reading_spread(-rx, rx, 18);
    const upper = xs.map((x)=>[
            x,
            Math.max(top(x), white.top(x))
        ]);
    out.add('feature', [
        geometry_ribbon(upper, 0.31 * w)
    ], lines);
    const corner = upper[1];
    out.add('feature', [
        geometry_ribbon([
            [
                corner[0] + 0.1,
                corner[1]
            ],
            [
                corner[0] - 0.5,
                corner[1] - 0.42
            ]
        ], 0.21 * w)
    ], lines);
    out.add('feature', [
        geometry_ribbon(xs.map((x)=>[
                x,
                white.bottom(x)
            ]), 0.05 * w)
    ], 0.4 * lines, {
        detail: true
    });
    out.add('feature', [
        geometry_ribbon(geometry_place(geometry_quad([
            -1.5,
            -0.3
        ], [
            0,
            1.05
        ], [
            1.5,
            -0.3
        ]), 0, 0, s.sc), 0.26 * w),
        geometry_ribbon(geometry_place([
            [
                -1.5,
                -0.3
            ],
            [
                -2.05,
                -0.9
            ]
        ], 0, 0, s.sc), 0.26 * w),
        geometry_ribbon(geometry_place([
            [
                -0.9,
                0.4
            ],
            [
                -1.15,
                1.05
            ]
        ], 0, 0, s.sc), 0.26 * w)
    ], shown * shut);
    out.add('feature', [
        geometry_ribbon(geometry_place(geometry_quad([
            -1.45,
            0.7
        ], [
            0,
            -1.7
        ], [
            1.45,
            0.7
        ]), 0, 0, s.sc), 0.29 * w)
    ], s.arc);
    out.add('face', [
        geometry_place(sparkleRing(0.6), -1.3 * s.sc, -1.55 * s.sc)
    ], s.arc);
    out.add('feature', [
        geometry_ribbon([
            [
                -0.95,
                -0.95
            ],
            [
                0.95,
                0.95
            ]
        ], 0.29 * w),
        geometry_ribbon([
            [
                0.95,
                -0.95
            ],
            [
                -0.95,
                0.95
            ]
        ], 0.29 * w)
    ], s.x);
    const browY = -ry - 0.8;
    const rise = 0.95 * Math.tan(s.browA);
    out.add('feature', [
        geometry_ribbon([
            [
                -0.95,
                browY - rise
            ],
            [
                0.95,
                browY + rise
            ]
        ], 0.21 * w)
    ], s.brow);
    fallingTear(out, ctx, s.tear, -0.9, 1.4, 3.8);
    return out.layers;
}
const SPARKLE = {
    id: 'sparkle',
    layout: {
        lift: sparkle_LIFT,
        separation: sparkle_SEPARATION,
        minSeparation: 4.3,
        mouthDrop: sparkle_RY - sparkle_LIFT + sparkle_MOUTH_GAP,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.5,
            y: 2.55
        },
        gazeShift: 0.4
    },
    expressions: sparkle_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'tear'
    ],
    kaomoji: {
        eyes: {
            open: '✧',
            wide: '✪',
            small: '⋆',
            half: '-',
            look: '✧',
            smile: '^',
            closed: '－',
            mad: [
                'ò',
                'ó'
            ],
            sad: 'ಥ',
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: sparkle_eye
};
const specs_RX = 0.95;
const specs_RY = 1.2;
const specs_LENS = {
    r: 2.05,
    frame: 0.24,
    dip: 0.3
};
const BRIDGE = {
    ends: -0.45,
    middle: -0.75
};
const specs_LIFT = 0.4;
const specs_SEPARATION = 5.2;
const specs_MOUTH_GAP = 0.7;
const specs_LOOK = {
    k: 0.45,
    limit: 0.45
};
const specs_BALL_GAZE = 0.6;
const specs_SHUT_FROM = 0.4;
const specs_SHUT_SPAN = 0.3;
const specs_REST = {
    open: 1,
    sc: 1,
    px: 0,
    py: 0,
    tilt: 0,
    arc: 0,
    shut: 0,
    x: 0,
    star: 0,
    tear: 0
};
const specs_EXPRESSIONS = vocabulary(specs_REST, (read)=>{
    const [gx, gy] = looking(read.off, specs_LOOK.k, specs_LOOK.limit);
    switch(read.kind){
        case 'open':
            return {
                open: read.open,
                sc: read.size > 1.2 ? 1.12 : read.size < 0.8 ? 0.85 : 1,
                px: gx,
                py: gy
            };
        case 'smile':
            return {
                arc: 1
            };
        case 'closed':
            return {
                shut: 1
            };
        case 'mad':
            return {
                open: 0.75,
                tilt: 0.42,
                py: 0.1
            };
        case 'sad':
            return {
                open: 0.85,
                tilt: -0.3,
                tear: 1,
                py: 0.15
            };
        case 'cross':
            return {
                x: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
const dipOf = (open)=>specs_LENS.dip * (1 - unit(open));
function specs_eye(s, ctx) {
    const w = ctx.weight;
    const open = s.open * unit(ctx.blink);
    const shut = unit((specs_SHUT_FROM - open) / specs_SHUT_SPAN);
    const shown = 1 - unit(Math.max(s.arc, s.shut, s.x, s.star));
    const fy = dipOf(open);
    const cx = s.px + ctx.look[0] * specs_BALL_GAZE;
    const cy = s.py + ctx.look[1] * specs_BALL_GAZE;
    const rx = specs_RX * s.sc;
    const ry = specs_RY * s.sc;
    const lid = cy - ry + (1 - open) * 2 * ry;
    const ball = meet(ellipseBand(cx, cy, rx, ry), lidBand((x)=>lid + s.tilt * (x - cx), ()=>1 / 0));
    const out = new LayerList();
    out.add('feature', [
        bandRing(ball)
    ], shown * (1 - shut));
    out.add('glint', [
        circleRing(cx - 0.36 * rx, cy - 0.4 * ry, 0.3 * rx, 12)
    ], shown * (1 - shut) * unit((open - 0.55) / 0.25));
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            -1.25,
            0.5
        ], [
            0,
            -1.25
        ], [
            1.25,
            0.5
        ]), 0.27 * w)
    ], s.arc);
    out.add('face', [
        geometry_place(sparkleRing(0.45), -1.25, -1.15)
    ], s.arc, {
        detail: true
    });
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            -1.25,
            -0.2
        ], [
            0,
            0.95
        ], [
            1.25,
            -0.2
        ]), 0.25 * w)
    ], Math.max(s.shut, shut * shown));
    out.add('feature', [
        geometry_ribbon([
            [
                -0.85,
                -0.85
            ],
            [
                0.85,
                0.85
            ]
        ], 0.26 * w),
        geometry_ribbon([
            [
                0.85,
                -0.85
            ],
            [
                -0.85,
                0.85
            ]
        ], 0.26 * w)
    ], s.x);
    out.add('gold', [
        geometry_place(starRing(1.1, 0.46), 0, 0)
    ], s.star);
    out.add('feature', [
        geometry_ribbon(circleRing(0, fy, specs_LENS.r, 32), specs_LENS.frame * w, true)
    ]);
    fallingTear(out, ctx, s.tear, -0.8, specs_LENS.r + fy - 0.2, specs_LENS.r + 2.4);
    return out.layers;
}
function specs_plate(left, right, ctx) {
    const fy = dipOf(Math.min(left.open, right.open) * unit(ctx.blink));
    const inner = ctx.mid - 0.97 * specs_LENS.r;
    const out = new LayerList();
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            -inner,
            fy + BRIDGE.ends
        ], [
            0,
            fy + BRIDGE.middle
        ], [
            inner,
            fy + BRIDGE.ends
        ]), specs_LENS.frame * ctx.weight)
    ]);
    return out.layers;
}
const SPECS = {
    id: 'specs',
    layout: {
        lift: specs_LIFT,
        separation: specs_SEPARATION,
        minSeparation: 2 * specs_LENS.r + 0.4,
        mouthDrop: specs_LENS.r - specs_LIFT + specs_MOUTH_GAP,
        mouthScale: 0.9,
        mouthWeight: 1,
        blush: {
            x: 4.4,
            y: 2.7
        },
        gazeShift: 0.6
    },
    expressions: specs_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'tear'
    ],
    kaomoji: {
        eyes: {
            open: '◎',
            wide: '◉',
            small: '◦',
            half: '◓',
            look: '◎',
            smile: '◠',
            closed: '－',
            mad: [
                'ò',
                'ó'
            ],
            sad: '╥',
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: specs_eye,
    plate: specs_plate
};
const SCALE = 1.4;
const symbol_LIFT = 0.2;
const symbol_SEPARATION = 6;
const symbol_MOUTH_GAP = 1.05;
const STROKE = 0.21;
const GAZE = 0.3;
const SYMBOLS = [
    'dot',
    'arcUp',
    'arcDown',
    'mad',
    'anger',
    'sad',
    'heart',
    'spark',
    'star',
    'question',
    'exclaim',
    'spiral',
    'dots',
    'bubble',
    'ringLoad',
    'ringProgress',
    'ringUp',
    'ringDown',
    'ringSend',
    'magnifier',
    'clock',
    'orbit',
    'radar',
    'gear',
    'ping',
    'power',
    'listen',
    'listenFast',
    'note',
    'sleepz',
    'scared',
    'sweat',
    'cross'
];
const symbol_REST = {
    ...Object.fromEntries(SYMBOLS.map((id)=>[
            id,
            0
        ])),
    size: 1,
    open: 1,
    offX: 0,
    offY: 0
};
class Pen {
    weight;
    dx = 0;
    dy = 0;
    rot = 0;
    sx = 1;
    sy = 1;
    pieces = [];
    constructor(weight){
        this.weight = weight;
    }
    fill(paint, rings, opacity = 1, flags = {}) {
        this.pieces.push({
            paint,
            rings: rings.filter((r)=>!!r),
            opacity,
            flags
        });
    }
    line(paint, points, half = STROKE, opacity = 1, flags = {}) {
        this.fill(paint, [
            geometry_ribbon(points, half * this.weight)
        ], opacity, flags);
    }
    ring(paint, points, half = STROKE, opacity = 1) {
        this.fill(paint, [
            geometry_ribbon(points, half * this.weight, true)
        ], opacity);
    }
    finish(out, flip, pop, squash, ox, oy, alpha) {
        const c = Math.cos(this.rot);
        const s = Math.sin(this.rot);
        const map = ([x, y])=>{
            const px = x * this.sx;
            const py = y * this.sy;
            const rx = this.dx + px * c - py * s;
            const ry = this.dy + px * s + py * c;
            return [
                (rx * pop * flip + ox) * SCALE,
                (ry * pop * squash + oy) * SCALE
            ];
        };
        for (const p of this.pieces)out.add(p.paint, p.rings.map((points)=>points.map(map)), p.opacity * alpha, p.flags);
    }
}
const symbol_lidded = (r, m, c)=>bandRing(meet(ellipseBand(0, 0, r, r), lidBand((x)=>m * x + c, ()=>1 / 0)));
const symbol_cubic = (p0, p1, p2, p3, n = 12)=>Array.from({
        length: n + 1
    }, (_, i)=>{
        const t = i / n;
        const u = 1 - t;
        return [
            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
        ];
    });
const arcLine = (r, start, on)=>geometry_arcPoints(0, 0, r, start, start + 2 * Math.PI * Math.max(0.02, on), Math.max(4, Math.round(24 * on)));
const glints = (pen)=>{
    pen.fill('glint', [
        circleRing(-0.34, -0.38, 0.3, 12)
    ]);
    pen.fill('glint', [
        circleRing(0.36, 0.4, 0.13, 10)
    ], 0.55, {
        detail: true
    });
};
function symbol_ring(pen, len, turn, mirror, arrow, t) {
    pen.ring('feature', circleRing(0, 0, 1, 28), 0.23, 0.26);
    const arc = arcLine(1, turn, len).map(([x, y])=>[
            mirror ? -x : x,
            y
        ]);
    pen.line('feature', arc, 0.23);
    if (null === arrow) return;
    const bob = 0.08 * Math.sin(5 * t);
    const c = Math.cos(arrow);
    const s = Math.sin(arrow);
    const head = [
        [
            -0.24,
            -0.4
        ],
        [
            0.2,
            0
        ],
        [
            -0.24,
            0.4
        ]
    ].map(([x, y])=>[
            (x + bob) * c - y * s,
            (x + bob) * s + y * c
        ]);
    pen.line('feature', head, 0.15);
}
const progress = (t, speed)=>unit(t * speed % 1.2);
const ART = {
    dot: {
        gaze: 0.6,
        blinks: true,
        draw ({ out, spec }) {
            out.sx = spec.size;
            out.sy = spec.size * Math.max(0.06, spec.open);
            out.fill('feature', [
                circleRing(0, 0, 1, 24)
            ]);
            glints(out);
        }
    },
    arcUp: {
        gaze: 0.4,
        draw ({ out }) {
            out.dy = -0.1;
            out.line('feature', geometry_quad([
                -1.05,
                0.5
            ], [
                0,
                -1.05
            ], [
                1.05,
                0.5
            ]), 0.25);
        }
    },
    arcDown: {
        gaze: 0.4,
        draw ({ out }) {
            out.line('feature', geometry_quad([
                -1,
                -0.25
            ], [
                0,
                0.75
            ], [
                1,
                -0.25
            ]), 0.25);
        }
    },
    mad: {
        blinks: true,
        draw ({ out }) {
            out.fill('feature', [
                symbol_lidded(1.05, 0.6, -0.2)
            ]);
            out.fill('glint', [
                circleRing(-0.25, 0.3, 0.2, 10)
            ]);
        }
    },
    anger: {
        natural: true,
        draw ({ out, t }) {
            out.dx = 1.15;
            out.dy = -1.45;
            const k = 0.62 * (1 + 0.12 * reading_pulse(9 * t));
            out.sx = out.sy = k;
            for (const [sx, sy] of [
                [
                    1,
                    1
                ],
                [
                    -1,
                    1
                ],
                [
                    1,
                    -1
                ],
                [
                    -1,
                    -1
                ]
            ])out.line('flame', geometry_quad([
                0.12 * sx,
                0.62 * sy
            ], [
                0.2 * sx,
                0.2 * sy
            ], [
                0.62 * sx,
                0.12 * sy
            ], 6), 0.18);
        }
    },
    sad: {
        blinks: true,
        draw ({ out, t, order }) {
            out.fill('feature', [
                symbol_lidded(1.05, -0.45, -0.35)
            ]);
            out.fill('glint', [
                circleRing(-0.2, 0.28, 0.2, 10)
            ]);
            const u = (0.55 * t + 0.5 * order) % 1;
            const grow = 0.15 + 0.85 * smooth(u / 0.35);
            const fall = unit((u - 0.4) / 0.6);
            const y = 1.15 + fall * fall * 2.2;
            const drop = dropRing(0.45 * grow).map(([x, yy])=>[
                    x + 0.1,
                    yy + y
                ]);
            out.fill('tear', [
                drop
            ], 1 - unit((fall - 0.55) / 0.45), {
                loose: true
            });
        }
    },
    heart: {
        natural: true,
        draw ({ out, t, order }) {
            out.sx = out.sy = 1 + 0.1 * reading_pulse(6.5 * t + 0.6 * order);
            out.dy = -0.05;
            out.fill('rose', [
                heartRing(1.2)
            ]);
            out.fill('glint', [
                circleRing(-0.62, -0.5, 0.17, 10)
            ], 0.75, {
                detail: true
            });
        }
    },
    spark: {
        natural: true,
        draw ({ out, t, order }) {
            out.rot = 8 * Math.sin(2 * t + order) * Math.PI / 180;
            out.fill('gold', [
                sparkleRing(1.3, 0.12)
            ]);
            const twinkle = 0.5 + 0.5 * Math.sin(5 * t + 2 * order);
            const small = sparkleRing(1.3 * (0.2 + 0.18 * twinkle), 0.12).map(([x, y])=>[
                    x + 0.95,
                    y - 0.95
                ]);
            out.fill('gold', [
                small
            ]);
        }
    },
    star: {
        natural: true,
        draw ({ out, t, order }) {
            out.rot = 12 * Math.sin(3 * t + order) * Math.PI / 180;
            out.sx = out.sy = 1 + 0.08 * reading_pulse(6 * t);
            out.fill('gold', [
                starRing(1.3, 0.446)
            ]);
            out.fill('glint', [
                circleRing(-0.3, -0.4, 0.13, 10)
            ], 0.7, {
                detail: true
            });
        }
    },
    question: {
        natural: true,
        draw ({ out, t, order }) {
            out.rot = 9 * Math.sin(3 * t + 1.3 * order) * Math.PI / 180;
            out.dy = -0.1;
            out.line('feature', symbol_cubic([
                -0.58,
                -0.6
            ], [
                -0.58,
                -1.4
            ], [
                0.72,
                -1.4
            ], [
                0.72,
                -0.6
            ]).concat(symbol_cubic([
                0.72,
                -0.6
            ], [
                0.72,
                0.05
            ], [
                0,
                0.1
            ], [
                0,
                0.58
            ]).slice(1)));
            out.fill('feature', [
                circleRing(0, 1.08, 0.27, 12)
            ]);
        }
    },
    exclaim: {
        natural: true,
        draw ({ out, t }) {
            out.sx = out.sy = 1 + 0.1 * reading_pulse(8 * t);
            out.fill('feature', [
                [
                    ...geometry_quad([
                        -0.4,
                        -1.2
                    ], [
                        0,
                        -1.38
                    ], [
                        0.4,
                        -1.2
                    ], 6),
                    [
                        0.2,
                        0.4
                    ],
                    ...geometry_quad([
                        0.2,
                        0.4
                    ], [
                        0,
                        0.55
                    ], [
                        -0.2,
                        0.4
                    ], 4).slice(1)
                ]
            ]);
            out.fill('feature', [
                circleRing(0, 1.05, 0.3, 12)
            ]);
        }
    },
    spiral: {
        natural: true,
        draw ({ out, t }) {
            out.rot = 260 * t % 360 * Math.PI / 180;
            const turns = Array.from({
                length: 49
            }, (_, i)=>{
                const u = i / 48;
                const a = u * Math.PI * 3.4;
                return [
                    Math.cos(a) * (0.12 + u),
                    Math.sin(a) * (0.12 + u)
                ];
            });
            out.line('feature', turns, 0.17);
        }
    },
    dots: {
        natural: true,
        draw ({ out, t, order }) {
            out.fill('feature', [
                -0.85,
                0,
                0.85
            ].map((x, i)=>circleRing(x, 0.2 - 0.6 * reading_pulse(6 * t - 0.9 * i - 1.4 * order), 0.33, 12)));
        }
    },
    bubble: {
        natural: true,
        draw ({ out, t }) {
            out.dy = -0.1;
            const corner = (cx, cy, from)=>geometry_arcPoints(cx, cy, 0.55, from, from + Math.PI / 2, 5);
            out.fill('feature', [
                [
                    ...corner(-0.65, -0.45, Math.PI),
                    ...corner(0.65, -0.45, -Math.PI / 2),
                    ...corner(0.65, 0.15, 0),
                    [
                        0.05,
                        0.7
                    ],
                    [
                        -0.95,
                        1.3
                    ],
                    [
                        -0.6,
                        0.7
                    ],
                    ...corner(-0.65, 0.15, Math.PI / 2)
                ]
            ]);
            out.fill('glint', [
                -0.62,
                0,
                0.62
            ].map((x, i)=>circleRing(x, -0.15 - 0.22 * reading_pulse(6 * t - 0.9 * i), 0.15, 10)));
        }
    },
    ringLoad: {
        natural: true,
        draw ({ out, t }) {
            symbol_ring(out, 0.28, 330 * t % 360 * (Math.PI / 180), false, null, t);
        }
    },
    ringProgress: {
        natural: true,
        draw ({ out, t }) {
            symbol_ring(out, progress(t, 0.36), -Math.PI / 2, false, null, t);
        }
    },
    ringUp: {
        natural: true,
        draw ({ out, t }) {
            symbol_ring(out, progress(t, 0.5), -Math.PI / 2, false, -Math.PI / 2, t);
        }
    },
    ringDown: {
        natural: true,
        draw ({ out, t }) {
            symbol_ring(out, 1 - progress(t, 0.36), -Math.PI / 2, true, Math.PI / 2, t);
        }
    },
    ringSend: {
        natural: true,
        draw ({ out, t }) {
            symbol_ring(out, progress(t, 0.8), -Math.PI / 2, false, 0, t);
        }
    },
    magnifier: {
        natural: true,
        draw ({ out, t }) {
            out.dx = 0.3 * Math.sin(1.8 * t) - 0.1;
            out.dy = 0.25 * Math.cos(2.3 * t) - 0.1;
            out.ring('feature', circleRing(-0.2, -0.2, 0.8, 24));
            out.line('feature', [
                [
                    0.4,
                    0.4
                ],
                [
                    1.1,
                    1.1
                ]
            ], 0.25);
            out.fill('glint', [
                geometry_ribbon(geometry_arcPoints(-0.2, -0.2, 0.5, 1.05 * Math.PI, 1.45 * Math.PI, 6), 0.09)
            ], 0.7, {
                detail: true
            });
        }
    },
    clock: {
        natural: true,
        draw ({ out, t }) {
            out.ring('feature', circleRing(0, 0, 1, 28), 0.19);
            const hand = (len, turns)=>{
                const a = turns * Math.PI * 2 - Math.PI / 2;
                return [
                    [
                        0,
                        0
                    ],
                    [
                        Math.cos(a) * len,
                        Math.sin(a) * len
                    ]
                ];
            };
            out.line('feature', hand(0.68, 240 * t / 360), 0.14);
            out.line('feature', hand(0.42, 20 * t / 360), 0.14);
        }
    },
    orbit: {
        natural: true,
        draw ({ out, t }) {
            out.ring('feature', circleRing(0, 0, 0.95, 28), 0.1, 0.25);
            const a = 3.4 * t;
            out.fill('feature', [
                circleRing(0, 0, 0.26, 12),
                circleRing(0.95 * Math.cos(a), 0.95 * Math.sin(a), 0.27, 12)
            ]);
        }
    },
    radar: {
        natural: true,
        draw ({ out, t }) {
            out.ring('feature', circleRing(0, 0, 1, 28), 0.17);
            const a = 220 * t % 360 * Math.PI / 180;
            const fan = [
                [
                    0,
                    0
                ],
                ...geometry_arcPoints(0, 0, 0.9, a - 50 * Math.PI / 180, a, 8)
            ];
            out.fill('feature', [
                fan
            ], 0.35);
            out.line('feature', [
                [
                    0,
                    0
                ],
                [
                    0.9 * Math.cos(a),
                    0.9 * Math.sin(a)
                ]
            ], 0.12);
            out.fill('feature', [
                circleRing(0, 0, 0.16, 10)
            ]);
        }
    },
    gear: {
        natural: true,
        draw ({ out, t, order }) {
            out.rot = 70 * t * (order ? -1 : 1) % 360 * Math.PI / 180;
            const teeth = [];
            for(let i = 0; i < 8; i++){
                const base = i * Math.PI / 4;
                for (const [da, r] of [
                    [
                        -0.2,
                        0.86
                    ],
                    [
                        -0.13,
                        1.22
                    ],
                    [
                        0.13,
                        1.22
                    ],
                    [
                        0.2,
                        0.86
                    ]
                ])teeth.push([
                    Math.cos(base + da) * r,
                    Math.sin(base + da) * r
                ]);
            }
            out.fill('feature', [
                teeth,
                circleRing(0, 0, 0.38, 14)
            ], 1, {
                holes: true
            });
        }
    },
    ping: {
        gaze: 0.5,
        blinks: true,
        draw ({ out, t }) {
            out.fill('feature', [
                circleRing(0, 0, 1, 24)
            ]);
            glints(out);
            for (const i of [
                0,
                1
            ]){
                const u = (0.9 * t + 0.5 * i) % 1;
                out.ring('feature', circleRing(0, 0, 1.15 + 0.9 * u, 28), 0.1, 0.8 * (1 - u));
            }
        }
    },
    power: {
        natural: true,
        draw ({ out, t, order }) {
            out.sx = out.sy = 1 + 0.07 * Math.sin(4 * t + order);
            const from = Math.atan2(-0.66, -0.62);
            const to = Math.atan2(-0.66, 0.62) - 2 * Math.PI;
            out.line('feature', geometry_arcPoints(0, 0, 0.95, from, to, 20));
            out.line('feature', [
                [
                    0,
                    -1.12
                ],
                [
                    0,
                    -0.05
                ]
            ]);
        }
    },
    listen: {
        gaze: 0.5,
        blinks: true,
        draw: (c)=>listening(c, 5)
    },
    listenFast: {
        gaze: 0.5,
        blinks: true,
        draw: (c)=>listening(c, 9)
    },
    note: {
        natural: true,
        draw ({ out, t, order }) {
            const swing = Math.sin(4 * t + 1.5 * order);
            out.rot = 10 * swing * Math.PI / 180;
            out.dy = 0.18 * -Math.abs(swing);
            const head = ellipseRing(0, 0, 0.5, 0.36, 16).map(([x, y])=>{
                const a = -20 * Math.PI / 180;
                return [
                    -0.3 + x * Math.cos(a) - y * Math.sin(a),
                    0.75 + x * Math.sin(a) + y * Math.cos(a)
                ];
            });
            out.fill('feature', [
                head
            ]);
            out.line('feature', [
                [
                    0.12,
                    0.65
                ],
                ...symbol_cubic([
                    0.12,
                    -1.05
                ], [
                    0.2,
                    -0.5
                ], [
                    0.9,
                    -0.5
                ], [
                    0.9,
                    0.1
                ], 8)
            ], 0.16);
        }
    },
    sleepz: {
        natural: true,
        draw ({ out, t }) {
            out.line('feature', geometry_quad([
                -1,
                -0.25
            ], [
                0,
                0.75
            ], [
                1,
                -0.25
            ]), 0.25);
            for (const i of [
                0,
                1
            ]){
                const u = (0.42 * t + 0.5 * i) % 1;
                const k = 0.3 + 0.32 * u;
                const x = easing_lerp(0.7, 2.1, u);
                const y = easing_lerp(-0.9, -2.7, u);
                const z = [
                    [
                        -0.7,
                        -0.7
                    ],
                    [
                        0.7,
                        -0.7
                    ],
                    [
                        -0.7,
                        0.7
                    ],
                    [
                        0.7,
                        0.7
                    ]
                ].map(([zx, zy])=>[
                        x + zx * k,
                        y + zy * k
                    ]);
                out.line('feature', z, 0.3 * k, Math.min(1, u / 0.15) * (1 - unit((u - 0.7) / 0.3)), {
                    loose: true
                });
            }
        }
    },
    scared: {
        draw ({ out, t }) {
            out.dx = 0.05 * Math.sin(38 * t);
            out.dy = 0.04 * Math.cos(31 * t);
            out.fill('feature', [
                circleRing(0, 0, 0.5, 16)
            ]);
            out.fill('glint', [
                circleRing(-0.15, -0.17, 0.16, 10)
            ]);
        }
    },
    sweat: {
        draw ({ out, t }) {
            const u = 0.8 * t % 1;
            out.fill('tear', [
                dropRing(0.32).map(([x, y])=>[
                        x - 1.45,
                        y - 0.9 + 1.2 * u
                    ])
            ], 1 - unit((u - 0.6) / 0.4), {
                loose: true
            });
        }
    },
    cross: {
        natural: true,
        draw ({ out }) {
            out.line('feature', [
                [
                    -0.8,
                    -0.8
                ],
                [
                    0.8,
                    0.8
                ]
            ], 0.25);
            out.line('feature', [
                [
                    0.8,
                    -0.8
                ],
                [
                    -0.8,
                    0.8
                ]
            ], 0.25);
        }
    }
};
function listening({ out, t, order }, speed) {
    out.fill('feature', [
        circleRing(0, 0, 1, 24)
    ]);
    glints(out);
    for (const i of [
        0,
        1
    ]){
        const x = -1.55 - 0.5 * i;
        const y = 0.5 + 0.35 * i;
        out.line('feature', geometry_quad([
            x,
            -y
        ], [
            -1.95 - 0.6 * i,
            0
        ], [
            x,
            y
        ], 8), 0.13, 0.25 + 0.75 * reading_pulse(t * speed - 1.1 * i + order));
    }
}
const FADE_IN = 2.2;
function symbol_eye(spec, ctx) {
    const t = clockOf(ctx);
    const out = new LayerList();
    const squash = Math.max(0.06, Math.min(1, 1.4 * ctx.blink));
    for (const id of SYMBOLS){
        const amount = spec[id];
        if (amount < 0.004) continue;
        const art = ART[id];
        const pen = new Pen(ctx.weight);
        art.draw({
            out: pen,
            t,
            order: ctx.order,
            spec
        });
        const gaze = art.gaze ?? GAZE;
        pen.finish(out, art.natural ? ctx.nose : 1, amount, art.blinks ? squash : 1, (spec.offX + ctx.look[0]) * gaze, (spec.offY + ctx.look[1]) * gaze, unit(amount * FADE_IN));
    }
    return out.layers;
}
const symbol_forms = vocabulary(symbol_REST, (read)=>{
    switch(read.kind){
        case 'open':
            return {
                dot: 1,
                size: read.size,
                open: read.open,
                offX: read.off[0],
                offY: read.off[1]
            };
        case 'smile':
            return {
                dot: 0,
                arcUp: 1
            };
        case 'closed':
            return {
                dot: 0,
                arcDown: 1
            };
        case 'mad':
            return {
                dot: 0,
                mad: 1
            };
        case 'sad':
            return {
                dot: 0,
                sad: 1
            };
        case 'cross':
            return {
                dot: 0,
                cross: 1
            };
        case 'star':
            return {
                dot: 0,
                star: 1
            };
    }
});
const symbol_show = (...ids)=>({
        ...symbol_REST,
        dot: 0,
        ...Object.fromEntries(ids.map((id)=>[
                id,
                1
            ]))
    });
const symbol_pair = (left, right = left)=>[
        symbol_show(...left),
        symbol_show(...right)
    ];
const OWN = {
    heart: symbol_pair([
        'heart'
    ]),
    spark: symbol_pair([
        'spark'
    ]),
    spiral: symbol_pair([
        'spiral'
    ]),
    question: symbol_pair([
        'question'
    ]),
    exclaim: symbol_pair([
        'exclaim'
    ]),
    scared: symbol_pair([
        'scared'
    ], [
        'scared',
        'sweat'
    ]),
    fuming: symbol_pair([
        'mad'
    ], [
        'mad',
        'anger'
    ]),
    asleep: symbol_pair([
        'arcDown'
    ], [
        'sleepz'
    ]),
    ringLoad: symbol_pair([
        'ringLoad'
    ]),
    ringProgress: symbol_pair([
        'ringProgress'
    ]),
    ringUp: symbol_pair([
        'ringUp'
    ]),
    ringDown: symbol_pair([
        'ringDown'
    ]),
    ringSend: symbol_pair([
        'ringSend'
    ]),
    magnifier: symbol_pair([
        'magnifier'
    ]),
    dots: symbol_pair([
        'dots'
    ]),
    bubble: symbol_pair([
        'bubble'
    ]),
    clock: symbol_pair([
        'clock'
    ]),
    orbit: symbol_pair([
        'orbit'
    ]),
    radar: symbol_pair([
        'radar'
    ]),
    gear: symbol_pair([
        'gear'
    ]),
    ping: symbol_pair([
        'ping'
    ]),
    note: symbol_pair([
        'note'
    ]),
    listen: symbol_pair([
        'listen'
    ]),
    listenFast: symbol_pair([
        'listenFast'
    ]),
    power: symbol_pair([
        'power'
    ])
};
const symbol_CLASSES = {
    heart: [
        'star',
        'star'
    ],
    spark: [
        'star',
        'star'
    ],
    spiral: [
        'cross',
        'cross'
    ],
    question: [
        'open',
        'open'
    ],
    exclaim: [
        'wide',
        'wide'
    ],
    scared: [
        'small',
        'small'
    ],
    fuming: [
        'mad',
        'mad'
    ],
    asleep: [
        'closed',
        'closed'
    ],
    ringLoad: [
        'open',
        'open'
    ],
    ringProgress: [
        'open',
        'open'
    ],
    ringUp: [
        'open',
        'open'
    ],
    ringDown: [
        'open',
        'open'
    ],
    ringSend: [
        'open',
        'open'
    ],
    magnifier: [
        'look',
        'look'
    ],
    dots: [
        'look',
        'look'
    ],
    bubble: [
        'open',
        'open'
    ],
    clock: [
        'open',
        'open'
    ],
    orbit: [
        'open',
        'open'
    ],
    radar: [
        'open',
        'open'
    ],
    gear: [
        'open',
        'open'
    ],
    ping: [
        'wide',
        'wide'
    ],
    note: [
        'smile',
        'smile'
    ],
    listen: [
        'open',
        'open'
    ],
    listenFast: [
        'open',
        'open'
    ],
    power: [
        'open',
        'open'
    ]
};
const SYMBOL = {
    id: 'symbol',
    layout: {
        lift: symbol_LIFT,
        separation: symbol_SEPARATION,
        minSeparation: 4,
        mouthDrop: 1.3 * SCALE + symbol_MOUTH_GAP - symbol_LIFT,
        mouthScale: 1,
        mouthWeight: 1,
        blush: {
            x: 4.7,
            y: 2.1
        },
        gazeShift: 0.4
    },
    expressions: {
        ...symbol_forms,
        ...OWN
    },
    classes: symbol_CLASSES,
    states: {
        ...STATE_CUTE_EYES,
        happy: [
            'heart'
        ],
        excited: [
            'spark'
        ],
        proud: [
            'spark'
        ],
        composing: [
            'spark'
        ],
        spawning: [
            'spark'
        ],
        confused: [
            'spiral'
        ],
        curious: [
            'question'
        ],
        surprised: [
            'exclaim'
        ],
        alerting: [
            'exclaim'
        ],
        scared: [
            'scared'
        ],
        angry: [
            'fuming'
        ],
        sleeping: [
            'asleep'
        ],
        'powering-down': [
            'curve'
        ],
        loading: [
            'ringLoad'
        ],
        progress: [
            'ringProgress'
        ],
        uploading: [
            'ringUp'
        ],
        receiving: [
            'ringDown'
        ],
        sending: [
            'ringSend'
        ],
        searching: [
            'magnifier'
        ],
        thinking: [
            'dots'
        ],
        messaging: [
            'bubble'
        ],
        waiting: [
            'clock'
        ],
        orbit: [
            'orbit'
        ],
        radar: [
            'radar'
        ],
        working: [
            'gear'
        ],
        notifying: [
            'ping'
        ],
        humming: [
            'note'
        ],
        listening: [
            'listen'
        ],
        dictating: [
            'listenFast'
        ],
        waking: [
            'power'
        ]
    },
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'heart',
        'sparkle',
        'tear',
        'zz',
        'dots',
        'ellipsis',
        'spinner',
        'progress',
        'ripple',
        'orbit',
        'waves',
        'rise',
        'fall',
        'send',
        'bubbles'
    ],
    kaomoji: {
        eyes: {
            open: '●',
            wide: '●',
            small: '•',
            half: '◒',
            look: '●',
            smile: '◠',
            closed: '◡',
            mad: [
                '◣',
                '◢'
            ],
            sad: [
                '◥',
                '◤'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        special: {
            heart: '♥',
            spark: '✦',
            spiral: '@',
            question: '?',
            exclaim: '!',
            asleep: '－',
            ringLoad: '◌',
            ringProgress: '◔',
            ringUp: '↑',
            ringDown: '↓',
            ringSend: '→',
            magnifier: '⌕',
            dots: '・',
            bubble: '…',
            clock: '◷',
            orbit: '◎',
            radar: '◍',
            gear: '✻',
            ping: '◉',
            note: '♪',
            power: '⏻'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: symbol_eye
};
const teardrop_RX = 1.75;
const teardrop_RY = 2.05;
const TAPER = 0.18;
const teardrop_LIFT = 0.45;
const teardrop_SEPARATION = 5.5;
const teardrop_MOUTH_GAP = 0.9;
const teardrop_LOOK = {
    k: 0.5,
    limit: 0.5
};
const teardrop_BLINK_FLOOR = 0.08;
const SAMPLES = 32;
const teardrop_REST = {
    open: 1,
    sc: 1,
    px: 0,
    py: 0,
    lid: 0,
    lidA: 0,
    arc: 0,
    shut: 0,
    x: 0,
    star: 0,
    tear: 0
};
const teardrop_EXPRESSIONS = vocabulary(teardrop_REST, (read)=>{
    const [gx, gy] = looking(read.off, teardrop_LOOK.k, teardrop_LOOK.limit);
    switch(read.kind){
        case 'open':
            return {
                open: read.open,
                sc: read.size > 1.2 ? 1.15 : read.size < 0.8 ? 0.8 : 1,
                px: gx,
                py: gy
            };
        case 'smile':
            return {
                arc: 1,
                py: -0.1
            };
        case 'closed':
            return {
                shut: 1
            };
        case 'mad':
            return {
                lid: 0.4,
                lidA: 0.45,
                py: 0.1
            };
        case 'sad':
            return {
                lid: 0.32,
                lidA: -0.4,
                tear: 1,
                py: 0.15
            };
        case 'cross':
            return {
                x: 1
            };
        case 'star':
            return {
                star: 1
            };
    }
});
function teardrop_drop(rx, ry) {
    return Array.from({
        length: SAMPLES
    }, (_, i)=>{
        const t = i / SAMPLES * Math.PI * 2;
        const y = Math.cos(t);
        return [
            rx * Math.sin(t) * (1 - TAPER * Math.max(0, y)),
            ry * y
        ];
    });
}
function teardrop_eye(s, ctx) {
    const w = ctx.weight;
    const rx = teardrop_RX * s.sc;
    const ry = teardrop_RY * s.sc;
    const cx = s.px + ctx.look[0];
    const cy = s.py + ctx.look[1];
    const squash = Math.max(teardrop_BLINK_FLOOR, s.open * unit(ctx.blink));
    const lidAt = (x)=>cy - ry + 2 * s.lid * ry + s.lidA * (x - cx);
    const ring = teardrop_drop(rx, ry).map(([x, y])=>[
            cx + x,
            cy + y * squash
        ]);
    const lidded = s.lid > 0.004 ? ring.map(([x, y])=>[
            x,
            Math.max(y, lidAt(x))
        ]) : ring;
    const shown = 1 - unit(Math.max(s.arc, s.shut, s.x, s.star));
    const lit = shown * unit((squash - 0.45) / 0.3) * (1 - unit(3.5 * s.lid));
    const out = new LayerList();
    out.add('feature', [
        lidded
    ], shown);
    out.add('glint', [
        circleRing(cx - 0.3 * rx, cy - 0.4 * ry * squash, 0.3 * rx, 14)
    ], lit);
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            cx - 1.6,
            cy + 0.55
        ], [
            cx,
            cy - 1.4
        ], [
            cx + 1.6,
            cy + 0.55
        ]), 0.3 * w)
    ], s.arc);
    out.add('feature', [
        geometry_ribbon(geometry_quad([
            cx - 1.55,
            cy - 0.15
        ], [
            cx,
            cy + 1.1
        ], [
            cx + 1.55,
            cy - 0.15
        ]), 0.27 * w)
    ], s.shut);
    out.add('feature', [
        geometry_ribbon([
            [
                cx - 1,
                cy - 1
            ],
            [
                cx + 1,
                cy + 1
            ]
        ], 0.28 * w),
        geometry_ribbon([
            [
                cx + 1,
                cy - 1
            ],
            [
                cx - 1,
                cy + 1
            ]
        ], 0.28 * w)
    ], s.x);
    out.add('gold', [
        geometry_place(starRing(1.2, 0.46), cx, cy)
    ], s.star);
    fallingTear(out, ctx, s.tear, cx - 0.7, cy + 0.7 * ry, cy + ry + 2.2);
    return out.layers;
}
const TEARDROP = {
    id: 'teardrop',
    layout: {
        lift: teardrop_LIFT,
        separation: teardrop_SEPARATION,
        minSeparation: 4.3,
        mouthDrop: teardrop_RY - teardrop_LIFT + teardrop_MOUTH_GAP,
        mouthScale: 0.9,
        mouthWeight: 1,
        blush: {
            x: 4.4,
            y: 2.3
        },
        gazeShift: 1
    },
    expressions: teardrop_EXPRESSIONS,
    classes: {},
    states: STATE_CUTE_EYES,
    mouths: CUTE_MOUTHS,
    stateMouth: STATE_CUTE_MOUTH,
    mouthPaint: 'feature',
    quietFx: [
        'tear'
    ],
    kaomoji: {
        eyes: {
            open: '●',
            wide: '⬤',
            small: '•',
            half: '◒',
            look: '●',
            smile: '◠',
            closed: '◡',
            mad: [
                '◣',
                '◢'
            ],
            sad: [
                '◢',
                '◣'
            ],
            cross: [
                '＞',
                '＜'
            ],
            star: '★'
        },
        mouths: CUTE_MOUTH_GLYPHS
    },
    eye: teardrop_eye
};
const FACE_PAINTS = [
    'face',
    'pupil',
    'feature',
    'glint',
    'iris',
    'gold',
    'tear',
    'tongue',
    'rose',
    'flame',
    'thread',
    'bone',
    'glass',
    'light'
];
const FACE_ACCENTS = {
    gold: '#FFC531',
    tear: '#6EC1FF',
    tongue: '#EE6B7C',
    rose: '#FF5A7A',
    flame: '#FF6A3D',
    thread: '#8A4B2A',
    bone: '#F6EAD2',
    glass: '#17141F'
};
const isFaceAccent = (paint)=>paint in FACE_ACCENTS;
const EYE_CLASSES = [
    'open',
    'wide',
    'small',
    'half',
    'look',
    'smile',
    'closed',
    'mad',
    'sad',
    'cross',
    'star'
];
const CUTE_EYE_CLASSES = {
    dot: [
        'open',
        'open'
    ],
    dotSmall: [
        'small',
        'small'
    ],
    dotWide: [
        'wide',
        'wide'
    ],
    dotLeft: [
        'look',
        'look'
    ],
    dotRight: [
        'look',
        'look'
    ],
    dotUp: [
        'look',
        'look'
    ],
    dotDown: [
        'look',
        'look'
    ],
    dotLook: [
        'look',
        'look'
    ],
    dotHalf: [
        'half',
        'half'
    ],
    dotSuspicious: [
        'half',
        'open'
    ],
    arch: [
        'smile',
        'smile'
    ],
    archWide: [
        'smile',
        'smile'
    ],
    curve: [
        'closed',
        'closed'
    ],
    curveSleepy: [
        'closed',
        'closed'
    ],
    cross: [
        'cross',
        'cross'
    ],
    star: [
        'star',
        'star'
    ],
    sad: [
        'sad',
        'sad'
    ],
    mad: [
        'mad',
        'mad'
    ],
    wink: [
        'smile',
        'open'
    ]
};
const FACE_DESIGNS = {
    brow: BROW,
    glossy: GLOSSY,
    sparkle: SPARKLE,
    button: BUTTON,
    shades: SHADES,
    droopy: DROOPY,
    bigmouth: BIGMOUTH,
    pie: PIE,
    screen: SCREEN,
    symbol: SYMBOL,
    capsule: CAPSULE,
    teardrop: TEARDROP,
    specs: SPECS
};
const DEFINED = new Map();
const DEFINED_LABELS = new Map();
const getFaceDesign = (id)=>FACE_DESIGNS[id] ?? DEFINED.get(id);
function defineFace(design, options = {}) {
    const { id } = design;
    if (FACE_STYLES.includes(id)) throw new Error(`"${id}" is a built-in face`);
    DEFINED.set(id, design);
    if (options.label) DEFINED_LABELS.set(id, options.label);
    else DEFINED_LABELS.delete(id);
    markDefinedFace(id);
}
const definedFaces = ()=>[
        ...DEFINED.keys()
    ];
const definedFaceLabel = (id)=>DEFINED_LABELS.get(id) ?? null;
const expressionsOf = (design)=>design.expressions;
function drawnPairFor(design, name) {
    const table = expressionsOf(design);
    return table[name] ?? table[cuteNameFor(name)] ?? table.dot;
}
function drawnPairForState(design, state, index) {
    const list = design.states[state] ?? [
        'dot'
    ];
    return drawnPairFor(design, list[index % list.length] ?? 'dot');
}
function drawnMouthFor(design, state, pinned) {
    const own = pinned ? design.mouths[pinned] : void 0;
    return own ?? design.mouths[design.stateMouth[state]];
}
function morphEye(a, b, t) {
    const out = {};
    for (const key of Object.keys(b))out[key] = easing_lerp(a[key] ?? b[key], b[key], t);
    return out;
}
function morphDrawnPair(a, b, t) {
    return [
        morphEye(a[0], b[0], t),
        morphEye(a[1], b[1], t)
    ];
}
function eyeClassesFor(design, name) {
    const own = design.classes[name];
    return own ?? CUTE_EYE_CLASSES[cuteNameFor(name)] ?? CUTE_EYE_CLASSES.dot;
}
const glyphFor = (glyph, side)=>'string' == typeof glyph ? glyph : glyph[side];
function drawnFaceText(design, state) {
    const name = design.states[state]?.[0] ?? 'dot';
    const { eyes, special, mouths } = design.kaomoji;
    const own = special?.[name];
    const [left, right] = eyeClassesFor(design, name);
    const mouth = mouths[design.stateMouth[state]];
    return `${glyphFor(own ?? eyes[left], 0)}${mouth}${glyphFor(own ?? eyes[right], 1)}`;
}
function stretchAt(shape, y, x) {
    const at = clamp(y, shape.top + 1, shape.bottom - 1);
    const crossings = [];
    const { outline } = shape;
    for(let i = 0; i < outline.length; i++){
        const [x0, y0] = outline[i];
        const [x1, y1] = outline[(i + 1) % outline.length];
        if (y0 <= at !== y1 <= at) crossings.push(x0 + (x1 - x0) * (at - y0) / (y1 - y0));
    }
    if (crossings.length < 2) return shape.spanAt(at);
    crossings.sort((p, q)=>p - q);
    let lo;
    let hi;
    for(let i = 0; i + 1 < crossings.length; i += 2){
        const start = crossings[i];
        const end = crossings[i + 1];
        if (start <= x && x <= end) return [
            start,
            end
        ];
        if (end < x) lo = start;
        else if (void 0 === hi) hi = end;
    }
    return [
        lo ?? crossings[0],
        hi ?? crossings[crossings.length - 1]
    ];
}
const FOOTPRINT_BANDS = 16;
const EXTENT_TIMES = [
    0,
    1.05
];
const DECIMALS = 3;
const extent_round = (v)=>Math.round(v * 10 ** DECIMALS) / 10 ** DECIMALS;
function footprintOf(layers) {
    let top = 1 / 0;
    let bottom = -1 / 0;
    for (const layer of layers)if (!layer.loose) for (const ring of layer.rings)for (const [, y] of ring){
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
    }
    if (!(bottom > top)) return [];
    const step = (bottom - top) / FOOTPRINT_BANDS;
    const bands = Array.from({
        length: FOOTPRINT_BANDS
    }, (_, i)=>({
            y0: top + step * i,
            y1: top + step * (i + 1),
            x0: 1 / 0,
            x1: -1 / 0
        }));
    for (const layer of layers)if (!layer.loose) for (const ring of layer.rings)for (const [x, y] of ring){
        const band = bands[Math.min(FOOTPRINT_BANDS - 1, Math.floor((y - top) / step))];
        band.x0 = Math.min(band.x0, x);
        band.x1 = Math.max(band.x1, x);
    }
    return bands.filter((b)=>b.x1 >= b.x0).map((b)=>({
            y0: extent_round(b.y0),
            y1: extent_round(b.y1),
            x0: extent_round(b.x0),
            x1: extent_round(b.x1)
        }));
}
function measureExtent(design) {
    const l = design.layout;
    const names = new Set(Object.values(design.states).flat());
    const left = [];
    const right = [];
    const wide = [];
    const narrow = [];
    for (const name of names){
        const pair = design.expressions[name];
        if (pair) for (const time of EXTENT_TIMES){
            const context = (nose, separation = l.separation)=>({
                    nose,
                    order: 1 === nose ? 0 : 1,
                    time,
                    settled: false,
                    blink: 1,
                    look: [
                        0,
                        0
                    ],
                    weight: 1,
                    mid: separation / 2
                });
            left.push(...design.eye(pair[0], context(1)));
            right.push(...design.eye(pair[1], context(-1)));
            if (design.plate) {
                wide.push(...design.plate(pair[0], pair[1], context(1)));
                narrow.push(...design.plate(pair[0], pair[1], context(1, l.minSeparation)));
            }
        }
    }
    const widest = Math.max(...Object.values(design.stateMouth).map((id)=>design.mouths[id].width));
    return {
        left: footprintOf(left),
        right: footprintOf(right),
        plateWide: footprintOf(wide),
        plateNarrow: footprintOf(narrow),
        mouth: extent_round(widest * l.mouthScale)
    };
}
function plateExtent(profile, squeeze, least) {
    const { plateWide: wide, plateNarrow: narrow } = profile;
    if (wide.length !== narrow.length || least >= 1) return wide;
    const t = Math.min(1, Math.max(0, (squeeze - least) / (1 - least)));
    return wide.map((band, i)=>{
        const near = narrow[i];
        return {
            y0: band.y0,
            y1: band.y1,
            x0: near.x0 + (band.x0 - near.x0) * t,
            x1: near.x1 + (band.x1 - near.x1) * t
        };
    });
}
const DRAWN_EXTENTS = {
    capsule: {
        left: [
            {
                y0: -2.482,
                y1: -2.177,
                x0: -0.636,
                x1: 1.023
            },
            {
                y0: -2.177,
                y1: -1.872,
                x0: -0.855,
                x1: 1.166
            },
            {
                y0: -1.872,
                y1: -1.566,
                x0: -1.184,
                x1: 1.392
            },
            {
                y0: -1.566,
                y1: -1.261,
                x0: -1.31,
                x1: 1.411
            },
            {
                y0: -1.261,
                y1: -0.956,
                x0: -1.364,
                x1: 1.362
            },
            {
                y0: -0.956,
                y1: -0.651,
                x0: -1.497,
                x1: 1.497
            },
            {
                y0: -0.651,
                y1: -0.346,
                x0: -1.291,
                x1: 1.189
            },
            {
                y0: -0.346,
                y1: -0.041,
                x0: -1.627,
                x1: 1.627
            },
            {
                y0: -0.041,
                y1: 0.265,
                x0: -1.75,
                x1: 1.75
            },
            {
                y0: 0.265,
                y1: 0.57,
                x0: -1.736,
                x1: 1.736
            },
            {
                y0: 0.57,
                y1: 0.875,
                x0: -1.497,
                x1: 1.497
            },
            {
                y0: 0.875,
                y1: 1.18,
                x0: -1.411,
                x1: 1.358
            },
            {
                y0: 1.18,
                y1: 1.485,
                x0: -1.392,
                x1: 1.364
            },
            {
                y0: 1.485,
                y1: 1.791,
                x0: -1.306,
                x1: 1.198
            },
            {
                y0: 1.791,
                y1: 2.096,
                x0: -0.969,
                x1: 1.036
            },
            {
                y0: 2.096,
                y1: 2.401,
                x0: -0.636,
                x1: 0.636
            }
        ],
        right: [
            {
                y0: -2.482,
                y1: -2.177,
                x0: -1.023,
                x1: 0.959
            },
            {
                y0: -2.177,
                y1: -1.872,
                x0: -1.166,
                x1: 1.158
            },
            {
                y0: -1.872,
                y1: -1.566,
                x0: -1.287,
                x1: 1.392
            },
            {
                y0: -1.566,
                y1: -1.261,
                x0: -1.31,
                x1: 1.411
            },
            {
                y0: -1.261,
                y1: -0.956,
                x0: -1.364,
                x1: 1.362
            },
            {
                y0: -0.956,
                y1: -0.651,
                x0: -1.497,
                x1: 1.497
            },
            {
                y0: -0.651,
                y1: -0.346,
                x0: -1.291,
                x1: 1.189
            },
            {
                y0: -0.346,
                y1: -0.041,
                x0: -1.627,
                x1: 1.627
            },
            {
                y0: -0.041,
                y1: 0.265,
                x0: -1.75,
                x1: 1.75
            },
            {
                y0: 0.265,
                y1: 0.57,
                x0: -1.736,
                x1: 1.736
            },
            {
                y0: 0.57,
                y1: 0.875,
                x0: -1.497,
                x1: 1.497
            },
            {
                y0: 0.875,
                y1: 1.18,
                x0: -1.411,
                x1: 1.358
            },
            {
                y0: 1.18,
                y1: 1.485,
                x0: -1.392,
                x1: 1.364
            },
            {
                y0: 1.485,
                y1: 1.791,
                x0: -1.306,
                x1: 1.198
            },
            {
                y0: 1.791,
                y1: 2.096,
                x0: -0.969,
                x1: 1.036
            },
            {
                y0: 2.096,
                y1: 2.401,
                x0: -0.636,
                x1: 0.636
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.52
    },
    brow: {
        left: [
            {
                y0: -4.119,
                y1: -3.691,
                x0: -1.612,
                x1: 2
            },
            {
                y0: -3.691,
                y1: -3.262,
                x0: -2.334,
                x1: 2
            },
            {
                y0: -3.262,
                y1: -2.833,
                x0: -2.816,
                x1: 2
            },
            {
                y0: -2.833,
                y1: -2.405,
                x0: -2.816,
                x1: 2
            },
            {
                y0: -2.405,
                y1: -1.976,
                x0: -2.816,
                x1: 2
            },
            {
                y0: -1.976,
                y1: -1.548,
                x0: -2.575,
                x1: 1.949
            },
            {
                y0: -1.548,
                y1: -1.119,
                x0: -2.816,
                x1: 2.126
            },
            {
                y0: -1.119,
                y1: -0.69,
                x0: -2.37,
                x1: 2.508
            },
            {
                y0: -0.69,
                y1: -0.262,
                x0: -2.432,
                x1: 2.804
            },
            {
                y0: -0.262,
                y1: 0.167,
                x0: -2.453,
                x1: 2.453
            },
            {
                y0: 0.167,
                y1: 0.595,
                x0: -2.432,
                x1: 3.1
            },
            {
                y0: 0.595,
                y1: 1.024,
                x0: -2.37,
                x1: 2.37
            },
            {
                y0: 1.024,
                y1: 1.452,
                x0: -2.267,
                x1: 2.267
            },
            {
                y0: 1.452,
                y1: 1.881,
                x0: -2.264,
                x1: 2.264
            },
            {
                y0: 1.881,
                y1: 2.31,
                x0: -1.738,
                x1: 1.738
            },
            {
                y0: 2.31,
                y1: 2.738,
                x0: -1.23,
                x1: 1.23
            }
        ],
        right: [
            {
                y0: -4.119,
                y1: -3.691,
                x0: -1.612,
                x1: 2
            },
            {
                y0: -3.691,
                y1: -3.262,
                x0: -2.334,
                x1: 2
            },
            {
                y0: -3.262,
                y1: -2.833,
                x0: -2.816,
                x1: 2
            },
            {
                y0: -2.833,
                y1: -2.405,
                x0: -2.816,
                x1: 2
            },
            {
                y0: -2.405,
                y1: -1.976,
                x0: -2.816,
                x1: 2
            },
            {
                y0: -1.976,
                y1: -1.548,
                x0: -2.575,
                x1: 1.949
            },
            {
                y0: -1.548,
                y1: -1.119,
                x0: -2.816,
                x1: 2.126
            },
            {
                y0: -1.119,
                y1: -0.69,
                x0: -2.37,
                x1: 2.508
            },
            {
                y0: -0.69,
                y1: -0.262,
                x0: -2.432,
                x1: 2.804
            },
            {
                y0: -0.262,
                y1: 0.167,
                x0: -2.453,
                x1: 2.453
            },
            {
                y0: 0.167,
                y1: 0.595,
                x0: -2.432,
                x1: 3.1
            },
            {
                y0: 0.595,
                y1: 1.024,
                x0: -2.37,
                x1: 2.37
            },
            {
                y0: 1.024,
                y1: 1.452,
                x0: -2.267,
                x1: 2.267
            },
            {
                y0: 1.452,
                y1: 1.881,
                x0: -2.264,
                x1: 2.264
            },
            {
                y0: 1.881,
                y1: 2.31,
                x0: -1.738,
                x1: 1.738
            },
            {
                y0: 2.31,
                y1: 2.738,
                x0: -1.23,
                x1: 1.23
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    glossy: {
        left: [
            {
                y0: -3.779,
                y1: -3.386,
                x0: -1.049,
                x1: 1.049
            },
            {
                y0: -3.386,
                y1: -2.994,
                x0: -0.932,
                x1: 0.932
            },
            {
                y0: -2.994,
                y1: -2.601,
                x0: -1.049,
                x1: 1.049
            },
            {
                y0: -2.601,
                y1: -2.209,
                x0: -0.989,
                x1: 0.95
            },
            {
                y0: -2.209,
                y1: -1.816,
                x0: -1.457,
                x1: 1.444
            },
            {
                y0: -1.816,
                y1: -1.424,
                x0: -1.97,
                x1: 1.848
            },
            {
                y0: -1.424,
                y1: -1.032,
                x0: -2.168,
                x1: 2.007
            },
            {
                y0: -1.032,
                y1: -0.639,
                x0: -2.244,
                x1: 2.222
            },
            {
                y0: -0.639,
                y1: -0.247,
                x0: -2.281,
                x1: 2.281
            },
            {
                y0: -0.247,
                y1: 0.146,
                x0: -2.3,
                x1: 2.3
            },
            {
                y0: 0.146,
                y1: 0.538,
                x0: -2.281,
                x1: 2.281
            },
            {
                y0: 0.538,
                y1: 0.93,
                x0: -2.225,
                x1: 2.225
            },
            {
                y0: 0.93,
                y1: 1.323,
                x0: -2.133,
                x1: 2.133
            },
            {
                y0: 1.323,
                y1: 1.715,
                x0: -1.848,
                x1: 1.848
            },
            {
                y0: 1.715,
                y1: 2.108,
                x0: -1.659,
                x1: 1.659
            },
            {
                y0: 2.108,
                y1: 2.5,
                x0: -1.206,
                x1: 1.206
            }
        ],
        right: [
            {
                y0: -3.779,
                y1: -3.386,
                x0: -1.049,
                x1: 1.049
            },
            {
                y0: -3.386,
                y1: -2.994,
                x0: -0.932,
                x1: 0.932
            },
            {
                y0: -2.994,
                y1: -2.601,
                x0: -1.049,
                x1: 1.049
            },
            {
                y0: -2.601,
                y1: -2.209,
                x0: -0.95,
                x1: 0.989
            },
            {
                y0: -2.209,
                y1: -1.816,
                x0: -1.457,
                x1: 1.444
            },
            {
                y0: -1.816,
                y1: -1.424,
                x0: -1.97,
                x1: 1.848
            },
            {
                y0: -1.424,
                y1: -1.032,
                x0: -2.168,
                x1: 2.007
            },
            {
                y0: -1.032,
                y1: -0.639,
                x0: -2.244,
                x1: 2.222
            },
            {
                y0: -0.639,
                y1: -0.247,
                x0: -2.281,
                x1: 2.281
            },
            {
                y0: -0.247,
                y1: 0.146,
                x0: -2.3,
                x1: 2.3
            },
            {
                y0: 0.146,
                y1: 0.538,
                x0: -2.281,
                x1: 2.281
            },
            {
                y0: 0.538,
                y1: 0.93,
                x0: -2.225,
                x1: 2.225
            },
            {
                y0: 0.93,
                y1: 1.323,
                x0: -2.133,
                x1: 2.133
            },
            {
                y0: 1.323,
                y1: 1.715,
                x0: -1.848,
                x1: 1.848
            },
            {
                y0: 1.715,
                y1: 2.108,
                x0: -1.659,
                x1: 1.659
            },
            {
                y0: 2.108,
                y1: 2.5,
                x0: -1.206,
                x1: 1.206
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    sparkle: {
        left: [
            {
                y0: -3.91,
                y1: -3.494,
                x0: -1.158,
                x1: 1.158
            },
            {
                y0: -3.494,
                y1: -3.078,
                x0: -1.032,
                x1: 1.032
            },
            {
                y0: -3.078,
                y1: -2.661,
                x0: -1.158,
                x1: 1.158
            },
            {
                y0: -2.661,
                y1: -2.245,
                x0: -1.319,
                x1: 1.319
            },
            {
                y0: -2.245,
                y1: -1.829,
                x0: -2.365,
                x1: 1.823
            },
            {
                y0: -1.829,
                y1: -1.413,
                x0: -2.485,
                x1: 1.708
            },
            {
                y0: -1.413,
                y1: -0.996,
                x0: -2.265,
                x1: 2.076
            },
            {
                y0: -0.996,
                y1: -0.58,
                x0: -2.304,
                x1: 1.93
            },
            {
                y0: -0.58,
                y1: -0.164,
                x0: -2.354,
                x1: 2.101
            },
            {
                y0: -0.164,
                y1: 0.252,
                x0: -2.303,
                x1: 2.303
            },
            {
                y0: 0.252,
                y1: 0.669,
                x0: -2.053,
                x1: 2.053
            },
            {
                y0: 0.669,
                y1: 1.085,
                x0: -1.93,
                x1: 1.93
            },
            {
                y0: 1.085,
                y1: 1.501,
                x0: -1.824,
                x1: 1.824
            },
            {
                y0: 1.501,
                y1: 1.917,
                x0: -1.597,
                x1: 1.597
            },
            {
                y0: 1.917,
                y1: 2.334,
                x0: -1.371,
                x1: 1.371
            },
            {
                y0: 2.334,
                y1: 2.75,
                x0: -0.999,
                x1: 0.999
            }
        ],
        right: [
            {
                y0: -3.91,
                y1: -3.494,
                x0: -1.158,
                x1: 1.158
            },
            {
                y0: -3.494,
                y1: -3.078,
                x0: -1.032,
                x1: 1.032
            },
            {
                y0: -3.078,
                y1: -2.661,
                x0: -1.158,
                x1: 1.158
            },
            {
                y0: -2.661,
                y1: -2.245,
                x0: -1.319,
                x1: 1.319
            },
            {
                y0: -2.245,
                y1: -1.829,
                x0: -2.365,
                x1: 1.823
            },
            {
                y0: -1.829,
                y1: -1.413,
                x0: -2.485,
                x1: 1.708
            },
            {
                y0: -1.413,
                y1: -0.996,
                x0: -2.265,
                x1: 2.076
            },
            {
                y0: -0.996,
                y1: -0.58,
                x0: -2.304,
                x1: 1.93
            },
            {
                y0: -0.58,
                y1: -0.164,
                x0: -2.354,
                x1: 2.101
            },
            {
                y0: -0.164,
                y1: 0.252,
                x0: -2.303,
                x1: 2.303
            },
            {
                y0: 0.252,
                y1: 0.669,
                x0: -2.053,
                x1: 2.053
            },
            {
                y0: 0.669,
                y1: 1.085,
                x0: -1.93,
                x1: 1.93
            },
            {
                y0: 1.085,
                y1: 1.501,
                x0: -1.824,
                x1: 1.824
            },
            {
                y0: 1.501,
                y1: 1.917,
                x0: -1.597,
                x1: 1.597
            },
            {
                y0: 1.917,
                y1: 2.334,
                x0: -1.371,
                x1: 1.371
            },
            {
                y0: 2.334,
                y1: 2.75,
                x0: -0.999,
                x1: 0.999
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    button: {
        left: [
            {
                y0: -3.319,
                y1: -2.96,
                x0: -1.705,
                x1: 1.571
            },
            {
                y0: -2.96,
                y1: -2.602,
                x0: -1.562,
                x1: 1.52
            },
            {
                y0: -2.602,
                y1: -2.243,
                x0: -1.654,
                x1: 1.571
            },
            {
                y0: -2.243,
                y1: -1.884,
                x0: -1.705,
                x1: 1.567
            },
            {
                y0: -1.884,
                y1: -1.526,
                x0: -1.598,
                x1: 1.598
            },
            {
                y0: -1.526,
                y1: -1.167,
                x0: -1.726,
                x1: 1.726
            },
            {
                y0: -1.167,
                y1: -0.808,
                x0: -1.989,
                x1: 1.989
            },
            {
                y0: -0.808,
                y1: -0.45,
                x0: -2.153,
                x1: 2.153
            },
            {
                y0: -0.45,
                y1: -0.091,
                x0: -2.065,
                x1: 2.181
            },
            {
                y0: -0.091,
                y1: 0.267,
                x0: -2.208,
                x1: 2.208
            },
            {
                y0: 0.267,
                y1: 0.626,
                x0: -2.153,
                x1: 2.285
            },
            {
                y0: 0.626,
                y1: 0.985,
                x0: -1.989,
                x1: 2.181
            },
            {
                y0: 0.985,
                y1: 1.343,
                x0: -1.809,
                x1: 1.806
            },
            {
                y0: 1.343,
                y1: 1.702,
                x0: -1.726,
                x1: 1.878
            },
            {
                y0: 1.702,
                y1: 2.061,
                x0: -1.377,
                x1: 1.408
            },
            {
                y0: 2.061,
                y1: 2.419,
                x0: -0.582,
                x1: 0.862
            }
        ],
        right: [
            {
                y0: -3.319,
                y1: -2.96,
                x0: -1.705,
                x1: 1.571
            },
            {
                y0: -2.96,
                y1: -2.602,
                x0: -1.562,
                x1: 1.52
            },
            {
                y0: -2.602,
                y1: -2.243,
                x0: -1.654,
                x1: 1.571
            },
            {
                y0: -2.243,
                y1: -1.884,
                x0: -1.705,
                x1: 1.567
            },
            {
                y0: -1.884,
                y1: -1.526,
                x0: -1.598,
                x1: 1.598
            },
            {
                y0: -1.526,
                y1: -1.167,
                x0: -1.726,
                x1: 1.726
            },
            {
                y0: -1.167,
                y1: -0.808,
                x0: -1.989,
                x1: 1.989
            },
            {
                y0: -0.808,
                y1: -0.45,
                x0: -2.153,
                x1: 2.153
            },
            {
                y0: -0.45,
                y1: -0.091,
                x0: -2.109,
                x1: 2.181
            },
            {
                y0: -0.091,
                y1: 0.267,
                x0: -2.208,
                x1: 2.208
            },
            {
                y0: 0.267,
                y1: 0.626,
                x0: -2.153,
                x1: 2.285
            },
            {
                y0: 0.626,
                y1: 0.985,
                x0: -1.989,
                x1: 2.181
            },
            {
                y0: 0.985,
                y1: 1.343,
                x0: -1.809,
                x1: 1.779
            },
            {
                y0: 1.343,
                y1: 1.702,
                x0: -1.726,
                x1: 1.878
            },
            {
                y0: 1.702,
                y1: 2.061,
                x0: -1.377,
                x1: 1.408
            },
            {
                y0: 2.061,
                y1: 2.419,
                x0: -0.582,
                x1: 0.862
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    shades: {
        left: [
            {
                y0: -2.535,
                y1: -2.248,
                x0: -2.361,
                x1: 2.361
            },
            {
                y0: -2.248,
                y1: -1.961,
                x0: -2.556,
                x1: 2.556
            },
            {
                y0: -1.961,
                y1: -1.674,
                x0: -2.697,
                x1: 2.725
            },
            {
                y0: -1.674,
                y1: -1.387,
                x0: -2.811,
                x1: 2.811
            },
            {
                y0: -1.387,
                y1: -1.1,
                x0: -2.635,
                x1: 2.635
            },
            {
                y0: -1.1,
                y1: -0.812,
                x0: -2.51,
                x1: 2.677
            },
            {
                y0: -0.812,
                y1: -0.525,
                x0: -2.492,
                x1: 2.705
            },
            {
                y0: -0.525,
                y1: -0.238,
                x0: -2.486,
                x1: 2.683
            },
            {
                y0: -0.238,
                y1: 0.049,
                x0: -2.811,
                x1: 2.811
            },
            {
                y0: 0.049,
                y1: 0.336,
                x0: -2.785,
                x1: 2.785
            },
            {
                y0: 0.336,
                y1: 0.623,
                x0: -2.707,
                x1: 2.707
            },
            {
                y0: 0.623,
                y1: 0.91,
                x0: -2.581,
                x1: 2.581
            },
            {
                y0: 0.91,
                y1: 1.197,
                x0: -2.42,
                x1: 2.42
            },
            {
                y0: 1.197,
                y1: 1.484,
                x0: -2.063,
                x1: 2.063
            },
            {
                y0: 1.484,
                y1: 1.771,
                x0: -1.832,
                x1: 1.85
            },
            {
                y0: 1.771,
                y1: 2.058,
                x0: -1.289,
                x1: 1.371
            }
        ],
        right: [
            {
                y0: -2.627,
                y1: -2.334,
                x0: -2.117,
                x1: 2.127
            },
            {
                y0: -2.334,
                y1: -2.041,
                x0: -2.556,
                x1: 2.556
            },
            {
                y0: -2.041,
                y1: -1.748,
                x0: -2.697,
                x1: 2.791
            },
            {
                y0: -1.748,
                y1: -1.456,
                x0: -2.782,
                x1: 2.818
            },
            {
                y0: -1.456,
                y1: -1.163,
                x0: -2.811,
                x1: 2.811
            },
            {
                y0: -1.163,
                y1: -0.87,
                x0: -2.635,
                x1: 2.677
            },
            {
                y0: -0.87,
                y1: -0.577,
                x0: -2.492,
                x1: 2.705
            },
            {
                y0: -0.577,
                y1: -0.284,
                x0: -2.486,
                x1: 2.683
            },
            {
                y0: -0.284,
                y1: 0.008,
                x0: -2.811,
                x1: 2.811
            },
            {
                y0: 0.008,
                y1: 0.301,
                x0: -2.785,
                x1: 2.785
            },
            {
                y0: 0.301,
                y1: 0.594,
                x0: -2.707,
                x1: 2.707
            },
            {
                y0: 0.594,
                y1: 0.887,
                x0: -2.581,
                x1: 2.581
            },
            {
                y0: 0.887,
                y1: 1.18,
                x0: -2.42,
                x1: 2.42
            },
            {
                y0: 1.18,
                y1: 1.472,
                x0: -2.2,
                x1: 2.207
            },
            {
                y0: 1.472,
                y1: 1.765,
                x0: -1.832,
                x1: 1.85
            },
            {
                y0: 1.765,
                y1: 2.058,
                x0: -1.289,
                x1: 1.371
            }
        ],
        plateWide: [
            {
                y0: -1.374,
                y1: -1.308,
                x0: -5.959,
                x1: 5.959
            },
            {
                y0: -1.243,
                y1: -1.177,
                x0: -6.021,
                x1: 6.021
            },
            {
                y0: -1.177,
                y1: -1.112,
                x0: -4.885,
                x1: 4.885
            },
            {
                y0: -1.112,
                y1: -1.046,
                x0: -6.024,
                x1: 6.024
            },
            {
                y0: -1.046,
                y1: -0.981,
                x0: -5.967,
                x1: 5.967
            },
            {
                y0: -0.981,
                y1: -0.915,
                x0: -5.865,
                x1: 5.865
            },
            {
                y0: -0.915,
                y1: -0.85,
                x0: -0.428,
                x1: 0.428
            },
            {
                y0: -0.85,
                y1: -0.784,
                x0: -4.729,
                x1: 4.729
            },
            {
                y0: -0.784,
                y1: -0.718,
                x0: -4.791,
                x1: 4.791
            },
            {
                y0: -0.718,
                y1: -0.653,
                x0: -5.015,
                x1: 5.015
            },
            {
                y0: -0.653,
                y1: -0.587,
                x0: -0.669,
                x1: 0.669
            },
            {
                y0: -0.587,
                y1: -0.522,
                x0: -0.077,
                x1: 0.077
            },
            {
                y0: -0.522,
                y1: -0.456,
                x0: -0.675,
                x1: 0.675
            },
            {
                y0: -0.456,
                y1: -0.391,
                x0: -0.62,
                x1: 0.62
            },
            {
                y0: -0.391,
                y1: -0.325,
                x0: -0.519,
                x1: 0.519
            }
        ],
        plateNarrow: [
            {
                y0: -1.374,
                y1: -1.308,
                x0: -5.809,
                x1: 5.809
            },
            {
                y0: -1.243,
                y1: -1.177,
                x0: -5.871,
                x1: 5.871
            },
            {
                y0: -1.177,
                y1: -1.112,
                x0: -4.735,
                x1: 4.735
            },
            {
                y0: -1.112,
                y1: -1.046,
                x0: -5.874,
                x1: 5.874
            },
            {
                y0: -1.046,
                y1: -0.981,
                x0: -5.817,
                x1: 5.817
            },
            {
                y0: -0.981,
                y1: -0.915,
                x0: -5.715,
                x1: 5.715
            },
            {
                y0: -0.915,
                y1: -0.85,
                x0: -0.428,
                x1: 0.428
            },
            {
                y0: -0.85,
                y1: -0.784,
                x0: -4.579,
                x1: 4.579
            },
            {
                y0: -0.784,
                y1: -0.718,
                x0: -4.641,
                x1: 4.641
            },
            {
                y0: -0.718,
                y1: -0.653,
                x0: -4.865,
                x1: 4.865
            },
            {
                y0: -0.653,
                y1: -0.587,
                x0: -0.669,
                x1: 0.669
            },
            {
                y0: -0.587,
                y1: -0.522,
                x0: -0.077,
                x1: 0.077
            },
            {
                y0: -0.522,
                y1: -0.456,
                x0: -0.675,
                x1: 0.675
            },
            {
                y0: -0.456,
                y1: -0.391,
                x0: -0.62,
                x1: 0.62
            },
            {
                y0: -0.391,
                y1: -0.325,
                x0: -0.519,
                x1: 0.519
            }
        ],
        mouth: 1.6
    },
    droopy: {
        left: [
            {
                y0: -1.25,
                y1: -1.05,
                x0: -1.233,
                x1: 1.233
            },
            {
                y0: -1.05,
                y1: -0.849,
                x0: -1.368,
                x1: 1.368
            },
            {
                y0: -0.849,
                y1: -0.649,
                x0: -1.454,
                x1: 1.454
            },
            {
                y0: -0.649,
                y1: -0.448,
                x0: -1.551,
                x1: 1.551
            },
            {
                y0: -0.448,
                y1: -0.248,
                x0: -1.622,
                x1: 1.622
            },
            {
                y0: -0.248,
                y1: -0.047,
                x0: -1.665,
                x1: 1.665
            },
            {
                y0: -0.047,
                y1: 0.153,
                x0: -1.679,
                x1: 1.679
            },
            {
                y0: 0.153,
                y1: 0.354,
                x0: -1.665,
                x1: 1.665
            },
            {
                y0: 0.354,
                y1: 0.554,
                x0: -1.622,
                x1: 1.622
            },
            {
                y0: 0.554,
                y1: 0.755,
                x0: -1.582,
                x1: 1.599
            },
            {
                y0: 0.755,
                y1: 0.955,
                x0: -1.6,
                x1: 1.512
            },
            {
                y0: 0.955,
                y1: 1.156,
                x0: -1.332,
                x1: 1.332
            },
            {
                y0: 1.156,
                y1: 1.356,
                x0: -1.187,
                x1: 1.187
            },
            {
                y0: 1.356,
                y1: 1.557,
                x0: -0.858,
                x1: 0.858
            },
            {
                y0: 1.557,
                y1: 1.757,
                x0: -0.993,
                x1: 0.993
            },
            {
                y0: 1.757,
                y1: 1.957,
                x0: -0.981,
                x1: 0.981
            }
        ],
        right: [
            {
                y0: -1.25,
                y1: -1.05,
                x0: -1.233,
                x1: 1.233
            },
            {
                y0: -1.05,
                y1: -0.849,
                x0: -1.368,
                x1: 1.368
            },
            {
                y0: -0.849,
                y1: -0.649,
                x0: -1.454,
                x1: 1.454
            },
            {
                y0: -0.649,
                y1: -0.448,
                x0: -1.551,
                x1: 1.551
            },
            {
                y0: -0.448,
                y1: -0.248,
                x0: -1.622,
                x1: 1.622
            },
            {
                y0: -0.248,
                y1: -0.047,
                x0: -1.665,
                x1: 1.665
            },
            {
                y0: -0.047,
                y1: 0.153,
                x0: -1.679,
                x1: 1.679
            },
            {
                y0: 0.153,
                y1: 0.354,
                x0: -1.665,
                x1: 1.665
            },
            {
                y0: 0.354,
                y1: 0.554,
                x0: -1.622,
                x1: 1.622
            },
            {
                y0: 0.554,
                y1: 0.755,
                x0: -1.582,
                x1: 1.599
            },
            {
                y0: 0.755,
                y1: 0.955,
                x0: -1.6,
                x1: 1.512
            },
            {
                y0: 0.955,
                y1: 1.156,
                x0: -1.332,
                x1: 1.332
            },
            {
                y0: 1.156,
                y1: 1.356,
                x0: -1.187,
                x1: 1.187
            },
            {
                y0: 1.356,
                y1: 1.557,
                x0: -0.858,
                x1: 0.858
            },
            {
                y0: 1.557,
                y1: 1.757,
                x0: -0.993,
                x1: 0.993
            },
            {
                y0: 1.757,
                y1: 1.957,
                x0: -0.981,
                x1: 0.981
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    bigmouth: {
        left: [
            {
                y0: -1.82,
                y1: -1.649,
                x0: -0.79,
                x1: 0.69
            },
            {
                y0: -1.649,
                y1: -1.477,
                x0: -0.774,
                x1: 0.674
            },
            {
                y0: -1.477,
                y1: -1.306,
                x0: -0.735,
                x1: 0.617
            },
            {
                y0: -1.306,
                y1: -1.135,
                x0: -0.759,
                x1: -0.607
            },
            {
                y0: -1.135,
                y1: -0.964,
                x0: -0.74,
                x1: 0.613
            },
            {
                y0: -0.964,
                y1: -0.792,
                x0: -0.693,
                x1: 0.635
            },
            {
                y0: -0.792,
                y1: -0.621,
                x0: -0.54,
                x1: 0.743
            },
            {
                y0: -0.621,
                y1: -0.45,
                x0: -0.689,
                x1: 0.837
            },
            {
                y0: -0.45,
                y1: -0.279,
                x0: -0.804,
                x1: 0.886
            },
            {
                y0: -0.279,
                y1: -0.107,
                x0: -0.875,
                x1: 0.892
            },
            {
                y0: -0.107,
                y1: 0.064,
                x0: -0.9,
                x1: 0.9
            },
            {
                y0: 0.064,
                y1: 0.235,
                x0: -0.969,
                x1: 0.969
            },
            {
                y0: 0.235,
                y1: 0.406,
                x0: -0.955,
                x1: 0.955
            },
            {
                y0: 0.406,
                y1: 0.578,
                x0: -0.818,
                x1: 0.818
            },
            {
                y0: 0.578,
                y1: 0.749,
                x0: -0.571,
                x1: 0.571
            },
            {
                y0: 0.749,
                y1: 0.92,
                x0: -0.438,
                x1: 0.438
            }
        ],
        right: [
            {
                y0: -1.82,
                y1: -1.649,
                x0: -0.79,
                x1: 0.69
            },
            {
                y0: -1.649,
                y1: -1.477,
                x0: -0.774,
                x1: 0.674
            },
            {
                y0: -1.477,
                y1: -1.306,
                x0: -0.735,
                x1: 0.617
            },
            {
                y0: -1.306,
                y1: -1.135,
                x0: -0.759,
                x1: -0.607
            },
            {
                y0: -1.135,
                y1: -0.964,
                x0: -0.74,
                x1: 0.613
            },
            {
                y0: -0.964,
                y1: -0.792,
                x0: -0.693,
                x1: 0.635
            },
            {
                y0: -0.792,
                y1: -0.621,
                x0: -0.743,
                x1: 0.54
            },
            {
                y0: -0.621,
                y1: -0.45,
                x0: -0.837,
                x1: 0.689
            },
            {
                y0: -0.45,
                y1: -0.279,
                x0: -0.886,
                x1: 0.804
            },
            {
                y0: -0.279,
                y1: -0.107,
                x0: -0.892,
                x1: 0.875
            },
            {
                y0: -0.107,
                y1: 0.064,
                x0: -0.9,
                x1: 0.9
            },
            {
                y0: 0.064,
                y1: 0.235,
                x0: -0.969,
                x1: 0.969
            },
            {
                y0: 0.235,
                y1: 0.406,
                x0: -0.955,
                x1: 0.955
            },
            {
                y0: 0.406,
                y1: 0.578,
                x0: -0.818,
                x1: 0.818
            },
            {
                y0: 0.578,
                y1: 0.749,
                x0: -0.571,
                x1: 0.571
            },
            {
                y0: 0.749,
                y1: 0.92,
                x0: -0.438,
                x1: 0.438
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 3.04
    },
    pie: {
        left: [
            {
                y0: -2.007,
                y1: -1.757,
                x0: -0.581,
                x1: 0.581
            },
            {
                y0: -1.757,
                y1: -1.506,
                x0: -0.917,
                x1: 0.917
            },
            {
                y0: -1.506,
                y1: -1.255,
                x0: -1.061,
                x1: 1.061
            },
            {
                y0: -1.255,
                y1: -1.004,
                x0: -1.187,
                x1: 1.187
            },
            {
                y0: -1.004,
                y1: -0.753,
                x0: -1.376,
                x1: 1.376
            },
            {
                y0: -0.753,
                y1: -0.502,
                x0: -1.436,
                x1: 1.436
            },
            {
                y0: -0.502,
                y1: -0.251,
                x0: -1.473,
                x1: 1.473
            },
            {
                y0: -0.251,
                y1: 0,
                x0: -1.485,
                x1: 1.485
            },
            {
                y0: 0,
                y1: 0.251,
                x0: -1.485,
                x1: 1.485
            },
            {
                y0: 0.251,
                y1: 0.502,
                x0: -1.519,
                x1: 1.473
            },
            {
                y0: 0.502,
                y1: 0.753,
                x0: -1.547,
                x1: 1.436
            },
            {
                y0: 0.753,
                y1: 1.004,
                x0: -1.376,
                x1: 1.376
            },
            {
                y0: 1.004,
                y1: 1.255,
                x0: -1.187,
                x1: 1.187
            },
            {
                y0: 1.255,
                y1: 1.506,
                x0: -1.061,
                x1: 1.061
            },
            {
                y0: 1.506,
                y1: 1.757,
                x0: -0.917,
                x1: 0.917
            },
            {
                y0: 1.757,
                y1: 2.007,
                x0: -0.581,
                x1: 0.581
            }
        ],
        right: [
            {
                y0: -2.007,
                y1: -1.757,
                x0: -0.581,
                x1: 0.581
            },
            {
                y0: -1.757,
                y1: -1.506,
                x0: -0.917,
                x1: 0.917
            },
            {
                y0: -1.506,
                y1: -1.255,
                x0: -1.061,
                x1: 1.061
            },
            {
                y0: -1.255,
                y1: -1.004,
                x0: -1.187,
                x1: 1.187
            },
            {
                y0: -1.004,
                y1: -0.753,
                x0: -1.376,
                x1: 1.376
            },
            {
                y0: -0.753,
                y1: -0.502,
                x0: -1.436,
                x1: 1.436
            },
            {
                y0: -0.502,
                y1: -0.251,
                x0: -1.473,
                x1: 1.473
            },
            {
                y0: -0.251,
                y1: 0,
                x0: -1.485,
                x1: 1.485
            },
            {
                y0: 0,
                y1: 0.251,
                x0: -1.485,
                x1: 1.485
            },
            {
                y0: 0.251,
                y1: 0.502,
                x0: -1.519,
                x1: 1.473
            },
            {
                y0: 0.502,
                y1: 0.753,
                x0: -1.547,
                x1: 1.436
            },
            {
                y0: 0.753,
                y1: 1.004,
                x0: -1.376,
                x1: 1.376
            },
            {
                y0: 1.004,
                y1: 1.255,
                x0: -1.187,
                x1: 1.187
            },
            {
                y0: 1.255,
                y1: 1.506,
                x0: -1.061,
                x1: 1.061
            },
            {
                y0: 1.506,
                y1: 1.757,
                x0: -0.917,
                x1: 0.917
            },
            {
                y0: 1.757,
                y1: 2.007,
                x0: -0.581,
                x1: 0.581
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    screen: {
        left: [
            {
                y0: -2.846,
                y1: -2.51,
                x0: -1.437,
                x1: 1.494
            },
            {
                y0: -2.51,
                y1: -2.175,
                x0: -1.674,
                x1: 1.73
            },
            {
                y0: -2.175,
                y1: -1.839,
                x0: -1.796,
                x1: 1.853
            },
            {
                y0: -1.839,
                y1: -1.503,
                x0: -1.812,
                x1: 1.868
            },
            {
                y0: -1.503,
                y1: -1.168,
                x0: -1.858,
                x1: 1.862
            },
            {
                y0: -1.168,
                y1: -0.832,
                x0: -1.872,
                x1: 2.187
            },
            {
                y0: -0.832,
                y1: -0.496,
                x0: -1.918,
                x1: 2.386
            },
            {
                y0: -0.496,
                y1: -0.16,
                x0: -2.128,
                x1: 2.502
            },
            {
                y0: -0.16,
                y1: 0.175,
                x0: -2.17,
                x1: 2.489
            },
            {
                y0: 0.175,
                y1: 0.511,
                x0: -2.16,
                x1: 2.386
            },
            {
                y0: 0.511,
                y1: 0.847,
                x0: -2.077,
                x1: 2.055
            },
            {
                y0: 0.847,
                y1: 1.183,
                x0: -1.872,
                x1: 1.872
            },
            {
                y0: 1.183,
                y1: 1.518,
                x0: -1.858,
                x1: 1.868
            },
            {
                y0: 1.518,
                y1: 1.854,
                x0: -1.75,
                x1: 1.807
            },
            {
                y0: 1.854,
                y1: 2.19,
                x0: -1.674,
                x1: 1.73
            },
            {
                y0: 2.19,
                y1: 2.525,
                x0: -1.281,
                x1: 1.338
            }
        ],
        right: [
            {
                y0: -2.846,
                y1: -2.51,
                x0: -1.441,
                x1: 1.496
            },
            {
                y0: -2.51,
                y1: -2.175,
                x0: -1.678,
                x1: 1.733
            },
            {
                y0: -2.175,
                y1: -1.839,
                x0: -1.8,
                x1: 1.855
            },
            {
                y0: -1.839,
                y1: -1.503,
                x0: -1.816,
                x1: 1.871
            },
            {
                y0: -1.503,
                y1: -1.168,
                x0: -1.862,
                x1: 1.858
            },
            {
                y0: -1.168,
                y1: -0.832,
                x0: -2.187,
                x1: 1.872
            },
            {
                y0: -0.832,
                y1: -0.496,
                x0: -2.386,
                x1: 1.918
            },
            {
                y0: -0.496,
                y1: -0.16,
                x0: -2.502,
                x1: 2.128
            },
            {
                y0: -0.16,
                y1: 0.175,
                x0: -2.489,
                x1: 2.17
            },
            {
                y0: 0.175,
                y1: 0.511,
                x0: -2.386,
                x1: 2.16
            },
            {
                y0: 0.511,
                y1: 0.847,
                x0: -2.055,
                x1: 2.077
            },
            {
                y0: 0.847,
                y1: 1.183,
                x0: -1.872,
                x1: 1.872
            },
            {
                y0: 1.183,
                y1: 1.518,
                x0: -1.858,
                x1: 1.871
            },
            {
                y0: 1.518,
                y1: 1.854,
                x0: -1.754,
                x1: 1.809
            },
            {
                y0: 1.854,
                y1: 2.19,
                x0: -1.678,
                x1: 1.733
            },
            {
                y0: 2.19,
                y1: 2.525,
                x0: -1.285,
                x1: 1.34
            }
        ],
        plateWide: [
            {
                y0: -2.66,
                y1: -2.327,
                x0: -4.147,
                x1: 4.147
            },
            {
                y0: -2.327,
                y1: -1.995,
                x0: -4.85,
                x1: 4.85
            },
            {
                y0: -1.995,
                y1: -1.662,
                x0: -5.077,
                x1: 5.077
            },
            {
                y0: -1.662,
                y1: -1.33,
                x0: -5.023,
                x1: 5.023
            },
            {
                y0: -1.33,
                y1: -0.997,
                x0: -5.214,
                x1: 5.214
            },
            {
                y0: -0.997,
                y1: -0.665,
                x0: -5.26,
                x1: 5.26
            },
            {
                y0: 0.665,
                y1: 0.998,
                x0: -5.26,
                x1: 5.26
            },
            {
                y0: 0.998,
                y1: 1.33,
                x0: -5.214,
                x1: 5.214
            },
            {
                y0: 1.33,
                y1: 1.662,
                x0: -5.023,
                x1: 5.023
            },
            {
                y0: 1.662,
                y1: 1.995,
                x0: -5.077,
                x1: 5.077
            },
            {
                y0: 1.995,
                y1: 2.328,
                x0: -4.85,
                x1: 4.85
            },
            {
                y0: 2.328,
                y1: 2.66,
                x0: -4.147,
                x1: 4.147
            }
        ],
        plateNarrow: [
            {
                y0: -2.66,
                y1: -2.327,
                x0: -3.597,
                x1: 3.597
            },
            {
                y0: -2.327,
                y1: -1.995,
                x0: -3.936,
                x1: 3.936
            },
            {
                y0: -1.995,
                y1: -1.662,
                x0: -4.205,
                x1: 4.205
            },
            {
                y0: -1.662,
                y1: -1.33,
                x0: -4.401,
                x1: 4.401
            },
            {
                y0: -1.33,
                y1: -0.997,
                x0: -4.52,
                x1: 4.52
            },
            {
                y0: -0.997,
                y1: -0.665,
                x0: -4.56,
                x1: 4.56
            },
            {
                y0: 0.665,
                y1: 0.998,
                x0: -4.56,
                x1: 4.56
            },
            {
                y0: 0.998,
                y1: 1.33,
                x0: -4.52,
                x1: 4.52
            },
            {
                y0: 1.33,
                y1: 1.662,
                x0: -4.401,
                x1: 4.401
            },
            {
                y0: 1.662,
                y1: 1.995,
                x0: -4.205,
                x1: 4.205
            },
            {
                y0: 1.995,
                y1: 2.328,
                x0: -3.936,
                x1: 3.936
            },
            {
                y0: 2.328,
                y1: 2.66,
                x0: -3.597,
                x1: 3.597
            }
        ],
        mouth: 1.408
    },
    symbol: {
        left: [
            {
                y0: -2.941,
                y1: -2.573,
                x0: -1.276,
                x1: 1.276
            },
            {
                y0: -2.573,
                y1: -2.206,
                x0: -1.833,
                x1: 1.833
            },
            {
                y0: -2.206,
                y1: -1.838,
                x0: -1.659,
                x1: 1.659
            },
            {
                y0: -1.838,
                y1: -1.47,
                x0: -2.299,
                x1: 2.299
            },
            {
                y0: -1.47,
                y1: -1.103,
                x0: -3.032,
                x1: 2.649
            },
            {
                y0: -1.103,
                y1: -0.735,
                x0: -3.19,
                x1: 2.144
            },
            {
                y0: -0.735,
                y1: -0.368,
                x0: -3.307,
                x1: 2.867
            },
            {
                y0: -0.368,
                y1: 0,
                x0: -3.378,
                x1: 1.734
            },
            {
                y0: 0,
                y1: 0.368,
                x0: -3.402,
                x1: 2.941
            },
            {
                y0: 0.368,
                y1: 0.735,
                x0: -3.307,
                x1: 2.867
            },
            {
                y0: 0.735,
                y1: 1.103,
                x0: -3.19,
                x1: 2.144
            },
            {
                y0: 1.103,
                y1: 1.47,
                x0: -3.032,
                x1: 2.649
            },
            {
                y0: 1.47,
                y1: 1.838,
                x0: -2.299,
                x1: 2.299
            },
            {
                y0: 1.838,
                y1: 2.206,
                x0: -1.659,
                x1: 1.738
            },
            {
                y0: 2.206,
                y1: 2.573,
                x0: -1.833,
                x1: 1.833
            },
            {
                y0: 2.573,
                y1: 2.941,
                x0: -1.276,
                x1: 1.276
            }
        ],
        right: [
            {
                y0: -2.941,
                y1: -2.573,
                x0: -1.865,
                x1: 1.276
            },
            {
                y0: -2.573,
                y1: -2.206,
                x0: -2.26,
                x1: 1.833
            },
            {
                y0: -2.206,
                y1: -1.838,
                x0: -2.299,
                x1: 1.659
            },
            {
                y0: -1.838,
                y1: -1.47,
                x0: -2.299,
                x1: 2.299
            },
            {
                y0: -1.47,
                y1: -1.103,
                x0: -3.032,
                x1: 2.649
            },
            {
                y0: -1.103,
                y1: -0.735,
                x0: -3.19,
                x1: 2.144
            },
            {
                y0: -0.735,
                y1: -0.368,
                x0: -3.307,
                x1: 2.867
            },
            {
                y0: -0.368,
                y1: 0,
                x0: -3.378,
                x1: 1.834
            },
            {
                y0: 0,
                y1: 0.368,
                x0: -3.402,
                x1: 2.941
            },
            {
                y0: 0.368,
                y1: 0.735,
                x0: -3.307,
                x1: 2.867
            },
            {
                y0: 0.735,
                y1: 1.103,
                x0: -3.19,
                x1: 2.144
            },
            {
                y0: 1.103,
                y1: 1.47,
                x0: -3.032,
                x1: 2.649
            },
            {
                y0: 1.47,
                y1: 1.838,
                x0: -2.299,
                x1: 2.299
            },
            {
                y0: 1.838,
                y1: 2.206,
                x0: -1.738,
                x1: 1.659
            },
            {
                y0: 2.206,
                y1: 2.573,
                x0: -1.833,
                x1: 1.833
            },
            {
                y0: 2.573,
                y1: 2.941,
                x0: -1.276,
                x1: 1.276
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.6
    },
    teardrop: {
        left: [
            {
                y0: -2.357,
                y1: -2.063,
                x0: -0.77,
                x1: 0.885
            },
            {
                y0: -2.063,
                y1: -1.768,
                x0: -1.118,
                x1: 1.187
            },
            {
                y0: -1.768,
                y1: -1.473,
                x0: -1.423,
                x1: 1.452
            },
            {
                y0: -1.473,
                y1: -1.179,
                x0: -1.673,
                x1: 1.673
            },
            {
                y0: -1.179,
                y1: -0.884,
                x0: -1.859,
                x1: 1.859
            },
            {
                y0: -0.884,
                y1: -0.589,
                x0: -1.842,
                x1: 1.931
            },
            {
                y0: -0.589,
                y1: -0.295,
                x0: -1.974,
                x1: 1.974
            },
            {
                y0: -0.295,
                y1: 0,
                x0: -2.012,
                x1: 1.965
            },
            {
                y0: 0,
                y1: 0.295,
                x0: -1.824,
                x1: 2.012
            },
            {
                y0: 0.295,
                y1: 0.589,
                x0: -1.905,
                x1: 1.905
            },
            {
                y0: 0.589,
                y1: 0.884,
                x0: -1.8,
                x1: 1.8
            },
            {
                y0: 0.884,
                y1: 1.179,
                x0: -1.731,
                x1: 1.731
            },
            {
                y0: 1.179,
                y1: 1.473,
                x0: -1.506,
                x1: 1.506
            },
            {
                y0: 1.473,
                y1: 1.768,
                x0: -1.242,
                x1: 1.242
            },
            {
                y0: 1.768,
                y1: 2.063,
                x0: -0.951,
                x1: 0.951
            },
            {
                y0: 2.063,
                y1: 2.357,
                x0: -0.642,
                x1: 0.642
            }
        ],
        right: [
            {
                y0: -2.357,
                y1: -2.063,
                x0: -0.885,
                x1: 0.77
            },
            {
                y0: -2.063,
                y1: -1.768,
                x0: -1.187,
                x1: 1.118
            },
            {
                y0: -1.768,
                y1: -1.473,
                x0: -1.452,
                x1: 1.423
            },
            {
                y0: -1.473,
                y1: -1.179,
                x0: -1.673,
                x1: 1.673
            },
            {
                y0: -1.179,
                y1: -0.884,
                x0: -1.859,
                x1: 1.859
            },
            {
                y0: -0.884,
                y1: -0.589,
                x0: -1.931,
                x1: 1.842
            },
            {
                y0: -0.589,
                y1: -0.295,
                x0: -1.974,
                x1: 1.974
            },
            {
                y0: -0.295,
                y1: 0,
                x0: -2.012,
                x1: 1.818
            },
            {
                y0: 0,
                y1: 0.295,
                x0: -1.871,
                x1: 2.012
            },
            {
                y0: 0.295,
                y1: 0.589,
                x0: -1.905,
                x1: 1.905
            },
            {
                y0: 0.589,
                y1: 0.884,
                x0: -1.8,
                x1: 1.8
            },
            {
                y0: 0.884,
                y1: 1.179,
                x0: -1.731,
                x1: 1.731
            },
            {
                y0: 1.179,
                y1: 1.473,
                x0: -1.506,
                x1: 1.506
            },
            {
                y0: 1.473,
                y1: 1.768,
                x0: -1.242,
                x1: 1.242
            },
            {
                y0: 1.768,
                y1: 2.063,
                x0: -0.951,
                x1: 0.951
            },
            {
                y0: 2.063,
                y1: 2.357,
                x0: -0.642,
                x1: 0.642
            }
        ],
        plateWide: [],
        plateNarrow: [],
        mouth: 1.44
    },
    specs: {
        left: [
            {
                y0: -2.29,
                y1: -1.994,
                x0: -0.876,
                x1: 0.876
            },
            {
                y0: -1.994,
                y1: -1.699,
                x0: -1.272,
                x1: 1.272
            },
            {
                y0: -1.699,
                y1: -1.403,
                x0: -1.619,
                x1: 1.619
            },
            {
                y0: -1.403,
                y1: -1.108,
                x0: -1.904,
                x1: 1.904
            },
            {
                y0: -1.108,
                y1: -0.812,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: -0.812,
                y1: -0.516,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: -0.516,
                y1: -0.221,
                x0: -2.246,
                x1: 2.246
            },
            {
                y0: -0.221,
                y1: 0.075,
                x0: -2.29,
                x1: 2.29
            },
            {
                y0: 0.075,
                y1: 0.371,
                x0: -2.29,
                x1: 2.29
            },
            {
                y0: 0.371,
                y1: 0.666,
                x0: -2.246,
                x1: 2.246
            },
            {
                y0: 0.666,
                y1: 0.962,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: 0.962,
                y1: 1.257,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: 1.257,
                y1: 1.553,
                x0: -1.904,
                x1: 1.904
            },
            {
                y0: 1.553,
                y1: 1.849,
                x0: -1.619,
                x1: 1.619
            },
            {
                y0: 1.849,
                y1: 2.144,
                x0: -1.272,
                x1: 1.272
            },
            {
                y0: 2.144,
                y1: 2.44,
                x0: -0.876,
                x1: 0.876
            }
        ],
        right: [
            {
                y0: -2.29,
                y1: -1.994,
                x0: -0.876,
                x1: 0.876
            },
            {
                y0: -1.994,
                y1: -1.699,
                x0: -1.272,
                x1: 1.272
            },
            {
                y0: -1.699,
                y1: -1.403,
                x0: -1.619,
                x1: 1.619
            },
            {
                y0: -1.403,
                y1: -1.108,
                x0: -1.904,
                x1: 1.904
            },
            {
                y0: -1.108,
                y1: -0.812,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: -0.812,
                y1: -0.516,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: -0.516,
                y1: -0.221,
                x0: -2.246,
                x1: 2.246
            },
            {
                y0: -0.221,
                y1: 0.075,
                x0: -2.29,
                x1: 2.29
            },
            {
                y0: 0.075,
                y1: 0.371,
                x0: -2.29,
                x1: 2.29
            },
            {
                y0: 0.371,
                y1: 0.666,
                x0: -2.246,
                x1: 2.246
            },
            {
                y0: 0.666,
                y1: 0.962,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: 0.962,
                y1: 1.257,
                x0: -2.116,
                x1: 2.116
            },
            {
                y0: 1.257,
                y1: 1.553,
                x0: -1.904,
                x1: 1.904
            },
            {
                y0: 1.553,
                y1: 1.849,
                x0: -1.619,
                x1: 1.619
            },
            {
                y0: 1.849,
                y1: 2.144,
                x0: -1.272,
                x1: 1.272
            },
            {
                y0: 2.144,
                y1: 2.44,
                x0: -0.876,
                x1: 0.876
            }
        ],
        plateWide: [
            {
                y0: -0.84,
                y1: -0.791,
                x0: -0.363,
                x1: 0.363
            },
            {
                y0: -0.791,
                y1: -0.743,
                x0: -0.482,
                x1: 0.482
            },
            {
                y0: -0.743,
                y1: -0.694,
                x0: -0.6,
                x1: 0.6
            },
            {
                y0: -0.694,
                y1: -0.645,
                x0: -0.71,
                x1: 0.71
            },
            {
                y0: -0.645,
                y1: -0.597,
                x0: -0.71,
                x1: 0.71
            },
            {
                y0: -0.597,
                y1: -0.548,
                x0: -0.806,
                x1: 0.806
            },
            {
                y0: -0.548,
                y1: -0.499,
                x0: -0.806,
                x1: 0.806
            },
            {
                y0: -0.499,
                y1: -0.451,
                x0: -0.85,
                x1: 0.85
            },
            {
                y0: -0.451,
                y1: -0.402,
                x0: -0.85,
                x1: 0.85
            },
            {
                y0: -0.402,
                y1: -0.353,
                x0: -0.85,
                x1: 0.85
            },
            {
                y0: -0.353,
                y1: -0.305,
                x0: -0.85,
                x1: 0.85
            },
            {
                y0: -0.305,
                y1: -0.256,
                x0: -0.83,
                x1: 0.83
            },
            {
                y0: -0.256,
                y1: -0.207,
                x0: -0.752,
                x1: 0.752
            },
            {
                y0: -0.207,
                y1: -0.159,
                x0: -0.83,
                x1: 0.83
            },
            {
                y0: -0.159,
                y1: -0.11,
                x0: -0.636,
                x1: 0.636
            },
            {
                y0: -0.11,
                y1: -0.061,
                x0: -0.752,
                x1: 0.752
            }
        ],
        plateNarrow: [
            {
                y0: -0.84,
                y1: -0.792,
                x0: -0.173,
                x1: 0.173
            },
            {
                y0: -0.792,
                y1: -0.743,
                x0: -0.25,
                x1: 0.25
            },
            {
                y0: -0.743,
                y1: -0.695,
                x0: -0.32,
                x1: 0.32
            },
            {
                y0: -0.695,
                y1: -0.647,
                x0: -0.384,
                x1: 0.384
            },
            {
                y0: -0.647,
                y1: -0.598,
                x0: -0.435,
                x1: 0.435
            },
            {
                y0: -0.598,
                y1: -0.55,
                x0: -0.435,
                x1: 0.435
            },
            {
                y0: -0.55,
                y1: -0.502,
                x0: -0.495,
                x1: 0.495
            },
            {
                y0: -0.502,
                y1: -0.453,
                x0: -0.495,
                x1: 0.495
            },
            {
                y0: -0.453,
                y1: -0.405,
                x0: -0.495,
                x1: 0.495
            },
            {
                y0: -0.405,
                y1: -0.357,
                x0: -0.492,
                x1: 0.492
            },
            {
                y0: -0.357,
                y1: -0.308,
                x0: -0.495,
                x1: 0.495
            },
            {
                y0: -0.308,
                y1: -0.26,
                x0: -0.492,
                x1: 0.492
            },
            {
                y0: -0.26,
                y1: -0.212,
                x0: -0.492,
                x1: 0.492
            },
            {
                y0: -0.212,
                y1: -0.163,
                x0: -0.427,
                x1: 0.427
            },
            {
                y0: -0.163,
                y1: -0.115,
                x0: -0.427,
                x1: 0.427
            },
            {
                y0: -0.115,
                y1: -0.067,
                x0: -0.318,
                x1: 0.318
            }
        ],
        mouth: 1.44
    }
};
const DRAWN_FITS = {
    circle: {
        digest: '1bpiu5f',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.8,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    mochi: {
        digest: '17pd6uf',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    blob: {
        digest: 'z3wukc',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    pebble: {
        digest: '1nanfxp',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    egg: {
        digest: 'hlxfdd',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.2,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bun: {
        digest: 'y2brvf',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.2,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    tofu: {
        digest: 'mz8qq7',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    pill: {
        digest: 'djktgz',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    hex: {
        digest: 'uh2yjn',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1.4,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    onigiri: {
        digest: 'wgj79k',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.8,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    gem: {
        digest: '1ftznnv',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    cloud: {
        digest: '1pv7tb2',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    drop: {
        digest: '1raxtm9',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.6,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    leaf: {
        digest: '2zo3kn',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    flower: {
        digest: '16j6o03',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                2.4,
                0.875
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0.6,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                1.2,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0.8,
                1
            ],
            symbol: [
                1,
                0.8,
                0.9408
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    clover: {
        digest: '16wt16r',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    sprout: {
        digest: 'l0fjvg',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    mushroom: {
        digest: 'we717p',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.4,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    acorn: {
        digest: '188ewo7',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    cactus: {
        digest: '1caoq4x',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    eggplant: {
        digest: 'gbhbkv',
        fits: {
            capsule: [
                1,
                0.4,
                1
            ],
            brow: [
                1,
                1.4,
                1
            ],
            glossy: [
                1,
                1.4,
                1
            ],
            sparkle: [
                1,
                1.4,
                1
            ],
            button: [
                1,
                0.8,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0.2,
                1
            ],
            pie: [
                1,
                0.2,
                1
            ],
            screen: [
                1,
                0.4,
                1
            ],
            symbol: [
                1,
                0.4,
                1
            ],
            teardrop: [
                1,
                0.2,
                1
            ],
            specs: [
                1,
                0.2,
                1
            ]
        }
    },
    pear: {
        digest: '19myea6',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.4,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    apple: {
        digest: '1ihos23',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    strawberry: {
        digest: 't3hke4',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.4,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0.2,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    cherry: {
        digest: '5ervji',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    avocado: {
        digest: 'ea0ei2',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    melon: {
        digest: 'jrhfqm',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.6,
                1
            ],
            glossy: [
                1,
                0.2,
                1
            ],
            sparkle: [
                1,
                0.4,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    pudding: {
        digest: '1pzfe7p',
        fits: {
            capsule: [
                1,
                0.2,
                1
            ],
            brow: [
                1,
                1.2,
                1
            ],
            glossy: [
                1,
                1,
                1
            ],
            sparkle: [
                1,
                1,
                1
            ],
            button: [
                1,
                0.6,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    toast: {
        digest: '5vuuag',
        fits: {
            capsule: [
                1,
                2.4,
                0.9509
            ],
            brow: [
                0.7105,
                0,
                0.8621
            ],
            glossy: [
                0.7825,
                2.4,
                0.8966
            ],
            sparkle: [
                0.8158,
                0,
                0.7544
            ],
            button: [
                0.8706,
                2.4,
                0.7719
            ],
            shades: [
                0.6208,
                2.4,
                0.9434
            ],
            droopy: [
                1,
                2.4,
                0.7817
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                2.4,
                0.9357
            ],
            screen: [
                0.797,
                2.4,
                0.7407
            ],
            symbol: [
                0.7057,
                2.4,
                0.6667
            ],
            teardrop: [
                0.92,
                2.4,
                0.7818
            ],
            specs: [
                0.8437,
                2.4,
                0.8654
            ]
        }
    },
    icecream: {
        digest: 'ef9idt',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    cupcake: {
        digest: '1lc728q',
        fits: {
            capsule: [
                1,
                0.4,
                1
            ],
            brow: [
                1,
                2.2,
                1
            ],
            glossy: [
                1,
                1.8,
                1
            ],
            sparkle: [
                1,
                2,
                1
            ],
            button: [
                1,
                1.2,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0.6,
                1
            ],
            symbol: [
                1,
                0.6,
                1
            ],
            teardrop: [
                1,
                0.2,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    fries: {
        digest: '1mew2xs',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    candy: {
        digest: '10n2tzh',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.4,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    burger: {
        digest: '12ekwt7',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1.2,
                1
            ],
            glossy: [
                1,
                0.8,
                1
            ],
            sparkle: [
                1,
                1,
                1
            ],
            button: [
                1,
                0.2,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    star: {
        digest: '10xwudt',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1,
                1
            ],
            glossy: [
                1,
                0.6,
                1
            ],
            sparkle: [
                1,
                0.8,
                1
            ],
            button: [
                1,
                0.2,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    heart: {
        digest: '1pl361a',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    flame: {
        digest: '150x9e1',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.8,
                1
            ],
            glossy: [
                1,
                0.6,
                1
            ],
            sparkle: [
                1,
                0.8,
                1
            ],
            button: [
                1,
                0.2,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bell: {
        digest: '1fkymrg',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    ghost: {
        digest: '98odfn',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bot: {
        digest: 'fsla9a',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    crescent: {
        digest: '1rkrutu',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                0.9893,
                2.4,
                0.8621
            ],
            glossy: [
                1,
                1.8,
                1
            ],
            sparkle: [
                1,
                2.2,
                1
            ],
            button: [
                1,
                1.6,
                1
            ],
            shades: [
                1,
                1.2,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                1.6,
                1
            ],
            symbol: [
                1,
                1.6,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    boba: {
        digest: 'r3fijz',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    planet: {
        digest: '1x7msll',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1.2,
                1
            ],
            glossy: [
                1,
                0.4,
                1
            ],
            sparkle: [
                1,
                0.6,
                1
            ],
            button: [
                1,
                0.2,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    cottage: {
        digest: '6c7p5a',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.6,
                1
            ],
            glossy: [
                1,
                0.4,
                1
            ],
            sparkle: [
                1,
                0.4,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    chat: {
        digest: 'un1xf0',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    gift: {
        digest: 'bjtbfx',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.2,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bulb: {
        digest: 'srwqda',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    fish: {
        digest: 'yhml5i',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    octopus: {
        digest: 'beqbni',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    seal: {
        digest: '5qrtfv',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0.4,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    puffer: {
        digest: '1m6k2s6',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                2.4,
                0.9677
            ],
            glossy: [
                1,
                0.8,
                1
            ],
            sparkle: [
                1,
                1,
                1
            ],
            button: [
                1,
                0.2,
                1
            ],
            shades: [
                1,
                1.8,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0.8,
                1
            ],
            symbol: [
                1,
                1.2,
                0.8337
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    cat: {
        digest: '15cqhjv',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1.2,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bunny: {
        digest: 'ysjwb',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bear: {
        digest: '1gxjk6v',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    chick: {
        digest: 'ua8rqt',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    penguin: {
        digest: 'sbahmh',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    pig: {
        digest: '10upxb4',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    fox: {
        digest: '5hnxxd',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    lion: {
        digest: '1dipu8t',
        fits: {
            capsule: [
                1,
                2.4,
                0.7672
            ],
            brow: [
                0.6047,
                2.4,
                0.8621
            ],
            glossy: [
                0.703,
                2.4,
                0.8966
            ],
            sparkle: [
                0.7196,
                2.4,
                0.7544
            ],
            button: [
                0.7631,
                2,
                0.7719
            ],
            shades: [
                0.5531,
                2.4,
                0.9434
            ],
            droopy: [
                0.9979,
                2.4,
                0.6429
            ],
            bigmouth: [
                1,
                2,
                0.9632
            ],
            pie: [
                1,
                2.4,
                0.7799
            ],
            screen: [
                0.7089,
                2.4,
                0.7407
            ],
            symbol: [
                0.6348,
                2.4,
                0.6667
            ],
            teardrop: [
                0.8271,
                2.4,
                0.7818
            ],
            specs: [
                0.7594,
                2.4,
                0.8654
            ]
        }
    },
    hamster: {
        digest: 'dqqjw5',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    hedgehog: {
        digest: '1hvxbyd',
        fits: {
            capsule: [
                1,
                0.4,
                1
            ],
            brow: [
                0.8469,
                2.4,
                0.8621
            ],
            glossy: [
                1,
                2.4,
                0.9488
            ],
            sparkle: [
                1,
                2.4,
                0.8592
            ],
            button: [
                1,
                2.4,
                0.8599
            ],
            shades: [
                0.8679,
                2.4,
                0.9434
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0.4,
                1
            ],
            pie: [
                1,
                0.2,
                1
            ],
            screen: [
                1,
                2.4,
                0.9319
            ],
            symbol: [
                1,
                2.4,
                0.6699
            ],
            teardrop: [
                1,
                1,
                1
            ],
            specs: [
                1,
                1,
                1
            ]
        }
    },
    koala: {
        digest: 'khnwci',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                0,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    bat: {
        digest: '1bjd6tc',
        fits: {
            capsule: [
                1,
                0.6,
                1
            ],
            brow: [
                0.7755,
                2.4,
                0.8621
            ],
            glossy: [
                0.9307,
                2.4,
                0.8966
            ],
            sparkle: [
                0.9205,
                2.4,
                0.7544
            ],
            button: [
                0.9785,
                2.2,
                0.7719
            ],
            shades: [
                0.747,
                2.4,
                0.9434
            ],
            droopy: [
                1,
                1.2,
                1
            ],
            bigmouth: [
                1,
                0.4,
                1
            ],
            pie: [
                1,
                0.6,
                1
            ],
            screen: [
                0.9576,
                2.4,
                0.7407
            ],
            symbol: [
                0.8448,
                2.4,
                0.6667
            ],
            teardrop: [
                1,
                2.4,
                0.9325
            ],
            specs: [
                1,
                2.4,
                0.8772
            ]
        }
    },
    bob: {
        digest: '1cf6od8',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                2.4,
                1
            ],
            glossy: [
                1,
                1,
                1
            ],
            sparkle: [
                1,
                1.2,
                1
            ],
            button: [
                1,
                0.8,
                1
            ],
            shades: [
                0.9216,
                2.4,
                0.9434
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0.8,
                1
            ],
            symbol: [
                1,
                1.8,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    topknot: {
        digest: 'lse1pz',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                2,
                1
            ],
            glossy: [
                1,
                1.2,
                1
            ],
            sparkle: [
                1,
                1.4,
                1
            ],
            button: [
                1,
                1,
                1
            ],
            shades: [
                1,
                0.2,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0.4,
                1
            ],
            symbol: [
                1,
                0.4,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    spiky: {
        digest: 'g5fk5k',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                2,
                1
            ],
            glossy: [
                1,
                1,
                1
            ],
            sparkle: [
                1,
                1.2,
                1
            ],
            button: [
                1,
                1,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0.2,
                1
            ],
            symbol: [
                1,
                0.2,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    curly: {
        digest: '1a5ar4j',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1.4,
                1
            ],
            glossy: [
                1,
                0.4,
                1
            ],
            sparkle: [
                1,
                0.6,
                1
            ],
            button: [
                1,
                0.4,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    twinbuns: {
        digest: '1yupk2k',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                0.8775,
                2.4,
                0.8621
            ],
            glossy: [
                1,
                2.4,
                1
            ],
            sparkle: [
                1,
                2.4,
                1
            ],
            button: [
                1,
                2.4,
                0.8955
            ],
            shades: [
                1,
                1.6,
                1
            ],
            droopy: [
                1,
                0.2,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0.2,
                1
            ],
            screen: [
                1,
                1.6,
                1
            ],
            symbol: [
                1,
                1.4,
                1
            ],
            teardrop: [
                1,
                1.2,
                1
            ],
            specs: [
                1,
                1,
                1
            ]
        }
    },
    chunk: {
        digest: 'sau140',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    lump: {
        digest: '17n0nwt',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                1.2,
                1
            ],
            glossy: [
                1,
                0,
                1
            ],
            sparkle: [
                1,
                0,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                0,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0,
                1
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    },
    fluff: {
        digest: '5gjgip',
        fits: {
            capsule: [
                1,
                0,
                1
            ],
            brow: [
                1,
                2.2,
                1
            ],
            glossy: [
                1,
                0.2,
                1
            ],
            sparkle: [
                1,
                0.6,
                1
            ],
            button: [
                1,
                0,
                1
            ],
            shades: [
                1,
                1.4,
                1
            ],
            droopy: [
                1,
                0,
                1
            ],
            bigmouth: [
                1,
                0,
                1
            ],
            pie: [
                1,
                0,
                1
            ],
            screen: [
                1,
                0,
                1
            ],
            symbol: [
                1,
                0.8,
                0.9391
            ],
            teardrop: [
                1,
                0,
                1
            ],
            specs: [
                1,
                0,
                1
            ]
        }
    }
};
function blendLayout(cute, entries, fits) {
    const out = {
        ...cute,
        blush: {
            ...cute.blush
        }
    };
    entries.forEach(({ design, weight }, i)=>{
        const l = design.layout;
        const { scale, drop, squeeze } = fits[i] ?? UNFITTED;
        out.mouthDrop += (l.mouthDrop * scale + drop - cute.mouthDrop) * weight;
        out.mouthScale += (l.mouthScale * scale - cute.mouthScale) * weight;
        out.mouthWeight += (l.mouthWeight * scale - cute.mouthWeight) * weight;
        out.blush.x += (l.blush.x * scale * squeeze - cute.blush.x) * weight;
        out.blush.y += (l.blush.y * scale + drop - cute.blush.y) * weight;
    });
    return out;
}
function scaleMouth(m, k) {
    if (1 === k) return m;
    return {
        ...m,
        width: m.width * k,
        bend: m.bend * k,
        open: m.open * k,
        wave: m.wave * k,
        dy: m.dy * k,
        ...null != m.cat ? {
            cat: m.cat * k
        } : null
    };
}
function carry(layers, cx, cy, r, nose) {
    return layers.map((layer)=>({
            ...layer,
            rings: layer.rings.map((ring)=>ring.map(([x, y])=>[
                        cx + x * r * nose,
                        cy + y * r
                    ]))
        }));
}
const UNFITTED = {
    scale: 1,
    drop: 0,
    squeeze: 1
};
const FIT = {
    minScale: 0.45,
    maxDrop: 2.4,
    drops: 12,
    steps: 10
};
const FIT_MARGIN = 0.05;
const CEILING_COLUMNS = 64;
const THEME_FITS = new Map();
function registerFits(rows) {
    for (const [id, row] of Object.entries(rows))THEME_FITS.set(id, row);
}
const capsHead = (part, shape)=>{
    if ('hair' !== part.tone && 'leaf' !== part.tone && true !== part.prop) return false;
    const mean = part.outline.reduce((sum, [, y])=>sum + y, 0) / Math.max(1, part.outline.length);
    return mean < shape.face.y;
};
function capAt(ring, x, face) {
    const crossings = [];
    for(let i = 0; i < ring.length; i++){
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[(i + 1) % ring.length];
        if (x0 <= x !== x1 <= x) crossings.push(y0 + (y1 - y0) * (x - x0) / (x1 - x0));
    }
    crossings.sort((a, b)=>a - b);
    let low = -1 / 0;
    for(let i = 0; i + 1 < crossings.length; i += 2)if (crossings[i] <= face) low = Math.max(low, crossings[i + 1]);
    return low;
}
const ceilings = new WeakMap();
function ceilingOf(shape) {
    let ceiling = ceilings.get(shape);
    if (ceiling) return ceiling;
    const caps = shape.parts.filter((part)=>capsHead(part, shape)).map((part)=>part.outline);
    if (0 === caps.length) ceiling = ()=>shape.top;
    else {
        const xs = shape.outline.map(([x])=>x);
        const x0 = Math.min(...xs);
        const step = (Math.max(...xs) - x0) / CEILING_COLUMNS;
        const table = Array.from({
            length: CEILING_COLUMNS + 1
        }, (_, i)=>Math.max(shape.top, ...caps.map((ring)=>capAt(ring, x0 + step * i, shape.face.y))));
        ceiling = (x)=>{
            const i = Math.min(CEILING_COLUMNS, Math.max(0, (x - x0) / step));
            return Math.max(table[Math.floor(i)], table[Math.ceil(i)]);
        };
    }
    ceilings.set(shape, ceiling);
    return ceiling;
}
function computeFit(shape, design, extent, rest) {
    const l = design.layout;
    const least = Math.min(1, l.minSeparation / l.separation);
    const ceiling = ceilingOf(shape);
    const mouth = [
        {
            y0: l.mouthDrop + l.lift,
            y1: l.mouthDrop + l.lift,
            x0: -extent.mouth,
            x1: extent.mouth
        }
    ];
    const test = (fit)=>{
        const rk = rest.r * fit.scale;
        const m = FIT_MARGIN * rk;
        const cy = rest.centreY + (fit.drop - l.lift * fit.scale) * rest.r;
        const half = l.separation / 2 * fit.squeeze;
        const midline = rest.project(rest.midX, cy).transform.x;
        const prints = [
            [
                extent.left,
                -1
            ],
            [
                extent.right,
                1
            ],
            [
                plateExtent(extent, fit.squeeze, least),
                0
            ],
            [
                mouth,
                0
            ]
        ];
        const points = [];
        for (const [print, side] of prints){
            const x = rest.midX + side * half * rk;
            const nose = 1 === side ? -1 : 1;
            const t = rest.project(x, cy).transform;
            const [m0, m1, m2, m3] = t.matrix;
            const carried = (px, py)=>[
                    t.x + m0 * (px - t.pivotX) + m2 * (py - t.pivotY),
                    t.y + m1 * (px - t.pivotX) + m3 * (py - t.pivotY)
                ];
            for (const band of print){
                const a = x + (1 === nose ? band.x0 : -band.x1) * rk;
                const b = x + (1 === nose ? band.x1 : -band.x0) * rk;
                for (const by of [
                    cy + band.y0 * rk,
                    cy + band.y1 * rk
                ])points.push(carried(a, by), carried(b, by), carried((a + b) / 2, by));
            }
        }
        let lower = -1 / 0;
        let upper = 1 / 0;
        for (const [px, py] of points){
            if (py > shape.bottom - m) return false;
            const [lo, hi] = stretchAt(shape, py, midline);
            lower = Math.max(lower, lo + m - px);
            upper = Math.min(upper, hi - m - px);
        }
        if (lower > upper) return false;
        const dx = Math.min(Math.max(0, lower), upper);
        return points.every(([px, py])=>py >= ceiling(px + dx) + m);
    };
    const drops = Array.from({
        length: FIT.drops + 1
    }, (_, i)=>FIT.maxDrop * i / FIT.drops);
    const most = (fitAt, from, to)=>{
        let best = null;
        let bestValue = to;
        for (const drop of drops){
            if (!test(fitAt(to, drop))) continue;
            let lo = to;
            let hi = from;
            for(let i = 0; i < FIT.steps; i++){
                const mid = (lo + hi) / 2;
                if (test(fitAt(mid, drop))) lo = mid;
                else hi = mid;
            }
            if (!best || lo > bestValue + 1e-3) {
                best = fitAt(lo, drop);
                bestValue = lo;
            }
        }
        return best;
    };
    const fit = drops.map((drop)=>({
            ...UNFITTED,
            drop
        })).find(test) ?? most((squeeze, drop)=>({
            scale: 1,
            drop,
            squeeze
        }), 1, least) ?? most((scale, drop)=>({
            scale,
            drop,
            squeeze: least
        }), 1, FIT.minScale) ?? {
        scale: FIT.minScale,
        drop: 0,
        squeeze: least
    };
    return {
        scale: roundFit(fit.scale),
        drop: roundFit(fit.drop),
        squeeze: roundFit(fit.squeeze)
    };
}
const FIT_DECIMALS = 4;
const roundFit = (v)=>Math.round(v * 10 ** FIT_DECIMALS) / 10 ** FIT_DECIMALS;
function shapeDigest(shape) {
    let h = 0x811c9dc5;
    const mix = (v)=>{
        h = Math.imul(h ^ Math.round(100 * v), 0x01000193) >>> 0;
    };
    const mixPoints = (points)=>{
        for (const [x, y] of points){
            mix(x);
            mix(y);
        }
    };
    mixPoints(shape.outline);
    for (const part of shape.parts)mixPoints(part.outline);
    mix(shape.parts.length);
    return h.toString(36);
}
const digests = new WeakMap();
const digestOf = (shape)=>{
    let digest = digests.get(shape);
    if (void 0 === digest) digests.set(shape, digest = shapeDigest(shape));
    return digest;
};
const measured = new WeakMap();
function extentOf(design) {
    const stored = DRAWN_EXTENTS[design.id];
    if (stored) return stored;
    let profile = measured.get(design);
    if (!profile) measured.set(design, profile = measureExtent(design));
    return profile;
}
const place_fits = new WeakMap();
function fitFor(shape, design, rest) {
    let byFace = place_fits.get(shape);
    if (!byFace) place_fits.set(shape, byFace = new Map());
    const known = byFace.get(design.id);
    if (known) return known;
    const stored = DRAWN_FITS[shape.id] ?? THEME_FITS.get(shape.id);
    const row = stored && stored.digest === digestOf(shape) ? stored.fits[design.id] : void 0;
    const fit = row ? {
        scale: row[0],
        drop: row[1],
        squeeze: row[2]
    } : computeFit(shape, design, extentOf(design), rest);
    const result = 1 === fit.scale && 0 === fit.drop && 1 === fit.squeeze ? UNFITTED : fit;
    byFace.set(design.id, result);
    return result;
}
function placeDrawn(input, at) {
    return input.entries.map(({ design, eyes, weight })=>{
        const l = design.layout;
        const { r } = at;
        const fit = fitFor(at.shape, design, at.rest);
        const rk = r * fit.scale;
        const half = l.separation / 2 * fit.squeeze;
        const shiftX = at.gazeX * l.gazeShift;
        const shiftY = at.gazeY * l.gazeShift;
        const look = (nose)=>[
                (at.gazeX - shiftX) / rk * nose,
                (at.gazeY - shiftY) / rk
            ];
        const context = (nose)=>({
                nose,
                order: 1 === nose ? 0 : 1,
                time: input.time,
                settled: input.settled,
                blink: at.blink,
                look: look(nose),
                weight: input.weight,
                mid: half
            });
        const y = at.centreY + (fit.drop - l.lift * fit.scale) * r + shiftY;
        const lx = at.midX - half * rk + shiftX;
        const rx = at.midX + half * rk + shiftX;
        const geometry = {
            style: design.id,
            opacity: weight,
            left: {
                layers: carry(design.eye(eyes[0], context(1)), lx, y, rk, 1),
                ...at.project(lx, y)
            },
            right: {
                layers: carry(design.eye(eyes[1], context(-1)), rx, y, rk, -1),
                ...at.project(rx, y)
            },
            fit
        };
        if (design.plate) {
            const mx = (lx + rx) / 2;
            geometry.plate = {
                layers: carry(design.plate(eyes[0], eyes[1], context(1)), mx, y, rk, 1),
                ...at.project(mx, y)
            };
        }
        return geometry;
    });
}
function placeInMouth(geometry, entries, mouth, stroke, r, mx, my) {
    entries.forEach(({ design }, i)=>{
        if (!design.inMouth) return;
        geometry[i].inMouth = carry(design.inMouth({
            mouth,
            stroke: stroke / r
        }), mx, my, r, 1);
    });
}
function fnv1a32(input) {
    let h = 0x811c9dc5;
    for(let i = 0; i < input.length; i++){
        h ^= input.charCodeAt(i);
        h = h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
    }
    return h >>> 0;
}
function mulberry32(seed) {
    let a = seed >>> 0;
    return ()=>{
        a = a + 0x6d2b79f5 >>> 0;
        let t = a;
        t = Math.imul(t ^ t >>> 15, 1 | t);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function finalize(h) {
    let x = h >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return x >>> 0;
}
function autoColorForKey(key) {
    const r = mulberry32(fnv1a32(key))();
    return ASSIGNABLE_COLOR_IDS[Math.floor(r * ASSIGNABLE_COLOR_IDS.length)];
}
function autoShapeForKey(key) {
    return AUTO_SHAPE_POOL[finalize(fnv1a32(key)) % AUTO_SHAPE_POOL.length];
}
function autoNoseForKey(key) {
    return NOSE_IDS[finalize(fnv1a32(`nose:${key}`)) % NOSE_IDS.length];
}
const STATE_MOODS = [
    'calm',
    'bright',
    'heated',
    'low',
    'tense',
    'drowsy'
];
const EYE_MOODS = {
    mad: 'heated',
    cross: 'heated',
    sad: 'low',
    dotWide: 'tense',
    dotSmall: 'tense'
};
const GROUP_OF = new Map(STATE_GROUPS.flatMap((group)=>group.states.map((state)=>[
            state,
            group.id
        ])));
function moodOf(state) {
    const group = GROUP_OF.get(state);
    if ('resting' === group) return 'idle' === state ? 'calm' : 'drowsy';
    if ('attending' === group) return 'calm';
    if ('feeling' === group && STATE_BLUSH[state] > 0) return 'bright';
    return EYE_MOODS[STATE_CUTE_EYES[state][0]] ?? 'calm';
}
const MOOD_LEAN = {
    calm: null,
    bright: {
        tint: '#FFF0B0',
        share: 34
    },
    heated: {
        tint: '#FF5446',
        share: 46
    },
    low: {
        tint: '#8FA6D8',
        share: 42
    },
    tense: {
        tint: '#FFC646',
        share: 40
    },
    drowsy: {
        tint: '#6F7BB8',
        share: 48
    }
};
const MOOD_EASE_MS = 480;
const LADDERS = [
    {
        edge: 0,
        shadow: 0,
        light: 0,
        glint: 0
    },
    {
        edge: -0.3,
        shadow: 0,
        light: 0,
        glint: 0
    },
    {
        edge: -0.3,
        shadow: 0,
        light: 0.3,
        glint: 0.3
    },
    {
        edge: -0.34,
        shadow: -0.15,
        light: 0.3,
        glint: 0.3
    },
    {
        edge: -0.38,
        shadow: -0.18,
        light: 0.26,
        glint: 0.5
    }
];
function ladderFor(shades) {
    return LADDERS[Math.min(LADDERS.length, Math.max(1, Math.round(shades))) - 1];
}
const CELL_BODY = 1;
const CELL_EDGE = 2;
const CELL_LIGHT = 3;
const CELL_GLINT = 4;
const CELL_SHADOW = 5;
function classify(mask, size, out) {
    let sum = 0;
    let count = 0;
    for(let row = 0; row < size; row++)for(let col = 0; col < size; col++)if (mask[row * size + col]) {
        sum += col + row;
        count++;
    }
    const middle = count ? sum / count : 0;
    const at = (col, row)=>col < 0 || row < 0 || col >= size || row >= size ? 0 : mask[row * size + col];
    const edge = (col, row)=>1 === at(col, row) && !(at(col - 1, row) && at(col + 1, row) && at(col, row - 1) && at(col, row + 1));
    for(let row = 0; row < size; row++)for(let col = 0; col < size; col++){
        const i = row * size + col;
        if (!mask[i]) {
            out[i] = 0;
            continue;
        }
        if (edge(col, row)) {
            out[i] = CELL_EDGE;
            continue;
        }
        const upper = col + row < middle;
        const n = edge(col, row - 1);
        const w = edge(col - 1, row);
        if (upper && (n || w)) out[i] = n && w ? CELL_GLINT : CELL_LIGHT;
        else if (!upper && (edge(col, row + 1) || edge(col + 1, row))) out[i] = CELL_SHADOW;
        else out[i] = CELL_BODY;
    }
}
function parseHex(hex) {
    const h = hex.replace('#', '');
    const full = 3 === h.length ? [
        ...h
    ].map((c)=>c + c).join('') : h.slice(0, 6);
    const n = Number.parseInt(full, 16);
    return [
        n >> 16 & 255,
        n >> 8 & 255,
        255 & n
    ];
}
const toLinear = (v)=>{
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v)=>{
    const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(255 * clamp01(s));
};
function toOklab([r, g, b]) {
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ];
}
function fromOklab([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    ];
}
const shade_hex = ([r, g, b])=>`#${[
        r,
        g,
        b
    ].map((v)=>v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
function chromaHex(color) {
    const [, a, b] = toOklab(parseHex(color));
    return Math.hypot(a, b);
}
function mixHex(a, b, t) {
    const x = toOklab(parseHex(a));
    const y = toOklab(parseHex(b));
    return shade_hex(fromOklab([
        x[0] + (y[0] - x[0]) * t,
        x[1] + (y[1] - x[1]) * t,
        x[2] + (y[2] - x[2]) * t
    ]));
}
function shadeHex(base, tone) {
    if (0 === tone) return base.toUpperCase();
    return mixHex(base, tone < 0 ? '#000000' : '#FFFFFF', Math.abs(tone));
}
function shadeCss(base, tone) {
    if (0 === tone) return base;
    const pct = Math.round(100 * Math.abs(tone));
    return `color-mix(in oklab, ${base}, ${tone < 0 ? 'black' : 'white'} ${pct}%)`;
}
function blendCss(from, to, t) {
    const pct = Math.round(100 * t);
    if (pct <= 0) return from;
    if (pct >= 100) return to;
    return `color-mix(in oklab, ${from}, ${to} ${pct}%)`;
}
const scene_node = (tag, attrs, children, extra)=>({
        tag,
        attrs,
        children,
        ...extra
    });
const scene_r2 = (n)=>roundTo(n, 2);
const ATTRIBUTE_ESCAPES = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
};
function escapeAttribute(value) {
    return value.replace(/[&"<>]/g, (c)=>ATTRIBUTE_ESCAPES[c] ?? c);
}
function escapeText(value) {
    return value.replace(/[&<]/g, (c)=>'&' === c ? '&amp;' : '&lt;');
}
function expand(children) {
    const out = [];
    for (const child of children ?? [])if (child.fragment) out.push(...expand(child.children));
    else out.push(child);
    return out;
}
function serializeNode(n, indent = 0) {
    let open = `<${n.tag}`;
    for (const [key, value] of Object.entries(n.attrs ?? {}))if (void 0 !== value) open += ` ${key}="${escapeAttribute(String(value))}"`;
    const children = expand(n.children);
    if (0 === children.length && void 0 === n.text) return `${open}/>`;
    if (void 0 !== n.text) return `${open}>${escapeText(n.text)}</${n.tag}>`;
    const layout = n.layout ?? 'inline';
    if ('inline' === layout) return `${open}>${children.map((c)=>serializeNode(c, indent)).join('')}</${n.tag}>`;
    const pad = ' '.repeat(indent + 2);
    const body = children.map((c)=>`\n${pad}${serializeNode(c, indent + 2)}`).join('');
    return 'block' === layout ? `${open}>${body}\n${' '.repeat(indent)}</${n.tag}>` : `${open}>${body}</${n.tag}>`;
}
const LEAF_COLOR = '#34B36B';
const LEAF_COLOR_ON_GREEN = '#7BCB5A';
const getLeafColor = (id)=>'green' === id ? LEAF_COLOR_ON_GREEN : LEAF_COLOR;
const LEAF_TOKEN = `var(--aora-leaf, ${LEAF_COLOR})`;
const INNER_WHITE = 0.45;
const HAIR_SHADE_OPACITY = 0.4;
const parts_VISIBLE = 0.01;
const PART_RIM_WIDTH = 4;
const BODY_RIM = {
    px: 1,
    opacity: 0.6
};
const bodyRim = (paint, core)=>({
        stroke: paint,
        'stroke-width': BODY_RIM.px,
        'stroke-opacity': scene_r2(BODY_RIM.opacity * (core ?? 1)),
        'vector-effect': 'non-scaling-stroke'
    });
const movedPart = (part, nodes, motion)=>motion && part.motion ? motion.part(part, nodes) : nodes;
const isBodyPiece = (part)=>'body' === part.tone && void 0 === part.color;
const NONE = {
    behind: [],
    front: [],
    silhouette: null
};
const parts_smooth = new WeakMap();
function partPath(outline) {
    let d = parts_smooth.get(outline);
    if (void 0 === d) {
        d = smoothClosedPath(outline);
        parts_smooth.set(outline, d);
    }
    return d;
}
const alphaOf = (part, live)=>!live && part.opacity >= 1 ? void 0 : scene_r2(part.opacity);
const parts_shown = (part, live)=>live || part.opacity > parts_VISIBLE;
function partLayers(frame, paint) {
    const parts = frame.body.parts;
    if (0 === parts.length) return paint.live ? {
        behind: [],
        front: [],
        silhouette: null
    } : NONE;
    const hollow = 'outline' === frame.variant || 'glass' === frame.variant;
    const behind = [];
    const front = [];
    let silhouette = null;
    if (hollow) {
        const merged = mergedOutline(frame.body.outline, parts);
        if (merged) silhouette = smoothClosedPath(merged);
    }
    for (const part of parts){
        if (!parts_shown(part, paint.live)) continue;
        const d = partPath(part.outline);
        const opacity = alphaOf(part, paint.live);
        const put = (layer, nodes)=>{
            if (part.motion) layer.push(...movedPart(part, nodes, paint.motion));
            else layer.push(...nodes);
        };
        if (void 0 !== part.color) {
            put('body' === part.tone ? behind : front, colouredPart(frame, part, d, opacity, paint, hollow));
            continue;
        }
        if ('body' === part.tone) {
            if (null !== silhouette) continue;
            put(behind, [
                scene_node('path', hollow ? hollowAttrs(frame, d, paint.ink, paint, opacity) : {
                    d,
                    fill: paint.ink,
                    opacity
                })
            ]);
        } else if (hollow) {
            if ('leaf' === part.tone) put(front, [
                scene_node('path', hollowAttrs(frame, d, paint.ink, paint, opacity))
            ]);
            if ('hair' === part.tone) put(front, [
                scene_node('path', {
                    d,
                    fill: paint.ink,
                    stroke: paint.ink,
                    'stroke-width': paint.strokeWidth,
                    'stroke-linejoin': 'round',
                    opacity
                })
            ]);
        } else if ('hair' === part.tone) put(front, [
            scene_node('path', {
                d,
                fill: paint.ink,
                opacity
            }),
            scene_node('path', {
                d,
                fill: paint.hairShade,
                'fill-opacity': HAIR_SHADE_OPACITY,
                opacity
            })
        ]);
        else if ('leaf' === part.tone) put(front, [
            scene_node('path', {
                d,
                fill: paint.leaf,
                opacity
            })
        ]);
        else put(front, [
            scene_node('path', {
                d,
                fill: paint.ink,
                opacity
            }),
            scene_node('path', {
                d,
                fill: '#fff',
                'fill-opacity': INNER_WHITE,
                opacity
            })
        ]);
    }
    return {
        behind,
        front,
        silhouette
    };
}
function colouredPart(frame, part, d, opacity, paint, hollow) {
    const own = paint.partColor(part.color);
    if (hollow) {
        if ('inner' === part.tone) return [];
        const line = paint.line(own.fill);
        if ('hair' !== part.tone) return [
            scene_node('path', hollowAttrs(frame, d, line, paint, opacity))
        ];
        return [
            scene_node('path', {
                d,
                fill: line,
                stroke: line,
                'stroke-width': paint.strokeWidth,
                'stroke-linejoin': 'round',
                opacity
            })
        ];
    }
    return [
        scene_node('path', {
            d,
            fill: own.fill,
            stroke: own.rim,
            'stroke-width': PART_RIM_WIDTH,
            'stroke-linejoin': 'round',
            'paint-order': 'stroke',
            opacity
        })
    ];
}
function hollowAttrs(frame, d, stroke, paint, opacity) {
    const attrs = {
        d,
        fill: 'glass' === frame.variant ? stroke : 'none',
        'fill-opacity': 'glass' === frame.variant ? 0.16 : void 0,
        stroke,
        'stroke-width': paint.strokeWidth,
        'stroke-linejoin': 'round',
        opacity
    };
    return attrs;
}
function bodyPieces(frame, live) {
    return frame.body.parts.filter((part)=>isBodyPiece(part) && parts_shown(part, live)).map((part)=>({
            d: partPath(part.outline),
            outline: part.outline,
            opacity: alphaOf(part, live)
        }));
}
function partsPaper(frame, paper, edge, live, motion) {
    return frame.body.parts.filter((part)=>parts_shown(part, live)).flatMap((part)=>movedPart(part, [
            scene_node('path', {
                d: partPath(part.outline),
                fill: paper,
                stroke: paper,
                'stroke-width': scene_r2(2 * edge),
                'stroke-linejoin': 'round',
                opacity: alphaOf(part, live)
            })
        ], motion));
}
function partsShadow(frame, ink, darkness, live, motion) {
    const out = [];
    for (const part of frame.body.parts){
        if (!parts_shown(part, live)) continue;
        const d = partPath(part.outline);
        const opacity = alphaOf(part, live);
        out.push(...movedPart(part, [
            scene_node('path', {
                d,
                fill: ink,
                opacity
            }),
            scene_node('path', {
                d,
                fill: '#000',
                'fill-opacity': scene_r2(darkness),
                opacity
            })
        ], motion));
    }
    return out;
}
function mergedSilhouette(frame) {
    return mergedOutline(frame.body.outline, frame.body.parts);
}
const parts_merged = new WeakMap();
function mergedOutline(body, parts) {
    const same = parts.filter(isBodyPiece);
    if (0 === same.length || same.some((part)=>part.opacity < 0.999)) return null;
    const cached = parts_merged.get(body);
    if (void 0 !== cached) return cached;
    let ring = body;
    for (const part of same)ring = ring && unionOutline(ring, part.outline);
    parts_merged.set(body, ring);
    return ring;
}
function wound(points) {
    let sum = 0;
    for(let i = 0; i < points.length; i++){
        const a = points[i];
        const b = points[(i + 1) % points.length];
        sum += a[0] * b[1] - b[0] * a[1];
    }
    return sum >= 0 ? [
        ...points
    ] : points.map((_, i)=>points[points.length - 1 - i]);
}
function contains(polygon, x, y) {
    let inside = false;
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
        const a = polygon[i];
        const b = polygon[j];
        if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
}
function withCrossings(polygon, crossings, other, side) {
    const nodes = [];
    const n = polygon.length;
    const onEdge = (i)=>crossings.map((c, index)=>({
                c,
                index
            })).filter(({ c })=>('A' === side ? c.edgeA : c.edgeB) === i).sort((x, y)=>'A' === side ? x.c.tA - y.c.tA : x.c.tB - y.c.tB);
    for(let i = 0; i < n; i++){
        nodes.push({
            point: polygon[i],
            outside: false
        });
        for (const { c, index } of onEdge(i))nodes.push({
            point: c.point,
            crossing: index,
            outside: false
        });
    }
    for(let k = 0; k < nodes.length; k++){
        const a = nodes[k].point;
        const b = nodes[(k + 1) % nodes.length].point;
        nodes[k].outside = !contains(other, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    return nodes;
}
function unionOutline(first, second) {
    const A = wound(first);
    const B = wound(second);
    const crossings = [];
    for(let i = 0; i < A.length; i++){
        const a0 = A[i];
        const a1 = A[(i + 1) % A.length];
        for(let j = 0; j < B.length; j++){
            const b0 = B[j];
            const b1 = B[(j + 1) % B.length];
            const rx = a1[0] - a0[0];
            const ry = a1[1] - a0[1];
            const sx = b1[0] - b0[0];
            const sy = b1[1] - b0[1];
            const denom = rx * sy - ry * sx;
            if (Math.abs(denom) < 1e-12) continue;
            const tA = ((b0[0] - a0[0]) * sy - (b0[1] - a0[1]) * sx) / denom;
            const tB = ((b0[0] - a0[0]) * ry - (b0[1] - a0[1]) * rx) / denom;
            if (!(tA < 0) && !(tA >= 1) && !(tB < 0) && !(tB >= 1)) crossings.push({
                edgeA: i,
                tA,
                edgeB: j,
                tB,
                point: [
                    a0[0] + rx * tA,
                    a0[1] + ry * tA
                ]
            });
        }
    }
    if (crossings.length < 2 || crossings.length % 2 !== 0) return null;
    const nodesA = withCrossings(A, crossings, B, 'A');
    const nodesB = withCrossings(B, crossings, A, 'B');
    const at = (nodes, crossing)=>nodes.findIndex((n)=>n.crossing === crossing);
    const start = nodesA.findIndex((n)=>void 0 !== n.crossing && n.outside);
    if (start < 0) return null;
    const out = [];
    let onA = true;
    let k = start;
    for(let guard = 0; guard < (nodesA.length + nodesB.length) * 2; guard++){
        const nodes = onA ? nodesA : nodesB;
        out.push(nodes[k].point);
        k = (k + 1) % nodes.length;
        const arrived = nodes[k];
        if (void 0 === arrived.crossing) continue;
        onA = !onA;
        const next = onA ? nodesA : nodesB;
        k = at(next, arrived.crossing);
        if (k < 0 || !next[k].outside) break;
        if (onA && k === start) return out;
    }
    return null;
}
const DENSITY = 1.6;
const TIERS = [
    1,
    0.55
];
function coverage(shape) {
    const size = Math.round(shape.tile * DENSITY);
    const values = new Float32Array(size * size);
    const k = size / shape.tile;
    const stamp = (x0, y0, x1, y1, strength, distance)=>{
        for(let py = Math.floor(y0 * k) - 1; py <= Math.ceil(y1 * k) + 1; py++)for(let px = Math.floor(x0 * k) - 1; px <= Math.ceil(x1 * k) + 1; px++){
            const edge = Math.min(1, Math.max(0, 0.5 - distance(px + 0.5, py + 0.5)));
            if (edge <= 0) continue;
            const i = (py % size + size) % size * size + (px % size + size) % size;
            values[i] = Math.max(values[i], edge * strength);
        }
    };
    if (shape.specks) {
        const s = shape.specks;
        const rand = mulberry32(shape.seed);
        for(let i = 0; i < s.count; i++){
            const x = rand() * shape.tile;
            const y = rand() * shape.tile;
            const r = s.r[0] + rand() * (s.r[1] - s.r[0]);
            stamp(x - r, y - r, x + r, y + r, TIERS[i % TIERS.length], (px, py)=>Math.hypot(px - x * k, py - y * k) - r * k);
        }
    }
    if (shape.streaks) {
        const s = shape.streaks;
        const rand = mulberry32(0x5bd1e995 ^ shape.seed);
        for(let i = 0; i < s.count; i++){
            const x = rand() * shape.tile;
            const y = rand() * shape.tile;
            const len = s.length[0] + rand() * (s.length[1] - s.length[0]);
            const a = (s.angle + (rand() - 0.5) * s.spread) * Math.PI / 180;
            const dx = Math.cos(a) * len;
            const dy = Math.sin(a) * len;
            const half = s.width / 2;
            const ax = x * k;
            const ay = y * k;
            const bx = dx * k;
            const by = dy * k;
            const ll = bx * bx + by * by || 1;
            stamp(Math.min(x, x + dx) - half, Math.min(y, y + dy) - half, Math.max(x, x + dx) + half, Math.max(y, y + dy) + half, TIERS[i % TIERS.length], (px, py)=>{
                const t = Math.min(1, Math.max(0, ((px - ax) * bx + (py - ay) * by) / ll));
                return Math.hypot(px - ax - bx * t, py - ay - by * t) - half * k;
            });
        }
    }
    return {
        size,
        values
    };
}
const CRC_TABLE = (()=>{
    const table = new Uint32Array(256);
    for(let n = 0; n < 256; n++){
        let c = n;
        for(let k = 0; k < 8; k++)c = 1 & c ? 0xedb88320 ^ c >>> 1 : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();
function crc32(bytes) {
    let c = 0xffffffff;
    for (const b of bytes)c = CRC_TABLE[(c ^ b) & 0xff] ^ c >>> 8;
    return (0xffffffff ^ c) >>> 0;
}
const u32 = (n)=>[
        n >>> 24 & 0xff,
        n >>> 16 & 0xff,
        n >>> 8 & 0xff,
        0xff & n
    ];
function grain_chunk(type, data) {
    const body = new Uint8Array(4 + data.length);
    for(let i = 0; i < 4; i++)body[i] = type.charCodeAt(i);
    body.set(data, 4);
    return [
        ...u32(data.length),
        ...body,
        ...u32(crc32(body))
    ];
}
function zlibStored(raw) {
    const out = [
        0x78,
        0x01
    ];
    for(let at = 0; at < raw.length || 0 === at; at += 0xffff){
        const len = Math.min(0xffff, raw.length - at);
        const last = at + len >= raw.length ? 1 : 0;
        out.push(last, 0xff & len, len >>> 8, 0xff & ~len, ~len >>> 8 & 0xff);
        for(let i = 0; i < len; i++)out.push(raw[at + i]);
        if (last) break;
    }
    let a = 1;
    let b = 0;
    for (const byte of raw){
        a = (a + byte) % 65521;
        b = (b + a) % 65521;
    }
    return [
        ...out,
        ...u32((b << 16 | a) >>> 0)
    ];
}
function grayPng(size, gray) {
    const raw = new Uint8Array(size * (size + 1));
    for(let y = 0; y < size; y++){
        raw[y * (size + 1)] = 0;
        for(let x = 0; x < size; x++)raw[y * (size + 1) + 1 + x] = gray(y * size + x);
    }
    const bytes = [
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
        ...grain_chunk('IHDR', [
            ...u32(size),
            ...u32(size),
            8,
            0,
            0,
            0,
            0
        ]),
        ...grain_chunk('IDAT', zlibStored(raw)),
        ...grain_chunk('IEND', [])
    ];
    let binary = '';
    for (const b of bytes)binary += String.fromCharCode(b);
    return `data:image/png;base64,${btoa(binary)}`;
}
const IMAGES = new Map();
function grainImage(shape, holes) {
    const key = `${shape.seed}:${holes}`;
    let url = IMAGES.get(key);
    if (!url) {
        const { size, values } = coverage(shape);
        url = grayPng(size, (i)=>Math.round(255 * (holes ? 1 - values[i] : values[i])));
        IMAGES.set(key, url);
    }
    return url;
}
const GOTHIC_GRAIN = {
    tile: 36,
    angle: 17,
    opacity: 0.5,
    body: 0,
    specks: {
        count: 120,
        r: [
            0.4,
            1.1
        ]
    },
    streaks: {
        count: 40,
        length: [
            2,
            6
        ],
        width: 0.7,
        angle: -20,
        spread: 30
    },
    seed: 71
};
const INK = '#17110d';
const SHADOW = [
    Math.SQRT1_2,
    Math.SQRT1_2
];
const RIM = {
    opacity: 0.13,
    widths: [
        0.3,
        0.14
    ]
};
const BAND = {
    base: 0.03,
    vary: 0.45,
    heavy: 0.9,
    minSize: 60
};
const HATCH_MIN = 40;
const MAX_POINTS = 96;
const seedOf = (ring)=>{
    let h = 2166136261;
    for(let i = 0; i < ring.length; i += 5){
        h = Math.imul(h ^ Math.round(10 * ring[i][0]), 16777619);
        h = Math.imul(h ^ Math.round(10 * ring[i][1]), 16777619);
    }
    return h >>> 0;
};
const thin = (ring)=>{
    if (ring.length <= MAX_POINTS) return ring;
    const step = ring.length / MAX_POINTS;
    return Array.from({
        length: MAX_POINTS
    }, (_, i)=>ring[Math.floor(i * step)]);
};
const loopNoise = (n, knots, rand)=>{
    const k = Array.from({
        length: knots
    }, rand);
    return (i)=>{
        const t = i / n * knots;
        const a = Math.floor(t);
        const s = (1 - Math.cos((t - a) * Math.PI)) / 2;
        return k[a % knots] * (1 - s) + k[(a + 1) % knots] * s;
    };
};
function normals(ring) {
    const n = ring.length;
    let cx = 0;
    let cy = 0;
    for (const [x, y] of ring){
        cx += x / n;
        cy += y / n;
    }
    const out = ring.map((_, i)=>{
        const a = ring[(i - 1 + n) % n];
        const b = ring[(i + 1) % n];
        const tx = b[0] - a[0];
        const ty = b[1] - a[1];
        const l = Math.hypot(tx, ty) || 1;
        return [
            ty / l,
            -tx / l
        ];
    });
    const outward = out.reduce((s, v, i)=>s + v[0] * (ring[i][0] - cx) + v[1] * (ring[i][1] - cy), 0);
    return outward < 0 ? out.map(([x, y])=>[
            -x,
            -y
        ]) : out;
}
function brushedBand(ctx, ring, size, seed) {
    const r = thin(ring);
    const nrm = normals(r);
    const noise = loopNoise(r.length, 9, mulberry32(seed));
    const width = (i)=>size * BAND.base * (1 - BAND.vary + 2 * BAND.vary * noise(i)) * (1 + BAND.heavy * Math.max(0, nrm[i][0] * SHADOW[0] + nrm[i][1] * SHADOW[1]));
    const offset = (k)=>r.map(([x, y], i)=>[
                x + nrm[i][0] * width(i) * k,
                y + nrm[i][1] * width(i) * k
            ]);
    const inner = offset(-0.45);
    inner.reverse();
    return ctx.kit.closedCurve(offset(0.55)) + ctx.kit.closedCurve(inner);
}
function paintGothic(piece, ctx) {
    const { kit } = ctx;
    const { ring } = piece;
    const { size } = kit.extentOf(ring);
    const seed = seedOf(ring);
    const d = kit.remember(ring, 'curve', ()=>kit.closedCurve(ring));
    const clip = `${ctx.prefix ?? 'aora'}-gothic-${fnv1a32(d).toString(36)}`;
    const out = [
        kit.node('clipPath', {
            id: clip
        }, [
            kit.node('path', {
                d
            })
        ]),
        kit.node('path', {
            d,
            fill: ctx.fill(piece)
        }),
        kit.node('g', {
            'clip-path': `url(#${clip})`
        }, RIM.widths.map((w)=>kit.node('path', {
                d,
                stroke: '#000',
                'stroke-opacity': RIM.opacity,
                'stroke-width': kit.f1(size * w)
            })))
    ];
    if (ctx.params.hatching && size >= HATCH_MIN) {
        const hatch = kit.remember(ring, 'gothic-hatch', ()=>kit.hatchPath(ring, {
                angle: 58,
                gap: 0.045 * size,
                ragged: 0.035 * size,
                seed: seed % 997,
                shade: [
                    0.2 * -size,
                    0.24 * -size
                ]
            }));
        const cross = kit.remember(ring, 'gothic-cross', ()=>kit.hatchPath(ring, {
                angle: -32,
                gap: 0.05 * size,
                ragged: 0.04 * size,
                seed: (seed >> 3) % 997,
                shade: [
                    0.1 * -size,
                    0.12 * -size
                ]
            }));
        const stroke = (path, width, opacity)=>kit.node('path', {
                d: path,
                stroke: INK,
                'stroke-width': kit.f1(Math.max(1, size * width)),
                'stroke-opacity': opacity,
                'stroke-linecap': 'round'
            });
        out.push(stroke(hatch, 0.009, 0.55), stroke(cross, 0.008, 0.4));
    }
    out.push(kit.node('path', {
        d: kit.remember(ring, 'gothic-band', ()=>brushedBand(ctx, ring, Math.max(size, BAND.minSize), seed)),
        fill: INK,
        'fill-rule': 'evenodd'
    }));
    return out;
}
const BODY_SIZE = 90;
const CELLS = {
    body: 5,
    part: 3
};
const RIM_POINTS = {
    body: 14,
    part: 7
};
const JITTER = 0.8;
const TIP = 0.65;
const CONTRAST = 1.6;
const LIGHT = -3 * Math.PI / 4;
function origami_extent(points) {
    let minX = 1 / 0;
    let minY = 1 / 0;
    let maxX = -1 / 0;
    let maxY = -1 / 0;
    for (const [x, y] of points){
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    return {
        minX,
        minY,
        maxX,
        maxY,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        size: Math.max(maxX - minX, maxY - minY)
    };
}
function signedArea(ring) {
    let area = 0;
    for(let i = 0; i < ring.length; i++){
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        area += a[0] * b[1] - b[0] * a[1];
    }
    return area / 2;
}
function origami_inside(ring, x, y) {
    let hit = false;
    for(let i = 0, j = ring.length - 1; i < ring.length; j = i++){
        const a = ring[i];
        const b = ring[j];
        if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
}
function origami_seedOf(ring) {
    let h = 0x811c9dc5;
    for(let i = 0; i < ring.length; i += 3){
        h = Math.imul(h ^ Math.round(10 * ring[i][0]), 0x01000193);
        h = Math.imul(h ^ Math.round(10 * ring[i][1]), 0x01000193);
    }
    return h >>> 0;
}
function clipHalf(subject, a, b) {
    const side = (p)=>(b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const out = [];
    for(let i = 0; i < subject.length; i++){
        const p = subject[i];
        const q = subject[(i + 1) % subject.length];
        const sp = side(p);
        const sq = side(q);
        if (sp >= 0) out.push(p);
        if (sp >= 0 !== sq >= 0) {
            const t = sp / (sp - sq);
            out.push([
                p[0] + (q[0] - p[0]) * t,
                p[1] + (q[1] - p[1]) * t
            ]);
        }
    }
    return out;
}
function clipToTriangle(polygon, tri) {
    const [p, q, r] = signedArea(tri) >= 0 ? tri : [
        tri[0],
        tri[2],
        tri[1]
    ];
    let out = [
        ...polygon
    ];
    for (const [a, b] of [
        [
            p,
            q
        ],
        [
            q,
            r
        ],
        [
            r,
            p
        ]
    ]){
        if (out.length < 3) return [];
        out = clipHalf(out, a, b);
    }
    return out.length >= 3 ? out : [];
}
function triangulate(points) {
    const { cx, cy, size } = origami_extent(points);
    const far = 20 * size;
    const all = [
        ...points,
        [
            cx - far,
            cy - far
        ],
        [
            cx + far,
            cy - far
        ],
        [
            cx,
            cy + far
        ]
    ];
    const n = points.length;
    let triangles = [
        [
            n,
            n + 1,
            n + 2
        ]
    ];
    const circle = ([a, b, c])=>{
        const [ax, ay] = all[a];
        const [bx, by] = all[b];
        const [qx, qy] = all[c];
        const d = 2 * (ax * (by - qy) + bx * (qy - ay) + qx * (ay - by));
        const a2 = ax * ax + ay * ay;
        const b2 = bx * bx + by * by;
        const q2 = qx * qx + qy * qy;
        const ux = (a2 * (by - qy) + b2 * (qy - ay) + q2 * (ay - by)) / d;
        const uy = (a2 * (qx - bx) + b2 * (ax - qx) + q2 * (bx - ax)) / d;
        return {
            ux,
            uy,
            r2: (ax - ux) ** 2 + (ay - uy) ** 2
        };
    };
    for(let i = 0; i < n; i++){
        const [px, py] = all[i];
        const kept = [];
        const edges = new Map();
        for (const t of triangles){
            const { ux, uy, r2 } = circle(t);
            if ((px - ux) ** 2 + (py - uy) ** 2 >= r2) {
                kept.push(t);
                continue;
            }
            for (const [u, v] of [
                [
                    t[0],
                    t[1]
                ],
                [
                    t[1],
                    t[2]
                ],
                [
                    t[2],
                    t[0]
                ]
            ]){
                const key = u < v ? `${u},${v}` : `${v},${u}`;
                edges.set(key, edges.has(key) ? null : [
                    u,
                    v
                ]);
            }
        }
        triangles = kept;
        for (const edge of edges.values())if (edge) triangles.push([
            edge[0],
            edge[1],
            i
        ]);
    }
    return triangles.filter((t)=>t.every((k)=>k < n));
}
function fold(ring) {
    const polygon = ring.map(([x, y])=>[
            x,
            y
        ]);
    const e = origami_extent(polygon);
    const body = e.size > BODY_SIZE;
    const rand = mulberry32(origami_seedOf(polygon));
    const step = e.size / (body ? CELLS.body : CELLS.part);
    const seeds = [];
    for(let y = e.minY + step / 2; y < e.maxY; y += step)for(let x = e.minX + step / 2; x < e.maxX; x += step){
        const p = [
            x + (rand() - 0.5) * step * JITTER,
            y + (rand() - 0.5) * step * JITTER
        ];
        if (origami_inside(polygon, p[0], p[1])) seeds.push(p);
    }
    const every = Math.max(1, Math.round(polygon.length / (body ? RIM_POINTS.body : RIM_POINTS.part)));
    for(let i = 0; i < polygon.length; i += every)seeds.push(polygon[i]);
    const facets = [];
    for (const [a, b, c] of triangulate(seeds)){
        const tri = [
            seeds[a],
            seeds[b],
            seeds[c]
        ];
        const mx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
        const my = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        if (!origami_inside(polygon, mx, my)) continue;
        const facet = clipToTriangle(polygon, tri);
        if (facet.length < 3) continue;
        const nx = (2 * rand() - 1) * TIP;
        const ny = (2 * rand() - 1) * TIP;
        const facing = (nx * Math.cos(LIGHT) + ny * Math.sin(LIGHT)) / Math.hypot(nx, ny, 1);
        facets.push({
            ring: facet,
            light: Math.max(-1, Math.min(1, facing * CONTRAST))
        });
    }
    return {
        polygon,
        facets
    };
}
const FX_COLORS = {
    gold: '#F5B428',
    alert: '#EB4B4F',
    tear: '#7CC7FF',
    heart: '#FF6F91'
};
const K = SHAPE_SPACE / 100 / 0.86;
const FIG_TX = 7;
const FIG_TY = 10;
const atX = (x)=>(x - FIG_TX) * K;
const atY = (y)=>(y - FIG_TY) * K;
const CORNER_X = atX(85);
const CORNER_Y = atY(15);
const easeOut = (t)=>1 - (1 - t) * (1 - t);
const easeIn = (t)=>t * t;
const fx_units_wave = (p)=>0.5 - 0.5 * Math.cos(p * Math.PI * 2);
const fx_units_loop = (t, period, delay = 0)=>{
    const local = t - delay;
    return local < 0 ? -1 : local % period / period;
};
const fx_activity_C = SHAPE_SPACE / 2;
const fx_activity_TAU = 2 * Math.PI;
const fx_activity_around = (cx, cy, radius, deg)=>{
    const a = deg * Math.PI / 180;
    return [
        cx + Math.sin(a) * radius,
        cy - Math.cos(a) * radius
    ];
};
const onCircle = (radius, deg)=>fx_activity_around(fx_activity_C, fx_activity_C, radius, deg);
function beat(t, period, delay, settled) {
    if (settled) return 1;
    const p = fx_units_loop(t, period, delay);
    return p < 0 ? 0 : fx_units_wave(p);
}
const fx_activity_dot = (x, y, r, opacity)=>({
        shape: 'dot',
        x,
        y,
        size: r,
        opacity
    });
const fx_activity_line = (x1, y1, x2, y2, width, opacity)=>({
        shape: 'line',
        x: x1,
        y: y1,
        x2,
        y2,
        size: 0,
        width,
        opacity
    });
const fx_activity_circle = (x, y, r, width, opacity)=>({
        shape: 'arc',
        x,
        y,
        size: r,
        width,
        start: 0,
        sweep: 360,
        opacity
    });
function fx_activity_arrow(x, y, s, dir, width, opacity) {
    const tip = y - dir * s;
    const wing = 0.7 * s;
    return [
        fx_activity_line(x, y + dir * s, x, tip, width, opacity),
        fx_activity_line(x - wing, tip + dir * wing, x, tip, width, opacity),
        fx_activity_line(x + wing, tip + dir * wing, x, tip, width, opacity)
    ];
}
const lifetime = (p)=>Math.sin(clamp01(p) * Math.PI);
const fx_activity_frame = (kind, items, color = null)=>({
        kind,
        color,
        space: 'scene',
        items
    });
function evaluateActivity(kind, t, options) {
    const { settled } = options;
    const ring = options.ring ?? 100;
    switch(kind){
        case 'dots':
            return fx_activity_frame(kind, [
                [
                    78,
                    25,
                    1.9,
                    0
                ],
                [
                    85,
                    17.5,
                    2.7,
                    0.2
                ],
                [
                    93,
                    9,
                    3.5,
                    0.4
                ]
            ].map(([x, y, r, delay])=>{
                const w = beat(t, 1.2, delay, settled);
                return fx_activity_dot(atX(x), atY(y), r * K * easing_lerp(0.7, 1, w), easing_lerp(0.35, 1, w));
            }));
        case 'ellipsis':
            return fx_activity_frame(kind, [
                76,
                84,
                92
            ].map((x, i)=>{
                const w = beat(t, 1.2, 0.22 * i, settled);
                return fx_activity_dot(atX(x), atY(18) - 4.5 * K * w, 2.6 * K, easing_lerp(0.4, 1, w));
            }));
        case 'orbit':
            {
                const lead = settled ? 2.2 : 2.6 * t;
                return fx_activity_frame(kind, [
                    fx_activity_dot(CORNER_X, CORNER_Y, 2.8 * K, 1),
                    ...[
                        0,
                        1,
                        2
                    ].map((i)=>{
                        const a = lead - 0.42 * i;
                        const near = (Math.cos(a) + 1) / 2;
                        return fx_activity_dot(CORNER_X + 11 * Math.sin(a) * K, CORNER_Y + 4 * Math.cos(a) * K, (2 - 0.45 * i) * K * easing_lerp(0.8, 1.15, near), (1 - 0.3 * i) * easing_lerp(0.5, 1, near));
                    })
                ]);
            }
        case 'bubbles':
            return fx_activity_frame(kind, [
                0,
                1
            ].map((i)=>{
                const p = settled ? 0.4 + 0.3 * i : (t / 2.2 + 0.5 * i) % 1;
                return fx_activity_circle(atX(80 + 10 * i), atY(easing_lerp(30, 4, easeOut(p))), (3 + 1.6 * i) * K, 2.2 * K, lifetime(p));
            }));
        case 'spinner':
            {
                const n = 8;
                const lead = settled ? 2 : t % 0.9 / 0.9 * n;
                return fx_activity_frame(kind, Array.from({
                    length: n
                }, (_, i)=>{
                    const [x, y] = fx_activity_around(CORNER_X, CORNER_Y, 7.5 * K, i / n * 360);
                    const behind = ((lead - i) % n + n) % n;
                    return fx_activity_dot(x, y, 1.7 * K, easing_lerp(1, 0.2, behind / n));
                }));
            }
        case 'progress':
            {
                const p = settled ? 0.65 : clamp01(t % 4 / 2.5);
                const from = CORNER_X - 11 * K;
                const to = CORNER_X + 11 * K;
                const width = 3.8 * K;
                return fx_activity_frame(kind, [
                    fx_activity_line(from, CORNER_Y, to, CORNER_Y, width, 0.2),
                    fx_activity_line(from, CORNER_Y, easing_lerp(from, to, p), CORNER_Y, width, p > 0 ? 1 : 0)
                ]);
            }
        case 'ripple':
            return fx_activity_frame(kind, [
                fx_activity_dot(CORNER_X, CORNER_Y, 2.2 * K, 1),
                ...[
                    0,
                    1
                ].map((i)=>{
                    const p = settled ? 0.3 + 0.4 * i : (t / 1.6 + i / 2) % 1;
                    return fx_activity_circle(CORNER_X, CORNER_Y, easing_lerp(3.5, 11, easeOut(p)) * K, 2.2 * K, (1 - p) * 0.85);
                })
            ]);
        case 'waves':
            {
                const cx = atX(76);
                const cy = atY(28);
                return fx_activity_frame(kind, [
                    7,
                    13,
                    19
                ].map((r, i)=>{
                    const w = beat(t, 1.2, 0.2 * i, settled);
                    return {
                        ...fx_activity_circle(cx, cy, r * K, 2.6 * K, easing_lerp(0.25, 1, w)),
                        start: 20,
                        sweep: 70
                    };
                }));
            }
        case 'rise':
        case 'fall':
            {
                const dir = 'rise' === kind ? 1 : -1;
                return fx_activity_frame(kind, [
                    0,
                    1
                ].flatMap((i)=>{
                    const p = settled ? 0.4 + 0.35 * i : (t / 1.6 + 0.5 * i) % 1;
                    const y = atY(1 === dir ? easing_lerp(30, 4, p) : easing_lerp(4, 30, p));
                    return fx_activity_arrow(atX(82 + 8 * i), y, 4.6 * K, dir, 2.6 * K, lifetime(p));
                }));
            }
        case 'send':
            {
                const p = settled ? 0.45 : t % 1.5 / 1.5;
                const from = [
                    atX(76),
                    atY(20)
                ];
                const to = [
                    atX(97),
                    atY(3)
                ];
                const at = (k)=>[
                        easing_lerp(from[0], to[0], k),
                        easing_lerp(from[1], to[1], k)
                    ];
                const head = at(easeOut(p));
                const tail = at(0.45 * easeOut(p));
                const opacity = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;
                return fx_activity_frame(kind, [
                    fx_activity_line(tail[0], tail[1], head[0], head[1], 2.8 * K, 0.6 * opacity),
                    fx_activity_dot(head[0], head[1], 3.6 * K, opacity)
                ]);
            }
        case 'gather':
            {
                const p = settled ? 0.5 : t % 2 / 2;
                return fx_activity_frame(kind, [
                    0,
                    1,
                    2,
                    3,
                    4
                ].map((i)=>{
                    const [x, y] = onCircle(easing_lerp(1.05 * ring, 0.72 * ring, easeOut(p)), i / 5 * 360 + 290 * p);
                    return {
                        shape: 'star',
                        x,
                        y,
                        size: 4.6 * K,
                        opacity: lifetime(p)
                    };
                }), FX_COLORS.gold);
            }
        case 'pencil':
            {
                const phase = settled ? 0 : t % 1.1 / 1.1 * fx_activity_TAU;
                const across = Math.sin(phase);
                const down = Math.sin(2 * phase);
                const x = atX(84) + 7 * across * K;
                const y = atY(13) + 3.4 * down * K;
                return fx_activity_frame(kind, [
                    {
                        shape: 'pencil',
                        x,
                        y,
                        size: 0.74,
                        rotation: 26 + 8 * across,
                        opacity: 1
                    },
                    ...[
                        0,
                        1
                    ].map((i)=>{
                        const trail = settled ? -0.5 - 0.45 * i : Math.sin(phase - 0.5 - 0.45 * i);
                        return fx_activity_dot(atX(84) + 7 * trail * K, atY(13) + 7.5 * K, 1.6 * K, 0.5 - 0.2 * i);
                    })
                ]);
            }
    }
}
function floatZ(x, y, s, t, delay, settled) {
    const p = settled ? 0.3 : fx_units_loop(t, 2.4, delay);
    const k = Math.max(0, p);
    const opacity = p < 0 ? 0 : k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7;
    const rise = easeOut(k);
    const scale = easing_lerp(0.6, 1, rise);
    return {
        shape: 'z',
        x: atX(x + s / 2 + 4 * rise),
        y: atY(y + s / 2 + easing_lerp(4, -8, rise)),
        size: s * K * scale,
        width: 2.4 * K * scale,
        opacity
    };
}
function fx_twinkle(t, delay, settled) {
    const p = settled ? 0.5 : fx_units_loop(t, 1.4, delay);
    const w = p < 0 ? 0 : fx_units_wave(p);
    return {
        scale: easing_lerp(0.45, 1, w),
        opacity: easing_lerp(0.35, 1, w)
    };
}
function fx_pop(t, period, settled) {
    const p = settled ? 1 : fx_units_loop(t, period);
    const b = p < 0.08 ? easeOut(p / 0.08) : p < 0.2 ? 1 - easeOut((p - 0.08) / 0.12) : 0;
    return {
        lift: -6 * b * K,
        scale: 1 + 0.06 * b
    };
}
function evaluateFx(kind, t, options = {}) {
    const settled = options.settled ?? false;
    switch(kind){
        case 'zz':
            return {
                kind,
                color: null,
                space: 'scene',
                items: [
                    floatZ(74, 24, 5, t, 0, settled),
                    floatZ(82, 13, 6.5, t, 0.8, settled),
                    floatZ(90, 2, 8, t, 1.6, settled)
                ]
            };
        case 'sparkle':
            return {
                kind,
                color: FX_COLORS.gold,
                space: 'scene',
                items: [
                    [
                        14,
                        26,
                        6.5,
                        0
                    ],
                    [
                        88,
                        30,
                        4.8,
                        0.45
                    ],
                    [
                        80,
                        9,
                        3.6,
                        0.9
                    ]
                ].map(([x, y, r, delay])=>{
                    const k = fx_twinkle(t, delay, settled);
                    return {
                        shape: 'star',
                        x: atX(x),
                        y: atY(y),
                        size: r * K * k.scale,
                        opacity: k.opacity
                    };
                })
            };
        case 'heart':
            {
                const k = fx_twinkle(t, 0, settled);
                return {
                    kind,
                    color: FX_COLORS.heart,
                    space: 'scene',
                    items: [
                        {
                            shape: 'heart',
                            x: atX(87),
                            y: atY(20),
                            size: 4.6 * K * k.scale,
                            opacity: k.opacity
                        }
                    ]
                };
            }
        case 'bang':
            {
                const k = fx_pop(t, 1.8, settled);
                return {
                    kind,
                    color: FX_COLORS.alert,
                    space: 'scene',
                    items: [
                        {
                            shape: 'bang',
                            x: atX(88.3),
                            y: atY(6) + k.lift,
                            size: K * k.scale,
                            opacity: 1
                        }
                    ]
                };
            }
        case 'strokes':
            {
                const k = fx_pop(t, 1.8, settled);
                const cx = 83.5;
                const cy = 19;
                const at = (x, y)=>[
                        atX(cx + (x - cx) * k.scale),
                        atY(cy + (y - cy) * k.scale) + k.lift
                    ];
                return {
                    kind,
                    color: null,
                    space: 'scene',
                    items: [
                        [
                            74,
                            16,
                            76,
                            8
                        ],
                        [
                            82,
                            21,
                            89,
                            15
                        ],
                        [
                            85,
                            30,
                            93,
                            29
                        ]
                    ].map(([x1, y1, x2, y2])=>{
                        const [ax, ay] = at(x1, y1);
                        const [bx, by] = at(x2, y2);
                        return {
                            shape: 'line',
                            x: ax,
                            y: ay,
                            x2: bx,
                            y2: by,
                            size: 0,
                            width: 2.8 * K,
                            opacity: 1
                        };
                    })
                };
            }
        case 'tear':
            {
                const a = options.anchor;
                if (!a) return {
                    kind,
                    color: FX_COLORS.tear,
                    space: 'face',
                    items: []
                };
                const p = settled ? 0.35 : fx_units_loop(t, 2.2);
                const opacity = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
                return {
                    kind,
                    color: FX_COLORS.tear,
                    space: 'face',
                    items: [
                        {
                            shape: 'drop',
                            x: a.x,
                            y: a.y + a.r * (9 / 4.6) + easeIn(p) * a.r * (9 / 4.6),
                            size: a.r * (2.8 / 4.6),
                            opacity: clamp01(opacity)
                        }
                    ]
                };
            }
        case 'arc':
            {
                const turn = settled ? 0 : t % 1.1 / 1.1 * 360;
                return {
                    kind,
                    color: null,
                    space: 'scene',
                    items: [
                        {
                            shape: 'arc',
                            x: CORNER_X,
                            y: CORNER_Y,
                            size: 7.5 * K,
                            width: 3 * K,
                            start: turn,
                            sweep: 120,
                            opacity: 1
                        }
                    ]
                };
            }
        default:
            return evaluateActivity(kind, t, {
                settled,
                ring: options.ring
            });
    }
}
const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const written = new WeakMap();
const synced = new WeakMap();
function syncElement(el, node) {
    if (synced.get(el) === node) return;
    synced.set(el, node);
    let prev = written.get(el);
    if (!prev) {
        prev = new Map();
        written.set(el, prev);
    }
    const attrs = node.attrs ?? {};
    for (const [key, value] of Object.entries(attrs)){
        if (void 0 === value) continue;
        const next = String(value);
        if (prev.get(key) !== next) {
            el.setAttribute(key, next);
            prev.set(key, next);
        }
    }
    for (const key of prev.keys())if (void 0 === attrs[key]) {
        el.removeAttribute(key);
        prev.delete(key);
    }
    if (void 0 !== node.text) {
        if (el.textContent !== node.text) el.textContent = node.text;
        return;
    }
    syncChildren(el, node.children ?? []);
}
function syncChildren(parent, nodes) {
    while(parent.childElementCount > nodes.length)parent.lastElementChild.remove();
    let child = parent.firstElementChild;
    for (const wanted of nodes){
        if (child && synced.get(child) === wanted) {
            child = child.nextElementSibling;
            continue;
        }
        if (!child || child.localName !== wanted.tag) {
            const fresh = document.createElementNS('div' === wanted.tag ? XHTML_NS : SVG_NS, wanted.tag);
            if (child) child.replaceWith(fresh);
            else parent.appendChild(fresh);
            child = fresh;
        }
        syncElement(child, wanted);
        child = child.nextElementSibling;
    }
}
function createSvgElement(tag) {
    return document.createElementNS(SVG_NS, tag);
}
const KIT = {
    node: scene_node,
    hash: fnv1a32,
    random: mulberry32,
    moodOf: moodOf,
    states: CHARACTER_STATES,
    stateFx: STATE_FX,
    evaluateFx: evaluateFx,
    center: CENTER,
    viewBox: VIEWBOX,
    moodLean: MOOD_LEAN,
    moodEaseMs: MOOD_EASE_MS,
    chroma: chromaHex,
    sync: syncElement
};
let extras_hook_extras = null;
function installExtras(factory) {
    extras_hook_extras ??= factory(KIT);
    return extras_hook_extras;
}
const themeExtras = ()=>extras_hook_extras;
const MEDIA = [
    'pencil',
    'marker',
    'crayon',
    'watercolor',
    'neon',
    'chalk',
    'origami',
    'relief',
    'gothic'
];
const isBuiltin = (variant)=>MEDIA.includes(variant);
const isMedium = (variant)=>isBuiltin(variant) || media_DEFINED.has(variant);
const isBuiltinMedium = isBuiltin;
const isLineVariant = (variant)=>'outline' === variant || 'glass' === variant || 'pencil' === variant || 'neon' === variant || 'chalk' === variant;
const wearsDeepBlush = (variant)=>'soft' === variant || 'crayon' === variant || 'watercolor' === variant || media_DEFINED.get(variant)?.deepBlush === true;
const monochromeEffects = (variant)=>'outline' === variant || 'glass' === variant || 'pencil' === variant;
function lineShift(variant) {
    switch(variant){
        case 'pencil':
            return 45;
        case 'chalk':
            return 48;
        case 'neon':
            return 55;
        default:
            return 22;
    }
}
const LINE_SHARE = {
    pencil: 0.45,
    marker: 0.42,
    neon: 0.5,
    chalk: 0.62
};
const DETAIL_PX = [
    40,
    80
];
const LINE_MIN_PX = 0.85;
function mediumSize(params, sizePx, shapeScale) {
    if (!(sizePx > 0)) return {
        params,
        minLine: 0
    };
    const detail = Math.min(1, Math.max(0, (sizePx - DETAIL_PX[0]) / (DETAIL_PX[1] - DETAIL_PX[0])));
    const unitPx = sizePx / VIEWBOX.width * shapeScale;
    return {
        params: detail >= 1 ? params : {
            ...params,
            grain: Math.round(params.grain * detail * 10) / 10,
            hatching: params.hatching && detail >= 0.5
        },
        minLine: LINE_MIN_PX / unitPx
    };
}
const mixPaint = (color, into, percent)=>color.startsWith('url(') ? color : `color-mix(in oklab, ${color}, ${into} ${percent}%)`;
const EDGE_DARKNESS = {
    marker: 52,
    crayon: 24,
    watercolor: 30
};
const WASH_WHITE = 24;
const REGION = {
    x: -120,
    y: -120,
    width: 470,
    height: 470
};
const media_around = (margin)=>({
        x: -margin,
        y: -margin,
        width: 1 + 2 * margin,
        height: 1 + 2 * margin
    });
const media_f1 = (n)=>Math.round(10 * n) / 10;
const media_pct = (n)=>Math.round(100 * n) / 100;
const GRAIN = {
    pencil: {
        tile: 30,
        angle: 21,
        opacity: 0.8,
        body: 0.75,
        specks: {
            count: 190,
            r: [
                0.35,
                0.95
            ]
        },
        seed: 11
    },
    crayon: {
        tile: 40,
        angle: 0,
        opacity: 0.8,
        body: 0,
        specks: {
            count: 40,
            r: [
                0.4,
                1
            ]
        },
        streaks: {
            count: 100,
            length: [
                2,
                5.5
            ],
            width: 0.85,
            angle: -35,
            spread: 12
        },
        seed: 23
    },
    watercolor: {
        tile: 32,
        angle: 13,
        opacity: 0.3,
        body: 0,
        specks: {
            count: 110,
            r: [
                0.35,
                1
            ]
        },
        seed: 37
    },
    chalk: {
        tile: 40,
        angle: 8,
        opacity: 0.95,
        body: 0.72,
        specks: {
            count: 260,
            r: [
                0.45,
                1.3
            ]
        },
        streaks: {
            count: 50,
            length: [
                2,
                5
            ],
            width: 0.9,
            angle: 35,
            spread: 25
        },
        seed: 41
    },
    gothic: GOTHIC_GRAIN
};
const PIGMENT = {
    tile: 32,
    opacity: 0.13,
    specks: {
        count: 100,
        r: [
            0.3,
            0.85
        ]
    },
    seed: 53
};
const tileAttrs = (spec)=>({
        width: spec.tile,
        height: spec.tile
    });
const patternAttrs = (id, spec)=>({
        id,
        ...tileAttrs(spec),
        patternUnits: 'userSpaceOnUse',
        patternTransform: spec.angle ? `rotate(${spec.angle})` : void 0
    });
const TONES = [
    'body',
    'leaf',
    'inner',
    'hair'
];
function pieceColor(part, paint, line) {
    const own = void 0 === part.color ? null : paint.partColor(part.color).fill;
    if (own) return own;
    if (line && 'inner' !== part.tone) return paint.ink;
    switch(part.tone){
        case 'body':
            return paint.ink;
        case 'leaf':
            return paint.leaf;
        case 'inner':
            return mixPaint(paint.solid, '#fff', 100 * INNER_WHITE);
        case 'hair':
            return mixPaint(paint.solid, paint.hairShade, 100 * HAIR_SHADE_OPACITY);
    }
}
const fillKey = (part)=>void 0 === part.color ? part.tone : `${part.tone}-${fnv1a32(part.color).toString(36)}`;
function grainTones(variant, paint, parts) {
    if (!grainsFills(variant)) return [];
    const fills = new Map(TONES.map((tone)=>[
            tone,
            pieceColor({
                tone
            }, paint, false)
        ]));
    for (const part of parts)if (void 0 !== part.color) fills.set(fillKey(part), pieceColor(part, paint, false));
    const list = [
        ...fills
    ];
    return 'watercolor' === variant ? list.map(([key, color])=>[
            key,
            mixPaint(color, '#fff', WASH_WHITE)
        ]) : list;
}
const GRAINED_FILLS = new Set([
    'crayon',
    'watercolor',
    'gothic'
]);
const grainsFills = (variant)=>GRAINED_FILLS.has(variant) || media_DEFINED.get(variant)?.grainedFills === true;
const grainOf = (variant)=>GRAIN[variant] ?? media_DEFINED.get(variant)?.grain;
const grainLevel = (params)=>Math.round(10 * params.grain);
const defId = (prefix, name, params)=>`${prefix}-${name}${grainLevel(params)}`;
function grainedFill(variant, prefix, params, key, color) {
    if (!prefix || !grainsFills(variant) || params.grain <= 0 || color.startsWith('url(')) return color;
    return `url(#${defId(prefix, key, params)})`;
}
const DASHES = {
    crayon: {
        dash: [
            3,
            9
        ],
        gap: [
            0.6,
            1.8
        ],
        seed: 73
    }
};
const dashCache = new Map();
function media_dashes(variant, grain) {
    const spec = DASHES[variant];
    if (!spec || grain <= 0) return;
    const key = `${variant}:${grain}`;
    let value = dashCache.get(key);
    if (void 0 === value) {
        const rand = mulberry32(spec.seed);
        const pairs = [];
        for(let i = 0; i < 16; i++){
            const dash = spec.dash[0] + rand() * (spec.dash[1] - spec.dash[0]);
            const gap = (spec.gap[0] + rand() * (spec.gap[1] - spec.gap[0])) * grain;
            pairs.push(`${media_f1(dash)} ${media_f1(gap)}`);
        }
        value = pairs.join(' ');
        dashCache.set(key, value);
    }
    return value;
}
function mediumDefs(variant, prefix, given, params, parts = []) {
    const paint = paintFor(variant, given);
    const children = [];
    const spec = grainOf(variant);
    if (spec && params.grain > 0) {
        const image = `${prefix}-texture`;
        const strength = (share)=>media_pct(Math.min(1, spec.opacity * params.grain * share));
        const paper = (share)=>[
                scene_node('rect', {
                    ...tileAttrs(spec),
                    fill: '#fff'
                }),
                scene_node('use', {
                    href: `#${image}`,
                    opacity: strength(share)
                })
            ];
        const mask = defId(prefix, 'grain', params);
        const tones = grainTones(variant, paint, parts);
        children.push(scene_node('image', {
            id: image,
            href: grainImage(spec, true),
            ...tileAttrs(spec),
            preserveAspectRatio: 'none'
        }));
        if (tones.length > 0) children.push(scene_node('mask', {
            id: mask,
            maskUnits: 'userSpaceOnUse',
            x: 0,
            y: 0,
            ...tileAttrs(spec)
        }, paper(1)));
        const settled = 'watercolor' === variant || media_DEFINED.get(variant)?.pigment === true ? pigment(prefix, params, children) : null;
        for (const [tone, color] of tones)if (!color.startsWith('url(')) children.push(scene_node('pattern', patternAttrs(defId(prefix, tone, params), spec), [
            scene_node('rect', {
                ...tileAttrs(spec),
                fill: color,
                mask: `url(#${mask})`
            }),
            ...settled ? [
                settled
            ] : []
        ]));
        if (spec.body > 0) {
            const tile = defId(prefix, 'body-tile', params);
            children.push(scene_node('pattern', patternAttrs(tile, spec), paper(spec.body)), scene_node('mask', {
                id: defId(prefix, 'body', params),
                ...media_around(0.25)
            }, [
                scene_node('rect', {
                    ...REGION,
                    fill: `url(#${tile})`
                })
            ]), scene_node('mask', {
                id: defId(prefix, 'over', params),
                ...media_around(0.6)
            }, [
                scene_node('rect', {
                    ...REGION,
                    fill: `url(#${tile})`
                })
            ]));
        }
    }
    if ('neon' === variant && params.neonGlow > 0) children.push(...glowFilters(prefix, params.neonGlow));
    if ('marker' === variant) children.push(rimFilter(`${prefix}-rim`, mixPaint(paint.solid, '#000', 62)));
    children.push(...media_DEFINED.get(variant)?.defs?.(prefix, paint, params) ?? []);
    return scene_node('defs', void 0, children);
}
function pigment(prefix, params, children) {
    const image = `${prefix}-pigment-texture`;
    const mask = defId(prefix, 'pigment', params);
    const tile = {
        width: PIGMENT.tile,
        height: PIGMENT.tile
    };
    children.push(scene_node('image', {
        id: image,
        href: grainImage(PIGMENT, false),
        ...tile,
        preserveAspectRatio: 'none'
    }), scene_node('mask', {
        id: mask,
        maskUnits: 'userSpaceOnUse',
        x: 0,
        y: 0,
        ...tile
    }, [
        scene_node('use', {
            href: `#${image}`
        })
    ]));
    return scene_node('rect', {
        ...tile,
        fill: '#000',
        'fill-opacity': media_pct(Math.min(1, PIGMENT.opacity * params.grain)),
        mask: `url(#${mask})`
    });
}
const filterAttrs = (id, margin)=>({
        id,
        ...media_around(margin),
        'color-interpolation-filters': 'sRGB'
    });
const glowId = (prefix, glow, role)=>`${prefix}-${role}-glow${glow}`;
function glowFilters(prefix, glow) {
    const halo = [
        scene_node('feGaussianBlur', {
            in: 'SourceGraphic',
            stdDeviation: media_f1(0.55 * glow),
            result: 'blur'
        }),
        scene_node('feComponentTransfer', {
            in: 'blur',
            result: 'halo'
        }, [
            scene_node('feFuncA', {
                type: 'linear',
                slope: 2
            })
        ]),
        scene_node('feMerge', void 0, [
            scene_node('feMergeNode', {
                in: 'halo'
            }),
            scene_node('feMergeNode', {
                in: 'SourceGraphic'
            })
        ])
    ];
    return [
        scene_node('filter', filterAttrs(glowId(prefix, glow, 'body'), 0.25), halo),
        scene_node('filter', filterAttrs(glowId(prefix, glow, 'over'), 0.6), halo)
    ];
}
function rimFilter(id, color) {
    const flood = color.startsWith('url(') ? 'currentColor' : color;
    return scene_node('filter', filterAttrs(id, 0.3), [
        scene_node('feMorphology', {
            in: 'SourceAlpha',
            operator: 'dilate',
            radius: 1.5,
            result: 'fat'
        }),
        scene_node('feFlood', {
            'flood-color': flood
        }),
        scene_node('feComposite', {
            in2: 'fat',
            operator: 'in',
            result: 'rim'
        }),
        scene_node('feMerge', void 0, [
            scene_node('feMergeNode', {
                in: 'rim'
            }),
            scene_node('feMergeNode', {
                in: 'SourceGraphic'
            })
        ])
    ]);
}
function mediumTreatment(variant, prefix, params, role) {
    const spec = grainOf(variant);
    if (spec) {
        if ('face' === role || spec.body <= 0 || params.grain <= 0) return;
        return {
            mask: `url(#${defId(prefix, role, params)})`
        };
    }
    if ('neon' === variant) {
        if ('face' === role || params.neonGlow <= 0) return;
        return {
            filter: `url(#${glowId(prefix, params.neonGlow, role)})`
        };
    }
    if ('marker' === variant) return 'face' === role ? {
        filter: `url(#${prefix}-rim)`
    } : void 0;
}
const media_TAU = 2 * Math.PI;
function media_normals(ring) {
    const n = ring.length;
    let area = 0;
    for(let i = 0; i < n; i++){
        const a = ring[i];
        const b = ring[(i + 1) % n];
        area += a[0] * b[1] - b[0] * a[1];
    }
    const s = area >= 0 ? 1 : -1;
    return ring.map((_, i)=>{
        const a = ring[(i - 1 + n) % n];
        const b = ring[(i + 1) % n];
        const tx = b[0] - a[0];
        const ty = b[1] - a[1];
        const len = Math.hypot(tx, ty) || 1;
        return [
            s * ty / len,
            -s * tx / len
        ];
    });
}
function handWave(seed) {
    const rand = mulberry32(seed);
    const waves = [
        [
            2,
            0.5
        ],
        [
            3,
            0.32
        ],
        [
            5,
            0.2
        ],
        [
            8,
            0.12
        ]
    ].map(([freq, amp])=>({
            freq,
            amp,
            phase: rand() * media_TAU
        }));
    return (t)=>waves.reduce((sum, w)=>sum + w.amp * Math.sin(media_TAU * w.freq * t + w.phase), 0);
}
function media_extentOf(ring) {
    let minX = 1 / 0;
    let minY = 1 / 0;
    let maxX = -1 / 0;
    let maxY = -1 / 0;
    for (const [x, y] of ring){
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    return {
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        size: Math.max(maxX - minX, maxY - minY)
    };
}
const wobbleScale = (size)=>Math.min(1, Math.max(0.3, size / 160));
function displaced(ring, offset) {
    const nrm = media_normals(ring);
    return ring.map((p, i)=>{
        const o = offset(i);
        return [
            p[0] + nrm[i][0] * o,
            p[1] + nrm[i][1] * o
        ];
    });
}
function densified(ring) {
    const out = [];
    for(let i = 0; i < ring.length; i++){
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        out.push([
            a[0],
            a[1]
        ], [
            (a[0] + b[0]) / 2,
            (a[1] + b[1]) / 2
        ]);
    }
    return out;
}
const pt = (p)=>`${media_f1(p[0])} ${media_f1(p[1])}`;
const media_mid = (a, b)=>[
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2
    ];
function closedCurve(points) {
    const n = points.length;
    if (n < 3) return '';
    let d = `M${pt(media_mid(points[n - 1], points[0]))}`;
    for(let i = 0; i < n; i++)d += `Q${pt(points[i])} ${pt(media_mid(points[i], points[(i + 1) % n]))}`;
    return `${d}Z`;
}
function openCurve(points) {
    const n = points.length;
    if (n < 2) return '';
    let d = `M${pt(points[0])}`;
    for(let i = 1; i < n - 1; i++)d += `Q${pt(points[i])} ${pt(media_mid(points[i], points[i + 1]))}`;
    return `${d}L${pt(points[n - 1])}`;
}
function media_inside(ring, x, y) {
    let hit = false;
    for(let i = 0, j = ring.length - 1; i < ring.length; j = i++){
        const a = ring[i];
        const b = ring[j];
        if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
}
function media_crossings(pu, pv, c) {
    const n = pu.length;
    const out = [];
    for(let i = 0; i < n; i++){
        const j = (i + 1) % n;
        const a = pu[i] - c;
        const b = pu[j] - c;
        if (a < 0 && b >= 0 || a >= 0 && b < 0) out.push(pv[i] + (pv[j] - pv[i]) * a / (a - b));
    }
    return out.sort((x, y)=>x - y);
}
function subtract(from, minus) {
    let out = from;
    for(let k = 0; k + 1 < minus.length; k += 2){
        const [m0, m1] = [
            minus[k],
            minus[k + 1]
        ];
        const next = [];
        for(let i = 0; i + 1 < out.length; i += 2){
            const [a, b] = [
                out[i],
                out[i + 1]
            ];
            if (m1 <= a || m0 >= b) next.push(a, b);
            else {
                if (m0 > a) next.push(a, m0);
                if (m1 < b) next.push(m1, b);
            }
        }
        out = next;
    }
    return out;
}
function media_hatch(ring, spec) {
    const a = spec.angle * Math.PI / 180;
    const v = [
        Math.cos(a),
        Math.sin(a)
    ];
    const u = [
        -v[1],
        v[0]
    ];
    const pu = ring.map((p)=>p[0] * u[0] + p[1] * u[1]);
    const pv = ring.map((p)=>p[0] * v[0] + p[1] * v[1]);
    const shade = spec.shade;
    const su = shade ? shade[0] * u[0] + shade[1] * u[1] : 0;
    const sv = shade ? shade[0] * v[0] + shade[1] * v[1] : 0;
    const rand = mulberry32(spec.seed);
    const lo = Math.min(...pu);
    const hi = Math.max(...pu);
    const lines = [];
    for(let c = lo + spec.gap * (0.3 + 0.5 * rand()); c < hi; c += spec.gap * (0.85 + 0.3 * rand())){
        let span = media_crossings(pu, pv, c);
        if (shade) {
            const moved = media_crossings(pu.map((x)=>x + su), pv.map((x)=>x + sv), c);
            span = subtract(span, moved);
        }
        const strokes = [];
        for(let k = 0; k + 1 < span.length; k += 2){
            const t0 = span[k] + rand() * spec.ragged;
            const t1 = span[k + 1] - rand() * spec.ragged;
            if (t1 - t0 < 0.6 * spec.gap) continue;
            const at = (t)=>[
                    c * u[0] + t * v[0],
                    c * u[1] + t * v[1]
                ];
            strokes.push([
                at(t0),
                at(t1)
            ]);
        }
        lines.push(strokes);
    }
    return lines;
}
function strokesPath(lines) {
    let d = '';
    for (const line of lines)for (const [a, b] of line)d += `M${pt(a)}L${pt(b)}`;
    return d;
}
function scribblePath(lines) {
    let d = '';
    let chained = false;
    let flip = false;
    for (const line of lines){
        if (1 !== line.length) {
            for (const [a, b] of line)d += `M${pt(a)}L${pt(b)}`;
            chained = false;
            continue;
        }
        const [a, b] = line[0];
        const [first, last] = flip ? [
            b,
            a
        ] : [
            a,
            b
        ];
        d += `${chained ? 'L' : 'M'}${pt(first)}L${pt(last)}`;
        chained = true;
        flip = !flip;
    }
    return d;
}
const media_cache = new WeakMap();
function remember(ring, key, make) {
    let entry = media_cache.get(ring);
    if (!entry) {
        entry = new Map();
        media_cache.set(ring, entry);
    }
    let value = entry.get(key);
    if (void 0 === value) {
        value = make();
        entry.set(key, value);
    }
    return value;
}
function wobbleClosed(ring, seed, amp) {
    const wave = handWave(seed);
    const n = ring.length;
    return displaced(ring, (i)=>amp * wave(i / n));
}
function overshoot(ring, seed, amp) {
    const n = ring.length;
    const rand = mulberry32(seed);
    const start = Math.floor(rand() * n);
    const extra = Math.round(0.09 * n);
    const wave = handWave(seed + 1);
    const nrm = media_normals(ring);
    const out = [];
    for(let k = 0; k <= n + extra; k++){
        const i = (start + k) % n;
        const o = amp * wave(k / n) + 0.7 * amp * (k / (n + extra) - 0.5);
        out.push([
            ring[i][0] + nrm[i][0] * o,
            ring[i][1] + nrm[i][1] * o
        ]);
    }
    return out;
}
function pools(ring, wash) {
    const { cx, cy, size } = media_extentOf(ring);
    const rand = mulberry32(59);
    const out = [];
    for(let k = 0; k < 2; k++){
        const scale = 0.38 + 0.24 * rand();
        const ox = (rand() - 0.5) * size * 0.28;
        const oy = (rand() - 0.5) * size * 0.28;
        const wave = handWave(61 + k);
        const n = wash.length;
        const blot = wash.map((p, i)=>{
            const s = scale * (1 + 0.12 * wave(i / n));
            return [
                cx + ox + (p[0] - cx) * s,
                cy + oy + (p[1] - cy) * s
            ];
        });
        if (blot.every((p, i)=>i % 4 !== 0 || media_inside(wash, p[0], p[1]))) out.push(closedCurve(blot));
    }
    return out;
}
function mediumBody(frame, variant, given, { params, minLine }, prefix, live, motion, into) {
    const paint = paintFor(variant, given);
    const line = isLineVariant(variant);
    const core = frame.body.coreOpacity;
    const behind = [];
    const front = [];
    const merged = line ? mergedSilhouette(frame) : null;
    const shown = (part)=>live || part.opacity > 0.01;
    const alpha = (part)=>!live && part.opacity >= 1 ? void 0 : media_pct(part.opacity);
    let moving = null;
    for (const part of frame.body.parts){
        if (!shown(part)) continue;
        if (isBodyPiece(part) && merged) continue;
        if ('inner' === part.tone && line) continue;
        const piece = {
            ring: part.outline,
            tone: part.tone,
            color: pieceColor(part, paint, line),
            key: fillKey(part),
            mass: isBodyPiece(part),
            plain: true === part.plain,
            moving: void 0 !== part.motion,
            opacity: alpha(part)
        };
        if (part.motion && motion) (moving ??= new Map()).set(piece, part);
        ('body' === part.tone ? behind : front).push(piece);
    }
    const body = {
        ring: merged ?? frame.body.outline,
        tone: 'body',
        color: paint.ink,
        key: 'body',
        mass: true,
        plain: false,
        moving: false,
        opacity: void 0
    };
    const share = LINE_SHARE[variant] ?? 0;
    const fill = (piece, color = piece.color)=>grainedFill(variant, prefix, params, piece.key, color);
    const dash = media_dashes(variant, params.grain);
    const mood = moodOf(frame.state);
    const defined = media_DEFINED.get(variant);
    const follows = defined?.followsMood === true;
    const vivid = defined?.moodAccent;
    const extras = vivid ? themeExtras() : null;
    const lean = (color, at)=>extras && vivid ? extras.lean(color, at, vivid) : leanInto(color, at);
    const accent = (color)=>({
            fill: follows ? lean(color, mood) : color,
            style: follows && live ? `transition:fill ${MOOD_EASE_MS}ms ease` : void 0
        });
    const all = [
        ...behind,
        body,
        ...front
    ];
    const face = getShape(frame.shape).face;
    const context = (piece)=>({
            paint,
            params,
            fill,
            line: piece.color === paint.ink ? paint.line : paint.lineOf(piece.color),
            dash,
            width: share > 0 ? Math.max(params.strokeWidth * share, minLine) : 0,
            wobble: params.wobble * wobbleScale(media_extentOf(piece.ring).size),
            minLine,
            settled: null === frame.belt,
            kit: media_KIT,
            live,
            prefix,
            mood,
            accent,
            face,
            pieces: all
        });
    const rim = !line && paint.rim ? scene_node('path', {
        d: ringsPath([
            body.ring
        ]),
        fill: 'none',
        ...bodyRim(paint.rim)
    }) : null;
    const draw = (piece)=>scene_node('g', {
            opacity: piece.opacity
        }, [
            ...painterOf(variant)(piece, context(piece)),
            ...piece === body && rim ? [
                rim
            ] : []
        ]);
    const parts = moving;
    const drawn = parts && motion ? all.flatMap((piece)=>{
        const part = parts.get(piece);
        if (!part) return [
            draw(piece)
        ];
        const nodes = motion.part(part, [
            draw(piece)
        ]);
        if (!into) return nodes;
        ('body' === piece.tone ? into.below : into.above).push(...nodes);
        return [];
    }) : all.map(draw);
    let under = defined?.underlay?.(frame, all, context(body)) ?? [];
    const breathes = motion && under.length > 0 ? defined?.underlayMotion?.(frame) : void 0;
    if (motion && breathes) {
        under = motion.play(breathes, under);
        if (into) {
            into.below.unshift(...under);
            under = [];
        }
    }
    return [
        scene_node('g', {
            opacity: null === core ? void 0 : media_pct(core)
        }, [
            ...under,
            ...drawn
        ])
    ];
}
const edgeFor = (variant, piece, ctx)=>mixPaint(piece.color === ctx.paint.ink ? ctx.paint.solid : piece.color, '#000', EDGE_DARKNESS[variant] ?? 30);
const tintOf = (piece, base)=>'hair' === piece.tone ? 4 * base : base;
const ORIGAMI = {
    levels: 4,
    light: 0.2,
    dark: 0.13,
    shadow: 0.1,
    lift: [
        2,
        5
    ],
    crease: 0.7,
    creaseOpacity: 0.12,
    edge: 22,
    edgeWidth: 1.2
};
const RELIEF = {
    shadow: 0.16,
    lift: [
        4,
        8
    ],
    lit: {
        width: 8,
        opacity: 0.5,
        shift: [
            -3,
            -3.5
        ]
    },
    shade: {
        width: 10,
        opacity: 0.2,
        shift: [
            3.5,
            4.5
        ]
    },
    edge: 18,
    edgeWidth: 1
};
const reliefScale = (size)=>Math.min(1, Math.max(0.4, size / 160));
const polygonPath = (points)=>points.length < 3 ? '' : `M${points.map((p)=>pt(p)).join('L')}Z`;
const PAINTERS = {
    pencil (piece, ctx) {
        const { ring } = piece;
        const line = ctx.line;
        const w = ctx.width;
        const out = [
            scene_node('path', {
                d: remember(ring, 'curve', ()=>closedCurve(ring)),
                fill: piece.color,
                'fill-opacity': tintOf(piece, 0.1)
            })
        ];
        if (ctx.params.hatching) {
            const d = remember(ring, 'pencil-shade', ()=>{
                const { size } = media_extentOf(ring);
                const s = Math.max(6, 0.1 * size);
                return strokesPath(media_hatch(ring, {
                    angle: 50,
                    gap: 3.4,
                    ragged: 2.5,
                    seed: 5,
                    shade: [
                        0.66 * -s,
                        0.75 * -s
                    ]
                }));
            });
            out.push(scene_node('path', {
                d,
                stroke: line,
                'stroke-width': media_f1(0.26 * w),
                'stroke-opacity': 0.55
            }));
        }
        const wob = ctx.wobble;
        out.push(scene_node('path', {
            d: remember(ring, `pencil-a${wob}`, ()=>closedCurve(wobbleClosed(ring, 7, 0.55 * wob))),
            stroke: line,
            'stroke-width': media_f1(w),
            'stroke-linejoin': 'round',
            'stroke-dasharray': ctx.dash
        }), scene_node('path', {
            d: remember(ring, `pencil-b${wob}`, ()=>openCurve(overshoot(ring, 13, 1.2 * wob))),
            stroke: line,
            'stroke-width': media_f1(0.7 * w),
            'stroke-opacity': 0.45,
            'stroke-dasharray': ctx.dash,
            'stroke-dashoffset': 9
        }));
        return out;
    },
    marker (piece, ctx) {
        const { ring, color } = piece;
        const w = ctx.width;
        const wob = ctx.wobble;
        const dark = edgeFor('marker', piece, ctx);
        const scribble = remember(ring, `marker-fill${media_f1(w)}`, ()=>{
            const inset = displaced(ring, ()=>0.7 * -w);
            return scribblePath(media_hatch(inset, {
                angle: -52,
                gap: 1.45 * w,
                ragged: 0.5 * w,
                seed: 17
            }));
        });
        return [
            scene_node('path', {
                d: remember(ring, `marker-under${wob}`, ()=>closedCurve(wobbleClosed(ring, 19, 0.8 * wob))),
                fill: color,
                'fill-opacity': 0.3,
                transform: 'translate(3 3)'
            }),
            scene_node('path', {
                d: scribble,
                stroke: color,
                'stroke-width': media_f1(1.05 * w),
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
            }),
            scene_node('path', {
                d: remember(ring, `marker-a${wob}`, ()=>closedCurve(wobbleClosed(ring, 23, 0.45 * wob))),
                stroke: dark,
                'stroke-width': media_f1(w),
                'stroke-linejoin': 'round'
            }),
            scene_node('path', {
                d: remember(ring, `marker-b${wob}`, ()=>openCurve(overshoot(ring, 29, wob))),
                stroke: dark,
                'stroke-width': media_f1(0.55 * w),
                'stroke-linecap': 'round',
                'stroke-opacity': 0.5,
                transform: 'translate(2.4 -2)'
            })
        ];
    },
    crayon (piece, ctx) {
        const { ring } = piece;
        const wob = ctx.wobble;
        const d = remember(ring, `crayon${wob}`, ()=>{
            const wave = handWave(31);
            const rand = mulberry32(37);
            const dense = densified(ring);
            const n = dense.length;
            return closedCurve(displaced(dense, (i)=>0.4 * wob * wave(i / n) + 0.45 * wob * (2 * rand() - 1)));
        });
        return [
            scene_node('path', {
                d,
                fill: ctx.fill(piece)
            }),
            scene_node('path', {
                d,
                stroke: edgeFor('crayon', piece, ctx),
                'stroke-width': 3.6,
                'stroke-linejoin': 'round',
                'stroke-dasharray': ctx.dash,
                'stroke-opacity': 0.75
            })
        ];
    },
    watercolor (piece, ctx) {
        const { ring, color } = piece;
        const wob = ctx.wobble;
        const dark = edgeFor('watercolor', piece, ctx);
        const wash = remember(ring, `wash${wob}`, ()=>wobbleClosed(ring, 41, 0.6 * wob));
        const washD = remember(ring, `wash-d${wob}`, ()=>closedCurve(wash));
        const out = [
            scene_node('path', {
                d: washD,
                fill: ctx.fill(piece, mixPaint(color, '#fff', WASH_WHITE)),
                'fill-opacity': color.startsWith('url(') ? 0.78 : 0.94
            })
        ];
        remember(ring, `pools${wob}`, ()=>pools(ring, wash)).forEach((blot, k)=>{
            out.push(scene_node('path', {
                d: blot,
                fill: 0 === k ? color : '#fff',
                'fill-opacity': 0 === k ? 0.2 : 0.09,
                stroke: dark,
                'stroke-width': 0.9,
                'stroke-opacity': 0 === k ? 0.2 : 0.26
            }));
        });
        out.push(scene_node('path', {
            d: remember(ring, `wash-band${wob}`, ()=>closedCurve(displaced(wash, ()=>-2.6))),
            stroke: dark,
            'stroke-width': 5.2,
            'stroke-opacity': 0.2
        }), scene_node('path', {
            d: washD,
            stroke: dark,
            'stroke-width': 1.5,
            'stroke-opacity': 0.6
        }));
        return out;
    },
    neon (piece, ctx) {
        const { ring } = piece;
        const d = remember(ring, 'curve', ()=>closedCurve(ring));
        const w = ctx.width;
        return [
            scene_node('path', {
                d,
                fill: piece.color,
                'fill-opacity': tintOf(piece, 0.05)
            }),
            scene_node('path', {
                d,
                stroke: piece.color,
                'stroke-width': media_f1(w),
                'stroke-linejoin': 'round'
            }),
            scene_node('path', {
                d,
                stroke: ctx.line,
                'stroke-width': media_f1(0.36 * w),
                'stroke-linejoin': 'round'
            })
        ];
    },
    chalk (piece, ctx) {
        const { ring } = piece;
        const line = ctx.line;
        const w = ctx.width;
        const wob = ctx.wobble;
        const curve = remember(ring, 'curve', ()=>closedCurve(ring));
        const out = [
            scene_node('path', {
                d: curve,
                stroke: line,
                'stroke-width': media_f1(2.6 * w),
                'stroke-opacity': 0.07
            }),
            scene_node('path', {
                d: curve,
                fill: piece.color,
                'fill-opacity': tintOf(piece, 0.05)
            })
        ];
        if (ctx.params.hatching) {
            const d = remember(ring, 'chalk-fill', ()=>strokesPath(media_hatch(ring, {
                    angle: -55,
                    gap: 7.5,
                    ragged: 4,
                    seed: 43
                })));
            out.push(scene_node('path', {
                d,
                stroke: line,
                'stroke-width': media_f1(0.36 * w),
                'stroke-dasharray': ctx.dash,
                'stroke-opacity': 'hair' === piece.tone ? 0.8 : 0.5
            }));
        }
        out.push(scene_node('path', {
            d: remember(ring, `chalk-a${wob}`, ()=>closedCurve(wobbleClosed(ring, 47, 0.6 * wob))),
            stroke: line,
            'stroke-width': media_f1(w),
            'stroke-linejoin': 'round',
            'stroke-dasharray': ctx.dash
        }), scene_node('path', {
            d: remember(ring, `chalk-b${wob}`, ()=>openCurve(overshoot(ring, 53, 1.1 * wob))),
            stroke: line,
            'stroke-width': media_f1(0.6 * w),
            'stroke-opacity': 0.45,
            'stroke-dasharray': ctx.dash,
            'stroke-dashoffset': 5
        }));
        return out;
    },
    origami (piece, ctx) {
        const { ring, color } = piece;
        const sheet = remember(ring, 'origami', ()=>{
            const { polygon, facets } = fold(ring);
            const shades = new Map();
            for (const facet of facets){
                const level = Math.round(facet.light * ORIGAMI.levels) / ORIGAMI.levels;
                if (0 !== level) shades.set(level, (shades.get(level) ?? '') + polygonPath(facet.ring));
            }
            return {
                outline: polygonPath(polygon),
                shades: [
                    ...shades
                ].sort(([a], [b])=>a - b),
                creases: facets.map((facet)=>polygonPath(facet.ring)).join('')
            };
        });
        const out = [
            scene_node('path', {
                d: sheet.outline,
                fill: '#000',
                'fill-opacity': ORIGAMI.shadow,
                transform: `translate(${ORIGAMI.lift[0]} ${ORIGAMI.lift[1]})`
            }),
            scene_node('path', {
                d: sheet.outline,
                fill: ctx.fill(piece)
            })
        ];
        for (const [level, d] of sheet.shades)out.push(scene_node('path', {
            d,
            fill: level > 0 ? '#fff' : '#000',
            'fill-opacity': media_pct(level > 0 ? level * ORIGAMI.light : -level * ORIGAMI.dark)
        }));
        if (sheet.creases) out.push(scene_node('path', {
            d: sheet.creases,
            stroke: '#fff',
            'stroke-width': ORIGAMI.crease,
            'stroke-opacity': ORIGAMI.creaseOpacity,
            'stroke-linejoin': 'round'
        }));
        out.push(scene_node('path', {
            d: sheet.outline,
            stroke: mixPaint(color === ctx.paint.ink ? ctx.paint.solid : color, '#000', ORIGAMI.edge),
            'stroke-width': ORIGAMI.edgeWidth,
            'stroke-linejoin': 'round'
        }));
        return out;
    },
    relief (piece, ctx) {
        const { ring, color } = piece;
        const d = remember(ring, 'curve', ()=>closedCurve(ring));
        const k = reliefScale(media_extentOf(ring).size);
        const clip = `${ctx.prefix ?? 'aora'}-relief-${fnv1a32(d).toString(36)}`;
        const rim = (spec, paint)=>scene_node('path', {
                d,
                stroke: paint,
                'stroke-opacity': spec.opacity,
                'stroke-width': media_f1(spec.width * k),
                transform: `translate(${media_f1(spec.shift[0] * k)} ${media_f1(spec.shift[1] * k)})`
            });
        return [
            scene_node('clipPath', {
                id: clip
            }, [
                scene_node('path', {
                    d
                })
            ]),
            scene_node('path', {
                d,
                fill: '#000',
                'fill-opacity': RELIEF.shadow,
                transform: `translate(${media_f1(RELIEF.lift[0] * k)} ${media_f1(RELIEF.lift[1] * k)})`
            }),
            scene_node('path', {
                d,
                fill: ctx.fill(piece)
            }),
            scene_node('g', {
                'clip-path': `url(#${clip})`
            }, [
                rim(RELIEF.shade, '#000'),
                rim(RELIEF.lit, '#fff')
            ]),
            scene_node('path', {
                d,
                stroke: mixPaint(color === ctx.paint.ink ? ctx.paint.solid : color, '#000', RELIEF.edge),
                'stroke-width': RELIEF.edgeWidth
            })
        ];
    },
    gothic: paintGothic
};
const painterOf = (variant)=>isBuiltin(variant) ? PAINTERS[variant] : media_DEFINED.get(variant).paint;
const ringsPath = (rings)=>rings.map((ring)=>closedCurve(ring)).join('');
const media_KIT = {
    node: scene_node,
    remember,
    closedCurve,
    ringsPath,
    extentOf: media_extentOf,
    hatchPath: (ring, spec)=>strokesPath(media_hatch(ring, spec)),
    mixPaint,
    f1: media_f1
};
function faceInkOf(variant, face, ink) {
    const own = media_DEFINED.get(variant)?.faceInk;
    const extras = own ? themeExtras() : null;
    return own && extras ? extras.faceInk(face, ink, own) : face;
}
const media_DEFINED = new Map();
const mediumReaches = (variant)=>(media_DEFINED.get(variant)?.reach ?? 0) > 0;
function paintFor(variant, paint) {
    const defined = media_DEFINED.get(variant);
    if (!defined?.hairShade && !defined?.leaf) return paint;
    return {
        ...paint,
        ...defined.hairShade ? {
            hairShade: defined.hairShade(paint)
        } : null,
        ...defined.leaf ? {
            leaf: defined.leaf(paint)
        } : null
    };
}
function defineMedium(id, definition) {
    if (isBuiltin(id)) throw new Error(`"${id}" is a built-in medium`);
    media_DEFINED.set(id, {
        ...definition,
        grain: definition.grain && {
            ...definition.grain,
            body: 0
        }
    });
}
const LEAN_CHROMA = new Map(STATE_MOODS.map((mood)=>{
    const lean = MOOD_LEAN[mood];
    return [
        mood,
        lean ? Math.round(chromaHex(lean.tint) * lean.share * 10) / 1000 : 0
    ];
}));
function leanInto(color, mood) {
    const lean = MOOD_LEAN[mood];
    if (!lean || color.startsWith('url(')) return color;
    return `oklch(from ${mixPaint(color, lean.tint, lean.share)} l max(c, ${LEAN_CHROMA.get(mood)}) h / alpha)`;
}
const DEFAULT_WRAPPER = [
    '(',
    ')'
];
const SHAPE_WRAPPERS = {
    cat: [
        'ฅ(',
        ')ฅ'
    ],
    bunny: [
        '૮(',
        ')ა'
    ],
    bear: [
        'ʕ',
        'ʔ'
    ],
    crescent: [
        '☾(',
        ')'
    ],
    gem: [
        '◇(',
        ')'
    ],
    clover: [
        '✤(',
        ')'
    ],
    bot: [
        '[',
        ']'
    ],
    tofu: [
        '[',
        ']'
    ],
    ghost: [
        '༼ ',
        ' ༽'
    ],
    sprout: [
        'ʚ(',
        ')ɞ'
    ],
    cloud: [
        '☁(',
        ')'
    ],
    heart: [
        '♡(',
        ')'
    ],
    star: [
        '☆(',
        ')'
    ],
    flower: [
        '✿(',
        ')'
    ],
    onigiri: [
        '△(',
        ')'
    ],
    pill: [
        '⊂(',
        ')⊃'
    ],
    hex: [
        '⬡(',
        ')'
    ],
    leaf: [
        '❀(',
        ')'
    ],
    flame: [
        '♨(',
        ')'
    ],
    bell: [
        '♪(',
        ')'
    ],
    apple: [
        '◖(',
        ')◗'
    ],
    strawberry: [
        '∴(',
        ')∴'
    ],
    cherry: [
        '⚬(',
        ')⚬'
    ],
    acorn: [
        '⌒(',
        ')'
    ],
    cactus: [
        '٩(',
        ')۶'
    ],
    fish: [
        '(',
        ')><'
    ],
    octopus: [
        '〜(',
        ')〜'
    ],
    pig: [
        '∪(',
        ')∪'
    ],
    fox: [
        '/(',
        ')\\'
    ],
    boba: [
        '◦(',
        ')◦'
    ],
    lion: [
        '✺(',
        ')✺'
    ],
    candy: [
        '▷(',
        ')◁'
    ],
    planet: [
        '⊖(',
        ')'
    ],
    cottage: [
        '⌂(',
        ')'
    ],
    chat: [
        '「',
        '」'
    ]
};
const STATE_FACES = {
    idle: '・ω・',
    sleeping: '－ω－',
    drowsy: '˘ω˘',
    bored: '・_・',
    waking: '°ω°',
    'powering-down': '－_－',
    listening: '・ᴗ・',
    thinking: '・_・',
    searching: '◉_◉',
    reading: '・‿・',
    writing: '•̀ᴗ•́',
    working: '•̀ᴗ•́',
    loading: '・ᴗ・',
    progress: '•̀ᴗ•́',
    radar: '◉_◉',
    orbit: '・ᴗ・',
    dictating: '・o・',
    uploading: '^▽^',
    sending: '・ᴗ・',
    receiving: '°▽°',
    messaging: '・ᴗ・',
    waiting: '・_・',
    spawning: '°ᴗ°',
    composing: '・ᴗ・',
    dragging: '°o°',
    happy: '^▽^',
    excited: '≧▽≦',
    laughing: 'ᵔ◡ᵔ',
    playful: '^ω~',
    proud: 'ˊᗜˋ',
    celebrate: '★▽★',
    bouncing: '^ᴗ^',
    shy: '〃ω〃',
    sad: '；ω；',
    angry: 'ò_ó',
    confused: '◔_◔',
    suspicious: '¬_¬',
    surprised: '°□°',
    scared: '°△°',
    curious: '・o・',
    humming: '‾ᴗ‾',
    alerting: '°□°',
    notifying: '・▽・',
    refusing: '＞_＜'
};
const STATE_TAILS = {
    idle: '',
    sleeping: ' zZ',
    drowsy: ' z',
    bored: '',
    waking: ' !',
    'powering-down': ' …',
    listening: '',
    thinking: '?',
    searching: ' ?',
    reading: '',
    writing: ' ✎',
    working: 'و',
    loading: ' …',
    progress: ' …',
    radar: '',
    orbit: '',
    dictating: ' ♪',
    uploading: ' ↑',
    sending: ' ➤',
    receiving: ' ↓',
    messaging: ' ✉',
    waiting: ' …',
    spawning: ' ✧',
    composing: ' ✎',
    dragging: '',
    happy: ' ♪',
    excited: '!',
    laughing: ' ♪',
    playful: ' ~',
    proud: ' ✧',
    celebrate: ' ✧',
    bouncing: ' ~',
    shy: '',
    sad: '',
    angry: ' !',
    confused: '?',
    suspicious: '',
    surprised: '!!',
    scared: ' !',
    curious: ' ?',
    humming: ' ♪',
    alerting: ' !',
    notifying: ' !',
    refusing: ' !'
};
function wrapperFor(shape) {
    return SHAPE_WRAPPERS[shape] ?? DEFAULT_WRAPPER;
}
function faceText(state, face = 'cute') {
    return isDrawnFace(face) ? drawnFaceText(getFaceDesign(face), state) : STATE_FACES[state];
}
function kaomoji(shape, state, face = 'cute') {
    const [open, close] = wrapperFor(shape);
    return `${open}${faceText(state, face)}${close}${STATE_TAILS[state]}`;
}
function measureEms(text) {
    let ems = 0;
    for (const ch of text){
        const code = ch.codePointAt(0);
        if (!(code >= 0x300) || !(code <= 0x36f)) if (code < 0x250) ems += 0x20 === code ? 0.3 : 0.58;
        else if (code >= 0x2e80 || code >= 0xff00 && code <= 0xffef) ems += 1;
        else ems += 0.8;
    }
    return ems;
}
const KAOMOJI_DEFAULTS = {
    weight: 500,
    tail: true
};
function readKaomojiOptions(raw) {
    const weight = raw.weight;
    const tail = raw.tail;
    return {
        weight: 'number' == typeof weight && Number.isFinite(weight) ? weight : KAOMOJI_DEFAULTS.weight,
        tail: 'boolean' == typeof tail ? tail : KAOMOJI_DEFAULTS.tail
    };
}
const FONT_FAMILY = "ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif";
const FILL = 0.92;
const MAX_FONT = 72;
const PLATE_PAD = {
    x: 0.55,
    y: 0.5
};
const PLATE_OPACITY = 0.12;
function inkOf(frame) {
    const ink = frame.ink;
    if (!ink) return LINE_TOKEN;
    return 'flat' in ink ? ink.flat : ink.from;
}
function buildKaomojiScene(frame, ink, options, sourceId) {
    const b = frame.body;
    const [open, close] = wrapperFor(frame.shape);
    const text = options.tail ? kaomoji(frame.shape, frame.state, frame.face.style) : `${open}${faceText(frame.state, frame.face.style)}${close}`;
    const ems = measureEms(text);
    const size = Math.min(MAX_FONT, SHAPE_SPACE * FILL / Math.max(ems, 1));
    const scale = frame.shapeScale;
    const placed = `translate(${CENTER} ${CENTER}) scale(${scene_r2(scale)}) translate(${-CENTER} ${-CENTER})`;
    const moved = `translate(${scene_r2(b.x)} ${scene_r2(b.y)}) rotate(${scene_r2(b.rotation)} ${CENTER} ${CENTER}) translate(${CENTER} ${CENTER}) scale(${scene_r2(b.scaleX)} ${scene_r2(b.scaleY)}) translate(${-CENTER} ${-CENTER})`;
    const children = [];
    if ('bubble' === frame.variant) {
        const width = ems * size + size * PLATE_PAD.x * 2;
        const height = size * (1 + PLATE_PAD.y);
        children.push(scene_node('rect', {
            x: scene_r2(CENTER - width / 2),
            y: scene_r2(CENTER - height / 2),
            width: scene_r2(width),
            height: scene_r2(height),
            rx: scene_r2(height / 2),
            fill: ink,
            opacity: PLATE_OPACITY
        }));
    }
    children.push(scene_node('text', {
        x: CENTER,
        y: CENTER,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-family': FONT_FAMILY,
        'font-size': scene_r2(size),
        'font-weight': options.weight,
        fill: ink
    }, void 0, {
        text
    }));
    return scene_node('g', {
        id: sourceId || void 0,
        transform: placed
    }, [
        scene_node('g', {
            transform: moved
        }, children)
    ]);
}
function createKaomojiRenderer(host, context) {
    const svg = createSvgElement('svg');
    svg.setAttribute('viewBox', VIEWBOX_STR);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.overflow = 'visible';
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    const root = createSvgElement('g');
    svg.appendChild(root);
    host.appendChild(svg);
    let options = readKaomojiOptions(context.styleOptions);
    return {
        element: svg,
        draw (frame) {
            syncElement(root, buildKaomojiScene(frame, inkOf(frame), options, context.sourceId));
        },
        configure (styleOptions) {
            options = readKaomojiOptions(styleOptions);
        },
        destroy () {
            svg.remove();
        }
    };
}
const block = (rule, pick, indent)=>`${indent}${rule.selector} { ${rule.decls.map((d)=>`${d.prop}: ${pick(d)};`).join(' ')} }`;
function schemeStyle(scheme, rules, base) {
    if (0 === rules.length) return '';
    const lines = [];
    if ('page' === scheme) for (const rule of rules)lines.push(block(rule, (d)=>`light-dark(${d.light}, ${d.dark})`, '    '));
    else {
        if (base) for (const rule of rules)lines.push(block(rule, (d)=>d.light, '    '));
        lines.push('    @media (prefers-color-scheme: dark) {');
        for (const rule of rules)lines.push(block(rule, (d)=>d.dark, '      '));
        lines.push('    }');
    }
    return `<style>\n${lines.join('\n')}\n  </style>`;
}
function paletteInk(scheme, uid, light, dark, extra = []) {
    return schemeStyle(scheme, [
        {
            selector: `.${uid}`,
            decls: [
                {
                    prop: `--${uid}-ink`,
                    light,
                    dark
                },
                ...extra
            ]
        }
    ], true);
}
const renderKaomojiStatic = (frame, context)=>{
    const { color, uid, flat } = context;
    const own = frame.ink;
    const lines = lineInks(color);
    const light = lines.light ?? getInkColor(color, 'light');
    const dark = lines.dark ?? getInkColor(color, 'dark');
    let ink;
    let defs = '';
    let root = '';
    if (own) ink = 'flat' in own ? own.flat : own.from;
    else if (flat) ink = light;
    else {
        ink = `var(--${uid}-ink, ${light})`;
        defs = paletteInk(context.colorScheme ?? 'system', uid, light, dark);
        root = ` class="${uid}"`;
    }
    const scene = buildKaomojiScene(frame, ink, readKaomojiOptions(context.styleOptions));
    const size = context.sizePx ? ` width="${context.sizePx}" height="${context.sizePx}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg"${root} viewBox="${VIEWBOX_STR}"${size} fill="none" aria-hidden="true">${defs}
  ${serializeNode(scene, 2)}
</svg>`;
};
const registry = new Map();
function defineStyle(definition) {
    for (const key of Object.keys(definition.defaults))if (!(key in definition.params)) throw new Error(`Style "${definition.id}": default "${key}" has no entry in params`);
    const variants = allVariants(definition);
    for (const [key, spec] of Object.entries(definition.params)){
        const unknown = spec.variants?.find((variant)=>!variants.includes(variant));
        if (void 0 !== unknown) throw new Error(`Style "${definition.id}": param "${key}" names variant "${unknown}" which is not in variants`);
    }
    if (!definition.variants.includes(definition.defaultVariant)) throw new Error(`Style "${definition.id}": defaultVariant "${definition.defaultVariant}" is not in variants`);
    registry.set(definition.id, definition);
    return definition;
}
const ADDED = new Map();
function addVariant(styleId, variant, reads = []) {
    let added = ADDED.get(styleId);
    if (!added) ADDED.set(styleId, added = new Map());
    added.set(variant, reads);
}
function allVariants(style) {
    const added = [
        ...ADDED.get(style.id)?.keys() ?? []
    ];
    const unlisted = [
        ...style.unlistedVariants ?? [],
        ...added
    ];
    return unlisted.length ? [
        ...new Set([
            ...style.variants,
            ...unlisted
        ])
    ] : style.variants;
}
function acceptsVariant(style, variant) {
    return style.variants.includes(variant) || (style.unlistedVariants?.includes(variant) ?? false) || (ADDED.get(style.id)?.has(variant) ?? false);
}
function hasStyle(id) {
    return registry.has(id);
}
function getStyle(id) {
    const style = registry.get(id);
    if (!style) throw new Error(`Unknown style "${id}". Registered styles: ${[
        ...registry.keys()
    ].join(', ')}`);
    return style;
}
function listStyles() {
    return [
        ...registry.values()
    ];
}
function paramsForVariant(style, variant) {
    return Object.fromEntries(Object.entries(style.params).filter(([key, spec])=>!spec.variants || spec.variants.includes(variant) || (ADDED.get(style.id)?.get(variant)?.includes(key) ?? false)));
}
function clampParam(spec, value, fallback) {
    switch(spec.type){
        case 'number':
            {
                if ('number' != typeof value || !Number.isFinite(value)) return fallback;
                const clamped = Math.min(spec.max, Math.max(spec.min, value));
                const snapped = spec.min + Math.round((clamped - spec.min) / spec.step) * spec.step;
                return Math.min(spec.max, Number(snapped.toFixed(6)));
            }
        case 'enum':
            return 'string' == typeof value && spec.options.includes(value) ? value : fallback;
        case 'boolean':
            return 'boolean' == typeof value ? value : fallback;
    }
}
function resolveStyleOptions(style, input) {
    const out = {};
    for (const [key, fallback] of Object.entries(style.defaults)){
        const spec = style.params[key];
        out[key] = input && key in input ? clampParam(spec, input[key], fallback) : fallback;
    }
    return out;
}
function validateStyleOptions(style, input) {
    const issues = [];
    for (const [key, value] of Object.entries(input ?? {})){
        const spec = style.params[key];
        if (!spec) {
            issues.push({
                key,
                message: "unknown parameter"
            });
            continue;
        }
        if (clampParam(spec, value, Symbol.for('invalid')) !== value) issues.push({
            key,
            message: describe(spec)
        });
    }
    return issues;
}
function describe(spec) {
    switch(spec.type){
        case 'number':
            return `expected a number from ${spec.min} to ${spec.max} in steps of ${spec.step}`;
        case 'enum':
            return `expected one of ${spec.options.join(', ')}`;
        case 'boolean':
            return 'expected a boolean';
    }
}
const kaomojiStyle = defineStyle({
    id: 'kaomoji',
    label: 'Kaomoji',
    variants: [
        'plain',
        'bubble'
    ],
    defaultVariant: 'plain',
    defaults: {
        ...KAOMOJI_DEFAULTS
    },
    params: {
        weight: {
            type: 'number',
            min: 300,
            max: 800,
            step: 100,
            label: 'Weight'
        },
        tail: {
            type: 'boolean',
            label: 'Mood mark'
        }
    },
    createRenderer: createKaomojiRenderer,
    renderStatic: renderKaomojiStatic
});
const isPalette = (color)=>ALL_COLOR_IDS.includes(color);
const HEX = /^#[0-9a-f]{6}$/i;
function partColorPair(color) {
    if (isPalette(color)) return {
        light: getInkColor(color, 'light'),
        dark: getInkColor(color, 'dark')
    };
    return HEX.test(color) ? {
        light: color,
        dark: color
    } : null;
}
const RIM_SHIFT = 0.45;
function part_color_luminance(hex) {
    const channel = (i)=>{
        const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}
const rimHex = (hex)=>mixHex(hex, part_color_luminance(hex) < 0.12 ? '#FFFFFF' : '#000000', RIM_SHIFT);
function partRimPair(color) {
    const pair = partColorPair(color);
    return pair && {
        light: rimHex(pair.light),
        dark: rimHex(pair.dark)
    };
}
function partColorCss(color) {
    const pair = partColorPair(color);
    if (!pair) return color;
    return pair.light === pair.dark ? pair.light : `light-dark(${pair.light}, ${pair.dark})`;
}
function partRimCss(color) {
    const pair = partRimPair(color);
    if (!pair) return `color-mix(in oklab, ${color}, #000 ${100 * RIM_SHIFT}%)`;
    return pair.light === pair.dark ? pair.light : `light-dark(${pair.light}, ${pair.dark})`;
}
const livePartPaint = (color)=>({
        fill: partColorCss(color),
        rim: partRimCss(color)
    });
const r3 = (n)=>Math.round(1000 * n) / 1000;
const PLATE_COLOUR = '#17181D';
const PLATE_ROUNDING = 0.5;
function emit(paint, table, ctx) {
    const { grid, variant } = ctx;
    const size = grid.size;
    const parts = table.defs.map(()=>[]);
    const gap = Math.min(0.5, Math.max(0, ctx.gap));
    const side = r3(1 - gap);
    const inset = r3(gap / 2);
    for(let row = 0; row < size; row++){
        let col = 0;
        while(col < size){
            const id = paint[row * size + col];
            if (0 === id) {
                col++;
                continue;
            }
            const list = parts[id - 1];
            if ('crisp' === variant) {
                let end = col + 1;
                while(end < size && paint[row * size + end] === id)end++;
                const run = end - col;
                list.push(`M${col} ${row}h${run}v1h${-run}z`);
                col = end;
            } else if ('block' === variant) {
                list.push(`M${r3(col + inset)} ${r3(row + inset)}h${side}v${side}h${-side}z`);
                col++;
            } else {
                list.push(`M${col + 0.5} ${row + 0.5}h0`);
                col++;
            }
        }
    }
    const overrides = [];
    const stroked = 'dot' === variant;
    const paths = [];
    table.defs.forEach((def, i)=>{
        const list = parts[i];
        if (0 === list.length) return;
        const colour = ctx.colour(def);
        const attrs = {};
        if (void 0 !== colour.dark && void 0 !== ctx.classPrefix) {
            const className = `${ctx.classPrefix}${i}`;
            attrs.class = className;
            overrides.push({
                className,
                light: colour.value,
                dark: colour.dark
            });
        }
        attrs[stroked ? 'stroke' : 'fill'] = colour.value;
        if (def.alpha < 1) attrs.opacity = def.alpha;
        attrs.d = list.join('');
        paths.push(scene_node('path', attrs));
    });
    const offset = r3(-grid.margin * grid.cell);
    const transform = `translate(${offset} ${offset}) scale(${r3(grid.cell)})`;
    if (!stroked) return {
        scene: scene_node('g', {
            transform,
            'shape-rendering': 'crispEdges'
        }, paths, {
            layout: 'block'
        }),
        overrides,
        stroked
    };
    const radius = r3(side / 2);
    const left = r3(grid.margin + VIEWBOX.minX / grid.cell + 0.1);
    const width = r3(VIEWBOX.width / grid.cell - 0.2);
    const plate = {
        x: left,
        y: left,
        width,
        height: width,
        rx: scene_r2(width * PLATE_ROUNDING)
    };
    const children = [
        scene_node('defs', void 0, [
            scene_node('pattern', {
                id: ctx.ids.pattern,
                width: 1,
                height: 1,
                patternUnits: 'userSpaceOnUse'
            }, [
                scene_node('circle', {
                    cx: 0.5,
                    cy: 0.5,
                    r: radius,
                    fill: '#fff',
                    'fill-opacity': 0.07
                })
            ]),
            ...ctx.glow ? [
                scene_node('filter', {
                    id: ctx.ids.glow,
                    'color-interpolation-filters': 'sRGB'
                }, [
                    scene_node('feGaussianBlur', {
                        in: 'SourceGraphic',
                        stdDeviation: 0.28,
                        result: 'glow'
                    }),
                    scene_node('feMerge', void 0, [
                        scene_node('feMergeNode', {
                            in: 'glow'
                        }),
                        scene_node('feMergeNode', {
                            in: 'SourceGraphic'
                        })
                    ])
                ])
            ] : []
        ]),
        scene_node('rect', {
            ...plate,
            fill: PLATE_COLOUR
        }),
        scene_node('rect', {
            ...plate,
            fill: `url(#${ctx.ids.pattern})`
        }),
        scene_node('g', {
            'stroke-width': side,
            'stroke-linecap': 'round',
            filter: ctx.glow ? `url(#${ctx.ids.glow})` : void 0
        }, paths, {
            layout: 'block'
        })
    ];
    return {
        scene: scene_node('g', {
            transform,
            style: 'color-scheme:dark'
        }, children, {
            layout: 'block'
        }),
        overrides,
        stroked
    };
}
const grid_cache = new Map();
function pixelGrid(n) {
    let grid = grid_cache.get(n);
    if (!grid) {
        const cell = SHAPE_SPACE / n;
        const margin = Math.floor(VIEWBOX_MARGIN / cell);
        grid = {
            n,
            cell,
            margin,
            size: n + 2 * margin
        };
        grid_cache.set(n, grid);
    }
    return grid;
}
function compose(outer, inner) {
    const [a1, b1, c1, d1, e1, f1] = outer;
    const [a2, b2, c2, d2, e2, f2] = inner;
    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1
    ];
}
const translation = (x, y)=>[
        1,
        0,
        0,
        1,
        x,
        y
    ];
function scaleAboutCentre(sx, sy) {
    return [
        sx,
        0,
        0,
        sy,
        CENTER * (1 - sx),
        CENTER * (1 - sy)
    ];
}
function rotateAboutCentre(degrees) {
    const r = degrees * Math.PI / 180;
    const cos = Math.cos(r);
    const sin = Math.sin(r);
    return [
        cos,
        sin,
        -sin,
        cos,
        CENTER - cos * CENTER + sin * CENTER,
        CENTER - sin * CENTER - cos * CENTER
    ];
}
function toBuffer(grid) {
    const k = 1 / grid.cell;
    return [
        k,
        0,
        0,
        k,
        grid.margin,
        grid.margin
    ];
}
const meanScale = (m)=>Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
function grid_apply(m, x, y, out, at) {
    out[at] = m[0] * x + m[2] * y + m[4];
    out[at + 1] = m[1] * x + m[3] * y + m[5];
}
const PIXEL_DEFAULTS = {
    grid: 24,
    gap: 0.16,
    shades: 3,
    fps: 12,
    outline: true,
    glow: true
};
function readOptions(raw) {
    const num = (key)=>{
        const v = raw[key];
        return 'number' == typeof v && Number.isFinite(v) ? v : PIXEL_DEFAULTS[key];
    };
    const flag = (key)=>{
        const v = raw[key];
        return 'boolean' == typeof v ? v : PIXEL_DEFAULTS[key];
    };
    return {
        grid: num('grid'),
        gap: num('gap'),
        shades: num('shades'),
        fps: num('fps'),
        outline: flag('outline'),
        glow: flag('glow')
    };
}
function variantOf(variant) {
    return 'dot' === variant || 'block' === variant ? variant : 'crisp';
}
const LED_EYE = FACE_INK;
const LED_EYE_TOKEN = `var(--aora-face, ${PLATE_COLOUR})`;
function createPaintTable() {
    const defs = [];
    const ids = new Map();
    return {
        defs,
        id (tint, alpha) {
            const key = `${tintKey(tint)}@${alpha}`;
            let id = ids.get(key);
            if (void 0 === id) {
                defs.push({
                    tint,
                    alpha
                });
                id = defs.length;
                ids.set(key, id);
            }
            return id;
        },
        clear () {
            defs.length = 0;
            ids.clear();
        }
    };
}
function tintKey(tint) {
    switch(tint.kind){
        case 'ink':
            return `i${tint.band}:${tint.tone}`;
        case 'hair':
            return `h${tint.band}`;
        case 'fx':
            return `f${tint.band}`;
        case 'css':
            return `c${tint.value}`;
        case 'part':
            return `p${tint.rim ? 'r' : ''}${tint.tone}:${tint.color}`;
    }
}
const alphaLevel = (opacity)=>Math.round(4 * clamp01(opacity)) / 4;
let raster_crossings = new Float64Array(256);
function raster_scan(xy, n, y) {
    if (raster_crossings.length < n) raster_crossings = new Float64Array(2 * n);
    let count = 0;
    let px = xy[(n - 1) * 2];
    let py = xy[(n - 1) * 2 + 1];
    for(let i = 0; i < n; i++){
        const x = xy[2 * i];
        const yy = xy[2 * i + 1];
        if (py <= y !== yy <= y) {
            const x0 = px + (y - py) * (x - px) / (yy - py);
            let j = count++;
            while(j > 0 && raster_crossings[j - 1] > x0){
                raster_crossings[j] = raster_crossings[j - 1];
                j--;
            }
            raster_crossings[j] = x0;
        }
        px = x;
        py = yy;
    }
    return count;
}
function raster_rows(xy, n, size) {
    let lo = 1 / 0;
    let hi = -1 / 0;
    for(let i = 0; i < n; i++){
        const y = xy[2 * i + 1];
        if (y < lo) lo = y;
        if (y > hi) hi = y;
    }
    return [
        Math.max(0, Math.floor(lo)),
        Math.min(size - 1, Math.floor(hi))
    ];
}
function fillCentres(xy, n, size, mask) {
    if (n < 3) return;
    const [first, last] = raster_rows(xy, n, size);
    for(let row = first; row <= last; row++){
        const count = raster_scan(xy, n, row + 0.5);
        for(let i = 0; i + 1 < count; i += 2){
            const from = Math.max(0, Math.ceil(raster_crossings[i] - 0.5));
            const to = Math.min(size, Math.ceil(raster_crossings[i + 1] - 0.5));
            for(let col = from; col < to; col++)mask[row * size + col] = 1;
        }
    }
}
function addCoverage(xy, n, size, out, sub = 4) {
    if (n < 3) return;
    const [first, last] = raster_rows(xy, n, size);
    const weight = 1 / sub;
    for(let row = first; row <= last; row++)for(let s = 0; s < sub; s++){
        const count = raster_scan(xy, n, row + (s + 0.5) * weight);
        for(let i = 0; i + 1 < count; i += 2){
            const a = raster_crossings[i];
            const b = raster_crossings[i + 1];
            const from = Math.max(0, Math.floor(a));
            const to = Math.min(size - 1, Math.floor(b));
            for(let col = from; col <= to; col++){
                const cover = Math.min(b, col + 1) - Math.max(a, col);
                if (cover > 0) out[row * size + col] += cover * weight;
            }
        }
    }
}
function stampDisc(x, y, r, put) {
    if (r <= 0.55) return void put(Math.floor(x), Math.floor(y));
    const r2 = r * r;
    const reach = Math.ceil(r);
    const col0 = Math.floor(x);
    const row0 = Math.floor(y);
    for(let dy = -reach; dy <= reach; dy++)for(let dx = -reach; dx <= reach; dx++){
        const cx = col0 + dx + 0.5 - x;
        const cy = row0 + dy + 0.5 - y;
        if (cx * cx + cy * cy <= r2) put(col0 + dx, row0 + dy);
    }
}
const STEP = 0.25;
function strokePolyline(xy, n, closed, r, put) {
    if (0 === n) return;
    if (1 === n) return void stampDisc(xy[0], xy[1], r, put);
    const segments = closed ? n : n - 1;
    for(let i = 0; i < segments; i++){
        const x0 = xy[2 * i];
        const y0 = xy[2 * i + 1];
        const j = (i + 1) % n;
        const x1 = xy[2 * j];
        const y1 = xy[2 * j + 1];
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / STEP));
        for(let s = 0; s <= steps; s++){
            const t = s / steps;
            stampDisc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, put);
        }
    }
}
function strokeArc(cx, cy, radius, start, end, r, put, dash) {
    const sweep = end - start;
    const length = Math.abs(sweep) * radius;
    const steps = Math.max(2, Math.ceil(length / STEP));
    for(let s = 0; s <= steps; s++){
        const t = s / steps;
        if (dash && t * length % dash.period >= dash.on) continue;
        const a = start + sweep * t;
        stampDisc(cx + radius * Math.cos(a), cy + radius * Math.sin(a), r, put);
    }
}
function fillDisc(x, y, r, put) {
    const r2 = r * r;
    const reach = Math.ceil(r);
    const col0 = Math.floor(x);
    const row0 = Math.floor(y);
    put(col0, row0);
    for(let dy = -reach; dy <= reach; dy++)for(let dx = -reach; dx <= reach; dx++){
        const cx = col0 + dx + 0.5 - x;
        const cy = row0 + dy + 0.5 - y;
        if (cx * cx + cy * cy <= r2) put(col0 + dx, row0 + dy);
    }
}
const PIXEL_LEAF_TOKEN = `var(--aora-leaf, ${LEAF_COLOR})`;
const INNER_TONE = 0.45;
const HAIR_MIX = 0.4;
const MIN_OPACITY = 0.5;
function parts_mapped(part, m) {
    const n = part.outline.length;
    const xy = new Float64Array(2 * n);
    for(let i = 0; i < n; i++)grid_apply(m, part.outline[i][0], part.outline[i][1], xy, 2 * i);
    return {
        xy,
        n
    };
}
function fillBodyParts(frame, m, size, mask) {
    for (const part of frame.body.parts){
        if ('body' !== part.tone || void 0 !== part.color || part.opacity < MIN_OPACITY) continue;
        const poly = parts_mapped(part, m);
        fillCentres(poly.xy, poly.n, size, mask);
    }
}
function paintAccessories(frame, m, size, paint, table, scratch, band) {
    const core = frame.body.coreOpacity ?? 1;
    for (const part of frame.body.parts){
        if ('body' === part.tone && void 0 === part.color) continue;
        const alpha = alphaLevel(part.opacity * core);
        if (alpha <= 0 || part.opacity < MIN_OPACITY) continue;
        scratch.fill(0);
        const poly = parts_mapped(part, m);
        fillCentres(poly.xy, poly.n, size, scratch);
        if (void 0 !== part.color) {
            paintOwnColour(part.color, scratch, size, paint, table, alpha);
            continue;
        }
        const id = 'leaf' === part.tone ? table.id({
            kind: 'css',
            value: PIXEL_LEAF_TOKEN
        }, alpha) : 'hair' === part.tone ? table.id({
            kind: 'hair',
            band
        }, alpha) : table.id({
            kind: 'ink',
            band,
            tone: INNER_TONE
        }, alpha);
        for(let i = 0; i < scratch.length; i++)if (scratch[i]) paint[i] = id;
    }
}
const RIM_MIN_CELLS = 12;
function paintOwnColour(color, cells, size, paint, table, alpha) {
    const fill = table.id({
        kind: 'part',
        color,
        tone: 0,
        rim: false
    }, alpha);
    const rim = table.id({
        kind: 'part',
        color,
        tone: 0,
        rim: true
    }, alpha);
    let count = 0;
    for(let i = 0; i < cells.length; i++)count += cells[i];
    const at = (col, row)=>col < 0 || row < 0 || col >= size || row >= size ? 0 : cells[row * size + col];
    const small = count < RIM_MIN_CELLS;
    for(let row = 0; row < size; row++)for(let col = 0; col < size; col++){
        const i = row * size + col;
        const touching = at(col - 1, row) || at(col + 1, row) || at(col, row - 1) || at(col, row + 1);
        if (!cells[i]) {
            if (small && touching && paint[i]) paint[i] = rim;
            continue;
        }
        const edge = !small && !(at(col - 1, row) && at(col + 1, row) && at(col, row - 1) && at(col, row + 1));
        paint[i] = edge ? rim : fill;
    }
}
const BELT_KINDS = [
    'dots',
    'orbit',
    'radar',
    'progress',
    'gather',
    'wave',
    'send',
    'receive',
    'dock',
    'ball',
    'whirl',
    'standby',
    'pencil',
    'bang'
];
const STATE_BELT = {
    thinking: 'dots',
    orbit: 'orbit',
    messaging: 'orbit',
    waiting: 'orbit',
    radar: 'radar',
    progress: 'progress',
    spawning: 'gather',
    dictating: 'wave',
    sending: 'send',
    receiving: 'receive',
    uploading: 'dock',
    bouncing: 'ball',
    loading: 'whirl',
    'powering-down': 'standby',
    writing: 'pencil',
    alerting: 'bang'
};
const BELT_CORE_SIZE = {
    dots: 22,
    orbit: 26,
    radar: 28,
    progress: 30,
    gather: 26,
    wave: 20,
    send: 26,
    receive: 26,
    dock: 26,
    ball: 30,
    whirl: 28,
    standby: 26,
    pencil: 34,
    bang: 24
};
const BELT_BODY_SHARE = {
    ball: 0.7
};
const BELT_MORPH_SPLIT = 0.62;
const empty = ()=>({
        dots: [],
        rings: [],
        coreX: 0,
        coreY: 0,
        coreScale: 1,
        coreOpacity: 1
    });
const DOT_SPREAD = 62;
const BELT_GLYPH_SIZE = 62;
function evaluateBelt(kind, t) {
    const frame = empty();
    switch(kind){
        case 'dots':
            {
                const period = 1.4;
                const phase = t % period / period;
                for(let i = -1; i <= 1; i++){
                    const centreOffset = i * DOT_SPREAD;
                    const lead = (i + 1) / 3;
                    let d = phase - lead;
                    if (d < -0.5) d += 1;
                    if (d > 0.5) d -= 1;
                    const bump = Math.exp(-(d * d) / 0.012);
                    if (0 === i) {
                        frame.coreScale = 1 + 0.18 * bump;
                        frame.coreY = 6 * -bump;
                        continue;
                    }
                    frame.dots.push({
                        x: CENTER + centreOffset,
                        y: CENTER - 6 * bump,
                        r: 11 + 2.6 * bump,
                        opacity: 0.55 + 0.45 * bump
                    });
                }
                break;
            }
        case 'orbit':
            {
                const count = 5;
                for(let i = 0; i < count; i++){
                    const a = 1.9 * t + i / count * Math.PI * 2;
                    const depth = Math.cos(a);
                    frame.dots.push({
                        x: CENTER + 52 * Math.sin(a),
                        y: CENTER + 22 * depth,
                        r: 6.5 + 2.2 * depth,
                        opacity: 0.45 + (depth + 1) * 0.27
                    });
                }
                break;
            }
        case 'radar':
            {
                const period = 1.3;
                for(let i = 0; i < 3; i++){
                    const p = (t / period + i / 3) % 1;
                    frame.rings.push({
                        x: CENTER,
                        y: CENTER,
                        r: 30 + 74 * easeOutCubic(p),
                        width: 3.4 - 1.9 * p,
                        opacity: (1 - p) * 0.75
                    });
                }
                break;
            }
        case 'progress':
            {
                const cycle = 4;
                const p = clamp(t % cycle / 2.5, 0, 1);
                const r = 48;
                const circumference = 2 * Math.PI * r;
                frame.rings.push({
                    x: CENTER,
                    y: CENTER,
                    r,
                    width: 6,
                    opacity: 0.16
                });
                frame.rings.push({
                    x: CENTER,
                    y: CENTER,
                    r,
                    width: 6,
                    opacity: 1,
                    dash: `${circumference * p} ${circumference}`
                });
                break;
            }
        case 'gather':
            {
                const intro = 2;
                if (!(t < intro)) return evaluateBelt('progress', t - intro);
                {
                    const p = t / intro;
                    for(let i = 0; i < 5; i++){
                        const a = i / 5 * Math.PI * 2 + p * Math.PI * 1.6;
                        const r = 96 * (1 - easeOutCubic(p));
                        frame.dots.push({
                            x: CENTER + Math.cos(a) * r,
                            y: CENTER + Math.sin(a) * r,
                            r: 7,
                            opacity: 0.35 + 0.65 * p
                        });
                    }
                    frame.coreScale = 0.7 + 0.3 * p;
                }
                break;
            }
        case 'wave':
            for(let i = 0; i < 4; i++){
                const seed = 1.7 * i;
                const h = 0.42 + 0.29 * Math.sin(3.1 * t + seed) * Math.sin(1.3 * t + seed) + 0.29 * Math.sin(5.7 * t + seed);
                const height = 34 * clamp(h, 0.12, 1);
                frame.dots.push({
                    x: CENTER + (i - 1.5) * 26,
                    y: CENTER,
                    r: 6,
                    opacity: 0.5 + 0.5 * clamp(h, 0, 1)
                });
                frame.rings.push({
                    x: CENTER + (i - 1.5) * 26,
                    y: CENTER,
                    r: height,
                    width: 9,
                    opacity: 0
                });
            }
            break;
        case 'send':
            {
                const period = 1.5;
                const p = t % period / period;
                const dist = 120 * easeOutCubic(p);
                const dx = 0.74;
                const dy = -0.62;
                frame.dots.push({
                    x: CENTER + dx * dist,
                    y: CENTER + dy * dist,
                    r: 9,
                    opacity: 1 - p
                });
                frame.dots.push({
                    x: CENTER + dx * dist * 0.72,
                    y: CENTER + dy * dist * 0.72,
                    r: 6,
                    opacity: (1 - p) * 0.3
                });
                frame.rings.push({
                    x: CENTER,
                    y: CENTER,
                    r: 24 + 40 * p,
                    width: 3,
                    opacity: (1 - p) * 0.5
                });
                frame.coreScale = p < 0.2 ? 1 - 0.3 * p : 1 + 0.05 * smoothstep(0.2, 0.6, p);
                break;
            }
        case 'receive':
            {
                const period = 1.7;
                const index = Math.floor(t / period);
                const p = t % period / period;
                const a = 2.399963 * index % (2 * Math.PI);
                const dist = (1 - easeOutCubic(Math.min(1, p / 0.6))) * 130;
                if (p < 0.6) frame.dots.push({
                    x: CENTER + Math.cos(a) * dist,
                    y: CENTER + Math.sin(a) * dist,
                    r: 9,
                    opacity: 1
                });
                else {
                    const q = (p - 0.6) / 0.4;
                    frame.rings.push({
                        x: CENTER,
                        y: CENTER,
                        r: 26 + 44 * q,
                        width: 3,
                        opacity: (1 - q) * 0.6
                    });
                    frame.coreScale = 1 + (1 - q) * 0.11;
                }
                break;
            }
        case 'dock':
            {
                const intro = 1.1;
                if (t < intro) {
                    const p = easeOutCubic(t / intro);
                    for(let i = 0; i < 2; i++){
                        const from = -150 + 40 * i;
                        frame.dots.push({
                            x: CENTER + from * (1 - p),
                            y: CENTER + from * (1 - p) * 0.6,
                            r: 8,
                            opacity: p
                        });
                    }
                } else {
                    const a = (t - intro) * 2.2;
                    for(let i = 0; i < 2; i++){
                        const angle = a + i * Math.PI;
                        frame.dots.push({
                            x: CENTER + 54 * Math.cos(angle),
                            y: CENTER + 24 * Math.sin(angle),
                            r: 8,
                            opacity: 0.6 + 0.4 * Math.cos(angle)
                        });
                    }
                }
                break;
            }
        case 'ball':
            {
                const height = 52;
                const g = 8 * height / 0.3844;
                const period = 2 * Math.sqrt(2 * height / g);
                const local = t % period;
                const h = height - 0.5 * g * Math.pow(local - period / 2, 2);
                frame.coreY = -Math.max(0, h);
                frame.coreScale = h < 4 ? 0.92 : 1;
                break;
            }
        case 'whirl':
            frame.coreX = 16 * Math.sin(0.9 * t) + 7 * Math.sin(1.7 * t);
            frame.coreY = 14 * Math.sin(1.3 * t) + 6 * Math.sin(0.6 * t);
            break;
        case 'standby':
            {
                const pulse = 0.28 + 0.2 * Math.sin(1.6 * t);
                frame.coreOpacity = clamp(pulse + 0.4, 0.1, 1);
                frame.coreScale = 0.96 + 0.04 * Math.sin(1.6 * t);
                if (t < 1) frame.rings.push({
                    x: CENTER,
                    y: CENTER,
                    r: 90 * (1 - easeOutCubic(t)),
                    width: 3,
                    opacity: 1 - t
                });
                break;
            }
        case 'pencil':
            {
                const period = 1.1;
                const phase = t % period / period * Math.PI * 2;
                const across = Math.sin(phase);
                const down = Math.sin(2 * phase);
                frame.glyphs = [
                    {
                        kind: 'pencil',
                        x: CENTER + 52 + 22 * across,
                        y: CENTER + 6 + 11 * down,
                        rotation: 26 + 8 * across,
                        scale: 1,
                        opacity: 1
                    }
                ];
                for(let i = 0; i < 2; i++){
                    const trail = Math.sin(phase - 0.5 - 0.45 * i);
                    frame.dots.push({
                        x: CENTER + 52 + 22 * trail,
                        y: CENTER + 30,
                        r: 4,
                        opacity: 0.32 - 0.14 * i
                    });
                }
                frame.coreX = 3 * across;
                frame.coreY = 1.6 * down;
                break;
            }
        case 'bang':
            {
                const period = 2;
                const local = t % period;
                const drop = clamp(local / 0.34, 0, 1);
                const rise = 1.14 * easeOutCubic(drop) - 0.14 * smoothstep(0.34, 1, local);
                const hold = local > 0.34 ? 1 + 0.045 * Math.sin((local - 0.34) * 3.1) : 1;
                frame.glyphs = [
                    {
                        kind: 'bang',
                        x: CENTER,
                        y: CENTER - 74 * rise,
                        rotation: 0,
                        scale: (0.72 + 0.28 * rise) * hold,
                        opacity: drop
                    }
                ];
                frame.coreScale = 1 + (1 - drop) * 0.12;
                frame.coreY = (1 - drop) * 5;
                break;
            }
    }
    return frame;
}
function blendBeltFrames(from, to, t) {
    const k = clamp(t, 0, 1);
    const frame = {
        dots: [],
        rings: [],
        coreX: easing_lerp(from.coreX, to.coreX, k),
        coreY: easing_lerp(from.coreY, to.coreY, k),
        coreScale: easing_lerp(from.coreScale, to.coreScale, k),
        coreOpacity: easing_lerp(from.coreOpacity, to.coreOpacity, k)
    };
    const sink = to.glyphs?.[0] ?? {
        x: CENTER,
        y: CENTER
    };
    for (const dot of from.dots)frame.dots.push({
        x: easing_lerp(dot.x, sink.x, k),
        y: easing_lerp(dot.y, sink.y, k),
        r: dot.r * (1 - k),
        opacity: dot.opacity * (1 - k)
    });
    for (const dot of to.dots)frame.dots.push({
        ...dot,
        opacity: dot.opacity * k
    });
    for (const ring of from.rings)frame.rings.push({
        ...ring,
        opacity: ring.opacity * (1 - k)
    });
    for (const ring of to.rings)frame.rings.push({
        ...ring,
        opacity: ring.opacity * k
    });
    const glyphs = [];
    for (const glyph of from.glyphs ?? [])glyphs.push({
        ...glyph,
        opacity: glyph.opacity * (1 - k)
    });
    for (const glyph of to.glyphs ?? [])glyphs.push({
        ...glyph,
        opacity: glyph.opacity * k
    });
    if (glyphs.length > 0) frame.glyphs = glyphs;
    return frame;
}
const beltForState = (state)=>STATE_BELT[state] ?? null;
function beltBodyRing(ring, radius, blend, coreSize) {
    const morph = clamp(blend / BELT_MORPH_SPLIT, 0, 1);
    const shrink = clamp((blend - BELT_MORPH_SPLIT) / (1 - BELT_MORPH_SPLIT), 0, 1);
    const targetRadius = radius + (coreSize - radius) * shrink;
    return ring.map(([x, y])=>{
        const dx = x - CENTER;
        const dy = y - CENTER;
        const len = Math.hypot(dx, dy) || 1;
        const blended = len + (targetRadius - len) * morph;
        const finalLen = shrink > 0 ? targetRadius : blended;
        return [
            CENTER + dx / len * finalLen,
            CENTER + dy / len * finalLen
        ];
    });
}
const CONFETTI_COLORS = [
    '#EE5A5E',
    '#F7803D',
    '#F0B53A',
    '#33B477',
    '#24A6C9',
    '#3D8BF2',
    '#9474EA'
];
const STAR_GOLD = '#F7C04A';
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PAPER = {
    speed: [
        1.4,
        2.8
    ],
    lift: [
        0.2,
        0.6
    ],
    gravity: 1.5,
    drag: 2.2,
    life: [
        0.6,
        1
    ],
    starEvery: 6,
    dotEvery: 3
};
const SPIN_REST = 1;
const SPIN_FLING = 4.5;
const OUTER_ORBIT = CENTER + VIEWBOX_MARGIN - 6;
const POINT_STEP = 0.08;
const particles_MAX_POINTS = 52;
const RIBBON = {
    grow: 0.4,
    fade: 0.22,
    reelIn: 0.45,
    reelOut: 0.3,
    stay: 4.5,
    coast: 2.2
};
function createParticleSystem(options = {}) {
    const radius = options.radius ?? 100;
    const scale = options.sizeScale ?? 1;
    const random = options.random ?? Math.random;
    const pick = (range)=>range[0] + random() * (range[1] - range[0]);
    const around = (spread)=>(2 * random() - 1) * spread;
    let particles = [];
    let trails = [];
    let clock = 0;
    let yaw = 0;
    let wasSpinning = false;
    let launches = [];
    let launched = 0;
    let planes = [];
    let firstHue = 0;
    let residentAt = 0;
    function burst(count = 14, speed = 1, spread = 1) {
        const offset = random() * Math.PI * 2;
        for(let i = 0; i < count; i++){
            const angle = offset + i * GOLDEN;
            const from = radius * pick([
                0.9,
                1
            ]);
            const throwSpeed = radius * pick(PAPER.speed) * speed * spread;
            const star = i % PAPER.starEvery === PAPER.starEvery - 1;
            const dot = !star && i % PAPER.dotEvery === 0;
            particles.push({
                x: CENTER + Math.cos(angle) * from,
                y: CENTER + Math.sin(angle) * from,
                vx: Math.cos(angle) * throwSpeed,
                vy: Math.sin(angle) * throwSpeed - radius * pick(PAPER.lift),
                age: 0,
                life: pick(PAPER.life),
                size: scale * (star ? pick([
                    6.5,
                    9
                ]) : pick([
                    3.5,
                    7.5
                ])),
                rotation: random() * Math.PI * 2,
                spin: (random() < 0.5 ? -1 : 1) * pick([
                    3,
                    7
                ]),
                color: star ? STAR_GOLD : CONFETTI_COLORS[3 * i % CONFETTI_COLORS.length],
                kind: star ? 'star' : dot ? 'dot' : 'strip'
            });
        }
    }
    function planSpin(count) {
        const n = count <= 4 ? 2 : 3;
        const roll = around(0.8);
        planes = Array.from({
            length: n
        }, (_, i)=>({
                squash: pick([
                    0.2,
                    0.62
                ]),
                roll: roll + i * Math.PI / n + around(0.12)
            }));
        firstHue = 360 * random();
        launched = 0;
        launches = Array.from({
            length: count
        }, (_, i)=>clock + i * pick([
                0.07,
                0.12
            ]));
    }
    function orbitPoint(t, angle) {
        const along = t.radius * Math.sin(angle);
        const up = -t.radius * Math.cos(angle) * t.squash;
        const c = Math.cos(t.roll);
        const s = Math.sin(t.roll);
        return {
            x: CENTER + along * c - up * s,
            y: CENTER + along * s + up * c,
            z: Math.cos(angle) * Math.sqrt(1 - t.squash * t.squash),
            angle
        };
    }
    function ribbon(fields) {
        return {
            ...fields,
            points: [],
            size: 0,
            opacity: 0,
            carry: 0,
            age: 0,
            reel: 0
        };
    }
    function launch(count, direction) {
        const plane = planes[launched % planes.length];
        const inner = Math.min(1.05 * radius, OUTER_ORBIT - 22);
        const step = (OUTER_ORBIT - inner) / Math.max(count - 1, 1);
        const width = count <= 3 ? pick([
            8.5,
            11.5
        ]) : 4 === count ? pick([
            7.2,
            9.4
        ]) : pick([
            6,
            8
        ]);
        trails.push(ribbon({
            hue: firstHue + 180 / Math.PI * GOLDEN * launched,
            width,
            squash: clamp(plane.squash + around(0.05), 0.12, 0.7),
            roll: plane.roll + around(0.06),
            radius: inner + launched * step + around(1.2),
            angle: yaw - pick([
                0,
                0.2
            ]) * direction,
            drift: direction * pick([
                0.4,
                1
            ]),
            follow: pick([
                0.7,
                0.9
            ]),
            arc: pick([
                2,
                3.2
            ]),
            resident: false
        }));
        launched++;
    }
    function addResident(index) {
        trails.push(ribbon({
            hue: 360 * random(),
            width: pick([
                6,
                7.8
            ]),
            squash: pick([
                0.12,
                0.24
            ]),
            roll: around(0.1),
            radius: Math.min(1.12 * radius + 13 * index, OUTER_ORBIT),
            angle: random() * Math.PI * 2,
            drift: (random() < 0.5 ? -1 : 1) * pick([
                1.5,
                2.1
            ]),
            follow: 0.75,
            arc: pick([
                2.2,
                3
            ]),
            resident: true
        }));
    }
    function updatePaper(dt) {
        const keep = Math.exp(-PAPER.drag * dt);
        const fall = PAPER.gravity * radius * dt;
        for (const p of particles){
            p.age += dt;
            p.vx *= keep;
            p.vy = p.vy * keep + fall;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rotation += p.spin * dt;
        }
        particles = particles.filter((p)=>p.age < p.life);
    }
    function sweep(t, direction) {
        const last = t.points.length > 0 ? t.points[t.points.length - 1].angle : t.angle - 0.001 * direction;
        const swept = t.angle - last;
        const steps = Math.min(Math.ceil(Math.abs(swept) / POINT_STEP), 20);
        for(let i = 1; i <= steps; i++)t.points.push(orbitPoint(t, last + swept * i / steps));
        if (0 === t.points.length) t.points.push(orbitPoint(t, t.angle));
        const cover = t.arc * (1 - smoothstep(0, 1, t.reel));
        const behind = (p)=>Math.abs(t.angle - p.angle);
        let cut = 0;
        while(cut < t.points.length - 2 && behind(t.points[cut + 1]) > cover)cut++;
        if (cut > 0) t.points.splice(0, cut);
        const tail = t.points[0];
        if (t.points.length >= 2 && behind(tail) > cover) t.points[0] = orbitPoint(t, t.angle - Math.sign(t.angle - tail.angle) * cover);
        if (t.points.length > particles_MAX_POINTS) t.points.splice(0, t.points.length - particles_MAX_POINTS);
    }
    function update(dt, state) {
        clock += dt;
        updatePaper(dt);
        const velocity = state.spinVelocity;
        const turned = velocity * dt;
        yaw += turned;
        const spinning = Math.abs(velocity) >= SPIN_REST;
        const direction = velocity >= 0 ? 1 : -1;
        if (spinning && !wasSpinning) planSpin(state.wide ? 6 : 4 + Math.round(random()));
        if (!spinning) launches = [];
        wasSpinning = spinning;
        if (Math.abs(velocity) >= SPIN_FLING) {
            const count = launches.length + launched;
            while(launches.length > 0 && clock >= launches[0]){
                launches.shift();
                launch(count, direction);
            }
        }
        if (state.sustain && clock >= residentAt) {
            const residents = trails.filter((t)=>t.resident).length;
            if (residents < 2) addResident(residents);
            residentAt = clock + 0.6;
        }
        for (const t of trails){
            t.age += dt;
            const reeling = t.resident ? !state.sustain : !spinning || t.age > RIBBON.stay;
            t.reel = clamp(t.reel + (reeling ? dt / RIBBON.reelIn : -dt / RIBBON.reelOut), 0, 1);
            if (t.resident) t.angle += t.drift * dt + turned * t.follow;
            else if (spinning) {
                t.carry = velocity * t.follow;
                t.angle += turned * t.follow + t.drift * dt;
            } else {
                t.angle += (t.carry + t.drift) * dt;
                const slow = Math.exp(-RIBBON.coast * dt);
                t.carry *= slow;
                t.drift *= slow;
            }
            sweep(t, direction);
            const front = clamp(Math.cos(t.angle), 0, 1);
            const grow = easeOutCubic(Math.min(t.age / RIBBON.grow, 1));
            t.size = 1.55 * t.width * (0.78 + 0.22 * front) * grow * (1 - 0.8 * smoothstep(0, 1, t.reel));
            t.opacity = smoothstep(0, RIBBON.fade, t.age);
        }
        trails = trails.filter((t)=>t.reel < 1);
    }
    function clear() {
        particles = [];
        trails = [];
        launches = [];
    }
    return {
        burst,
        update,
        clear,
        get particles () {
            return particles;
        },
        get trails () {
            return trails;
        },
        get active () {
            return particles.length > 0 || trails.length > 0;
        }
    };
}
function particleOpacity(p) {
    const t = clamp(p.age / p.life, 0, 1);
    return Math.min(t / 0.06, 1) * (1 - smoothstep(0.5, 1, t));
}
const ribbonColor = (hue)=>`hsl(${Math.round((hue % 360 + 360) % 360)} 62% 64%)`;
function ribbonRuns(points, side) {
    const runs = [];
    const front = 'front' === side;
    let start = 0;
    while(start < points.length){
        const inFront = points[start].z >= 0;
        let end = start;
        while(end + 1 < points.length && points[end + 1].z >= 0 === inFront)end++;
        const a = Math.max(start - 1, 0);
        const b = Math.min(end + 1, points.length - 1);
        if (inFront === front && b > a) runs.push([
            a,
            b
        ]);
        start = end + 1;
    }
    return runs;
}
function particleSize(p) {
    const t = clamp(p.age / p.life, 0, 1);
    return p.size * (1 - 0.3 * t * t);
}
const fine_parts_kept = new WeakMap();
function withoutFineParts(frame, sizePx) {
    const all = frame.body.parts;
    if (sizePx <= 0 || !all.some((part)=>void 0 !== part.minPx && sizePx < part.minPx)) return frame;
    let entry = fine_parts_kept.get(all);
    if (entry?.sizePx !== sizePx) {
        entry = {
            sizePx,
            parts: all.filter((part)=>void 0 === part.minPx || sizePx >= part.minPx)
        };
        fine_parts_kept.set(all, entry);
    }
    return {
        ...frame,
        body: {
            ...frame.body,
            parts: entry.parts
        }
    };
}
function boxOf(p) {
    let x0 = 1 / 0;
    let x1 = -1 / 0;
    let y0 = 1 / 0;
    let y1 = -1 / 0;
    for (const ring of [
        p,
        ...p.extras ?? []
    ])for(let i = 0; i < ring.n; i++){
        const x = ring.xy[2 * i];
        const y = ring.xy[2 * i + 1];
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
    }
    return {
        x0,
        x1,
        y0,
        y1
    };
}
function addGlyphCoverage(p, size, out) {
    for (const ring of [
        p,
        ...p.extras ?? []
    ])addCoverage(ring.xy, ring.n, size, out, SUBSAMPLES);
}
const face_half = (v)=>Math.round(2 * v) / 2;
function shifted(p, dx, dy) {
    const xy = new Float64Array(2 * p.n);
    for(let i = 0; i < p.n; i++){
        xy[2 * i] = p.xy[2 * i] + dx;
        xy[2 * i + 1] = p.xy[2 * i + 1] + dy;
    }
    return {
        xy,
        n: p.n,
        ...p.extras ? {
            extras: p.extras.map((e)=>shifted(e, dx, dy))
        } : null
    };
}
let maps = {
    size: 0,
    left: new Float32Array(0),
    right: new Float32Array(0),
    glyph: new Float32Array(0)
};
function coverageMaps(size) {
    if (maps.size !== size) {
        const n = size * size;
        maps = {
            size,
            left: new Float32Array(n),
            right: new Float32Array(n),
            glyph: new Float32Array(n)
        };
    } else {
        maps.left.fill(0);
        maps.right.fill(0);
        maps.glyph.fill(0);
    }
    return maps;
}
const SUBSAMPLES = 6;
const THIN = 0.55;
function rasteriseEyes(left, right, { size, put }) {
    const m = coverageMaps(size);
    if (left && right) {
        const bl = boxOf(left);
        const br = boxOf(right);
        const cxl = (bl.x0 + bl.x1) / 2;
        const cyl = (bl.y0 + bl.y1) / 2;
        const cxr = (br.x0 + br.x1) / 2;
        const cyr = (br.y0 + br.y1) / 2;
        const dr = Math.round(cyr - cyl);
        const axis = face_half((cxl + cxr) / 2);
        const reach = face_half((cxr - cxl) / 2);
        const row = face_half((cyl + (cyr - dr)) / 2);
        const anchorL = axis - reach;
        const anchorR = axis + reach;
        const pl = shifted(left, anchorL - cxl, row - cyl);
        const pr = shifted(right, anchorR - cxr, row + dr - cyr);
        addGlyphCoverage(pl, size, m.left);
        addGlyphCoverage(pr, size, m.right);
        const mirror = Math.round(2 * axis);
        for(let r = 0; r < size; r++){
            const rr = r + dr;
            for(let c = 0; c < size; c++){
                const mc = mirror - c - 1;
                const other = rr >= 0 && rr < size && mc >= 0 && mc < size ? m.right[rr * size + mc] : 0;
                m.glyph[r * size + c] = (m.left[r * size + c] + other) / 2;
            }
        }
        const cells = face_glyph(m.glyph, size, anchorL, row, bl.x1 - bl.x0 >= bl.y1 - bl.y0);
        let inner = Math.max(...cells.map(([c])=>c));
        while(mirror - 2 * inner - 2 < 1 && cells.some(([c])=>c < inner)){
            for(let i = cells.length - 1; i >= 0; i--)if (cells[i][0] === inner) cells.splice(i, 1);
            inner = Math.max(...cells.map(([c])=>c));
        }
        for (const [c, r] of cells){
            put(c, r);
            put(mirror - c - 1, r + dr);
        }
        return axis;
    }
    const only = left ?? right;
    if (!only) return null;
    const b = boxOf(only);
    const ax = face_half((b.x0 + b.x1) / 2);
    const ay = face_half((b.y0 + b.y1) / 2);
    const p = shifted(only, ax - (b.x0 + b.x1) / 2, ay - (b.y0 + b.y1) / 2);
    addGlyphCoverage(p, size, m.glyph);
    for (const [c, r] of face_glyph(m.glyph, size, ax, ay, b.x1 - b.x0 >= b.y1 - b.y0))put(c, r);
    return null;
}
function rasteriseGlyph(poly, axis, { size, put }) {
    const m = coverageMaps(size);
    const b = boxOf(poly);
    const [dx, dy] = glyphShift(poly, axis);
    const ax = (b.x0 + b.x1) / 2 + dx;
    const ay = (b.y0 + b.y1) / 2 + dy;
    addGlyphCoverage(shifted(poly, dx, dy), size, m.glyph);
    for (const [c, r] of face_glyph(m.glyph, size, ax, ay, b.x1 - b.x0 >= b.y1 - b.y0))put(c, r);
}
function glyphShift(poly, axis) {
    const b = boxOf(poly);
    const middle = (b.x0 + b.x1) / 2;
    const ax = null !== axis && Math.abs(middle - axis) < 1.5 ? axis : face_half(middle);
    const cy = (b.y0 + b.y1) / 2;
    return [
        ax - middle,
        face_half(cy) - cy
    ];
}
function face_glyph(cover, size, anchorX, anchorY, wide) {
    const cells = [];
    let best = 0;
    for(let i = 0; i < cover.length; i++)if (cover[i] > best) best = cover[i];
    if (best <= 0) return [
        [
            Math.floor(anchorX),
            Math.floor(anchorY)
        ]
    ];
    if (best < THIN) {
        const sums = new Float32Array(size);
        for(let a = 0; a < size; a++)for(let b = 0; b < size; b++)sums[a] += cover[wide ? b * size + a : a * size + b];
        const heaviest = Math.max(...sums);
        for(let a = 0; a < size; a++){
            if (sums[a] < Math.max(0.1, 0.35 * heaviest)) continue;
            let weight = 0;
            for(let b = 0; b < size; b++)weight += (b + 0.5) * cover[wide ? b * size + a : a * size + b];
            const at = Math.min(size - 1, Math.floor(weight / sums[a]));
            cells.push(wide ? [
                a,
                at
            ] : [
                at,
                a
            ]);
        }
        if (cells.length > 0) return cells;
    }
    const threshold = Math.min(0.45, Math.max(0.18, 0.5 * best));
    for(let i = 0; i < cover.length; i++)if (cover[i] >= threshold) cells.push([
        i % size,
        Math.floor(i / size)
    ]);
    if (0 === cells.length) {
        let at = 0;
        for(let i = 1; i < cover.length; i++)if (cover[i] > cover[at]) at = i;
        cells.push([
            at % size,
            Math.floor(at / size)
        ]);
    }
    return cells;
}
function rasteriseStroke(poly, closed, radius, axis, put) {
    const b = boxOf(poly);
    const middle = (b.x0 + b.x1) / 2;
    const target = null !== axis && Math.abs(middle - axis) < 1.5 ? axis : face_half(middle);
    const p = shifted(poly, target - middle, 0);
    strokePolyline(p.xy, p.n, closed, radius, put);
}
const drawn_SUBSAMPLES = 6;
const DETAIL = 0.75;
const PIXEL_SHOWN = 0.5;
const drawn_half = (v)=>Math.round(2 * v) / 2;
function placedOf(shape, bodyM) {
    const t = shape.transform;
    const [a, b, c, d] = t.matrix;
    const m = compose(bodyM, [
        a,
        b,
        c,
        d,
        0,
        0
    ]);
    const at = new Float64Array(2);
    grid_apply(bodyM, t.x, t.y, at, 0);
    return {
        linear: [
            m[0],
            m[1],
            m[2],
            m[3]
        ],
        anchor: [
            at[0],
            at[1]
        ],
        pivot: [
            t.pivotX,
            t.pivotY
        ]
    };
}
const mirrored = ([a, b, c, d])=>[
        a,
        -b,
        -c,
        d
    ];
const average = (p, q)=>[
        (p[0] + q[0]) / 2,
        (p[1] + q[1]) / 2,
        (p[2] + q[2]) / 2,
        (p[3] + q[3]) / 2
    ];
let drawn_scratch = {
    size: 0,
    cover: new Float32Array(0),
    holes: new Float32Array(0)
};
function drawn_maps(size) {
    if (drawn_scratch.size !== size) drawn_scratch = {
        size,
        cover: new Float32Array(size * size),
        holes: new Float32Array(size * size)
    };
    return drawn_scratch;
}
function drawLayer(layer, linear, pivot, anchor, size, put, paint) {
    if (layer.opacity < PIXEL_SHOWN) return;
    const id = paint(layer);
    if (null === id) return;
    const { cover, holes } = drawn_maps(size);
    cover.fill(0);
    if (layer.holes) holes.fill(0);
    const [a, b, c, d] = linear;
    let x0 = 1 / 0;
    let x1 = -1 / 0;
    let y0 = 1 / 0;
    let y1 = -1 / 0;
    layer.rings.forEach((ring, i)=>{
        const xy = new Float64Array(2 * ring.length);
        ring.forEach(([px, py], k)=>{
            const dx = px - pivot[0];
            const dy = py - pivot[1];
            const x = anchor[0] + a * dx + c * dy;
            const y = anchor[1] + b * dx + d * dy;
            xy[2 * k] = x;
            xy[2 * k + 1] = y;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
        });
        addCoverage(xy, ring.length, size, layer.holes && i > 0 ? holes : cover, drawn_SUBSAMPLES);
    });
    if (layer.holes) for(let i = 0; i < cover.length; i++)cover[i] = Math.max(0, cover[i] - holes[i]);
    if (layer.detail) {
        for(let i = 0; i < cover.length; i++)if (cover[i] >= DETAIL) put(i % size, Math.floor(i / size), id);
        return;
    }
    let best = 0;
    for(let i = 0; i < cover.length; i++)best = Math.max(best, cover[i]);
    const cells = best > 0 && best < drawn_THIN ? thinCells(cover, size) : face_glyph(cover, size, (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0 >= y1 - y0);
    for (const [col, row] of cells)put(col, row, id);
}
const drawn_THIN = 0.55;
function thinCells(cover, size) {
    const lit = new Set();
    const scan = (byColumn)=>{
        const runs = [];
        for(let line = 0; line < size; line++){
            let sum = 0;
            let weight = 0;
            for(let k = 0; k <= size; k++){
                const v = k < size ? cover[byColumn ? k * size + line : line * size + k] : 0;
                if (v > 0.02) {
                    sum += v;
                    weight += (k + 0.5) * v;
                } else if (sum > 0) {
                    runs.push({
                        sum,
                        weight,
                        line
                    });
                    sum = 0;
                    weight = 0;
                }
            }
        }
        const heaviest = Math.max(0, ...runs.map((r)=>r.sum));
        for (const run of runs){
            if (run.sum < Math.max(0.1, 0.35 * heaviest)) continue;
            const at = Math.min(size - 1, Math.floor(run.weight / run.sum));
            lit.add(byColumn ? at * size + run.line : run.line * size + at);
        }
    };
    scan(true);
    scan(false);
    return [
        ...lit
    ].map((i)=>[
            i % size,
            Math.floor(i / size)
        ]);
}
function rasteriseDrawn(drawn, bodyM, size, put, paint) {
    const design = drawn.reduce((best, d)=>!best || d.opacity > best.opacity ? d : best, null);
    if (!design || design.opacity < PIXEL_SHOWN) return null;
    const { left, right, plate } = design;
    let axis = null;
    if (left.visible && right.visible) {
        const l = placedOf(left, bodyM);
        const r = placedOf(right, bodyM);
        const linear = average(l.linear, mirrored(r.linear));
        const dr = Math.round(r.anchor[1] - l.anchor[1]);
        axis = drawn_half((l.anchor[0] + r.anchor[0]) / 2);
        const reach = drawn_half((r.anchor[0] - l.anchor[0]) / 2);
        const row = drawn_half((l.anchor[1] + r.anchor[1] - dr) / 2);
        if (plate?.visible) {
            const p = placedOf(plate, bodyM);
            const symmetric = average(p.linear, mirrored(p.linear));
            for (const layer of plate.layers)drawLayer(layer, symmetric, p.pivot, [
                axis,
                row + dr / 2
            ], size, put, paint);
        }
        for (const layer of left.layers)drawLayer(layer, linear, l.pivot, [
            axis - reach,
            row
        ], size, put, paint);
        for (const layer of right.layers)drawLayer(layer, mirrored(linear), r.pivot, [
            axis + reach,
            row + dr
        ], size, put, paint);
    } else for (const shape of [
        left,
        right
    ]){
        if (!shape.visible) continue;
        const p = placedOf(shape, bodyM);
        const anchor = [
            drawn_half(p.anchor[0]),
            drawn_half(p.anchor[1])
        ];
        for (const layer of shape.layers)drawLayer(layer, p.linear, p.pivot, anchor, size, put, paint);
    }
    return {
        axis,
        design
    };
}
function rasteriseInMouth(design, mouth, bodyM, shift, size, put, paint) {
    if (!design.inMouth || !mouth.visible) return;
    const p = placedOf(mouth, bodyM);
    const anchor = [
        p.anchor[0] + shift[0],
        p.anchor[1] + shift[1]
    ];
    for (const layer of design.inMouth)drawLayer(layer, p.linear, p.pivot, anchor, size, put, paint);
}
const PIXEL_GLYPHS = {
    pencil: [
        [
            -0.135,
            -0.5,
            0.135,
            -0.5,
            0.135,
            -0.35,
            -0.135,
            -0.35
        ],
        [
            -0.135,
            -0.29,
            0.135,
            -0.29,
            0.135,
            0.26,
            0,
            0.5,
            -0.135,
            0.26
        ]
    ],
    bang: [
        [
            -0.1,
            -0.5,
            0.1,
            -0.5,
            0.065,
            0.16,
            -0.065,
            0.16
        ],
        [
            -0.11,
            0.28,
            0.11,
            0.28,
            0.11,
            0.5,
            -0.11,
            0.5
        ]
    ]
};
const PIXEL_BLUSH = '#FF9DBB';
const IRIS_TONE = -0.45;
const LIGHT_STEP = 32;
const hex2 = (v)=>Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
function lightHex([r, g, b]) {
    const snap = (v)=>Math.round(v / LIGHT_STEP) * LIGHT_STEP;
    return `#${hex2(snap(r))}${hex2(snap(g))}${hex2(snap(b))}`.toUpperCase();
}
function drawnTint(role, light, settings, band) {
    if (isFaceAccent(role)) return {
        kind: 'css',
        value: FACE_ACCENTS[role]
    };
    switch(role){
        case 'face':
            return settings.face ?? settings.eye;
        case 'pupil':
            return {
                kind: 'css',
                value: PUPIL_TOKEN
            };
        case 'feature':
            return {
                kind: 'css',
                value: FEATURE_TOKEN
            };
        case 'glint':
            return {
                kind: 'css',
                value: GLINT_TOKEN
            };
        case 'iris':
            return {
                kind: 'ink',
                band,
                tone: IRIS_TONE
            };
        default:
            return {
                kind: 'css',
                value: light ? lightHex(light) : FACE_ACCENTS.glass
            };
    }
}
function createScratch(size) {
    return {
        size,
        body: new Uint8Array(size * size),
        tone: new Uint8Array(size * size),
        face: new Uint8Array(size * size),
        quad: new Float64Array(8)
    };
}
const rasterise_TAU = 2 * Math.PI;
function mapPoints(points, m) {
    const xy = new Float64Array(2 * points.length);
    for(let i = 0; i < points.length; i++)grid_apply(m, points[i][0], points[i][1], xy, 2 * i);
    return {
        xy,
        n: points.length
    };
}
function mapFlat(flat, m) {
    const n = flat.length / 2;
    const xy = new Float64Array(flat.length);
    for(let i = 0; i < n; i++)grid_apply(m, flat[2 * i], flat[2 * i + 1], xy, 2 * i);
    return {
        xy,
        n
    };
}
function tangentAffine(t) {
    const [a, b, c, d] = t.matrix;
    return [
        a,
        b,
        c,
        d,
        t.x - a * t.pivotX - c * t.pivotY,
        t.y - b * t.pivotX - d * t.pivotY
    ];
}
function rasterise(snapshot, settings, table, scratch, paint) {
    const { grid } = settings;
    const size = grid.size;
    const frame = withoutFineParts(snapshot, size);
    paint.fill(0);
    let current = 0;
    const put = (col, row)=>{
        if (col >= 0 && row >= 0 && col < size && row < size) paint[row * size + col] = current;
    };
    const select = (tint, opacity = 1)=>{
        const alpha = alphaLevel(opacity);
        if (alpha <= 0) return false;
        current = table.id(tint, alpha);
        return true;
    };
    const root = compose(toBuffer(grid), scaleAboutCentre(frame.shapeScale, frame.shapeScale));
    const k = meanScale(root);
    const b = frame.body;
    const bodyM = compose(root, compose(translation(b.x, b.y), compose(rotateAboutCentre(b.rotation), scaleAboutCentre(b.scaleX, b.scaleY))));
    const bands = null === settings.gradient ? 1 : Math.max(1, Math.round(settings.shades));
    const inkTint = (band = Math.floor(bands / 2), tone = 0)=>({
            kind: 'ink',
            band,
            tone
        });
    const point = (m, x, y)=>{
        grid_apply(m, x, y, scratch.quad, 0);
        return [
            scratch.quad[0],
            scratch.quad[1]
        ];
    };
    const stroke = (pts, m, r, closed = false)=>{
        const poly = mapPoints(pts, m);
        strokePolyline(poly.xy, poly.n, closed, r, put);
    };
    const trails = (list, side)=>{
        for (const trail of list)if (select({
            kind: 'css',
            value: ribbonColor(trail.hue)
        }, trail.opacity)) for (const [start, end] of ribbonRuns(trail.points, side))stroke(trail.points.slice(start, end + 1).map((p)=>[
                p.x,
                p.y
            ]), root, Math.max(0.5, trail.size * k / 3));
    };
    trails(frame.trails, 'back');
    const belt = frame.belt;
    if (belt) for (const ring of belt.rings){
        if (ring.r <= 0.1 || !select(inkTint(), ring.opacity * belt.blend)) continue;
        const [cx, cy] = point(root, ring.x, ring.y);
        const dash = ring.dash ? {
            on: ring.dash.on * k,
            period: ring.dash.period * k
        } : void 0;
        strokeArc(cx, cy, ring.r * k, -Math.PI / 2, rasterise_TAU - Math.PI / 2, Math.max(0.5, ring.width * k / 2), put, dash);
    }
    drawBody(frame, settings, table, scratch, paint, bodyM, bands, put, (id)=>current = id);
    if (belt) {
        for (const dot of belt.dots){
            if (!select(inkTint(), dot.opacity * belt.blend)) continue;
            const [x, y] = point(root, dot.x, dot.y);
            fillDisc(x, y, dot.r * k, put);
        }
        for (const g of belt.glyphs){
            if (!select(inkTint(), g.opacity * belt.blend)) continue;
            const m = compose(root, compose(translation(g.x, g.y), compose(rotationAbout(g.rotation * Math.PI / 180), uniform(g.scale * BELT_GLYPH_SIZE))));
            stampGlyph(g.kind, m, size, put);
        }
    }
    drawHud(frame, root, k, select, put, inkTint);
    drawFx(frame, frame.fx?.space === 'face' ? bodyM : root, size, select, put, Math.floor(bands / 2));
    trails(frame.trails, 'front');
    for (const p of frame.particles){
        if (!select({
            kind: 'css',
            value: p.color
        }, p.opacity)) continue;
        const [x, y] = point(root, p.x, p.y);
        const s = p.size * k;
        if ('strip' === p.kind) {
            const half = 2.2 * p.size * k / 2 - s / 2;
            const dx = Math.cos(p.rotation) * half;
            const dy = Math.sin(p.rotation) * half;
            scratch.quad[0] = x - dx;
            scratch.quad[1] = y - dy;
            scratch.quad[2] = x + dx;
            scratch.quad[3] = y + dy;
            strokePolyline(scratch.quad.subarray(0, 4), 2, false, Math.max(0.5, s / 2), put);
        } else if ('star' === p.kind && s >= 1.2) {
            const col = Math.floor(x);
            const row = Math.floor(y);
            put(col, row);
            put(col - 1, row);
            put(col + 1, row);
            put(col, row - 1);
            put(col, row + 1);
        } else fillDisc(x, y, s / 2, put);
    }
}
const FX_GLYPHS = {
    zSmall: [
        '###',
        '.#.',
        '###'
    ],
    zBig: [
        '####',
        '..#.',
        '.#..',
        '####'
    ],
    star: [
        '.#.',
        '###',
        '.#.'
    ],
    heart: [
        '#.#',
        '###',
        '.#.'
    ],
    drop: [
        '#',
        '#'
    ],
    bang: [
        '##',
        '##',
        '##',
        '..',
        '##'
    ],
    block: [
        '##',
        '##'
    ]
};
const SHORT_ARC = 60;
function stampGlyph(kind, m, size, put) {
    const cover = new Float32Array(size * size);
    let any = false;
    for (const part of PIXEL_GLYPHS[kind]){
        const poly = mapFlat(part, m);
        addCoverage(poly.xy, poly.n, size, cover, 4);
    }
    let best = 0;
    let bestAt = 0;
    for(let i = 0; i < cover.length; i++){
        if (cover[i] >= 0.4) {
            put(i % size, Math.floor(i / size));
            any = true;
        }
        if (cover[i] > best) {
            best = cover[i];
            bestAt = i;
        }
    }
    if (!any && best > 0) put(bestAt % size, Math.floor(bestAt / size));
}
function drawFx(frame, m, size, select, put, band) {
    const fx = frame.fx;
    if (!fx || 0 === fx.items.length) return;
    const tint = fx.color ? {
        kind: 'css',
        value: fx.color
    } : {
        kind: 'fx',
        band
    };
    const at = (x, y)=>[
            m[0] * x + m[2] * y + m[4],
            m[1] * x + m[3] * y + m[5]
        ];
    const stamp = (rows, cx, top)=>{
        const left = Math.round(cx - rows[0].length / 2);
        const first = Math.round(top);
        rows.forEach((line, dy)=>{
            for(let dx = 0; dx < line.length; dx++)if ('#' === line[dx]) put(left + dx, first + dy);
        });
    };
    for (const item of fx.items){
        if (!select(tint, item.opacity)) continue;
        const [x, y] = at(item.x, item.y);
        const reach = item.size * meanScale(m);
        switch(item.shape){
            case 'z':
                stamp(reach >= 4.5 ? FX_GLYPHS.zBig : FX_GLYPHS.zSmall, x, y - (reach >= 4.5 ? 2 : 1.5));
                break;
            case 'star':
                if (reach >= 2) stamp(FX_GLYPHS.star, x, y - 1.5);
                else put(Math.floor(x), Math.floor(y));
                break;
            case 'heart':
                stamp(FX_GLYPHS.heart, x, y - 1.5);
                break;
            case 'drop':
                stamp(FX_GLYPHS.drop, x, y - 1);
                break;
            case 'bang':
                stamp(FX_GLYPHS.bang, x, y);
                break;
            case 'line':
                {
                    const [x2, y2] = at(item.x2 ?? item.x, item.y2 ?? item.y);
                    strokePolyline(new Float64Array([
                        x,
                        y,
                        x2,
                        y2
                    ]), 2, false, 0.5, put);
                    break;
                }
            case 'arc':
                {
                    const sweep = item.sweep ?? 0;
                    if (sweep < SHORT_ARC) {
                        const a = ((item.start ?? 0) + sweep) * Math.PI / 180;
                        stamp(FX_GLYPHS.block, x + Math.sin(a) * reach, y - Math.cos(a) * reach - 1);
                    } else {
                        const from = ((item.start ?? 0) - 90) * Math.PI / 180;
                        const half = Math.max(0.5, (item.width ?? 0) * meanScale(m) / 2);
                        strokeArc(x, y, reach, from, from + sweep * Math.PI / 180, half, put);
                    }
                    break;
                }
            case 'dot':
                fillDisc(x, y, Math.max(0.75, reach), put);
                break;
            case 'pencil':
                {
                    const lean = (item.rotation ?? 0) * Math.PI / 180;
                    const glyphToCell = compose(m, compose(translation(item.x, item.y), compose(rotationAbout(lean), uniform(item.size * BELT_GLYPH_SIZE))));
                    stampGlyph('pencil', glyphToCell, size, put);
                    break;
                }
        }
    }
}
function uniform(s) {
    return [
        s,
        0,
        0,
        s,
        0,
        0
    ];
}
function rotationAbout(radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return [
        cos,
        sin,
        -sin,
        cos,
        0,
        0
    ];
}
function drawBody(frame, settings, table, scratch, paint, bodyM, bands, put, setCurrent) {
    const { grid } = settings;
    const size = grid.size;
    const b = frame.body;
    const alpha = alphaLevel(b.coreOpacity ?? 1);
    if (alpha <= 0) return;
    const mask = scratch.body;
    mask.fill(0);
    const outline = mapPoints(b.outline, bodyM);
    fillCentres(outline.xy, outline.n, size, mask);
    fillBodyParts(frame, bodyM, size, mask);
    const ladder = ladderFor(settings.shades);
    const leds = 'dot' === settings.variant;
    const tones = scratch.tone;
    classify(mask, size, tones);
    let minCol = size;
    let maxCol = -1;
    let minRow = size;
    let maxRow = -1;
    if (null !== settings.gradient) {
        for(let row = 0; row < size; row++)for(let col = 0; col < size; col++)if (mask[row * size + col]) {
            if (col < minCol) minCol = col;
            if (col > maxCol) maxCol = col;
            if (row < minRow) minRow = row;
            if (row > maxRow) maxRow = row;
        }
    }
    const angle = (settings.gradient ?? 0) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const w = Math.max(1, maxCol - minCol + 1);
    const h = Math.max(1, maxRow - minRow + 1);
    for(let row = 0; row < size; row++)for(let col = 0; col < size; col++){
        const i = row * size + col;
        if (!mask[i]) continue;
        let tone = 0;
        let band = Math.floor(bands / 2);
        if (null !== settings.gradient) {
            const t = ((col + 0.5 - minCol) / w - 0.5) * cos + ((row + 0.5 - minRow) / h - 0.5) * sin + 0.5;
            band = Math.min(bands - 1, Math.max(0, Math.floor(t * bands)));
        }
        const cls = tones[i];
        if (cls === CELL_EDGE) tone = settings.outline && !leds ? ladder.edge : 0;
        else if (null === settings.gradient) {
            if (cls === CELL_LIGHT) tone = ladder.light;
            else if (cls === CELL_GLINT) tone = ladder.glint;
            else if (cls === CELL_SHADOW && !leds) tone = ladder.shadow;
        }
        paint[i] = table.id({
            kind: 'ink',
            band,
            tone
        }, alpha);
    }
    paintAccessories(frame, bodyM, size, paint, table, scratch.face, Math.floor(bands / 2));
    const face = frame.face;
    const eyePaint = table.id(settings.eye, 1);
    const g = face.geometry;
    if (face.opacity >= 0.5 && g) {
        const taken = scratch.face;
        taken.fill(0);
        const EYE = 1;
        const NOSE = 2;
        const MOUTH = 4;
        const near = (col, row, kinds)=>((col >= 0 && col < size && row >= 0 && row < size ? taken[row * size + col] : 0) & kinds) !== 0 || col > 0 && (taken[row * size + col - 1] & kinds) !== 0 || col < size - 1 && (taken[row * size + col + 1] & kinds) !== 0 || row > 0 && (taken[(row - 1) * size + col] & kinds) !== 0 || row < size - 1 && (taken[(row + 1) * size + col] & kinds) !== 0;
        const writer = (kind, clear)=>(col, row)=>{
                if (col < 0 || row < 0 || col >= size || row >= size || !mask[row * size + col]) return;
                if (0 !== clear && near(col, row, clear)) return;
                paint[row * size + col] = eyePaint;
                taken[row * size + col] |= kind;
            };
        const eyePoly = (shape)=>{
            if (!shape.visible) return null;
            const m = compose(bodyM, tangentAffine(shape.transform));
            const poly = mapPoints(shape.points, m);
            if (shape.extras) poly.extras = shape.extras.map((ring)=>mapPoints(ring, m));
            return poly;
        };
        if (face.cute >= 0.5) {
            const features = eyePaint;
            const writeCute = (kind, clear, id)=>(col, row)=>{
                    if (col < 0 || row < 0 || col >= size || row >= size || !mask[row * size + col]) return;
                    if (0 !== clear && near(col, row, clear)) return;
                    paint[row * size + col] = id;
                    taken[row * size + col] |= kind;
                };
            let axis = (g.eyeOpacity ?? 1) >= PIXEL_SHOWN ? rasteriseEyes(eyePoly(g.left), eyePoly(g.right), {
                size,
                put: writeCute(EYE, 0, features)
            }) : null;
            const layerPaint = (layer)=>table.id(drawnTint(layer.paint, layer.light, settings, Math.floor(bands / 2)), 1);
            const putDrawn = (col, row, id)=>{
                if (col < 0 || row < 0 || col >= size || row >= size || !mask[row * size + col]) return;
                paint[row * size + col] = id;
                taken[row * size + col] |= EYE;
            };
            const drawn = g.drawn ? rasteriseDrawn(g.drawn, bodyM, size, putDrawn, layerPaint) : null;
            if (drawn) axis = drawn.axis ?? axis;
            const design = drawn ? getFaceDesign(drawn.design.style) : null;
            const mouthPaint = design ? table.id(drawnTint(design.mouthPaint, void 0, settings, Math.floor(bands / 2)), 1) : features;
            const mouth = g.mouth;
            if (mouth?.visible && (mouth.opacity ?? 1) >= 0.5) {
                const poly = mapPoints(mouth.points, compose(bodyM, tangentAffine(mouth.transform)));
                rasteriseGlyph(poly, axis, {
                    size,
                    put: writeCute(MOUTH, EYE, mouthPaint)
                });
                if (drawn) rasteriseInMouth(drawn.design, mouth, bodyM, glyphShift(poly, axis), size, putDrawn, layerPaint);
            }
            const blush = g.blush;
            if (blush && face.blush >= 0.5) {
                const putBlush = writeCute(0, EYE | MOUTH, table.id({
                    kind: 'css',
                    value: PIXEL_BLUSH
                }, 1));
                for (const cheek of [
                    blush.left,
                    blush.right
                ])if (cheek.visible) rasteriseGlyph(eyePoly(cheek), axis, {
                    size,
                    put: putBlush
                });
            }
        } else {
            const axis = rasteriseEyes(eyePoly(g.left), eyePoly(g.right), {
                size,
                put: writer(EYE, 0)
            });
            const radius = Math.max(0.5, g.lineWidth * meanScale(bodyM) / 2);
            if (face.features) {
                const nose = g.nose;
                if (nose?.visible && face.lineBlend * face.featureFade >= 0.5) {
                    const poly = mapPoints(nose.points, compose(bodyM, tangentAffine(nose.transform)));
                    rasteriseStroke(poly, nose.closed, radius, axis, writer(NOSE, EYE));
                }
                const mouth = g.mouth;
                if (mouth?.visible && face.lineBlend >= 0.5) {
                    const poly = mapPoints(mouth.points, compose(bodyM, tangentAffine(mouth.transform)));
                    rasteriseStroke(poly, mouth.closed, radius, axis, writer(MOUTH, EYE | NOSE));
                }
            }
        }
    }
    const badge = frame.badge;
    if (badge) {
        const [x, y] = [
            bodyM[0] * badge.x + bodyM[2] * badge.y + bodyM[4],
            bodyM[1] * badge.x + bodyM[3] * badge.y + bodyM[5]
        ];
        const k = meanScale(bodyM);
        const ring = 'dot' === settings.variant ? 0 : eyePaint;
        setCurrent(ring);
        fillDisc(x, y, (badge.r + 4) * k, put);
        setCurrent(table.id({
            kind: 'css',
            value: badge.color
        }, 1));
        fillDisc(x, y, badge.r * k, put);
    }
}
function drawHud(frame, root, k, select, put, inkTint) {
    const hud = frame.hud;
    const p = hud.primitives;
    if (!p || hud.opacity <= 0) return;
    const pen = Math.max(0.5, hud.strokeWidth * k / 2);
    const at = (x, y)=>[
            root[0] * x + root[2] * y + root[4],
            root[1] * x + root[3] * y + root[5]
        ];
    for (const a of p.arcs){
        if (a.r <= 0.1 || !select(inkTint(), a.opacity * hud.opacity)) continue;
        const [cx, cy] = at(a.x, a.y);
        strokeArc(cx, cy, a.r * k, a.start, a.end, Math.max(0.5, a.width * k / 2), put);
    }
    for (const t of p.ticks){
        if (!select(inkTint(), t.opacity * hud.opacity)) continue;
        const [x1, y1] = at(t.x1, t.y1);
        const [x2, y2] = at(t.x2, t.y2);
        strokePolyline(new Float64Array([
            x1,
            y1,
            x2,
            y2
        ]), 2, false, pen, put);
    }
    for (const bar of p.bars){
        if (!select(inkTint(), bar.opacity * hud.opacity)) continue;
        const [x0, y0] = at(bar.x, bar.y);
        const x1 = x0 + bar.w * k;
        const y1 = y0 + bar.h * k;
        const c0 = Math.ceil(x0 - 0.5);
        const c1 = Math.ceil(x1 - 0.5);
        const r0 = Math.ceil(y0 - 0.5);
        const r1 = Math.ceil(y1 - 0.5);
        const cols = c1 > c0 ? [
            c0,
            c1
        ] : [
            Math.floor((x0 + x1) / 2),
            Math.floor((x0 + x1) / 2) + 1
        ];
        const rowsRange = r1 > r0 ? [
            r0,
            r1
        ] : [
            Math.floor((y0 + y1) / 2),
            Math.floor((y0 + y1) / 2) + 1
        ];
        for(let row = rowsRange[0]; row < rowsRange[1]; row++)for(let col = cols[0]; col < cols[1]; col++)put(col, row);
    }
    for (const s of p.strokes)if (select(inkTint(), s.opacity * hud.opacity)) for (const line of s.lines){
        const xy = new Float64Array(2 * line.length);
        for(let i = 0; i < line.length; i++){
            const [x, y] = at(line[i][0], line[i][1]);
            xy[2 * i] = x;
            xy[2 * i + 1] = y;
        }
        strokePolyline(xy, line.length, false, pen, put);
    }
    for (const pip of p.pips){
        if (!select(inkTint(), pip.opacity * hud.opacity)) continue;
        const [x, y] = at(pip.x, pip.y);
        fillDisc(x, y, pip.r * k, put);
    }
}
let idSerial = 0;
const DEFAULT_ANGLE = 135;
function createPixelRenderer(host, context) {
    const svg = createSvgElement('svg');
    svg.setAttribute('viewBox', VIEWBOX_STR);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.overflow = 'visible';
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    const root = createSvgElement('g');
    svg.appendChild(root);
    host.appendChild(svg);
    const seed = `${fnv1a32(context.seed).toString(36)}-${(idSerial++).toString(36)}`;
    const ids = {
        pattern: `aora-px-${seed}`,
        glow: `aora-pg-${seed}`
    };
    let options = readOptions(context.styleOptions);
    const table = createPaintTable();
    let grid = pixelGrid(options.grid);
    let scratch = createScratch(grid.size);
    let paint = new Uint16Array(grid.size * grid.size);
    let previous = new Uint16Array(grid.size * grid.size);
    let last = null;
    let lastTime = NaN;
    let lastBucket = NaN;
    let signature = '';
    let dirty = true;
    function resize() {
        grid = pixelGrid(options.grid);
        scratch = createScratch(grid.size);
        paint = new Uint16Array(grid.size * grid.size);
        previous = new Uint16Array(grid.size * grid.size);
    }
    function draw(frame) {
        last = frame;
        const variant = variantOf(frame.variant);
        const ink = frame.ink;
        const gradient = ink && 'from' in ink ? ink.angle ?? DEFAULT_ANGLE : null;
        const eye = {
            kind: 'css',
            value: 'dot' === variant ? LED_EYE_TOKEN : eyeToken(FEATURE_TOKEN)
        };
        const face = {
            kind: 'css',
            value: 'dot' === variant ? LED_EYE_TOKEN : FACE_TOKEN
        };
        const inkKey = ink ? 'flat' in ink ? `f${ink.flat}` : `g${ink.from}|${ink.to}` : '';
        const next = `${variant}|${inkKey}|${gradient}`;
        if (next !== signature) {
            signature = next;
            table.clear();
            previous.fill(0);
            dirty = true;
        }
        const bucket = options.fps > 0 ? Math.floor(frame.time * options.fps) : NaN;
        const sameBucket = !dirty && frame.time !== lastTime && bucket === lastBucket;
        lastTime = frame.time;
        if (sameBucket) return;
        lastBucket = bucket;
        const settings = {
            grid,
            shades: options.shades,
            outline: options.outline,
            variant,
            gradient,
            eye,
            face
        };
        rasterise(frame, settings, table, scratch, paint);
        if (!dirty) {
            let same = true;
            for(let i = 0; i < paint.length; i++)if (paint[i] !== previous[i]) {
                same = false;
                break;
            }
            if (same) return;
        }
        previous.set(paint);
        dirty = false;
        const bands = null === gradient ? 1 : Math.max(1, Math.round(options.shades));
        const base = (band)=>{
            if (!ink) return 'dot' === variant ? LINE_TOKEN : INK_TOKEN;
            if ('flat' in ink) return ink.flat;
            return blendCss(ink.from, ink.to, (band + 0.5) / bands);
        };
        const colour = (def)=>{
            const tint = def.tint;
            switch(tint.kind){
                case 'css':
                    return {
                        value: tint.value
                    };
                case 'hair':
                    return {
                        value: `color-mix(in oklab, ${base(tint.band)}, ${HAIR_SHADE_TOKEN} ${100 * HAIR_MIX}%)`
                    };
                case 'fx':
                    return {
                        value: ink ? base(tint.band) : FX_TOKEN
                    };
                case 'part':
                    return {
                        value: shadeCss(tint.rim ? partRimCss(tint.color) : partColorCss(tint.color), tint.tone)
                    };
                default:
                    return {
                        value: shadeCss(base(tint.band), tint.tone)
                    };
            }
        };
        const { scene } = emit(paint, table, {
            grid,
            variant,
            gap: options.gap,
            glow: options.glow,
            colour,
            ids
        });
        syncElement(root, {
            tag: 'g',
            attrs: {
                id: context.sourceId || void 0
            },
            children: [
                scene
            ]
        });
    }
    return {
        element: svg,
        draw,
        configure (styleOptions) {
            const before = options.grid;
            options = readOptions(styleOptions);
            if (options.grid !== before) resize();
            table.clear();
            previous.fill(0);
            dirty = true;
            if (last) draw(last);
        },
        destroy () {
            svg.remove();
        }
    };
}
const STATIC_ANGLE = 45;
const renderPixelStatic = (frame, context)=>{
    const { color, uid, flat } = context;
    const options = readOptions(context.styleOptions);
    const variant = variantOf(frame.variant);
    const grid = pixelGrid(options.grid);
    const table = createPaintTable();
    const paint = new Uint16Array(grid.size * grid.size);
    const panel = 'dot' === variant;
    const ledEye = isLightInk(getInkColor(color, 'dark')) ? PLATE_COLOUR : LED_EYE;
    const eyeColour = context.eyeColor ?? (panel ? ledEye : FEATURE_TOKEN);
    const faceColour = panel ? ledEye : FACE_TOKEN;
    rasterise(frame, {
        grid,
        shades: options.shades,
        outline: options.outline,
        variant,
        gradient: flat ? null : STATIC_ANGLE,
        eye: {
            kind: 'css',
            value: eyeColour
        },
        face: {
            kind: 'css',
            value: faceColour
        }
    }, table, createScratch(grid.size), paint);
    const bands = flat ? 1 : Math.max(1, Math.round(options.shades));
    const light = getInkGradientFor(color, 'light');
    const dark = getInkGradientFor(color, 'dark');
    const lifted = panel ? lineInks(color).dark : null;
    const base = (band, scheme)=>{
        if (lifted) return lifted;
        if (flat) return getInkColor(color, panel ? 'dark' : 'light');
        const g = 'light' === scheme ? light : dark;
        return mixHex(g.from, g.to, (band + 0.5) / bands);
    };
    const effects = effectInks(color);
    const rule = faceInks(color);
    const ruled = (key)=>rule.turns && (!flat || panel) ? {
            value: rule.light[key],
            dark: rule.dark[key]
        } : {
            value: rule.light[key]
        };
    const faceColours = {
        [FACE_TOKEN]: ruled('face'),
        [FEATURE_TOKEN]: ruled('feature'),
        [PUPIL_TOKEN]: ruled('pupil'),
        [GLINT_TOKEN]: ruled('glint')
    };
    const colour = (def)=>{
        const both = paintOf(def);
        return panel ? {
            value: both.dark ?? both.value
        } : both;
    };
    const paintOf = (def)=>{
        const tint = def.tint;
        if ('css' === tint.kind && faceColours[tint.value]) return faceColours[tint.value];
        if ('css' === tint.kind) return {
            value: tint.value === PIXEL_LEAF_TOKEN ? getLeafColor(color) : tint.value
        };
        if ('part' === tint.kind) {
            const pair = tint.rim ? partRimPair(tint.color) : partColorPair(tint.color);
            if (!pair) return {
                value: tint.color
            };
            const onLight = shadeHex(pair.light, tint.tone);
            const onDark = shadeHex(pair.dark, tint.tone);
            return onLight === onDark || flat ? {
                value: onLight
            } : {
                value: onLight,
                dark: onDark
            };
        }
        if ('hair' === tint.kind) {
            const shade = hairShade(color);
            return {
                value: mixHex(base(tint.band, 'light'), shade.light, HAIR_MIX),
                dark: flat ? void 0 : mixHex(base(tint.band, 'dark'), shade.dark, HAIR_MIX)
            };
        }
        if ('fx' === tint.kind) return {
            value: effects.light ?? base(tint.band, 'light'),
            dark: flat ? void 0 : effects.dark ?? base(tint.band, 'dark')
        };
        return {
            value: shadeHex(base(tint.band, 'light'), tint.tone),
            dark: flat ? void 0 : shadeHex(base(tint.band, 'dark'), tint.tone)
        };
    };
    const { scene, overrides, stroked } = emit(paint, table, {
        grid,
        variant,
        gap: options.gap,
        glow: options.glow,
        colour,
        ids: {
            pattern: `${uid}-px`,
            glow: `${uid}-glow`
        },
        classPrefix: `${uid}-`
    });
    const property = stroked ? 'stroke' : 'fill';
    const css = schemeStyle(context.colorScheme ?? 'system', overrides.map((r)=>({
            selector: `.${r.className}`,
            decls: [
                {
                    prop: property,
                    light: r.light,
                    dark: r.dark
                }
            ]
        })), false);
    const style = css && `\n  ${css}`;
    const size = context.sizePx ? ` width="${context.sizePx}" height="${context.sizePx}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX_STR}"${size} fill="none" aria-hidden="true">${style}
  ${serializeNode(scene, 2)}
</svg>`;
};
const pixelStyle = defineStyle({
    id: 'pixel',
    label: 'Pixel',
    variants: [
        'crisp',
        'dot',
        'block'
    ],
    defaultVariant: 'crisp',
    defaults: {
        ...PIXEL_DEFAULTS
    },
    params: {
        grid: {
            type: 'number',
            min: 8,
            max: 64,
            step: 1,
            label: 'Grid'
        },
        gap: {
            type: 'number',
            min: 0,
            max: 0.5,
            step: 0.02,
            label: 'Gap',
            variants: [
                'block',
                'dot'
            ]
        },
        shades: {
            type: 'number',
            min: 1,
            max: 5,
            step: 1,
            label: 'Shades'
        },
        fps: {
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Motion fps'
        },
        outline: {
            type: 'boolean',
            label: 'Outline',
            variants: [
                'crisp',
                'block'
            ]
        },
        glow: {
            type: 'boolean',
            label: 'Glow',
            variants: [
                'dot'
            ]
        }
    },
    createRenderer: createPixelRenderer,
    renderStatic: renderPixelStatic
});
const STYLE_IDS = [
    'vector',
    'pixel',
    'kaomoji'
];
const VECTOR_VARIANTS = [
    'solid',
    'outline',
    'glass',
    'sticker',
    'paper',
    'soft',
    'riso',
    'pencil',
    'marker',
    'crayon',
    'watercolor',
    'neon',
    'chalk',
    'origami',
    'relief',
    'gothic'
];
function polylinePath(points, closed = true) {
    if (points.length < (closed ? 3 : 2)) return '';
    const r = (n)=>roundTo(n, 2);
    let d = `M${r(points[0][0])} ${r(points[0][1])}`;
    for(let i = 1; i < points.length; i++)d += `L${r(points[i][0])} ${r(points[i][1])}`;
    return closed ? `${d}Z` : d;
}
function polylinesPath(lines) {
    const path = new PathBuilder();
    for (const line of lines)line.forEach(([x, y], i)=>0 === i ? path.moveTo(x, y) : path.lineTo(x, y));
    return path.toString();
}
const DEG = Math.PI / 180;
function rotationMatrix(turn, tilt, roll) {
    const cy = Math.cos(turn * DEG);
    const sy = Math.sin(turn * DEG);
    const cx = Math.cos(tilt * DEG);
    const sx = Math.sin(tilt * DEG);
    const cz = Math.cos(roll * DEG);
    const sz = Math.sin(roll * DEG);
    return [
        cz * cy + sz * sx * sy,
        -sz * cx,
        cz * -sy + sz * sx * cy,
        sz * cy - cz * sx * sy,
        cz * cx,
        sz * -sy - cz * sx * cy,
        cx * sy,
        sx,
        cx * cy
    ];
}
function multiplyMat3(a, b) {
    const cell = (r, c)=>a[3 * r] * b[c] + a[3 * r + 1] * b[3 + c] + a[3 * r + 2] * b[6 + c];
    return [
        cell(0, 0),
        cell(0, 1),
        cell(0, 2),
        cell(1, 0),
        cell(1, 1),
        cell(1, 2),
        cell(2, 0),
        cell(2, 1),
        cell(2, 2)
    ];
}
function applyMat3(m, x, y, z) {
    return [
        m[0] * x + m[1] * y + m[2] * z,
        m[3] * x + m[4] * y + m[5] * z,
        m[6] * x + m[7] * y + m[8] * z
    ];
}
function projectOnSphere(cx, cy, matrix, sx = 1, sy = 1) {
    const X = (cx - CENTER) / CENTER;
    const Y = (CENTER - cy) / CENTER;
    const planar = X * X + Y * Y;
    const Z = Math.sqrt(Math.max(0, 1 - planar));
    const [rx, ry, rz] = applyMat3(matrix, X, Y, Z);
    const nx = X;
    const ny = Y;
    const nz = Z;
    const seedIsRight = Math.abs(nx) < 0.999;
    const sxAxis = seedIsRight ? 1 : 0;
    const syAxis = seedIsRight ? 0 : 1;
    const dot = sxAxis * nx + syAxis * ny;
    let ux = sxAxis - dot * nx;
    let uy = syAxis - dot * ny;
    let uz = -dot * nz;
    const ulen = Math.hypot(ux, uy, uz) || 1;
    ux /= ulen;
    uy /= ulen;
    uz /= ulen;
    const vx = ny * uz - nz * uy;
    const vy = nz * ux - nx * uz;
    const vz = nx * uy - ny * ux;
    const [aux, auy] = applyMat3(matrix, ux, uy, uz);
    const [avx, avy] = applyMat3(matrix, vx, vy, vz);
    const a = aux * sx;
    const b = -auy * sy;
    const c = -avx * sx;
    const d = avy * sy;
    return {
        x: CENTER + rx * CENTER * sx,
        y: CENTER - ry * CENTER * sy,
        matrix: [
            a,
            b,
            c,
            d
        ],
        z: rz,
        visible: rz > 0.02
    };
}
function poseMatrix(pose, home) {
    return multiplyMat3(rotationMatrix(pose.turn, pose.tilt, pose.roll), rotationMatrix(home.turn, home.tilt, home.roll));
}
function tangentTransform(p, cx, cy) {
    return {
        x: p.x,
        y: p.y,
        matrix: p.matrix,
        pivotX: cx,
        pivotY: cy
    };
}
function tangentTransformString(t) {
    const [a, b, c, d] = t.matrix;
    const r = (n)=>roundTo(n, 4);
    return `translate(${r(t.x)} ${r(t.y)}) matrix(${r(a)} ${r(b)} ${r(c)} ${r(d)} 0 0) translate(${r(-t.pivotX)} ${r(-t.pivotY)})`;
}
function morph_morphEye(a, b, t) {
    const out = {
        dx: easing_lerp(a.dx, b.dx, t),
        dy: easing_lerp(a.dy, b.dy, t),
        len: easing_lerp(a.len, b.len, t),
        width: easing_lerp(a.width, b.width, t),
        angle: easing_lerp(a.angle, shortestAngle(a.angle, b.angle), t),
        bend: easing_lerp(a.bend, b.bend, t)
    };
    if (a.extra || b.extra) out.extra = morphExtra(a.extra, b.extra, t);
    if (a.star || b.star) out.star = easing_lerp(a.star ?? 0, b.star ?? 0, t);
    return out;
}
function morphExtra(a, b, t) {
    const from = a ?? {
        ...b,
        amount: 0
    };
    const to = b ?? {
        ...a,
        amount: 0
    };
    return {
        dx: easing_lerp(from.dx, to.dx, t),
        dy: easing_lerp(from.dy, to.dy, t),
        len: easing_lerp(from.len, to.len, t),
        width: easing_lerp(from.width, to.width, t),
        angle: easing_lerp(from.angle, shortestAngle(from.angle, to.angle), t),
        bend: easing_lerp(from.bend, to.bend, t),
        amount: easing_lerp(from.amount, to.amount, t)
    };
}
function shortestAngle(from, to) {
    let d = to - from;
    while(d > Math.PI / 2)d -= Math.PI;
    while(d < -Math.PI / 2)d += Math.PI;
    return from + d;
}
function morphEyePair(a, b, t) {
    return [
        morph_morphEye(a[0], b[0], t),
        morph_morphEye(a[1], b[1], t)
    ];
}
function eyeOutline(spec, radius, samples = 28, minWidth = 0.012) {
    const { len, width, angle, bend } = spec;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const keep = 1 - Math.min(1, spec.star ?? 0);
    const L = len * keep * radius;
    const W = Math.max(radius * minWidth, width * keep * radius);
    const B = bend * keep * radius;
    const centre = (t)=>{
        const along = t * L;
        const across = B * (1 - t * t);
        return [
            cos * along - sin * across,
            sin * along + cos * across
        ];
    };
    const normal = (t)=>{
        const dAlong = L;
        const dAcross = -2 * B * t;
        const tx = cos * dAlong - sin * dAcross;
        const ty = sin * dAlong + cos * dAcross;
        const l = Math.hypot(tx, ty) || 1;
        return [
            -ty / l,
            tx / l
        ];
    };
    const points = [];
    for(let i = 0; i <= samples; i++){
        const t = -1 + 2 * i / samples;
        const [cx, cy] = centre(t);
        const [nx, ny] = normal(t);
        points.push([
            cx + nx * W,
            cy + ny * W
        ]);
    }
    const capSteps = Math.max(6, Math.round(samples / 2));
    const [ex, ey] = centre(1);
    const [enx, eny] = normal(1);
    const endAngle = Math.atan2(eny, enx);
    for(let i = 1; i < capSteps; i++){
        const a = endAngle - Math.PI * i / capSteps;
        points.push([
            ex + Math.cos(a) * W,
            ey + Math.sin(a) * W
        ]);
    }
    for(let i = samples; i >= 0; i--){
        const t = -1 + 2 * i / samples;
        const [cx, cy] = centre(t);
        const [nx, ny] = normal(t);
        points.push([
            cx - nx * W,
            cy - ny * W
        ]);
    }
    const [sx, sy] = centre(-1);
    const [snx, sny] = normal(-1);
    const startAngle = Math.atan2(-sny, -snx);
    for(let i = 1; i < capSteps; i++){
        const a = startAngle - Math.PI * i / capSteps;
        points.push([
            sx + Math.cos(a) * W,
            sy + Math.sin(a) * W
        ]);
    }
    return points;
}
const STAR_REACH = 1.39;
function starOutline(reach, steps = 8) {
    const tips = [
        [
            0,
            -reach
        ],
        [
            reach,
            0
        ],
        [
            0,
            reach
        ],
        [
            -reach,
            0
        ]
    ];
    const points = [];
    for(let i = 0; i < 4; i++){
        const [x0, y0] = tips[i];
        const [x1, y1] = tips[(i + 1) % 4];
        for(let s = 0; s < steps; s++){
            const t = s / steps;
            const u = 1 - t;
            points.push([
                u * u * x0 + t * t * x1,
                u * u * y0 + t * t * y1
            ]);
        }
    }
    return points;
}
function eyeExtras(spec, radius, samples = 28, minWidth = 0.012) {
    const out = [];
    const e = spec.extra;
    if (e && e.amount > 0.02) {
        const grown = {
            dx: 0,
            dy: 0,
            len: e.len * e.amount,
            width: e.width * e.amount,
            angle: e.angle,
            bend: e.bend * e.amount
        };
        const ox = e.dx * radius;
        const oy = e.dy * radius;
        out.push(eyeOutline(grown, radius, samples, minWidth).map(([x, y])=>[
                x + ox,
                y + oy
            ]));
    }
    const star = Math.min(1, spec.star ?? 0);
    if (star > 0.02) out.push(starOutline(radius * STAR_REACH * star));
    return out;
}
const FACE_LIFT = 0.26;
const CUTE_LIFT = 0.04;
const CUTE_BODY = 0.078;
const CUTE_TALL = 0.08;
const CUTE_FLOOR = 0.05;
const CUTE_SEPARATION = 2.6;
const CUTE_MOUTH_DROP = 2.39;
const CUTE_BLUSH = {
    x: 4.35,
    y: 1.52,
    rx: 0.95,
    ry: 0.5
};
const CUTE_MOUTH_WEIGHT = 0.65;
const CUTE_MOUTH_FILLED = 0.6;
const CUTE_LAYOUT = {
    mouthDrop: CUTE_MOUTH_DROP,
    mouthScale: 1,
    mouthWeight: 1,
    blush: {
        x: CUTE_BLUSH.x,
        y: CUTE_BLUSH.y
    }
};
const CUTE_GAZE = 0.5;
function measureCuteFace(options) {
    const { shape, faceTune, eyeScale = 1 } = options;
    const { face: box } = shape;
    const centreY = box.y - box.sy * CUTE_LIFT * faceTune.height;
    const [lo, hi] = shape.spanAt(clamp(centreY, shape.top + 4, shape.bottom - 4));
    const rowWidth = Math.max(hi - lo, 1);
    const bodyHeight = Math.max(shape.bottom - shape.top, 1);
    const radius = Math.max(Math.min(rowWidth * CUTE_BODY, bodyHeight * CUTE_TALL), bodyHeight * CUTE_FLOOR) * faceTune.size * box.eye * eyeScale;
    return {
        radius,
        centreY,
        separation: radius * CUTE_SEPARATION
    };
}
function ellipse(cx, cy, rx, ry, n = 20) {
    return Array.from({
        length: n
    }, (_, i)=>{
        const a = i / n * Math.PI * 2;
        return [
            cx + Math.cos(a) * rx,
            cy + Math.sin(a) * ry
        ];
    });
}
function drawnRest(shape) {
    const { radius, centreY } = measureCuteFace({
        shape,
        faceTune: DEFAULT_FACE_TUNE,
        eyeScale: 1
    });
    const matrix = poseMatrix(DEFAULT_POSE, DEFAULT_POSE_HOME);
    return {
        r: radius,
        centreY,
        midX: shape.face.x + shape.face.leftDX / 2,
        project: (x, y)=>({
                transform: tangentTransform(projectOnSphere(x, y, matrix), x, y)
            })
    };
}
function addCuteFeatures(placement, options, metrics, centreY, cute) {
    const { shape, pose, poseHome, mouth, gazeX = 0, gazeY = 0 } = options;
    const { face: box } = shape;
    const { radius: r } = metrics;
    const matrix = poseMatrix(pose, poseHome);
    const midX = box.x + box.leftDX / 2 + gazeX * CUTE_GAZE;
    const chin = shape.bottom - r;
    const shapeAt = (points, cx, cy)=>{
        const projected = projectOnSphere(cx, cy, matrix);
        return {
            points,
            transform: tangentTransform(projected, cx, cy),
            visible: projected.visible
        };
    };
    const inside = (x, y, half)=>{
        const [lo, hi] = shape.spanAt(clamp(y, shape.top + 4, shape.bottom - 4));
        return clamp(x, lo + half, hi - half);
    };
    const entries = options.drawn?.entries ?? [];
    const built = options.drawn && entries.length > 0 ? placeDrawn(options.drawn, {
        r,
        centreY,
        midX: box.x + box.leftDX / 2,
        gazeX,
        gazeY,
        shape,
        rest: drawnRest(shape),
        project: (x, y)=>{
            const projected = projectOnSphere(x, y, matrix);
            return {
                transform: tangentTransform(projected, x, y),
                visible: projected.visible
            };
        },
        blink: options.blink ?? 1
    }) : [];
    if (built.length > 0) {
        placement.drawn = built;
        placement.eyeOpacity = clamp(1 - entries.reduce((sum, e)=>sum + e.weight, 0), 0, 1);
    }
    const layout = blendLayout(CUTE_LAYOUT, entries, built.map((d)=>d.fit));
    const by = Math.min(centreY + r * layout.blush.y + gazeY * CUTE_GAZE, chin);
    const cheek = (side)=>{
        const bx = inside(midX + side * r * layout.blush.x, by, r * CUTE_BLUSH.rx);
        return shapeAt(ellipse(bx, by, r * CUTE_BLUSH.rx, r * CUTE_BLUSH.ry), bx, by);
    };
    placement.blush = {
        left: cheek(-1),
        right: cheek(1)
    };
    if (!mouth) return;
    const drawnMouth = scaleMouth(mouth, layout.mouthScale);
    const my = Math.min(centreY + r * layout.mouthDrop + gazeY * CUTE_GAZE, chin - r * drawnMouth.open);
    const mx = inside(midX, my, r * drawnMouth.width);
    const outline = mouthOutline(drawnMouth, r).map(([x, y])=>[
            mx + x,
            my + y
        ]);
    placement.mouth = {
        ...shapeAt(outline, mx, my),
        closed: true,
        opacity: (mouth.show ?? 1) * cute
    };
    placement.mouthWeight = r * CUTE_MOUTH_WEIGHT * layout.mouthWeight;
    placement.mouthStroke = placement.mouthWeight * clamp(1 - drawnMouth.open / CUTE_MOUTH_FILLED, 0, 1);
    if (placement.drawn) placeInMouth(placement.drawn, entries, drawnMouth, placement.mouthStroke, r, mx, my);
}
const EYE_BODY = 0.142;
const EYE_TALL = 0.138;
const EYE_FLOOR = 0.073;
const EYE_SEPARATION = 0.148;
const EYE_WIDEN = 1.44;
const EYE_RISE = 0.93;
function computeEyePlacement(options) {
    const { left, right } = computeFacePlacement(options);
    return {
        left,
        right
    };
}
const eyePath = (shape)=>polylinePath(shape.points) + (shape.extras ?? []).map((ring)=>polylinePath(ring)).join('');
const writeEye = (shape)=>({
        path: eyePath(shape),
        transform: tangentTransformString(shape.transform),
        visible: shape.visible
    });
const writeFeature = (shape)=>({
        path: polylinePath(shape.points, shape.closed),
        transform: tangentTransformString(shape.transform),
        visible: shape.visible
    });
function computeFacePlacement(options) {
    const geometry = computeFaceGeometry(options);
    const placement = {
        left: writeEye(geometry.left),
        right: writeEye(geometry.right),
        lineWidth: geometry.lineWidth,
        eyeRadius: geometry.eyeRadius
    };
    if (geometry.nose) placement.nose = writeFeature(geometry.nose);
    if (geometry.mouth) placement.mouth = writeFeature(geometry.mouth);
    return placement;
}
function computeFaceGeometry(options) {
    return keepOnBody(layFace(options), options.shape);
}
function layFace(options) {
    const { shape, eyes, faceTune, pose, poseHome, eyeScale = 1, blink = 1, gazeX = 0, gazeY = 0, face = 'eyes', mouth, nose } = options;
    const lineBlend = clamp(options.lineBlend ?? ('line' === face ? 1 : 0), 0, 1);
    const cute = clamp(options.cuteBlend ?? ('cute' === face ? 1 : 0), 0, 1);
    const { face: box } = shape;
    const matrix = poseMatrix(pose, poseHome);
    const lineCentreY = box.y - box.sy * FACE_LIFT * faceTune.height;
    const cuteFace = cute > 0 ? measureCuteFace(options) : null;
    const centreY = cuteFace ? easing_lerp(lineCentreY, cuteFace.centreY, cute) : lineCentreY;
    const [rowLo, rowHi] = shape.spanAt(clamp(centreY, shape.top + 4, shape.bottom - 4));
    const rowWidth = Math.max(rowHi - rowLo, 1);
    const bodyHeight = Math.max(shape.bottom - shape.top, 1);
    const radius = Math.max(Math.min(rowWidth * EYE_BODY, bodyHeight * EYE_TALL), bodyHeight * EYE_FLOOR) * faceTune.size * box.eye * eyeScale;
    const separation = easing_lerp(rowWidth * EYE_SEPARATION * faceTune.gap, cuteFace?.separation ?? 0, cute);
    const lineWidth = radius * (options.lineWeight ?? LINE_WEIGHT);
    const shrinkX = 1 + (LINE_FACE_TUNE.eyeWidth - 1) * lineBlend;
    const shrinkY = 1 + (LINE_FACE_TUNE.eyeHeight - 1) * lineBlend;
    const cuteRadius = cuteFace?.radius ?? 0;
    const sizeXOpen = easing_lerp(radius * faceTune.eyeWidth * shrinkX * EYE_WIDEN, cuteRadius, cute);
    const sizeYOpen = easing_lerp(radius * faceTune.eyeHeight * shrinkY * EYE_RISE, cuteRadius, cute);
    const minWidth = lineBlend > 0 ? lineWidth / 2 / sizeYOpen * lineBlend : 0.012;
    const blinkFloor = lineBlend > 0 ? lineWidth / (2.12 * sizeYOpen) * lineBlend : 0;
    const blinkEff = Math.max(blink, blinkFloor);
    const build = (spec, side)=>{
        const sizeX = sizeXOpen;
        const sizeY = sizeYOpen * blinkEff;
        const anchorX = centreOf(side) + spec.dx * radius;
        const anchorY = centreY + spec.dy * radius + gazeY;
        const [lo, hi] = shape.spanAt(clamp(anchorY, shape.top + 4, shape.bottom - 4));
        const margin = 1.1 * easing_lerp(radius, cuteRadius, cute);
        const cx = clamp(anchorX, lo + margin, hi - margin);
        const cy = anchorY;
        const place = ([x, y])=>[
                cx + x * sizeX,
                cy + y * sizeY
            ];
        const outline = eyeOutline(spec, 1, 28, Math.max(0.012, minWidth)).map(place);
        const extras = cute > 0 ? eyeExtras(spec, 1, 28).map((ring)=>ring.map(place)) : [];
        const projected = projectOnSphere(cx, cy, matrix);
        return {
            points: outline,
            transform: tangentTransform(projected, cx, cy),
            visible: projected.visible,
            ...extras.length > 0 ? {
                extras
            } : null
        };
    };
    function centreOf(side) {
        const base = box.x + side * separation + gazeX;
        return -1 === side ? base + box.leftDX : base;
    }
    const placement = {
        left: build(eyes[0], -1),
        right: build(eyes[1], 1),
        lineWidth,
        eyeRadius: radius
    };
    if ('line' !== face && cute > 0 && cuteFace) addCuteFeatures(placement, options, cuteFace, centreY, cute);
    if ('line' !== face) return placement;
    const midX = box.x + box.leftDX / 2;
    const feature = (points, cx, cy, closed)=>{
        const projected = projectOnSphere(cx, cy, matrix);
        return {
            points,
            closed,
            transform: tangentTransform(projected, cx, cy),
            visible: projected.visible
        };
    };
    const inside = (x, y, half)=>{
        const [lo, hi] = shape.spanAt(clamp(y, shape.top + 4, shape.bottom - 4));
        return clamp(x, lo + half + lineWidth, hi - half - lineWidth);
    };
    const chin = shape.bottom - 2 * lineWidth;
    if (nose) {
        const ny = Math.min(centreY + radius * NOSE_DROP + gazeY * NOSE_GAZE, chin - 0.9 * radius);
        const nx = inside(midX + gazeX * NOSE_GAZE, ny, 0.3 * radius);
        placement.nose = feature(nosePolyline(nose, radius, nx, ny), nx, ny, false);
    }
    if (mouth) {
        const my = Math.min(centreY + radius * MOUTH_DROP + gazeY * MOUTH_GAZE, chin - radius * (0.3 + mouth.open));
        const mx = inside(midX + gazeX * MOUTH_GAZE, my, radius * mouth.width);
        const outline = mouthOutline(mouth, radius).map(([x, y])=>[
                mx + x,
                my + y
            ]);
        placement.mouth = feature(outline, mx, my, true);
    }
    return placement;
}
const ANYWHERE = [
    -1 / 0,
    1 / 0
];
const placement_meet = (a, b)=>[
        Math.max(a[0], b[0]),
        Math.min(a[1], b[1])
    ];
const placement_settle = (room, from = 0)=>room[0] > room[1] ? (room[0] + room[1]) / 2 : clamp(from, room[0], room[1]);
function keepOnBody(geometry, shape) {
    const margin = geometry.lineWidth / 2;
    const midline = (geometry.left.transform.x + geometry.right.transform.x) / 2;
    const roomOf = (t, rings)=>{
        const [a, b, c, d] = t.matrix;
        const best = Array.from({
            length: 8
        }, ()=>({
                score: -1 / 0,
                x: 0,
                y: 0
            }));
        for (const ring of rings)for (const [px, py] of ring){
            const x = t.x + a * (px - t.pivotX) + c * (py - t.pivotY);
            const y = t.y + b * (px - t.pivotX) + d * (py - t.pivotY);
            const scores = [
                x,
                -x,
                y,
                -y,
                x + y,
                x - y,
                -x + y,
                -x - y
            ];
            scores.forEach((score, i)=>{
                if (score > best[i].score) best[i] = {
                    score,
                    x,
                    y
                };
            });
        }
        let room = ANYWHERE;
        for (const { score, x, y } of best){
            if (score === -1 / 0) continue;
            const [lo, hi] = stretchAt(shape, y, midline);
            room = placement_meet(room, [
                lo + margin - x,
                hi - margin - x
            ]);
        }
        return room;
    };
    const shown = (s)=>s.visible && s.points.length > 0;
    let face = ANYWHERE;
    if ((geometry.eyeOpacity ?? 1) > 0) {
        for (const eye of [
            geometry.left,
            geometry.right
        ])if (shown(eye)) face = placement_meet(face, roomOf(eye.transform, [
            eye.points,
            ...eye.extras ?? []
        ]));
    }
    for (const feature of [
        geometry.nose,
        geometry.mouth
    ])if (feature && shown(feature)) face = placement_meet(face, roomOf(feature.transform, [
        feature.points
    ]));
    for (const design of geometry.drawn ?? [])if (!(design.opacity <= 0)) for (const part of [
        design.left,
        design.right,
        design.plate
    ]){
        if (!part?.visible) continue;
        const rings = part.layers.filter((layer)=>!layer.loose).flatMap((layer)=>layer.rings);
        face = placement_meet(face, roomOf(part.transform, rings));
    }
    const cheekRoom = (cheek)=>cheek && shown(cheek) ? roomOf(cheek.transform, [
            cheek.points
        ]) : ANYWHERE;
    const cheeks = [
        cheekRoom(geometry.blush?.left),
        cheekRoom(geometry.blush?.right)
    ];
    const whole = placement_meet(face, placement_meet(cheeks[0], cheeks[1]));
    const together = whole[0] <= whole[1];
    const dx = placement_settle(together ? whole : face);
    const [leftDx, rightDx] = together ? [
        dx,
        dx
    ] : cheeks.map((room)=>placement_settle(room, dx));
    if (0 === dx && 0 === leftDx && 0 === rightDx) return geometry;
    const slide = (feature, by = dx)=>({
            ...feature,
            transform: {
                ...feature.transform,
                x: feature.transform.x + by
            }
        });
    return {
        ...geometry,
        left: slide(geometry.left),
        right: slide(geometry.right),
        ...geometry.nose ? {
            nose: slide(geometry.nose)
        } : null,
        ...geometry.mouth ? {
            mouth: slide(geometry.mouth)
        } : null,
        ...geometry.blush ? {
            blush: {
                left: slide(geometry.blush.left, leftDx),
                right: slide(geometry.blush.right, rightDx)
            }
        } : null,
        ...geometry.drawn ? {
            drawn: geometry.drawn.map((design)=>({
                    ...design,
                    left: slide(design.left),
                    right: slide(design.right),
                    ...design.plate ? {
                        plate: slide(design.plate)
                    } : null
                }))
        } : null
    };
}
function turnFace(geometry, shape, yaw) {
    const turn = (feature)=>{
        const { x, y, matrix } = feature.transform;
        const [lo, hi] = shape.spanAt(clamp(y, shape.top + 1, shape.bottom - 1));
        const middle = (lo + hi) / 2;
        const half = Math.max((hi - lo) / 2, 1);
        const longitude = Math.asin(clamp((x - middle) / half, -1, 1));
        const facing = Math.cos(longitude + yaw);
        if (facing <= 0.05) return {
            ...feature,
            visible: false
        };
        const squeeze = facing / Math.max(Math.cos(longitude), 0.3);
        const [a, b, c, d] = matrix;
        return {
            ...feature,
            transform: {
                ...feature.transform,
                x: middle + half * Math.sin(longitude + yaw),
                matrix: [
                    a * squeeze,
                    b,
                    c * squeeze,
                    d
                ]
            }
        };
    };
    return {
        ...geometry,
        left: turn(geometry.left),
        right: turn(geometry.right),
        nose: geometry.nose && turn(geometry.nose),
        mouth: geometry.mouth && turn(geometry.mouth),
        blush: geometry.blush && {
            left: turn(geometry.blush.left),
            right: turn(geometry.blush.right)
        },
        ...geometry.drawn ? {
            drawn: geometry.drawn.map((d)=>({
                    ...d,
                    left: turn(d.left),
                    right: turn(d.right),
                    ...d.plate ? {
                        plate: turn(d.plate)
                    } : null
                }))
        } : null
    };
}
const compact = (n)=>{
    const abs = Math.abs(n);
    if (abs >= 1000000) return `${trim(n / 1000000)}M`;
    if (abs >= 10000) return `${trim(n / 1000)}k`;
    if (abs >= 1000) return `${trim(n / 1000)}k`;
    return Number.isInteger(n) ? String(n) : trim(n);
};
const trim = (n)=>{
    const rounded = Math.round(10 * n) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};
const format_pad = (n)=>String(Math.floor(n)).padStart(2, '0');
const mmss = (ms)=>{
    const safe = Math.max(0, Math.round(ms / 1000));
    return `${format_pad(Math.floor(safe / 60))}:${format_pad(safe % 60)}`;
};
const hhmm = (epoch)=>{
    const d = new Date(epoch);
    return `${format_pad(d.getHours())}:${format_pad(d.getMinutes())}`;
};
function formatHud(spec, nowMs = 0) {
    switch(spec.kind){
        case 'progress':
            {
                const pct = Math.round(100 * clamp01(spec.value));
                return {
                    value: String(pct),
                    unit: '%',
                    level: pct >= 100 ? 'ok' : 'info'
                };
            }
        case 'timer':
            {
                const left = spec.totalMs > 0 ? spec.remainingMs / spec.totalMs : 0;
                return {
                    value: mmss(spec.remainingMs),
                    level: left > 0 && left < 0.1 ? 'warn' : 'info'
                };
            }
        case 'clock':
            return {
                value: hhmm(spec.date ?? nowMs),
                level: 'info'
            };
        case 'voice':
            return {
                value: 'speaking' === spec.mode ? 'talk' : 'listen',
                unit: `${Math.round(100 * clamp01(spec.level))}%`,
                level: 'info'
            };
        case 'context':
            {
                const used = spec.total > 0 ? spec.used / spec.total : 0;
                return {
                    value: `${compact(spec.used)}/${compact(spec.total)}`,
                    level: used > 0.9 ? 'alert' : used > 0.75 ? 'warn' : 'info'
                };
            }
        case 'balance':
            return {
                value: compact(spec.value),
                unit: spec.unit,
                level: spec.low ? 'warn' : 'info'
            };
        case 'gauge':
            {
                const used = spec.max > 0 ? spec.value / spec.max : 0;
                return {
                    value: compact(spec.value),
                    unit: `/${compact(spec.max)}`,
                    level: used > 0.9 ? 'warn' : 'info'
                };
            }
        case 'kpi':
            {
                const delta = spec.delta;
                return {
                    value: compact(spec.value),
                    unit: null == delta || 0 === delta ? void 0 : `${delta > 0 ? '+' : ''}${trim(delta)}`,
                    level: null != delta && delta < 0 ? 'warn' : null != delta && delta > 0 ? 'ok' : 'info'
                };
            }
        case 'notify':
            return {
                value: String(Math.max(0, Math.round(spec.count))),
                level: spec.count > 0 ? 'warn' : 'info'
            };
        case 'sync':
            return {
                value: 'done' === spec.state ? 'ok' : 'error' === spec.state ? 'err' : 'syncing' === spec.state ? 'sync' : 'idle',
                level: 'done' === spec.state ? 'ok' : 'error' === spec.state ? 'alert' : 'info'
            };
    }
}
const HUD_PRINT_MIN_PX = 110;
const HUD_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const dials_TAU = 2 * Math.PI;
const TOP = -Math.PI / 2;
const emptyFrame = ()=>({
        arcs: [],
        bars: [],
        ticks: [],
        pips: [],
        strokes: [],
        glyphs: []
    });
const GAUGE = 1.5 * Math.PI;
function evaluateHud(spec, tMs, ctx) {
    const { strokes, ...rest } = evaluateHudPrimitives(spec, tMs, ctx);
    return {
        ...rest,
        paths: strokes.map((s)=>({
                d: polylinesPath(s.lines),
                opacity: s.opacity
            }))
    };
}
function evaluateHudPrimitives(spec, tMs, ctx) {
    const frame = emptyFrame();
    const reduced = true === ctx.reducedMotion;
    const print = false !== ctx.print;
    const t = reduced ? 0 : (Number.isFinite(tMs) ? tMs : 0) / 1000;
    const reading = formatHud(spec, Number.isFinite(tMs) ? tMs : 0);
    const inner = ctx.radius + 3;
    const outer = ctx.radius + 21;
    const mid = (inner + outer) / 2;
    const band = (outer - inner) / 2;
    const width = Math.max(0.6, ctx.lineWeight * ctx.eyeRadius);
    const pip = Math.max(1.2, 0.8 * width);
    const gaugeFrom = TOP - GAUGE / 2;
    const at = (angle, r)=>[
            CENTER + Math.cos(angle) * r,
            CENTER + Math.sin(angle) * r
        ];
    const ring = (r, opacity, start = 0, end = dials_TAU, cap = 'round')=>({
            x: CENTER,
            y: CENTER,
            r,
            start,
            end,
            opacity,
            width,
            cap
        });
    const spoke = (angle, from, to, opacity)=>{
        const [x1, y1] = at(angle, from);
        const [x2, y2] = at(angle, to);
        return {
            x1,
            y1,
            x2,
            y2,
            opacity
        };
    };
    const figure = (text, x = CENTER, y = CENTER + mid, size = 13)=>{
        if (!print || !text) return;
        frame.glyphs.push({
            x,
            y,
            text,
            size,
            opacity: 0.92,
            anchor: 'middle'
        });
    };
    switch(spec.kind){
        case 'progress':
            {
                const value = clamp(spec.value, 0, 1);
                frame.arcs.push(ring(mid, 0.28, gaugeFrom, gaugeFrom + GAUGE, 'butt'));
                if (value > 0) frame.arcs.push(ring(mid, 1, gaugeFrom, gaugeFrom + value * GAUGE, 'butt'));
                const [hx, hy] = at(gaugeFrom + value * GAUGE, mid);
                frame.pips.push({
                    x: hx,
                    y: hy,
                    r: 1.15 * pip,
                    opacity: 1
                });
                figure(reading.value);
                break;
            }
        case 'timer':
            {
                const total = spec.totalMs > 0 ? spec.totalMs : 0;
                const left = total > 0 ? clamp(spec.remainingMs / total, 0, 1) : 0;
                frame.arcs.push(ring(mid, 0.28, gaugeFrom, gaugeFrom + GAUGE, 'butt'));
                if (left > 0) frame.arcs.push(ring(mid, 1, gaugeFrom, gaugeFrom + left * GAUGE, 'butt'));
                for(let i = 0; i <= 4; i++)frame.ticks.push(spoke(gaugeFrom + i / 4 * GAUGE, i % 2 === 0 ? inner : mid, outer, 0.28));
                if (left > 0 && left < 0.1 && !reduced) frame.arcs.push(ring(mid + 0.45 * band, 0.4 + 0.35 * Math.sin(6 * t), gaugeFrom, gaugeFrom + left * GAUGE, 'butt'));
                figure(reading.value);
                break;
            }
        case 'clock':
            {
                const epoch = spec.date ?? tMs;
                const minutes = epoch / 60000 % 720;
                const hourAngle = TOP + minutes / 720 * dials_TAU;
                const minuteAngle = TOP + minutes % 60 / 60 * dials_TAU;
                frame.arcs.push(ring(mid, 0.26));
                for(let i = 0; i < 4; i++)frame.ticks.push(spoke(TOP + i / 4 * dials_TAU, mid, outer, 0.4));
                const [hx, hy] = at(hourAngle, mid);
                const [mx, my] = at(minuteAngle, mid);
                frame.pips.push({
                    x: hx,
                    y: hy,
                    r: 1.45 * pip,
                    opacity: 1
                });
                frame.pips.push({
                    x: mx,
                    y: my,
                    r: pip,
                    opacity: 0.8
                });
                figure(reading.value, CENTER, CENTER + mid, 13);
                break;
            }
        case 'voice':
            {
                const level = clamp(spec.level, 0, 1);
                const bands = clamp(Math.round(spec.bands ?? 5), 1, 9);
                const speaking = 'speaking' === spec.mode;
                const barW = Math.max(1.6, 1.2 * width);
                const gap = 2.1 * barW;
                const baseline = CENTER + mid;
                for(let i = 0; i < bands; i++){
                    const seed = 1.37 * i;
                    const wobble = reduced ? 0.6 : 0.5 + 0.3 * Math.sin(t * (speaking ? 9 : 5) + seed) + 0.2 * Math.sin(3.3 * t + 2 * seed);
                    const h = Math.max(barW, 2 * band * level * clamp(wobble, 0.12, 1) * (speaking ? 1.15 : 0.85));
                    frame.bars.push({
                        x: CENTER + (i - (bands - 1) / 2) * gap - barW / 2,
                        y: baseline - h / 2,
                        w: barW,
                        h,
                        opacity: 0.5 + 0.5 * level
                    });
                }
                figure(reading.value, CENTER - 0.82 * mid, baseline, 11);
                break;
            }
        case 'context':
            {
                const cells = 12;
                const used = spec.total > 0 ? clamp(spec.used / spec.total, 0, 1) : 0;
                const filled = Math.round(used * cells);
                for(let i = 0; i < cells; i++){
                    const a = gaugeFrom + (i + 0.5) / cells * GAUGE;
                    const [x, y] = at(a, mid);
                    const on = i < filled;
                    const warn = used > 0.85 && on && i >= filled - 1 && !reduced;
                    frame.pips.push({
                        x,
                        y,
                        r: on ? 1.1 * pip : 0.65 * pip,
                        opacity: on ? warn ? 0.55 + 0.4 * Math.sin(5 * t) : 0.95 : 0.18
                    });
                }
                figure(reading.value, CENTER, CENTER + mid, 12);
                break;
            }
        case 'balance':
            {
                const magnitude = Math.abs(spec.value);
                const columns = clamp(1 + Math.floor(Math.log10(Math.max(1, magnitude))), 1, 6);
                const barW = Math.max(1.6, 1.1 * width);
                const gap = 2.2 * barW;
                const baseline = CENTER + outer;
                const pulse = spec.low && !reduced ? 0.55 + 0.45 * Math.sin(5.4 * t) : 1;
                for(let i = 0; i < columns; i++){
                    const h = band * (0.6 + i / Math.max(1, columns - 1) * 1.4);
                    frame.bars.push({
                        x: CENTER + (i - (columns - 1) / 2) * gap - barW / 2,
                        y: baseline - h,
                        w: barW,
                        h,
                        opacity: (spec.low ? 0.45 : 0.9) * pulse
                    });
                }
                if (spec.low) frame.pips.push({
                    x: CENTER,
                    y: CENTER + inner,
                    r: 1.15 * pip,
                    opacity: pulse
                });
                figure(reading.value);
                break;
            }
        case 'gauge':
            {
                const value = spec.max > 0 ? clamp(spec.value / spec.max, 0, 1) : 0;
                frame.arcs.push(ring(mid, 0.28, gaugeFrom, gaugeFrom + GAUGE, 'butt'));
                if (value > 0) frame.arcs.push(ring(mid, 1, gaugeFrom, gaugeFrom + GAUGE * value, 'butt'));
                for(let i = 0; i <= 4; i++)frame.ticks.push(spoke(gaugeFrom + i / 4 * GAUGE, i % 2 === 0 ? inner : mid, outer, 0.28));
                const [nx, ny] = at(gaugeFrom + GAUGE * value, mid);
                frame.pips.push({
                    x: nx,
                    y: ny,
                    r: 1.35 * pip,
                    opacity: 1
                });
                figure(reading.value);
                break;
            }
        case 'kpi':
            {
                const series = spec.series ?? [];
                const left = CENTER - 0.55 * mid;
                const right = CENTER + 0.72 * mid;
                const baseline = CENTER + mid;
                if (series.length > 1) {
                    let lo = 1 / 0;
                    let hi = -1 / 0;
                    for (const v of series){
                        if (v < lo) lo = v;
                        if (v > hi) hi = v;
                    }
                    const range = hi - lo || 1;
                    const line = [];
                    let lastX = left;
                    let lastY = baseline;
                    for(let i = 0; i < series.length; i++){
                        const x = left + (right - left) * i / (series.length - 1);
                        const y = baseline + band - (series[i] - lo) / range * band * 2;
                        line.push([
                            x,
                            y
                        ]);
                        lastX = x;
                        lastY = y;
                    }
                    frame.strokes.push({
                        lines: [
                            line
                        ],
                        opacity: 0.9
                    });
                    frame.pips.push({
                        x: lastX,
                        y: lastY,
                        r: 1.15 * pip,
                        opacity: 1
                    });
                } else {
                    frame.ticks.push({
                        x1: left,
                        y1: baseline,
                        x2: right,
                        y2: baseline,
                        opacity: 0.3
                    });
                    frame.pips.push({
                        x: right,
                        y: baseline,
                        r: 1.15 * pip,
                        opacity: 1
                    });
                }
                const delta = spec.delta ?? 0;
                if (0 !== delta) {
                    const h = band * clamp(Math.abs(delta) / (Math.abs(spec.value) || 1), 0.2, 1.6);
                    const barW = Math.max(1.6, 1.2 * width);
                    frame.bars.push({
                        x: right + 1.6 * barW,
                        y: delta > 0 ? baseline - h : baseline,
                        w: barW,
                        h,
                        opacity: 0.85
                    });
                }
                figure(reading.value, CENTER - 0.82 * mid, baseline, 12);
                break;
            }
        case 'notify':
            {
                const count = clamp(Math.round(spec.count), 0, 99);
                const shown = Math.min(count, 4);
                frame.arcs.push(ring(mid, 0.28, gaugeFrom, gaugeFrom + GAUGE, 'butt'));
                for(let i = 0; i < shown; i++){
                    const a = gaugeFrom + (i + 1) / (shown + 1) * GAUGE;
                    const [x, y] = at(a, mid);
                    const newest = i === shown - 1 && !reduced;
                    frame.pips.push({
                        x,
                        y,
                        r: pip * (newest ? 1.35 + 0.2 * Math.sin(4.2 * t) : 1.15),
                        opacity: 1
                    });
                }
                figure(reading.value);
                break;
            }
        case 'sync':
            frame.arcs.push(ring(mid, 0.28, gaugeFrom, gaugeFrom + GAUGE, 'butt'));
            switch(spec.state){
                case 'syncing':
                    {
                        const head = gaugeFrom + 0.9 * t % 1 * GAUGE;
                        frame.arcs.push(ring(mid, 1, head - 1.1, head, 'butt'));
                        const [x, y] = at(head, mid);
                        frame.pips.push({
                            x,
                            y,
                            r: pip,
                            opacity: 1
                        });
                        break;
                    }
                case 'done':
                    frame.strokes.push({
                        lines: checkLines(CENTER, CENTER - mid, band),
                        opacity: 1
                    });
                    break;
                case 'error':
                    frame.strokes.push({
                        lines: crossLines(CENTER, CENTER - mid, 0.8 * band),
                        opacity: 1
                    });
                    break;
                default:
                    break;
            }
            figure(reading.value);
            break;
    }
    return frame;
}
function checkLines(cx, cy, size) {
    return [
        [
            [
                cx - size,
                cy
            ],
            [
                cx - 0.25 * size,
                cy + 0.65 * size
            ],
            [
                cx + size,
                cy - 0.7 * size
            ]
        ]
    ];
}
function crossLines(cx, cy, size) {
    return [
        [
            [
                cx - size,
                cy - size
            ],
            [
                cx + size,
                cy + size
            ]
        ],
        [
            [
                cx + size,
                cy - size
            ],
            [
                cx - size,
                cy + size
            ]
        ]
    ];
}
function pencilGlyphPath(size) {
    const half = size / 2;
    const width = 0.27 * size;
    const halfWidth = width / 2;
    const cap = 0.15 * size;
    const gap = 0.06 * size;
    const tip = 0.24 * size;
    const round = 0.32 * width;
    const b = new PathBuilder();
    b.moveTo(-halfWidth + round, -half);
    b.lineTo(halfWidth - round, -half);
    b.quadTo(halfWidth, -half, halfWidth, -half + round);
    b.lineTo(halfWidth, -half + cap);
    b.lineTo(-halfWidth, -half + cap);
    b.lineTo(-halfWidth, -half + round);
    b.quadTo(-halfWidth, -half, -halfWidth + round, -half);
    b.close();
    const barrelTop = -half + cap + gap;
    const shoulder = half - tip;
    b.moveTo(-halfWidth, barrelTop);
    b.lineTo(halfWidth, barrelTop);
    b.lineTo(halfWidth, shoulder);
    b.lineTo(0, half);
    b.lineTo(-halfWidth, shoulder);
    b.close();
    return b.toString();
}
function bangGlyphPath(size) {
    const half = size / 2;
    const top = 0.2 * size;
    const waist = 0.13 * size;
    const dot = 0.11 * size;
    const gap = 0.12 * size;
    const stemBottom = half - 2 * dot - gap;
    const b = new PathBuilder();
    b.moveTo(-top / 2, -half + top / 2);
    b.arcTo(0, -half + top / 2, top / 2, Math.PI, 2 * Math.PI);
    b.lineTo(waist / 2, stemBottom);
    b.arcTo(0, stemBottom, waist / 2, 0, Math.PI);
    b.close();
    b.moveTo(dot, half - dot);
    b.arcTo(0, half - dot, dot, 0, 2 * Math.PI);
    b.close();
    return b.toString();
}
const lightCss = ([r, g, b])=>`rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
const drawn_ringsPath = (rings)=>rings.map((ring)=>polylinePath(ring, true)).join('');
function layerNode(layer, transform, alpha, palette) {
    const rim = layer.plate ? palette.rim : null;
    return scene_node('path', {
        d: drawn_ringsPath(layer.rings),
        transform: tangentTransformString(transform),
        fill: palette.paint(layer.paint, layer.light),
        'fill-rule': layer.holes ? 'evenodd' : void 0,
        stroke: rim?.paint,
        'stroke-width': rim ? scene_r2(rim.width) : void 0,
        'stroke-linejoin': rim ? 'round' : void 0,
        opacity: scene_r2(Math.min(1, layer.opacity * alpha))
    });
}
function shapeNodes(shape, alpha, palette) {
    if (!shape || !shape.visible) return [];
    return shape.layers.map((layer)=>layerNode(layer, shape.transform, alpha, palette));
}
function drawnEyeNodes(drawn, alpha, palette) {
    return drawn.flatMap((d)=>[
            ...shapeNodes(d.plate, d.opacity * alpha, palette),
            ...shapeNodes(d.left, d.opacity * alpha, palette),
            ...shapeNodes(d.right, d.opacity * alpha, palette)
        ]);
}
function drawnMouthPaint(drawn, plainShare, plain, palette) {
    const shares = [
        {
            paint: plain,
            weight: plainShare
        },
        ...drawn.map((d)=>({
                paint: palette.paint(getFaceDesign(d.style).mouthPaint),
                weight: d.opacity
            }))
    ].filter((s)=>s.weight > 0.001);
    if (0 === shares.length) return plain;
    let paint = shares[0].paint;
    let weight = shares[0].weight;
    for (const next of shares.slice(1)){
        const total = weight + next.weight;
        if (next.paint !== paint) {
            const pct = Math.round(next.weight / total * 100);
            paint = pct >= 100 ? next.paint : pct <= 0 ? paint : `color-mix(in oklab, ${paint}, ${next.paint} ${pct}%)`;
        }
        weight = total;
    }
    return paint;
}
function drawnMouthNodes(drawn, mouth, alpha, palette) {
    if (!mouth?.visible) return [];
    return drawn.flatMap((d)=>(d.inMouth ?? []).map((layer)=>layerNode(layer, mouth.transform, d.opacity * alpha, palette)));
}
const STAR = 'M0-1C.16-.16.16-.16 1 0C.16.16.16.16 0 1C-.16.16-.16.16-1 0C-.16-.16-.16-.16 0-1Z';
function paperNodes(paper) {
    return paper.map((p)=>{
        const deg = scene_r2(180 * p.rotation / Math.PI);
        if ('star' === p.kind) return scene_node('path', {
            d: STAR,
            fill: p.color,
            opacity: scene_r2(p.opacity),
            transform: `translate(${scene_r2(p.x)} ${scene_r2(p.y)}) rotate(${deg}) scale(${scene_r2(p.size / 2)})`
        });
        const w = 'strip' === p.kind ? 1.9 * p.size : p.size;
        return scene_node('rect', {
            x: scene_r2(p.x - w / 2),
            y: scene_r2(p.y - p.size / 2),
            width: scene_r2(w),
            height: scene_r2(p.size),
            rx: scene_r2('dot' === p.kind ? p.size / 2 : 0.24 * p.size),
            fill: p.color,
            opacity: scene_r2(p.opacity),
            transform: `rotate(${deg} ${scene_r2(p.x)} ${scene_r2(p.y)})`
        });
    });
}
function ribbonPath(points, size, side) {
    const n = points.length;
    const nx = [];
    const ny = [];
    for(let i = 0; i < n; i++){
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[Math.min(i + 1, n - 1)];
        const len = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
        const half = size * (0.5 + i / (n - 1) * 0.5) / 2;
        nx.push(-(p1.y - p0.y) / len * half);
        ny.push((p1.x - p0.x) / len * half);
    }
    const cap = (i)=>{
        const r = scene_r2(Math.max(Math.hypot(nx[i], ny[i]), 0.2));
        return `A${r} ${r} 0 0 0 `;
    };
    let d = '';
    for (const [a, b] of ribbonRuns(points, side)){
        for(let i = a; i <= b; i++)d += `${i === a ? 'M' : 'L'}${scene_r2(points[i].x + nx[i])} ${scene_r2(points[i].y + ny[i])}`;
        d += b === n - 1 ? cap(b) : 'L';
        for(let i = b; i >= a; i--)d += `${i === b ? '' : 'L'}${scene_r2(points[i].x - nx[i])} ${scene_r2(points[i].y - ny[i])}`;
        if (0 === a) d += `${cap(0)}${scene_r2(points[0].x + nx[0])} ${scene_r2(points[0].y + ny[0])}`;
        d += 'Z';
    }
    return d;
}
function trailNodes(trails, side, sizeScale = 1) {
    return trails.map((trail)=>{
        const d = ribbonPath(trail.points, trail.size * sizeScale, side);
        if (!d) return scene_node('path', {
            d: '',
            opacity: 0
        });
        return scene_node('path', {
            d,
            fill: ribbonColor(trail.hue),
            opacity: scene_r2(trail.opacity)
        });
    });
}
const RIM_TOKEN = 'var(--aora-rim, transparent)';
const PAPER_TOKEN = 'var(--aora-paper, #fff)';
const STICKER_FACE_TOKEN = `var(--aora-face-sticker, ${PAPER_TOKEN})`;
const FACE_SHIFT = {
    light: '#000',
    dark: '#fff'
};
const FACE_SHIFT_TOKEN = `light-dark(${FACE_SHIFT.light}, ${FACE_SHIFT.dark})`;
const IRIS_DEPTH = {
    color: '#1A1226',
    share: 38
};
const HOLLOW_ACCENT_SHARE = {
    gold: 100,
    tear: 50,
    tongue: 50,
    rose: 100,
    flame: 100,
    thread: 100,
    bone: 0,
    glass: 100
};
const PLATE_RIM = 0.32;
const RISO_TOKEN = `var(--aora-ink2, ${RISO_INK})`;
const PAPER_SHADOW_DARKNESS = 0.32;
const STICKER_SHADOW = {
    dy: 3.5,
    blur: 3,
    opacity: 0.2
};
const MOUTH_OUTLINE_SHARE = 0.87;
const isHollow = isLineVariant;
const OUTLINE_FILL = 0.08;
const GLASS = {
    tint: 0.34,
    rim: 0.42,
    rimOpacity: 0.9,
    sheen: 0.3,
    edgeLight: 0.9
};
const BLUSH = {
    color: '#FFB3C7',
    opacity: 0.6
};
const BLUSH_DEEP = {
    color: '#FF7E9D',
    opacity: 0.45
};
const BLUSH_HOLLOW_OPACITY = 0.16;
const RISO_DIRECTION = [
    0.794,
    0.608
];
const HALFTONE = {
    pitch: 7.8,
    radius: 1.7,
    angle: 30,
    opacity: 0.42
};
const BADGE_RING = 8;
function readVectorParams(options) {
    return {
        strokeWidth: Number(options.strokeWidth),
        stickerWidth: Number(options.stickerWidth),
        stickerShadow: true === options.stickerShadow,
        paperOffset: Number(options.paperOffset),
        paperAngle: Number(options.paperAngle),
        paperTilt: Number(options.paperTilt),
        softShadow: true === options.softShadow,
        softGloss: true === options.softGloss,
        risoOffset: Number(options.risoOffset),
        risoHalftone: true === options.risoHalftone,
        wobble: Number(options.wobble),
        grain: Number(options.grain),
        hatching: true === options.hatching,
        neonGlow: Number(options.neonGlow)
    };
}
function inkGradientVector(angle = 135) {
    const rad = angle * Math.PI / 180;
    const dx = Math.cos(rad) / 2;
    const dy = Math.sin(rad) / 2;
    return {
        x1: scene_r2(0.5 - dx),
        y1: scene_r2(0.5 - dy),
        x2: scene_r2(0.5 + dx),
        y2: scene_r2(0.5 + dy)
    };
}
const GLYPH_PATHS = {
    pencil: pencilGlyphPath(BELT_GLYPH_SIZE),
    bang: bangGlyphPath(BELT_GLYPH_SIZE)
};
const bodyPaths = new WeakMap();
function bodyPath(outline) {
    let d = bodyPaths.get(outline);
    if (void 0 === d) {
        d = smoothClosedPath(outline);
        bodyPaths.set(outline, d);
    }
    return d;
}
function drawsInLayers(frame, sourceId) {
    if (sourceId) return false;
    const variant = frame.variant;
    if ('paper' === variant) return false;
    const extras = themeExtras();
    if (!extras) return false;
    if (isMedium(variant)) return !isBuiltinMedium(variant);
    if (extras.decorates(variant)) return true;
    const shape = getShape(frame.shape);
    return void 0 !== shape.motion || shape.parts.some((part)=>void 0 !== part.motion);
}
const NO_LAYER_RULES = [];
function createVectorScene(ctx) {
    const live = 'live' === ctx.mode;
    let featureNodes = false;
    let sized = {
        params: ctx.params,
        minLine: 0
    };
    let extras = null;
    let motion;
    let split = null;
    const steadyLayers = [];
    let kept = null;
    let keptDefs = null;
    let buildingFrame = null;
    let buildingInk = INK_TOKEN;
    const paintsNow = ()=>{
        const frame = buildingFrame;
        const own = frame.ink;
        return {
            ink: ctx.solidInk ?? (own && 'from' in own ? own.from : buildingInk),
            fx: ctx.fxFill ?? ctx.solidInk ?? ctx.beltPaint ?? flatInk(frame) ?? FX_TOKEN,
            page: PAGE_TOKEN,
            contrast: ctx.faceShift ?? FACE_SHIFT_TOKEN,
            partColor: ctx.partColor ?? livePartPaint
        };
    };
    const opacity = (v)=>!live && v >= 1 ? void 0 : scene_r2(v);
    const keep = (visible)=>live || visible;
    const asLine = (paint)=>paint === INK_TOKEN ? ctx.lineInk ?? LINE_TOKEN : ctx.lineInk && paint === ctx.solidInk ? ctx.lineInk : paint;
    const hollowFace = (solid, variant)=>solid.startsWith('url(') || 'currentColor' === solid ? solid : `color-mix(in oklab, ${asLine(solid)}, ${ctx.faceShift ?? FACE_SHIFT_TOKEN} ${lineShift(variant)}%)`;
    const hairShadeOf = (frame, solid)=>{
        const deep = getShape(frame.shape).hairDeep;
        return void 0 === deep || solid.startsWith('url(') ? ctx.hairShade ?? HAIR_SHADE_TOKEN : `oklch(from ${solid} calc(l * ${deep}) calc(c * 0.9 + 0.03) h)`;
    };
    const rimPaint = ()=>void 0 === ctx.rimInk ? RIM_TOKEN : ctx.rimInk;
    const mediumPaint = (frame, ink)=>{
        const own = frame.ink;
        const solid = ctx.solidInk ?? (own && 'from' in own ? own.from : ink);
        return {
            ink,
            solid,
            line: hollowFace(solid, frame.variant),
            rim: rimPaint(),
            leaf: ctx.leaf ?? LEAF_TOKEN,
            hairShade: hairShadeOf(frame, solid),
            partColor: ctx.partColor ?? livePartPaint,
            lineOf: (color)=>hollowFace(color, frame.variant)
        };
    };
    const treated = (frame, role, children)=>{
        const variant = frame.variant;
        const filled = hasContent(children);
        const attrs = filled && ctx.mediaId ? mediumTreatment(variant, ctx.mediaId, sized.params, role) : void 0;
        return scene_node('g', attrs, children, {
            fragment: !live && !attrs
        });
    };
    const mediumLine = (frame, ink)=>isMedium(frame.variant) && isHollow(frame.variant) ? mediumPaint(frame, ink).line : null;
    const effectPaint = (frame, ink)=>monochromeEffects(frame.variant) ? mediumLine(frame, ink) ?? ctx.solidInk ?? ctx.beltPaint ?? flatInk(frame) ?? INK_TOKEN : null;
    const stickerFace = ctx.stickerFaceFill ?? STICKER_FACE_TOKEN;
    function build(snapshot) {
        const frame = withoutFineParts(snapshot, ctx.displaySizePx ?? 0);
        const ink = resolveInk(frame, ctx);
        const variant = frame.variant;
        const medium = isMedium(variant);
        sized = mediumSize(ctx.params, ctx.displaySizePx ?? 0, frame.shapeScale);
        const line = mediumLine(frame, ink);
        buildingFrame = frame;
        buildingInk = ink;
        if (!extras) extras = themeExtras()?.scene(live, ctx.phaseSeed) ?? null;
        extras?.begin(frame, getShape(frame.shape), paintsNow, ctx.displaySizePx ?? 0);
        motion = extras ?? void 0;
        const belt = line ?? ctx.beltPaint ?? flatInk(frame) ?? INK_TOKEN;
        const effects = effectPaint(frame, ink);
        const d = bodyPath(frame.body.outline);
        const parts = medium ? NO_PARTS : partLayers(frame, {
            ink,
            leaf: ctx.leaf ?? LEAF_TOKEN,
            hairShade: hairShadeOf(frame, ctx.solidInk ?? (frame.ink && 'from' in frame.ink ? frame.ink.from : ink)),
            strokeWidth: ctx.params.strokeWidth,
            live,
            partColor: ctx.partColor ?? livePartPaint,
            line: (color)=>hollowFace(color, variant),
            motion
        });
        const body = scene_node('path', bodyAttrs(frame, ink, parts.silhouette ?? d));
        const children = defNodes(frame, d, ink);
        const back = [
            scene_node('g', void 0, trailNodes(frame.trails, 'back'), {
                fragment: true
            }),
            scene_node('g', void 0, beltRings(frame, belt), {
                fragment: true
            })
        ];
        children.push(...medium ? [
            treated(frame, 'over', back)
        ] : back);
        if ('soft' === variant && ctx.params.softShadow) children.push(groundShadow(frame));
        if ('paper' === variant) {
            const tilt = ctx.params.paperTilt;
            children.push(scene_node('g', 0 === tilt ? void 0 : {
                transform: `rotate(${scene_r2(tilt)} ${CENTER} ${CENTER})`
            }, [
                paperShadow(frame, ink, d),
                bodyGroup(frame, body, d, ink, parts)
            ], {
                fragment: 0 === tilt
            }));
        } else if (split) bodySplit(frame, body, d, ink, parts, split);
        else children.push(bodyGroup(frame, body, d, ink, parts));
        const front = [
            scene_node('g', void 0, beltDots(frame, belt), {
                fragment: true
            }),
            scene_node('g', void 0, beltGlyphs(frame, belt), {
                fragment: true
            })
        ];
        const quiet = extras?.quiet === true;
        if (live || frame.fx?.space === 'scene' && !quiet) front.push(fxLayer(frame, 'scene', effects, quiet));
        if (keep(null !== frame.hud.primitives)) front.push(hudLayer(frame.hud, line ?? ink));
        const decor = extras?.decor();
        if (decor) if (split) split.decor = decor;
        else front.push(decor);
        front.push(scene_node('g', void 0, trailNodes(frame.trails, 'front'), {
            fragment: true
        }), scene_node('g', void 0, paperNodes(frame.particles), {
            fragment: true
        }));
        if (split) {
            split.front = [
                medium ? treated(frame, 'over', front) : scene_node('g', void 0, front)
            ];
            split.back = children;
            return EMPTY_GROUP;
        }
        children.push(...medium ? [
            treated(frame, 'over', front)
        ] : front);
        const style = !live || ctx.sourceId ? extras?.style() : null;
        if (style) children.push(style);
        return rootGroup(frame, children, ctx.sourceId || void 0);
    }
    function rootGroup(frame, children, id) {
        const scale = frame.shapeScale;
        return scene_node('g', {
            id,
            transform: `translate(${CENTER} ${CENTER}) scale(${scale}) translate(${-CENTER} ${-CENTER})`
        }, children, {
            layout: 'hang'
        });
    }
    function buildLayers(snapshot) {
        const into = {
            back: [],
            skin: [],
            face: [],
            below: [],
            above: [],
            front: [],
            decor: null,
            treat: null
        };
        split = into;
        try {
            build(snapshot);
        } finally{
            split = null;
        }
        const frame = buildingFrame;
        const treat = into.treat;
        const body = (nodes)=>treat ? [
                treat(nodes)
            ] : nodes;
        const box = motion && getShape(frame.shape).motion ? motion.figureBox() : null;
        const core = frame.body.coreOpacity;
        const faded = (nodes)=>body([
                scene_node('g', {
                    opacity: null === core ? void 0 : scene_r2(core)
                }, nodes)
            ]);
        const scale = frame.shapeScale;
        const steady = (slot, nodes, make)=>{
            const was = steadyLayers[slot];
            if (was && was.scale === scale && was.core === core && was.treated === (null !== treat) && was.nodes.length === nodes.length && was.nodes.every((n, i)=>n === nodes[i])) return was.node;
            const made = make();
            steadyLayers[slot] = {
                scale,
                core,
                treated: null !== treat,
                nodes: [
                    ...nodes
                ],
                node: made
            };
            return made;
        };
        const streams = box?.streams ?? [];
        return {
            back: rootGroup(frame, into.back),
            below: steady(0, into.below, ()=>rootGroup(frame, faded(into.below))),
            skin: steady(1, into.skin, ()=>rootGroup(frame, body(into.skin))),
            above: steady(2, into.above, ()=>rootGroup(frame, faded(into.above))),
            face: rootGroup(frame, body(into.face)),
            streams: steady(3, streams, ()=>rootGroup(frame, streams)),
            front: rootGroup(frame, into.front),
            decor: steady(4, into.decor ? [
                into.decor
            ] : [], ()=>rootGroup(frame, into.decor ? [
                    into.decor
                ] : [])),
            figure: box?.wraps ?? []
        };
    }
    function defNodes(frame, d, ink) {
        const make = ()=>{
            const out = [];
            if (live && ctx.clipId) out.push(defs(frame, d));
            if (isMedium(frame.variant) && ctx.mediaId) out.push(mediumDefs(frame.variant, ctx.mediaId, mediumPaint(frame, ink), sized.params, frame.body.parts));
            return out;
        };
        if (!live || ctx.sourceId) return make();
        const deps = [
            d,
            ...skinDeps(frame, ink, null !== split)
        ];
        if (keptDefs && sameDeps(keptDefs.deps, deps)) return [
            ...keptDefs.nodes
        ];
        const nodes = make();
        keptDefs = {
            deps,
            nodes
        };
        return [
            ...nodes
        ];
    }
    function defs(frame, d) {
        const children = [
            scene_node('clipPath', {
                id: ctx.clipId
            }, [
                scene_node('path', {
                    d
                })
            ])
        ];
        const ink = frame.ink;
        if (ink && 'from' in ink) children.push(scene_node('linearGradient', {
            id: ctx.inkId,
            ...inkGradientVector(ink.angle)
        }, [
            scene_node('stop', {
                offset: 0,
                'stop-color': ink.from
            }),
            scene_node('stop', {
                offset: 1,
                'stop-color': ink.to
            })
        ]));
        return scene_node('defs', void 0, children);
    }
    function bodyAttrs(frame, ink, d) {
        const width = ctx.params.strokeWidth;
        switch(frame.variant){
            case 'outline':
                return {
                    d,
                    fill: ink,
                    'fill-opacity': scene_r2(OUTLINE_FILL * (frame.body.coreOpacity ?? 1)),
                    stroke: asLine(ink),
                    'stroke-width': width,
                    'stroke-linejoin': 'round'
                };
            case 'glass':
                return {
                    d,
                    fill: ink,
                    'fill-opacity': scene_r2(GLASS.tint * (frame.body.coreOpacity ?? 1)),
                    stroke: asLine(ink),
                    'stroke-width': scene_r2(width * GLASS.rim),
                    'stroke-opacity': GLASS.rimOpacity,
                    'stroke-linejoin': 'round'
                };
            default:
                {
                    const core = frame.body.coreOpacity;
                    const rim = isMedium(frame.variant) ? null : rimPaint();
                    return {
                        d,
                        fill: ink,
                        'fill-opacity': null === core ? void 0 : scene_r2(core),
                        ...rim && bodyRim(rim, core)
                    };
                }
        }
    }
    function bodyMotion(b) {
        const transform = `translate(${scene_r2(b.x)} ${scene_r2(b.y)}) rotate(${scene_r2(b.rotation)} ${CENTER} ${CENTER}) translate(${CENTER} ${CENTER}) scale(${scene_r2(b.scaleX)} ${scene_r2(b.scaleY)}) translate(${-CENTER} ${-CENTER})`;
        const atRest = !live && 0 === scene_r2(b.x) && 0 === scene_r2(b.y) && 0 === scene_r2(b.rotation) && 1 === scene_r2(b.scaleX) && 1 === scene_r2(b.scaleY);
        return {
            transform,
            atRest
        };
    }
    function bodyGroup(frame, body, d, ink, parts) {
        const children = [
            ...skinNodes(frame, body, d, ink, parts),
            ...faceNodes(frame, ink)
        ];
        const { transform, atRest } = bodyMotion(frame.body);
        const content = isMedium(frame.variant) ? [
            treated(frame, 'body', children)
        ] : children;
        return scene_node('g', atRest ? void 0 : {
            transform
        }, figureMoved(frame, content), {
            fragment: atRest
        });
    }
    function bodySplit(frame, body, d, ink, parts, into) {
        into.skin = skinNodes(frame, body, d, ink, parts, into);
        into.face = faceNodes(frame, ink);
        into.treat = isMedium(frame.variant) ? (nodes)=>treated(frame, 'body', nodes) : null;
    }
    function skinNodes(frame, body, d, ink, parts, into) {
        if (!live || ctx.sourceId) return drawSkin(frame, body, d, ink, parts, into);
        const deps = skinDeps(frame, ink, void 0 !== into);
        if (kept && sameDeps(kept.deps, deps)) {
            if (into) {
                into.below.push(...kept.below);
                into.above.push(...kept.above);
            }
            return kept.nodes;
        }
        const moving = into ? {
            below: [],
            above: []
        } : void 0;
        const nodes = drawSkin(frame, body, d, ink, parts, moving);
        kept = {
            deps,
            nodes,
            below: moving?.below ?? [],
            above: moving?.above ?? []
        };
        if (into && moving) {
            into.below.push(...moving.below);
            into.above.push(...moving.above);
        }
        return nodes;
    }
    function skinDeps(frame, ink, layered) {
        const b = frame.body;
        const badge = 'sticker' === frame.variant ? frame.badge : null;
        const deps = [
            layered,
            frame.shape,
            frame.variant,
            frame.shapeScale,
            ink,
            frame.ink,
            frame.state,
            frame.settled,
            null === frame.belt,
            b.coreOpacity,
            b.outline,
            ctx.params,
            sized.params,
            sized.minLine,
            badge?.x,
            badge?.y,
            badge?.r,
            badge?.color,
            b.parts.length
        ];
        for (const part of b.parts)deps.push(part.outline, part.opacity, part.color);
        return deps;
    }
    function drawSkin(frame, body, d, ink, parts, into) {
        const children = [];
        if ('sticker' === frame.variant) children.push(stickerLayer(frame, d));
        children.push(...isMedium(frame.variant) ? mediumBody(frame, frame.variant, mediumPaint(frame, ink), sized, ctx.mediaId, live, motion, into) : bodyLayers(frame, body, d, parts));
        return children;
    }
    function faceNodes(frame, ink) {
        const sticker = 'sticker' === frame.variant;
        const medium = isMedium(frame.variant);
        const children = [];
        const faceGroup = face(frame.face, frame.variant, ink);
        if (faceGroup) children.push(medium ? treated(frame, 'face', [
            faceGroup
        ]) : faceGroup);
        if (live || frame.fx?.space === 'face') children.push(fxLayer(frame, 'face', effectPaint(frame, ink)));
        const ring = sticker ? PAPER_TOKEN : PAGE_TOKEN;
        const badge = frame.badge;
        if (badge) children.push(scene_node('circle', {
            cx: scene_r2(badge.x),
            cy: scene_r2(badge.y),
            r: scene_r2(badge.r),
            fill: badge.color,
            stroke: ring,
            'stroke-width': BADGE_RING,
            opacity: 1
        }));
        else if (live) children.push(scene_node('circle', {
            r: 18,
            stroke: ring,
            'stroke-width': BADGE_RING,
            opacity: 0
        }));
        return children;
    }
    function figureMoved(frame, content) {
        return motion && getShape(frame.shape).motion ? motion.figure(content) : content;
    }
    function stickerLayer(frame, d) {
        const { stickerWidth: edge, stickerShadow } = ctx.params;
        const core = frame.body.coreOpacity;
        const shadowed = stickerShadow && void 0 !== ctx.shadowId;
        const children = [];
        if (shadowed) children.push(scene_node('defs', void 0, [
            scene_node('filter', {
                id: ctx.shadowId,
                x: '-25%',
                y: '-25%',
                width: '150%',
                height: '160%',
                'color-interpolation-filters': 'sRGB'
            }, [
                scene_node('feDropShadow', {
                    dx: 0,
                    dy: STICKER_SHADOW.dy,
                    stdDeviation: STICKER_SHADOW.blur,
                    'flood-color': '#000',
                    'flood-opacity': STICKER_SHADOW.opacity
                })
            ])
        ]));
        children.push(scene_node('path', {
            d,
            fill: PAPER_TOKEN,
            stroke: PAPER_TOKEN,
            'stroke-width': scene_r2(2 * edge),
            'stroke-linejoin': 'round',
            opacity: null === core ? void 0 : scene_r2(core)
        }), scene_node('g', void 0, partsPaper(frame, PAPER_TOKEN, edge, live, motion), {
            fragment: true
        }));
        const badge = frame.badge;
        if (badge) children.push(scene_node('circle', {
            cx: scene_r2(badge.x),
            cy: scene_r2(badge.y),
            r: scene_r2(badge.r + BADGE_RING / 2 + edge),
            fill: PAPER_TOKEN,
            opacity: 1
        }));
        else if (live) children.push(scene_node('circle', {
            r: 18,
            fill: PAPER_TOKEN,
            opacity: 0
        }));
        return scene_node('g', {
            filter: shadowed ? `url(#${ctx.shadowId})` : void 0
        }, children);
    }
    function paperShadow(frame, ink, d) {
        const { paperOffset, paperAngle } = ctx.params;
        const angle = paperAngle * Math.PI / 180;
        const core = frame.body.coreOpacity;
        const layers = [
            scene_node('path', {
                d,
                fill: ink,
                'fill-opacity': null === core ? void 0 : scene_r2(core)
            }),
            scene_node('path', {
                d,
                fill: '#000',
                'fill-opacity': scene_r2(PAPER_SHADOW_DARKNESS * (core ?? 1))
            }),
            scene_node('g', void 0, partsShadow(frame, ink, PAPER_SHADOW_DARKNESS, live, motion), {
                fragment: true
            })
        ];
        const { transform, atRest } = bodyMotion(frame.body);
        const moved = scene_node('g', atRest ? void 0 : {
            transform
        }, figureMoved(frame, layers), {
            fragment: atRest
        });
        const shift = `translate(${scene_r2(Math.cos(angle) * paperOffset)} ${scene_r2(Math.sin(angle) * paperOffset)})`;
        return scene_node('g', {
            transform: shift
        }, [
            moved
        ]);
    }
    function cuteShape(shape, closed, attrs, alpha) {
        if (!shape || alpha < 0.005) return live ? scene_node('path', {
            ...attrs,
            opacity: 0
        }) : null;
        return scene_node('path', {
            d: shape.extras ? eyePath(shape) : polylinePath(shape.points, closed),
            transform: tangentTransformString(shape.transform),
            ...attrs,
            opacity: shape.visible ? scene_r2(alpha) : 0
        });
    }
    function cuteFace(f, variant, solid, palette) {
        const g = f.geometry;
        const hollow = isHollow(variant);
        const paint = palette.features;
        const blush = hollow ? {
            color: solid,
            opacity: BLUSH_HOLLOW_OPACITY
        } : wearsDeepBlush(variant) ? BLUSH_DEEP : BLUSH;
        const children = [];
        const add = (n)=>void (n && children.push(n));
        add(cuteShape(g?.blush?.left, true, {
            fill: blush.color
        }, blush.opacity * f.blush));
        add(cuteShape(g?.blush?.right, true, {
            fill: blush.color
        }, blush.opacity * f.blush));
        add(cuteShape(g?.left, true, {
            fill: paint
        }, g?.eyeOpacity ?? 1));
        add(cuteShape(g?.right, true, {
            fill: paint
        }, g?.eyeOpacity ?? 1));
        const drawn = g?.drawn;
        if (drawn) children.push(...drawnEyeNodes(drawn, 1, palette));
        const mouthPaint = drawn ? drawnMouthPaint(drawn, g?.eyeOpacity ?? 1, paint, palette) : paint;
        const mouth = g?.mouth;
        const weight = hollow ? (g?.mouthWeight ?? 0) * MOUTH_OUTLINE_SHARE : g?.mouthStroke ?? 0;
        add(cuteShape(mouth, true, {
            fill: hollow ? 'none' : mouthPaint,
            stroke: mouthPaint,
            'stroke-width': scene_r2(weight),
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        }, (mouth?.opacity ?? 1) * f.cute));
        if (drawn) children.push(...drawnMouthNodes(drawn, mouth, (mouth?.opacity ?? 1) * f.cute, palette));
        return children;
    }
    function facePalette(variant, solid) {
        const hollow = isHollow(variant);
        const line = hollowFace(solid, variant);
        const page = PAGE_TOKEN;
        const mono = hollow && monochromeEffects(variant);
        const featureInk = hollow ? line : faceInkOf(variant, ctx.featureFill ?? FEATURE_TOKEN, solid);
        const faceInk = hollow ? page : faceInkOf(variant, 'sticker' === variant ? stickerFace : ctx.faceFill ?? FACE_TOKEN, solid);
        const pupil = hollow ? line : ctx.pupilFill ?? PUPIL_TOKEN;
        const glint = hollow ? page : ctx.glintFill ?? GLINT_TOKEN;
        const eyed = (paint)=>hollow ? paint : ctx.eyeFill ?? (live ? eyeToken(paint) : paint);
        const base = hollow ? line : solid;
        const iris = base.startsWith('url(') ? base : `color-mix(in oklab, ${base}, ${IRIS_DEPTH.color} ${IRIS_DEPTH.share}%)`;
        const accent = (role)=>{
            if (!mono) return FACE_ACCENTS[role];
            const share = HOLLOW_ACCENT_SHARE[role];
            return share >= 100 ? line : share <= 0 ? page : `color-mix(in oklab, ${line} ${share}%, ${page})`;
        };
        return {
            features: eyed(featureInk),
            paint (role, light) {
                switch(role){
                    case 'face':
                        return faceInk;
                    case 'pupil':
                        return pupil;
                    case 'feature':
                        return featureInk;
                    case 'glint':
                        return glint;
                    case 'iris':
                        return iris;
                    case 'light':
                        return mono || !light ? page : lightCss(light);
                    default:
                        return accent(role);
                }
            },
            rim: hollow ? {
                paint: line,
                width: ctx.params.strokeWidth * PLATE_RIM
            } : null
        };
    }
    function face(f, variant, ink) {
        if (!keep(f.opacity > 0.01 && null !== f.geometry)) return null;
        const g = f.geometry;
        const solid = ctx.solidInk ?? ink;
        const palette = facePalette(variant, solid);
        const attrs = {
            'data-aora-face': '',
            'clip-path': live && ctx.clipId ? `url(#${ctx.clipId})` : void 0,
            opacity: opacity(f.opacity)
        };
        if (f.cute > 0.005 || isCuteFamily(f.style)) return scene_node('g', attrs, cuteFace(f, variant, solid, palette), {
            layout: 'block'
        });
        const eyeFill = palette.features;
        const eye = (shape)=>scene_node('path', shape ? {
                d: eyePath(shape),
                transform: tangentTransformString(shape.transform),
                fill: eyeFill,
                opacity: shape.visible ? 1 : 0
            } : {
                fill: eyeFill
            });
        const children = [
            eye(g?.left),
            eye(g?.right)
        ];
        featureNodes ||= 'line' === f.style || f.features;
        if (featureNodes) {
            const lineWidth = g?.lineWidth ?? 0;
            const fade = f.featureFade;
            const nose = feature(f.features ? g?.nose : void 0, lineWidth, f.lineBlend * fade, eyeFill);
            const mouth = feature(f.features ? g?.mouth : void 0, lineWidth, f.lineBlend, eyeFill);
            if (nose) children.push(nose);
            if (mouth) children.push(mouth);
        }
        return scene_node('g', attrs, children, {
            layout: 'block'
        });
    }
    function feature(shape, lineWidth, alpha, stroke) {
        if (!shape || alpha < 0.005) {
            if (!live) return null;
            return scene_node('path', {
                fill: 'none',
                stroke,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                opacity: 0
            });
        }
        return scene_node('path', {
            d: polylinePath(shape.points, shape.closed),
            transform: tangentTransformString(shape.transform),
            fill: 'none',
            stroke,
            'stroke-width': scene_r2(lineWidth),
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            opacity: shape.visible ? scene_r2(alpha) : 0
        });
    }
    function bodyLayers(frame, body, d, parts) {
        const core = frame.body.coreOpacity;
        const lit = null === core ? void 0 : scene_r2(core);
        const behind = scene_node('g', void 0, parts.behind, {
            fragment: true
        });
        const front = scene_node('g', void 0, parts.front, {
            fragment: true
        });
        if ('soft' === frame.variant) return softLayers(frame, body, d, lit, behind, front);
        if ('riso' === frame.variant) return risoLayers(frame, body, d, lit, behind, front);
        if ('glass' === frame.variant) return glassLayers(frame, body, parts.silhouette ?? d, lit, behind, front);
        return [
            behind,
            body,
            front
        ];
    }
    function glassLayers(frame, body, outline, lit, behind, front) {
        const { softId: lightId, glossId: clipId } = ctx;
        if (!lightId || !clipId) return [
            behind,
            body,
            front
        ];
        const box = outlineBox(frame.body.outline);
        const light = `url(#${lightId})`;
        const defsNode = scene_node('defs', void 0, [
            scene_node('linearGradient', {
                id: lightId,
                x1: 0,
                y1: scene_r2(box.y),
                x2: 0,
                y2: scene_r2(box.y + box.h),
                gradientUnits: 'userSpaceOnUse'
            }, [
                scene_node('stop', {
                    offset: 0,
                    'stop-color': '#fff',
                    'stop-opacity': 1
                }),
                scene_node('stop', {
                    offset: 0.55,
                    'stop-color': '#fff',
                    'stop-opacity': 0
                })
            ]),
            scene_node('clipPath', {
                id: clipId
            }, [
                scene_node('path', {
                    d: outline
                })
            ])
        ]);
        const shine = scene_node('g', {
            'clip-path': `url(#${clipId})`,
            opacity: lit
        }, [
            scene_node('path', {
                d: outline,
                fill: light,
                opacity: GLASS.sheen
            }),
            scene_node('path', {
                d: outline,
                fill: 'none',
                stroke: light,
                'stroke-width': scene_r2(0.9 * ctx.params.strokeWidth),
                opacity: GLASS.edgeLight
            })
        ]);
        return [
            defsNode,
            behind,
            body,
            shine,
            front
        ];
    }
    function overBody(pieces, d, lit, attrs) {
        return [
            scene_node('path', {
                d,
                ...attrs,
                opacity: lit
            }),
            ...pieces.map((piece)=>scene_node('path', {
                    d: piece.d,
                    ...attrs,
                    opacity: void 0 === lit ? piece.opacity : scene_r2((piece.opacity ?? 1) * lit)
                }))
        ];
    }
    function softLayers(frame, body, d, lit, behind, front) {
        const { softId, glossId } = ctx;
        if (!softId) return [
            behind,
            body,
            front
        ];
        const box = outlineBox(frame.body.outline);
        const stop = (offset, color, alpha)=>scene_node('stop', {
                offset,
                'stop-color': color,
                'stop-opacity': alpha
            });
        const defsChildren = [
            scene_node('radialGradient', {
                id: softId,
                cx: 0.36,
                cy: 0.3,
                r: 0.78,
                gradientUnits: 'userSpaceOnUse',
                gradientTransform: `translate(${scene_r2(box.x)} ${scene_r2(box.y)}) scale(${scene_r2(box.w)} ${scene_r2(box.h)})`
            }, [
                stop(0, '#fff', 0.55),
                stop(0.52, '#fff', 0),
                stop(0.52, '#000', 0),
                stop(1, '#000', 0.22)
            ])
        ];
        const gloss = ctx.params.softGloss && glossId;
        if (gloss) defsChildren.push(scene_node('clipPath', {
            id: glossId
        }, [
            scene_node('path', {
                d
            })
        ]));
        const layers = [
            scene_node('defs', void 0, defsChildren),
            behind,
            body,
            ...overBody(bodyPieces(frame, live), d, lit, {
                fill: `url(#${softId})`
            })
        ];
        if (gloss) {
            const cx = scene_r2(box.x + 0.3 * box.w);
            const cy = scene_r2(box.y + 0.27 * box.h);
            layers.push(scene_node('g', {
                'clip-path': `url(#${glossId})`
            }, [
                scene_node('ellipse', {
                    cx,
                    cy,
                    rx: scene_r2(0.09 * box.w),
                    ry: scene_r2(0.053 * box.w),
                    fill: '#fff',
                    opacity: scene_r2(0.55 * (lit ?? 1)),
                    transform: `rotate(-32 ${cx} ${cy})`
                })
            ], {
                layout: 'inline'
            }));
        }
        layers.push(front);
        return layers;
    }
    function risoLayers(frame, body, d, lit, behind, front) {
        const { risoOffset, risoHalftone } = ctx.params;
        const { halftoneId } = ctx;
        const pieces = bodyPieces(frame, live);
        const second = scene_node('g', {
            transform: `translate(${scene_r2(RISO_DIRECTION[0] * risoOffset)} ${scene_r2(RISO_DIRECTION[1] * risoOffset)})`
        }, overBody(pieces, d, void 0, {
            fill: RISO_TOKEN,
            'fill-opacity': lit
        }));
        const printed = scene_node('g', {
            opacity: 0.92,
            style: 'mix-blend-mode:multiply'
        }, [
            behind,
            body,
            ...overBody(pieces, d, void 0, {
                fill: '#fff',
                'fill-opacity': scene_r2(0.18 * (frame.body.coreOpacity ?? 1))
            })
        ]);
        const stack = [
            second,
            printed
        ];
        const layers = [];
        if (risoHalftone && halftoneId) {
            layers.push(scene_node('defs', void 0, [
                scene_node('pattern', {
                    id: halftoneId,
                    width: HALFTONE.pitch,
                    height: HALFTONE.pitch,
                    patternUnits: 'userSpaceOnUse',
                    patternTransform: `rotate(${HALFTONE.angle})`
                }, [
                    scene_node('circle', {
                        cx: HALFTONE.pitch / 2,
                        cy: HALFTONE.pitch / 2,
                        r: HALFTONE.radius,
                        fill: '#fff',
                        'fill-opacity': HALFTONE.opacity
                    })
                ])
            ]));
            stack.push(...overBody(pieces, d, lit, {
                fill: `url(#${halftoneId})`
            }));
        }
        layers.push(scene_node('g', {
            style: 'isolation:isolate'
        }, stack), front);
        return layers;
    }
    function groundShadow(frame) {
        const box = bodyPieces(frame, live).reduce((acc, piece)=>joinBoxes(acc, outlineBox(piece.outline)), outlineBox(frame.body.outline));
        const fade = 1 - (frame.belt?.blend ?? 0);
        const rx = 0.42 * box.w;
        return scene_node('ellipse', {
            cx: scene_r2(box.x + box.w / 2),
            cy: scene_r2(box.y + box.h - 3),
            rx: scene_r2(rx),
            ry: scene_r2(0.133 * rx),
            fill: '#000',
            opacity: scene_r2(0.12 * fade)
        });
    }
    function fxLayer(frame, space, effects, quiet = false) {
        const fx = frame.fx;
        const items = fx && fx.space === space && !quiet ? fx.items : [];
        const paint = effects ?? fx?.color ?? ctx.fxFill ?? ctx.solidInk ?? ctx.beltPaint ?? flatInk(frame) ?? FX_TOKEN;
        const nodes = items.filter((item)=>keep(item.opacity > 0.01)).map((item)=>fxItem(item, paint));
        return scene_node('g', {
            'data-aora-fx': '',
            style: live ? 'pointer-events:none' : void 0
        }, nodes, {
            fragment: !live && 0 === nodes.length
        });
    }
    function fxItem(item, paint) {
        const { x, y, size: s, opacity: alpha } = item;
        const stroke = {
            fill: 'none',
            stroke: paint,
            'stroke-width': scene_r2(item.width ?? 0),
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            opacity: scene_r2(alpha)
        };
        switch(item.shape){
            case 'z':
                return scene_node('path', {
                    d: `M${scene_r2(x - s / 2)} ${scene_r2(y - s / 2)}h${scene_r2(s)}l${scene_r2(-s)} ${scene_r2(s)}h${scene_r2(s)}`,
                    ...stroke
                });
            case 'star':
                return scene_node('path', {
                    d: starPath(x, y, s),
                    fill: paint,
                    opacity: scene_r2(alpha)
                });
            case 'heart':
                return scene_node('path', {
                    d: heartPath(x, y, s),
                    fill: paint,
                    opacity: scene_r2(alpha)
                });
            case 'drop':
                return scene_node('path', {
                    d: dropPath(x, y, s),
                    fill: paint,
                    opacity: scene_r2(alpha)
                });
            case 'bang':
                return scene_node('g', {
                    transform: `translate(${scene_r2(x)} ${scene_r2(y)}) scale(${scene_r2(s)})`,
                    fill: paint,
                    opacity: scene_r2(alpha)
                }, [
                    scene_node('rect', {
                        x: -2.3,
                        y: 0,
                        width: 4.6,
                        height: 14,
                        rx: 2.3
                    }),
                    scene_node('circle', {
                        cx: 0,
                        cy: 19.5,
                        r: 2.6
                    })
                ]);
            case 'line':
                return scene_node('path', {
                    d: `M${scene_r2(x)} ${scene_r2(y)}L${scene_r2(item.x2 ?? x)} ${scene_r2(item.y2 ?? y)}`,
                    ...stroke
                });
            case 'dot':
                return scene_node('circle', {
                    cx: scene_r2(x),
                    cy: scene_r2(y),
                    r: scene_r2(s),
                    fill: paint,
                    opacity: scene_r2(alpha)
                });
            case 'pencil':
                return scene_node('path', {
                    d: GLYPH_PATHS.pencil,
                    fill: paint,
                    opacity: scene_r2(alpha),
                    transform: `translate(${scene_r2(x)} ${scene_r2(y)}) rotate(${scene_r2(item.rotation ?? 0)}) scale(${scene_r2(s)})`
                });
            case 'arc':
                {
                    const circumference = 2 * Math.PI * s;
                    const on = (item.sweep ?? 0) / 360 * circumference;
                    return scene_node('circle', {
                        cx: scene_r2(x),
                        cy: scene_r2(y),
                        r: scene_r2(s),
                        ...stroke,
                        'stroke-dasharray': `${scene_r2(on)} ${scene_r2(circumference - on)}`,
                        transform: `rotate(${scene_r2((item.start ?? 0) - 90)} ${scene_r2(x)} ${scene_r2(y)})`
                    });
                }
        }
    }
    function beltRings(frame, paint) {
        const belt = frame.belt;
        if (!belt) return [];
        return belt.rings.filter((ring)=>keep(ring.opacity > 0.01 && ring.r > 0.1)).map((ring)=>{
            const cx = scene_r2(ring.x);
            const cy = scene_r2(ring.y);
            return scene_node('circle', {
                cx,
                cy,
                r: scene_r2(Math.max(0.1, ring.r)),
                fill: 'none',
                stroke: paint,
                'stroke-width': scene_r2(ring.width),
                'stroke-linecap': 'round',
                opacity: scene_r2(ring.opacity * belt.blend),
                'stroke-dasharray': ring.dash ? `${ring.dash.on} ${ring.dash.period}` : void 0,
                transform: ring.dash ? `rotate(-90 ${cx} ${cy})` : void 0
            });
        });
    }
    function beltDots(frame, paint) {
        const belt = frame.belt;
        if (!belt) return [];
        return belt.dots.filter((dot)=>keep(dot.opacity > 0.01)).map((dot)=>scene_node('circle', {
                cx: scene_r2(dot.x),
                cy: scene_r2(dot.y),
                r: scene_r2(dot.r),
                fill: paint,
                opacity: scene_r2(dot.opacity * belt.blend)
            }));
    }
    function beltGlyphs(frame, paint) {
        const belt = frame.belt;
        if (!belt) return [];
        return belt.glyphs.filter((g)=>keep(g.opacity > 0.01)).map((g)=>scene_node('path', {
                d: GLYPH_PATHS[g.kind],
                fill: paint,
                opacity: scene_r2(g.opacity * belt.blend),
                transform: `translate(${scene_r2(g.x)} ${scene_r2(g.y)}) rotate(${scene_r2(g.rotation)}) scale(${scene_r2(g.scale)})`
            }));
    }
    function hudLayer(hud, ink) {
        const p = hud.primitives;
        const frag = (nodes)=>scene_node('g', void 0, nodes, {
                fragment: true
            });
        const stroke = scene_r2(hud.strokeWidth);
        const arcs = p?.arcs.filter((a)=>keep(a.opacity > 0.01 && a.r > 0.1)).map((a)=>scene_node('path', {
                d: new PathBuilder().arcTo(a.x, a.y, Math.max(0.1, a.r), a.start, a.end).toString(),
                fill: 'none',
                stroke: ink,
                'stroke-width': scene_r2(a.width),
                'stroke-linecap': a.cap ?? 'round',
                opacity: scene_r2(a.opacity)
            })) ?? [];
        const ticks = p?.ticks.filter((t)=>keep(t.opacity > 0.01)).map((t)=>scene_node('line', {
                x1: scene_r2(t.x1),
                y1: scene_r2(t.y1),
                x2: scene_r2(t.x2),
                y2: scene_r2(t.y2),
                stroke: ink,
                'stroke-width': stroke,
                'stroke-linecap': 'round',
                opacity: scene_r2(t.opacity)
            })) ?? [];
        const bars = p?.bars.filter((b)=>keep(b.opacity > 0.01 && b.w > 0.01 && b.h > 0.01)).map((b)=>scene_node('rect', {
                x: scene_r2(b.x),
                y: scene_r2(b.y),
                width: scene_r2(Math.max(0.1, b.w)),
                height: scene_r2(Math.max(0.1, b.h)),
                rx: scene_r2(Math.min(b.w, b.h) / 2),
                fill: ink,
                opacity: scene_r2(b.opacity)
            })) ?? [];
        const strokes = p?.strokes.map((s)=>({
                s,
                d: polylinesPath(s.lines)
            })).filter(({ s, d })=>keep(s.opacity > 0.01 && '' !== d)).map(({ s, d })=>scene_node('path', {
                d,
                fill: 'none',
                stroke: ink,
                'stroke-width': stroke,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                opacity: scene_r2(s.opacity)
            })) ?? [];
        const pips = p?.pips.filter((pip)=>keep(pip.opacity > 0.01 && pip.r > 0.01)).map((pip)=>scene_node('circle', {
                cx: scene_r2(pip.x),
                cy: scene_r2(pip.y),
                r: scene_r2(Math.max(0.1, pip.r)),
                fill: ink,
                opacity: scene_r2(pip.opacity)
            })) ?? [];
        const glyphs = p?.glyphs.filter((g)=>keep(g.opacity > 0.01 && '' !== g.text)).map((g)=>scene_node('text', {
                x: scene_r2(g.x),
                y: scene_r2(g.y),
                'text-anchor': g.anchor ?? 'middle',
                'dominant-baseline': 'central',
                'font-family': HUD_FONT,
                'font-size': scene_r2(g.size),
                'font-weight': 600,
                fill: ink,
                opacity: scene_r2(g.opacity)
            }, void 0, {
                text: g.text
            })) ?? [];
        return scene_node('g', {
            'data-aora-hud': '',
            opacity: opacity(hud.opacity),
            style: live ? 'pointer-events:none' : void 0
        }, [
            frag(arcs),
            frag(ticks),
            frag(bars),
            frag(strokes),
            frag(pips),
            frag(glyphs)
        ]);
    }
    return {
        build,
        layers: buildLayers,
        rules: ()=>extras?.rules() ?? NO_LAYER_RULES
    };
}
const outlineBoxes = new WeakMap();
function outlineBox(outline) {
    let box = outlineBoxes.get(outline);
    if (!box) {
        let minX = 1 / 0;
        let minY = 1 / 0;
        let maxX = -1 / 0;
        let maxY = -1 / 0;
        for (const [x, y] of outline){
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        box = {
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY
        };
        outlineBoxes.set(outline, box);
    }
    return box;
}
function joinBoxes(a, b) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return {
        x,
        y,
        w: Math.max(a.x + a.w, b.x + b.w) - x,
        h: Math.max(a.y + a.h, b.y + b.h) - y
    };
}
const starPath = (x, y, r)=>`M${scene_r2(x)} ${scene_r2(y - r)}Q${scene_r2(x)} ${scene_r2(y)} ${scene_r2(x + r)} ${scene_r2(y)}Q${scene_r2(x)} ${scene_r2(y)} ${scene_r2(x)} ${scene_r2(y + r)}Q${scene_r2(x)} ${scene_r2(y)} ${scene_r2(x - r)} ${scene_r2(y)}Q${scene_r2(x)} ${scene_r2(y)} ${scene_r2(x)} ${scene_r2(y - r)}Z`;
const heartPath = (x, y, s)=>`M${scene_r2(x)} ${scene_r2(y + 0.9 * s)}C${scene_r2(x - 1.6 * s)} ${scene_r2(y - 0.1 * s)} ${scene_r2(x - 0.8 * s)} ${scene_r2(y - 1.3 * s)} ${scene_r2(x)} ${scene_r2(y - 0.45 * s)}C${scene_r2(x + 0.8 * s)} ${scene_r2(y - 1.3 * s)} ${scene_r2(x + 1.6 * s)} ${scene_r2(y - 0.1 * s)} ${scene_r2(x)} ${scene_r2(y + 0.9 * s)}Z`;
const dropPath = (x, y, s)=>`M${scene_r2(x)} ${scene_r2(y - s)}C${scene_r2(x + 0.85 * s)} ${scene_r2(y + 0.2 * s)} ${scene_r2(x + 0.85 * s)} ${scene_r2(y + s)} ${scene_r2(x)} ${scene_r2(y + s)}C${scene_r2(x - 0.85 * s)} ${scene_r2(y + s)} ${scene_r2(x - 0.85 * s)} ${scene_r2(y + 0.2 * s)} ${scene_r2(x)} ${scene_r2(y - s)}Z`;
const NO_PARTS = {
    behind: [],
    front: [],
    silhouette: null
};
const EMPTY_GROUP = scene_node('g', void 0, []);
function sameDeps(a, b) {
    if (a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++)if (a[i] !== b[i]) return false;
    return true;
}
function hasContent(nodes) {
    return nodes.some((n)=>!n.fragment || hasContent(n.children ?? []));
}
function flatInk(frame) {
    const ink = frame.ink;
    return ink && 'flat' in ink ? ink.flat : void 0;
}
function resolveInk(frame, ctx) {
    if (void 0 !== ctx.ink) return ctx.ink;
    const ink = frame.ink;
    if (!ink) return INK_TOKEN;
    if ('flat' in ink) return ink.flat;
    return `url(#${ctx.inkId})`;
}
let live_idSerial = 0;
function createVectorRenderer(host, context) {
    const svg = createSvgElement('svg');
    svg.setAttribute('viewBox', VIEWBOX_STR);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.overflow = 'visible';
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    const root = createSvgElement('g');
    svg.appendChild(root);
    host.appendChild(svg);
    const seedHash = fnv1a32(context.seed);
    const clipId = `aora-clip-${seedHash.toString(36)}-${(live_idSerial++).toString(36)}`;
    const inkId = `aora-ink-${seedHash.toString(36)}-${(live_idSerial++).toString(36)}`;
    const shadowId = inkId.replace('aora-ink-', 'aora-shadow-');
    let params = readVectorParams(context.styleOptions);
    let shownPx = 0;
    let last = null;
    let stage = null;
    const scene = createVectorScene({
        mode: 'live',
        sourceId: context.sourceId,
        clipId,
        inkId,
        shadowId,
        softId: inkId.replace('aora-ink-', 'aora-soft-'),
        halftoneId: inkId.replace('aora-ink-', 'aora-halftone-'),
        glossId: inkId.replace('aora-ink-', 'aora-gloss-'),
        mediaId: inkId.replace('aora-ink-', 'aora-media-'),
        phaseSeed: context.seed,
        get params () {
            return params;
        },
        get displaySizePx () {
            return shownPx;
        }
    });
    let visible = true;
    let held = false;
    const play = ()=>{
        if (held || !visible) svg.style.setProperty('--aora-play', 'paused');
        else svg.style.removeProperty('--aora-play');
    };
    const sight = context.sourceId || "u" < typeof IntersectionObserver ? null : new IntersectionObserver((entries)=>{
        const now = entries[entries.length - 1].isIntersecting;
        if (now === visible) return;
        visible = now;
        play();
        if (visible && last) draw(last);
    }, {
        rootMargin: '64px'
    });
    sight?.observe(svg);
    function draw(frame) {
        const extras = themeExtras();
        if (extras && drawsInLayers(frame, context.sourceId)) {
            const layers = scene.layers(frame);
            syncElement(root, layers.back);
            stage ??= extras.stage(svg);
            stage.draw(frame, layers, shownPx);
        } else {
            stage?.remove();
            syncElement(root, scene.build(frame));
        }
        if (extras && !context.sourceId) extras.share(svg, scene.rules());
    }
    const resize = "u" < typeof ResizeObserver ? null : new ResizeObserver((entries)=>{
        const width = entries[entries.length - 1].contentRect.width;
        if (width === shownPx) return;
        shownPx = width;
        if (last && (stage?.shown || isMedium(last.variant) || themeExtras()?.decorates(last.variant) || last.body.parts.some((part)=>void 0 !== part.minPx))) draw(last);
    });
    resize?.observe(svg);
    return {
        element: svg,
        draw (frame, ticking) {
            last = frame;
            if (visible || !ticking) draw(frame);
        },
        configure (styleOptions) {
            params = readVectorParams(styleOptions);
        },
        hold (next) {
            held = next;
            play();
        },
        destroy () {
            resize?.disconnect();
            sight?.disconnect();
            last = null;
            stage = null;
            svg.remove();
        }
    };
}
function paletteGradient(scheme, uid, light, dark) {
    const style = schemeStyle(scheme, [
        {
            selector: `.${uid}-from`,
            decls: [
                {
                    prop: 'stop-color',
                    light: light.from,
                    dark: dark.from
                }
            ]
        },
        {
            selector: `.${uid}-to`,
            decls: [
                {
                    prop: 'stop-color',
                    light: light.to,
                    dark: dark.to
                }
            ]
        }
    ], false);
    return `<defs>
    <linearGradient id="${uid}-ink" x1="0" y1="0" x2="1" y2="1">
      <stop class="${uid}-from" offset="0%" stop-color="${light.from}"/>
      <stop class="${uid}-to" offset="100%" stop-color="${light.to}"/>
    </linearGradient>
  </defs>
  ${style}`;
}
function ownGradient(uid, ink) {
    const { x1, y1, x2, y2 } = inkGradientVector(ink.angle);
    return `<defs>
    <linearGradient id="${uid}-ink" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${ink.from}"/>
      <stop offset="100%" stop-color="${ink.to}"/>
    </linearGradient>
  </defs>`;
}
const renderVectorStatic = (frame, context)=>{
    const { color, uid, flat } = context;
    const own = frame.ink;
    const scheme = context.colorScheme ?? 'system';
    const light = getInkColor(color, 'light');
    const dark = getInkColor(color, 'dark');
    const rule = faceInks(color);
    const special = !rule.plain;
    const turns = rule.turns;
    const hollow = isLineVariant(frame.variant);
    const style = frame.face.style;
    const filled = !hollow;
    const sticker = 'sticker' === frame.variant;
    const drawn = filled && isDrawnFace(style);
    const uses = {
        face: drawn && !sticker,
        feature: special && filled,
        pupil: special && drawn,
        glint: special && drawn,
        sticker: special && sticker,
        hair: special && filled && frame.body.parts.some((part)=>'hair' === part.tone)
    };
    const turned = turns ? Object.keys(uses).filter((key)=>uses[key]) : [];
    const turning = [
        ...new Set(frame.body.parts.flatMap((part)=>{
            const pair = void 0 === part.color ? null : partColorPair(part.color);
            return pair && pair.light !== pair.dark ? [
                part.color
            ] : [];
        }))
    ];
    const partVar = (part, kind)=>`--${uid}-${'fill' === kind ? 'pc' : 'pr'}-${fnv1a32(part).toString(36)}`;
    const effects = frame.fx || themeExtras()?.decorates(frame.variant) ? effectInks(color) : null;
    const fxPair = effects && (effects.light || effects.dark) ? {
        light: effects.light ?? light,
        dark: effects.dark ?? dark
    } : null;
    const lines = hollow ? lineInks(color) : null;
    const linePair = lines && (lines.light || lines.dark) ? {
        light: lines.light ?? light,
        dark: lines.dark ?? dark
    } : null;
    const rims = hollow ? null : rimInks(color);
    const rimPair = rims && (rims.light || rims.dark) ? {
        light: rims.light ?? 'transparent',
        dark: rims.dark ?? 'transparent'
    } : null;
    const seconds = 'riso' === frame.variant ? risoSecondInk(color) : null;
    const secondPair = seconds && (seconds.light || seconds.dark) ? {
        light: seconds.light ?? RISO_INK,
        dark: seconds.dark ?? RISO_INK
    } : null;
    let fill;
    let solid;
    let fxFill;
    let lineInk;
    let rimInk = null;
    let defs = '';
    let root = '';
    if (own && 'flat' in own) fill = solid = own.flat;
    else if (own) {
        fill = `url(#${uid}-ink)`;
        solid = own.from;
        defs = ownGradient(uid, own);
    } else if (flat) {
        fill = solid = light;
        fxFill = fxPair?.light;
        lineInk = linePair?.light;
        rimInk = rims?.light ?? null;
    } else {
        solid = `var(--${uid}-ink, ${light})`;
        fxFill = fxPair ? `var(--${uid}-fx, ${fxPair.light})` : void 0;
        lineInk = linePair ? `var(--${uid}-line, ${linePair.light})` : void 0;
        rimInk = rimPair ? `var(--${uid}-rim, ${rimPair.light})` : null;
        defs = paletteInk(scheme, uid, light, dark, [
            ...hollow ? [
                {
                    prop: `--${uid}-shift`,
                    ...FACE_SHIFT
                }
            ] : [],
            ...turned.map((key)=>({
                    prop: `--${uid}-${key}`,
                    light: rule.light[key],
                    dark: rule.dark[key]
                })),
            ...turning.flatMap((part)=>[
                    {
                        prop: partVar(part, 'fill'),
                        ...partColorPair(part)
                    },
                    {
                        prop: partVar(part, 'rim'),
                        ...partRimPair(part)
                    }
                ]),
            ...fxPair ? [
                {
                    prop: `--${uid}-fx`,
                    ...fxPair
                }
            ] : [],
            ...linePair ? [
                {
                    prop: `--${uid}-line`,
                    ...linePair
                }
            ] : [],
            ...rimPair ? [
                {
                    prop: `--${uid}-rim`,
                    ...rimPair
                }
            ] : [],
            ...secondPair ? [
                {
                    prop: '--aora-ink2',
                    ...secondPair
                }
            ] : []
        ]);
        root = ` class="${uid}"`;
        fill = solid;
        if ('glass' === frame.variant) {
            fill = `url(#${uid}-ink)`;
            defs += `\n  ${paletteGradient(scheme, uid, getInkGradientFor(color, 'light'), getInkGradientFor(color, 'dark'))}`;
        }
    }
    const paint = (key)=>uses[key] ? root && turned.includes(key) ? `var(--${uid}-${key}, ${rule.light[key]})` : rule.light[key] : void 0;
    const partColor = (part)=>{
        const pair = partColorPair(part);
        const rim = partRimPair(part);
        if (!pair || !rim) return livePartPaint(part);
        if (root && turning.includes(part)) return {
            fill: `var(${partVar(part, 'fill')}, ${pair.light})`,
            rim: `var(${partVar(part, 'rim')}, ${rim.light})`
        };
        return {
            fill: pair.light,
            rim: rim.light
        };
    };
    const scene = createVectorScene({
        mode: 'static',
        ink: fill,
        solidInk: solid,
        fxFill,
        lineInk,
        rimInk,
        partColor,
        eyeFill: context.eyeColor,
        faceFill: paint('face'),
        featureFill: paint('feature'),
        pupilFill: paint('pupil'),
        glintFill: paint('glint'),
        stickerFaceFill: paint('sticker'),
        faceShift: hollow && root ? `var(--${uid}-shift, ${FACE_SHIFT.light})` : void 0,
        hairShade: own ? HAIR_SHADE : paint('hair') ?? rule.light.hair,
        leaf: getLeafColor(color),
        beltPaint: fill,
        shadowId: `${uid}-shadow`,
        softId: `${uid}-soft`,
        halftoneId: `${uid}-halftone`,
        glossId: `${uid}-gloss`,
        mediaId: `${uid}-${frame.variant}`,
        displaySizePx: context.sizePx,
        params: readVectorParams(context.styleOptions)
    });
    const second = secondPair && !root ? ` style="--aora-ink2:${secondPair.light}"` : '';
    const size = context.sizePx ? ` width="${context.sizePx}" height="${context.sizePx}"` : '';
    const bleed = themeExtras()?.bleeds(frame.variant) || mediumReaches(frame.variant) ? ' overflow="visible"' : '';
    return `<svg xmlns="http://www.w3.org/2000/svg"${root} viewBox="${VIEWBOX_STR}"${size}${bleed} fill="none" aria-hidden="true"${second}>${defs}
  ${serializeNode(scene.build(frame), 2)}
</svg>`;
};
function defineVectorMedium(id, definition, reads = []) {
    defineMedium(id, definition);
    addVariant('vector', id, reads);
}
const vectorStyle = defineStyle({
    id: 'vector',
    label: 'Vector',
    variants: VECTOR_VARIANTS,
    defaultVariant: 'solid',
    defaults: {
        strokeWidth: 10,
        stickerWidth: 12,
        stickerShadow: true,
        paperOffset: 9,
        paperAngle: 55,
        paperTilt: -3,
        softShadow: true,
        softGloss: false,
        risoOffset: 10,
        risoHalftone: true,
        wobble: 4,
        grain: 1,
        hatching: true,
        neonGlow: 8
    },
    params: {
        strokeWidth: {
            type: 'number',
            min: 4,
            max: 28,
            step: 1,
            label: 'Line width',
            variants: [
                'outline',
                'glass',
                'pencil',
                'marker',
                'neon',
                'chalk'
            ]
        },
        stickerWidth: {
            type: 'number',
            min: 4,
            max: 20,
            step: 1,
            label: 'Sticker edge',
            variants: [
                'sticker'
            ]
        },
        stickerShadow: {
            type: 'boolean',
            label: 'Sticker shadow',
            variants: [
                'sticker'
            ]
        },
        paperOffset: {
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Paper shadow offset',
            variants: [
                'paper'
            ]
        },
        paperAngle: {
            type: 'number',
            min: 0,
            max: 360,
            step: 5,
            label: 'Paper shadow angle',
            variants: [
                'paper'
            ]
        },
        paperTilt: {
            type: 'number',
            min: -8,
            max: 8,
            step: 1,
            label: 'Paper tilt',
            variants: [
                'paper'
            ]
        },
        softShadow: {
            type: 'boolean',
            label: 'Soft ground shadow',
            variants: [
                'soft'
            ]
        },
        softGloss: {
            type: 'boolean',
            label: 'Soft gloss',
            variants: [
                'soft'
            ]
        },
        risoOffset: {
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Riso misregistration',
            variants: [
                'riso'
            ]
        },
        risoHalftone: {
            type: 'boolean',
            label: 'Riso halftone',
            variants: [
                'riso'
            ]
        },
        wobble: {
            type: 'number',
            min: 0,
            max: 8,
            step: 1,
            label: 'Hand wobble',
            variants: [
                'pencil',
                'marker',
                'crayon',
                'watercolor',
                'chalk'
            ]
        },
        grain: {
            type: 'number',
            min: 0,
            max: 2,
            step: 0.1,
            label: 'Paper grain',
            variants: [
                'pencil',
                'crayon',
                'watercolor',
                'chalk',
                'gothic'
            ]
        },
        hatching: {
            type: 'boolean',
            label: 'Hatching',
            variants: [
                'pencil',
                'chalk',
                'gothic'
            ]
        },
        neonGlow: {
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Neon glow',
            variants: [
                'neon'
            ]
        }
    },
    createRenderer: createVectorRenderer,
    renderStatic: renderVectorStatic
});
const BUILTIN_STYLES = [
    vectorStyle,
    pixelStyle,
    kaomojiStyle
];
function installBuiltins() {
    for (const style of BUILTIN_STYLES)if (!hasStyle(style.id)) defineStyle(style);
}
function styles_hasStyle(id) {
    installBuiltins();
    return hasStyle(id);
}
function styles_getStyle(id) {
    installBuiltins();
    return getStyle(id);
}
function styles_listStyles() {
    installBuiltins();
    const builtIn = (id)=>STYLE_IDS.indexOf(id);
    const rank = (style)=>builtIn(style.id) < 0 ? STYLE_IDS.length : builtIn(style.id);
    return listStyles().sort((a, b)=>rank(a) - rank(b));
}
const definitions = new Map();
const themes_packages = new Map();
const themeChoices = (dimension)=>'fixed' in dimension ? [
        dimension.fixed
    ] : dimension.open;
const themeDefault = (dimension)=>themeChoices(dimension)[0];
const isFixed = (dimension)=>'fixed' in dimension;
const allStates = (start)=>({
        open: [
            start,
            ...CHARACTER_STATES.filter((state)=>state !== start)
        ]
    });
function statesOf(source) {
    const { state } = source;
    if (void 0 === state) return allStates('idle');
    if ('start' in state) return allStates(state.start);
    return state;
}
function defineTheme(source) {
    const theme = {
        ...source,
        state: statesOf(source)
    };
    const fail = (what)=>{
        throw new Error(`Theme "${theme.id}": ${what}`);
    };
    const check = (name, dimension, valid)=>{
        const values = themeChoices(dimension);
        if (0 === values.length) fail(`${name} offers nothing`);
        const bad = values.find((value)=>!valid(value));
        if (void 0 !== bad) fail(`${name} names ${JSON.stringify(bad)}, which the engine does not know`);
    };
    if (0 === theme.cast.length) fail('cast is empty');
    if (theme.members.map((member)=>member.id).join() !== theme.cast.join()) fail('members do not match the cast');
    for (const member of theme.members)if ('borrowed' === member.kind && member.color && !ALL_COLOR_IDS.includes(member.color)) fail(`${member.id} wears ${JSON.stringify(member.color)}, which the engine does not know`);
    check('shape', theme.shape, (id)=>ALL_SHAPE_IDS.includes(id));
    check('color', theme.color, (id)=>ALL_COLOR_IDS.includes(id));
    check('style', theme.style, ({ style, variant })=>styles_hasStyle(style) && (acceptsVariant(styles_getStyle(style), variant) || THEME_MANIFEST.some((entry)=>entry.variants.some((v)=>v.style === style && v.variant === variant))));
    check('face', theme.face, (id)=>isFaceStyle(id));
    check('state', theme.state, (id)=>isCharacterState(id));
    definitions.set(theme.id, theme);
    return theme;
}
function installTheme(theme) {
    const id = theme.definition.id;
    if (themes_packages.has(id)) return definitions.get(id);
    const entry = THEME_MANIFEST.find((known)=>known.id === id);
    const missing = entry?.colors.find((color)=>!theme.colors.some((swatch)=>swatch.id === color));
    if (missing) throw new Error(`Theme "${id}": the manifest gives it the colour "${missing}", which its entry has no swatch for`);
    (theme.extras ? installExtras(theme.extras) : themeExtras())?.register(theme);
    for (const swatch of theme.colors)registerSwatch(swatch);
    registerArt(theme.art, theme.faces.boxes);
    registerFits(theme.faces.fits);
    for (const design of theme.faces.designs ?? [])defineFace(design, {
        label: theme.labels.faces?.[design.id]
    });
    registerCast(theme.cast);
    for (const skin of theme.variants){
        defineMedium(skin.variant, skin.medium);
        addVariant(skin.style, skin.variant, skin.reads);
    }
    themes_packages.set(id, theme);
    markInstalled(id, theme);
    return defineTheme(theme.definition);
}
setInstaller((theme)=>installTheme(theme));
const loading = new Map();
const entryOf = (module)=>{
    const found = Object.values(module).find((value)=>!!value && 'object' == typeof value && 'definition' in value && 'art' in value);
    return found ?? null;
};
function loadTheme(id) {
    const done = getTheme(id);
    if (done && isThemeInstalled(id)) return Promise.resolve(done);
    let pending = loading.get(id);
    if (!pending) {
        const entry = THEME_MANIFEST.find((theme)=>theme.id === id);
        if (!entry) return Promise.reject(new Error(`Unknown theme "${id}"`));
        pending = entry.load().then((module)=>{
            const theme = entryOf(module);
            if (!theme) throw new Error(`The entry of theme "${id}" exports no theme`);
            return installTheme(theme);
        });
        pending.catch(()=>loading.delete(id));
        loading.set(id, pending);
    }
    return pending;
}
const loadThemes = (ids)=>Promise.all(ids.map(loadTheme));
function getTheme(id) {
    const found = definitions.get(id);
    if (found) return found;
    return isThemeInstalled(id) ? definitions.get(id) ?? null : null;
}
function themeLook(theme, memberId, seed = memberId) {
    const definition = 'string' == typeof theme ? requireDefinition(theme) : theme;
    const member = castMember(memberId);
    if (!member) return null;
    const given = definition.members.find((entry)=>entry.id === memberId);
    const own = (given?.kind === 'borrowed' ? given.color : void 0) ?? member.color;
    const colors = themeChoices(definition.color);
    const faces = themeChoices(definition.face);
    const { style, variant } = themeDefault(definition.style);
    return {
        shape: isFixed(definition.shape) ? definition.shape.fixed : member.shape,
        color: isFixed(definition.color) ? definition.color.fixed : colors.includes(own) ? own : colors[fnv1a32(`${seed}:color`) % colors.length],
        face: isFixed(definition.face) ? definition.face.fixed : member.face && faces.includes(member.face) ? member.face : themeDefault(definition.face),
        ...member.nose ? {
            nose: member.nose
        } : null,
        style,
        variant,
        state: themeDefault(definition.state)
    };
}
function requireDefinition(id) {
    const found = getTheme(id);
    if (found) return found;
    requireTheme('theme', id);
    const adopted = getTheme(id);
    if (!adopted) throw new Error(`Unknown theme "${id}"`);
    return adopted;
}
function listThemes() {
    adoptAll();
    return [
        ...definitions.values()
    ];
}
function themeLabel(kind, id) {
    for (const theme of sharedThemes()){
        const names = 'shape' === kind ? theme.labels.shapes : 'variant' === kind ? theme.labels.variants : theme.labels.colors;
        const label = names?.[id];
        if (label) return label;
    }
    return null;
}
const FACE_KIT = {
    circleRing: circleRing,
    ellipseRing: ellipseRing,
    starRing: starRing,
    sparkleRing: sparkleRing,
    dropRing: dropRing,
    heartRing: heartRing,
    arcPoints: geometry_arcPoints,
    quad: geometry_quad,
    ribbon: geometry_ribbon,
    place: geometry_place,
    dashes: dashes,
    ellipseBand: ellipseBand,
    lidBand: lidBand,
    roundedRectBand: roundedRectBand,
    convexBand: convexBand,
    meet: meet,
    bandRing: bandRing,
    vocabulary: vocabulary,
    readCuteEye: readCuteEye,
    looking: looking,
    LayerList: LayerList,
    fallingTear: fallingTear,
    shutness: shutness,
    clockOf: clockOf,
    unit: unit,
    smooth: smooth,
    pulse: reading_pulse,
    noise: reading_noise,
    STATE_CUTE_EYES: STATE_CUTE_EYES,
    STATE_CUTE_MOUTH: STATE_CUTE_MOUTH,
    CUTE_MOUTHS: CUTE_MOUTHS,
    CUTE_MOUTH_GLYPHS: CUTE_MOUTH_GLYPHS
};
const behaviours_rest = {
    tilt: 0,
    x: 0,
    y: 0,
    squash: 1
};
const behaviours_idle = ({ clock })=>({
        tilt: 1.5 * Math.sin(0.5 * clock) + 0.6 * Math.sin(0.17 * clock),
        x: Math.sin(0.27 * clock),
        y: 1.2 * Math.sin(0.85 * clock),
        squash: 1 + 0.007 * Math.sin(0.85 * clock)
    });
function createPulse(min, max) {
    let next = null;
    let last = 0;
    return (t, random)=>{
        next ??= min + random() * (max - min);
        if (t - last >= next) {
            last = t;
            next = min + random() * (max - min);
            return t;
        }
        return null;
    };
}
function keyframes(t, times, values) {
    if (t <= times[0]) return values[0];
    for(let i = 1; i < times.length; i++)if (t <= times[i]) {
        const span = times[i] - times[i - 1];
        const f = span > 0 ? (t - times[i - 1]) / span : 1;
        return values[i - 1] + (values[i] - values[i - 1]) * f;
    }
    return values[values.length - 1];
}
const SHAKE_TIMES = [
    0,
    0.16,
    0.32,
    0.48,
    0.64,
    0.8
];
const SHAKE_OFFSETS = [
    0,
    -9,
    8,
    -6,
    4,
    0
];
const BEHAVIOURS = {
    idle: behaviours_idle,
    sleeping: ({ clock })=>({
            tilt: 6 + 1.2 * Math.sin(0.34 * clock),
            x: 0,
            y: 2.6 * Math.sin(0.55 * clock),
            squash: 1 + 0.02 * Math.sin(0.55 * clock)
        }),
    drowsy: ({ clock })=>({
            tilt: 4 + 3 * Math.sin(0.4 * clock),
            x: 1.4 * Math.sin(0.22 * clock),
            y: 2 * Math.sin(0.5 * clock),
            squash: 1
        }),
    bored: ({ clock })=>({
            tilt: 4 * Math.sin(0.3 * clock),
            x: 3 * Math.sin(0.19 * clock),
            y: 2,
            squash: 0.99
        }),
    waking: ({ t, clock })=>({
            tilt: 2 * Math.sin(0.6 * clock) * Math.min(1, t),
            x: 0,
            y: Math.max(0, 4 - 4 * t),
            squash: 1
        }),
    'powering-down': ({ t })=>({
            tilt: Math.min(8, 4 * t),
            x: 0,
            y: Math.min(6, 3 * t),
            squash: Math.max(0.94, 1 - 0.03 * t)
        }),
    listening: ({ clock })=>({
            tilt: 8 + 1.2 * Math.sin(0.7 * clock),
            x: 0,
            y: +Math.sin(0.9 * clock),
            squash: 1
        }),
    thinking: ({ clock })=>({
            tilt: -9 + 2 * Math.sin(0.45 * clock),
            x: 1.6 * Math.sin(0.33 * clock),
            y: +Math.sin(0.6 * clock),
            squash: 1
        }),
    searching: ({ clock })=>({
            tilt: 3 * Math.sin(1.6 * clock),
            x: 4 * Math.sin(1.2 * clock),
            y: 1.4 * Math.sin(0.8 * clock),
            squash: 1
        }),
    reading: ({ clock })=>({
            tilt: 3,
            x: 3 * Math.sin(0.9 * clock),
            y: 1,
            squash: 1
        }),
    working: ({ clock })=>({
            tilt: -4 + 1.6 * Math.sin(2.4 * clock),
            x: 1.2 * Math.sin(1.9 * clock),
            y: 1.4 * Math.sin(3.1 * clock),
            squash: 1 + 0.012 * Math.sin(3.1 * clock)
        }),
    writing: ({ clock })=>({
            tilt: 2 + 1.5 * Math.sin(1.4 * clock),
            x: 2.4 * Math.sin(0.7 * clock),
            y: 1,
            squash: 1
        }),
    happy: ({ clock })=>({
            tilt: 3 * Math.sin(1.1 * clock),
            x: 1.5 * Math.sin(0.5 * clock),
            y: 2.2 * Math.sin(1.6 * clock),
            squash: 1 + 0.015 * Math.sin(1.6 * clock)
        }),
    excited: ({ clock })=>{
        const phase = 2.2 * clock % 1;
        const lift = Math.sin(phase * Math.PI);
        return {
            tilt: 2 * Math.sin(3 * clock),
            x: 0,
            y: 14 * -lift,
            squash: phase < 0.12 ? 0.92 : 1 + 0.05 * lift
        };
    },
    bouncing: ({ clock })=>{
        const phase = 1.5 * clock % 1;
        const lift = Math.abs(Math.sin(phase * Math.PI));
        return {
            tilt: 0,
            x: 0,
            y: 20 * -lift,
            squash: phase < 0.14 ? 0.9 : 1 + 0.06 * lift
        };
    },
    laughing: ({ clock })=>({
            tilt: 4 * Math.sin(6.4 * clock),
            x: 0,
            y: -5 * Math.abs(Math.sin(6.4 * clock)),
            squash: 1 + 0.03 * Math.sin(6.4 * clock)
        }),
    playful: ({ clock })=>({
            tilt: 9 * Math.sin(1.7 * clock),
            x: 6 * Math.sin(1.1 * clock),
            y: 3 * Math.sin(2.3 * clock),
            squash: 1
        }),
    proud: ({ clock })=>({
            tilt: 1.5 * Math.sin(0.5 * clock),
            x: 0,
            y: -4 + 0.8 * Math.sin(0.7 * clock),
            squash: 1.01
        }),
    celebrate: ({ clock })=>({
            tilt: 6 * Math.sin(2.8 * clock),
            x: 4 * Math.sin(1.9 * clock),
            y: 8 * -Math.abs(Math.sin(2.8 * clock)),
            squash: 1 + 0.02 * Math.sin(2.8 * clock)
        }),
    shy: ({ clock })=>({
            tilt: 7 + +Math.sin(0.6 * clock),
            x: -3,
            y: 4,
            squash: 0.985
        }),
    sad: ({ clock })=>({
            tilt: 5,
            x: 0,
            y: 5 + 1.2 * Math.sin(0.45 * clock),
            squash: 0.97
        }),
    confused: ({ clock })=>({
            tilt: 11 * Math.sin(0.8 * clock),
            x: 3 * Math.sin(0.55 * clock),
            y: 0,
            squash: 1
        }),
    suspicious: ({ clock })=>({
            tilt: -6,
            x: 2 * Math.sin(0.5 * clock),
            y: 0,
            squash: 1
        }),
    surprised: ({ t })=>({
            tilt: 0,
            x: 0,
            y: t < 0.3 ? -8 * (1 - t / 0.3) : 0,
            squash: t < 0.2 ? 1.06 : 1
        }),
    scared: ({ clock })=>({
            tilt: 1.6 * Math.sin(22 * clock),
            x: 1.4 * Math.sin(19 * clock),
            y: 2,
            squash: 0.98
        }),
    curious: ({ clock })=>({
            tilt: 4 + 1.5 * Math.sin(0.7 * clock),
            x: 2.5 * Math.sin(0.45 * clock),
            y: -1 + 0.8 * Math.sin(1.1 * clock),
            squash: 1.005
        }),
    refusing: ({ t, clock })=>({
            tilt: -2 + 0.6 * Math.sin(0.4 * clock),
            x: keyframes(t, SHAKE_TIMES, SHAKE_OFFSETS),
            y: 2,
            squash: 0.99
        }),
    spawning: ({ t })=>({
            tilt: 0,
            x: 0,
            y: t < 0.45 ? -20 * (1 - easeInOutCubic(Math.min(1, t / 0.45))) : 0,
            squash: t < 0.5 ? 0.9 + 0.1 * easeInOutCubic(Math.min(1, t / 0.5)) : 1
        }),
    composing: ({ clock })=>({
            tilt: 2 * Math.sin(1.3 * clock),
            x: 1.6 * Math.sin(0.9 * clock),
            y: +Math.sin(2.1 * clock),
            squash: 1
        }),
    notifying: ({ clock })=>({
            tilt: 2.5 * Math.sin(3.2 * clock),
            x: 0,
            y: 2 * Math.sin(3.2 * clock),
            squash: 1
        }),
    humming: ({ clock })=>{
        const sway = Math.sin(1.15 * clock);
        return {
            tilt: 6 * sway,
            x: 5 * sway,
            y: 2.2 * Math.cos(2.3 * clock),
            squash: 1 + 0.012 * Math.cos(2.3 * clock)
        };
    },
    dragging: ({ clock })=>{
        const period = 3.4;
        const p = clock % period / period;
        const direction = Math.floor(clock / period) % 2 === 0 ? 1 : -1;
        const lift = keyframes(p, DRAG_TIMES, DRAG_LIFT);
        const glide = easeInOutCubic(clamp((p - 0.22) / 0.4, 0, 1));
        const impact = p >= 0.62 && p < 0.78 ? Math.sin((p - 0.62) / 0.16 * Math.PI) : 0;
        return {
            tilt: direction * lift * 0.5,
            x: direction * (-14 + 28 * glide),
            y: -lift + 2 * impact,
            squash: 1 - 0.1 * impact + lift / 22 * 0.03
        };
    }
};
const DRAG_TIMES = [
    0,
    0.18,
    0.22,
    0.62,
    0.7,
    0.86,
    1
];
const DRAG_LIFT = [
    0,
    20,
    22,
    20,
    0,
    0,
    0
];
function createImpulseBehaviour(state) {
    switch(state){
        case 'angry':
            {
                const pulse = createPulse(1.8, 3.2);
                return ({ t, random, impulse })=>{
                    if (null !== pulse(t, random)) impulse(70);
                };
            }
        case 'listening':
            {
                const pulse = createPulse(1.8, 3.2);
                return ({ t, random, impulse })=>{
                    if (null !== pulse(t, random)) impulse(26);
                };
            }
        case 'alerting':
            {
                const pulse = createPulse(2.2, 2.2);
                return ({ t, random, impulse })=>{
                    if (null !== pulse(t, random)) impulse(48);
                };
            }
        case 'receiving':
            {
                const pulse = createPulse(1.7, 1.7);
                return ({ t, random, impulse })=>{
                    if (null !== pulse(t, random)) impulse(-18);
                };
            }
        default:
            return null;
    }
}
function behaviourFor(state) {
    return BEHAVIOURS[state] ?? angryOrDefault(state);
}
function angryOrDefault(state) {
    if ('angry' === state) return ({ clock })=>({
            tilt: -5 + 1.2 * Math.sin(14 * clock),
            x: 1.1 * Math.sin(16 * clock),
            y: 0,
            squash: 1
        });
    return ()=>behaviours_rest;
}
function spring(value = 0, omega = 6, zeta = 1) {
    return {
        value,
        velocity: 0,
        target: value,
        omega,
        zeta
    };
}
const SPRING_SUBSTEP = 1 / 120;
function stepSpring(s, dt) {
    let remaining = Math.min(dt, 0.1);
    while(remaining > 0){
        const h = Math.min(SPRING_SUBSTEP, remaining);
        remaining -= h;
        const accel = -s.omega * s.omega * (s.value - s.target) - 2 * s.zeta * s.omega * s.velocity;
        s.velocity += accel * h;
        s.value += s.velocity * h;
    }
    return s.value;
}
function settleSpring(s) {
    s.value = s.target;
    s.velocity = 0;
    return s.value;
}
function springSettleTime(omega, zeta) {
    const decay = zeta * omega;
    return decay <= 0 ? 1 : Math.min(6, Math.log(100) / decay);
}
function springPosition(t, omega, zeta) {
    if (zeta < 1) {
        const wd = omega * Math.sqrt(1 - zeta * zeta);
        return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + zeta * omega / wd * Math.sin(wd * t));
    }
    return 1 - Math.exp(-omega * t) * (1 + omega * t);
}
function springToLinearEasing(omega, zeta, samples = 24) {
    const duration = springSettleTime(omega, zeta);
    const stops = [];
    for(let i = 0; i <= samples; i++){
        const t = i / samples * duration;
        stops.push((Math.round(10000 * springPosition(t, omega, zeta)) / 10000).toString());
    }
    return `linear(${stops.join(', ')})`;
}
const HUD_KINDS = [
    'progress',
    'timer',
    'clock',
    'voice',
    'context',
    'balance',
    'gauge',
    'kpi',
    'notify',
    'sync'
];
const HUD_KIND_LABELS = {
    progress: {
        en: 'Progress',
        zh: '进度'
    },
    timer: {
        en: 'Timer',
        zh: '倒计时'
    },
    clock: {
        en: 'Clock',
        zh: '时钟'
    },
    voice: {
        en: 'Voice',
        zh: '语音'
    },
    context: {
        en: 'Context',
        zh: '上下文'
    },
    balance: {
        en: 'Balance',
        zh: '余额'
    },
    gauge: {
        en: 'Gauge',
        zh: '仪表'
    },
    kpi: {
        en: 'KPI',
        zh: '指标'
    },
    notify: {
        en: 'Notifications',
        zh: '通知'
    },
    sync: {
        en: 'Sync',
        zh: '同步'
    }
};
const isHudKind = (value)=>'string' == typeof value && HUD_KINDS.includes(value);
const spec_num = (v)=>'number' == typeof v && Number.isFinite(v);
const optionalNum = (v)=>void 0 === v || spec_num(v);
const optionalBool = (v)=>void 0 === v || 'boolean' == typeof v;
function isHudSpec(value) {
    if (!value || 'object' != typeof value || Array.isArray(value)) return false;
    const spec = value;
    if (!isHudKind(spec.kind)) return false;
    switch(spec.kind){
        case 'progress':
            return spec_num(spec.value);
        case 'timer':
            return spec_num(spec.remainingMs) && spec_num(spec.totalMs);
        case 'clock':
            return optionalNum(spec.date);
        case 'voice':
            return spec_num(spec.level) && optionalNum(spec.bands) && (void 0 === spec.mode || 'listening' === spec.mode || 'speaking' === spec.mode);
        case 'context':
            return spec_num(spec.used) && spec_num(spec.total);
        case 'balance':
            return spec_num(spec.value) && optionalBool(spec.low) && (void 0 === spec.unit || 'string' == typeof spec.unit);
        case 'gauge':
            return spec_num(spec.value) && spec_num(spec.max);
        case 'kpi':
            return spec_num(spec.value) && optionalNum(spec.delta) && (void 0 === spec.series || Array.isArray(spec.series) && spec.series.every(spec_num));
        case 'notify':
            return spec_num(spec.count);
        case 'sync':
            return 'idle' === spec.state || 'syncing' === spec.state || 'done' === spec.state || 'error' === spec.state;
    }
}
const particle_frames_NONE = Object.freeze([]);
function particleFrames(list) {
    if (0 === list.length) return particle_frames_NONE;
    return list.map((p)=>({
            x: p.x,
            y: p.y,
            size: particleSize(p),
            rotation: p.rotation,
            kind: p.kind,
            color: p.color,
            opacity: particleOpacity(p)
        }));
}
function trailFrames(list) {
    if (0 === list.length) return particle_frames_NONE;
    const frames = [];
    for (const t of list)if (!(t.points.length < 2) && !(t.size < 0.5)) frames.push({
        hue: t.hue,
        size: t.size,
        opacity: t.opacity,
        points: t.points
    });
    return frames.length > 0 ? frames : particle_frames_NONE;
}
class Ticker {
    handlers = new Set();
    frame = null;
    last = 0;
    add(handler) {
        this.handlers.add(handler);
        this.start();
        return ()=>this.remove(handler);
    }
    remove(handler) {
        this.handlers.delete(handler);
        if (0 === this.handlers.size) this.stop();
    }
    start() {
        if (null != this.frame || "u" < typeof requestAnimationFrame) return;
        this.last = performance.now();
        this.frame = requestAnimationFrame(this.loop);
    }
    stop() {
        if (null == this.frame) return;
        cancelAnimationFrame(this.frame);
        this.frame = null;
    }
    loop = (now)=>{
        this.frame = requestAnimationFrame(this.loop);
        const dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        for (const handler of this.handlers)handler(dt, now);
    };
    get size() {
        return this.handlers.size;
    }
}
const ticker = new Ticker();
let reducedMotionQuery = null;
function prefersReducedMotion() {
    if ("u" < typeof window || 'function' != typeof window.matchMedia) return false;
    reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)');
    return reducedMotionQuery.matches;
}
function onReducedMotionChange(handler) {
    if ("u" < typeof window || 'function' != typeof window.matchMedia) return ()=>{};
    reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e)=>handler(e.matches);
    reducedMotionQuery.addEventListener('change', listener);
    return ()=>reducedMotionQuery?.removeEventListener('change', listener);
}
const SPIN_VELOCITY = 11;
const SPIN_DECAY = 2.2;
function createConfettiController(svg, options = {}) {
    const particles = createParticleSystem({
        radius: options.radius,
        sizeScale: options.sizeScale
    });
    const sizeScale = options.sizeScale ?? 1;
    const colors = options.colors;
    const layer = createSvgElement('g');
    layer.setAttribute('aria-hidden', 'true');
    const trailsBack = createSvgElement('g');
    const paper = createSvgElement('g');
    const trailsFront = createSvgElement('g');
    layer.append(trailsBack, paper, trailsFront);
    svg.appendChild(layer);
    let unsubscribe = null;
    let spinVelocity = 0;
    let sustained = false;
    let destroyed = false;
    function start() {
        if (unsubscribe || destroyed) return;
        unsubscribe = ticker.add((dt)=>frame(dt));
    }
    function stop() {
        unsubscribe?.();
        unsubscribe = null;
    }
    function frame(dt) {
        if (spinVelocity > 0) {
            spinVelocity *= Math.exp(-SPIN_DECAY * dt);
            if (spinVelocity < SPIN_REST) spinVelocity = 0;
        }
        particles.update(dt, {
            spinVelocity,
            sizeScale,
            wide: false,
            sustain: sustained
        });
        paint();
        if (!particles.active && 0 === spinVelocity && !sustained) stop();
    }
    function paint() {
        const paperFrames = particleFrames(particles.particles);
        const comets = trailFrames(particles.trails);
        syncChildren(paper, paperNodes(recolor(paperFrames)));
        syncChildren(trailsBack, trailNodes(comets, 'back', sizeScale));
        syncChildren(trailsFront, trailNodes(comets, 'front', sizeScale));
    }
    function recolor(frames) {
        if (!colors || 0 === colors.length) return frames;
        return frames.map((p, i)=>({
                ...p,
                color: colors[i % colors.length]
            }));
    }
    return {
        burst (count = 16) {
            if (destroyed) return;
            particles.burst(count);
            start();
        },
        spin () {
            if (destroyed) return;
            spinVelocity = SPIN_VELOCITY;
            start();
        },
        setSustained (on) {
            if (destroyed) return;
            sustained = on;
            if (on) start();
        },
        clear () {
            particles.clear();
            spinVelocity = 0;
            paint();
            if (!sustained) stop();
        },
        destroy () {
            destroyed = true;
            sustained = false;
            stop();
            particles.clear();
            layer.remove();
        }
    };
}
function makeSprings(face, state) {
    return {
        tilt: spring(0, 5, 0.9),
        x: spring(0, 3.5, 1),
        y: spring(0, 4, 1),
        squash: spring(1, 10, 0.8),
        blink: spring(1, 26, 1),
        eyeScale: spring(1, 9, 0.85),
        gazeX: spring(0, 13, 1),
        gazeY: spring(0, 13, 1),
        eyeMorph: spring(1, 8, 1),
        mouthMorph: spring(1, 8, 1),
        lineBlend: spring('line' === face ? 1 : 0, 10, 1),
        cuteBlend: spring(isCuteFamily(face) ? 1 : 0, 10, 1),
        blush: spring(isCuteFamily(face) ? STATE_BLUSH[state] : 0, 8, 1),
        fx: spring(1, 7, 1),
        featureFade: spring(1, 12, 1),
        faceFade: spring(1, 10, 1),
        spin: spring(0, 6.2, 1),
        beltBlend: spring(0, 14, 1),
        beltFade: spring(1, 11, 1),
        hudBlend: spring(0, 12, 1),
        badge: spring(0, 9, 0.55),
        partsFade: spring(1, 12, 1)
    };
}
const TALK_AMPLITUDE = 0.34;
const TALK_AMPLITUDE_CUTE = 0.6;
const REST_TARGETS = {
    tilt: 0,
    x: 0,
    y: 0,
    squash: 1
};
const EMPTY = Object.freeze([]);
function createSimulation(options = {}) {
    let opts = {
        pose: options.pose,
        poseHome: options.poseHome,
        faceTune: options.faceTune,
        gazeTarget: options.gazeTarget,
        ink: options.ink,
        eyeScale: options.eyeScale,
        lineWeight: options.lineWeight,
        hud: options.hud,
        onSettle: options.onSettle,
        reducedMotion: options.reducedMotion,
        nose: options.nose,
        shape: options.shape ?? DEFAULT_SHAPE,
        state: options.state ?? "idle",
        variant: options.variant ?? 'solid',
        face: options.face ?? DEFAULT_FACE,
        emphasis: options.emphasis ?? false,
        badgeColor: options.badgeColor ?? null,
        seed: options.seed ?? 'aora',
        entryEffects: options.entryEffects ?? true,
        antics: options.antics ?? false
    };
    const reduced = opts.reducedMotion ?? false;
    const stillOptions = options.still ? true === options.still ? {} : options.still : null;
    const still = null !== stillOptions;
    const compensateEyes = options.compensateEyes ?? true;
    const seedHash = fnv1a32(opts.seed);
    const random = mulberry32(seedHash);
    const pending = [];
    const ownScheduler = {
        later (fn, ms) {
            pending.push({
                at: clock + ms / 1000,
                fn
            });
        },
        cancelAll () {
            pending.length = 0;
        }
    };
    const scheduler = options.scheduler ?? ownScheduler;
    const springs = makeSprings(opts.face, opts.state);
    let shapeDef = getShape(opts.shape);
    let particles = createParticleSystem({
        radius: shapeDef.beltRadius,
        random
    });
    let previousParts = EMPTY;
    let restParts = null;
    let clock = 0;
    let stateClock = 0;
    let behaviour = behaviourFor(opts.state);
    let impulseBehaviour = createImpulseBehaviour(opts.state);
    let topologyIndex = 0;
    let fromEyes = isCuteFamily(opts.face) ? CUTE_EYE_TOPOLOGIES.dot : EYE_TOPOLOGIES.neutral;
    let toEyes = currentTopology();
    if (still) fromEyes = toEyes;
    let design = isDrawnFace(opts.face) ? getFaceDesign(opts.face) : null;
    let toDrawn = currentDrawn();
    let fromDrawn = design && !still ? drawnPairFor(design, 'dot') : toDrawn;
    let previousDrawn = null;
    let nextSwitch = scheduleSwitch();
    let nextBlink = scheduleBlink();
    let nextGaze = still ? 1 / 0 : 0;
    let driftGazeX = 0;
    let driftGazeY = 0;
    let fromMouth = mouthFor(opts.state);
    let toMouth = fromMouth;
    let noseId = void 0 === opts.nose ? autoNoseForKey(opts.seed) : opts.nose;
    let baseFaceTune = {
        ...DEFAULT_FACE_TUNE,
        ...options.faceTune
    };
    let activeFaceTune = faceTuneForState(opts.state, baseFaceTune);
    const renderedFaceTune = {
        ...activeFaceTune
    };
    let pose = {
        ...DEFAULT_POSE,
        ...options.pose
    };
    let poseHome = {
        ...DEFAULT_POSE_HOME,
        ...options.poseHome
    };
    let beltKind = beltForState(opts.state);
    let beltClock = still ? stillOptions?.beltTime ?? 0 : 0;
    let previousBelt = null;
    let previousBeltClock = 0;
    let hudSpec = options.hud ?? null;
    let hudClock = 0;
    let fittedEyeRadius = 0;
    let spinTarget = 0;
    let bounceUntil = 0;
    let bounceStart = 0;
    let bounceStrength = 1;
    let wideTrails = false;
    let nextAntic = scheduleAntic();
    function currentTopology() {
        const cute = isCuteFamily(opts.face);
        const pinned = still ? stillOptions?.expression : void 0;
        if (pinned) return eyePairFor(cute, pinned);
        const table = cute ? STATE_CUTE_EYES : STATE_EYE_TOPOLOGIES;
        const list = table[opts.state] ?? [
            'neutral'
        ];
        return eyePairFor(cute, list[topologyIndex % list.length] ?? 'neutral');
    }
    function currentDrawn() {
        if (!design) return null;
        const pinned = still ? stillOptions?.expression : void 0;
        return pinned ? drawnPairFor(design, pinned) : drawnPairForState(design, opts.state, topologyIndex);
    }
    function mouthFor(state) {
        const cute = isCuteFamily(opts.face);
        const pinned = still ? stillOptions?.mouth : void 0;
        if (design) return drawnMouthFor(design, state, pinned);
        const spec = pinned ? mouthSpecFor(cute, pinned) : void 0;
        if (spec) return spec;
        return cute ? getCuteMouth(STATE_CUTE_MOUTH[state]) : getMouth(mouthForState(state));
    }
    function blendedDrawn() {
        if (!fromDrawn || !toDrawn) return toDrawn;
        const t = reduced ? 1 : easeOutCubic(clamp(springs.eyeMorph.value, 0, 1));
        return morphDrawnPair(fromDrawn, toDrawn, t);
    }
    function retargetEyes() {
        fromEyes = blendedEyes();
        toEyes = currentTopology();
        fromDrawn = blendedDrawn();
        toDrawn = currentDrawn();
        springs.eyeMorph.value = 0;
        springs.eyeMorph.target = 1;
    }
    function scheduleSwitch() {
        if (still) return 1 / 0;
        const range = STATE_EYE_SWITCH_MS[opts.state];
        if (!range) return 1 / 0;
        return stateClock + (range[0] + random() * (range[1] - range[0])) / 1000;
    }
    function scheduleBlink() {
        if (still) return 1 / 0;
        const range = STATE_BLINK_MS[opts.state];
        if (!range) return 1 / 0;
        return clock + (range[0] + random() * (range[1] - range[0])) / 1000;
    }
    function scheduleAntic() {
        if (still || !opts.antics || !ANTIC_STATES.includes(opts.state)) return 1 / 0;
        return clock + 20 + 25 * random();
    }
    function startBounce(strength) {
        bounceStart = clock;
        bounceUntil = clock + 1.33;
        bounceStrength = strength;
    }
    function playEntryEffect(state) {
        if (!opts.entryEffects || reduced || still) return;
        const effect = STATE_ENTRY_EFFECTS[state];
        if (!effect) return;
        if (effect.spin) spinTarget += effect.spin;
        if (effect.burst) particles.burst(effect.burst);
        if (effect.bounce) startBounce(0.5);
    }
    function enterState(next) {
        opts = {
            ...opts,
            state: next
        };
        stateClock = 0;
        topologyIndex = 0;
        behaviour = behaviourFor(next);
        impulseBehaviour = createImpulseBehaviour(next);
        retargetEyes();
        activeFaceTune = faceTuneForState(next, baseFaceTune);
        nextSwitch = scheduleSwitch();
        nextBlink = scheduleBlink();
        fromMouth = blendedMouth();
        toMouth = mouthFor(next);
        springs.mouthMorph.value = 0;
        springs.mouthMorph.target = 1;
        springs.fx.value = 0;
        const nextBelt = beltForState(next);
        if (nextBelt !== beltKind) {
            if (beltKind && nextBelt) {
                previousBelt = beltKind;
                previousBeltClock = beltClock;
                springs.beltFade.value = 0;
                springs.beltFade.target = 1;
            } else {
                previousBelt = null;
                springs.beltFade.value = 1;
                springs.beltFade.target = 1;
            }
            beltKind = nextBelt;
            beltClock = 0;
        }
        playEntryEffect(next);
        nextAntic = scheduleAntic();
    }
    function runDue() {
        if (0 === pending.length) return;
        for(let i = 0; i < pending.length;){
            const item = pending[i];
            if (item.at <= clock) {
                pending.splice(i, 1);
                item.fn();
                i = 0;
            } else i++;
        }
    }
    function step(dt) {
        clock += dt;
        stateClock += dt;
        if (beltKind) beltClock += dt;
        if (previousBelt) previousBeltClock += dt;
        if (hudSpec) hudClock += dt;
        if (!options.scheduler) runDue();
        const settle = still ? null : settleForState(opts.state);
        if (settle && (reduced || 1000 * stateClock >= settle.afterMs)) {
            const from = opts.state;
            enterState(settle.to);
            opts.onSettle?.(from, settle.to);
        }
        if (stateClock >= nextSwitch) {
            topologyIndex++;
            retargetEyes();
            nextSwitch = scheduleSwitch();
        }
        if (clock >= nextBlink) {
            nextBlink = scheduleBlink();
            blinkSequence();
            if (random() < 0.14) scheduler.later(blinkSequence, 190);
        }
        if (clock >= nextAntic) {
            nextAntic = scheduleAntic();
            if (random() < 0.6) startBounce(0.4);
            else spinTarget += 1;
        }
        const follow = still ? null : opts.gazeTarget ?? options.followGaze?.(clock) ?? null;
        const gaze = gazeForState(opts.state);
        if (clock >= nextGaze) {
            const damping = follow ? 0.2 : 1;
            driftGazeX = (2 * random() - 1) * gaze.x * damping;
            driftGazeY = (2 * random() - 1) * gaze.y * damping;
            nextGaze = clock + (gaze.every[0] + random() * (gaze.every[1] - gaze.every[0])) / 1000;
        }
        springs.gazeX.target = driftGazeX + (follow ? 22 * clamp(follow.x, -0.6, 0.6) : 0);
        springs.gazeY.target = driftGazeY + (follow ? 14 * clamp(follow.y, -0.6, 0.6) : 0);
        let targets = REST_TARGETS;
        if (!still) {
            targets = behaviour({
                t: stateClock,
                clock,
                random,
                impulse: (v)=>{
                    springs.y.velocity += v;
                }
            });
            impulseBehaviour?.({
                t: stateClock,
                clock,
                random,
                impulse: (v)=>{
                    springs.y.velocity += v;
                }
            });
        }
        springs.tilt.target = targets.tilt;
        springs.x.target = targets.x;
        springs.squash.target = targets.squash;
        springs.y.target = targets.y + bounceOffset();
        springs.eyeScale.target = opts.emphasis ? 1.32 : 1;
        const cuteFamily = isCuteFamily(opts.face);
        springs.beltBlend.target = hudSpec || cuteFamily ? 0 : beltKind ? 1 : 0;
        springs.beltFade.target = 1;
        springs.hudBlend.target = hudSpec ? 1 : 0;
        springs.badge.target = 'notifying' === opts.state ? 1 : 0;
        springs.spin.target = spinTarget;
        springs.lineBlend.target = 'line' === opts.face ? 1 : 0;
        springs.cuteBlend.target = cuteFamily ? 1 : 0;
        springs.blush.target = cuteFamily ? STATE_BLUSH[opts.state] : 0;
        springs.fx.target = 1;
        springs.mouthMorph.target = 1;
        springs.featureFade.target = 1;
        springs.faceFade.target = 1;
        if (reduced) for (const s of Object.values(springs))settleSpring(s);
        else for (const s of Object.values(springs))stepSpring(s, dt);
        for (const key of Object.keys(activeFaceTune))renderedFaceTune[key] = reduced ? activeFaceTune[key] : frameLerp(renderedFaceTune[key], activeFaceTune[key], 0.13, dt);
        if (!reduced) particles.update(dt, {
            spinVelocity: springs.spin.velocity * Math.PI * 2,
            sizeScale: 1,
            wide: wideTrails,
            sustain: false
        });
        if (previousBelt && clamp(springs.beltFade.value, 0, 1) >= 0.999) previousBelt = null;
        if (previousDrawn && clamp(springs.faceFade.value, 0, 1) >= 0.999) previousDrawn = null;
    }
    function blinkSequence() {
        springs.blink.value = 1;
        springs.blink.target = 0.05;
        scheduler.later(()=>{
            springs.blink.target = 1.08;
            scheduler.later(()=>{
                springs.blink.target = 1;
            }, 150);
        }, 70);
    }
    function bounceOffset() {
        if (still || clock >= bounceUntil) return 0;
        const heights = [
            48,
            28,
            14,
            6
        ];
        const durations = [
            0.5,
            0.382,
            0.27,
            0.177
        ];
        let t = clock - bounceStart;
        for(let i = 0; i < heights.length; i++){
            const d = durations[i];
            if (t < d) {
                const p = t / d;
                return -heights[i] * bounceStrength * 4 * p * (1 - p);
            }
            t -= d;
        }
        return 0;
    }
    const staticEyeScale = ()=>{
        const v = opts.eyeScale;
        return null != v && Number.isFinite(v) ? clamp(v, 0.5, 2) : 1;
    };
    const shapeEyeScale = ()=>compensateEyes ? getEyeScaleForShape(opts.shape) : 1;
    function eyeRadius() {
        if (fittedEyeRadius > 0) return fittedEyeRadius;
        fittedEyeRadius = computeFaceGeometry({
            shape: shapeDef,
            eyes: EYE_TOPOLOGIES.neutral,
            faceTune: renderedFaceTune,
            pose,
            poseHome,
            eyeScale: shapeEyeScale() * staticEyeScale()
        }).eyeRadius;
        return fittedEyeRadius;
    }
    function blendedEyes() {
        const t = reduced ? 1 : easeOutCubic(clamp(springs.eyeMorph.value, 0, 1));
        return morphEyePair(fromEyes, toEyes, t);
    }
    function blendedMouth() {
        const t = reduced ? 1 : easeOutCubic(clamp(springs.mouthMorph.value, 0, 1));
        return morphMouth(fromMouth, toMouth, t);
    }
    function currentMouth() {
        const m = blendedMouth();
        if (reduced || still || !STATE_MOUTH_TALK.includes(opts.state)) return m;
        const pulse = 0.5 + 0.5 * Math.sin(clock * Math.PI * 6.2) * Math.sin(clock * Math.PI * 1.8 + 1);
        const amplitude = isCuteFamily(opts.face) ? TALK_AMPLITUDE_CUTE : TALK_AMPLITUDE;
        return {
            ...m,
            open: m.open + amplitude * pulse
        };
    }
    function currentBeltFrame() {
        if (!beltKind) return null;
        const to = evaluateBelt(beltKind, beltClock);
        if (!previousBelt) return to;
        const k = clamp(springs.beltFade.value, 0, 1);
        return blendBeltFrames(evaluateBelt(previousBelt, previousBeltClock), to, k);
    }
    function beltCoreSize() {
        const target = beltKind ? BELT_CORE_SIZE[beltKind] : 26;
        if (!previousBelt) return target;
        const from = BELT_CORE_SIZE[previousBelt];
        return from + (target - from) * clamp(springs.beltFade.value, 0, 1);
    }
    function displayedSize() {
        const size = options.displaySizePx;
        return 'function' == typeof size ? size() : size ?? 0;
    }
    function snapshot() {
        const blend = clamp(springs.beltBlend.value, 0, 1);
        const beltFrame = currentBeltFrame();
        const outline = blend > 0.001 ? beltBodyRing(shapeDef.ring, shapeDef.radius, blend, beltCoreSize()) : shapeDef.outline;
        const tilt = springs.tilt.value * shapeDef.tiltScale;
        const cute = clamp(springs.cuteBlend.value, 0, 1);
        const share = beltFrame && beltKind ? blend + (1 - blend) * cute * (BELT_BODY_SHARE[beltKind] ?? 0) : 0;
        const coreScale = beltFrame ? 1 + (beltFrame.coreScale - 1) * share : 1;
        const hudFade = clamp(springs.hudBlend.value, 0, 1);
        const face = faceFrame(blend, hudFade);
        return {
            state: opts.state,
            shape: opts.shape,
            shapeScale: getShapeScale(opts.shape),
            time: clock,
            settled: reduced || still,
            variant: opts.variant,
            ink: opts.ink ?? null,
            body: {
                outline,
                radius: shapeDef.radius,
                x: springs.x.value + (beltFrame ? beltFrame.coreX * share : 0),
                y: springs.y.value + (beltFrame ? beltFrame.coreY * share : 0),
                rotation: tilt,
                scaleX: coreScale,
                scaleY: springs.squash.value * coreScale,
                coreOpacity: bodyOpacity(beltFrame, blend, cute),
                parts: partFrames(blend)
            },
            face,
            belt: beltFrame && blend >= 0.01 ? beltSnapshot(beltFrame, blend) : null,
            fx: fxFrame(face, blend, hudFade),
            hud: hudSnapshot(hudFade),
            badge: badgeFrame(),
            particles: particleFrames(particles.particles),
            trails: trailFrames(particles.trails)
        };
    }
    function partFrames(blend) {
        const fade = clamp(springs.partsFade.value, 0, 1);
        const present = clamp(1 - blend / 0.5, 0, 1);
        const crossing = fade < 0.999 && previousParts.length > 0;
        if (present >= 0.999 && !crossing) {
            restParts ??= shapeDef.parts.map((part)=>({
                    ...part,
                    opacity: 1
                }));
            return restParts;
        }
        if (present <= 0.001) return EMPTY;
        const frames = [];
        if (crossing) for (const part of previousParts)frames.push({
            ...part,
            opacity: (1 - fade) * present
        });
        for (const part of shapeDef.parts)frames.push({
            ...part,
            opacity: fade * present
        });
        return frames;
    }
    function bodyOpacity(beltFrame, blend, cute) {
        if (!beltFrame) return null;
        if (cute < 0.005) return beltFrame.coreOpacity;
        const dim = 1 + (beltFrame.coreOpacity - 1) * clamp(springs.fx.value, 0, 1);
        return dim < 0.999 ? dim : blend > 0.001 ? beltFrame.coreOpacity : null;
    }
    function faceFrame(blend, hudFade) {
        const eyeVisible = blend < 0.35 && hudFade < 0.98;
        const opacity = (eyeVisible ? 1 - blend / 0.35 : 0) * (1 - hudFade);
        const lineBlend = clamp(springs.lineBlend.value, 0, 1);
        const cute = clamp(springs.cuteBlend.value, 0, 1);
        const frame = {
            style: opts.face,
            opacity,
            geometry: null,
            lineBlend,
            featureFade: clamp(springs.featureFade.value, 0, 1),
            features: false,
            cute,
            blush: clamp(springs.blush.value, 0, 1) * cute
        };
        if (opacity <= 0.01) return frame;
        const features = lineBlend > 0.005;
        frame.features = features;
        frame.geometry = computeFaceGeometry({
            shape: shapeDef,
            eyes: blendedEyes(),
            faceTune: renderedFaceTune,
            pose,
            poseHome,
            eyeScale: springs.eyeScale.value * shapeEyeScale() * staticEyeScale(),
            blink: clamp(springs.blink.value, 0.05, 1.2),
            gazeX: springs.gazeX.value,
            gazeY: springs.gazeY.value,
            face: features ? 'line' : cute > 0.005 ? 'cute' : 'eyes',
            lineBlend,
            cuteBlend: cute,
            mouth: features || cute > 0.005 ? currentMouth() : void 0,
            nose: features ? noseId : null,
            lineWeight: resolveLineWeight(opts.lineWeight),
            drawn: cute > 0.005 ? drawnInput() : void 0
        });
        const yaw = springs.spin.value % 1 * Math.PI * 2;
        if (Math.cos(yaw) < 1 - 1e-6) frame.geometry = turnFace(frame.geometry, shapeDef, yaw);
        return frame;
    }
    function drawnInput() {
        const fade = clamp(springs.faceFade.value, 0, 1);
        const entries = [];
        if (previousDrawn) entries.push({
            ...previousDrawn,
            weight: 1 - fade
        });
        const eyes = blendedDrawn();
        if (design && eyes) entries.push({
            design,
            eyes,
            weight: fade
        });
        if (0 === entries.length) return;
        return {
            entries,
            time: stateClock,
            settled: reduced || still,
            weight: resolveLineWeight(opts.lineWeight) / LINE_WEIGHT
        };
    }
    function fxFrame(face, blend, hudFade) {
        const kind = STATE_FX[opts.state];
        if (!kind || face.cute < 0.005 || design?.quietFx.includes(kind)) return null;
        let anchor;
        const drawn = face.geometry?.drawn;
        const drawnLeft = drawn?.[drawn.length - 1]?.left.layers[0]?.rings[0];
        const left = drawnLeft ?? face.geometry?.left.points;
        if ('tear' === kind) {
            if (!left || 0 === left.length) return null;
            const xs = left.map((p)=>p[0]);
            const ys = left.map((p)=>p[1]);
            const lo = Math.min(...xs);
            const hi = Math.max(...xs);
            anchor = {
                x: (lo + hi) / 2,
                y: (Math.min(...ys) + Math.max(...ys)) / 2,
                r: (hi - lo) / 2
            };
        }
        const frame = evaluateFx(kind, stateClock, {
            settled: reduced || still,
            ring: shapeDef.beltRadius + 14,
            anchor
        });
        const fade = clamp(springs.fx.value, 0, 1) * face.cute * (1 - blend) * (1 - hudFade);
        if (0 === frame.items.length || fade < 0.01) return null;
        const extras = 'scene' === frame.space ? themeExtras() : null;
        const placed = extras ? extras.placeFx(shapeDef, kind, getShapeScale(opts.shape)) : null;
        return {
            ...frame,
            items: frame.items.map((item)=>placed ? placed(item, item.opacity * fade) : {
                    ...item,
                    opacity: item.opacity * fade
                })
        };
    }
    function beltSnapshot(frame, blend) {
        return {
            blend,
            dots: frame.dots,
            rings: frame.rings.map((ring)=>{
                const { dash, ...rest } = ring;
                if (!dash) return rest;
                const [on, period] = dash.split(' ').map(Number);
                return {
                    ...rest,
                    dash: {
                        on,
                        period
                    }
                };
            }),
            glyphs: frame.glyphs ?? EMPTY
        };
    }
    function hudSnapshot(fade) {
        if (!hudSpec || fade < 0.01) return {
            opacity: fade,
            primitives: null,
            strokeWidth: 0
        };
        const lineWeight = resolveLineWeight(opts.lineWeight);
        const shown = displayedSize();
        return {
            opacity: fade,
            strokeWidth: Math.max(0.6, lineWeight * eyeRadius()),
            primitives: evaluateHudPrimitives(hudSpec, 1000 * hudClock, {
                radius: shapeDef.radius,
                eyeRadius: eyeRadius(),
                lineWeight,
                reducedMotion: reduced,
                print: shown < 1 || shown >= HUD_PRINT_MIN_PX
            })
        };
    }
    function badgeFrame() {
        const v = springs.badge.value;
        if (v < 0.01 || !opts.badgeColor) return null;
        return {
            color: opts.badgeColor,
            x: CENTER + 0.62 * shapeDef.radius,
            y: CENTER - 0.62 * shapeDef.radius,
            r: 18 * easeOutQuart(clamp(v, 0, 1))
        };
    }
    return {
        get state () {
            return opts.state;
        },
        get clock () {
            return clock;
        },
        step,
        update (next) {
            const prevState = opts.state;
            const prevShape = opts.shape;
            const prevFace = opts.face;
            const { shape: nextShape, ...rest } = next;
            opts = {
                ...opts,
                ...withoutUndefined(rest),
                shape: nextShape ?? prevShape
            };
            if (opts.face !== prevFace) {
                const leaving = blendedDrawn();
                previousDrawn = design && leaving ? {
                    design,
                    eyes: leaving
                } : null;
                design = isDrawnFace(opts.face) ? getFaceDesign(opts.face) : null;
                if (previousDrawn || design) {
                    springs.faceFade.value = 0;
                    springs.faceFade.target = 1;
                }
                fromEyes = blendedEyes();
                toEyes = currentTopology();
                toDrawn = currentDrawn();
                fromDrawn = toDrawn;
                springs.eyeMorph.value = 0;
                springs.eyeMorph.target = 1;
                fromMouth = blendedMouth();
                toMouth = mouthFor(opts.state);
                springs.mouthMorph.value = 0;
                springs.mouthMorph.target = 1;
            }
            if (nextShape && opts.shape !== prevShape) {
                previousParts = shapeDef.parts;
                shapeDef = getShape(opts.shape);
                restParts = null;
                springs.partsFade.value = 0;
                springs.partsFade.target = 1;
                particles = createParticleSystem({
                    radius: shapeDef.beltRadius,
                    random
                });
                fittedEyeRadius = 0;
            }
            if (next.faceTune || void 0 !== next.eyeScale) fittedEyeRadius = 0;
            if (next.state && next.state !== prevState) enterState(next.state);
            if (void 0 !== next.hud) {
                hudSpec = next.hud;
                if (hudSpec) hudClock = 0;
            }
            if (void 0 !== next.antics) nextAntic = scheduleAntic();
            if (void 0 !== next.nose) {
                const resolved = null === next.nose ? null : next.nose;
                if (resolved !== noseId) {
                    noseId = resolved;
                    springs.featureFade.value = 0;
                    springs.featureFade.target = 1;
                }
            }
            if (next.faceTune) {
                baseFaceTune = {
                    ...DEFAULT_FACE_TUNE,
                    ...next.faceTune
                };
                activeFaceTune = faceTuneForState(opts.state, baseFaceTune);
            }
            if (next.pose) pose = {
                ...pose,
                ...next.pose
            };
            if (next.poseHome) poseHome = {
                ...DEFAULT_POSE_HOME,
                ...next.poseHome
            };
        },
        spin (turns = 1) {
            spinTarget += turns;
            wideTrails = Math.abs(turns) > 1;
        },
        bounce (strength = 1) {
            startBounce(strength);
        },
        burst (count = 16) {
            if (reduced) return;
            particles.burst(count);
        },
        settle () {
            step(0);
            for (const s of Object.values(springs))settleSpring(s);
            for (const key of Object.keys(activeFaceTune))renderedFaceTune[key] = activeFaceTune[key];
            step(0);
        },
        hold () {
            scheduler.cancelAll();
            springs.blink.target = 1;
        },
        snapshot,
        dispose () {
            scheduler.cancelAll();
            particles.clear();
        }
    };
}
function withoutUndefined(obj) {
    const out = {};
    for (const key of Object.keys(obj))if (void 0 !== obj[key]) out[key] = obj[key];
    return out;
}
const EMOTION_SEGMENTS = [
    {
        id: 'lifecycle',
        range: [
            0,
            9
        ],
        name: {
            en: 'Lifecycle',
            zh: '生命周期'
        }
    },
    {
        id: 'feeling',
        range: [
            10,
            29
        ],
        name: {
            en: 'Feeling',
            zh: '情绪'
        }
    },
    {
        id: 'agent',
        range: [
            30,
            49
        ],
        name: {
            en: 'Agent work',
            zh: '代理工作'
        }
    },
    {
        id: 'signalling',
        range: [
            50,
            59
        ],
        name: {
            en: 'Signalling',
            zh: '提示'
        }
    }
];
const protocol_defs = [
    {
        id: '00',
        state: 'sleeping',
        name: {
            en: 'Sleeping',
            zh: '睡眠'
        }
    },
    {
        id: '01',
        state: 'waking',
        name: {
            en: 'Waking',
            zh: '唤醒'
        },
        oneshot: true
    },
    {
        id: '02',
        state: 'idle',
        name: {
            en: 'Idle',
            zh: '待机'
        }
    },
    {
        id: '03',
        state: 'curious',
        name: {
            en: 'Curious',
            zh: '好奇'
        }
    },
    {
        id: '04',
        state: 'bored',
        name: {
            en: 'Spacing out',
            zh: '发呆'
        }
    },
    {
        id: '05',
        state: 'loading',
        name: {
            en: 'Booting',
            zh: '加载苏醒'
        }
    },
    {
        id: '06',
        state: 'drowsy',
        name: {
            en: 'Dormant',
            zh: '休眠'
        }
    },
    {
        id: '07',
        state: 'waking',
        name: {
            en: 'Shake awake',
            zh: '抖动唤醒'
        },
        oneshot: true
    },
    {
        id: '08',
        state: 'spawning',
        name: {
            en: 'Spawning',
            zh: '登场'
        },
        oneshot: true
    },
    {
        id: '09',
        state: 'dragging',
        name: {
            en: 'Dragging',
            zh: '拖拽'
        }
    },
    {
        id: '10',
        state: 'happy',
        name: {
            en: 'Happy',
            zh: '开心'
        }
    },
    {
        id: '11',
        state: 'confused',
        name: {
            en: 'Puzzled',
            zh: '疑惑'
        }
    },
    {
        id: '12',
        state: 'sad',
        name: {
            en: 'Down',
            zh: '失落'
        }
    },
    {
        id: '13',
        state: 'surprised',
        name: {
            en: 'Surprised',
            zh: '惊讶'
        },
        oneshot: true
    },
    {
        id: '14',
        state: 'shy',
        name: {
            en: 'Shy',
            zh: '害羞'
        }
    },
    {
        id: '15',
        state: 'drowsy',
        name: {
            en: 'Tired',
            zh: '疲惫'
        }
    },
    {
        id: '16',
        state: 'working',
        name: {
            en: 'Focused',
            zh: '专注'
        }
    },
    {
        id: '17',
        state: 'scared',
        name: {
            en: 'Panicked',
            zh: '慌张'
        }
    },
    {
        id: '18',
        state: 'suspicious',
        name: {
            en: 'Resigned',
            zh: '无奈'
        }
    },
    {
        id: '19',
        state: 'proud',
        name: {
            en: 'Satisfied',
            zh: '满意'
        }
    },
    {
        id: '20',
        state: 'confused',
        name: {
            en: 'Confused',
            zh: '困惑'
        }
    },
    {
        id: '21',
        state: 'angry',
        name: {
            en: 'Angry',
            zh: '生气'
        }
    },
    {
        id: '22',
        state: 'excited',
        name: {
            en: 'Excited',
            zh: '兴奋'
        }
    },
    {
        id: '23',
        state: 'laughing',
        name: {
            en: 'Laughing',
            zh: '大笑'
        }
    },
    {
        id: '24',
        state: 'playful',
        name: {
            en: 'Playful',
            zh: '调皮'
        }
    },
    {
        id: '25',
        state: 'celebrate',
        name: {
            en: 'Celebrating',
            zh: '庆祝'
        },
        oneshot: true
    },
    {
        id: '26',
        state: 'bouncing',
        name: {
            en: 'Bouncing',
            zh: '弹跳'
        }
    },
    {
        id: '27',
        state: 'humming',
        name: {
            en: 'Humming',
            zh: '哼歌'
        }
    },
    {
        id: '30',
        state: 'thinking',
        name: {
            en: 'Thinking',
            zh: '思考中'
        }
    },
    {
        id: '31',
        state: 'receiving',
        name: {
            en: 'Receiving',
            zh: '接收任务'
        },
        oneshot: true
    },
    {
        id: '32',
        state: 'working',
        name: {
            en: 'Busy',
            zh: '处理中'
        }
    },
    {
        id: '33',
        state: 'celebrate',
        name: {
            en: 'Done',
            zh: '任务完成'
        },
        oneshot: true
    },
    {
        id: '34',
        state: 'alerting',
        name: {
            en: 'Error',
            zh: '出错'
        },
        oneshot: true
    },
    {
        id: '35',
        state: 'listening',
        name: {
            en: 'Listening',
            zh: '等待输入'
        }
    },
    {
        id: '36',
        state: 'loading',
        name: {
            en: 'Loading',
            zh: '联网加载'
        }
    },
    {
        id: '37',
        state: 'listening',
        name: {
            en: 'Recalling',
            zh: '复述回忆'
        }
    },
    {
        id: '38',
        state: 'refusing',
        name: {
            en: 'Refusing',
            zh: '拒绝/受限'
        },
        oneshot: true
    },
    {
        id: '39',
        state: 'composing',
        name: {
            en: 'Replying',
            zh: '输出回复'
        }
    },
    {
        id: '40',
        state: 'searching',
        name: {
            en: 'Searching',
            zh: '检索资料'
        }
    },
    {
        id: '41',
        state: 'powering-down',
        name: {
            en: 'Powering off',
            zh: '停止终止'
        }
    },
    {
        id: '42',
        state: 'reading',
        name: {
            en: 'Reading',
            zh: '阅读'
        }
    },
    {
        id: '43',
        state: 'writing',
        name: {
            en: 'Writing',
            zh: '写入'
        }
    },
    {
        id: '44',
        state: 'sending',
        name: {
            en: 'Sending',
            zh: '发送'
        }
    },
    {
        id: '45',
        state: 'uploading',
        name: {
            en: 'Uploading',
            zh: '上传'
        }
    },
    {
        id: '46',
        state: 'dictating',
        name: {
            en: 'Dictating',
            zh: '语音输入'
        }
    },
    {
        id: '47',
        state: 'progress',
        name: {
            en: 'Progress',
            zh: '进度'
        }
    },
    {
        id: '48',
        state: 'waiting',
        name: {
            en: 'Waiting',
            zh: '等待'
        }
    },
    {
        id: '49',
        state: 'orbit',
        name: {
            en: 'Orbiting',
            zh: '环绕'
        }
    },
    {
        id: '50',
        state: 'notifying',
        name: {
            en: 'Notifying',
            zh: '通知'
        },
        oneshot: true
    },
    {
        id: '51',
        state: 'radar',
        name: {
            en: 'Scanning',
            zh: '扫描'
        }
    },
    {
        id: '52',
        state: 'messaging',
        name: {
            en: 'Messaging',
            zh: '消息'
        }
    }
];
const EMOTIONS = protocol_defs;
const EMOTION_IDS = protocol_defs.map((d)=>d.id);
const protocol_BY_ID = new Map(protocol_defs.map((d)=>[
        d.id,
        d
    ]));
const STATE_TO_ID = new Map();
for (const d of protocol_defs)if (!STATE_TO_ID.has(d.state)) STATE_TO_ID.set(d.state, d.id);
for (const state of CHARACTER_STATES)if (!STATE_TO_ID.has(state)) throw new Error(`protocol: state "${state}" has no emotion id`);
const SEGMENT_FALLBACK = {
    lifecycle: '02',
    feeling: '02',
    agent: '32',
    signalling: '50'
};
const IDLE_EMOTION_ID = '02';
function emotionSegment(id) {
    const n = Number.parseInt(id, 10);
    if (!Number.isFinite(n)) return null;
    for (const seg of EMOTION_SEGMENTS)if (n >= seg.range[0] && n <= seg.range[1]) return seg.id;
    return null;
}
const getEmotion = (id)=>null == id ? null : protocol_BY_ID.get(normaliseId(id)) ?? null;
const isOneshotEmotion = (id)=>getEmotion(id)?.oneshot === true;
function normaliseId(id) {
    const s = String(id).trim();
    return 1 === s.length ? `0${s}` : s;
}
function stateForEmotion(id) {
    if (null == id) return "idle";
    const key = normaliseId(id);
    const exact = protocol_BY_ID.get(key);
    if (exact) return exact.state;
    const seg = emotionSegment(key);
    if (seg) return protocol_BY_ID.get(SEGMENT_FALLBACK[seg]).state;
    return "idle";
}
function emotionIdForState(state) {
    return STATE_TO_ID.get(state) ?? IDLE_EMOTION_ID;
}
function resolveEmotionId(value) {
    if (null == value) return null;
    const s = String(value).trim();
    if (!s) return null;
    if (isCharacterState(s)) return emotionIdForState(s);
    const key = normaliseId(s);
    if (protocol_BY_ID.has(key)) return key;
    return emotionSegment(key) ? SEGMENT_FALLBACK[emotionSegment(key)] : null;
}
function parseAgentMessage(input) {
    let raw = input;
    if ('string' == typeof raw) {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('{')) try {
            raw = JSON.parse(trimmed);
        } catch  {
            return null;
        }
        else {
            const id = resolveEmotionId(trimmed);
            return id ? {
                emotionId: id,
                state: stateForEmotion(id)
            } : null;
        }
    }
    if (!raw || 'object' != typeof raw || Array.isArray(raw)) return null;
    const m = raw;
    const candidate = m.aoraBotId ?? m.emotionId ?? m.emotion ?? m.state;
    if (null == candidate || 'string' != typeof candidate && 'number' != typeof candidate) return null;
    const emotionId = resolveEmotionId(candidate);
    if (!emotionId) return null;
    const message = {
        emotionId,
        state: stateForEmotion(emotionId)
    };
    if (null != m.tips && '' !== m.tips) message.tips = String(m.tips);
    if (isHudSpec(m.hud)) message.hud = m.hud;
    return message;
}
const DEFAULT_PRIORITY = {
    alerting: 80,
    refusing: 70,
    celebrate: 60,
    surprised: 55,
    receiving: 50,
    notifying: 48,
    dragging: 46,
    searching: 42,
    loading: 42,
    working: 40,
    writing: 40,
    reading: 40,
    sending: 40,
    uploading: 40,
    composing: 36,
    progress: 34,
    listening: 26,
    thinking: 30,
    waiting: 28,
    'powering-down': 22,
    waking: 15,
    spawning: 15,
    humming: 12,
    idle: 10,
    drowsy: 4,
    sleeping: 0
};
function groupPriority(state) {
    const id = emotionIdForState(state);
    const n = Number.parseInt(id, 10);
    if (n >= 50) return 45;
    if (n >= 30) return 30;
    if (n >= 10) return 20;
    return 10;
}
const DEFAULT_ONESHOT_STATES = (()=>{
    const out = new Set();
    for (const s of [
        'celebrate',
        'alerting',
        'refusing',
        'receiving',
        'surprised',
        'waking',
        'spawning',
        'notifying'
    ])if (isOneshotEmotion(emotionIdForState(s))) out.add(s);
    return [
        ...out
    ];
})();
function createArbiter(options = {}) {
    const now = options.now ?? (()=>Date.now());
    const schedule = options.schedule ?? ((fn, ms)=>setTimeout(fn, ms));
    const cancel = options.cancel ?? ((h)=>clearTimeout(h));
    const priority = {
        ...DEFAULT_PRIORITY,
        ...options.priority
    };
    const oneshot = new Set(options.oneshot ?? DEFAULT_ONESHOT_STATES);
    let defaultDwell = 900;
    let dwellByState = {};
    if ('number' == typeof options.minDisplayMs) defaultDwell = options.minDisplayMs;
    else if (options.minDisplayMs) {
        if ('number' == typeof options.minDisplayMs.defaultMs) defaultDwell = options.minDisplayMs.defaultMs;
        if (options.minDisplayMs.byState) dwellByState = options.minDisplayMs.byState;
    }
    const sessionTtlMs = options.sessionTtlMs ?? 120000;
    const maxSessions = options.maxSessions ?? 32;
    const idleState = options.idleState ?? "idle";
    const sessions = new Map();
    const listeners = new Set();
    if (options.onApply) listeners.add(options.onApply);
    let current = null;
    let changedAt = -1 / 0;
    let pending = null;
    const prio = (state)=>priority[state] ?? groupPriority(state);
    const dwell = (state)=>dwellByState[state] ?? defaultDwell;
    const idleResult = ()=>({
            state: idleState,
            emotionId: emotionIdForState(idleState)
        });
    function cleanStale() {
        const t = now();
        let removed = false;
        for (const [id, s] of sessions)if (t - s.lastSeen > sessionTtlMs) {
            sessions.delete(id);
            removed = true;
        }
        return removed;
    }
    function resolve() {
        let best = null;
        for (const [id, s] of sessions)if (!s.headless) {
            if (!best || prio(s.state) > prio(best.state)) best = {
                state: s.state,
                emotionId: s.emotionId,
                tips: s.tips,
                hud: s.hud,
                sessionId: id
            };
        }
        return best ?? idleResult();
    }
    function apply(result) {
        current = result;
        changedAt = now();
        for (const l of listeners)l(result);
    }
    function clearPending() {
        if (pending) {
            cancel(pending.timer);
            pending = null;
        }
    }
    function propose(result) {
        if (current && current.state === result.state) {
            if (current.tips !== result.tips || current.hud !== result.hud) {
                current = {
                    ...current,
                    tips: result.tips,
                    hud: result.hud
                };
                for (const l of listeners)l(current);
            }
            return;
        }
        if (pending) {
            if (prio(result.state) < prio(pending.result.state)) return;
            clearPending();
        }
        const remaining = current ? dwell(current.state) - (now() - changedAt) : 0;
        if (remaining > 0) {
            const queued = result;
            pending = {
                result: queued,
                timer: schedule(()=>{
                    pending = null;
                    oneshot.has(queued.state) ? apply(queued) : apply(resolve());
                }, remaining)
            };
        } else apply(result);
    }
    function update(u) {
        if (!u || !u.sessionId) return;
        let state;
        let emotionId;
        if (u.state) {
            state = u.state;
            emotionId = u.emotionId ?? emotionIdForState(state);
        } else {
            if (null == u.emotionId) return;
            const def = getEmotion(u.emotionId);
            emotionId = def?.id ?? u.emotionId;
            state = stateForEmotion(u.emotionId);
        }
        cleanStale();
        if (!sessions.has(u.sessionId) && sessions.size >= maxSessions) {
            let oldest = null;
            let oldestAt = 1 / 0;
            for (const [id, s] of sessions)if (s.lastSeen < oldestAt) {
                oldestAt = s.lastSeen;
                oldest = id;
            }
            if (null != oldest) sessions.delete(oldest);
        }
        sessions.set(u.sessionId, {
            state,
            emotionId,
            tips: u.tips,
            hud: u.hud,
            headless: !!u.headless,
            lastSeen: now()
        });
        !u.headless && oneshot.has(state) ? propose({
            state,
            emotionId,
            tips: u.tips,
            hud: u.hud,
            sessionId: u.sessionId
        }) : propose(resolve());
    }
    function remove(sessionId) {
        if (!sessions.delete(sessionId)) return;
        propose(resolve());
    }
    function tick() {
        if (cleanStale()) propose(resolve());
    }
    return {
        update,
        remove,
        tick,
        resolve,
        current: ()=>current,
        sessions: ()=>sessions,
        subscribe (listener) {
            listeners.add(listener);
            if (current) listener(current);
            return ()=>{
                listeners.delete(listener);
            };
        },
        dispose () {
            clearPending();
            listeners.clear();
            sessions.clear();
        }
    };
}
const claudeCode = {
    id: 'claude-code',
    name: 'Claude Code',
    events: {
        SessionStart: '02',
        UserPromptSubmit: '30',
        PreToolUse: '40',
        PostToolUse: '32',
        PostToolUseFailure: '34',
        Notification: '38',
        Stop: '33',
        SessionEnd: '00'
    },
    capabilities: {
        sessionEnd: true,
        subagent: true
    }
};
const adapters_cursor = {
    id: 'cursor',
    name: 'Cursor',
    events: {
        sessionStart: '02',
        userMessage: '30',
        planning: '30',
        toolCall: '40',
        fileEdit: '32',
        shellCommand: '32',
        webSearch: '36',
        error: '34',
        awaitingApproval: '38',
        responding: '39',
        taskComplete: '33',
        sessionEnd: '00'
    },
    capabilities: {
        sessionEnd: true,
        subagent: false
    }
};
const TOOL_STATES = {
    search: 'searching',
    web_search: 'searching',
    grep: 'searching',
    glob: 'searching',
    browse: 'reading',
    fetch: 'reading',
    read_file: 'reading',
    read: 'reading',
    write_file: 'writing',
    write: 'writing',
    edit: 'writing',
    str_replace: 'writing',
    run: 'working',
    shell: 'working',
    bash: 'working',
    terminal: 'working',
    upload: 'uploading',
    think: 'thinking',
    plan: 'thinking',
    ask: 'listening',
    wait: 'waiting'
};
const DEFAULT_TOOL_STATE = 'working';
const stateForTool = (tool)=>(tool ? TOOL_STATES[tool] : void 0) ?? DEFAULT_TOOL_STATE;
const emotionIdForTool = (tool)=>emotionIdForState(stateForTool(tool));
const ACTIVITY_VERB_IDS = [
    'thinking',
    'searching',
    'browsing',
    'reading',
    'connecting',
    'writing',
    'coding',
    'running-commands',
    'using-computer',
    'working',
    'generating',
    'messaging',
    'waiting',
    'sending',
    'uploading',
    'dictating'
];
const ACTIVITY_VERBS = {
    thinking: 'thinking',
    searching: 'searching',
    browsing: 'searching',
    reading: 'reading',
    connecting: 'loading',
    writing: 'writing',
    coding: 'writing',
    'running-commands': 'working',
    'using-computer': 'working',
    working: 'working',
    generating: 'loading',
    messaging: 'messaging',
    waiting: 'waiting',
    sending: 'sending',
    uploading: 'uploading',
    dictating: 'dictating'
};
const stateForActivity = (verb)=>verb && Object.hasOwn(ACTIVITY_VERBS, verb) ? ACTIVITY_VERBS[verb] : DEFAULT_TOOL_STATE;
function characterStateForRoster(facts, surface) {
    if (facts.composing && 'avatar' !== surface) return 'composing';
    if (facts.running) return facts.activity ? stateForActivity(facts.activity) : DEFAULT_TOOL_STATE;
    return 'idle';
}
const AGENT_ADAPTERS = [
    claudeCode,
    adapters_cursor
];
const adapters_BY_ID = new Map(AGENT_ADAPTERS.map((a)=>[
        a.id,
        a
    ]));
const getAdapter = (id)=>id ? adapters_BY_ID.get(id) ?? null : null;
function stateForAgentEvent(adapterId, event) {
    const id = getAdapter(adapterId)?.events[event];
    return id ? stateForEmotion(id) : null;
}
function normalize(message, options = {}) {
    if (!message || 'object' != typeof message || Array.isArray(message)) return {
        ok: false,
        error: 'message must be a JSON object'
    };
    const m = message;
    const sessionId = m.session_id ?? m.sessionId;
    if ('string' != typeof sessionId || !sessionId.trim()) return {
        ok: false,
        error: 'missing session_id'
    };
    const lookup = options.getAdapter ?? getAdapter;
    let emotionId = null;
    const direct = m.aoraBotId ?? m.emotionId ?? m.state;
    if (null != direct) {
        if ('string' != typeof direct && 'number' != typeof direct) return {
            ok: false,
            error: 'aoraBotId / emotionId / state must be a string'
        };
        emotionId = resolveEmotionId(direct);
        if (!emotionId) return {
            ok: false,
            error: `unknown state or id "${String(direct)}"`
        };
    } else {
        if (null == m.agent_id && null == m.agentId) return {
            ok: false,
            error: 'need aoraBotId, state, or agent_id + event'
        };
        const agentId = String(m.agent_id ?? m.agentId);
        const adapter = lookup(agentId);
        if (!adapter) return {
            ok: false,
            error: `unknown agent_id "${agentId}"`
        };
        const event = null == m.event ? '' : String(m.event);
        const mapped = adapter.events[event];
        if (!mapped) return {
            ok: false,
            error: `agent "${adapter.id}" has no event "${event}"`
        };
        emotionId = mapped;
    }
    const update = {
        sessionId: sessionId.trim(),
        emotionId,
        state: stateForEmotion(emotionId),
        headless: true === m.headless
    };
    if (null != m.tips && '' !== m.tips) update.tips = String(m.tips);
    if (isHudSpec(m.hud)) update.hud = m.hud;
    return {
        ok: true,
        update
    };
}
function normalizeLine(line, options) {
    const trimmed = line.trim();
    if (!trimmed) return {
        ok: true,
        skip: true
    };
    let parsed;
    try {
        parsed = JSON.parse(trimmed);
    } catch (e) {
        return {
            ok: false,
            error: `invalid JSON: ${e.message}`
        };
    }
    return normalize(parsed, options);
}
const MESSAGE_TYPE = 'aora:state';
function openMessageChannel(options) {
    const target = options.target ?? ("u" > typeof window ? window : null);
    if (!target) return ()=>{};
    const listener = (event)=>{
        const allow = options.allowOrigin ?? target.location?.origin;
        if ('*' !== allow && void 0 !== allow && event.origin !== allow) return;
        const data = event.data;
        if (!data || 'object' != typeof data || data.type !== MESSAGE_TYPE) return;
        const r = normalize(data.payload, options);
        if (r.ok) options.onUpdate(r.update);
        else options.onError?.(r.error, data.payload);
    };
    target.addEventListener('message', listener);
    return ()=>target.removeEventListener('message', listener);
}
async function readLineStream(source, handlers) {
    const decoder = "u" > typeof TextDecoder ? new TextDecoder() : null;
    let buffer = '';
    const handle = (line)=>{
        const r = normalizeLine(line, handlers);
        if ('skip' in r) return;
        if (r.ok) handlers.onUpdate(r.update);
        else handlers.onError?.(r.error, line);
    };
    for await (const chunk of source){
        buffer += 'string' == typeof chunk ? chunk : decoder ? decoder.decode(chunk, {
            stream: true
        }) : '';
        let idx;
        while((idx = buffer.indexOf('\n')) >= 0){
            handle(buffer.slice(0, idx));
            buffer = buffer.slice(idx + 1);
        }
    }
    if (buffer.trim()) handle(buffer);
}
async function* streamChunks(stream) {
    const reader = stream.getReader();
    try {
        for(;;){
            const { done, value } = await reader.read();
            if (done) return;
            if (value) yield value;
        }
    } finally{
        reader.releaseLock();
    }
}
const SPRITE_FALLBACK_HOPS = 4;
function isSpriteManifest(value) {
    if (!value || 'object' != typeof value) return false;
    const m = value;
    return 'sprite-mate' === m.kind && 1 === m.formatVersion && 'string' == typeof m.id && Array.isArray(m.frameSize) && 2 === m.frameSize.length && !!m.frames && 'object' == typeof m.frames;
}
const framesFor = (manifest, id)=>{
    const files = manifest.frames[id];
    return files && files.length > 0 ? files : null;
};
function resolveSpriteFrames(manifest, id) {
    const start = normaliseId(id);
    const direct = framesFor(manifest, start);
    if (direct) return {
        id: start,
        files: direct,
        via: 'direct'
    };
    let cursor = manifest.fallback?.[start];
    const seen = new Set([
        start
    ]);
    for(let hop = 0; cursor && hop < SPRITE_FALLBACK_HOPS && !seen.has(cursor); hop++){
        seen.add(cursor);
        const files = framesFor(manifest, cursor);
        if (files) return {
            id: cursor,
            files,
            via: 'manifest'
        };
        cursor = manifest.fallback?.[cursor];
    }
    const seg = emotionSegment(start);
    if (seg) {
        const segFiles = framesFor(manifest, SEGMENT_FALLBACK[seg]);
        if (segFiles) return {
            id: SEGMENT_FALLBACK[seg],
            files: segFiles,
            via: 'segment'
        };
    }
    const idle = framesFor(manifest, IDLE_EMOTION_ID);
    if (idle) return {
        id: IDLE_EMOTION_ID,
        files: idle,
        via: 'idle'
    };
    return null;
}
function spriteCoverage(manifest, ids) {
    const problems = [];
    const result = {};
    let direct = 0;
    let fallback = 0;
    let dead = 0;
    if (!framesFor(manifest, IDLE_EMOTION_ID)) problems.push(`idle (${IDLE_EMOTION_ID}) has no frames`);
    for (const [id, files] of Object.entries(manifest.frames))if (!Array.isArray(files) || 0 === files.length) problems.push(`"${id}" lists no frames`);
    for (const [from, to] of Object.entries(manifest.fallback ?? {})){
        if (!(to in manifest.frames) && !(to in (manifest.fallback ?? {}))) problems.push(`fallback "${from}" → "${to}" points at an unknown id`);
        const seen = new Set([
            from
        ]);
        let cursor = to;
        while(cursor){
            if (seen.has(cursor)) {
                problems.push(`fallback chain from "${from}" cycles`);
                break;
            }
            seen.add(cursor);
            cursor = manifest.fallback?.[cursor];
        }
    }
    for (const id of ids){
        const clip = resolveSpriteFrames(manifest, id);
        if (clip) if ('direct' === clip.via) {
            result[id] = {
                kind: 'direct'
            };
            direct++;
        } else {
            result[id] = {
                kind: 'fallback',
                via: clip.id
            };
            fallback++;
        }
        else {
            result[id] = {
                kind: 'dead'
            };
            dead++;
        }
    }
    return {
        ids: result,
        direct,
        fallback,
        dead,
        problems
    };
}
const NOOP_HANDLE = {
    refresh () {},
    running: true,
    dispose () {}
};
function autoPause(target, options = {}) {
    const doc = "u" > typeof document ? document : null;
    if (!doc) return NOOP_HANDLE;
    let pageVisible = 'hidden' !== doc.visibilityState;
    let inView = true;
    let motionOk = true;
    let running = null;
    let lowFrequency = null;
    const watchMotion = false !== options.reducedMotion;
    if (watchMotion) motionOk = !prefersReducedMotion();
    const clearLowFrequency = ()=>{
        if (null != lowFrequency) {
            clearInterval(lowFrequency);
            lowFrequency = null;
        }
    };
    const sync = ()=>{
        const want = pageVisible && inView && motionOk;
        if (want === running) return;
        clearLowFrequency();
        if (want) target.resume();
        else {
            target.pause();
            if (!motionOk && pageVisible && inView && target.renderOnce) {
                target.renderOnce();
                if (options.reducedFps && options.reducedFps > 0) {
                    const render = ()=>target.renderOnce?.();
                    lowFrequency = setInterval(render, Math.max(1000 / options.reducedFps, 100));
                }
            }
        }
        running = want;
    };
    let onVisibility = null;
    if (false !== options.visibility) {
        onVisibility = ()=>{
            pageVisible = 'hidden' !== doc.visibilityState;
            sync();
        };
        doc.addEventListener('visibilitychange', onVisibility);
    }
    let observer = null;
    if (false !== options.viewport && target.element && 'function' == typeof IntersectionObserver) {
        observer = new IntersectionObserver((entries)=>{
            inView = entries[entries.length - 1]?.isIntersecting ?? true;
            sync();
        }, {
            rootMargin: options.rootMargin ?? '64px'
        });
        observer.observe(target.element);
    }
    const stopMotion = watchMotion ? onReducedMotionChange((reduced)=>{
        motionOk = !reduced;
        sync();
    }) : null;
    running = true;
    sync();
    return {
        refresh: sync,
        get running () {
            return true === running;
        },
        dispose () {
            clearLowFrequency();
            if (onVisibility) doc.removeEventListener('visibilitychange', onVisibility);
            observer?.disconnect();
            stopMotion?.();
        }
    };
}
function timeoutScheduler() {
    const timers = new Set();
    return {
        later (fn, ms) {
            const id = setTimeout(()=>{
                timers.delete(id);
                fn();
            }, ms);
            timers.add(id);
        },
        cancelAll () {
            for (const id of timers)clearTimeout(id);
            timers.clear();
        }
    };
}
function createCharacter(host, options = {}) {
    const reduced = options.reducedMotion ?? prefersReducedMotion();
    const seed = options.seed ?? 'aora';
    let style = styles_getStyle(options.style ?? "vector");
    let styleId = style.id;
    let styleOptions = options.styleOptions;
    let variant = options.variant ?? style.defaultVariant;
    requireTheme('variant', variant, styleId);
    if (options.shape) requireTheme('shape', options.shape);
    const mountRenderer = ()=>style.createRenderer(host, {
            seed,
            sourceId: options.sourceId,
            styleOptions: resolveStyleOptions(style, styleOptions)
        });
    let renderer = mountRenderer();
    let paused = options.paused ?? false;
    let followTarget = options.followTarget;
    let followRect = null;
    let followRectAt = -1;
    function followGaze(clock) {
        const point = followTarget;
        if (!point) {
            followRect = null;
            return null;
        }
        if (!followRect || clock - followRectAt > 0.4 || clock < followRectAt) {
            followRect = renderer.element.getBoundingClientRect();
            followRectAt = clock;
        }
        if (followRect.width < 1 || followRect.height < 1) return null;
        return mapPointerToGaze({
            clientX: point.x,
            clientY: point.y
        }, followRect);
    }
    const sim = createSimulation({
        ...options,
        variant,
        reducedMotion: reduced,
        followGaze,
        scheduler: timeoutScheduler(),
        displaySizePx: ()=>renderer.element.clientWidth
    });
    let running = false;
    let unsubscribe = null;
    function frame(dt, ticking = false) {
        sim.step(dt);
        renderer.draw(sim.snapshot(), ticking);
    }
    function start() {
        if (running || reduced || held) {
            if (reduced) frame(0);
            return;
        }
        running = true;
        renderer.hold?.(false);
        unsubscribe = ticker.add((dt)=>frame(dt, true));
    }
    function stop() {
        running = false;
        unsubscribe?.();
        unsubscribe = null;
        renderer.hold?.(true);
    }
    let held = false;
    let autoPauseHandle = null;
    function watchVisibility() {
        autoPauseHandle?.dispose();
        autoPauseHandle = null;
        if (!options.autoPause) return;
        autoPauseHandle = autoPause({
            element: renderer.element,
            pause () {
                held = true;
                stop();
                sim.hold();
            },
            resume () {
                held = false;
                if (!paused) start();
            },
            renderOnce () {
                frame(0);
            }
        }, 'object' == typeof options.autoPause ? options.autoPause : {});
    }
    watchVisibility();
    function switchStyle(id) {
        const next = styles_getStyle(id);
        const anchor = renderer.element.nextSibling;
        renderer.destroy();
        style = next;
        styleId = next.id;
        renderer = mountRenderer();
        if (!running) renderer.hold?.(true);
        if (anchor?.parentNode === host) host.insertBefore(renderer.element, anchor);
        followRect = null;
        watchVisibility();
    }
    const controller = {
        get element () {
            return renderer.element;
        },
        get paused () {
            return paused;
        },
        update (next) {
            if (void 0 !== next.followTarget) followTarget = next.followTarget;
            if (void 0 !== next.paused) paused = next.paused;
            let switched = false;
            let change = next;
            if (next.styleOptions) styleOptions = next.styleOptions;
            if (void 0 !== next.style && next.style !== styleId) {
                switchStyle(next.style);
                switched = true;
                if (void 0 === next.variant && !acceptsVariant(style, variant)) change = {
                    ...next,
                    variant: style.defaultVariant
                };
            } else if (next.styleOptions) renderer.configure(resolveStyleOptions(style, next.styleOptions));
            if (change.variant) {
                requireTheme('variant', change.variant, styleId);
                variant = change.variant;
            }
            sim.update(change);
            if (void 0 !== next.paused) if (next.paused) stop();
            else start();
            if (!running && !paused) start();
            if (reduced || paused) frame(0);
            else if (switched || change.variant || void 0 !== next.ink) renderer.draw(sim.snapshot());
        },
        spin (turns = 1) {
            sim.spin(turns);
            if (!running) start();
        },
        bounce (strength = 1) {
            sim.bounce(strength);
            if (!running) start();
        },
        burst (count = 16) {
            if (reduced) return;
            sim.burst(count);
            if (!running) start();
        },
        renderOnce () {
            frame(0);
        },
        settle () {
            sim.settle();
            renderer.draw(sim.snapshot());
        },
        pause () {
            paused = true;
            stop();
            sim.hold();
        },
        resume () {
            paused = false;
            start();
        },
        destroy () {
            autoPauseHandle?.dispose();
            stop();
            sim.dispose();
            renderer.destroy();
        }
    };
    if (paused) renderer.hold?.(true);
    else start();
    frame(0);
    return controller;
}
function mapPointerToGaze(point, rect, strength = 0.6) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (point.clientX - cx) / (2 * rect.width);
    const dy = (point.clientY - cy) / (2 * rect.height);
    const distance = Math.hypot(dx, dy) || 1;
    const scaled = Math.sqrt(distance) * strength;
    return {
        x: clamp(dx / distance * scaled, -1, 1),
        y: clamp(dy / distance * scaled, -1, 1)
    };
}
const firstOf = (table)=>Object.fromEntries(Object.entries(table).map(([state, list])=>[
            state,
            list[0]
        ]));
const STATE_EXPRESSION = firstOf(STATE_EYE_TOPOLOGIES);
const STATE_CUTE_EXPRESSION = firstOf(STATE_CUTE_EYES);
function resolveExpression(options, face) {
    if (options.expression) return options.expression;
    if (isDrawnFace(face)) return getFaceDesign(face).states[options.state ?? "idle"][0] ?? 'dot';
    const table = 'cute' === face ? STATE_CUTE_EXPRESSION : STATE_EXPRESSION;
    if (options.state) return table[options.state] ?? 'neutral';
    return 'neutral';
}
const BELT_SAMPLE_TIME = 0.62;
function renderStaticSvg(options = {}) {
    const shapeId = options.shape ?? DEFAULT_SHAPE;
    const colorId = options.color ?? 'black';
    const style = styles_getStyle(options.style ?? "vector");
    requireTheme('color', colorId);
    if (void 0 !== options.variant) requireTheme('variant', options.variant, style.id);
    const colorScheme = options.colorScheme ?? 'system';
    const face = options.face ?? DEFAULT_FACE;
    const expressionId = resolveExpression(options, face);
    const noseId = 'line' !== face ? null : void 0 === options.nose ? autoNoseForKey(`${shapeId}:${colorId}`) : options.nose;
    const mouthId = 'line' === face ? options.mouth ?? (options.state ? mouthForState(options.state) : 'soft') : isCuteFamily(face) ? options.mouth ?? null : null;
    const variant = options.variant ?? style.defaultVariant;
    const sim = createSimulation({
        shape: shapeId,
        state: options.state,
        variant,
        face,
        nose: noseId,
        faceTune: options.faceTune,
        pose: options.pose,
        poseHome: options.poseHome,
        lineWeight: options.lineWeight,
        ink: options.ink,
        hud: options.hud,
        seed: 'static',
        reducedMotion: true,
        still: {
            beltTime: BELT_SAMPLE_TIME,
            expression: expressionId,
            mouth: mouthId ?? void 0
        },
        compensateEyes: false,
        displaySizePx: Math.max(1, options.sizePx ?? 240)
    });
    sim.settle();
    const frame = sim.snapshot();
    sim.dispose();
    const faceKey = 'line' === face ? `line${noseId ?? ''}${mouthId ?? ''}` : 'cute' === face ? 'cute' : isDrawnFace(face) ? `${face}${mouthId ?? ''}` : '';
    const inkKey = options.ink ? JSON.stringify(options.ink) : '';
    const schemeKey = 'page' === colorScheme ? 'page' : '';
    const tuned = options.styleOptions && Object.keys(options.styleOptions).length > 0;
    const lookKey = `${"vector" === style.id && variant === style.defaultVariant ? '' : `${style.id}/${variant}`}${tuned ? JSON.stringify(options.styleOptions) : ''}`;
    const uid = `a${hashString(`${shapeId}${colorId}${expressionId}${faceKey}${inkKey}${schemeKey}${lookKey}`)}`;
    return style.renderStatic(frame, {
        color: colorId,
        uid,
        flat: options.flat,
        colorScheme,
        eyeColor: options.eyeColor,
        sizePx: options.sizePx,
        styleOptions: resolveStyleOptions(style, options.styleOptions)
    });
}
function renderStaticSvgDataUrl(options = {}) {
    return `data:image/svg+xml,${encodeURIComponent(renderStaticSvg(options))}`;
}
function renderAvatarDataUrl(key, overrides = {}) {
    return renderStaticSvgDataUrl({
        shape: overrides.shape ?? autoShapeForKey(key),
        color: overrides.color ?? autoColorForKey(key),
        sizePx: overrides.sizePx,
        eyeColor: overrides.eyeColor,
        face: overrides.face,
        lineWeight: overrides.lineWeight,
        nose: 'line' === overrides.face && void 0 === overrides.nose ? autoNoseForKey(key) : overrides.nose,
        state: overrides.state ?? "idle"
    });
}
function shapeMaskImage(options = {}) {
    const shapeId = options.shape ?? DEFAULT_SHAPE;
    const shape = getShape(shapeId);
    const scale = getShapeScale(shapeId) * (1 + (options.inflatePx ?? 0) / 100);
    const size = options.sizePx ?? 64;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX_STR}" width="${size}" height="${size}"><g transform="translate(${CENTER} ${CENTER}) scale(${scale}) translate(${-CENTER} ${-CENTER})"><path d="${shape.path}" fill="#000"/></g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
function shapeRingMaskImage(options = {}) {
    const shapeId = options.shape ?? DEFAULT_SHAPE;
    const shape = getShape(shapeId);
    const size = options.sizePx ?? 64;
    const base = getShapeScale(shapeId);
    const outer = base * (1 + (options.inflatePx ?? 1) / 30);
    const inner = base * (1 + ((options.inflatePx ?? 1) - (options.gapPx ?? 3)) / 30);
    const box = `x="${VIEWBOX.minX}" y="${VIEWBOX.minY}" width="${VIEWBOX.width}" height="${VIEWBOX.height}"`;
    const at = (scale)=>`translate(${CENTER} ${CENTER}) scale(${scale}) translate(${-CENTER} ${-CENTER})`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX_STR}" width="${size}" height="${size}"><defs><mask id="r" maskUnits="userSpaceOnUse" ${box}><g transform="${at(outer)}"><path d="${shape.path}" fill="#fff"/></g><g transform="${at(inner)}"><path d="${shape.path}" fill="#000"/></g></mask></defs><rect ${box} fill="#000" mask="url(#r)"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
function hashString(s) {
    let h = 0;
    for(let i = 0; i < s.length; i++)h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return (h >>> 0).toString(36);
}
var __webpack_exports__DEFAULT_STYLE_ID = "vector";
var __webpack_exports__IDLE_STATE = "idle";
globalThis.Aora = { ACTIVITY_VERBS, ACTIVITY_VERB_IDS, AGENT_ADAPTERS, ALL_CAST_IDS, ALL_COLOR_IDS, ALL_SHAPE_FAMILIES, ALL_SHAPE_IDS, ANTIC_STATES, ASSIGNABLE_COLOR_IDS, AUTO_SHAPE_POOL, BELT_CORE_SIZE, BELT_GLYPH_SIZE, BELT_KINDS, CAST, CAST_IDS, CENTER, CHARACTER_STATES, COLOR_IDS, COLOR_SWATCHES, CONFETTI_COLORS, CORE_CAST_IDS, CORE_COLOR_IDS, CORE_SHAPE_IDS, CUTE_EYE_CLASSES, CUTE_EYE_IDS, CUTE_EYE_TOPOLOGIES, CUTE_MOUTHS, CUTE_MOUTH_IDS, DEFAULT_FACE, DEFAULT_FACE_TUNE, DEFAULT_POSE, DEFAULT_POSE_HOME, DEFAULT_PRIORITY, DEFAULT_SHAPE, DEFAULT_TOOL_STATE, DRAWN_FACE_STYLES, EMOTIONS, EMOTION_IDS, EMOTION_SEGMENTS, EYE_CLASSES, EYE_TOPOLOGIES, EYE_TOPOLOGY_IDS, FACE_ACCENTS, FACE_DESIGNS, FACE_KIT, FACE_PAINTS, FACE_STYLES, FX_COLORS, FX_KINDS, HUD_FONT, HUD_KINDS, HUD_KIND_LABELS, HUD_PRINT_MIN_PX, IDLE_EMOTION_ID, INK_GRADIENT_ANGLE, LEAF_COLOR, LEAF_COLOR_ON_GREEN, LINE_FACE_TUNE, LINE_WEIGHT, LINE_WEIGHT_RANGE, MESSAGE_TYPE, MOOD_LEAN, MOUTHS, MOUTH_DROP, MOUTH_IDS, NOSES, NOSE_DROP, NOSE_IDS, PART_TONES, PathBuilder, SEGMENT_FALLBACK, SHAPE_FAMILIES, SHAPE_IDS, SHAPE_SPACE, SHAPE_WRAPPERS, SPRITE_FALLBACK_HOPS, STATE_BELT, STATE_BLINK_MS, STATE_BLUSH, STATE_CUTE_EYES, STATE_CUTE_MOUTH, STATE_ENTRY_EFFECTS, STATE_EYE_SWITCH_MS, STATE_EYE_TOPOLOGIES, STATE_FACES, STATE_FACE_TUNE, STATE_FX, STATE_GAZE, STATE_GROUPS, STATE_GROUP_IDS, STATE_MOODS, STATE_MOUTH, STATE_MOUTH_TALK, STATE_SETTLE_TO, STATE_TAILS, STYLE_IDS, THEME_IDS, THEME_MANIFEST, THEME_MEMBER_KINDS, TOOL_STATES, ThemeNotInstalledError, UNLISTED_COLOR_IDS, VECTOR_VARIANTS, VIEWBOX, VIEWBOX_STR, acceptsVariant, allCast, allShapes, allVariants, autoColorForKey, autoNoseForKey, autoPause, autoShapeForKey, bangGlyphPath, behaviourFor, beltBodyRing, beltForState, blendBeltFrames, castMember, characterStateForRoster, clamp, claudeCode, computeEyePlacement, computeFaceGeometry, computeFacePlacement, createArbiter, createCharacter, createConfettiController, createImpulseBehaviour, createParticleSystem, createSimulation, cursor: adapters_cursor, defineFace, defineShape, defineShapeWithProps, defineStyle, defineTheme, defineVectorMedium, definedFaceLabel, definedFaces, drawnFaceText, drawnPairFor, easeInOutCubic, easeOutCubic, easeOutQuart, emotionIdForState, emotionIdForTool, emotionSegment, evaluateBelt, evaluateFx, evaluateHud, evaluateHudPrimitives, eyeOutline, eyePairFor, faceText, faceTuneForState, fitFace: fit_face_fitFace, fnv1a32, formatHud, frameLerp, gazeForState, getAdapter, getCuteMouth, getEmotion, getEyeScaleForShape, getFaceDesign, getInkColor, getInkColorCss, getInkGradient, getInkGradientFor, getInkVars, getLeafColor, getMouth, getShape, getShapeScale, getStyle: styles_getStyle, getSwatch, getSwatchHex, getTheme, haloBackground, hasStyle: styles_hasStyle, installTheme, isCastId, isCharacterState, isCuteFamily, isDrawnFace, isFaceStyle, isFixed, isHudKind, isHudSpec, isListedShape, isMouthId, isNoseId, isOneshotEmotion, isSpriteManifest, isThemeInstalled, kaomoji, lerp: easing_lerp, listStyles: styles_listStyles, listThemes, loadTheme, loadThemes, mapPointerToGaze, moodOf, morphDrawnPair, morphEye: morph_morphEye, morphEyePair, morphMouth, mouthForState, mouthOutline, mouthSpecFor, mulberry32, normaliseId, normalize, normalizeLine, nosePolyline, onReducedMotionChange, openMessageChannel, paramsForVariant, parseAgentMessage, particleFrames, particleOpacity, particleSize, pencilGlyphPath, polylinePath, polylinesPath, poseMatrix, prefersReducedMotion, projectOnSphere, readLineStream, renderAvatarDataUrl, renderStaticSvg, renderStaticSvgDataUrl, resolveEmotionId, resolveLineWeight, resolveSpriteFrames, resolveStyleOptions, ribbonColor, ribbonRuns, roundTo, settleForState, settleSpring, shapeGenerators: generators_namespaceObject, shapeMaskImage, shapeRingMaskImage, smoothClosedPath, smoothstep, spring, springPosition, springSettleTime, springToLinearEasing, spriteCoverage, stateForActivity, stateForAgentEvent, stateForEmotion, stateForTool, stepSpring, streamChunks, tangentTransform, tangentTransformString, themeChoices, themeDefault, themeLabel, themeLook, themeOwning, themesNeeded, ticker, trailFrames, validateStyleOptions, wrapperFor, DEFAULT_STYLE_ID: __webpack_exports__DEFAULT_STYLE_ID, IDLE_STATE: __webpack_exports__IDLE_STATE };
globalThis.AoraPetPalette = {shadeHex,mixHex,faceInks,lineInks,hairShade,effectInks,partColorPair};
