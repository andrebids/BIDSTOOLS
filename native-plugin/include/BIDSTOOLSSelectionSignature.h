#pragma once

#include <string>
#include <vector>

#include "IllustratorSDK.h"

namespace bidstools {

class SelectionSignatureBuilder {
public:
  std::string Build(AIDocumentHandle document, const std::vector<AIArtHandle>& selectedArt) const;

private:
  static std::string PointerToken(const void* handle);
};

}  // namespace bidstools
