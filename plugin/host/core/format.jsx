(function (global) {
  global.BIDSTOOLS = global.BIDSTOOLS || {};
  global.BIDSTOOLS.utils = global.BIDSTOOLS.utils || {};

  function roundTo(value, decimals) {
    if (typeof value !== "number" || !isFinite(value)) {
      return value;
    }

    var precision = typeof decimals === "number" ? decimals : 0;
    var factor = Math.pow(10, precision);

    return Math.round(value * factor) / factor;
  }

  function formatNumber(value, decimals) {
    var rounded = roundTo(value, decimals);
    var precision = typeof decimals === "number" ? decimals : 0;

    if (typeof rounded !== "number" || !isFinite(rounded)) {
      return String(rounded);
    }

    return rounded.toFixed(precision);
  }

  global.BIDSTOOLS.utils.ok = function (data, message) {
    return JSON.stringify({
      ok: true,
      message: message || "",
      data: data || null
    });
  };

  global.BIDSTOOLS.utils.fail = function (errorMessage, data) {
    return JSON.stringify({
      ok: false,
      error: errorMessage,
      data: data || null
    });
  };

  global.BIDSTOOLS.utils.roundTo = roundTo;
  global.BIDSTOOLS.utils.formatNumber = formatNumber;
})(this);
