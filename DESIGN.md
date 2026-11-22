# Design System: EdPro (Scandinavian Studio & Bauhaus Workshop)

## Visual Philosophy
EdPro is an inspiring, tactile, daylight-rich educational studio designed for K-12 students and educators. It rejects dark-mode crypto aesthetics, neon gradient text, and noisy gamification tropes in favor of **clear editorial hierarchy, warm natural materials, and Swiss architectural precision**.

---

## Palette & Surface System

### Grounds & Surfaces
- **App Background**: `#FAFAF8` (Warm archival paper / studio parchment)
- **Primary Surface / Cards**: `#FFFFFF` (Pure crisp white with subtle boundary hairlines)
- **Secondary Wells & Inputs**: `#F4F4F0` (Muted paper well)
- **Border Hairline**: `#E4E4E7` (Subtle 1px structural division)
- **Accent Border**: `#D4D4D8` (Active boundary)

### Ink & Text Hierarchy
- **Primary Ink (Headings & Titles)**: `#18181B` (Deep grounding carbon)
- **Secondary Ink (Body & Reading)**: `#3F3F46` (High-contrast neutral)
- **Tertiary Ink (Captions & Meta)**: `#71717A` (Supporting annotations, ≥4.5:1 contrast)
- **Muted Ink (Placeholders)**: `#A1A1AA`

### Functional Accents
- **Studio Terracotta (Creative Arts)**: `#D94826` (Warm Vermilion)
- **Blueprint Cobalt (Logic & Game Design)**: `#1D4ED8` (Structured Navy)
- **Sage Juniper (Mastery & Completed)**: `#15803D` (Deep Organic Green)
- **Mustard Amber (Milestones & Sparks)**: `#B45309` (Warm Golden Ochre)

---

## Absolute Bans (AI Slop Refusals)
- **NO gradient text**: Text must rely on weight, scale, and ink contrast.
- **NO kickers / eyebrows**: Delete redundant uppercase labels above headings; let the heading speak directly.
- **NO neon glowing halos**: Zero zero-offset colored blur halos. Shadows must carry natural vertical offsets (`0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)`).
- **NO emojis as icons**: All UI icons must be authored SVG icons from Lucide with a consistent 1.75px stroke width.
- **NO generic repetitive card grids**: Use structured panels, asymmetric layouts, and varied rhythm.

---

## Typography
- **Primary Typeface**: `Plus Jakarta Sans`, system-ui, sans-serif
- **Body Measure**: 65–75 characters per line for optimal reading ergonomics.
- **Headings**: Tight tracking (`tracking-tight`), balanced line height, bold optical contrast.
- **Monospace**: `JetBrains Mono` — used strictly for coordinates $(X, Y)$, frequencies, and data tokens.
