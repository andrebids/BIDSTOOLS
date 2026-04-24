(function (global) {
  var utils = global.BIDSTOOLS.utils;
  var MM_PER_M = 1000;

  function normalizeScaleInput(input) {
    return String(input || "1:1")
      .replace(/,/g, ".")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function parsePositiveNumber(value, label, originalInput) {
    var parsed = Number(value);

    if (!isFinite(parsed) || parsed <= 0) {
      throw new Error("Invalid " + label + " in scale: " + originalInput);
    }

    return parsed;
  }

  function buildScale(label, drawnValueMm, realValueM) {
    var factorLinear = realValueM / drawnValueMm;

    return {
      label: label,
      drawnUnit: "mm",
      realUnit: "m",
      drawnValue: drawnValueMm,
      realValue: realValueM,
      factorLinear: factorLinear,
      factorArea: factorLinear * factorLinear
    };
  }

  function parseScale(input) {
    var normalized = normalizeScaleInput(input);
    var ratioMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    var customMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*mm\s*=\s*(\d+(?:\.\d+)?)\s*m$/i);
    var drawnValue;
    var realValue;

    if (ratioMatch) {
      drawnValue = parsePositiveNumber(ratioMatch[1], "drawn value", normalized);
      realValue = parsePositiveNumber(ratioMatch[2], "real value", normalized);

      if (drawnValue === 1 && realValue === 1) {
        return buildScale(normalized, 1, 1 / MM_PER_M);
      }

      return buildScale(normalized, drawnValue, realValue / MM_PER_M);
    }

    if (customMatch) {
      drawnValue = parsePositiveNumber(customMatch[1], "drawn value", normalized);
      realValue = parsePositiveNumber(customMatch[2], "real value", normalized);

      return buildScale(normalized, drawnValue, realValue);
    }

    throw new Error("Unsupported scale format: " + normalized);
  }

  function toRealLength(drawValueMm, scale) {
    return drawValueMm * scale.factorLinear;
  }

  function toRealArea(drawAreaMm2, scale) {
    var factorArea = typeof scale.factorArea === "number"
      ? scale.factorArea
      : scale.factorLinear * scale.factorLinear;

    return drawAreaMm2 * factorArea;
  }

  function fromRealLength(realValue, scale) {
    return realValue / scale.factorLinear;
  }

  global.BIDSTOOLS.scale = {
    parseScale: parseScale,
    toRealLength: toRealLength,
    toRealArea: toRealArea,
    fromRealLength: fromRealLength
  };

  global.BIDSTOOLS.api.parseScale = function (payload) {
    return utils.ok(parseScale(payload.scaleInput || "1:1"));
  };
})(this);
