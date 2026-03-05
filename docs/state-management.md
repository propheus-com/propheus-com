# Segment-Based Scroll System

## Overview

The hero uses a **segment-driven cinematic scroll controller**. Native scroll is completely locked during the hero sequence. Each scroll gesture auto-plays one segment's frame range (forward or reverse) via GSAP, with optional UI layer animations triggered by arrival segment index.

All frame ranges, durations, and UI mappings are configured in a single `SEGMENTS` array — no hardcoded frame numbers in the engine.

---

## Segment Configuration

Defined at the top of `PropheusExperience.ts`:

```ts
export const SEGMENTS: SegmentConfig[] = [
    { start: 0,   end: 65,  durationMultiplier: 1.3 },  // Slow initial reveal
    { start: 65,  end: 88  },
    { start: 88,  end: 118 },
    { start: 118, end: 159 },
    { start: 159, end: 179 },
    { start: 179, end: 211 },
];
```

| Field              | Type   | Description                                    |
|--------------------|--------|------------------------------------------------|
| `start`            | number | First frame of the segment                     |
| `end`              | number | Last frame of the segment                      |
| `durationMultiplier` | number? | Multiplied with base duration. Default: 1. >1 = slower, <1 = faster |

Total frame count is derived automatically: `SEGMENTS[last].end + 1`.

---

## Segment Table

| Seg | Frames    | Duration | Scene Description   | UI Changes                                           |
|-----|-----------|----------|---------------------|------------------------------------------------------|
| 0   | 0 → 65    | 1.69 s   | Initial manager     | "Goodbye to Dashboards & Data" text, navbar hides    |
| 1   | 65 → 88   | 0.46 s   | City establishing   | Headline + Topo + Weather panels, navbar shows       |
| 2   | 88 → 118  | 0.60 s   | City zoom / skyline | Consumer Sentiment panel                             |
| 3   | 118 → 159 | 0.82 s   | Store exterior      | Footfall (count-up) + Demand + Traffic panels        |
| 4   | 159 → 179 | 0.40 s   | Store interior      | Competitor (count-up) + Promo Watch panels           |
| 5   | 179 → 211 | 0.64 s   | Final manager       | Conclusion text + Recommendation strip               |

Duration = `|end − start| × 0.02 s/frame × durationMultiplier`

---

## Scroll Behaviour

### Forward

```
Page loads at frame 0 (idle state)
        ↓
Scroll gesture → advanceSegment()
        ↓
currentSegmentIndex is -1 → play segment 0 (frames 0 → 65)
        ↓
onComplete: currentSegmentIndex = 0
        ↓
Scroll gesture → play segment 1 (frames 65 → 88)
        ↓
...
        ↓
Scroll gesture → play segment 5 (frames 179 → 211)
        ↓
onComplete: currentSegmentIndex = 5
        ↓
Next scroll → disengageLock() → page scroll enabled
```

### Reverse

```
Scroll up → reverseSegment()
        ↓
currentSegmentIndex = 5 → play segment 5 reverse (211 → 179)
        ↓
onComplete: currentSegmentIndex = 4
        ↓
...
        ↓
currentSegmentIndex = 0 → play segment 0 reverse (65 → 0)
        ↓
onComplete: currentSegmentIndex = -1 (idle)
        ↓
Scroll up → nothing (already at idle)
```

---

## Scroll Lock Behaviour

| Event                          | Action                                    |
|--------------------------------|-------------------------------------------|
| Page load                      | Lock at idle (segment −1, frame 0)        |
| Advance past final segment     | Disengage lock, enable native scroll      |
| User scrolls back to top       | Re-lock at final segment index            |
| Reverse from final segment     | Lock remains, plays segments in reverse   |

---

## Duration Multiplier

Each segment's play duration is computed:

```
duration = |end − start| × SECONDS_PER_FRAME × (durationMultiplier ?? 1)
```

Where `SECONDS_PER_FRAME = 0.02`.

- Segment 0 has `durationMultiplier: 1.3` → 65 frames × 0.02 × 1.3 = **1.69 s**
- Segment 1 has no multiplier → 23 frames × 0.02 × 1 = **0.46 s**

To slow any segment, increase its `durationMultiplier`. To speed it up, use `< 1`.

---

## Lerp Smoothing

The ticker loop runs via `gsap.ticker` (single RAF):

```ts
this.currentFrame += (this.targetFrame - this.currentFrame) * 0.1;
```

Frame proxy tweens set `targetFrame`; the lerp smoothing filters the rendered frame index, creating smooth motion. No React state is used for frame control.

---

## UI Layer Integration

UI animations are keyed by **arrival segment**:

| Key        | Meaning                              |
|------------|--------------------------------------|
| `idle`     | Before any segment (frame 0)         |
| `segment0` | After segment 0 completes (frame 65) |
| `segment1` | After segment 1 completes (frame 88) |
| …          | …                                    |
| `segmentN` | After segment N completes            |

When playing segment N forward, UI triggers for `segmentN`.
When playing segment N in reverse, UI triggers for `segment(N−1)` (or `idle` if N = 0).

### Registered Elements

