(function (global) {
  var utils = global.BIDSTOOLS.utils;
  var guards = global.BIDSTOOLS.guards;
  var geometry = global.BIDSTOOLS.geometry;
  var scaleApi = global.BIDSTOOLS.scale;

  function emptySelectionInfo(scaleMode, scale, message, type, layerName) {
    return {
      supported: false,
      message: message,
      type: type || "None",
      layerName: layerName || "-",
      x: utils.formatNumber(0, 2),
      y: utils.formatNumber(0, 2),
      w: utils.formatNumber(0, 2),
      h: utils.formatNumber(0, 2),
      perimeter: utils.formatNumber(0, 2),
      area: utils.formatNumber(0, 2),
      unit: scale.realUnit,
      scaleLabel: scale.label,
      scaleMode: scaleMode
    };
  }

  function getSelectionInfo(payload) {
    payload = payload || {};

    var scaleMode = payload.scaleMode || "document";
    var scale;
    var documentState = guards.getDocumentState();
    var selectionState;
    var item;
    var unsupportedReason;
    var drawMetrics;

    try {
      scale = scaleApi.parseScale(payload.scaleInput || "1:1");
    } catch (error) {
      return emptySelectionInfo(
        scaleMode,
        scaleApi.parseScale("1:1"),
        error.message || "Unsupported scale format.",
        "Scale"
      );
    }

    if (!documentState.ok) {
      return emptySelectionInfo(scaleMode, scale, documentState.message, "Document");
    }

    selectionState = guards.getSingleSelectionState(documentState.document);
    if (!selectionState.ok) {
      return emptySelectionInfo(scaleMode, scale, selectionState.message, "Selection");
    }

    item = selectionState.item;
    unsupportedReason = geometry.getUnsupportedReason(item);
    if (unsupportedReason) {
      return emptySelectionInfo(
        scaleMode,
        scale,
        unsupportedReason,
        item.typename || "Unsupported",
        item.layer ? item.layer.name : "-"
      );
    }

    try {
      drawMetrics = geometry.getDrawMetrics(item);
    } catch (error) {
      return emptySelectionInfo(
        scaleMode,
        scale,
        error.message || "The selected object could not be measured.",
        item.typename || "Unsupported",
        item.layer ? item.layer.name : "-"
      );
    }

    return {
      supported: true,
      message: geometry.isRectanglePath(item)
        ? "Rectangle loaded from geometricBounds, width, and height."
        : "Simple PathItem loaded from geometricBounds, width, and height.",
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
      scaleMode: scaleMode
    };
  }

  global.BIDSTOOLS.api.getSelectionInfo = function (payload) {
    return utils.ok(getSelectionInfo(payload));
  };
})(this);
