(function (global) {
  var POINTS_TO_MM = 25.4 / 72;

  function pointsToMm(value) {
    return value * POINTS_TO_MM;
  }

  function isFiniteNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function getGeometricBounds(item) {
    var bounds = item && item.geometricBounds;
    if (!bounds || bounds.length !== 4) {
      throw new Error("The selected object does not expose readable geometricBounds.");
    }

    if (!isFiniteNumber(bounds[0]) || !isFiniteNumber(bounds[1]) || !isFiniteNumber(bounds[2]) || !isFiniteNumber(bounds[3])) {
      throw new Error("The selected object returned invalid geometricBounds values.");
    }

    return {
      left: bounds[0],
      top: bounds[1],
      right: bounds[2],
      bottom: bounds[3]
    };
  }

  function getBoundsWidthPoints(bounds) {
    return Math.abs(bounds.right - bounds.left);
  }

  function getBoundsHeightPoints(bounds) {
    return Math.abs(bounds.top - bounds.bottom);
  }

  function getItemWidthPoints(item, bounds) {
    var boundsWidth = getBoundsWidthPoints(bounds);

    if (isFiniteNumber(item.width) && item.width >= 0) {
      return item.width;
    }

    return boundsWidth;
  }

  function getItemHeightPoints(item, bounds) {
    var boundsHeight = getBoundsHeightPoints(bounds);

    if (isFiniteNumber(item.height) && item.height >= 0) {
      return item.height;
    }

    return boundsHeight;
  }

  function getPathPointCount(item) {
    if (!item || !item.pathPoints) {
      return 0;
    }

    return item.pathPoints.length || 0;
  }

  function isSimplePathItem(item) {
    var pointCount = getPathPointCount(item);

    if (!item || item.typename !== "PathItem") {
      return false;
    }

    if (item.guides || item.clipping) {
      return false;
    }

    if (pointCount < 2) {
      return false;
    }

    return true;
  }

  function isAxisAlignedRectangle(item) {
    var i;
    var anchor;
    var nextAnchor;
    var pointCount = getPathPointCount(item);

    if (!isSimplePathItem(item) || !item.closed || pointCount !== 4) {
      return false;
    }

    for (i = 0; i < pointCount; i += 1) {
      anchor = item.pathPoints[i].anchor;
      nextAnchor = item.pathPoints[(i + 1) % pointCount].anchor;

      if (!anchor || !nextAnchor || anchor.length !== 2 || nextAnchor.length !== 2) {
        return false;
      }

      if (anchor[0] !== nextAnchor[0] && anchor[1] !== nextAnchor[1]) {
        return false;
      }
    }

    return true;
  }

  function isRectanglePath(item) {
    return isAxisAlignedRectangle(item);
  }

  function getUnsupportedReason(item) {
    if (!item) {
      return "Select one object to populate the panel.";
    }

    if (item.typename !== "PathItem") {
      return "Only simple PathItem selections are supported in v1.";
    }

    if (item.guides) {
      return "Guide objects are not supported.";
    }

    if (item.clipping) {
      return "Clipping paths are not supported in v1.";
    }

    if (getPathPointCount(item) < 2) {
      return "The selected path is too simple to measure reliably.";
    }

    try {
      validateDrawMetrics(item);
    } catch (error) {
      return error.message || "The selected object could not be measured.";
    }

    return null;
  }

  function getSupportedItemType(item) {
    if (isRectanglePath(item)) {
      return "Rectangle";
    }

    return item.typename || "PathItem";
  }

  function validateMetricValue(value, label) {
    if (!isFiniteNumber(value) || value < 0) {
      throw new Error("The selected object returned an invalid " + label + " value.");
    }

    return value;
  }

  function validateDrawMetrics(item) {
    var bounds = getGeometricBounds(item);
    var widthPoints = validateMetricValue(getItemWidthPoints(item, bounds), "width");
    var heightPoints = validateMetricValue(getItemHeightPoints(item, bounds), "height");

    validateMetricValue(getBoundsWidthPoints(bounds), "geometric width");
    validateMetricValue(getBoundsHeightPoints(bounds), "geometric height");

    return {
      bounds: bounds,
      widthPoints: widthPoints,
      heightPoints: heightPoints
    };
  }

  function getDrawMetrics(item) {
    var metricState = validateDrawMetrics(item);
    var bounds = metricState.bounds;
    var widthMm = pointsToMm(metricState.widthPoints);
    var heightMm = pointsToMm(metricState.heightPoints);
    var positionMm = {
      x: pointsToMm(bounds.left),
      y: pointsToMm(bounds.top)
    };

    return {
      bounds: bounds,
      widthMm: widthMm,
      heightMm: heightMm,
      xMm: positionMm.x,
      yMm: positionMm.y,
      perimeterMm: 2 * (widthMm + heightMm),
      areaMm2: widthMm * heightMm
    };
  }

  global.BIDSTOOLS.geometry = {
    pointsToMm: pointsToMm,
    getGeometricBounds: getGeometricBounds,
    getUnsupportedReason: getUnsupportedReason,
    getSupportedItemType: getSupportedItemType,
    isSimplePathItem: isSimplePathItem,
    isRectanglePath: isRectanglePath,
    validateDrawMetrics: validateDrawMetrics,
    getDrawMetrics: getDrawMetrics
  };
})(this);
