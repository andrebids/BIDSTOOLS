#include "BIDSTOOLSCEPDispatcher.h"

#include <sstream>

#include <Windows.h>

namespace bidstools {

namespace {

const char* kSelectionChangedEventName = BIDSTOOLS_SELECTION_EVENT_NAME;
const char* kExtensionId = BIDSTOOLS_EXTENSION_ID;
const char* kEventScope = "APPLICATION";

struct CSXS_Event {
  const char* type;
  const char* scope;
  const char* appId;
  const char* extensionId;
  const char* data;
};

using PlugPlugDispatchEventFn = AIErr(__cdecl*)(const CSXS_Event*);

std::string BuildPayloadJson(const std::string& selectionSignature, ai::int32 selectedCount) {
  std::ostringstream stream;
  stream << "{";
  stream << "\"source\":\"BIDSTOOLSSelectionNotifier\",";
  stream << "\"documentChanged\":true,";
  stream << "\"selectionSignature\":\"" << selectionSignature << "\",";
  stream << "\"selectedCount\":" << selectedCount;
  stream << "}";
  return stream.str();
}

HMODULE LoadPlugPlugModule() {
  HMODULE module = GetModuleHandleW(L"PlugPlugExternalObject.dll");
  if (module != nullptr) {
    return module;
  }

  module = GetModuleHandleW(L"PlugPlug.dll");
  if (module != nullptr) {
    return module;
  }

  module = LoadLibraryW(L"PlugPlugExternalObject.dll");
  if (module != nullptr) {
    return module;
  }

  return LoadLibraryW(L"PlugPlug.dll");
}

PlugPlugDispatchEventFn ResolveDispatchFunction() {
  HMODULE module = LoadPlugPlugModule();
  if (module == nullptr) {
    return nullptr;
  }

  return reinterpret_cast<PlugPlugDispatchEventFn>(GetProcAddress(module, "PlugPlugDispatchEvent"));
}

}  // namespace

CEPDispatcher::CEPDispatcher() = default;

AIErr CEPDispatcher::DispatchSelectionChanged(const std::string& selectionSignature, ai::int32 selectedCount) const {
  static PlugPlugDispatchEventFn dispatchEvent = ResolveDispatchFunction();
  if (dispatchEvent == nullptr) {
    return static_cast<AIErr>(1);
  }

  CSXS_Event event{};
  event.type = kSelectionChangedEventName;
  event.scope = kEventScope;
  event.appId = nullptr;
  event.extensionId = kExtensionId;

  std::string payload = BuildPayloadJson(selectionSignature, selectedCount);
  event.data = payload.c_str();

  return dispatchEvent(&event);
}

}  // namespace bidstools
