# Development Notes

## Current status

- CEP panel scaffold exists.
- Bridge `client -> host` exists.
- `getSelectionInfo` is wired and returns basic scaled geometry.
- Transform and dimensions remain intentionally stubbed for separate workstreams.

## Integration architecture

- `client/bridge.js` is the only supported entry point from UI code into ExtendScript.
- Public host methods remain stable:
  - `getSelectionInfo`
  - `updateTransform`
  - `createHorizontalDimension`
  - `createVerticalDimension`
- `host/index.jsx` stays as the thin CEP entry point and delegates host execution to `host/bootstrap.jsx`.
- `host/bootstrap.jsx` owns module loading, runtime reset, and dispatch setup for `host/core/*`.

## Host reload behavior in development

- The host runtime now computes a file signature from `bootstrap.jsx` plus every file in `host/core/`.
- A host call reloads the runtime only when that signature changes, when the runtime is missing, or when reload is forced programmatically.
- Reload resets `global.BIDSTOOLS` before re-evaluating modules, which avoids stale API entries after edits.
- This keeps public APIs stable while making iterative edits in host code visible on the next panel action without restarting Illustrator.

## Bridge contract

- All bridge calls send JSON-serializable payloads only.
- All host responses must remain JSON strings with the existing envelope:
  - success: `{ ok: true, message: "", data: ... }`
  - failure: `{ ok: false, error: "...", data: ... }`
- The bridge attaches request metadata (`requestId`, `method`) on the client side for debugging, outside `data`, so the functional payload shape remains unchanged.

## Working rules

- Keep module ownership aligned with `ai-development-delivery-plan.md`.
- Do not change public function names without updating the briefs.
- Keep host responses JSON-serializable.

## First validation target

1. Install the extension in CEP dev mode.
2. Open Illustrator.
3. Open the `BIDSTOOLS Measure` panel.
4. Select one simple rectangle.
5. Click `Refresh`.
6. Confirm `W`, `H`, `Perimeter`, `Area`, and scale display.

## Manual validation

1. Install the extension in CEP dev mode and open Illustrator.
2. Open the `BIDSTOOLS Measure` panel and confirm the panel loads without a CEP error.
3. With one simple rectangle selected, click `Refresh` and confirm `getSelectionInfo` still returns the same selection fields as before.
4. Click `Apply` and both dimension buttons and confirm the existing stub behavior is unchanged: the calls still return structured failures rather than host crashes.
5. Edit one host file in `host/core/` or `host/bootstrap.jsx`, save it, then trigger `Refresh` again.
6. Confirm the new host code is picked up on the next action without restarting Illustrator or reopening the panel.
