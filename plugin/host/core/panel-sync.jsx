(function (global) {
  var utils = global.BIDSTOOLS.utils;
  var scaleApi = global.BIDSTOOLS.scale;
  var SETTINGS_RELATIVE_PATH = "/shared/panel-settings.json";

  function normalizePath(path) {
    return String(path || "").replace(/\\/g, "/");
  }

  function getExtensionRoot() {
    var hostRoot = global.BIDSTOOLS_HOST && global.BIDSTOOLS_HOST.hostRoot
      ? normalizePath(global.BIDSTOOLS_HOST.hostRoot)
      : "";

    if (!hostRoot) {
      throw new Error("Host root is not configured.");
    }

    return hostRoot.replace(/\/host$/i, "");
  }

  function ensureParentFolder(fileRef) {
    var parent = fileRef.parent;

    if (parent && !parent.exists) {
      parent.create();
    }
  }

  function buildSettingsPayload(payload) {
    var scaleMode = payload.scaleMode || "document";
    var scaleInput = payload.scaleInput || "1:1";
    var scale = scaleApi.parseScale(scaleInput);

    return {
      version: 1,
      updatedAt: new Date().toUTCString(),
      scale: {
        mode: scaleMode,
        input: scaleInput,
        label: scale.label,
        drawnUnit: scale.drawnUnit,
        realUnit: scale.realUnit,
        drawnValue: scale.drawnValue,
        realValue: scale.realValue,
        factorLinear: scale.factorLinear,
        factorArea: scale.factorArea
      },
      dimensionStyle: {
        lineColor: payload.lineColor || "#ff2a2a",
        textColor: payload.textColor || payload.lineColor || "#ff2a2a",
        fontSize: Number(payload.fontSize || 10),
        strokeWidth: Number(payload.strokeWidth || 0.75),
        arrowSize: Number(payload.arrowSize || 7),
        labelText: payload.labelText || "Label"
      },
      dimensionMode: payload.dimensionMode || "horizontalLine"
    };
  }

  function getSettingsFile() {
    return new File(getExtensionRoot() + SETTINGS_RELATIVE_PATH);
  }

  function writePanelSettingsInternal(payload) {
    var fileRef = getSettingsFile();
    var settingsPayload = buildSettingsPayload(payload || {});

    ensureParentFolder(fileRef);

    if (!fileRef.open("w")) {
      throw new Error("Unable to open panel settings file for writing.");
    }

    fileRef.encoding = "UTF-8";
    fileRef.write(JSON.stringify(settingsPayload));
    fileRef.close();

    return {
      path: normalizePath(fileRef.fsName),
      scaleLabel: settingsPayload.scale.label,
      dimensionMode: settingsPayload.dimensionMode
    };
  }

  global.BIDSTOOLS.api.writePanelSettings = function (payload) {
    return utils.ok(writePanelSettingsInternal(payload), "Panel settings synced.");
  };
})(this);
