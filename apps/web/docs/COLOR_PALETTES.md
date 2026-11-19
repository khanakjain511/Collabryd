# Color palette options

**Selected: Midnight Teal + Warm Ivory.** On 18 November 2026 the user delegated selection for a premium, convenient, eye-friendly UI. It replaces the initial indigo recommendation. This is a visual preference, not a claim of medical benefit or measured user comfort.

## Ranking after the user's preference

1. **Midnight Teal + Warm Ivory:** calm, warm and distinctive; best fit for the requested softer direction.
2. **Electric Indigo + Soft Mint:** energetic and credible for a student technology community.
3. **Deep Navy + Electric Cyan:** strong trust and contrast; a more technical tone.
4. **Graphite + Digital Lavender:** quiet editorial character; less distinctive for collaboration.
5. **Cobalt Blue + Lime:** lively hackathon energy; accent needs restraint for the requested calm feel.

## Complete light-mode candidates

| Role | Midnight Teal + Warm Ivory | Electric Indigo + Soft Mint | Deep Navy + Electric Cyan | Graphite + Digital Lavender | Cobalt Blue + Lime |
| --- | --- | --- | --- | --- | --- |
| Primary | `#115E59` | `#4F46E5` | `#172554` | `#3F3F46` | `#1D4ED8` |
| Secondary | `#D8E8DF` | `#E0E7FF` | `#DBEAFE` | `#EDE9FE` | `#DBEAFE` |
| Accent | `#F2C078` | `#A7F3D0` | `#22D3EE` | `#C4B5FD` | `#BEF264` |
| Background | `#FFFBF2` | `#F8FAFC` | `#F5F8FF` | `#FAFAFA` | `#F8FAFC` |
| Surface | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| Primary text | `#17332F` | `#172033` | `#14213D` | `#18181B` | `#172033` |
| Secondary text | `#52645D` | `#526075` | `#526078` | `#62626D` | `#526075` |
| Decorative border | `#D7DED6` | `#DCE2EB` | `#D7E0F0` | `#E4E4E7` | `#DCE2EB` |
| Hover (primary) | `#0F4F4B` | `#4338CA` | `#0F1D44` | `#27272A` | `#1E40AF` |
| Focus | `#0F766E` | `#4F46E5` | `#0369A1` | `#6D28D9` | `#1D4ED8` |
| Gradient start → end | `#FFFBF2` → `#D8E8DF` | `#F8FAFC` → `#E0E7FF` | `#F5F8FF` → `#DBEAFE` | `#FAFAFA` → `#EDE9FE` | `#F8FAFC` → `#DBEAFE` |

Gradients are decorative only. Put body copy and fields on solid surfaces. Bright accents use the primary dark text, never white text by default. Light decorative borders do not define input boundaries: the selected design has a separate stronger control border.

## Per-direction application and emotional tone

| Palette | Brand, trust and energy | Reading / premium character | Motion and usage |
| --- | --- | --- | --- |
| Teal/ivory | Grounded, welcoming, confident; moderate energy | Warm whitespace and dark ink support quiet hierarchy; differs from typical purple tools | Teal buttons, sage sections, tiny amber highlights; slow short entrances |
| Indigo/mint | Confident technology brand; youthful without neon dominance | Familiar strong primary; mint softens the composition | Indigo CTAs and focus, mint role chips; crisp 150-350ms motion |
| Navy/cyan | Structured and trustworthy; cyan gives technical energy | Clear contrast, more formal than warm | Navy auth rail, cyan illustrations; subtle fades, no glowing body text |
| Graphite/lavender | Restrained, creative, low visual intensity | Editorial polish with less immediate brand recognition | Neutral cards, lavender tags; minimal movement |
| Cobalt/lime | Active student-builder character; highest energy | Strong CTA hierarchy, but large lime areas can feel loud | Cobalt actions, lime status accents; restrained hover lift |

## Dark-mode considerations

Dark mode is a later enhancement, not an MVP theme-toggle requirement. Do not invert colors automatically. Candidate token starts below need their own full contrast audit before use.

| Direction | Dark background | Dark surface | Text | Muted text | Primary action + dark label | Border / focus |
| --- | --- | --- | --- | --- | --- | --- |
| Teal | `#102723` | `#18342F` | `#F7F5EB` | `#B8C9C1` | `#8DD3BE` + `#102723` | `#667F74` / `#F2C078` |
| Indigo | `#111827` | `#1F2937` | `#F8FAFC` | `#CBD5E1` | `#A5B4FC` + `#111827` | `#64748B` / `#A7F3D0` |
| Navy | `#101A31` | `#1B2943` | `#F5F8FF` | `#BFCCE1` | `#67E8F9` + `#101A31` | `#64748B` / `#67E8F9` |
| Graphite | `#18181B` | `#27272A` | `#FAFAFA` | `#D4D4D8` | `#C4B5FD` + `#18181B` | `#71717A` / `#DDD6FE` |
| Cobalt | `#111C32` | `#1D2B45` | `#F8FAFC` | `#CBD5E1` | `#93C5FD` + `#111C32` | `#64748B` / `#BEF264` |

## Measured light-mode contrast

Calculated using sRGB relative luminance and `(Llighter + .05) / (Ldarker + .05)` during planning. These are solid color pairs, not a complete interface audit.

| Palette | White on primary | Body on background | Secondary text on background | Dark text on accent | Focus on white |
| --- | --- | --- | --- | --- | --- |
| Teal | 7.58:1 | 13.11:1 | 6.09:1 | 8.12:1 | 5.47:1 |
| Indigo | 6.29:1 | 15.55:1 | 6.10:1 | 12.68:1 | 6.29:1 |
| Navy | 14.69:1 | 15.03:1 | 5.98:1 | 8.84:1 | 5.93:1 |
| Graphite | 10.44:1 | 16.97:1 | 5.77:1 | 9.60:1 | 7.10:1 |
| Cobalt | 6.70:1 | 15.55:1 | 6.10:1 | 12.45:1 | 6.70:1 |

All five listed normal-text pairings exceed 4.5:1. Hover, disabled, control-border, inverse-section and actual rendered focus combinations still require implementation checks. Selected semantic tokens are authoritative in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
