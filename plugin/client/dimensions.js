(function (global) {
  var PANEL_ID = "dimensions";
  var bridge = global.BIDSTOOLSBridge;
  var state = global.BIDSTOOLSState;
  var settingsStore = global.BIDSTOOLSSettingsStore;

  function currentPanelSettingsPayload() {
    return {
      scaleMode: state.get().scaleMode,
      scaleInput: state.get().customScale || state.get().scalePreset,
      lineColor: document.getElementById("dimensionLineColor").value,
      textColor: document.getElementById("dimensionTextColor").value,
      fontSize: document.getElementById("dimensionFontSize").value,
      strokeWidth: document.getElementById("dimensionStrokeWidth").value,
      arrowSize: document.getElementById("dimensionArrowSize").value,
      labelText: document.getElementById("dimensionLabelText").value.trim() || "Label",
      dimensionMode: document.getElementById("dimensionMode").value
    };
  }

  function updateSyncStatus(text, isError) {
    var status = document.getElementById("dimensionsSyncStatus");
    status.textContent = text;
    status.className = isError ? "pill status-error" : "pill";
  }

  function syncStateFromForm() {
    state.patch({
      dimensionMode: document.getElementById("dimensionMode").value,
      dimensionLineColor: document.getElementById("dimensionLineColor").value,
      dimensionTextColor: document.getElementById("dimensionTextColor").value,
      dimensionFontSize: document.getElementById("dimensionFontSize").value,
      dimensionStrokeWidth: document.getElementById("dimensionStrokeWidth").value,
      dimensionArrowSize: document.getElementById("dimensionArrowSize").value,
      dimensionLabelText: document.getElementById("dimensionLabelText").value.trim() || "Label"
    });
    state.savePanelState(PANEL_ID);
  }

  function syncPanelSettings() {
    syncStateFromForm();
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
    document.getElementById("dimensionMode").addEventListener("change", syncPanelSettings);
    document.getElementById("dimensionLineColor").addEventListener("change", syncPanelSettings);
    document.getElementById("dimensionTextColor").addEventListener("change", syncPanelSettings);
    document.getElementById("dimensionFontSize").addEventListener("change", syncPanelSettings);
    document.getElementById("dimensionStrokeWidth").addEventListener("change", syncPanelSettings);
    document.getElementById("dimensionArrowSize").addEventListener("change", syncPanelSettings);
    document.getElementById("dimensionLabelText").addEventListener("change", syncPanelSettings);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadPersistedState();
    global.BIDSTOOLSUI.renderDimensions(state.get());
    bindEvents();
    syncPanelSettings();
  });
})(this);
