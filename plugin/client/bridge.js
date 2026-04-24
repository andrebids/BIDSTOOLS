(function (global) {
  var REQUEST_PREFIX = "bidstools";
  var SELECTION_CHANGED_EVENT = "com.bidstools.selectionChanged";
  var requestCounter = 0;

  function createFallbackInterface(reason) {
    return {
      evalScript: function (_script, callback) {
        var payload = {
          ok: false,
          error: reason || "CEP host interface unavailable. Open inside Illustrator CEP."
        };
        callback(JSON.stringify(payload));
      },
      addEventListener: function () {},
      removeEventListener: function () {}
    };
  }

  function createPartialCepInterface(cep) {
    return {
      evalScript: function (script, callback) {
        cep.evalScript(script, callback);
      },
      addEventListener: function () {},
      removeEventListener: function () {}
    };
  }

  function createCepHostInterface() {
    if (typeof CSInterface !== "undefined") {
      return new CSInterface();
    }

    if (typeof global.__adobe_cep__ !== "undefined" && global.__adobe_cep__ && typeof global.__adobe_cep__.evalScript === "function") {
      return createPartialCepInterface(global.__adobe_cep__);
    }

    return createFallbackInterface("CEP scripting interface unavailable. The panel loaded, but the host bridge is not active.");
  }

  var csInterface = createCepHostInterface();

  function escapeForEvalScript(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n");
  }

  function nextRequestId() {
    requestCounter += 1;
    return REQUEST_PREFIX + "-" + requestCounter;
  }

  function normalizePayload(payload) {
    var normalized = payload && typeof payload === "object" ? payload : {};

    if (!normalized.extensionRoot) {
      normalized.extensionRoot = getExtensionRoot();
    }

    return normalized;
  }

  function getExtensionRoot() {
    var pathname = global.location && global.location.pathname ? decodeURIComponent(global.location.pathname) : "";

    if (/^\/[A-Za-z]:\//.test(pathname)) {
      pathname = pathname.slice(1);
    }

    pathname = pathname.replace(/\//g, "\\");
    return pathname.replace(/\\client\\[^\\]+\.html$/i, "");
  }

  function parseResponse(raw) {
    if (!raw) {
      return { ok: false, error: "Empty response from host." };
    }

    if (raw === "EvalScript error.") {
      return {
        ok: false,
        error: "Host ExtendScript threw before returning JSON. This usually means a CEP/ExtendScript runtime error in the JSX layer.",
        raw: raw
      };
    }

    try {
      return JSON.parse(raw);
    } catch (_error) {
      return { ok: false, error: "Invalid JSON response from host.", raw: raw };
    }
  }

  function buildEvalScript(method, payloadJson, requestId) {
    var script = "(function(){";
    script += "var response;";
    script += "try{";
    script += "if(typeof BIDSTOOLS_HOST==='undefined'||!BIDSTOOLS_HOST||typeof BIDSTOOLS_HOST.dispatch!=='function'){";
    script += "response=JSON.stringify({ok:false,error:'BIDSTOOLS host bridge unavailable.',data:{requestId:'" + escapeForEvalScript(requestId) + "',method:'" + escapeForEvalScript(method) + "'}});";
    script += "}else{";
    script += "response=BIDSTOOLS_HOST.dispatch('" + escapeForEvalScript(method) + "','" + escapeForEvalScript(payloadJson) + "');";
    script += "}";
    script += "}catch(error){";
    script += "response=JSON.stringify({ok:false,error:(error&&error.message)?error.message:String(error),data:{requestId:'" + escapeForEvalScript(requestId) + "',method:'" + escapeForEvalScript(method) + "'}});";
    script += "}";
    script += "return response;";
    script += "}())";
    return script;
  }

  function invoke(method, payload) {
    return new Promise(function (resolve) {
      var requestId = nextRequestId();
      var payloadJson = JSON.stringify(normalizePayload(payload));
      var script = buildEvalScript(method, payloadJson, requestId);

      csInterface.evalScript(script, function (raw) {
        var result = parseResponse(raw);
        result.requestId = requestId;
        result.method = method;

        resolve(result);
      });
    });
  }

  function addEventListener(type, listener) {
    if (!csInterface || typeof csInterface.addEventListener !== "function") {
      return function () {};
    }

    csInterface.addEventListener(type, listener);

    return function removeListener() {
      if (typeof csInterface.removeEventListener === "function") {
        csInterface.removeEventListener(type, listener);
      }
    };
  }

  global.BIDSTOOLSBridge = {
    events: {
      selectionChanged: SELECTION_CHANGED_EVENT
    },
    getExtensionRoot: getExtensionRoot,
    addEventListener: addEventListener,
    invoke: invoke,
    refreshSelection: function (payload) {
      return invoke("getSelectionInfo", payload);
    },
    applyTransform: function (payload) {
      return invoke("updateTransform", payload);
    },
    createHorizontalDimension: function (payload) {
      return invoke("createHorizontalDimension", payload);
    },
    createVerticalDimension: function (payload) {
      return invoke("createVerticalDimension", payload);
    },
    createDiameterDimension: function (payload) {
      return invoke("createDiameterDimension", payload);
    },
    createRadiusDimension: function (payload) {
      return invoke("createRadiusDimension", payload);
    },
    createDimensionLabel: function (payload) {
      return invoke("createDimensionLabel", payload);
    },
    syncPanelSettings: function (payload) {
      return invoke("writePanelSettings", payload);
    }
  };
})(this);
