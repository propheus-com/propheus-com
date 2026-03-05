# Hero Animation Controller — Developer Guide

## Architecture

The hero uses a **segment-driven cinematic scroll controller**. Each scroll gesture plays one segment's frame range:

| Seg | Frames    | Scene               | UI Layer                                         |
|-----|-----------|---------------------|--------------------------------------------------|
| 0   | 0 → 65    | Initial manager     | "Goodbye to Dashboards & Data" text in           |
| 1   | 65 → 88   | City establishing   | Headline + **StoreMapMarkers** ambient layer + Topo Panel + Weather Panel stagger in |
| 2   | 88 → 118  | City zoom / skyline | Consumer Sentiment panel                         |
| 3   | 118 → 159 | Store exterior      | Footfall (count-up) + Demand + Traffic panels    |
| 4   | 159 → 179 | Store interior      | Competitor (count-up) + Promo Watch panels       |
| 5   | 179 → 211 | Final manager       | Conclusion text + Recommendation strip           |

UI animations are driven by **segment keys** (`idle`, `segment0`, `segment1`, …). Frame animations remain in `PropheusExperience.playSegment()`.

### Element Lifecycle Pattern

Each element appears on its segment key and disappears on the next:

```
idle:     [fadeOut]        ← initial hidden state
segmentN: [fadeIn, ...]    ← enter animation
segment(N+1): [fadeOut]    ← exit animation
```

For full architecture details, see [state-management.md](state-management.md).

---

## Self-Managing Components (Custom Event Pattern)

Some React components manage their own animation entirely and don't need GSAP registration. They listen to custom events dispatched from `PropheusExperience.runTransition()`.

### Available State Events

| Event                    | Fired when                        |
|--------------------------|-----------------------------------|
| `propheus:state2`        | Entering state 2 (headline layer) |
| `propheus:state2:exit`   | Leaving state 2 (any direction)   |
| `propheus:state6`        | Entering state 6 (DrivingDecisions) |
| `propheus:state6:exit`   | Leaving state 6                   |

### StoreMapMarkers — State 2 Ambient Layer

`components/ui/StoreMapMarkers.tsx`

- Renders 13 store brand markers (Apple, Nike, Zara, Starbucks) scattered across the hero canvas (y: 38–78%).
- Positions are **deterministically seeded** via LCG — no `Math.random()`, no hydration mismatch.
- Sorted by x-coordinate → cinematic left-to-right staggered entrance.
- `delay` per marker = `1.1 + index × 0.14s` — first marker trails 0.1s behind the headline (1.0s), last marker completes at ~2.8s into the state.
- `playKey` increments on each `propheus:state2` event, remounting inner `motion.div` elements to replay from `initial` on re-entry.
- Parent wrapper uses a CSS `opacity` transition (0.9s) to fade the whole layer in/out; avoids flash on state reversal.

### Adding a New Self-Managing Component

1. Dispatch your custom events in `runTransition()` in `PropheusExperience.ts`.
2. Component listens with `window.addEventListener('propheus:stateN', ...)`.
3. Use a `playKey` increment pattern to replay Framer Motion `initial → animate`.

---

## Registering an Element

In `PropheusExperience.registerHeroElements()`:

```ts
const myElement = this.heroEl.querySelector('.my-element') as HTMLElement;
this.animController.registerElement('myId', myElement);
```

---

## Assigning Animations

Animations are keyed by **arrival segment**:

```ts
this.animController.assignAnimations('myId', {
    idle: [],                                            // initial state
    segment0: [{ type: 'fadeIn', duration: 0.8 }],       // after segment 0
    segment1: [                                          // after segment 1
        { type: 'fadeOut', opacity: 0 },
        { type: 'scaleDown', scale: 0.9 },
    ],
});
```

Only list keys where the element's appearance changes. Elements with no config for a segment remain at their current visual state.

---

## Animation Presets

| Preset         | Default Effect               | Tunable Params                          |
|----------------|------------------------------|-----------------------------------------|
| `fadeIn`       | opacity → 1                  | `opacity`, `duration`, `easing`         |
| `fadeOut`      | opacity → 0                  | `opacity`, `duration`, `easing`         |
| `moveForward`  | z → 0                       | `depth`, `duration`, `easing`           |
| `moveBackward` | z → -120                    | `depth`, `duration`, `easing`           |
| `scaleUp`      | scale → 1                   | `scale`, `duration`, `easing`           |
| `scaleDown`    | scale → 0.9                 | `scale`, `duration`, `easing`           |
| `slideUp`      | y → -40                     | `distance`, `duration`, `easing`        |
| `slideDown`    | y → +40                     | `distance`, `duration`, `easing`        |
| `slideLeft`    | x → -40                     | `distance`, `duration`, `easing`        |
| `slideRight`   | x → +40                     | `distance`, `duration`, `easing`        |
| `lineDraw`     | SVG line extends to endpoint | `lineEndX`, `lineEndY`, `duration`      |
| `lineCollapse` | SVG line collapses to start  | `lineEndX`, `lineEndY`, `duration`      |
| `glowPulse`    | scale 0 → 1.4 + opacity 1   | `scale`, `opacity`, `duration`, `easing`|
| `countUp`      | text 0 → targetValue         | `targetValue`, `duration`, `easing`     |

