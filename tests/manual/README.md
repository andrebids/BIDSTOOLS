# Manual Test Notes

## Selection and geometry validation

This pass is specifically for the panel read path:

- document open validation;
- single selection validation;
- support for one rectangle or one simple `PathItem`;
- geometry based on `geometricBounds`, `width`, and `height`;
- no default use of `visibleBounds`;
- clear unsupported-state messages.

## Baseline smoke test

1. Open Illustrator with no document open.
2. Open the `BIDSTOOLS Measure` panel.
3. Confirm the panel shows `Unsupported` with the message `Open an Illustrator document to inspect the selection.`
4. Open one document and leave nothing selected.
5. Confirm the panel shows `Unsupported` with the message `Select one object to populate the panel.`
6. Select two objects.
7. Confirm the panel shows `Unsupported` with the message `Select a single object. Multiple selections are not supported in v1.`
8. Select one rectangle.
9. Confirm `Refresh` returns values and the selection is marked as supported.
10. Confirm the message is `Rectangle loaded from geometricBounds, width, and height.`

## Supported geometry test

### Rectangle

1. Draw one non-rotated rectangle.
2. Select only that object.
3. Click `Refresh`.
4. Confirm the panel returns:
   - `type = Rectangle`
   - `layerName` for the source layer
   - `X` and `Y` derived from `geometricBounds.left/top`
   - `W` and `H` matching the object `width` and `height`
   - `Perimeter` and `Area` based on those same dimensions
5. Add a thick stroke to the same rectangle.
6. Click `Refresh` again.
7. Confirm `W` and `H` stay tied to geometric size and do not expand as if `visibleBounds` were being used.

### Simple `PathItem`

1. Draw one simple path that Illustrator reports as `PathItem`.
2. Select only that object.
3. Click `Refresh`.
4. Confirm the panel returns:
   - `type = PathItem`
   - message `Simple PathItem loaded from geometricBounds, width, and height.`
   - valid `X`, `Y`, `W`, `H`, `Perimeter`, and `Area`
5. Confirm the panel does not require `visibleBounds` for the readout.

## Calibration test

Use the documented sample:

- `W = 63.398 mm`
- `H = 59.989 mm`
- scale `38 mm = 1 m`

Expected display:

- `W = 1.67 m`
- `H = 1.58 m`
- `Perimeter = 6.49 m`
- `Area = 2.63 sq m`

## Dimension tests

Use one simple non-rotated rectangle and validate with `geometricBounds`.

### Horizontal dimension

1. Select one rectangle.
2. Click `Horizontal`.
3. Confirm the layer `BIDSTOOLS_DIMENSIONS` exists after the command.
4. Confirm the layer is visible and unlocked.
5. Confirm a new `GroupItem` is created on that layer and its name starts with `dim-h-`.
6. Confirm the group includes:
   - one main horizontal line above the object;
   - two extension lines aligned with the left and right edges;
   - one text label with the measured width.
7. Confirm the panel log returns `ok: true`, message `Horizontal dimension created.`, and `dimensionLayerName = BIDSTOOLS_DIMENSIONS`.

### Vertical dimension

1. Keep the same rectangle selected.
2. Click `Vertical`.
3. Confirm the existing layer `BIDSTOOLS_DIMENSIONS` is reused.
4. Confirm a new `GroupItem` is created on that layer and its name starts with `dim-v-`.
5. Confirm the group includes:
   - one main vertical line to the right of the object;
   - two extension lines aligned with the top and bottom edges;
   - one rotated text label with the measured height.
6. Confirm the panel log returns `ok: true` and message `Vertical dimension created.`.

### Metadata

1. After creating at least one dimension, inspect tags on the selected source object.
2. Confirm the source object stores:
   - `BIDSTOOLS_objectId`
   - `BIDSTOOLS_scaleMode`
   - `BIDSTOOLS_scaleLabel`
   - `BIDSTOOLS_scaleFactor`
   - `BIDSTOOLS_dimensionId`
   - `BIDSTOOLS_dimensionKind`
   - `BIDSTOOLS_dimensionLayer`
