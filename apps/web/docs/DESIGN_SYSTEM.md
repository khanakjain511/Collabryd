# Design system

Palette selected through user-delegated choice: Midnight Teal + Warm Ivory. Other specifications below are proposed, pending plan review. Define tokens in ordinary CSS custom properties after implementation approval; do not add a token compiler or theme framework.

## Semantic light-mode colors

| Token | HEX | Use |
| --- | --- | --- |
| `--color-bg` | `#FFFBF2` | Main ivory page |
| `--color-surface` | `#FFFFFF` | Cards and fields |
| `--color-surface-soft` | `#F0F4ED` | Quiet inset region |
| `--color-primary` | `#115E59` | Primary button, links |
| `--color-primary-hover` | `#0F4F4B` | Primary hover |
| `--color-on-primary` | `#FFFFFF` | Primary button text |
| `--color-secondary` | `#D8E8DF` | Sage panels and tags |
| `--color-accent` | `#F2C078` | Small amber highlights |
| `--color-text` | `#17332F` | Main content |
| `--color-text-muted` | `#52645D` | Supporting copy |
| `--color-border` | `#D7DED6` | Decorative dividers |
| `--color-control-border` | `#7C8E83` | Input/control boundary |
| `--color-focus` | `#0F766E` | Focus on light surfaces |
| `--color-focus-inverse` | `#F2C078` | Focus on deep teal |
| `--color-success` / `--color-success-bg` | `#166534` / `#ECFDF3` | Saved/accepted with icon and text |
| `--color-warning` / `--color-warning-bg` | `#854D0E` / `#FEF9E7` | Pending/attention |
| `--color-danger` / `--color-danger-bg` | `#B42318` / `#FEF3F2` | Error/destructive action |
| `--color-info` / `--color-info-bg` | `#075985` / `#EFF6FF` | Informational status |
| `--color-inverse` / `--color-on-inverse` | `#102723` / `#F7F5EB` | Closing CTA and auth visual rail |

No burgundy. Color indicates emphasis; labels convey state. No low-opacity body text or text over fluctuating backgrounds. Base light-mode pairs were measured in [COLOR_PALETTES.md](COLOR_PALETTES.md). Additional solid-pair calculations: control border/white 3.47:1 and /ivory 3.36:1; success 6.76:1, warning 6.50:1, danger 6.05:1, info 6.95:1; inverse text 14.38:1, inverse focus 9.42:1; primary-hover button text 9.37:1. Rendered states, sizing and complete interface accessibility still need implementation verification.

## Typography

- Use `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` for navigation, body, forms and app pages. No font download needed.
- Optional marketing display: `Georgia, 'Times New Roman', serif` for the hero and closing CTA only. Body stays sans. This adapts Monarque's editorial contrast without its proprietary fonts. Confirm visual fit in first review.
- Body 16px/1.6; metadata 14px/1.45; labels 14-16px/1.4, weight 600.
- H1 `clamp(2.5rem, 5.5vw, 5.25rem)`, line height 1.05; h2 `clamp(1.875rem, 3.5vw, 3rem)`, line height 1.15; h3 20-24px/1.25.
- Copy width 62 characters; hero supporting text 48 characters. No all-caps paragraphs, forced line breaks that break mobile, or important text inside images.

## Layout, rhythm and shape

| Foundation | Proposed scale / rule |
| --- | --- |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64, 96px; use named CSS variables |
| Container | Maximum 1200px, centered; side padding 20px mobile, 32px tablet, 48px wide |
| Sections | 64px block padding mobile, 96px desktop; compact app content 24-32px |
| Grid | One column first; two at 640px when content fits; three at 1024px; gap 16-24px |
| Hero | Two columns above 1024px, stacked below; no mandatory 100vh height |
| App shell | Sidebar on wide screens; labeled mobile navigation, reserving bottom space when fixed |
| Radii | 8px controls, 16px cards, 24px visual panel, 999px tags only |
| Border | 1px decorative or control token as appropriate |
| Shadow | One low-elevation shadow `0 8px 24px rgb(16 39 35 / 8%)`; modal `0 24px 64px rgb(16 39 35 / 20%)` |
| Z-index | Header 10, menu 20, toast 30; use native dialog top layer for modal |
| Opacity | Essential content 1; no decorative layer may reduce text contrast |

Breakpoints are starting points, not device guarantees. Confirm 320/390/768/1024/1440/1920px, 200% text and 400% zoom. Avoid fixed widths on fields/cards and content-clipping overflow fixes.

## Controls and accessibility contracts

Primary actions use filled teal buttons; secondary actions use an outlined button or underlined text link. Keep one dominant action per region. Navigation uses anchors, mutations use buttons. Normal form controls are at least 44px tall as a design target; icon buttons have accessible names and equal touch space.

Focus: 3px outline plus 3px offset, using light/inverse token for the containing surface. Do not suppress outline. Sticky navigation must not cover focus or anchor headings. Use `scroll-margin-top` with header clearance.

Native select, checkbox, radio, details/summary and dialog are preferred to custom interaction widgets. Input labels remain visible even after text entry; placeholder is an example, not a label. Inline SVG icons use consistent 20/24px sizing; decorative icons are hidden from accessibility output. Labels accompany status icons.

## Motion and image treatments

Follow [MOTION_SYSTEM.md](MOTION_SYSTEM.md). Use transitions for border, background, opacity and small transforms. Keep the hero headline and CTA readable immediately. Photography has explicit dimensions and `object-fit: cover` with intentional crop; no excessive filters or text inside generated art. See [IMAGE_STRATEGY.md](IMAGE_STRATEGY.md).