### SVG Line Presets

`lineDraw` and `lineCollapse` animate SVG `<line>` elements via the `attr` property:
- `lineEndX` / `lineEndY` — target x2/y2 values (percentage strings like `"50%"`)
- On draw, opacity fades to 1 and x2/y2 extend to the panel center
- On collapse, x2/y2 snap back to the anchor point and opacity fades to 0

### Glow Pulse

`glowPulse` applies a highlight on `.signal-node` elements — scales from 0 → target scale with opacity.

### Count Up

`countUp` animates a numeric text element from 0 → `targetValue` using GSAP's `textContent` tween with rounding:

```ts
{ type: 'countUp', targetValue: 2847, duration: 1.5, delay: 0.3, easing: 'power2.out' }
```

Uses `fromTo` internally so replays always start from 0. The parent panel handles fade-in/fade-out visibility.

---

## Delay (Stagger Without targetChildren)

Each `AnimationConfig` supports a `delay` field:

```ts
{ type: 'fadeIn', opacity: 1, duration: 0.6, delay: 0.24, easing: 'power2.out' }
```

This delays the start of the tween within the timeline, enabling per-element stagger without `targetChildren`. In `registerHeroElements`, panels use computed delays:

```ts
panels.forEach((panelEl, i) => {
    const staggerDelay = i * 0.12;
    this.animController.assignAnimations(`panel-${i}`, {
        segment1: [
            { type: 'fadeIn', duration: 0.6, delay: staggerDelay },
        ],
    });
});
```

---

## Stagger & Child Targeting

For animating **children of a container** with staggered timing:

```ts
this.animController.assignAnimations('container', {
    segment1: [
        { type: 'fadeIn', opacity: 1, stagger: 0.12, targetChildren: true },
    ],
});
```

| Param            | Type    | Effect                                      |
|------------------|---------|---------------------------------------------|
| `targetChildren` | boolean | Animate `el.children` instead of `el`       |
| `stagger`        | number  | Delay (seconds) between each child's start  |

---

## Per-Element Timelines

For custom sequencing, use `buildElementTimeline` with a string key:

```ts
const headlineTl = this.animController.buildElementTimeline('headline', 'segment0');
const panelTl = this.animController.buildElementTimeline('panel-0', 'segment1');
masterTl.add(headlineTl, 0);
masterTl.add(panelTl, 0.9);
```

Use `getIdsByPrefix` to iterate over groups:

```ts
const panelIds = this.animController.getIdsByPrefix('panel-');
panelIds.forEach((id, i) => {
    const tl = this.animController.buildElementTimeline(id, 'segment1');
    masterTl.add(tl, i * 0.12);
});
```

---

## How Segment Transitions Work

```
Wheel down → accumulatedDelta += deltaY
                ↓
accumulatedDelta >= 50 → advanceSegment()
                ↓
nextIndex = currentSegmentIndex + 1
                ↓
playSegment(nextIndex, 'forward')
  ├── Frame: gsap.to(frameProxy, { value: seg.end, duration })
  └── UI: animController.transitionTo('segmentN')
                ↓
        Timeline plays → isAnimating = true
                ↓
        onComplete → currentSegmentIndex = nextIndex
                     isAnimating = false
```

For reverse:

```
Wheel up → reverseSegment()
                ↓
playSegment(currentSegmentIndex, 'reverse')
  ├── Frame: gsap.to(frameProxy, { value: seg.start, duration })
  └── UI: animController.transitionTo('segment(N-1)' or 'idle')
                ↓
        onComplete → currentSegmentIndex -= 1
```

---

## Duration Multiplier

```ts
duration = |end − start| × SECONDS_PER_FRAME × (durationMultiplier ?? 1)
```

`SECONDS_PER_FRAME = 0.02`. Override per-segment via the `SEGMENTS` config array.

---

## Tweaking Strengths

Override any preset default via the config object:

```ts
{ type: 'moveBackward', depth: 200, duration: 1.2, easing: 'power3.out' }
```

All parameters are optional — defaults apply for any omitted value.

---

## Adding a New Preset

In `HeroAnimationController.ts`:

1. Add to `AnimationPreset` type:
   ```ts
   export type AnimationPreset = '...' | 'rotateIn';
   ```

2. Add default in `PRESET_DEFAULTS`:
   ```ts
   rotateIn: { rotation: 0, duration: 0.8, ease: 'power2.out' },
   ```

3. Handle custom params in `buildTweenVars()` if needed.

---

## Scroll Sensitivity

```ts
private readonly SCROLL_THRESHOLD = 50;
```

Lower = more sensitive (fewer wheel ticks to trigger). Higher = requires more deliberate scroll.
