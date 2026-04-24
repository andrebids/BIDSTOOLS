#include "BIDSTOOLSSelectionNotifierPlugin.h"

#include <algorithm>
#include <vector>

#include "AIArt.h"
#include "AIDocument.h"
#include "AIMatchingArt.h"
#include "AINotifier.h"
#include "BIDSTOOLSSelectionSignature.h"

namespace bidstools {

namespace {

SPBasicSuite* sSPBasic = nullptr;
AINotifierSuite* sAINotifier = nullptr;
AIMatchingArtSuite* sAIMatchingArt = nullptr;
AIDocumentSuite* sAIDocument = nullptr;

SelectionSignatureBuilder gSignatureBuilder;

}  // namespace

SelectionNotifierPlugin::SelectionNotifierPlugin()
    : plugin_ref_(nullptr),
      selection_changed_notifier_(nullptr),
      last_selection_signature_(),
      dispatcher_() {}

AIErr SelectionNotifierPlugin::StartupPlugin(SPInterfaceMessage* message) {
  plugin_ref_ = message ? message->d.self : nullptr;

  AIErr error = AcquireSuites(message ? message->d.basic : nullptr);
  if (error) {
    return error;
  }

  return RegisterNotifiers();
}

AIErr SelectionNotifierPlugin::HandleNotifier(const AINotifierMessage* message) {
  if (!message || message->notifier != selection_changed_notifier_) {
    return kNoErr;
  }

  ai::int32 selectedCount = 0;
  std::string nextSignature = BuildCurrentSelectionSignature(&selectedCount);

  if (!ShouldDispatchSelectionChanged(nextSignature)) {
    return kNoErr;
  }

  last_selection_signature_ = nextSignature;
  return dispatcher_.DispatchSelectionChanged(nextSignature, selectedCount);
}

void SelectionNotifierPlugin::ShutdownPlugin() {
  last_selection_signature_.clear();
  selection_changed_notifier_ = nullptr;
  plugin_ref_ = nullptr;
}

AIErr SelectionNotifierPlugin::AcquireSuites(SPBasicSuite* basic) {
  if (!basic) {
    return kBadParameterErr;
  }

  sSPBasic = basic;

  AIErr error = sSPBasic->AcquireSuite(kAINotifierSuite, kAINotifierVersion, reinterpret_cast<const void**>(&sAINotifier));
  if (error) {
    return error;
  }

  error = sSPBasic->AcquireSuite(kAIMatchingArtSuite, kAIMatchingArtVersion, reinterpret_cast<const void**>(&sAIMatchingArt));
  if (error) {
    return error;
  }

  return sSPBasic->AcquireSuite(kAIDocumentSuite, kAIDocumentVersion, reinterpret_cast<const void**>(&sAIDocument));
}

AIErr SelectionNotifierPlugin::RegisterNotifiers() {
  if (!sAINotifier || !plugin_ref_) {
    return kNoErr;
  }

  return sAINotifier->AddNotifier(plugin_ref_, "BIDSTOOLS Selection Changed", kAIArtSelectionChangedNotifier, &selection_changed_notifier_);
}

std::string SelectionNotifierPlugin::BuildCurrentSelectionSignature(ai::int32* selectedCount) const {
  if (selectedCount) {
    *selectedCount = 0;
  }

  if (!sAIDocument || !sAIMatchingArt) {
    return "no-suites";
  }

  AIDocumentHandle document = nullptr;
  if (sAIDocument->GetDocument(&document) || !document) {
    return "no-document";
  }

  AIArtHandle** matches = nullptr;
  ai::int32 count = 0;
  AIErr error = sAIMatchingArt->GetSelectedArt(&matches, &count);
  if (error) {
    return "selection-read-error";
  }

  std::vector<AIArtHandle> selectedArt;
  selectedArt.reserve(static_cast<std::size_t>(count));

  for (ai::int32 index = 0; index < count; index += 1) {
    selectedArt.push_back(matches[index]);
  }

  std::sort(selectedArt.begin(), selectedArt.end());

  if (selectedCount) {
    *selectedCount = count;
  }

  return gSignatureBuilder.Build(document, selectedArt);
}

bool SelectionNotifierPlugin::ShouldDispatchSelectionChanged(const std::string& nextSignature) const {
  return nextSignature != last_selection_signature_;
}

SelectionNotifierPlugin& GetSelectionNotifierPlugin() {
  static SelectionNotifierPlugin plugin;
  return plugin;
}

}  // namespace bidstools
