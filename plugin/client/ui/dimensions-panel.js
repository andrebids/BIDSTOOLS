(function (global) {
  function renderDimensions(state) {
    var lineColor = document.getElementById("dimensionLineColor");
    var textColor = document.getElementById("dimensionTextColor");
    var fontSize = document.getElementById("dimensionFontSize");
    var strokeWidth = document.getElementById("dimensionStrokeWidth");
    var arrowSize = document.getElementById("dimensionArrowSize");
    var labelText = document.getElementById("dimensionLabelText");
    var dimensionMode = document.getElementById("dimensionMode");

    if (lineColor) {
      lineColor.value = state.dimensionLineColor;
    }

    if (textColor) {
      textColor.value = state.dimensionTextColor;
    }

    if (fontSize) {
      fontSize.value = state.dimensionFontSize;
    }

    if (strokeWidth) {
      strokeWidth.value = state.dimensionStrokeWidth;
    }

    if (arrowSize) {
      arrowSize.value = state.dimensionArrowSize;
    }

    if (labelText) {
      labelText.value = state.dimensionLabelText;
    }

    if (dimensionMode) {
      dimensionMode.value = state.dimensionMode;
    }
  }

  global.BIDSTOOLSUI = global.BIDSTOOLSUI || {};
  global.BIDSTOOLSUI.renderDimensions = renderDimensions;
})(this);
