(function (global) {
  var SHARED_SETTINGS_RELATIVE_PATH = "\\shared\\panel-settings.json";

  function getCepFs() {
    if (global.window && global.window.cep && global.window.cep.fs) {
      return global.window.cep.fs;
    }

    return null;
  }

  function getSharedSettingsPath() {
    if (!global.BIDSTOOLSBridge || typeof global.BIDSTOOLSBridge.getExtensionRoot !== "function") {
      return "";
    }

    return global.BIDSTOOLSBridge.getExtensionRoot() + SHARED_SETTINGS_RELATIVE_PATH;
  }

  function loadSharedSettings() {
    var fs = getCepFs();
    var result;

    if (!fs) {
      return null;
    }

    result = fs.readFile(getSharedSettingsPath());
    if (!result || result.err !== 0 || !result.data) {
      return null;
    }

    try {
      return JSON.parse(result.data);
    } catch (_error) {
      return null;
    }
  }

  function hydrateState(stateApi) {
    var sharedSettings = loadSharedSettings();

    if (!sharedSettings || !stateApi || typeof stateApi.applySharedSettings !== "function") {
      return null;
    }

    stateApi.applySharedSettings(sharedSettings);
    return sharedSettings;
  }

  global.BIDSTOOLSSettingsStore = {
    getSharedSettingsPath: getSharedSettingsPath,
    loadSharedSettings: loadSharedSettings,
    hydrateState: hydrateState
  };
})(this);
