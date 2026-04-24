#include "horizontal-dimension-line-tool.h"

namespace bidstools {
namespace native_sdk {

void HorizontalDimensionLineTool::activate() {
  session_.begin();
}

void HorizontalDimensionLineTool::cancel() {
  session_.cancel();
}

}  // namespace native_sdk
}  // namespace bidstools
