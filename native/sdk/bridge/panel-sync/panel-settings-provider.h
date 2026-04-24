#ifndef BIDSTOOLS_NATIVE_SDK_BRIDGE_PANEL_SYNC_PANEL_SETTINGS_PROVIDER_H_
#define BIDSTOOLS_NATIVE_SDK_BRIDGE_PANEL_SYNC_PANEL_SETTINGS_PROVIDER_H_

#include <string>
#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class PanelSettingsProvider {
 public:
  explicit PanelSettingsProvider(const std::string& settings_path = "");

  ScaleDefinition current_scale_definition() const;
  DimensionStyle current_dimension_style() const;
  std::string default_label_text() const;
  std::string settings_path() const;
  std::string read_settings_json() const;

 private:
  std::string settings_path_;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
