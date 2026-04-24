(function (global) {
  function renderScale(state) {
    var presetInput = document.getElementById("scalePreset");
    var customInput = document.getElementById("customScaleInput");
    var radios = document.querySelectorAll('input[name="scaleMode"]');

    for (var index = 0; index < radios.length; index += 1) {
      radios[index].checked = radios[index].value === state.scaleMode;
    }

    if (presetInput) {
      presetInput.value = state.scalePreset;
    }

    if (customInput) {
      customInput.value = state.customScale;
    }
  }

  global.BIDSTOOLSUI = global.BIDSTOOLSUI || {};
  global.BIDSTOOLSUI.renderScale = renderScale;
})(this);
