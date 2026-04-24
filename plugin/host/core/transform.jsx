(function (global) {
  var utils = global.BIDSTOOLS.utils;
  var guards = global.BIDSTOOLS.guards;
  var geometry = global.BIDSTOOLS.geometry;
  var scaleApi = global.BIDSTOOLS.scale;
  var MM_TO_POINTS = 72 / 25.4;

  function mmToPoints(value) {
    return value * MM_TO_POINTS;
  }

  function isValueProvided(value) {
    return value !== null && typeof value !== "undefined" && value !== "";
  }

  function parseNumericInput(value, label) {
    var normalized;
    var parsed;

    if (!isValueProvided(value)) {
      throw new Error("Missing transform value for " + label + ".");
    }

    if (typeof value === "number") {
      parsed = value;
    } else {
      normalized = String(value).replace(/,/g, ".").replace(/\s+/g, "");
      parsed = Number(normalized);
    }

    if (!isFinite(parsed)) {
      throw new Error("Invalid numeric value for " + label + ".");
    }

    return parsed;
  }

  function toPointsFromReal(realValue, scale) {
    return mmToPoints(scaleApi.fromRealLength(realValue, scale));
  }

  function parseRequestedValue(value, label, fallbackValue) {
    if (!isValueProvided(value)) {
      return fallbackValue;
    }

    return parseNumericInput(value, label);
  }

  function resolveLockedSizeTargets(currentMetrics, requestedWidth, requestedHeight, lockProportions, widthProvided, heightProvided) {
    var currentWidth = currentMetrics.widthReal;
    var currentHeight = currentMetrics.heightReal;
    var targetWidth = requestedWidth;
    var targetHeight = requestedHeight;
    var widthDelta;
    var heightDelta;
    var widthDeltaRatio;
    var heightDeltaRatio;
    var widthRatio;
    var heightRatio;

    if (!lockProportions || (!widthProvided && !heightProvided)) {
      return {
        width: targetWidth,
        height: targetHeight
      };
    }

    if (currentWidth <= 0 || currentHeight <= 0) {
      throw new Error("Lock proportions requires a selection with non-zero width and height.");
    }

    if (widthProvided && !heightProvided) {
      widthRatio = targetWidth / currentWidth;
      return {
        width: targetWidth,
        height: currentHeight * widthRatio
      };
    }

    if (heightProvided && !widthProvided) {
      heightRatio = targetHeight / currentHeight;
      return {
        width: currentWidth * heightRatio,
        height: targetHeight
      };
    }

    widthDelta = Math.abs(targetWidth - currentWidth);
    heightDelta = Math.abs(targetHeight - currentHeight);
    widthDeltaRatio = widthDelta / currentWidth;
    heightDeltaRatio = heightDelta / currentHeight;

    if (widthDelta === 0 && heightDelta === 0) {
      return {
        width: targetWidth,
        height: targetHeight
      };
    }

    if (heightDeltaRatio > widthDeltaRatio) {
      heightRatio = targetHeight / currentHeight;
      targetWidth = currentWidth * heightRatio;
    } else {
      widthRatio = targetWidth / currentWidth;
      targetHeight = currentHeight * widthRatio;
    }

    return {
      width: targetWidth,
      height: targetHeight
    };
  }

  function getCurrentMetrics(item, scale) {
    var drawMetrics = geometry.getDrawMetrics(item);

    return {
      drawMetrics: drawMetrics,
      xReal: scaleApi.toRealLength(drawMetrics.xMm, scale),
      yReal: scaleApi.toRealLength(drawMetrics.yMm, scale),
      widthReal: scaleApi.toRealLength(drawMetrics.widthMm, scale),
      heightReal: scaleApi.toRealLength(drawMetrics.heightMm, scale)
    };
  }

  function buildSelectionPayload(item, payload, scale) {
    var drawMetrics = geometry.getDrawMetrics(item);

    return {
      supported: true,
      message: "Transform applied.",
      type: geometry.getSupportedItemType(item),
      layerName: item.layer ? item.layer.name : "Unknown",
      x: utils.formatNumber(scaleApi.toRealLength(drawMetrics.xMm, scale), 2),
      y: utils.formatNumber(scaleApi.toRealLength(drawMetrics.yMm, scale), 2),
      w: utils.formatNumber(scaleApi.toRealLength(drawMetrics.widthMm, scale), 2),
      h: utils.formatNumber(scaleApi.toRealLength(drawMetrics.heightMm, scale), 2),
      perimeter: utils.formatNumber(scaleApi.toRealLength(drawMetrics.perimeterMm, scale), 2),
      area: utils.formatNumber(scaleApi.toRealArea(drawMetrics.areaMm2, scale), 2),
      unit: scale.realUnit,
      scaleLabel: scale.label,
      scaleMode: payload.scaleMode || "document"
    };
  }

  function resolveTransformTargets(currentMetrics, payload) {
    var widthProvided = isValueProvided(payload.w);
    var heightProvided = isValueProvided(payload.h);
    var requestedWidth = parseRequestedValue(payload.w, "W", currentMetrics.widthReal);
    var requestedHeight = parseRequestedValue(payload.h, "H", currentMetrics.heightReal);
    var resolvedSize = resolveLockedSizeTargets(
      currentMetrics,
      requestedWidth,
      requestedHeight,
      !!payload.lockProportions,
      widthProvided,
      heightProvided
    );

    return {
      x: parseRequestedValue(payload.x, "X", currentMetrics.xReal),
      y: parseRequestedValue(payload.y, "Y", currentMetrics.yReal),
      width: resolvedSize.width,
      height: resolvedSize.height
    };
  }

  global.BIDSTOOLS.api.updateTransform = function (payload) {
    var documentRef = guards.requireDocument();
    var item = guards.requireSingleSelection(documentRef);
    var unsupportedReason = geometry.getUnsupportedReason(item);
    var scale;
    var currentMetrics;
    var resolvedTargets;
    var widthPoints;
    var heightPoints;

    payload = payload || {};

    scale = scaleApi.parseScale(payload.scaleInput || "1:1");

    if (unsupportedReason) {
      throw new Error(unsupportedReason);
    }

    currentMetrics = getCurrentMetrics(item, scale);
    resolvedTargets = resolveTransformTargets(currentMetrics, payload);

    if (resolvedTargets.width <= 0 || resolvedTargets.height <= 0) {
      throw new Error("Width and height must be greater than zero.");
    }

    widthPoints = toPointsFromReal(resolvedTargets.width, scale);
    heightPoints = toPointsFromReal(resolvedTargets.height, scale);

    item.width = widthPoints;
    item.height = heightPoints;
    item.position = [
      toPointsFromReal(resolvedTargets.x, scale),
      toPointsFromReal(resolvedTargets.y, scale)
    ];

    return utils.ok(buildSelectionPayload(item, payload, scale), "Transform applied.");
  };
})(this);
