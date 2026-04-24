(function (global) {
  var STORAGE_PREFIX = "bidstools.panel.";
  var PRESET_VALUES = {
    "1:1": true,
    "38 mm = 1 m": true
  };
  var defaults = {
    selection: null,
    lastResult: null,
    scaleMode: "document",
    scalePreset: "1:1",
    customScale: "",
    lockProportions: true,
    dimensionMode: "horizontalLine",
    dimensionLineColor: "#ff2a2a",
    dimensionTextColor: "#ff2a2a",
    dimensionFontSize: "10",
    dimensionStrokeWidth: "0.75",
    dimensionArrowSize: "7",
    dimensionLabelText: "Label"
  };
  var state = clone(defaults);

  function clone(source) {
    return JSON.parse(JSON.stringify(source));
  }

  function getStorage() {
    try {
      return global.localStorage || null;
    } catch (_error) {
      return null;
    }
  }

  function getPanelStorageKey(panelId) {
    return STORAGE_PREFIX + panelId;
  }

  function inferScaleState(scaleInput) {
    var normalizedInput = String(scaleInput || "").trim();

    if (!normalizedInput) {
      return {
        scalePreset: defaults.scalePreset,
        customScale: defaults.customScale
      };
    }

    if (PRESET_VALUES[normalizedInput]) {
      return {
        scalePreset: normalizedInput,
        customScale: ""
      };
    }

    return {
      scalePreset: defaults.scalePreset,
      customScale: normalizedInput
    };
  }

  function persistentSnapshot() {
    return {
      scaleMode: state.scaleMode,
      scalePreset: state.scalePreset,
      customScale: state.customScale,
      lockProportions: state.lockProportions,
      dimensionMode: state.dimensionMode,
      dimensionLineColor: state.dimensionLineColor,
      dimensionTextColor: state.dimensionTextColor,
      dimensionFontSize: state.dimensionFontSize,
      dimensionStrokeWidth: state.dimensionStrokeWidth,
      dimensionArrowSize: state.dimensionArrowSize,
      dimensionLabelText: state.dimensionLabelText
    };
  }

  function loadPanelState(panelId) {
    var storage = getStorage();
    var rawValue;
    var parsedValue;

    if (!storage) {
      return null;
    }

    rawValue = storage.getItem(getPanelStorageKey(panelId));
    if (!rawValue) {
      return null;
    }

    try {
      parsedValue = JSON.parse(rawValue);
    } catch (_error) {
      return null;
    }

    state = clone(defaults);
    return global.BIDSTOOLSState.patch(parsedValue);
  }

  function savePanelState(panelId) {
    var storage = getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(getPanelStorageKey(panelId), JSON.stringify(persistentSnapshot()));
  }

  function applySharedSettings(sharedSettings) {
    var scaleState;
    var nextState = {};

    if (!sharedSettings || typeof sharedSettings !== "object") {
      return state;
    }

    if (sharedSettings.scale) {
      scaleState = inferScaleState(sharedSettings.scale.input);
      nextState.scaleMode = sharedSettings.scale.mode || defaults.scaleMode;
      nextState.scalePreset = scaleState.scalePreset;
      nextState.customScale = scaleState.customScale;
    }

    if (sharedSettings.dimensionStyle) {
      nextState.dimensionLineColor = sharedSettings.dimensionStyle.lineColor || defaults.dimensionLineColor;
      nextState.dimensionTextColor = sharedSettings.dimensionStyle.textColor || defaults.dimensionTextColor;
      nextState.dimensionFontSize = String(sharedSettings.dimensionStyle.fontSize || defaults.dimensionFontSize);
      nextState.dimensionStrokeWidth = String(sharedSettings.dimensionStyle.strokeWidth || defaults.dimensionStrokeWidth);
      nextState.dimensionArrowSize = String(sharedSettings.dimensionStyle.arrowSize || defaults.dimensionArrowSize);
      nextState.dimensionLabelText = sharedSettings.dimensionStyle.labelText || defaults.dimensionLabelText;
    }

    if (sharedSettings.dimensionMode) {
      nextState.dimensionMode = sharedSettings.dimensionMode;
    }

    return global.BIDSTOOLSState.patch(nextState);
  }

  global.BIDSTOOLSState = {
    get: function () {
      return state;
    },
    patch: function (partialState) {
      for (var key in partialState) {
        if (Object.prototype.hasOwnProperty.call(partialState, key)) {
          state[key] = partialState[key];
        }
      }

      return state;
    },
    defaults: function () {
      return clone(defaults);
    },
    loadPanelState: loadPanelState,
    savePanelState: savePanelState,
    applySharedSettings: applySharedSettings
  };
})(this);
