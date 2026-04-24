(function (global) {
  function renderDimensions(state) {
    var modeButtons = document.querySelectorAll("[data-dimension-mode]");
    var index;

    for (index = 0; index < modeButtons.length; index += 1) {
      modeButtons[index].classList.toggle(
        "button-active",
        modeButtons[index].getAttribute("data-dimension-mode") === state.dimensionMode
      );
    }

    document.getElementById("dimensionLineColor").value = state.dimensionLineColor;
    document.getElementById("dimensionTextColor").value = state.dimensionTextColor;
    document.getElementById("dimensionFontSize").value = state.dimensionFontSize;
    document.getElementById("dimensionStrokeWidth").value = state.dimensionStrokeWidth;
    document.getElementById("dimensionArrowSize").value = state.dimensionArrowSize;
    document.getElementById("dimensionLabelText").value = state.dimensionLabelText;
  }

  global.BIDSTOOLSUI = global.BIDSTOOLSUI || {};
  global.BIDSTOOLSUI.renderDimensions = renderDimensions;
})(this);
