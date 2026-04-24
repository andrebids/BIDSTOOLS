(function (global) {
  function renderScale(state) {
    var radios = document.querySelectorAll('input[name="scaleMode"]');
    for (var index = 0; index < radios.length; index += 1) {
      radios[index].checked = radios[index].value === state.scaleMode;
    }

    document.getElementById("scalePreset").value = state.scalePreset;
    document.getElementById("customScaleInput").value = state.customScale;
  }

  global.BIDSTOOLSUI = global.BIDSTOOLSUI || {};
  global.BIDSTOOLSUI.renderScale = renderScale;
})(this);
