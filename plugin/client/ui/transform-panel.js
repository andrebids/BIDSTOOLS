(function (global) {
  function renderTabs(state) {
    var buttons = document.querySelectorAll("[data-tab-target]");
    var panels = document.querySelectorAll("[data-tab-panel]");
    var activeTab = state.activeTab || "transform";
    var index;
    var tabName;

    for (index = 0; index < buttons.length; index += 1) {
      tabName = buttons[index].getAttribute("data-tab-target");
      buttons[index].classList.toggle("tab-button-active", tabName === activeTab);
    }

    for (index = 0; index < panels.length; index += 1) {
      tabName = panels[index].getAttribute("data-tab-panel");
      panels[index].classList.toggle("tab-panel-active", tabName === activeTab);
    }
  }

  global.BIDSTOOLSUI = global.BIDSTOOLSUI || {};
  global.BIDSTOOLSUI.renderTabs = renderTabs;
})(this);
