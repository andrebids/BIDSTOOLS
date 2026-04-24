(function (global) {
  var OBJECT_ID_TAG = "BIDSTOOLS_objectId";
  var SCALE_MODE_TAG = "BIDSTOOLS_scaleMode";
  var SCALE_LABEL_TAG = "BIDSTOOLS_scaleLabel";
  var SCALE_FACTOR_TAG = "BIDSTOOLS_scaleFactor";
  var DIMENSION_ID_TAG = "BIDSTOOLS_dimensionId";
  var DIMENSION_LAYER_TAG = "BIDSTOOLS_dimensionLayer";
  var DIMENSION_KIND_TAG = "BIDSTOOLS_dimensionKind";
  var DIMENSION_TARGET_TAG = "BIDSTOOLS_dimensionTargetId";

  function safeGetByName(tags, key) {
    try {
      return tags.getByName(key);
    } catch (_error) {
      return null;
    }
  }

  function getTag(item, key) {
    var tag;
    var index;

    if (!item.tags) {
      return "";
    }

    tag = safeGetByName(item.tags, key);
    if (tag && typeof tag.value !== "undefined") {
      return tag.value;
    }

    for (index = 0; index < item.tags.length; index += 1) {
      if (item.tags[index].name === key) {
        return item.tags[index].value;
      }
    }

    return "";
  }

  function setTag(item, key, value) {
    var tag;

    if (!item.tags) {
      return "";
    }

    tag = safeGetByName(item.tags, key);
    if (!tag) {
      tag = item.tags.add();
      tag.name = key;
    }
    tag.value = String(value);
    return tag.value;
  }

  function createId(prefix) {
    var now = new Date();
    var stamp = [
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    ].join("");
    var randomPart = Math.floor(Math.random() * 1000000);

    return prefix + "-" + stamp + "-" + randomPart;
  }

  function ensureObjectId(item) {
    var existing = getTag(item, OBJECT_ID_TAG);

    if (existing) {
      return existing;
    }

    return setTag(item, OBJECT_ID_TAG, createId("obj"));
  }

  function attachScaleMetadata(item, scale, scaleMode) {
    if (!item || !scale) {
      return null;
    }

    return {
      objectId: ensureObjectId(item),
      scaleMode: setTag(item, SCALE_MODE_TAG, scaleMode || "document"),
      scaleLabel: setTag(item, SCALE_LABEL_TAG, scale.label || "1:1"),
      scaleFactor: setTag(item, SCALE_FACTOR_TAG, scale.factorLinear)
    };
  }

  function attachDimensionMetadata(baseItem, dimensionGroup, data) {
    var payload = data || {};
    var baseObjectId = ensureObjectId(baseItem);
    var dimensionId = payload.dimensionId || createId("dim");
    var kind = payload.kind || "";
    var layerName = payload.layerName || "";

    attachScaleMetadata(baseItem, payload.scale, payload.scaleMode);
    setTag(baseItem, DIMENSION_ID_TAG, dimensionId);
    setTag(baseItem, DIMENSION_KIND_TAG, kind);
    setTag(baseItem, DIMENSION_LAYER_TAG, layerName);

    setTag(dimensionGroup, DIMENSION_ID_TAG, dimensionId);
    setTag(dimensionGroup, DIMENSION_KIND_TAG, kind);
    setTag(dimensionGroup, DIMENSION_TARGET_TAG, baseObjectId);
    setTag(dimensionGroup, DIMENSION_LAYER_TAG, layerName);
    attachScaleMetadata(dimensionGroup, payload.scale, payload.scaleMode);

    return {
      objectId: baseObjectId,
      dimensionId: dimensionId,
      kind: kind,
      layerName: layerName
    };
  }

  global.BIDSTOOLS.metadata = {
    getTag: getTag,
    setTag: setTag,
    ensureObjectId: ensureObjectId,
    attachScaleMetadata: attachScaleMetadata,
    attachDimensionMetadata: attachDimensionMetadata
  };
})(this);
