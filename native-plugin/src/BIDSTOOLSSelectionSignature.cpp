#include "BIDSTOOLSSelectionSignature.h"

#include <algorithm>
#include <iomanip>
#include <sstream>

namespace bidstools {

std::string SelectionSignatureBuilder::Build(AIDocumentHandle document, const std::vector<AIArtHandle>& selectedArt) const {
  std::vector<AIArtHandle> normalized = selectedArt;
  std::sort(normalized.begin(), normalized.end());

  std::ostringstream stream;
  stream << "count=" << normalized.size();
  stream << ";doc=" << PointerToken(document);
  stream << ";items=";

  for (std::size_t index = 0; index < normalized.size(); index += 1) {
    if (index > 0) {
      stream << ",";
    }

    stream << PointerToken(normalized[index]);
  }

  return stream.str();
}

std::string SelectionSignatureBuilder::PointerToken(const void* handle) {
  std::ostringstream stream;
  stream << "0x" << std::hex << std::uppercase << reinterpret_cast<std::uintptr_t>(handle);
  return stream.str();
}

}  // namespace bidstools
