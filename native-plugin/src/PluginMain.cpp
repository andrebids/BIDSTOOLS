#include "BIDSTOOLSSelectionNotifierPlugin.h"

#include <cstring>

#include "AIPlugin.h"

using bidstools::GetSelectionNotifierPlugin;

extern "C" ASAPI AIErr PluginMain(char* caller, char* selector, void* message) {
  bidstools::SelectionNotifierPlugin& plugin = GetSelectionNotifierPlugin();

  if (std::strcmp(caller, kSPInterfaceCaller) == 0 && std::strcmp(selector, kSPInterfaceStartupSelector) == 0) {
    return plugin.StartupPlugin(static_cast<SPInterfaceMessage*>(message));
  }

  if (std::strcmp(caller, kSPInterfaceCaller) == 0 && std::strcmp(selector, kSPInterfaceShutdownSelector) == 0) {
    plugin.ShutdownPlugin();
    return kNoErr;
  }

  if (std::strcmp(caller, kCallerAINotify) == 0 && std::strcmp(selector, kSelectorAINotify) == 0) {
    return plugin.HandleNotifier(static_cast<AINotifierMessage*>(message));
  }

  return kNoErr;
}