| ID                    | Selector              | Shows at   | Hides at   | Animation                          |
|-----------------------|-----------------------|------------|------------|------------------------------------|
| `seg0-text`           | `.seg0-text`          | segment0   | segment1   | fadeIn + slideDown → fadeOut + slideUp |
| `seg1-headline`       | `.seg1-headline`      | segment1   | segment2   | fadeIn + slideDown → fadeOut + slideUp |
| `seg1-topo`           | `.topo-panel`         | segment1   | segment2   | fadeIn + scaleUp (delay 0.15)      |
| `seg1-weather`        | `.weather-panel`      | segment1   | segment2   | fadeIn + scaleUp (delay 0.30)      |
| `seg2-sentiment`      | `.sentiment-panel`    | segment2   | segment3   | fadeIn + scaleUp                   |
| `seg3-footfall`       | `.footfall-panel`     | segment3   | segment4   | fadeIn + scaleUp                   |
| `seg3-footfall-count` | `.footfall-count`     | segment3   | —          | countUp → 2847 (delay 0.3)        |
| `seg3-demand`         | `.demand-panel`       | segment3   | segment4   | fadeIn + scaleUp (delay 0.15)      |
| `seg3-traffic`        | `.traffic-panel`      | segment3   | segment4   | fadeIn + scaleUp (delay 0.30)      |
| `seg4-competitor`     | `.competitor-panel`   | segment4   | segment5   | fadeIn + scaleUp                   |
| `seg4-competitor-count` | `.competitor-count` | segment4   | —          | countUp → 1923 (delay 0.3)        |
| `seg4-promo`          | `.promo-panel`        | segment4   | segment5   | fadeIn + scaleUp (delay 0.15)      |
| `seg5-text`           | `.seg5-text`          | segment5   | —          | fadeIn + slideDown                 |
| `seg5-strip`          | `.recommendation-strip` | segment5 | —          | fadeIn + slideDown (delay 0.3)     |
| `seg5-powered`        | `.seg5-powered`       | segment5   | —          | fadeIn (delay 0.6)                 |
| `navbar`              | `.site-navbar`        | idle       | segment0   | fadeOut → fadeIn at segment1       |

All elements start hidden (`idle: [fadeOut]`). Stagger delays are embedded as `delay` values in each element's `AnimationConfig`.

---

## Scroll Sensitivity

```ts
private readonly SCROLL_THRESHOLD = 50;
```

Accumulated `deltaY` from wheel events must exceed this threshold to trigger a segment transition. Lower = more sensitive.

---

## Adding / Removing Segments

1. **Edit the `SEGMENTS` array** in `PropheusExperience.ts`:
   ```ts
   export const SEGMENTS: SegmentConfig[] = [
       { start: 0,   end: 65,  durationMultiplier: 1.3 },
       { start: 65,  end: 100 },       // ← changed end frame
       { start: 100, end: 150 },       // ← new segment
       // ... add as many as needed
   ];
   ```

2. **Update `registerHeroElements()`** to add animation configs for any new segment keys (`segment2`, `segment3`, etc.).

3. **Add frame images** for any new frame indices that weren't previously loaded.

4. No engine changes needed — `advanceSegment` / `reverseSegment` / `playSegment` are generic.

---

## Architecture

```
┌──────────────────────────────────────┐
│     PropheusExperience               │
│                                      │
│  ┌──────────────────────┐            │
│  │  SEGMENTS config     │ ← edit     │
│  │  frame ranges here   │            │
│  └──────────────────────┘            │
│                                      │
│  ┌──────────────────────┐            │
│  │  Segment Controller  │            │
│  │  advanceSegment()    │            │
│  │  reverseSegment()    │            │
│  │  playSegment()       │            │
│  └──────────────────────┘            │
│                                      │
│  ┌──────────────────────┐            │
│  │  Frame Proxy Engine  │ ← lerp     │
│  │  gsap.ticker loop    │            │
│  └──────────────────────┘            │
│                                      │
│  ┌──────────────────────┐            │
│  │  HeroAnimationCtrl   │ ← UI      │
│  │  per-segment keys    │            │
│  └──────────────────────┘            │
│                                      │
│  ┌──────────────────────┐            │
│  │  Scroll Lock         │            │
│  │  wheel/touch/key     │            │
│  └──────────────────────┘            │
└──────────────────────────────────────┘
         │
         ├── .seg0-text          (seg0 "Goodbye" text)
         ├── .seg1-headline      (seg1 headline)
         ├── .topo-panel         (seg1 topographical panel)
         ├── .weather-panel      (seg1 weather panel)
         ├── .sentiment-panel    (seg2 consumer sentiment)
         ├── .footfall-panel     (seg3 footfall + count-up)
         ├── .demand-panel       (seg3 demand surge)
         ├── .traffic-panel      (seg3 traffic flow)
         ├── .competitor-panel   (seg4 competitor + count-up)
         ├── .promo-panel        (seg4 promo watch)
         ├── .seg5-text          (seg5 conclusion text)
         ├── .recommendation-strip (seg5 rec cards)
         ├── .seg5-powered       (seg5 tagline)
         └── .site-navbar        (navbar, outside hero)
```

---

## Key Constants

| Constant            | Value   | Purpose                                          |
|---------------------|---------|--------------------------------------------------|
| `SECONDS_PER_FRAME` | 0.02    | Base time per frame for duration calculation      |
| `SCROLL_THRESHOLD`  | 50      | Accumulated delta to trigger segment transition   |
| `lerp factor`       | 0.1     | Smoothing factor in ticker loop                   |
| `ease`              | power2.inOut | GSAP easing for frame proxy tweens           |

See [hero-animation-guide.md](hero-animation-guide.md) for animation presets and tuning.
