# NOVA — "My Brain" prototype design

Owner: Nova (creative direction + interaction). Builds from: `docs/BRAIN_BRIEF.md`.
Content model (compartments, thoughts, synapses, trails) comes from Scout; this
document defines the experience and the system that content plugs into. Facts,
voice and the do-not-publish list in `STUDIO_SPEC.md` §1–2 and §5 still apply.

Working title on screen: **Bryan Agas — inside a calm builder's head.**

---

## 0. Three interpretations, one choice

| | A. Anatomical 3D point-cloud | B. Abstract neural constellation | C. Cross-section diagram |
|---|---|---|---|
| Idea | Full rotatable 3D brain of particles, orbit controls | Floating nodes + lines, brain only implied | Flat, labelled sagittal slice like a textbook plate |
| Wow | Highest at first glance | Pretty, familiar | Low |
| Legibility as navigation | Poor: regions hide behind each other when rotated; labels occlude; orbiting is a skill | Poor: reads as "another network graph", the brain metaphor disappears | Excellent: every region visible and labelled at once |
| Phone | Hard (orbit fights scroll) | OK | Excellent |
| Cliché risk | High (the "AI brain" stock render) | Very high (constellation-on-black) | Low but dull |

**Chosen: "The Sagittal Lamp" — C's legibility, A's material.** A side-on
(sagittal) brain built from ~9k warm particles with real depth, shown from one
readable angle and only *swaying* (never orbiting) a few degrees so the volume
is felt. Every compartment is visible and labelled at all times, because the
side view shows all seven regions plus the brainstem without occlusion. Depth
comes from particle z, parallax and pathways that arc *in front of* the
cortex. It is a textbook plate that is alive.

Why it is the strongest: the brief's hard rule is "the brain IS the
navigation and it must be obvious". Only a fixed, readable view guarantees
that; the particle material and the signal system supply the cinema. It also
degrades cleanly: reduced motion = the same plate, still; no WebGL = the
same plate as SVG.

**Identity (anti-cliché):** not a cold sci-fi brain. It is lit like a
meditation hall or a kitchen at night: warm charcoal ground, candle/lamp
amber, chalk white. Signals fire to a **salsa count** (1-2-3, pause, 5-6-7,
pause) and the whole brain **breathes** on a slow 10-second meditation
breath. Calm, clear, with rhythm underneath: that is Bryan.

---

## 1. Concept and region mapping

Front of the brain faces **right** (the direction of reading = forward
thinking). Mapping follows what each region actually does, so the metaphor
holds if anyone checks:

| Compartment (id) | Region | Why |
|---|---|---|
| MINDSET (`mindset`) | Prefrontal cortex (front, lower-front) | Judgement, values, self-regulation: calm, clarity, agreement, privacy |
| IDEAS (`ideas`) | Superior frontal lobe (top-front) | Imagination, planning, holding ideas before they act |
| CURRENT WORK (`current`) | Motor cortex strip (top-centre) | The strip that turns intention into movement: what he is doing now |
| EXPERIMENTS (`experiments`) | Parietal lobe (top-back) | Integration, sensing, numbers, spatial reasoning: data, AI, automation, agents |
| PROJECTS (`projects`) | Occipital lobe (back) | The visual cortex: the things he has made that you can see |
| EXPERIENCE (`experience`) | Temporal lobe + hippocampus (lower-middle) | Long-term memory: shop floor, sales, kitchens, code |
| SKILLS (`skills`) | Cerebellum (lower-back) | Procedural skill learnt by repetition: practice becomes instinct |
| *(contact)* | Brainstem, labelled **SIGNAL OUT** | The nerve that carries signals out to the world: "Say hello" |

The brainstem is not a compartment; it is the persistent contact CTA in the
scene (wow moment 5).

### Content contract the engine expects (Scout maps onto this)

```js
const BRAIN = {
  compartments: [ // exactly 7, ids as above
    { id:'projects', label:'Projects', region:'Occipital lobe',
      line:'What I have built.',           // ≤ 60 chars, shown in panel + plain view
      nodes:[ // 3–6
        { id:'both-homes', title:'Both Homes', kicker:'Product · 2026',
          summary:'≤ 140 chars, shown in node list',
          body:['paragraph', 'paragraph'],   // ≤ 120 words total
          facts:['iOS (TestFlight)','Web app','Free + Plus'], // optional mono row
          links:[{label:'bothhomes.co.uk', href:'https://bothhomes.co.uk', external:true}],
          provenance:'verified' | 'observed' } // 'observed' renders a "to confirm" tag
      ]},
  ],
  synapses: [ // ~25, always cross-compartment, undirected for drawing, directed for reading
    { from:'projects/both-homes', to:'skills/typescript-react', label:'built with' } // label ≤ 28 chars
  ],
  trails: [ // exactly 3, 4–6 steps each, consecutive steps should be synapse-linked
    { id:'calm', title:'Why calm beats clever', intro:'≤ 120 chars',
      steps:[ { node:'projects/both-homes', note:'≤ 160 chars, the narration for this step' } ] }
  ]
};
```

Node ids are kebab-case, unique within a compartment. If two consecutive trail
steps are not linked by a synapse, the engine draws a temporary pathway
(rendered identically, label "then").

---

## 2. Scene

