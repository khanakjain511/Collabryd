# How to explain this frontend

The frontend uses React to display the page, TypeScript to describe the data, and plain CSS to style it. No UI framework, animation package, router package or global state library was added.

## The simple flow

1. A link such as `#/teams` changes the browser hash.
2. `App.tsx` reads that path and picks a page component.
3. `useDemoData` holds the shared fictional data and small named actions.
4. The page renders cards and forms with that data.
5. A user action calls a function such as `createTeam` or `reviewRequest`.
6. That function updates React state, so the page renders the new result.

Example: accepting Tara's join request updates the request to Accepted and adds Tara's ID to the team members. The displayed count changes from 2/3 to 3/3, so the card says Full. This demonstrates the UI; a real server must enforce capacity and permission atomically.

## Files to present

| File | Explain it as |
| --- | --- |
| `src/App.tsx` | The page selector and native hash navigation |
| `src/types.ts` | Simple descriptions of a person, team, event and request |
| `src/data/demo.ts` | Fictional examples, separate from how they look |
| `src/hooks/useDemoData.ts` | Shared state and named demo actions |
| `src/components/ui.tsx` | Repeated small pieces such as icon, avatar, badge and dialog |
| `src/components/Cards.tsx` | Reusable person/team/event cards |
| `src/components/Layout.tsx` | Public header/footer and campus sidebar |
| `src/components/Reveal.tsx` | One observer that starts a short CSS entrance when visible |
| `src/pages/*` | The actual content and controls on each screen |
| `src/index.css`, `src/App.css` | Colors, spacing, typography and responsive layouts |

An interface is a description of expected data fields. Props are values passed from a parent component to a child. State is data React remembers while the app is open. A callback is a function passed to handle an action. `useEffect` is used for browser listeners/observers and cleans them up. The only class is React's native ErrorBoundary, which shows a restart screen if rendering fails.

## Reference effects without extra complexity

- Vanta's connected network becomes a small original SVG with fixed circles and lines.
- Lenis's smooth feeling becomes native smooth section anchors; wheel/touch remain native.
- React Bits inspires short opacity/position entrances using CSS and IntersectionObserver.
- Originkit inspires input spacing, rounded outlines and icons; native labels and controls do the work.

These are original equivalents inspired by the references, not installations of those libraries.

## Demo limits

Everything is fictional and held in memory. Refresh resets changes. No passwords are stored or sent, and no real user messages, accounts, invitations, verification emails or registrations are created. Full live campus authorization, matching, event publishing and moderation need backend integration. Chat, tasks and cross-campus access remain outside the MVP.

## Run it

From `apps/web`:

```sh
pnpm dev --host 127.0.0.1
pnpm build
```

Use “Take a look around” for the quickest demo. The login fields are sample values. Try a people filter, create a team, send a join request, accept the sample invitation, then open Afterhours and accept Tara to fill its last place.
