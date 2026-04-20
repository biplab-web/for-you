'use strict';

// ── Elements ──────────────────────────────────────────────
const tree      = document.getElementById('tree');
const heart     = document.getElementById('heart');
const shapeWrap = document.getElementById('shapeWrap');
const rings     = document.getElementById('rings');
const poemWrap  = document.getElementById('poemWrap');
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');

// ── Poem lines ────────────────────────────────────────────
const lines = [
    "You are effortlessly beautiful,",
    "the kind of soul that makes everything lighter.",
    "Being around you feels like peace I didn't know I needed.",
    "You're fun, warm, and quietly amazing in ways words fail to hold.",
    "And no matter where life drifts,",
    "I'll always be there for you — in ways that matter."
];

// ── Canvas resize ─────────────────────────────────────────
function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Particles ─────────────────────────────────────────────
// Two modes: "dust" (tree phase) and "petals" (heart phase)
let heartPhase = false;

const DUST_COUNT  = 90;
const PETAL_COUNT = 55;

const dusts = Array.from({ length: DUST_COUNT }, () => makeDust(false));

function makeDust(fromBottom) {
    return {
        x:     Math.random() * window.innerWidth,
        y:     fromBottom ? window.innerHeight + 8 : Math.random() * window.innerHeight,
        r:     Math.random() * 1.8 + 0.4,
        vy:    -(Math.random() * 0.5 + 0.15),
        vx:    (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.15,
        color: Math.random() < 0.5 ? [178, 254, 250] : [255, 214, 231]
    };
}

// Rose petal shape (drawn as a small bezier)
const petals = [];

function makePetal() {
    const side = Math.random() < 0.5 ? -1 : 1;
    return {
        x:     Math.random() * window.innerWidth,
        y:     -20,
        size:  Math.random() * 9 + 5,
        rot:   Math.random() * Math.PI * 2,
        rotV:  (Math.random() - 0.5) * 0.04,
        vy:    Math.random() * 1.2 + 0.5,
        vx:    side * (Math.random() * 0.6 + 0.2),
        swing: Math.random() * Math.PI * 2,
        swingS: Math.random() * 0.02 + 0.01,
        alpha: Math.random() * 0.5 + 0.4,
        hue:   Math.random() * 30 + 340  // 340–370 → deep rose to pink
    };
}

function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    // Simple teardrop petal
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo( p.size * 0.8,  -p.size * 0.4,  p.size,       p.size * 0.6,  0, p.size * 1.2);
    ctx.bezierCurveTo(-p.size,         p.size * 0.6,  -p.size * 0.8, -p.size * 0.4, 0, 0);
    ctx.fillStyle = `hsl(${p.hue % 360}, 90%, 72%)`;
    ctx.fill();
    ctx.restore();
}

let lastPetalSpawn = 0;

function tick(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!heartPhase) {
        // Dust particles
        dusts.forEach((d, i) => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${d.color[0]},${d.color[1]},${d.color[2]},${d.alpha})`;
            ctx.fill();
            d.x += d.vx;
            d.y += d.vy;
            d.alpha -= 0.0006;
            if (d.y < -10 || d.alpha <= 0) dusts[i] = makeDust(true);
        });
    } else {
        // Spawn petals
        if (ts - lastPetalSpawn > 180 && petals.length < PETAL_COUNT) {
            petals.push(makePetal());
            lastPetalSpawn = ts;
        }
        // Draw & update petals
        for (let i = petals.length - 1; i >= 0; i--) {
            const p = petals[i];
            p.swing += p.swingS;
            p.x += p.vx + Math.sin(p.swing) * 0.5;
            p.y += p.vy;
            p.rot += p.rotV;
            drawPetal(p);
            if (p.y > window.innerHeight + 30) petals.splice(i, 1);
        }
        // Keep spawning
        if (petals.length < PETAL_COUNT && ts - lastPetalSpawn > 180) {
            petals.push(makePetal());
            lastPetalSpawn = ts;
        }
    }

    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ── Morph ─────────────────────────────────────────────────
function morph() {
    tree.classList.add('out');
    heart.classList.add('in');
    shapeWrap.classList.add('morphed');
    rings.classList.add('show');
    document.body.classList.add('morphed');
    heartPhase = true;
}

// ── Poem ──────────────────────────────────────────────────
function showPoem() {
    poemWrap.style.opacity = '1';
    lines.forEach((text, i) => {
        const el = document.getElementById(`pl${i}`);
        if (!el) return;
        setTimeout(() => {
            el.textContent = text;
            el.classList.add('show');
        }, i * 900);
    });
}

// ── Sequence ──────────────────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(morph,     3500);
    setTimeout(showPoem,  5800);
});
