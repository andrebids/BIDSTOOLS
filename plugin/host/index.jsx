(function (global) {
  function quoteString(value) {
    return "\"" + String(value)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, "\\\"")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n") + "\"";
  }

  function fail(errorMessage, data) {
    var payload = "{";
    payload += "\"ok\":false,";
    payload += "\"error\":" + quoteString(errorMessage) + ",";
    payload += "\"data\":null";
    payload += "}";
    return payload;
  }

  function normalizePath(path) {
    return String(path || "").replace(/\\/g, "/");
  }

  function parsePayload(payloadJson) {
    return payloadJson ? eval("(" + payloadJson + ")") : {};
  }

  function resolveBootstrapPath(payload) {
    var extensionRoot = payload && payload.extensionRoot ? normalizePath(payload.extensionRoot) : "";

    if (!extensionRoot) {
      throw new Error("Missing extensionRoot in payload.");
    }

    return extensionRoot + "/host/bootstrap.jsx";
  }

  function loadBootstrap(bootstrapPath) {
    $.evalFile(new File(bootstrapPath));
  }

  global.BIDSTOOLS_HOST = global.BIDSTOOLS_HOST || {};
  global.BIDSTOOLS_HOST.dispatch = function (method, payloadJson) {
    var payload;
    var bootstrapPath;

    try {
      payload = parsePayload(payloadJson || "{}");
      bootstrapPath = resolveBootstrapPath(payload);
      global.BIDSTOOLS_HOST.hostRoot = normalizePath(payload.extensionRoot) + "/host";
      loadBootstrap(bootstrapPath);

      if (typeof global.BIDSTOOLS_HOST.invoke !== "function") {
        return fail("Host bootstrap did not initialize correctly.");
      }

      return global.BIDSTOOLS_HOST.invoke(method, payloadJson || "{}");
    } catch (error) {
      return fail(error.message || String(error), {
        method: method
      });
    }
  };
})(this);
