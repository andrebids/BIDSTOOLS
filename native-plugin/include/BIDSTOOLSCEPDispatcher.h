#pragma once

#include <string>

#include "IllustratorSDK.h"

namespace bidstools {

class CEPDispatcher {
public:
  CEPDispatcher();

  AIErr DispatchSelectionChanged(const std::string& selectionSignature, ai::int32 selectedCount) const;
};

}  // namespace bidstools
