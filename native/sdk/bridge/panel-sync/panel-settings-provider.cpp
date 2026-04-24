#include "panel-settings-provider.h"

#include <fstream>
#include <sstream>

#include "native/sdk/core/scale/native-scale-resolver.h"
#include "native/sdk/core/style/style-resolver.h"

namespace bidstools {
namespace native_sdk {

namespace {

std::string default_settings_path() {
  return "plugin/shared/panel-settings.json";
}

}  // namespace

PanelSettingsProvider::PanelSettingsProvider(const std::string& settings_path)
    : settings_path_(settings_path.empty() ? default_settings_path() : settings_path) {}

ScaleDefinition PanelSettingsProvider::current_scale_definition() const {
  NativeScaleResolver resolver;
  return resolver.default_scale();
}

DimensionStyle PanelSettingsProvider::current_dimension_style() const {
  StyleResolver resolver;
  return resolver.default_dimension_style();
}

std::string PanelSettingsProvider::default_label_text() const {
  return "Label";
}

std::string PanelSettingsProvider::settings_path() const {
  return settings_path_;
}

std::string PanelSettingsProvider::read_settings_json() const {
  std::ifstream input(settings_path_.c_str(), std::ios::in | std::ios::binary);
  std::ostringstream buffer;

  if (!input) {
    return "";
  }

  buffer << input.rdbuf();
  return buffer.str();
}

}  // namespace native_sdk
}  // namespace bidstools