3. Inspect each dimension `GroupItem`.
4. Confirm each created group stores:
   - `BIDSTOOLS_dimensionId`
   - `BIDSTOOLS_dimensionKind`
   - `BIDSTOOLS_dimensionTargetId`
   - `BIDSTOOLS_dimensionLayer`
   - `BIDSTOOLS_scaleMode`
   - `BIDSTOOLS_scaleLabel`
   - `BIDSTOOLS_scaleFactor`

## Unsupported selection regression

1. Select one unsupported object, such as text or placed art.
2. Click `Horizontal`.
3. Confirm the command fails with the same validation message used by the selection read path.
4. Click `Vertical`.
5. Confirm no dimension group is created on `BIDSTOOLS_DIMENSIONS`.

## Transform test

Use one simple rectangle with scale `38 mm = 1 m`.

1. Click `Refresh` and note the current `X`, `Y`, `W`, `H` values.
2. Change only `W` to `2.00` with `lock proportions` enabled.
3. Click `Apply Transform`.
4. Confirm the returned payload shows `W = 2.00` and `H` updated automatically by the same ratio.
5. Click `Refresh` again and confirm the values remain stable.
6. Change only `H` with `lock proportions` enabled and confirm `W` is recalculated.
7. Disable `lock proportions`.
8. Change both `W` and `H` to distinct values.
9. Click `Apply Transform` and confirm both dimensions are applied exactly.
10. Change `X` and `Y` to new values.
11. Click `Apply Transform` and confirm the object moves and the returned payload matches the requested position.
12. Change only `X` and keep `Y`, `W`, and `H` untouched.
13. Click `Apply Transform` and confirm only the horizontal position changes.
14. Change only `Y` and keep `X`, `W`, and `H` untouched.
15. Click `Apply Transform` and confirm only the vertical position changes.
16. Change only `W` with `lock proportions` disabled.
17. Click `Apply Transform` and confirm `H` stays unchanged.
18. Change only `H` with `lock proportions` disabled.
19. Click `Apply Transform` and confirm `W` stays unchanged.

## Validation notes

- Enter values with `.` and `,` as decimal separators to confirm both are accepted.
- Use positive `W` and `H` only. Zero or negative values should return an error.
- Validate on a non-rotated simple object, using `geometricBounds` behaviour as defined by the MVP.
- Confirm `X` and `Y` follow the selected object's `geometricBounds` left/top values, not `visibleBounds`.
- Confirm partial transform payloads do not force untouched fields back to zero or require all four inputs.
- Add a thick stroke to the rectangle and confirm `W` and `H` stay tied to geometric size.
- If scale input is invalid, confirm the panel returns an unsupported state with the scale error message instead of crashing.

## Selection validation states

- No document open: `Unsupported` with `Open an Illustrator document to inspect the selection.`
- Multiple objects selected: `Unsupported` with `Select a single object. Multiple selections are not supported in v1.`
- One non-path object selected, such as text or placed art: `Unsupported` with `Only simple PathItem selections are supported in v1.`
- One clipping path selected: `Unsupported` with `Clipping paths are not supported in v1.`
- One guide selected: `Unsupported` with `Guide objects are not supported.`
- One unreadable selection entry: `Unsupported` with `The current selection could not be read from Illustrator.`
- One object with invalid geometry response: `Unsupported` with one of:
  - `The selected object does not expose readable geometricBounds.`
  - `The selected object returned invalid geometricBounds values.`
  - `The selected object returned an invalid width value.`
  - `The selected object returned an invalid height value.`

## Scale engine regression tests

### Case A: `1:1`

Use the same rectangle:

- `W = 63.398 mm`
- `H = 59.989 mm`
- scale `1:1`

Expected display:

- `W = 0.06 m`
- `H = 0.06 m`
- `Perimeter = 0.25 m`
- `Area = 0.00 sq m`

Notes:

- internal values should stay unrounded until formatting;
- this confirms `1:1` means real size, with output still shown in `m`.

### Case B: `38 mm = 1 m`

Use the same rectangle:

- `W = 63.398 mm`
- `H = 59.989 mm`
- scale `38 mm = 1 m`

Expected internal values before formatting:

- `W = 1.668368421 m`
- `H = 1.578657895 m`
- `Perimeter = 6.494052632 m`
- `Area = 2.633782979 sq m`

Expected display:

- `W = 1.67 m`
- `H = 1.58 m`
- `Perimeter = 6.49 m`
- `Area = 2.63 sq m`
