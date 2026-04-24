(function (global) {
  var PANEL_ID = "scale";
  var bridge = global.BIDSTOOLSBridge;
  var state = global.BIDSTOOLSState;
  var settingsStore = global.BIDSTOOLSSettingsStore;

  function currentScaleInput() {
    var customValue = document.getElementById("customScaleInput").value.trim();
    var presetValue = document.getElementById("scalePreset").value;

    return {
      scaleMode: document.querySelector('input[name="scaleMode"]:checked').value,
      scaleInput: customValue || presetValue
    };
  }

  function currentPanelSettingsPayload() {
    var scale = currentScaleInput();
    var currentState = state.get();

    return {
      scaleMode: scale.scaleMode,
      scaleInput: scale.scaleInput,
      lineColor: currentState.dimensionLineColor,
      textColor: currentState.dimensionTextColor,
      fontSize: currentState.dimensionFontSize,
      strokeWidth: currentState.dimensionStrokeWidth,
      arrowSize: currentState.dimensionArrowSize,
      labelText: currentState.dimensionLabelText,
      dimensionMode: currentState.dimensionMode
    };
  }

  function renderSummary() {
    var scale = currentScaleInput();
    var modeLabel = document.getElementById("scaleSummaryMode");
    var valueLabel = document.getElementById("scaleSummaryValue");

    modeLabel.textContent = scale.scaleMode === "layer" ? "Layer-based" : "Document-based";
    valueLabel.textContent = scale.scaleInput || "1:1";
  }

  function updateSyncStatus(text, isError) {
    var status = document.getElementById("scaleSyncStatus");
    status.textContent = text;
    status.className = isError ? "pill status-error" : "pill";
  }

  function syncStateFromForm() {
    var scale = currentScaleInput();

    state.patch({
      scaleMode: scale.scaleMode,
      scalePreset: document.getElementById("scalePreset").value,
      customScale: document.getElementById("customScaleInput").value.trim()
    });
    state.savePanelState(PANEL_ID);
  }

  function syncPanelSettings() {
    syncStateFromForm();
    renderSummary();
    updateSyncStatus("Syncing", false);

    return bridge.syncPanelSettings(currentPanelSettingsPayload()).then(function (result) {
      updateSyncStatus(result.ok ? "Synced" : "Error", !result.ok);
      return result;
    });
  }

  function loadPersistedState() {
    state.loadPanelState(PANEL_ID);
    settingsStore.hydrateState(state);
  }

  function bindEvents() {
    var scaleModeRadios = document.querySelectorAll('input[name="scaleMode"]');
    var index;

    document.getElementById("scalePreset").addEventListener("change", syncPanelSettings);
    document.getElementById("customScaleInput").addEventListener("change", syncPanelSettings);

    for (index = 0; index < scaleModeRadios.length; index += 1) {
      scaleModeRadios[index].addEventListener("change", syncPanelSettings);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadPersistedState();
    global.BIDSTOOLSUI.renderScale(state.get());
    renderSummary();
    bindEvents();
    syncPanelSettings();
  });
})(this);
