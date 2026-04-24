(function (global) {
  var state = {
    selection: null,
    lastResult: null,
    scaleMode: "document",
    scalePreset: "1:1",
    customScale: "",
    activeTab: "transform",
    lockProportions: true,
    dimensionMode: "horizontalLine",
    dimensionLineColor: "#ff2a2a",
    dimensionTextColor: "#ff2a2a",
    dimensionFontSize: "10",
    dimensionStrokeWidth: "0.75",
    dimensionArrowSize: "7",
    dimensionLabelText: "Label"
  };

  global.BIDSTOOLSState = {
    get: function () {
      return state;
    },
    patch: function (partialState) {
      for (var key in partialState) {
        if (Object.prototype.hasOwnProperty.call(partialState, key)) {
          state[key] = partialState[key];
        }
      }

      return state;
    }
  };
})(this);
