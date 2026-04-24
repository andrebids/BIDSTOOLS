(function (global) {
  var utils = global.BIDSTOOLS.utils;
  var guards = global.BIDSTOOLS.guards;
  var geometry = global.BIDSTOOLS.geometry;
  var scaleApi = global.BIDSTOOLS.scale;
  var metadata = global.BIDSTOOLS.metadata;
  var DIMENSION_LAYER_NAME = "BIDSTOOLS_DIMENSIONS";
  var DEFAULT_STROKE_WIDTH = 0.75;
  var DEFAULT_TEXT_SIZE = 10;
  var MIN_OFFSET = 18;
  var MIN_EXTENSION = 8;
  var TEXT_GAP = 6;
  var DEFAULT_ARROW_SIZE = 7;
  var JUSTIFICATION_CENTER = typeof Justification !== "undefined" ? Justification.CENTER : null;

  function findLayerByName(documentRef, layerName) {
    var index;

    for (index = 0; index < documentRef.layers.length; index += 1) {
      if (documentRef.layers[index].name === layerName) {
        return documentRef.layers[index];
      }
    }

    return null;
  }

  function ensureDimensionLayer(documentRef) {
    var layer = findLayerByName(documentRef, DIMENSION_LAYER_NAME);

    if (!layer) {
      layer = documentRef.layers.add();
      layer.name = DIMENSION_LAYER_NAME;
    }

    layer.visible = true;
    layer.locked = false;
    return layer;
  }

  function getBounds(item) {
    var bounds = geometry.getGeometricBounds(item);

    return {
      left: bounds.left,
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.bottom,
      width: Math.abs(bounds.right - bounds.left),
      height: Math.abs(bounds.top - bounds.bottom)
    };
  }

  function parsePositiveNumber(value, fallback) {
    var parsed = Number(value);

    if (!isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  function parseHexColor(value, fallback) {
    var normalized = String(value || fallback || "#000000").replace(/^\s+|\s+$/g, "");
    var match = normalized.match(/^#?([0-9a-fA-F]{6})$/);

    if (!match) {
      normalized = fallback || "#000000";
      match = normalized.match(/^#?([0-9a-fA-F]{6})$/);
    }

    return {
      red: parseInt(match[1].substr(0, 2), 16),
      green: parseInt(match[1].substr(2, 2), 16),
      blue: parseInt(match[1].substr(4, 2), 16)
    };
  }

  function createRgbColor(rgb) {
    var color = new RGBColor();
    color.red = rgb.red;
    color.green = rgb.green;
    color.blue = rgb.blue;
    return color;
  }

  function buildStyle(payload) {
    var lineRgb = parseHexColor(payload.lineColor, "#ff2a2a");
    var textRgb = parseHexColor(payload.textColor || payload.lineColor, "#ff2a2a");

    return {
      strokeWidth: parsePositiveNumber(payload.strokeWidth, DEFAULT_STROKE_WIDTH),
      textSize: parsePositiveNumber(payload.fontSize, DEFAULT_TEXT_SIZE),
      arrowSize: parsePositiveNumber(payload.arrowSize, DEFAULT_ARROW_SIZE),
      lineColor: createRgbColor(lineRgb),
      textColor: createRgbColor(textRgb)
    };
  }

  function createLine(group, x1, y1, x2, y2, style) {
    var line = group.pathItems.add();

    line.setEntirePath([[x1, y1], [x2, y2]]);
    line.stroked = true;
    line.strokeWidth = style.strokeWidth;
    line.strokeColor = style.lineColor;
    line.filled = false;

    return line;
  }

  function createArrow(group, tipX, tipY, directionX, directionY, style) {
    var arrow = style.arrowSize;
    var wing = arrow * 0.6;

    createLine(group, tipX, tipY, tipX + directionX * arrow - directionY * wing, tipY + directionY * arrow + directionX * wing, style);
    createLine(group, tipX, tipY, tipX + directionX * arrow + directionY * wing, tipY + directionY * arrow - directionX * wing, style);
  }

  function createText(group, x, y, contents, rotation, style) {
    var textFrame = group.textFrames.add();

    textFrame.contents = contents;
    textFrame.position = [x, y];
    textFrame.textRange.characterAttributes.size = style.textSize;
    textFrame.textRange.characterAttributes.fillColor = style.textColor;
    textFrame.textRange.characterAttributes.strokeColor = style.textColor;
    textFrame.textRange.characterAttributes.strokeWeight = 0;
    if (JUSTIFICATION_CENTER) {
      textFrame.paragraphs[0].paragraphAttributes.justification = JUSTIFICATION_CENTER;
    }

    if (rotation) {
      textFrame.rotate(rotation);
    }

    return textFrame;
  }

  function validateDimensionItem(item) {
    var unsupportedReason = geometry.getUnsupportedReason(item);

    if (unsupportedReason) {
      throw new Error(unsupportedReason);
    }
  }

  function buildLabel(lengthPoints, scale) {
    var lengthMm = geometry.pointsToMm(lengthPoints);
    var realValue = scaleApi.toRealLength(lengthMm, scale);
    return utils.formatNumber(realValue, 2) + " " + scale.realUnit;
  }

  function buildRadiusLabel(lengthPoints, scale) {
    var lengthMm = geometry.pointsToMm(lengthPoints);
    var realValue = scaleApi.toRealLength(lengthMm, scale);
    return "R " + utils.formatNumber(realValue, 2) + " " + scale.realUnit;
  }

  function requireSupportedDimensionMethod(payload, kind) {
    var method = payload && payload.dimensionMethod ? String(payload.dimensionMethod) : "line";

    if (method === "line") {
      throw new Error(kind + " by Line requires a native Illustrator tool: click the source line, then drag to place the dimension line with a live link to that line.");
    }

    if (method === "points") {
      throw new Error(kind + " by Points requires a native Illustrator tool: select first point, select second point, then drag to place the dimension line.");
    }

    return method;
  }

  function createDimensionGroup(layer, dimensionId, kind) {
    var group = layer.groupItems.add();

    group.name = dimensionId;
    metadata.setTag(group, "BIDSTOOLS_dimensionKind", kind);

    return group;
  }

  function finalizeDimension(item, group, scale, scaleMode, layer, dimensionId, kind, message) {
    var attached = metadata.attachDimensionMetadata(item, group, {
      dimensionId: dimensionId,
      kind: kind,
      layerName: layer.name,
      scale: scale,
      scaleMode: scaleMode
    });

    return collectSelectionInfo(item, scale, scaleMode, message, {
      dimensionId: attached.dimensionId,
      dimensionKind: attached.kind,
      dimensionLayerName: attached.layerName
    });
  }

  function collectSelectionInfo(item, scale, scaleMode, message, extraData) {
    var drawMetrics = geometry.getDrawMetrics(item);
    var result = {
      supported: true,
      message: message,
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
    var key;

    if (extraData) {
      for (key in extraData) {
        if (Object.prototype.hasOwnProperty.call(extraData, key)) {
          result[key] = extraData[key];
        }
      }
    }

    return result;
  }

  function createHorizontalDimensionInternal(payload) {
    var documentRef = guards.requireDocument();
    var item = guards.requireSingleSelection(documentRef);
    var scaleMode = payload.scaleMode || "document";
    var scale = scaleApi.parseScale(payload.scaleInput || "1:1");
    var style = buildStyle(payload || {});
    var bounds;
    var layer = ensureDimensionLayer(documentRef);
    var offset;
    var extension;
    var y;
    var middleX;
    var label;
    var dimensionId = "dim-h-" + new Date().getTime();
    var group;

    requireSupportedDimensionMethod(payload, "Horizontal Dimension");
    validateDimensionItem(item);
    bounds = getBounds(item);
    offset = Math.max(MIN_OFFSET, bounds.height * 0.25);
    extension = Math.max(MIN_EXTENSION, offset * 0.5);
    y = bounds.top + offset;
    middleX = bounds.left + (bounds.width / 2);
    label = buildLabel(bounds.width, scale);
    group = createDimensionGroup(layer, dimensionId, "horizontal");

    createLine(group, bounds.left, y, bounds.right, y, style);
    createLine(group, bounds.left, bounds.top, bounds.left, y + extension, style);
    createLine(group, bounds.right, bounds.top, bounds.right, y + extension, style);
    createArrow(group, bounds.left, y, 1, 0, style);
    createArrow(group, bounds.right, y, -1, 0, style);
    createText(group, middleX, y + TEXT_GAP, label, 0, style);

    return finalizeDimension(item, group, scale, scaleMode, layer, dimensionId, "horizontal", "Horizontal dimension created.");
  }

  function createVerticalDimensionInternal(payload) {
    var documentRef = guards.requireDocument();
    var item = guards.requireSingleSelection(documentRef);
    var scaleMode = payload.scaleMode || "document";
    var scale = scaleApi.parseScale(payload.scaleInput || "1:1");
    var style = buildStyle(payload || {});
    var bounds;
    var layer = ensureDimensionLayer(documentRef);
    var offset;
    var extension;
    var x;
    var middleY;
    var label;
    var dimensionId = "dim-v-" + new Date().getTime();
    var group;

    requireSupportedDimensionMethod(payload, "Vertical Dimension");
    validateDimensionItem(item);
    bounds = getBounds(item);
    offset = Math.max(MIN_OFFSET, bounds.width * 0.25);
    extension = Math.max(MIN_EXTENSION, offset * 0.5);
    x = bounds.right + offset;
    middleY = bounds.bottom + (bounds.height / 2);
    label = buildLabel(bounds.height, scale);
    group = createDimensionGroup(layer, dimensionId, "vertical");

    createLine(group, x, bounds.top, x, bounds.bottom, style);
    createLine(group, bounds.right, bounds.top, x + extension, bounds.top, style);
    createLine(group, bounds.right, bounds.bottom, x + extension, bounds.bottom, style);
    createArrow(group, x, bounds.top, 0, -1, style);
    createArrow(group, x, bounds.bottom, 0, 1, style);
    createText(group, x + TEXT_GAP, middleY, label, 90, style);

    return finalizeDimension(item, group, scale, scaleMode, layer, dimensionId, "vertical", "Vertical dimension created.");
  }

  function validateRadialItem(item) {
    var bounds = getBounds(item);
    var tolerance = Math.max(bounds.width, bounds.height) * 0.08;

    if (Math.abs(bounds.width - bounds.height) > tolerance) {
      throw new Error("Radius and diameter dimensions currently require a near-circular path.");
    }

    return bounds;
  }

  function createDiameterDimensionInternal(payload) {
    var documentRef = guards.requireDocument();
    var item = guards.requireSingleSelection(documentRef);
    var scaleMode = payload.scaleMode || "document";
    var scale = scaleApi.parseScale(payload.scaleInput || "1:1");
    var style = buildStyle(payload || {});
    var layer = ensureDimensionLayer(documentRef);
    var bounds;
    var centerX;
    var centerY;
    var label;
    var dimensionId = "dim-d-" + new Date().getTime();
    var group;

    validateDimensionItem(item);
    bounds = validateRadialItem(item);
    centerX = bounds.left + (bounds.width / 2);
    centerY = bounds.bottom + (bounds.height / 2);
    label = buildLabel(bounds.width, scale);
    group = createDimensionGroup(layer, dimensionId, "diameter");

    createLine(group, bounds.left, centerY, bounds.right, centerY, style);
    createArrow(group, bounds.left, centerY, 1, 0, style);
    createArrow(group, bounds.right, centerY, -1, 0, style);
    createText(group, centerX, centerY + TEXT_GAP, label, 0, style);

    return finalizeDimension(item, group, scale, scaleMode, layer, dimensionId, "diameter", "Diameter dimension created.");
  }

  function createRadiusDimensionInternal(payload) {
    var documentRef = guards.requireDocument();
    var item = guards.requireSingleSelection(documentRef);
    var scaleMode = payload.scaleMode || "document";
    var scale = scaleApi.parseScale(payload.scaleInput || "1:1");
    var style = buildStyle(payload || {});
    var layer = ensureDimensionLayer(documentRef);
    var bounds;
    var centerX;
    var centerY;
    var endX;
    var label;
    var dimensionId = "dim-r-" + new Date().getTime();
    var group;

    validateDimensionItem(item);
    bounds = validateRadialItem(item);
    centerX = bounds.left + (bounds.width / 2);
    centerY = bounds.bottom + (bounds.height / 2);
    endX = bounds.right;
    label = buildRadiusLabel(bounds.width / 2, scale);
    group = createDimensionGroup(layer, dimensionId, "radius");

    createLine(group, centerX, centerY, endX, centerY, style);
    createArrow(group, endX, centerY, -1, 0, style);
    createText(group, centerX + ((endX - centerX) / 2), centerY + TEXT_GAP, label, 0, style);

    return finalizeDimension(item, group, scale, scaleMode, layer, dimensionId, "radius", "Radius dimension created.");
  }

  function createDimensionLabelInternal(payload) {
    var documentRef = guards.requireDocument();
    var item = guards.requireSingleSelection(documentRef);
    var scaleMode = payload.scaleMode || "document";
    var scale = scaleApi.parseScale(payload.scaleInput || "1:1");
    var style = buildStyle(payload || {});
    var layer = ensureDimensionLayer(documentRef);
    var bounds;
    var dimensionId = "dim-label-" + new Date().getTime();
    var group;

    validateDimensionItem(item);
    bounds = getBounds(item);
    group = createDimensionGroup(layer, dimensionId, "label");
    createText(group, bounds.left + (bounds.width / 2), bounds.top + Math.max(MIN_OFFSET, bounds.height * 0.25), payload.labelText || "Label", 0, style);

    return finalizeDimension(item, group, scale, scaleMode, layer, dimensionId, "label", "Dimension label created.");
  }

  global.BIDSTOOLS.dimensions = {
    ensureDimensionLayer: ensureDimensionLayer
  };

  global.BIDSTOOLS.api.createHorizontalDimension = function (payload) {
    return utils.ok(createHorizontalDimensionInternal(payload));
  };

  global.BIDSTOOLS.api.createVerticalDimension = function (payload) {
    return utils.ok(createVerticalDimensionInternal(payload));
  };

  global.BIDSTOOLS.api.createDiameterDimension = function (payload) {
    return utils.ok(createDiameterDimensionInternal(payload));
  };

  global.BIDSTOOLS.api.createRadiusDimension = function (payload) {
    return utils.ok(createRadiusDimensionInternal(payload));
  };

  global.BIDSTOOLS.api.createDimensionLabel = function (payload) {
    return utils.ok(createDimensionLabelInternal(payload));
  };
})(this);
