#pragma once

#include <string>

#include "IllustratorSDK.h"

#include "BIDSTOOLSCEPDispatcher.h"

namespace bidstools {

class SelectionNotifierPlugin {
public:
  SelectionNotifierPlugin();

  AIErr StartupPlugin(SPInterfaceMessage* message);
  AIErr HandleNotifier(const AINotifierMessage* message);
  void ShutdownPlugin();

private:
  AIErr AcquireSuites(SPBasicSuite* basic);
  AIErr RegisterNotifiers();
  std::string BuildCurrentSelectionSignature(ai::int32* selectedCount) const;
  bool ShouldDispatchSelectionChanged(const std::string& nextSignature) const;

  SPPluginRef plugin_ref_;
  AINotifierHandle selection_changed_notifier_;
  std::string last_selection_signature_;
  CEPDispatcher dispatcher_;
};

SelectionNotifierPlugin& GetSelectionNotifierPlugin();

}  // namespace bidstools
