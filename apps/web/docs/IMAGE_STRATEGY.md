# Final campus photography

Licensed photographs show campus life in India. The people pictured illustrate the setting. The demo directory continues to use initials for fictional profiles.

| Asset family | Photographer and location | Placement |
| --- | --- | --- |
| `delhi-campus*.webp` | [Sanket Mishra, New Delhi](https://unsplash.com/photos/a-group-of-people-sitting-around-a-wooden-table-LCwo5opgr9M) under the [Unsplash License](https://unsplash.com/license) | Scroll-expanding hero, account pages, dashboard |
| `santiniketan-campus*.webp` | [Arto Suraj, Santiniketan](https://www.pexels.com/photo/happy-college-students-at-santiniketan-39006529/) under the [Pexels License](https://www.pexels.com/license/) | Landing campus story |

The production frontend serves WebP sizes locally with native `srcset`. The hero has explicit dimensions and high fetch priority. The campus story and account photo load lazily. Manrope and Instrument Serif are hosted locally alongside their SIL Open Font License notices. Earlier generated photographs remain available as alternatives.

# Image strategy, prompts and asset manifest

Planning originally generated no images. After implementation approval, A01 was generated, visually inspected, optimized and integrated. The planning inventory below is followed by the actual delivered manifest. The existing `src/assets/hero.png` is a starter asset, not approved Collabyrd imagery.

## Reference image inventory

Inventory is based on supplied Monarque analysis, which provides some filenames but no original pixel dimensions. Unknown dimensions/aspect ratios must not be invented as measured facts. Collabyrd target sizes below are design proposals.

| Reference placement                                | Purpose / subject                        | Reference sizing                           | Collabyrd treatment                                                                     |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| SVG preloader crest                                | Brand ceremony, butterfly and initial    | Not supplied                               | Remove; simple text wordmark initially                                                  |
| Hero collage images 1-5                            | Curated moments and emotional atmosphere | Floating collage, exact dimensions unknown | Replace with one student team scene plus DOM product examples; reduce downloads/clutter |
| About founder portrait `monarque-alexandra-4.webp` | Human authority                          | Exact ratio/dimensions not supplied        | Optional collaboration detail, not fictional founder testimony                          |
| Portfolio thumbnails/gallery/lightbox              | Proof of event work                      | Variable imagery; exact ratios unknown     | Use actual product UI examples and real approved event art; no portfolio lightbox       |
| Heritage venue architecture                        | Exclusive location differentiator        | Exact ratio/dimensions unknown             | Remove venue; campus trust communicated with factual text                               |
| Footer/background                                  | Dramatic brand close                     | Photography not confirmed by analysis      | Solid inverse teal surface, no additional bitmap                                        |

## Consistent Collabyrd art direction

Authentic student work sessions, candid posture and realistic campus furniture. Soft natural daylight, neutral clothing, gentle sage/ivory surroundings and restrained amber/teal details. No luxury gala aesthetic, staged handshake, fake brand logos, fictional readable code, institutional endorsement, or generated people presented as real users.

Photos support the product story; real interface cards explain the functionality. Never put important text inside raster images. Use no generated portrait as a real student profile. Demo avatars can use initials.

## Proposed asset manifest

| ID / location                      | Purpose, composition, lighting and emotion                                                                        | Target size / ratio / crop                                                              | Proposed local path and format                              | Alt / approval / optimization                                                                                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 landing hero                   | 3 students around a laptop/notes; activity on right with uncluttered left; window light; focused and approachable | 1440×1080 4:3; 800×600 and 480×360 derivatives; keep faces/work area inside central 70% | `public/images/campus-team.webp`                            | "Students planning a project around a laptop." Only if informative; otherwise empty alt when adjacent copy covers purpose. Prompt pending approval; not generated; target ≤180KB large variant |
| A02 story section, optional        | Over-shoulder notebook and shared planning; no legible screen; warm daylight, hands anatomically sound            | 1200×800 3:2; 720×480 derivative; central notebook crop on mobile                       | `public/images/project-session.webp`                        | "Students sketching a project plan together." Optional, not generated; target ≤140KB                                                                                                           |
| A03 auth visual, no extra download | Reuse A01 with calmer crop; optional desktop-only region                                                          | Existing source, crop preserves subjects; never duplicate file just for styling         | Reuse A01                                                   | Decorative empty alt; no new generation needed                                                                                                                                                 |
| A04 hero network                   | Connection metaphor, no actual profile data                                                                       | SVG viewBox, fixed nodes/lines, scales with panel                                       | Original inline SVG in HeroNetwork component after approval | aria-hidden; vector code, not ImageGen task; no image generated                                                                                                                                |
| A05 product preview                | Demonstrate roles, request and team capacity                                                                      | Live HTML components, naturally responsive                                              | DOM, not screenshot or generated text                       | Visible "Example team/profile" labels; fixtures separated                                                                                                                                      |
| A06 event artwork, only when real  | Recognizable official event identity                                                                              | Organizer-approved aspect ratio, explicit width/height                                  | Local licensed asset path decided per event                 | Event-specific alt; source/license and approval recorded before use                                                                                                                            |

Byte limits are targets, not measured results. Final manifest must add actual width, height, byte size, generator/source, license/consent, review date, responsive variants and optimization result. Omit optional A02 if it doesn't improve the layout.

## Generation prompts for review

### A01 - Campus collaboration

Editorial documentary photograph of three adult university students in a modest contemporary Indian campus study room, collaborating on a small hackathon project around one ordinary laptop and paper notes. They are concentrating naturally and talking to each other, not posing or looking at the camera. Frame the group toward the right half, leave quiet warm ivory wall and desk space on the left. Show believable furniture, a notebook, a water bottle and one cable; avoid clutter. Soft side-window daylight, natural skin texture, realistic hands and anatomy, neutral shirts with small muted teal and sage accents, restrained warm color grade, approachable focused mood. Landscape 4:3, eye-level, medium-wide framing, important faces and hands safely inside central crop. Laptop screen angled away, no readable text, no logos, no institution names, no forced smiles, no plastic skin, no dramatic neon or cinematic lighting. This is illustrative imagery, not a photograph of actual Collabyrd members.

### A02 - Shared project planning (optional)

Documentary editorial photograph, close over-shoulder view of two adult university students planning a software idea at a plain campus table. One student points to simple geometric wireframe sketches on paper while the other makes notes. Partial natural hands only where anatomically clear, candid cooperative posture, an out-of-focus unbranded laptop at the edge. Soft daylight from the same direction and warm ivory/sage environment as the hero image. Neutral clothing, understated teal notebook detail and one warm amber pencil. Landscape 3:2, keep the paper and shared activity central for a mobile crop, no readable words, no logos, no fabricated charts or code, no staged handshake, realistic materials and skin. Welcoming, focused, imperfect everyday student environment.

No separate prompt for A03 (reuse), A04 (code-native vector), A05 (real UI), or A06 (licensed actual event asset).

## Generation and implementation after approval

Generate only approved placements. Inspect full image and intended crops for hands, faces, screen artifacts, composition and lighting consistency. Reject defects rather than hiding them with overlays. Optimize chosen assets to WebP/AVIF as browser targets allow, keep originals outside delivered payload, record source and generation details. Supply srcset/sizes where useful, width/height and aspect-ratio. Hero is eager if it is LCP; below-fold images lazy-load. No hotlinked arbitrary stock URLs.

## Delivered asset manifest

| Asset           | Actual local path                      | Dimensions               | Format / size      | Review / integration                                                       |
| --------------- | -------------------------------------- | ------------------------ | ------------------ | -------------------------------------------------------------------------- |
| Hero/auth scene | `public/images/campus-team.webp`       | 1200×900                 | WebP, 124006 bytes | Built-in image_gen; visual quality inspected; hero and auth use same scene |
| Responsive hero | `public/images/campus-team-small.webp` | 640×480                  | WebP, 51374 bytes  | Resized/optimized from same generated source; hero srcset                  |
| Desktop preview | `docs/screenshots/desktop.jpg`         | Browser viewport capture | JPEG               | Saved after desktop QA; screenshot, not product asset                      |
| Mobile preview  | `docs/screenshots/mobile.jpg`          | 390px viewport capture   | JPEG               | Saved after narrow-layout QA; screenshot, not product asset                |

Both source variants are local and committed. Body text is HTML, not baked into the photo. The photograph is illustrative AI-generated imagery, disclosed in the demo information page. A02 was not generated because the landing explains the workflow with real HTML rather than another download. A04 is original SVG; A05 uses actual DOM cards; fictional event artwork is CSS/HTML with no official logos.

Final built-in generation prompt:

> Use case: photorealistic-natural. Create a landscape editorial photograph for a premium, calm student collaboration website. Three adult Indian university students, two women and one man, around a modest campus table with one laptop and a notebook. Candid genuine concentration and conversation, no looking at camera. Frame a medium-wide side view with group centered, include upper body and table, generous surroundings, natural window light from left. Warm ivory walls, muted sage and wood tones, tiny teal clothing detail, authentic modern Indian campus study space. Natural imperfect skin, anatomically correct hands, credible objects, ordinary casual student clothing, approachable rather than corporate. Landscape 4:3 composition, important subjects inside central 70 percent for responsive cropping. Screen angled away with no readable text. No logos, words, school branding, watermark, exaggerated smiles, cinematic grading or plastic skin. Professional documentary photography, warm subtle contrast.