### 2.1 Tech

- three.js **r128 UMD** from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. No addons. `THREE.Points` + one custom `ShaderMaterial` for the cortex; one merged `THREE.LineSegments` for pathways; one `THREE.Points` pool for signals; one small `Points` for thought nodes.
- If `window.THREE` is missing after load or `WebGLRenderingContext` fails: set `data-fallback="svg"` on `<html>`, show the inline SVG plate (§2.9) and everything else works identically.
- All DOM labels are HTML positioned from projected 3D anchors each frame (only when the camera moved; cache otherwise).

### 2.2 Brain space and silhouette

Brain units: x ∈ [−1, 1] (−1 = back, +1 = front), y up, z toward the viewer.
Shapes (all in brain units):

| Part | Shape |
|---|---|
| Cerebrum | ellipse C1 centre (0.02, 0.10) rx 0.96 ry 0.56, unioned with temporal ellipse C2 centre (0.08, −0.27) rx 0.60 ry 0.25; then clip away y < −0.47 |
| Sylvian fissure | quadratic curve (0.50, −0.10) → ctrl (0.15, −0.02) → (−0.30, 0.00); particles within 0.022 of it are discarded (visible gap separating EXPERIENCE) |
| Cerebellum | ellipse centre (−0.60, −0.43) rx 0.31 ry 0.19, excluding anything inside C1 |
| Brainstem | capsule from (−0.26, −0.38) to (−0.38, −0.95), radius 0.075 |

Depth: for a point (x, y) inside the cerebrum, max half-thickness
`h = 0.42 * sqrt(max(0, 1 − ((x−0.02)/0.96)² − ((y−0.10)/0.62)²))`; z =
`h * (2u − 1)` with `u` biased to the surfaces (`u = 0.5 + 0.5*sign(r)*|r|^0.35`,
r ∈ [−1,1]) so the shell is denser than the core. Cerebellum h = 0.22·(same
formula on its ellipse); brainstem h = 0.07.

### 2.3 Particle generation (once, at load, seeded)

- RNG: `mulberry32(1235)` (salsa "1-2-3, 5"): deterministic layout every visit.
- Rejection-sample (x, y) in the bounding box until the budget is met (§6.3).
- **Gyri texture:** accept with probability `0.45 + 0.55 * |sin(9.0*x + 3.0*sin(7.0*y) + 1.7*sin(4.0*x*y))|` → curved fold striations without a noise library.
- **Region assignment:** cerebellum → `skills`; brainstem → `stem`; temporal (below the Sylvian curve and inside C2) → `experience`; the rest of the cerebrum → nearest seed (weighted Voronoi):

| Region | Seed (x, y) | weight |
|---|---|---|
| mindset | (0.80, −0.02) | 1.00 |
| ideas | (0.45, 0.42) | 1.00 |
| current | (0.03, 0.52) | 0.85 (narrower: a strip) |
| experiments | (−0.42, 0.40) | 1.00 |
| projects | (−0.80, 0.02) | 1.00 |

  Distance used: `d / weight`. Discard particles whose two nearest weighted distances differ by < 0.016 → visible **sulci** between regions.
- Attributes per particle: `position` (vec3), `region` (float 0–7), `phase` (0–2π), `size` (0.7–1.3, 8% of particles 1.8 = "bright neurons").

### 2.4 Thought nodes, label anchors

- Each region has a centroid (computed: mean of its particles) and 6 node slots = centroid + `s·offset`, offsets `[(0,0), (0.13,0.07), (−0.13,0.06), (0.11,−0.08), (−0.11,−0.08), (0,0.14)]`, scale s: mindset 0.9, ideas 1.0, current 0.75, experiments 1.0, projects 0.85, experience 1.0 (with y offsets ×0.6), skills 0.8 (×0.6 y). z = +0.9·h at that point (on the visible surface). Node i takes slot i. Clamp each slot inside its region (nudge toward centroid until inside).
- Node render: a 7px (CSS) disc in the region hue + a 1px ring at 14px that only appears when the region is open. Node labels are DOM (see §4.4).
- Label anchors (where the leader line touches the brain) and label side, desktop:

| Region | Anchor | Label placed |
|---|---|---|
| ideas | (0.50, 0.50) | above-right |
| current | (0.03, 0.62) | above |
| experiments | (−0.45, 0.50) | above-left |
| projects | (−0.95, 0.05) | left |
| skills | (−0.75, −0.55) | below-left |
| experience | (0.20, −0.42) | below |
| mindset | (0.92, 0.00) | right |
| stem (SIGNAL OUT) | (−0.34, −0.92) | right of stem bottom |

Leader line: 1px `--rule-strong`, 18–40px long, ending in a 3px dot on the
anchor.

### 2.5 Camera

- `PerspectiveCamera(fov 30)`. Overview: distance chosen so brain width (2.0 + label room) fits 74% of the visible stage width (desktop) or 92% (phone portrait), and height ≤ 78% of stage height.
- **Visible-area centring:** the stage canvas is always full-bleed; when the panel or sheet covers part of it, use `camera.setViewOffset` so the focus point is centred in the *uncovered* rect. Never resize the canvas for panel moves.
- **Idle sway:** yaw = 7°·sin(t·2π/26s), pitch = 2°·sin(t·2π/19s). Desktop pointer parallax adds yaw ±6°, pitch ±3° (lerp 0.06/frame). Never orbit beyond ±14° total.
- Focus a region: target = region centroid; distance so the region bbox fills 58% of visible height; yaw toward the region (front regions −6°, back +6°). 900ms, ease `--ease-travel`.

