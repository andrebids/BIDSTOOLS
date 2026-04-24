(function (global) {
  function createCard(label, value) {
    return '<div class="info-card"><span class="info-label">' + label + '</span><strong>' + value + "</strong></div>";
  }

  function renderSelection(result) {
    var statusElement = document.getElementById("selectionStatus");
    var infoElement = document.getElementById("selectionInfo");
    var messageElement = document.getElementById("selectionMessage");

    if (!statusElement || !infoElement || !messageElement) {
      return;
    }

    if (!result.ok) {
      statusElement.textContent = "Error";
      statusElement.className = "pill status-error";
      infoElement.innerHTML = "";
      messageElement.textContent = result.error;
      messageElement.style.display = "block";
      return;
    }

    var data = result.data;
    statusElement.textContent = data.supported ? "Ready" : "Unsupported";
    statusElement.className = "pill";
    messageElement.textContent = data.supported ? "" : (data.message || "Selection unavailable.");
    messageElement.style.display = data.supported ? "none" : "block";

    infoElement.innerHTML = [
      createCard("W", data.w + " " + data.unit),
      createCard("H", data.h + " " + data.unit),
      createCard("Perimeter", data.perimeter + " " + data.unit),
      createCard("Area", data.area + " sq " + data.unit),
      createCard("Scale", data.scaleLabel)
    ].join("");
  }

  global.BIDSTOOLSUI = global.BIDSTOOLSUI || {};
  global.BIDSTOOLSUI.renderSelection = renderSelection;
})(this);
