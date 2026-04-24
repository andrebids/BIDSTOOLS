# Development Notes

## Current status

- CEP dockable panel scaffold exists, now split into multiple CEP panels.
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
3. Open `CADtracker`, `BIDSTOOLS Scale`, and `BIDSTOOLS Dimensions`.
4. Select one simple rectangle.
5. In `CADtracker`, click `Refresh`.
6. Confirm `W`, `H`, `Perimeter`, `Area`, and scale display.

## Manual validation

1. Install the extension in CEP dev mode and open Illustrator.
2. Open the three BIDSTOOLS panels and confirm each panel loads without a CEP error.
3. With one simple rectangle selected, click `Refresh` in `CADtracker` and confirm `getSelectionInfo` still returns the same selection fields as before.
4. Change scale in `BIDSTOOLS Scale` and dimension defaults in `BIDSTOOLS Dimensions`, then refocus `CADtracker` and confirm it reflects the updated shared settings.
5. Edit one host file in `host/core/` or `host/bootstrap.jsx`, save it, then trigger `Refresh` again.
6. Confirm the new host code is picked up on the next action without restarting Illustrator or reopening the panels.

## Hybrid selection change architecture

Automatic selection refresh now follows a hybrid flow with no polling in the CEP panel:

1. A native Illustrator plugin subscribes `kAIArtSelectionChangedNotifier`.
2. The plugin rebuilds a stable selection signature from the current document handle plus the sorted selected `AIArtHandle` list.
3. If that signature changed, the plugin emits the CEP event `com.bidstools.selectionChanged`.
4. `client/index.js` listens for that event through `client/bridge.js`.
5. The panel calls `refreshSelection()` and keeps the JSX host as the single source of geometry, perimeter, area, and scale.

## CEP event contract

Event name:

```text
com.bidstools.selectionChanged
```

Expected payload:

```json
{
  "source": "BIDSTOOLSSelectionNotifier",
  "documentChanged": true,
  "selectionSignature": "count=1;doc=0x12345678;items=0x00ABCDEF",
  "selectedCount": 1
}
```

Notes:

- The panel treats the event as a trigger only.
- No geometry is sent from native code.
- The panel coalesces concurrent events while a refresh is already in flight, without timers.

## Selection signature

The native plugin filters notifier noise with a session-local signature:

```text
count=<n>;doc=<document-handle>;items=<sorted-art-handle-1>,<sorted-art-handle-2>,...
```

Filtering rules:

- same signature => ignore notifier
- different signature => dispatch CEP event
- no document => `no-document`
- empty selection => `count=0;doc=<document-handle>;items=`

This is specifically for deduplication during the current Illustrator session. It is not intended as a persistent identifier across launches.

## Native plugin build and install

The native plugin source lives in [native-plugin/README.md](/C:/Users/AndreGarcia/Documents/BIDSTOOLS/native-plugin/README.md).

Build prerequisites:

- Visual Studio 2022 with C++
- CMake 3.21+
- local Illustrator SDK
- Illustrator runtime with integrated CEP/PlugPlug support

Environment variables:

```powershell
$env:ILLUSTRATOR_SDK_DIR="C:\SDKs\illustrator-sdk"
```

Build:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\AndreGarcia\Documents\BIDSTOOLS\scripts\build-native-plugin.ps1
```

Install:

1. Copy `native-plugin\build\Release\BIDSTOOLSSelectionNotifier.aip` into the Illustrator plug-ins folder.
2. Install the CEP extension in dev mode.
3. Restart Illustrator.
4. Open `BIDSTOOLS Measure`.

## Manual validation for selection sync

1. Install the CEP panel and the native `.aip`.
2. Restart Illustrator and open `BIDSTOOLS Measure`.
3. Select one object and confirm `W`, `H`, `Perimeter`, and `Area` refresh without clicking `Refresh`.
4. Change to a different object and confirm the panel updates again automatically.
5. Clear the selection and confirm the empty-selection state refreshes automatically.
6. Nudge anchor points or otherwise modify the currently selected art without changing the selected set and confirm redundant events are filtered by the native signature comparison.
7. Switch selection rapidly between two objects and confirm the panel stays responsive and does not enter a refresh loop.

## Known limitations

- The `.aip` build was prepared but not compiled in this workspace because the Adobe SDKs are not vendored here.
- The native payload uses session-local document and art handles for deduplication.
- The panel coalesces overlapping native events, but the real deduplication boundary remains the native signature filter.