### 2.6 Cortex shader (look)

- Additive blending, `depthWrite false`. Point size = `size * base * dpr * (1/(-mvPosition.z)) * k`, base 2.4 CSS px at overview distance, clamp 1–6 device px.
- Colour = mix(`--chalk` #F1EADF, region hue, tint), alpha = 0.42·twinkle·breath·focusDim.
  - tint: 0.28 idle, 0.65 hovered region, 0.9 open region.
  - twinkle: `0.86 + 0.14*sin(uTime*0.8 + phase)`.
  - breath: `0.94 + 0.06*sin(uTime*2π/10)` (10s cycle = 6 breaths/min). Same factor scales the whole mesh `1 + 0.004*sin(...)`.
  - focusDim: 1.0 for the open region and the stem; 0.38 for others when a region is open; 1.0 for all at overview.
  - beat accent: `+ 0.10 * uBeat` on all particles (uBeat = envelope set to 1 on count 1 and 5, decays exp(−t/180ms)).
- Hover "wake": region's particles z += 0.035·normal(z sign) over 220ms and size ×1.15 — the region physically lifts toward you.
- Brainstem particles: `--lamp` tint 0.5 always; the stem has its own slow upward-downward pulse (see §2.7).

### 2.7 Neural flow: pathways and signals

**Pathways** (one per synapse + 12 "trunk" pathways between adjacent region
centroids for ambient life: mindset–ideas, ideas–current, current–experiments,
experiments–projects, projects–skills, skills–experience, experience–mindset,
experience–current, ideas–experiments, mindset–current, projects–experience,
skills–stem):

- Cubic Bézier P0 → P3 (node positions). Control points: `P1 = lerp(P0, H, 0.55)`, `P2 = lerp(P3, H, 0.55)` where hub H = (−0.05, 0.12, 0) (the corpus callosum), then push P1/P2 z by `+0.30 + 0.15·|P0.x − P3.x|` so every curve arcs **in front of** the cortex and stays readable.
- Sample each to 48 points; merge all into one `LineSegments` with per-vertex colour (gradient from source hue to target hue) and a per-vertex `pathId` for opacity.
- Opacity: 0.08 idle; 0.40 for pathways touching the hovered/open region; 0.85 for the active synapse / trail route. Trunks never exceed 0.15 and are never interactive.

**Signals:**
- A signal = head + 10 trail samples along a pathway. Pool of 32 signals (desktop) / 12 (phone), so a fixed 352/132-point buffer. No allocation per frame.
- Head: 7px CSS, colour lerps from source hue to target hue along t; trail alpha `0.9·(1 − i/10)²`, size ×(1 − i/14).
- Speed: ambient 0.55 brain units/s (≈1.4–2.2s per path), eased `easeInOutSine` on t. Follow-a-synapse signal: fixed 900ms, `easeInOutCubic`, head 10px, trail 16.
- Arrival: target node blooms (ring 7→28px, alpha 0.8→0, 420ms) and 40 nearby particles (precomputed nearest list) flash +0.3 brightness, 300ms.

**Rhythm: the salsa count.** A global clock at **92 BPM** (beat = 652ms), bar of
8 counts.
- Counts **1, 2, 3, 5, 6, 7** fire; **4 and 8 rest** (the salsa pause).
- Counts 1 and 5 are accents: fire 2 signals and set `uBeat = 1`; the hint dot (§4.1) pulses on count 1 only.
- Signal choice: at overview, pick a random pathway (synapse 70% / trunk 30%), random direction, skipping any used in the last 2 bars. With a region open, 75% of spawns use synapses touching that region, travelling **outward** from it (the visitor sees where this region connects).
- Cap concurrent ambient signals: desktop 14, phone 6. User-triggered signals always fire (they use reserved pool slots 0–3).
- **Brainstem pulse:** every 2 bars on count 1, one signal runs from the cerebellum down the stem and off-canvas (the "signal out").

**Idle intensifies:** after 8s without input at overview, spawn rate doubles
on counts 1 and 5 for one bar every 4 bars (a "thought surfacing"), and the
target node of that bar's last signal shows its title as a ghost label for
1.8s (fade 300ms). This teaches that nodes exist without words.

### 2.8 Pointer

- Hit-testing is done on DOM, not raycasting, for compartment labels. For the brain body: a 2D lookup — project the pointer into brain space (invert view at z=0), test the region shape rules from §2.3 (same function used for generation). Cheap and exact.
- Cursor over the brain body: `cursor: pointer`; region hover = wake (§2.6) + label hover style + pathways for that region to 0.40.
- Particles within 0.08 of the pointer brighten +0.2 (shader uniform `uPointer`), desktop only. Subtle attention, no repulsion.

### 2.9 SVG plate (fallback and reduced-data)

Inline SVG of the same silhouette (paths generated from the shape functions at
build time by the engineer, or hand-drawn from the coordinates above): region
fills at 18% of their hue, sulci as 2px `--night` gaps, labels as the same DOM
buttons. Used when WebGL is unavailable. Not used for reduced motion (that
keeps WebGL, static).

---

## 3. States and transitions

Routes are plain hashes; every state below has one, and `hashchange` is the
single source of truth (UI actions set the hash; the router renders).

| Hash | State |
|---|---|
| `` / `#` | Overview |
| `#projects` | Compartment open |
| `#projects/both-homes` | Node open |
| `#trail/calm/2` | Trail `calm`, step 2 (1-based) |
| `#plain` | Plain view |
| `#plain/projects` | Plain view scrolled to that compartment |
| `#hello` | Signal out / contact panel |

Unknown hashes → overview + polite announcement "That part of the brain
wasn't found, showing the whole brain."

### 3.1 Intro: "First breath" (≤ 2.6s, skippable)

- **Frame 0 (meaningful):** the full brain is already there at 60% brightness with all 8 labels visible, the header name, and the hint. Nothing is hidden behind the animation; a visitor can click a label at t = 0.
- 0–1.3s: a wave sweeps **front to back** (x from +1 to −1) raising particle brightness to 100%: the brain "wakes". Labels fade from 60% to 100% opacity in the same order (mindset → ideas → current → experiments → projects → experience → skills), 120ms stagger.
- 1.3–2.6s: first bar of the salsa count: 6 signals on counts 1-2-3, 5-6-7 at intro tempo (≈200ms per count), each running between two adjacent regions, ending with the brainstem signal. Then normal 92 BPM clock.
- Skip: any pointer down, key press, wheel or touch; plus a visible "Skip intro" text button (top-right, first in tab order after skip-link, removed after the intro). Skipping jumps to the end state in 1 frame.
- Played once per session (`sessionStorage` flag, try/catch). Not played if the page loads on a deep link (go straight to that state) or reduced motion.

### 3.2 Overview

Brain centred in the stage, labels on leader lines, ambient firing, hint
visible. Header + trails button + plain view + say hello always reachable.

### 3.3 Hover / focus a compartment (pointer over region or label, or keyboard focus on label)

- 0–220ms: region wakes (lift + tint 0.65), its pathways to 0.40, the other regions stay 100% (no dimming on hover: dimming only on open).
- Label: text goes from `--chalk-2` to region hue, a 2px underline in region hue grows left→right (180ms), and a one-line preview appears under the label: the compartment `line` + count ("What I have built · 5 thoughts"). On touch devices there is no hover; first tap opens.
- Keyboard focus shows the same plus the focus ring on the label.

### 3.4 Open a compartment (`#skills`)

1. t=0: the label you used becomes the active label (filled pill, region hue at 16% bg, text region hue). Others go to `--chalk-3`.
2. 0–900ms: camera travels to the region (§2.5); other regions dim to 0.38; the region's pathways to 0.40; node discs scale in from 0 with 40ms stagger.
3. 120–520ms: panel slides in from the right (desktop, `translateX(24px)→0`, opacity 0→1, 400ms `--ease-out`). Mobile: bottom sheet rises to the **half** snap.
4. 900ms: first ambient signal from this region fires on the next count.
5. Focus moves to the panel heading (`tabindex=-1`); live region: "Skills opened. Cerebellum. 4 thoughts."

Switching directly from one open compartment to another: camera travels
region→region (900ms) while the panel crossfades content (200ms out, 200ms in);
one signal travels from the old region's centroid to the new one along their
trunk, so movement always has a cause.

### 3.5 Open a thought (`#projects/both-homes`)

- Panel switches to **detail level** (slides content left 24px/fades, 240ms). Breadcrumb: `Brain / Projects / Both Homes`.
- Scene: camera eases 25% closer to the node (600ms); the node gets a steady 14px ring and a soft halo; all synapses from this node go to 0.85 with their **labels drawn on the pathway midpoint** as small DOM chips (max 6, collision-avoided vertically by 22px).
- Live region: "Both Homes. Product, 2026. 4 connections."

### 3.6 Follow a synapse ("connected thoughts")

Triggered by a connection row in the detail panel, or a pathway label chip in
the scene.

1. 0ms: the chosen pathway goes to 0.95 opacity; the others drop to 0.05.
2. 0–900ms: a single bright signal (follow-signal, §2.7) leaves the current node and travels to the target node. The camera travels **with it**: focus point = lerp(source, target, eased t), zoom pulls back 12% at the midpoint and returns (a breath out, breath in). Panel content fades to 40% opacity (not removed).
3. 900ms: arrival bloom on the target node; target region becomes the open region (dimming swaps); panel content swaps to the target node (200ms crossfade), breadcrumb updates, and a small "came from" line at the top: `← from Both Homes · built with` (a button that follows the synapse back).
4. Hash becomes `#skills/typescript-react` (pushState, so Back retraces the thought).
5. Live: "Followed 'built with' to TypeScript and React, in Skills."

### 3.7 Guided trails

- Entry: "Trails" button in the header opens a trail picker (desktop: popover anchored to the button; phone: sheet at half). Each trail: title, intro, step count, "Start →". Also shown in the overview hint as one direct link: "or follow a trail: *Why calm beats clever* →".
- In a trail, the panel shows a **trail bar** pinned at its top:
  `TRAIL · Why calm beats clever        2 / 5`
  `[← Back]  [Next thought →]  [Exit trail]` + a 5-segment progress line in `--lamp`.
  Under it, the step `note` (Instrument Serif italic, 1.25rem), then the normal node detail.
- Next = a follow-synapse transition (§3.6) to the next step's node. Walked pathways **stay lit** in `--lamp` at 0.7 for the whole trail: by the end the visitor sees the thought drawn across the brain. Last step shows "End of trail: the whole thought" and replays the route as one continuous signal (1.8s), then offers the other two trails + "Say hello".
- Keyboard in trail: buttons only (no single-key shortcuts). Exit returns to the trail's last node in normal mode.

### 3.8 Back / Escape

- Esc and the panel's close/back control step up one level: node → compartment → overview; trail → exit trail (stay on the node); plain view → previous state; trail picker/hello → close.
- Browser Back works throughout (every state change is a history entry, except hover and camera sway).
- Focus return: closing a level returns focus to the control that opened it (stored per level); overview return focuses the compartment label last opened.
- Clicking empty canvas (not on brain body) at compartment level = Esc.

### 3.9 Signal out (`#hello`)

Click the SIGNAL OUT label, the brainstem, or the header "Say hello":
a lamp-coloured signal runs from the current focus point (or the cerebellum)
**down the brainstem and off the bottom of the stage** (700ms), then the hello
panel opens: heading "Say hello", one line ("I'm looking for junior or
product-minded developer roles, and people building calm tools."), and two
large links: LinkedIn ↗ (`linkedin.com/in/bryanagas`), GitHub ↗
(`github.com/BryanAgas`). No email, no phone, no form in the prototype.

---

## 4. UI chrome

### 4.1 Desktop layout (≥ 1024px)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Bryan Agas                                  Trails  Plain view  [Say hello]│ 64px header, transparent over stage
│ I build calm software for the parts of life that get messy.             │ (mono status under name)
│                                                                        │
│            ideas ─╮       current                                      │
│   experiments ─╮  │  ╭─                    ┌──────────── PANEL ───────┐│
│                 (  BRAIN  STAGE  )  ─ mindset│ 440px, right, inset 16px  ││
│   projects ─                                │                          ││
│          skills ─╯  experience  SIGNAL OUT  │                          ││
│                                            └──────────────────────────┘│
│         ● Hover a region to wake it. Click to look inside.            │ hint, bottom-centre
└────────────────────────────────────────────────────────────────────────┘
```

- Stage: full viewport (`100dvh`), canvas `position:fixed; inset:0`.
- **Header** (top-left): name in Instrument Serif 1.75rem `--chalk`; under it the positioning line in Hanken 0.9375rem `--chalk-2` (max-width 36ch); under that a mono status `NOW · SHIPPING BOTH HOMES ON iOS AND THE WEB` `--chalk-3`. Top-right: `Trails` and `Plain view` as text buttons (mono 0.8125rem caps, `--chalk-2`, hover `--chalk`), and `Say hello` as the single primary button (fill `--lamp`, text `--night`, radius 999px, 40px tall).
- **Compartment labels** (= the compartment index): 7 `<button>`s + SIGNAL OUT, absolutely positioned at the leader-line ends. Mono 0.8125rem, caps, letter-spacing 0.08em, `--chalk-2`; a 8px colour dot in the region hue before the text; the count in `--chalk-3` after ("SKILLS 4"). Min hit area 44×32px. Collision rule: if two label boxes overlap after projection, push the lower-priority one (order in DOM) outward along its side direction by the overlap + 8px.
- **Hint**: bottom-centre, mono 0.8125rem `--chalk-2`, preceded by a 6px `--lamp` dot that pulses on salsa count 1. Text: "Hover a region to wake it. Click to look inside." + newline link "or follow a trail →". Hidden once any compartment has been opened (session), replaced by nothing.
- **Panel**: `position:fixed; right:16px; top:80px; bottom:16px; width:440px`, solid `--surface` (no blur, no transparency), 1px `--rule` border, radius `--r-panel` 14px, internal scroll, padding 28px. Top edge carries a 3px bar in the region hue (the only "colour fill" in the panel).
  - Compartment level: eyebrow mono `OCCIPITAL LOBE · PROJECTS` in region hue; H2 (Instrument Serif 2.25rem) = compartment label; `line` (Hanken 1.0625rem `--chalk-2`); then the **thought list**: each a full-width button row: title (Hanken 600 1.0625rem `--chalk`), summary (0.9375rem `--chalk-2`, 2 lines max), right side mono count of connections `3 →`. Rows separated by 1px `--rule`, hover = `--surface-2` bg + node ring shown on the brain (two-way highlight: hovering a row lights the node; hovering a node lights the row). Footer: "Connected regions" — small chips of the regions this compartment links to, each opening that region.
  - Detail level: breadcrumb (mono small, buttons); optional "came from" line; kicker (mono, region hue); H2 title; body paragraphs (Hanken 1.0625rem/1.65, max 60ch); facts row (mono 0.8125rem, separated by ` · `); links (text links with → or ↗); provenance tag if `observed`: mono `TO CONFIRM` in `--chalk-3` with 1px dashed border, tooltip-free (plain text in plain view explains it); then **Connected thoughts**: one row per synapse: `[dot in target hue] built with → TypeScript and React · Skills`. Activating follows the synapse (§3.6).
  - Top-right of the panel: a text button `Back` (detail level) or `Close` (compartment level), mono caps, with a small `ESC` key hint beside it on desktop only. No ✕ glyph.
- **Plain view** (`#plain`): replaces stage + panel with a scrolling document on `--night` (the canvas pauses and is hidden). H1 "Bryan Agas"; positioning line; a 7-item table of contents; then each compartment as an `<h2>` section with region name, line, and every thought as `<h3>` + body + facts + links + "Connects to:" list of in-page links (`#plain/skills` anchors with ids). Then Trails as ordered lists, then Say hello. Max width 68ch, Hanken body. This is also the content of `<noscript>`. Toggle back: "Brain view" button in the same header position.

### 4.2 Contact CTA placement

Always: header `Say hello` (primary) + SIGNAL OUT label in the scene. End of
each trail and the last row of every compartment panel: `Say hello →` text link.

---

## 5. Design tokens

**Theme decision: one committed dark look, "lamp-lit".** The glow and depth of
a particle brain need a dark ground; a light variant would turn the cortex
into grey dust and double the QA surface. Since the artifact viewer may be
light, every colour is explicit, `html{color-scheme:dark}` and
`body{background:var(--night)}` are set, and nothing inherits from the host.
It is a warm charcoal, not black, so it reads as a room with a lamp on, not
"hacker terminal".

### 5.1 Colour (contrast measured, WCAG 2.x)

| Token | Hex | Use | vs `--night` | vs `--surface` | vs `--surface-2` |
|---|---|---|---|---|---|
| `--night` | `#14110F` | page / stage background | — | — | — |
| `--surface` | `#1D1916` | panel, sheet | — | — | — |
| `--surface-2` | `#27211D` | row hover, chips | — | — | — |
| `--rule` | `#3A322C` | hairlines (non-text) | 1.5 | | |
| `--rule-strong` | `#5A4E44` | leader lines, focus-adjacent (non-text, ≥3:1 not required for decorative) | | | |
| `--chalk` | `#F1EADF` | primary text | 15.7 | 14.6 | 13.3 |
| `--chalk-2` | `#BDB2A3` | secondary text, labels | 9.0 | 8.4 | 7.6 |
| `--chalk-3` | `#9A8F82` | tertiary (counts, status) | 5.9 | 5.5 | 5.0 |
| `--lamp` | `#F2B35E` | primary CTA fill, focus ring, trail route, hint dot | 10.2 | 9.5 | 8.6 |
| text on `--lamp` | `#14110F` | CTA label | 10.2 | | |

Region hues (used for text too, all ≥ 6.4:1 on every surface):

| Region | Name | Hex | vs night / surface / surface-2 |
|---|---|---|---|
| projects | Ember | `#F0A35E` | 9.1 / 8.4 / 7.7 |
| skills | Chalk blue | `#9DBCE0` | 9.6 / 8.9 / 8.1 |
| experience | Clay | `#E68F72` | 7.6 / 7.1 / 6.5 |
| mindset | Sage | `#9FCBA8` | 10.4 / 9.6 / 8.8 |
| current | Lamplight | `#F4D58D` | 13.2 / 12.3 / 11.2 |
| experiments | Sea glass | `#74C4BE` | 9.3 / 8.6 / 7.9 |
| ideas | Rose | `#E7A2BC` | 9.2 / 8.6 / 7.8 |
| stem (signal out) | uses `--lamp` | | |

In WebGL, hues are converted to linear and the particle base is `--chalk`.
Focus ring: `2px solid var(--lamp)`, `outline-offset 3px`, on everything
(including canvas-adjacent labels); never removed.

### 5.2 Type (Google Fonts, `display=swap`)

```
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap
```

| Role | Family | Size / line-height | Notes |
|---|---|---|---|
| Name / display | Instrument Serif 400 | clamp(1.5rem, 1.1rem + 1.2vw, 1.875rem) / 1.1 | italic for emphasis words |
| Panel H2 | Instrument Serif 400 | clamp(1.875rem, 1.5rem + 1vw, 2.25rem) / 1.1 | |
| Trail note | Instrument Serif italic | 1.25rem / 1.35 | narration voice |
| Body | Hanken Grotesk 400 | 1.0625rem / 1.65 | max 60ch |
| Row title | Hanken Grotesk 600 | 1.0625rem / 1.3 | |
| Small | Hanken Grotesk 400 | 0.9375rem / 1.5 | |
| Labels, eyebrows, facts, counts | IBM Plex Mono 500 | 0.8125rem / 1.2, caps, +0.08em | region labels, status, breadcrumb |
| Pathway chips | IBM Plex Mono 400 | 0.75rem / 1 | lowercase, `--chalk-2` on `--surface-2` |

Fallbacks: `Georgia, serif`; `system-ui, sans-serif`; `ui-monospace, monospace`.

### 5.3 Spacing, radius, elevation

- Spacing scale (4px base): `--s1 4, --s2 8, --s3 12, --s4 16, --s5 24, --s6 32, --s7 48, --s8 64`.
- Radius: `--r-chip 999px` (buttons, chips, labels when active); `--r-panel 14px`; `--r-row 8px`.
- No shadows except panel: `0 24px 60px -20px rgba(0,0,0,.6)`. No backdrop blur anywhere.

### 5.4 Motion

| Token | Value | Use |
|---|---|---|
| `--t-fast` | 160ms | hover colour, underline |
| `--t-ui` | 240ms | panel content swaps |
| `--t-panel` | 400ms | panel / sheet enter |
| `--t-travel` | 900ms | camera travel, follow-signal |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | UI |
| `--ease-travel` | `cubic-bezier(.65,0,.35,1)` | camera |
| beat | 652ms (92 BPM), 8-count bar, rests on 4 and 8 | signals, hint dot |
| breath | 10s sine | cortex brightness/scale |

---

## 6. Mobile, performance, reduced motion, accessibility

### 6.1 Phone portrait (< 720px): designed, not squashed

```
┌──────────────────────────┐
│ Bryan Agas      [Hello]  │ 56px header: name + primary pill; "☰"-free:
│ calm software, messy life│ second row = Trails · Plain view (mono links)
│                          │
│     ideas  current       │
│ exper.  ( BRAIN )  mind. │ stage = top 52dvh (brain fits width 92%)
│ proj.               ...  │
│  skills  experience  ⤓   │
├──────────────────────────┤
│ ═══  (sheet handle)      │ bottom sheet, peek 112px
│ Tap a region to look in. │
│ [Projects][Skills][Exp…] │ peek shows hint + a horizontal strip
└──────────────────────────┘
```

- **Labels on the brain** stay (same 7 buttons + SIGNAL OUT), short forms where needed: `CURRENT` for Current work, `EXPERIMENTS` keeps. Mono 0.75rem, leader lines shortened to 10–16px, placement pushed to top row (ideas, current, experiments), sides (projects, mindset), bottom row (skills, experience, SIGNAL OUT). Hit area ≥ 44×44 (padding grows, text doesn't).
- The peek strip in the sheet is **not a second nav**: it shows "Tap a region to look in" and the "Follow a trail →" link. (Avoids duplicate controls for screen readers.)
- **Bottom sheet** (non-modal `role="region"`): snaps **peek 112px / half 56dvh / full 92dvh**. Opening a compartment → half; opening a thought → full; following a synapse drops the sheet to **half** for the 900ms travel (so the signal is visible in the stage above), then back to full. The stage's view offset always centres the focus point in the uncovered area above the sheet.
- Gestures:
  - Tap region or label → open. Tap a node disc (hit radius 22px) → open thought.
  - **Horizontal swipe on the stage** (≥ 48px, < 400ms, |dx| > 1.5|dy|) → previous/next compartment in ring order: mindset → ideas → current → experiments → projects → skills → experience → mindset. The page itself never scrolls in brain view; the canvas has `touch-action: none` and the sheet manages its own drag and inner scroll (`overscroll-behavior: contain`).
  - Sheet handle / sheet header: drag between snaps (velocity > 0.5px/ms advances one snap); tap handle toggles half/full. Swipe down from peek does nothing.
  - No pinch zoom, no rotate. Device tilt is not used.
  - Android/iOS Back = browser back = one level up (history entries).
- **Phone landscape** (height < 500px): desktop arrangement in miniature: stage left 55%, panel right 45% full height, header collapses to name + Hello.
- **Tablet** 720–1023px: desktop layout, panel 380px.

### 6.2 Performance budget

| | Desktop | Low-power laptop* | Phone |
|---|---|---|---|
| Cortex particles | 9,000 | 6,000 | 3,500 |
| Max ambient signals | 14 | 10 | 6 |
| DPR cap | min(dpr, 2) | min(dpr, 1.5) | min(dpr, 1.75) |
| Draw calls | ≤ 5 (cortex, pathways, signals, nodes, halo) | same | same |

\* `navigator.hardwareConcurrency ≤ 4` or adaptive downgrade.

- **Adaptive:** measure mean frame time over a 2s window after the intro; if > 19ms, lower DPR by 0.25 (min 1) and `setDrawRange` the cortex to 70%; re-check once more; then lock.
- **Pause:** `visibilitychange` (hidden → stop rAF), `IntersectionObserver` on the stage (plain view hides it → stop), and when the panel is at full on phones the scene renders at 30fps (the stage is mostly covered).
- **Zero per-frame allocation**: preallocated typed arrays; signals update a `Float32Array` and set `needsUpdate` on one attribute range.
- Label projection only when camera matrix changed (compare `matrixWorld.elements` checksum).
- Budgets: JS (inline) ≤ 60 KB unminified excl. three.js; first meaningful frame ≤ 1.2s on a mid laptop after three.js is cached; generation of 9k particles ≤ 40ms (rejection sampling with a capped attempt count 60k).
- Resize: debounce 120ms, recompute camera fit + label layout; no particle regeneration.

### 6.3 Reduced motion (`prefers-reduced-motion: reduce`)

- No intro; no sway, no breath, no twinkle, no parallax, no travelling signals, no ambient firing, no beat. The brain renders **once** (and again only on state change / resize). It is a still, lit plate.
- Camera changes are instant (0ms). Panel/sheet appear with opacity only, 0ms.
- Follow a synapse: the pathway is drawn lit (static, 0.95) for the destination state, plus the "came from" line; no travelling signal.
- Trail route: walked pathways are drawn lit statically.
- The OS setting is the only switch (no extra toggle); plain view is the further fallback.

### 6.4 Accessibility

DOM skeleton and order (= focus order):

```html
<a class="skip" href="#plain">Skip to the plain list of everything</a>
<button class="skip-intro">Skip intro</button>           <!-- only during intro -->
<header>
  <p class="name">Bryan Agas</p> <p>…positioning line…</p> <p class="status">…</p>
  <nav aria-label="Site">
    <button aria-haspopup="dialog" aria-expanded="false">Trails</button>
    <a href="#plain">Plain view</a>
    <a class="cta" href="#hello">Say hello</a>
  </nav>
</header>
<main>
  <section aria-label="Brain map" class="stage">
    <canvas aria-hidden="true"></canvas>
    <nav aria-label="Compartments of the brain">
      <ul>  <!-- DOM order = ring order starting at Projects (what visitors want first) -->
        <li><button aria-controls="panel" aria-pressed="false" aria-describedby="d-projects">
              Projects <span class="count">5 thoughts</span></button>
            <span id="d-projects" hidden>Occipital lobe. What I have built.</span></li>
        … Current work, Skills, Experience, Mindset, Experiments, Ideas, Signal out (Say hello) …
      </ul>
    </nav>
    <ul class="node-buttons" aria-label="Thoughts in Projects"> <!-- buttons over node discs, only for the open region -->
  </section>
  <section id="panel" role="region" aria-labelledby="panel-h" tabindex="-1">…</section>
</main>
<div aria-live="polite" class="sr-only" id="announce"></div>
```

- The canvas is decorative (`aria-hidden`); everything it shows is in DOM.
- Node discs on the stage are real `<button>`s (transparent, 44px) with `aria-label="Both Homes, thought in Projects"`, only present for the open compartment. In the panel the same thoughts are a list of buttons; the stage buttons get `tabindex="-1"` to avoid duplication (pointer-only), the panel list is the keyboard path.
- Compartment buttons: `aria-pressed` reflects open state. Arrow keys (←/→/↑/↓) move focus between compartment buttons in ring order (roving within the nav; Tab leaves). Enter/Space opens.
- Panel: compartment level heading `h2`; thought list `<ul>` of `<button>`s; detail level heading `h2`, breadcrumb `<nav aria-label="Breadcrumb">`; Connected thoughts `<ul>` of buttons labelled "built with: TypeScript and React, in Skills. Follow this connection."
- Trail picker: `role="dialog" aria-modal="true"` on phone (it is a sheet that takes focus), popover with focus trap on desktop; Esc closes; focus returns to Trails button. Trail bar progress: `aria-label="Step 2 of 5"`.
- Hello panel: same panel region, not a modal.
- **Live announcements** (polite, debounced 150ms, last wins): compartment opened, thought opened, synapse followed, trail step ("Trail: Why calm beats clever. Step 2 of 5: …note…"), plain view on/off, unknown hash. Never announce ambient animation.
- Focus management: on open, focus heading (tabindex −1); on close, return to opener; never lose focus to `body`.
- No single-character global shortcuts. Esc is the only global key.
- All text meets ≥ 4.5:1 (table §5.1); labels never rely on colour alone (text + dot + count).
- Zoom: layout works at 200% browser zoom (labels switch to phone placement when stage < 720 CSS px).
- `lang="en-GB"`, `<title>Bryan Agas — inside a calm builder's head</title>`.

---

## 7. Wow moments (priority order) and cut list

1. **The salsa-count brain at rest.** Warm particle cortex, readable labelled regions, signals firing 1-2-3 (pause) 5-6-7 (pause) on a breathing brain. It must look premium in a still screenshot *and* feel alive in 3 seconds. (Includes the "First breath" intro.)
2. **Follow a synapse.** One bright signal leaves Both Homes, arcs in front of the cortex, the camera breathes out and in, and lands on the Skills node with a bloom while the panel swaps. This is the storytelling mechanic; it must be smooth at 60fps and make Back retrace it.
3. **Hover wakes a region.** The region lifts toward you, tints, and its pathways light outward, revealing where it connects before you click. Two-way highlight between panel rows and node discs.
4. **A trail draws a thought across the brain.** Walked pathways stay lit in lamp amber; the final step replays the whole route as one signal.
5. **Signal out.** Say hello sends a signal down the brainstem and off the screen before the contact panel appears.

Bonus if cheap: idle "thought surfacing" ghost labels (§2.7); pointer attention glow.

**Cut order if time is short** (cut from the top first):
1. Pointer attention glow and pointer parallax (keep sway).
2. Idle "thought surfacing" ghost labels.
3. Adaptive quality (keep the static caps by device class).
4. Final-step route replay on trails (keep lit route).
5. Pathway label chips in the scene (labels stay in the panel's Connected thoughts).
6. SVG fallback plate (replace with: no WebGL → open plain view automatically).
7. Phone landscape layout (portrait sheet layout used everywhere < 1024px).

**Never cut:** labelled regions visible at all times, the DOM compartment
nav + panel, follow-a-synapse with history, plain view, reduced motion, phone
bottom sheet, the salsa-count firing.
