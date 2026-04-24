(function (global) {
  var PANEL_ID = "cadtracker";
  var bridge = global.BIDSTOOLSBridge;
  var state = global.BIDSTOOLSState;
  var settingsStore = global.BIDSTOOLSSettingsStore;
  var removeSelectionChangedListener = null;
  var selectionRefreshInFlight = false;
  var queuedSelectionEventPayload = null;
  var lastSelectionEventSignature = null;

  function currentScaleInput() {
    var currentState = state.get();
    return {
      scaleMode: currentState.scaleMode,
      scaleInput: currentState.customScale || currentState.scalePreset
    };
  }

  function currentPanelSettingsPayload() {
    var currentState = state.get();
    return {
      scaleMode: currentState.scaleMode,
      scaleInput: currentState.customScale || currentState.scalePreset,
      lineColor: currentState.dimensionLineColor,
      textColor: currentState.dimensionTextColor,
      fontSize: currentState.dimensionFontSize,
      strokeWidth: currentState.dimensionStrokeWidth,
      arrowSize: currentState.dimensionArrowSize,
      labelText: currentState.dimensionLabelText,
      dimensionMode: currentState.dimensionMode
    };
  }

  function isLockEnabled() {
    return !!state.get().lockProportions;
  }

  function parseInputNumber(value) {
    var normalized = String(value || "").replace(/,/g, ".").trim();
    var parsed = Number(normalized);
    return isFinite(parsed) ? parsed : null;
  }

  function formatPreviewNumber(value, suffix) {
    if (typeof value !== "number" || !isFinite(value)) {
      return "--" + (suffix ? " " + suffix : "");
    }

    return value.toFixed(2) + (suffix ? " " + suffix : "");
  }

  function formatTransformInput(value) {
    if (typeof value !== "number" || !isFinite(value)) {
      return "";
    }

    return value.toFixed(2);
  }

  function renderScaleSummary() {
    var currentState = state.get();
    var scaleValue = currentState.customScale || currentState.scalePreset;
    var scaleModeLabel = document.getElementById("scaleModeLabel");
    var scaleBadge = document.getElementById("currentScaleBadge");

    if (scaleModeLabel) {
      scaleModeLabel.textContent = currentState.scaleMode === "layer" ? "Layer-based" : "Document-based";
    }

    if (scaleBadge) {
      scaleBadge.textContent = scaleValue || "1:1";
    }
  }

  function computePreviewMetrics() {
    var currentSelection = state.get().selection;
    var inputW = parseInputNumber(document.getElementById("transformW").value);
    var inputH = parseInputNumber(document.getElementById("transformH").value);
    var currentW;
    var currentH;
    var deltaW;
    var deltaH;
    var ratioW;
    var ratioH;

    if (!currentSelection || !currentSelection.supported) {
      return null;
    }

    currentW = parseInputNumber(currentSelection.w);
    currentH = parseInputNumber(currentSelection.h);

    if (inputW === null || inputH === null || currentW === null || currentH === null || currentW <= 0 || currentH <= 0) {
      return null;
    }

    if (isLockEnabled()) {
      deltaW = Math.abs(inputW - currentW);
      deltaH = Math.abs(inputH - currentH);
      ratioW = deltaW / currentW;
      ratioH = deltaH / currentH;

      if (ratioH > ratioW) {
        inputW = currentW * (inputH / currentH);
      } else {
        inputH = currentH * (inputW / currentW);
      }
    }

    return {
      w: inputW,
      h: inputH,
      perimeter: 2 * (inputW + inputH),
      area: inputW * inputH
    };
  }

  function renderPreview() {
    var preview = computePreviewMetrics();

    if (!preview) {
      document.getElementById("previewW").textContent = "-- m";
      document.getElementById("previewH").textContent = "-- m";
      document.getElementById("previewPerimeter").textContent = "-- m";
      document.getElementById("previewArea").textContent = "-- sq m";
      return;
    }

    document.getElementById("previewW").textContent = formatPreviewNumber(preview.w, "m");
    document.getElementById("previewH").textContent = formatPreviewNumber(preview.h, "m");
    document.getElementById("previewPerimeter").textContent = formatPreviewNumber(preview.perimeter, "m");
    document.getElementById("previewArea").textContent = formatPreviewNumber(preview.area, "sq m");
  }

  function syncLockedTransformField(changedField) {
    var currentSelection = state.get().selection;
    var widthInput = document.getElementById("transformW");
    var heightInput = document.getElementById("transformH");
    var currentW;
    var currentH;
    var changedValue;
    var linkedValue;

    if (!isLockEnabled() || !currentSelection || !currentSelection.supported) {
      return;
    }

    currentW = parseInputNumber(currentSelection.w);
    currentH = parseInputNumber(currentSelection.h);

    if (currentW === null || currentH === null || currentW <= 0 || currentH <= 0) {
      return;
    }

    if (changedField === "w") {
      changedValue = parseInputNumber(widthInput.value);
      if (changedValue === null || changedValue <= 0) {
        return;
      }

      linkedValue = currentH * (changedValue / currentW);
      heightInput.value = formatTransformInput(linkedValue);
      return;
    }

    changedValue = parseInputNumber(heightInput.value);
    if (changedValue === null || changedValue <= 0) {
      return;
    }

    linkedValue = currentW * (changedValue / currentH);
    widthInput.value = formatTransformInput(linkedValue);
  }

  function renderLockState() {
    var button = document.getElementById("lockToggleButton");
    var locked = isLockEnabled();

    button.classList.toggle("icon-lock-active", locked);
    button.classList.toggle("icon-lock-inactive", !locked);
    button.classList.toggle("icon-lock-open", !locked);
    button.setAttribute("aria-pressed", locked ? "true" : "false");
    button.setAttribute("title", locked ? "Lock proportions" : "Unlock proportions");
  }

  function populateTransform(selection) {
    if (!selection || !selection.supported) {
      return;
    }

    document.getElementById("transformW").value = selection.w;
    document.getElementById("transformH").value = selection.h;
  }

  function render(result) {
    state.patch({
      lastResult: result,
      selection: result.ok ? result.data : null
    });

    global.BIDSTOOLSUI.renderSelection(result);
    populateTransform(result.ok ? result.data : null);
    renderScaleSummary();
    renderLockState();
    renderPreview();
  }

  function syncPanelSettings() {
    state.savePanelState(PANEL_ID);
    return bridge.syncPanelSettings(currentPanelSettingsPayload());
  }

  function refreshSelection() {
    return syncPanelSettings().then(function () {
      return bridge.refreshSelection(currentScaleInput()).then(render);
    });
  }

  function parseSelectionChangedEventData(event) {
    if (!event || typeof event.data === "undefined" || event.data === null) {
      return {};
    }

    if (typeof event.data === "string") {
      try {
        return JSON.parse(event.data);
      } catch (_error) {
        return {
          raw: event.data
        };
      }
    }

    if (typeof event.data === "object") {
      return event.data;
    }

    return {
      raw: String(event.data)
    };
  }

  function requestSelectionRefreshFromEvent(eventPayload) {
    var signature = eventPayload && eventPayload.selectionSignature ? eventPayload.selectionSignature : null;

    if (signature && signature === lastSelectionEventSignature && !selectionRefreshInFlight) {
      return Promise.resolve(state.get().lastResult || null);
    }

    if (selectionRefreshInFlight) {
      queuedSelectionEventPayload = eventPayload || {};
      return Promise.resolve(state.get().lastResult || null);
    }

    selectionRefreshInFlight = true;

    return refreshSelection()
      .then(function (result) {
        if (signature) {
          lastSelectionEventSignature = signature;
        }

        return result;
      })
      .finally(function () {
        var nextQueuedPayload = queuedSelectionEventPayload;

        selectionRefreshInFlight = false;
        queuedSelectionEventPayload = null;

        if (nextQueuedPayload) {
          requestSelectionRefreshFromEvent(nextQueuedPayload);
        }
      });
  }

  function handleSelectionChangedEvent(event) {
    requestSelectionRefreshFromEvent(parseSelectionChangedEventData(event));
  }

  function bindSelectionChangedEvent() {
    if (!bridge || typeof bridge.addEventListener !== "function" || !bridge.events || !bridge.events.selectionChanged) {
      return;
    }

    removeSelectionChangedListener = bridge.addEventListener(bridge.events.selectionChanged, handleSelectionChangedEvent);
  }

  function applyTransform() {
    var currentSelection = state.get().selection;
    var payload = currentScaleInput();

    payload.x = currentSelection && currentSelection.x ? currentSelection.x : "0";
    payload.y = currentSelection && currentSelection.y ? currentSelection.y : "0";
    payload.w = document.getElementById("transformW").value;
    payload.h = document.getElementById("transformH").value;
    payload.lockProportions = isLockEnabled();

    state.savePanelState(PANEL_ID);

    return syncPanelSettings().then(function () {
      return bridge.applyTransform(payload).then(render);
    });
  }

  function toggleLockProportions() {
    state.patch({
      lockProportions: !isLockEnabled()
    });
    state.savePanelState(PANEL_ID);
    renderLockState();
    if (isLockEnabled()) {
      syncLockedTransformField("w");
    }
    renderPreview();
  }

  function loadPersistedState() {
    state.loadPanelState(PANEL_ID);
    settingsStore.hydrateState(state);
  }

  function bindEvents() {
    document.getElementById("refreshButton").addEventListener("click", refreshSelection);
    document.getElementById("applyTransformButton").addEventListener("click", applyTransform);
    document.getElementById("lockToggleButton").addEventListener("click", toggleLockProportions);
    document.getElementById("transformW").addEventListener("input", function () {
      syncLockedTransformField("w");
      renderPreview();
    });
    document.getElementById("transformH").addEventListener("input", function () {
      syncLockedTransformField("h");
      renderPreview();
    });
    global.addEventListener("focus", function () {
      settingsStore.hydrateState(state);
      renderScaleSummary();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadPersistedState();
    bindEvents();
    bindSelectionChangedEvent();
    renderScaleSummary();
    renderLockState();
    renderPreview();
    syncPanelSettings().then(refreshSelection);
  });

  global.addEventListener("beforeunload", function () {
    if (typeof removeSelectionChangedListener === "function") {
      removeSelectionChangedListener();
      removeSelectionChangedListener = null;
    }
  });
})(this);
