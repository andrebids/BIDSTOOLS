(function (global) {
  var hostRoot = global.BIDSTOOLS_HOST && global.BIDSTOOLS_HOST.hostRoot
    ? String(global.BIDSTOOLS_HOST.hostRoot).replace(/\\/g, "/")
    : "";
  var coreDir = hostRoot + "/core";
  var modules = [
    "json.jsx",
    "format.jsx",
    "scale.jsx",
    "panel-sync.jsx",
    "guards.jsx",
    "geometry.jsx",
    "metadata.jsx",
    "selection.jsx",
    "transform.jsx",
    "dimensions.jsx"
  ];
  var bootstrapFile = new File(hostRoot + "/bootstrap.jsx");
  var index;

  if (!hostRoot) {
    throw new Error("Host root not configured before bootstrap load.");
  }

  global.BIDSTOOLS_HOST = global.BIDSTOOLS_HOST || {};
  global.BIDSTOOLS_HOST.state = global.BIDSTOOLS_HOST.state || {
    signature: "",
    loadCount: 0,
    lastLoadError: ""
  };

  function safeFail(errorMessage, data) {
    var utils = global.BIDSTOOLS && global.BIDSTOOLS.utils;

    if (utils && typeof utils.fail === "function") {
      return utils.fail(errorMessage, data);
    }

    return JSON.stringify({
      ok: false,
      error: errorMessage,
      data: data || null
    });
  }

  function fileStamp(fileRef) {
    var modified = fileRef.exists && fileRef.modified ? fileRef.modified.getTime() : 0;
    return fileRef.fsName + ":" + modified;
  }

  function getSignature() {
    var parts = [fileStamp(bootstrapFile)];

    for (index = 0; index < modules.length; index += 1) {
      parts.push(fileStamp(new File(coreDir + "/" + modules[index])));
    }

    return parts.join("|");
  }

  function resetRuntime() {
    global.BIDSTOOLS = {
      api: {}
    };
  }

  function loadModules() {
    for (index = 0; index < modules.length; index += 1) {
      $.evalFile(new File(coreDir + "/" + modules[index]));
    }
  }

  function createDispatch() {
    global.BIDSTOOLS.dispatch = function (method, payloadJson) {
      var payload;
      var fn = global.BIDSTOOLS.api[method];

      try {
        payload = payloadJson ? JSON.parse(payloadJson) : {};
      } catch (_error) {
        return safeFail("Invalid payload JSON.");
      }

      if (!fn) {
        return safeFail("Unknown host method: " + method);
      }

      try {
        return fn(payload);
      } catch (error) {
        return safeFail(error.message || String(error));
      }
    };
  }

  global.BIDSTOOLS_HOST.ensureHostReady = function (options) {
    var state = global.BIDSTOOLS_HOST.state;
    var signature = getSignature();
    var needsReload = !global.BIDSTOOLS ||
      typeof global.BIDSTOOLS.dispatch !== "function" ||
      state.signature !== signature ||
      (options && options.forceReload === true);

    if (!needsReload) {
      return {
        ok: true,
        reloaded: false,
        loadCount: state.loadCount
      };
    }

    try {
      resetRuntime();
      loadModules();
      createDispatch();
      state.signature = signature;
      state.loadCount += 1;
      state.lastLoadError = "";
    } catch (error) {
      state.lastLoadError = error.message || String(error);
      return {
        ok: false,
        reloaded: false,
        error: state.lastLoadError
      };
    }

    return {
      ok: true,
      reloaded: true,
      loadCount: state.loadCount
    };
  };

  global.BIDSTOOLS_HOST.invoke = function (method, payloadJson) {
    var loadState = global.BIDSTOOLS_HOST.ensureHostReady();

    if (!loadState.ok) {
      return safeFail(loadState.error || "Unable to load host modules.");
    }

    try {
      return global.BIDSTOOLS.dispatch(method, payloadJson || "{}");
    } catch (error) {
      return safeFail(error.message || String(error), {
        method: method
      });
    }
  };
})(this);
