# Hero State Machine — Reference

**Total states:** 7 (0 – 6) | **Total frames:** 177 (0 – 176)  
**Scroll lock:** Engaged across all states. Releases on the next scroll past state 6.

---

## State 0 — Bare Canvas
**Frames:** hold 0  
**Trigger:** Page load / initial mount

| Direction | Elements |
|-----------|----------|
| IN | *(nothing — pure canvas, all UI hidden)* |
| OUT | *(nothing)* |

Notes: `applyInstant('state0')` snaps everything to hidden on init. Navbar hidden.

---

## State 1 — ThoughtBubble
**Frames:** hold 0 (no canvas movement)  
**Trigger:** First scroll down

| Direction | Elements |
|-----------|----------|
| IN | `ThoughtBubble` — fade + slide up (0.9s) |
| OUT | *(nothing)* |

Notes: Canvas stays frozen at frame 0. This is the "Goodbye to Dashboards" moment.

---

## State 2 — Physical World
**Frames:** 0 → 61  
**Trigger:** Second scroll down

| Direction | Elements |
|-----------|----------|
| IN | `seg1-headline` ("what if the Physical World was my Playground?") — fade in after 0.5s delay |
| IN | `TopoCard` — dot pulse → line draw → panel slide (stagger: 0s base) |
| IN | `WeatherWidget` — dot pulse → line draw → panel slide (stagger: 0.15s base) |
| OUT | `ThoughtBubble` — fade out + slide up (0.5s) |

Notes: Canvas begins playing. Headline and topo/weather signal pointers animate in sequentially.

---

## State 3 — Intelligence Layer
**Frames:** 61 → 90  
**Trigger:** Third scroll down

| Direction | Elements |
|-----------|----------|
| IN | `SentimentPieChart` — dot pulse → line → panel (stagger: 0s base) |
| IN | `CompetitorCard` — dot pulse → line → panel (stagger: 0.12s base) |
| IN | `PromoWatchCard` — dot pulse → line → panel (stagger: 0.24s base) |
| OUT | `seg1-headline` — fade out + slide up (0.4s) |
| OUT | `TopoCard` — panel collapse, dot/line fade |
| OUT | `WeatherWidget` — panel collapse, dot/line fade |

Notes: All signal pointer panels use glass-panel matte-black style. Three intelligence cards animate in with cascading stagger.

---

## State 4 — Traffic & Footfall
**Frames:** 90 → 120  
**Trigger:** Fourth scroll down

| Direction | Elements |
|-----------|----------|
| IN | `TrafficFlowChart` — dot pulse → line → panel (stagger: 0s base) |
| IN | `FootfallCard` — dot pulse → line → panel (stagger: 0.15s base) |
| OUT | `SentimentPieChart` — panel collapse, dot/line fade |
| OUT | `CompetitorCard` — panel collapse, dot/line fade |
| OUT | `PromoWatchCard` — panel collapse, dot/line fade |

---

## State 5 — Conclusion Strip
**Frames:** 120 → 146  
**Trigger:** Fifth scroll down

| Direction | Elements |
|-----------|----------|
| IN | `seg4-text` — fade + slide up (0.8s) |
| IN | `seg4-strip` — fade + slide up (0.6s, delay 0.3s) |
| IN | `seg4-powered` — fade in (0.5s, delay 0.6s) |
| OUT | `TrafficFlowChart` — panel collapse, dot/line fade |
| OUT | `FootfallCard` — panel collapse, dot/line fade |

---

## State 6 — Driving Decisions
**Frames:** 146 → 176  
**Trigger:** Sixth scroll down

| Direction | Elements |
|-----------|----------|
| IN | `DrivingDecisionsOverlay` — "Driving [INVENTORY / STAFFING / PROMOTION / ASSORTMENT] Decisions" — fade + slide up (1.2s spring) |
| OUT | `seg4-text` — fade out (0.5s) |
| OUT | `seg4-strip` — fade out (0.5s) |
| OUT | `seg4-powered` — fade out (0.5s) |

Notes: `propheus:state6` event fires on arrival, which triggers `DrivingDecisionsOverlay` to show. The rotating word cycles every 2.2s with spring animation. One more scroll forward disengages the lock and hands off to native Lenis scroll. Scrolling back to `scrollY === 0` re-locks at state 6.

---

## Signal Pointer Anatomy

Every signal card follows the same 4-part structure and animation sequence:

```
dot  →  pulse expand (0.45s)  →  settle (elastic)
line →  scaleY draw from 0 (starts at +0.52s)
panel → fade + slide in (starts at +1.0s)
content → fade + slide in (starts at +1.25s)
```

On exit: content → panel → line → dot all fade/collapse simultaneously (0.55s).

---

## Frame Map Summary

| State | Hold / Range | Canvas Motion |
|-------|-------------|---------------|
| 0 | frame 0 | static |
| 1 | frame 0 | static |
| 2 | 0 → 61 | playing |
| 3 | 61 → 90 | playing |
| 4 | 90 → 120 | playing |
| 5 | 120 → 146 | playing |
| 6 | 146 → 176 | playing |

---

## UI Components per State (cumulative view)

| Component | State 0 | State 1 | State 2 | State 3 | State 4 | State 5 | State 6 |
|-----------|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|
| ThoughtBubble | — | ✓ | — | — | — | — | — |
| Headline | — | — | ✓ | — | — | — | — |
| TopoCard | — | — | ✓ | — | — | — | — |
| WeatherWidget | — | — | ✓ | — | — | — | — |
| SentimentPieChart | — | — | — | ✓ | — | — | — |
| CompetitorCard | — | — | — | ✓ | — | — | — |
| PromoWatchCard | — | — | — | ✓ | — | — | — |
| TrafficFlowChart | — | — | — | — | ✓ | — | — |
| FootfallCard | — | — | — | — | ✓ | — | — |
| Conclusion strip | — | — | — | — | — | ✓ | — |
| Driving Decisions | — | — | — | — | — | — | ✓ |
| Navbar | — | — | — | — | — | — | — |
