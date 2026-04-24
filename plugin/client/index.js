(function (global) {
  var bridge = global.BIDSTOOLSBridge;
  var state = global.BIDSTOOLSState;

  function setActiveTab(tabId) {
    state.patch({
      activeTab: tabId
    });

    global.BIDSTOOLSUI.renderTabs(state.get());
  }

  function currentScaleInput() {
    var customValue = document.getElementById("customScaleInput").value.trim();
    var presetValue = document.getElementById("scalePreset").value;
    return {
      scaleMode: document.querySelector('input[name="scaleMode"]:checked').value,
      scaleInput: customValue || presetValue
    };
  }

  function currentDimensionStyle() {
    return {
      lineColor: document.getElementById("dimensionLineColor").value,
      textColor: document.getElementById("dimensionTextColor").value,
      fontSize: document.getElementById("dimensionFontSize").value,
      strokeWidth: document.getElementById("dimensionStrokeWidth").value,
      arrowSize: document.getElementById("dimensionArrowSize").value,
      labelText: document.getElementById("dimensionLabelText").value.trim() || "Label",
      dimensionMode: state.get().dimensionMode
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

    if (!button) {
      return;
    }

    button.classList.toggle("icon-lock-active", locked);
    button.classList.toggle("icon-lock-inactive", !locked);
    button.classList.toggle("icon-lock-open", !locked);
    button.setAttribute("aria-pressed", locked ? "true" : "false");
    button.setAttribute("title", locked ? "Lock proportions" : "Unlock proportions");
  }

  function logResult(result) {
    document.getElementById("logOutput").textContent = JSON.stringify(result, null, 2);
  }

  function syncStateFromForm() {
    var scale = currentScaleInput();
    state.patch({
      scaleMode: scale.scaleMode,
      scalePreset: document.getElementById("scalePreset").value,
      customScale: document.getElementById("customScaleInput").value.trim(),
      dimensionLineColor: document.getElementById("dimensionLineColor").value,
      dimensionTextColor: document.getElementById("dimensionTextColor").value,
      dimensionFontSize: document.getElementById("dimensionFontSize").value,
      dimensionStrokeWidth: document.getElementById("dimensionStrokeWidth").value,
      dimensionArrowSize: document.getElementById("dimensionArrowSize").value,
      dimensionLabelText: document.getElementById("dimensionLabelText").value.trim() || "Label"
    });
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

    global.BIDSTOOLSUI.renderScale(state.get());
    global.BIDSTOOLSUI.renderSelection(result);
    global.BIDSTOOLSUI.renderDimensions(state.get());
    populateTransform(result.ok ? result.data : null);
    renderLockState();
    renderPreview();
    logResult(result);
  }

  function refreshSelection() {
    syncStateFromForm();
    return bridge.refreshSelection(currentScaleInput()).then(render);
  }

  function applyTransform() {
    var currentSelection = state.get().selection;

    syncStateFromForm();

    var payload = currentScaleInput();
    payload.x = currentSelection && currentSelection.x ? currentSelection.x : "0";
    payload.y = currentSelection && currentSelection.y ? currentSelection.y : "0";
    payload.w = document.getElementById("transformW").value;
    payload.h = document.getElementById("transformH").value;
    payload.lockProportions = isLockEnabled();

    return bridge.applyTransform(payload).then(render);
  }

  function toggleLockProportions() {
    state.patch({
      lockProportions: !isLockEnabled()
    });
    renderLockState();
    if (isLockEnabled()) {
      syncLockedTransformField("w");
    }
    renderPreview();
  }

  function createHorizontalDimension(method) {
    syncStateFromForm();
    var payload = currentScaleInput();
    var style = currentDimensionStyle();

    for (var key in style) {
      if (Object.prototype.hasOwnProperty.call(style, key)) {
        payload[key] = style[key];
      }
    }

    payload.dimensionMethod = method || "line";
    return bridge.createHorizontalDimension(payload).then(render);
  }

  function createVerticalDimension(method) {
    syncStateFromForm();
    var payload = currentScaleInput();
    var style = currentDimensionStyle();

    for (var key in style) {
      if (Object.prototype.hasOwnProperty.call(style, key)) {
        payload[key] = style[key];
      }
    }

    payload.dimensionMethod = method || "line";
    return bridge.createVerticalDimension(payload).then(render);
  }

  function createDiameterDimension() {
    syncStateFromForm();
    var payload = currentScaleInput();
    var style = currentDimensionStyle();

    for (var key in style) {
      if (Object.prototype.hasOwnProperty.call(style, key)) {
        payload[key] = style[key];
      }
    }

    return bridge.createDiameterDimension(payload).then(render);
  }

  function createRadiusDimension() {
    syncStateFromForm();
    var payload = currentScaleInput();
    var style = currentDimensionStyle();

    for (var key in style) {
      if (Object.prototype.hasOwnProperty.call(style, key)) {
        payload[key] = style[key];
      }
    }

    return bridge.createRadiusDimension(payload).then(render);
  }

  function createDimensionLabel() {
    syncStateFromForm();
    var payload = currentScaleInput();
    var style = currentDimensionStyle();

    for (var key in style) {
      if (Object.prototype.hasOwnProperty.call(style, key)) {
        payload[key] = style[key];
      }
    }

    return bridge.createDimensionLabel(payload).then(render);
  }

  function setDimensionMode(mode) {
    state.patch({
      dimensionMode: mode
    });

    global.BIDSTOOLSUI.renderDimensions(state.get());
  }

  function bindEvents() {
    var tabButtons = document.querySelectorAll("[data-tab-target]");
    var dimensionButtons = document.querySelectorAll("[data-dimension-mode]");
    var index;

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
    document.getElementById("horizontalLineButton").addEventListener("click", function () {
      setDimensionMode("horizontalLine");
      createHorizontalDimension("line");
    });
    document.getElementById("horizontalPointsButton").addEventListener("click", function () {
      setDimensionMode("horizontalPoints");
      createHorizontalDimension("points");
    });
    document.getElementById("verticalLineButton").addEventListener("click", function () {
      setDimensionMode("verticalLine");
      createVerticalDimension("line");
    });
    document.getElementById("verticalPointsButton").addEventListener("click", function () {
      setDimensionMode("verticalPoints");
      createVerticalDimension("points");
    });
    document.getElementById("diameterDimensionButton").addEventListener("click", createDiameterDimension);
    document.getElementById("radiusDimensionButton").addEventListener("click", createRadiusDimension);
    document.getElementById("labelDimensionButton").addEventListener("click", createDimensionLabel);

    for (index = 0; index < tabButtons.length; index += 1) {
      tabButtons[index].addEventListener("click", function (event) {
        setActiveTab(event.currentTarget.getAttribute("data-tab-target"));
      });
    }

    for (index = 0; index < dimensionButtons.length; index += 1) {
      dimensionButtons[index].addEventListener("click", function (event) {
        setDimensionMode(event.currentTarget.getAttribute("data-dimension-mode"));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindEvents();
    setActiveTab("transform");
    global.BIDSTOOLSUI.renderScale(state.get());
    global.BIDSTOOLSUI.renderTabs(state.get());
    global.BIDSTOOLSUI.renderDimensions(state.get());
    renderLockState();
    renderPreview();
    refreshSelection();
  });
})(this);
